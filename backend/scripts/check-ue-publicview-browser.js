'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let config = {
    station: { id: A, name: 'Meteo Synthetic 01' },
    configured_station_id: A,
    card_ids: ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv'],
    revision: 1, eligible: true,
  };
  const writes = [];
  let browser;

  async function contextFor(role) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const external = [], errors = [];
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) { external.push(url.href); return route.abort(); }
      if (url.pathname === '/api/v1/auth/me') {
        if (role !== 'admin') return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"unauthenticated"}' });
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
          user: { id: '1', name: 'Administradora', email: 'admin@example.invalid', role: 'SUPERADMIN' },
          csrf_token: 'synthetic-csrf',
        }) });
      }
      if (url.pathname === '/api/v1/admin/accounts') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      }
      if (url.pathname === '/api/v1/me/stations') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      }
      if (url.pathname === '/api/v1/stations') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [
          { id: A, name: 'Meteo Synthetic 01', lifecycle: 'ACTIVE', visibility: 'PUBLIC', revision: 1 },
          { id: B, name: 'Meteo Synthetic 02', lifecycle: 'ACTIVE', visibility: 'PUBLIC', revision: 1 },
        ] }) });
      }
      if (url.pathname === '/api/v1/admin/public-view') {
        if (route.request().method() === 'PUT') {
          const body = route.request().postDataJSON();
          writes.push(body);
          config = {
            station: { id: body.station_id, name: body.station_id === B ? 'Meteo Synthetic 02' : 'Meteo Synthetic 01' },
            configured_station_id: body.station_id, card_ids: body.card_ids,
            revision: config.revision + 1, eligible: true,
          };
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ config }) });
      }
      if (url.pathname === '/api/v1/public-view') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ config: {
          station: config.station, card_ids: config.card_ids, revision: config.revision,
        } }) });
      }
      if (url.pathname === `/api/v1/stations/${B}/current`) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
          station: { id: B, name: 'Meteo Synthetic 02' },
          items: [{ instant: new Date().toISOString(), temp_c: 7, humitat_pct: 82 }],
          source: { freshness: 'FRESH', error: null },
        }) });
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    return { context, page, external, errors };
  }

  try {
    browser = await chromium.launch({
      executablePath: process.env.MAP_CHROME || chromium.executablePath(),
      headless: true, args: ['--no-sandbox'],
    });
    const admin = await contextFor('admin');
    await admin.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await admin.page.locator('#account-public-view-form').waitFor({ state: 'visible' });
    await admin.page.locator('#account-public-view-station').selectOption(B);
    for (const id of ['wind', 'rain', 'pressure', 'uv']) {
      await admin.page.locator(`[data-card-id="${id}"]`).uncheck();
    }
    for (let index = 0; index < 4; index += 1) {
      await admin.page.getByTitle('Puja Humitat').click();
    }
    await admin.page.getByRole('button', { name: 'Desa la vista pública', exact: true }).click();
    await admin.page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('actualitzada'));
    assert.deepEqual(writes, [{ station_id: B, card_ids: ['humidity', 'temperature'], revision: 1 }]);
    assert.equal(await admin.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    const visitor = await contextFor('visitor');
    await visitor.page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    await visitor.page.waitForFunction(() => document.querySelector('#meteo-summary')?.textContent.includes('Meteo Synthetic 02'));
    await visitor.page.waitForFunction(() => document.querySelectorAll('#meteo-cards > *').length === 2);
    const cards = await visitor.page.locator('#meteo-cards > *').allTextContents();
    assert.match(cards[0], /Humitat/);
    assert.match(cards[1], /Temperatura/);
    assert.equal(cards.join(' ').includes('Pluja'), false);
    assert.equal(await visitor.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(admin.external, []);
    assert.deepEqual(visitor.external, []);
    assert.deepEqual(admin.errors, []);
    assert.deepEqual(visitor.errors, []);
    await admin.context.close();
    await visitor.context.close();
    console.log('UE-T10 browser PASS: admin station/card configuration, visitor resolution, 375 px, 0 external requests');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
