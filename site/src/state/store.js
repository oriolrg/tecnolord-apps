// Estat global (simple) per pantalles i paràmetres d'API
// - Manté valors per defecte
// - Persisteix a localStorage
// - Permet subscribe() per reaccionar als canvis

const STORAGE_KEY = "tecnolord-store-v1";

const DEFAULT_STATE = {
  // Meteo
  estacio: "",           // codi estació meteo (opcional)
  limit: 200,            // límit general de registres (pantalles)
  auto: true,            // auto-refresh

  // Hidro (si vols forçar un codi concret)
  codiHidro: "",

  // Períodes de consulta (meteo/hidro)
  // last24h|today|yesterday|last7d|last30d|custom
  period: "last24h",
  // quan period=custom (format YYYY-MM-DD)
  date_from: "",
  date_to: "",

  // Hidro avançat
  hidro_mode: "latest",  // latest|range
  hidro_ensure: true     // força fallback si un codi no té dades dins del rang
};

function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

export function createStore() {
  const saved = safeParse(localStorage.getItem(STORAGE_KEY) || "null");
  let state = { ...DEFAULT_STATE, ...(saved && typeof saved === "object" ? saved : {}) };

  const listeners = new Set();

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function get() {
    return state;
  }

  function set(patch) {
    if (!patch || typeof patch !== "object") return;
    state = { ...state, ...patch };
    persist();
    for (const fn of listeners) {
      try { fn(state); } catch {}
    }
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { get, set, subscribe };
}
