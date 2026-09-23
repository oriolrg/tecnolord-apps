#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const { makeImportService } = require('../services/importService');

const INVENTORY_PATH = path.resolve(__dirname, '../../config/meteolord/grafana-local-station.json');
const EXPECTED = Object.freeze({
  inventoryCode: 'GRAFANA_LOCAL_001',
  stationCode: 'GRAFANA_LOCAL_001',
  name: 'Estació de prova Grafana local',
  namespace: 'GRAFANA',
  externalId: 'Meteo-001-3100044',
});

function parseArgs(args) {
  let actorId = null;
  let apply = false;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--apply' && !apply) {
      apply = true;
    } else if (args[index] === '--actor-id' && actorId === null && args[index + 1] !== undefined) {
      actorId = Number(args[index + 1]);
      index += 1;
    } else {
      throw new Error('Usage: bootstrap-local-grafana.js --actor-id <id> [--apply]');
    }
  }
  if (!Number.isSafeInteger(actorId) || actorId < 1) {
    throw new Error('Usage: bootstrap-local-grafana.js --actor-id <id> [--apply]');
  }
  return { actorId, apply };
}

function localDatabaseConfig(environment = process.env) {
  const mode = environment.METEOLORD_ENV;
  const host = environment.POSTGRES_HOST || environment.DB_HOST;
  const database = environment.POSTGRES_DB || environment.DB_NAME;
  const port = environment.POSTGRES_PORT || environment.DB_PORT || '5432';
  if (mode !== 'local') throw new Error('Bootstrap requires METEOLORD_ENV=local');
  if (host !== 'db' || database !== 'meteolord_local' || port !== '5432') {
    throw new Error('Bootstrap requires the allowlisted local MeteoLord database');
  }
  const user = environment.POSTGRES_USER || environment.DB_USER;
  const password = environment.POSTGRES_PASSWORD || environment.DB_PASSWORD;
  if (!user || !password) throw new Error('Bootstrap requires local database credentials');
  return { host, port: 5432, database, user, password };
}

function validateInventory(inventory) {
  const row = inventory?.rows?.[0];
  if (inventory?.source_namespace !== EXPECTED.namespace || inventory?.rows?.length !== 1
      || row?.inventory_code !== EXPECTED.inventoryCode || row?.station_code !== EXPECTED.stationCode
      || row?.name !== EXPECTED.name || row?.external_id !== EXPECTED.externalId
      || row?.mapping_status !== 'VERIFIED' || row?.longitude !== null
      || row?.latitude !== null || row?.accuracy_m !== null) {
    throw new Error('Grafana local inventory does not match the approved technical identity');
  }
  return inventory;
}

function batchSummary(result) {
  const batch = result.batch;
  return {
    batch_id: batch.id,
    batch_status: batch.status,
    idempotent: result.idempotent === true,
    counts: batch.counts,
    rows: batch.rows.map((row) => ({
      inventory_code: row.inventory_code,
      status: row.status,
      issue_code: row.issue_code,
      action: row.action,
    })),
  };
}

async function approvedSuperadmin(pool, actorId) {
  const result = await pool.query(`
    SELECT id FROM auth.usuaris
    WHERE id=$1 AND application_role='SUPERADMIN' AND account_status='APPROVED'
      AND actiu=true AND email_verified_at IS NOT NULL AND approved_at IS NOT NULL
  `, [actorId]);
  return result.rowCount === 1;
}

async function presentStation(pool) {
  const result = await pool.query(`
    SELECT e.public_id,e.codi,e.management_kind,e.visibility,
      b.source_namespace,b.external_id,b.binding_status
    FROM meteo.estacions e
    JOIN meteo.source_bindings b ON b.station_id=e.id
    WHERE e.codi=$1 AND b.source_namespace=$2 AND b.external_id=$3
      AND b.binding_status='VALIDATED'
  `, [EXPECTED.stationCode, EXPECTED.namespace, EXPECTED.externalId]);
  if (result.rowCount !== 1) throw new Error('Applied import does not match the approved Grafana identity');
  return result.rows[0];
}

async function bootstrapLocalGrafana({ pool, actorId, inventory, apply = false, clock } = {}) {
  if (!pool?.query || typeof pool.connect !== 'function') throw new TypeError('Bootstrap pool is required');
  const numericActorId = Number(actorId);
  if (!Number.isSafeInteger(numericActorId) || numericActorId < 1) throw new TypeError('Bootstrap actor is invalid');
  validateInventory(inventory);
  if (!await approvedSuperadmin(pool, numericActorId)) {
    return { status: 'FORBIDDEN_ACTOR' };
  }
  const imports = makeImportService({ pool, clock });
  const staged = await imports.stage(numericActorId, inventory);
  if (staged.invalid) return { status: 'INVALID_INVENTORY' };
  const dryRun = batchSummary(staged);
  const conflicts = dryRun.rows.filter((row) => row.status === 'CONFLICT');
  if (conflicts.length) return { status: 'CONFLICT', dry_run: dryRun, conflicts };

  const target = dryRun.rows.find((row) => row.inventory_code === EXPECTED.inventoryCode);
  if (!target) return { status: 'INVALID_INVENTORY', dry_run: dryRun };
  if (dryRun.batch_status === 'APPLIED' && target.status === 'APPLIED') {
    return { status: 'ALREADY_PRESENT', dry_run: dryRun, station: await presentStation(pool) };
  }
  if (target.status !== 'VALIDATED') {
    return { status: 'CONFLICT', dry_run: dryRun, conflicts: [target] };
  }
  if (!apply) return { status: 'DRY_RUN', dry_run: dryRun };

  const applied = await imports.apply(numericActorId, dryRun.batch_id);
  if (applied.conflict) return { status: 'CONFLICT', dry_run: dryRun, conflicts: [] };
  if (applied.invalid || applied.notFound) throw new Error('Staged Grafana import could not be applied');
  return {
    status: applied.idempotent ? 'ALREADY_PRESENT' : 'APPLIED',
    dry_run: dryRun,
    station: await presentStation(pool),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = localDatabaseConfig(process.env);
  const inventory = validateInventory(JSON.parse(await fs.readFile(INVENTORY_PATH, 'utf8')));
  const pool = new Pool({ ...config, max: 2 });
  try {
    const result = await bootstrapLocalGrafana({ pool, inventory, ...options });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (['CONFLICT', 'FORBIDDEN_ACTOR', 'INVALID_INVENTORY'].includes(result.status)) process.exitCode = 2;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${JSON.stringify({ status: 'ERROR', error: error.message })}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  EXPECTED,
  bootstrapLocalGrafana,
  localDatabaseConfig,
  parseArgs,
  validateInventory,
};
