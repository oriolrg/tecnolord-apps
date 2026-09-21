'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const A1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const A2 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
const B = '22222222-2222-4222-8222-222222222222';
const UNKNOWN = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const preferences = {
    a: { default_station: { id: A1, name: 'Pròpia A1' }, revision: 1, invalidated: false },
    b: { default_station: null, revision: 0, invalidated: false },
  };
  const writes = [];
  let browser;

  async function contextFor(user) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const external = [];
    const errors = [];
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) {
        external.push(url.href);
        return route.abort();
      }
      if (url.pathname === '/api/v1/auth/me') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
          user: { id: user, name: `Usuari ${user.toUpperCase()}`, role: 'USER' }, csrf_token: `csrf-${user}`,
        }) });
      }
      if (url.pathname === '/api/v1/me/preferences/default-station') {
        const body = route.request().postDataJSON();
        if (route.request().method() === 'PUT') {
          preferences[user] = {
            default_station: { id: body.station_id, name: body.station_id === A2 ? 'Pròpia A2' : 'Pública B' },
            revision: preferences[user].revision + 1, invalidated: false,
          };
          writes.push([user, body.station_id]);
        } else {
          preferences[user] = { default_station: null, revision: preferences[user].revision + 1, invalidated: false };
          writes.push([user, null]);
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ preference: preferences[user] }) });
      }
      if (url.pathname === '/api/v1/me/preferences') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ preference: preferences[user] }) });
      }
      if (url.pathname === '/api/v1/me/stations') {
        const items = user === 'a' ? [
          { id: A1, name: 'Pròpia A1', lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 1 },
          { id: A2, name: 'Pròpia A2', lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 1 },
        ] : [{ id: B, name: 'Pública B', lifecycle: 'ACTIVE', visibility: 'PUBLIC', revision: 1 }];
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items }) });
      }
      if (url.pathname === '/api/v1/stations') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [
          { id: B, name: 'Pública B', lifecycle: 'ACTIVE', visibility: 'PUBLIC', revision: 1 },
        ] }) });
      }
      const current = url.pathname.match(/^\/api\/v1\/stations\/([^/]+)\/current$/);
      if (current) {
        if (current[1] === UNKNOWN) {
          return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"not_found"}' });
        }
        const temp = current[1] === B ? 7 : current[1] === A2 ? 12 : 11;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
          station: { id: current[1], name: current[1] === B ? 'Pública B' : current[1] === A2 ? 'Pròpia A2' : 'Pròpia A1' },
          items: [{ instant: new Date().toISOString(), temp_c: temp, humitat_pct: 50 }],
          source: { freshness: 'FRESH', error: current[1] === A2 ? 'HTTP_503' : null },
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

    const a = await contextFor('a');
    await a.page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    await a.page.waitForFunction((id) => document.querySelector('#meteo-station')?.value === id, A1);
    assert.match(await a.page.locator('#meteo-summary').textContent(), /Pròpia A1/);
    await a.page.locator('#meteo-station').selectOption(B);
    await a.page.waitForFunction(() => document.querySelector('#screen-meteo')?.textContent.includes('7.0'));
    assert.equal(preferences.a.default_station.id, A1, 'temporary selection changed the preference');
    assert.equal(await a.page.locator('#meteo-default-set').isDisabled(), true);
    assert.match(a.page.url(), new RegExp(`station_id=${B}`));
    await a.page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    await a.page.waitForFunction((id) => document.querySelector('#meteo-station')?.value === id, A1);
    await a.page.locator('#meteo-station').selectOption(A2);
    await a.page.locator('#meteo-default-set').click();
    await a.page.waitForFunction(() => document.querySelector('#meteo-preference-status')?.textContent.includes('desada'));
    await a.page.waitForFunction(() => document.querySelector('#meteo-err')?.textContent.includes('font no respon'));
    assert.deepEqual(writes, [['a', A2]]);
    assert.equal(preferences.b.default_station, null);
    assert.match(await a.page.locator('#meteo-err').textContent(), /font no respon/);

    await a.page.goto(`${origin}/meteo/?station_id=${UNKNOWN}`, { waitUntil: 'domcontentloaded' });
    await a.page.waitForFunction(() => !document.querySelector('#meteo-back-global')?.hidden);
    assert.match(await a.page.locator('#meteo-err').textContent(), /no està disponible o no hi tens accés/);
    await a.page.locator('#meteo-back-global').click();
    await a.page.waitForFunction(() => document.querySelector('#meteo-station')?.value === '');
    assert.equal(a.page.url().includes('station_id='), false);

    const b = await contextFor('b');
    await b.context.addInitScript((staleId) => {
      localStorage.setItem('tecnolord-store-v1', JSON.stringify({ stationId: staleId, auto: true }));
    }, A2);
    await b.page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    await b.page.waitForFunction(() => document.querySelector('#meteo-station')?.options.length >= 2);
    assert.equal(await b.page.locator('#meteo-station').inputValue(), '');
    assert.equal(preferences.b.default_station, null);
    assert.equal(await b.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(a.external, []);
    assert.deepEqual(b.external, []);
    assert.deepEqual(a.errors, []);
    assert.deepEqual(b.errors, []);
    await a.context.close();
    await b.context.close();
    console.log('UE-T09 browser PASS: two accounts, temporary URL/selector, explicit default, fallback, 375 px, 0 external requests');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
