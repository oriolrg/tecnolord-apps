import { CONFIG } from "../../config.js";
import { createStore } from "../../state/store.js";
import { $ } from "../dom.js";
import { clamp } from "../format.js";
import { renderTecnolordHeader } from "../components/tecnolordHeader.js";
import { renderBottomNav } from "../components/bottomNav.js";
import { initMeteoScreen } from "./meteoScreen.js";
import { initCabalsScreen } from "./cabalsScreen.js";
import { initHistoricsScreen } from "./historicsScreen.js";

// --- NOVES FUNCIONS PER A LA PANTALLA DE BENVINGUDA ---

function showWelcomeScreen() {
  const KEY = "tecnolord:meteo:welcome_seen";
  if (localStorage.getItem(KEY)) return;

  const overlay = document.createElement('div');
  overlay.id = 'welcome-overlay';
  overlay.innerHTML = `
    <div class="welcome-card">
        <div class="welcome-header">
            <img src="./assets/icons/apple-touch-icon.png" alt="MeteoLord Logo" class="welcome-logo">
            <h1>Benvingut a MeteoLord</h1>
        </div>
        
        <div class="welcome-body">
            <p>El teu panell meteorològic i hidrològic de referència a la <strong>Vall de Lord</strong>.</p>
            
            <div class="info-item">
                <i class="fas fa-cloud-sun"></i>
                <div>
                    <strong>Meteo en temps real</strong>
                    <span>Dades actualitzades cada minut des de les nostres estacions.</span>
                </div>
            </div>

            <div class="info-item">
                <i class="fas fa-water"></i>
                <div>
                    <strong>Cabals i Embassaments</strong>
                    <span>Estat del riu Cardener, l'Aigua de Valls i la Llosa del Cavall.</span>
                </div>
            </div>

            <div class="info-item">
                <i class="fas fa-chart-line"></i>
                <div>
                    <strong>Dades Històriques</strong>
                    <span>Consulta l'evolució del temps en els últims dies i mesos.</span>
                </div>
            </div>
        </div>

        <button id="btn-close-welcome" class="welcome-btn"> COMENÇAR </button>
        
        <p class="welcome-footer">Projecte lliure de Tecnolord</p>
    </div>
  `;

  injectWelcomeStyles();
  document.body.appendChild(overlay);

  document.getElementById('btn-close-welcome').onclick = () => {
    localStorage.setItem(KEY, "true");
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 500);
  };
}

function injectWelcomeStyles() {
  if (document.getElementById('welcome-styles')) return;
  const style = document.createElement('style');
  style.id = 'welcome-styles';
  style.innerHTML = `
    #welcome-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.9); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.5s ease; padding: 20px; box-sizing: border-box;
        backdrop-filter: blur(4px);
    }
    .welcome-card {
        background: white; border-radius: 24px; padding: 32px;
        max-width: 400px; width: 100%; text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
        animation: slideUp 0.5s ease-out;
    }
    @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .welcome-logo { width: 70px; height: 70px; margin-bottom: 16px; border-radius: 16px; }
    .welcome-header h1 { font-size: 1.5rem; color: #1e293b; margin: 0 0 16px 0; font-weight: 800; }
    .welcome-body { text-align: left; margin-bottom: 24px; }
    .info-item { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
    .info-item i { font-size: 1.25rem; color: #3b82f6; margin-top: 4px; width: 24px; text-align: center; }
    .info-item strong { display: block; font-size: 0.95rem; color: #1e293b; }
    .info-item span { font-size: 0.85rem; color: #64748b; line-height: 1.4; }
    .welcome-btn {
        width: 100%; padding: 14px; background: #3b82f6; color: white;
        border: none; border-radius: 12px; font-weight: bold; cursor: pointer;
        font-size: 1rem; transition: background 0.2s;
    }
    .welcome-btn:active { background: #2563eb; }
    .welcome-footer { font-size: 0.7rem; color: #94a3b8; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; }
  `;
  document.head.appendChild(style);
}

// --- RESTA DE LÒGICA (Umami, Navigation, etc.) ---

function umamiEvent(name, props) {
  try {
    const u = window.umami;
    if (u && typeof u.track === "function") u.track(name, props);
  } catch (_) {}
}

function umamiPageview(url, title) {
  try {
    const u = window.umami;
    if (u && typeof u.track === "function") {
      u.track((props) => ({ ...props, url, title }));
    }
  } catch (_) {}
}

function trackScreen(screenId) {
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

    <div id="screen-meteo" class="screen active"></div>
    <div id="screen-cabals" class="screen"></div>
    <div id="screen-historics" class="screen"></div>

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
  ui.screenMeteo.classList.remove("active");
  ui.screenCabals.classList.remove("active");
  ui.screenHistorics.classList.remove("active");

  if (screenId === "meteo") ui.screenMeteo.classList.add("active");
  if (screenId === "cabals") ui.screenCabals.classList.add("active");
  if (screenId === "historics") ui.screenHistorics.classList.add("active");

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

  // Inicialitzar la benvinguda
  showWelcomeScreen();

  const cleanupMeteo = initMeteoScreen(ui.screenMeteo, store);
  const cleanupCabals = initCabalsScreen(ui.screenCabals, store);
  const cleanupHistorics = initHistoricsScreen(ui.screenHistorics, store);

  ui.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const screenId = btn.dataset.screen;
      switchScreen(screenId, ui);
      trackScreen(screenId);
      umamiEvent(`nav_${screenId}`);
    });
  });

  switchScreen("meteo", ui);
  trackScreen("meteo");
  umamiEvent("nav_meteo");

  return () => {
    cleanupMeteo();
    cleanupCabals();
    cleanupHistorics();
  };
}