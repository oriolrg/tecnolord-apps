'use strict';

// A real HTTP cache regression: Playwright routes disable cache, so none are used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const { chromium } = require('@playwright/test');
const { buildMeteo } = require('../../scripts/frontend/build-meteo');

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'meteo-update-browser-'));
  const source = path.join(root, 'source');
  fs.cpSync(path.resolve(__dirname, '../../site'), source, { recursive: true });
  const first = buildMeteo({ source, output: path.join(root, 'first') });
  let active = first;
  const releases = [first];
  const served = [];
  const app = express();
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'");
    // Deliberately warm immutable module cache; entry documents/metadata revalidate.
    res.setHeader('Cache-Control', req.path.includes('/releases/') ? 'public, max-age=31536000, immutable' : 'no-store');
    served.push(req.path);
    next();
  });
  app.get('/api/v1/auth/session', (_req, res) => res.json({ authenticated: false }));
  app.get('/api/v1/public-view', (_req, res) => res.json({ config: { station: null, card_ids: [], revision: 0 } }));
  app.use('/api', (_req, res) => res.json({ items: [] }));
  app.use('/meteo', (req, res, next) => express.static(active.output)(req, res, next));
  // Keep old releases reachable for already open documents throughout a rollout.
  app.use('/meteo', (req, res, next) => express.static(releases[0].output)(req, res, next));
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || chromium.executablePath(), headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const entry = `http://127.0.0.1:${server.address().port}/meteo/?v=2.2.8`;
    await page.goto(entry);
    await page.locator('.tl-title').getByText('MeteoLord', { exact: true }).waitFor();
    assert.ok(served.includes(`/meteo/releases/${first.version}/src/ui/components/tecnolordHeader.js`));

    // The only JS change is transitive: main.js itself is unchanged.
    const header = path.join(source, 'src/ui/components/tecnolordHeader.js');
    fs.writeFileSync(header, fs.readFileSync(header, 'utf8').replaceAll('escapeHtml(safeTitle)', "escapeHtml(safeTitle + ' nova')"));
    fs.appendFileSync(path.join(source, 'src/styles.css'), '\n.tl-title { color: rgb(1, 2, 3); }\n');
    const second = buildMeteo({ source, output: path.join(root, 'second') });
    assert.notEqual(first.version, second.version);
    active = second;
    served.length = 0;
    await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
    await page.locator('.tl-title').getByText('MeteoLord nova', { exact: true }).waitFor();
    assert.equal(await page.locator('.tl-title').evaluate((el) => getComputedStyle(el).color), 'rgb(1, 2, 3)');
    assert.equal(page.url(), entry); // Preserve installed-app entry path/query.
    for (const file of ['src/main.js', 'src/styles.css', 'src/ui/components/tecnolordHeader.js']) {
      assert.ok(served.includes(`/meteo/releases/${second.version}/${file}`), `not refreshed: ${file}`);
    }
    assert.equal(served.some((url) => url.startsWith(`/meteo/releases/${first.version}/`)), false);
    assert.equal(served.some((url) => /\/api\/v1\/(map|admin)\//.test(url)), false);
    assert.deepEqual(errors, []);
    await context.close();
    console.log('Meteo update browser PASS: warm cache, transitive JS + CSS renewal, resume reload, existing start URL, no service worker');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
