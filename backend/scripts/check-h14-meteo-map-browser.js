'use strict';

const assert = require('node:assert/strict');
const express = require('express');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { mapAssets } = require('../middleware/mapAssets');
const { LOCAL_FRONTEND_CSP } = require('../server');

const SITE_DIR = path.resolve(__dirname, '../../site');
const ECOWITT_ID = '11111111-1111-4111-8111-111111111111';
const GRAFANA_MAP_ID = '22222222-2222-4222-8222-222222222222';
const GRAFANA_NO_LOCATION_ID = '33333333-3333-4333-8333-333333333333';
const TRANSPARENT_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mNk+M/wHwAF/gL+3MxZAAAAAElFTkSuQmCC', 'base64');

function station(id, name, { privateStation = false } = {}) {
  return { id, name, lifecycle: 'ACTIVE', visibility: privateStation ? 'PRIVATE' : 'PUBLIC' };
}

function mapFeature(id, name, coordinates, temperature) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {
      public_station_id: id,
      public_name: name,
      resource_kind: 'STATION',
      access_scope: 'SUPERADMIN',
      sensors: [{ fields: [{ field_id: 'temperature', current_value: temperature }] }],
    },
  };
}

function current(id, name, temperature) {
  return {
    station: station(id, name, { privateStation: id !== ECOWITT_ID }),
    items: [{ instant: '2026-10-08T12:00:00.000Z', temp_c: temperature, humitat_pct: 55 }],
    source: { freshness: 'FRESH', observed_at: '2026-10-08T12:00:00.000Z', error: null },
  };
}

function fulfillJson(route, body, status = 200, headers = {}) {
  return route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(body) });
}

async function startFrontend(runtime) {
  if (!['local', 'production'].includes(runtime)) throw new Error('H14_RUNTIME must be local or production');
  const app = express();
  app.use((_req, res, next) => { res.setHeader('Content-Security-Policy', LOCAL_FRONTEND_CSP); next(); });
  app.get('/meteo/runtime-config.js', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(SITE_DIR, runtime === 'production' ? 'runtime-config.production.js' : 'runtime-config.js'));
  });
  app.use(mapAssets);
  app.use('/meteo', express.static(SITE_DIR));
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

async function main() {
  const runtime = process.env.H14_RUNTIME || 'local';
  const { server, origin } = await startFrontend(runtime);
  let browser;

  async function open(role) {
    const requests = [];
    const pageErrors = [];
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === 'https://tile.openstreetmap.org') {
        requests.push(`${request.method()} ${url.origin}${url.pathname}`);
        return route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: TRANSPARENT_PNG });
      }
      if (url.origin !== origin) {
        requests.push(`${request.method()} ${url.origin}${url.pathname}`);
        return route.abort();
      }
      if (!url.pathname.startsWith('/api/')) return route.continue();
      requests.push(`${request.method()} ${url.pathname}`);
      if (url.pathname === '/api/v1/auth/session') {
        return fulfillJson(route, role ? {
          authenticated: true,
          accounts_available: true,
          user: { id: role === 'SUPERADMIN' ? 'admin' : 'user', name: role, email: `${role}@example.invalid`, role },
          csrf_token: 'csrf',
        } : { authenticated: false, accounts_available: true });
      }
      if (url.pathname === '/api/v1/public-view') return fulfillJson(route, { config: {
        station: station(ECOWITT_ID, 'Ecowitt pública'), card_ids: ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv'], revision: 1,
      } });
      if (url.pathname === '/api/v1/stations') return fulfillJson(route, { items: [station(ECOWITT_ID, 'Ecowitt pública')] });
      if (url.pathname === '/api/v1/me/stations') return fulfillJson(route, { items: [] });
      if (url.pathname === '/api/v1/admin/stations') {
        return role === 'SUPERADMIN'
          ? fulfillJson(route, { items: [
            station(GRAFANA_MAP_ID, 'Grafana amb geometria', { privateStation: true }),
            station(GRAFANA_NO_LOCATION_ID, 'Grafana sense geometria', { privateStation: true }),
          ] })
          : fulfillJson(route, { error: 'forbidden' }, 403);
      }
      if (url.pathname === '/api/v1/estimations') return fulfillJson(route, { items: [] });
      if (url.pathname === '/api/v1/me/preferences') return fulfillJson(route, { preference: { default_station: null, revision: 0, invalidated: false } });
      if (url.pathname === '/api/v1/map/stations') {
        return fulfillJson(route, { type: 'FeatureCollection', features: [
          mapFeature(ECOWITT_ID, 'Ecowitt pública', [1.95, 41.48], 18.5),
        ] }, 200, { 'X-Catalog-Version': 'h14-v1' });
      }
      if (url.pathname === '/api/v1/map/session-stations') {
        const features = role === 'SUPERADMIN'
          ? [mapFeature(GRAFANA_MAP_ID, 'Grafana amb geometria', [2.17, 41.38], 22)]
          : [];
        return fulfillJson(route, { type: 'FeatureCollection', features });
      }
      if (url.pathname === '/api/v1/map/catalog-version') return fulfillJson(route, { catalog_version: 'h14-v1' });
      if (url.pathname === `/api/v1/stations/${ECOWITT_ID}/current`) return fulfillJson(route, current(ECOWITT_ID, 'Ecowitt pública', 18.5));
      if (url.pathname === `/api/v1/stations/${GRAFANA_MAP_ID}/current`) return fulfillJson(route, current(GRAFANA_MAP_ID, 'Grafana amb geometria', 22));
      if (url.pathname === `/api/v1/stations/${GRAFANA_NO_LOCATION_ID}/current`) return fulfillJson(route, current(GRAFANA_NO_LOCATION_ID, 'Grafana sense geometria', 21));
      if (url.pathname.endsWith('/history')) return fulfillJson(route, { items: [] });
      if (url.pathname === '/api/v1/mesures/darreres') return fulfillJson(route, { items: [] });
      return fulfillJson(route, { error: 'unexpected_test_route' }, 404);
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    return { context, page, requests, pageErrors };
  }

  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || chromium.executablePath(), headless: true, args: ['--no-sandbox'] });

    const admin = await open('SUPERADMIN');
    assert.deepEqual(await admin.page.evaluate(() => ({
      environment: window.__METEOLORD_CONFIG.ENVIRONMENT,
      syntheticData: window.__METEOLORD_CONFIG.SYNTHETIC_DATA,
    })), { environment: runtime, syntheticData: runtime === 'local' });
    const mapOption = admin.page.locator(`#meteo-station option[value="${GRAFANA_MAP_ID}"]`);
    const noLocationOption = admin.page.locator(`#meteo-station option[value="${GRAFANA_NO_LOCATION_ID}"]`);
    await mapOption.waitFor({ state: 'attached' });
    await noLocationOption.waitFor({ state: 'attached' });
    assert.equal(await mapOption.textContent(), 'Grafana amb geometria · privada');
    assert.equal(await noLocationOption.textContent(), 'Grafana sense geometria · privada');
    await admin.page.getByRole('button', { name: /Grafana amb geometria/ }).waitFor({ state: 'visible' });
    assert.equal(await admin.page.getByRole('button', { name: /Grafana sense geometria/ }).count(), 0);

    const grafanaMarker = admin.page.getByRole('button', { name: /Grafana amb geometria/ });
    await grafanaMarker.click();
    await admin.page.waitForFunction((stationId) => document.querySelector('#meteo-station')?.value === stationId, GRAFANA_MAP_ID);
    assert.equal(await admin.page.locator('#meteo-station').inputValue(), GRAFANA_MAP_ID);
    await admin.page.locator('#meteo-summary').getByText(/Grafana amb geometria/).waitFor();
    assert.equal(await grafanaMarker.getAttribute('aria-current'), 'true');

    await admin.page.selectOption('#meteo-station', ECOWITT_ID);
    await admin.page.waitForFunction((stationId) => document.querySelector('#meteo-station')?.value === stationId, ECOWITT_ID);
    await admin.page.selectOption('#meteo-station', GRAFANA_MAP_ID);
    await admin.page.waitForFunction((stationId) => document.querySelector('#meteo-station')?.value === stationId, GRAFANA_MAP_ID);
    assert.equal(await grafanaMarker.getAttribute('aria-current'), 'true');

    await admin.page.selectOption('#meteo-station', GRAFANA_NO_LOCATION_ID);
    await admin.page.locator('#meteo-summary').getByText(/Grafana sense geometria/).waitFor();
    assert.equal(await admin.page.locator('#meteo-station').inputValue(), GRAFANA_NO_LOCATION_ID);
    assert.equal(await admin.page.getByRole('button', { name: /Grafana sense geometria/ }).count(), 0);
    assert.ok(admin.requests.includes('GET /api/v1/admin/stations'));
    assert.ok(admin.requests.includes('GET /api/v1/map/session-stations'));
    assert.equal(admin.requests.some((request) => request.includes('/api/v1/admin/grafana/')), false);
    assert.equal(admin.requests.some((request) => request.includes('grafana.')), false);
    assert.equal(admin.requests.some((request) => request.includes('.pmtiles')), false);
    assert.deepEqual(admin.pageErrors, []);

    const user = await open('USER');
    await user.page.locator('#meteo-station').waitFor({ state: 'visible' });
    await user.page.waitForTimeout(100);
    assert.equal(await user.page.locator(`#meteo-station option[value="${GRAFANA_MAP_ID}"]`).count(), 0);
    assert.equal(await user.page.locator(`#meteo-station option[value="${GRAFANA_NO_LOCATION_ID}"]`).count(), 0);
    assert.equal(await user.page.getByRole('button', { name: /Grafana/ }).count(), 0);
    assert.equal(user.requests.some((request) => request === 'GET /api/v1/admin/stations'), false);
    assert.equal(user.requests.some((request) => request.includes('/api/v1/admin/grafana/')), false);
    assert.deepEqual(user.pageErrors, []);

    const visitor = await open(null);
    await visitor.page.locator('#meteo-station').waitFor({ state: 'visible' });
    await visitor.page.waitForTimeout(100);
    assert.equal(await visitor.page.locator(`#meteo-station option[value="${GRAFANA_MAP_ID}"]`).count(), 0);
    assert.equal(await visitor.page.getByRole('button', { name: /Grafana/ }).count(), 0);
    assert.equal(visitor.requests.some((request) => request === 'GET /api/v1/admin/stations'), false);
    assert.equal(visitor.requests.some((request) => request.includes('/api/v1/admin/grafana/')), false);
    assert.deepEqual(visitor.pageErrors, []);

    await Promise.all([admin.context.close(), user.context.close(), visitor.context.close()]);
    console.log(`H14 browser PASS (${runtime}): authorized private geometry, selector-marker synchronization, missing geometry, USER/visitor isolation, ordinary APIs only`);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
