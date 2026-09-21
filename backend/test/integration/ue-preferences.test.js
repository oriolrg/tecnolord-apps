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
const PASSWORD = 'synthetic-preference-passphrase';

async function account(pool, suffix) {
  const result = await pool.query(`
    INSERT INTO auth.usuaris(email,nom,actiu,account_status,email_verified_at,approved_at)
    VALUES ($1,$2,true,'APPROVED',now(),now()) RETURNING id,email
  `, [`preferences-${suffix}@example.invalid`, `Usuari ${suffix.toUpperCase()}`]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    result.rows[0].id, await hashPassword(PASSWORD),
  ]);
  return result.rows[0];
}

async function station(pool, ownerId, suffix, lifecycle = 'ACTIVE', visibility = 'PRIVATE') {
  const result = await pool.query(`
    INSERT INTO meteo.estacions(
      codi,nom,owner_id,creat_per_usuari,management_kind,lifecycle,visibility
    ) VALUES ($1,$2,$3,$3,'USER',$4,$5) RETURNING id,public_id
  `, [`preferences-${suffix}`, `Estació ${suffix.toUpperCase()}`, ownerId, lifecycle, visibility]);
  return result.rows[0];
}

async function request(base, route, { method = 'GET', session, body } = {}) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: {
      origin: base,
      ...(session ? { cookie: session.cookie, 'x-csrf-token': session.csrf } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
}

async function login(base, email) {
  const result = await request(base, '/api/v1/auth/login', {
    method: 'POST', body: { email, password: PASSWORD },
  });
  assert.equal(result.response.status, 200, JSON.stringify(result.body));
  return {
    cookie: result.response.headers.get('set-cookie').split(';')[0],
    csrf: result.body.csrf_token,
  };
}

test('UE-T09 persists per-user defaults, keeps temporary source failures and invalidates retired stations', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_prefs' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    const a = await account(pool, 'a');
    const b = await account(pool, 'b');
    const aActive = await station(pool, a.id, 'a-active');
    const aDraft = await station(pool, a.id, 'a-draft', 'DRAFT');
    const bPublic = await station(pool, b.id, 'b-public', 'ACTIVE', 'PUBLIC');
    await pool.query('UPDATE meteo.public_view_config SET public_station_id=$1 WHERE id=1', [bPublic.id]);
    const binding = await pool.query(`
      INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status)
      VALUES ($1,'ECOWITT','preference-a','VALIDATED') RETURNING id
    `, [aActive.id]);
    await pool.query(`
      INSERT INTO meteo.current_snapshots(binding_id,observed_at,values_json,quality_json,provider_error)
      VALUES ($1,'2026-09-20T12:00:00Z'::timestamptz,$2::jsonb,'{}'::jsonb,'HTTP_503')
    `, [binding.rows[0].id, JSON.stringify({ temp_c: 12.5 })]);

    const app = createApp({
      environment: { METEOLORD_ENV: 'test' }, pool,
      connectorKeyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 9) } },
      clock: () => new Date(),
      accessLogStream: { write() {} },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const sessionA = await login(base, a.email);
      const sessionA2 = await login(base, a.email);
      const sessionB = await login(base, b.email);
      const initialPreference = await request(base, '/api/v1/me/preferences', { session: sessionA });
      assert.equal(initialPreference.response.status, 200, JSON.stringify(initialPreference.body));
      assert.deepEqual(initialPreference.body.preference, {
        default_station: null, revision: 0, invalidated: false,
      });
      const saved = await request(base, '/api/v1/me/preferences/default-station', {
        method: 'PUT', session: sessionA,
        body: { station_id: aActive.public_id, revision: 0 },
      });
      assert.equal(saved.response.status, 200);
      assert.equal(saved.body.preference.default_station.id, aActive.public_id);
      assert.equal(saved.body.preference.revision, 1);
      const otherSession = await request(base, '/api/v1/me/preferences', { session: sessionA2 });
      assert.equal(otherSession.body.preference.default_station.id, aActive.public_id);
      assert.deepEqual((await request(base, '/api/v1/me/preferences', { session: sessionB })).body.preference, {
        default_station: null, revision: 0, invalidated: false,
      });

      const temporaryPublic = await request(base, `/api/v1/stations/${bPublic.public_id}/current`, { session: sessionA });
      assert.equal(temporaryPublic.response.status, 200);
      assert.equal((await request(base, '/api/v1/me/preferences', { session: sessionA })).body.preference.default_station.id,
        aActive.public_id);
      const sourceFailure = await request(base, `/api/v1/stations/${aActive.public_id}/current`, { session: sessionA });
      assert.equal(sourceFailure.response.status, 200);
      assert.equal(sourceFailure.body.source.error, 'HTTP_503');
      assert.equal((await request(base, '/api/v1/me/preferences', { session: sessionA })).body.preference.default_station.id,
        aActive.public_id);

      assert.equal((await request(base, '/api/v1/me/preferences/default-station', {
        method: 'PUT', session: sessionA,
        body: { station_id: bPublic.public_id, revision: 1 },
      })).response.status, 404);
      assert.equal((await request(base, '/api/v1/me/preferences/default-station', {
        method: 'PUT', session: sessionA,
        body: { station_id: aDraft.public_id, revision: 1 },
      })).response.status, 404);
      assert.equal((await request(base, '/api/v1/me/preferences/default-station', {
        method: 'PUT', session: sessionA,
        body: { station_id: aActive.public_id, revision: 0 },
      })).response.status, 409);

      await pool.query("UPDATE meteo.estacions SET lifecycle='RETIRED' WHERE id=$1", [aActive.id]);
      const invalidated = await request(base, '/api/v1/me/preferences', { session: sessionA });
      assert.equal(invalidated.body.preference.default_station, null);
      assert.equal(invalidated.body.preference.invalidated, true);
      assert.equal(invalidated.body.preference.revision, 2);
      const stableFallback = await request(base, '/api/v1/me/preferences', { session: sessionA2 });
      assert.equal(stableFallback.body.preference.invalidated, false);
      assert.equal(stableFallback.body.preference.default_station, null);

      assert.equal((await request(base, '/api/v1/auth/logout', {
        method: 'POST', session: sessionA, body: {},
      })).response.status, 200);
      assert.equal((await request(base, '/api/v1/me/preferences', { session: sessionA })).response.status, 401);
      const audit = await pool.query("SELECT action FROM meteo.audit_events WHERE actor_user_id=$1 ORDER BY id", [a.id]);
      assert.deepEqual(audit.rows.map((row) => row.action), ['DEFAULT_STATION_SET']);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  });
});
