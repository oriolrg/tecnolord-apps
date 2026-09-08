// Runtime configuration for local environment
// Overrides read-only, no-store
window.__METEOLORD_CONFIG = {
  API_BASE: '/api',
  MAP_TILE_URL: '', // No map tiles in local
  ANALYTICS_ENABLED: false,
  EXTERNAL_LINKS_ENABLED: false,
  ENVIRONMENT: 'local',
  SYNTHETIC_DATA: true,
};
