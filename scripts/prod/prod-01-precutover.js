#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const { assertTarget } = require('./prod-01');

const PR04_TARGET = 'meteo_restore_test';
const PR04_SHA256 = '4434d95f84e2301129626a6964679ee1d8fa2641682f366f16a85dbab333e469';
const VARIABLE_FIELDS = new Set(['database', 'target_database', 'collected_at']);
const PR04_ERRATA_VIEWS = new Set([
  'v_station_location_effective',
  'v_estacions_compat',
  'v_current_station_state',
  'v_current_station_state_admin',
  'v_current_station_state_public',
]);
const REQUIRED_PREFLIGHTS = new Set([
  'duplicate_station_codes',
  'duplicate_casefolded_user_emails',
  'legacy_station_coordinates',
  'legacy_station_creator_reference',
  'blank_station_codes',
  'blank_user_emails',
  'orphan_meteo_mesures_station',
  'orphan_station_memberships',
  'orphan_application_memberships',
  'orphan_hydro_readings',
  'orphan_forecast_hourly_runs',
  'forecast_run_station_code_without_legacy_station',
  'forecast_hours_out_of_range',
  'duplicate_measure_station_instant',
  'duplicate_hydro_station_instant',
]);

function fail(message) {
  throw new Error(message);
}

function one(records, section) {
  const matches = records.filter((record) => record.section === section);
  if (matches.length !== 1) fail(`Expected exactly one ${section} record`);
  return matches[0];
}

function parseFingerprint(text, expectedTarget) {
  const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines[0] !== 'PR04_FINGERPRINT_V1_BEGIN'
      || lines.at(-1) !== 'PR04_FINGERPRINT_V1_END') {
    fail('Fingerprint markers are missing or misplaced');
  }
  const records = lines.slice(1, -1).map((line) => {
    try {
      const record = JSON.parse(line);
      if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('not an object');
      return record;
    } catch {
      fail('Fingerprint contains an invalid NDJSON record');
    }
  });
  const collector = one(records, 'collector');
  const database = one(records, 'database');
  const complete = one(records, 'collector_complete');
  if (collector.target_database !== expectedTarget || database.database !== expectedTarget
      || complete.target_database !== expectedTarget) {
    fail(`Fingerprint target/current_database must be ${expectedTarget}`);
  }
  if (collector.transaction_read_only !== 'on' || complete.transaction_read_only !== 'on') {
    fail('Fingerprint transaction_read_only must be on');
  }
  if (collector.transaction_isolation !== 'repeatable read') {
    fail('Fingerprint isolation must be repeatable read');
  }
  if (complete.complete !== true) fail('Fingerprint collector_complete must be true');
  return records;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function normalizeRecords(records, role) {
  const errata = new Set();
  const normalized = [];
  for (const source of records) {
    if (source.section === 'rc_view_probe') {
      if (role !== 'baseline' || !PR04_ERRATA_VIEWS.has(source.view)) {
        fail(`Unauthorized rc_view_probe normalization: ${source.view || '<empty>'}`);
      }
      if (errata.has(source.view)) fail(`Duplicate PR04 errata probe: ${source.view}`);
      errata.add(source.view);
      continue;
    }
    const record = Object.fromEntries(Object.entries(source)
      .filter(([key]) => !VARIABLE_FIELDS.has(key)));
    normalized.push(JSON.stringify(stable(record)));
  }
  if (role === 'baseline' && (errata.size !== PR04_ERRATA_VIEWS.size
      || [...PR04_ERRATA_VIEWS].some((view) => !errata.has(view)))) {
    fail('Immutable PR04 baseline does not contain the exact five authorized errata probes');
  }
  return normalized.sort();
}

function assertBaseline(buffer) {
  const digest = crypto.createHash('sha256').update(buffer).digest('hex');
  if (digest !== PR04_SHA256) fail(`Immutable PR04 fingerprint SHA-256 mismatch: ${digest}`);
  return true;
}

function assertFingerprintEqual(baselineText, candidateText, target) {
  const baseline = normalizeRecords(parseFingerprint(baselineText, PR04_TARGET), 'baseline');
  const candidate = normalizeRecords(parseFingerprint(candidateText, target), 'candidate');
  if (baseline.length !== candidate.length
      || baseline.some((record, index) => record !== candidate[index])) {
    fail('Fingerprint differs from PR04 outside the explicitly authorized fields/errata');
  }
  return true;
}

function assertPrecutoverRecords(records) {
  const rcRelations = records.filter((record) => record.section === 'rc_relation_probe'
    && record.migration_role === 'rc_new');
  if (rcRelations.length !== 18 || rcRelations.some((record) => record.status !== 'ABSENT'
      || record.actual_kind !== null)) fail('All 18 RC relations must be absent');

  const rcColumns = records.filter((record) => record.section === 'rc_column_probe'
    && record.migration_role === 'rc_addition');
  if (rcColumns.length !== 11 || rcColumns.some((record) => record.status !== 'ABSENT'
      || record.actual_type !== null)) fail('All 11 RC columns must be absent');

  if (records.some((record) => record.section === 'extension' && record.name === 'postgis')) {
    fail('PostGIS must not already be installed in the PRE-CUTOVER database');
  }
  const postgis = records.find((record) => record.section === 'migration_preflight'
    && record.check === 'postgis_extension_state');
  if (!postgis || postgis.installed !== false || postgis.required_before_geometry_migration !== true) {
    fail('PostGIS PRE state differs');
  }

  const invariants = records.filter((record) => record.section === 'pr03_invariant');
  if (invariants.length !== 12 || invariants.some((record) => record.matches_pr03 !== true
      || record.row_count !== record.expected_row_count)) fail('PR03 counts/ranges differ');

  const preflights = records.filter((record) => record.section === 'migration_preflight');
  for (const check of REQUIRED_PREFLIGHTS) {
    const matches = preflights.filter((record) => record.check === check);
    if (matches.length !== 1 || matches[0].pass !== true) fail(`PRE-CUTOVER preflight failed: ${check}`);
  }
  return true;
}

function runGate(baselineBuffer, candidateText, target) {
  assertTarget(target);
  assertBaseline(baselineBuffer);
  const candidateRecords = parseFingerprint(candidateText, target);
  assertPrecutoverRecords(candidateRecords);
  assertFingerprintEqual(baselineBuffer.toString('utf8'), candidateText, target);
  return { status: 'PASS', gate: 'PROD01_PRECUTOVER_GATE_PASS', target };
}

function cli(argv) {
  const [command, ...args] = argv;
  if (command === 'target') return assertTarget(args[0]);
  if (command === 'artifact') {
    assertTarget(args[1]);
    assertPrecutoverRecords(parseFingerprint(fs.readFileSync(args[0], 'utf8'), args[1]));
    return true;
  }
  if (command === 'gate') {
    if (args.length !== 3) fail('Use gate <PR04 baseline> <candidate fingerprint> <TARGET_DB>');
    return runGate(fs.readFileSync(args[0]), fs.readFileSync(args[1], 'utf8'), args[2]);
  }
  fail(`Unknown PROD-01 PRE-CUTOVER command: ${command || '<empty>'}`);
}

if (require.main === module) {
  try {
    const result = cli(process.argv.slice(2));
    if (result && typeof result === 'object') process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`PROD-01 PRE-CUTOVER FAIL: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  PR04_SHA256,
  PR04_ERRATA_VIEWS,
  VARIABLE_FIELDS,
  REQUIRED_PREFLIGHTS,
  parseFingerprint,
  normalizeRecords,
  assertBaseline,
  assertFingerprintEqual,
  assertPrecutoverRecords,
  runGate,
};
