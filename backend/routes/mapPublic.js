'use strict';

const express = require('express');
const { createCatalogStore } = require('../providers/mapCatalogStore');
const { buildHistory } = require('../providers/mapHistory');
const { publicCanonicalStations, DEMO_NOW } = require('../providers/mapPublicCatalog');
const {
  getPublicGeoJSON,
  getPublicList,
  getPublicStation,
} = require('../providers/mapPublicCatalog');

const DEFAULT_RATE_LIMIT = Object.freeze({ limit: 60, windowMs: 60_000 });

function runtimeMode(environment = process.env) {
  return environment.METEOLORD_ENV || environment.APP_ENV || environment.NODE_ENV || 'production';
}

function isMapALocalEnvironment(environment = process.env) {
  return ['local', 'test'].includes(runtimeMode(environment));
}

function parseBBox(value) {
  if (value === undefined) return null;
  if (typeof value !== 'string') return undefined;
  if (value.split(',').some((part) => part.trim() === '')) return undefined;
  const values = value.split(',').map((part) => Number(part.trim()));
  if (values.length !== 4 || values.some((number) => !Number.isFinite(number))) return undefined;
  const [minLongitude, minLatitude, maxLongitude, maxLatitude] = values;
  if (minLongitude < -180 || maxLongitude > 180 || minLatitude < -90 || maxLatitude > 90
    || minLongitude > maxLongitude || minLatitude > maxLatitude) return undefined;
  return { minLongitude, minLatitude, maxLongitude, maxLatitude };
}

function featureMatchesBBox(feature, bbox) {
  if (!bbox) return true;
  const [longitude, latitude] = feature.geometry.coordinates;
  return longitude >= bbox.minLongitude
    && longitude <= bbox.maxLongitude
    && latitude >= bbox.minLatitude
    && latitude <= bbox.maxLatitude;
}

function featureMatchesSensor(feature, sensorFilter) {
  if (sensorFilter === undefined) return true;
  if (typeof sensorFilter !== 'string' || sensorFilter.trim() === '') return false;
  const wanted = sensorFilter.trim();
  return feature.properties.sensors.some((sensor) => sensor.sensor_id === wanted
    || sensor.fields.some((field) => field.field_id === wanted));
}

function createRateLimiter({ limit = DEFAULT_RATE_LIMIT.limit, windowMs = DEFAULT_RATE_LIMIT.windowMs, now = Date.now } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1 || typeof now !== 'function') {
    throw new TypeError('Invalid public map rate-limit configuration');
  }
  const buckets = new Map();

  return function rateLimit(req, res, next) {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const timestamp = now();
    for (const [ip, entry] of buckets) if (timestamp >= entry.resetAt) buckets.delete(ip);
    if (!buckets.has(key) && buckets.size >= 10000) return res.status(429).json({ error: 'rate_limited' });
    const current = buckets.get(key);
    const bucket = !current || timestamp >= current.resetAt
      ? { count: 0, resetAt: timestamp + windowMs }
      : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    const remaining = Math.max(0, limit - bucket.count);
    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > limit) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - timestamp) / 1000))));
      return res.status(429).json({ error: 'rate_limited' });
    }
    return next();
  };
}

function queryFilters(req) {
  const bbox = parseBBox(req.query.bbox);
  if (bbox === undefined) return { valid: false };
  if (req.query.q !== undefined && (typeof req.query.q !== 'string' || req.query.q.length > 120)) return { valid: false };
  if (req.query.sensor !== undefined && (typeof req.query.sensor !== 'string' || req.query.sensor.length > 120)) return { valid: false };
  if (req.query.freshness !== undefined && !['FRESCA', 'SENSE_DADES_RECENTS', 'OBSOLETA'].includes(req.query.freshness)) return { valid: false };
  return { valid: true, bbox, q: req.query.q, sensor: req.query.sensor, freshness: req.query.freshness };
}

function filteredGeoJSON(stations, req) {
  const filters = queryFilters(req);
  if (!filters.valid) return null;
  const source = getPublicGeoJSON(stations, filters.q === undefined ? {} : { search: filters.q });
  return {
    type: source.type,
    features: source.features.filter((feature) => featureMatchesBBox(feature, filters.bbox)
      && featureMatchesSensor(feature, filters.sensor)
      && (!filters.freshness || feature.properties.sensors.some((sensor) => sensor.fields.some((field) => field.freshness === filters.freshness)))),
  };
}

function makeMapPublicRouter({
  stations,
  environment = process.env,
  rateLimit,
  historyProfiles,
  observations,
} = {}) {
  const router = express.Router();

  // MAP-A is synthetic-only. An accidental production mount is inert.
  if (!isMapALocalEnvironment(environment)) return router;
  const demo = stations === undefined ? require('../providers/mapDemo').createMapDemo() : null;
  const safeStations = Array.isArray(stations) ? stations : demo?.stations || [];
  const safeHistoryProfiles = Array.isArray(historyProfiles) ? historyProfiles : demo?.historyProfiles || [];
  const safeObservations = observations && typeof observations === 'object' ? observations : demo?.observations || {};
  const store = createCatalogStore(safeStations, safeHistoryProfiles);
  router.use((req, res, next) => {
    if (!req.path.startsWith('/api/v1/map/') && req.path !== '/meteo/mapa/sitemap.xml') return next('router');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    const snapshot = store.snapshot();
    req.mapSnapshot = snapshot;
    res.setHeader('X-Catalog-Version', snapshot.version);
    next();
  });
  router.use(createRateLimiter(rateLimit));

  router.get('/api/v1/map/stations', (req, res) => {
    const collection = filteredGeoJSON(req.mapSnapshot.stations, req);
    if (collection === null) return res.status(400).json({ error: 'invalid_filter' });
    return res.json(collection);
  });

  router.get('/api/v1/map/stations/:public_station_id', (req, res) => {
    const station = getPublicStation(req.mapSnapshot.stations, req.params.public_station_id);
    if (station === null) return res.status(404).json({ error: 'not_found' });
    return res.json(station);
  });

  router.get('/api/v1/map/list', (req, res) => {
    const filters = queryFilters(req);
    if (!filters.valid) return res.status(400).json({ error: 'invalid_filter' });
    const source = getPublicList(req.mapSnapshot.stations, filters.q === undefined ? {} : { search: filters.q });
    const features = source.features.filter((feature) => featureMatchesBBox(feature, filters.bbox)
      && featureMatchesSensor(feature, filters.sensor)
      && (!filters.freshness || feature.properties.sensors.some((sensor) => sensor.fields.some((field) => field.freshness === filters.freshness))));
    return res.json({ features, count: features.length });
  });

  router.get('/api/v1/map/summary', (req, res) => {
    const collection = filteredGeoJSON(req.mapSnapshot.stations, req);
    if (!collection) return res.status(400).json({ error: 'invalid_filter' });
    const values = collection.features.flatMap((feature) => feature.properties.sensors.flatMap((sensor) =>
      sensor.fields.filter((field) => field.field_id === 'temperature' && field.reliable && Number.isFinite(field.current_value))
        .map((field) => field.current_value)));
    return res.json({ count: collection.features.length, temperature_min: values.length ? Math.min(...values) : null,
      temperature_max: values.length ? Math.max(...values) : null, catalog_version: req.mapSnapshot.version });
  });

  router.get('/api/v1/map/stations/:public_station_id/history/:field', (req, res) => {
    const station = publicCanonicalStations(req.mapSnapshot.stations).find((item) => item.public_station_id === req.params.public_station_id);
    const field = station?.sensors.filter((sensor) => sensor.publication_class === 'PUBLIC_ALLOWED')
      .flatMap((sensor) => sensor.fields).find((item) => item.field_id === req.params.field);
    const profile = safeHistoryProfiles.find((item) => item.history_profile_id === field?.history_profile_id);
    try {
      const history = buildHistory({ field, profile, observations: safeObservations[station?.public_station_id]?.[req.params.field],
        query: req.query, now: DEMO_NOW });
      if (!history) return res.status(404).json({ error: 'not_found' });
      return res.json({ ...history, catalog_version: req.mapSnapshot.version });
    } catch {
      return res.status(400).json({ error: 'invalid_history_query' });
    }
  });

  router.get('/api/v1/map/catalog-version', (req, res) => {
    const catalogVersion = req.mapSnapshot.version;
    return res.json({ catalog_version: catalogVersion });
  });

  router.get('/meteo/mapa/sitemap.xml', (req, res) => {
    const host = req.get('host') || '';
    if (!/^(?:127\.0\.0\.1|localhost)(?::[0-9]{1,5})?$/.test(host)) return res.status(400).send('Invalid host');
    const ids = getPublicGeoJSON(req.mapSnapshot.stations).features.map((feature) => feature.properties.public_station_id);
    const urls = ids.map((id) => `<url><loc>http://${host}/meteo/mapa/?station=${encodeURIComponent(id)}</loc></url>`).join('');
    res.type('application/xml');
    return res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  });

  router.get('/api/v1/map/sitemap', (req, res) => {
    const collection = filteredGeoJSON(req.mapSnapshot.stations, req);
    if (collection === null) return res.status(400).json({ error: 'invalid_filter' });
    const ids = collection.features.map((feature) => feature.properties.public_station_id);
    return res.json({ ids, urls: ids.map((id) => `/meteo/mapa/?station=${encodeURIComponent(id)}`), count: ids.length, catalog_version: req.mapSnapshot.version });
  });

  return router;
}

module.exports = {
  DEFAULT_RATE_LIMIT,
  createRateLimiter,
  isMapALocalEnvironment,
  makeMapPublicRouter,
  parseBBox,
};
