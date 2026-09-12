'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');

const { createPool } = require('../../db/pool');
const { createApp } = require('../../server');

function productionEnvironment(overrides = {}) {
  return {
    METEOLORD_ENV: 'production',
    POSTGRES_USER: 'production_user_from_env',
    POSTGRES_PASSWORD: 'production_password_from_env',
    POSTGRES_HOST: 'production-db',
    POSTGRES_PORT: '5544',
    POSTGRES_DB: 'production_database_from_env',
    ...overrides,
  };
}

function localEnvironment(overrides = {}) {
  return {
    METEOLORD_ENV: 'local',
    METEOLORD_PROVIDER_MODE: 'synthetic',
    POSTGRES_USER: 'meteolord',
    POSTGRES_PASSWORD: 'local_synthetic_test_password',
    POSTGRES_HOST: 'db',
    POSTGRES_PORT: '5432',
    POSTGRES_DB: 'meteolord_local',
    ...overrides,
  };
}

test('production defaults use the real PostgreSQL environment configuration', async () => {
  const environment = productionEnvironment();
  const pool = createPool({ environment });
  try {
    assert.equal(pool.options.user, environment.POSTGRES_USER);
    assert.equal(pool.options.password, environment.POSTGRES_PASSWORD);
    assert.equal(pool.options.host, environment.POSTGRES_HOST);
    assert.equal(pool.options.port, Number(environment.POSTGRES_PORT));
    assert.equal(pool.options.database, environment.POSTGRES_DB);
    assert.equal(pool.listenerCount('connect'), 1);
    assert.equal(pool.listenerCount('error'), 1);
  } finally {
    await pool.end();
  }
});

test('local mode can construct the guarded synthetic database pool', async () => {
  const environment = localEnvironment();
  const pool = createPool({ environment });
  try {
    assert.equal(pool.options.host, 'db');
    assert.equal(pool.options.database, 'meteolord_local');
  } finally {
    await pool.end();
  }
});

test('local composition accepts injected pool, transport, and clock', () => {
  const syntheticPool = { query: async () => ({ rows: [] }) };
  const syntheticTransport = async () => ({ ok: true });
  const fixedClock = { now: () => new Date('2030-01-01T00:00:00.000Z') };

  assert.equal(
    createPool({ environment: localEnvironment(), pool: syntheticPool }),
    syntheticPool
  );
  const app = createApp({
    environment: localEnvironment(),
    pool: syntheticPool,
    httpClient: syntheticTransport,
    clock: fixedClock,
  });
  assert.equal(typeof app.listen, 'function');
});

test('an injected pg-compatible pool receives the non-crashing error handler', () => {
  const syntheticPool = new EventEmitter();
  syntheticPool.query = async () => ({ rows: [] });
  const warnings = [];
  const logger = {
    debug() {},
    info() {},
    warn(operation, fields) { warnings.push({ operation, fields }); },
    error() {},
  };

  const result = createPool({
    environment: localEnvironment(),
    pool: syntheticPool,
    logger,
  });
  assert.equal(result, syntheticPool);
  assert.equal(syntheticPool.listenerCount('error'), 1);
  assert.doesNotThrow(() => syntheticPool.emit('error', { code: 'ECONNRESET' }));
  assert.deepEqual(warnings, [{
    operation: 'pool_client_error',
    fields: { result: 'connection_lost', error_code: 'ECONNRESET' },
  }]);
});

test('synthetic mode is rejected in production before a pool is created', () => {
  assert.throws(
    () => createPool({
      environment: productionEnvironment({ METEOLORD_PROVIDER_MODE: 'synthetic' }),
    }),
    /Synthetic database configuration is forbidden outside local\/test/
  );
});

test('an alternate pool cannot be injected in production', () => {
  const alternatePool = { query: async () => ({ rows: [] }) };
  assert.throws(
    () => createPool({ environment: productionEnvironment(), pool: alternatePool }),
    /Pool injection is forbidden outside local\/test/
  );
});

test('an absent environment selector defaults to the production guard', () => {
  const environment = productionEnvironment();
  delete environment.METEOLORD_ENV;
  const alternatePool = { query: async () => ({ rows: [] }) };

  assert.throws(
    () => createPool({ environment, pool: alternatePool }),
    /Pool injection is forbidden outside local\/test/
  );
});

test('transport or clock injection cannot activate in production', () => {
  assert.throws(
    () => createApp({
      environment: productionEnvironment(),
      httpClient: async () => ({ ok: true }),
    }),
    /Runtime dependency injection is forbidden outside local\/test/
  );
  assert.throws(
    () => createApp({
      environment: productionEnvironment(),
      clock: { now: () => new Date('2030-01-01T00:00:00.000Z') },
    }),
    /Runtime dependency injection is forbidden outside local\/test/
  );
});
