'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Pool } = require('pg');
const { makeSnapshotService } = require('../../services/snapshotService');

const enabled = process.env.UE_INTEGRATION === '1';
const testDb = enabled ? require('../helpers/testDb') : null;
const runId = process.env.UE_RUN_ID || '20260923-000000-0000000';
const migrationDir = path.resolve(__dirname, '../../db/migrations');
const BASE = new Date('2026-09-23T12:00:00.000Z');
const intervals = { ECOWITT: 900, GRAFANA: 900 };
const connectorRegistry = { credentialsForStation: async () => null };
const unusedFetch = async () => { throw new Error('Ecowitt must not be queried'); };

function successfulSnapshot(observedAt, temp = 18.5) {
  const timestamp = new Date(observedAt).toISOString();
  return {
    ok: true,
    observedAt: new Date(observedAt),
    values: { temp_c: temp, humitat_pct: null },
    quality: {
      fields: { temp_c: 'VALID', humitat_pct: 'MISSING' },
      observed_at_by_field: { temp_c: timestamp },
    },
  };
}

function multivariableSnapshot({ temp, tempAt, humidity, humidityAt }) {
  const timestamps = [tempAt, humidityAt].filter(Boolean).map((value) => new Date(value).toISOString()).sort();
  return {
    ok: true,
    observedAt: new Date(timestamps.at(-1)),
    values: { temp_c: temp ?? null, humitat_pct: humidity ?? null },
    quality: {
      fields: {
        temp_c: temp == null ? 'MISSING' : 'VALID',
        humitat_pct: humidity == null ? 'MISSING' : 'VALID',
      },
      observed_at_by_field: {
        ...(temp == null ? {} : { temp_c: new Date(tempAt).toISOString() }),
        ...(humidity == null ? {} : { humitat_pct: new Date(humidityAt).toISOString() }),
      },
    },
  };
}

async function adminStation(pool, suffix, status = 'VALIDATED') {
  const station = await pool.query(`
    INSERT INTO meteo.estacions(codi,nom,management_kind,lifecycle,visibility)
    VALUES ($1,$2,'ADMIN','ACTIVE','PRIVATE') RETURNING id
  `, [`grafana-g04-${suffix}`, `Grafana G04 ${suffix}`]);
  const binding = await pool.query(`
    INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status)
    VALUES ($1,'GRAFANA',$2,$3) RETURNING id
  `, [station.rows[0].id, `Meteo-001-${String(40000 + station.rows[0].id).slice(-5)}`, status]);
  return { stationId: station.rows[0].id, bindingId: binding.rows[0].id };
}

function service(pool, { grafanaEnabled = true, grafana, clock = () => new Date(BASE.getTime() + 5 * 60_000) } = {}) {
  return makeSnapshotService({
    pool, connectorRegistry, grafana, fetch: unusedFetch, clock,
    sourceIntervals: intervals, grafanaEnabled,
  });
}

test('G04 persists Grafana snapshots monotonically and preserves Ecowitt isolation', {
  skip: !enabled, timeout: 90000,
}, async () => {
  await testDb.withTestDatabase({ runId, suffix: 'g04_snap' }, async (database) => {
    const migrated = await testDb.runMigrator({ database, migrationsDir: migrationDir });
    assert.equal(migrated.code, 0, migrated.stderr);
    const pool = new Pool({ ...testDb.connectionFromEnv(), database });
    try {
      const main = await adminStation(pool, 'main');
      let calls = 0;
      const disabled = service(pool, {
        grafanaEnabled: false,
        grafana: { fetchSnapshot: async () => { calls += 1; return successfulSnapshot(BASE); } },
      });
      assert.deepEqual(await disabled.refreshStation(main.stationId), {
        skipped: true, reason: 'source_disabled',
      });
      assert.equal(calls, 0);

      const candidate = await adminStation(pool, 'candidate', 'CANDIDATE');
      const candidateService = service(pool, {
        grafana: { fetchSnapshot: async () => { calls += 1; return successfulSnapshot(BASE); } },
      });
      assert.deepEqual(await candidateService.refreshStation(candidate.stationId), {
        skipped: true, reason: 'binding_unavailable',
      });
      assert.equal(calls, 0);

      const first = service(pool, {
        grafana: { fetchSnapshot: async () => { calls += 1; return successfulSnapshot(BASE, 18.5); } },
      });
      const batch = await first.refreshReadyStations();
      assert.equal(batch.stations, 1);
      assert.equal(batch.outcomes[0].updated, true);
      assert.equal(calls, 1);

      const newerAt = new Date(BASE.getTime() + 5 * 60_000);
      const newer = service(pool, {
        clock: () => new Date(BASE.getTime() + 10 * 60_000),
        grafana: { fetchSnapshot: async () => successfulSnapshot(newerAt, 19.25) },
      });
      assert.equal((await newer.refreshStation(main.stationId)).updated, true);

      const repeated = service(pool, {
        clock: () => new Date(BASE.getTime() + 11 * 60_000),
        grafana: { fetchSnapshot: async () => successfulSnapshot(newerAt, 99) },
      });
      assert.equal((await repeated.refreshStation(main.stationId)).updated, false);

      const older = service(pool, {
        clock: () => new Date(BASE.getTime() + 12 * 60_000),
        grafana: { fetchSnapshot: async () => successfulSnapshot(BASE, -5) },
      });
      assert.equal((await older.refreshStation(main.stationId)).updated, false);

      const afterMonotonic = await pool.query(`
        SELECT observed_at,values_json,quality_json FROM meteo.current_snapshots WHERE binding_id=$1
      `, [main.bindingId]);
      assert.equal(afterMonotonic.rowCount, 1);
      assert.equal(new Date(afterMonotonic.rows[0].observed_at).toISOString(), newerAt.toISOString());
      assert.equal(afterMonotonic.rows[0].values_json.temp_c, 19.25);
      assert.equal(afterMonotonic.rows[0].quality_json.freshness, 'FRESH');

      for (const [offset, error] of ['AUTH_REQUIRED', 'RATE_LIMITED', 'TIMEOUT', 'PROVIDER_UNAVAILABLE'].entries()) {
        const failing = service(pool, {
          clock: () => new Date(BASE.getTime() + (20 + offset) * 60_000),
          grafana: { fetchSnapshot: async () => ({ ok: false, error }) },
        });
        assert.equal((await failing.refreshStation(main.stationId)).error, error);
        const preserved = await pool.query(`
          SELECT observed_at,values_json,provider_error FROM meteo.current_snapshots WHERE binding_id=$1
        `, [main.bindingId]);
        assert.equal(new Date(preserved.rows[0].observed_at).toISOString(), newerAt.toISOString());
        assert.equal(preserved.rows[0].values_json.temp_c, 19.25);
        assert.equal(preserved.rows[0].provider_error, error);
      }

      const firstFailure = await adminStation(pool, 'first-failure');
      const invalid = service(pool, {
        grafana: { fetchSnapshot: async () => ({ ok: false, error: 'INVALID_JSON' }) },
      });
      assert.equal((await invalid.refreshStation(firstFailure.stationId)).error, 'INVALID_JSON');
      const failedRow = await pool.query(`
        SELECT observed_at,values_json,provider_error FROM meteo.current_snapshots WHERE binding_id=$1
      `, [firstFailure.bindingId]);
      assert.equal(failedRow.rows[0].observed_at, null);
      assert.deepEqual(failedRow.rows[0].values_json, {});
      assert.equal(failedRow.rows[0].provider_error, 'INVALID_JSON');

      let finish;
      const pending = new Promise((resolve) => { finish = resolve; });
      const concurrent = service(pool, {
        clock: () => new Date(BASE.getTime() + 30 * 60_000),
        grafana: { fetchSnapshot: async () => pending },
      });
      const concurrentError = service(pool, {
        clock: () => new Date(BASE.getTime() + 31 * 60_000),
        grafana: { fetchSnapshot: async () => ({ ok: false, error: 'PROVIDER_UNAVAILABLE' }) },
      });
      const inFlight = concurrent.refreshStation(main.stationId);
      await new Promise((resolve) => setImmediate(resolve));
      assert.deepEqual(await concurrentError.refreshStation(main.stationId), {
        skipped: true, reason: 'lease_busy',
      });
      finish(successfulSnapshot(new Date(BASE.getTime() + 25 * 60_000), 20));
      assert.equal((await inFlight).updated, true);

      const ambiguous = await adminStation(pool, 'ambiguous');
      await pool.query(`
        INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status)
        VALUES ($1,'ECOWITT',$2,'VALIDATED')
      `, [ambiguous.stationId, `ecowitt-g04-${ambiguous.stationId}`]);
      assert.deepEqual(await first.refreshStation(ambiguous.stationId), {
        skipped: true, reason: 'ambiguous_binding',
      });

      const fields = await adminStation(pool, 'field-monotonic');
      const at1530 = new Date(BASE.getTime() + 30 * 60_000);
      const at1515 = new Date(BASE.getTime() + 15 * 60_000);
      const at1545 = new Date(BASE.getTime() + 45 * 60_000);
      const at1600 = new Date(BASE.getTime() + 60 * 60_000);
      const initialFields = service(pool, {
        clock: () => new Date(BASE.getTime() + 70 * 60_000),
        grafana: { fetchSnapshot: async () => multivariableSnapshot({
          temp: 15, tempAt: at1530, humidity: 60, humidityAt: at1530,
        }) },
      });
      assert.equal((await initialFields.refreshStation(fields.stationId)).updated, true);
      const newerTempOlderHumidity = service(pool, {
        clock: () => new Date(BASE.getTime() + 71 * 60_000),
        grafana: { fetchSnapshot: async () => multivariableSnapshot({
          temp: 16, tempAt: at1545, humidity: 50, humidityAt: at1515,
        }) },
      });
      assert.equal((await newerTempOlderHumidity.refreshStation(fields.stationId)).updated, true);
      let fieldRow = (await pool.query(`
        SELECT observed_at,values_json,quality_json FROM meteo.current_snapshots WHERE binding_id=$1
      `, [fields.bindingId])).rows[0];
      assert.equal(fieldRow.values_json.temp_c, 16);
      assert.equal(fieldRow.values_json.humitat_pct, 60);
      assert.equal(fieldRow.quality_json.observed_at_by_field.temp_c, at1545.toISOString());
      assert.equal(fieldRow.quality_json.observed_at_by_field.humitat_pct, at1530.toISOString());

      const newerHumidityOlderTemp = service(pool, {
        clock: () => new Date(BASE.getTime() + 72 * 60_000),
        grafana: { fetchSnapshot: async () => multivariableSnapshot({
          temp: 14, tempAt: at1515, humidity: 70, humidityAt: at1600,
        }) },
      });
      assert.equal((await newerHumidityOlderTemp.refreshStation(fields.stationId)).updated, true);
      fieldRow = (await pool.query(`
        SELECT observed_at,values_json,quality_json FROM meteo.current_snapshots WHERE binding_id=$1
      `, [fields.bindingId])).rows[0];
      assert.equal(new Date(fieldRow.observed_at).toISOString(), at1600.toISOString());
      assert.equal(fieldRow.values_json.temp_c, 16);
      assert.equal(fieldRow.values_json.humitat_pct, 70);
      assert.equal(fieldRow.quality_json.observed_at_by_field.temp_c, at1545.toISOString());
      assert.equal(fieldRow.quality_json.observed_at_by_field.humitat_pct, at1600.toISOString());
      assert.equal(Number((await pool.query(`
        SELECT count(*) FROM meteo.current_snapshots WHERE binding_id=$1
      `, [fields.bindingId])).rows[0].count), 1);
      assert.equal(Number((await pool.query(`
        SELECT count(*) FROM meteo.mesures WHERE estacio_id=$1
      `, [fields.stationId])).rows[0].count), 0);

      const counts = await pool.query(`
        SELECT
          (SELECT count(*)::int FROM meteo.source_bindings WHERE id=$1) AS bindings,
          (SELECT count(*)::int FROM meteo.current_snapshots WHERE binding_id=$1) AS snapshots,
          (SELECT count(*)::int FROM meteo.mesures WHERE estacio_id=$2) AS measures
      `, [main.bindingId, main.stationId]);
      assert.deepEqual(counts.rows[0], { bindings: 1, snapshots: 1, measures: 0 });
    } finally {
      await pool.end();
    }
  });
});
