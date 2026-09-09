#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Client } = require('pg');

const ADVISORY_LOCK = Object.freeze([71010, 1]);
const DEFAULT_MIGRATIONS_DIR = path.join(__dirname, 'migrations');

class SafeMigrationError extends Error {}

function requiredValue(environment, primaryName, fallbackName) {
  const value = environment[primaryName] ?? environment[fallbackName];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SafeMigrationError(`Missing required database setting: ${primaryName}`);
  }
  return value.trim();
}

function loadConfig(environment = process.env) {
  const mode = requiredValue(environment, 'METEOLORD_ENV');
  if (!['local', 'test'].includes(mode)) {
    throw new SafeMigrationError('METEOLORD_ENV must be local or test');
  }

  const host = requiredValue(environment, 'POSTGRES_HOST', 'DB_HOST');
  const allowedHosts = mode === 'test' ? ['db', 'localhost', '127.0.0.1'] : ['db'];
  if (!allowedHosts.includes(host)) {
    throw new SafeMigrationError('Database host is not allowed for this environment');
  }

  const user = requiredValue(environment, 'POSTGRES_USER', 'DB_USER');
  const database = requiredValue(environment, 'POSTGRES_DB', 'DB_NAME');
  const password = requiredValue(environment, 'POSTGRES_PASSWORD', 'DB_PASSWORD');
  const portText = requiredValue(environment, 'POSTGRES_PORT', 'DB_PORT');
  const identifierPattern = /^[a-z_][a-z0-9_]{0,62}$/;
  if (!identifierPattern.test(user) || !identifierPattern.test(database)) {
    throw new SafeMigrationError('Database user and name must be safe PostgreSQL identifiers');
  }

  if (!/^[0-9]{1,5}$/.test(portText)) {
    throw new SafeMigrationError('Database port is invalid');
  }
  const port = Number(portText);
  if (port < 1 || port > 65535) {
    throw new SafeMigrationError('Database port is invalid');
  }

  const migrationsDir = path.resolve(
    environment.METEOLORD_MIGRATIONS_DIR || DEFAULT_MIGRATIONS_DIR
  );

  return { mode, host, port, user, password, database, migrationsDir };
}

function checksum(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex');
}

async function readMigrations(migrationsDir) {
  let entries;
  try {
    entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new SafeMigrationError('Migrations directory does not exist');
    }
    throw error;
  }

  const sqlEntries = entries.filter((entry) => entry.name.endsWith('.sql'));
  const invalidEntry = sqlEntries.find((entry) => !entry.isFile());
  if (invalidEntry) {
    throw new SafeMigrationError('Migration entries must be regular files');
  }

  sqlEntries.sort((left, right) => {
    if (left.name < right.name) return -1;
    if (left.name > right.name) return 1;
    return 0;
  });

  return Promise.all(sqlEntries.map(async (entry) => {
    const contents = await fs.readFile(path.join(migrationsDir, entry.name));
    return {
      version: entry.name,
      contents,
      checksum: checksum(contents),
    };
  }));
}

async function bootstrapMigrationTable(client) {
  await client.query('BEGIN');
  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS meteo_local');
    await client.query(`
      CREATE TABLE IF NOT EXISTS meteo_local.schema_migrations (
        version text PRIMARY KEY,
        checksum char(64) NOT NULL CHECK (checksum ~ '^[0-9a-f]{64}$'),
        applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
      )
    `);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw new SafeMigrationError('Could not bootstrap schema_migrations');
  }
}

async function applyMigration(client, migration) {
  const existing = await client.query(
    'SELECT checksum FROM meteo_local.schema_migrations WHERE version = $1',
    [migration.version]
  );

  if (existing.rowCount === 1) {
    if (existing.rows[0].checksum.trim() !== migration.checksum) {
      throw new SafeMigrationError(`Checksum mismatch for migration ${migration.version}`);
    }
    console.log(`[migrate] skipped ${migration.version} (checksum verified)`);
    return;
  }

  await client.query('BEGIN');
  try {
    await client.query(migration.contents.toString('utf8'));
    await client.query(
      'INSERT INTO meteo_local.schema_migrations (version, checksum) VALUES ($1, $2)',
      [migration.version, migration.checksum]
    );
    await client.query('COMMIT');
    console.log(`[migrate] applied ${migration.version}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new SafeMigrationError(`Migration ${migration.version} failed and was rolled back`);
  }
}

async function run() {
  const config = loadConfig();
  const migrations = await readMigrations(config.migrationsDir);
  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });
  let connected = false;
  let lockHeld = false;

  try {
    await client.connect();
    connected = true;
    await client.query('SELECT pg_advisory_lock($1, $2)', ADVISORY_LOCK);
    lockHeld = true;
    console.log('[migrate] advisory lock acquired');

    await bootstrapMigrationTable(client);
    for (const migration of migrations) {
      await applyMigration(client, migration);
    }
    console.log(`[migrate] complete (${migrations.length} migration(s))`);
  } finally {
    if (lockHeld) {
      try {
        await client.query('SELECT pg_advisory_unlock($1, $2)', ADVISORY_LOCK);
        console.log('[migrate] advisory lock released');
      } catch {
        console.error('[migrate] ERROR: advisory lock release failed');
        process.exitCode = 1;
      }
    }
    if (connected) {
      await client.end().catch(() => {
        process.exitCode = 1;
      });
    }
  }
}

run().catch((error) => {
  const message = error instanceof SafeMigrationError
    ? error.message
    : 'Unexpected database migration failure';
  console.error(`[migrate] ERROR: ${message}`);
  process.exitCode = 1;
});

