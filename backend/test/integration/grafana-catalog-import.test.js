'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const legacyInventory = require('../../../config/meteolord/grafana-local-station.json');
const mapping = require('../../../docs/sdd/fase-grafana-multiestacio/evidence/H02-station-mapping.json');
const locations = require('../../../docs/sdd/fase-grafana-multiestacio/evidence/H03-station-locations.json');
const { bootstrapLocalGrafana } = require('../../scripts/bootstrap-local-grafana');
const {
  MLW28_PUBLIC_ID, buildGrafanaCatalogInventory,
} = require('../../services/grafanaCatalogInventory');

const enabled = process.env.H06_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.H06_RUN_ID || '20260924-120000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');

async function prepared(suffix, callback) {
  return testDb.withTestDatabase({ runId, suffix }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    try {
      const actor = await pool.query(`
        INSERT INTO auth.usuaris(email,nom,actiu,account_status,application_role,email_verified_at,approved_at)
        VALUES ('h06-admin@example.invalid','H06 Admin',true,'APPROVED','SUPERADMIN',now(),now()) RETURNING id
      `);
      await callback(pool, actor.rows[0].id);
    } finally { await pool.end(); }
  });
}

async function seedMlw28(pool, actorId) {
  const seeded = await bootstrapLocalGrafana({ pool, actorId, inventory: legacyInventory, apply: true });
  assert.equal(seeded.status, 'APPLIED');
  await pool.query("UPDATE meteo.estacions SET public_id=$1 WHERE codi='GRAFANA_LOCAL_001'", [MLW28_PUBLIC_ID]);
  const binding = await pool.query(`
    SELECT b.id,b.station_id FROM meteo.source_bindings b
    JOIN meteo.estacions e ON e.id=b.station_id WHERE e.public_id=$1
  `, [MLW28_PUBLIC_ID]);
  await pool.query(`
    INSERT INTO meteo.current_snapshots(binding_id,observed_at,received_at,fetched_at,values_json,quality_json)
    VALUES ($1,'2026-09-24T10:00:00Z','2026-09-24T10:01:00Z','2026-09-24T10:01:00Z',
      '{"temp_c":12.5,"humitat_pct":66}'::jsonb,'{"freshness":"FRESH"}'::jsonb)
  `, [binding.rows[0].id]);
  return binding.rows[0];
}

test('H06 creates the catalog, updates MLW28 in place and is idempotent', {
  skip: !enabled, timeout: 120000,
}, async () => prepared('h06catalog', async (pool, actorId) => {
  const before = await seedMlw28(pool, actorId);
  const inventory = buildGrafanaCatalogInventory(mapping, locations);
  const applied = await bootstrapLocalGrafana({ pool, actorId, inventory, apply: true, allowPartial: true });
  assert.equal(applied.status, 'APPLIED');
  assert.equal(applied.stations.length, 29);

  const rows = await pool.query(`
    SELECT e.id,e.public_id,e.codi,e.nom,e.management_kind,e.visibility,
      public.ST_Y(l.private_geometry) AS latitude,public.ST_X(l.private_geometry) AS longitude,
      b.id AS binding_id,b.external_id,s.binding_id AS snapshot_binding
    FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
    JOIN meteo.station_locations l ON l.station_id=e.id
    LEFT JOIN meteo.current_snapshots s ON s.binding_id=b.id
    WHERE b.source_namespace='GRAFANA' ORDER BY b.external_id
  `);
  assert.equal(rows.rowCount, 29);
  assert.equal(rows.rows.every((row) => row.management_kind === 'ADMIN' && row.visibility === 'PRIVATE'), true);
  assert.equal(rows.rows.filter((row) => row.latitude !== null && row.longitude !== null).length, 10);
  const mlw28 = rows.rows.find((row) => row.external_id === 'Meteo-001-3100044');
  assert.equal(mlw28.public_id, MLW28_PUBLIC_ID);
  assert.equal(mlw28.codi, 'MLW28');
  assert.equal(mlw28.nom, "Granja Vaques ca l'Andal");
  assert.equal(mlw28.binding_id, before.id);
  assert.equal(mlw28.snapshot_binding, before.id);
  assert.equal(rows.rows.find((row) => row.external_id === 'Meteo-026-').codi, 'MLW26');
  assert.equal(rows.rows.find((row) => row.external_id === 'S31-119416').nom, 'S31-119416');
  assert.equal(rows.rows.find((row) => row.external_id === 'Meteo-023-00386').latitude, null);
  assert.equal((await pool.query(`
    SELECT count(*)::int AS total FROM meteo.mesures m
    JOIN meteo.source_bindings b ON b.station_id=m.estacio_id WHERE b.source_namespace='GRAFANA'
  `)).rows[0].total, 0);

  const repeated = await bootstrapLocalGrafana({ pool, actorId, inventory, apply: true, allowPartial: true });
  assert.equal(repeated.status, 'ALREADY_PRESENT');
  assert.equal(repeated.stations.length, 29);
  assert.equal((await pool.query("SELECT count(*)::int AS total FROM meteo.source_bindings WHERE source_namespace='GRAFANA'")).rows[0].total, 29);
}));
