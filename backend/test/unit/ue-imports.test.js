'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('../fixtures/ue-import-synthetic.json');
const {
  batchDto, completeExternalId, normalizeInventory, stable, validateCandidate,
} = require('../../services/importService');

test('UE-T13 canonical inventory is ordered, bounded and stable', () => {
  const normalized = normalizeInventory({ ...fixture, rows: [...fixture.rows].reverse() });
  assert.deepEqual(normalized.rows.map((row) => row.inventory_code), ['SYN001', 'SYN002', 'SYNBAD', 'TEST01']);
  assert.equal(stable(normalized), stable(normalizeInventory(fixture)));
  assert.equal(normalizeInventory({ ...fixture, rows: [] }), null);
  assert.equal(normalizeInventory({ ...fixture, rows: [...fixture.rows, fixture.rows[0]] }), null);
});

test('UE-T13 validation quarantines tests, incomplete mappings and invalid locations', () => {
  const [valid, , incomplete, syntheticTest] = normalizeInventory(fixture).rows;
  assert.deepEqual(validateCandidate('GRAFANA', valid), { status: 'VALIDATED', issue: null });
  assert.deepEqual(validateCandidate('GRAFANA', incomplete), { status: 'QUARANTINED', issue: 'MAPPING_UNVERIFIED' });
  assert.deepEqual(validateCandidate('GRAFANA', syntheticTest), { status: 'QUARANTINED', issue: 'TEST_STATION' });
  assert.deepEqual(validateCandidate('GRAFANA', { ...valid, longitude: null, latitude: null, accuracy_m: 2 }),
    { status: 'QUARANTINED', issue: 'INVALID_LOCATION' });
  assert.equal(completeExternalId('GRAFANA', 'Meteo-901-9000001'), true);
  assert.equal(completeExternalId('GRAFANA', 'Meteo-901-'), false);
});

test('UE-T13 admin DTO never exposes rollback or revision internals', () => {
  const dto = batchDto({
    id: 7, source_namespace: 'GRAFANA', content_hash: 'a'.repeat(64), batch_status: 'STAGED',
    created_at: new Date('2026-09-21T09:00:00Z'), applied_at: null,
  }, [{
    inventory_code: 'SYN001', row_status: 'VALIDATED', issue_code: null, station_public_id: null,
    candidate: { name: 'Sintètica', _action: 'UPDATE', _changes: ['name'], _before: { name: 'Antiga' },
      _expected_revision: 2, _applied_revision: 3 },
  }]);
  assert.equal(dto.rows[0].action, 'UPDATE');
  assert.deepEqual(dto.rows[0].candidate, { name: 'Sintètica', _action: 'UPDATE', _changes: ['name'] });
  assert.deepEqual(dto.counts, { validated: 1 });
});
