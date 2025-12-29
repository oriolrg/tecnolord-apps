import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { refreshHidro } from "./hidroScreen.js";

function buildHistoricsUI(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="hist-last">Taules d’últims registres</span></span>
        <span id="hist-err" class="err" role="alert" aria-live="polite"></span>
        <span id="hist-err-h" class="err" role="alert" aria-live="polite"></span>
      </div>

      <div class="section-title">
        <h2>Històrics</h2>
        <p style="margin-top:6px; color: var(--muted);">Aquí tens els últims registres (Meteo i Hidro). Més endavant hi podrem afegir gràfiques i comparatives.</p>
      </div>

      <div class="panel" style="margin-top: 14px;">
        <p id="hist-meteo-summary" style="margin:0 0 10px 0;">—</p>

        <details open>
          <summary>Últims registres (meteo) <span class="badge" id="hist-meteo-count">0</span></summary>
          <div class="detail-body">
            <div class="table-wrap">
              <table id="tbl-hist-meteo" aria-label="Taula de mesures meteorològiques (últims registres)">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Temp (°C)</th>
                    <th>Sensació (°C)</th>
                    <th>Rosada (°C)</th>
                    <th>Hum (%)</th>
                    <th>Pressió rel (hPa)</th>
                    <th>Pressió abs (hPa)</th>
                    <th>UVI</th>
                    <th>Solar (W/m²)</th>
                    <th>Taxa pluja (mm/h)</th>
                    <th>Pluja dia</th>
                    <th>Pluja 1h</th>
                    <th>Pluja mes</th>
                    <th>Pluja any</th>
                    <th>Vent (m/s)</th>
                    <th>Ràfega (m/s)</th>
                    <th>Dir (°)</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </details>
      </div>

      <div class="panel" style="margin-top: 14px;">
        <p id="hist-hidro-summary" style="margin:0 0 10px 0;">—</p>

        <details open>
          <summary>Últims registres (hidro) <span class="badge" id="hist-hidro-count">0</span></summary>
          <div class="detail-body">
            <div class="table-wrap">
              <table id="tbl-hist-hidro" aria-label="Taula de mesures hidrològiques (últims registres)">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Nivell (m)</th>
                    <th>Cabals (m³/s)</th>
                    <th>Nom</th>
                    <th>Codi</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
    </div>
  `;

  return {
    err: $("#hist-err", root),
    errH: $("#hist-err-h", root),

    meteoSummary: $("#hist-meteo-summary", root),
    hidroSummary: $("#hist-hidro-summary", root),

    meteoCount: $("#hist-meteo-count", root),
    hidroCount: $("#hist-hidro-count", root),

    meteoTbody: $("#tbl-hist-meteo tbody", root),
    hidroTbody: $("#tbl-hist-hidro tbody", root),
  };
}

export function initHistoricsScreen(root, store) {
  const ui = buildHistoricsUI(root);

  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => refreshHidro(ui, store), CONFIG.autoRefreshMs);
  }

  refreshHidro(ui, store);

  return () => {
    if (timer) clearInterval(timer);
  };
}
