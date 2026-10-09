'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildMeteo } = require('../../../scripts/frontend/build-meteo');
const site = path.resolve(__dirname, '../../../site');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'meteo-release-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'site');
  fs.cpSync(site, source, { recursive: true });
  let count = 0;
  return { source, build: () => buildMeteo({ source, output: path.join(root, `build-${++count}`) }) };
}

test('deterministic release versions the entire ES module graph, CSS and map workers', (t) => {
  const f = fixture(t);
  const a = f.build();
  assert.equal(f.build().version, a.version);
  const base = path.join(a.output, 'releases', a.version);
  const html = fs.readFileSync(path.join(a.output, 'index.html'), 'utf8');
  for (const asset of ['src/main.js', 'src/styles.css', 'map-assets/maplibre-gl.css']) {
    assert.ok(html.includes(`/meteo/releases/${a.version}/${asset}`));
    assert.ok(fs.existsSync(path.join(base, asset)));
  }
  // Check every relative and same-origin module dependency in the actual build.
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = path.join(dir, entry.name);
      if (entry.isDirectory()) { visit(name); continue; }
      if (!/\.(?:js|mjs)$/.test(name)) continue;
      const text = fs.readFileSync(name, 'utf8').replace(/^\s*\/\/.*$/gm, '');
      for (const [, dependency] of text.matchAll(/(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g)) {
        if (!dependency.startsWith('.') && !dependency.startsWith('/meteo/')) continue;
        const target = dependency.startsWith('.') ? path.resolve(path.dirname(name), dependency)
          : path.join(a.output, dependency.slice('/meteo/'.length));
        assert.ok(target.startsWith(base + path.sep), `${name} escapes version: ${dependency}`);
        assert.ok(fs.existsSync(target), `${name}: missing ${dependency}`);
      }
    }
  }
  visit(base);
  const core = fs.readFileSync(path.join(base, 'src/ui/components/stationMapCore.js'), 'utf8');
  assert.ok(core.includes(`/meteo/releases/${a.version}/map-assets/maplibre-gl-worker.mjs`));
  assert.doesNotMatch(core, /['"]\/meteo\/map-assets\//);
  assert.match(fs.readFileSync(path.join(a.output, 'compte/index.html'), 'utf8'), new RegExp(`/releases/${a.version}/compte/account.js`));
  assert.match(fs.readFileSync(path.join(a.output, 'mapa/index.html'), 'utf8'), new RegExp(`/releases/${a.version}/src/map.js`));
  assert.match(fs.readFileSync(path.join(a.output, 'runtime-config.js'), 'utf8'), /SYNTHETIC_DATA: false/);
});

for (const file of ['src/ui/components/tecnolordHeader.js', 'src/styles.css', 'index.html', 'map-assets/maplibre-gl-worker.mjs']) {
  test(`changing ${file} renews entry CSS/JS and all transitive URLs together`, (t) => {
    const f = fixture(t);
    const before = f.build();
    fs.appendFileSync(path.join(f.source, file), '\n/* changed */\n');
    const after = f.build();
    assert.notEqual(after.version, before.version);
    const html = fs.readFileSync(path.join(after.output, 'index.html'), 'utf8');
    assert.ok(html.includes(`/releases/${after.version}/src/main.js`));
    assert.ok(html.includes(`/releases/${after.version}/src/styles.css`));
    assert.ok(fs.existsSync(path.join(after.output, 'releases', after.version, 'src/ui/components/tecnolordHeader.js')));
  });
}

test('MeteoLord manifest keeps its existing URL and implicit identity; icons resolve correctly', (t) => {
  const { output } = fixture(t).build();
  const manifestPath = 'assets/icons/site.webmanifest';
  const manifest = JSON.parse(fs.readFileSync(path.join(output, manifestPath)));
  assert.equal(manifest.name, 'MeteoLord');
  assert.equal(manifest.short_name, 'MeteoLord');
  // These fields were absent before: changing them could change existing identity/scope.
  for (const field of ['id', 'start_url', 'scope']) assert.equal(Object.hasOwn(manifest, field), false);
  for (const icon of manifest.icons) {
    const url = new URL(icon.src, `https://test.invalid/meteo/${manifestPath}`);
    assert.ok(fs.existsSync(path.join(output, url.pathname.slice('/meteo/'.length))));
  }
  const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  assert.match(html, /<title>MeteoLord<\/title>/);
  assert.match(html, /name="apple-mobile-web-app-title" content="MeteoLord"/);
  assert.match(html, /rel="manifest" href="\.\/assets\/icons\/site.webmanifest"/);
  assert.doesNotMatch(html, /Myite|MySite|MyWebSite/);
});

test('build cannot overwrite source or an existing release directory', (t) => {
  const f = fixture(t);
  const first = f.build();
  assert.throws(() => buildMeteo({ source: f.source, output: first.output }), /already exists/);
  assert.throws(() => buildMeteo({ source: f.source, output: path.join(f.source, 'output') }), /outside site/);
});
