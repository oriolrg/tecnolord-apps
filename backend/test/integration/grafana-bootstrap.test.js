'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const inventory = require('../../../config/meteolord/grafana-local-station.json');
const { bootstrapLocalGrafana } = require('../../scripts/bootstrap-local-grafana');

const enabled = process.env.G03_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.G03_RUN_ID || '20260923-120000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');

async function prepared(suffix, callback) {
  return testDb.withTestDatabase({ runId, suffix }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    try {
      const admin = await pool.query(`
        INSERT INTO auth.usuaris(email,nom,actiu,account_status,application_role,email_verified_at,approved_at)
        VALUES ('g03-admin@example.invalid','G03 Admin',true,'APPROVED','SUPERADMIN',now(),now()) RETURNING id
      `);
      const user = await pool.query(`
        INSERT INTO auth.usuaris(email,nom,actiu,account_status,application_role,email_verified_at,approved_at)
        VALUES ('g03-user@example.invalid','G03 User',true,'APPROVED','USER',now(),now()) RETURNING id
      `);
      await callback(pool, admin.rows[0].id, user.rows[0].id);
    } finally { await pool.end(); }
  });
}

test('G03 dry-run, apply and repeat create one private admin station without side effects', {
  skip: !enabled, timeout: 120000,
}, async () => prepared('g03happy', async (pool, adminId, userId) => {
  assert.deepEqual(await bootstrapLocalGrafana({ pool, actorId: userId, inventory }), {
    status: 'FORBIDDEN_ACTOR',
  });
  assert.deepEqual(await bootstrapLocalGrafana({ pool, actorId: 999999, inventory }), {
    status: 'FORBIDDEN_ACTOR',
  });
  const measuresBefore = Number((await pool.query('SELECT count(*) AS total FROM meteo.mesures')).rows[0].total);
  const dryRun = await bootstrapLocalGrafana({ pool, actorId: adminId, inventory });
  assert.equal(dryRun.status, 'DRY_RUN');
  assert.deepEqual(dryRun.dry_run.counts, { validated: 1 });
  assert.equal(dryRun.dry_run.rows[0].action, 'CREATE');
  assert.equal((await pool.query("SELECT count(*)::int AS total FROM meteo.estacions WHERE codi='GRAFANA_LOCAL_001'")).rows[0].total, 0);

  const applied = await bootstrapLocalGrafana({ pool, actorId: adminId, inventory, apply: true });
  assert.equal(applied.status, 'APPLIED');
  const repeated = await bootstrapLocalGrafana({ pool, actorId: adminId, inventory, apply: true });
  assert.equal(repeated.status, 'ALREADY_PRESENT');
  assert.equal(repeated.station.public_id, applied.station.public_id);

  const station = await pool.query(`
    SELECT e.id,e.public_id,e.codi,e.management_kind,e.visibility,l.private_geometry,l.public_geometry,
      b.source_namespace,b.external_id,b.binding_status
    FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
    JOIN meteo.station_locations l ON l.station_id=e.id WHERE e.codi='GRAFANA_LOCAL_001'
  `);
  assert.equal(station.rowCount, 1);
  assert.equal(station.rows[0].management_kind, 'ADMIN');
  assert.equal(station.rows[0].visibility, 'PRIVATE');
  assert.equal(station.rows[0].source_namespace, 'GRAFANA');
  assert.equal(station.rows[0].external_id, 'Meteo-001-3100044');
  assert.equal(station.rows[0].binding_status, 'VALIDATED');
  assert.equal(station.rows[0].private_geometry, null);
  assert.equal(station.rows[0].public_geometry, null);
  const stationId = station.rows[0].id;
  assert.equal((await pool.query(`
    SELECT count(*)::int AS total FROM meteo.current_snapshots s
    JOIN meteo.source_bindings b ON b.id=s.binding_id WHERE b.station_id=$1
  `, [stationId])).rows[0].total, 0);
  assert.equal((await pool.query('SELECT count(*)::int AS total FROM meteo.mesures WHERE estacio_id=$1', [stationId])).rows[0].total, 0);
  assert.equal((await pool.query('SELECT count(*)::int AS total FROM meteo.station_history_policies WHERE station_id=$1', [stationId])).rows[0].total, 0);
  assert.equal(Number((await pool.query('SELECT count(*) AS total FROM meteo.mesures')).rows[0].total), measuresBefore);
}));

test('G03 refuses an external identifier already bound to another station', {
  skip: !enabled, timeout: 120000,
}, async () => prepared('g03ext', async (pool, adminId) => {
  const blocker = await pool.query(`
    INSERT INTO meteo.estacions(codi,nom,management_kind,lifecycle,visibility)
    VALUES ('G03_OTHER','Altra estació','ADMIN','ACTIVE','PRIVATE') RETURNING id
  `);
  await pool.query(`
    INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status,evidence_ref)
    VALUES ($1,'GRAFANA','Meteo-001-3100044','VALIDATED','g03-conflict')
  `, [blocker.rows[0].id]);
  const result = await bootstrapLocalGrafana({ pool, actorId: adminId, inventory, apply: true });
  assert.equal(result.status, 'CONFLICT');
  assert.equal(result.conflicts[0].issue_code, 'EXTERNAL_ID_ALREADY_BOUND');
  assert.equal((await pool.query("SELECT count(*)::int AS total FROM meteo.estacions WHERE codi='GRAFANA_LOCAL_001'")).rows[0].total, 0);
}));

test('G03 refuses an incompatible existing station code', {
  skip: !enabled, timeout: 120000,
}, async () => prepared('g03code', async (pool, adminId) => {
  await pool.query(`
    INSERT INTO meteo.estacions(codi,nom,management_kind,lifecycle,visibility)
    VALUES ('GRAFANA_LOCAL_001','Estació incompatible','LEGACY','ACTIVE','PRIVATE')
  `);
  const result = await bootstrapLocalGrafana({ pool, actorId: adminId, inventory, apply: true });
  assert.equal(result.status, 'CONFLICT');
  assert.equal(result.conflicts[0].issue_code, 'STATION_CODE_ALREADY_USED');
  assert.equal((await pool.query("SELECT count(*)::int AS total FROM meteo.source_bindings WHERE source_namespace='GRAFANA'")).rows[0].total, 0);
}));
