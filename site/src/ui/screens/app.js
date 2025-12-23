import { CONFIG } from "../../config.js";
import { createStore } from "../../state/store.js";
import { $ } from "../dom.js";
import { clamp } from "../format.js";
import { refreshMeteo } from "./meteoScreen.js";
import { refreshHidro } from "./hidroScreen.js";
import { renderTecnolordHeader } from "../components/tecnolordHeader.js";

function readUrlParams(store) {
  const url = new URL(location.href);
  const estFromUrl = url.searchParams.get("estacio") || url.searchParams.get("station_id");
  const limFromUrl = url.searchParams.get("limit");
  const codiFromUrl = url.searchParams.get("codi_hidro") || url.searchParams.get("codi");

  const patch = {};
  if (estFromUrl) patch.estacio = estFromUrl;
  if (limFromUrl) patch.limit = String(clamp(parseInt(limFromUrl, 10) || CONFIG.defaultLimit, 1, CONFIG.maxLimit));
  if (codiFromUrl) patch.codiHidro = codiFromUrl;

  store.set(patch);
}

function buildUI(root, store) {
  root.innerHTML = `
    <div class="wrap">
      ${renderTecnolordHeader({
        title: "MeteoLord",
        iconHref: "/assets/icons/icon-192.png",
        homeHref: "/",
        rightHtml: `<button class="btn secondary" disabled title="Properament">Inicia sessió</button>`,
      })}

      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="last">Sense dades encara</span></span>
        <span id="err" class="err" role="alert" aria-live="polite"></span>
      </div>

      <!-- METEO -->
      <div class="section-title">
        <p id="meteo-summary">—</p>
      </div>

      <div class="grid" id="meteo-cards"></div>

      <details>
        <summary>Últims registres (taula) <span class="badge" id="meteo-count">0</span></summary>
        <div class="detail-body">
          <div class="table-wrap">
            <table id="tbl-meteo" aria-label="Taula de mesures meteorològiques">
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

      <!-- HIDRO -->
      <div class="section-title" style="margin-top:22px">
        <p id="hidro-summary">—</p>
      </div>

      <div class="grid" id="hidro-cards"></div>

      <details>
        <summary>Últims registres (taula) <span class="badge" id="hidro-count">0</span></summary>
        <div class="detail-body">
          <div class="table-wrap">
            <table id="tbl-hidro" aria-label="Taula d'hidrologia">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Codi</th>
                  <th>Nom</th>
                  <th>Tipus</th>
                  <th>Cabal (m³/s)</th>
                  <th>Capacitat (%)</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </details>

    </div>
  `;

  return {
    // status
    last: $("#last", root),
    err: $("#err", root),

    // meteo
    meteoSummary: $("#meteo-summary", root),
    meteoCards: $("#meteo-cards", root),
    meteoCount: $("#meteo-count", root),
    meteoTbody: $("#tbl-meteo tbody", root),

    // hidro
    hidroSummary: $("#hidro-summary", root),
    hidroCards: $("#hidro-cards", root),
    hidroCount: $("#hidro-count", root),
    hidroTbody: $("#tbl-hidro tbody", root),

    // optional error slot (si algun dia el tornes a posar)
    errH: null,
  };
}

export function initApp(root) {
  const store = createStore();
  readUrlParams(store);

  const ui = buildUI(root, store);

  let timer = null;

  if (store.get().auto) {
    timer = setInterval(async () => {
      await refreshMeteo(ui, store);
      await refreshHidro(ui, store);
    }, CONFIG.autoRefreshMs);
  }

  refreshMeteo(ui, store);
  refreshHidro(ui, store);
}
