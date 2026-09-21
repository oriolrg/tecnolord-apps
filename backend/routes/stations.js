'use strict';

const express = require('express');
const { readSessionToken } = require('../services/identityService');
const { stationDto } = require('../services/stationCatalogService');
const { sameOriginMutation } = require('./identity');
const { getWindowFromQuery } = require('../utils/periods');

const MEASUREMENT_FIELDS = `
  m.instant,m.temp_c,m.sensacio_c,m.punt_rosada_c,m.humitat_pct,m.solar_wm2,m.uvi,
  m.taxa_pluja_mm_h,m.pluja_diaria_mm,m.pluja_event_mm,m.pluja_hora_mm,
  m.pluja_setmana_mm,m.pluja_mes_mm,m.pluja_any_mm,m.vent_ms,m.vent_rafega_ms,
  m.vent_direccio_graus,m.pressio_rel_hpa,m.pressio_abs_hpa,m.bateria_pct
`;

function makeStationsRouter({ pool, identityService, stationCatalog, connectorRegistry, snapshotService, stationLocations, mode } = {}) {
  if (!pool || !identityService || !stationCatalog) throw new TypeError('Station route dependencies are required');
  const router = express.Router();
  const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'station_unavailable' });
  });

  router.use(['/api/v1/me/stations', '/api/v1/admin/stations', '/api/v1/stations'], (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vary', 'Cookie');
    next();
  });

  async function session(req) {
    return identityService.current(readSessionToken(req));
  }

  const requireUser = safe(async (req, res, next) => {
    const current = await session(req);
    if (!current) return res.status(401).json({ error: 'unauthenticated' });
    req.userSession = current;
    return next();
  });

  const requireMutation = safe(async (req, res, next) => {
    if (!sameOriginMutation(req, mode)) return res.status(403).json({ error: 'forbidden' });
    if (!identityService.validCsrf(req.userSession, req.get('x-csrf-token'))) {
      return res.status(403).json({ error: 'forbidden' });
    }
    return next();
  });

  router.get('/api/v1/me/stations', requireUser, safe(async (req, res) => {
    return res.json({ items: await stationCatalog.listOwn(req.userSession.user.id) });
  }));

  router.post('/api/v1/me/stations', requireUser, requireMutation, safe(async (req, res) => {
    const station = await stationCatalog.create(req.userSession.user.id, req.body);
    return station ? res.status(201).json({ station }) : res.status(400).json({ error: 'invalid_station' });
  }));

  router.patch('/api/v1/me/stations/:id', requireUser, requireMutation, safe(async (req, res) => {
    const result = await stationCatalog.update(req.userSession.user.id, req.params.id, req.body);
    if (result.invalid) return res.status(400).json({ error: 'invalid_station' });
    if (result.conflict) return res.status(409).json({ error: 'revision_conflict' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.json({ station: result.station });
  }));

  router.delete('/api/v1/me/stations/:id', requireUser, requireMutation, safe(async (req, res) => {
    const result = await stationCatalog.retire(req.userSession.user.id, req.params.id, req.body?.revision);
    if (result.invalid) return res.status(400).json({ error: 'invalid_station' });
    if (result.conflict) return res.status(409).json({ error: 'revision_conflict' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.json({ station: result.station });
  }));

  router.get('/api/v1/me/stations/:id/connector/ecowitt', requireUser, safe(async (req, res) => {
    if (!connectorRegistry) return res.status(503).json({ error: 'connector_unavailable' });
    const connector = await connectorRegistry.getOwn(req.userSession.user.id, req.params.id);
    return connector ? res.json({ connector }) : res.status(404).json({ error: 'not_found' });
  }));

  router.put('/api/v1/me/stations/:id/connector/ecowitt', requireUser, requireMutation, safe(async (req, res) => {
    if (!connectorRegistry) return res.status(503).json({ error: 'connector_unavailable' });
    const result = await connectorRegistry.setEcowitt(req.userSession.user.id, req.params.id, req.body);
    if (result.unavailable) return res.status(503).json({ error: 'connector_key_unavailable' });
    if (result.invalid) return res.status(400).json({ error: 'invalid_connector' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.json(result);
  }));

  router.get('/api/v1/me/stations/:id/location', requireUser, safe(async (req, res) => {
    if (!stationLocations) return res.status(503).json({ error: 'location_unavailable' });
    const result = await stationLocations.getOwn(req.userSession.user.id, req.params.id);
    return result ? res.json(result) : res.status(404).json({ error: 'not_found' });
  }));

  router.put('/api/v1/me/stations/:id/location', requireUser, requireMutation, safe(async (req, res) => {
    if (!stationLocations) return res.status(503).json({ error: 'location_unavailable' });
    const result = await stationLocations.updateOwn(req.userSession.user.id, req.params.id, req.body);
    if (result.invalid) return res.status(400).json({ error: 'invalid_location' });
    if (result.gate) return res.status(409).json({ error: 'publication_requirements' });
    if (result.conflict) return res.status(409).json({ error: 'revision_conflict' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.json(result);
  }));

  router.get('/api/v1/admin/stations', requireUser, safe(async (req, res) => {
    if (req.userSession.user.role !== 'SUPERADMIN') return res.status(403).json({ error: 'forbidden' });
    return res.json({ items: await stationCatalog.listAllForAdmin() });
  }));

  router.get('/api/v1/stations', safe(async (_req, res) => {
    return res.json({ items: await stationCatalog.listPublic() });
  }));

  async function accessible(req, dataOnly = false) {
    const current = await session(req);
    return {
      current,
      station: await stationCatalog.accessible({
        publicId: req.params.id,
        actor: current?.user,
        dataOnly,
      }),
    };
  }

  router.get('/api/v1/stations/:id', safe(async (req, res) => {
    const { current, station } = await accessible(req);
    if (!station) return res.status(404).json({ error: 'not_found' });
    return res.json({ station: stationDto(station, {
      canEdit: String(station.owner_id) === String(current?.user.id) && station.lifecycle !== 'RETIRED',
    }) });
  }));

  async function measurements(req, res, one) {
    const { station } = await accessible(req, true);
    if (!station) return res.status(404).json({ error: 'not_found' });
    const limit = one ? 1 : Math.min(Math.max(Number.parseInt(req.query.limit || '200', 10) || 200, 1), 5000);
    const { start, end } = getWindowFromQuery(req);
    const params = [station.id];
    const predicates = ['m.estacio_id=$1'];
    if (start) { params.push(start.toISOString()); predicates.push(`m.instant >= $${params.length}`); }
    if (end) { params.push(end.toISOString()); predicates.push(`m.instant < $${params.length}`); }
    const result = await pool.query(`
      SELECT ${MEASUREMENT_FIELDS} FROM meteo.mesures m
      WHERE ${predicates.join(' AND ')} ORDER BY m.instant DESC LIMIT ${limit}
    `, params);
    return res.json({ station: stationDto(station), items: result.rows });
  }

  router.get('/api/v1/stations/:id/current', safe(async (req, res) => {
    const { station } = await accessible(req, true);
    if (!station) return res.status(404).json({ error: 'not_found' });
    const snapshot = snapshotService?.readCurrent
      ? await snapshotService.readCurrent(station.id)
      : null;
    if (!snapshot) return measurements(req, res, true);
    return res.json({
      station: stationDto(station),
      items: snapshot.item ? [snapshot.item] : [],
      source: snapshot.source,
    });
  }));
  router.get('/api/v1/stations/:id/history', safe((req, res) => measurements(req, res, false)));

  return router;
}

module.exports = { MEASUREMENT_FIELDS, makeStationsRouter };
