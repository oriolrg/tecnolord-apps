'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makePreferencesRouter } = require('../../routes/preferences');

test('UE-T09 preference HTTP contract requires account, CSRF, origin and explicit mutation', async () => {
  const token = 'p'.repeat(43);
  const calls = [];
  const identityService = {
    async current(value) { return value === token ? { user: { id: '7', role: 'USER' } } : null; },
    validCsrf(_session, value) { return value === 'valid-csrf'; },
  };
  const preferences = {
    async get(userId) { calls.push(['get', userId]); return { default_station: null, revision: 0, invalidated: false }; },
    async setDefault(userId, body) { calls.push(['set', userId, body]); return body.station_id.endsWith('1')
      ? { preference: { default_station: { id: body.station_id }, revision: 1, invalidated: false } }
      : { notFound: true }; },
    async clearDefault(userId, body) { calls.push(['clear', userId, body]); return { preference: { default_station: null, revision: 2, invalidated: false } }; },
  };
  const app = express();
  app.use(express.json());
  app.use(makePreferencesRouter({ identityService, preferences, mode: 'test' }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, { method = 'GET', auth = true, csrf = 'valid-csrf', origin = base, body } = {}) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        origin, ...(auth ? { cookie: `ml_session=${token}` } : {}),
        ...(csrf ? { 'x-csrf-token': csrf } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { response, body: await response.json() };
  };
  try {
    assert.equal((await request('/api/v1/me/preferences', { auth: false })).response.status, 401);
    const get = await request('/api/v1/me/preferences');
    assert.equal(get.response.status, 200);
    assert.equal(get.response.headers.get('cache-control'), 'no-store, max-age=0');
    assert.match(get.response.headers.get('vary'), /Cookie/);
    assert.equal((await request('/api/v1/me/preferences/default-station', {
      method: 'PUT', csrf: 'bad', body: { station_id: '11111111-1111-4111-8111-111111111111', revision: 0 },
    })).response.status, 403);
    assert.equal((await request('/api/v1/me/preferences/default-station', {
      method: 'PUT', origin: 'https://evil.invalid', body: { station_id: '11111111-1111-4111-8111-111111111111', revision: 0 },
    })).response.status, 403);
    const set = await request('/api/v1/me/preferences/default-station', {
      method: 'PUT', body: { station_id: '11111111-1111-4111-8111-111111111111', revision: 0 },
    });
    assert.equal(set.response.status, 200);
    assert.deepEqual(calls.at(-1), ['set', '7', { station_id: '11111111-1111-4111-8111-111111111111', revision: 0 }]);
    assert.equal((await request('/api/v1/me/preferences/default-station', {
      method: 'PUT', body: { station_id: '22222222-2222-4222-8222-222222222222', revision: 1 },
    })).response.status, 404);
    assert.equal((await request('/api/v1/me/preferences/default-station', {
      method: 'DELETE', body: { revision: 1 },
    })).response.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
