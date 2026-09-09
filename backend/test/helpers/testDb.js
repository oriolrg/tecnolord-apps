'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');

const DEFAULT_RUNNER = path.resolve(__dirname, '../../db/migrate.js');
const DEFAULT_FIXTURE_LOADER = path.resolve(__dirname, '../../scripts/load-local-fixtures.js');
const DATABASE_PREFIX = 'meteolord_test_';

function getClientConstructor() {
  return require('pg').Client;
}

function connectionFromEnv(environment = process.env) {
  return Object.freeze({
    host: environment.T13_DB_HOST || environment.T10_DB_HOST || 'db',
    port: Number(environment.T13_DB_PORT || environment.T10_DB_PORT || 5432),
    user: environment.T13_DB_USER || environment.T10_DB_USER || 'meteolord',
    password: environment.T13_DB_PASSWORD || environment.T10_DB_PASSWORD || 'local_synthetic_123',
  });
}

function quoteIdentifier(identifier) {
  assert.match(identifier, /^[a-z_][a-z0-9_]{0,62}$/);
  return `"${identifier}"`;
}

function testDatabaseName(runId, suffix) {
  assert.match(runId, /^[0-9]{8}-[0-9]{6}-[0-9a-f]{7}$/);
  assert.match(suffix, /^[a-z0-9_]{1,12}$/);
  const runToken = runId.replaceAll('-', '_');
  const database = `${DATABASE_PREFIX}${runToken}_${process.pid}_${suffix}`;
  assert.ok(database.length <= 63, 'temporary database name exceeds PostgreSQL limit');
  return database;
}

function assertTemporaryDatabase(database) {
  assert.match(database, /^meteolord_test_[a-z0-9_]{1,48}$/);
}

async function withAdminClient(connection, callback) {
  const Client = getClientConstructor();
  const client = new Client({ ...connection, database: 'postgres' });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

async function createTestDatabase({ runId, suffix, connection = connectionFromEnv() }) {
  const database = testDatabaseName(runId, suffix);
  await withAdminClient(connection, async (client) => {
    await client.query(`CREATE DATABASE ${quoteIdentifier(database)}`);
  });
  return database;
}

async function destroyTestDatabase(database, connection = connectionFromEnv()) {
  assertTemporaryDatabase(database);
  await withAdminClient(connection, async (client) => {
    await client.query(
      'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
      [database]
    );
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(database)}`);
  });
}

async function withTestDatabase(options, callback) {
  const connection = options.connection || connectionFromEnv();
  const database = await createTestDatabase({ ...options, connection });
  try {
    return await callback(database);
  } finally {
    await destroyTestDatabase(database, connection);
  }
}

async function queryTestDatabase(database, text, values = [], connection = connectionFromEnv()) {
  assertTemporaryDatabase(database);
  const Client = getClientConstructor();
  const client = new Client({ ...connection, database });
  await client.connect();
  try {
    return await client.query(text, values);
  } finally {
    await client.end();
  }
}

function spawnMigrator({
  database,
  migrationsDir,
  connection = connectionFromEnv(),
  runner = DEFAULT_RUNNER,
  environment = process.env,
}) {
  assertTemporaryDatabase(database);
  const child = spawn(process.execPath, [runner], {
    env: {
      ...environment,
      METEOLORD_ENV: 'test',
      METEOLORD_MIGRATIONS_DIR: migrationsDir,
      POSTGRES_HOST: connection.host,
      POSTGRES_PORT: String(connection.port),
      POSTGRES_USER: connection.user,
      POSTGRES_PASSWORD: connection.password,
      POSTGRES_DB: database,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });

  const completion = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
  return { child, completion, stdout: () => stdout };
}

function runMigrator(options) {
  return spawnMigrator(options).completion;
}

function loadFixtures({
  database,
  connection = connectionFromEnv(),
  runner = DEFAULT_FIXTURE_LOADER,
  environment = process.env,
  mode = 'test',
}) {
  assertTemporaryDatabase(database);
  const child = spawn(process.execPath, [runner], {
    env: {
      ...environment,
      METEOLORD_ENV: mode,
      POSTGRES_HOST: connection.host,
      POSTGRES_PORT: String(connection.port),
      POSTGRES_USER: connection.user,
      POSTGRES_PASSWORD: connection.password,
      POSTGRES_DB: database,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });

  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}

function waitForOutput(processHandle, pattern, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const deadline = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${pattern}`));
    }, timeoutMs);

    function inspect() {
      if (pattern.test(processHandle.stdout())) {
        clearTimeout(deadline);
        resolve();
      }
    }

    processHandle.child.stdout.on('data', inspect);
    processHandle.child.once('close', inspect);
    inspect();
  });
}

module.exports = {
  connectionFromEnv,
  createTestDatabase,
  destroyTestDatabase,
  loadFixtures,
  queryTestDatabase,
  runMigrator,
  spawnMigrator,
  testDatabaseName,
  waitForOutput,
  withTestDatabase,
};
