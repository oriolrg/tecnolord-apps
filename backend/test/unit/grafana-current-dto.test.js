'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { currentSnapshotDto } = require('../../routes/stations');

test('G05 current snapshot DTO allowlists canonical values, quality and controlled errors', () => {
  const dto = currentSnapshotDto({
    item: {
      instant: '2026-09-23T11:40:00.000Z', temp_c: 21.9, humitat_pct: 64,
      upstream_payload: { secret: true }, datasource: 'SWLXFBHvz', invalid_number: '21.9',
    },
    source: {
      freshness: 'FRESH', observed_at: '2026-09-23T11:40:00.000Z',
      fetched_at: '2026-09-23T11:48:46.898Z', error: 'raw upstream stack trace',
      external_id: 'Meteo-001-3100044', query: 'PromQL',
      quality: {
        freshness: 'FRESH',
        fields: { temp_c: 'VALID', humitat_pct: 'VALID', datasource: 'VALID', uvi: 'UNSAFE' },
        observed_at_by_field: {
          temp_c: '2026-09-23T11:40:00.000Z', humitat_pct: '2026-09-23T11:35:00.000Z',
          datasource: '2026-09-23T11:40:00.000Z', uvi: 'invalid',
        },
        warnings: ['SOURCE_UNIT_UNDECLARED', 'datasource', 'PROMQL'],
        units: {
          temp_c: { canonical: 'celsius', source_unit: null, unit_basis: 'QUERY_CONTRACT', datasource_uid: 'SWLXFBHvz' },
          humitat_pct: { canonical: 'percent', source_unit: 'humidity', unit_basis: 'SOURCE_DECLARED' },
          datasource: { canonical: 'celsius', source_unit: 'C', unit_basis: 'SOURCE_DECLARED' },
        },
      },
    },
  });

  assert.deepEqual(dto, {
    item: { instant: '2026-09-23T11:40:00.000Z', temp_c: 21.9, humitat_pct: 64 },
    source: {
      freshness: 'FRESH', observed_at: '2026-09-23T11:40:00.000Z',
      fetched_at: '2026-09-23T11:48:46.898Z', error: 'PROVIDER_ERROR',
      quality: {
        freshness: 'FRESH', fields: { temp_c: 'VALID', humitat_pct: 'VALID' },
        observed_at_by_field: {
          temp_c: '2026-09-23T11:40:00.000Z', humitat_pct: '2026-09-23T11:35:00.000Z',
        },
        warnings: ['SOURCE_UNIT_UNDECLARED'],
        units: {
          temp_c: { canonical: 'celsius', source_unit: null, unit_basis: 'QUERY_CONTRACT' },
          humitat_pct: { canonical: 'percent', source_unit: 'humidity', unit_basis: 'SOURCE_DECLARED' },
        },
      },
    },
  });
  const serialized = JSON.stringify(dto).toLowerCase();
  for (const forbidden of ['grafana.commonscloud.coop', 'swlxfb hvz'.replace(' ', ''), 'datasource',
    'promql', 'meteo-001-3100044', 'upstream_payload', 'stack trace']) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});
