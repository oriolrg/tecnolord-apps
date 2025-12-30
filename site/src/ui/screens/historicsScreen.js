import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { clamp, fmtTime, fmt1, norm } from "../format.js";
import { fetchMeteo } from "../../services/meteoService.js";
import { fetchHidro } from "../../services/hidroService.js";
import { lineChart } from "../components/lineChart.js";

function buildHistoricsUI(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="hist-last">—</span></span>
        <span id="hist-err" class="err" role="alert" aria-live="polite"></span>
      </div>

      <div class="section-title">
        <h2>Històrics</h2>
        <p id="hist-summary">Taules d'últims registres i sèries per període.</p>
      </div>

      <div class="period-row" id="hist-period-row">
        <label class="field">
          <span>Període</span>
          <select id="hist-period" class="input">
            <option value="last24h">Últimes 24h</option>
            <option value="today">Avui</option>
            <option value="yesterday">Ahir</option>
            <option value="last7d">Últims 7 dies</option>
            <option value="last30d">Últims 30 dies</option>
            <option value="custom">Personalitzat</option>
          </select>
        </label>

        <label class="field period-custom is-hidden" id="hist-from-wrap">
          <span>De</span>
          <input id="hist-from" class="input" type="date" />
        </label>

        <label class="field period-custom is-hidden" id="hist-to-wrap">
          <span>Fins</span>
          <input id="hist-to" class="input" type="date" />
        </label>

        <button id="hist-apply" class="btn btn--small" type="button">Aplicar</button>
      </div>

      <div class="grid">
        <div class="panel">
          <h3>Meteo</h3>
          <div id="meteo-chart"></div>
          <div class="tableWrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>Instant</th>
                  <th>Temp (°C)</th>
                  <th>Hum (%)</th>
                  <th>Vent (m/s)</th>
                  <th>Pluja dia (mm)</th>
                </tr>
              </thead>
              <tbody id="meteo-rows"></tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <h3>Hidro</h3>
          <div id="hidro-chart"></div>
          <div class="tableWrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>Instant</th>
                  <th>Estació</th>
                  <th>Cabal (m³/s)</th>
                  <th>Capacitat (%)</th>
                  <th>Antic?</th>
                </tr>
              </thead>
              <tbody id="hidro-rows"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    period: $("#hist-period", root),
    fromWrap: $("#hist-from-wrap", root),
    toWrap: $("#hist-to-wrap", root),
    dateFrom: $("#hist-from", root),
    dateTo: $("#hist-to", root),
    apply: $("#hist-apply", root),

    last: $("#hist-last", root),
    err: $("#hist-err", root),

    meteoChart: $("#meteo-chart", root),
    meteoRows: $("#meteo-rows", root),

    hidroChart: $("#hidro-chart", root),
    hidroRows: $("#hidro-rows", root),
  };
}

function pickRow(rows, predicates) {
  for (const pred of predicates) {
    const found = rows.find(pred);
    if (found) return found;
  }
  return null;
}

async function refreshHistorics(ui, store) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const estacio = (s.estacio || "").trim();
  const codi = (s.codiHidro || "").trim();
  const limit = clamp(parseInt(s.limit || "1000", 10), 10, 5000);

  const period = (s.period || "last24h").trim();
  const date_from = (s.date_from || "").trim();
  const date_to = (s.date_to || "").trim();

  try {
    const [meteoRows, hidroRows] = await Promise.all([
      fetchMeteo({ estacio, limit, period, date_from, date_to }),
      fetchHidro({ codi, limit, period, date_from, date_to, mode: "range", ensure: true }),
    ]);

    if (ui.last) ui.last.textContent = `Meteo: ${meteoRows.length} regs · Hidro: ${hidroRows.length} regs`;

    // ── Meteo table + chart
    if (ui.meteoRows) {
      ui.meteoRows.innerHTML = meteoRows.slice(0, 200).map(r => `
        <tr>
          <td>${fmtTime(r.instant)}</td>
          <td>${r.temp_c == null ? "—" : fmt1(r.temp_c)}</td>
          <td>${r.humitat_pct == null ? "—" : Math.round(r.humitat_pct)}</td>
          <td>${r.vent_ms == null ? "—" : fmt1(r.vent_ms)}</td>
          <td>${r.pluja_diaria_mm == null ? "—" : fmt1(r.pluja_diaria_mm)}</td>
        </tr>
      `).join("");
    }

    if (ui.meteoChart) {
      const series = meteoRows
        .slice()
        .reverse()
        .map(r => ({ x: new Date(r.instant).getTime(), y: r.temp_c }));
      ui.meteoChart.innerHTML = "";
      ui.meteoChart.append(lineChart({
        title: "Temperatura",
        series,
        yLabel: "°C"
      }));
    }

    // ── Hidro table + chart (ex: Cardener + Valls)
    if (ui.hidroRows) {
      ui.hidroRows.innerHTML = hidroRows.slice(0, 300).map(r => `
        <tr>
          <td>${fmtTime(r.instant)}</td>
          <td>${r.nom || r.codi}</td>
          <td>${r.cabal_m3s == null ? "—" : fmt1(r.cabal_m3s)}</td>
          <td>${r.capacitat_pct == null ? "—" : fmt1(r.capacitat_pct)}</td>
          <td>${r.is_stale ? "Sí" : "No"}</td>
        </tr>
      `).join("");
    }

    if (ui.hidroChart) {
      const rowCardener = pickRow(hidroRows, [
        r => norm(r.nom).includes("cardener"),
        r => norm(r.codi).includes("cardener"),
      ]);
      const rowValls = pickRow(hidroRows, [
        r => norm(r.nom).includes("valls"),
        r => norm(r.codi).includes("valls"),
      ]);

      // Construïm sèries per codi (si existeixen)
      const byCode = new Map();
      for (const r of hidroRows) {
        const code = r.codi || "";
        if (!code) continue;
        if (!byCode.has(code)) byCode.set(code, []);
        byCode.get(code).push(r);
      }
      for (const arr of byCode.values()) arr.sort((a, b) => new Date(a.instant) - new Date(b.instant));

      const pickCode = (rowCardener?.codi || "251116-005");
      const pickCode2 = (rowValls?.codi || "251116-004");

      const s1 = (byCode.get(pickCode) || []).map(r => ({ x: new Date(r.instant).getTime(), y: r.cabal_m3s }));
      const s2 = (byCode.get(pickCode2) || []).map(r => ({ x: new Date(r.instant).getTime(), y: r.cabal_m3s }));

      ui.hidroChart.innerHTML = "";
      ui.hidroChart.append(lineChart({
        title: `Cabal (${pickCode} vs ${pickCode2})`,
        series: [
          { name: pickCode, points: s1 },
          { name: pickCode2, points: s2 },
        ],
        yLabel: "m³/s"
      }));
    }

  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
  }
}

export function initHistoricsScreen(root, store) {
  const ui = buildHistoricsUI(root);

  // Inicialitza controls de període
  if (ui.period) {
    const s = store.get();
    ui.period.value = (s.period || "last24h");
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
      refreshHistorics(ui, store);
    });
  }

  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => refreshHistorics(ui, store), CONFIG.autoRefreshMs);
  }

  refreshHistorics(ui, store);

  return () => {
    if (timer) clearInterval(timer);
  };
}
