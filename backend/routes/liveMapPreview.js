'use strict';

const crypto = require('node:crypto');
const express = require('express');

const OWN_URL = 'https://tecnolord.cat/api/v1/mesures/darreres?limit=1';
const MODEL_URL = 'https://api.open-meteo.com/v1/forecast';
const POINTS = Object.freeze([
  { id: 'barcelona', name: 'Barcelona', lat: 41.3874, lon: 2.1686 },
  { id: 'girona', name: 'Girona', lat: 41.9794, lon: 2.8214 },
  { id: 'lleida', name: 'Lleida', lat: 41.6176, lon: 0.6200 },
  { id: 'tarragona', name: 'Tarragona', lat: 41.1189, lon: 1.2445 },
  { id: 'la-seu', name: 'La Seu d’Urgell', lat: 42.3574, lon: 1.4616 },
]);

function isoTime(value) {
  if (typeof value !== 'string') return null;
  const timestamp = Date.parse(value.endsWith('Z') || /[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function field(fieldId, unit, rawValue, observedAt, now) {
  const value = typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : null;
  const age = observedAt ? now - Date.parse(observedAt) : Infinity;
  const freshness = age >= -300000 && age <= 7200000 ? 'FRESCA' : 'OBSOLETA';
  return {
    field_id: fieldId, unit, current_value: freshness === 'FRESCA' ? value : null,
    last_value: value, reliable: freshness === 'FRESCA' && value !== null,
    freshness, quality: 'VALIDA', review: 'PUBLICAT',
  };
}

function feature({ id, name, lon, lat, temperature, humidity, observedAt, source, legal, now }) {
  return {
    type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] },
    properties: {
      public_station_id: id, public_name: name, geo_publication: 'APPROXIMATED',
      observed_at: observedAt,
      provenance: { source, licence_or_legal_basis_ref: legal },
      sensors: [{ sensor_id: 'weather', fields: [
        field('temperature', 'celsius', temperature, observedAt, now),
        field('humidity', 'percent', humidity, observedAt, now),
      ] }],
    },
  };
}

async function fetchJson(fetchImpl, url) {
  const response = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('upstream_unavailable');
  return response.json();
}

async function loadLiveMap({ fetchImpl = globalThis.fetch, now = Date.now() } = {}) {
  const modelUrl = new URL(MODEL_URL);
  modelUrl.searchParams.set('latitude', POINTS.map((point) => point.lat).join(','));
  modelUrl.searchParams.set('longitude', POINTS.map((point) => point.lon).join(','));
  modelUrl.searchParams.set('current', 'temperature_2m,relative_humidity_2m');
  modelUrl.searchParams.set('timezone', 'UTC');
  const [own, modeled] = await Promise.allSettled([
    fetchJson(fetchImpl, OWN_URL), fetchJson(fetchImpl, modelUrl),
  ]);
  const features = [], sources = [];
  if (own.status === 'fulfilled' && own.value?.ok === true && Array.isArray(own.value.items)) {
    const current = own.value.items[0];
    if (current) {
      features.push(feature({ id: 'meteolord', name: 'MeteoLord · zona del Solsonès',
        lon: 1.59, lat: 42.14, temperature: current.temp_c, humidity: current.humitat_pct,
        observedAt: isoTime(current.instant), source: 'MeteoLord · observació',
        legal: 'Dades publicades a tecnolord.cat; ubicació aproximada', now }));
      sources.push('MeteoLord');
    }
  }
  if (modeled.status === 'fulfilled') {
    const results = Array.isArray(modeled.value) ? modeled.value : [modeled.value];
    if (results.length === POINTS.length) {
      POINTS.forEach((point, index) => {
        const current = results[index]?.current;
        if (!current) return;
        features.push(feature({ id: `model-${point.id}`, name: `${point.name} · model`,
          lon: point.lon, lat: point.lat,
          temperature: current.temperature_2m, humidity: current.relative_humidity_2m,
          observedAt: isoTime(current.time), source: 'Open-Meteo · estimació de model, no observació d’estació',
          legal: 'CC BY 4.0 · https://open-meteo.com/', now }));
      });
      if (features.some((item) => item.properties.public_station_id.startsWith('model-'))) sources.push('Open-Meteo');
    }
  }
  if (!features.length) throw new Error('no_live_data');
  const version = `live-local-${crypto.createHash('sha256').update(JSON.stringify(features)).digest('hex').slice(0, 16)}`;
  return { version, sources, collection: { type: 'FeatureCollection', features } };
}

function makeLiveMapPreviewRouter({ fetchImpl = globalThis.fetch, now = Date.now, ttlMs = 120000 } = {}) {
  const router = express.Router();
  let cached, expiresAt = 0, pending;
  async function snapshot() {
    const current = now();
    if (cached && current < expiresAt) return cached;
    if (!pending) pending = loadLiveMap({ fetchImpl, now: current }).then((value) => {
      cached = value; expiresAt = now() + ttlMs; return value;
    }).finally(() => { pending = null; });
    return pending;
  }
  router.use('/api/v1/map', async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      req.liveMap = await snapshot();
      res.setHeader('X-Catalog-Version', req.liveMap.version);
      next();
    } catch {
      res.status(503).json({ error: 'live_sources_unavailable' });
    }
  });
  function filtered(req) {
    const { q, sensor, freshness } = req.query;
    if ([q, sensor, freshness].some((value) => value !== undefined && (typeof value !== 'string' || value.length > 120))) return null;
    if (sensor && !['temperature', 'humidity'].includes(sensor)) return null;
    if (freshness && !['FRESCA', 'OBSOLETA', 'SENSE_DADES_RECENTS'].includes(freshness)) return null;
    const features = req.liveMap.collection.features.filter(({ properties }) => {
      if (q && !properties.public_name.toLocaleLowerCase('ca').includes(q.toLocaleLowerCase('ca'))) return false;
      if (sensor && !properties.sensors[0].fields.some((item) => item.field_id === sensor)) return false;
      if (freshness && !properties.sensors[0].fields.some((item) => item.freshness === freshness)) return false;
      return true;
    });
    return { type: 'FeatureCollection', features };
  }
  router.get('/api/v1/map/stations', (req, res) => {
    const collection = filtered(req);
    return collection ? res.json(collection) : res.status(400).json({ error: 'invalid_filter' });
  });
  router.get('/api/v1/map/summary', (req, res) => {
    const collection = filtered(req);
    if (!collection) return res.status(400).json({ error: 'invalid_filter' });
    const values = collection.features.map(({ properties }) => properties.sensors[0].fields[0].current_value)
      .filter((value) => Number.isFinite(value));
    return res.json({ count: collection.features.length, temperature_min: values.length ? Math.min(...values) : null,
      temperature_max: values.length ? Math.max(...values) : null, sources: req.liveMap.sources,
      catalog_version: req.liveMap.version });
  });
  router.get('/api/v1/map/catalog-version', (req, res) => res.json({ catalog_version: req.liveMap.version }));
  router.get('/api/v1/map/stations/:id', (req, res) => {
    const station = req.liveMap.collection.features.find((item) => item.properties.public_station_id === req.params.id);
    return station ? res.json(station.properties) : res.status(404).json({ error: 'not_found' });
  });
  return router;
}

module.exports = { POINTS, loadLiveMap, makeLiveMapPreviewRouter };
