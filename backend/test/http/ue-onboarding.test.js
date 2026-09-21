'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeIdentityRouter } = require('../../routes/identity');

function cookie(token) { return `ml_session=${token}`; }

async function start(service) {
  const app = express();
  app.use(express.json());
  app.use(makeIdentityRouter({ mode: 'test', identityService: service }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

async function request(base, path, { method = 'GET', token, csrf, body, origin = base } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(origin ? { origin } : {}),
      ...(token ? { cookie: cookie(token) } : {}),
      ...(csrf ? { 'x-csrf-token': csrf } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, body: await response.json() };
}

test('UE-T04 HTTP contract keeps registration pending and admin decisions authenticated', async () => {
  const adminToken = 'a'.repeat(43);
  const userToken = 'b'.repeat(43);
  const calls = [];
  const service = {
    requestRegistration: async (input) => { calls.push(['request', input.email]); return { accepted: true }; },
    verifyEmail: async (token) => { calls.push(['verify', token]); return token === 'v'.repeat(43); },
    current: async (token) => token === adminToken
      ? { user: { id: '1', role: 'SUPERADMIN' }, csrfHash: Buffer.alloc(32), sessionId: 'admin' }
      : token === userToken ? { user: { id: '2', role: 'USER' }, csrfHash: Buffer.alloc(32), sessionId: 'user' } : null,
    validCsrf: (_session, supplied) => supplied === 'valid-csrf',
    listManagedAccounts: async () => [{ id: '3', email: 'pending@example.invalid', name: 'Pendent', status: 'PENDING_APPROVAL' }],
    decideAccount: async (decision) => { calls.push(['decision', decision]); return decision.action === 'approve'; },
  };
  const { server, base } = await start(service);
  try {
    const registration = await request(base, '/api/v1/auth/request', {
      method: 'POST', body: { name: 'Usuari', email: 'new@example.invalid', password: 'synthetic-passphrase' },
    });
    assert.equal(registration.response.status, 202);
    assert.deepEqual(registration.body, { ok: true });

    const verify = await request(base, '/api/v1/auth/verify-email', {
      method: 'POST', body: { token: 'v'.repeat(43) },
    });
    assert.equal(verify.response.status, 200);
    assert.equal(verify.body.status, 'PENDING_APPROVAL');

    assert.equal((await request(base, '/api/v1/admin/accounts')).response.status, 401);
    assert.equal((await request(base, '/api/v1/admin/accounts', { token: userToken })).response.status, 403);
    const list = await request(base, '/api/v1/admin/accounts', { token: adminToken });
    assert.equal(list.response.status, 200);
    assert.equal(list.body.items[0].status, 'PENDING_APPROVAL');
    assert.equal(list.response.headers.get('cache-control'), 'no-store');

    assert.equal((await request(base, '/api/v1/admin/accounts/3/approve', {
      method: 'POST', token: adminToken, csrf: 'wrong', body: {},
    })).response.status, 403);
    assert.equal((await request(base, '/api/v1/admin/accounts/3/approve', {
      method: 'POST', token: adminToken, csrf: 'valid-csrf', origin: 'https://evil.invalid', body: {},
    })).response.status, 403);
    const approve = await request(base, '/api/v1/admin/accounts/3/approve', {
      method: 'POST', token: adminToken, csrf: 'valid-csrf', body: {},
    });
    assert.equal(approve.response.status, 200);
    assert.deepEqual(calls.at(-1), ['decision', { actorId: '1', targetId: '3', action: 'approve' }]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
