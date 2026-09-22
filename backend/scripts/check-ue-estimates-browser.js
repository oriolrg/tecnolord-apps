'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

const IDS = ['1', '2', '3', '4', '5', '6'].map((tail) => `15000000-0000-4000-8000-00000000000${tail}`);
const POINTS = [
  ['andorra', 'Andorra', 'Andorra la Vella', 1.52184, 42.50632],
  ['berga', 'Berga', 'Berga', 1.84628, 42.10429],
  ['la-seu-durgell', 'La Seu d’Urgell', 'La Seu d’Urgell', 1.46144, 42.35877],
  ['manresa', 'Manresa', 'Manresa', 1.82399, 41.72815],
  ['solsona', 'Solsona', 'Solsona', 1.51706, 41.99389],
  ['vic', 'Vic', 'Vic', 2.25486, 41.93012],
].map(([slug, name, reference, longitude, latitude], index) => ({
  kind: 'ESTIMATION', id: IDS[index], slug, name,
  reference: { label: reference, longitude, latitude, provenance: 'fixture-browser' },
  source: { provider: 'OPEN_METEO', label: 'Open-Meteo', attribution: 'CC BY 4.0' },
}));

function current(point, value = 0) {
  return {
    estimation: { ...point, observed_at: '2026-09-22T08:45:00.000Z', freshness: 'FRESH', status: 'AVAILABLE', values: null },
    items: [{ instant: '2026-09-22T08:45:00.000Z', temp_c: value, sensacio_c: value,
      humitat_pct: 60, taxa_pluja_mm_h: 0, pressio_rel_hpa: 1015, vent_ms: 0,
      vent_direccio_graus: 0, vent_rafega_ms: 0, uvi: 0 }],
    source: { provider: 'OPEN_METEO', status: 'AVAILABLE', freshness: 'FRESH',
      reference_label: point.reference.label, attribution: 'CC BY 4.0' },
  };
}

function feature(point, value = 0) {
  return { type: 'Feature', id: point.id, geometry: { type: 'Point', coordinates: [point.reference.longitude, point.reference.latitude] },
    properties: { public_station_id: point.id, public_name: point.name, resource_kind: 'ESTIMATION', nature: 'ESTIMATED',
      geo_publication: 'REFERENCE', observed_at: '2026-09-22T08:45:00.000Z', reference_label: point.reference.label,
      provenance: { source: 'Open-Meteo · estimació', licence_or_legal_basis_ref: 'CC BY 4.0' },
      sensors: [{ sensor_id: 'open-meteo-model', fields: [
        { field_id: 'temperature', unit: 'celsius', current_value: value, last_value: value, reliable: true, freshness: 'FRESCA', quality: 'OK', review: 'NORMAL' },
        { field_id: 'humidity', unit: 'percent', current_value: 60, last_value: 60, reliable: true, freshness: 'FRESCA', quality: 'OK', review: 'NORMAL' },
      ] }] } };
}

async function main() {
  const server = await new Promise((resolve) => { const active = createPreviewApp().listen(0, '127.0.0.1', () => resolve(active)); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || chromium.executablePath(), headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, serviceWorkers: 'block' });
    const external = []; const errors = [];
    await context.route('**/*', async (route) => {
      const request = route.request(); const url = new URL(request.url());
      if (url.origin !== origin) { external.push(url.href); return route.abort(); }
      const json = (body, headers = {}) => route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify(body) });
      if (url.pathname === '/api/v1/auth/me') return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"unauthenticated"}' });
      if (url.pathname === '/api/v1/public-view') return json({ config: { station: null, card_ids: ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv'], revision: 0 } });
      if (url.pathname === '/api/v1/stations') return json({ items: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Estació observada', visibility: 'PUBLIC', lifecycle: 'ACTIVE' }] });
      if (url.pathname === '/api/v1/estimations') return json({ items: POINTS });
      if (url.pathname.startsWith('/api/v1/estimations/') && url.pathname.endsWith('/current')) {
        const point = POINTS.find((item) => url.pathname.includes(item.id));
        return json(current(point));
      }
      if (url.pathname === '/api/v1/mesures/darreres') return json({ ok: true, items: [] });
      const versionHeaders = { 'x-catalog-version': 'ue-map-browser' };
      if (url.pathname === '/api/v1/map/stations') return json({ type: 'FeatureCollection', features: POINTS.map((point) => feature(point)) }, versionHeaders);
      if (url.pathname === '/api/v1/map/summary') return json({ count: 6, temperature_min: 0, temperature_max: 0, sources: ['Open-Meteo · estimació'], catalog_version: 'ue-map-browser' }, versionHeaders);
      if (url.pathname === '/api/v1/map/catalog-version') return json({ catalog_version: 'ue-map-browser' }, versionHeaders);
      if (url.pathname.startsWith('/api/v1/map/stations/')) {
        const point = POINTS.find((item) => url.pathname.endsWith(item.id)); return json(feature(point).properties, versionHeaders);
      }
      if (url.pathname === '/api/v1/me/map' || url.pathname === '/api/v1/admin/map') return json({ type: 'FeatureCollection', features: [] });
      return route.continue();
    });
    const page = await context.newPage(); page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    const option = page.locator('#meteo-station option', { hasText: 'Andorra · Estimació' });
    await option.waitFor({ state: 'attached' });
    await page.locator('#meteo-station').selectOption(`estimation:${POINTS[0].id}`);
    await page.waitForFunction(() => document.querySelector('#meteo-summary')?.textContent.includes('Andorra la Vella'));
    assert.match(await page.locator('#meteo-summary').textContent(), /Estimació.*Open-Meteo/);
    assert.match(await page.locator('#meteo-cards').textContent(), /Temperatura · Estimació/);
    assert.match(await page.locator('#meteo-cards').textContent(), /0/);
    assert.equal(await page.locator('#meteo-default-set').isHidden(), true);
    await page.goto(`${origin}/meteo/mapa/`, { waitUntil: 'domcontentloaded' });
    await page.locator('#station-count').getByText('6').waitFor();
    const list = await page.locator('#station-list').textContent();
    assert.match(list, /Estimació/); assert.match(list, /Andorra la Vella/);
    await page.getByRole('button', { name: 'Andorra', exact: true }).click();
    assert.match(await page.locator('#dialog-content').textContent(), /Estimació/);
    assert.match(await page.locator('#dialog-content').textContent(), /No és una observació d’estació/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(external, []); assert.deepEqual(errors, []);
    await context.close();
    console.log('UE-T15 browser PASS: six estimates, selector/Meteo/map/list/detail labels, Andorra la Vella, 375 px, 0 external requests');
  } finally { if (browser) await browser.close(); await new Promise((resolve) => server.close(resolve)); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
