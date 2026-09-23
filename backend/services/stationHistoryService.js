'use strict';

const MIN_INTERVAL = 5;
const MAX_INTERVAL = 1440;
const MIN_RETENTION = 1;
const MAX_RETENTION = 3650;

function dateNow(clock) {
  const value = typeof clock === 'function' ? clock() : clock?.now ? clock.now() : Date.now();
  const result = new Date(value);
  if (Number.isNaN(result.getTime())) throw new TypeError('Invalid history clock');
  return result;
}

function policyInput(value) {
  if (!value || typeof value.enabled !== 'boolean' || !Number.isSafeInteger(value.capture_interval_minutes)
      || value.capture_interval_minutes < MIN_INTERVAL || value.capture_interval_minutes > MAX_INTERVAL
      || !Number.isSafeInteger(value.retention_days) || value.retention_days < MIN_RETENTION
      || value.retention_days > MAX_RETENTION || !Number.isSafeInteger(value.revision) || value.revision < 0) return null;
  return { enabled: value.enabled, capture_interval_minutes: value.capture_interval_minutes,
    retention_days: value.retention_days, revision: value.revision };
}

function dto(row) {
  return {
    station: { id: row.public_id, name: row.nom, management_kind: row.management_kind,
      lifecycle: row.lifecycle, visibility: row.visibility },
    policy: row.policy_station_id ? { enabled: row.enabled, capture_interval_minutes: row.capture_interval_minutes,
      retention_days: row.retention_days, revision: Number(row.policy_revision), last_capture_at: row.last_capture_at }
      : null,
    source_interval_minutes: row.connector_type === 'ECOWITT' ? 15 : 5,
    legacy_compatible: row.management_kind === 'LEGACY' && !row.policy_station_id,
  };
}

function makeStationHistoryService({ pool, clock } = {}) {
  if (!pool?.query || !pool?.connect) throw new TypeError('History pool is required');
  const now = () => dateNow(clock);
  const baseSelect = `
    SELECT e.id,e.public_id,e.nom,e.management_kind,e.lifecycle,e.visibility,c.connector_type,
      p.station_id AS policy_station_id,p.enabled,p.capture_interval_minutes,p.retention_days,
      p.revision AS policy_revision,p.last_capture_at,p.previewed_retention_days,p.previewed_at
    FROM meteo.estacions e LEFT JOIN meteo.station_connectors c ON c.station_id=e.id
    LEFT JOIN meteo.station_history_policies p ON p.station_id=e.id`;

  async function list() {
    const result = await pool.query(`${baseSelect} ORDER BY e.nom,e.id`);
    return result.rows.map(dto);
  }

  async function preview(actorId, publicId, retentionDays) {
    if (!Number.isSafeInteger(retentionDays) || retentionDays < MIN_RETENTION || retentionDays > MAX_RETENTION) return { invalid: true };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const station = await client.query(`${baseSelect} WHERE e.public_id=$1 FOR UPDATE OF e`, [publicId]);
      if (station.rowCount !== 1) { await client.query('COMMIT'); return { notFound: true }; }
      const cutoff = new Date(now().getTime() - retentionDays * 86400000);
      const count = await client.query('SELECT count(*)::bigint AS total FROM meteo.mesures WHERE estacio_id=$1 AND instant<$2', [station.rows[0].id, cutoff]);
      await client.query(`
        INSERT INTO meteo.station_history_policies(station_id,enabled,capture_interval_minutes,retention_days,updated_by,
          previewed_retention_days,previewed_at,previewed_delete_count)
        VALUES ($1,false,15,$2,$3,$2,$4,$5)
        ON CONFLICT(station_id) DO UPDATE SET previewed_retention_days=$2,previewed_at=$4,previewed_delete_count=$5
      `, [station.rows[0].id, retentionDays, actorId, now(), count.rows[0].total]);
      await client.query('COMMIT');
      return { station_id: publicId, retention_days: retentionDays, cutoff: cutoff.toISOString(),
        delete_count: Number(count.rows[0].total) };
    } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
    finally { client.release(); }
  }

  async function update(actorId, publicId, input) {
    const value = policyInput(input);
    if (!value) return { invalid: true };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const station = await client.query(`${baseSelect} WHERE e.public_id=$1 FOR UPDATE OF e`, [publicId]);
      if (station.rowCount !== 1) { await client.query('COMMIT'); return { notFound: true }; }
      const row = station.rows[0];
      const revision = row.policy_station_id ? Number(row.policy_revision) : 0;
      if (revision !== value.revision) { await client.query('COMMIT'); return { conflict: true }; }
      const minimum = row.connector_type === 'ECOWITT' ? 15 : 5;
      if (value.capture_interval_minutes < minimum) { await client.query('COMMIT'); return { interval: true, minimum }; }
      if (row.management_kind === 'LEGACY' && value.enabled
          && (Number(row.previewed_retention_days) !== value.retention_days || !row.previewed_at)) {
        await client.query('COMMIT'); return { previewRequired: true };
      }
      const changed = await client.query(`
        INSERT INTO meteo.station_history_policies(station_id,enabled,capture_interval_minutes,retention_days,revision,updated_by)
        VALUES ($1,$2,$3,$4,1,$5)
        ON CONFLICT(station_id) DO UPDATE SET enabled=$2,capture_interval_minutes=$3,retention_days=$4,
          revision=meteo.station_history_policies.revision+1,updated_by=$5,updated_at=$6
        RETURNING *
      `, [row.id, value.enabled, value.capture_interval_minutes, value.retention_days, actorId, now()]);
      await client.query(`INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,'HISTORY_POLICY_UPDATED','STATION',$2,$3::jsonb)`,
      [actorId, publicId, JSON.stringify({ enabled: value.enabled, capture_interval_minutes: value.capture_interval_minutes,
        retention_days: value.retention_days })]);
      await client.query('COMMIT');
      return { policy: { enabled: changed.rows[0].enabled, capture_interval_minutes: changed.rows[0].capture_interval_minutes,
        retention_days: changed.rows[0].retention_days, revision: Number(changed.rows[0].revision),
        last_capture_at: changed.rows[0].last_capture_at } };
    } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
    finally { client.release(); }
  }

  async function captureStation(stationId) {
    const client = await pool.connect(); let locked = false;
    try {
      locked = (await client.query('SELECT pg_try_advisory_lock($1,$2) AS locked', [71017, Number(stationId)])).rows[0]?.locked === true;
      if (!locked) return { skipped: true, reason: 'lease_busy' };
      const result = await client.query(`
        SELECT p.capture_interval_minutes,p.last_capture_at,b.id AS binding_id,s.observed_at,s.values_json,s.provider_error
        FROM meteo.station_history_policies p JOIN meteo.source_bindings b ON b.station_id=p.station_id AND b.binding_status='VALIDATED'
        LEFT JOIN meteo.current_snapshots s ON s.binding_id=b.id
        WHERE p.station_id=$1 AND p.enabled=true ORDER BY b.id LIMIT 1`, [stationId]);
      if (result.rowCount !== 1) return { skipped: true, reason: 'policy_unavailable' };
      const row = result.rows[0]; const current = now();
      if (row.last_capture_at && current - new Date(row.last_capture_at) < row.capture_interval_minutes * 60000) return { skipped: true, reason: 'not_due' };
      if (!row.observed_at || row.provider_error || current - new Date(row.observed_at) > row.capture_interval_minutes * 8 * 60000) {
        return { skipped: true, reason: 'no_recent_data' };
      }
      const values = row.values_json || {};
      const columns = ['temp_c','sensacio_c','punt_rosada_c','humitat_pct','solar_wm2','uvi','taxa_pluja_mm_h','pluja_diaria_mm',
        'pluja_event_mm','pluja_hora_mm','pluja_setmana_mm','pluja_mes_mm','pluja_any_mm','vent_ms','vent_rafega_ms',
        'vent_direccio_graus','pressio_rel_hpa','pressio_abs_hpa','bateria_pct'];
      const params = [stationId, row.observed_at, ...columns.map((key) => values[key] ?? null)];
      const inserted = await client.query(`INSERT INTO meteo.mesures(estacio_id,instant,${columns.join(',')})
        VALUES (${params.map((_, index) => `$${index + 1}`).join(',')}) ON CONFLICT(estacio_id,instant) DO NOTHING RETURNING id`, params);
      await client.query(`INSERT INTO meteo.history_capture_runs(station_id,source_binding_id,observed_at,run_status)
        VALUES ($1,$2,$3,$4) ON CONFLICT(station_id,source_binding_id,observed_at) DO NOTHING`,
      [stationId, row.binding_id, row.observed_at, inserted.rowCount ? 'CAPTURED' : 'DUPLICATE']);
      await client.query('UPDATE meteo.station_history_policies SET last_capture_at=$2 WHERE station_id=$1', [stationId, current]);
      return { skipped: false, inserted: inserted.rowCount === 1 };
    } finally { if (locked) await client.query('SELECT pg_advisory_unlock($1,$2)', [71017, Number(stationId)]); client.release(); }
  }

  async function captureDue() {
    const due = await pool.query(`SELECT station_id FROM meteo.station_history_policies WHERE enabled=true ORDER BY station_id`);
    const outcomes = [];
    for (const row of due.rows) {
      try { outcomes.push({ station_id: row.station_id, ...(await captureStation(row.station_id)) }); }
      catch { outcomes.push({ station_id: row.station_id, skipped: true, failed: true, reason: 'capture_failed' }); }
    }
    return outcomes;
  }

  async function purgeStation(stationId, batchSize = 1000) {
    if (!Number.isSafeInteger(Number(stationId)) || !Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 10000) {
      return { skipped: true, reason: 'invalid_request' };
    }
    const client = await pool.connect(); let locked = false;
    try {
      locked = (await client.query('SELECT pg_try_advisory_lock($1,$2) AS locked', [71018, Number(stationId)])).rows[0]?.locked === true;
      if (!locked) return { skipped: true, reason: 'lease_busy' };
      await client.query('BEGIN');
      const policy = await client.query(`
        SELECT retention_days FROM meteo.station_history_policies
        WHERE station_id=$1 AND enabled=true FOR UPDATE`, [stationId]);
      if (policy.rowCount !== 1) {
        await client.query('COMMIT');
        return { skipped: true, reason: 'policy_unavailable' };
      }
      const cutoff = new Date(now().getTime() - policy.rows[0].retention_days * 86400000);
      const removed = await client.query(`DELETE FROM meteo.mesures WHERE id IN (
        SELECT id FROM meteo.mesures WHERE estacio_id=$1 AND instant<$2 ORDER BY instant,id LIMIT $3
        FOR UPDATE SKIP LOCKED
      ) RETURNING id`, [stationId, cutoff, batchSize]);
      await client.query('COMMIT');
      return { skipped: false, deleted: removed.rowCount, cutoff: cutoff.toISOString() };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      if (locked) await client.query('SELECT pg_advisory_unlock($1,$2)', [71018, Number(stationId)]).catch(() => {});
      client.release();
    }
  }

  async function purgeDue(batchSize = 1000) {
    const due = await pool.query('SELECT station_id FROM meteo.station_history_policies WHERE enabled=true ORDER BY station_id');
    const outcomes = [];
    for (const row of due.rows) {
      try { outcomes.push({ station_id: row.station_id, ...(await purgeStation(row.station_id, batchSize)) }); }
      catch { outcomes.push({ station_id: row.station_id, skipped: true, failed: true, reason: 'purge_failed' }); }
    }
    return outcomes;
  }

  return { captureDue, captureStation, list, preview, purgeDue, purgeStation, update };
}

module.exports = { makeStationHistoryService, policyInput };
