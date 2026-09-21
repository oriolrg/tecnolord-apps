'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeGrafanaRouter } = require('../../routes/grafana');

const ID = '11111111-1111-4111-8111-111111111111';
const ADMIN_TOKEN = 'a'.repeat(43);
const USER_TOKEN = 'u'.repeat(43);

test('UE-T14 Grafana HTTP contract is read-only, admin-only and sanitizes upstream errors', async () => {
  const calls = [];
  const identityService = {
    async current(token) {
      if (token === ADMIN_TOKEN) return { user: { id: '1', role: 'SUPERADMIN' } };
      if (token === USER_TOKEN) return { user: { id: '2', role: 'USER' } };
      return null;
    },
  };
  const grafana = {
    async list() { calls.push(['list']); return [{ id: ID, access_scope: 'INTERNAL_ONLY' }]; },
    async query(id) {
      calls.push(['query', id]);
      if (id === ID) return { data: { station: { id }, source: { access_scope: 'INTERNAL_ONLY' }, series: [] } };
      if (id.endsWith('2')) return { disabled: true };
      if (id.endsWith('3')) return { upstreamError: 'AUTH_REQUIRED' };
      return { notFound: true };
    },
  };
  const app = express(); app.use(makeGrafanaRouter({ identityService, grafana }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, token) {
    const response = await fetch(`${base}${path}`, { headers: token ? { cookie: `ml_session=${token}` } : {} });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { response, body };
  }
  try {
    assert.equal((await request('/api/v1/admin/grafana/stations')).response.status, 401);
    assert.equal((await request('/api/v1/admin/grafana/stations', USER_TOKEN)).response.status, 403);
    const list = await request('/api/v1/admin/grafana/stations', ADMIN_TOKEN);
    assert.equal(list.response.status, 200);
    assert.equal(list.response.headers.get('cache-control'), 'no-store, max-age=0');
    assert.match(list.response.headers.get('vary'), /Cookie/);
    assert.equal((await request(`/api/v1/admin/grafana/stations/${ID}/current`, ADMIN_TOKEN)).response.status, 200);
    assert.equal((await request('/api/v1/admin/grafana/stations/22222222-2222-4222-8222-222222222222/current', ADMIN_TOKEN)).response.status, 503);
    const auth = await request('/api/v1/admin/grafana/stations/33333333-3333-4333-8333-333333333333/current', ADMIN_TOKEN);
    assert.equal(auth.response.status, 502);
    assert.deepEqual(auth.body, { error: 'grafana_upstream', code: 'AUTH_REQUIRED' });
    assert.equal((await request('/api/v1/admin/grafana/stations/44444444-4444-4444-8444-444444444444/current', ADMIN_TOKEN)).response.status, 404);
    assert.equal((await request(`/api/v1/grafana/stations/${ID}/current`, ADMIN_TOKEN)).response.status, 404);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
