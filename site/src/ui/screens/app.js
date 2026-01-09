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

export function initApp(root) {
  const store = createStore();

  readUrlParams(store);

  const ui = buildUI(root);

  // Inicialitzar pantalles
  const cleanupMeteo = initMeteoScreen(ui.screenMeteo, store);
  const cleanupCabals = initCabalsScreen(ui.screenCabals, store);
  const cleanupHistorics = initHistoricsScreen(ui.screenHistorics, store);

  // Event listeners per al menú inferior
  ui.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const screenId = btn.dataset.screen;
      switchScreen(screenId, ui);
      trackEvent(`nav_${screenId}`);
    });
  });

  // Pantalla per defecte: Meteo
  switchScreen("meteo", ui);
  trackEvent("nav_meteo");

  // (opcional, útil) App boot
  trackEvent("app_init", { app: "tecnolord_meteo" });

  return () => {
    cleanupMeteo();
    cleanupCabals();
    cleanupHistorics();
  };
}
