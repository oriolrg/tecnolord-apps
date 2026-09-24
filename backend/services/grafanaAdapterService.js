'use strict';

const { validPublicId } = require('./stationCatalogService');

const GRAFANA_ENDPOINT = 'https://grafana.commonscloud.coop/api/ds/query';
const DATASOURCE_UID = 'SWLXFBHvz';
const WINDOW_MS = 30 * 60 * 1000;
const INTERVAL_MS = 5 * 60 * 1000;
const MAX_POINTS = 20;
const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
const EXTERNAL_ID = /^Meteo-[0-9]{3}-[0-9]{5,8}$/;
const CANONICAL_SNAPSHOT_FIELDS = Object.freeze([
  'temp_c', 'sensacio_c', 'punt_rosada_c', 'humitat_pct', 'solar_wm2', 'uvi',
  'taxa_pluja_mm_h', 'pluja_diaria_mm', 'pluja_event_mm', 'pluja_hora_mm',
  'pluja_setmana_mm', 'pluja_mes_mm', 'pluja_any_mm', 'vent_ms', 'vent_rafega_ms',
  'vent_direccio_graus', 'pressio_rel_hpa', 'pressio_abs_hpa', 'bateria_pct',
]);
const SNAPSHOT_METRICS = Object.freeze([
  Object.freeze({
    refId: 'A', canonicalField: 'temp_c', metric: 'xoic_I2CAT_temperatura',
    name: 'Temperatura', unit: 'celsius', minimum: -80, maximum: 70,
    sourceUnits: Object.freeze(['celsius', '°C', 'C', 'celcius']),
  }),
  Object.freeze({
    refId: 'B', canonicalField: 'humitat_pct', metric: 'xoic_I2CAT_humitat',
    name: 'Humitat relativa', unit: 'percent', minimum: 0, maximum: 100,
    sourceUnits: Object.freeze(['humidity', 'percent', 'percentunit', '%']),
  }),
]);

function resolveNow(clock) {
  const read = typeof clock === 'function' ? clock : clock?.now?.bind(clock);
  return () => {
    const value = new Date(read ? read() : Date.now());
    if (Number.isNaN(value.getTime())) throw new TypeError('Grafana clock returned an invalid instant');
    return value;
  };
}

function buildGrafanaQuery(externalId, from, to) {
  if (!EXTERNAL_ID.test(externalId) || !Number.isSafeInteger(from) || !Number.isSafeInteger(to)
      || to <= from || to - from !== WINDOW_MS) return null;
  return {
    from: String(from), to: String(to),
    queries: SNAPSHOT_METRICS.map((metric) => ({
      refId: metric.refId, datasource: { type: 'prometheus', uid: DATASOURCE_UID }, datasourceId: 11,
      editorMode: 'code', expr: `${metric.metric}{tag4="${externalId}"}`,
      instant: false, range: true, intervalMs: INTERVAL_MS, maxDataPoints: MAX_POINTS,
    })),
  };
}

function safeName(value, fallback) {
  return typeof value === 'string' && value.length >= 1 && value.length <= 120
    && !/[\u0000-\u001f\u007f]/.test(value) ? value : fallback;
}

function sourceUnit(field, metric) {
  const value = field?.config?.unit;
  if (value == null || value === '') return { unit: null, basis: 'QUERY_CONTRACT' };
  if (metric.sourceUnits.includes(value)) return { unit: value, basis: 'SOURCE_DECLARED' };
  return null;
}

function normalizeGrafanaMetric(payload, { externalId, from, to } = {}, metric = SNAPSHOT_METRICS[0]) {
  if (!EXTERNAL_ID.test(externalId || '') || !Number.isFinite(from) || !Number.isFinite(to)) {
    return { ok: false, error: 'INVALID_REQUEST' };
  }
  const result = payload?.results?.[metric.refId];
  if (!result || result.error || (result.status != null && Number(result.status) >= 400)) {
    return { ok: false, error: 'QUERY_ERROR' };
  }
  if (!Array.isArray(result.frames) || result.frames.length === 0) return { ok: false, error: 'EMPTY_DATA' };
  const warnings = new Set();
  const series = [];
  let mismatchedSensor = false;
  for (const [frameIndex, frame] of result.frames.entries()) {
    const fields = frame?.schema?.fields;
    const columns = frame?.data?.values;
    if (!Array.isArray(fields) || !Array.isArray(columns) || fields.length !== columns.length) {
      warnings.add('INVALID_FRAME_SCHEMA'); continue;
    }
    const timeIndexes = fields.map((field, index) => field?.type === 'time' ? index : -1).filter((index) => index >= 0);
    const valueIndexes = fields.map((field, index) => field?.type === 'number' ? index : -1).filter((index) => index >= 0);
    if (timeIndexes.length !== 1 || valueIndexes.length === 0 || !Array.isArray(columns[timeIndexes[0]])) {
      warnings.add('INVALID_FRAME_SCHEMA'); continue;
    }
    const times = columns[timeIndexes[0]];
    for (const valueIndex of valueIndexes) {
      const field = fields[valueIndex];
      const values = columns[valueIndex];
      if (!Array.isArray(values) || values.length !== times.length) {
        warnings.add('INCONSISTENT_LENGTH'); continue;
      }
      const labels = field?.labels && typeof field.labels === 'object' && !Array.isArray(field.labels)
        ? field.labels : {};
      const labelledSensor = labels.tag4 || labels.sensor_id || labels.station;
      if (labelledSensor != null && labelledSensor !== externalId) {
        mismatchedSensor = true; warnings.add('SENSOR_MISMATCH'); continue;
      }
      const unit = sourceUnit(field, metric);
      if (!unit) { warnings.add('UNSUPPORTED_UNIT'); continue; }
      if (!unit.unit) warnings.add('SOURCE_UNIT_UNDECLARED');
      const points = [];
      for (let index = 0; index < times.length; index += 1) {
        const timestamp = Number(times[index]);
        if (!Number.isFinite(timestamp)) { warnings.add('INVALID_TIMESTAMP'); continue; }
        if (timestamp > to) { warnings.add('FUTURE_TIMESTAMP'); continue; }
        if (timestamp < from) continue;
        const raw = values[index];
        let value = null; let quality = 'MISSING';
        if (raw !== null && raw !== undefined) {
          if (typeof raw !== 'number' || !Number.isFinite(raw)) quality = 'INVALID';
          else if (raw < metric.minimum || raw > metric.maximum) quality = 'OUT_OF_RANGE';
          else { value = raw; quality = 'VALID'; }
        }
        points.push({ observed_at: new Date(timestamp).toISOString(), value, quality });
      }
      points.sort((left, right) => left.observed_at.localeCompare(right.observed_at));
      series.push({
        id: `frame-${frameIndex + 1}-series-${valueIndex + 1}`,
        name: safeName(field?.name, metric.name), sensor_id: externalId,
        canonical_field: metric.canonicalField,
        unit: metric.unit, source_unit: unit.unit, unit_basis: unit.basis, points,
      });
    }
  }
  if (series.length === 0) return { ok: false, error: mismatchedSensor ? 'SENSOR_MISMATCH' : 'INVALID_FRAMES', warnings: [...warnings] };
  if (series.every((item) => item.points.length === 0)) {
    return { ok: false, error: 'EMPTY_DATA', warnings: [...warnings].sort() };
  }
  return { ok: true, series, warnings: [...warnings].sort() };
}

function normalizeGrafanaPayload(payload, options = {}) {
  return normalizeGrafanaMetric(payload, options, SNAPSHOT_METRICS[0]);
}

function snapshotSeriesIdentityError(payload, externalId, metric = SNAPSHOT_METRICS[0]) {
  const frames = payload?.results?.[metric.refId]?.frames;
  if (!Array.isArray(frames)) return null;
  for (const frame of frames) {
    const fields = frame?.schema?.fields;
    if (!Array.isArray(fields)) continue;
    let temperatureSeries = 0;
    for (const field of fields) {
      if (field?.type !== 'number') continue;
      const labels = field?.labels && typeof field.labels === 'object' && !Array.isArray(field.labels)
        ? field.labels : {};
      const labelledSensor = labels.tag4 || labels.sensor_id || labels.station;
      if (labelledSensor == null) return 'AMBIGUOUS_SERIES';
      if (labelledSensor !== externalId) return 'SENSOR_MISMATCH';
      temperatureSeries += 1;
    }
    if (temperatureSeries > 1) return 'AMBIGUOUS_SERIES';
  }
  return null;
}

function normalizeGrafanaSnapshot(payload, options = {}) {
  const values = Object.fromEntries(CANONICAL_SNAPSHOT_FIELDS.map((field) => [field, null]));
  const fields = Object.fromEntries(CANONICAL_SNAPSHOT_FIELDS.map((field) => [field, 'MISSING']));
  const observedAtByField = {};
  const units = {};
  const warnings = new Set();
  const errors = [];

  for (const metric of SNAPSHOT_METRICS) {
    const identityError = snapshotSeriesIdentityError(payload, options.externalId, metric);
    if (identityError) {
      fields[metric.canonicalField] = 'INVALID';
      errors.push(identityError);
      continue;
    }
    const normalized = normalizeGrafanaMetric(payload, options, metric);
    for (const warning of normalized.warnings || []) warnings.add(warning);
    if (!normalized.ok) {
      let error = normalized.error;
      if (error === 'EMPTY_DATA' && normalized.warnings?.includes('FUTURE_TIMESTAMP')) error = 'FUTURE_TIMESTAMP';
      if (error === 'EMPTY_DATA' && normalized.warnings?.includes('INVALID_TIMESTAMP')) error = 'INVALID_TIMESTAMP';
      errors.push(error);
      fields[metric.canonicalField] = ['EMPTY_DATA', 'QUERY_ERROR'].includes(error) ? 'MISSING' : 'INVALID';
      continue;
    }

    const byTimestamp = new Map();
    let latestRejectedQuality = 'MISSING';
    for (const series of normalized.series) {
      for (const point of series.points) {
        if (point.quality !== 'VALID') {
          latestRejectedQuality = point.quality;
          continue;
        }
        const existing = byTimestamp.get(point.observed_at);
        if (existing && existing.value !== point.value) {
          errors.push('AMBIGUOUS_OBSERVATION');
          fields[metric.canonicalField] = 'INVALID';
          byTimestamp.clear();
          break;
        }
        if (!existing || (existing.unit_basis !== 'SOURCE_DECLARED' && series.unit_basis === 'SOURCE_DECLARED')) {
          byTimestamp.set(point.observed_at, {
            value: point.value,
            source_unit: series.source_unit,
            unit_basis: series.unit_basis,
          });
        }
      }
      if (fields[metric.canonicalField] === 'INVALID') break;
    }
    if (byTimestamp.size === 0) {
      if (fields[metric.canonicalField] !== 'INVALID') fields[metric.canonicalField] = latestRejectedQuality;
      errors.push('NO_VALID_VALUE');
      continue;
    }
    const observedAtText = [...byTimestamp.keys()].sort().at(-1);
    const selected = byTimestamp.get(observedAtText);
    values[metric.canonicalField] = selected.value;
    fields[metric.canonicalField] = 'VALID';
    observedAtByField[metric.canonicalField] = observedAtText;
    units[metric.canonicalField] = {
      canonical: metric.unit, source_unit: selected.source_unit, unit_basis: selected.unit_basis,
    };
  }

  const validTimestamps = Object.values(observedAtByField).sort();
  if (validTimestamps.length === 0) {
    const error = errors.find((item) => !['QUERY_ERROR', 'EMPTY_DATA', 'NO_VALID_VALUE'].includes(item))
      || (errors.includes('NO_VALID_VALUE') ? 'NO_VALID_VALUE' : errors[0] || 'QUERY_ERROR');
    return { ok: false, error, ...(warnings.size ? { warnings: [...warnings].sort() } : {}) };
  }

  return {
    ok: true,
    observedAt: new Date(validTimestamps.at(-1)),
    values,
    quality: {
      fields,
      observed_at_by_field: observedAtByField,
      warnings: [...warnings].sort(),
      units,
    },
  };
}

async function readJsonBounded(response) {
  const declared = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BYTES) throw new Error('RESPONSE_TOO_LARGE');
  let text;
  if (typeof response.arrayBuffer === 'function') {
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) throw new Error('RESPONSE_TOO_LARGE');
    text = new TextDecoder().decode(buffer);
  } else {
    text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > MAX_BYTES) throw new Error('RESPONSE_TOO_LARGE');
  }
  try { return JSON.parse(text); } catch { throw new Error('INVALID_JSON'); }
}

function makeGrafanaAdapterService({ pool, fetch: fetchImpl, clock, enabled = false } = {}) {
  if (!pool?.query || typeof fetchImpl !== 'function') throw new TypeError('Grafana adapter dependencies are required');
  const now = resolveNow(clock);

  async function fetchPayload(externalId) {
    if (!enabled) return { ok: false, error: 'DISABLED' };
    if (!EXTERNAL_ID.test(externalId || '')) return { ok: false, error: 'INVALID_BINDING' };
    const endedAt = now();
    const from = endedAt.getTime() - WINDOW_MS;
    const body = buildGrafanaQuery(externalId, from, endedAt.getTime());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    try {
      response = await fetchImpl(GRAFANA_ENDPOINT, {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify(body),
      });
    } catch (error) {
      return { ok: false, error: error?.name === 'AbortError' ? 'TIMEOUT' : 'UNAVAILABLE' };
    } finally { clearTimeout(timeout); }
    if (!response?.ok) {
      if ([401, 403].includes(response?.status)) return { ok: false, error: 'AUTH_REQUIRED' };
      if (response?.status === 429) return { ok: false, error: 'RATE_LIMITED' };
      return {
        ok: false,
        error: Number(response?.status) >= 500 ? 'PROVIDER_UNAVAILABLE' : 'UPSTREAM_REJECTED',
      };
    }
    try {
      return {
        ok: true, payload: await readJsonBounded(response),
        externalId, from, to: endedAt.getTime(), fetchedAt: endedAt,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message === 'RESPONSE_TOO_LARGE' ? 'RESPONSE_TOO_LARGE' : 'INVALID_JSON',
      };
    }
  }

  async function list() {
    const result = await pool.query(`
      SELECT e.public_id,e.nom,b.external_id
      FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
      WHERE e.management_kind='ADMIN' AND e.lifecycle<>'RETIRED'
        AND b.source_namespace='GRAFANA' AND b.binding_status='VALIDATED'
      ORDER BY e.nom,e.id
    `);
    return result.rows.map((row) => ({
      id: row.public_id, name: row.nom, external_id: row.external_id,
      access_scope: 'INTERNAL_ONLY', fields: [
        { id: 'temperature', unit: 'celsius' },
        { id: 'humidity', unit: 'percent' },
      ],
      rain_enabled: false,
    }));
  }

  async function query(publicId) {
    if (!validPublicId(publicId)) return { notFound: true };
    if (!enabled) return { disabled: true };
    const binding = await pool.query(`
      SELECT e.public_id,e.nom,b.external_id
      FROM meteo.estacions e JOIN meteo.source_bindings b ON b.station_id=e.id
      WHERE e.public_id=$1 AND e.management_kind='ADMIN' AND e.lifecycle<>'RETIRED'
        AND b.source_namespace='GRAFANA' AND b.binding_status='VALIDATED' LIMIT 1
    `, [publicId]);
    if (binding.rowCount !== 1 || !EXTERNAL_ID.test(binding.rows[0].external_id)) return { notFound: true };
    const fetched = await fetchPayload(binding.rows[0].external_id);
    if (!fetched.ok) {
      return { upstreamError: fetched.error === 'INVALID_JSON' ? 'INVALID_RESPONSE' : fetched.error };
    }
    const normalized = normalizeGrafanaPayload(fetched.payload, {
      externalId: fetched.externalId, from: fetched.from, to: fetched.to,
    });
    if (!normalized.ok) return { upstreamError: normalized.error, warnings: normalized.warnings || [] };
    return {
      data: {
        station: { id: binding.rows[0].public_id, name: binding.rows[0].nom },
        source: {
          namespace: 'GRAFANA', external_id: binding.rows[0].external_id,
          access_scope: 'INTERNAL_ONLY', datasource_uid: DATASOURCE_UID,
          persistence: 'DISABLED', rain_enabled: false,
        },
        window: {
          from: new Date(fetched.from).toISOString(),
          to: fetched.fetchedAt.toISOString(),
          minutes: WINDOW_MS / 60_000,
        },
        fetched_at: fetched.fetchedAt.toISOString(), series: normalized.series, warnings: normalized.warnings,
      },
    };
  }

  async function fetchSnapshot(binding) {
    const fetched = await fetchPayload(binding?.external_id);
    if (!fetched.ok) return fetched;
    return normalizeGrafanaSnapshot(fetched.payload, {
      externalId: fetched.externalId, from: fetched.from, to: fetched.to,
    });
  }

  return { fetchSnapshot, list, query };
}

module.exports = {
  CANONICAL_SNAPSHOT_FIELDS, DATASOURCE_UID, GRAFANA_ENDPOINT, MAX_BYTES, SNAPSHOT_METRICS, TIMEOUT_MS, WINDOW_MS,
  buildGrafanaQuery, makeGrafanaAdapterService, normalizeGrafanaPayload, normalizeGrafanaSnapshot,
};
