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
    browser = await chromium.launch({
      executablePath: process.env.MAP_CHROME || chromium.executablePath(),
      headless: true, args: ['--no-sandbox'],
    });
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const external = [];
    const errors = [];
    await context.route('**/*', async (route) => {
      if (new URL(route.request().url()).origin !== origin) {
        external.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${origin}/meteo/`, { waitUntil: 'domcontentloaded' });
    const selector = page.locator('#meteo-station');
    await page.waitForFunction(() => document.querySelector('#meteo-station')?.options.length === 3);
    await selector.selectOption('22222222-2222-4222-8222-222222222222');
    await page.waitForFunction(() => document.querySelector('#screen-meteo')?.textContent.includes('7.0'));
    assert.match(page.url(), /station_id=22222222-2222-4222-8222-222222222222/);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#meteo-station')?.value === '22222222-2222-4222-8222-222222222222');
    await page.waitForFunction(() => document.querySelector('#screen-meteo')?.textContent.includes('7.0'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
    console.log('UE-T07 browser PASS: selector, snapshot, reload persistence, 375 px, 0 external requests');
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
