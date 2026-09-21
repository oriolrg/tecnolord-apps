'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('../fixtures/grafana-frames.json');
const {
  DATASOURCE_UID, GRAFANA_ENDPOINT, WINDOW_MS, buildGrafanaQuery,
  makeGrafanaAdapterService, normalizeGrafanaPayload,
} = require('../../services/grafanaAdapterService');

const ID = '11111111-1111-4111-8111-111111111111';
const SENSOR = 'Meteo-901-9000001';
const TO = Date.parse('2026-09-24T09:20:00.000Z');
const FROM = TO - WINDOW_MS;

test('UE-T14 builds one fixed temperature query without client-controlled endpoint or PromQL', () => {
  const body = buildGrafanaQuery(SENSOR, FROM, TO);
  assert.equal(GRAFANA_ENDPOINT, 'https://grafana.commonscloud.coop/api/ds/query');
  assert.equal(body.queries.length, 1);
  assert.equal(body.queries[0].datasource.uid, DATASOURCE_UID);
  assert.equal(body.queries[0].expr, `xoic_I2CAT_temperatura{tag4="${SENSOR}"}`);
  assert.equal(body.queries[0].intervalMs, 300000);
  assert.equal(body.queries[0].maxDataPoints, 20);
  assert.equal(buildGrafanaQuery('unknown', FROM, TO), null);
  assert.equal(buildGrafanaQuery(SENSOR, FROM, TO + 1), null);
});

test('UE-T14 normalizes multiple frames, preserves zero/null and rejects inconsistent lengths', () => {
  const normalized = normalizeGrafanaPayload(fixture, { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(normalized.ok, true);
  assert.equal(normalized.series.length, 2);
  assert.deepEqual(normalized.series[0].points, [
    { observed_at: '2026-09-24T09:05:00.000Z', value: 0, quality: 'VALID' },
    { observed_at: '2026-09-24T09:10:00.000Z', value: null, quality: 'MISSING' },
    { observed_at: '2026-09-24T09:15:00.000Z', value: 12.5, quality: 'VALID' },
  ]);
  assert.equal(normalized.series[0].unit, 'celsius');
  assert.equal(normalized.series[0].source_unit, null);
  assert.equal(normalized.series[0].unit_basis, 'QUERY_CONTRACT');
  assert.deepEqual(normalized.series[1].points, [
    { observed_at: '2026-09-24T09:20:00.000Z', value: 13.25, quality: 'VALID' },
  ]);
  assert.deepEqual(normalized.warnings, ['INCONSISTENT_LENGTH', 'SOURCE_UNIT_UNDECLARED']);
});

test('UE-T14 fails closed for a mismatched sensor, unsupported units and malformed results', () => {
  const wrong = structuredClone(fixture);
  wrong.results.A.frames = wrong.results.A.frames.slice(0, 1);
  wrong.results.A.frames[0].schema.fields[1].labels.tag4 = 'Meteo-902-9000002';
  assert.deepEqual(normalizeGrafanaPayload(wrong, { externalId: SENSOR, from: FROM, to: TO }), {
    ok: false, error: 'SENSOR_MISMATCH', warnings: ['SENSOR_MISMATCH'],
  });
  const unit = structuredClone(fixture);
  unit.results.A.frames = unit.results.A.frames.slice(1, 2);
  unit.results.A.frames[0].schema.fields[0].config.unit = 'fahrenheit';
  assert.deepEqual(normalizeGrafanaPayload(unit, { externalId: SENSOR, from: FROM, to: TO }), {
    ok: false, error: 'INVALID_FRAMES', warnings: ['UNSUPPORTED_UNIT'],
  });
  assert.deepEqual(normalizeGrafanaPayload({ results: {} }, { externalId: SENSOR, from: FROM, to: TO }),
    { ok: false, error: 'QUERY_ERROR' });
  assert.deepEqual(normalizeGrafanaPayload(fixture, {
    externalId: SENSOR, from: TO + 1, to: TO + WINDOW_MS,
  }), { ok: false, error: 'EMPTY_DATA', warnings: ['INCONSISTENT_LENGTH', 'SOURCE_UNIT_UNDECLARED'] });
});

test('UE-T14 adapter rejects unknown bindings and classifies upstream authentication', async () => {
  let fetched = false;
  const missing = makeGrafanaAdapterService({
    enabled: true, clock: () => new Date(TO),
    pool: { async query() { return { rowCount: 0, rows: [] }; } },
    fetch: async () => { fetched = true; throw new Error('must not fetch'); },
  });
  assert.deepEqual(await missing.query(ID), { notFound: true });
  assert.equal(fetched, false);
  const auth = makeGrafanaAdapterService({
    enabled: true, clock: () => new Date(TO),
    pool: { async query() { return { rowCount: 1, rows: [{ public_id: ID, nom: 'Sintètica', external_id: SENSOR }] }; } },
    fetch: async (_url, options) => {
      fetched = true;
      assert.equal(options.redirect, 'error');
      assert.equal(JSON.parse(options.body).queries[0].expr.includes(SENSOR), true);
      return { ok: false, status: 401, headers: { get() { return null; } } };
    },
  });
  assert.deepEqual(await auth.query(ID), { upstreamError: 'AUTH_REQUIRED' });
  assert.equal(fetched, true);
});
