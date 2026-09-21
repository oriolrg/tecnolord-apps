'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeDescription, normalizeStationName, stationDto, validPublicId,
} = require('../../services/stationCatalogService');

test('UE-T05 station input and DTO expose only the fixed metadata contract', () => {
  assert.equal(normalizeStationName('  Estació   Nord  '), 'Estació Nord');
  assert.equal(normalizeStationName('x'), null);
  assert.equal(normalizeDescription('  Terrassa   ventilada '), 'Terrassa ventilada');
  assert.equal(normalizeDescription(''), null);
  assert.equal(normalizeDescription('x'.repeat(501)), undefined);
  assert.equal(validPublicId('8b1d7549-33bc-42e8-97bb-e6e8217d5ca0'), true);
  assert.equal(validPublicId('../private'), false);
  const dto = stationDto({
    public_id: '8b1d7549-33bc-42e8-97bb-e6e8217d5ca0', nom: 'Nord', description: null,
    lifecycle: 'DRAFT', visibility: 'PRIVATE', revision: '2', codi: 'secret-code', owner_id: '9',
  }, { canEdit: true });
  assert.deepEqual(dto, {
    id: '8b1d7549-33bc-42e8-97bb-e6e8217d5ca0', name: 'Nord', description: null,
    lifecycle: 'DRAFT', visibility: 'PRIVATE', revision: 2, can_edit: true,
  });
  assert.equal(JSON.stringify(dto).includes('secret-code'), false);
});
