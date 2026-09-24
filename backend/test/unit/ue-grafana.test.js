'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('../fixtures/grafana-frames.json');
const {
  CANONICAL_SNAPSHOT_FIELDS, DATASOURCE_UID, GRAFANA_ENDPOINT, WINDOW_MS, buildGrafanaQuery,
  makeGrafanaAdapterService, normalizeGrafanaPayload, normalizeGrafanaSnapshot,
} = require('../../services/grafanaAdapterService');

const ID = '11111111-1111-4111-8111-111111111111';
const SENSOR = 'Meteo-901-9000001';
const TO = Date.parse('2026-09-24T09:20:00.000Z');
const FROM = TO - WINDOW_MS;

function payload(times, values, { sensor = SENSOR, unit } = {}) {
  return {
    results: {
      A: {
        status: 200,
        frames: [{
          schema: { fields: [
            { name: 'Time', type: 'time' },
            { name: 'Temperatura', type: 'number', labels: { tag4: sensor }, config: unit ? { unit } : {} },
          ] },
          data: { values: [times, values] },
        }],
      },
    },
  };
}

function humidityPayload(times, values, { sensor = SENSOR, unit } = {}) {
  return {
    results: {
      B: {
        status: 200,
        frames: [{
          schema: { fields: [
            { name: 'Time', type: 'time' },
            { name: 'Humitat relativa', type: 'number', labels: { tag4: sensor }, config: unit ? { unit } : {} },
          ] },
          data: { values: [times, values] },
        }],
      },
    },
  };
}

function multivariable(temperature, humidity) {
  return { results: { ...(temperature?.results || {}), ...(humidity?.results || {}) } };
}

function providerResponse(body) {
  const encoded = Buffer.from(JSON.stringify(body));
  return {
    ok: true, status: 200,
    headers: { get: () => String(encoded.byteLength) },
    async arrayBuffer() { return encoded; },
  };
}

function adapter(fetch, enabled = true) {
  return makeGrafanaAdapterService({
    enabled, fetch, clock: () => new Date(TO),
    pool: { async query() { return { rowCount: 0, rows: [] }; } },
  });
}

test('H05A builds fixed temperature and humidity queries without client-controlled endpoint or PromQL', () => {
  const body = buildGrafanaQuery(SENSOR, FROM, TO);
  assert.equal(GRAFANA_ENDPOINT, 'https://grafana.commonscloud.coop/api/ds/query');
  assert.equal(body.queries.length, 2);
  assert.equal(body.queries[0].datasource.uid, DATASOURCE_UID);
  assert.equal(body.queries[0].expr, `xoic_I2CAT_temperatura{tag4="${SENSOR}"}`);
  assert.equal(body.queries[0].intervalMs, 300000);
  assert.equal(body.queries[0].maxDataPoints, 20);
  assert.equal(body.queries[1].datasource.uid, DATASOURCE_UID);
  assert.equal(body.queries[1].expr, `xoic_I2CAT_humitat{tag4="${SENSOR}"}`);
  assert.equal(body.queries[1].intervalMs, 300000);
  assert.equal(TO - FROM, 30 * 60 * 1000);
  assert.equal(buildGrafanaQuery('unknown', FROM, TO), null);
  assert.equal(buildGrafanaQuery(SENSOR, FROM, TO + 1), null);
});

test('H06 builds the same bounded queries for literal partial and S31 identifiers', () => {
  for (const externalId of ['Meteo-026-', 'Meteo-027-', 'Meteo-029-', 'S31-119416', 'S31-99933']) {
    const body = buildGrafanaQuery(externalId, FROM, TO);
    assert.equal(body.queries.length, 2);
    assert.equal(body.queries[0].expr, `xoic_I2CAT_temperatura{tag4="${externalId}"}`);
    assert.equal(body.queries[1].expr, `xoic_I2CAT_humitat{tag4="${externalId}"}`);
  }
});

test('UE-T14 normalizes multiple frames, preserves zero/null and rejects inconsistent lengths', () => {
  const normalized = normalizeGrafanaPayload(fixture, { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(normalized.ok, true);
  assert.equal(normalized.series.length, 2);
  assert.deepEqual(normalized.series[0].points, [
    { observed_at: '2026-09-24T09:00:00.000Z', value: null, quality: 'OUT_OF_RANGE' },
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

test('G02 creates canonical snapshots and selects the latest valid ordered or unordered point', () => {
  const fromFixture = normalizeGrafanaSnapshot(fixture, { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(fromFixture.ok, true);
  assert.equal(fromFixture.observedAt.toISOString(), '2026-09-24T09:20:00.000Z');
  assert.equal(fromFixture.values.temp_c, 13.25);
  assert.deepEqual(Object.keys(fromFixture.values), CANONICAL_SNAPSHOT_FIELDS);
  for (const field of CANONICAL_SNAPSHOT_FIELDS.filter((field) => field !== 'temp_c')) {
    assert.equal(fromFixture.values[field], null);
    assert.equal(fromFixture.quality.fields[field], 'MISSING');
  }
  assert.deepEqual(fromFixture.quality.warnings, ['INCONSISTENT_LENGTH', 'SOURCE_UNIT_UNDECLARED']);
  assert.deepEqual(fromFixture.quality.units.temp_c, {
    canonical: 'celsius', source_unit: 'celsius', unit_basis: 'SOURCE_DECLARED',
  });

  const unordered = normalizeGrafanaSnapshot(payload(
    [TO - 60_000, TO - 180_000, TO - 120_000], [7, 5, 6], { unit: 'celsius' },
  ), { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(unordered.ok, true);
  assert.equal(unordered.observedAt.toISOString(), new Date(TO - 60_000).toISOString());
  assert.equal(unordered.values.temp_c, 7);
});

test('G02 preserves zero and never promotes null or non-numeric values', () => {
  const zero = normalizeGrafanaSnapshot(payload([TO], [0]), { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(zero.ok, true);
  assert.equal(zero.values.temp_c, 0);
  assert.equal(zero.quality.units.temp_c.source_unit, null);
  assert.equal(zero.quality.units.temp_c.unit_basis, 'QUERY_CONTRACT');
  for (const value of [null, '12.5', Number.NaN]) {
    const result = normalizeGrafanaSnapshot(payload([TO], [value]), { externalId: SENSOR, from: FROM, to: TO });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'NO_VALID_VALUE');
  }
});

test('G02 distinguishes empty, invalid timestamp and entirely invalid observations', () => {
  assert.deepEqual(normalizeGrafanaSnapshot({ results: { A: { status: 200, frames: [] } } }, {
    externalId: SENSOR, from: FROM, to: TO,
  }), { ok: false, error: 'EMPTY_DATA' });
  for (const timestamp of [undefined, 'invalid']) {
    const result = normalizeGrafanaSnapshot(payload([timestamp], [12]), {
      externalId: SENSOR, from: FROM, to: TO,
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'INVALID_TIMESTAMP');
    assert.deepEqual(result.warnings, ['INVALID_TIMESTAMP', 'SOURCE_UNIT_UNDECLARED']);
  }
  const invalid = normalizeGrafanaSnapshot(payload([TO - 1000, TO], [80, null]), {
    externalId: SENSOR, from: FROM, to: TO,
  });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.error, 'NO_VALID_VALUE');
});

test('G02 rejects ambiguous series and contradictory values at the same timestamp', () => {
  const ambiguous = payload([TO], [12]);
  ambiguous.results.A.frames[0].schema.fields.push({
    name: 'Altra sèrie', type: 'number', labels: { tag4: SENSOR }, config: { unit: 'celsius' },
  });
  ambiguous.results.A.frames[0].data.values.push([12]);
  assert.deepEqual(normalizeGrafanaSnapshot(ambiguous, { externalId: SENSOR, from: FROM, to: TO }), {
    ok: false, error: 'AMBIGUOUS_SERIES',
  });

  const contradictory = payload([TO], [12], { unit: 'celsius' });
  contradictory.results.A.frames.push(payload([TO], [13], { unit: 'celsius' }).results.A.frames[0]);
  const conflict = normalizeGrafanaSnapshot(contradictory, { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(conflict.ok, false);
  assert.equal(conflict.error, 'AMBIGUOUS_OBSERVATION');
});

test('G02 preserves old observation time and rejects anomalous future-only data', () => {
  const old = normalizeGrafanaSnapshot(payload([FROM], [4]), { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(old.ok, true);
  assert.equal(old.observedAt.toISOString(), new Date(FROM).toISOString());
  const future = normalizeGrafanaSnapshot(payload([TO + 1], [5]), { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(future.ok, false);
  assert.equal(future.error, 'FUTURE_TIMESTAMP');
  assert.deepEqual(future.warnings, ['FUTURE_TIMESTAMP', 'SOURCE_UNIT_UNDECLARED']);
});

test('G02 internal entry returns a canonical in-memory snapshot without database writes', async () => {
  let queries = 0;
  const service = makeGrafanaAdapterService({
    enabled: true, fetch: async () => providerResponse(payload([TO], [8])), clock: () => new Date(TO),
    pool: { async query() { queries += 1; throw new Error('must not query'); } },
  });
  const result = await service.fetchSnapshot({ external_id: SENSOR });
  assert.equal(result.ok, true);
  assert.equal(result.values.temp_c, 8);
  assert.equal(queries, 0);
  assert.deepEqual(await adapter(async () => { throw new Error('must not fetch'); }, false)
    .fetchSnapshot({ external_id: SENSOR }), { ok: false, error: 'DISABLED' });
  assert.deepEqual(await service.fetchSnapshot({ external_id: 'invalid' }), {
    ok: false, error: 'INVALID_BINDING',
  });
});

test('G02 classifies HTTP, network, invalid JSON and incompatible Grafana responses', async () => {
  for (const [status, error] of [[401, 'AUTH_REQUIRED'], [403, 'AUTH_REQUIRED'], [429, 'RATE_LIMITED'], [500, 'PROVIDER_UNAVAILABLE']]) {
    const result = await adapter(async () => ({ ok: false, status }))
      .fetchSnapshot({ external_id: SENSOR });
    assert.deepEqual(result, { ok: false, error });
  }
  assert.deepEqual(await adapter(async () => { throw new Error('network'); })
    .fetchSnapshot({ external_id: SENSOR }), { ok: false, error: 'UNAVAILABLE' });
  assert.deepEqual(await adapter(async () => {
    throw Object.assign(new Error('aborted'), { name: 'AbortError' });
  }).fetchSnapshot({ external_id: SENSOR }), { ok: false, error: 'TIMEOUT' });
  assert.deepEqual(await adapter(async () => ({
    ok: true, status: 200, headers: { get() { return null; } }, async text() { return '{'; },
  })).fetchSnapshot({ external_id: SENSOR }), { ok: false, error: 'INVALID_JSON' });
  assert.deepEqual(await adapter(async () => providerResponse({ results: {} }))
    .fetchSnapshot({ external_id: SENSOR }), { ok: false, error: 'QUERY_ERROR' });
});

test('H05A normalizes temperature and humidity independently with per-field timestamps', () => {
  const input = multivariable(
    payload([TO - 60_000], [14], { unit: 'celsius' }),
    humidityPayload([TO - 120_000], [65], { unit: 'humidity' }),
  );
  const result = normalizeGrafanaSnapshot(input, { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(result.ok, true);
  assert.equal(result.values.temp_c, 14);
  assert.equal(result.values.humitat_pct, 65);
  assert.equal(result.observedAt.toISOString(), new Date(TO - 60_000).toISOString());
  assert.deepEqual(result.quality.observed_at_by_field, {
    temp_c: new Date(TO - 60_000).toISOString(),
    humitat_pct: new Date(TO - 120_000).toISOString(),
  });
  assert.deepEqual(result.quality.units.humitat_pct, {
    canonical: 'percent', source_unit: 'humidity', unit_basis: 'SOURCE_DECLARED',
  });
  for (const field of CANONICAL_SNAPSHOT_FIELDS.filter((name) => !['temp_c', 'humitat_pct'].includes(name))) {
    assert.equal(result.values[field], null);
    assert.equal(result.quality.fields[field], 'MISSING');
  }
});

test('H05A accepts humidity boundaries and rejects invalid values without clamping', () => {
  for (const value of [0, 50, 100]) {
    const result = normalizeGrafanaSnapshot(humidityPayload([TO], [value]), {
      externalId: SENSOR, from: FROM, to: TO,
    });
    assert.equal(result.ok, true);
    assert.equal(result.values.temp_c, null);
    assert.equal(result.values.humitat_pct, value);
    assert.equal(result.quality.fields.humitat_pct, 'VALID');
  }
  for (const [value, quality] of [[null, 'MISSING'], [-1, 'OUT_OF_RANGE'], [101, 'OUT_OF_RANGE'], ['50', 'INVALID'], [Number.NaN, 'INVALID']]) {
    const input = multivariable(payload([TO], [12]), humidityPayload([TO], [value]));
    const result = normalizeGrafanaSnapshot(input, { externalId: SENSOR, from: FROM, to: TO });
    assert.equal(result.ok, true);
    assert.equal(result.values.temp_c, 12);
    assert.equal(result.values.humitat_pct, null);
    assert.equal(result.quality.fields.humitat_pct, quality);
  }
});

test('H05A supports partial series and isolates variable failures', () => {
  const onlyTemperature = normalizeGrafanaSnapshot(payload([TO], [12]), {
    externalId: SENSOR, from: FROM, to: TO,
  });
  assert.equal(onlyTemperature.ok, true);
  assert.equal(onlyTemperature.values.temp_c, 12);
  assert.equal(onlyTemperature.quality.fields.humitat_pct, 'MISSING');

  const onlyHumidity = normalizeGrafanaSnapshot(humidityPayload([TO], [40]), {
    externalId: SENSOR, from: FROM, to: TO,
  });
  assert.equal(onlyHumidity.ok, true);
  assert.equal(onlyHumidity.values.temp_c, null);
  assert.equal(onlyHumidity.values.humitat_pct, 40);

  const futureHumidity = multivariable(payload([TO], [12]), humidityPayload([TO + 1], [55]));
  const result = normalizeGrafanaSnapshot(futureHumidity, { externalId: SENSOR, from: FROM, to: TO });
  assert.equal(result.ok, true);
  assert.equal(result.values.temp_c, 12);
  assert.equal(result.values.humitat_pct, null);
  assert.equal(result.quality.fields.humitat_pct, 'INVALID');
  assert.ok(result.quality.warnings.includes('FUTURE_TIMESTAMP'));
});
