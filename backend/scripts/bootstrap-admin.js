#!/usr/bin/env node
'use strict';

const { Client } = require('pg');

function parseArgs(args) {
  if (args.length !== 6 || args[0] !== '--user-id' || args[2] !== '--email' || args[4] !== '--audit-ref') {
    throw new Error('Usage: bootstrap-admin.js --user-id <id> --email <verified-email> --audit-ref <reference>');
  }
  const userId = Number(args[1]);
  const email = args[3];
  const auditRef = args[5];
  if (!Number.isSafeInteger(userId) || userId < 1
      || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || typeof auditRef !== 'string' || !/^[a-zA-Z0-9._:-]{8,80}$/.test(auditRef)) {
    throw new Error('Invalid bootstrap arguments');
  }
  return { userId, email, auditRef };
}

function connection(environment) {
  const mode = environment.METEOLORD_ENV;
  const host = environment.POSTGRES_HOST;
  const database = environment.POSTGRES_DB;
  if (!['local', 'test'].includes(mode)
      || !['db', 'localhost', '127.0.0.1'].includes(host)
      || (mode === 'local' && database !== 'meteolord_local')
      || (mode === 'test' && !/^meteolord_test_[a-z0-9_]{1,48}$/.test(database))) {
    throw new Error('Bootstrap requires an allowlisted local/test database');
  }
  return {
    host,
    port: Number(environment.POSTGRES_PORT || 5432),
    database,
    user: environment.POSTGRES_USER,
    password: environment.POSTGRES_PASSWORD,
  };
}

async function bootstrapAdmin({ client, userId, email, auditRef }) {
  const numericUserId = Number(userId);
  if (!Number.isSafeInteger(numericUserId) || numericUserId < 1) throw new Error('Invalid user ID');
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(71010, 3)');
    const existing = await client.query(
      "SELECT id FROM auth.usuaris WHERE application_role='SUPERADMIN' FOR UPDATE"
    );
    if (existing.rows.some((row) => Number(row.id) !== numericUserId)) {
      throw new Error('A different SUPERADMIN already exists');
    }
    const found = await client.query(`
      SELECT id, email, account_status, email_verified_at, approved_at, actiu
      FROM auth.usuaris WHERE id=$1 FOR UPDATE
    `, [userId]);
    const account = found.rows[0];
    if (found.rowCount !== 1 || account.email !== email
        || account.account_status !== 'APPROVED' || !account.email_verified_at
        || !account.approved_at || !account.actiu) {
      throw new Error('User identity is not verified and approved');
    }
    const credential = await client.query('SELECT user_id FROM auth.credentials WHERE user_id=$1', [userId]);
    if (credential.rowCount !== 1) throw new Error('Approved user has no password credential');
    if (existing.rowCount === 0) {
      await client.query("UPDATE auth.usuaris SET application_role='SUPERADMIN' WHERE id=$1", [userId]);
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id, action, resource_kind, resource_id, details)
        VALUES ($1,'ADMIN_BOOTSTRAP','USER',$2,$3::jsonb)
      `, [userId, String(userId), JSON.stringify({ audit_ref: auditRef })]);
    }
    await client.query('COMMIT');
    return existing.rowCount === 0 ? 'created' : 'already_exists';
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const client = new Client(connection(process.env));
  await client.connect();
  try {
    const result = await bootstrapAdmin({ client, ...options });
    console.log(`Admin bootstrap: ${result}`);
  } finally { await client.end(); }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Admin bootstrap refused: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { bootstrapAdmin, connection, parseArgs };
