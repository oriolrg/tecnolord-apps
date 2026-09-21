'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const ROOT = path.resolve(__dirname, '../../site/map-assets');
const ASSETS = new Set(['maplibre-gl.mjs', 'maplibre-gl-shared.mjs', 'maplibre-gl-worker.mjs', 'maplibre-gl.css', 'pmtiles.js']);
function mapAssets(req, res, next) {
  const name = req.path.slice('/meteo/map-assets/'.length);
  if (!['GET', 'HEAD'].includes(req.method) || !req.path.startsWith('/meteo/map-assets/') || !ASSETS.has(name)) return next();
  res.vary('Accept-Encoding');
  if (!req.acceptsEncodings('gzip') || req.headers.range) return next();
  res.type(name.endsWith('.css') ? 'text/css' : 'application/javascript');
  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  if (req.method === 'HEAD') return res.end();
  const stream = fs.createReadStream(path.join(ROOT, name));
  stream.on('error', next);
  stream.pipe(zlib.createGzip()).on('error', next).pipe(res);
}
module.exports = { mapAssets };
