'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const STATION_ID = '11111111-1111-4111-8111-111111111111';
const STATION = {
  id: STATION_ID,
  name: 'Estació Grafana sintètica',
  external_id: 'Meteo-901-9000001',
  access_scope: 'INTERNAL_ONLY',
  fields: [{ id: 'temperature', unit: 'celsius' }],
  rain_enabled: false,
};

function json(route, body, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;

  async function contextFor(role) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const external = []; const errors = []; const grafanaReads = [];
    await context.route('**/*', async (route) => {
      const request = route.request(); const url = new URL(request.url());
      if (url.origin !== origin) { external.push(url.href); return route.abort(); }
      if (url.pathname === '/api/v1/auth/me') return json(route, {
        user: {
          id: role === 'admin' ? '1' : '2',
          name: role === 'admin' ? 'Administradora' : 'Usuari',
          email: `${role}@example.invalid`, role: role === 'admin' ? 'SUPERADMIN' : 'USER',
        },
        csrf_token: 'synthetic-csrf',
      });
      if (url.pathname === '/api/v1/me/stations') return json(route, { items: [] });
      if (url.pathname === '/api/v1/admin/accounts') return json(route, { items: [] });
      if (url.pathname === '/api/v1/admin/external-stations') return json(route, { items: [] });
      if (url.pathname === '/api/v1/admin/imports') return json(route, { items: [] });
      if (url.pathname === '/api/v1/admin/public-view') return json(route, { config: {
        station: null, configured_station_id: null, card_ids: ['temperature'], revision: 0, eligible: false,
      } });
      if (url.pathname === '/api/v1/stations') return json(route, { items: [] });
      if (url.pathname === '/api/v1/admin/grafana/stations') {
        grafanaReads.push(url.pathname);
        return json(route, { items: [STATION] });
      }
      if (url.pathname === `/api/v1/admin/grafana/stations/${STATION_ID}/current`) {
        grafanaReads.push(url.pathname);
        return json(route, {
          station: { id: STATION_ID, name: STATION.name },
          source: {
            namespace: 'GRAFANA', external_id: STATION.external_id,
            access_scope: 'INTERNAL_ONLY', datasource_uid: 'SWLXFBHvz',
            persistence: 'DISABLED', rain_enabled: false,
          },
          window: {
            from: '2026-09-24T09:05:00.000Z', to: '2026-09-24T09:20:00.000Z', minutes: 15,
          },
          fetched_at: '2026-09-24T09:20:00.000Z',
          series: [{
            id: 'frame-1-series-2', name: 'Temperatura', sensor_id: STATION.external_id,
            unit: 'celsius', source_unit: null, unit_basis: 'QUERY_CONTRACT',
            points: [
              { observed_at: '2026-09-24T09:05:00.000Z', value: 0, quality: 'VALID' },
              { observed_at: '2026-09-24T09:10:00.000Z', value: null, quality: 'MISSING' },
              { observed_at: '2026-09-24T09:15:00.000Z', value: 12.5, quality: 'VALID' },
            ],
          }],
          warnings: ['SOURCE_UNIT_UNDECLARED'],
        });
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    return { context, page, external, errors, grafanaReads };
  }

  try {
    browser = await chromium.launch({
      executablePath: process.env.MAP_CHROME || chromium.executablePath(),
      headless: true, args: ['--no-sandbox'],
    });
    const admin = await contextFor('admin');
    await admin.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await admin.page.getByRole('heading', { name: 'Dades internes de Grafana', exact: true }).waitFor();
    await admin.page.getByRole('button', { name: `Consulta 15 minuts — ${STATION.name}`, exact: true }).click();
    await admin.page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('sense persistir dades'));
    const content = await admin.page.locator('#account-grafana-list').textContent();
    assert.match(content, /Meteo-901-9000001/);
    assert.match(content, /0 °C/);
    assert.match(content, /—/);
    assert.match(content, /SOURCE_UNIT_UNDECLARED/);
    assert.match(content, /pluja desactivada/);
    assert.deepEqual(admin.grafanaReads, [
      '/api/v1/admin/grafana/stations',
      `/api/v1/admin/grafana/stations/${STATION_ID}/current`,
    ]);
    const layout = await admin.page.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= innerWidth,
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll('body *')]
        .filter((node) => node.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 5).map((node) => ({
          tag: node.tagName, id: node.id, className: node.className,
          right: Math.round(node.getBoundingClientRect().right), width: Math.round(node.getBoundingClientRect().width),
        })),
    }));
    assert.equal(layout.fits, true, JSON.stringify(layout));

    const user = await contextFor('user');
    await user.page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    await user.page.locator('#account-signed-in').waitFor({ state: 'visible' });
    assert.equal(await user.page.locator('#account-admin').isHidden(), true);
    assert.deepEqual(user.grafanaReads, []);
    assert.deepEqual(admin.external, []); assert.deepEqual(user.external, []);
    assert.deepEqual(admin.errors, []); assert.deepEqual(user.errors, []);
    await admin.context.close(); await user.context.close();
    console.log('UE-T14 browser PASS: admin internal temperature, zero/null, warning, USER isolation, 375 px, 0 external requests');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
