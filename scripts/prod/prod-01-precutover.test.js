'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const {
  PR04_SHA256,
  parseFingerprint,
  normalizeRecords,
  assertBaseline,
  assertFingerprintEqual,
  assertPrecutoverRecords,
  runGate,
} = require('./prod-01-precutover');

const ROOT = path.resolve(__dirname, '../..');
const BASELINE_PATH = path.join(ROOT, 'docs/sdd/produccio/evidence/PR04-readonly-fingerprint.ndjson');
const COLLECTOR_PATH = path.join(ROOT, 'scripts/prod/prod-01-precutover-collector.sh');
const WRAPPER_PATH = path.join(ROOT, 'scripts/prod/prod-01-precutover.sh');
const TARGET = 'meteo_prod_dryrun_20261002_120000';
const baseline = fs.readFileSync(BASELINE_PATH);

function candidateRecords() {
  return baseline.toString('utf8').trim().split(/\r?\n/).slice(1, -1).map(JSON.parse)
    .filter((record) => record.section !== 'rc_view_probe')
    .map((record) => {
      const copy = {...record};
      if (Object.hasOwn(copy, 'database')) copy.database = TARGET;
      if (Object.hasOwn(copy, 'target_database')) copy.target_database = TARGET;
      if (Object.hasOwn(copy, 'collected_at')) copy.collected_at = '2026-10-02T12:00:00Z';
      return copy;
    });
}

function artifact(records = candidateRecords()) {
  return ['PR04_FINGERPRINT_V1_BEGIN', ...records.map((record) => JSON.stringify(record)),
    'PR04_FINGERPRINT_V1_END', ''].join('\n');
}

test('packaged immutable PR04 baseline has the required SHA-256', () => {
  assert.equal(assertBaseline(baseline), true);
  assert.equal(PR04_SHA256, '4434d95f84e2301129626a6964679ee1d8fa2641682f366f16a85dbab333e469');
});

test('correct historical clone fingerprint passes every PRE-CUTOVER gate', () => {
  const candidate = artifact();
  const records = parseFingerprint(candidate, TARGET);
  assert.equal(assertPrecutoverRecords(records), true);
  assert.equal(assertFingerprintEqual(baseline.toString('utf8'), candidate, TARGET), true);
  assert.deepEqual(runGate(baseline, candidate, TARGET), {
    status:'PASS',gate:'PROD01_PRECUTOVER_GATE_PASS',target:TARGET,
  });
});

test('fingerprint current_database divergence fails', () => {
  assert.throws(() => parseFingerprint(artifact(), 'meteo_prod_dryrun_20261002_120001'),
    /target\/current_database/);
});

test('PostGIS absent is accepted and PostGIS installed fails PRE', () => {
  assert.equal(assertPrecutoverRecords(parseFingerprint(artifact(), TARGET)), true);
  const rows = candidateRecords();
  const state = rows.find((record) => record.section === 'migration_preflight'
    && record.check === 'postgis_extension_state');
  state.installed = true;
  rows.push({section:'extension',name:'postgis',version:'3.4.3',schema:'public',relocatable:false});
  assert.throws(() => assertPrecutoverRecords(parseFingerprint(artifact(rows), TARGET)),
    /PostGIS must not already be installed/);
});

test('an existing RC object fails PRE', () => {
  const rows = candidateRecords();
  const relation = rows.find((record) => record.section === 'rc_relation_probe'
    && record.migration_role === 'rc_new');
  relation.status = 'PRESENT';
  relation.actual_kind = 'table';
  assert.throws(() => assertPrecutoverRecords(parseFingerprint(artifact(rows), TARGET)),
    /18 RC relations must be absent/);
});

test('a PR03/preflight mismatch fails PRE', () => {
  const rows = candidateRecords();
  rows.find((record) => record.section === 'pr03_invariant').matches_pr03 = false;
  assert.throws(() => assertPrecutoverRecords(parseFingerprint(artifact(rows), TARGET)),
    /PR03 counts\/ranges differ/);
});

test('any fingerprint divergence outside authorized fields fails', () => {
  const rows = candidateRecords();
  rows.find((record) => record.section === 'relation').owner = 'unexpected_owner';
  assert.throws(() => assertFingerprintEqual(baseline.toString('utf8'), artifact(rows), TARGET),
    /differs from PR04/);
});

test('only the exact five baseline rc_view_probe errata records are ignored', () => {
  const records = parseFingerprint(baseline.toString('utf8'), 'meteo_restore_test');
  assert.doesNotThrow(() => normalizeRecords(records, 'baseline'));
  assert.throws(() => normalizeRecords([...records, {
    section:'rc_view_probe',view:'sixth_invented_view',status:'ABSENT',
  }], 'baseline'),/Unauthorized rc_view_probe/);
  assert.throws(() => normalizeRecords(candidateRecords().concat({
    section:'rc_view_probe',view:'v_estacions_compat',status:'ABSENT',
  }), 'candidate'),/Unauthorized rc_view_probe/);
});

test('collector is target-parameterized, read-only and contains the silent home/PostGIS guards', () => {
  const source = fs.readFileSync(COLLECTOR_PATH, 'utf8');
  assert.match(source, /TARGET_DB:\?TARGET_DB is required/);
  assert.match(source, /--variable=expected_target="\$\{TARGET_DB\}"/);
  assert.match(source, /current_database\(\) = :'expected_target'/);
  assert.match(source, /BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;/);
  assert.match(source, /default_transaction_read_only=on/);
  assert.match(source, /FROM pg_available_extensions/);
  assert.match(source, /\\if :prod01_postgis_available[\s\S]*\\quit 42/);
  assert.match(source, /codi = 'home'/);
  assert.match(source, /nom = 'Casa'/);
  assert.match(source, /proveidor = 'ecowitt'/);
  assert.match(source, /\\if :prod01_home_ok[\s\S]*\\quit 43/);
  assert.doesNotMatch(source, /meteo_restore_test/);
  assert.doesNotMatch(source,
    /^\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|TRUNCATE|MERGE|CALL|SELECT\s+(?:setval|nextval))\b/gmi);
});

test('collector wrapper rejects meteo before invoking docker', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prod01-pre-target-'));
  t.after(() => fs.rmSync(dir, {recursive:true,force:true}));
  const bin = path.join(dir, 'bin');
  const called = path.join(dir, 'docker-called');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'docker'), `#!/bin/sh\ntouch "$DOCKER_CALLED"\nexit 99\n`, {mode:0o755});
  const result = spawnSync(WRAPPER_PATH, [], {encoding:'utf8',env:{
    ...process.env,
    PATH:`${bin}:${process.env.PATH}`,
    DOCKER_CALLED:called,
    TARGET_DB:'meteo',
    PROD01_PG_CONTAINER:'disposable-only',
    PROD01_PG_USER:'meteo',
    PROD01_EVIDENCE_DIR:path.join(dir, 'evidence'),
  }});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Forbidden PROD-01 target: meteo/);
  assert.equal(fs.existsSync(called), false);
});

test('collector wrapper accepts a valid target and reaches only the injected docker double', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prod01-pre-valid-'));
  t.after(() => fs.rmSync(dir, {recursive:true,force:true}));
  const bin = path.join(dir, 'bin');
  const called = path.join(dir, 'docker-called');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'docker'), `#!/bin/sh\ntouch "$DOCKER_CALLED"\nexit 99\n`, {mode:0o755});
  const result = spawnSync(WRAPPER_PATH, [], {encoding:'utf8',env:{
    ...process.env,
    PATH:`${bin}:${process.env.PATH}`,
    DOCKER_CALLED:called,
    TARGET_DB:TARGET,
    PROD01_PG_CONTAINER:'disposable-only',
    PROD01_PG_USER:'meteo',
    PROD01_EVIDENCE_DIR:path.join(dir, 'evidence'),
  }});
  assert.equal(result.status, 99);
  assert.equal(fs.existsSync(called), true);
  assert.equal(fs.existsSync(path.join(dir, 'evidence/PRE-CUTOVER.json')), false);
});
