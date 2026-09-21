'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeStationsRouter } = require('../../routes/stations');

test('UE-T06 HTTP connector contract is owner-only, CSRF protected and write-only', async () => {
  const token = 'c'.repeat(43);
  const calls = [];
  const identityService = {
    current: async (value) => value === token ? { user: { id: '7', role: 'USER' } } : null,
    validCsrf: (_session, value) => value === 'csrf-ok',
  };
  const connectorRegistry = {
    getOwn: async (ownerId, id) => ownerId === '7' && id.startsWith('8b1d')
      ? { type: 'ECOWITT', enabled: true, status: 'READY', configured: true } : null,
    setEcowitt: async (ownerId, id, body) => {
      calls.push({ ownerId, id, body });
      return body.url ? { invalid: true }
        : { connector: { type: 'ECOWITT', enabled: true, status: 'READY', configured: true } };
    },
  };
  const stationCatalog = {
    listOwn: async () => [], listPublic: async () => [], listAllForAdmin: async () => [],
  };
  const app = express();
  app.use(express.json());
  app.use(makeStationsRouter({
    pool: { query: async () => ({ rows: [] }) }, identityService, stationCatalog, connectorRegistry, mode: 'test',
  }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const id = '8b1d7549-33bc-42e8-97bb-e6e8217d5ca0';
  const call = async (method, body, csrf = 'csrf-ok') => {
    const response = await fetch(`${base}/api/v1/me/stations/${id}/connector/ecowitt`, {
      method,
      headers: { origin: base, cookie: `ml_session=${token}`, 'content-type': 'application/json', 'x-csrf-token': csrf },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { response, body: await response.json() };
  };
  try {
    const status = await call('GET');
    assert.equal(status.response.status, 200);
    assert.deepEqual(status.body, { connector: { type: 'ECOWITT', enabled: true, status: 'READY', configured: true } });
    const secrets = { application_key: 'app-secret', api_key: 'api-secret', mac: 'device-secret' };
    assert.equal((await call('PUT', secrets, 'bad')).response.status, 403);
    const saved = await call('PUT', secrets);
    assert.equal(saved.response.status, 200);
    assert.equal(JSON.stringify(saved.body).includes('secret'), false);
    assert.deepEqual(calls.at(-1), { ownerId: '7', id, body: secrets });
    assert.equal((await call('PUT', { ...secrets, url: 'https://evil.invalid' })).response.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
