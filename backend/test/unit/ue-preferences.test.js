'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { defaultStationDto, makeUserPreferenceService, validRevision } = require('../../services/userPreferenceService');

test('UE-T09 validates optimistic revisions and projects only station DTO fields', () => {
  assert.equal(validRevision(0), true);
  assert.equal(validRevision(8), true);
  for (const value of [-1, 1.2, '1', null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(validRevision(value), false);
  }
  assert.deepEqual(defaultStationDto({
    public_id: '11111111-1111-4111-8111-111111111111', nom: 'Pròpia', description: null,
    lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 3, owner_id: 12, secret: 'absent',
  }), {
    id: '11111111-1111-4111-8111-111111111111', name: 'Pròpia', description: null,
    lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 3, can_edit: true,
  });
});

test('UE-T09 rejects malformed writes before opening a transaction', async () => {
  let connections = 0;
  const service = makeUserPreferenceService({
    pool: { async connect() { connections += 1; throw new Error('must not connect'); } },
  });
  assert.deepEqual(await service.setDefault(7, { station_id: 'wrong', revision: 0 }), { invalid: true });
  assert.deepEqual(await service.clearDefault(7, { revision: '0' }), { invalid: true });
  assert.equal(connections, 0);
});

test('UE-T09 checks ownership and activity inside the same preference transaction', async () => {
  const queries = [];
  const client = {
    async query(sql, values) {
      queries.push([sql.replace(/\s+/g, ' ').trim(), values]);
      if (sql === 'BEGIN' || sql === 'COMMIT') return { rowCount: 0, rows: [] };
      if (sql.includes('SELECT revision FROM auth.user_preferences')) return { rowCount: 0, rows: [] };
      if (sql.includes('FROM meteo.estacions')) return { rowCount: 0, rows: [] };
      throw new Error(`unexpected query: ${sql}`);
    },
    release() {},
  };
  const service = makeUserPreferenceService({ pool: { async connect() { return client; } } });
  const result = await service.setDefault(7, {
    station_id: '11111111-1111-4111-8111-111111111111', revision: 0,
  });
  assert.deepEqual(result, { notFound: true });
  const eligibility = queries.find(([sql]) => sql.includes('FROM meteo.estacions'));
  assert.match(eligibility[0], /owner_id=\$2 AND lifecycle='ACTIVE'/);
  assert.deepEqual(eligibility[1], ['11111111-1111-4111-8111-111111111111', 7]);
  assert.ok(queries.some(([sql]) => sql === 'COMMIT'));
});
