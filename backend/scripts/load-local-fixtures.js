#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const FIXTURE_LOCK = Object.freeze([71010, 2]);
const DEFAULT_FIXTURE_DIRECTORY = path.resolve(__dirname, '../test/fixtures');
const FIXTURE_FILES = Object.freeze(['meteo.json', 'hidro.json', 'forecast.json']);
const REQUIRED_MIGRATIONS = Object.freeze([
  '0001-current-runtime.sql',
  '0002-current-forecast.sql',
]);
const REQUIRED_RELATIONS = Object.freeze([
  'auth.usuaris',
  'meteo.estacions',
  'meteo.membres_estacio',
  'meteo.mesures',
  'meteo.estacions_hidro',
  'meteo.lectures_hidro',
  'meteo.forecast_run',
  'meteo.forecast_hourly',
]);
const SYNTHETIC_ADMIN = Object.freeze({
  email: 'synthetic-admin@example.invalid',
  name: 'Synthetic Admin',
});

class SafeFixtureError extends Error {}

function getClientConstructor() {
  return require('pg').Client;
}

function requiredValue(environment, primaryName, fallbackName) {
  const value = environment[primaryName] ?? environment[fallbackName];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SafeFixtureError(`Missing required database setting: ${primaryName}`);
  }
  return value.trim();
}

function loadConfig(environment = process.env) {
  const mode = requiredValue(environment, 'METEOLORD_ENV');
  if (!['local', 'test'].includes(mode)) {
    throw new SafeFixtureError('METEOLORD_ENV must be local or test');
  }

  const host = requiredValue(environment, 'POSTGRES_HOST', 'DB_HOST');
  const allowedHosts = mode === 'test' ? ['db', 'localhost', '127.0.0.1'] : ['db'];
  if (!allowedHosts.includes(host)) {
    throw new SafeFixtureError('Database host is not allowed for fixture loading');
  }

  const user = requiredValue(environment, 'POSTGRES_USER', 'DB_USER');
  const database = requiredValue(environment, 'POSTGRES_DB', 'DB_NAME');
  const password = requiredValue(environment, 'POSTGRES_PASSWORD', 'DB_PASSWORD');
  const portText = requiredValue(environment, 'POSTGRES_PORT', 'DB_PORT');
  const identifierPattern = /^[a-z_][a-z0-9_]{0,62}$/;
  if (!identifierPattern.test(user) || !identifierPattern.test(database)) {
    throw new SafeFixtureError('Database user and name must be safe PostgreSQL identifiers');
  }
  if (mode === 'local' && database !== 'meteolord_local') {
    throw new SafeFixtureError('Local fixture loading requires the allowlisted local database');
  }
  if (mode === 'test' && !/^meteolord_test_[a-z0-9_]{1,48}$/.test(database)) {
    throw new SafeFixtureError('Test fixture loading requires an allowlisted test database');
  }

  if (!/^[0-9]{1,5}$/.test(portText)) {
    throw new SafeFixtureError('Database port is invalid');
  }
  const port = Number(portText);
  if (port < 1 || port > 65535) {
    throw new SafeFixtureError('Database port is invalid');
  }

  return Object.freeze({ mode, host, port, user, password, database });
}

function checksum(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex');
}

function assertSyntheticDocument(document, fileName) {
  if (!document || document.synthetic !== true || document.origin !== 'generated-for-tests') {
    throw new SafeFixtureError(`Fixture ${fileName} is not marked as synthetic test data`);
  }
}

function parseDocument(contents, fileName) {
  try {
    const document = JSON.parse(contents.toString('utf8'));
    assertSyntheticDocument(document, fileName);
    return document;
  } catch (error) {
    if (error instanceof SafeFixtureError) throw error;
    throw new SafeFixtureError(`Fixture ${fileName} is not valid JSON`);
  }
}

async function loadFixtureDocuments({
  fixtureDirectory = DEFAULT_FIXTURE_DIRECTORY,
  readFile = fs.readFile,
} = {}) {
  const manifestName = 'manifest.json';
  const manifestContents = await readFile(path.join(fixtureDirectory, manifestName));
  const manifest = parseDocument(manifestContents, manifestName);
  const manifestFiles = new Set(manifest.files || []);

  const documents = { manifest };
  for (const fileName of FIXTURE_FILES) {
    if (!manifestFiles.has(fileName) || !/^[0-9a-f]{64}$/.test(manifest.sha256?.[fileName] || '')) {
      throw new SafeFixtureError(`Fixture manifest does not authorize ${fileName}`);
    }
    const contents = await readFile(path.join(fixtureDirectory, fileName));
    if (checksum(contents) !== manifest.sha256[fileName]) {
      throw new SafeFixtureError(`Fixture checksum mismatch for ${fileName}`);
    }
    documents[path.basename(fileName, '.json')] = parseDocument(contents, fileName);
  }

  if (!Array.isArray(documents.meteo.estacions)
      || !Array.isArray(documents.hidro.estacions)
      || !Array.isArray(documents.forecast.runs)) {
    throw new SafeFixtureError('Fixture documents do not match the expected schema');
  }
  return documents;
}

async function assertMigrated(client) {
  const metadata = await client.query(
    "SELECT to_regclass('meteo_local.schema_migrations') AS relation"
  );
  if (metadata.rows[0].relation !== 'meteo_local.schema_migrations') {
    throw new SafeFixtureError('Database is not migrated: schema_migrations is missing');
  }

  const applied = await client.query(
    'SELECT version FROM meteo_local.schema_migrations WHERE version = ANY($1::text[])',
    [REQUIRED_MIGRATIONS]
  );
  const appliedVersions = new Set(applied.rows.map((row) => row.version));
  if (REQUIRED_MIGRATIONS.some((version) => !appliedVersions.has(version))) {
    throw new SafeFixtureError('Database is not migrated to the required fixture schema');
  }

  for (const relation of REQUIRED_RELATIONS) {
    const result = await client.query('SELECT to_regclass($1) AS relation', [relation]);
    if (result.rows[0].relation !== relation) {
      throw new SafeFixtureError('Database is missing a required migrated relation');
    }
  }
}

function placeholders(length) {
  return Array.from({ length }, (_, index) => `$${index + 1}`).join(', ');
}

async function insertRow(client, table, columns, values) {
  const result = await client.query(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders(values.length)}) ON CONFLICT DO NOTHING`,
    values
  );
  return result.rowCount;
}

async function selectId(client, table, column, value) {
  const result = await client.query(
    `SELECT id FROM ${table} WHERE ${column} = $1`,
    [value]
  );
  if (result.rowCount !== 1) {
    throw new SafeFixtureError('Fixture parent row could not be resolved');
  }
  return result.rows[0].id;
}

async function loadMeteo(client, fixture, counts) {
  counts['auth.usuaris'] += await insertRow(
    client,
    'auth.usuaris',
    ['email', 'nom', 'actiu'],
    [SYNTHETIC_ADMIN.email, SYNTHETIC_ADMIN.name, true]
  );
  const userId = await selectId(client, 'auth.usuaris', 'email', SYNTHETIC_ADMIN.email);

  const measureColumns = [
    'estacio_id', 'instant', 'temp_c', 'sensacio_c', 'punt_rosada_c', 'humitat_pct',
    'solar_wm2', 'uvi', 'taxa_pluja_mm_h', 'pluja_diaria_mm', 'pluja_event_mm',
    'pluja_hora_mm', 'pluja_setmana_mm', 'pluja_mes_mm', 'pluja_any_mm', 'vent_ms',
    'vent_rafega_ms', 'vent_direccio_graus', 'pressio_rel_hpa', 'pressio_abs_hpa',
    'bateria_pct', 'extres',
  ];

  for (const station of fixture.estacions) {
    counts['meteo.estacions'] += await insertRow(
      client,
      'meteo.estacions',
      ['codi', 'nom', 'creat_per_usuari'],
      [station.codi, station.nom, userId]
    );
    const stationId = await selectId(client, 'meteo.estacions', 'codi', station.codi);
    counts['meteo.membres_estacio'] += await insertRow(
      client,
      'meteo.membres_estacio',
      ['usuari_id', 'estacio_id', 'rol'],
      [userId, stationId, 'propietari']
    );

    for (const observation of station.observacions || []) {
      const values = [
        stationId, observation.instant, observation.temp_c, observation.sensacio_c,
        observation.punt_rosada_c, observation.humitat_pct, observation.solar_wm2,
        observation.uvi, observation.taxa_pluja_mm_h, observation.pluja_diaria_mm,
        observation.pluja_event_mm, observation.pluja_hora_mm, observation.pluja_setmana_mm,
        observation.pluja_mes_mm, observation.pluja_any_mm, observation.vent_ms,
        observation.vent_rafega_ms, observation.vent_direccio_graus,
        observation.pressio_rel_hpa, observation.pressio_abs_hpa,
        observation.bateria_pct, observation.extres || null,
      ];
      counts['meteo.mesures'] += await insertRow(
        client,
        'meteo.mesures',
        measureColumns,
        values.map((value) => value === undefined ? null : value)
      );
    }
  }
}

async function loadHidro(client, fixture, counts) {
  for (const station of fixture.estacions) {
    counts['meteo.estacions_hidro'] += await insertRow(
      client,
      'meteo.estacions_hidro',
      ['codi', 'nom', 'tipus', 'activa'],
      [station.codi, station.nom, station.tipus, station.activa]
    );
    const stationId = await selectId(client, 'meteo.estacions_hidro', 'codi', station.codi);
    for (const reading of station.lectures || []) {
      counts['meteo.lectures_hidro'] += await insertRow(
        client,
        'meteo.lectures_hidro',
        ['estacio_id', 'instant', 'cabal_m3s', 'capacitat_pct', 'nivell_m', 'extres'],
        [
          stationId,
          reading.instant,
          reading.cabal_m3s ?? null,
          reading.capacitat_pct ?? null,
          reading.nivell_m ?? null,
          reading.extres || null,
        ]
      );
    }
  }
}

async function loadForecast(client, fixture, counts) {
  for (const run of fixture.runs) {
    counts['meteo.forecast_run'] += await insertRow(
      client,
      'meteo.forecast_run',
      ['id', 'source', 'model', 'station_code', 'issued_at', 'hours'],
      [run.run_id, run.source, run.model, run.station_code, run.issued_at, run.hours]
    );
    const runResult = await client.query(
      'SELECT id FROM meteo.forecast_run WHERE source = $1 AND model = $2 AND station_code = $3 AND issued_at = $4',
      [run.source, run.model, run.station_code, run.issued_at]
    );
    if (runResult.rowCount !== 1) {
      throw new SafeFixtureError('Fixture forecast run could not be resolved');
    }
    const runId = runResult.rows[0].id;
    for (const hour of run.hourly || []) {
      counts['meteo.forecast_hourly'] += await insertRow(
        client,
        'meteo.forecast_hourly',
        ['run_id', 'valid_time', 'temp_c', 'hum_pct', 'wind_ms', 'wind_dir', 'rain_mm'],
        [
          runId,
          hour.valid_time,
          hour.temp_c ?? null,
          hour.hum_pct ?? null,
          hour.wind_ms ?? null,
          hour.wind_dir ?? null,
          hour.rain_mm ?? null,
        ]
      );
    }
  }
}

async function loadFixtures(client, documents) {
  const counts = Object.fromEntries(REQUIRED_RELATIONS.map((relation) => [relation, 0]));
  await loadMeteo(client, documents.meteo, counts);
  await loadHidro(client, documents.hidro, counts);
  await loadForecast(client, documents.forecast, counts);
  return counts;
}

async function run(environment = process.env) {
  const config = loadConfig(environment);
  const documents = await loadFixtureDocuments();
  const Client = getClientConstructor();
  const client = new Client(config);
  let connected = false;
  let transactionOpen = false;

  try {
    await client.connect();
    connected = true;
    await client.query('BEGIN');
    transactionOpen = true;
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', FIXTURE_LOCK);
    await assertMigrated(client);
    const counts = await loadFixtures(client, documents);
    await client.query('COMMIT');
    transactionOpen = false;
    console.log('[fixtures] load complete');
    for (const relation of REQUIRED_RELATIONS) {
      console.log(`[fixtures] inserted ${relation}=${counts[relation]}`);
    }
  } catch (error) {
    if (transactionOpen) {
      await client.query('ROLLBACK').catch(() => {});
    }
    if (error instanceof SafeFixtureError) throw error;
    throw new SafeFixtureError('Fixture load failed and was rolled back');
  } finally {
    if (connected) await client.end().catch(() => {});
  }
}

if (require.main === module) {
  run().catch((error) => {
    const message = error instanceof SafeFixtureError
      ? error.message
      : 'Unexpected fixture loading failure';
    console.error(`[fixtures] ERROR: ${message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  FIXTURE_FILES,
  REQUIRED_RELATIONS,
  SafeFixtureError,
  loadConfig,
  loadFixtureDocuments,
  loadFixtures,
  run,
};
