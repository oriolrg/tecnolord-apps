'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const ECOWITT_ID = '11111111-1111-4111-8111-111111111111';
const GRAFANA_ID = '5da7eece-6954-413f-8e22-390fe4144830';

function json(route, body, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

function current(id, name, temp, humidity, freshness, error = null) {
  return {
    station: { id, name, lifecycle: 'ACTIVE', visibility: id === GRAFANA_ID ? 'PRIVATE' : 'PUBLIC' },
    items: [{ instant: '2026-09-23T14:10:00.000Z', temp_c: temp, humitat_pct: humidity }],
    source: { freshness, observed_at: '2026-09-23T14:10:00.000Z', error },
  };
}

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;

  async function open(role) {
    let currentRole = role;
    let slowGrafana = false;
    let grafanaFreshness = 'STALE';
    const requests = [];
    const errors = [];
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin) return route.abort();
      if (!url.pathname.startsWith('/api/')) return route.continue();
      requests.push(`${request.method()} ${url.pathname}`);
      if (url.pathname === '/api/v1/auth/session') return json(route, currentRole ? {
        authenticated: true, accounts_available: true,
        user: { id: '1', name: 'Oriol', email: 'oriol@example.invalid', role: currentRole },
        csrf_token: 'csrf',
      } : { authenticated: false, accounts_available: true });
      if (url.pathname === '/api/v1/public-view') return json(route, { config: {
        station: { id: ECOWITT_ID, name: 'Ecowitt pública' },
        card_ids: ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv'], revision: 1,
      } });
      if (url.pathname === '/api/v1/stations') return json(route, { items: [
        { id: ECOWITT_ID, name: 'Ecowitt pública', visibility: 'PUBLIC', lifecycle: 'ACTIVE' },
      ] });
      if (url.pathname === '/api/v1/me/stations') return json(route, { items: [] });
      if (url.pathname === '/api/v1/admin/stations') return currentRole === 'SUPERADMIN'
        ? json(route, { items: [
          { id: GRAFANA_ID, name: 'Estació de prova Grafana local', visibility: 'PRIVATE', lifecycle: 'ACTIVE' },
        ] }) : json(route, { error: 'forbidden' }, 403);
      if (url.pathname === '/api/v1/estimations') return json(route, { items: [] });
      if (url.pathname === '/api/v1/me/preferences') return json(route, { preference: {
        default_station: null, revision: 0, invalidated: false,
      } });
      if (url.pathname === `/api/v1/stations/${GRAFANA_ID}/current`) {
        if (slowGrafana) await new Promise((resolve) => setTimeout(resolve, 250));
        if (!currentRole) return json(route, { error: 'not_found' }, 404);
        const payload = current(GRAFANA_ID, 'Estació de prova Grafana local', 22.5, null, grafanaFreshness, 'raw datasource secret');
        if (grafanaFreshness === 'UNKNOWN') payload.items = [];
        return json(route, payload);
      }
      if (url.pathname === `/api/v1/stations/${ECOWITT_ID}/current`) {
        return json(route, current(ECOWITT_ID, 'Ecowitt pública', 18.5, 0, 'FRESH'));
      }
      if (url.pathname.endsWith('/history')) return json(route, { items: [] });
      if (url.pathname === '/api/v1/mesures/darreres') return json(route, { items: [] });
      return json(route, { error: 'unexpected_test_route' }, 404);
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    return {
      context, page, requests, errors,
      setRole(value) { currentRole = value; },
      delayGrafana(value) { slowGrafana = value; },
      setGrafanaFreshness(value) { grafanaFreshness = value; },
    };
  }

  try {
    browser = await chromium.launch({
      executablePath: process.env.MAP_CHROME || chromium.executablePath(),
      headless: true, args: ['--no-sandbox'],
    });

    const admin = await open('SUPERADMIN');
    await admin.page.locator(`#meteo-station option[value="${GRAFANA_ID}"]`).waitFor({ state: 'attached' });
    assert.equal(await admin.page.locator(`#meteo-station option[value="${GRAFANA_ID}"]`).textContent(), 'Estació de prova Grafana local · privada');
    await admin.page.selectOption('#meteo-station', GRAFANA_ID);
    await admin.page.locator('#screen-meteo').getByText('22.5', { exact: true }).waitFor();
    assert.match(await admin.page.locator('#meteo-last').textContent(), /dades antigues/);
    assert.match(await admin.page.locator('#meteo-err').textContent(), /La font no respon/);
    assert.doesNotMatch(await admin.page.locator('#screen-meteo').textContent(), /raw datasource secret/);
    const humidity = admin.page.locator('#screen-meteo .card').filter({ hasText: 'Humitat' });
    assert.match(await humidity.textContent(), /—/);

    const temperature = admin.page.locator('#screen-meteo .card').filter({ hasText: 'Temperatura' });
    admin.setGrafanaFreshness('OBSOLETE');
    await admin.page.selectOption('#meteo-station', ECOWITT_ID);
    await admin.page.selectOption('#meteo-station', GRAFANA_ID);
    await admin.page.locator('#meteo-last').filter({ hasText: 'dades obsoletes' }).waitFor();
    assert.match(await temperature.textContent(), /—/);
    assert.doesNotMatch(await temperature.textContent(), /22\.5/);

    admin.setGrafanaFreshness('UNKNOWN');
    await admin.page.selectOption('#meteo-station', ECOWITT_ID);
    await admin.page.selectOption('#meteo-station', GRAFANA_ID);
    await admin.page.locator('#meteo-last').filter({ hasText: 'Frescor desconeguda' }).waitFor();
    assert.equal(await admin.page.locator('#screen-meteo .card').count(), 0);
    assert.doesNotMatch(await admin.page.locator('#screen-meteo').textContent(), /22\.5/);

    await admin.page.selectOption('#meteo-station', ECOWITT_ID);
    await admin.page.locator('#screen-meteo').getByText('18.5', { exact: true }).waitFor();
    admin.setGrafanaFreshness('STALE');
    admin.delayGrafana(true);
    await admin.page.selectOption('#meteo-station', GRAFANA_ID);
    await admin.page.waitForTimeout(30);
    await admin.page.selectOption('#meteo-station', ECOWITT_ID);
    await admin.page.locator('#screen-meteo').getByText('18.5', { exact: true }).waitFor();
    await admin.page.waitForTimeout(300);
    assert.match(await admin.page.locator('#meteo-summary').textContent(), /Ecowitt pública/);
    assert.doesNotMatch(await admin.page.locator('#screen-meteo').textContent(), /22\.5/);
    assert.match(await humidity.textContent(), /0/);

    await admin.page.selectOption('#meteo-station', GRAFANA_ID);
    await admin.page.locator('#screen-meteo').getByText('22.5', { exact: true }).waitFor();
    admin.setRole(null);
    await admin.page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'tecnolord-store-v1' })));
    await admin.page.locator(`#meteo-station option[value="${GRAFANA_ID}"]`).waitFor({ state: 'detached' });
    await admin.page.locator('#screen-meteo').getByText('18.5', { exact: true }).waitFor();
    assert.equal(await admin.page.locator('#meteo-station').inputValue(), '');
    assert.doesNotMatch(await admin.page.locator('#screen-meteo').textContent(), /22\.5/);
    assert.equal(admin.requests.some((item) => item.includes('/admin/grafana/')), false);
    assert.deepEqual(admin.errors, []);

    const user = await open('USER');
    await user.page.locator('#meteo-station').waitFor();
    await user.page.waitForTimeout(100);
    assert.equal(user.requests.some((item) => item === 'GET /api/v1/admin/stations'), false);
    assert.equal(await user.page.locator(`#meteo-station option[value="${GRAFANA_ID}"]`).count(), 0);
    assert.deepEqual(user.errors, []);

    await admin.context.close();
    await user.context.close();
    console.log('G06 browser PASS: SUPERADMIN selector/current, freshness, null/zero, race, logout, USER isolation, ordinary API only');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
