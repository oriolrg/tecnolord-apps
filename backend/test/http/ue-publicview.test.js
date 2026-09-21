'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makePublicViewRouter } = require('../../routes/publicView');

const ID = '11111111-1111-4111-8111-111111111111';
const ADMIN_TOKEN = 'a'.repeat(43);
const USER_TOKEN = 'u'.repeat(43);

test('UE-T10 public-view HTTP contract is public to read and admin-only to mutate', async () => {
  const calls = [];
  const identityService = {
    async current(token) {
      if (token === ADMIN_TOKEN) return { user: { id: '1', role: 'SUPERADMIN' } };
      if (token === USER_TOKEN) return { user: { id: '2', role: 'USER' } };
      return null;
    },
    validCsrf(_session, value) { return value === 'valid-csrf'; },
  };
  const publicView = {
    async get(options) {
      calls.push(['get', options]);
      return { station: null, card_ids: ['temperature'], revision: 2 };
    },
    async update(actorId, body) {
      calls.push(['update', actorId, body]);
      if (body.revision === 1) return { conflict: true };
      if (body.station_id.endsWith('2')) return { notFound: true };
      if (!body.card_ids?.length) return { invalid: true };
      return { config: { station: { id: body.station_id }, card_ids: body.card_ids, revision: 3 } };
    },
  };
  const app = express();
  app.use(express.json());
  app.use(makePublicViewRouter({ identityService, publicView, mode: 'test' }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, { method = 'GET', token, csrf = 'valid-csrf', origin = base, body } = {}) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        origin, ...(token ? { cookie: `ml_session=${token}` } : {}),
        ...(csrf ? { 'x-csrf-token': csrf } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { response, body: await response.json() };
  }
  try {
    const publicResult = await request('/api/v1/public-view');
    assert.equal(publicResult.response.status, 200);
    assert.equal(publicResult.response.headers.get('cache-control'), 'no-store, max-age=0');
    assert.match(publicResult.response.headers.get('vary'), /Cookie/);
    assert.equal((await request('/api/v1/admin/public-view')).response.status, 401);
    assert.equal((await request('/api/v1/admin/public-view', { token: USER_TOKEN })).response.status, 403);
    assert.equal((await request('/api/v1/admin/public-view', { token: ADMIN_TOKEN })).response.status, 200);
    assert.equal((await request('/api/v1/admin/public-view', {
      method: 'PUT', token: ADMIN_TOKEN, csrf: 'bad',
      body: { station_id: ID, card_ids: ['temperature'], revision: 2 },
    })).response.status, 403);
    assert.equal((await request('/api/v1/admin/public-view', {
      method: 'PUT', token: ADMIN_TOKEN, origin: 'https://evil.invalid',
      body: { station_id: ID, card_ids: ['temperature'], revision: 2 },
    })).response.status, 403);
    assert.equal((await request('/api/v1/admin/public-view', {
      method: 'PUT', token: ADMIN_TOKEN, body: { station_id: ID, card_ids: [], revision: 2 },
    })).response.status, 400);
    assert.equal((await request('/api/v1/admin/public-view', {
      method: 'PUT', token: ADMIN_TOKEN, body: { station_id: ID, card_ids: ['temperature'], revision: 1 },
    })).response.status, 409);
    assert.equal((await request('/api/v1/admin/public-view', {
      method: 'PUT', token: ADMIN_TOKEN,
      body: { station_id: '22222222-2222-4222-8222-222222222222', card_ids: ['temperature'], revision: 2 },
    })).response.status, 404);
    const updated = await request('/api/v1/admin/public-view', {
      method: 'PUT', token: ADMIN_TOKEN,
      body: { station_id: ID, card_ids: ['humidity', 'temperature'], revision: 2 },
    });
    assert.equal(updated.response.status, 200);
    assert.deepEqual(calls.at(-1), ['update', '1', {
      station_id: ID, card_ids: ['humidity', 'temperature'], revision: 2,
    }]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
