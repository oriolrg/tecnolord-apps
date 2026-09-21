// backend/services/ecowittService.js
// - Pull Ecowitt -> INSERT mesures
// - Fallback: ECW_* -> si falla/buit -> ECW_FB_*
// - Si no hi ha dades bones: skipped=true (no peta)

const { NULL_LOGGER, isLogger } = require('../lib/logger');

function resolveFetch(injectedFetch, httpClient) {
  const transport = injectedFetch ?? httpClient ?? globalThis.fetch;
  if (typeof transport !== 'function') throw new TypeError('Ecowitt fetch must be a function');
  return transport;
}

function resolveClock(clock) {
  const now = clock === undefined
    ? () => new Date()
    : typeof clock === 'function'
      ? clock
      : clock?.now?.bind(clock);
  if (typeof now !== 'function') throw new TypeError('Ecowitt clock must be a function or implement now()');
  return () => {
    const instant = new Date(now());
    if (Number.isNaN(instant.getTime())) throw new TypeError('Ecowitt clock returned an invalid instant');
    return instant;
  };
}

function kmhToMs(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n / 3.6 : null;
}

function numberOrNull(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function envGet(prefix, key, fallback = undefined) {
  const v = process.env[`${prefix}_${key}`];
  return (v === undefined || v === '') ? fallback : v;
}

function hasEcw(prefix) {
  return !!(
    process.env[`${prefix}_APPLICATION_KEY`] &&
    process.env[`${prefix}_API_KEY`] &&
    process.env[`${prefix}_MAC`]
  );
}

function ecowittURL(prefix = 'ECW') {
  const params = new URLSearchParams({
    application_key: envGet(prefix, 'APPLICATION_KEY'),
    api_key: envGet(prefix, 'API_KEY'),
    mac: envGet(prefix, 'MAC'),
    call_back: 'all',
    temp_unitid: envGet(prefix, 'TEMP_UNITID', process.env.ECW_TEMP_UNITID || '1'),
    wind_speed_unitid: envGet(prefix, 'WIND_SPEED_UNITID', process.env.ECW_WIND_SPEED_UNITID || '8'),
    rainfall_unitid: envGet(prefix, 'RAINFALL_UNITID', process.env.ECW_RAINFALL_UNITID || '12'),
    pressure_unitid: envGet(prefix, 'PRESSURE_UNITID', process.env.ECW_PRESSURE_UNITID || '3'),
  });
  return `https://api.ecowitt.net/api/v3/device/real_time?${params.toString()}`;
}

function ecowittURLForConnector(configuration, secrets) {
  const expected = {
    endpoint: 'ECOWITT_V3_REAL_TIME', temp_unitid: '1', wind_speed_unitid: '8',
    rainfall_unitid: '12', pressure_unitid: '3',
  };
  if (!configuration || Object.entries(expected).some(([key, value]) => configuration[key] !== value)) {
    throw new TypeError('Invalid Ecowitt connector configuration');
  }
  if (!secrets || !secrets.application_key || !secrets.api_key || !secrets.mac) {
    throw new TypeError('Incomplete Ecowitt connector secrets');
  }
  const params = new URLSearchParams({
    application_key: secrets.application_key,
    api_key: secrets.api_key,
    mac: secrets.mac,
    call_back: 'all',
    temp_unitid: configuration.temp_unitid,
    wind_speed_unitid: configuration.wind_speed_unitid,
    rainfall_unitid: configuration.rainfall_unitid,
    pressure_unitid: configuration.pressure_unitid,
  });
  return `https://api.ecowitt.net/api/v3/device/real_time?${params}`;
}

function isEcowittEmpty(data) {
  if (!data || typeof data !== 'object') return true;
  if (Array.isArray(data)) return data.length === 0;
  if (Object.keys(data).length === 0) return true;

  const pick = [
    data?.outdoor?.temperature?.value,
    data?.outdoor?.feels_like?.value,
    data?.outdoor?.dew_point?.value,
    data?.outdoor?.humidity?.value,
    data?.solar_and_uvi?.solar?.value,
    data?.solar_and_uvi?.uvi?.value,
    data?.rainfall?.['rain_rate']?.value,
    data?.rainfall?.daily?.value,
    data?.rainfall?.event?.value,
    data?.rainfall?.['1_hour']?.value,
    data?.rainfall?.weekly?.value,
    data?.rainfall?.monthly?.value,
    data?.rainfall?.yearly?.value,
    data?.wind?.wind_speed?.value,
    data?.wind?.wind_gust?.value,
    data?.wind?.wind_direction?.value,
    data?.pressure?.relative?.value,
    data?.pressure?.absolute?.value,
    data?.battery?.sensor_array?.value,
  ];
  return pick.every(v => v == null || v === '');
}

async function fetchWithTimeout(url, ms, fetchImpl) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetchImpl(url, { signal: ctrl.signal, redirect: 'error' });
  } finally {
    clearTimeout(t);
  }
}

async function readBoundedJson(response, maxBytes) {
  const declaredLength = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    const error = new Error('response_too_large');
    error.code = 'RESPONSE_TOO_LARGE';
    throw error;
  }
  if (typeof response.text !== 'function') return response.json();
  const text = await response.text();
  if (Buffer.byteLength(text, 'utf8') > maxBytes) {
    const error = new Error('response_too_large');
    error.code = 'RESPONSE_TOO_LARGE';
    throw error;
  }
  try { return JSON.parse(text); } catch {
    const error = new Error('invalid_json');
    error.code = 'INVALID_JSON';
    throw error;
  }
}

async function fetchEcowittConnector(credentials, fetchImpl, timeoutMs = 10000, maxBytes = 2 * 1024 * 1024) {
  const url = ecowittURLForConnector(credentials?.configuration, credentials?.secrets);
  try {
    const response = await fetchWithTimeout(url, timeoutMs, fetchImpl);
    if (!response.ok) return { ok: false, reason: `http_${response.status}`, http: response.status, payload: null };
    const payload = await readBoundedJson(response, maxBytes);
    if (payload?.code !== 0) return { ok: false, reason: `ecowitt_code_${payload?.code}`, http: response.status, payload: null };
    if (isEcowittEmpty(payload?.data)) return { ok: false, reason: 'empty_data', http: response.status, payload: null };
    return { ok: true, reason: 'ok', http: response.status, payload };
  } catch (error) {
    const reason = error?.name === 'AbortError'
      ? 'timeout'
      : error?.code === 'RESPONSE_TOO_LARGE'
        ? 'response_too_large'
        : error?.code === 'INVALID_JSON' ? 'invalid_json' : 'fetch_error';
    return { ok: false, reason, http: null, payload: null };
  }
}

async function fetchEcowitt(prefix, fetchImpl) {
  if (!hasEcw(prefix)) {
    return { ok: false, prefix, reason: 'missing_config', http: null, payload: null };
  }

  const url = ecowittURL(prefix);

  try {
    const r = await fetchWithTimeout(
      url,
      Number(process.env.ECW_TIMEOUT_MS || 15000),
      fetchImpl
    );
    const http = r.status;

    if (!r.ok) {
      let body = '';
      try { body = await r.text(); } catch {}
      return { ok: false, prefix, reason: `http_${http}`, http, payload: body || null };
    }

    const p = await r.json();
    if (p?.code !== 0) return { ok: false, prefix, reason: `ecowitt_code_${p?.code}`, http, payload: p };

    const d = p?.data;
    if (isEcowittEmpty(d)) return { ok: false, prefix, reason: 'empty_data', http, payload: p };

    return { ok: true, prefix, reason: 'ok', http, payload: p };
  } catch (e) {
    const msg = (e && e.name === 'AbortError') ? 'timeout' : (e?.message || String(e));
    return { ok: false, prefix, reason: `fetch_error_${msg}`, http: null, payload: null };
  }
}

function makeEcowittService({
  pool,
  assegurarUsuariAdmin,
  assegurarEstacio,
  assegurarMembreEstacio,
  fetch: injectedFetch,
  httpClient,
  clock,
  logger = NULL_LOGGER,
}) {
  if (!pool) throw new Error('makeEcowittService: missing pool');
  if (!isLogger(logger)) throw new TypeError('Ecowitt logger must implement debug/info/warn/error');
  const fetchImpl = resolveFetch(injectedFetch, httpClient);
  const now = resolveClock(clock);

  async function pullEcowittAndSave() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const codi = process.env.ESTACIO_CODI || process.env.STATION_ID || process.env.STATION_CODE || 'home';
    const nom  = process.env.ESTACIO_NOM || null;

    const adminId = await assegurarUsuariAdmin(adminEmail);
    const estacioId = await assegurarEstacio(codi, nom, adminId);
    await assegurarMembreEstacio(adminId, estacioId, 'propietari');

    // 1) Primary
    const primary = await fetchEcowitt('ECW', fetchImpl);
    let chosen = primary;

    // 2) Fallback si cal
    if (!primary.ok) {
      if (hasEcw('ECW_FB')) {
        logger.warn('provider.ecowitt', {
          result: 'fallback',
          error_code: 'ECOWITT_PRIMARY_FAILED',
        });
        const fb = await fetchEcowitt('ECW_FB', fetchImpl);
        chosen = fb; // si fb.ok=false, quedem igualment amb fb per retornar reason
        if (!fb.ok) {
          logger.warn('provider.ecowitt', {
            result: 'skipped',
            error_code: 'ECOWITT_FALLBACK_FAILED',
          });
        }
      } else {
        logger.warn('provider.ecowitt', {
          result: 'skipped',
          error_code: 'ECOWITT_PRIMARY_FAILED',
        });
      }
    }

    if (!chosen.ok) {
      return {
        id: null,
        estacio: codi,
        instant: null,
        skipped: true,
        source: chosen.prefix,
        reason: chosen.reason,
      };
    }

    const p = chosen.payload;
    const d = p?.data;

    const epochSec = Number(p?.time);
    const instant = !Number.isNaN(epochSec) ? new Date(epochSec * 1000).toISOString() : now().toISOString();

    const params = [
      estacioId, instant,

      numberOrNull(d?.outdoor?.temperature?.value),
      numberOrNull(d?.outdoor?.feels_like?.value),
      numberOrNull(d?.outdoor?.dew_point?.value),
      d?.outdoor?.humidity?.value != null ? parseInt(d.outdoor.humidity.value, 10) : null,

      numberOrNull(d?.solar_and_uvi?.solar?.value),
      d?.solar_and_uvi?.uvi?.value != null ? parseInt(d.solar_and_uvi.uvi.value, 10) : null,

      numberOrNull(d?.rainfall?.['rain_rate']?.value),
      numberOrNull(d?.rainfall?.daily?.value),
      numberOrNull(d?.rainfall?.event?.value),
      numberOrNull(d?.rainfall?.['1_hour']?.value),
      numberOrNull(d?.rainfall?.weekly?.value),
      numberOrNull(d?.rainfall?.monthly?.value),
      numberOrNull(d?.rainfall?.yearly?.value),

      kmhToMs(numberOrNull(d?.wind?.wind_speed?.value)),
      kmhToMs(numberOrNull(d?.wind?.wind_gust?.value)),
      d?.wind?.wind_direction?.value != null ? parseInt(d.wind.wind_direction.value, 10) : null,

      numberOrNull(d?.pressure?.relative?.value),
      numberOrNull(d?.pressure?.absolute?.value),

      d?.battery?.sensor_array?.value != null
        ? (parseInt(d.battery.sensor_array.value, 10) ? 100 : 0)
        : null,

      JSON.stringify({ indoor: d?.indoor ?? null, ecowitt_source: chosen.prefix }),
    ];

    const sql = `
      INSERT INTO mesures (
        estacio_id, instant,
        temp_c, sensacio_c, punt_rosada_c, humitat_pct,
        solar_wm2, uvi,
        taxa_pluja_mm_h, pluja_diaria_mm, pluja_event_mm, pluja_hora_mm, pluja_setmana_mm, pluja_mes_mm, pluja_any_mm,
        vent_ms, vent_rafega_ms, vent_direccio_graus,
        pressio_rel_hpa, pressio_abs_hpa,
        bateria_pct,
        extres
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      )
      ON CONFLICT (estacio_id, instant) DO NOTHING
      RETURNING id;
    `;

    const { rows } = await pool.query(sql, params);

    return {
      id: rows[0]?.id || null,
      estacio: codi,
      instant,
      skipped: false,
      source: chosen.prefix,
    };
  }

  return { pullEcowittAndSave };
}

module.exports = {
  ecowittURLForConnector,
  fetchEcowittConnector,
  kmhToMs,
  makeEcowittService,
  numberOrNull,
};
