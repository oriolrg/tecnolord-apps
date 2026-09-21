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
const runId = process.env.UE_RUN_ID || '20260920-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');
const NOW = new Date();

async function approvedUser(pool, email) {
  const result = await pool.query(`
    INSERT INTO auth.usuaris(email,nom,actiu,account_status,email_verified_at,approved_at)
    VALUES ($1,$1,true,'APPROVED',now(),now()) RETURNING id
  `, [email]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    result.rows[0].id, await hashPassword('synthetic-visibility-passphrase'),
  ]);
  return result.rows[0].id;
}

async function json(base, route, { method = 'GET', cookie, csrf, body } = {}) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: { origin: base, ...(cookie ? { cookie } : {}), ...(csrf ? { 'x-csrf-token': csrf } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
}

async function login(base, email) {
  const result = await json(base, '/api/v1/auth/login', {
    method: 'POST', body: { email, password: 'synthetic-visibility-passphrase' },
  });
  assert.equal(result.response.status, 200, `${email}: ${JSON.stringify(result.body)}`);
  return { cookie: result.response.headers.get('set-cookie').split(';')[0], csrf: result.body.csrf_token };
}

test('UE-T08 keeps exact locations private and revokes every public map surface atomically', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_visible' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const connection = { ...testDb.connectionFromEnv(), database };
    const pool = new Pool(connection);
    const adminClient = new Client(connection);
    await adminClient.connect();
    const adminId = await approvedUser(pool, 'visibility-admin@example.invalid');
    await approvedUser(pool, 'visibility-a@example.invalid');
    await approvedUser(pool, 'visibility-b@example.invalid');
    await bootstrapAdmin({ client: adminClient, userId: adminId,
      email: 'visibility-admin@example.invalid', auditRef: 'synthetic-ue-t08' });
    const app = createApp({
      environment: { METEOLORD_ENV: 'test' }, pool,
      connectorKeyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 8) } },
      clock: () => NOW,
      httpClient: async (url) => ({
        ok: true, status: 200, headers: { get() { return null; } },
        async text() {
          const mac = new URL(url).searchParams.get('mac');
          return JSON.stringify({ code: 0, time: NOW.getTime() / 1000,
            data: { outdoor: { temperature: { value: mac.startsWith('AA') ? '0' : '21.5' }, humidity: { value: '50' } } } });
        },
      }),
      accessLogStream: { write() {} },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const admin = await login(base, 'visibility-admin@example.invalid');
      const a = await login(base, 'visibility-a@example.invalid');
      const b = await login(base, 'visibility-b@example.invalid');
      const create = async (session, name) => {
        const result = await json(base, '/api/v1/me/stations', { method: 'POST', ...session, body: { name } });
        assert.equal(result.response.status, 201, JSON.stringify(result.body));
        return result.body.station;
      };
      let stationA = await create(a, 'Privada A');
      let stationB = await create(b, 'Privada B');
      const connector = async (session, station, mac) => json(base, `/api/v1/me/stations/${station.id}/connector/ecowitt`, {
        method: 'PUT', ...session, body: { application_key: `app-${mac[0]}`, api_key: `api-${mac[0]}`, mac },
      });
      assert.equal((await connector(a, stationA, 'AA:AA:AA')).response.status, 200);
      assert.equal((await connector(b, stationB, 'BB:BB:BB')).response.status, 200);
      const ids = await pool.query('SELECT id,public_id FROM meteo.estacions WHERE public_id=ANY($1)', [[stationA.id, stationB.id]]);
      for (const row of ids.rows) assert.equal((await app.locals.meteolordRuntime.snapshotService.refreshStation(row.id)).updated, true);
      stationA = (await json(base, '/api/v1/me/stations', a)).body.items.find((item) => item.id === stationA.id);
      stationB = (await json(base, '/api/v1/me/stations', b)).body.items.find((item) => item.id === stationB.id);

      const putLocation = (session, station, body) => json(base, `/api/v1/me/stations/${station.id}/location`, {
        method: 'PUT', ...session, body: { revision: station.revision, ...body },
      });
      const exactA = { longitude: 2.1734, latitude: 41.3851 };
      const privateA = await putLocation(a, stationA, { ...exactA, mode: 'APPROX_1KM', publish: false, consent: false });
      assert.equal(privateA.response.status, 200);
      stationA.revision = privateA.body.revision;
      const privateB = await putLocation(b, stationB, { longitude: 1.521, latitude: 42.51,
        mode: 'APPROX_5KM', publish: false, consent: false });
      assert.equal(privateB.response.status, 200);
      stationB.revision = privateB.body.revision;
      const hiddenB = await putLocation(b, stationB, { longitude: 1.521, latitude: 42.51,
        mode: 'HIDDEN', publish: true, consent: true });
      assert.equal(hiddenB.response.status, 200);
      stationB.revision = hiddenB.body.revision;
      assert.equal((await json(base, `/api/v1/me/stations/${stationA.id}/location`, b)).response.status, 404);

      const before = await json(base, '/api/v1/map/catalog-version');
      const published = await putLocation(a, stationA, { ...exactA, mode: 'APPROX_1KM', publish: true, consent: true });
      assert.equal(published.response.status, 200);
      stationA.revision = published.body.revision;
      const after = await json(base, '/api/v1/map/catalog-version');
      assert.notEqual(after.body.catalog_version, before.body.catalog_version);

      const publicMap = await json(base, '/api/v1/map/stations');
      assert.equal(publicMap.response.status, 200);
      assert.equal(publicMap.response.headers.get('cache-control'), 'no-store, max-age=0');
      assert.equal(publicMap.body.features.length, 1);
      const publicFeature = publicMap.body.features[0];
      assert.equal(publicFeature.properties.public_station_id, stationA.id);
      assert.notDeepEqual(publicFeature.geometry.coordinates, [exactA.longitude, exactA.latitude]);
      const publicText = JSON.stringify(publicMap.body);
      assert.equal(publicText.includes(String(exactA.longitude)), false);
      assert.equal(publicText.includes('private_'), false);
      assert.equal(publicFeature.properties.sensors[0].fields[0].current_value, 0);
      const selector = await json(base, '/api/v1/stations');
      assert.deepEqual(new Set(selector.body.items.map((item) => item.id)), new Set([stationA.id, stationB.id]));

      const versionBeforeName = (await json(base, '/api/v1/map/catalog-version')).body.catalog_version;
      const renamed = await json(base, `/api/v1/me/stations/${stationA.id}`, {
        method: 'PATCH', ...a, body: { name: 'Pública A', description: '', revision: stationA.revision },
      });
      assert.equal(renamed.response.status, 200);
      stationA.revision = renamed.body.station.revision;
      assert.notEqual((await json(base, '/api/v1/map/catalog-version')).body.catalog_version, versionBeforeName);
      assert.equal((await json(base, '/api/v1/map/stations')).body.features[0].properties.public_name, 'Pública A');

      const ownerMapA = await json(base, '/api/v1/me/map', a);
      const ownerMapB = await json(base, '/api/v1/me/map', b);
      assert.deepEqual(ownerMapA.body.features[0].geometry.coordinates, [exactA.longitude, exactA.latitude]);
      assert.equal(ownerMapA.body.features[0].properties.access_scope, 'OWNER');
      assert.equal(ownerMapB.body.features.some((feature) => feature.properties.public_station_id === stationA.id), false);
      assert.match(ownerMapA.response.headers.get('vary'), /Cookie/);
      const adminMap = await json(base, '/api/v1/admin/map', admin);
      assert.equal(adminMap.body.features.length, 2);
      assert.ok(adminMap.body.features.every((feature) => feature.properties.access_scope === 'ADMIN'));
      assert.equal((await json(base, '/api/v1/admin/map', b)).response.status, 403);

      const sitemap = await json(base, '/api/v1/map/sitemap');
      assert.deepEqual(sitemap.body.ids, [stationA.id]);
      assert.equal((await json(base, `/api/v1/map/stations/${stationB.id}`)).response.status, 404);
      const revoked = await putLocation(a, stationA, { ...exactA, mode: 'APPROX_1KM', publish: false, consent: false });
      assert.equal(revoked.response.status, 200);
      const emptyMap = await json(base, '/api/v1/map/stations');
      assert.equal(emptyMap.body.features.length, 0);
      assert.equal((await json(base, `/api/v1/map/stations/${stationA.id}`)).response.status, 404);
      assert.equal((await json(base, '/api/v1/map/summary')).body.count, 0);
      assert.equal((await json(base, '/api/v1/map/sitemap')).body.count, 0);
      const audit = await pool.query("SELECT details FROM meteo.audit_events WHERE resource_kind='STATION' AND resource_id=$1", [stationA.id]);
      assert.ok(audit.rowCount >= 2);
      assert.equal(JSON.stringify(audit.rows).includes(String(exactA.longitude)), false);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await adminClient.end();
      await pool.end();
    }
  });
});
