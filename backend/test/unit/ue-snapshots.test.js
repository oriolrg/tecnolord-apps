'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { freshnessAt, normalizeEcowittSnapshot } = require('../../services/snapshotService');
const { fetchEcowittConnector } = require('../../services/ecowittService');
const { ECOWITT_CONFIGURATION } = require('../../services/connectorRegistryService');

const NOW = new Date('2026-09-20T12:00:00.000Z');

function payload(time = NOW.getTime() / 1000) {
  return {
    code: 0,
    time,
    data: {
      outdoor: { temperature: { value: '0' }, humidity: { value: null } },
      wind: { wind_speed: { value: '36' }, wind_direction: { value: '361' } },
      rainfall: { rain_rate: { value: '0' } },
    },
  };
}

test('UE-T07 freshness uses exact two/eight interval boundaries', () => {
  assert.equal(freshnessAt(new Date(NOW - 30 * 60_000), NOW), 'FRESH');
  assert.equal(freshnessAt(new Date(NOW - 30 * 60_000 - 1), NOW), 'STALE');
  assert.equal(freshnessAt(new Date(NOW - 120 * 60_000), NOW), 'STALE');
  assert.equal(freshnessAt(new Date(NOW - 120 * 60_000 - 1), NOW), 'OBSOLETE');
});

test('UE-T07 normalizes known units, preserves zero and distinguishes missing/invalid values', () => {
  const result = normalizeEcowittSnapshot(payload(), NOW);
  assert.equal(result.ok, true);
  assert.equal(result.values.temp_c, 0);
  assert.equal(result.values.taxa_pluja_mm_h, 0);
  assert.equal(result.values.vent_ms, 10);
  assert.equal(result.values.humitat_pct, null);
  assert.equal(result.values.vent_direccio_graus, null);
  assert.equal(result.quality.fields.temp_c, 'VALID');
  assert.equal(result.quality.fields.humitat_pct, 'MISSING');
  assert.equal(result.quality.fields.vent_direccio_graus, 'OUT_OF_RANGE');
});

test('UE-T07 rejects absent and more-than-five-minute future observation times', () => {
  assert.deepEqual(normalizeEcowittSnapshot({ data: payload().data }, NOW), {
    ok: false, error: 'INVALID_TIMESTAMP',
  });
  assert.equal(normalizeEcowittSnapshot(payload((NOW.getTime() + 5 * 60_000) / 1000), NOW).ok, true);
  assert.deepEqual(normalizeEcowittSnapshot(payload((NOW.getTime() + 5 * 60_000 + 1000) / 1000), NOW), {
    ok: false, error: 'FUTURE_TIMESTAMP',
  });
});

test('UE-T07 bounds provider responses before JSON parsing', async () => {
  const credentials = {
    configuration: ECOWITT_CONFIGURATION,
    secrets: { application_key: 'app', api_key: 'api', mac: 'AA:BB:CC' },
  };
  const fetched = await fetchEcowittConnector(credentials, async () => ({
    ok: true,
    status: 200,
    headers: { get: (name) => name === 'content-length' ? String(2 * 1024 * 1024 + 1) : null },
    async text() { throw new Error('body must not be read'); },
  }));
  assert.deepEqual(fetched, { ok: false, reason: 'response_too_large', http: null, payload: null });
});

test('UE-T07 classifies timeout, rate limit and upstream 5xx without exposing response bodies', async () => {
  const credentials = {
    configuration: ECOWITT_CONFIGURATION,
    secrets: { application_key: 'app', api_key: 'api', mac: 'AA:BB:CC' },
  };
  const timeout = await fetchEcowittConnector(credentials, async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
  }), 1);
  assert.deepEqual(timeout, { ok: false, reason: 'timeout', http: null, payload: null });
  for (const status of [429, 503]) {
    const result = await fetchEcowittConnector(credentials, async () => ({ ok: false, status }));
    assert.deepEqual(result, { ok: false, reason: `http_${status}`, http: status, payload: null });
  }
});
