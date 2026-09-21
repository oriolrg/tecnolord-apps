'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeLiveMapPreviewRouter } = require('../../routes/liveMapPreview');

async function withServer(fetchImpl, callback) {
  const app = express();
  app.use(makeLiveMapPreviewRouter({ fetchImpl, now: () => Date.parse('2026-09-18T05:35:00Z') }));
  const server = await new Promise((resolve) => {
    const active = app.listen(0, '127.0.0.1', () => resolve(active));
  });
  try { await callback(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}

function liveSources(url) {
  if (new URL(url).hostname === 'tecnolord.cat') return {
    ok: true, json: async () => ({ ok: true, items: [{ instant: '2026-09-18T05:30:00Z', temp_c: 11.2, humitat_pct: 74 }] }),
  };
  return { ok: true, json: async () => [
    16, 17, 18, 19, 10,
  ].map((temperature) => ({ current: { time: '2026-09-18T05:30', temperature_2m: temperature, relative_humidity_2m: 60 } })) };
}

test('real map keeps observations distinct from model values and shares one catalog version', async () => {
  await withServer(async (url) => liveSources(url), async (base) => {
    const response = await fetch(`${base}/api/v1/map/stations`);
    assert.equal(response.status, 200);
    const collection = await response.json();
    assert.equal(collection.features.length, 6);
    assert.match(collection.features[0].properties.provenance.source, /observació/);
    assert.match(collection.features[1].properties.provenance.source, /model, no observació/);
    assert.deepEqual(collection.features[0].geometry.coordinates, [1.59, 42.14]);
    const version = response.headers.get('x-catalog-version');
    const summaryResponse = await fetch(`${base}/api/v1/map/summary?sensor=temperature`);
    assert.equal(summaryResponse.headers.get('x-catalog-version'), version);
    const summary = await summaryResponse.json();
    assert.deepEqual(summary.sources, ['MeteoLord', 'Open-Meteo']);
    assert.equal(summary.count, 6);
    assert.equal(summary.temperature_min, 10);
    assert.equal((await fetch(`${base}/api/v1/map/stations/model-barcelona`)).status, 200);
    assert.equal((await fetch(`${base}/api/v1/map/stations?freshness=INVALID`)).status, 400);
  });
});

test('real map does not show obsolete observations as current temperatures', async () => {
  await withServer(async (url) => new URL(url).hostname === 'tecnolord.cat'
    ? { ok: true, json: async () => ({ ok: true, items: [{ instant: '2026-09-17T00:00:00Z', temp_c: 25 }] }) }
    : { ok: false }, async (base) => {
    const response = await fetch(`${base}/api/v1/map/stations`);
    assert.equal(response.status, 200);
    const station = (await response.json()).features[0].properties;
    assert.equal(station.sensors[0].fields[0].current_value, null);
    assert.equal(station.sensors[0].fields[0].last_value, 25);
    assert.equal(station.sensors[0].fields[0].freshness, 'OBSOLETA');
  });
});

test('real map returns an unavailable state when both live sources fail', async () => {
  await withServer(async () => ({ ok: false }), async (base) => {
    const response = await fetch(`${base}/api/v1/map/stations`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'live_sources_unavailable' });
  });
});
