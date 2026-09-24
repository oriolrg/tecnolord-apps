'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../../server');
const { hashPassword } = require('../../services/identityService');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260923-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');
const PASSWORD = 'synthetic-g05-passphrase';
const OBSERVED_AT = '2026-09-23T12:00:00.000Z';

async function account(pool, suffix, role) {
  const result = await pool.query(`
    INSERT INTO auth.usuaris(
      email,nom,actiu,account_status,application_role,email_verified_at,approved_at
    ) VALUES ($1,$2,true,'APPROVED',$3,now(),now()) RETURNING id,email
  `, [`g05-${suffix}@example.invalid`, `G05 ${suffix}`, role]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    result.rows[0].id, await hashPassword(PASSWORD),
  ]);
  return result.rows[0];
}

async function request(base, route, cookie) {
  const response = await fetch(`${base}${route}`, {
    headers: { origin: base, ...(cookie ? { cookie } : {}) },
  });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
}

async function login(base, email) {
  const response = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST', headers: { origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  assert.equal(response.status, 200);
  return response.headers.get('set-cookie').split(';')[0];
}

async function grafanaStation(pool, code, externalId) {
  const station = await pool.query(`
    INSERT INTO meteo.estacions(codi,nom,management_kind,lifecycle,visibility)
    VALUES ($1,$1,'ADMIN','ACTIVE','PRIVATE') RETURNING id,public_id
  `, [code]);
  const binding = await pool.query(`
    INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status)
    VALUES ($1,'GRAFANA',$2,'VALIDATED') RETURNING id
  `, [station.rows[0].id, externalId]);
  return { ...station.rows[0], bindingId: binding.rows[0].id };
}

test('G05 exposes a private Grafana snapshot only through ordinary authorized APIs', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'g05_api' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    const admin = await account(pool, 'admin', 'SUPERADMIN');
    const user = await account(pool, 'user', 'USER');
    const main = await grafanaStation(pool, 'GRAFANA_LOCAL_001', 'Meteo-001-3100044');
    const empty = await grafanaStation(pool, 'GRAFANA_LOCAL_EMPTY', 'Meteo-001-3100045');
    await pool.query(`
      INSERT INTO meteo.current_snapshots(
        binding_id,observed_at,received_at,fetched_at,values_json,quality_json,provider_error
      ) VALUES ($1,$2,$3,$3,$4,$5,'AUTH_REQUIRED')
    `, [main.bindingId, OBSERVED_AT, '2026-09-23T12:08:00.000Z', JSON.stringify({
      temp_c: 21.9, humitat_pct: 64, datasource: 'SWLXFBHvz', upstream_payload: { secret: true },
    }), JSON.stringify({
      freshness: 'FRESH', fields: { temp_c: 'VALID', humitat_pct: 'VALID', datasource: 'VALID' },
      observed_at_by_field: { temp_c: OBSERVED_AT, humitat_pct: '2026-09-23T11:55:00.000Z' },
      warnings: ['SOURCE_UNIT_UNDECLARED', 'datasource'],
      units: {
        temp_c: { canonical: 'celsius', source_unit: null, unit_basis: 'QUERY_CONTRACT', datasource_id: 11 },
        humitat_pct: { canonical: 'percent', source_unit: 'percent', unit_basis: 'QUERY_CONTRACT' },
      },
    })]);

    const app = createApp({
      environment: {
        METEOLORD_ENV: 'test', METEOLORD_GRAFANA_INTERNAL_ENABLED: 'true',
        METEOLORD_GRAFANA_INTERVAL_SECONDS: '900',
      },
      pool, clock: () => new Date('2026-09-23T12:09:00.000Z'),
      httpClient: async () => { throw new Error('No provider request expected in G05'); },
      connectorKeyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 5) } },
      accessLogStream: { write() {} }, mapPublicStations: [],
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const adminCookie = await login(base, admin.email);
      const userCookie = await login(base, user.email);

      assert.equal((await request(base, '/api/v1/admin/stations')).response.status, 401);
      assert.equal((await request(base, '/api/v1/admin/stations', userCookie)).response.status, 403);
      const catalog = await request(base, '/api/v1/admin/stations', adminCookie);
      assert.equal(catalog.response.status, 200);
      assert.ok(catalog.body.items.some((station) => station.id === main.public_id
        && station.name === 'GRAFANA_LOCAL_001' && station.visibility === 'PRIVATE'));

      assert.deepEqual((await request(base, '/api/v1/me/stations', userCookie)).body.items, []);
      assert.deepEqual((await request(base, '/api/v1/stations')).body.items, []);
      assert.equal(JSON.stringify((await request(base, '/api/v1/public-view')).body).includes(main.public_id), false);
      assert.equal(JSON.stringify((await request(base, '/api/v1/map/stations')).body).includes(main.public_id), false);
      assert.equal((await request(base, `/api/v1/stations/${main.public_id}/current`)).response.status, 404);
      assert.equal((await request(base, `/api/v1/stations/${main.public_id}/current`, userCookie)).response.status, 404);

      const current = await request(base, `/api/v1/stations/${main.public_id}/current`, adminCookie);
      assert.equal(current.response.status, 200);
      assert.equal(current.body.items[0].temp_c, 21.9);
      assert.equal(current.body.items[0].humitat_pct, 64);
      assert.equal(current.body.items[0].instant, OBSERVED_AT);
      assert.equal(current.body.source.observed_at, OBSERVED_AT);
      assert.equal(current.body.source.freshness, 'FRESH');
      assert.equal(current.body.source.error, 'AUTH_REQUIRED');
      assert.equal(current.body.source.quality.fields.temp_c, 'VALID');
      assert.equal(current.body.source.quality.fields.humitat_pct, 'VALID');
      assert.deepEqual(current.body.source.quality.observed_at_by_field, {
        temp_c: OBSERVED_AT,
        humitat_pct: '2026-09-23T11:55:00.000Z',
      });

      const serialized = JSON.stringify(current.body).toLowerCase();
      for (const forbidden of ['grafana.commonscloud.coop', 'swlxfbhvz', 'datasource', 'promql',
        'meteo-001-3100044', 'upstream_payload', 'secret']) {
        assert.equal(serialized.includes(forbidden), false, forbidden);
      }

      const absent = await request(base, `/api/v1/stations/${empty.public_id}/current`, adminCookie);
      assert.equal(absent.response.status, 200);
      assert.deepEqual(absent.body.items, []);
      assert.equal(absent.body.source.freshness, 'UNKNOWN');
      assert.equal(absent.body.source.observed_at, null);
      assert.equal(JSON.stringify(absent.body).includes('21.9'), false);

      const history = await request(base, `/api/v1/stations/${main.public_id}/history`, adminCookie);
      assert.equal(history.response.status, 200);
      assert.deepEqual(history.body.items, []);
      assert.equal((await pool.query('SELECT count(*)::int AS total FROM meteo.mesures WHERE estacio_id=$1', [main.id])).rows[0].total, 0);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  });
});
