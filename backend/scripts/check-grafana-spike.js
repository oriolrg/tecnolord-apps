'use strict';

const ENDPOINT = 'https://grafana.commonscloud.coop/api/ds/query';
const DASHBOARD = 'https://grafana.commonscloud.coop/api/dashboards/uid/i2cat-public-jul27';
const DATASOURCE_UID = 'SWLXFBHvz';
const MAX_BYTES = 1024 * 1024;
const TIMEOUT_MS = 15000;
const WINDOW_MS = 15 * 60 * 1000;
const SENSORS = Object.freeze([
  { refId: 'A', sensor_id: 'Meteo-001-3100044', inventory_candidate: 'MLW28' },
  { refId: 'B', sensor_id: 'Meteo-007-3100206', inventory_candidate: 'MLW04' },
]);

async function boundedFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
    const declared = Number(response.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > MAX_BYTES) throw new Error('response_too_large');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) throw new Error('response_too_large');
    return { response, bytes };
  } finally { clearTimeout(timeout); }
}

function summarizeFrame(frame, from, to) {
  const fields = Array.isArray(frame?.schema?.fields) ? frame.schema.fields : [];
  const values = Array.isArray(frame?.data?.values) ? frame.data.values : [];
  const timestamps = Array.isArray(values[0]) ? values[0] : [];
  const readings = Array.isArray(values[1]) ? values[1] : [];
  const pairs = Math.min(timestamps.length, readings.length);
  let finite = 0; let nulls = 0; let inWindow = 0; let ordered = true;
  for (let index = 0; index < pairs; index += 1) {
    const timestamp = Number(timestamps[index]);
    const reading = readings[index];
    if (reading === null) nulls += 1;
    else if (Number.isFinite(Number(reading))) finite += 1;
    if (Number.isFinite(timestamp) && timestamp >= from && timestamp <= to) inWindow += 1;
    if (index > 0 && Number(timestamps[index - 1]) > timestamp) ordered = false;
  }
  return {
    ref_id: frame?.schema?.refId || null,
    fields: fields.map((field, index) => ({
      role: index === 0 ? 'time' : 'value', type: field?.type || null,
      unit: field?.config?.unit || null,
      label_keys: field?.labels && typeof field.labels === 'object' ? Object.keys(field.labels).sort() : [],
    })),
    point_pairs: pairs, finite_values: finite, null_values: nulls,
    timestamps_in_requested_window: inWindow, timestamps_ordered: ordered,
  };
}

async function main() {
  const endedAt = Date.now();
  const startedAt = endedAt - WINDOW_MS;
  const evidence = {
    checked_at: new Date(endedAt).toISOString(),
    constraints: { sensors: SENSORS.length, window_minutes: 15, timeout_ms: TIMEOUT_MS, max_response_bytes: MAX_BYTES },
    dashboard: { reachable: false, http_status: null },
    datasource: { endpoint: '/api/ds/query', uid: DATASOURCE_UID, anonymous_access: null, http_status: null },
    queries: [], outcome: 'NO_VERIFICAT',
  };
  try {
    const dashboard = await boundedFetch(DASHBOARD, { headers: { accept: 'application/json' } });
    evidence.dashboard.http_status = dashboard.response.status;
    evidence.dashboard.reachable = dashboard.response.ok;
  } catch (error) {
    evidence.dashboard.error_code = error?.name === 'AbortError' ? 'TIMEOUT' : 'UNAVAILABLE';
  }
  const body = {
    from: String(startedAt), to: String(endedAt),
    queries: SENSORS.map(({ refId, sensor_id }) => ({
      refId, datasource: { type: 'prometheus', uid: DATASOURCE_UID }, datasourceId: 11,
      editorMode: 'code', expr: `xoic_I2CAT_temperatura{tag4="${sensor_id}"}`,
      instant: false, range: true, intervalMs: 300000, maxDataPoints: 20,
    })),
  };
  try {
    const result = await boundedFetch(ENDPOINT, {
      method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    evidence.datasource.http_status = result.response.status;
    evidence.datasource.anonymous_access = result.response.status === 200;
    if (!result.response.ok) {
      evidence.datasource.error_code = `HTTP_${result.response.status}`;
    } else {
      const payload = JSON.parse(new TextDecoder().decode(result.bytes));
      evidence.queries = SENSORS.map((sensor) => {
        const query = payload?.results?.[sensor.refId];
        const frames = Array.isArray(query?.frames) ? query.frames : [];
        return {
          sensor_id: sensor.sensor_id, inventory_candidate: sensor.inventory_candidate,
          result_status: query?.status == null ? null : Number(query.status),
          frame_count: frames.length,
          frames: frames.map((frame) => summarizeFrame(frame, startedAt, endedAt)),
        };
      });
      const valid = evidence.queries.every((query) => query.frame_count > 0
        && query.frames.some((frame) => frame.point_pairs > 0 && frame.finite_values > 0));
      evidence.outcome = valid ? 'CONDICIONAL' : 'NO_VERIFICAT';
    }
  } catch (error) {
    evidence.datasource.error_code = error?.name === 'AbortError' ? 'TIMEOUT'
      : error?.message === 'response_too_large' ? 'RESPONSE_TOO_LARGE' : 'UNAVAILABLE';
  }
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
}

if (require.main === module) main().catch(() => {
  process.stdout.write(`${JSON.stringify({ outcome: 'NO_VERIFICAT', error_code: 'INTERNAL_ERROR' })}\n`);
});

module.exports = { SENSORS, summarizeFrame };
