'use strict';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_MS = 120_000;
const MAX_BYTES = 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function nowDate(clock) {
  const value = typeof clock === 'function' ? clock() : clock?.now ? clock.now() : Date.now();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError('Invalid estimation clock');
  return date;
}

function finite(value) { return typeof value === 'number' && Number.isFinite(value) ? value : null; }

function freshness(observedAt, now) {
  const age = observedAt ? now.getTime() - Date.parse(observedAt) : Infinity;
  if (age < -300_000) return 'INVALID';
  if (age <= 2 * 60 * 60 * 1000) return 'FRESH';
  if (age <= 8 * 60 * 60 * 1000) return 'STALE';
  return 'OBSOLETE';
}

function isoUtc(value) {
  if (typeof value !== 'string') return null;
  const instant = Date.parse(/Z$|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isFinite(instant) ? new Date(instant).toISOString() : null;
}

function buildUrl(points) {
  const url = new URL(OPEN_METEO_URL);
  url.searchParams.set('latitude', points.map((point) => point.reference.latitude).join(','));
  url.searchParams.set('longitude', points.map((point) => point.reference.longitude).join(','));
  url.searchParams.set('current', [
    'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'precipitation',
    'pressure_msl', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m', 'uv_index',
  ].join(','));
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'ms');
  url.searchParams.set('precipitation_unit', 'mm');
  url.searchParams.set('timezone', 'UTC');
  return url;
}

async function boundedJson(response) {
  if (!response?.ok) throw new Error(response?.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_UNAVAILABLE');
  const declared = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BYTES) throw new Error('RESPONSE_TOO_LARGE');
  if (typeof response.arrayBuffer === 'function') {
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) throw new Error('RESPONSE_TOO_LARGE');
    return JSON.parse(new TextDecoder().decode(buffer));
  }
  const text = await response.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_BYTES) throw new Error('RESPONSE_TOO_LARGE');
  return JSON.parse(text);
}

function pointDto(row) {
  return {
    kind: 'ESTIMATION', id: row.id, slug: row.slug, name: row.label,
    reference: {
      label: row.reference_label, longitude: Number(row.longitude), latitude: Number(row.latitude),
      provenance: row.reference_provenance,
    },
    source: { provider: 'OPEN_METEO', label: 'Open-Meteo', attribution: 'CC BY 4.0' },
  };
}

function normalize(point, result, now) {
  const current = result?.current;
  const observedAt = isoUtc(current?.time);
  const state = freshness(observedAt, now);
  const locationMatches = result?.latitude == null || result?.longitude == null
    || (Math.abs(Number(result.latitude) - point.reference.latitude) <= 0.15
      && Math.abs(Number(result.longitude) - point.reference.longitude) <= 0.15);
  if (!current || !observedAt || state === 'INVALID' || !locationMatches) {
    return { ...point, observed_at: observedAt, freshness: 'UNAVAILABLE', status: 'ERROR', values: null };
  }
  const values = {
    instant: observedAt,
    temp_c: finite(current.temperature_2m),
    sensacio_c: finite(current.apparent_temperature),
    humitat_pct: finite(current.relative_humidity_2m),
    taxa_pluja_mm_h: finite(current.precipitation),
    pressio_rel_hpa: finite(current.pressure_msl),
    vent_ms: finite(current.wind_speed_10m),
    vent_direccio_graus: finite(current.wind_direction_10m),
    vent_rafega_ms: finite(current.wind_gusts_10m),
    uvi: finite(current.uv_index),
  };
  return { ...point, observed_at: observedAt, freshness: state, status: 'AVAILABLE', values };
}

function mapFeature(item) {
  const isCurrent = item.status === 'AVAILABLE' && item.freshness !== 'OBSOLETE';
  const fields = [['temperature', 'celsius', item.values?.temp_c], ['humidity', 'percent', item.values?.humitat_pct]]
    .map(([fieldId, unit, value]) => ({
      field_id: fieldId, unit, current_value: isCurrent ? value : null, last_value: value,
      reliable: isCurrent && value !== null && item.freshness === 'FRESH',
      freshness: item.freshness === 'FRESH' ? 'FRESCA'
        : item.freshness === 'STALE' ? 'SENSE_DADES_RECENTS' : 'OBSOLETA',
      quality: value === null ? 'SOSPITOSA' : 'OK', review: 'NORMAL',
    }));
  return {
    type: 'Feature', id: item.id,
    geometry: { type: 'Point', coordinates: [item.reference.longitude, item.reference.latitude] },
    properties: {
      public_station_id: item.id, public_name: item.name, resource_kind: 'ESTIMATION', nature: 'ESTIMATED',
      geo_publication: 'REFERENCE', observed_at: item.observed_at,
      reference_label: item.reference.label, reference_provenance: item.reference.provenance,
      provenance: { source: 'Open-Meteo · estimació', licence_or_legal_basis_ref: 'CC BY 4.0 · https://open-meteo.com/' },
      sensors: [{ sensor_id: 'open-meteo-model', fields }],
    },
  };
}

function makeEstimationService({ pool, fetch: fetchImpl, clock, cacheMs = CACHE_MS } = {}) {
  if (!pool?.query || typeof fetchImpl !== 'function') throw new TypeError('Estimation dependencies are required');
  let cache = null; let expiresAt = 0; let pending = null;
  async function list() {
    const result = await pool.query(`
      SELECT id,slug,label,reference_label,reference_provenance,
        public.ST_X(reference_geometry) AS longitude,public.ST_Y(reference_geometry) AS latitude
      FROM meteo.estimation_points WHERE enabled=true ORDER BY slug
    `);
    return result.rows.map(pointDto);
  }
  async function snapshot() {
    const now = nowDate(clock);
    if (cache && now.getTime() < expiresAt) return cache;
    if (pending) return pending;
    pending = (async () => {
      const points = await list();
      let payload;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try { payload = await boundedJson(await fetchImpl(buildUrl(points), { headers: { accept: 'application/json' }, signal: controller.signal })); }
        finally { clearTimeout(timeout); }
      } catch { payload = null; }
      const results = Array.isArray(payload) ? payload : points.length === 1 && payload ? [payload] : [];
      cache = points.map((point, index) => normalize(point, results[index], now));
      expiresAt = now.getTime() + cacheMs;
      return cache;
    })().finally(() => { pending = null; });
    return pending;
  }
  async function current(id) {
    if (!UUID.test(id || '')) return null;
    return (await snapshot()).find((item) => item.id === id) || null;
  }
  async function mapFeatures() { return (await snapshot()).map(mapFeature); }
  return { current, list, mapFeatures, snapshot };
}

module.exports = { CACHE_MS, OPEN_METEO_URL, buildUrl, makeEstimationService, mapFeature, normalize };
