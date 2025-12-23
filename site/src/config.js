export const CONFIG = {
  // App identity (header + PWA)
  appTitle: "MeteoLord",
  appSubtitle: "Tecnolord apps",

  // FIX: aquest fitxer EXISTEIX dins /meteo/assets/icons/
  // (abans era icon-192.png i NO existia)
  appIcon: "./assets/icons/favicon-96x96.png",

  // IMPORTANT: incrementa aquesta versió quan publiquis canvis
  // (això ajuda a veure que realment estàs servint la versió nova)
  appVersion: "2025-12-23-02",

  // API
  meteoEndpoint: "/api/v1/mesures/darreres",
  hidroEndpoint: "/api/v1/hidro/darreres",

  // UI
  autoRefreshMs: 30000,
  defaultLimit: 48,
  maxLimit: 500,
  defaultEstacio: "home",
};
