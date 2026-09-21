'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { makeConnectorRegistryService } = require('../../services/connectorRegistryService');
const { makeSnapshotService } = require('../../services/snapshotService');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260920-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');
const NOW = new Date('2026-09-20T12:00:00.000Z');

function providerResponse(body, status = 200, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    async text() { return JSON.stringify(body); },
  };
}

async function ownerAndStation(pool, suffix) {
  const owner = await pool.query(`
    INSERT INTO auth.usuaris(email,nom,actiu,account_status,email_verified_at,approved_at)
    VALUES ($1,$1,true,'APPROVED',now(),now()) RETURNING id
  `, [`snapshot-${suffix}@example.invalid`]);
  const station = await pool.query(`
    INSERT INTO meteo.estacions(codi,nom,owner_id,creat_per_usuari,management_kind,lifecycle,visibility)
    VALUES ($1,$2,$3,$3,'USER','DRAFT','PRIVATE') RETURNING id,public_id
  `, [`snapshot-${suffix}`, `Snapshot ${suffix}`, owner.rows[0].id]);
  return { ownerId: owner.rows[0].id, ...station.rows[0] };
}

test('UE-T07 stores isolated current snapshots with leases and preserves last good data', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_snapshots' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    try {
      const a = await ownerAndStation(pool, 'a');
      const b = await ownerAndStation(pool, 'b');
      const registry = makeConnectorRegistryService({
        pool, keyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 7) } },
      });
      assert.ok((await registry.setEcowitt(a.ownerId, a.public_id, {
        application_key: 'app-a', api_key: 'api-a', mac: 'AA:AA:AA',
      })).connector);
      assert.ok((await registry.setEcowitt(b.ownerId, b.public_id, {
        application_key: 'app-b', api_key: 'api-b', mac: 'BB:BB:BB',
      })).connector);

      const successfulFetch = async (url) => {
        const mac = new URL(url).searchParams.get('mac');
        return providerResponse({
          code: 0,
          time: NOW.getTime() / 1000,
          data: mac === 'AA:AA:AA'
            ? { outdoor: { temperature: { value: '0' }, humidity: { value: null } } }
            : { outdoor: { temperature: { value: '22.5' }, humidity: { value: '51' } } },
        });
      };
      const snapshots = makeSnapshotService({ pool, connectorRegistry: registry, fetch: successfulFetch, clock: () => NOW });
      const refreshed = await snapshots.refreshReadyStations();
      assert.equal(refreshed.stations, 2);
      assert.ok(refreshed.outcomes.every((outcome) => outcome.updated));
      assert.equal((await snapshots.readCurrent(a.id)).item.temp_c, 0);
      assert.equal((await snapshots.readCurrent(a.id)).item.humitat_pct, null);
      assert.equal((await snapshots.readCurrent(b.id)).item.temp_c, 22.5);

      const stored = await pool.query(`
        SELECT b.station_id,s.values_json,s.provider_error
        FROM meteo.current_snapshots s JOIN meteo.source_bindings b ON b.id=s.binding_id
        ORDER BY b.station_id
      `);
      assert.equal(stored.rowCount, 2);
      assert.equal(stored.rows[0].values_json.temp_c, 0);
      assert.equal(stored.rows[1].values_json.temp_c, 22.5);
      assert.equal((await pool.query('SELECT count(*)::int AS total FROM meteo.mesures')).rows[0].total, 0);
      const states = await pool.query('SELECT lifecycle,visibility FROM meteo.estacions WHERE id=ANY($1) ORDER BY id', [[a.id, b.id]]);
      assert.deepEqual(states.rows, [
        { lifecycle: 'ACTIVE', visibility: 'PRIVATE' },
        { lifecycle: 'ACTIVE', visibility: 'PRIVATE' },
      ]);

      const lock = await pool.connect();
      try {
        await lock.query('SELECT pg_advisory_lock($1,$2)', [71013, a.id]);
        assert.deepEqual(await snapshots.refreshStation(a.id), { skipped: true, reason: 'lease_busy' });
      } finally {
        await lock.query('SELECT pg_advisory_unlock($1,$2)', [71013, a.id]);
        lock.release();
      }

      const failing = makeSnapshotService({
        pool, connectorRegistry: registry,
        fetch: async () => providerResponse({ code: 429 }, 429),
        clock: () => new Date(NOW.getTime() + 15 * 60_000),
      });
      assert.equal((await failing.refreshStation(a.id)).error, 'HTTP_429');
      const afterError = await failing.readCurrent(a.id);
      assert.equal(afterError.item.temp_c, 0);
      assert.equal(afterError.source.error, 'HTTP_429');
      assert.equal(new Date(afterError.source.observed_at).toISOString(), NOW.toISOString());

      const future = makeSnapshotService({
        pool, connectorRegistry: registry,
        fetch: async () => providerResponse({
          code: 0, time: (NOW.getTime() + 6 * 60_000) / 1000,
          data: { outdoor: { temperature: { value: '99' } } },
        }),
        clock: () => NOW,
      });
      assert.equal((await future.refreshStation(b.id)).error, 'FUTURE_TIMESTAMP');
      const afterFuture = await future.readCurrent(b.id);
      assert.equal(afterFuture.item.temp_c, 22.5);
      assert.equal(afterFuture.source.error, 'FUTURE_TIMESTAMP');
    } finally {
      await pool.end();
    }
  });
});
