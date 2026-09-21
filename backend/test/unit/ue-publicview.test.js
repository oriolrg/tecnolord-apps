'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CARD_IDS, makePublicViewService, normalizeCardIds, project,
} = require('../../services/publicViewService');

const ID = '11111111-1111-4111-8111-111111111111';

test('UE-T10 validates a non-empty, unique subset of the six existing cards', () => {
  assert.deepEqual(normalizeCardIds(['humidity', 'temperature']), ['humidity', 'temperature']);
  for (const value of [[], ['temperature', 'temperature'], ['temperature', 'custom'], 'temperature', null]) {
    assert.equal(normalizeCardIds(value), null);
  }
  assert.deepEqual(CARD_IDS, ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv']);
});

test('UE-T10 projects only eligible public stations and preserves safe card configuration', () => {
  const row = {
    public_id: ID, nom: 'Pública', description: null, lifecycle: 'ACTIVE', visibility: 'PUBLIC',
    revision: 4, management_kind: 'USER', actiu: true, account_status: 'APPROVED',
    email_verified_at: new Date(), approved_at: new Date(), card_ids: ['humidity', 'temperature'],
    config_revision: 3, configured_public_id: ID,
  };
  assert.deepEqual(project(row, { admin: true }), {
    station: {
      id: ID, name: 'Pública', description: null, lifecycle: 'ACTIVE', visibility: 'PUBLIC',
      revision: 4, can_edit: false,
    },
    card_ids: ['humidity', 'temperature'], revision: 3, configured_station_id: ID, eligible: true,
  });
  assert.equal(project({ ...row, visibility: 'PRIVATE' }).station, null);
  assert.equal(project({ ...row, account_status: 'SUSPENDED' }).station, null);
  assert.deepEqual(project({ ...row, card_ids: [] }).card_ids, CARD_IDS);
});

test('UE-T10 rejects malformed updates before opening a transaction', async () => {
  let connections = 0;
  const service = makePublicViewService({
    pool: { query() {}, async connect() { connections += 1; throw new Error('must not connect'); } },
  });
  assert.deepEqual(await service.update(7, { station_id: 'wrong', card_ids: ['temperature'], revision: 0 }), { invalid: true });
  assert.deepEqual(await service.update(7, { station_id: ID, card_ids: [], revision: 0 }), { invalid: true });
  assert.deepEqual(await service.update(7, { station_id: ID, card_ids: ['temperature'], revision: '0' }), { invalid: true });
  assert.equal(connections, 0);
});

test('UE-T10 checks station eligibility and revision in the same transaction', async () => {
  const queries = [];
  const client = {
    async query(sql, values) {
      const normalized = sql.replace(/\s+/g, ' ').trim();
      queries.push([normalized, values]);
      if (sql === 'BEGIN' || sql === 'COMMIT') return { rowCount: 0, rows: [] };
      if (normalized.includes('SELECT revision FROM meteo.public_view_config')) return { rowCount: 1, rows: [{ revision: 2 }] };
      if (normalized.includes('SELECT e.id FROM meteo.estacions')) return { rowCount: 0, rows: [] };
      throw new Error(`unexpected query: ${normalized}`);
    },
    release() {},
  };
  const service = makePublicViewService({ pool: { query() {}, async connect() { return client; } } });
  assert.deepEqual(await service.update(7, {
    station_id: ID, card_ids: ['temperature'], revision: 2,
  }), { notFound: true });
  const eligibility = queries.find(([sql]) => sql.includes('SELECT e.id FROM meteo.estacions'));
  assert.match(eligibility[0], /lifecycle='ACTIVE' AND e\.visibility='PUBLIC'/);
  assert.match(eligibility[0], /account_status='APPROVED'/);
  assert.deepEqual(eligibility[1], [ID]);
  assert.ok(queries.some(([sql]) => sql === 'COMMIT'));
});
