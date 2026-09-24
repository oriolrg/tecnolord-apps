'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const mapping = require('../../../docs/sdd/fase-grafana-multiestacio/evidence/H02-station-mapping.json');
const locations = require('../../../docs/sdd/fase-grafana-multiestacio/evidence/H03-station-locations.json');
const {
  MLW28_PUBLIC_ID, buildGrafanaCatalogInventory, buildGrafanaImportPlan,
} = require('../../services/grafanaCatalogInventory');

test('H06 builds the exact 29-row catalog and applies only the ten HIGH locations', () => {
  const inventory = buildGrafanaCatalogInventory(mapping, locations);
  assert.equal(inventory.source_namespace, 'GRAFANA');
  assert.equal(inventory.rows.length, 29);
  assert.equal(new Set(inventory.rows.map((row) => row.external_id)).size, 29);
  assert.equal(inventory.rows.filter((row) => row.latitude !== null).length, 10);
  assert.equal(inventory.rows.every((row) => (row.latitude === null) === (row.longitude === null)), true);
  for (const externalId of ['Meteo-026-', 'Meteo-027-', 'Meteo-029-']) {
    assert.equal(inventory.rows.find((row) => row.external_id === externalId).external_id_quality,
      'PARTIAL_SOURCE_IDENTIFIER');
  }
  for (const externalId of ['S31-119416', 'S31-99933']) {
    const row = inventory.rows.find((item) => item.external_id === externalId);
    assert.equal(row.name, externalId);
    assert.equal(row.external_id_quality, 'TECHNICAL_SOURCE_IDENTIFIER');
    assert.equal(row.station_code, undefined);
    assert.equal(row.latitude, null);
  }
  const mlw28 = inventory.rows.find((row) => row.external_id === 'Meteo-001-3100044');
  assert.equal(mlw28.station_code, 'MLW28');
  assert.equal(mlw28.expected_public_id, MLW28_PUBLIC_ID);
});

test('H06 plan updates MLW28, creates technical stations and reports code conflicts individually', () => {
  const inventory = buildGrafanaCatalogInventory(mapping, locations);
  const existing = [{
    external_id: 'Meteo-001-3100044', code: 'GRAFANA_LOCAL_001', uuid: MLW28_PUBLIC_ID,
    management_kind: 'ADMIN', source_namespace: 'GRAFANA',
  }, {
    external_id: 'different', code: 'MLW01', uuid: '11111111-1111-4111-8111-111111111111',
    management_kind: 'ADMIN', source_namespace: 'GRAFANA',
  }];
  const plan = buildGrafanaImportPlan(inventory, existing);
  assert.equal(plan.length, 29);
  assert.equal(plan.find((row) => row.external_id === 'Meteo-001-3100044').action, 'UPDATE_EXISTING');
  assert.equal(plan.find((row) => row.external_id === 'Meteo-002-3100007').action, 'SKIP_CONFLICT');
  assert.equal(plan.find((row) => row.external_id === 'S31-119416').action, 'CREATE_TECHNICAL');
  assert.equal(plan.find((row) => row.external_id === 'Meteo-026-').notes.includes(
    'external_id_quality=PARTIAL_SOURCE_IDENTIFIER'), true);
});
