'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeLiveMeteoPreviewRouter } = require('../../routes/liveMeteoPreview');

async function withServer(fetchImpl, callback) {
  const app = express();
  app.use(makeLiveMeteoPreviewRouter({ fetchImpl }));
  const server = await new Promise((resolve) => {
    const active = app.listen(0, '127.0.0.1', () => resolve(active));
  });
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('local Meteo preview retrieves the real public API through the same origin and excludes internal fields', async () => {
  let requested;
  await withServer(async (url) => {
    requested = url;
    return { ok: true, json: async () => ({ ok: true, items: [{ id: 1, estacio_id: 2, extres: { secret: true }, instant: '2026-09-18T05:15:02Z', temp_c: 16 }] }) };
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/mesures/darreres?limit=1`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { ok: true, items: [{ instant: '2026-09-18T05:15:02Z', temp_c: 16 }] });
  });
  assert.equal(requested.origin, 'https://tecnolord.cat');
  assert.equal(requested.searchParams.get('limit'), '1');
});

test('local Meteo preview rejects invalid queries and unavailable upstream data', async () => {
  let called = false;
  await withServer(async () => { called = true; throw new Error('offline'); }, async (base) => {
    assert.equal((await fetch(`${base}/api/v1/mesures/darreres?limit=999`)).status, 400);
    assert.equal(called, false);
    assert.equal((await fetch(`${base}/api/v1/mesures/darreres?url=https://example.com`)).status, 400);
    assert.equal(called, false);
    const response = await fetch(`${base}/api/v1/mesures/darreres?limit=1`);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false, error: 'upstream_unavailable' });
  });
});
