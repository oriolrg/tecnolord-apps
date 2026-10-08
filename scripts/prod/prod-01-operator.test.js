'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '../..');
const OPERATOR = path.join(ROOT, 'scripts/prod/prod-01-operator.sh');
const READINESS = path.join(ROOT, 'scripts/prod/prod-01-readiness.sh');
const RUNTIME = path.join(ROOT, 'scripts/prod/prod-01-runtime.sh');
const PRE_CUTOVER_WRAPPER = path.join(ROOT, 'scripts/prod/prod-01-precutover.sh');
const POSTFLIGHT = path.join(ROOT, 'scripts/prod/prod-01-postflight.sql');

function assertDatabaseDelta(before, after, target = 'meteo_prod_dryrun_20261003_175050') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prod01-database-delta-'));
  const beforeFile = path.join(dir, 'before.txt');
  const afterFile = path.join(dir, 'after.txt');
  fs.writeFileSync(beforeFile, `${before.join('\n')}\n`);
  fs.writeFileSync(afterFile, `${after.join('\n')}\n`);
  const result = spawnSync('bash', [
    '-c', 'source "$1"; prod01_assert_database_delta "$2" "$3" "$4"',
    'prod01-database-delta-test', RUNTIME, beforeFile, afterFile, target,
  ], {encoding:'utf8'});
  fs.rmSync(dir, {recursive:true,force:true});
  return result;
}

test('operator uses an independent networkless container and never mounts production storage', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  assert.match(source, /--network none/);
  assert.match(source, /docker volume create/);
  assert.match(source, /target=\/var\/lib\/postgresql\/data/);
  assert.match(source, /target=\/var\/run\/postgresql/);
  assert.match(source, /target=\/pr02\/pr02\.dump,readonly/);
  assert.match(source, /tecnolord-apps_pgdata/);
  assert.doesNotMatch(source, /--publish|--volumes-from|docker compose|docker-compose/);
  assert.doesNotMatch(source, /docker (?:container )?rm|docker volume rm|docker system prune|docker volume prune/);
});

test('operator target is derived exclusively from the timestamped historical run id', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  assert.match(source, /PROD01_TARGET="meteo_prod_dryrun_\$\{PROD01_RUN_ID\}"/);
  assert.match(source, /\^meteo_prod_dryrun_\[0-9\]\{8\}_\[0-9\]\{6\}\$/);
  assert.doesNotMatch(source, /TARGET_DB="?meteo"?(?:\s|$)/m);
  assert.doesNotMatch(source, /--production|ALLOW_PRODUCTION|PRODUCTION_CONFIRM_TARGET/);
});

test('production inventory is explicitly read-only and connects only to postgres', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  const fn = source.slice(source.indexOf('production_database_inventory()'),
    source.indexOf('disposable_psql()'));
  assert.match(fn, /--dbname=postgres/);
  assert.match(fn, /BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY/);
  assert.match(fn, /transaction_read_only/);
  assert.doesNotMatch(fn, /--dbname=(?:meteo|meteo_restore_test|meteo_beta)/);
  assert.doesNotMatch(fn, /^\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|TRUNCATE)\b/gmi);
});

test('operator contains the complete ordered gate and evidence contract', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  const evidenceSource = `${source}\n${fs.readFileSync(PRE_CUTOVER_WRAPPER, 'utf8')}`;
  const orderedStages = [
    "stage='backup-verification'",
    "stage='socket-runtime-create'",
    "stage='disposable-environment-create'",
    "stage='disposable-postgres-final-readiness'",
    "stage='target-create'",
    "stage='restore'",
    "stage='pre-cutover'",
    "stage='apply'",
    "stage='verify'",
    "stage='postflight'",
    "stage='directed-unit-http-security-tests'",
    "stage='final-safety-gate'",
  ];
  let previous = -1;
  for (const stage of orderedStages) {
    const index = source.indexOf(stage);
    assert.ok(index > previous, `${stage} is missing or out of order`);
    previous = index;
  }
  for (const evidence of [
    'backup.sha256', 'backup-toc.txt', 'environment.txt', 'readiness.log',
    'socket-path.txt', 'restore.log',
    'PRE-CUTOVER.json', 'PRE.json', 'POST.json', 'VERIFY.json',
    'postflight.txt', 'test-summary.txt',
    'PRODUCTION-SAFETY.txt', 'source-sha256.txt', 'manifest-sha256.txt',
    'EVIDENCE-SHA256SUMS.txt',
  ]) assert.match(evidenceSource, new RegExp(evidence.replaceAll('.', '\\.')));
});

test('socket guard rejects the failed long pathname and accepts the short v3 pathname', () => {
  const longPath = '/home/deploy/prod01-operator-bundle-v2-20261003T075956Z/artifacts/prod-01/20261003_080833/postgres-socket/.s.PGSQL.5432';
  const shortPath = '/home/deploy/prod01-sockets/20261003_081500/.s.PGSQL.5432';
  const invoke = (socketPath) => spawnSync('bash', [
    '-c', 'source "$1"; prod01_assert_socket_path "$2"',
    'prod01-socket-test', RUNTIME, socketPath,
  ], {encoding:'utf8'});

  const rejected = invoke(longPath);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /PROD01_SOCKET_PATH_REJECTED/);
  assert.ok(Buffer.byteLength(longPath) > 100);

  const accepted = invoke(shortPath);
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.match(accepted.stdout, /PROD01_SOCKET_PATH_ACCEPTED/);
  assert.ok(Buffer.byteLength(shortPath) <= 100);
});

test('APPLY and VERIFY use the same short socket path outside evidence', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  const apply = source.slice(source.indexOf("stage='apply'"), source.indexOf("stage='verify'"));
  const verify = source.slice(source.indexOf("stage='verify'"), source.indexOf("stage='postflight'"));
  assert.match(source, /PROD01_SOCKET_ROOT='\/home\/deploy\/prod01-sockets'/);
  assert.match(source, /PROD01_SOCKET_FILE="\$\{PROD01_SOCKET_DIR\}\/\.s\.PGSQL\.5432"/);
  assert.match(apply, /POSTGRES_HOST="\$\{PROD01_SOCKET_DIR\}"/);
  assert.match(verify, /POSTGRES_HOST="\$\{PROD01_SOCKET_DIR\}"/);
  assert.doesNotMatch(source, /PROD01_SOCKET_DIR="\$\{PROD01_OUT\}/);
  assert.ok(source.indexOf('prod01_assert_socket_path') < source.indexOf("stage='disposable-environment-create'"));
});

test('final safety accepts the real disposable baseline plus the exact target', () => {
  const target = 'meteo_prod_dryrun_20261003_175050';
  const result = assertDatabaseDelta(
    ['postgres', 'template_postgis'],
    [target, 'postgres', 'template_postgis'].sort(),
    target,
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /PROD01_DATABASE_DELTA_PASS/);
});

test('final safety rejects an unexpected extra disposable database', () => {
  const target = 'meteo_prod_dryrun_20261003_175050';
  const result = assertDatabaseDelta(
    ['postgres', 'template_postgis'],
    [target, 'postgres', 'rogue_database', 'template_postgis'].sort(),
    target,
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /after-not-baseline-plus-target/);
});

test('final safety rejects a database missing from the disposable baseline', () => {
  const target = 'meteo_prod_dryrun_20261003_175050';
  const result = assertDatabaseDelta(
    ['postgres', 'template_postgis'],
    [target, 'postgres'].sort(),
    target,
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /after-not-baseline-plus-target/);
});

test('final safety rejects a target different from PROD01_TARGET', () => {
  const target = 'meteo_prod_dryrun_20261003_175050';
  const result = assertDatabaseDelta(
    ['postgres', 'template_postgis'],
    ['meteo_prod_dryrun_20261003_175051', 'postgres', 'template_postgis'].sort(),
    target,
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /after-not-baseline-plus-target/);
});

test('BEFORE and AFTER use the same disposable inventory query and filters', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  const functionStart = source.indexOf('disposable_database_inventory()');
  const functionEnd = source.indexOf("stage='local-prerequisites'", functionStart);
  const inventoryFunction = source.slice(functionStart, functionEnd);
  assert.ok(functionStart >= 0 && functionEnd > functionStart);
  assert.match(inventoryFunction, /FROM pg_database/);
  assert.match(inventoryFunction, /WHERE datallowconn/);
  assert.match(inventoryFunction, /datname NOT IN \('template0', 'template1'\)/);
  assert.match(inventoryFunction, /ORDER BY datname/);

  const invocations = [...source.matchAll(/^disposable_database_inventory >/gm)]
    .map((match) => source.slice(match.index, source.indexOf('\n', match.index)));
  assert.deepEqual(invocations, [
    'disposable_database_inventory >"${PROD01_OUT}/disposable-databases-before.txt"',
    'disposable_database_inventory >"${PROD01_OUT}/disposable-databases-after.txt"',
  ]);
  assert.equal((source.match(/SELECT datname\nFROM pg_database\nWHERE datallowconn/g) || []).length, 2,
    'one disposable query and one production read-only inventory query are expected');
});

test('readiness ignores temporary ready, survives shutdown and accepts stable final postgres', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prod01-readiness-'));
  t.after(() => fs.rmSync(dir, {recursive:true,force:true}));
  const docker = path.join(dir, 'docker-double');
  const state = path.join(dir, 'attempt');
  const log = path.join(dir, 'events');
  fs.writeFileSync(state, '0\n');
  fs.writeFileSync(docker, [
    '#!/usr/bin/env bash',
    'set -eu',
    'if [[ "$1" == inspect ]]; then',
    '  n=$(( $(cat "$READINESS_STATE") + 1 ))',
    '  printf "%s\\n" "$n" >"$READINESS_STATE"',
    '  printf "running\\n"',
    '  exit 0',
    'fi',
    '[[ "$1" == exec ]]',
    'shift 2',
    'n=$(cat "$READINESS_STATE")',
    'case "$1" in',
    '  pg_isready)',
    '    printf "%s:pg_isready\\n" "$n" >>"$READINESS_LOG"',
    '    [[ "$n" != 2 ]]',
    '    ;;',
    '  sh)',
    '    printf "%s:pid1\\n" "$n" >>"$READINESS_LOG"',
    '    [[ "$n" -ge 3 ]]',
    '    ;;',
    '  psql)',
    '    printf "%s:sql\\n" "$n" >>"$READINESS_LOG"',
    '    printf "t\\n"',
    '    ;;',
    '  *) exit 90 ;;',
    'esac',
  ].join('\n') + '\n', {mode:0o755});

  const result = spawnSync('bash', [
    '-c', 'source "$1"; prod01_wait_for_final_postgres dryrun-db meteo',
    'prod01-readiness-test', READINESS,
  ], {encoding:'utf8',env:{
    ...process.env,
    PROD01_DOCKER_BIN:docker,
    PROD01_READINESS_MAX_ATTEMPTS:'6',
    PROD01_READINESS_SLEEP_SECONDS:'0',
    READINESS_STATE:state,
    READINESS_LOG:log,
  }});

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /attempt=1 phase=temporary-postmaster/);
  assert.match(result.stdout, /attempt=2 phase=postgres-unavailable/);
  assert.match(result.stdout, /attempt=3 stable=1\/2/);
  assert.match(result.stdout, /attempt=4 stable=2\/2/);
  assert.match(result.stdout, /PROD01_FINAL_POSTGRES_READY/);
  assert.equal(fs.readFileSync(log, 'utf8'), [
    '1:pg_isready', '1:pid1',
    '2:pg_isready',
    '3:pg_isready', '3:pid1', '3:sql',
    '4:pg_isready', '4:pid1', '4:sql',
    '',
  ].join('\n'));
});

test('operator delegates readiness to the final-postmaster gate instead of pg_isready loop', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  assert.match(source, /source .*prod-01-readiness\.sh/);
  assert.match(source, /prod01_wait_for_final_postgres/);
  assert.doesNotMatch(source, /for attempt in \$\(seq 1 60\)/);
});

test('operator creates no database other than the timestamped historical target', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  const creates = [...source.matchAll(/\bcreatedb\b/g)];
  assert.equal(creates.length, 1);
  assert.match(source, /createdb[\s\S]*"\$\{PROD01_TARGET\}"/);
  assert.match(source, /--template=template0/);
  assert.match(source, /--encoding=UTF8/);
  assert.match(source, /--lc-collate=en_US\.utf8/);
  assert.match(source, /--lc-ctype=en_US\.utf8/);
  assert.doesNotMatch(source, /test:integration|meteolord_test_/);
});

test('operator rejects an invalid run id before invoking docker', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prod01-operator-target-'));
  t.after(() => fs.rmSync(dir, {recursive:true,force:true}));
  const bin = path.join(dir, 'bin');
  const called = path.join(dir, 'docker-called');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'docker'), `#!/bin/sh\ntouch "$DOCKER_CALLED"\nexit 99\n`, {mode:0o755});
  const result = spawnSync(OPERATOR, [], {encoding:'utf8',env:{
    ...process.env,
    PATH:`${bin}:${process.env.PATH}`,
    DOCKER_CALLED:called,
    PROD01_RUN_ID:'invalid',
    PROD01_OUT:path.join(dir, 'evidence'),
  }});
  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(called), false);
  assert.equal(fs.existsSync(path.join(dir, 'evidence')), false);
});

test('postflight is read-only and fails closed on target, PostGIS, RC, home and legacy data', () => {
  const source = fs.readFileSync(POSTFLIGHT, 'utf8');
  assert.match(source, /BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY/);
  assert.match(source, /current_database\(\) = :'expected_target'/);
  assert.match(source, /postgis_missing_or_wrong_schema/);
  assert.match(source, /rc_relations_missing/);
  assert.match(source, /rc_columns_missing/);
  assert.match(source, /home_contract_differs/);
  assert.match(source, /optional_or_invented_data_present/);
  assert.match(source, /legacy_counts_or_ranges_differ/);
  assert.match(source, /PROD01_POSTFLIGHT_V1_PASS/);
  assert.doesNotMatch(source,
    /^\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|TRUNCATE|MERGE|CALL|SELECT\s+(?:setval|nextval))\b/gmi);
});

test('operator contains no remote-access command', () => {
  const source = fs.readFileSync(OPERATOR, 'utf8');
  assert.doesNotMatch(source, /(^|[;&|]\s*)(?:ssh|scp|rsync)\s/m);
});
