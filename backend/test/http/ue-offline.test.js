'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createPreviewApp } = require('../../scripts/serve-map-demo');

async function withPreview(callback) {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('synthetic preview serves Meteo, Cabals, forecast and map from deterministic local fixtures', async () => {
  await withPreview(async (base) => {
    for (const route of ['/meteo/', '/meteo/mapa/']) {
      const response = await fetch(`${base}${route}`);
      assert.equal(response.status, 200, route);
      assert.match(response.headers.get('content-security-policy'), /connect-src 'self';/);
      assert.doesNotMatch(response.headers.get('content-security-policy'), /tile\.openstreetmap\.org/);
    }
    const config = await (await fetch(`${base}/meteo/runtime-config.js`)).text();
    assert.match(config, /SYNTHETIC_DATA: true/);

    const meteo = await (await fetch(`${base}/api/v1/mesures/darreres?limit=4`)).json();
    assert.equal(meteo.ok, true);
    assert.equal(meteo.items.length, 4);
    assert.equal(meteo.items[0].temp_c, 18.5);
    assert.equal(meteo.items[2].temp_c, 0);
    assert.equal(meteo.items[3].temp_c, 50);
    assert.equal(meteo.items.some((row) => 'extres' in row || 'cas' in row), false);
    assert.equal((await (await fetch(`${base}/api/v1/mesures/darreres?estacio=unknown`)).json()).items.length, 0);

    const hidro = await (await fetch(`${base}/api/v1/hidro/darreres?limit=20`)).json();
    assert.equal(hidro.items.length, 4);
    assert.equal(hidro.items.some((row) => row.nom === 'Synthetic River 01'), true);
    assert.equal(hidro.items.some((row) => 'extres' in row), false);

    const previ = await (await fetch(`${base}/api/v1/previ/48h?station=synthetic-meteo-01&source=synthetic&model=fixture-v1`)).json();
    assert.equal(previ.run.source, 'synthetic');
    assert.equal(previ.items.length, 4);
    assert.equal(previ.items[0].temp_c, 16.5);

    const map = await (await fetch(`${base}/api/v1/map/stations`)).json();
    assert.equal(map.features.length, 6);
  });
});

test('synthetic preview refuses arbitrary upstream parameters and live mode requires an explicit choice', async () => {
  assert.throws(() => createPreviewApp({ mode: 'production' }), /MAP_PREVIEW_MODE/);
  const live = createPreviewApp({ mode: 'live' });
  assert.equal(typeof live, 'function');
  await withPreview(async (base) => {
    for (const route of [
      '/api/v1/mesures/darreres?limit=301',
      '/api/v1/mesures/darreres?url=https://example.invalid',
      '/api/v1/hidro/darreres?limit=0',
      '/api/v1/previ/48h?url=https://example.invalid',
    ]) assert.equal((await fetch(`${base}${route}`)).status, 400, route);
  });
});
