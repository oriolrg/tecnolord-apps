'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeStationHistoryRouter } = require('../../routes/stationHistory');
const { makeTasksRouter } = require('../../routes/tasks');

test('UE-T17 history policy HTTP contract is admin-only, CSRF protected and exposes preview conflicts', async () => {
  const calls = [];
  const identityService = {
    async current(token) {
      if (token === 'a'.repeat(43)) return { user: { id: 1, role: 'SUPERADMIN' } };
      if (token === 'u'.repeat(43)) return { user: { id: 2, role: 'USER' } };
      return null;
    },
    validCsrf(_current, token) { return token === 'csrf'; },
  };
  const historyService = {
    async list() { calls.push('list'); return []; },
    async preview(actor, id, days) { calls.push(['preview', actor, id, days]); return { station_id: id, retention_days: days, delete_count: 2 }; },
    async update(actor, id, body) { calls.push(['update', actor, id, body]); return body.revision === 9 ? { conflict: true } : { policy: body }; },
  };
  const app = express(); app.use(express.json()); app.use(makeStationHistoryRouter({ identityService, historyService, mode: 'test' }));
  const server = await new Promise((resolve) => { const active = app.listen(0, '127.0.0.1', () => resolve(active)); });
  const base = `http://127.0.0.1:${server.address().port}`; const url = `${base}/api/v1/admin/station-history-policies`;
  try {
    assert.equal((await fetch(url)).status, 401);
    assert.equal((await fetch(url, { headers: { cookie: `ml_session=${'u'.repeat(43)}` } })).status, 403);
    const admin = { cookie: `ml_session=${'a'.repeat(43)}` };
    const listed = await fetch(url, { headers: admin }); assert.equal(listed.status, 200); assert.equal(listed.headers.get('cache-control'), 'no-store');
    assert.equal((await fetch(`${url}/station/preview`, { method: 'POST', headers: { ...admin, origin: base,
      'content-type': 'application/json' }, body: '{"retention_days":30}' })).status, 403);
    const mutationHeaders = { ...admin, origin: base, 'x-csrf-token': 'csrf', 'content-type': 'application/json' };
    const preview = await fetch(`${url}/station/preview`, { method: 'POST', headers: mutationHeaders, body: '{"retention_days":30}' });
    assert.equal(preview.status, 200); assert.equal((await preview.json()).preview.delete_count, 2);
    const conflict = await fetch(`${url}/station`, { method: 'PUT', headers: mutationHeaders,
      body: '{"enabled":true,"capture_interval_minutes":15,"retention_days":30,"revision":9}' });
    assert.equal(conflict.status, 409);
    assert.deepEqual(calls.slice(0, 2), ['list', ['preview', 1, 'station', 30]]);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test('UE-T17 protected worker captures and purges due stations in order', async () => {
  const calls = [];
  const app = express();
  app.use(makeTasksRouter({
    checkApiKey(req, res, next) { return req.get('x-api-key') === 'worker-key' ? next() : res.status(401).json({ error: 'unauthorized' }); },
    taskRunner: async () => ({ ok: true }),
    historyService: {
      async captureDue() { calls.push('capture'); return [{ station_id: 1, inserted: true }]; },
      async purgeDue() { calls.push('purge'); return [{ station_id: 1, deleted: 2 }]; },
    },
  }));
  const server = await new Promise((resolve) => { const active = app.listen(0, '127.0.0.1', () => resolve(active)); });
  const url = `http://127.0.0.1:${server.address().port}/api/tasks/capture-station-history`;
  try {
    assert.equal((await fetch(url, { method: 'POST' })).status, 401);
    const response = await fetch(url, { method: 'POST', headers: { 'x-api-key': 'worker-key' } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      ok: true,
      captures: [{ station_id: 1, inserted: true }],
      purges: [{ station_id: 1, deleted: 2 }],
    });
    assert.deepEqual(calls, ['capture', 'purge']);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test('UE-T17 protected worker reports one station failure after allowing the remaining work to finish', async () => {
  const app = express();
  app.use(makeTasksRouter({
    checkApiKey(_req, _res, next) { next(); }, taskRunner: async () => ({ ok: true }),
    historyService: {
      async captureDue() { return [{ station_id: 1, inserted: true },
        { station_id: 2, skipped: true, failed: true, reason: 'capture_failed' }]; },
      async purgeDue() { return [{ station_id: 1, deleted: 2 }, { station_id: 2, deleted: 3 }]; },
    },
  }));
  const server = await new Promise((resolve) => { const active = app.listen(0, '127.0.0.1', () => resolve(active)); });
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/tasks/capture-station-history`, { method: 'POST' });
    assert.equal(response.status, 500);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(body.purges[1].deleted, 3);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
