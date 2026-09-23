'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const IDS = Object.freeze({
  a: '11111111-1111-4111-8111-111111111111',
  b: '22222222-2222-4222-8222-222222222222',
  legacy: '33333333-3333-4333-8333-333333333333',
});

function response(route, body, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  const policies = [
    { station: { id: IDS.a, name: 'Estació A', management_kind: 'USER', lifecycle: 'ACTIVE', visibility: 'PRIVATE' },
      policy: { enabled: true, capture_interval_minutes: 15, retention_days: 30, revision: 2, last_capture_at: null },
      source_interval_minutes: 15, legacy_compatible: false },
    { station: { id: IDS.b, name: 'Estació B', management_kind: 'USER', lifecycle: 'ACTIVE', visibility: 'PRIVATE' },
      policy: null, source_interval_minutes: 5, legacy_compatible: false },
    { station: { id: IDS.legacy, name: 'MeteoLord legacy', management_kind: 'LEGACY', lifecycle: 'ACTIVE', visibility: 'PUBLIC' },
      policy: null, source_interval_minutes: 5, legacy_compatible: true },
  ];
  const writes = [];

  async function contextFor(role) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const external = []; const errors = []; const historyReads = [];
    await context.route('**/*', async (route) => {
      const request = route.request(); const url = new URL(request.url());
      if (url.origin !== origin) { external.push(url.href); return route.abort(); }
      if (url.pathname === '/api/v1/auth/session') return response(route, {
        authenticated: true, accounts_available: true,
        user: { id: role === 'admin' ? '1' : '2', name: role === 'admin' ? 'Administradora' : 'Usuari',
          email: `${role}@example.invalid`, role: role === 'admin' ? 'SUPERADMIN' : 'USER' },
        csrf_token: 'synthetic-csrf',
      });
      if (url.pathname === '/api/v1/me/stations') return response(route, { items: [] });
      if (url.pathname === '/api/v1/admin/accounts') return response(route, { items: [] });
      if (url.pathname === '/api/v1/admin/external-stations') return response(route, { items: [] });
      if (url.pathname === '/api/v1/admin/imports') return response(route, { items: [] });
      if (url.pathname === '/api/v1/admin/grafana/stations') return response(route, { items: [] });
      if (url.pathname === '/api/v1/admin/public-view') return response(route, { config: {
        station: null, configured_station_id: null, card_ids: ['temperature'], revision: 0, eligible: false,
      } });
      if (url.pathname === '/api/v1/stations') return response(route, { items: [] });
      if (url.pathname === '/api/v1/admin/station-history-policies' && request.method() === 'GET') {
        historyReads.push('list'); return response(route, { items: policies });
      }
      const preview = url.pathname.match(/^\/api\/v1\/admin\/station-history-policies\/([^/]+)\/preview$/);
      if (preview && request.method() === 'POST') {
        const body = request.postDataJSON(); writes.push(['preview', preview[1], body]);
        return response(route, { preview: { station_id: preview[1], retention_days: body.retention_days,
          cutoff: '2026-08-24T12:00:00.000Z', delete_count: 17 } });
      }
      const update = url.pathname.match(/^\/api\/v1\/admin\/station-history-policies\/([^/]+)$/);
      if (update && request.method() === 'PUT') {
        const body = request.postDataJSON(); writes.push(['update', update[1], body]);
        const item = policies.find((entry) => entry.station.id === update[1]);
        item.policy = { ...body, revision: body.revision + 1, last_capture_at: null };
        item.legacy_compatible = false;
        return response(route, { policy: item.policy });
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    return { context, page, external, errors, historyReads };
  }

  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || chromium.executablePath(),
      headless: true, args: ['--no-sandbox'] });
    const admin = await contextFor('admin');
    await admin.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    const load = admin.page.getByRole('button', { name: 'Carrega polítiques', exact: true });
    await load.waitFor();
    assert.deepEqual(admin.historyReads, [], 'history policies are loaded only on demand');
    await load.click();
    await admin.page.locator('.account-history-policy').nth(2).waitFor();
    assert.deepEqual(admin.historyReads, ['list']);
    assert.equal(await admin.page.locator('.account-history-policy').count(), 3);

    const b = admin.page.locator('.account-history-policy').filter({ hasText: 'Estació B' });
    await b.locator('input[type="checkbox"]').check();
    await b.locator('input[type="number"]').nth(0).fill('60');
    await b.locator('input[type="number"]').nth(1).fill('90');
    await b.getByRole('button', { name: 'Desa la política', exact: true }).click();
    await admin.page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('actualitzada'));

    const legacy = admin.page.locator('.account-history-policy').filter({ hasText: 'MeteoLord legacy' });
    await legacy.getByRole('button', { name: 'Previsualitza la purga', exact: true }).click();
    await legacy.getByText(/eliminaria 17 registres/).waitFor();
    await legacy.locator('input[type="checkbox"]').check();
    await legacy.getByRole('button', { name: 'Desa la política', exact: true }).click();
    await admin.page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('actualitzada'));

    assert.deepEqual(writes, [
      ['update', IDS.b, { enabled: true, capture_interval_minutes: 60, retention_days: 90, revision: 0 }],
      ['preview', IDS.legacy, { retention_days: 30 }],
      ['update', IDS.legacy, { enabled: true, capture_interval_minutes: 15, retention_days: 30, revision: 0 }],
    ]);
    const layout = await admin.page.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= innerWidth,
      viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
    }));
    assert.equal(layout.fits, true, JSON.stringify(layout));

    const user = await contextFor('user');
    await user.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await user.page.locator('#account-signed-in').waitFor({ state: 'visible' });
    assert.equal(await user.page.locator('#account-admin').isHidden(), true);
    assert.deepEqual(user.historyReads, []);
    assert.deepEqual(admin.external, []); assert.deepEqual(user.external, []);
    assert.deepEqual(admin.errors, []); assert.deepEqual(user.errors, []);
    await admin.context.close(); await user.context.close();
    console.log('UE-T17 browser PASS: admin policies, legacy preview, USER isolation, 375 px, 0 external requests');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
