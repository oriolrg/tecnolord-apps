'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildUrl, makeEstimationService, mapFeature, normalize } = require('../../services/estimationService');

const POINT = Object.freeze({
  kind: 'ESTIMATION', id: '15000000-0000-4000-8000-000000000006', slug: 'andorra', name: 'Andorra',
  reference: { label: 'Andorra la Vella', longitude: 1.52184, latitude: 42.50632, provenance: 'fixture' },
  source: { provider: 'OPEN_METEO', label: 'Open-Meteo', attribution: 'CC BY 4.0' },
});
const NOW = new Date('2026-09-21T12:00:00Z');

test('UE-T15 fixes the Open-Meteo request and preserves zero, null and reference identity', () => {
  const url = buildUrl([POINT]);
  assert.equal(url.origin + url.pathname, 'https://api.open-meteo.com/v1/forecast');
  assert.equal(url.searchParams.get('latitude'), '42.50632');
  assert.equal(url.searchParams.get('longitude'), '1.52184');
  assert.equal(url.searchParams.get('wind_speed_unit'), 'ms');
  const item = normalize(POINT, { latitude: 42.51, longitude: 1.52, current: {
    time: '2026-09-21T11:45', temperature_2m: 0, relative_humidity_2m: null,
    apparent_temperature: -1, precipitation: 0, pressure_msl: 1012,
    wind_speed_10m: 0, wind_direction_10m: 0, wind_gusts_10m: 0, uv_index: 0,
  } }, NOW);
  assert.equal(item.status, 'AVAILABLE'); assert.equal(item.freshness, 'FRESH');
  assert.equal(item.values.temp_c, 0); assert.equal(item.values.humitat_pct, null);
  assert.equal(item.values.vent_ms, 0); assert.equal(item.reference.label, 'Andorra la Vella');
  const feature = mapFeature(item);
  assert.equal(feature.properties.resource_kind, 'ESTIMATION');
  assert.equal(feature.properties.sensors[0].fields[0].current_value, 0);
  assert.match(feature.properties.provenance.source, /estimació/);
});

test('UE-T15 marks stale/obsolete/error data without inventing current values', () => {
  const stale = normalize(POINT, { current: { time: '2026-09-21T08:30', temperature_2m: 5 } }, NOW);
  assert.equal(stale.freshness, 'STALE');
  const obsolete = normalize(POINT, { current: { time: '2026-09-20T12:00', temperature_2m: 8 } }, NOW);
  assert.equal(mapFeature(obsolete).properties.sensors[0].fields[0].current_value, null);
  const mismatch = normalize(POINT, { latitude: 40, longitude: 0, current: {
    time: '2026-09-21T11:45', temperature_2m: 12,
  } }, NOW);
  assert.equal(mismatch.status, 'ERROR'); assert.equal(mismatch.values, null);
});

test('UE-T15 coalesces and caches one provider request for all points', async () => {
  let fetches = 0;
  const row = { id: POINT.id, slug: POINT.slug, label: POINT.name, reference_label: POINT.reference.label,
    reference_provenance: 'fixture', longitude: '1.52184', latitude: '42.50632' };
  const service = makeEstimationService({
    pool: { async query() { return { rows: [row] }; } }, clock: () => NOW,
    fetch: async () => {
      fetches += 1;
      return { ok: true, headers: { get() { return null; } }, async text() { return JSON.stringify({ current: {
        time: '2026-09-21T11:45', temperature_2m: 7,
      } }); } };
    },
  });
  const [first, second] = await Promise.all([service.snapshot(), service.snapshot()]);
  assert.equal(fetches, 1); assert.deepEqual(first, second);
  assert.equal((await service.current(POINT.id)).values.temp_c, 7);
  assert.equal(await service.current('invalid'), null);
});
