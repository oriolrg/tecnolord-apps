'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { createApp } = require('../../server');

const FIXTURES = path.resolve(__dirname, '../fixtures/map-a');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
}

function stationsForHttpTests() {
  return [
    ...readFixture('stations-basic.json'),
    ...readFixture('stations-internal.json'),
    ...readFixture('stations-defect01.json'),
    ...readFixture('stations-duplicate.json'),
    ...readFixture('stations-nearby.json'),
    ...readFixture('stations-nogeo.json'),
  ];
}

async function withServer(callback, { stations = stationsForHttpTests(), rateLimit, historyProfiles, observations } = {}) {
  const app = createApp({
    environment: { METEOLORD_ENV: 'test' },
    pool: { query: async () => ({ rows: [] }) },
    httpClient: async () => { throw new Error('map HTTP tests do not use network'); },
    accessLogStream: { write() {} },
    mapPublicStations: stations,
    mapPublicRateLimit: rateLimit,
    mapPublicHistoryProfiles: historyProfiles,
    mapPublicObservations: observations,
  });
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  const { port } = server.address();
  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function assertNoForbiddenPublicFields(value) {
  const text = JSON.stringify(value);
  for (const field of [
    'INTERNAL_ONLY',
    'defect_01_affected',
    'canonical_station_id',
    'duplicate_group_id',
    'privacy_radius_m',
    'geo_policy_version',
    'consent_required',
  ]) assert.equal(text.includes(field), false, `forbidden field ${field}`);
}

test('MAP-A endpoints return the same public fixture set and catalog version', async () => {
  await withServer(async (baseUrl) => {
    const stations = await fetch(`${baseUrl}/api/v1/map/stations`);
    assert.equal(stations.status, 200);
    assert.equal(stations.headers.get('x-catalog-version'), 'map-a-synthetic-v1');
    const geojson = await stations.json();
    assert.equal(geojson.type, 'FeatureCollection');
    assert.equal(geojson.features.length, 8);
    assertNoForbiddenPublicFields(geojson);

    const list = await fetch(`${baseUrl}/api/v1/map/list`);
    assert.equal(list.status, 200);
    const listBody = await list.json();
    assert.equal(listBody.count, 8);
    assert.deepEqual(listBody.features, geojson.features);

    const station = await fetch(`${baseUrl}/api/v1/map/stations/syn-001`);
    assert.equal(station.status, 200);
    assert.equal((await station.json()).public_station_id, 'syn-001');

    const version = await fetch(`${baseUrl}/api/v1/map/catalog-version`);
    assert.equal(version.status, 200);
    assert.deepEqual(await version.json(), { catalog_version: 'map-a-synthetic-v1' });

    const sitemap = await fetch(`${baseUrl}/api/v1/map/sitemap`);
    assert.equal(sitemap.status, 200);
    const sitemapBody = await sitemap.json();
    assert.equal(sitemapBody.count, 8);
    assert.equal(sitemapBody.ids.includes('syn-900'), false);
    assert.equal(sitemapBody.ids.includes('syn-102'), false);
  });
});

test('MAP-A query filters use only public GeoJSON properties', async () => {
  await withServer(async (baseUrl) => {
    const filtered = await fetch(`${baseUrl}/api/v1/map/stations?q=syn-002&sensor=humidity&bbox=-170,-56,-169,-55`);
    assert.equal(filtered.status, 200);
    const body = await filtered.json();
    assert.equal(body.features.length, 1);
    assert.equal(body.features[0].properties.public_station_id, 'syn-002');

    const invalid = await fetch(`${baseUrl}/api/v1/map/list?bbox=not-a-bbox`);
    assert.equal(invalid.status, 400);
    assert.deepEqual(await invalid.json(), { error: 'invalid_filter' });
  });
});

test('freshness filter derives only from public field states', async () => {
  const stations = stationsForHttpTests();
  stations[0].observed_at = '2025-12-01T00:00:00Z';
  await withServer(async (baseUrl) => {
    const list = await (await fetch(`${baseUrl}/api/v1/map/list?freshness=OBSOLETA`)).json();
    assert.equal(list.count, 1);
    assert.equal(list.features[0].properties.public_station_id, 'syn-001');
    const map = await (await fetch(`${baseUrl}/api/v1/map/stations?freshness=OBSOLETA`)).json();
    assert.deepEqual(map.features, list.features);
  }, { stations });
});

test('non-visible public, internal, duplicate alias, and unknown IDs share the same 404', async () => {
  await withServer(async (baseUrl) => {
    const ids = ['syn-900', 'syn-102', 'syn-301', 'syn-999'];
    const replies = [];
    for (const id of ids) {
      const response = await fetch(`${baseUrl}/api/v1/map/stations/${id}`);
      replies.push({ status: response.status, body: await response.json() });
    }
    assert.deepEqual(replies, ids.map(() => ({ status: 404, body: { error: 'not_found' } })));
  });
});

test('MAP-A rate limiting is active on every public route', async () => {
  await withServer(async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/v1/map/stations`);
    const second = await fetch(`${baseUrl}/api/v1/map/list`);
    assert.equal(first.status, 200);
    assert.equal(first.headers.get('ratelimit-limit'), '1');
    assert.equal(second.status, 429);
    assert.deepEqual(await second.json(), { error: 'rate_limited' });
  }, { rateLimit: { limit: 1, windowMs: 60_000 } });
});

test('summary, history, no-store, and sitemap URLs obey the public boundary', async () => {
  await withServer(async (baseUrl) => {
    const summary = await fetch(`${baseUrl}/api/v1/map/summary`);
    assert.equal((await summary.json()).count, 8);
    assert.match(summary.headers.get('cache-control'), /no-store/);
    const history = await fetch(`${baseUrl}/api/v1/map/stations/syn-001/history/temperature`);
    assert.equal(history.status, 200);
    const body = await history.json();
    assert.equal(body.resolution, 'raw');
    assert.ok(body.buckets.length > 0);
    const hidden = await fetch(`${baseUrl}/api/v1/map/stations/syn-901/history/precipitation_counter`);
    assert.equal(hidden.status, 404);
    const sitemap = await (await fetch(`${baseUrl}/api/v1/map/sitemap`)).json();
    assert.ok(sitemap.urls.every((url) => url.startsWith('/meteo/mapa/?station=')));
    const xml = await fetch(`${baseUrl}/meteo/mapa/sitemap.xml`);
    assert.equal(xml.status, 200);
    assert.match(xml.headers.get('content-type'), /xml/);
    assert.equal(((await xml.text()).match(/<url>/g) || []).length, 8);
  }, { historyProfiles: require('../../providers/mapDemo').createMapDemo().historyProfiles, observations: require('../../providers/mapDemo').createMapDemo().observations });
});

test('revocation is immediate across catalog, detail and sitemap, even without manual version updates', async () => {
  const stations = stationsForHttpTests();
  await withServer(async (baseUrl) => {
    const before = await fetch(`${baseUrl}/api/v1/map/stations`);
    stations[0].publication_revoked = true;
    const after = await fetch(`${baseUrl}/api/v1/map/stations`);
    assert.notEqual(after.headers.get('x-catalog-version'), before.headers.get('x-catalog-version'));
    assert.equal((await after.json()).features.some((f) => f.id === stations[0].public_station_id), false);
    assert.equal((await fetch(`${baseUrl}/api/v1/map/stations/${stations[0].public_station_id}`)).status, 404);
    const sitemap = await (await fetch(`${baseUrl}/api/v1/map/sitemap`)).json();
    assert.equal(sitemap.ids.includes(stations[0].public_station_id), false);
    assert.equal((await (await fetch(`${baseUrl}/meteo/mapa/sitemap.xml`)).text()).includes(`station=${stations[0].public_station_id}`), false);
  }, { stations });
});

test('MAP-A stays disabled outside local/test and limiter does not intercept unrelated routes', async () => {
  const express = require('express');
  const { makeMapPublicRouter } = require('../../routes/mapPublic');
  const app = express();
  app.use(makeMapPublicRouter({ environment: { NODE_ENV: 'production' } }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try { assert.equal((await fetch(`http://127.0.0.1:${server.address().port}/api/v1/map/stations`)).status, 404); }
  finally { await new Promise((resolve) => server.close(resolve)); }
  await withServer(async (baseUrl) => {
    await fetch(`${baseUrl}/api/v1/map/stations`);
    assert.equal((await fetch(`${baseUrl}/api/ping`)).status, 200);
  }, { rateLimit: { limit: 1, windowMs: 60000 } });
});
