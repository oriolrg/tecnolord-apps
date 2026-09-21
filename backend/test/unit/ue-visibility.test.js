'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLocation, mapFeature } = require('../../services/stationLocationService');
const { filtered } = require('../../routes/stationMap');

test('UE-T08 accepts WGS84 lon/lat boundaries and rejects inverted, non-finite and sub-1km policies', () => {
  for (const [longitude, latitude] of [[-180, -90], [180, 90], [0, 0]]) {
    const value = normalizeLocation({ longitude, latitude, mode: 'HIDDEN', publish: false, consent: false, revision: 0 });
    assert.ok(value);
    assert.equal(value.radius, null);
  }
  for (const input of [
    { longitude: 41, latitude: 181 },
    { longitude: 2, latitude: 91 },
    { longitude: NaN, latitude: 2 },
    { longitude: 1, latitude: 2, mode: 'APPROX_100M' },
  ]) assert.equal(normalizeLocation({ mode: 'APPROX_1KM', publish: false, consent: false, revision: 0, ...input }), null);
  assert.equal(normalizeLocation({ longitude: 1, latitude: 2, mode: 'HIDDEN', publish: true, consent: true, revision: 0 }).publicGeometry, null);
});

test('UE-T08 generalization is stable, metric-policy based and never aliases private geometry', () => {
  const input = { longitude: 2.1734, latitude: 41.3851, mode: 'APPROX_5KM', publish: true, consent: true, revision: 4 };
  const first = normalizeLocation(input);
  const second = normalizeLocation(input);
  assert.deepEqual(first.publicGeometry, second.publicGeometry);
  assert.notDeepEqual(first.publicGeometry, first.privateGeometry);
  assert.equal(first.radius, 5000);
});

test('UE-T08 map projection preserves missing values and public DTO has no private coordinates', () => {
  const feature = mapFeature({
    public_id: '11111111-1111-4111-8111-111111111111', nom: 'Sintètica', visibility: 'PUBLIC',
    source_namespace: 'ECOWITT', observed_at: '2026-09-20T12:00:00Z',
    values_json: { temp_c: null, humitat_pct: 0 }, public_longitude: 2, public_latitude: 41,
    private_longitude: 2.123, private_latitude: 41.456, catalog_revision: 7,
  }, { now: new Date('2026-09-20T12:10:00Z') });
  const fields = feature.properties.sensors[0].fields;
  assert.equal(fields.find((field) => field.field_id === 'temperature').current_value, null);
  assert.equal(fields.find((field) => field.field_id === 'humidity').current_value, 0);
  assert.equal(JSON.stringify(feature).includes('private_'), false);
  assert.equal(JSON.stringify(feature).includes('2.123'), false);
});

test('UE-T08 persistent map filters fail closed and operate on already authorized features', () => {
  const feature = mapFeature({
    public_id: '11111111-1111-4111-8111-111111111111', nom: 'Nord', visibility: 'PUBLIC',
    source_namespace: 'ECOWITT', observed_at: '2026-09-20T12:00:00Z', values_json: { temp_c: 12, humitat_pct: 40 },
    public_longitude: 2, public_latitude: 41, private_longitude: 2.1, private_latitude: 41.1, catalog_revision: 2,
  }, { now: new Date('2026-09-20T12:10:00Z') });
  const collection = { type: 'FeatureCollection', features: [feature] };
  assert.equal(filtered(collection, { q: 'nord' }).features.length, 1);
  assert.equal(filtered(collection, { bbox: '1,40,3,42' }).features.length, 1);
  assert.equal(filtered(collection, { bbox: '3,40,4,42' }).features.length, 0);
  assert.equal(filtered(collection, { private: '1' }), null);
});
