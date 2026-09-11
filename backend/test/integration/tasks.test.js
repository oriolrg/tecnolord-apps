'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const test = require('node:test');

const { createPool } = require('../../db/pool');
const { createApp } = require('../../server');
const {
  applySyntheticServiceConfiguration,
  createLocalTransport,
} = require('../../scripts/run-local-task');
const { createFixedClock } = require('../helpers/clock');

const INTEGRATION_ENABLED = process.env.T15_INTEGRATION === '1';
const RUN_ID = process.env.T15_RUN_ID || '20000101-000000-0000000';
const CANONICAL_MIGRATIONS = path.resolve(__dirname, '../../db/migrations');
const CLI_RUNNER = path.resolve(__dirname, '../../scripts/run-local-task.js');
const API_KEY = 'local-synthetic-key-t15';
const TASK_CASES = Object.freeze([
  ['ecowitt', 'task_ecowitt'],
  ['aca', 'task_aca'],
  ['ecowitt-aca', 'task_ecwaca'],
  ['previ', 'task_previ'],
]);
const integrationOptions = { skip: !INTEGRATION_ENABLED, timeout: 60000 };

const testDb = INTEGRATION_ENABLED
  ? require('../helpers/testDb')
  : null;

function spawnCli(taskName, environment) {
  const child = spawn(process.execPath, [CLI_RUNNER, taskName], {
    env: { ...process.env, ...environment },
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

async function withProcessEnvironment(values, callback) {
  const saved = new Map();
  for (const [name, value] of Object.entries(values)) {
    saved.set(name, process.env[name]);
    process.env[name] = String(value);
  }
  try {
    return await callback();
  } finally {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

function environmentFor(database) {
  const connection = testDb.connectionFromEnv();
  const environment = {
    METEOLORD_ENV: 'test',
    METEOLORD_ALLOW_SYNTHETIC: 'true',
    METEOLORD_PROVIDER_MODE: 'synthetic',
    METEOLORD_EXTERNAL_NETWORK: 'deny',
    POSTGRES_HOST: connection.host,
    POSTGRES_PORT: String(connection.port),
    POSTGRES_USER: connection.user,
    POSTGRES_PASSWORD: connection.password,
    POSTGRES_DB: database,
    INGEST_API_KEY: API_KEY,
  };
  return applySyntheticServiceConfiguration(environment);
}

async function prepareDatabase(database) {
  const migrated = await testDb.runMigrator({ database, migrationsDir: CANONICAL_MIGRATIONS });
  assert.equal(migrated.code, 0, migrated.stderr);
  const loaded = await testDb.loadFixtures({ database });
  assert.equal(loaded.code, 0, loaded.stderr);
}

async function businessCounts(database) {
  const result = await testDb.queryTestDatabase(database, `
    SELECT 'auth.usuaris' AS relation, count(*)::integer AS count FROM auth.usuaris
    UNION ALL SELECT 'meteo.estacions', count(*)::integer FROM meteo.estacions
    UNION ALL SELECT 'meteo.membres_estacio', count(*)::integer FROM meteo.membres_estacio
    UNION ALL SELECT 'meteo.mesures', count(*)::integer FROM meteo.mesures
    UNION ALL SELECT 'meteo.estacions_hidro', count(*)::integer FROM meteo.estacions_hidro
    UNION ALL SELECT 'meteo.lectures_hidro', count(*)::integer FROM meteo.lectures_hidro
    UNION ALL SELECT 'meteo.forecast_run', count(*)::integer FROM meteo.forecast_run
    UNION ALL SELECT 'meteo.forecast_hourly', count(*)::integer FROM meteo.forecast_hourly
    ORDER BY relation
  `);
  return Object.fromEntries(result.rows.map((row) => [row.relation, row.count]));
}

async function startHttpRuntime(environment) {
  const pool = createPool({ environment });
  const logs = [];
  const app = createApp({
    environment,
    pool,
    httpClient: createLocalTransport({ environment, scenario: 'success' }),
    clock: createFixedClock(),
    accessLogStream: { write: (line) => logs.push(line) },
  });
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    logs,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
      await pool.end();
    },
  };
}

test('CLI rejects a missing synthetic acknowledgement before opening a database', async () => {
  const result = await spawnCli('ecowitt', {
    METEOLORD_ENV: 'test',
    METEOLORD_ALLOW_SYNTHETIC: 'false',
  });
  assert.equal(result.code, 64);
  assert.match(result.stderr, /METEOLORD_ALLOW_SYNTHETIC must be true/);
  assert.ok(!result.stderr.includes(API_KEY));
});

test('local task sources contain no scheduler installation or registration', () => {
  const sources = [
    fs.readFileSync(CLI_RUNNER, 'utf8'),
    fs.readFileSync(path.resolve(__dirname, '../../routes/tasks.js'), 'utf8'),
  ].join('\n');
  assert.ok(!/\b(cron|crontab|node-schedule|setInterval)\b/i.test(sources));
});

for (const [taskName, suffix] of TASK_CASES) {
  test(`${taskName} has authenticated CLI/HTTP parity and idempotent persistence`, integrationOptions, async () => {
    await testDb.withTestDatabase({ runId: RUN_ID, suffix }, async (database) => {
      await prepareDatabase(database);
      const environment = environmentFor(database);

      await withProcessEnvironment(environment, async () => {
        const http = await startHttpRuntime(environment);
        try {
          const endpoint = `${http.baseUrl}/api/tasks/run/${taskName}`;
          const absent = await fetch(endpoint, { method: 'POST' });
          assert.equal(absent.status, 401);
          assert.deepEqual(await absent.json(), { ok: false, error: 'invalid api key' });

          const incorrect = await fetch(endpoint, {
            method: 'POST',
            headers: { 'x-api-key': 'incorrect-synthetic-key' },
          });
          assert.equal(incorrect.status, 401);

          const correct = await fetch(endpoint, {
            method: 'POST',
            headers: { 'x-api-key': API_KEY },
          });
          assert.equal(correct.status, 200);
          const httpResult = await correct.json();
          const countsAfterHttp = await businessCounts(database);

          const cli = await spawnCli(taskName, environment);
          assert.equal(cli.code, 0, cli.stderr);
          const cliResult = JSON.parse(cli.stdout.trim().split('\n').at(-1));
          const countsAfterCli = await businessCounts(database);

          assert.deepEqual(cliResult, httpResult);
          assert.deepEqual(countsAfterCli, countsAfterHttp);

          const queryCompatibility = await fetch(`${endpoint}?key=${encodeURIComponent(API_KEY)}`, {
            method: 'POST',
          });
          assert.equal(queryCompatibility.status, 200);
          assert.deepEqual(await queryCompatibility.json(), httpResult);
          assert.deepEqual(await businessCounts(database), countsAfterHttp);
          const queryCorrelationId = queryCompatibility.headers.get('x-correlation-id');
          assert.ok(queryCorrelationId);

          await new Promise((resolve) => setImmediate(resolve));
          const logs = http.logs.join('');
          const logEvents = logs.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
          assert.ok(!logs.includes(API_KEY));
          assert.ok(!cli.stdout.includes(API_KEY));
          assert.ok(!cli.stderr.includes(API_KEY));
          assert.ok(!logs.includes('key='));
          assert.ok(logEvents.some((event) => (
            event.operation === 'http.request'
              && event.correlation_id === queryCorrelationId
              && event.result === 'HTTP_200'
          )));
          console.log(`T15 parity task=${taskName} http=200 cli=0 idempotent=true key_redacted=true`);
        } finally {
          await http.close();
        }
      });
    });
  });
}
