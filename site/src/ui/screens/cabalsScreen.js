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
        <p id="hidro-summary">—</p>
      </div>

      <div class="grid" id="hidro-cards"></div>
    </div>
  `;

  return {
    last: $("#hidro-last", root),
    err: $("#hidro-err", root),
    summary: $("#hidro-summary", root),
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

function matchName(r, tokens) {
  const name = norm(r.nom || "");
  return tokens.some((t) => name.includes(t));
}

function formatDateFull(ts) {
  return new Date(ts).toLocaleString("ca-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function refreshCabals(ui, store) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const codi = (s.codiHidro || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  try {
    const hidroRows = await fetchHidro({ codi, limit });
    if (ui.cards) ui.cards.innerHTML = "";

    if (!hidroRows.length) {
      if (ui.summary) ui.summary.textContent = "Hidro: Sense registres.";
      if (ui.last) ui.last.textContent = "Sense dades";
      return;
    }

    if (ui.summary) {
      ui.summary.textContent = codi
        ? `Hidro · Codi: ${codi}`
        : `Hidro`;
    }
    const rowsLlosa = hidroRows.filter((r) => matchName(r, ["llosa", "cavall"]));
    const rowsCardener = hidroRows.filter((r) => matchName(r, ["cardener"]));
    const rowsValls = hidroRows.filter((r) => matchName(r, ["valls"]));

    const rowLlosa = rowsLlosa[0] || null;
    const rowCardener = rowsCardener[0] || null;
    const rowValls = rowsValls[0] || null;

    const cap = num(rowLlosa?.capacitat_pct);

    const cabalCardener = num(rowCardener?.cabal_m3s);
    const cabalValls = num(rowValls?.cabal_m3s);

    const entradaTotal =
      (cabalCardener ?? 0) + (cabalValls ?? 0);

    const sortida = num(rowLlosa?.cabal_m3s);
    const delta = (sortida == null ? null : (entradaTotal - sortida));

    const isStaleCardener = rowCardener?.is_stale;
    const isStaleValls = rowValls?.is_stale;
    function pickMonthRows(rows, refRow) {
      const refTs = refRow?.instant ?? refRow?.at;
      if (!refTs) return [];
      const ref = new Date(refTs);
      const yy = ref.getFullYear();
      const mm = ref.getMonth();
      return rows.filter((r) => {
        const ts = r.instant ?? r.at;
        if (!ts) return false;
        const d = new Date(ts);
        return d.getFullYear() === yy && d.getMonth() === mm;
      });
    }

    function calcMinMax(rows, getter) {
      let min = null;
      let max = null;
      for (const r of rows) {
        const v = num(getter(r));
        if (v == null) continue;
        min = min == null ? v : Math.min(min, v);
        max = max == null ? v : Math.max(max, v);
      }
      return { min, max };
    }

    function attachChart(cardEl, id) {
      const sub = cardEl.querySelector(".sub");
      if (!sub) return null;

      const wrap = document.createElement("div");
      wrap.style.marginTop = "10px";

      const canvas = document.createElement("canvas");
      canvas.id = id;
      canvas.style.width = "100%";
      canvas.style.height = "140px";

      wrap.appendChild(canvas);
      sub.appendChild(wrap);
      return canvas;
    }

    const cardenerMonth = pickMonthRows(rowsCardener, rowCardener);
    const vallsMonth = pickMonthRows(rowsValls, rowValls);
    const llosaMonth = pickMonthRows(rowsLlosa, rowLlosa);

    const mmCardener = calcMinMax(cardenerMonth, (r) => r.cabal_m3s);
    const mmValls = calcMinMax(vallsMonth, (r) => r.cabal_m3s);
    const mmCap = calcMinMax(llosaMonth, (r) => r.capacitat_pct);

    const cardenerMaxTxt = mmCardener.max == null ? "?" : fmt1(mmCardener.max);
    const cardenerMinTxt = mmCardener.min == null ? "?" : fmt1(mmCardener.min);
    const vallsMaxTxt = mmValls.max == null ? "?" : fmt1(mmValls.max);
    const vallsMinTxt = mmValls.min == null ? "?" : fmt1(mmValls.min);
    const capMaxTxt = mmCap.max == null ? "?" : fmt1(mmCap.max);
    const capMinTxt = mmCap.min == null ? "?" : fmt1(mmCap.min);

    const cCardener = card({
      title: "Cabal riu Cardener",
      value: cabalCardener == null ? "?" : fmt1(cabalCardener),
      unit: "m3/s",
      badge: rowCardener?.nom || "Cardener",
      subHtml: `
        <span>Max mes: <strong>${cardenerMaxTxt} m3/s</strong></span>
        <span class="sep"></span>
        <span>Min mes: <strong>${cardenerMinTxt} m3/s</strong></span>
        ${rowCardener?.instant ? `<span class="sep"></span>Hora: <strong>${fmtTime(rowCardener.instant)}</strong>` : ""}
        ${isStaleCardener && rowCardener?.instant ? `
          <div class="alert-stale">
            Sensor del Cardener amb dades antigues.<br>
            Dades del ${formatDateFull(rowCardener.instant)}
          </div>
        ` : ""}
      `,
    });

    const cValls = card({
      title: "Cabal riu de Valls",
      value: cabalValls == null ? "?" : fmt1(cabalValls),
      unit: "m3/s",
      badge: rowValls?.nom || "Valls",
      subHtml: `
        <span>Max mes: <strong>${vallsMaxTxt} m3/s</strong></span>
        <span class="sep"></span>
        <span>Min mes: <strong>${vallsMinTxt} m3/s</strong></span>
        ${rowValls?.instant ? `<span class="sep"></span>Hora: <strong>${fmtTime(rowValls.instant)}</strong>` : ""}
        ${isStaleValls && rowValls?.instant ? `
          <div class="alert-stale">
            Sensor de Valls fora de servei.<br>
            Dades del ${formatDateFull(rowValls.instant)}
          </div>
        ` : ""}
      `,
    });

    const cCap = card({
      title: "Capacitat llosa",
      value: cap == null ? "?" : fmt1(cap),
      unit: "%",
      badge: rowLlosa?.nom || "Llosa",
      subHtml: `
        <span>Max mes: <strong>${capMaxTxt} %</strong></span>
        <span class="sep"></span>
        <span>Min mes: <strong>${capMinTxt} %</strong></span>
        ${rowLlosa?.instant ? `<span class="sep"></span>Hora: <strong>${fmtTime(rowLlosa.instant)}</strong>` : ""}
      `,
    });

    let balanceHtml = "";
    if (sortida != null && (cabalCardener != null || cabalValls != null)) {
      const cls = delta >= 0 ? "ok" : "bad";
      const txt = delta >= 0 ? "S'omple" : "Es buida";
      balanceHtml = `
        <span>Entrada: <strong>${fmt1(entradaTotal)} m3/s</strong></span>
        <span class="sep"></span>
        <span>Sortida: <strong>${fmt1(sortida)} m3/s</strong></span>
        <span class="sep"></span>
        <span class="delta ${cls}">${txt}</span>
      `;
    }

    const cBalance = card({
      title: "Balanc del panta",
      value: delta == null ? "?" : fmt1(delta),
      unit: "m3/s",
      badge: "Entrades - sortida",
      subHtml: balanceHtml,
    });

    const cvCardener = attachChart(cCardener, "chart-cabal-cardener");
    const cvValls = attachChart(cValls, "chart-cabal-valls");
    const cvCap = attachChart(cCap, "chart-cap-llosa");

    if (ui.cards) ui.cards.append(cCardener, cValls, cCap, cBalance);

    const cardenerPts = buildDaySeries(cardenerMonth, (r) => num(r.cabal_m3s));
    const vallsPts = buildDaySeries(vallsMonth, (r) => num(r.cabal_m3s));
    const capPts = buildDaySeries(llosaMonth, (r) => num(r.capacitat_pct));

    if (cvCardener) {
      renderLineChart(cvCardener, cardenerPts, {
        unit: "m3/s",
        lineColor: "#60a5fa",
        formatY: (v) => (Math.round(v * 10) / 10).toString(),
      });
    }

    if (cvValls) {
      renderLineChart(cvValls, vallsPts, {
        unit: "m3/s",
        lineColor: "#60a5fa",
        formatY: (v) => (Math.round(v * 10) / 10).toString(),
      });
    }

    if (cvCap) {
      renderLineChart(cvCap, capPts, {
        unit: "%",
        lineColor: "#60a5fa",
        formatY: (v) => (Math.round(v * 10) / 10).toString(),
      });
    }

    // Text superior "Dades actualitzades fa…"
    const refInstant =
      rowCardener?.instant || rowValls?.instant || rowLlosa?.instant;

    if (refInstant) {
      const ageSec = Math.max(
        0,
        Math.round((Date.now() - new Date(refInstant).getTime()) / 1000)
      );
      const ageTxt =
        ageSec < 60 ? `${ageSec} s` :
        ageSec < 3600 ? `${Math.round(ageSec / 60)} min` :
        `${Math.round(ageSec / 3600)} h`;

      if (ui.last) ui.last.textContent = `Dades actualitzades fa ${ageTxt}`;
    } else {
      if (ui.last) ui.last.textContent = "Dades disponibles";
    }

  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
  }
}

export function initCabalsScreen(root, store) {
  const ui = buildCabalsUI(root);

  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => refreshCabals(ui, store), CONFIG.autoRefreshMs);
  }

  refreshCabals(ui, store);

  return () => {
    if (timer) clearInterval(timer);
  };
}



