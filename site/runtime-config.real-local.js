// Runtime configuration for the local database-backed application.
// Served read-only with Cache-Control: no-store; never used by production.
(() => {
  'use strict';

  const localConfig = Object.freeze({
    API_BASE: '/api',
    MAP_TILE_URL: '',
    ANALYTICS_ENABLED: false,
    EXTERNAL_LINKS_ENABLED: false,
    ENVIRONMENT: 'local',
    SYNTHETIC_DATA: false,
    MAP_ACCESS_SCOPE: 'PUBLIC',
  });

  Object.defineProperty(window, '__METEOLORD_CONFIG', {
    value: localConfig,
    writable: false,
    configurable: false,
    enumerable: true,
  });
})();
