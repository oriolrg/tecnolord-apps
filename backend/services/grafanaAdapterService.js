'use strict';

const { validPublicId } = require('./stationCatalogService');

const GRAFANA_ENDPOINT = 'https://grafana.commonscloud.coop/api/ds/query';
const DATASOURCE_UID = 'SWLXFBHvz';
const WINDOW_MS = 15 * 60 * 1000;
const INTERVAL_MS = 5 * 60 * 1000;
const MAX_POINTS = 20;
const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
const EXTERNAL_ID = /^Meteo-[0-9]{3}-[0-9]{5,8}$/;

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
    queries: [{
      refId: 'A', datasource: { type: 'prometheus', uid: DATASOURCE_UID }, datasourceId: 11,
      editorMode: 'code', expr: `xoic_I2CAT_temperatura{tag4="${externalId}"}`,
      instant: false, range: true, intervalMs: INTERVAL_MS, maxDataPoints: MAX_POINTS,
    }],
  };
}

function safeName(value, fallback) {
  return typeof value === 'string' && value.length >= 1 && value.length <= 120
    && !/[\u0000-\u001f\u007f]/.test(value) ? value : fallback;
}

function sourceUnit(field) {
  const value = field?.config?.unit;
  if (value == null || value === '') return { unit: null, basis: 'QUERY_CONTRACT' };
  if (['celsius', '°C', 'C', 'celcius'].includes(value)) return { unit: value, basis: 'SOURCE_DECLARED' };
  return null;
}

function normalizeGrafanaPayload(payload, { externalId, from, to } = {}) {
  if (!EXTERNAL_ID.test(externalId || '') || !Number.isFinite(from) || !Number.isFinite(to)) {
    return { ok: false, error: 'INVALID_REQUEST' };
  }
  const result = payload?.results?.A;
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
      const unit = sourceUnit(field);
      if (!unit) { warnings.add('UNSUPPORTED_UNIT'); continue; }
      if (!unit.unit) warnings.add('SOURCE_UNIT_UNDECLARED');
      const points = [];
      for (let index = 0; index < times.length; index += 1) {
        const timestamp = Number(times[index]);
        if (!Number.isFinite(timestamp)) { warnings.add('INVALID_TIMESTAMP'); continue; }
        if (timestamp < from || timestamp > to) continue;
        const raw = values[index];
        let value = null; let quality = 'MISSING';
        if (raw !== null && raw !== undefined) {
          if (typeof raw !== 'number' || !Number.isFinite(raw)) quality = 'INVALID';
          else if (raw < -80 || raw > 70) quality = 'OUT_OF_RANGE';
          else { value = raw; quality = 'VALID'; }
        }
        points.push({ observed_at: new Date(timestamp).toISOString(), value, quality });
      }
      points.sort((left, right) => left.observed_at.localeCompare(right.observed_at));
      series.push({
        id: `frame-${frameIndex + 1}-series-${valueIndex + 1}`,
        name: safeName(field?.name, 'Temperatura'), sensor_id: externalId,
        unit: 'celsius', source_unit: unit.unit, unit_basis: unit.basis, points,
      });
    }
  }
  if (series.length === 0) return { ok: false, error: mismatchedSensor ? 'SENSOR_MISMATCH' : 'INVALID_FRAMES', warnings: [...warnings] };
  if (series.every((item) => item.points.length === 0)) {
    return { ok: false, error: 'EMPTY_DATA', warnings: [...warnings].sort() };
  }
  return { ok: true, series, warnings: [...warnings].sort() };
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
      access_scope: 'INTERNAL_ONLY', fields: [{ id: 'temperature', unit: 'celsius' }],
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
    const endedAt = now();
    const from = endedAt.getTime() - WINDOW_MS;
    const body = buildGrafanaQuery(binding.rows[0].external_id, from, endedAt.getTime());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    try {
      response = await fetchImpl(GRAFANA_ENDPOINT, {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify(body),
      });
    } catch (error) {
      return { upstreamError: error?.name === 'AbortError' ? 'TIMEOUT' : 'UNAVAILABLE' };
    } finally { clearTimeout(timeout); }
    if (!response?.ok) {
      if ([401, 403].includes(response?.status)) return { upstreamError: 'AUTH_REQUIRED' };
      if (response?.status === 429) return { upstreamError: 'RATE_LIMITED' };
      return { upstreamError: Number(response?.status) >= 500 ? 'PROVIDER_UNAVAILABLE' : 'UPSTREAM_REJECTED' };
    }
    let payload;
    try { payload = await readJsonBounded(response); }
    catch (error) { return { upstreamError: error.message === 'RESPONSE_TOO_LARGE' ? error.message : 'INVALID_RESPONSE' }; }
    const normalized = normalizeGrafanaPayload(payload, {
      externalId: binding.rows[0].external_id, from, to: endedAt.getTime(),
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
        window: { from: new Date(from).toISOString(), to: endedAt.toISOString(), minutes: 15 },
        fetched_at: endedAt.toISOString(), series: normalized.series, warnings: normalized.warnings,
      },
    };
  }

  return { list, query };
}

module.exports = {
  DATASOURCE_UID, GRAFANA_ENDPOINT, MAX_BYTES, TIMEOUT_MS, WINDOW_MS,
  buildGrafanaQuery, makeGrafanaAdapterService, normalizeGrafanaPayload,
};
