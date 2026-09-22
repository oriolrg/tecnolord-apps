'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeEstimationsRouter } = require('../../routes/estimations');

const ID = '15000000-0000-4000-8000-000000000001';

test('UE-T15 estimation HTTP contract is public, typed and read-only', async () => {
  const item = { kind: 'ESTIMATION', id: ID, name: 'Manresa', reference: { label: 'Manresa' },
    source: { attribution: 'CC BY 4.0' }, status: 'AVAILABLE', freshness: 'FRESH', values: { instant: '2026-09-21T12:00:00Z', temp_c: 0 } };
  const app = express(); app.use(makeEstimationsRouter({
    estimations: { async list() { return [item]; }, async current(id) { return id === ID ? item : null; } },
  }));
  const server = await new Promise((resolve) => { const active = app.listen(0, '127.0.0.1', () => resolve(active)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const list = await fetch(`${base}/api/v1/estimations`);
    assert.equal(list.status, 200); assert.match(list.headers.get('cache-control'), /no-store/);
    assert.equal((await list.json()).items[0].kind, 'ESTIMATION');
    const current = await fetch(`${base}/api/v1/estimations/${ID}/current`);
    const body = await current.json();
    assert.equal(current.status, 200); assert.equal(body.items[0].temp_c, 0);
    assert.equal(body.source.reference_label, 'Manresa');
    assert.equal((await fetch(`${base}/api/v1/estimations/invalid/current`)).status, 404);
    assert.equal((await fetch(`${base}/api/v1/estimations/${ID}/current`, { method: 'POST' })).status, 404);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
