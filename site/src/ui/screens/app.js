import { CONFIG } from "./config.js";
import { refreshMeteo } from "./meteoScreen.js";
import { refreshHidro } from "./hidroScreen.js";
import { loadStationOptions, loadHidroCodes } from "./services/optionsService.js";
import { copyDashboardText } from "./utils/copy.js";
import { renderTecnolordHeader } from "./tecnolordHeader.js";

const $ = (sel, root = document) => root.querySelector(sel);

function buildUI(root, store) {
  root.innerHTML = `
${renderTecnolordHeader({ title: "Meteo & Hidro" })}

<div class="wrap">
  <div class="status-row">
    <span class="pill"><span class="dot"></span><span id="last">—</span></span>
    <span id="err" class="err" role="alert" aria-live="polite"></span>
  </div>

  <div class="top-tabs" role="tablist" aria-label="Navegació">
    <button class="tab is-active" id="tab-data" type="button" role="tab" aria-controls="page-data" aria-selected="true">Dades</button>
    <button class="tab" id="tab-tables" type="button" role="tab" aria-controls="page-tables" aria-selected="false">Taules</button>
  </div>

  <div id="header-controls" class="header-controls">
    <label class="f">
      <span>Estació</span>
      <select id="estacio"></select>
    </label>
    <label class="f">
      <span>Límit</span>
      <select id="limit">
        <option value="24">24</option>
        <option value="48" selected>48</option>
        <option value="96">96</option>
        <option value="192">192</option>
      </select>
    </label>
    <label class="f f--inline">
      <input id="auto" type="checkbox" checked />
      <span>Auto</span>
    </label>
    <button id="btn-refresh" class="btn secondary" type="button">Actualitza</button>
    <button id="btn-copy" class="btn" type="button">Copia</button>
  </div>

  <section id="page-data" class="page" role="tabpanel" aria-labelledby="tab-data">
    <div class="section-title"><h2>Meteo</h2></div>
    <div class="grid" id="meteo-cards"></div>

    <div class="section-title" style="margin-top:22px"><h2>Hidro</h2></div>

    <div id="hidro-controls" class="hidro-controls">
      <label class="f">
        <span>Codi</span>
        <select id="codi-hidro"></select>
      </label>
      <button id="btn-hidro" class="btn secondary" type="button">Canvia</button>
      <span id="err-h" class="err" role="alert" aria-live="polite"></span>
    </div>

    <div class="grid" id="hidro-cards"></div>
  </section>

  <section id="page-tables" class="page" role="tabpanel" aria-labelledby="tab-tables" hidden>
    <div class="section-title"><h2>Taula Meteo</h2></div>
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

    <div class="section-title" style="margin-top:22px"><h2>Taula Hidro</h2></div>
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
  </section>
</div>
`.trim();

  // Resta: options -> store -> refrescos
  const estacioSel = $("#estacio", root);
  const limitSel = $("#limit", root);

  // Població d'opcions
  loadStationOptions(estacioSel, store);
  const hidroSel = $("#codi-hidro", root);
  loadHidroCodes(hidroSel, store);
}

export function initApp(root) {
  const store = {
    estacio: CONFIG.DEFAULT_STATION,
    limit: CONFIG.DEFAULT_LIMIT,
    auto: true,
    hidroCode: CONFIG.DEFAULT_HIDRO_CODE
  };

  buildUI(root, store);

  const ui = {
    tabData: $("#tab-data", root),
    tabTables: $("#tab-tables", root),
    pageData: $("#page-data", root),
    pageTables: $("#page-tables", root),
    last: $("#last", root),
    err: $("#err", root),    meteoCards: $("#meteo-cards", root),
    tblMeteo: $("#tbl-meteo tbody", root),
    estacio: $("#estacio", root),
    limit: $("#limit", root),
    auto: $("#auto", root),
    btnRefresh: $("#btn-refresh", root),
    btnCopy: $("#btn-copy", root),
    hidroCards: $("#hidro-cards", root),
    codiHidro: $("#codi-hidro", root),
    btnHidro: $("#btn-hidro", root),
    errH: $("#err-h", root)
  };

  function setRoute(route) {
    const isTables = route === "tables";
    ui.pageTables.hidden = !isTables;
    ui.pageData.hidden = isTables;

    ui.tabTables.setAttribute("aria-selected", String(isTables));
    ui.tabData.setAttribute("aria-selected", String(!isTables));
    ui.tabTables.classList.toggle("is-active", isTables);
    ui.tabData.classList.toggle("is-active", !isTables);
  }

  function currentRoute() {
    const h = (location.hash || "").replace(/^#\/?/, "");
    if (h.startsWith("taules") || h.startsWith("tables")) return "tables";
    return "data";
  }

  ui.tabData.addEventListener("click", () => { location.hash = "#/dades"; });
  ui.tabTables.addEventListener("click", () => { location.hash = "#/taules"; });
  window.addEventListener("hashchange", () => setRoute(currentRoute()));
  setRoute(currentRoute());

  // Defaults
  ui.estacio.value = store.estacio;
  ui.limit.value = String(store.limit);
  ui.auto.checked = store.auto;
  ui.codiHidro.value = store.hidroCode;

  let timer = null;

  async function doRefresh() {
    await Promise.all([
      refreshMeteo(ui, store),
      refreshHidro(ui, store)
    ]);
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(doRefresh, CONFIG.REFRESH_MS);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  ui.estacio.addEventListener("change", async () => {
    store.estacio = ui.estacio.value;
    await doRefresh();
  });

  ui.limit.addEventListener("change", async () => {
    store.limit = Number(ui.limit.value);
    await doRefresh();
  });

  ui.auto.addEventListener("change", () => {
    store.auto = ui.auto.checked;
    if (store.auto) startAuto();
    else stopAuto();
  });

  ui.btnRefresh.addEventListener("click", doRefresh);

  ui.btnCopy.addEventListener("click", () => {
    copyDashboardText(root);
  });

  ui.btnHidro.addEventListener("click", async () => {
    store.hidroCode = ui.codiHidro.value;
    await doRefresh();
  });

  // primera càrrega
  doRefresh();
  if (store.auto) startAuto();

  return () => stopAuto();
}
