'use strict';

const { fetchEcowittConnector, kmhToMs, numberOrNull } = require('./ecowittService');
const { freshnessAt } = require('./sourceCadence');

const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

function resolveNow(clock) {
  const read = typeof clock === 'function' ? clock : clock?.now?.bind(clock);
  if (!read) return () => new Date();
  return () => {
    const value = new Date(read());
    if (Number.isNaN(value.getTime())) throw new TypeError('Snapshot clock returned an invalid instant');
    return value;
  };
}

const FIELD_RULES = Object.freeze({
  temp_c: [-80, 70], sensacio_c: [-100, 80], punt_rosada_c: [-100, 70],
  humitat_pct: [0, 100], solar_wm2: [0, 2000], uvi: [0, 30],
  taxa_pluja_mm_h: [0, 1000], pluja_diaria_mm: [0, 3000], pluja_event_mm: [0, 10000],
  pluja_hora_mm: [0, 1000], pluja_setmana_mm: [0, 10000], pluja_mes_mm: [0, 20000],
  pluja_any_mm: [0, 100000], vent_ms: [0, 150], vent_rafega_ms: [0, 150],
  vent_direccio_graus: [0, 360], pressio_rel_hpa: [800, 1200],
  pressio_abs_hpa: [500, 1200], bateria_pct: [0, 100],
});

function field(value, name, convert = numberOrNull) {
  const converted = convert(value);
  if (converted === null) return { value: null, quality: value == null || value === '' ? 'MISSING' : 'INVALID' };
  const [minimum, maximum] = FIELD_RULES[name];
  return converted >= minimum && converted <= maximum
    ? { value: converted, quality: 'VALID' }
    : { value: null, quality: 'OUT_OF_RANGE' };
}

function normalizeEcowittSnapshot(payload, now = new Date()) {
  const epochSeconds = Number(payload?.time);
  if (!Number.isFinite(epochSeconds)) return { ok: false, error: 'INVALID_TIMESTAMP' };
  const observedAt = new Date(epochSeconds * 1000);
  if (Number.isNaN(observedAt.getTime())) return { ok: false, error: 'INVALID_TIMESTAMP' };
  if (observedAt.getTime() > new Date(now).getTime() + FUTURE_TOLERANCE_MS) {
    return { ok: false, error: 'FUTURE_TIMESTAMP' };
  }
  const d = payload?.data || {};
  const inputs = {
    temp_c: d?.outdoor?.temperature?.value,
    sensacio_c: d?.outdoor?.feels_like?.value,
    punt_rosada_c: d?.outdoor?.dew_point?.value,
    humitat_pct: d?.outdoor?.humidity?.value,
    solar_wm2: d?.solar_and_uvi?.solar?.value,
    uvi: d?.solar_and_uvi?.uvi?.value,
    taxa_pluja_mm_h: d?.rainfall?.rain_rate?.value,
    pluja_diaria_mm: d?.rainfall?.daily?.value,
    pluja_event_mm: d?.rainfall?.event?.value,
    pluja_hora_mm: d?.rainfall?.['1_hour']?.value,
    pluja_setmana_mm: d?.rainfall?.weekly?.value,
    pluja_mes_mm: d?.rainfall?.monthly?.value,
    pluja_any_mm: d?.rainfall?.yearly?.value,
    vent_ms: d?.wind?.wind_speed?.value,
    vent_rafega_ms: d?.wind?.wind_gust?.value,
    vent_direccio_graus: d?.wind?.wind_direction?.value,
    pressio_rel_hpa: d?.pressure?.relative?.value,
    pressio_abs_hpa: d?.pressure?.absolute?.value,
    bateria_pct: d?.battery?.sensor_array?.value,
  };
  const values = {};
  const fields = {};
  for (const [name, input] of Object.entries(inputs)) {
    const result = field(input, name, name === 'vent_ms' || name === 'vent_rafega_ms' ? kmhToMs : numberOrNull);
    values[name] = result.value;
    fields[name] = result.quality;
  }
  return {
    ok: true,
    observedAt,
    values,
    quality: { freshness: freshnessAt(observedAt, now), fields },
  };
}

function publicError(reason) {
  const allowed = new Set(['timeout', 'http_429', 'response_too_large', 'invalid_json', 'empty_data']);
  if (allowed.has(reason) || /^http_5\d\d$/.test(reason || '')) return reason.toUpperCase();
  return 'PROVIDER_ERROR';
}

function makeSnapshotService({
  pool, connectorRegistry, grafana, fetch: fetchImpl, clock,
  sourceIntervals = {}, grafanaEnabled = false,
} = {}) {
  if (!pool?.connect || !connectorRegistry?.credentialsForStation || typeof fetchImpl !== 'function'
      || (grafanaEnabled && typeof grafana?.fetchSnapshot !== 'function')) {
    throw new TypeError('Snapshot service dependencies are required');
  }
  const now = resolveNow(clock);

  function intervalFor(sourceNamespace) {
    return sourceIntervals[sourceNamespace];
  }

  async function storeFailure(binding, fetchedAt, reason) {
    const comparison = binding.source_namespace === 'GRAFANA' ? '>' : '>=';
    await pool.query(`
      INSERT INTO meteo.current_snapshots(binding_id,fetched_at,received_at,provider_error)
      VALUES ($1,$2,$2,$3)
      ON CONFLICT (binding_id) DO UPDATE
      SET fetched_at=EXCLUDED.fetched_at,received_at=EXCLUDED.received_at,provider_error=EXCLUDED.provider_error
      WHERE EXCLUDED.fetched_at ${comparison} meteo.current_snapshots.fetched_at
    `, [binding.id, fetchedAt, reason]);
  }

  async function storeSuccess(binding, stationId, normalized, fetchedAt) {
    const quality = {
      ...(normalized.quality || {}),
      freshness: freshnessAt(normalized.observedAt, fetchedAt, intervalFor(binding.source_namespace)),
    };
    const comparison = binding.source_namespace === 'GRAFANA' ? '>' : '>=';
    const stored = await pool.query(`
      INSERT INTO meteo.current_snapshots(
        binding_id,observed_at,received_at,fetched_at,values_json,quality_json,provider_error
      ) VALUES ($1,$2,$3,$3,$4,$5,NULL)
      ON CONFLICT (binding_id) DO UPDATE SET
        observed_at=EXCLUDED.observed_at,received_at=EXCLUDED.received_at,fetched_at=EXCLUDED.fetched_at,
        values_json=EXCLUDED.values_json,quality_json=EXCLUDED.quality_json,provider_error=NULL
      WHERE meteo.current_snapshots.observed_at IS NULL
         OR EXCLUDED.observed_at ${comparison} meteo.current_snapshots.observed_at
      RETURNING binding_id
    `, [binding.id, normalized.observedAt, fetchedAt,
      JSON.stringify(normalized.values), JSON.stringify(quality)]);
    if (stored.rowCount === 1) {
      await pool.query(`
        UPDATE meteo.estacions SET lifecycle='ACTIVE',revision=revision+1
        WHERE id=$1 AND lifecycle='DRAFT'
      `, [stationId]);
    }
    return stored.rowCount === 1;
  }

  async function refreshStation(stationId) {
    if (!Number.isSafeInteger(Number(stationId)) || Number(stationId) <= 0) return { skipped: true, reason: 'invalid_station' };
    const client = await pool.connect();
    let locked = false;
    try {
      const lease = await client.query('SELECT pg_try_advisory_lock($1,$2) AS locked', [71013, Number(stationId)]);
      locked = lease.rows[0]?.locked === true;
      if (!locked) return { skipped: true, reason: 'lease_busy' };
      const bindingResult = await client.query(`
        SELECT b.id,b.source_namespace,b.external_id,e.management_kind,e.lifecycle,
               c.enabled AS connector_enabled,c.status AS connector_status
        FROM meteo.source_bindings b
        JOIN meteo.estacions e ON e.id=b.station_id
        LEFT JOIN meteo.station_connectors c ON c.station_id=e.id
        WHERE b.station_id=$1 AND b.binding_status='VALIDATED'
          AND b.source_namespace IN ('ECOWITT','GRAFANA') AND e.lifecycle<>'RETIRED'
        ORDER BY b.id
      `, [stationId]);
      if (bindingResult.rowCount === 0) return { skipped: true, reason: 'binding_unavailable' };
      if (bindingResult.rowCount !== 1) return { skipped: true, reason: 'ambiguous_binding' };
      const binding = bindingResult.rows[0];
      if (binding.source_namespace === 'GRAFANA' && !grafanaEnabled) {
        return { skipped: true, reason: 'source_disabled' };
      }
      if (binding.source_namespace === 'GRAFANA' && binding.management_kind !== 'ADMIN') {
        return { skipped: true, reason: 'station_ineligible' };
      }
      const fetchedAt = now();
      let normalized;
      if (binding.source_namespace === 'ECOWITT') {
        if (binding.connector_enabled !== true || binding.connector_status !== 'READY') {
          return { skipped: true, reason: 'connector_unavailable' };
        }
        const credentials = await connectorRegistry.credentialsForStation(stationId);
        if (!credentials) return { skipped: true, reason: 'connector_unavailable' };
        const fetched = await fetchEcowittConnector(credentials, fetchImpl, 10000, 2 * 1024 * 1024);
        if (!fetched.ok) normalized = { ok: false, error: publicError(fetched.reason) };
        else normalized = normalizeEcowittSnapshot(fetched.payload, fetchedAt);
      } else {
        normalized = await grafana.fetchSnapshot({ external_id: binding.external_id });
      }
      if (!normalized.ok) {
        await storeFailure(binding, fetchedAt, normalized.error);
        return { skipped: false, updated: false, error: normalized.error };
      }
      const updated = await storeSuccess(binding, stationId, normalized, fetchedAt);
      return {
        skipped: false, updated, source: binding.source_namespace,
        observed_at: normalized.observedAt.toISOString(),
      };
    } finally {
      if (locked) await client.query('SELECT pg_advisory_unlock($1,$2)', [71013, Number(stationId)]);
      client.release();
    }
  }

  async function readCurrent(stationId) {
    const result = await pool.query(`
      SELECT b.source_namespace,s.observed_at,s.received_at,s.fetched_at,
             s.values_json,s.quality_json,s.provider_error
      FROM meteo.source_bindings b LEFT JOIN meteo.current_snapshots s ON s.binding_id=b.id
      WHERE b.station_id=$1 AND b.binding_status='VALIDATED'
      ORDER BY b.id LIMIT 1
    `, [stationId]);
    if (result.rowCount !== 1) return null;
    const row = result.rows[0];
    if (!row.fetched_at) {
      return row.source_namespace === 'GRAFANA' ? {
        item: null,
        source: {
          freshness: 'UNKNOWN', observed_at: null, fetched_at: null, error: null,
          quality: { freshness: 'UNKNOWN' },
        },
      } : null;
    }
    const freshness = row.observed_at
      ? freshnessAt(row.observed_at, now(), intervalFor(row.source_namespace))
      : 'UNKNOWN';
    const values = freshness === 'OBSOLETE'
      ? Object.fromEntries(Object.keys(row.values_json || {}).map((key) => [key, null]))
      : (row.values_json || {});
    return {
      item: row.observed_at ? { instant: row.observed_at, ...values } : null,
      source: {
        freshness,
        observed_at: row.observed_at,
        fetched_at: row.fetched_at,
        error: row.provider_error,
        quality: { ...(row.quality_json || {}), freshness },
      },
    };
  }

  async function refreshReadyStations() {
    const result = await pool.query(`
      SELECT DISTINCT e.id
      FROM meteo.estacions e
      JOIN meteo.source_bindings b ON b.station_id=e.id
      LEFT JOIN meteo.station_connectors c ON c.station_id=e.id
      WHERE e.lifecycle<>'RETIRED' AND b.binding_status='VALIDATED'
        AND (
          (b.source_namespace='ECOWITT' AND c.enabled=true AND c.status='READY')
          OR ($1::boolean AND b.source_namespace='GRAFANA' AND e.management_kind='ADMIN')
        )
      ORDER BY e.id
    `, [grafanaEnabled]);
    const outcomes = [];
    let cursor = 0;
    async function worker() {
      while (cursor < result.rows.length) {
        const row = result.rows[cursor++];
        outcomes.push({ station_id: row.id, ...(await refreshStation(row.id)) });
      }
    }
    await Promise.all([worker(), worker()]);
    return { stations: outcomes.length, outcomes };
  }

  return { readCurrent, refreshReadyStations, refreshStation };
}

module.exports = { freshnessAt, makeSnapshotService, normalizeEcowittSnapshot };
