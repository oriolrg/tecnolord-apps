'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const INTEGRATION_ENABLED = process.env.T10_INTEGRATION === '1';
const RUN_ID = process.env.T10_RUN_ID || '20000101-000000-0000000';
const CANONICAL_MIGRATIONS = path.resolve(__dirname, '../../db/migrations');
const integrationOptions = { skip: !INTEGRATION_ENABLED, timeout: 30000 };

const testDb = INTEGRATION_ENABLED
  ? require('../helpers/testDb')
  : null;

function withMigrations(files, callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'meteolord-t10-'));
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(directory, name), contents, { mode: 0o600 });
  }
  return Promise.resolve()
    .then(() => callback(directory))
    .finally(() => fs.rmSync(directory, { recursive: true, force: true }));
}

function withCanonicalCopy(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'meteolord-t10-canonical-'));
  for (const name of fs.readdirSync(CANONICAL_MIGRATIONS).sort()) {
    if (name.endsWith('.sql')) {
      fs.copyFileSync(path.join(CANONICAL_MIGRATIONS, name), path.join(directory, name));
    }
  }
  return Promise.resolve()
    .then(() => callback(directory))
    .finally(() => fs.rmSync(directory, { recursive: true, force: true }));
}

async function canonicalRelationCount(database) {
  const result = await testDb.queryTestDatabase(database, `
    SELECT count(*)::integer AS count
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND (
        (table_schema = 'auth' AND table_name = 'usuaris')
        OR
        (table_schema = 'meteo' AND table_name IN (
          'estacions', 'membres_estacio', 'mesures', 'estacions_hidro',
          'lectures_hidro', 'forecast_run', 'forecast_hourly'
        ))
      )
  `);
  return result.rows[0].count;
}

test('bootstraps schema_migrations in an empty database', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'bootstrap' }, async (database) => {
    await withMigrations({}, async (migrationsDir) => {
      const result = await testDb.runMigrator({ database, migrationsDir });
      assert.equal(result.code, 0, result.stderr);
      const table = await testDb.queryTestDatabase(
        database,
        "SELECT to_regclass('meteo_local.schema_migrations') AS name"
      );
      assert.equal(table.rows[0].name, 'meteo_local.schema_migrations');
    });
  });
});

test('executes ordered migrations in an empty database', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'ordered' }, async (database) => {
    await withMigrations({
      '001-create.sql': 'CREATE TABLE meteo_local.synthetic_items (id integer PRIMARY KEY, name text NOT NULL);',
      '002-seed.sql': "INSERT INTO meteo_local.synthetic_items (id, name) VALUES (1, 'synthetic');",
    }, async (migrationsDir) => {
      const result = await testDb.runMigrator({ database, migrationsDir });
      assert.equal(result.code, 0, result.stderr);
      assert.ok(result.stdout.indexOf('001-create.sql') < result.stdout.indexOf('002-seed.sql'));
      const rows = await testDb.queryTestDatabase(
        database,
        'SELECT id, name FROM meteo_local.synthetic_items'
      );
      assert.deepEqual(rows.rows, [{ id: 1, name: 'synthetic' }]);
      const applied = await testDb.queryTestDatabase(
        database,
        'SELECT version, checksum FROM meteo_local.schema_migrations ORDER BY version'
      );
      assert.equal(applied.rowCount, 2);
      assert.ok(applied.rows.every((row) => /^[0-9a-f]{64}$/.test(row.checksum.trim())));
    });
  });
});

test('re-execution is idempotent', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'idempotent' }, async (database) => {
    await withMigrations({
      '001-once.sql': "CREATE TABLE meteo_local.once_only (value text); INSERT INTO meteo_local.once_only VALUES ('once');",
    }, async (migrationsDir) => {
      const first = await testDb.runMigrator({ database, migrationsDir });
      const second = await testDb.runMigrator({ database, migrationsDir });
      assert.equal(first.code, 0, first.stderr);
      assert.equal(second.code, 0, second.stderr);
      assert.match(second.stdout, /skipped 001-once\.sql/);
      const rows = await testDb.queryTestDatabase(database, 'SELECT value FROM meteo_local.once_only');
      assert.deepEqual(rows.rows, [{ value: 'once' }]);
      const applied = await testDb.queryTestDatabase(
        database,
        'SELECT count(*)::integer AS count FROM meteo_local.schema_migrations'
      );
      assert.equal(applied.rows[0].count, 1);
    });
  });
});

test('rejects a divergent checksum', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'checksum' }, async (database) => {
    await withMigrations({ '001-checksum.sql': 'SELECT 1;' }, async (migrationsDir) => {
      const first = await testDb.runMigrator({ database, migrationsDir });
      assert.equal(first.code, 0, first.stderr);
      fs.writeFileSync(path.join(migrationsDir, '001-checksum.sql'), 'SELECT 2;', { mode: 0o600 });
      const second = await testDb.runMigrator({ database, migrationsDir });
      assert.notEqual(second.code, 0);
      assert.match(second.stderr, /Checksum mismatch for migration 001-checksum\.sql/);
    });
  });
});

test('serializes concurrent migration processes with the advisory lock', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'lock' }, async (database) => {
    await withMigrations({
      '001-slow.sql': `
        CREATE TABLE meteo_local.concurrent_marker (value text);
        SELECT pg_sleep(1.25);
        INSERT INTO meteo_local.concurrent_marker VALUES ('serialized');
      `,
    }, async (migrationsDir) => {
      const first = testDb.spawnMigrator({ database, migrationsDir });
      await testDb.waitForOutput(first, /advisory lock acquired/);
      const secondStartedAt = Date.now();
      const second = testDb.spawnMigrator({ database, migrationsDir });
      const [firstResult, secondResult] = await Promise.all([first.completion, second.completion]);
      const secondElapsedMs = Date.now() - secondStartedAt;
      assert.equal(firstResult.code, 0, firstResult.stderr);
      assert.equal(secondResult.code, 0, secondResult.stderr);
      assert.match(secondResult.stdout, /skipped 001-slow\.sql/);
      assert.ok(secondElapsedMs >= 900, `second process waited only ${secondElapsedMs} ms`);
      const rows = await testDb.queryTestDatabase(
        database,
        'SELECT value FROM meteo_local.concurrent_marker'
      );
      assert.deepEqual(rows.rows, [{ value: 'serialized' }]);
    });
  });
});

test('rolls back a failed migration', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'rollback' }, async (database) => {
    await withMigrations({
      '001-broken.sql': 'CREATE TABLE meteo_local.rollback_probe (id integer); THIS IS INVALID SQL;',
    }, async (migrationsDir) => {
      const result = await testDb.runMigrator({ database, migrationsDir });
      assert.notEqual(result.code, 0);
      assert.match(result.stderr, /failed and was rolled back/);
      const table = await testDb.queryTestDatabase(
        database,
        "SELECT to_regclass('meteo_local.rollback_probe') AS name"
      );
      assert.equal(table.rows[0].name, null);
      const applied = await testDb.queryTestDatabase(
        database,
        'SELECT count(*)::integer AS count FROM meteo_local.schema_migrations WHERE version = $1',
        ['001-broken.sql']
      );
      assert.equal(applied.rows[0].count, 0);
    });
  });
});

test('recreates all eight canonical relations after dropping the test database', integrationOptions, async () => {
  const options = { runId: RUN_ID, suffix: 'recreate' };
  const database = await testDb.createTestDatabase(options);
  try {
    const first = await testDb.runMigrator({ database, migrationsDir: CANONICAL_MIGRATIONS });
    assert.equal(first.code, 0, first.stderr);
    assert.equal(await canonicalRelationCount(database), 8);
  } finally {
    await testDb.destroyTestDatabase(database);
  }

  const recreated = await testDb.createTestDatabase(options);
  try {
    const second = await testDb.runMigrator({ database: recreated, migrationsDir: CANONICAL_MIGRATIONS });
    assert.equal(second.code, 0, second.stderr);
    assert.equal(await canonicalRelationCount(recreated), 8);
    console.log('T10 recreate: first=8 relations recreated=8 relations');
  } finally {
    await testDb.destroyTestDatabase(recreated);
  }
});

test('rejects a comment-only checksum change in a canonical migration', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'canon_sum' }, async (database) => {
    await withCanonicalCopy(async (migrationsDir) => {
      const first = await testDb.runMigrator({ database, migrationsDir });
      assert.equal(first.code, 0, first.stderr);
      fs.appendFileSync(
        path.join(migrationsDir, '0001-current-runtime.sql'),
        '\n-- checksum divergence probe\n',
        { encoding: 'utf8' }
      );
      const second = await testDb.runMigrator({ database, migrationsDir });
      assert.notEqual(second.code, 0);
      assert.match(second.stderr, /Checksum mismatch for migration 0001-current-runtime\.sql/);
      console.log(`T10 checksum divergence: exit=${second.code}`);
      console.log(second.stderr.trim());
    });
  });
});

test('serializes two concurrent canonical migration runs', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'canon_lock' }, async (database) => {
    await withCanonicalCopy(async (migrationsDir) => {
      fs.appendFileSync(
        path.join(migrationsDir, '0001-current-runtime.sql'),
        '\nSELECT pg_sleep(1.0);\n',
        { encoding: 'utf8' }
      );
      const startedAt = Date.now();
      const first = testDb.spawnMigrator({ database, migrationsDir });
      const second = testDb.spawnMigrator({ database, migrationsDir });
      const results = await Promise.all([first.completion, second.completion]);
      const elapsedMs = Date.now() - startedAt;
      assert.ok(results.every((result) => result.code === 0), results.map((r) => r.stderr).join('\n'));
      assert.equal(results.filter((result) => /applied 0001-current-runtime\.sql/.test(result.stdout)).length, 1);
      assert.equal(results.filter((result) => /skipped 0001-current-runtime\.sql/.test(result.stdout)).length, 1);
      assert.ok(elapsedMs >= 900, `concurrent runs completed too quickly: ${elapsedMs} ms`);
      assert.equal(await canonicalRelationCount(database), 8);
      console.log(`T10 concurrency: applied=1 skipped=1 serialized=true elapsed_ms=${elapsedMs}`);
    });
  });
});

test('rolls back partial DDL when a migration creates an existing table', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'ddl_clash' }, async (database) => {
    await withMigrations({
      '001-existing.sql': 'CREATE TABLE meteo_local.already_exists (id integer);',
    }, async (migrationsDir) => {
      const first = await testDb.runMigrator({ database, migrationsDir });
      assert.equal(first.code, 0, first.stderr);
      fs.writeFileSync(
        path.join(migrationsDir, '002-conflict.sql'),
        'CREATE TABLE meteo_local.partial_change (id integer); CREATE TABLE meteo_local.already_exists (id integer);',
        { mode: 0o600 }
      );
      const second = await testDb.runMigrator({ database, migrationsDir });
      assert.notEqual(second.code, 0);
      assert.match(second.stderr, /failed and was rolled back/);
      const partial = await testDb.queryTestDatabase(
        database,
        "SELECT to_regclass('meteo_local.partial_change') AS name"
      );
      assert.equal(partial.rows[0].name, null);
      const applied = await testDb.queryTestDatabase(
        database,
        'SELECT count(*)::integer AS count FROM meteo_local.schema_migrations WHERE version = $1',
        ['002-conflict.sql']
      );
      assert.equal(applied.rows[0].count, 0);
    });
  });
});
