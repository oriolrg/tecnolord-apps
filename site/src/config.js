export const CONFIG = {
  // App identity (header + PWA)
  appTitle: "MeteoLord",
  appSubtitle: "Tecnolord apps",
  appIcon: "/assets/icons/icon-192.png",
  // IMPORTANT: incrementa aquesta versió quan publiquis canvis
  appVersion: "2025-12-23-01",

  // API
  meteoEndpoint: "/api/v1/mesures/darreres",
  hidroEndpoint: "/api/v1/hidro/darreres",

  // UI
  autoRefreshMs: 30000,
  defaultLimit: 48,
  maxLimit: 500,
  defaultEstacio: "home",
};
