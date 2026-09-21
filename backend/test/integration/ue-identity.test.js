'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Pool, Client } = require('pg');
const { createApp } = require('../../server');
const { hashPassword } = require('../../services/identityService');
const { bootstrapAdmin } = require('../../scripts/bootstrap-admin');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260918-000000-0000000';
const migrationDir = require('node:path').resolve(__dirname, '../../db/migrations');

async function post(base, route, body, { cookie, csrf, origin } = {}) {
  const response = await fetch(`${base}${route}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: origin || base,
      ...(cookie ? { cookie } : {}),
      ...(csrf ? { 'x-csrf-token': csrf } : {}),
    },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json() };
}

async function approvedUser(pool, email, password, status = 'APPROVED') {
  const account = await pool.query(`
    INSERT INTO auth.usuaris(email,nom,actiu,account_status,email_verified_at,approved_at)
    VALUES ($1,$2,true,$3,now(),now()) RETURNING id
  `, [email, email, status]);
  const hash = await hashPassword(password);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [account.rows[0].id, hash]);
  return account.rows[0].id;
}

test('UE-T03 login, CSRF, recovery and admin bootstrap use only the verified account', { skip: !enabled, timeout: 60000 }, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_identity' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const connection = { ...testDb.connectionFromEnv(), database };
    const pool = new Pool(connection);
    const outbox = [];
    let now = Date.now();
    const adminEmail = 'synthetic-admin-ue@example.invalid';
    const adminId = await approvedUser(pool, adminEmail, 'synthetic-admin-passphrase');
    await approvedUser(pool, 'pending-ue@example.invalid', 'synthetic-pending-passphrase', 'PENDING_APPROVAL');
    const client = new Client(connection);
    await client.connect();
    try {
      const bootstrap = () => bootstrapAdmin({ client, userId: adminId, email: adminEmail, auditRef: 'synthetic-ue-01' });
      assert.equal(await bootstrap(), 'created');
      assert.equal(await bootstrap(), 'already_exists');
      await assert.rejects(() => bootstrapAdmin({ client, userId: adminId, email: 'wrong@example.invalid', auditRef: 'synthetic-ue-02' }));
      const audit = await pool.query("SELECT count(*)::integer AS n FROM meteo.audit_events WHERE action='ADMIN_BOOTSTRAP'");
      assert.equal(audit.rows[0].n, 1);

      const app = createApp({
        environment: { METEOLORD_ENV: 'test' },
        pool,
        clock: { now: () => new Date(now) },
        httpClient: async () => { throw new Error('No provider access in identity integration test'); },
        identityMailAdapter: async (mail) => { outbox.push(mail); },
        accessLogStream: { write() {} },
      });
      const server = await new Promise((resolve) => {
        const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
      });
      const base = `http://127.0.0.1:${server.address().port}`;
      try {
        const accountPage = await fetch(`${base}/meteo/compte/`);
        assert.equal(accountPage.status, 200);
        assert.match(await accountPage.text(), /id="account-login"/);
        assert.equal((await post(base, '/api/v1/auth/login', {
          email: adminEmail, password: 'synthetic-admin-passphrase',
        }, { origin: 'https://evil.invalid' })).response.status, 403);
        assert.equal((await post(base, '/api/v1/auth/login', {
          email: 'pending-ue@example.invalid', password: 'synthetic-pending-passphrase',
        })).response.status, 401);
        const login = await post(base, '/api/v1/auth/login', {
          email: adminEmail, password: 'synthetic-admin-passphrase',
        });
        assert.equal(login.response.status, 200);
        assert.equal(login.body.user.role, 'SUPERADMIN');
        const cookie = login.response.headers.get('set-cookie').split(';')[0];
        assert.match(login.response.headers.get('set-cookie'), /HttpOnly; SameSite=Lax/);
        assert.equal(login.response.headers.get('cache-control'), 'no-store');
        const me = await fetch(`${base}/api/v1/auth/me`, { headers: { cookie } });
        assert.equal(me.status, 200);
        assert.equal((await me.json()).user.id, adminId);
        now += 31 * 60 * 1000;
        assert.equal((await fetch(`${base}/api/v1/auth/me`, { headers: { cookie } })).status, 401);
        now -= 31 * 60 * 1000;
        assert.equal((await post(base, '/api/v1/auth/logout', {}, { cookie, csrf: 'bad' })).response.status, 403);

        const recovery = await post(base, '/api/v1/auth/recover', { email: adminEmail });
        assert.equal(recovery.response.status, 200);
        assert.equal(outbox.length, 1);
        assert.equal(outbox[0].kind, 'password_reset');
        const reset = await post(base, '/api/v1/auth/reset', {
          token: outbox[0].token, password: 'synthetic-new-passphrase',
        });
        assert.equal(reset.response.status, 200);
        assert.equal((await fetch(`${base}/api/v1/auth/me`, { headers: { cookie } })).status, 401);
        assert.equal((await post(base, '/api/v1/auth/reset', {
          token: outbox[0].token, password: 'synthetic-new-passphrase',
        })).response.status, 400);
        assert.equal((await post(base, '/api/v1/auth/login', {
          email: adminEmail, password: 'synthetic-admin-passphrase',
        })).response.status, 401);
        const newLogin = await post(base, '/api/v1/auth/login', {
          email: adminEmail, password: 'synthetic-new-passphrase',
        });
        assert.equal(newLogin.response.status, 200);
        const logoutCookie = newLogin.response.headers.get('set-cookie').split(';')[0];
        const logout = await post(base, '/api/v1/auth/logout', {}, {
          cookie: logoutCookie, csrf: newLogin.body.csrf_token,
        });
        assert.equal(logout.response.status, 200);
        assert.equal((await fetch(`${base}/api/v1/auth/me`, { headers: { cookie: logoutCookie } })).status, 401);
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    } finally { await client.end(); await pool.end(); }
  });
});
