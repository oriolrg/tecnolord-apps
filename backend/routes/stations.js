'use strict';

const express = require('express');
const { readSessionToken } = require('../services/identityService');
const { stationDto } = require('../services/stationCatalogService');
const { sameOriginMutation } = require('./identity');
const { getWindowFromQuery } = require('../utils/periods');

const MEASUREMENT_FIELD_NAMES = Object.freeze([
  'temp_c', 'sensacio_c', 'punt_rosada_c', 'humitat_pct', 'solar_wm2', 'uvi',
  'taxa_pluja_mm_h', 'pluja_diaria_mm', 'pluja_event_mm', 'pluja_hora_mm',
  'pluja_setmana_mm', 'pluja_mes_mm', 'pluja_any_mm', 'vent_ms', 'vent_rafega_ms',
  'vent_direccio_graus', 'pressio_rel_hpa', 'pressio_abs_hpa', 'bateria_pct',
]);
const CURRENT_FIELD_NAMES = Object.freeze([
  ...MEASUREMENT_FIELD_NAMES, 'temp_min_24h_c', 'temp_max_24h_c', 'rain_24h',
]);
const AGGREGATE_FIELD_NAMES = Object.freeze(['temp_min_24h_c', 'temp_max_24h_c', 'rain_24h']);
const MEASUREMENT_FIELDS = `m.instant,${MEASUREMENT_FIELD_NAMES.map((field) => `m.${field}`).join(',')}`;
const FRESHNESS_STATES = new Set(['FRESH', 'STALE', 'OBSOLETE', 'UNKNOWN']);
const FIELD_QUALITY_STATES = new Set(['VALID', 'MISSING', 'INVALID', 'OUT_OF_RANGE']);
const QUALITY_WARNINGS = new Set([
  'INVALID_FRAME_SCHEMA', 'INCONSISTENT_LENGTH', 'SENSOR_MISMATCH', 'UNSUPPORTED_UNIT',
  'SOURCE_UNIT_UNDECLARED', 'FUTURE_TIMESTAMP', 'INVALID_TIMESTAMP',
  'INCONSISTENT_AGGREGATES',
]);
const SOURCE_ERRORS = new Set([
  'AUTH_REQUIRED', 'RATE_LIMITED', 'PROVIDER_UNAVAILABLE', 'TIMEOUT', 'INVALID_JSON',
  'RESPONSE_TOO_LARGE', 'UPSTREAM_REJECTED', 'INVALID_BINDING', 'QUERY_ERROR', 'EMPTY_DATA',
  'SENSOR_MISMATCH', 'AMBIGUOUS_SERIES', 'INVALID_FRAMES', 'FUTURE_TIMESTAMP',
  'INVALID_TIMESTAMP', 'NO_VALID_VALUE', 'AMBIGUOUS_OBSERVATION', 'PROVIDER_ERROR', 'HTTP_429',
]);

function sanitizedTimestamp(value) {
  if (value === null || value === undefined || value === '') return null;
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function sanitizedQuality(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const result = {};
  if (FRESHNESS_STATES.has(value.freshness)) result.freshness = value.freshness;
  if (value.fields && typeof value.fields === 'object' && !Array.isArray(value.fields)) {
    result.fields = Object.fromEntries(CURRENT_FIELD_NAMES
      .filter((field) => FIELD_QUALITY_STATES.has(value.fields[field]))
      .map((field) => [field, value.fields[field]]));
  }
  if (Array.isArray(value.warnings)) {
    result.warnings = [...new Set(value.warnings.filter((warning) => QUALITY_WARNINGS.has(warning)))].sort();
  }
  if (value.observed_at_by_field && typeof value.observed_at_by_field === 'object'
      && !Array.isArray(value.observed_at_by_field)) {
    result.observed_at_by_field = Object.fromEntries(CURRENT_FIELD_NAMES
      .map((field) => [field, sanitizedTimestamp(value.observed_at_by_field[field])])
      .filter(([, timestamp]) => timestamp !== null));
  }
  if (value.units && typeof value.units === 'object' && !Array.isArray(value.units)) {
    const units = {};
    for (const field of CURRENT_FIELD_NAMES) {
      const unit = value.units[field];
      if (!unit || typeof unit !== 'object' || Array.isArray(unit)) continue;
      const canonical = ['celsius', 'percent', 'metres_per_second', 'degrees'].includes(unit.canonical)
        ? unit.canonical : undefined;
      const allowedSourceUnits = canonical === 'percent'
        ? ['humidity', 'percent', 'percentunit', '%']
        : canonical === 'metres_per_second'
          ? ['km/h', 'kmh', 'kph']
          : canonical === 'degrees'
            ? ['degree', 'degrees', 'deg', '°']
            : ['celsius', '°C', 'C', 'celcius'];
      const sourceUnit = allowedSourceUnits.includes(unit.source_unit) ? unit.source_unit : null;
      const basis = ['SOURCE_DECLARED', 'QUERY_CONTRACT'].includes(unit.unit_basis)
        ? unit.unit_basis : undefined;
      if (canonical && basis) units[field] = { canonical, source_unit: sourceUnit, unit_basis: basis };
    }
    result.units = units;
  }
  if (value.aggregates && typeof value.aggregates === 'object' && !Array.isArray(value.aggregates)) {
    result.aggregates = Object.fromEntries(AGGREGATE_FIELD_NAMES.map((field) => {
      const aggregate = value.aggregates[field];
      const evaluatedAt = sanitizedTimestamp(aggregate?.evaluated_at);
      if (!aggregate || aggregate.window_hours !== 24 || aggregate.reduction !== 'lastNotNull'
          || !FIELD_QUALITY_STATES.has(aggregate.quality) || !evaluatedAt) return null;
      return [field, {
        window_hours: 24, evaluated_at: evaluatedAt,
        reduction: 'lastNotNull', quality: aggregate.quality,
      }];
    }).filter(Boolean));
  }
  return result;
}

function currentSnapshotDto(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return null;
  let item = null;
  if (snapshot.item && typeof snapshot.item === 'object' && !Array.isArray(snapshot.item)) {
    item = { instant: sanitizedTimestamp(snapshot.item.instant) };
    for (const field of CURRENT_FIELD_NAMES) {
      if (!(field in snapshot.item)) continue;
      const value = snapshot.item[field];
      item[field] = value === null || (typeof value === 'number' && Number.isFinite(value)) ? value : null;
    }
  }
  const input = snapshot.source && typeof snapshot.source === 'object' ? snapshot.source : {};
  const source = {};
  if (FRESHNESS_STATES.has(input.freshness)) source.freshness = input.freshness;
  if (input.observed_at !== undefined) source.observed_at = sanitizedTimestamp(input.observed_at);
  if (input.fetched_at !== undefined) source.fetched_at = sanitizedTimestamp(input.fetched_at);
  if (input.error === null) source.error = null;
  else if (typeof input.error === 'string') {
    source.error = SOURCE_ERRORS.has(input.error) || /^HTTP_5[0-9]{2}$/.test(input.error)
      ? input.error : 'PROVIDER_ERROR';
  }
  const quality = sanitizedQuality(input.quality);
  if (quality) source.quality = quality;
  return { item, source };
}

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
    const serialized = currentSnapshotDto(snapshot);
    return res.json({
      station: stationDto(station),
      items: serialized.item ? [serialized.item] : [],
      source: serialized.source,
    });
  }));
  router.get('/api/v1/stations/:id/history', safe((req, res) => measurements(req, res, false)));

  return router;
}

module.exports = { MEASUREMENT_FIELDS, currentSnapshotDto, makeStationsRouter };
