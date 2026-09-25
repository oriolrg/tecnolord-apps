'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeGrafanaSnapshot } = require('../../services/snapshotService');

const CURRENT_AT = '2026-09-24T10:00:00.000Z';
const AGGREGATE_AT = '2026-09-24T10:05:00.000Z';

function normalized({ rain = 0, rainQuality = 'VALID' } = {}) {
  return {
    observedAt: new Date(CURRENT_AT),
    values: {
      temp_c: 12, humitat_pct: 50,
      temp_min_24h_c: 0, temp_max_24h_c: 18,
      rain_24h: rainQuality === 'VALID' ? rain : null,
    },
    quality: {
      fields: {
        temp_c: 'VALID', humitat_pct: 'VALID',
        temp_min_24h_c: 'VALID', temp_max_24h_c: 'VALID', rain_24h: rainQuality,
      },
      observed_at_by_field: { temp_c: CURRENT_AT, humitat_pct: CURRENT_AT },
      aggregates: Object.fromEntries(['temp_min_24h_c', 'temp_max_24h_c', 'rain_24h'].map((field) => [field, {
        window_hours: 24, evaluated_at: AGGREGATE_AT,
        reduction: 'lastNotNull', quality: field === 'rain_24h' ? rainQuality : 'VALID',
      }])),
    },
  };
}

test('H09A keeps aggregate evaluation separate from the current observation timestamp', () => {
  const merged = mergeGrafanaSnapshot(null, normalized());
  assert.equal(merged.ok, true);
  assert.equal(merged.observedAt.toISOString(), CURRENT_AT);
  assert.equal(merged.values.temp_min_24h_c, 0);
  assert.equal(merged.values.temp_max_24h_c, 18);
  assert.equal(merged.values.rain_24h, 0);
  assert.equal(merged.quality.aggregates.rain_24h.evaluated_at, AGGREGATE_AT);
  assert.equal('rain_24h' in merged.quality.observed_at_by_field, false);
});

test('H09A clears an unavailable aggregate instead of presenting an old value as current', () => {
  const existing = {
    observed_at: CURRENT_AT,
    values_json: { temp_c: 12, humitat_pct: 50, temp_min_24h_c: 0, temp_max_24h_c: 18, rain_24h: 7 },
    quality_json: normalized().quality,
  };
  const merged = mergeGrafanaSnapshot(existing, normalized({ rainQuality: 'MISSING' }));
  assert.equal(merged.ok, true);
  assert.equal(merged.values.rain_24h, null);
  assert.equal(merged.quality.fields.rain_24h, 'MISSING');
  assert.equal(merged.changed, true);
});
