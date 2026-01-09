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
function trackEvent(name, props) {
  try {
    const u = window.umami;
    if (u && typeof u.track === "function") u.track(name, props);
  } catch (_) {}
}

// Umami – Pageviews per SPA (virtual URLs)
function trackPageview(url, title) {
  try {
    const u = window.umami;
    if (u && typeof u.track === "function") {
      u.track((props) => ({ ...props, url, title }));
    }
  } catch (_) {}
}

function trackScreenView(screenId) {
  // "Vistes" separades per pantalles dins /meteo/ (SPA)
  const map = {
    meteo: { url: "/meteo/", title: "Meteo" },
    cabals: { url: "/meteo/cabals", title: "Cabals" },
    historics: { url: "/meteo/historics", title: "Històrics" },
  };
  const cfg = map[screenId];
  if (cfg) trackPageview(cfg.url, cfg.title);
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

  if (codiFromUrl) patch.codi_hidro = codiFromUrl;

  if (Object.keys(patch).length) store.setState(patch, { silent: true });
}

function switchScreen(screenId, ui) {
  // Amagar totes les pantalles
  ui.screenMeteo.classList.remove("active");
  ui.screenCabals.classList.remove("active");
  ui.screenHistorics.classList.remove("active");

  // Mostrar la pantalla seleccionada
  const screens = {
    meteo: ui.screenMeteo,
    cabals: ui.screenCabals,
    historics: ui.screenHistorics,
  };

  if (screens[screenId]) screens[screenId].classList.add("active");

  // Actualitzar botons actius
  ui.navButtons.forEach((btn) => {
    if (btn.dataset.screen === screenId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

export function initApp() {
  const store = createStore();
  readUrlParams(store);

  const app = $("#app");
  if (!app) return () => {};

  // Header
  const headerMount = $("#tl-header");
  if (headerMount) renderTecnolordHeader(headerMount);

  // Pantalles
  const screenMeteo = $("#screen-meteo");
  const screenCabals = $("#screen-cabals");
  const screenHistorics = $("#screen-historics");

  // Menú inferior
  const navMount = $("#bottom-nav");
  if (navMount) renderBottomNav(navMount);

  const navButtons = Array.from(document.querySelectorAll("[data-screen]"));

  const ui = {
    screenMeteo,
    screenCabals,
    screenHistorics,
    navButtons,
  };

  // Inicialitza pantalles (retornen cleanup)
  const cleanupMeteo = initMeteoScreen(ui.screenMeteo, store);
  const cleanupCabals = initCabalsScreen(ui.screenCabals, store);
  const cleanupHistorics = initHistoricsScreen(ui.screenHistorics, store);

  // Event listeners per al menú inferior
  ui.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const screenId = btn.dataset.screen;
      switchScreen(screenId, ui);

      // IMPORTANT: pageview virtual per SPA
      trackScreenView(screenId);

      // Event (opcional) per analítica d'ús
      trackEvent(`nav_${screenId}`);
    });
  });

  // Pantalla per defecte: Meteo
  switchScreen("meteo", ui);
  trackEvent("nav_meteo");

  return () => {
    cleanupMeteo();
    cleanupCabals();
    cleanupHistorics();
  };
}
