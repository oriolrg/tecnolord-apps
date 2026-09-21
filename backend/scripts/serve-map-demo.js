'use strict';
// Isolated local preview. No pool, ingestion jobs or database.
const express = require('express');
const { mapAssets } = require('../middleware/mapAssets');
const path = require('node:path');
const { makeMapPublicRouter } = require('../routes/mapPublic');
const { makeLiveMeteoPreviewRouter } = require('../routes/liveMeteoPreview');
const { makeLiveMapPreviewRouter } = require('../routes/liveMapPreview');
const { makeSyntheticPreviewRouter } = require('../routes/syntheticPreview');
const { LOCAL_FRONTEND_CSP } = require('../server');

function createPreviewApp({ mode = 'synthetic' } = {}) {
  if (!['synthetic', 'live'].includes(mode)) throw new Error('MAP_PREVIEW_MODE must be synthetic or live');
  const realPreview = mode === 'live';
  const csp = realPreview ? LOCAL_FRONTEND_CSP
    .replace("img-src 'self' data:;", "img-src 'self' data: https://tile.openstreetmap.org;")
    .replace("connect-src 'self';", "connect-src 'self' https://tile.openstreetmap.org;") : LOCAL_FRONTEND_CSP;
  const app = express();
  app.use((_req, res, next) => { res.setHeader('Content-Security-Policy', csp); next(); });
  app.use(realPreview
    ? makeLiveMapPreviewRouter()
    : makeMapPublicRouter({ environment: { METEOLORD_ENV: 'local' } }));
  app.use(realPreview ? makeLiveMeteoPreviewRouter() : makeSyntheticPreviewRouter());
  app.get('/meteo/runtime-config.js', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.resolve(__dirname, realPreview
      ? '../../config/meteolord/runtime-config.live-local.js'
      : '../../config/meteolord/runtime-config.local.js'));
  });
  app.use(mapAssets);
  app.use('/meteo', express.static(path.resolve(__dirname, '../../site')));
  app.get('/', (_req, res) => res.redirect('/meteo/mapa/'));
  return app;
}

if (require.main === module) {
  const mode = process.env.MAP_PREVIEW_MODE || 'synthetic';
  const app = createPreviewApp({ mode });
  const port = Number(process.env.MAP_PREVIEW_PORT || 8096);
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`MeteoLord ${mode === 'live' ? 'real local' : 'sintètic'}: http://127.0.0.1:${server.address().port}/meteo/mapa/`);
  });
}

module.exports = { createPreviewApp };
