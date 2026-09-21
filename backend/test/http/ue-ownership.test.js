'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeStationsRouter } = require('../../routes/stations');

test('UE-T05 HTTP contract requires session, CSRF and owner-scoped service calls', async () => {
  const ownerToken = 'o'.repeat(43);
  const adminToken = 'a'.repeat(43);
  const calls = [];
  const sample = {
    id: '8b1d7549-33bc-42e8-97bb-e6e8217d5ca0', name: 'Sintètica', description: null,
    lifecycle: 'DRAFT', visibility: 'PRIVATE', revision: 0, can_edit: true,
  };
  const identityService = {
    current: async (token) => token === ownerToken
      ? { user: { id: '2', role: 'USER' }, csrfHash: Buffer.alloc(32) }
      : token === adminToken ? { user: { id: '1', role: 'SUPERADMIN' }, csrfHash: Buffer.alloc(32) } : null,
    validCsrf: (_session, token) => token === 'valid-csrf',
  };
  const stationCatalog = {
    listOwn: async (id) => { calls.push(['listOwn', id]); return [sample]; },
    create: async (id, body) => { calls.push(['create', id, body.name]); return sample; },
    update: async (id, publicId) => id === '2' && publicId === sample.id ? { station: { ...sample, revision: 1 } } : { notFound: true },
    retire: async () => ({ station: { ...sample, lifecycle: 'RETIRED', can_edit: false } }),
    listAllForAdmin: async () => [sample],
    listPublic: async () => [],
    accessible: async ({ actor }) => actor?.id === '2' || actor?.role === 'SUPERADMIN'
      ? { public_id: sample.id, nom: sample.name, description: null, lifecycle: 'DRAFT', visibility: 'PRIVATE', revision: 0, owner_id: '2' }
      : null,
  };
  const app = express();
  app.use(express.json());
  app.use(makeStationsRouter({
    pool: { query: async () => ({ rows: [] }) }, identityService, stationCatalog, mode: 'test',
  }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, { method = 'GET', token, csrf, origin = base, body } = {}) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        origin,
        ...(token ? { cookie: `ml_session=${token}` } : {}),
        ...(csrf ? { 'x-csrf-token': csrf } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { response, body: await response.json() };
  };
  try {
    assert.equal((await call('/api/v1/me/stations')).response.status, 401);
    const own = await call('/api/v1/me/stations', { token: ownerToken });
    assert.equal(own.response.status, 200);
    assert.equal(own.body.items[0].id, sample.id);
    assert.equal((await call('/api/v1/me/stations', {
      method: 'POST', token: ownerToken, csrf: 'bad', body: { name: 'Nova' },
    })).response.status, 403);
    assert.equal((await call('/api/v1/me/stations', {
      method: 'POST', token: ownerToken, csrf: 'valid-csrf', origin: 'https://evil.invalid', body: { name: 'Nova' },
    })).response.status, 403);
    const created = await call('/api/v1/me/stations', {
      method: 'POST', token: ownerToken, csrf: 'valid-csrf', body: { name: 'Nova' },
    });
    assert.equal(created.response.status, 201);
    assert.deepEqual(calls.at(-1), ['create', '2', 'Nova']);
    assert.equal((await call('/api/v1/admin/stations', { token: ownerToken })).response.status, 403);
    assert.equal((await call('/api/v1/admin/stations', { token: adminToken })).response.status, 200);
    assert.equal((await call(`/api/v1/stations/${sample.id}`)).response.status, 404);
    assert.equal((await call(`/api/v1/stations/${sample.id}`, { token: ownerToken })).response.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
