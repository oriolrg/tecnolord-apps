'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool, Client } = require('pg');
const { createApp } = require('../../server');
const { hashPassword } = require('../../services/identityService');
const { bootstrapAdmin } = require('../../scripts/bootstrap-admin');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260918-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');

async function approvedUser(pool, email, password) {
  const account = await pool.query(`
    INSERT INTO auth.usuaris(email,nom,actiu,account_status,email_verified_at,approved_at)
    VALUES ($1,$1,true,'APPROVED',now(),now()) RETURNING id
  `, [email]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    account.rows[0].id, await hashPassword(password),
  ]);
  return account.rows[0].id;
}

async function json(base, route, { method = 'GET', cookie, csrf, body, origin = base } = {}) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(origin ? { origin } : {}),
      ...(cookie ? { cookie } : {}),
      ...(csrf ? { 'x-csrf-token': csrf } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, body: await response.json() };
}

async function login(base, email, password) {
  const result = await json(base, '/api/v1/auth/login', { method: 'POST', body: { email, password } });
  assert.equal(result.response.status, 200);
  return {
    cookie: result.response.headers.get('set-cookie').split(';')[0],
    csrf: result.body.csrf_token,
  };
}

test('UE-T05 owner, other user, admin and visitor share one fail-closed station policy', { skip: !enabled, timeout: 90000 }, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_owner' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const connection = { ...testDb.connectionFromEnv(), database };
    const pool = new Pool(connection);
    const adminClient = new Client(connection);
    const password = 'synthetic-owner-passphrase';
    const adminId = await approvedUser(pool, 'owner-admin@example.invalid', password);
    const userAId = await approvedUser(pool, 'owner-a@example.invalid', password);
    await approvedUser(pool, 'owner-b@example.invalid', password);
    await adminClient.connect();
    await bootstrapAdmin({
      client: adminClient, userId: adminId, email: 'owner-admin@example.invalid', auditRef: 'synthetic-ue-t05',
    });
    const app = createApp({
      environment: { METEOLORD_ENV: 'test' }, pool,
      httpClient: async () => { throw new Error('No provider access in ownership test'); },
      accessLogStream: { write() {} },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const admin = await login(base, 'owner-admin@example.invalid', password);
      const a = await login(base, 'owner-a@example.invalid', password);
      const b = await login(base, 'owner-b@example.invalid', password);
      const create = async (session, name) => json(base, '/api/v1/me/stations', {
        method: 'POST', ...session, body: { name, description: `Descripció ${name}` },
      });
      const a1 = await create(a, 'A privada');
      const a2 = await create(a, 'A pública');
      const b1 = await create(b, 'B primera');
      const b2 = await create(b, 'B segona');
      for (const created of [a1, a2, b1, b2]) {
        assert.equal(created.response.status, 201);
        assert.equal(created.body.station.lifecycle, 'DRAFT');
        assert.equal(created.body.station.visibility, 'PRIVATE');
        assert.equal('owner_id' in created.body.station, false);
        assert.equal('codi' in created.body.station, false);
      }

      const ownA = await json(base, '/api/v1/me/stations', { cookie: a.cookie });
      const ownB = await json(base, '/api/v1/me/stations', { cookie: b.cookie });
      assert.deepEqual(ownA.body.items.map((item) => item.name), ['A privada', 'A pública']);
      assert.deepEqual(ownB.body.items.map((item) => item.name), ['B primera', 'B segona']);
      assert.match(ownA.response.headers.get('vary'), /Cookie/);
      assert.equal(ownA.response.headers.get('cache-control'), 'no-store');

      assert.equal((await json(base, `/api/v1/stations/${a1.body.station.id}`)).response.status, 404);
      assert.equal((await json(base, `/api/v1/stations/${a1.body.station.id}`, { cookie: b.cookie })).response.status, 404);
      assert.equal((await json(base, `/api/v1/stations/${a1.body.station.id}`, { cookie: a.cookie })).response.status, 200);
      assert.equal((await json(base, `/api/v1/stations/${a1.body.station.id}`, { cookie: admin.cookie })).response.status, 200);
      assert.equal((await json(base, '/api/v1/admin/stations', { cookie: b.cookie })).response.status, 403);
      const adminList = await json(base, '/api/v1/admin/stations', { cookie: admin.cookie });
      assert.equal(adminList.body.items.length, 4);

      assert.equal((await json(base, `/api/v1/me/stations/${a1.body.station.id}`, {
        method: 'PATCH', ...b, body: { name: 'Robada', description: '', revision: 0 },
      })).response.status, 404);
      assert.equal((await json(base, `/api/v1/me/stations/${a1.body.station.id}`, {
        method: 'PATCH', ...admin, body: { name: 'Admin edit', description: '', revision: 0 },
      })).response.status, 404);
      const update = await json(base, `/api/v1/me/stations/${a1.body.station.id}`, {
        method: 'PATCH', ...a, body: { name: 'A privada editada', description: 'Nova', revision: 0 },
      });
      assert.equal(update.response.status, 200);
      assert.equal(update.body.station.revision, 1);
      assert.equal((await json(base, `/api/v1/me/stations/${a1.body.station.id}`, {
        method: 'PATCH', ...a, body: { name: 'Versió vella', description: '', revision: 0 },
      })).response.status, 409);

      const internals = await pool.query(`
        SELECT id,codi,public_id FROM meteo.estacions WHERE public_id IN ($1,$2) ORDER BY public_id
      `, [a1.body.station.id, a2.body.station.id]);
      const privateRow = internals.rows.find((row) => row.public_id === a1.body.station.id);
      const publicRow = internals.rows.find((row) => row.public_id === a2.body.station.id);
      await pool.query(`
        INSERT INTO meteo.mesures(estacio_id,instant,temp_c,humitat_pct,extres)
        VALUES ($1,'2026-09-19T10:00:00Z',11.5,55,'{"secret":"private-a"}'),
               ($2,'2026-09-19T10:01:00Z',22.5,66,'{"secret":"public-a"}')
      `, [privateRow.id, publicRow.id]);
      await pool.query("UPDATE meteo.estacions SET lifecycle='ACTIVE',visibility='PUBLIC' WHERE id=$1", [publicRow.id]);
      await pool.query('UPDATE meteo.public_view_config SET public_station_id=$1 WHERE id=1', [publicRow.id]);

      const publicList = await json(base, '/api/v1/stations');
      assert.deepEqual(publicList.body.items.map((item) => item.id), [a2.body.station.id]);
      const publicCurrent = await json(base, `/api/v1/stations/${a2.body.station.id}/current`);
      assert.equal(publicCurrent.response.status, 200);
      assert.equal(publicCurrent.body.items[0].temp_c, 22.5);
      assert.equal(JSON.stringify(publicCurrent.body).includes('secret'), false);
      assert.equal(JSON.stringify(publicCurrent.body).includes('estacio_id'), false);
      assert.equal((await json(base, `/api/v1/stations/${a1.body.station.id}/current`, { cookie: b.cookie })).response.status, 404);
      assert.equal((await json(base, `/api/v1/stations/${a1.body.station.id}/current`, { cookie: admin.cookie })).response.status, 200);

      const ownerLegacy = await json(base, `/api/v1/mesures/darreres?estacio=${encodeURIComponent(privateRow.codi)}`, { cookie: a.cookie });
      assert.equal(ownerLegacy.response.status, 200);
      assert.equal(ownerLegacy.body.items[0].temp_c, 11.5);
      assert.equal(JSON.stringify(ownerLegacy.body).includes('secret'), false);
      assert.equal((await json(base, `/api/v1/mesures/darreres?estacio=${encodeURIComponent(privateRow.codi)}`, { cookie: b.cookie })).response.status, 404);
      assert.equal((await json(base, `/api/v1/mesures/darreres?estacio=${encodeURIComponent(privateRow.codi)}`)).response.status, 404);
      const global = await json(base, '/api/v1/mesures/darreres');
      assert.deepEqual(global.body.items.map((item) => item.temp_c), [22.5]);

      const retire = await json(base, `/api/v1/me/stations/${a1.body.station.id}`, {
        method: 'DELETE', ...a, body: { revision: update.body.station.revision },
      });
      assert.equal(retire.response.status, 200);
      assert.equal(retire.body.station.lifecycle, 'RETIRED');
      assert.equal((await json(base, `/api/v1/stations/${a1.body.station.id}/current`, { cookie: a.cookie })).response.status, 404);
      assert.equal(Number((await pool.query('SELECT count(*) AS n FROM meteo.mesures WHERE estacio_id=$1', [privateRow.id])).rows[0].n), 1);
      assert.equal((await json(base, `/api/v1/me/stations/${a1.body.station.id}`, {
        method: 'DELETE', ...a, body: { revision: retire.body.station.revision },
      })).response.status, 404);
      assert.notEqual(String(userAId), String(adminId));
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await adminClient.end();
      await pool.end();
    }
  });
});
