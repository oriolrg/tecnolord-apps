'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../../server');
const { hashPassword } = require('../../services/identityService');
const fixture = require('../fixtures/grafana-frames.json');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260921-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');
const PASSWORD = 'synthetic-grafana-passphrase';
const NOW = new Date('2026-09-24T09:20:00.000Z');

async function account(pool, suffix, role) {
  const result = await pool.query(`
    INSERT INTO auth.usuaris(email,nom,actiu,account_status,application_role,email_verified_at,approved_at)
    VALUES ($1,$2,true,'APPROVED',$3,$4,$4) RETURNING id,email
  `, [`grafana-${suffix}@example.invalid`, `Grafana ${suffix}`, role, NOW]);
  await pool.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [
    result.rows[0].id, await hashPassword(PASSWORD),
  ]);
  return result.rows[0];
}

async function request(base, route, session) {
  const response = await fetch(`${base}${route}`, { headers: session ? { cookie: session.cookie } : {} });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
}

async function login(base, email) {
  const response = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST', headers: { origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  assert.equal(response.status, 200, await response.text());
  return { cookie: response.headers.get('set-cookie').split(';')[0] };
}

function providerResponse(body) {
  const encoded = Buffer.from(JSON.stringify(body));
  return {
    ok: true, status: 200,
    headers: { get(name) { return name.toLowerCase() === 'content-length' ? String(encoded.byteLength) : null; } },
    async arrayBuffer() { return encoded; },
  };
}

test('UE-T14 exposes fixed Grafana frames only to admin and never persists or republishes them', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'ue_grafana' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    const admin = await account(pool, 'admin', 'SUPERADMIN');
    const user = await account(pool, 'user', 'USER');
    const station = await pool.query(`
      INSERT INTO meteo.estacions(codi,nom,management_kind,lifecycle,visibility)
      VALUES ('grafana-synthetic','Grafana sintètica','ADMIN','ACTIVE','PUBLIC') RETURNING id,public_id
    `);
    const binding = await pool.query(`
      INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status,evidence_ref)
      VALUES ($1,'GRAFANA','Meteo-901-9000001','VALIDATED','fixture-grafana') RETURNING id
    `, [station.rows[0].id]);
    await pool.query(`
      INSERT INTO meteo.station_locations(
        station_id,private_geometry,public_geometry,publication_mode,accuracy_m,provenance,
        reference_label,verified_at,geo_policy_version,revision,updated_at
      ) VALUES (
        $1,public.ST_SetSRID(public.ST_MakePoint(1.55,42.13),4326),
        public.ST_SetSRID(public.ST_MakePoint(1.55,42.13),4326),'APPROX_1KM',1000,
        'SOURCE_DOCUMENT','fixture-grafana',$2,'ue-admin-catalog-v1',0,$2
      )
    `, [station.rows[0].id, NOW]);
    await pool.query(`
      INSERT INTO meteo.current_snapshots(binding_id,observed_at,received_at,fetched_at,values_json,quality_json)
      VALUES ($1,$2,$2,$2,'{"temp_c":55}'::jsonb,'{}'::jsonb)
    `, [binding.rows[0].id, NOW]);
    await pool.query('UPDATE meteo.public_view_config SET public_station_id=$1 WHERE id=1', [station.rows[0].id]);
    const snapshotCountBefore = (await pool.query('SELECT count(*)::int AS count FROM meteo.current_snapshots')).rows[0].count;
    const measureCountBefore = (await pool.query('SELECT count(*)::int AS count FROM meteo.mesures')).rows[0].count;
    const upstreamCalls = [];
    const app = createApp({
      environment: { METEOLORD_ENV: 'test', METEOLORD_GRAFANA_INTERNAL_ENABLED: 'true' },
      pool, clock: () => NOW, accessLogStream: { write() {} },
      connectorKeyring: { primaryKeyId: 'test', keys: { test: Buffer.alloc(32, 14) } },
      httpClient: async (url, options) => {
        upstreamCalls.push({ url, options });
        return providerResponse(fixture);
      },
    });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const adminSession = await login(base, admin.email);
      const userSession = await login(base, user.email);
      assert.equal((await request(base, '/api/v1/admin/grafana/stations', userSession)).response.status, 403);
      const list = await request(base, '/api/v1/admin/grafana/stations', adminSession);
      assert.equal(list.response.status, 200);
      assert.deepEqual(list.body.items, [{
        id: station.rows[0].public_id, name: 'Grafana sintètica', external_id: 'Meteo-901-9000001',
        access_scope: 'INTERNAL_ONLY', fields: [{ id: 'temperature', unit: 'celsius' }], rain_enabled: false,
      }]);
      const current = await request(base,
        `/api/v1/admin/grafana/stations/${station.rows[0].public_id}/current`, adminSession);
      assert.equal(current.response.status, 200, JSON.stringify(current.body));
      assert.equal(current.body.source.access_scope, 'INTERNAL_ONLY');
      assert.equal(current.body.source.persistence, 'DISABLED');
      assert.equal(current.body.source.rain_enabled, false);
      assert.equal(current.body.series.length, 2);
      assert.equal(current.body.series[0].points[0].value, 0);
      assert.equal(current.body.series[0].points[1].quality, 'MISSING');
      assert.deepEqual(current.body.warnings, ['INCONSISTENT_LENGTH', 'SOURCE_UNIT_UNDECLARED']);
      assert.equal(upstreamCalls.length, 1);
      assert.equal(upstreamCalls[0].url, 'https://grafana.commonscloud.coop/api/ds/query');
      const query = JSON.parse(upstreamCalls[0].options.body);
      assert.deepEqual(Object.keys(query), ['from', 'to', 'queries']);
      assert.equal(query.queries[0].expr, 'xoic_I2CAT_temperatura{tag4="Meteo-901-9000001"}');

      assert.deepEqual((await request(base, '/api/v1/stations')).body.items, []);
      assert.equal((await request(base, `/api/v1/stations/${station.rows[0].public_id}`)).response.status, 404);
      assert.equal((await request(base, `/api/v1/stations/${station.rows[0].public_id}/current`)).response.status, 404);
      const map = await request(base, '/api/v1/map/stations');
      assert.equal(map.response.status, 200);
      assert.equal(map.body.features.some((feature) => feature.id === station.rows[0].public_id), false);
      const publicView = await request(base, '/api/v1/public-view');
      assert.equal(publicView.response.status, 200);
      assert.equal(publicView.body.config.station, null);
      assert.equal((await pool.query('SELECT count(*)::int AS count FROM meteo.current_snapshots')).rows[0].count, snapshotCountBefore);
      assert.equal((await pool.query('SELECT count(*)::int AS count FROM meteo.mesures')).rows[0].count, measureCountBefore);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  });
});
