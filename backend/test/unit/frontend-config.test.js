'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const SITE_DIR = path.resolve(__dirname, '../../../site');
const CONFIG_SOURCE = fs.readFileSync(path.join(SITE_DIR, 'src/config.js'), 'utf8');
const ANALYTICS_SOURCE = fs.readFileSync(path.join(SITE_DIR, 'src/analytics.js'), 'utf8');
const LOCAL_RUNTIME_PATH = path.join(SITE_DIR, 'runtime-config.js');
const CANONICAL_LOCAL_RUNTIME_PATH = path.resolve(
  __dirname,
  '../../../config/meteolord/runtime-config.local.js'
);

const VALID_LOCAL = Object.freeze({
  API_BASE: '/api',
  MAP_TILE_URL: '',
  ANALYTICS_ENABLED: false,
  EXTERNAL_LINKS_ENABLED: false,
  ENVIRONMENT: 'local',
  SYNTHETIC_DATA: true,
});

let moduleSequence = 0;

async function importSource(source, { windowValue, provideWindow = true } = {}) {
  if (provideWindow) globalThis.window = windowValue;
  else delete globalThis.window;
  const encoded = Buffer.from(`${source}\n// test-import-${moduleSequence += 1}`).toString('base64');
  try {
    return await import(`data:text/javascript;base64,${encoded}`);
  } finally {
    delete globalThis.window;
  }
}

test('local runtime config is an immutable exact override and matches its canonical source', () => {
  const siteSource = fs.readFileSync(LOCAL_RUNTIME_PATH, 'utf8');
  assert.equal(siteSource, fs.readFileSync(CANONICAL_LOCAL_RUNTIME_PATH, 'utf8'));

  const sandbox = { window: {} };
  vm.runInNewContext(siteSource, sandbox, { filename: 'runtime-config.js' });
  const descriptor = Object.getOwnPropertyDescriptor(sandbox.window, '__METEOLORD_CONFIG');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
  assert.equal(Object.isFrozen(descriptor.value), true);
  assert.equal(descriptor.value.ENVIRONMENT, 'local');
  assert.equal(descriptor.value.ANALYTICS_ENABLED, false);
  assert.equal(descriptor.value.EXTERNAL_LINKS_ENABLED, false);
});

test('frontend config resolves the valid local schema and same-origin API paths', async () => {
  const module = await importSource(CONFIG_SOURCE, {
    windowValue: { __METEOLORD_CONFIG: { ...VALID_LOCAL } },
  });
  assert.equal(module.CONFIG.apiBase, '/api');
  assert.equal(module.CONFIG.meteoEndpoint, '/api/v1/mesures/darreres');
  assert.equal(module.CONFIG.hidroEndpoint, '/api/v1/hidro/darreres');
  assert.equal(module.CONFIG.previEndpoint, '/api/v1/previ/48h');
  assert.equal(module.CONFIG.analyticsEnabled, false);
  assert.equal(module.CONFIG.externalLinksEnabled, false);
  assert.equal(module.CONFIG.syntheticData, true);
  assert.equal(Object.isFrozen(module.CONFIG), true);
});

test('frontend fails closed when runtime config is missing', async () => {
  await assert.rejects(
    importSource(CONFIG_SOURCE, { provideWindow: false }),
    /runtime configuration.*missing/i
  );
  await assert.rejects(
    importSource(CONFIG_SOURCE, { windowValue: {} }),
    /runtime configuration.*missing/i
  );
});

test('frontend rejects incomplete, external and unsafe local runtime values', async () => {
  const invalidConfigs = [
    { ...VALID_LOCAL, API_BASE: 'https://external.invalid/api' },
    { ...VALID_LOCAL, API_BASE: '/api?target=external.invalid' },
    { ...VALID_LOCAL, ANALYTICS_ENABLED: true },
    { ...VALID_LOCAL, EXTERNAL_LINKS_ENABLED: true },
    { ...VALID_LOCAL, MAP_TILE_URL: 'https://tiles.invalid/{z}/{x}/{y}' },
    { ...VALID_LOCAL, SYNTHETIC_DATA: false },
    { ...VALID_LOCAL, UNAPPROVED_KEY: true },
    Object.fromEntries(Object.entries(VALID_LOCAL).filter(([key]) => key !== 'API_BASE')),
  ];

  for (const runtimeConfig of invalidConfigs) {
    await assert.rejects(
      importSource(CONFIG_SOURCE, { windowValue: { __METEOLORD_CONFIG: runtimeConfig } }),
      /Invalid MeteoLord runtime configuration/
    );
  }
});

test('production runtime keeps characterized analytics and external links enabled', async () => {
  const module = await importSource(CONFIG_SOURCE, {
    windowValue: {
      __METEOLORD_CONFIG: {
        API_BASE: '/api',
        MAP_TILE_URL: 'https://tiles.example.invalid/{z}/{x}/{y}',
        ANALYTICS_ENABLED: true,
        EXTERNAL_LINKS_ENABLED: true,
        ENVIRONMENT: 'production',
        SYNTHETIC_DATA: false,
      },
    },
  });
  assert.equal(module.CONFIG.analyticsEnabled, true);
  assert.equal(module.CONFIG.externalLinksEnabled, true);
  assert.equal(module.CONFIG.syntheticData, false);
  assert.equal(module.CONFIG.meteoEndpoint, '/api/v1/mesures/darreres');
});

test('analytics performs no document or tracker operation when local config disables it', async () => {
  const analytics = await importSource(ANALYTICS_SOURCE, { windowValue: {} });
  let created = 0;
  let tracked = 0;
  const documentDouble = {
    createElement() { created += 1; return {}; },
    head: { appendChild() { throw new Error('must not append analytics in local'); } },
  };
  const windowDouble = { umami: { track() { tracked += 1; } } };
  const config = { analyticsEnabled: false, environment: 'local' };

  assert.equal(analytics.initAnalytics(config, documentDouble), false);
  assert.equal(analytics.trackEvent(config, 'test', {}, windowDouble), false);
  assert.equal(analytics.trackPageview(config, '/meteo/', 'Meteo', windowDouble), false);
  assert.equal(created, 0);
  assert.equal(tracked, 0);
});

test('production analytics behavior remains available through conditional loading', async () => {
  const analytics = await importSource(ANALYTICS_SOURCE, { windowValue: {} });
  const appended = [];
  const documentDouble = {
    querySelector() { return null; },
    createElement() { return { dataset: {} }; },
    head: { appendChild(node) { appended.push(node); } },
  };
  let tracked = 0;
  const windowDouble = { umami: { track() { tracked += 1; } } };
  const config = { analyticsEnabled: true, environment: 'production' };

  assert.equal(analytics.initAnalytics(config, documentDouble), true);
  assert.equal(appended.length, 1);
  assert.equal(appended[0].src, 'https://stats.tecnolord.cat/script.js');
  assert.equal(appended[0].defer, true);
  assert.equal(analytics.trackEvent(config, 'test', {}, windowDouble), true);
  assert.equal(tracked, 1);
});

test('local frontend source gates external links and contains no inline event handler', () => {
  const index = fs.readFileSync(path.join(SITE_DIR, 'index.html'), 'utf8');
  const meteo = fs.readFileSync(path.join(SITE_DIR, 'src/ui/screens/meteoScreen.js'), 'utf8');
  const cabals = fs.readFileSync(path.join(SITE_DIR, 'src/ui/screens/cabalsScreen.js'), 'utf8');
  const header = fs.readFileSync(path.join(SITE_DIR, 'src/ui/components/tecnolordHeader.js'), 'utf8');

  assert.doesNotMatch(index, /https?:\/\//);
  assert.doesNotMatch(index, /\son[a-z]+\s*=/i);
  assert.doesNotMatch(header, /\son[a-z]+\s*=/i);
  assert.match(meteo, /CONFIG\.externalLinksEnabled\s*\?/);
  assert.match(cabals, /CONFIG\.externalLinksEnabled/);
});
