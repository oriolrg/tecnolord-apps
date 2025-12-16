import { CONFIG } from "../../config.js";
import { createStore } from "../../state/store.js";
import { el, $ } from "../dom.js";
import { clamp } from "../format.js";
import { refreshMeteo } from "./meteoScreen.js";
import { refreshHidro } from "./hidroScreen.js";

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
      <header>
        <div class="brand">
          <h1 class="title">Estació Meteo</h1>
          <p class="subtitle">Lectures en temps real (mòbil, tablet i ordinador)</p>
        </div>

        <div class="panel controls" aria-label="Controls">
          <label>Estació <input id="estacio" type="text" value="${store.get().estacio}" autocomplete="off" /></label>
          <label>Límit <input id="limit" type="number" min="1" max="${CONFIG.maxLimit}" value="${store.get().limit}" /></label>
          <label class="tog"><input id="auto" type="checkbox" /> Auto (30s)</label>
          <button id="btn-refresh" class="btn">Refresca</button>
          <button id="btn-copy" class="btn secondary" title="Copia l'enllaç amb paràmetres">Copia enllaç</button>
        </div>
      </header>

      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="last">Sense dades encara</span></span>
        <span class="pill">Font: <span id="src">${CONFIG.meteoEndpoint}</span></span>
        <span id="err" class="err" role="alert" aria-live="polite"></span>
      </div>

      <div class="section-title">
        <h2>Meteo</h2>
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
                  <th>Bateria (%)</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
          <p class="smallnote">A mòbil, fes scroll horitzontal dins la taula.</p>
        </div>
      </details>

      <div class="section-title" style="margin-top:22px">
        <h2>Hidrologia</h2>
        <p id="hidro-summary">—</p>
      </div>

      <div class="panel controls" style="justify-content:flex-start; margin-bottom:12px">
        <label>Codi estació (opcional) <input id="codi-hidro" type="text" value="${store.get().codiHidro || ""}" placeholder="p.ex. 251116-005" autocomplete="off" /></label>
        <button id="btn-hidro" class="btn">Refresca hidro</button>
        <span id="err-h" class="err" role="alert" aria-live="polite"></span>
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

  const ui = {
    estacio: $("#estacio", root),
    limit: $("#limit", root),
    auto: $("#auto", root),
    btnRefresh: $("#btn-refresh", root),
    btnCopy: $("#btn-copy", root),

    last: $("#last", root),
    err: $("#err", root),
    meteoSummary: $("#meteo-summary", root),
    meteoCards: $("#meteo-cards", root),
    meteoCount: $("#meteo-count", root),
    meteoTbody: $("#tbl-meteo tbody", root),

    codiHidro: $("#codi-hidro", root),
    btnHidro: $("#btn-hidro", root),
    errH: $("#err-h", root),
    hidroSummary: $("#hidro-summary", root),
    hidroCards: $("#hidro-cards", root),
    hidroCount: $("#hidro-count", root),
    hidroTbody: $("#tbl-hidro tbody", root),
  };

  return ui;
}

function setUrlFromStore(store) {
  const s = store.get();
  const u = new URL(location.href);
  u.searchParams.set("estacio", s.estacio || CONFIG.defaultEstacio);
  u.searchParams.set("limit", String(clamp(parseInt(s.limit || CONFIG.defaultLimit, 10), 1, CONFIG.maxLimit)));
  if (s.codiHidro) u.searchParams.set("codi_hidro", s.codiHidro);
  else u.searchParams.delete("codi_hidro");
  return u.toString();
}

export function initApp(root) {
  const store = createStore();
  readUrlParams(store);

  const ui = buildUI(root, store);

  let timer = null;

  // Bindings -> store
  ui.estacio.addEventListener("input", () => store.set({ estacio: ui.estacio.value }));
  ui.limit.addEventListener("input", () => store.set({ limit: ui.limit.value }));
  ui.codiHidro.addEventListener("input", () => store.set({ codiHidro: ui.codiHidro.value }));

  ui.btnRefresh.addEventListener("click", async () => {
    await refreshMeteo(ui, store);
    await refreshHidro(ui, store);
  });

  ui.btnHidro.addEventListener("click", async () => {
    await refreshHidro(ui, store);
  });

  ui.btnCopy.addEventListener("click", async () => {
    const link = setUrlFromStore(store);
    try {
      await navigator.clipboard.writeText(link);
      ui.btnCopy.textContent = "Copiat!";
      setTimeout(() => (ui.btnCopy.textContent = "Copia enllaç"), 1200);
    } catch {
      prompt("Copia aquest enllaç:", link);
    }
  });

  ui.auto.addEventListener("change", () => {
    const enabled = ui.auto.checked;
    store.set({ auto: enabled });
    if (enabled) {
      if (timer) clearInterval(timer);
      timer = setInterval(async () => {
        await refreshMeteo(ui, store);
        await refreshHidro(ui, store);
      }, CONFIG.autoRefreshMs);
    } else {
      if (timer) clearInterval(timer);
    }
  });

  // Initial load
  refreshMeteo(ui, store);
  refreshHidro(ui, store);
}
