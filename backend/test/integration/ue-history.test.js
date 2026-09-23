'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { makeStationHistoryService } = require('../../services/stationHistoryService');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260923-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');
const NOW = new Date('2026-09-23T12:00:00.000Z');

async function user(pool, suffix) {
  const result = await pool.query(`
    INSERT INTO auth.usuaris(email,nom,actiu,account_status,email_verified_at,approved_at)
    VALUES ($1,$2,true,'APPROVED',now(),now()) RETURNING id
  `, [`history-${suffix}@example.invalid`, `History ${suffix}`]);
  return result.rows[0].id;
}

async function station(pool, ownerId, suffix, managementKind = 'USER', connectorType = null) {
  const created = await pool.query(`
    INSERT INTO meteo.estacions(codi,nom,owner_id,creat_per_usuari,management_kind,lifecycle,visibility)
    VALUES ($1,$2,$3,$3,$4,'ACTIVE','PRIVATE') RETURNING id,public_id
  `, [`history-${suffix}`, `History ${suffix}`, managementKind === 'USER' ? ownerId : null, managementKind]);
  const item = created.rows[0];
  if (connectorType) {
    await pool.query(`INSERT INTO meteo.station_connectors(station_id,connector_type,enabled,status)
      VALUES ($1,$2,true,'READY')`, [item.id, connectorType]);
  }
  const binding = await pool.query(`
    INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status)
    VALUES ($1,$2,$3,'VALIDATED') RETURNING id
  `, [item.id, connectorType || 'METEOLORD', `history-${suffix}-external`]);
  return { ...item, bindingId: binding.rows[0].id };
}

async function snapshot(pool, item, observedAt, values = { temp_c: 12.5, humitat_pct: 60 }) {
  await pool.query(`
    INSERT INTO meteo.current_snapshots(binding_id,observed_at,received_at,fetched_at,values_json,quality_json)
    VALUES ($1,$2,$2,$2,$3,'{}')
    ON CONFLICT(binding_id) DO UPDATE SET observed_at=$2,received_at=$2,fetched_at=$2,
      values_json=$3,quality_json='{}',provider_error=NULL
  `, [item.bindingId, observedAt, JSON.stringify(values)]);
}

async function measure(pool, stationId, observedAt, temp = 1) {
  await pool.query('INSERT INTO meteo.mesures(estacio_id,instant,temp_c) VALUES ($1,$2,$3)',
    [stationId, observedAt, temp]);
}

async function count(pool, stationId) {
  return Number((await pool.query('SELECT count(*) AS total FROM meteo.mesures WHERE estacio_id=$1', [stationId])).rows[0].total);
}

test('UE-T17 isolates capture and retention policies, preserves legacy data and rolls failed purges back', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_history' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    try {
      const actorId = await user(pool, 'admin');
      const ownerId = await user(pool, 'owner');
      const a = await station(pool, ownerId, 'a', 'USER', 'ECOWITT');
      const b = await station(pool, ownerId, 'b', 'USER', 'GRAFANA');
      const c = await station(pool, ownerId, 'c');
      const legacy = await station(pool, ownerId, 'legacy', 'LEGACY');
      await snapshot(pool, a, '2026-09-23T11:55:00.000Z', { temp_c: 0, humitat_pct: 55 });
      await snapshot(pool, b, '2026-09-23T11:30:00.000Z', { temp_c: 20.5, humitat_pct: 45 });
      await snapshot(pool, c, '2026-09-23T11:55:00.000Z', { temp_c: 9 });

      const service = makeStationHistoryService({ pool, clock: () => NOW });
      assert.deepEqual(await service.update(actorId, a.public_id, {
        enabled: true, capture_interval_minutes: 5, retention_days: 30, revision: 0,
      }), { interval: true, minimum: 15 });
      assert.equal((await service.update(actorId, a.public_id, {
        enabled: true, capture_interval_minutes: 15, retention_days: 30, revision: 0,
      })).policy.revision, 1);
      assert.equal((await service.update(actorId, b.public_id, {
        enabled: true, capture_interval_minutes: 60, retention_days: 90, revision: 0,
      })).policy.revision, 1);

      const legacyOld = '2026-08-01T00:00:00.000Z';
      await measure(pool, legacy.id, legacyOld, 7);
      assert.deepEqual(await service.update(actorId, legacy.public_id, {
        enabled: true, capture_interval_minutes: 15, retention_days: 30, revision: 0,
      }), { previewRequired: true });
      assert.equal(await count(pool, legacy.id), 1);
      const preview = await service.preview(actorId, legacy.public_id, 30);
      assert.equal(preview.delete_count, 1);
      assert.equal((await service.update(actorId, legacy.public_id, {
        enabled: true, capture_interval_minutes: 15, retention_days: 30, revision: 0,
      })).policy.revision, 1);
      assert.equal(await count(pool, legacy.id), 1, 'policy upgrade must not delete legacy history');

      const cutoffA = '2026-08-24T12:00:00.000Z';
      await measure(pool, a.id, '2026-08-24T11:59:59.999Z', -1);
      await measure(pool, a.id, cutoffA, 0);
      await measure(pool, a.id, '2026-08-24T12:00:00.001Z', 1);
      await measure(pool, b.id, '2026-01-01T00:00:00.000Z', 2);

      const captures = await service.captureDue();
      assert.equal(captures.find((item) => item.station_id === a.id).inserted, true);
      assert.equal(captures.find((item) => item.station_id === b.id).inserted, true);
      assert.equal(captures.some((item) => item.station_id === c.id), false, 'station without policy is snapshot-only');
      assert.equal(await count(pool, c.id), 0);
      await pool.query('UPDATE meteo.station_history_policies SET last_capture_at=NULL WHERE station_id=$1', [a.id]);
      assert.deepEqual(await service.captureStation(a.id), { skipped: false, inserted: false });
      assert.equal(Number((await pool.query(`SELECT count(*) AS total FROM meteo.mesures
        WHERE estacio_id=$1 AND instant='2026-09-23T11:55:00.000Z'`, [a.id])).rows[0].total), 1);

      const lock = await pool.connect();
      try {
        await lock.query('SELECT pg_advisory_lock($1,$2)', [71017, a.id]);
        assert.deepEqual(await service.captureStation(a.id), { skipped: true, reason: 'lease_busy' });
      } finally {
        await lock.query('SELECT pg_advisory_unlock($1,$2)', [71017, a.id]);
        lock.release();
      }

      await snapshot(pool, b, '2026-09-22T00:00:00.000Z', { temp_c: 99 });
      await pool.query('UPDATE meteo.station_history_policies SET last_capture_at=NULL WHERE station_id=$1', [b.id]);
      assert.deepEqual(await service.captureStation(b.id), { skipped: true, reason: 'no_recent_data' });
      assert.equal(Number((await pool.query('SELECT count(*) AS total FROM meteo.mesures WHERE estacio_id=$1 AND temp_c=99', [b.id])).rows[0].total), 0);

      const purgedA = await service.purgeStation(a.id);
      assert.equal(purgedA.deleted, 1);
      assert.equal(purgedA.cutoff, cutoffA);
      const boundary = await pool.query('SELECT instant FROM meteo.mesures WHERE estacio_id=$1 ORDER BY instant', [a.id]);
      assert.equal(new Date(boundary.rows[0].instant).toISOString(), cutoffA, 'the exact cutoff is retained');
      assert.equal(await count(pool, b.id), 2, 'station A purge must not affect B');

      const aPolicy = (await service.list()).find((item) => item.station.id === a.public_id).policy;
      await service.update(actorId, a.public_id, {
        enabled: false, capture_interval_minutes: 15, retention_days: 30, revision: aPolicy.revision,
      });
      await measure(pool, a.id, '2025-01-01T00:00:00.000Z', 3);
      const beforeDisabledPurge = await count(pool, a.id);
      assert.deepEqual(await service.purgeStation(a.id), { skipped: true, reason: 'policy_unavailable' });
      assert.equal(await count(pool, a.id), beforeDisabledPurge, 'disabling must never delete history');

      await pool.query(`CREATE FUNCTION meteo.fail_history_purge() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN IF OLD.estacio_id=${b.id} THEN RAISE EXCEPTION 'synthetic purge failure'; END IF; RETURN OLD; END $$`);
      await pool.query(`CREATE TRIGGER fail_history_purge BEFORE DELETE ON meteo.mesures
        FOR EACH ROW EXECUTE FUNCTION meteo.fail_history_purge()`);
      const beforeFailure = await count(pool, b.id);
      await assert.rejects(() => service.purgeStation(b.id), /synthetic purge failure/);
      assert.equal(await count(pool, b.id), beforeFailure, 'failed purge must roll back completely');
      const dueAfterFailure = await service.purgeDue();
      assert.deepEqual(dueAfterFailure.find((item) => item.station_id === b.id), {
        station_id: b.id, skipped: true, failed: true, reason: 'purge_failed',
      });
      assert.equal(dueAfterFailure.find((item) => item.station_id === legacy.id).deleted, 1,
        'one failed station must not block the following station');
      assert.equal(await count(pool, legacy.id), 0);
      await pool.query('DROP TRIGGER fail_history_purge ON meteo.mesures');
      await pool.query('DROP FUNCTION meteo.fail_history_purge()');
      assert.equal(Number((await pool.query("SELECT count(*) AS total FROM meteo.audit_events WHERE action='HISTORY_POLICY_UPDATED'")).rows[0].total), 4);
    } finally {
      await pool.end();
    }
  });
});
