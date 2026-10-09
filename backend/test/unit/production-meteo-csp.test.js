'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const caddyfile = fs.readFileSync(path.resolve(__dirname, '../../../Caddyfile'), 'utf8');

test('production Meteo does not store the runtime or app shell, including installed-app entry URLs', () => {
  const runtime = caddyfile.match(/@meteo_runtime[\s\S]*?handle @meteo_runtime \{([\s\S]*?)\n  \}/);
  const meteo = caddyfile.match(/handle_path \/meteo\* \{([\s\S]*?)\n  \}/);
  assert.ok(runtime);
  assert.ok(meteo);
  assert.match(runtime[1], /rewrite \* \/runtime-config\.production\.js/);
  assert.match(runtime[1], /header Cache-Control "no-store, max-age=0"/);
  assert.match(meteo[1], /header Cache-Control "no-store, max-age=0"/);
  for (const block of [runtime[1], meteo[1]]) {
    assert.match(block, /img-src 'self' data: https:\/\/tile\.openstreetmap\.org/);
    assert.match(block, /script-src 'self' https:\/\/stats\.tecnolord\.cat/);
    assert.match(block, /connect-src 'self' https:\/\/tile\.openstreetmap\.org https:\/\/stats\.tecnolord\.cat/);
    assert.doesNotMatch(block, /default-src \*/);
    assert.doesNotMatch(block, /https?:\/\/\*/);
    assert.doesNotMatch(block, /pmtiles/i);
  }
});

test('Meteo app shell has no stale manual asset version and does not install a service worker', () => {
  const siteDir = path.resolve(__dirname, '../../../site');
  const index = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
  const main = fs.readFileSync(path.join(siteDir, 'src/main.js'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(siteDir, 'assets/icons/site.webmanifest'), 'utf8'));
  assert.doesNotMatch(index, /[?&]v=2\.2\.8/);
  assert.match(index, /<script type="module" src="\.\/src\/main\.js"><\/script>/);
  assert.doesNotMatch(main, /serviceWorker/);
  assert.equal(manifest.display, 'standalone');
});
