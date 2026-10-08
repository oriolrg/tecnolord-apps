'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const caddyfile = fs.readFileSync(path.resolve(__dirname, '../../../Caddyfile'), 'utf8');

test('H14-P2 serves the production Meteo runtime with a route-scoped OSM CSP', () => {
  const runtime = caddyfile.match(/@meteo_runtime[\s\S]*?handle @meteo_runtime \{([\s\S]*?)\n  \}/);
  const meteo = caddyfile.match(/handle_path \/meteo\* \{([\s\S]*?)\n  \}/);
  assert.ok(runtime);
  assert.ok(meteo);
  assert.match(runtime[1], /rewrite \* \/runtime-config\.production\.js/);
  assert.match(runtime[1], /header Cache-Control "no-store, max-age=0"/);
  for (const block of [runtime[1], meteo[1]]) {
    assert.match(block, /img-src 'self' data: https:\/\/tile\.openstreetmap\.org/);
    assert.match(block, /connect-src 'self' https:\/\/tile\.openstreetmap\.org/);
    assert.doesNotMatch(block, /default-src \*/);
    assert.doesNotMatch(block, /https?:\/\/\*/);
    assert.doesNotMatch(block, /pmtiles/i);
  }
});
