'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');

const { loadFixtureDocuments } = require('../../scripts/load-local-fixtures');

const INTEGRATION_ENABLED = process.env.T13_INTEGRATION === '1';
const RUN_ID = process.env.T13_RUN_ID || '20000101-000000-0000000';
const CANONICAL_MIGRATIONS = path.resolve(__dirname, '../../db/migrations');
const FIXTURE_DIRECTORY = path.resolve(__dirname, '../fixtures');
const integrationOptions = { skip: !INTEGRATION_ENABLED, timeout: 30000 };
const EXPECTED_COUNTS = Object.freeze({
  'auth.usuaris': 1,
  'meteo.estacions': 1,
  'meteo.membres_estacio': 1,
  'meteo.mesures': 5,
  'meteo.estacions_hidro': 3,
  'meteo.lectures_hidro': 4,
  'meteo.forecast_run': 1,
  'meteo.forecast_hourly': 4,
});

const testDb = INTEGRATION_ENABLED
  ? require('../helpers/testDb')
  : null;

async function migrate(database) {
  const result = await testDb.runMigrator({ database, migrationsDir: CANONICAL_MIGRATIONS });
  assert.equal(result.code, 0, result.stderr);
}

async function relationCounts(database) {
  const entries = await Promise.all(
    Object.keys(EXPECTED_COUNTS).map(async (relation) => {
      const result = await testDb.queryTestDatabase(
        database,
        `SELECT count(*)::integer AS count FROM ${relation}`
      );
      return [relation, result.rows[0].count];
    })
  );
  return Object.fromEntries(entries);
}

test('loads every canonical business relation in a migrated empty database', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'first' }, async (database) => {
    await migrate(database);
    const result = await testDb.loadFixtures({ database });
    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /load complete/);
    assert.deepEqual(await relationCounts(database), EXPECTED_COUNTS);
  });
});

test('a second fixture load is idempotent and inserts no duplicates', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'twice' }, async (database) => {
    await migrate(database);
    const first = await testDb.loadFixtures({ database });
    const countsAfterFirst = await relationCounts(database);
    const second = await testDb.loadFixtures({ database });
    const countsAfterSecond = await relationCounts(database);

    assert.equal(first.code, 0, first.stderr);
    assert.equal(second.code, 0, second.stderr);
    assert.deepEqual(countsAfterFirst, EXPECTED_COUNTS);
    assert.deepEqual(countsAfterSecond, countsAfterFirst);
    assert.match(second.stdout, /inserted meteo\.mesures=0/);
    assert.match(second.stdout, /inserted meteo\.forecast_hourly=0/);
  });
});

test('rejects fixture loading when migrations have not run', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'unmigrated' }, async (database) => {
    const result = await testDb.loadFixtures({ database });
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /Database is not migrated/);
  });
});

test('rejects fixture loading outside local or test before connecting', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'prod_guard' }, async (database) => {
    const result = await testDb.loadFixtures({ database, mode: 'production' });
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /METEOLORD_ENV must be local or test/);
  });
});

test('rolls back every inserted fixture row if one insertion fails', integrationOptions, async () => {
  await testDb.withTestDatabase({ runId: RUN_ID, suffix: 'rollback' }, async (database) => {
    await migrate(database);
    await testDb.queryTestDatabase(
      database,
      'ALTER TABLE meteo.mesures ADD CONSTRAINT fixture_rollback_probe CHECK (false)'
    );
    const result = await testDb.loadFixtures({ database });
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /rolled back/);
    assert.deepEqual(await relationCounts(database), {
      'auth.usuaris': 0,
      'meteo.estacions': 0,
      'meteo.membres_estacio': 0,
      'meteo.mesures': 0,
      'meteo.estacions_hidro': 0,
      'meteo.lectures_hidro': 0,
      'meteo.forecast_run': 0,
      'meteo.forecast_hourly': 0,
    });
  });
});

test('fixture document loader opens only the JSON allowlist and no legacy data', async () => {
  const opened = [];
  await loadFixtureDocuments({
    fixtureDirectory: FIXTURE_DIRECTORY,
    readFile: async (filePath) => {
      opened.push(path.basename(filePath));
      return fs.readFile(filePath);
    },
  });

  assert.deepEqual(opened, ['manifest.json', 'meteo.json', 'hidro.json', 'forecast.json']);
  assert.ok(opened.every((fileName) => fileName.endsWith('.json')));
  assert.ok(opened.every((fileName) => !/\.(csv|sql|dump)$/i.test(fileName)));
});
