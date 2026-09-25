// Local-only preview with live public weather sources. Never used by production.
(() => {
  'use strict';
  Object.defineProperty(window, '__METEOLORD_CONFIG', {
    value: Object.freeze({
      API_BASE: '/api',
      MAP_TILE_URL: '',
      ANALYTICS_ENABLED: false,
      EXTERNAL_LINKS_ENABLED: false,
      ENVIRONMENT: 'local',
      SYNTHETIC_DATA: false,
    }),
    writable: false,
    configurable: false,
    enumerable: true,
  });
})();
