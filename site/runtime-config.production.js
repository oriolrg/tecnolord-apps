// Runtime configuration served only by Caddy for the production /meteo/ application.
(() => {
  'use strict';

  const productionConfig = Object.freeze({
    API_BASE: '/api',
    MAP_TILE_URL: '',
    ANALYTICS_ENABLED: true,
    EXTERNAL_LINKS_ENABLED: true,
    ENVIRONMENT: 'production',
    SYNTHETIC_DATA: false,
  });

  Object.defineProperty(window, '__METEOLORD_CONFIG', {
    value: productionConfig,
    writable: false,
    configurable: false,
    enumerable: true,
  });
})();
