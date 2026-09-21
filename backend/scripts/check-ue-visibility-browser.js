'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const stationId = '33333333-3333-4333-8333-333333333333';
const station = { id: stationId, name: 'Privada navegador', description: null,
  lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 3, can_edit: true };
const privateFeature = {
  type: 'Feature', id: stationId, geometry: { type: 'Point', coordinates: [2.1734, 41.3851] },
  properties: {
    public_station_id: stationId, public_name: station.name, geo_publication: 'EXACT',
    access_scope: 'OWNER', visibility: 'PRIVATE', observed_at: '2030-01-15T11:55:00.000Z',
    catalog_version: 'ue-map-browser', provenance: { source: 'ECOWITT', licence_or_legal_basis_ref: 'OWNER_CONSENT' },
    sensors: [{ sensor_id: 'ecowitt-outdoor', fields: [{ field_id: 'temperature', unit: 'celsius',
      quality: 'OK', freshness: 'FRESCA', review: 'NORMAL', reliable: true, current_value: 14.2, last_value: 14.2 }] }],
  },
};

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || chromium.executablePath(),
      headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const external = [], errors = [];
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) { external.push(url.href); return route.abort(); }
      if (url.pathname === '/api/v1/me/map') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ type: 'FeatureCollection', features: [privateFeature] }) });
      if (url.pathname === '/api/v1/admin/map') return route.fulfill({ status: 403, contentType: 'application/json', body: '{"error":"forbidden"}' });
      if (url.pathname === '/api/v1/auth/me') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: '7', email: 'owner@example.invalid', name: 'Propietari', role: 'USER' }, csrf_token: 'c'.repeat(43) }) });
      if (url.pathname === '/api/v1/me/stations') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [station] }) });
      if (url.pathname === `/api/v1/me/stations/${stationId}/location`) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ revision: 3, location: { mode: 'APPROX_5KM', longitude: 2.1734, latitude: 41.3851, accuracy_m: 5000, published: false, consented: false, policy_version: 'ue-user-grid-v1' } }) });
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(`${origin}/meteo/mapa/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction((id) => [...document.querySelectorAll('#station-list li')].some((item) => item.textContent.includes(id)), station.name);
    assert.match(await page.locator('#station-list').textContent(), /Privada navegador.*Vista privada/s);
    await page.getByRole('button', { name: station.name }).click();
    assert.match(await page.locator('#dialog-content').textContent(), /coordenada exacta visible només amb la teva sessió/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    await page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await page.locator('.account-station-edit input').first().waitFor();
    assert.equal(await page.locator('.account-station-edit input').first().inputValue(), station.name);
    await page.locator('details.account-location summary').click();
    await page.waitForFunction(() => document.querySelector('.account-location input[type="number"]')?.value === '2.1734');
    assert.equal(await page.getByLabel('Precisió pública').inputValue(), 'APPROX_5KM');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
    console.log('UE-T08 browser PASS: private layer, exact-location notice, publication form, 375 px, 0 external requests');
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
