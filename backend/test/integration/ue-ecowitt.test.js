'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../../server');
const { hashPassword } = require('../../services/identityService');
const { makeConnectorRegistryService } = require('../../services/connectorRegistryService');
const { fetchEcowittConnector } = require('../../services/ecowittService');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260918-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');

async function user(pool, email) {
  const result = await pool.query(`
    INSERT INTO auth.usuaris(email,nom,actiu,account_status,email_verified_at,approved_at)
    VALUES ($1,$1,true,'APPROVED',now(),now()) RETURNING id
  `, [email]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    result.rows[0].id, await hashPassword('synthetic-connector-passphrase'),
  ]);
  return result.rows[0].id;
}

async function request(base, pathName, { method = 'GET', cookie, csrf, body } = {}) {
  const response = await fetch(`${base}${pathName}`, {
    method,
    headers: {
      origin: base,
      ...(cookie ? { cookie } : {}),
      ...(csrf ? { 'x-csrf-token': csrf } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, body: await response.json(), text: JSON.stringify(await Promise.resolve(null)) };
}

async function login(base, email) {
  const result = await request(base, '/api/v1/auth/login', {
    method: 'POST', body: { email, password: 'synthetic-connector-passphrase' },
  });
  assert.equal(result.response.status, 200);
  return { cookie: result.response.headers.get('set-cookie').split(';')[0], csrf: result.body.csrf_token };
}

test('UE-T06 keeps two Ecowitt connectors isolated, write-only and rotatable', { skip: !enabled, timeout: 90000 }, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_ecowitt' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const connection = { ...testDb.connectionFromEnv(), database };
    const pool = new Pool(connection);
    const userA = await user(pool, 'connector-a@example.invalid');
    const userB = await user(pool, 'connector-b@example.invalid');
    const oldKey = Buffer.alloc(32, 11);
    const newKey = Buffer.alloc(32, 22);
    const logs = [];
    const app = createApp({
      environment: { METEOLORD_ENV: 'test' }, pool,
      connectorKeyring: { primaryKeyId: 'old', keys: { old: oldKey } },
      httpClient: async () => { throw new Error('No real provider access in connector integration test'); },
      accessLogStream: { write(line) { logs.push(line); } },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const a = await login(base, 'connector-a@example.invalid');
      const b = await login(base, 'connector-b@example.invalid');
      const create = async (session, name) => request(base, '/api/v1/me/stations', {
        method: 'POST', ...session, body: { name },
      });
      const stationA = (await create(a, 'Connector A')).body.station;
      const stationB = (await create(b, 'Connector B')).body.station;
      const secretsA = { application_key: 'synthetic-app-a', api_key: 'synthetic-api-a', mac: 'AA:AA:AA' };
      const secretsB = { application_key: 'synthetic-app-b', api_key: 'synthetic-api-b', mac: 'BB:BB:BB' };
      const put = (session, id, body) => request(base, `/api/v1/me/stations/${id}/connector/ecowitt`, {
        method: 'PUT', ...session, body,
      });
      assert.equal((await put(a, stationA.id, secretsA)).response.status, 200);
      assert.equal((await put(b, stationB.id, secretsB)).response.status, 200);
      assert.equal((await put(b, stationA.id, secretsB)).response.status, 404);
      assert.equal((await put(a, stationA.id, { ...secretsA, url: 'https://evil.invalid' })).response.status, 400);

      const status = await request(base, `/api/v1/me/stations/${stationA.id}/connector/ecowitt`, a);
      assert.deepEqual(status.body, { connector: { type: 'ECOWITT', enabled: true, status: 'READY', configured: true } });
      const responseText = JSON.stringify(status.body);
      for (const secret of Object.values(secretsA)) assert.equal(responseText.includes(secret), false);

      const stored = await pool.query(`
        SELECT e.owner_id,e.id,s.ciphertext,s.nonce,s.auth_tag,s.key_id
        FROM meteo.estacions e JOIN meteo.connector_secrets s ON s.station_id=e.id
        ORDER BY e.owner_id
      `);
      assert.equal(stored.rowCount, 2);
      assert.notDeepEqual(stored.rows[0].ciphertext, stored.rows[1].ciphertext);
      for (const row of stored.rows) {
        assert.equal(row.nonce.length, 12);
        assert.equal(row.auth_tag.length, 16);
        assert.equal(row.key_id, 'old');
        for (const secret of [...Object.values(secretsA), ...Object.values(secretsB)]) {
          assert.equal(row.ciphertext.includes(Buffer.from(secret)), false);
        }
      }

      const rotating = makeConnectorRegistryService({
        pool, keyring: { primaryKeyId: 'new', keys: { new: newKey, old: oldKey } },
      });
      const rowA = stored.rows.find((row) => String(row.owner_id) === String(userA));
      const rowB = stored.rows.find((row) => String(row.owner_id) === String(userB));
      assert.deepEqual((await rotating.credentialsForStation(rowA.id)).secrets, secretsA);
      assert.deepEqual((await rotating.credentialsForStation(rowB.id)).secrets, secretsB);
      assert.equal(await rotating.rotateStation(rowA.id), true);
      assert.equal((await pool.query('SELECT key_id FROM meteo.connector_secrets WHERE station_id=$1', [rowA.id])).rows[0].key_id, 'new');
      assert.deepEqual((await rotating.credentialsForStation(rowA.id)).secrets, secretsA);

      const urls = [];
      for (const row of [rowA, rowB]) {
        const credentials = await rotating.credentialsForStation(row.id);
        const fetched = await fetchEcowittConnector(credentials, async (url, init) => {
          urls.push({ url: String(url), init });
          return { ok: true, status: 200, async json() { return { code: 0, data: { outdoor: { temperature: { value: '0' } } } }; } };
        });
        assert.equal(fetched.ok, true);
      }
      assert.equal(new URL(urls[0].url).searchParams.get('mac'), secretsA.mac);
      assert.equal(new URL(urls[1].url).searchParams.get('mac'), secretsB.mac);
      assert.ok(urls.every(({ url, init }) => new URL(url).hostname === 'api.ecowitt.net' && init.redirect === 'error'));
      const allLogs = logs.join('');
      for (const secret of [...Object.values(secretsA), ...Object.values(secretsB)]) assert.equal(allLogs.includes(secret), false);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  });
});
