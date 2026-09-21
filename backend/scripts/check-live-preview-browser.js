'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

async function main() {
  const base = process.env.MAP_PREVIEW_URL || 'http://127.0.0.1:8096';
  const evidence = path.resolve(__dirname, '../../artifacts/live-local-preview');
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();
    const failedApi = [];
    const tiles = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/v1/') && response.status() >= 400) failedApi.push(`${response.status()} ${response.url()}`);
      if (response.url().startsWith('https://tile.openstreetmap.org/')) tiles.push(response.status());
    });
    await page.goto(`${base}/meteo/`, { waitUntil: 'domcontentloaded' });
    await page.locator('#meteo-last').getByText(/Dades actualitzades/).waitFor({ timeout: 20000 });
    assert.match(await page.locator('#meteo-cards').innerText(), /Temperatura/);
    await page.screenshot({ path: path.join(evidence, 'meteo.png'), fullPage: true });
    await page.goto(`${base}/meteo/mapa/`, { waitUntil: 'domcontentloaded' });
    await page.locator('#station-count').getByText('6').waitFor({ timeout: 25000 });
    await page.waitForFunction(() => document.documentElement.dataset.mapReady === 'true', { timeout: 25000 });
    assert.match(await page.locator('.demo-meta').innerText(), /Open-Meteo/);
    assert.match(await page.locator('#station-list').innerText(), /MeteoLord/);
    assert.match(await page.locator('#station-list').innerText(), /model/);
    assert.ok(tiles.some((status) => status === 200), `No successful OSM tiles: ${tiles.join(',')}`);
    assert.deepEqual(failedApi, []);
    await page.screenshot({ path: path.join(evidence, 'map-desktop.png'), fullPage: true });
    const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(`${base}/meteo/mapa/`, { waitUntil: 'domcontentloaded' });
    await mobilePage.locator('#station-count').getByText('6').waitFor({ timeout: 25000 });
    await mobilePage.waitForFunction(() => document.documentElement.dataset.mapReady === 'true', null, { timeout: 25000 });
    await mobilePage.screenshot({ path: path.join(evidence, 'map-mobile.png'), fullPage: true });
    assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    console.log(JSON.stringify({ result: 'PASS', tiles: tiles.length, evidence }, null, 2));
    await context.close();
    await mobile.close();
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
