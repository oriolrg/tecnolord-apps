'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const inventory = require('../../../config/meteolord/grafana-local-station.json');
const {
  bootstrapLocalGrafana, localDatabaseConfig, parseArgs, validateInventory,
} = require('../../scripts/bootstrap-local-grafana');

function localEnvironment(overrides = {}) {
  return {
    METEOLORD_ENV: 'local', POSTGRES_HOST: 'db', POSTGRES_PORT: '5432',
    POSTGRES_DB: 'meteolord_local', POSTGRES_USER: 'meteolord',
    POSTGRES_PASSWORD: 'local_synthetic_123', ...overrides,
  };
}

test('G03 accepts only the explicit local database and command contract', () => {
  assert.deepEqual(parseArgs(['--actor-id', '7']), { actorId: 7, apply: false });
  assert.deepEqual(parseArgs(['--apply', '--actor-id', '7']), { actorId: 7, apply: true });
  assert.equal(localDatabaseConfig(localEnvironment()).database, 'meteolord_local');
  for (const mode of ['test', 'staging', 'production', undefined]) {
    assert.throws(() => localDatabaseConfig(localEnvironment({ METEOLORD_ENV: mode })), /METEOLORD_ENV=local/);
  }
  assert.throws(() => localDatabaseConfig(localEnvironment({ POSTGRES_DB: 'another_database' })), /allowlisted/);
  assert.throws(() => localDatabaseConfig(localEnvironment({ POSTGRES_HOST: 'localhost' })), /allowlisted/);
  assert.throws(() => parseArgs(['--actor-id', '0']), /Usage/);
  assert.throws(() => parseArgs(['--actor-id', '7', '--unknown']), /Usage/);
});

test('G03 inventory contains only the approved technical identity without location', () => {
  assert.equal(validateInventory(inventory), inventory);
  const changed = structuredClone(inventory);
  changed.rows[0].longitude = 1.5;
  assert.throws(() => validateInventory(changed), /approved technical identity/);
  assert.equal('altitude' in inventory.rows[0], false);
  assert.equal('municipality' in inventory.rows[0], false);
  assert.equal('token' in inventory.rows[0], false);
});

test('G03 rejects a nonexistent or non-superadmin actor before staging', async () => {
  let connections = 0;
  const pool = {
    async query() { return { rowCount: 0, rows: [] }; },
    async connect() { connections += 1; throw new Error('must not stage'); },
  };
  assert.deepEqual(await bootstrapLocalGrafana({ pool, actorId: 999, inventory }), {
    status: 'FORBIDDEN_ACTOR',
  });
  assert.equal(connections, 0);
});
