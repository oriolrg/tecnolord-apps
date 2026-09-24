#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const { bootstrapLocalGrafana, localDatabaseConfig } = require('./bootstrap-local-grafana');
const {
  EXPECTED_SENSOR_COUNT, MLW28_PUBLIC_ID, buildGrafanaCatalogInventory, buildGrafanaImportPlan,
} = require('../services/grafanaCatalogInventory');
const { makeGrafanaAdapterService } = require('../services/grafanaAdapterService');
const { makeSnapshotService } = require('../services/snapshotService');
const { resolveSourceCadenceConfig } = require('../services/sourceCadence');

const PHASE_DIR = path.resolve(__dirname, '../../docs/sdd/fase-grafana-multiestacio');
const MAPPING_PATH = path.join(PHASE_DIR, 'evidence/H02-station-mapping.json');
const LOCATION_PATH = path.join(PHASE_DIR, 'evidence/H03-station-locations.json');

function parseArgs(args) {
  let actorId = null;
  let apply = false;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--apply') apply = true;
    else if (args[index] === '--actor-id' && args[index + 1] !== undefined) {
      actorId = Number(args[index + 1]); index += 1;
    } else throw new Error('Usage: reconcile-local-grafana-catalog.js --actor-id <id> [--apply]');
  }
  if (!Number.isSafeInteger(actorId) || actorId < 1) {
    throw new Error('Usage: reconcile-local-grafana-catalog.js --actor-id <id> [--apply]');
  }
  return { actorId, apply };
}

async function readInventory() {
  const [mapping, locations] = await Promise.all([
    fs.readFile(MAPPING_PATH, 'utf8').then(JSON.parse),
    fs.readFile(LOCATION_PATH, 'utf8').then(JSON.parse),
  ]);
  return buildGrafanaCatalogInventory(mapping, locations);
}

async function existingGrafanaStations(pool) {
  const result = await pool.query(`
    SELECT e.public_id AS uuid,e.codi AS code,e.management_kind,
      b.source_namespace,b.external_id
    FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
    WHERE b.source_namespace='GRAFANA' AND b.binding_status='VALIDATED'
    ORDER BY b.external_id
  `);
  return result.rows;
}

async function mlw28State(pool) {
  const result = await pool.query(`
    SELECT e.id,e.public_id,e.codi,e.nom,b.id AS binding_id,b.external_id,
      (s.binding_id IS NOT NULL) AS snapshot_exists,s.observed_at,s.fetched_at
    FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
    LEFT JOIN meteo.current_snapshots s ON s.binding_id=b.id
    WHERE e.public_id=$1 AND b.source_namespace='GRAFANA'
      AND b.external_id='Meteo-001-3100044'
  `, [MLW28_PUBLIC_ID]);
  return result.rows[0] || null;
}

async function controlledRefresh(pool, stations, environment = process.env) {
  const cadence = resolveSourceCadenceConfig({
    ...environment, METEOLORD_GRAFANA_INTERNAL_ENABLED: 'true',
  });
  const grafana = makeGrafanaAdapterService({ pool, fetch: globalThis.fetch, enabled: true });
  const snapshots = makeSnapshotService({
    pool, connectorRegistry: { async credentialsForStation() { return null; } }, grafana,
    fetch: globalThis.fetch, sourceIntervals: cadence.intervals, grafanaEnabled: true,
  });
  const outcomes = [];
  let cursor = 0;
  async function worker() {
    while (cursor < stations.length) {
      const station = stations[cursor++];
      outcomes.push({ external_id: station.external_id, station_id: station.id,
        ...(await snapshots.refreshStation(station.id)) });
    }
  }
  await Promise.all([worker(), worker()]);
  outcomes.sort((left, right) => left.external_id.localeCompare(right.external_id));
  return outcomes;
}

async function catalogResult(pool, inventory, outcomes, beforeMlw28) {
  const catalog = await pool.query(`
    SELECT e.id,e.public_id,e.codi,e.nom,e.management_kind,e.visibility,
      public.ST_Y(l.private_geometry) AS latitude,public.ST_X(l.private_geometry) AS longitude,
      b.id AS binding_id,b.external_id,b.binding_status,s.observed_at,s.values_json,s.quality_json,s.provider_error
    FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
    JOIN meteo.station_locations l ON l.station_id=e.id
    LEFT JOIN meteo.current_snapshots s ON s.binding_id=b.id
    WHERE b.source_namespace='GRAFANA' AND b.external_id=ANY($1::text[])
    ORDER BY b.external_id
  `, [inventory.rows.map((row) => row.external_id)]);
  const measures = await pool.query(`
    SELECT count(*)::int AS total FROM meteo.mesures m
    JOIN meteo.source_bindings b ON b.station_id=m.estacio_id WHERE b.source_namespace='GRAFANA'
  `);
  const history = await pool.query(`
    SELECT count(*)::int AS total FROM meteo.station_history_policies h
    JOIN meteo.source_bindings b ON b.station_id=h.station_id WHERE b.source_namespace='GRAFANA'
  `);
  const afterMlw28 = catalog.rows.find((row) => row.public_id === MLW28_PUBLIC_ID) || null;
  const successful = outcomes.filter((item) => item.updated === true).length;
  const highApplied = catalog.rows.filter((row) => row.latitude !== null && row.longitude !== null).length;
  return {
    catalog_count: catalog.rowCount,
    refresh: {
      successful, failed: outcomes.length - successful,
      temperature_available: catalog.rows.filter((row) => row.values_json?.temp_c != null).length,
      humidity_available: catalog.rows.filter((row) => row.values_json?.humitat_pct != null).length,
      outcomes,
    },
    locations: { high_applied: highApplied, medium_applied: 0, low_applied: 0, unresolved_applied: 0 },
    mlw28: {
      uuid_before: beforeMlw28?.public_id || null, uuid_after: afterMlw28?.public_id || null,
      binding_id_before: beforeMlw28?.binding_id || null, binding_id_after: afterMlw28?.binding_id || null,
      binding_preserved: Boolean(beforeMlw28 && afterMlw28 && beforeMlw28.binding_id === afterMlw28.binding_id),
      snapshot_before: beforeMlw28?.snapshot_exists === true,
      snapshot_after: afterMlw28?.observed_at != null,
      snapshot_preserved: Boolean(beforeMlw28?.snapshot_exists && afterMlw28?.observed_at),
    },
    grafana_measures: measures.rows[0].total,
    grafana_history_policies: history.rows[0].total,
    stations: catalog.rows,
  };
}

async function reconcile({ pool, actorId, apply = false, environment = process.env } = {}) {
  const inventory = await readInventory();
  const existing = await existingGrafanaStations(pool);
  const plan = buildGrafanaImportPlan(inventory, existing);
  const beforeMlw28 = await mlw28State(pool);
  const imported = await bootstrapLocalGrafana({
    pool, actorId, inventory, apply, allowPartial: true,
  });
  const response = {
    task: 'H06', mode: apply ? 'APPLY' : 'PLAN', sensor_count: EXPECTED_SENSOR_COUNT,
    plan, import: imported,
  };
  if (!apply || !['APPLIED', 'ALREADY_PRESENT', 'PARTIAL'].includes(imported.status)) return response;
  const stations = imported.stations || [];
  const outcomes = await controlledRefresh(pool, stations, environment);
  return { ...response, result: await catalogResult(pool, inventory, outcomes, beforeMlw28) };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const pool = new Pool({ ...localDatabaseConfig(process.env), max: 3 });
  try {
    const result = await reconcile({ pool, environment: process.env, ...options });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (['CONFLICT', 'FORBIDDEN_ACTOR', 'INVALID_INVENTORY'].includes(result.import.status)) process.exitCode = 2;
  } finally { await pool.end(); }
}

if (require.main === module) main().catch((error) => {
  process.stderr.write(`${JSON.stringify({ status: 'ERROR', error: error.message })}\n`);
  process.exitCode = 1;
});

module.exports = { catalogResult, controlledRefresh, existingGrafanaStations, parseArgs, readInventory, reconcile };
