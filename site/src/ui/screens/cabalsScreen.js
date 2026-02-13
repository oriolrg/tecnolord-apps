import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { card } from "../components/card.js";
import { num, fmt1, clamp, fmtTime, norm } from "../format.js";
import { fetchHidro } from "../../services/hidroService.js";
import { renderLineChart, buildDaySeries } from "../components/lineChart.js";

// Capacitat teòrica (hm³) per recalcular % propi
const THEO_CAPACITY_HM3 = {
  "081419-003": 80.0, // Llosa del Cavall
};

// Umami (analytics) – tracking segur (no trenca si no està carregat)
function trackEvent(name, props) {
  try {
    const u = window.umami;
    if (u && typeof u.track === "function") u.track(name, props);
  } catch (_) {}
}

function buildCabalsUI(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="hidro-last">Sense dades encara</span></span>
        <span id="hidro-err" class="err" role="alert" aria-live="polite"></span>
      </div>

      <div class="section-title">
        <h2>Cabals</h2>
        <p style="margin-top:6px; color: var(--muted);">Cabals i capacitat del sistema.</p>
      </div>

      <div class="grid" id="hidro-cards"></div>
    </div>
  `;

  return {
    period: $("#hidro-period", root),
    fromWrap: $("#hidro-from-wrap", root),
    toWrap: $("#hidro-to-wrap", root),
    dateFrom: $("#hidro-from", root),
    dateTo: $("#hidro-to", root),
    apply: $("#hidro-apply", root),
    last: $("#hidro-last", root),
    err: $("#hidro-err", root),
    cards: $("#hidro-cards", root),
  };
}

function pickRow(rows, predicates) {
  for (const pred of predicates) {
    const found = rows.find(pred);
    if (found) return found;
  }
  return null;
}

function ymdLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ytdRangeInclusive() {
  const now = new Date();
  const from = `${now.getFullYear()}-01-01`;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const to = ymdLocal(tomorrow);
  return { from, to };
}

// ✅ volum hm³ segons la teva API (extres.reservoir_raw.popup.volume.value)
function getVolumeHm3(row) {
  return (
    num(row?.volum_hm3) ??
    num(row?.volume_hm3) ??
    num(row?.volum) ??
    num(row?.volume) ??
    num(row?.extres?.reservoir_raw?.popup?.volume?.value) ?? // <-- CLAU
    null
  );
}

// ✅ capacitat teòrica segons codi (row.codi)
function getTheoHm3(row) {
  const key = row?.codi ?? row?.component ?? row?.component_id ?? null;
  if (key && THEO_CAPACITY_HM3[key] != null) return THEO_CAPACITY_HM3[key];

  // fallback per nom (si algun dia canvia el codi)
  const n = norm(row?.nom || "");
  if (n.includes("llosa") || n.includes("cavall")) return 80.0;

  return null;
}

async function refreshCabals(ui, store) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const codi = (s.codiHidro || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  const period = (s.period || "today").trim();
  const date_from = (s.date_from || "").trim();
  const date_to = (s.date_to || "").trim();
  const mode = (s.hidro_mode || "latest").trim();
  const ensure = (s.hidro_ensure !== false);

  try {
    const hidroRows = await fetchHidro({ codi, limit, period, date_from, date_to, mode, ensure });
    if (ui.cards) ui.cards.innerHTML = "";

    trackEvent("cabals_refresh_ok", { mode, period, limit });

    if (!hidroRows.length) {
      if (ui.last) ui.last.textContent = "Sense dades";
      return;
    }

    const rowLlosa = pickRow(hidroRows, [
      (r) => norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall"),
      (r) => norm(r.codi).includes("081419-003") || norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall"),
    ]);

    const rowCardener = pickRow(hidroRows, [
      (r) => norm(r.nom).includes("cardener"),
      (r) => norm(r.codi).includes("cardener"),
    ]);

    const rowValls = pickRow(hidroRows, [
      (r) => norm(r.nom).includes("valls"),
      (r) => norm(r.codi).includes("valls"),
    ]);

    const staleLlosa = !!rowLlosa?.is_stale;
    const staleCardener = !!rowCardener?.is_stale;
    const staleValls = !!rowValls?.is_stale;
    const anyStale = staleLlosa || staleCardener || staleValls;

    const instantLlosa = rowLlosa?.instant ?? null;

    const cap = num(rowLlosa?.capacitat_pct);

    // ✅ volum + % propi
    const volHm3 = getVolumeHm3(rowLlosa);
    const theoHm3 = getTheoHm3(rowLlosa);
    const capOwn = (volHm3 != null && theoHm3 != null && theoHm3 > 0) ? (volHm3 / theoHm3) * 100 : null;

    let sortida = num(rowLlosa?.cabal_m3s);
    if (sortida == null) {
      const rowSortida = pickRow(hidroRows, [
        (r) =>
          norm(r.nom).includes("sortida") &&
          (norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall")),
        (r) =>
          norm(r.codi).includes("sortida") &&
          (norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall")),
      ]);
      sortida = num(rowSortida?.cabal_m3s);
    }

    const cabalCardener = num(rowCardener?.cabal_m3s);
    const cabalValls = num(rowValls?.cabal_m3s);
    const entradaTotal = (cabalCardener ?? 0) + (cabalValls ?? 0);
    const delta = sortida == null ? null : entradaTotal - sortida;

    let deltaHtml = "";
    if (sortida != null && (cabalCardener != null || cabalValls != null)) {
      const cls = delta == null ? "" : delta >= 0 ? "pos" : "neg";
      const txt = delta == null ? "—" : delta >= 0 ? `+${fmt1(delta)} m³/s` : `${fmt1(delta)} m³/s`;
      deltaHtml = `
        <span>Entrada: <strong>${fmt1(entradaTotal)} m³/s</strong></span>
        <span>Sortida: <strong>${fmt1(sortida)} m³/s</strong></span>
        <span class="delta ${cls}">${txt}</span>
      `;
    }

    const cCabal = card({
      title: "Cabal (balanç)",
      value: sortida == null ? "—" : fmt1(sortida),
      unit: "m³/s",
      subHtml: `
        ${deltaHtml}
        ${instantLlosa ? `<span class="sep"></span>Hora: <strong>${fmtTime(instantLlosa)}</strong>` : ""}
      `,
    });
    cCabal.classList.add("card--tall", "card--wind");

    const capDetailsHtml = `
      <div style="margin-top:8px; display:grid; gap:4px; color: var(--muted); font-size: 0.95em;">
        <div>% ACA: <strong style="color:inherit">${cap == null ? "—" : fmt1(cap)}%</strong></div>
        <div>Volum: <strong style="color:inherit">${volHm3 == null ? "n/d" : `${fmt1(volHm3)} hm³`}</strong></div>
        <div>% propi (sobre ${theoHm3 == null ? "n/d" : `${fmt1(theoHm3)} hm³`}): <strong style="color:inherit">${capOwn == null ? "n/d" : `${fmt1(capOwn)}%`}</strong></div>
      </div>
    `;

    const cCap = card({
      title: "Capacitat",
      value: cap == null ? "—" : fmt1(cap),
      unit: "%",
      subHtml:
        `${rowLlosa?.nom ? `Estació: <strong>${rowLlosa.nom}</strong>` : ""}` +
        capDetailsHtml +
        `<div style="margin-top:10px"><canvas id="tl-chart-cap" style="width:100%;height:140px"></canvas></div>`,
    });
    cCap.classList.add("card--tall", "card--wind");

    const cCardener = card({
      title: "Cardener",
      value: cabalCardener == null ? "—" : fmt1(cabalCardener),
      unit: "m³/s",
      className: staleCardener ? "card--stale" : "",
      subHtml: `<div style="margin-top:10px"><canvas id="tl-chart-cardener" style="width:100%;height:140px"></canvas></div>`,
    });

    const cValls = card({
      title: "Valls",
      value: cabalValls == null ? "—" : fmt1(cabalValls),
      unit: "m³/s",
      className: staleValls ? "card--stale" : "",
      subHtml: `<div style="margin-top:10px"><canvas id="tl-chart-valls" style="width:100%;height:140px"></canvas></div>`,
    });

    if (ui.cards) ui.cards.append(cCabal, cCap, cCardener, cValls);

    // Gràfiques YTD
    try {
      const { from, to } = ytdRangeInclusive();
      const ytdRows = await fetchHidro({
        codi,
        limit: 5000,
        period: "",
        date_from: from,
        date_to: to,
        mode: "range",
        ensure,
      });

      const rowsLlosa = ytdRows.filter(
        (r) =>
          norm(r.nom).includes("llosa") ||
          norm(r.nom).includes("cavall") ||
          norm(r.codi).includes("llosa") ||
          norm(r.codi).includes("cavall")
      );
      const rowsCardener = ytdRows.filter((r) => norm(r.nom).includes("cardener") || norm(r.codi).includes("cardener"));
      const rowsValls = ytdRows.filter((r) => norm(r.nom).includes("valls") || norm(r.codi).includes("valls"));

      const capCanvas = cCap.querySelector("#tl-chart-cap");
      if (capCanvas) {
        const pts = buildDaySeries(rowsLlosa, (r) => r.capacitat_pct);
        renderLineChart(capCanvas, pts, { unit: "%" });
      }

      const cCardCanvas = cCardener.querySelector("#tl-chart-cardener");
      if (cCardCanvas) {
        const pts = buildDaySeries(rowsCardener, (r) => r.cabal_m3s);
        renderLineChart(cCardCanvas, pts, { unit: "m³/s" });
      }

      const cVallsCanvas = cValls.querySelector("#tl-chart-valls");
      if (cVallsCanvas) {
        const pts = buildDaySeries(rowsValls, (r) => r.cabal_m3s);
        renderLineChart(cVallsCanvas, pts, { unit: "m³/s" });
      }
    } catch (e2) {
      if (ui.err) ui.err.textContent = (ui.err.textContent ? ui.err.textContent + " · " : "") + "Gràfica YTD: " + (e2.message || e2);
    }

    if (instantLlosa) {
      const ageSec = Math.max(0, Math.round((Date.now() - new Date(instantLlosa).getTime()) / 1000));
      const ageMin = Math.floor(ageSec / 60);
      if (ui.last) ui.last.textContent = `Actualitzat fa ${ageMin} min`;
    } else if (ui.last) {
      ui.last.textContent = "Actualitzat";
    }

    if (anyStale && ui.err) {
      const parts = [];
      if (staleLlosa) parts.push("Llosa del Cavall");
      if (staleCardener) parts.push("Cardener");
      if (staleValls) parts.push("Valls");
      ui.err.textContent = `Avís: hi ha sensors sense dades recents.${parts.length ? " Dades antigues: " + parts.join(" · ") : ""}`;
      ui.err.classList.add("warn");
    } else if (ui.err) {
      ui.err.classList.remove("warn");
    }
  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
    trackEvent("cabals_refresh_error", { msg: String(e && (e.message || e)) });
  }
}

export function initCabalsScreen(root, store) {
  const ui = buildCabalsUI(root);

  trackEvent("screen_view", { screen: "cabals" });

  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => refreshCabals(ui, store), CONFIG.autoRefreshMs);
  }

  refreshCabals(ui, store);

  return () => {
    if (timer) clearInterval(timer);
  };
}
