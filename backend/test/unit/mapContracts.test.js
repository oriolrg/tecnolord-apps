'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregate, buildHistory, resolveHistoryQuery } = require('../../providers/mapHistory');
const { assessField } = require('../../providers/mapQuality');
const { createCatalogStore } = require('../../providers/mapCatalogStore');
const { getPublicGeoJSON, DEMO_NOW } = require('../../providers/mapPublicCatalog');
const original = require('../fixtures/map-a/stations-basic.json');
const raw = require('../fixtures/map-a/history-profile-24h-raw.json');
const profile = () => ({ ...structuredClone(raw), retention_policy_ref: 'synthetic-test' });
const field = () => structuredClone(original[0].sensors[0].fields[0]);
const quality = { unit: 'synthetic-celsius', valid_range: [-50, 50], expected_update_interval_s: 300, max_rate_of_change: 20 };
const observation = (instant, value, extras = {}) => ({ instant, value, publication_class: 'PUBLIC_ALLOWED', defect_01_affected: false, quality: 'OK', ...extras });

test('history requires explicit field classification, profile and retention', () => {
  for (const overrides of [{ publication_class: undefined }, { defect_01_affected: true }, { history_profile_id: null }]) {
    assert.equal(buildHistory({ field: { ...field(), ...overrides }, profile: profile() }), null);
  }
  assert.equal(buildHistory({ field: field(), profile: raw }), null);
  assert.equal(buildHistory({ field: field(), profile: { ...profile(), history_enabled: false } }), null);
});
test('period policies are exact; raw cannot bypass permission', () => {
  for (const [period, resolution] of [['24h', 'raw'], ['7d', 'hourly'], ['30d', 'daily']]) {
    assert.equal(resolveHistoryQuery(profile(), { period }, DEMO_NOW).resolution, resolution);
  }
  assert.equal(resolveHistoryQuery(profile(), {}, DEMO_NOW).resolution, 'raw');
  assert.throws(() => resolveHistoryQuery({ ...profile(), raw_history_allowed: false }, {}, DEMO_NOW));
  assert.throws(() => resolveHistoryQuery(profile(), { period: 'unknown' }, DEMO_NOW));
});
test('custom uses first covering rule, rejecting uncovered ranges', () => {
  const custom = { ...profile(), allowed_periods: ['custom'], custom_resolution_rules: [{ max_window_hours: 12, resolution: 'hourly' }, { max_window_hours: 24, resolution: 'daily' }] };
  const query = { period: 'custom', start: '2025-12-31T18:05:00Z', end: '2026-01-01T00:05:00Z' };
  assert.equal(resolveHistoryQuery(custom, query, DEMO_NOW).resolution, 'hourly');
  assert.throws(() => resolveHistoryQuery({ ...custom, custom_resolution_rules: [] }, query, DEMO_NOW));
  assert.throws(() => resolveHistoryQuery(custom, { ...query, start: '2025-12-29T00:00:00Z' }, DEMO_NOW));
});
test('semantic aggregations preserve zero and distinguish absence and counter resets', () => {
  assert.equal(aggregate([], 'sum'), null);
  assert.equal(aggregate([0, 0], 'sum'), 0);
  assert.equal(aggregate([2, 4], 'sum'), 6);
  assert.equal(aggregate([2, 4], 'max'), 4);
  assert.ok(Math.min(aggregate([350, 10], 'circular'), 360 - aggregate([350, 10], 'circular')) < 1e-8);
  assert.equal(aggregate([90, 270], 'circular'), null);
  assert.equal(aggregate([2, 4, 8], 'counter_diff'), 6);
  assert.equal(aggregate([8, 2], 'counter_diff'), null);
});
test('filter before aggregation, partial coverage and absent buckets', () => {
  const p = { ...profile(), resolution_policy: { '24h': 'hourly' }, aggregation_method: 'sum' };
  const args = { field: field(), profile: p, now: Date.parse('2026-01-01T00:00:00Z'), observations: [
    observation('2025-12-31T00:00:00Z', 0), observation('2025-12-31T00:05:00Z', 2),
    observation('2025-12-31T00:10:00Z', 999, { publication_class: 'INTERNAL_ONLY' }),
    observation('2025-12-31T00:15:00Z', 999, { defect_01_affected: true }),
    observation('2025-12-31T00:20:00Z', 999, { quality: 'SOSPITOSA' }),
  ] };
  const result = buildHistory(args);
  assert.equal(result.buckets.length, 24);
  assert.deepEqual(result.buckets[0], { instant: '2025-12-31T00:00:00.000Z', value: 2, n_valid: 2, n_expected: 12, coverage: 2 / 12, partial: true });
  assert.equal(result.buckets[1].value, null);
  assert.equal(result.buckets[1].n_valid, 0);
  assert.equal(buildHistory({ ...args, profile: { ...p, missing_data_policy: 'null' } }).buckets[0].value, null);
});
test('suspicious fields remain visible; stale and reviewed values are not current', () => {
  assert.equal(assessField({ ...field(), current_value: 60 }, quality, '2026-01-01T00:00:00Z', DEMO_NOW).current_value, 60);
  assert.equal(assessField({ ...field(), current_value: 60 }, quality, '2026-01-01T00:00:00Z', DEMO_NOW).quality, 'SOSPITOSA');
  const stale = assessField(field(), quality, '2025-12-01T00:00:00Z', DEMO_NOW);
  assert.equal(stale.current_value, null); assert.equal(stale.freshness, 'OBSOLETA'); assert.equal(stale.last_value, 12.5);
  const reviewed = assessField({ ...field(), review_state: 'EN_REVISIO' }, quality, '2026-01-01T00:00:00Z', DEMO_NOW);
  assert.equal(reviewed.current_value, null); assert.equal(reviewed.last_value, null);
  assert.equal(assessField(field(), { ...quality, expected_update_interval_s: 10000 }, '2026-01-01T00:00:00Z', DEMO_NOW).obsolete_limit_s, 120000);
  assert.equal(assessField(field(), { ...quality, expected_update_interval_s: null }, '2026-01-01T00:00:00Z', DEMO_NOW).reliable, false);
});
test('unknown geometry mode and NO_PUBLICABLE fail closed', () => {
  for (const change of [{ geo_publication: 'unknown' }, { quality: 'NO_PUBLICABLE' }]) assert.equal(getPublicGeoJSON([{ ...original[0], ...change }]).features.length, 0);
});
for (const [name, mutate] of Object.entries({
  publication: (s) => { s.publication_class = 'INTERNAL_ONLY'; },
  revocation: (s) => { s.publication_revoked = true; },
  sensor: (s) => { s.sensors[0].publication_class = 'INTERNAL_ONLY'; },
  field: (s) => { s.sensors[0].fields[0].publication_class = 'INTERNAL_ONLY'; },
  geometry: (s) => { s.public_geometry.coordinates[0] += 1; },
  radius: (s) => { s.privacy_radius_m += 100; },
  mode: (s) => { s.geo_publication = 'EXACT'; },
  history: (s) => { s.sensors[0].fields[0].history_profile_id = null; },
  duplicate: (s) => { s.duplicate_group_id = 'new-group'; },
  canonical: (s) => { s.canonical_station_id = 'other'; },
  policy: (s) => { s.geo_policy_version = 'v2'; },
})) test(`catalog version increments monotonically on ${name}`, () => {
  const stations = structuredClone(original), store = createCatalogStore(stations);
  const initial = store.snapshot().version; mutate(stations[0]);
  assert.equal(store.snapshot().version, `${initial}.1`); assert.equal(store.snapshot().version, `${initial}.1`);
  stations[1].privacy_radius_m++; assert.equal(store.snapshot().version, `${initial}.2`);
});
test('private synthetic coordinates are generalized in meters before public projection', () => {
  const sample = structuredClone(require('../fixtures/map-a/stations-private.json'));
  const source = sample[0].private_geometry.coordinates;
  const visible = getPublicGeoJSON(sample).features;
  assert.equal(visible.length, 1);
  assert.notDeepEqual(visible[0].geometry.coordinates, source);
  assert.equal(JSON.stringify(visible).includes(JSON.stringify(source)), false);
  assert.equal(JSON.stringify(visible).includes('private_geometry'), false);
  sample[0].public_geometry.coordinates = source;
  assert.equal(getPublicGeoJSON(sample).features.length, 0); // Reject inconsistent precomputed policy.
});
test('confirmed duplicates, candidates, proximity and canonical revocation stay independent', () => {
  const duplicate = structuredClone(require('../fixtures/map-a/stations-duplicate.json'));
  const nearby = structuredClone(require('../fixtures/map-a/stations-nearby.json'));
  const canonical = duplicate.find((station) => station.canonical_station_id === station.public_station_id);
  const alias = duplicate.find((station) => station.canonical_station_id !== station.public_station_id);
  assert.equal(getPublicGeoJSON(duplicate).features.length, 1);
  assert.equal(getPublicGeoJSON(nearby).features.length, 2);
  const isolated = getPublicGeoJSON([{ ...alias, duplicate_group_id: null, canonical_station_id: alias.public_station_id }, canonical]);
  assert.equal(isolated.features.length, 2); // A candidate without a confirmed group stays distinct.
  assert.equal(getPublicGeoJSON([{ ...canonical, publication_revoked: true }, alias]).features.length, 0);
  assert.equal(getPublicGeoJSON([{ ...canonical, publication_class: 'INTERNAL_ONLY' }, alias]).features.length, 0);
  const polluted = structuredClone(duplicate);
  polluted.find((station) => station.public_station_id === alias.public_station_id).sensors[0].fields[0].current_value = 999;
  const publicValue = getPublicGeoJSON(polluted).features[0].properties.sensors[0].fields[0].current_value;
  assert.notEqual(publicValue, 999); // No observation merge from alias.
  const store = createCatalogStore(duplicate);
  const initial = store.snapshot().version;
  alias.canonical_station_id = alias.public_station_id;
  assert.notEqual(store.snapshot().version, initial);
});
