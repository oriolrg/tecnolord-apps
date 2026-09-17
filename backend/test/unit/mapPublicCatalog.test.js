'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  getCatalogVersion,
  getPublicGeoJSON,
  getPublicList,
  getPublicStation,
} = require('../../providers/mapPublicCatalog');

const FIXTURES = path.resolve(__dirname, '../fixtures/map-a');
const PUBLIC_PROPERTY_KEYS = Object.freeze([
  'catalog_version',
  'geo_publication',
  'observed_at',
  'provenance',
  'public_name',
  'public_station_id',
  'sensors',
]);
const FORBIDDEN_PUBLIC_STRINGS = Object.freeze([
  'canonical_station_id',
  'duplicate_group_id',
  'quality_profile_id',
  'history_profile_id',
  'defect_01_affected',
]);

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
}

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertNoInternalFields(feature) {
  const serialized = JSON.stringify(feature);
  for (const field of FORBIDDEN_PUBLIC_STRINGS) {
    assert.equal(serialized.includes(field), false, `public feature must not expose ${field}`);
  }
  assert.deepEqual(Object.keys(feature.properties).sort(), [...PUBLIC_PROPERTY_KEYS]);
}

test('Group 1: only PUBLIC_ALLOWED stations with public geometry are visible', () => {
  const basic = readFixture('stations-basic.json');
  assert.equal(getPublicGeoJSON(basic).features.length, basic.length);
  assert.equal(getPublicGeoJSON(readFixture('stations-internal.json')).features.length, 0);
  assert.equal(getPublicGeoJSON(readFixture('stations-nogeo.json')).features.length, 0);
  assert.equal(getPublicGeoJSON(readFixture('stations-500.json')).features.length, 500);
});

test('Group 2: canonical duplicates collapse while nearby stations remain distinct', () => {
  const duplicate = getPublicGeoJSON(readFixture('stations-duplicate.json'));
  assert.equal(duplicate.features.length, 1);
  assert.equal(duplicate.features[0].properties.public_station_id, 'syn-101');
  assert.equal(getPublicGeoJSON(readFixture('stations-nearby.json')).features.length, 2);
});

test('Group 3: DEFECT-01 excludes only the affected field, not the visible station', () => {
  const [feature] = getPublicGeoJSON(readFixture('stations-defect01.json')).features;
  assert.ok(feature);
  assert.equal(feature.properties.public_station_id, 'syn-901');
  const serialized = JSON.stringify(feature);
  for (const prohibited of ['defect_01_affected', 'precipitation_counter', 'synthetic-counter', 'current_value":0']) {
    assert.equal(serialized.includes(prohibited), false, `must not expose ${prohibited}`);
  }
});

test('Group 4: getPublicStation returns only a visible public station', () => {
  assert.equal(getPublicStation(readFixture('stations-internal.json'), 'syn-900'), null);
  assert.equal(getPublicStation(readFixture('stations-basic.json'), 'does-not-exist'), null);
  const station = getPublicStation(readFixture('stations-basic.json'), 'syn-001');
  assert.ok(station);
  assert.equal(station.public_station_id, 'syn-001');
});

test('Group 5: catalog version is stable and catalog changes alter the public collection', () => {
  const basic = readFixture('stations-basic.json');
  const version = getCatalogVersion(basic);
  assert.equal(version, getCatalogVersion(basic));
  assert.equal(version, 'map-a-synthetic-v1');

  const publicationClass = copy(basic);
  publicationClass[0].publication_class = 'INTERNAL_ONLY';
  assert.equal(getPublicGeoJSON(publicationClass).features.length, basic.length - 1);

  const geometry = copy(basic);
  geometry[0].public_geometry.coordinates = [-100, 10];
  assert.deepEqual(getPublicGeoJSON(geometry).features[0].geometry.coordinates, [-100, 10]);

  const hidden = copy(basic);
  hidden[0].geo_publication = 'HIDDEN';
  assert.equal(getPublicGeoJSON(hidden).features.length, basic.length - 1);

  const revoked = copy(basic);
  revoked[0].publication_revoked = true;
  assert.equal(getPublicGeoJSON(revoked).features.length, basic.length - 1);

  const duplicateGroup = copy(readFixture('stations-duplicate.json'));
  duplicateGroup[1].duplicate_group_id = null;
  const duplicateGroupResult = getPublicGeoJSON(duplicateGroup);
  assert.equal(duplicateGroupResult.features.length, 1);
  assert.equal(duplicateGroupResult.features[0].properties.public_station_id, 'syn-101');

  const canonical = copy(basic);
  canonical[0].canonical_station_id = 'other-canonical-id';
  assert.equal(getPublicGeoJSON(canonical).features.length, basic.length - 1);
});

test('Group 6: supported filters apply after visibility and unknown filters fail closed', () => {
  const basic = readFixture('stations-basic.json');
  const baseline = getPublicGeoJSON(basic).features;
  const catalogVersion = getCatalogVersion(basic);

  assert.equal(getPublicGeoJSON(basic, { bbox: [-180, -90, 180, 90] }).features.length, baseline.length);
  assert.equal(getPublicGeoJSON(basic, { bbox: [-10, -10, 10, 10] }).features.length, 0);
  assert.equal(getPublicGeoJSON(basic, { search: 'syn-001' }).features.length, 1);
  assert.equal(getPublicGeoJSON(basic, { search: 'does-not-match' }).features.length, 0);
  assert.deepEqual(
    getPublicGeoJSON(basic, { q: 'syn-001' }),
    getPublicGeoJSON(basic, { search: 'syn-001' })
  );
  assert.equal(getPublicGeoJSON(basic, { sensor: 'sensor-syn-001' }).features.length, 1);
  assert.equal(getPublicGeoJSON(basic, { sensor: 'missing-sensor' }).features.length, 0);
  assert.equal(getPublicGeoJSON(basic, { public_station_ids: ['syn-001'] }).features.length, 1);
  assert.equal(getPublicGeoJSON(readFixture('stations-internal.json'), {
    public_station_ids: ['syn-900'],
  }).features.length, 0);
  assert.equal(getPublicGeoJSON(basic, { catalog_version: catalogVersion }).features.length, baseline.length);
  assert.equal(getPublicGeoJSON(basic, { catalog_version: 'wrong-version' }).features.length, 0);
  assert.equal(getPublicGeoJSON(basic, { foo: 'bar' }).features.length, 0);
  assert.equal(getPublicGeoJSON(basic, { search: 'syn-001', q: 'syn-002' }).features.length, 0);
});

test('Group 7: public projection does not mutate source fixtures', () => {
  const basic = readFixture('stations-basic.json');
  const original = JSON.stringify(basic);
  getPublicGeoJSON(basic);
  getPublicGeoJSON(basic, { q: 'syn-001' });
  assert.equal(JSON.stringify(basic), original);
});

test('Group 8: public GeoJSON and list expose only the fixed public contract', () => {
  const stations = [
    ...readFixture('stations-basic.json'),
    ...readFixture('stations-duplicate.json'),
    ...readFixture('stations-nearby.json'),
    ...readFixture('stations-defect01.json'),
  ];
  const collection = getPublicGeoJSON(stations);
  assert.equal(getPublicList(stations).count, collection.features.length);
  for (const feature of collection.features) assertNoInternalFields(feature);
});
