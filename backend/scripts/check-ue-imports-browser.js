'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const INVENTORY = [{
  inventory_code: 'SYN001', name: 'Estació sintètica', description: 'Prova E2E',
  external_id: 'Meteo-901-9000001', mapping_status: 'VERIFIED', longitude: 1.55,
  latitude: 42.13, accuracy_m: 25, evidence_ref: 'fixture-browser',
}, {
  inventory_code: 'TEST01', name: 'Estació de prova', description: null,
  external_id: 'Meteo-999-9999999', mapping_status: 'VERIFIED', longitude: 1.6,
  latitude: 42.2, accuracy_m: 10, evidence_ref: 'fixture-browser',
}];

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let batches = [];
  let importWrites = 0;
  let browser;

  async function contextFor(role) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const external = []; const errors = []; const importReads = [];
    await context.route('**/*', async (route) => {
      const request = route.request(); const url = new URL(request.url());
      if (url.origin !== origin) { external.push(url.href); return route.abort(); }
      if (url.pathname === '/api/v1/auth/me') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
          user: { id: role === 'admin' ? '1' : '2', name: role === 'admin' ? 'Administradora' : 'Usuari',
            email: `${role}@example.invalid`, role: role === 'admin' ? 'SUPERADMIN' : 'USER' },
          csrf_token: 'synthetic-csrf',
        }) });
      }
      if (url.pathname === '/api/v1/me/stations') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      if (url.pathname === '/api/v1/admin/accounts') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      if (url.pathname === '/api/v1/admin/external-stations') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      if (url.pathname === '/api/v1/admin/grafana/stations') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      if (url.pathname === '/api/v1/admin/public-view') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ config: {
        station: null, configured_station_id: null, card_ids: ['temperature'], revision: 0, eligible: false,
      } }) });
      if (url.pathname === '/api/v1/stations') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      if (url.pathname === '/api/v1/admin/imports') {
        importReads.push(request.method());
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: batches }) });
      }
      if (url.pathname === '/api/v1/admin/imports/dry-run' && request.method() === 'POST') {
        importWrites += 1;
        const input = request.postDataJSON();
        assert.equal(request.headers()['x-csrf-token'], 'synthetic-csrf');
        assert.deepEqual(input, { source_namespace: 'GRAFANA', rows: INVENTORY });
        batches = [{
          id: '13', source_namespace: 'GRAFANA', content_hash: 'a'.repeat(64), status: 'STAGED',
          created_at: '2026-09-21T12:00:00.000Z', applied_at: null,
          counts: { validated: 1, quarantined: 1 },
          rows: [
            { inventory_code: 'SYN001', status: 'VALIDATED', issue_code: null, station_id: null, action: 'CREATE', candidate: INVENTORY[0] },
            { inventory_code: 'TEST01', status: 'QUARANTINED', issue_code: 'TEST_STATION', station_id: null, action: null, candidate: INVENTORY[1] },
          ],
        }];
        return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ batch: batches[0], idempotent: false }) });
      }
      if (url.pathname === '/api/v1/admin/imports/13/apply' && request.method() === 'POST') {
        importWrites += 1;
        batches = [{ ...batches[0], status: 'APPLIED', applied_at: '2026-09-21T12:01:00.000Z',
          counts: { applied: 1, quarantined: 1 }, rows: batches[0].rows.map((item) => (
            item.inventory_code === 'SYN001' ? { ...item, status: 'APPLIED', station_id: 'station-13' } : item
          )) }];
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ batch: batches[0] }) });
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    return { context, page, external, errors, importReads };
  }

  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || chromium.executablePath(), headless: true, args: ['--no-sandbox'] });
    const admin = await contextFor('admin');
    await admin.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await admin.page.locator('#account-import-form').waitFor({ state: 'visible' });
    await admin.page.locator('#account-import-json').fill(JSON.stringify(INVENTORY));
    await admin.page.getByRole('button', { name: 'Previsualitza el lot', exact: true }).click();
    await admin.page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('Dry-run creat'));
    assert.match(await admin.page.locator('#account-import-list').textContent(), /SYN001/);
    assert.match(await admin.page.locator('#account-import-list').textContent(), /TEST_STATION/);
    await admin.page.getByRole('button', { name: 'Aplica les files validades', exact: true }).click();
    await admin.page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('Lot aplicat'));
    assert.match(await admin.page.locator('#account-import-list').textContent(), /Aplicat/);
    assert.equal(importWrites, 2);
    const layout = await admin.page.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= innerWidth,
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      chain: (() => {
        const values = []; let node = document.querySelector('.account-import-rows');
        while (node && values.length < 8) {
          const rect = node.getBoundingClientRect(); const style = getComputedStyle(node);
          values.push({ tag: node.tagName, className: node.className, width: Math.round(rect.width),
            cssWidth: style.width, minWidth: style.minWidth, display: style.display }); node = node.parentElement;
        }
        return values;
      })(),
      offenders: [...document.querySelectorAll('body *')]
        .filter((node) => node.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 5).map((node) => ({ tag: node.tagName, id: node.id, className: node.className,
          right: Math.round(node.getBoundingClientRect().right), width: Math.round(node.getBoundingClientRect().width) })),
    }));
    assert.equal(layout.fits, true, JSON.stringify(layout));

    const user = await contextFor('user');
    await user.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await user.page.locator('#account-signed-in').waitFor({ state: 'visible' });
    assert.equal(await user.page.locator('#account-admin').isHidden(), true);
    assert.deepEqual(user.importReads, []);
    assert.deepEqual(admin.external, []); assert.deepEqual(user.external, []);
    assert.deepEqual(admin.errors, []); assert.deepEqual(user.errors, []);
    await admin.context.close(); await user.context.close();
    console.log('UE-T13 browser PASS: dry-run review/apply, quarantine visible, USER isolation, 375 px, 0 external requests');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
