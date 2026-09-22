'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../../server');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260921-000000-0000000';
const migrationsDir = path.resolve(__dirname, '../../db/migrations');
const NOW = new Date('2026-09-21T12:00:00Z');
const EXPECTED = ['andorra', 'berga', 'la-seu-durgell', 'manresa', 'solsona', 'vic'];

function response() {
  const body = EXPECTED.map((_, index) => ({ current: {
    time: '2026-09-21T11:45', temperature_2m: index === 0 ? 0 : 10 + index,
    relative_humidity_2m: 60, apparent_temperature: 9, precipitation: 0,
    pressure_msl: 1015, wind_speed_10m: 1, wind_direction_10m: 180, wind_gusts_10m: 2, uv_index: 1,
  } }));
  const encoded = Buffer.from(JSON.stringify(body));
  return { ok: true, headers: { get() { return String(encoded.length); } }, async arrayBuffer() { return encoded; } };
}

test('UE-T15 migrates exactly six estimates and exposes them without creating physical stations', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_estimate' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    const calls = [];
    const app = createApp({
      environment: { METEOLORD_ENV: 'test' }, pool, clock: () => NOW,
      httpClient: async (url) => { calls.push(String(url)); return response(); },
      connectorKeyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 15) } },
      accessLogStream: { write() {} },
    });
    const server = await new Promise((resolve) => { const active = app.listen(0, '127.0.0.1', () => resolve(active)); });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const list = await fetch(`${base}/api/v1/estimations`).then((result) => result.json());
      assert.deepEqual(list.items.map((item) => item.slug), EXPECTED);
      assert.equal(list.items.find((item) => item.slug === 'andorra').reference.label, 'Andorra la Vella');
      const stationCount = await pool.query('SELECT count(*)::int AS count FROM meteo.estacions');
      assert.equal(stationCount.rows[0].count, 0);
      const map = await fetch(`${base}/api/v1/map/stations`).then((result) => result.json());
      assert.equal(map.features.length, 6);
      assert.ok(map.features.every((feature) => feature.properties.resource_kind === 'ESTIMATION'));
      assert.equal(map.features.find((feature) => feature.properties.public_name === 'Andorra').properties.reference_label, 'Andorra la Vella');
      const current = await fetch(`${base}/api/v1/estimations/${list.items[0].id}/current`).then((result) => result.json());
      assert.equal(current.items[0].temp_c, 0);
      assert.equal(calls.length, 1, 'map/current must share the 120 second cache');
    } finally { await new Promise((resolve) => server.close(resolve)); await pool.end(); }
  });
});
