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

test('G03 accepts an optional stable station code without changing legacy inventory normalization', () => {
  const original = normalizeInventory(fixture);
  assert.equal(Object.hasOwn(original.rows[0], 'station_code'), false);
  const withCode = structuredClone(fixture);
  withCode.rows[0].station_code = 'GRAFANA_LOCAL_001';
  assert.equal(normalizeInventory(withCode).rows[0].station_code, 'GRAFANA_LOCAL_001');
  withCode.rows[0].station_code = 'invalid-code';
  assert.equal(normalizeInventory(withCode), null);
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

test('H06 accepts explicit partial and technical Grafana identities without inventing suffixes', () => {
  const [base] = normalizeInventory(fixture).rows;
  const partial = { ...base, external_id: 'Meteo-026-', external_id_quality: 'PARTIAL_SOURCE_IDENTIFIER' };
  const technical = { ...base, external_id: 'S31-119416', external_id_quality: 'TECHNICAL_SOURCE_IDENTIFIER' };
  assert.equal(completeExternalId('GRAFANA', partial.external_id, partial.external_id_quality), true);
  assert.equal(completeExternalId('GRAFANA', technical.external_id, technical.external_id_quality), true);
  assert.deepEqual(validateCandidate('GRAFANA', partial), { status: 'VALIDATED', issue: null });
  assert.deepEqual(validateCandidate('GRAFANA', technical), { status: 'VALIDATED', issue: null });
  assert.equal(completeExternalId('GRAFANA', 'Meteo-026-', 'COMPLETE'), false);
  assert.equal(completeExternalId('GRAFANA', 'S31-119416', 'COMPLETE'), false);
});

test('H06 permits an evidenced coordinate without inventing an accuracy and validates expected UUID', () => {
  const withLocation = structuredClone(fixture);
  withLocation.rows[0] = {
    ...withLocation.rows[0], longitude: 1.5687399, latitude: 42.1926336, accuracy_m: null,
    expected_public_id: '5da7eece-6954-413f-8e22-390fe4144830',
  };
  const normalized = normalizeInventory(withLocation);
  assert.equal(normalized.rows[0].accuracy_m, null);
  assert.equal(normalized.rows[0].expected_public_id, '5da7eece-6954-413f-8e22-390fe4144830');
  assert.deepEqual(validateCandidate('GRAFANA', normalized.rows[0]), { status: 'VALIDATED', issue: null });
  withLocation.rows[0].expected_public_id = 'not-a-uuid';
  assert.equal(normalizeInventory(withLocation), null);
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
