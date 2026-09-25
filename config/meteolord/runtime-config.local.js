// Runtime configuration for local environment.
// Served read-only with Cache-Control: no-store; never merged with another config.
(() => {
  'use strict';

  const localConfig = Object.freeze({
    API_BASE: '/api',
    MAP_TILE_URL: '',
    ANALYTICS_ENABLED: false,
    EXTERNAL_LINKS_ENABLED: false,
    ENVIRONMENT: 'local',
    SYNTHETIC_DATA: true,
  });

  Object.defineProperty(window, '__METEOLORD_CONFIG', {
    value: localConfig,
    writable: false,
    configurable: false,
    enumerable: true,
  });
})();
