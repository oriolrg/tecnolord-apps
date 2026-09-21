'use strict';

const express = require('express');
const meteo = require('../test/fixtures/meteo.json');
const hidro = require('../test/fixtures/hidro.json');
const forecast = require('../test/fixtures/forecast.json');

const syntheticStations = Object.freeze([
  { id: '11111111-1111-4111-8111-111111111111', name: 'Meteo Synthetic 01', description: null,
    lifecycle: 'ACTIVE', visibility: 'PUBLIC', revision: 1, can_edit: false },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Meteo Synthetic 02', description: null,
    lifecycle: 'ACTIVE', visibility: 'PUBLIC', revision: 1, can_edit: false },
]);

function publicValues(row) {
  const { cas, extres, ...values } = row;
  return values;
}

function queryIsValid(query, allowed) {
  return Object.entries(query).every(([key, value]) => allowed.has(key) && typeof value === 'string');
}

function requestedLimit(query, maximum = 300) {
  if (query.limit === undefined) return 48;
  const value = Number(query.limit);
  return Number.isInteger(value) && value >= 1 && value <= maximum ? value : null;
}

function makeSyntheticPreviewRouter() {
  const router = express.Router();
  router.use('/api/v1/', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.get('/api/v1/mesures/darreres', (req, res) => {
    if (!queryIsValid(req.query, new Set(['estacio', 'limit', 'period', 'from', 'to']))) {
      return res.status(400).json({ ok: false, error: 'invalid_query' });
    }
    const limit = requestedLimit(req.query);
    if (limit === null) return res.status(400).json({ ok: false, error: 'invalid_limit' });
    const stations = req.query.estacio
      ? meteo.estacions.filter((station) => station.codi === req.query.estacio)
      : meteo.estacions.slice(0, 1);
    const items = stations.flatMap((station) => station.observacions)
      .sort((left, right) => Date.parse(right.instant) - Date.parse(left.instant))
      .slice(0, limit)
      .map(publicValues);
    return res.json({ ok: true, items });
  });

  router.get('/api/v1/stations', (_req, res) => res.json({ items: syntheticStations }));
  router.get('/api/v1/public-view', (_req, res) => res.json({ config: {
    station: syntheticStations[0],
    card_ids: ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv'],
    revision: 1,
  } }));
  router.get('/api/v1/me/stations', (_req, res) => res.status(401).json({ error: 'unauthenticated' }));
  router.get('/api/v1/stations/:id/current', (req, res) => {
    const index = syntheticStations.findIndex((station) => station.id === req.params.id);
    if (index < 0) return res.status(404).json({ error: 'not_found' });
    const source = meteo.estacions[0].observacions[0];
    return res.json({
      station: syntheticStations[index],
      items: [{ ...publicValues(source), temp_c: index === 0 ? 18.5 : 7 }],
      source: {
        freshness: 'FRESH', observed_at: source.instant, fetched_at: source.instant, error: null,
        quality: { freshness: 'FRESH' },
      },
    });
  });

  router.get('/api/v1/hidro/darreres', (req, res) => {
    if (!queryIsValid(req.query, new Set(['codi', 'limit', 'period', 'from', 'to', 'mode', 'ensure']))) {
      return res.status(400).json({ ok: false, error: 'invalid_query' });
    }
    const limit = requestedLimit(req.query, 5000);
    if (limit === null) return res.status(400).json({ ok: false, error: 'invalid_limit' });
    const items = hidro.estacions
      .filter((station) => !req.query.codi || station.codi === req.query.codi)
      .flatMap((station) => station.lectures.map((reading) => ({
        codi: station.codi,
        nom: station.nom,
        tipus: station.tipus,
        ...publicValues(reading),
      })))
      .sort((left, right) => Date.parse(right.instant) - Date.parse(left.instant))
      .slice(0, limit);
    return res.json({ ok: true, items });
  });

  router.get('/api/v1/previ/48h', (req, res) => {
    if (!queryIsValid(req.query, new Set(['station', 'source', 'model']))) {
      return res.status(400).json({ ok: false, error: 'invalid_query' });
    }
    const run = forecast.runs.find((item) =>
      (!req.query.station || item.station_code === req.query.station)
      && (!req.query.source || item.source === req.query.source)
      && (!req.query.model || item.model === req.query.model));
    if (!run) return res.json({ ok: true, run: null, items: [] });
    return res.json({
      ok: true,
      run: {
        id: run.run_id,
        source: run.source,
        model: run.model,
        station: run.station_code,
        issued_at: run.issued_at,
        hours: run.hours,
      },
      items: run.hourly,
    });
  });

  return router;
}

module.exports = { makeSyntheticPreviewRouter };
