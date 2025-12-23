export const CONFIG = {
  meteoEndpoint: "/api/v1/mesures/darreres",
  hidroEndpoint: "/api/v1/hidro/darreres",
  autoRefreshMs: 30000,
  defaultLimit: 48,
  maxLimit: 500,
  defaultEstacio: "home",
  stations: ["home"],

  // ⬇️ nou
  showHidroFilter: false,
  // UI shared (Tecnolord)
  ui: {
    title: "MeteoLord",
    subtitle: "Tecnolord apps",
    icon: "/assets/images/meteolord.png", // posa-hi el path on serveixis la icona
    actionLabel: "Inicia sessió",
  },
};
