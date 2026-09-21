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
const PASSWORD = 'synthetic-public-view-passphrase';

async function account(pool, suffix, role = 'USER') {
  const result = await pool.query(`
    INSERT INTO auth.usuaris(
      email,nom,actiu,account_status,application_role,email_verified_at,approved_at
    ) VALUES ($1,$2,true,'APPROVED',$3,now(),now()) RETURNING id,email
  `, [`public-view-${suffix}@example.invalid`, `Usuari ${suffix.toUpperCase()}`, role]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    result.rows[0].id, await hashPassword(PASSWORD),
  ]);
  return result.rows[0];
}

async function station(pool, ownerId, suffix, lifecycle, visibility) {
  const result = await pool.query(`
    INSERT INTO meteo.estacions(
      codi,nom,owner_id,creat_per_usuari,management_kind,lifecycle,visibility
    ) VALUES ($1,$2,$3,$3,'USER',$4,$5) RETURNING id,public_id
  `, [`public-view-${suffix}`, `Estació ${suffix.toUpperCase()}`, ownerId, lifecycle, visibility]);
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
    cookie: result.response.headers.get('set-cookie').split(';')[0], csrf: result.body.csrf_token,
  };
}

test('UE-T10 persists the global public view and fails closed after station revocation', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_pubview' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    const admin = await account(pool, 'admin', 'SUPERADMIN');
    const owner = await account(pool, 'owner');
    const eligible = await station(pool, owner.id, 'eligible', 'ACTIVE', 'PUBLIC');
    const privateStation = await station(pool, owner.id, 'private', 'ACTIVE', 'PRIVATE');
    const draftStation = await station(pool, owner.id, 'draft', 'DRAFT', 'PUBLIC');
    const app = createApp({
      environment: { METEOLORD_ENV: 'test' }, pool,
      connectorKeyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 10) } },
      clock: () => new Date(), accessLogStream: { write() {} },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const adminSession = await login(base, admin.email);
      const ownerSession = await login(base, owner.email);
      assert.deepEqual((await request(base, '/api/v1/public-view')).body.config, {
        station: null,
        card_ids: ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv'], revision: 0,
      });
      assert.equal((await request(base, '/api/v1/admin/public-view', {
        method: 'PUT', session: ownerSession,
        body: { station_id: eligible.public_id, card_ids: ['humidity'], revision: 0 },
      })).response.status, 403);
      for (const stationId of [privateStation.public_id, draftStation.public_id]) {
        assert.equal((await request(base, '/api/v1/admin/public-view', {
          method: 'PUT', session: adminSession,
          body: { station_id: stationId, card_ids: ['humidity'], revision: 0 },
        })).response.status, 404);
      }
      assert.equal((await request(base, '/api/v1/admin/public-view', {
        method: 'PUT', session: adminSession,
        body: { station_id: eligible.public_id, card_ids: [], revision: 0 },
      })).response.status, 400);
      const saved = await request(base, '/api/v1/admin/public-view', {
        method: 'PUT', session: adminSession,
        body: { station_id: eligible.public_id, card_ids: ['humidity', 'temperature'], revision: 0 },
      });
      assert.equal(saved.response.status, 200, JSON.stringify(saved.body));
      assert.equal(saved.body.config.revision, 1);
      assert.deepEqual(saved.body.config.card_ids, ['humidity', 'temperature']);
      const visitor = await request(base, '/api/v1/public-view');
      assert.equal(visitor.body.config.station.id, eligible.public_id);
      assert.deepEqual(visitor.body.config.card_ids, ['humidity', 'temperature']);
      assert.equal((await request(base, '/api/v1/admin/public-view', {
        method: 'PUT', session: adminSession,
        body: { station_id: eligible.public_id, card_ids: ['temperature'], revision: 0 },
      })).response.status, 409);

      await pool.query("UPDATE auth.usuaris SET actiu=false,account_status='SUSPENDED' WHERE id=$1", [owner.id]);
      const revoked = await request(base, '/api/v1/public-view');
      assert.equal(revoked.body.config.station, null);
      assert.deepEqual(revoked.body.config.card_ids, ['humidity', 'temperature']);
      const adminView = await request(base, '/api/v1/admin/public-view', { session: adminSession });
      assert.equal(adminView.body.config.configured_station_id, eligible.public_id);
      assert.equal(adminView.body.config.eligible, false);
      const audit = await pool.query(`
        SELECT actor_user_id,action,details FROM meteo.audit_events
        WHERE resource_kind='PUBLIC_VIEW' ORDER BY id
      `);
      assert.equal(audit.rowCount, 1);
      assert.equal(String(audit.rows[0].actor_user_id), String(admin.id));
      assert.equal(audit.rows[0].action, 'PUBLIC_VIEW_UPDATED');
      assert.deepEqual(audit.rows[0].details, {
        station_id: eligible.public_id, card_ids: ['humidity', 'temperature'],
      });
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  });
});
