'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeAdminCatalogRouter } = require('../../routes/adminCatalog');

const ID = '11111111-1111-4111-8111-111111111111';
const ADMIN_TOKEN = 'a'.repeat(43);
const USER_TOKEN = 'u'.repeat(43);
const BODY = {
  name: 'Administrada', description: '', source_namespace: 'GRAFANA', external_id: 'grafana-1',
  longitude: 1.5, latitude: 42.1, accuracy_m: 10, provenance: 'ADMIN_VERIFIED', reference_label: 'acta',
};

test('UE-T11 external-station HTTP contract is admin-only, CSRF protected and conflict aware', async () => {
  const calls = [];
  const identityService = {
    async current(token) {
      if (token === ADMIN_TOKEN) return { user: { id: '1', role: 'SUPERADMIN' } };
      if (token === USER_TOKEN) return { user: { id: '2', role: 'USER' } };
      return null;
    },
    validCsrf(_session, token) { return token === 'valid-csrf'; },
  };
  const adminCatalog = {
    async list() { calls.push(['list']); return []; },
    async get(id) { calls.push(['get', id]); return id === ID ? { id } : null; },
    async create(actorId, body) {
      calls.push(['create', actorId, body]);
      if (body.external_id === 'duplicate') return { duplicate: true };
      return body.name ? { station: { id: ID, name: body.name } } : { invalid: true };
    },
    async update(actorId, id, body) {
      calls.push(['update', actorId, id, body]);
      if (body.revision === 8) return { conflict: true };
      return id === ID ? { station: { id, revision: 2 } } : { notFound: true };
    },
  };
  const app = express(); app.use(express.json());
  app.use(makeAdminCatalogRouter({ identityService, adminCatalog, mode: 'test' }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path = '', { method = 'GET', token, csrf = 'valid-csrf', origin = base, body } = {}) {
    const response = await fetch(`${base}/api/v1/admin/external-stations${path}`, {
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
    assert.equal((await request('', { method: 'POST', token: ADMIN_TOKEN, csrf: 'bad', body: BODY })).response.status, 403);
    assert.equal((await request('', { method: 'POST', token: ADMIN_TOKEN, origin: 'https://evil.invalid', body: BODY })).response.status, 403);
    const created = await request('', { method: 'POST', token: ADMIN_TOKEN, body: BODY });
    assert.equal(created.response.status, 201);
    assert.deepEqual(calls.at(-1), ['create', '1', BODY]);
    assert.equal((await request('', {
      method: 'POST', token: ADMIN_TOKEN, body: { ...BODY, external_id: 'duplicate' },
    })).response.status, 409);
    assert.equal((await request(`/${ID}`, {
      method: 'PUT', token: ADMIN_TOKEN, body: { ...BODY, revision: 8 },
    })).response.status, 409);
    assert.equal((await request('/22222222-2222-4222-8222-222222222222', {
      method: 'PUT', token: ADMIN_TOKEN, body: { ...BODY, revision: 0 },
    })).response.status, 404);
    assert.equal((await request(`/${ID}`, { token: ADMIN_TOKEN })).response.status, 200);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
