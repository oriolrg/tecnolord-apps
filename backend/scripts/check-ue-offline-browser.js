'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

async function main() {
  const server = await new Promise((resolve) => {
    const listening = createPreviewApp().listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const egress = [], errors = [];
    await context.route('**/*', async (route) => {
      if (new URL(route.request().url()).origin !== origin) {
        egress.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));

    const meteo = await page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    assert.equal(meteo.status(), 200);
    await page.locator('#screen-meteo .card').first().waitFor();
    assert.match(await page.locator('#screen-meteo').textContent(), /18[.,]5/);
    await page.getByRole('button', { name: 'Cabals', exact: true }).click();
    assert.match(await page.locator('#screen-cabals').textContent(), /Cardener/);
    assert.match(await page.locator('#screen-cabals').textContent(), /Synthetic Reservoir 01/);
    assert.equal(await page.locator('#hidro-err').textContent(), '');
    await page.locator('.nav-btn[data-screen="previ"]').click();
    assert.match(await page.locator('#screen-previ').textContent(), /synthetic-meteo-01/);
    await page.locator('.nav-btn[data-screen="historics"]').click();
    assert.match(await page.locator('#screen-historics').textContent(), /Evolució Temperatura/);
    assert.equal(await page.locator('#hist-err').textContent(), '');

    const map = await page.goto(`${origin}/meteo/mapa/`, { waitUntil: 'domcontentloaded' });
    assert.equal(map.status(), 200);
    await page.waitForFunction(() => document.querySelector('#station-count')?.textContent === '6', null, { timeout: 15000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(egress, []);
    assert.deepEqual(errors, []);
    console.log('UE-T01 browser PASS: Meteo, Cabals, Històrics, Previ, mapa; 375 px; 0 external requests');
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
