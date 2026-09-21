'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../../server');
const { hashPassword } = require('../../services/identityService');
const fixture = require('../fixtures/ue-import-synthetic.json');

const enabled = process.env.T13_INTEGRATION === '1' || process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.T13_RUN_ID || process.env.UE_RUN_ID || '20260921-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');
const PASSWORD = 'synthetic-import-passphrase';

async function request(base, route, { method = 'GET', session, body } = {}) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: { origin: base, ...(session ? { cookie: session.cookie, 'x-csrf-token': session.csrf } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
}

async function login(base, email) {
  const result = await request(base, '/api/v1/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
  assert.equal(result.response.status, 200, JSON.stringify(result.body));
  return { cookie: result.response.headers.get('set-cookie').split(';')[0], csrf: result.body.csrf_token };
}

function row(code, externalId, name = `Sintètica ${code}`) {
  return {
    inventory_code: code, name, description: 'Fixture inventada', external_id: externalId,
    mapping_status: 'VERIFIED', longitude: 1.61, latitude: 42.21, accuracy_m: 20,
    evidence_ref: 'fixture-rollback-v1',
  };
}

test('UE-T13 is repeatable, quarantines uncertain rows, detects conflicts and rolls back atomically', {
  skip: !enabled, timeout: 120000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_imports' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database, max: 12 });
    const admin = await pool.query(`
      INSERT INTO auth.usuaris(email,nom,actiu,account_status,application_role,email_verified_at,approved_at)
      VALUES ('imports-admin@example.invalid','Admin importacions',true,'APPROVED','SUPERADMIN',now(),now())
      RETURNING id,email
    `);
    await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
      admin.rows[0].id, await hashPassword(PASSWORD),
    ]);
    const app = createApp({
      environment: { METEOLORD_ENV: 'test' }, pool,
      connectorKeyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 13) } },
      clock: () => new Date('2026-09-21T12:00:00Z'), accessLogStream: { write() {} },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const session = await login(base, admin.rows[0].email);
      const dryRun = () => request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: fixture,
      });
      const [first, concurrent] = await Promise.all([dryRun(), dryRun()]);
      assert.deepEqual([first.response.status, concurrent.response.status].sort(), [200, 201]);
      assert.equal(first.body.batch.id, concurrent.body.batch.id);
      assert.deepEqual(first.body.batch.counts, { validated: 2, quarantined: 2 });
      assert.equal(first.body.batch.rows.find((item) => item.inventory_code === 'TEST01').issue_code, 'TEST_STATION');
      assert.equal(first.body.batch.rows.find((item) => item.inventory_code === 'SYNBAD').issue_code, 'MAPPING_UNVERIFIED');

      const applied = await request(base, `/api/v1/admin/imports/${first.body.batch.id}/apply`, { method: 'POST', session });
      assert.equal(applied.response.status, 200, JSON.stringify(applied.body));
      assert.equal(applied.body.batch.status, 'APPLIED');
      assert.deepEqual(applied.body.batch.counts, { applied: 2, quarantined: 2 });
      const stations = await pool.query(`
        SELECT e.id,e.nom,b.external_id,public.ST_X(l.private_geometry) AS longitude
        FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
        JOIN meteo.station_locations l ON l.station_id=e.id
        WHERE e.codi LIKE 'imp-grafana-syn%' ORDER BY e.codi
      `);
      assert.equal(stations.rowCount, 2, 'similar names and coordinates were merged');
      assert.equal(stations.rows[0].nom, stations.rows[1].nom);
      assert.notEqual(stations.rows[0].external_id, stations.rows[1].external_id);

      const repeated = await dryRun();
      assert.equal(repeated.response.status, 200);
      assert.equal(repeated.body.idempotent, true);
      assert.equal((await pool.query("SELECT count(*)::int AS count FROM meteo.estacions WHERE codi LIKE 'imp-grafana-syn%'" )).rows[0].count, 2);

      const renamedInventory = structuredClone(fixture);
      renamedInventory.rows.find((item) => item.inventory_code === 'SYN001').name = 'Estació sintètica reanomenada';
      const renamedStage = await request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: renamedInventory,
      });
      const renamedRow = renamedStage.body.batch.rows.find((item) => item.inventory_code === 'SYN001');
      assert.equal(renamedRow.status, 'VALIDATED');
      assert.equal(renamedRow.action, 'UPDATE');
      assert.deepEqual(renamedRow.candidate._changes, ['name']);
      assert.equal((await request(base, `/api/v1/admin/imports/${renamedStage.body.batch.id}/apply`, {
        method: 'POST', session,
      })).response.status, 200);

      const duplicateInventory = structuredClone(renamedInventory);
      duplicateInventory.rows.find((item) => item.inventory_code === 'SYN002').external_id = 'Meteo-901-9000001';
      const duplicate = await request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: duplicateInventory,
      });
      assert.equal(duplicate.response.status, 201);
      assert.equal(duplicate.body.batch.rows.filter((item) => item.issue_code === 'DUPLICATE_EXTERNAL_ID').length, 2);

      const changedIdInventory = structuredClone(renamedInventory);
      changedIdInventory.rows.find((item) => item.inventory_code === 'SYN002').external_id = 'Meteo-904-9000004';
      const changedId = await request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: changedIdInventory,
      });
      assert.equal(changedId.body.batch.rows.find((item) => item.inventory_code === 'SYN002').issue_code, 'SOURCE_ID_CHANGED');

      const correctedStation = (await pool.query(`
        SELECT e.id,e.revision FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
        WHERE b.source_namespace='GRAFANA' AND b.external_id='Meteo-901-9000001'
      `)).rows[0];
      await pool.query(`
        UPDATE meteo.station_locations SET private_geometry=public.ST_SetSRID(public.ST_MakePoint(1.5599,42.1399),4326),
          revision=revision+1 WHERE station_id=$1
      `, [correctedStation.id]);
      await pool.query('UPDATE meteo.estacions SET revision=revision+1 WHERE id=$1', [correctedStation.id]);
      for (const [field, value] of [['longitude', 1.5599], ['latitude', 42.1399]]) {
        await pool.query(`
          INSERT INTO meteo.manual_overrides(station_id,field_key,value_json,changed_by)
          VALUES ($1,$2,$3::jsonb,$4)
        `, [correctedStation.id, field, JSON.stringify({ value, origin: 'ADMIN_CORRECTION' }), admin.rows[0].id]);
      }
      const correctionConflictInventory = structuredClone(renamedInventory);
      correctionConflictInventory.rows.find((item) => item.inventory_code === 'SYN001').longitude = 1.5502;
      const correctionConflict = await request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: correctionConflictInventory,
      });
      assert.equal(correctionConflict.body.batch.rows.find((item) => item.inventory_code === 'SYN001').issue_code,
        'MANUAL_OVERRIDE_DIVERGENCE');
      const locationAfter = await pool.query('SELECT public.ST_X(private_geometry) AS longitude FROM meteo.station_locations WHERE station_id=$1',
        [correctedStation.id]);
      assert.equal(Number(locationAfter.rows[0].longitude), 1.5599);

      const missingInventory = { source_namespace: 'GRAFANA', rows: [
        renamedInventory.rows.find((item) => item.inventory_code === 'SYN002'),
      ] };
      const missing = await request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: missingInventory,
      });
      const missingRow = missing.body.batch.rows.find((item) => item.inventory_code === 'SYN001');
      assert.equal(missingRow.issue_code, 'MISSING_FROM_BATCH');
      assert.equal((await pool.query('SELECT count(*)::int AS count FROM meteo.estacions WHERE id=$1', [correctedStation.id])).rows[0].count, 1);

      const rollbackInventory = { source_namespace: 'METEOLORD', rows: [row('RB001', 'synthetic:rb1')] };
      const rollbackStage = await request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: rollbackInventory,
      });
      await request(base, `/api/v1/admin/imports/${rollbackStage.body.batch.id}/apply`, { method: 'POST', session });
      const rolledBack = await request(base, `/api/v1/admin/imports/${rollbackStage.body.batch.id}/rollback`, {
        method: 'POST', session,
      });
      assert.equal(rolledBack.response.status, 200, JSON.stringify(rolledBack.body));
      assert.equal(rolledBack.body.batch.status, 'REJECTED');
      assert.equal((await pool.query("SELECT count(*)::int AS count FROM meteo.estacions WHERE codi='imp-meteolord-rb001'" )).rows[0].count, 0);

      const guardedInventory = { source_namespace: 'METEOLORD', rows: [row('RB002', 'synthetic:rb2')] };
      const guardedStage = await request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: guardedInventory,
      });
      await request(base, `/api/v1/admin/imports/${guardedStage.body.batch.id}/apply`, { method: 'POST', session });
      const guardedStation = (await pool.query("SELECT id FROM meteo.estacions WHERE codi='imp-meteolord-rb002'" )).rows[0];
      await pool.query('UPDATE meteo.estacions SET nom=$2,revision=revision+1 WHERE id=$1', [guardedStation.id, 'Correcció manual posterior']);
      await pool.query(`
        INSERT INTO meteo.manual_overrides(station_id,field_key,value_json,changed_by)
        VALUES ($1,'name',$2::jsonb,$3)
      `, [guardedStation.id, JSON.stringify({ value: 'Correcció manual posterior' }), admin.rows[0].id]);
      const guardedRollback = await request(base, `/api/v1/admin/imports/${guardedStage.body.batch.id}/rollback`, {
        method: 'POST', session,
      });
      assert.equal(guardedRollback.response.status, 409);
      assert.equal((await pool.query('SELECT nom FROM meteo.estacions WHERE id=$1', [guardedStation.id])).rows[0].nom,
        'Correcció manual posterior');

      const atomicInventory = { source_namespace: 'METEOLORD', rows: [
        row('RB003', 'synthetic:rb3'), row('RB004', 'synthetic:rb4'),
      ] };
      const atomicStage = await request(base, '/api/v1/admin/imports/dry-run', {
        method: 'POST', session, body: atomicInventory,
      });
      const blocker = await pool.query(`
        INSERT INTO meteo.estacions(codi,nom,management_kind,lifecycle,visibility)
        VALUES ('atomic-blocker','Bloqueig','ADMIN','ACTIVE','PRIVATE') RETURNING id
      `);
      await pool.query(`
        INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status,evidence_ref)
        VALUES ($1,'METEOLORD','synthetic:rb4','VALIDATED','fixture-race')
      `, [blocker.rows[0].id]);
      const atomicApply = await request(base, `/api/v1/admin/imports/${atomicStage.body.batch.id}/apply`, {
        method: 'POST', session,
      });
      assert.equal(atomicApply.response.status, 409);
      assert.equal((await pool.query("SELECT count(*)::int AS count FROM meteo.estacions WHERE codi IN ('imp-meteolord-rb003','imp-meteolord-rb004')" )).rows[0].count, 0);

      const audits = await pool.query("SELECT action FROM meteo.audit_events WHERE resource_kind='IMPORT_BATCH' ORDER BY id");
      assert.ok(audits.rows.some((entry) => entry.action === 'IMPORT_BATCH_APPLIED'));
      assert.ok(audits.rows.some((entry) => entry.action === 'IMPORT_BATCH_ROLLED_BACK'));
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  });
});
