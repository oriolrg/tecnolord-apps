'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260918-000000-0000000';
const canonical = path.resolve(__dirname, '../../db/migrations');

function migrationCopy(names, transform = (name, content) => content) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'meteolord-ue-migrations-'));
  for (const name of names) {
    const contents = fs.readFileSync(path.join(canonical, name), 'utf8');
    fs.writeFileSync(path.join(directory, name), transform(name, contents), { mode: 0o600 });
  }
  return directory;
}

const files = ['0001-current-runtime.sql', '0002-current-forecast.sql', '0003-ue-identity-catalog.sql'];

async function migrate(database, migrationsDir) {
  const result = await testDb.runMigrator({ database, migrationsDir });
  assert.equal(result.code, 0, result.stderr);
  return result;
}

test('UE-T02 upgrades legacy fixture without IDs, measures or permissions changing', { skip: !enabled, timeout: 30000 }, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_upgrade' }, async (database) => {
    const old = migrationCopy(files.slice(0, 2));
    try {
      await migrate(database, old);
      const load = await testDb.loadFixtures({ database });
      assert.equal(load.code, 0, load.stderr);
      const before = await testDb.queryTestDatabase(database, `
        SELECT e.id AS station_id, e.codi, e.creat_per_usuari,
               count(m.id)::integer AS measures, min(m.temp_c) AS min_temp
        FROM meteo.estacions e JOIN meteo.mesures m ON m.estacio_id=e.id
        GROUP BY e.id
      `);
      assert.equal(before.rowCount, 1);
      assert.equal(before.rows[0].measures, 5);
      assert.equal(before.rows[0].min_temp, 0);

      const first = await migrate(database, canonical);
      assert.match(first.stdout, /applied 0003-ue-identity-catalog\.sql/);
      const after = await testDb.queryTestDatabase(database, `
        SELECT e.id AS station_id, e.codi, e.creat_per_usuari,
               e.owner_id, e.management_kind, e.visibility, e.public_id,
               u.account_status, u.application_role,
               count(m.id)::integer AS measures, min(m.temp_c) AS min_temp
        FROM meteo.estacions e JOIN meteo.mesures m ON m.estacio_id=e.id
        JOIN auth.usuaris u ON u.id=e.creat_per_usuari
        GROUP BY e.id, u.id
      `);
      assert.equal(after.rowCount, 1);
      const row = after.rows[0];
      for (const key of ['station_id', 'codi', 'creat_per_usuari', 'measures', 'min_temp']) {
        assert.equal(row[key], before.rows[0][key], key);
      }
      assert.equal(row.owner_id, null);
      assert.equal(row.management_kind, 'LEGACY');
      assert.equal(row.visibility, 'PRIVATE');
      assert.equal(row.account_status, 'PENDING_EMAIL');
      assert.equal(row.application_role, 'USER');
      assert.match(row.public_id, /^[0-9a-f-]{36}$/);
      const reload = await testDb.loadFixtures({ database });
      assert.equal(reload.code, 0, reload.stderr);
      assert.match(reload.stdout, /inserted meteo\.mesures=0/);
      const second = await migrate(database, canonical);
      assert.match(second.stdout, /skipped 0003-ue-identity-catalog\.sql/);
      const count = await testDb.queryTestDatabase(database,
        "SELECT count(*)::integer AS n FROM meteo_local.schema_migrations WHERE version='0003-ue-identity-catalog.sql'");
      assert.equal(count.rows[0].n, 1);
      const stationAfterReload = await testDb.queryTestDatabase(database,
        'SELECT public_id, owner_id, management_kind FROM meteo.estacions WHERE id=$1', [row.station_id]);
      assert.deepEqual(stationAfterReload.rows[0], {
        public_id: row.public_id,
        owner_id: null,
        management_kind: 'LEGACY',
      });
      const geometry = await testDb.queryTestDatabase(database,
        "SELECT postgis_version() AS version, to_regclass('meteo.station_locations') AS location_table");
      assert.equal(geometry.rows[0].location_table, 'meteo.station_locations');
      assert.ok(geometry.rows[0].version);
    } finally {
      fs.rmSync(old, { recursive: true, force: true });
    }
  });
});

test('UE-T02 failed additive migration rolls back every new relation and column', { skip: !enabled, timeout: 30000 }, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_rollback' }, async (database) => {
    const old = migrationCopy(files.slice(0, 2));
    const broken = migrationCopy(files, (name, content) => name.startsWith('0003-')
      ? `${content}\nTHIS IS INVALID SQL;\n` : content);
    try {
      await migrate(database, old);
      const failure = await testDb.runMigrator({ database, migrationsDir: broken });
      assert.notEqual(failure.code, 0);
      assert.match(failure.stderr, /failed and was rolled back/);
      const state = await testDb.queryTestDatabase(database, `
        SELECT to_regclass('auth.sessions') AS sessions,
               to_regclass('meteo.station_locations') AS locations,
               EXISTS (
                 SELECT 1 FROM information_schema.columns
                 WHERE table_schema='auth' AND table_name='usuaris' AND column_name='account_status'
               ) AS account_status,
               (SELECT count(*)::integer FROM meteo_local.schema_migrations
                WHERE version='0003-ue-identity-catalog.sql') AS applied
      `);
      assert.deepEqual(state.rows[0], { sessions: null, locations: null, account_status: false, applied: 0 });
    } finally {
      fs.rmSync(old, { recursive: true, force: true });
      fs.rmSync(broken, { recursive: true, force: true });
    }
  });
});
