#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { collectManifest, compareManifests, specsFromManifest } = require('./manifest');

const ROOT = path.resolve(__dirname, '../..');
const MIGRATIONS = path.join(ROOT, 'backend/db/migrations');
const PROD_MIGRATIONS = path.join(ROOT, 'backend/db/prod-migrations');
const SQL_FILES = [
  ['0003-ue-identity-catalog.sql', MIGRATIONS],
  ['0004-ue-station-metadata.sql', MIGRATIONS],
  ['0005-ue-map-publication.sql', MIGRATIONS],
  ['0007-ue-station-history-policies.sql', MIGRATIONS],
  ['forecast-compatibility.sql', PROD_MIGRATIONS],
  ['home-public.sql', PROD_MIGRATIONS],
];
const DRY_RUN = /^meteo_prod_dryrun_[0-9]{8}_[0-9]{6}$/;
const PROD01_ADVISORY_LOCK_KEY = Object.freeze([71010, 101]);
const RC_TABLES = [
  'auth.credentials', 'auth.sessions', 'auth.account_tokens', 'auth.user_preferences',
  'meteo.station_locations', 'meteo.station_connectors', 'meteo.connector_secrets',
  'meteo.source_bindings', 'meteo.current_snapshots', 'meteo.estimation_points',
  'meteo.public_view_config', 'meteo.import_batches', 'meteo.import_rows',
  'meteo.manual_overrides', 'meteo.audit_events', 'meteo.map_catalog_state',
  'meteo.station_history_policies', 'meteo.history_capture_runs',
];
const LEGACY_TABLES = [
  'auth.usuaris', 'auth.aplicacions', 'auth.membres_app', 'meteo.membres_estacio', 'meteo.estacions', 'meteo.mesures', 'meteo.mesures_bak_ytd',
  'meteo.estacions_hidro', 'meteo.lectures_hidro', 'meteo.forecast_run',
  'meteo.forecast_hourly', 'public.measurement', 'biblioteca._prisma_migrations',
];

function assertTarget(target) {
  if (!target) throw new Error('TARGET_DB is required');
  if (!DRY_RUN.test(target)) throw new Error(`Forbidden PROD-01 target: ${target}`);
  return target;
}

function parseArgs(argv, environment = process.env) {
  const command = argv[0];
  if (!['--apply','--verify'].includes(command)) throw new Error('Use --apply or --verify');
  const options = { command, target: environment.TARGET_DB };
  for (let i=1; i<argv.length; i+=1) {
    if (argv[i] === '--out-dir' || argv[i] === '--pre') {
      const key = argv[i] === '--out-dir' ? 'outDir' : 'prePath';
      options[key] = argv[++i];
      if (!options[key]) throw new Error(`${key} path is required`);
    } else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  assertTarget(options.target);
  if (!options.outDir || (command === '--verify' && !options.prePath)) throw new Error('Output directory and VERIFY PRE path are required');
  return options;
}

function connectionConfig(environment, target) {
  for (const name of ['POSTGRES_HOST','POSTGRES_PORT','POSTGRES_USER','POSTGRES_PASSWORD']) {
    if (!environment[name]) throw new Error(`${name} is required`);
  }
  const port = Number(environment.POSTGRES_PORT);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('Invalid POSTGRES_PORT');
  return { host: environment.POSTGRES_HOST, port, user: environment.POSTGRES_USER,
    password: environment.POSTGRES_PASSWORD, database: target, connectionTimeoutMillis: 5000 };
}

async function guardConnection(client, target) {
  const result = await client.query('SELECT current_database() AS database');
  if (result.rows[0]?.database !== target) throw new Error('current_database() target guard failed');
}

async function readSqlFiles() {
  const pins = JSON.parse(await fs.readFile(path.join(PROD_MIGRATIONS, 'sha256.json'), 'utf8'));
  const result = [];
  for (const [name, directory] of SQL_FILES) {
    const source = path.join(directory, name);
    const content = await fs.readFile(source, 'utf8');
    const relative = path.relative(ROOT, source);
    const digest = crypto.createHash('sha256').update(content).digest('hex');
    if (pins[relative] !== digest) throw new Error(`Migration source checksum mismatch: ${relative}`);
    result.push({ relative, content });
  }
  if (Object.keys(pins).length !== result.length) throw new Error('Migration source manifest contains unexpected files');
  return result;
}

async function requireLegacy(client) {
  for (const name of LEGACY_TABLES) {
    const result = await client.query('SELECT to_regclass($1) AS object', [name]);
    if (!result.rows[0]?.object) throw new Error(`Missing legacy table: ${name}`);
  }
  for (const name of RC_TABLES) {
    const result = await client.query('SELECT to_regclass($1) AS object', [name]);
    if (result.rows[0]?.object) throw new Error(`RC object already exists: ${name}; refusing re-execution`);
  }
  const postgis = await client.query("SELECT installed_version,default_version FROM pg_available_extensions WHERE name='postgis'");
  if (postgis.rowCount !== 1 || !postgis.rows[0].default_version) throw new Error('PostGIS is not available');
  if (postgis.rows[0].installed_version) throw new Error('PostGIS already installed in legacy target');
  const home = await client.query(`SELECT id,codi,nom,proveidor,activa,latitud,longitud,altitud_m FROM meteo.estacions WHERE id=1`);
  const row = home.rows[0];
  if (home.rowCount !== 1 || row.codi !== 'home' || row.nom !== 'Casa'
      || row.proveidor !== 'ecowitt' || row.activa !== true
      || row.latitud !== null || row.longitud !== null || row.altitud_m !== null) {
    throw new Error('Legacy home station contract differs');
  }
  const invalidForecast = await client.query(`
    SELECT EXISTS (SELECT 1 FROM meteo.forecast_run r
      WHERE NOT EXISTS (SELECT 1 FROM meteo.estacions e WHERE e.codi=r.station_code)
        OR r.hours NOT BETWEEN 1 AND 48) AS invalid`);
  if (invalidForecast.rows[0]?.invalid !== false) throw new Error('Forecast rows violate RC constraints');
  const forbiddenColumns = await client.query(`
    SELECT table_schema,table_name,column_name FROM information_schema.columns
    WHERE (table_schema='auth' AND table_name='usuaris' AND column_name IN
      ('account_status','application_role','email_verified_at','approved_at'))
       OR (table_schema='meteo' AND table_name='estacions' AND column_name IN
      ('public_id','owner_id','management_kind','lifecycle','visibility','revision','description'))`);
  if (forbiddenColumns.rowCount) throw new Error('RC columns already exist; refusing re-execution');
}

async function requirePostflight(client) {
  for (const name of RC_TABLES) {
    const result = await client.query('SELECT to_regclass($1) AS object', [name]);
    if (!result.rows[0]?.object) throw new Error(`RC table missing after migration: ${name}`);
  }
  const home = await client.query(`
    SELECT e.id,e.codi,e.nom,e.proveidor,e.activa,e.latitud,e.longitud,e.altitud_m,
      e.management_kind,e.lifecycle,e.visibility,e.owner_id,
      c.public_station_id
    FROM meteo.estacions e CROSS JOIN meteo.public_view_config c
    WHERE e.id=1 AND c.id=1`);
  const row = home.rows[0];
  if (home.rowCount !== 1 || row.codi !== 'home' || row.nom !== 'Casa'
      || row.proveidor !== 'ecowitt' || row.activa !== true
      || row.latitud !== null || row.longitud !== null || row.altitud_m !== null
      || row.management_kind !== 'LEGACY' || row.lifecycle !== 'ACTIVE'
      || row.visibility !== 'PUBLIC' || row.owner_id !== null
      || row.public_station_id !== 1) throw new Error('Public home postflight failed');
  const empty = await client.query(`
    SELECT (SELECT count(*) FROM meteo.station_locations) AS locations,
      (SELECT count(*) FROM meteo.station_connectors) AS connectors,
      (SELECT count(*) FROM meteo.connector_secrets) AS secrets,
      (SELECT count(*) FROM meteo.source_bindings) AS bindings,
      (SELECT count(*) FROM meteo.current_snapshots) AS snapshots,
      (SELECT count(*) FROM meteo.station_history_policies) AS policies,
      (SELECT count(*) FROM meteo.history_capture_runs) AS history_runs,
      (SELECT count(*) FROM meteo.estimation_points) AS estimates,
      (SELECT count(*) FROM auth.credentials) AS credentials,
      (SELECT count(*) FROM auth.sessions) AS sessions,
      (SELECT count(*) FROM auth.account_tokens) AS account_tokens`);
  if (Object.values(empty.rows[0]).some((value) => Number(value) !== 0)) throw new Error('Optional RC data was unexpectedly created');
  const forecast = await client.query(`
    SELECT
      EXISTS (SELECT 1 FROM pg_constraint co WHERE co.conrelid='meteo.forecast_run'::regclass
        AND co.confrelid='meteo.estacions'::regclass AND co.contype='f' AND co.confdeltype='a'
        AND co.conkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=co.conrelid AND attname='station_code')]::smallint[]
        AND co.confkey=ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=co.confrelid AND attname='codi')]::smallint[]) AS station_fk,
      EXISTS (SELECT 1 FROM pg_constraint co WHERE co.conrelid='meteo.forecast_run'::regclass
        AND co.contype='c' AND pg_get_expr(co.conbin,co.conrelid) ~ 'hours[[:space:]]*>=[[:space:]]*1'
        AND pg_get_expr(co.conbin,co.conrelid) ~ 'hours[[:space:]]*<=[[:space:]]*48') AS hours_check,
      EXISTS (SELECT 1 FROM pg_index ix WHERE ix.indrelid='meteo.forecast_run'::regclass
        AND pg_get_indexdef(ix.indexrelid) LIKE '%(station_code, source, model, issued_at DESC)%') AS lookup_index`);
  if (Object.values(forecast.rows[0]).some((value) => value !== true)) throw new Error('Forecast RC objects missing');
  const singletons = await client.query(`SELECT
    (SELECT count(*) FROM meteo.public_view_config) AS public_view,
    (SELECT count(*) FROM meteo.map_catalog_state) AS map_state`);
  if (Number(singletons.rows[0].public_view) !== 1 || Number(singletons.rows[0].map_state) !== 1)
    throw new Error('RC singleton state differs');
  const extension = await client.query("SELECT extnamespace::regnamespace::text AS schema FROM pg_extension WHERE extname='postgis'");
  if (extension.rowCount !== 1 || extension.rows[0].schema !== 'public') throw new Error('PostGIS location postflight failed');
}

async function writeEvidence(dir, file, data, { exclusive = true } = {}) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir,file), JSON.stringify(data,null,2)+'\n', { flag: exclusive ? 'wx' : 'w' });
}

async function apply(client, options) {
  await guardConnection(client, options.target);
  const sources = await readSqlFiles();
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
  let committed = false;
  try {
    const lock = await client.query('SELECT pg_try_advisory_xact_lock($1,$2) AS acquired', PROD01_ADVISORY_LOCK_KEY);
    if (lock.rows[0]?.acquired !== true) throw new Error('PROD-01 advisory transaction lock unavailable');
    await client.query("SET LOCAL lock_timeout='3s'");
    await client.query("SET LOCAL statement_timeout='120s'");
    await guardConnection(client, options.target);
    await requireLegacy(client);
    const pre = await collectManifest(client, options.target);
    await writeEvidence(options.outDir, 'PRE.json', pre);
    for (const source of sources) {
      await guardConnection(client, options.target);
      await client.query(source.content);
    }
    await guardConnection(client, options.target);
    await requirePostflight(client);
    const post = await collectManifest(client, options.target, specsFromManifest(pre));
    compareManifests(pre, post);
    await writeEvidence(options.outDir, 'POST.pending.json', post);
    await client.query('COMMIT');
    committed = true;
    await fs.rename(path.join(options.outDir, 'POST.pending.json'), path.join(options.outDir, 'POST.json'));
    return { status: 'PASS', target: options.target, applied: sources.map((source) => source.relative) };
  } catch (error) {
    if (!committed) await client.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

async function verify(client, options) {
  await guardConnection(client, options.target);
  const pre = JSON.parse(await fs.readFile(options.prePath, 'utf8'));
  if (pre.version !== 1 || pre.target !== options.target) throw new Error('PRE artifact target/version mismatch');
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    await guardConnection(client, options.target);
    await requirePostflight(client);
    const post = await collectManifest(client, options.target, specsFromManifest(pre));
    compareManifests(pre, post);
    await writeEvidence(options.outDir, 'VERIFY.json', post);
    await client.query('COMMIT');
    return { status: 'PASS', target: options.target, verification: 'PRE_POST_IDENTICAL' };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

async function main(argv = process.argv.slice(2), environment = process.env) {
  const options = parseArgs(argv, environment);
  const config = connectionConfig(environment, options.target);
  const { Client } = require(require.resolve('pg', { paths: [path.join(ROOT,'backend')] }));
  const client = new Client(config);
  await client.connect();
  try {
    const result = options.command === '--apply' ? await apply(client, options) : await verify(client, options);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } finally {
    await client.end();
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`PROD-01 FAIL: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { assertTarget, parseArgs, connectionConfig, guardConnection, readSqlFiles,
  requireLegacy, requirePostflight, apply, verify, main, SQL_FILES };
