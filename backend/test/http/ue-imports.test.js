'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeImportsRouter } = require('../../routes/imports');

const ADMIN_TOKEN = 'a'.repeat(43);
const USER_TOKEN = 'u'.repeat(43);
const INVENTORY = { source_namespace: 'GRAFANA', rows: [{ inventory_code: 'SYN001' }] };

test('UE-T13 import HTTP contract is admin-only, CSRF protected and conflict aware', async () => {
  const calls = [];
  const identityService = {
    async current(token) {
      if (token === ADMIN_TOKEN) return { user: { id: '1', role: 'SUPERADMIN' } };
      if (token === USER_TOKEN) return { user: { id: '2', role: 'USER' } };
      return null;
    },
    validCsrf(_session, token) { return token === 'valid-csrf'; },
  };
  const imports = {
    async list() { calls.push(['list']); return [{ id: '7' }]; },
    async get(id) { calls.push(['get', id]); return id === '7' ? { id } : null; },
    async stage(actor, body) { calls.push(['stage', actor, body]); return body.rows.length ? { batch: { id: '7' } } : { invalid: true }; },
    async apply(actor, id) { calls.push(['apply', actor, id]); return id === '7' ? { batch: { id } } : { conflict: true }; },
    async rollback(actor, id) { calls.push(['rollback', actor, id]); return id === '7' ? { batch: { id } } : { notFound: true }; },
  };
  const app = express(); app.use(express.json());
  app.use(makeImportsRouter({ identityService, imports, mode: 'test' }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path = '', { method = 'GET', token, csrf = 'valid-csrf', origin = base, body } = {}) {
    const response = await fetch(`${base}/api/v1/admin/imports${path}`, {
      method, headers: { origin, ...(token ? { cookie: `ml_session=${token}` } : {}),
        ...(csrf ? { 'x-csrf-token': csrf } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { response, body: await response.json() };
  }
  try {
    assert.equal((await request()).response.status, 401);
    assert.equal((await request('', { token: USER_TOKEN })).response.status, 403);
    const list = await request('', { token: ADMIN_TOKEN });
    assert.equal(list.response.status, 200);
    assert.equal(list.response.headers.get('cache-control'), 'no-store, max-age=0');
    assert.match(list.response.headers.get('vary'), /Cookie/);
    assert.equal((await request('/dry-run', { method: 'POST', token: ADMIN_TOKEN, csrf: 'bad', body: INVENTORY })).response.status, 403);
    assert.equal((await request('/dry-run', { method: 'POST', token: ADMIN_TOKEN, origin: 'https://evil.invalid', body: INVENTORY })).response.status, 403);
    assert.equal((await request('/dry-run', { method: 'POST', token: ADMIN_TOKEN, body: INVENTORY })).response.status, 201);
    assert.deepEqual(calls.at(-1), ['stage', '1', INVENTORY]);
    assert.equal((await request('/8/apply', { method: 'POST', token: ADMIN_TOKEN })).response.status, 409);
    assert.equal((await request('/8/rollback', { method: 'POST', token: ADMIN_TOKEN })).response.status, 404);
    assert.equal((await request('/7', { token: ADMIN_TOKEN })).response.status, 200);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
