'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const express = require('express');
const { chromium, expect } = require('@playwright/test');
const { makeMapPublicRouter } = require('../routes/mapPublic');
const { createMapDemo } = require('../providers/mapDemo');
const { mapAssets } = require('../middleware/mapAssets');
const { LOCAL_FRONTEND_CSP } = require('../server');
const ROOT = path.resolve(__dirname, '../..');
const HEAD = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
const EVIDENCE = path.join(ROOT, 'artifacts/phase-a', HEAD, 'map-a-completion/map-a');
const write = (name, value) => fs.writeFileSync(path.join(EVIDENCE, name), JSON.stringify(value, null, 2));
const checks = [];
const executablePath = process.env.MAP_CHROME || '/usr/bin/google-chrome';
async function start(stations) {
  const demo = createMapDemo();
  const app = express();
  app.use((_req, res, next) => { res.setHeader('Content-Security-Policy', LOCAL_FRONTEND_CSP); next(); });
  app.use(makeMapPublicRouter({ ...demo, stations: stations || demo.stations, environment: { METEOLORD_ENV: 'test' }, rateLimit: { limit: 10000 } }));
  app.get('/meteo/runtime-config.js', (_req, res) => res.sendFile(path.join(ROOT, 'config/meteolord/runtime-config.local.js')));
  app.use(mapAssets);
  app.use('/meteo', express.static(path.join(ROOT, 'site')));
  const server = await new Promise((resolve) => { const listening = app.listen(0, '127.0.0.1', () => resolve(listening)); });
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => server.close(resolve)) };
}
async function context(browser, base, viewport = { width: 1440, height: 1000 }) {
  const ctx = await browser.newContext({ viewport, serviceWorkers: 'block', reducedMotion: 'reduce' });
  const errors = [], egress = [];
  await ctx.route('**/*', (route) => {
    if (new URL(route.request().url()).origin !== base) { egress.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  await ctx.addInitScript(() => {
    window.__mapCsp = []; window.__longTasks = [];
    document.addEventListener('securitypolicyviolation', (event) => window.__mapCsp.push(event.violatedDirective));
    new PerformanceObserver((list) => { window.__longTasks.push(...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration }))); }).observe({ type: 'longtask', buffered: true });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  return { ctx, page, errors, egress };
}
async function ready(page, base, count = 6) {
  await page.goto(`${base}/meteo/mapa/`);
  await expect(page.locator('#station-count')).toHaveText(String(count));
  await expect(page.locator('html')).toHaveAttribute('data-map-ready', 'true');
  await expect(page.locator('.map-marker').first()).toBeVisible();
}
async function audit(run) {
  assert.deepEqual(run.errors, []); assert.deepEqual(run.egress, []);
  assert.deepEqual(await run.page.evaluate(() => window.__mapCsp), []);
}
async function functional(browser) {
  const demo = createMapDemo(), server = await start(demo.stations);
  try {
    const run = await context(browser, server.base), { page } = run;
    await ready(page, server.base);
    await expect(page.locator('#summary-count')).toHaveText('6');
    await expect(page.locator('#summary-range')).toHaveText('8,4–26,1 °C');
    await page.screenshot({ path: path.join(EVIDENCE, 'desktop.png'), fullPage: true });
    await expect(page.locator('.map-marker').filter({ hasText: '8,4 °C' })).toBeVisible();
    const request = await page.request.get(`${server.base}/meteo/map-assets/map-a-synthetic.pmtiles`, { headers: { Range: 'bytes=0-126' } });
    assert.equal(request.status(), 206); assert.equal((await request.body()).length, 127);
    checks.push('PMTiles Range 206; rendered map with temperatures and same-origin worker');
    await page.getByRole('button', { name: 'Amplia el grup de 2 estacions' }).click();
    await expect(page.getByRole('button', { name: 'Tria entre 2 estacions coincidents' })).toBeVisible();
    await page.getByRole('button', { name: 'Tria entre 2 estacions coincidents' }).click();
    await expect(page.locator('#dialog-title')).toHaveText('Estacions en aquesta ubicació');
    await expect(page.locator('.dialog-options button')).toHaveCount(2);
    await page.keyboard.press('Escape');
    checks.push('Cluster expansion at z15 opens an accessible selector for coincident points');
    const first = page.locator('.station-name').first();
    await first.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('#dialog-title')).toHaveText('Turó de prova');
    for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)), true); }
    await page.keyboard.press('Escape'); await expect(page.locator('dialog')).not.toBeVisible(); await expect(first).toBeFocused();
    checks.push('Keyboard opens modal, contains focus, Escape restores trigger focus');
    await page.locator('.station-link').first().click();
    await expect(page.locator('#detail-title')).toHaveText('Turó de prova');
    await expect(page.locator('.history-table tbody tr').first()).toBeVisible();
    await page.reload(); await expect(page.locator('#detail-title')).toHaveText('Turó de prova');
    checks.push('Direct station URL reload, public detail and history table');
    await page.locator('#search').fill('Bosc'); await page.getByRole('button', { name: 'Cerca' }).click();
    await expect(page.locator('#station-count')).toHaveText('1');
    await page.locator('#search').fill('no-matching-station'); await page.getByRole('button', { name: 'Cerca' }).click();
    await expect(page.locator('#station-count')).toHaveText('0');
    await expect(page.locator('#station-list')).toContainText('No hi ha estacions');
    await page.getByRole('button', { name: 'Neteja filtres' }).click(); await expect(page.locator('#station-count')).toHaveText('6');
    await page.locator('#field-filter').selectOption('temperature');
    await page.getByRole('button', { name: 'Cerca' }).click();
    await expect(page.locator('#station-count')).toHaveText('6');
    await page.locator('#freshness-filter').selectOption('OBSOLETA');
    await page.getByRole('button', { name: 'Cerca' }).click();
    await expect(page.locator('#station-count')).toHaveText('0');
    await page.getByRole('button', { name: 'Neteja filtres' }).click();
    await expect(page.locator('#station-count')).toHaveText('6');
    checks.push('Search, measurement/freshness filters, reset, empty state and full list independent of viewport');
    await page.locator('#auto-refresh').uncheck();
    demo.stations[0].publication_revoked = true;
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(page.locator('#station-count')).toHaveText('0');
    await page.locator('#refresh').click(); await expect(page.locator('#station-count')).toHaveText('5');
    assert.equal((await page.locator('#station-list').textContent()).includes('Turó de prova'), false);
    checks.push('Paused refresh still invalidates revoked catalog; manual refresh excludes station');
    await audit(run); await run.ctx.close();

    const mobile = await context(browser, server.base, { width: 375, height: 667 });
    await ready(mobile.page, server.base, 5);
    assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.page.screenshot({ path: path.join(EVIDENCE, 'mobile.png'), fullPage: true });
    await expect(mobile.page.locator('#more-filters')).toBeHidden();
    await mobile.page.locator('#filter-toggle').click();
    await expect(mobile.page.locator('#more-filters')).toBeVisible();
    await mobile.page.locator('#freshness-filter').selectOption('OBSOLETA');
    await mobile.page.getByRole('button', { name: 'Cerca' }).click();
    await expect(mobile.page.locator('#station-count')).toHaveText('0');
    await expect(mobile.page.locator('#more-filters')).toBeHidden();
    await mobile.page.locator('#filter-toggle').click();
    await mobile.page.getByRole('button', { name: 'Neteja filtres' }).click();
    await expect(mobile.page.locator('#station-count')).toHaveText('5');
    await mobile.page.setViewportSize({ width: 320, height: 667 });
    assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.ctx.setOffline(true);
    await expect(mobile.page.locator('#station-count')).toHaveText('0');
    await expect(mobile.page.locator('#status')).toContainText('Sense connexió');
    checks.push('Reflow 375/320 px, offline clears unverified public data');
    await audit(mobile); await mobile.ctx.close();

    const statusStations = structuredClone(createMapDemo().stations.slice(0, 3));
    statusStations[0].sensors[0].fields[0].current_value = 90;
    statusStations[1].observed_at = '2025-12-01T00:00:00Z';
    statusStations[2].sensors[0].fields[0].review_state = 'EN_REVISIO';
    const statesServer = await start(statusStations);
    try {
      const states = await context(browser, statesServer.base);
      await ready(states.page, statesServer.base, 3);
      const rows = states.page.locator('#station-list li');
      await expect(rows.nth(0)).toContainText('Dada sospitosa · no fiable');
      await expect(rows.nth(0)).toContainText('90 °C');
      await expect(rows.nth(1)).toContainText('Dada obsoleta');
      await expect(rows.nth(1).locator('.temperature')).toHaveText('—');
      await expect(rows.nth(2)).toContainText('En revisió');
      await expect(rows.nth(2).locator('.temperature')).toHaveText('—');
      await audit(states); await states.ctx.close();
      checks.push('Suspicious, obsolete and under-review states have visible text and correct current values');
    } finally { await statesServer.close(); }

    for (const asset of ['maplibre-gl.mjs', 'maplibre-gl-worker.mjs', 'style.json', 'map-a-synthetic.pmtiles']) {
      const degraded = await context(browser, server.base);
      await degraded.ctx.route(`**/${asset}`, (route) => route.abort());
      await degraded.page.goto(`${server.base}/meteo/mapa/`);
      await expect(degraded.page.locator('#station-count')).toHaveText('5');
      await expect(degraded.page.locator('#map-status')).toContainText('El mapa no està disponible');
      await degraded.page.locator('.station-name').first().click();
      await expect(degraded.page.locator('#dialog-title')).toHaveText('Vall de prova');
      assert.deepEqual(degraded.egress, []); assert.deepEqual(await degraded.page.evaluate(() => window.__mapCsp), []);
      checks.push(`Degradation with blocked ${asset} preserves list and station summary`);
      await degraded.ctx.close();
    }
    const unavailable = await context(browser, server.base);
    await unavailable.ctx.route('**/api/v1/map/catalog-version', (route) => route.fulfill({ status: 503, body: '{}' }));
    await unavailable.page.goto(`${server.base}/meteo/mapa/`);
    await expect(unavailable.page.locator('#status')).toContainText('No s’ha pogut verificar');
    await expect(unavailable.page.locator('#station-count')).toHaveText('0');
    checks.push('Unavailable catalog version fails closed'); await unavailable.ctx.close();
    write('browser-tests.json', { result: 'PASS', browser: browser.version(), checks, egress: [], csp: [] });
    console.log(JSON.stringify({ result: 'PASS', checks }, null, 2));
  } finally { await server.close(); }
}
const percentile = (values) => [...values].sort((a,b) => a-b)[Math.ceil(values.length * .95) - 1];
async function benchmark(browser) {
  const preflight = JSON.parse(fs.readFileSync(path.join(EVIDENCE, 'preflight.json')));
  write('benchmark-environment.json', { ...preflight.benchmark, browser: browser.version(), executablePath,
    platform: os.platform(), architecture: os.arch(), cpu: os.cpus()[0].model, cores: os.cpus().length,
    fixed_before_measurement: new Date().toISOString() });
  const results = [];
  for (const count of [100, 500]) {
    const stations = structuredClone(require('../test/fixtures/map-a/stations-500.json')).slice(0, count);
    const server = await start(stations), samples = [];
    try {
      for (let sample = 0; sample < preflight.benchmark.samples; sample++) {
        const run = await context(browser, server.base, { width: 375, height: 667 });
        try {
          const cdp = await run.ctx.newCDPSession(run.page);
          await cdp.send('Network.enable');
          await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
          await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 1125000, uploadThroughput: 187500 });
          await ready(run.page, server.base, count);
          const metrics = await run.page.evaluate(() => ({ tti_ms: performance.getEntriesByName('map-interactive').at(-1).startTime, long_tasks: window.__longTasks,
            clusters: document.querySelectorAll('.map-marker.cluster').length, count: document.querySelectorAll('#station-list li').length }));
          assert.ok(metrics.clusters > 0); assert.equal(metrics.count, count);
          let started = performance.now();
          await run.page.locator('.station-name').first().click();
          await expect(run.page.locator('#dialog-title')).toContainText('Synthetic Station');
          metrics.modal_ms = performance.now() - started;
          await run.page.keyboard.press('Escape');
          started = performance.now(); await run.page.locator('.station-link').first().click();
          await expect(run.page.locator('#detail-title')).toContainText('Synthetic Station');
          metrics.detail_ms = performance.now() - started;
          await audit(run); samples.push(metrics);
          if (sample === 0) await run.page.screenshot({ path: path.join(EVIDENCE, `benchmark-${count}.png`), fullPage: false });
        } finally { await run.ctx.close(); }
      }
    } finally { await server.close(); }
    const summary = { count, tti_p95_ms: percentile(samples.map((s) => s.tti_ms)), modal_p95_ms: percentile(samples.map((s) => s.modal_ms)), detail_p95_ms: percentile(samples.map((s) => s.detail_ms)), samples };
    summary.result = summary.tti_p95_ms <= 2500 && summary.modal_p95_ms <= 500 && summary.detail_p95_ms <= 1000 ? 'PASS' : 'FAIL';
    results.push(summary); console.log(JSON.stringify({ ...summary, samples: samples.length }));
    write('p06-a-19.json', { head: HEAD, result: results.every((r) => r.result === 'PASS') ? 'PASS' : 'FAIL', results });
  }
}
(async () => {
  fs.mkdirSync(EVIDENCE, { recursive: true });
  const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try { await (process.argv.includes('--benchmark') ? benchmark(browser) : functional(browser)); }
  catch (error) { write('browser-failure.json', { message: error.message, stack: error.stack, checks }); throw error; }
  finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
