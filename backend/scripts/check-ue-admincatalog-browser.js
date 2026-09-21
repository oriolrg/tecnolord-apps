'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const ID = '33333333-3333-4333-8333-333333333333';

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const writes = [];
  let items = [];
  let browser;

  async function contextFor(role) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const external = [], errors = [], catalogReads = [];
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) { external.push(url.href); return route.abort(); }
      if (url.pathname === '/api/v1/auth/me') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
          user: { id: role === 'admin' ? '1' : '2', name: role === 'admin' ? 'Administradora' : 'Usuari',
            email: `${role}@example.invalid`, role: role === 'admin' ? 'SUPERADMIN' : 'USER' },
          csrf_token: 'synthetic-csrf',
        }) });
      }
      if (url.pathname === '/api/v1/me/stations') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      }
      if (url.pathname === '/api/v1/admin/accounts') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      }
      if (url.pathname === '/api/v1/admin/public-view') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ config: {
          station: { id: '11111111-1111-4111-8111-111111111111', name: 'Pública' },
          configured_station_id: '11111111-1111-4111-8111-111111111111',
          card_ids: ['temperature'], revision: 1, eligible: true,
        } }) });
      }
      if (url.pathname === '/api/v1/stations') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [
          { id: '11111111-1111-4111-8111-111111111111', name: 'Pública', lifecycle: 'ACTIVE', visibility: 'PUBLIC', revision: 1 },
        ] }) });
      }
      if (url.pathname === '/api/v1/admin/external-stations') {
        catalogReads.push(route.request().method());
        if (route.request().method() === 'POST') {
          const body = route.request().postDataJSON(); writes.push(['create', body]);
          items = [{
            id: ID, name: body.name, description: body.description || null, lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 0,
            source: { namespace: body.source_namespace, external_id: body.external_id, status: 'VALIDATED' },
            location: { longitude: body.longitude, latitude: body.latitude, accuracy_m: body.accuracy_m,
              provenance: body.provenance, reference_label: body.reference_label || null,
              publication_mode: 'HIDDEN', verified_at: new Date().toISOString() }, override_fields: [],
          }];
          return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ station: items[0] }) });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items }) });
      }
      if (url.pathname === `/api/v1/admin/external-stations/${ID}` && route.request().method() === 'PUT') {
        const body = route.request().postDataJSON(); writes.push(['update', body]);
        items = [{ ...items[0], name: body.name, description: body.description || null, revision: 1,
          source: { namespace: body.source_namespace, external_id: body.external_id, status: 'VALIDATED' },
          location: { ...items[0].location, longitude: body.longitude, latitude: body.latitude,
            accuracy_m: body.accuracy_m, provenance: body.provenance, reference_label: body.reference_label || null },
          override_fields: ['latitude', 'longitude', 'name'],
        }];
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ station: items[0] }) });
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    return { context, page, external, errors, catalogReads };
  }

  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || chromium.executablePath(), headless: true, args: ['--no-sandbox'] });
    const admin = await contextFor('admin');
    await admin.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await admin.page.locator('#account-catalog-create').waitFor({ state: 'visible' });
    await admin.page.locator('#catalog-name').fill('Estació Grafana');
    await admin.page.locator('#catalog-description').fill('Catàleg sintètic');
    await admin.page.locator('#catalog-source').selectOption('GRAFANA');
    await admin.page.locator('#catalog-external-id').fill('Meteo-001-3100044');
    await admin.page.locator('#catalog-longitude').fill('1.552123');
    await admin.page.locator('#catalog-latitude').fill('42.137234');
    await admin.page.locator('#catalog-accuracy').fill('25');
    await admin.page.locator('#catalog-provenance').selectOption('SOURCE_DOCUMENT');
    await admin.page.locator('#catalog-reference').fill('inventari-sintètic');
    await admin.page.getByRole('button', { name: 'Afegeix al catàleg', exact: true }).click();
    await admin.page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('creada com a privada'));
    const edit = admin.page.locator('#account-catalog-list .account-catalog-edit');
    await edit.locator('input[name="name"]').fill('Estació corregida');
    await edit.locator('input[name="longitude"]').fill('1.553987');
    await edit.locator('input[name="latitude"]').fill('42.138765');
    await edit.getByRole('button', { name: 'Desa la correcció', exact: true }).click();
    await admin.page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('desada i auditada'));
    assert.equal(writes.length, 2);
    assert.equal(writes[0][1].longitude, 1.552123);
    assert.deepEqual(writes[1][1], { ...writes[0][1], name: 'Estació corregida', longitude: 1.553987, latitude: 42.138765, revision: 0 });
    assert.match(await admin.page.locator('#account-catalog-list').textContent(), /Correccions: latitude, longitude, name/);
    assert.equal(await admin.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    const user = await contextFor('user');
    await user.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await user.page.locator('#account-signed-in').waitFor({ state: 'visible' });
    assert.equal(await user.page.locator('#account-admin').isHidden(), true);
    assert.deepEqual(user.catalogReads, []);
    assert.deepEqual(admin.external, []); assert.deepEqual(user.external, []);
    assert.deepEqual(admin.errors, []); assert.deepEqual(user.errors, []);
    await admin.context.close(); await user.context.close();
    console.log('UE-T11 browser PASS: admin create/correct, user isolation, 375 px, 0 external requests');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
