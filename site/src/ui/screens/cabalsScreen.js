import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { card } from "../components/card.js";
import { num, fmt1, clamp, fmtTime, norm } from "../format.js";
import { fetchHidro } from "../../services/hidroService.js";
import { renderLineChart, buildDaySeries } from "../components/lineChart.js";

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

      <div class="toolbar" id="hidro-period-row">
        <label class="field">
          <span>Període</span>
          <select id="hidro-period" class="select">
            <option value="today">Avui</option>
            <option value="yesterday">Ahir</option>
            <option value="last7d">Últims 7 dies</option>
            <option value="last30d">Últims 30 dies</option>
            <option value="custom">Personalitzat</option>
          </select>
        </label>

        <label class="field period-custom is-hidden" id="hidro-from-wrap">
          <span>De</span>
          <input id="hidro-from" class="input" type="date" />
        </label>

        <label class="field period-custom is-hidden" id="hidro-to-wrap">
          <span>Fins</span>
          <input id="hidro-to" class="input" type="date" />
        </label>

        <button id="hidro-apply" class="btn btn--small" type="button">Aplicar</button>
      </div>

      <div class="charts-section" style="margin-top:14px;">
        <h3>Evolució (any en curs)</h3>
        <div class="chart-container">
          <canvas id="cabals-chart-llosa" style="width:100%; height:220px;"></canvas>
        </div>
        <div class="chart-container" style="margin-top:14px;">
          <canvas id="cabals-chart-cardener" style="width:100%; height:220px;"></canvas>
        </div>
        <div class="chart-container" style="margin-top:14px;">
          <canvas id="cabals-chart-valls" style="width:100%; height:220px;"></canvas>
        </div>
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
    summary: $("#hidro-summary", root),
    chartLlosa: $("#cabals-chart-llosa", root),
    chartCardener: $("#cabals-chart-cardener", root),
    chartValls: $("#cabals-chart-valls", root),
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
  // rang que inclou el dia d'avui complet: [1 gen, demà)
  const now = new Date();
  const from = `${now.getFullYear()}-01-01`;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const to = ymdLocal(tomorrow);
  return { from, to };
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

    if (!hidroRows.length) {
      if (ui.summary) ui.summary.textContent = "Hidro: Sense registres.";
      if (ui.last) ui.last.textContent = "Sense dades";
      return;
    }

    if (ui.summary) {
      ui.summary.textContent = codi
        ? `Hidro · Codi: ${codi} · ${hidroRows.length} registres`
        : `Hidro · ${hidroRows.length} registres`;
    }

    const rowLlosa = pickRow(hidroRows, [
      r => norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall"),
      r => norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall"),
    ]);

    const rowCardener = pickRow(hidroRows, [
      r => norm(r.nom).includes("cardener"),
      r => norm(r.codi).includes("cardener"),
    ]);

    const rowValls = pickRow(hidroRows, [
      r => norm(r.nom).includes("valls"),
      r => norm(r.codi).includes("valls"),
    ]);

    const staleLlosa = !!rowLlosa?.is_stale;
    const staleCardener = !!rowCardener?.is_stale;
    const staleValls = !!rowValls?.is_stale;

    const anyStale = staleLlosa || staleCardener || staleValls;

    if (anyStale && ui.err) {
      const parts = [];
      if (staleLlosa) parts.push("Llosa del Cavall");
      if (staleCardener) parts.push("Cardener");
      if (staleValls) parts.push("Valls");
      ui.err.textContent = `Avís: hi ha sensors sense dades recents. ${parts.length ? "Dades mostrades: " + parts.join(" · ") : ""}`;
      ui.err.classList.add("warn");
    } else if (ui.err) {
      ui.err.classList.remove("warn");
    }

    const instantLlosa = rowLlosa?.instant ?? null;
    const cap = num(rowLlosa?.capacitat_pct);

    let sortida = num(rowLlosa?.cabal_m3s);
    if (sortida == null) {
      const rowSortida = pickRow(hidroRows, [
        r => norm(r.nom).includes("sortida") && (norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall")),
        r => norm(r.codi).includes("sortida") && (norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall")),
      ]);
      sortida = num(rowSortida?.cabal_m3s);
    }

    const cabalCardener = num(rowCardener?.cabal_m3s);
    const cabalValls = num(rowValls?.cabal_m3s);
    const entradaTotal = (cabalCardener ?? 0) + (cabalValls ?? 0);
    const delta = (sortida == null ? null : (entradaTotal - sortida));

    let deltaHtml = "";
    if (sortida != null && (cabalCardener != null || cabalValls != null)) {
      const cls = (delta == null ? "" : (delta >= 0 ? "pos" : "neg"));
      const txt =
        delta == null ? "—" :
        (delta >= 0 ? `+${fmt1(delta)} m³/s` : `${fmt1(delta)} m³/s`);
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
      badge: rowLlosa?.nom ? rowLlosa.nom : "Últim",
      subHtml: `
        ${deltaHtml}
        ${instantLlosa ? `<span class="sep"></span>Hora: <strong>${fmtTime(instantLlosa)}</strong>` : ""}
      `,
    });
    cCabal.classList.add("card--tall", "card--wind");

    const cCap = card({
      title: "Capacitat",
      value: cap == null ? "—" : fmt1(cap),
      unit: "%",
      badge: rowLlosa?.nom ? rowLlosa.nom : "Últim",
      subHtml: `${rowLlosa?.nom ? `Estació: <strong>${rowLlosa.nom}</strong>` : ""}`,
    });
    cCap.classList.add("card--tall", "card--wind");

    const entradesParts = [];
    if (cabalCardener != null) {
      entradesParts.push(
        `Cardener: <strong>${fmt1(cabalCardener)} m³/s</strong>${rowCardener?.nom ? ` · ${rowCardener.nom}` : ""}${staleCardener ? ` · <span class="stale-tag">ANTIC</span>` : ""}`
      );
    }
    if (cabalValls != null) {
      entradesParts.push(
        `Valls: <strong>${fmt1(cabalValls)} m³/s</strong>${rowValls?.nom ? ` · ${rowValls.nom}` : ""}${staleValls ? ` · <span class="stale-tag">ANTIC</span>` : ""}`
      );
    }

    const cEntrades = card({
      title: "Entrades (rius)",
      value: (cabalCardener == null && cabalValls == null) ? "—" : fmt1(entradaTotal),
      unit: "m³/s",
      badge: "Total",
      className: (anyStale ? "card--stale" : ""),
      subHtml: entradesParts.length ? entradesParts.join(`<span class="sep"></span>`) : "",
    });

    // IMPORTANT: append DOM nodes (NO strings)
    if (ui.cards) ui.cards.append(cCabal, cCap, cEntrades);

    // ==========================
    // Gràfiques: evolució YTD (any en curs)
    // ==========================
    try {
      const { from, to } = ytdRangeInclusive();
      const ytdRows = await fetchHidro({
        codi,
        limit: 5000,
        period: "",        // usem rang explícit
        date_from: from,
        date_to: to,
        mode: "range",
        ensure,
      });

      const rowsLlosa = ytdRows.filter(r =>
        norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall") ||
        norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall")
      );
      const rowsCardener = ytdRows.filter(r => norm(r.nom).includes("cardener") || norm(r.codi).includes("cardener"));
      const rowsValls = ytdRows.filter(r => norm(r.nom).includes("valls") || norm(r.codi).includes("valls"));

      if (ui.chartLlosa) {
        const pts = buildDaySeries(rowsLlosa, r => r.cabal_m3s);
        renderLineChart(ui.chartLlosa, pts, { unit: "m³/s" });
      }
      if (ui.chartCardener) {
        const pts = buildDaySeries(rowsCardener, r => r.cabal_m3s);
        renderLineChart(ui.chartCardener, pts, { unit: "m³/s" });
      }
      if (ui.chartValls) {
        const pts = buildDaySeries(rowsValls, r => r.cabal_m3s);
        renderLineChart(ui.chartValls, pts, { unit: "m³/s" });
      }
    } catch (e2) {
      // no bloquegem la pantalla si falla la sèrie històrica
      if (ui.err) ui.err.textContent = (ui.err.textContent ? ui.err.textContent + " · " : "") + "Gràfica YTD: " + (e2.message || e2);
    }

  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
  }
}

export function initCabalsScreen(root, store) {
  const ui = buildCabalsUI(root);

  // Inicialitza controls de període
  if (ui.period) {
    const s = store.get();
    ui.period.value = (s.period || "today");
    if (ui.dateFrom) ui.dateFrom.value = (s.date_from || "");
    if (ui.dateTo) ui.dateTo.value = (s.date_to || "");

    const toggleCustom = () => {
      const isCustom = ui.period.value === "custom";
      ui.fromWrap?.classList.toggle("is-hidden", !isCustom);
      ui.toWrap?.classList.toggle("is-hidden", !isCustom);
    };
    toggleCustom();

    ui.period.addEventListener("change", toggleCustom);
    ui.apply?.addEventListener("click", () => {
      const period = ui.period.value;
      const date_from = ui.dateFrom?.value || "";
      const date_to = ui.dateTo?.value || "";
      store.set({ period, date_from, date_to });
      refreshCabals(ui, store);
    });
  }

  let timer = null;

  const doRefresh = () => refreshCabals(ui, store);

  // primera càrrega
  doRefresh();

  // auto-refresh si està configurat
  const s = store.get();
  const refreshMs = clamp(parseInt(s.refreshMs || String(CONFIG?.refreshMs || "60000"), 10), 5000, 10 * 60 * 1000);
  timer = setInterval(doRefresh, refreshMs);

  return () => {
    if (timer) clearInterval(timer);
  };
}
