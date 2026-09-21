'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../../server');
const { hashPassword } = require('../../services/identityService');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260920-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');
const PASSWORD = 'synthetic-admin-catalog-passphrase';

async function account(pool, suffix, role = 'USER') {
  const result = await pool.query(`
    INSERT INTO auth.usuaris(
      email,nom,actiu,account_status,application_role,email_verified_at,approved_at
    ) VALUES ($1,$2,true,'APPROVED',$3,now(),now()) RETURNING id,email
  `, [`admin-catalog-${suffix}@example.invalid`, `Usuari ${suffix}`, role]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    result.rows[0].id, await hashPassword(PASSWORD),
  ]);
  return result.rows[0];
}

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

const INITIAL = Object.freeze({
  name: 'Granja administrada', description: 'Catàleg sintètic', source_namespace: 'METEOLORD',
  external_id: 'meteolord-admin-synthetic-1', longitude: 1.552123, latitude: 42.137234,
  accuracy_m: 25, provenance: 'SOURCE_DOCUMENT', reference_label: 'inventari-sintètic-1',
});

test('UE-T11 persists managed corrections, blocks USER mutations and keeps exact coordinates private', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_admincat' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    const admin = await account(pool, 'admin', 'SUPERADMIN');
    const owner = await account(pool, 'owner');
    const userStation = await pool.query(`
      INSERT INTO meteo.estacions(codi,nom,owner_id,creat_per_usuari,management_kind,lifecycle,visibility)
      VALUES ('user-foreign','Usuari aliena',$1,$1,'USER','ACTIVE','PRIVATE') RETURNING public_id
    `, [owner.id]);
    const app = createApp({
      environment: { METEOLORD_ENV: 'test' }, pool,
      connectorKeyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 11) } },
      clock: () => new Date('2026-09-20T12:00:00Z'), accessLogStream: { write() {} },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const adminSession = await login(base, admin.email);
      const ownerSession = await login(base, owner.email);
      assert.equal((await request(base, '/api/v1/admin/external-stations', { session: ownerSession })).response.status, 403);
      assert.equal((await request(base, '/api/v1/admin/external-stations', {
        method: 'POST', session: adminSession, body: { ...INITIAL, longitude: 200 },
      })).response.status, 400);
      const created = await request(base, '/api/v1/admin/external-stations', {
        method: 'POST', session: adminSession, body: INITIAL,
      });
      assert.equal(created.response.status, 201, JSON.stringify(created.body));
      const managedId = created.body.station.id;
      assert.equal(created.body.station.visibility, 'PRIVATE');
      assert.equal(created.body.station.location.publication_mode, 'HIDDEN');
      assert.equal(created.body.station.location.longitude, INITIAL.longitude);
      assert.equal((await request(base, '/api/v1/admin/external-stations', {
        method: 'POST', session: adminSession, body: { ...INITIAL, name: 'Duplicada' },
      })).response.status, 409);
      assert.equal((await request(base, `/api/v1/admin/external-stations/${userStation.rows[0].public_id}`, {
        method: 'PUT', session: adminSession, body: { ...INITIAL, revision: 0 },
      })).response.status, 404, 'an admin mutated a USER station through the managed catalog');

      const internal = await pool.query(`
        SELECT e.id,b.id AS binding_id FROM meteo.estacions e
        JOIN meteo.source_bindings b ON b.station_id=e.id WHERE e.public_id=$1
      `, [managedId]);
      await pool.query("UPDATE meteo.estacions SET visibility='PUBLIC' WHERE id=$1", [internal.rows[0].id]);
      await pool.query(`
        UPDATE meteo.station_locations SET publication_mode='APPROX_100M',public_geometry=private_geometry
        WHERE station_id=$1
      `, [internal.rows[0].id]);
      await pool.query(`
        INSERT INTO meteo.current_snapshots(binding_id,observed_at,values_json,quality_json)
        VALUES ($1,'2026-09-20T11:59:00Z',$2::jsonb,'{}'::jsonb)
      `, [internal.rows[0].binding_id, JSON.stringify({ temp_c: 13.5, humitat_pct: 71 })]);

      const correctedBody = {
        ...INITIAL, name: 'Granja corregida', longitude: 1.553987, latitude: 42.138765,
        accuracy_m: 5, provenance: 'FIELD_SURVEY', reference_label: 'acta-camp-sintètica', revision: 0,
      };
      const corrected = await request(base, `/api/v1/admin/external-stations/${managedId}`, {
        method: 'PUT', session: adminSession, body: correctedBody,
      });
      assert.equal(corrected.response.status, 200, JSON.stringify(corrected.body));
      assert.equal(corrected.body.station.revision, 1);
      assert.equal(corrected.body.station.location.longitude, correctedBody.longitude);
      assert.deepEqual(corrected.body.station.override_fields, [
        'accuracy_m', 'latitude', 'longitude', 'name', 'provenance', 'reference_label',
      ]);
      assert.equal((await request(base, `/api/v1/admin/external-stations/${managedId}`, {
        method: 'PUT', session: adminSession, body: { ...correctedBody, revision: 0 },
      })).response.status, 409);

      const publicMap = await request(base, '/api/v1/map/stations');
      assert.equal(publicMap.response.status, 200);
      const publicFeature = publicMap.body.features.find((feature) => feature.id === managedId);
      assert.ok(publicFeature);
      assert.notDeepEqual(publicFeature.geometry.coordinates, [correctedBody.longitude, correctedBody.latitude]);
      assert.equal(publicFeature.properties.provenance.source, 'METEOLORD');
      assert.equal(publicFeature.properties.provenance.licence_or_legal_basis_ref, 'acta-camp-sintètica');
      assert.equal(publicFeature.properties.sensors[0].sensor_id, 'meteolord-outdoor');
      const adminMap = await request(base, '/api/v1/admin/map', { session: adminSession });
      const exactFeature = adminMap.body.features.find((feature) => feature.id === managedId);
      assert.deepEqual(exactFeature.geometry.coordinates, [correctedBody.longitude, correctedBody.latitude]);
      assert.equal(exactFeature.properties.access_scope, 'ADMIN');

      const overrides = await pool.query(`
        SELECT field_key,value_json,changed_by FROM meteo.manual_overrides
        WHERE station_id=$1 ORDER BY field_key
      `, [internal.rows[0].id]);
      assert.equal(overrides.rowCount, 6);
      assert.ok(overrides.rows.every((row) => String(row.changed_by) === String(admin.id)));
      assert.deepEqual(overrides.rows.find((row) => row.field_key === 'longitude').value_json,
        { value: correctedBody.longitude, origin: 'ADMIN_CORRECTION' });
      const audit = await pool.query(`
        SELECT action,details FROM meteo.audit_events WHERE resource_id=$1 ORDER BY id
      `, [managedId]);
      assert.deepEqual(audit.rows.map((row) => row.action), ['ADMIN_STATION_CREATED', 'ADMIN_STATION_CORRECTED']);
      assert.equal(JSON.stringify(audit.rows[1].details).includes(String(correctedBody.longitude)), false);
      assert.deepEqual([...audit.rows[1].details.fields].sort(), corrected.body.station.override_fields);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  });
});
