'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  REQUIRED_VARIABLES,
  validateLocalConfig,
} = require('../../scripts/validate-local-config');

function validConfig() {
  return {
    METEOLORD_ENV: 'local',
    METEOLORD_PROVIDER_MODE: 'synthetic',
    METEOLORD_ALLOW_SYNTHETIC: 'true',
    METEOLORD_EXTERNAL_NETWORK: 'deny',
    DB_HOST: 'db',
    DB_PORT: '5432',
    DB_NAME: 'meteolord_local',
    DB_USER: 'meteolord',
    DB_PASSWORD: 'local_synthetic_123',
    INGEST_API_KEY: 'local-synthetic-key-2026',
  };
}

function assertRejected(config, variableName) {
  const result = validateLocalConfig(config);
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some((error) => error.startsWith(variableName)),
    `expected a redacted error for ${variableName}`,
  );
}

test('accepts the exact local synthetic fail-closed contract', () => {
  assert.deepEqual(validateLocalConfig(validConfig()), { ok: true, errors: [] });
});

for (const name of REQUIRED_VARIABLES) {
  test(`rejects missing ${name}`, () => {
    const config = validConfig();
    delete config[name];
    assertRejected(config, name);
  });

  test(`rejects empty ${name}`, () => {
    const config = validConfig();
    config[name] = '   ';
    assertRejected(config, name);
  });
}

test('rejects a syntactically invalid environment name', () => {
  const config = validConfig();
  config.METEOLORD_ENV = 'produccio';
  assertRejected(config, 'METEOLORD_ENV');
});

test('rejects production mode combined with synthetic providers', () => {
  const config = validConfig();
  config.METEOLORD_ENV = 'prod';
  assertRejected(config, 'METEOLORD_ENV');
});

test('rejects test mode from the local-only CLI contract', () => {
  const config = validConfig();
  config.METEOLORD_ENV = 'test';
  config.DB_HOST = 'localhost';
  assertRejected(config, 'METEOLORD_ENV');
});

test('rejects a non-local database host without exposing it', () => {
  const config = validConfig();
  config.DB_HOST = 'db.productiu.example';
  const result = validateLocalConfig(config);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith('DB_HOST')));
  assert.equal(result.errors.join('\n').includes(config.DB_HOST), false);
});

test('rejects an empty ingestion API key', () => {
  const config = validConfig();
  config.INGEST_API_KEY = '';
  assertRejected(config, 'INGEST_API_KEY');
});

test('rejects an ingestion API key that is too short', () => {
  const config = validConfig();
  config.INGEST_API_KEY = 'local-key';
  assertRejected(config, 'INGEST_API_KEY');
});

test('rejects a credential not explicitly marked synthetic', () => {
  const config = validConfig();
  config.INGEST_API_KEY = 'opaque-placeholder-key';
  assertRejected(config, 'INGEST_API_KEY');
});

test('rejects a production indicator outside the environment selector', () => {
  const config = validConfig();
  config.DB_NAME = 'meteolord_prod';
  const result = validateLocalConfig(config);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith('DB_NAME')));
  assert.equal(result.errors.join('\n').includes(config.DB_NAME), false);
});

test('rejects provider mode other than synthetic', () => {
  const config = validConfig();
  config.METEOLORD_PROVIDER_MODE = 'external';
  assertRejected(config, 'METEOLORD_PROVIDER_MODE');
});

test('rejects disabled synthetic acknowledgement', () => {
  const config = validConfig();
  config.METEOLORD_ALLOW_SYNTHETIC = 'false';
  assertRejected(config, 'METEOLORD_ALLOW_SYNTHETIC');
});

test('rejects external network access', () => {
  const config = validConfig();
  config.METEOLORD_EXTERNAL_NETWORK = 'allow';
  assertRejected(config, 'METEOLORD_EXTERNAL_NETWORK');
});

test('rejects a non-local database port', () => {
  const config = validConfig();
  config.DB_PORT = '6432';
  assertRejected(config, 'DB_PORT');
});

test('rejects invalid database identifier syntax', () => {
  const config = validConfig();
  config.DB_NAME = 'meteolord-local';
  assertRejected(config, 'DB_NAME');
});
