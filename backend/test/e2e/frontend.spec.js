'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const FIXED_NOW = '2030-01-15T12:00:00.000Z';
const LOCAL_ORIGIN = 'http://backend:8080';
const EVIDENCE_DIR = process.env.T20_EVIDENCE_DIR || '/tmp/meteolord-e2e';
const SCREENSHOT_DIR = path.join(EVIDENCE_DIR, 'screenshots');
const requestInventory = [];
const externalRequests = [];
const cspViolations = [];
const pageAudits = new WeakMap();

function localRequestLabel(request) {
  const url = new URL(request.url());
  return `${request.method()} ${url.pathname}${url.search}`;
}

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true, mode: 0o755 });
});

test.beforeEach(async ({ page }) => {
  const audit = { consoleErrors: [], csp: [], external: [] };
  pageAudits.set(page, audit);

  await page.addInitScript((fixedNow) => {
    const NativeDate = Date;
    class FixedDate extends NativeDate {
      constructor(...args) {
        super(...(args.length ? args : [fixedNow]));
      }
      static now() {
        return new NativeDate(fixedNow).getTime();
      }
    }
    Object.defineProperty(window, 'Date', { value: FixedDate });
  }, FIXED_NOW);

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== LOCAL_ORIGIN) {
      const label = `${request.method()} ${url.protocol}//${url.host}${url.pathname}`;
      audit.external.push(label);
      externalRequests.push(label);
      await route.abort('blockedbyclient');
      return;
    }
    requestInventory.push(localRequestLabel(request));
    await route.continue();
  });

  page.on('console', (message) => {
    const text = message.text();
    if (/content security policy|refused to (load|execute|apply|connect)/i.test(text)) {
      audit.csp.push(text);
      cspViolations.push(text);
    }
    if (message.type() === 'error') audit.consoleErrors.push(text);
  });
  page.on('pageerror', (error) => audit.consoleErrors.push(error.message));
});

test.afterEach(async ({ page }) => {
  const audit = pageAudits.get(page);
  expect(audit.external, 'external requests must be rejected and absent').toEqual([]);
  expect(audit.csp, 'CSP console violations must be absent').toEqual([]);
  expect(audit.consoleErrors, 'browser console/page errors must not be ignored').toEqual([]);
});

test.afterAll(() => {
  const requests = [...new Set(requestInventory)].sort();
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'network-requests.txt'),
    [
      'T20 LOCAL REQUEST INVENTORY',
      `allowed_origin=${LOCAL_ORIGIN}`,
      `external_request_count=${externalRequests.length}`,
      '',
      ...requests,
      '',
    ].join('\n'),
    'utf8'
  );
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'console-violations.txt'),
    cspViolations.join('\n'),
    'utf8'
  );
});

async function loadDashboard(page) {
  const response = await page.goto('/meteo/', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('.tl-title')).toHaveText('MeteoLord');
  await expect(page.locator('#screen-meteo .card')).not.toHaveCount(0);
  return response;
}

async function openScreen(page, screen, heading) {
  await page.getByRole('button', { name: heading, exact: true }).click();
  await expect(page.locator(`#screen-${screen}`)).toHaveClass(/active/);
  await expect(page.locator(`#screen-${screen} h2`)).toContainText(heading);
}

test('1. /meteo/ loads the expected application shell', async ({ page }) => {
  await loadDashboard(page);
  await expect(page).toHaveTitle('Tecnolord — MeteoLord');
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegació principal' })).toBeVisible();
  await expect(page.locator('.nav-btn')).toHaveCount(4);
});

test('2. Meteo renders deterministic synthetic temperature and humidity', async ({ page }) => {
  await loadDashboard(page);
  await expect(page.locator('#screen-meteo')).toContainText('Temperatura');
  await expect(page.locator('#screen-meteo')).toContainText('18.5');
  await expect(page.locator('#screen-meteo')).toContainText('Humitat');
  await expect(page.locator('#screen-meteo')).toContainText('51');
});

test('3. Cabals renders Cardener, Valls and the synthetic reservoir', async ({ page }) => {
  await loadDashboard(page);
  await openScreen(page, 'cabals', 'Cabals');
  await expect(page.locator('#screen-cabals')).toContainText('Cardener');
  await expect(page.locator('#screen-cabals')).toContainText('Valls');
  await expect(page.locator('#screen-cabals')).toContainText('Embassament · Capacitat');
  await expect(page.locator('#screen-cabals')).toContainText('Synthetic Reservoir 01');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'synthetic-cabals.png'), fullPage: true });
});

test('4. Històrics renders synthetic counters, statistics and tables', async ({ page }) => {
  await loadDashboard(page);
  await openScreen(page, 'historics', 'Històrics');
  await expect(page.locator('#hist-meteo-count')).toHaveText('4');
  await expect(page.locator('#hist-hidro-count')).toHaveText('3');
  await expect(page.locator('#screen-historics')).toContainText('Evolució Temperatura');
  await expect(page.locator('#tbl-hist-meteo tbody tr')).toHaveCount(4);
});

test('5. Previsió renders the synthetic run and forecast values', async ({ page }) => {
  await loadDashboard(page);
  await openScreen(page, 'previ', 'Previsió');
  await expect(page.locator('#previ-status')).toHaveText('synthetic · synthetic-meteo-01');
  await expect(page.locator('#screen-previ')).toContainText('Temperatura prevista');
  await expect(page.locator('#screen-previ')).toContainText('16.5');
  await expect(page.locator('#screen-previ')).toContainText('Evolució 48 h');
});

test('6. every browser request remains on the internal backend origin', async ({ page }) => {
  await loadDashboard(page);
  await page.waitForLoadState('networkidle');
  expect(pageAudits.get(page).external).toEqual([]);
  expect(requestInventory.length).toBeGreaterThan(0);
});

test('7. the approved CSP produces no browser violation', async ({ page }) => {
  const response = await loadDashboard(page);
  const csp = response.headers()['content-security-policy'];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("script-src 'self'");
  expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  expect(pageAudits.get(page).csp).toEqual([]);
});

test('8. accessible labels and primary navigation switch every screen', async ({ page }) => {
  await loadDashboard(page);
  for (const [screen, label] of [
    ['cabals', 'Cabals'],
    ['historics', 'Històrics'],
    ['previ', 'Previsió'],
    ['meteo', 'Meteo'],
  ]) {
    await openScreen(page, screen, label);
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveClass(/active/);
  }
});

test('9. data age uses the controlled clock', async ({ page }) => {
  await loadDashboard(page);
  await expect(page.locator('#meteo-last')).toHaveText('Dades actualitzades fa 5 min');
});

test('10. charts render into non-empty canvases', async ({ page }) => {
  await loadDashboard(page);
  const meteoCanvases = page.locator('#screen-meteo canvas');
  await expect(meteoCanvases).toHaveCount(4);
  for (let index = 0; index < await meteoCanvases.count(); index += 1) {
    const size = await meteoCanvases.nth(index).evaluate((canvas) => ({
      width: canvas.width,
      height: canvas.height,
      points: canvas.__tlChart?.points?.length || 0,
    }));
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
    expect(size.points).toBeGreaterThan(1);
  }

  await openScreen(page, 'previ', 'Previsió');
  const forecastChart = page.locator('#chart-previ-temp');
  await expect(forecastChart).toBeVisible();
  expect(await forecastChart.evaluate((canvas) => canvas.__tlChart?.points?.length || 0)).toBe(3);
});
