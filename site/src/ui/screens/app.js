import { CONFIG } from "../../config.js";
import { createStore } from "../../state/store.js";
import { $ } from "../dom.js";
import { clamp } from "../format.js";
import { renderTecnolordHeader } from "../components/tecnolordHeader.js";
import { renderBottomNav } from "../components/bottomNav.js";
import { initMeteoScreen } from "./meteoScreen.js";
import { initCabalsScreen } from "./cabalsScreen.js";
import { initHistoricsScreen } from "./historicsScreen.js";

// Umami (analytics) – tracking segur (no trenca si no està carregat)
function umamiEvent(name, props) {
  try {
    const u = window.umami;
    if (u && typeof u.track === "function") u.track(name, props);
  } catch (_) {}
}

// Umami – Pageviews per SPA (URL virtual)
function umamiPageview(url, title) {
  try {
    const u = window.umami;
    if (u && typeof u.track === "function") {
      u.track((props) => ({ ...props, url, title }));
    }
  } catch (_) {}
}

function trackScreen(screenId) {
  // Si canvies noms de pantalles, ajusta aquí
  if (screenId === "meteo") umamiPageview("/meteo/", "Meteo");
  else if (screenId === "cabals") umamiPageview("/meteo/cabals", "Cabals");
  else if (screenId === "historics") umamiPageview("/meteo/historics", "Històrics");
}

function readUrlParams(store) {
  const url = new URL(location.href);
  const estFromUrl = url.searchParams.get("estacio") || url.searchParams.get("station_id");
  const limFromUrl = url.searchParams.get("limit");
  const codiFromUrl = url.searchParams.get("codi_hidro") || url.searchParams.get("codi");

  const patch = {};
  if (estFromUrl) patch.estacio = estFromUrl;

  if (limFromUrl) {
    const lim = clamp(parseInt(limFromUrl, 10) || CONFIG.defaultLimit, 1, CONFIG.maxLimit);
    patch.limit = String(lim);
  }

  if (codiFromUrl) patch.codiHidro = codiFromUrl;

  store.set(patch);
}

function buildUI(root) {
  root.innerHTML = `
    ${renderTecnolordHeader({
      title: CONFIG.appTitle,
      subtitle: CONFIG.appSubtitle,
      icon: CONFIG.appIcon,
      actionLabel: "Inicia sessió",
    })}

    <div id="screen-meteo" class="screen active">
      <!-- Contingut de Meteo -->
    </div>

    <div id="screen-cabals" class="screen">
      <!-- Contingut de Cabals -->
    </div>

    <div id="screen-historics" class="screen">
      <!-- Contingut d'Històrics -->
    </div>

    ${renderBottomNav()}
  `;

  return {
    screenMeteo: $("#screen-meteo", root),
    screenCabals: $("#screen-cabals", root),
    screenHistorics: $("#screen-historics", root),
    navButtons: root.querySelectorAll(".nav-btn"),
  };
}

function switchScreen(screenId, ui) {
  // Amagar totes les pantalles
  ui.screenMeteo.classList.remove("active");
  ui.screenCabals.classList.remove("active");
  ui.screenHistorics.classList.remove("active");

  // Mostrar la pantalla seleccionada
  if (screenId === "meteo") ui.screenMeteo.classList.add("active");
  if (screenId === "cabals") ui.screenCabals.classList.add("active");
  if (screenId === "historics") ui.screenHistorics.classList.add("active");

  // Actualitzar botons actius
  ui.navButtons.forEach((btn) => {
    if (btn.dataset.screen === screenId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

export function initApp(root) {
  const store = createStore();
  readUrlParams(store);

  const ui = buildUI(root);

  // Inicialitzar cada pantalla
  const cleanupMeteo = initMeteoScreen(ui.screenMeteo, store);
  const cleanupCabals = initCabalsScreen(ui.screenCabals, store);
  const cleanupHistorics = initHistoricsScreen(ui.screenHistorics, store);

  // Event listeners per al menú inferior
  ui.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const screenId = btn.dataset.screen;
      switchScreen(screenId, ui);

      // IMPORTANT: pageview virtual per SPA
      trackScreen(screenId);

      // Event (opcional) per analítica d'ús
      umamiEvent(`nav_${screenId}`);
    });
  });

  // Pantalla per defecte: Meteo
  switchScreen("meteo", ui);
  trackScreen("meteo");
  umamiEvent("nav_meteo");

  return () => {
    cleanupMeteo();
    cleanupCabals();
    cleanupHistorics();
  };
}
