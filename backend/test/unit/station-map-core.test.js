'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const CORE_PATH = path.resolve(__dirname, '../../../site/src/ui/components/stationMapCore.js');
let sequence = 0;

async function loadCore({ transform = (source) => source } = {}) {
  const source = transform(fs.readFileSync(CORE_PATH, 'utf8'));
  return import(`data:text/javascript;base64,${Buffer.from(`${source}\n// test-${sequence += 1}`).toString('base64')}`);
}

function feature(id, longitude, latitude, extras = {}) {
  return { type: 'Feature', geometry: { type: 'Point', coordinates: [longitude, latitude] }, properties: { public_station_id: id, resource_kind: 'STATION', ...extras } };
}

test('H14-P1 merges only already-authorized collections and selection has no residual marker', async () => {
  const core = await loadCore();
  const publicFeature = feature('public', 1, 2);
  const privateFeature = feature('private', 3, 4, { access_scope: 'OWNER' });
  const replacement = feature('public', 5, 6, { access_scope: 'OWNER' });
  const merged = core.mergeAuthorizedMapCollections(
    { type: 'FeatureCollection', features: [publicFeature, privateFeature] },
    { type: 'FeatureCollection', features: [replacement] },
  );
  assert.deepEqual(merged.features, [replacement, privateFeature]);
  assert.deepEqual([...core.selectedMarkerIds(merged.features, 'private')], ['3,4']);
  assert.deepEqual([...core.selectedMarkerIds(merged.features, 'missing')], []);
});

test('map variable marker labels use the selected field, preserve zero and show missing values', async () => {
  const core = await loadCore();
  const station = feature('station', 2, 41, {
    public_name: 'Estació',
    sensors: [{ fields: [{ field_id: 'temperature', current_value: 18.5 }] }],
    map_values: {
      temperature: { field_id: 'temperature', current_value: 18.5 },
      rain_24h: { field_id: 'rain_24h', current_value: 0 },
      wind_speed: { field_id: 'wind_speed', current_value: 12.6 },
      pressure: { field_id: 'pressure', current_value: 1013.2 },
      humidity: { field_id: 'humidity', current_value: null },
    },
  }).properties;
  assert.equal(core.markerLabel(station, 'temperature'), '18,5 °C');
  assert.equal(core.markerLabel(station, 'rain_24h'), '0 mm');
  assert.equal(core.markerLabel(station, 'wind_speed'), '12,6 km/h');
  assert.equal(core.markerLabel(station, 'pressure'), '1013,2 hPa');
  assert.equal(core.markerLabel(station, 'humidity'), '—');
});

test('H14-P1 map loader uses public plus same-origin session endpoints, preserves no-current stations and checks version', async () => {
  const core = await loadCore();
  const priorFetch = global.fetch;
  const calls = [];
  const controller = new AbortController();
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url === '/api/v1/map/stations') return new Response(JSON.stringify({ type: 'FeatureCollection', features: [feature('without-current', 1, 2, { sensors: [] })] }), { headers: { 'X-Catalog-Version': 'v1' } });
    if (url === '/api/v1/map/session-stations') return new Response(JSON.stringify({ type: 'FeatureCollection', features: [feature('private', 3, 4, { access_scope: 'OWNER' })] }));
    if (url === '/api/v1/map/catalog-version') return new Response(JSON.stringify({ catalog_version: 'v1' }));
    throw new Error(`unexpected ${url}`);
  };
  try {
    const result = await core.loadAuthorizedStationMap({ apiBase: '/api', signal: controller.signal });
    assert.deepEqual(result.collection.features.map((item) => item.properties.public_station_id), ['without-current', 'private']);
    assert.equal(result.privateById.has('private'), true);
    assert.equal(calls.find((call) => call.url.endsWith('/session-stations')).options.credentials, 'same-origin');
    assert.equal(calls.every((call) => call.options.signal === controller.signal), true);
    assert.equal(calls.some((call) => String(call.url).includes('grafana')), false);
  } finally {
    global.fetch = priorFetch;
  }
});

test('H14-P1 map loader rejects a stale catalog version instead of applying an old collection', async () => {
  const core = await loadCore();
  const priorFetch = global.fetch;
  global.fetch = async (url) => {
    if (url === '/api/v1/map/stations') return new Response(JSON.stringify({ type: 'FeatureCollection', features: [] }), { headers: { 'X-Catalog-Version': 'v1' } });
    if (url === '/api/v1/map/session-stations') return new Response(JSON.stringify({ type: 'FeatureCollection', features: [] }));
    return new Response(JSON.stringify({ catalog_version: 'v2' }));
  };
  try {
    await assert.rejects(core.loadAuthorizedStationMap({ apiBase: '/api' }), /map_unverified/);
  } finally {
    global.fetch = priorFetch;
  }
});

test('H14-P2 enables only the explicitly embedded real map in production', async () => {
  const core = await loadCore();
  assert.equal(core.canInitializeStationMap({
    config: { environment: 'production', syntheticData: false }, mapMode: 'real', allowProduction: true,
  }), true);
  assert.equal(core.canInitializeStationMap({
    config: { environment: 'production', syntheticData: false }, mapMode: 'real',
  }), false);
  assert.equal(await core.createStationMapCore({ container: {}, config: { environment: 'staging' } }), null);
  assert.throws(
    () => core.resolveMapRuntime({ config: { environment: 'production', syntheticData: false }, mapMode: 'synthetic' }),
    /production_synthetic_map/
  );
});

test('H14-P1 keeps meteorological synthetic data separate from embedded map cartography', async () => {
  const core = await loadCore();
  const embedded = core.resolveMapRuntime({ config: { syntheticData: true }, mapMode: 'real' });
  assert.deepEqual(embedded, {
    mode: 'real', usesPmtiles: false, stylePath: '/meteo/map-assets/style.real.json', center: [1.7, 41.8], zoom: 8,
  });

  const standaloneSynthetic = core.resolveMapRuntime({ config: { syntheticData: true } });
  assert.equal(standaloneSynthetic.usesPmtiles, true);
  assert.equal(standaloneSynthetic.stylePath, '/meteo/map-assets/style.json');

  const standaloneReal = core.resolveMapRuntime({ config: { syntheticData: false } });
  assert.equal(standaloneReal.usesPmtiles, false);
  assert.equal(standaloneReal.stylePath, '/meteo/map-assets/style.real.json');
});

test('synthetic fatal error before load is terminal and cannot resurrect the map core', async () => {
  const engineSource = `
    export class Map {
      constructor() { this.handlers = new globalThis.Map(); globalThis.__stationMapCoreTest.map = this; }
      on(event, listener) {
        const listeners = this.handlers.get(event) || [];
        listeners.push(listener);
        this.handlers.set(event, listeners);
        if (event === 'error') queueMicrotask(() => listener({ error: new Error('pmtiles unavailable') }));
        if (event === 'load') queueMicrotask(() => listener());
        return this;
      }
      addControl() {}
      getCanvas() { return { setAttribute() {} }; }
      remove() { globalThis.__stationMapCoreTest.removed += 1; }
      addSource() { globalThis.__stationMapCoreTest.sources += 1; }
      addLayer() { globalThis.__stationMapCoreTest.layers += 1; }
    }
    export class NavigationControl {}
    export class LngLatBounds {}
    export function setWorkerUrl() {}
    export function addProtocol() {}
  `;
  const engineUrl = `data:text/javascript;base64,${Buffer.from(engineSource).toString('base64')}`;
  const core = await loadCore({
    transform: (source) => source.replace("import('/meteo/map-assets/maplibre-gl.mjs')", `import('${engineUrl}')`),
  });
  const previous = {
    fetch: global.fetch,
    window: global.window,
    location: global.location,
    state: global.__stationMapCoreTest,
  };
  const state = { removed: 0, sources: 0, layers: 0 };
  global.__stationMapCoreTest = state;
  global.window = { pmtiles: { Protocol: class { constructor() { this.tile = () => {}; } } } };
  global.location = { origin: 'http://localhost' };
  global.fetch = async (url) => new Response(
    String(url).includes('worker') ? '' : JSON.stringify({ sources: { synthetic: {} } }),
    { status: 200 },
  );
  let unavailable = 0;
  try {
    const result = await core.createStationMapCore({
      container: {},
      config: { environment: 'local', syntheticData: true },
      onUnavailable: () => { unavailable += 1; },
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(result, null);
    assert.equal(unavailable, 1);
    assert.equal(state.removed, 1);
    assert.equal(state.sources, 0);
    assert.equal(state.layers, 0);
  } finally {
    global.fetch = previous.fetch;
    global.window = previous.window;
    global.location = previous.location;
    global.__stationMapCoreTest = previous.state;
  }
});
