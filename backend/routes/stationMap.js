'use strict';

const express = require('express');
const { readSessionToken } = require('../services/identityService');
const { createRateLimiter, parseBBox } = require('./mapPublic');

function filtered(collection, query) {
  const allowed = new Set(['q', 'sensor', 'freshness', 'bbox']);
  if (Object.keys(query).some((key) => !allowed.has(key))) return null;
  const bbox = parseBBox(query.bbox);
  if (bbox === undefined || (query.q !== undefined && (typeof query.q !== 'string' || query.q.length > 120))
    || (query.sensor !== undefined && (typeof query.sensor !== 'string' || query.sensor.length > 120))
    || (query.freshness !== undefined && !['FRESCA', 'SENSE_DADES_RECENTS', 'OBSOLETA'].includes(query.freshness))) return null;
  const search = query.q?.trim().toLocaleLowerCase('ca');
  return {
    type: 'FeatureCollection',
    features: collection.features.filter((feature) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      const fields = feature.properties.sensors.flatMap((sensor) => sensor.fields);
      return (!search || feature.properties.public_name.toLocaleLowerCase('ca').includes(search))
        && (!bbox || (longitude >= bbox.minLongitude && longitude <= bbox.maxLongitude
          && latitude >= bbox.minLatitude && latitude <= bbox.maxLatitude))
        && (!query.sensor || feature.properties.sensors.some((sensor) => sensor.sensor_id === query.sensor)
          || fields.some((field) => field.field_id === query.sensor))
        && (!query.freshness || fields.some((field) => field.freshness === query.freshness));
    }),
  };
}

function makeStationMapRouter({ identityService, stationLocations, rateLimit } = {}) {
  if (!identityService || !stationLocations) throw new TypeError('Persistent map dependencies are required');
  const router = express.Router();
  const safe = (handler) => (req, res) => Promise.resolve(handler(req, res)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'map_unavailable' });
  });
  const publicLimit = createRateLimiter(rateLimit);

  async function current(req) { return identityService.current(readSessionToken(req)); }
  async function publicSnapshot(req, res) {
    const source = await stationLocations.publicCollection();
    const collection = filtered(source, req.query);
    if (!collection) { res.status(400).json({ error: 'invalid_filter' }); return null; }
    const version = source.features[0]?.properties.catalog_version || await stationLocations.catalogVersion();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Catalog-Version', version);
    return { collection, version };
  }

  router.use(['/api/v1/map', '/meteo/mapa/sitemap.xml'], publicLimit);

  router.get('/api/v1/map/stations', safe(async (req, res) => {
    const snapshot = await publicSnapshot(req, res);
    if (snapshot) res.json(snapshot.collection);
  }));
  router.get('/api/v1/map/list', safe(async (req, res) => {
    const snapshot = await publicSnapshot(req, res);
    if (snapshot) res.json({ features: snapshot.collection.features, count: snapshot.collection.features.length });
  }));
  router.get('/api/v1/map/summary', safe(async (req, res) => {
    const snapshot = await publicSnapshot(req, res);
    if (!snapshot) return;
    const values = snapshot.collection.features.flatMap((feature) => feature.properties.sensors
      .flatMap((sensor) => sensor.fields)
      .filter((field) => field.field_id === 'temperature' && Number.isFinite(field.current_value))
      .map((field) => field.current_value));
    const sources = [...new Set(snapshot.collection.features.map((feature) => feature.properties.provenance.source))];
    res.json({ count: snapshot.collection.features.length,
      temperature_min: values.length ? Math.min(...values) : null,
      temperature_max: values.length ? Math.max(...values) : null,
      sources, catalog_version: snapshot.version });
  }));
  router.get('/api/v1/map/catalog-version', safe(async (_req, res) => {
    const version = await stationLocations.catalogVersion();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Catalog-Version', version);
    res.json({ catalog_version: version });
  }));
  router.get('/api/v1/map/stations/:id', safe(async (req, res) => {
    const station = await stationLocations.publicStation(req.params.id);
    const version = station?.catalog_version || await stationLocations.catalogVersion();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Catalog-Version', version);
    if (!station) return res.status(404).json({ error: 'not_found' });
    return res.json(station);
  }));
  router.get('/api/v1/map/sitemap', safe(async (req, res) => {
    const snapshot = await publicSnapshot(req, res);
    if (!snapshot) return;
    const ids = snapshot.collection.features.map((feature) => feature.properties.public_station_id);
    res.json({ ids, urls: ids.map((id) => `/meteo/mapa/?station=${encodeURIComponent(id)}`), count: ids.length, catalog_version: snapshot.version });
  }));
  router.get('/meteo/mapa/sitemap.xml', safe(async (req, res) => {
    const source = await stationLocations.publicCollection();
    const version = source.features[0]?.properties.catalog_version || await stationLocations.catalogVersion();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Catalog-Version', version);
    const host = req.get('host') || '';
    if (!/^(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+(?::[0-9]{1,5})?$/.test(host)) return res.status(400).send('Invalid host');
    const urls = source.features.map((feature) => `<url><loc>${req.protocol}://${host}/meteo/mapa/?station=${encodeURIComponent(feature.properties.public_station_id)}</loc></url>`).join('');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  }));

  async function privateMap(req, res, all) {
    const session = await current(req);
    if (!session) return res.status(401).json({ error: 'unauthenticated' });
    if (all && session.user.role !== 'SUPERADMIN') return res.status(403).json({ error: 'forbidden' });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vary', 'Cookie');
    const collection = filtered(await stationLocations.privateCollection(session.user, all), req.query);
    return collection ? res.json(collection) : res.status(400).json({ error: 'invalid_filter' });
  }
  router.get('/api/v1/me/map', safe((req, res) => privateMap(req, res, false)));
  router.get('/api/v1/admin/map', safe((req, res) => privateMap(req, res, true)));

  return router;
}

module.exports = { filtered, makeStationMapRouter };
