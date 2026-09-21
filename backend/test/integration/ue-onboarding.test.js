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
    VALUES ($1,$2,true,'APPROVED',now(),now()) RETURNING id
  `, [email, email]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    account.rows[0].id, await hashPassword(password),
  ]);
  return account.rows[0].id;
}

async function post(base, route, body, { cookie, csrf, origin = base } = {}) {
  const response = await fetch(`${base}${route}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json', origin,
      ...(cookie ? { cookie } : {}),
      ...(csrf ? { 'x-csrf-token': csrf } : {}),
    },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json() };
}

function sessionCookie(response) { return response.headers.get('set-cookie').split(';')[0]; }

test('UE-T04 registration requires email verification and an audited admin decision', { skip: !enabled, timeout: 90000 }, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_onboard' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const connection = { ...testDb.connectionFromEnv(), database };
    const pool = new Pool(connection);
    const adminClient = new Client(connection);
    const outbox = [];
    const initialNow = Date.now();
    let now = initialNow;
    const adminEmail = 'onboarding-admin@example.invalid';
    const adminId = await approvedUser(pool, adminEmail, 'synthetic-admin-passphrase');
    const ordinaryId = await approvedUser(pool, 'ordinary@example.invalid', 'synthetic-ordinary-passphrase');
    await adminClient.connect();
    await bootstrapAdmin({ client: adminClient, userId: adminId, email: adminEmail, auditRef: 'synthetic-ue-t04' });

    const app = createApp({
      environment: { METEOLORD_ENV: 'test' },
      pool,
      clock: { now: () => new Date(now) },
      httpClient: async () => { throw new Error('No provider access in onboarding test'); },
      identityMailAdapter: async (mail) => {
        if (mail.to === 'mail-failure@example.invalid') throw new Error('synthetic delivery failure');
        outbox.push(mail);
      },
      accessLogStream: { write() {} },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const expiredRequest = await post(base, '/api/v1/auth/request', {
        name: 'Token Caducat', email: 'expired@example.invalid', password: 'synthetic-expired-passphrase',
      });
      assert.equal(expiredRequest.response.status, 202);
      const expiredToken = outbox.at(-1).token;
      now += 31 * 60 * 1000;
      assert.equal((await post(base, '/api/v1/auth/verify-email', { token: expiredToken })).response.status, 400);
      now = initialNow;

      const registrationBody = {
        name: 'Usuària Sintètica', email: 'new-user@example.invalid', password: 'synthetic-user-passphrase',
      };
      const registration = await post(base, '/api/v1/auth/request', registrationBody);
      assert.equal(registration.response.status, 202);
      assert.deepEqual(registration.body, { ok: true });
      const verifyMail = outbox.at(-1);
      assert.equal(verifyMail.kind, 'verify_email');
      assert.equal(verifyMail.to, registrationBody.email);

      const duplicate = await post(base, '/api/v1/auth/request', registrationBody);
      assert.equal(duplicate.response.status, 202);
      assert.deepEqual(duplicate.body, registration.body);
      assert.equal(outbox.filter((mail) => mail.to === registrationBody.email).length, 1);

      const failedMail = await post(base, '/api/v1/auth/request', {
        name: 'Mail Failure', email: 'mail-failure@example.invalid', password: 'synthetic-failure-passphrase',
      });
      assert.equal(failedMail.response.status, 503);
      assert.equal(Number((await pool.query("SELECT count(*) AS n FROM auth.usuaris WHERE email='mail-failure@example.invalid'")).rows[0].n), 0);

      const pending = await pool.query('SELECT id,account_status,email_verified_at FROM auth.usuaris WHERE email=$1', [registrationBody.email]);
      assert.equal(pending.rows[0].account_status, 'PENDING_EMAIL');
      assert.equal(pending.rows[0].email_verified_at, null);
      const newUserId = pending.rows[0].id;
      assert.equal((await post(base, '/api/v1/auth/login', {
        email: registrationBody.email, password: registrationBody.password,
      })).response.status, 401);

      const adminLogin = await post(base, '/api/v1/auth/login', {
        email: adminEmail, password: 'synthetic-admin-passphrase',
      });
      assert.equal(adminLogin.response.status, 200);
      const adminCookie = sessionCookie(adminLogin.response);
      const decisionOptions = { cookie: adminCookie, csrf: adminLogin.body.csrf_token };
      assert.equal((await post(base, `/api/v1/admin/accounts/${newUserId}/approve`, {}, decisionOptions)).response.status, 409);

      const rejectRequest = await post(base, '/api/v1/auth/request', {
        name: 'Usuari Rebutjat', email: 'rejected@example.invalid', password: 'synthetic-rejected-passphrase',
      });
      assert.equal(rejectRequest.response.status, 202);
      const rejectedToken = outbox.at(-1).token;
      const rejectedAccount = await pool.query("SELECT id FROM auth.usuaris WHERE email='rejected@example.invalid'");
      const rejectedId = rejectedAccount.rows[0].id;
      assert.equal((await post(base, `/api/v1/admin/accounts/${rejectedId}/reject`, {}, decisionOptions)).response.status, 200);
      assert.equal((await post(base, '/api/v1/auth/verify-email', { token: rejectedToken })).response.status, 400);
      assert.equal((await pool.query('SELECT account_status FROM auth.usuaris WHERE id=$1', [rejectedId])).rows[0].account_status, 'REJECTED');

      assert.equal((await post(base, '/api/v1/auth/verify-email', { token: 'x'.repeat(43) })).response.status, 400);
      const verified = await post(base, '/api/v1/auth/verify-email', { token: verifyMail.token });
      assert.equal(verified.response.status, 200);
      assert.equal(verified.body.status, 'PENDING_APPROVAL');
      assert.equal((await post(base, '/api/v1/auth/verify-email', { token: verifyMail.token })).response.status, 400);
      assert.equal((await post(base, '/api/v1/auth/login', {
        email: registrationBody.email, password: registrationBody.password,
      })).response.status, 401);

      assert.equal((await fetch(`${base}/api/v1/admin/accounts`)).status, 401);
      const ordinaryLogin = await post(base, '/api/v1/auth/login', {
        email: 'ordinary@example.invalid', password: 'synthetic-ordinary-passphrase',
      });
      assert.equal(ordinaryLogin.response.status, 200);
      assert.equal((await fetch(`${base}/api/v1/admin/accounts`, {
        headers: { cookie: sessionCookie(ordinaryLogin.response) },
      })).status, 403);

      const queueResponse = await fetch(`${base}/api/v1/admin/accounts`, { headers: { cookie: adminCookie } });
      assert.equal(queueResponse.status, 200);
      const queue = await queueResponse.json();
      assert.equal(queue.items.some((item) => String(item.id) === String(newUserId)
        && item.status === 'PENDING_APPROVAL'), true);
      assert.equal((await post(base, `/api/v1/admin/accounts/${newUserId}/approve`, {}, {
        cookie: adminCookie, csrf: 'invalid',
      })).response.status, 403);
      assert.equal((await post(base, `/api/v1/admin/accounts/${newUserId}/approve`, {}, decisionOptions)).response.status, 200);

      const activeLogin = await post(base, '/api/v1/auth/login', {
        email: registrationBody.email, password: registrationBody.password,
      });
      assert.equal(activeLogin.response.status, 200);
      const activeCookie = sessionCookie(activeLogin.response);
      await pool.query(`
        INSERT INTO meteo.estacions(codi,nom,creat_per_usuari,owner_id,management_kind,visibility)
        VALUES ('synthetic-owned-public','Synthetic Public',$1,$1,'USER','PUBLIC')
      `, [newUserId]);
      assert.equal((await post(base, `/api/v1/admin/accounts/${newUserId}/suspend`, {}, decisionOptions)).response.status, 200);
      assert.equal((await fetch(`${base}/api/v1/auth/me`, { headers: { cookie: activeCookie } })).status, 401);
      const suspended = await pool.query('SELECT account_status FROM auth.usuaris WHERE id=$1', [newUserId]);
      assert.equal(suspended.rows[0].account_status, 'SUSPENDED');
      const publication = await pool.query("SELECT visibility,revision FROM meteo.estacions WHERE codi='synthetic-owned-public'");
      assert.deepEqual(publication.rows[0], { visibility: 'PRIVATE', revision: '1' });

      assert.equal((await post(base, `/api/v1/admin/accounts/${adminId}/suspend`, {}, decisionOptions)).response.status, 409);
      const audit = await pool.query(`
        SELECT resource_id,action FROM meteo.audit_events
        WHERE resource_kind='USER' AND resource_id IN ($1,$2) ORDER BY id
      `, [String(newUserId), String(rejectedId)]);
      assert.deepEqual(audit.rows, [
        { resource_id: String(rejectedId), action: 'ACCOUNT_REJECT' },
        { resource_id: String(newUserId), action: 'ACCOUNT_APPROVE' },
        { resource_id: String(newUserId), action: 'ACCOUNT_SUSPEND' },
      ]);
      assert.notEqual(String(ordinaryId), String(adminId));
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await adminClient.end();
      await pool.end();
    }
  });
});
