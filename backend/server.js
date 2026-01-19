// ──────────────────────────────────────────────────────────
// server.js — tecnolord backend
// - Manté el comportament “antic” que et funcionava.
// - Afegeix fallback automàtic d'Ecowitt:
//     1) prova ECW_*
//     2) si ve buit/falla, prova ECW_FB_*
//     3) si també falla, NO insereix (skipped=true) i NO peta la web
//
// Env fallback esperades:
//   ECW_FB_APPLICATION_KEY
//   ECW_FB_API_KEY
//   ECW_FB_MAC
// (unitids opcionals: ECW_FB_TEMP_UNITID, ECW_FB_WIND_SPEED_UNITID, ECW_FB_RAINFALL_UNITID, ECW_FB_PRESSURE_UNITID)
//
// També pots controlar timeout:
//   ECW_TIMEOUT_MS=15000
//
// ──────────────────────────────────────────────────────────

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST || 'db',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
});

// IMPORTANT: usem esquemes en català
pool.on('connect', (client) => {
  client.query("SET search_path TO meteo,auth,public").catch(console.error);
});

// ──────────────────────────────────────────────────────────
// Middlewares
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '256kb', type: ['application/json', 'application/*+json'] }));

// Estàtics
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
app.get('/', (_req, res) => res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html')));

// Salut
app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'ok', time: new Date().toISOString() }); }
  catch { res.json({ ok: true, db: 'down', time: new Date().toISOString() }); }
});

// Ping
app.get('/api/ping', (_req, res) => res.json({ ok: true, msg: 'pong' }));

// ──────────────────────────────────────────────────────────
// Helpers de permisos/entitats
async function assegurarUsuariAdmin(email) {
  const { rows } = await pool.query(
    `INSERT INTO auth.usuaris (email, nom, actiu)
     VALUES ($1, $2, true)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id`,
    [email, email]
  );
  return rows[0].id;
}

async function assegurarEstacio(codi, nom, creatPerUserId) {
  const { rows } = await pool.query(
    `INSERT INTO estacions (codi, nom, creat_per_usuari)
     VALUES ($1, $2, $3)
     ON CONFLICT (codi) DO UPDATE SET nom = COALESCE(EXCLUDED.nom, estacions.nom)
     RETURNING id`,
    [codi, nom || null, creatPerUserId || null]
  );
  return rows[0].id;
}

async function assegurarMembreEstacio(usuariId, estacioId, rol = 'propietari') {
  await pool.query(
    `INSERT INTO membres_estacio (usuari_id, estacio_id, rol)
     VALUES ($1,$2,$3)
     ON CONFLICT (usuari_id, estacio_id) DO NOTHING`,
    [usuariId, estacioId, rol]
  );
}

async function assegurarHidro(codi, tipus, nom) {
  const { rows } = await pool.query(
    `INSERT INTO estacions_hidro (codi, tipus, nom, activa)
     VALUES ($1,$2,$3,true)
     ON CONFLICT (codi) DO UPDATE SET nom = COALESCE(EXCLUDED.nom, estacions_hidro.nom)
     RETURNING id`,
    [codi, tipus, nom || null]
  );
  return rows[0].id;
}

// ──────────────────────────────────────────────────────────
// Helpers Ecowitt/ACA
const kmhToMs = v => (v == null || v === '' ? null : Number(v) / 3.6);

function envGet(prefix, key, fallback = undefined) {
  const v = process.env[`${prefix}_${key}`];
  return (v === undefined || v === '') ? fallback : v;
}

function hasEcw(prefix) {
  return !!(process.env[`${prefix}_APPLICATION_KEY`] && process.env[`${prefix}_API_KEY`] && process.env[`${prefix}_MAC`]);
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

async function fetchWithTimeout(url, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fetchEcowitt(prefix) {
  if (!hasEcw(prefix)) {
    return { ok: false, prefix, reason: 'missing_config', http: null, payload: null };
  }
  const url = ecowittURL(prefix);
  try {
    const r = await fetchWithTimeout(url, Number(process.env.ECW_TIMEOUT_MS || 15000));
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

const ACA_RIVER_URL = 'http://aplicacions.aca.gencat.cat/aetr/vishid/v2/data/public/rivergauges/river_flow_6min';
const ACA_RESERVOIR_URL = 'http://aplicacions.aca.gencat.cat/aetr/vishid/v2/data/public/reservoir/capacity_6min';

// ──────────────────────────────────────────────────────────
// PREVI (tal qual el teu)
function mustNumEnv(name) {
  const v = process.env[name];
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`missing/invalid env ${name}`);
  return n;
}

function normalizeOpenMeteoModel(raw) {
  const s = String(raw ?? '').trim().toLowerCase();
  if (!s) return null;

  const map = {
    'best': 'best_match',
    'bestmatch': 'best_match',
    'best_match': 'best_match',
    'default': 'best_match',
    'icon': 'icon_global',
    'icon-global': 'icon_global',
    'icon_global': 'icon_global',
    'icon eu': 'icon_eu',
    'icon-eu': 'icon_eu',
    'icon_eu': 'icon_eu',
    'icon d2': 'icon_d2',
    'icon-d2': 'icon_d2',
    'icon_d2': 'icon_d2',
    'icon seamless': 'icon_seamless',
    'icon-seamless': 'icon_seamless',
    'icon_seamless': 'icon_seamless',
  };

  if (map[s]) return map[s];
  if (/^[a-z0-9_]+$/.test(s)) return s;
  return null;
}

function previConfig() {
  const lat = mustNumEnv('PREVI_LAT');
  const lon = mustNumEnv('PREVI_LON');
  const hours = Math.min(Math.max(parseInt(process.env.PREVI_HOURS || '48', 10) || 48, 1), 48);

  return {
    source: (process.env.PREVI_SOURCE || 'open-meteo').trim(),
    model: (process.env.PREVI_MODEL || 'best_match').trim(),
    stationCode: (process.env.PREVI_STATION_CODE || process.env.ESTACIO_CODI || 'home').trim(),
    hours, lat, lon
  };
}

function openMeteoURL({ lat, lon, model, hours }) {
  const hourly = [
    'temperature_2m',
    'relative_humidity_2m',
    'precipitation',
    'wind_speed_10m',
    'wind_direction_10m'
  ].join(',');

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly,
    forecast_hours: String(hours),
    timezone: 'UTC',
    windspeed_unit: 'ms',
    precipitation_unit: 'mm',
    temperature_unit: 'celsius',
  });

  const m = normalizeOpenMeteoModel(model);
  if (m) params.set('models', m);

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function pullPreviAndSave() {
  const cfg = previConfig();
  const issuedAt = new Date().toISOString();

  if (cfg.source !== 'open-meteo') {
    throw new Error(`Unsupported PREVI_SOURCE=${cfg.source} (for now only 'open-meteo')`);
  }

  const url = openMeteoURL(cfg);
  const r = await fetch(url);

  if (!r.ok) {
    let body = '';
    try { body = await r.text(); } catch {}
    throw new Error(`previ status ${r.status} url=${url} body=${body || '(no body)'}`);
  }

  const data = await r.json();
  const h = data?.hourly;
  const times = Array.isArray(h?.time) ? h.time : [];

  const t2m = Array.isArray(h?.temperature_2m) ? h.temperature_2m : [];
  const rh2m = Array.isArray(h?.relative_humidity_2m) ? h.relative_humidity_2m : [];
  const prcp = Array.isArray(h?.precipitation) ? h.precipitation : [];
  const wspd = Array.isArray(h?.wind_speed_10m) ? h.wind_speed_10m : [];
  const wdir = Array.isArray(h?.wind_direction_10m) ? h.wind_direction_10m : [];

  if (!times.length) throw new Error('previ malformed: missing hourly.time');
  const validTimes = times.map((t) => new Date(t).toISOString());

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const runSql = `
      INSERT INTO forecast_run (source, model, station_code, issued_at, hours)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (source, model, station_code, issued_at)
      DO UPDATE SET hours = EXCLUDED.hours
      RETURNING id
    `;
    const runRes = await client.query(runSql, [
      cfg.source, normalizeOpenMeteoModel(cfg.model) || 'best_match', cfg.stationCode, issuedAt, cfg.hours
    ]);
    const runId = runRes.rows[0].id;

    const insSql = `
      INSERT INTO forecast_hourly
        (run_id, valid_time, temp_c, hum_pct, wind_ms, wind_dir, rain_mm)
      SELECT
        $1::bigint,
        x.valid_time::timestamptz,
        x.temp_c::real,
        x.hum_pct::real,
        x.wind_ms::real,
        x.wind_dir::real,
        x.rain_mm::real
      FROM UNNEST(
        $2::timestamptz[],
        $3::real[],
        $4::real[],
        $5::real[],
        $6::real[],
        $7::real[]
      ) AS x(valid_time, temp_c, hum_pct, wind_ms, wind_dir, rain_mm)
      ON CONFLICT (run_id, valid_time) DO UPDATE SET
        temp_c   = EXCLUDED.temp_c,
        hum_pct  = EXCLUDED.hum_pct,
        wind_ms  = EXCLUDED.wind_ms,
        wind_dir = EXCLUDED.wind_dir,
        rain_mm  = EXCLUDED.rain_mm
    `;

    const fill = (arr) => (arr.length === validTimes.length ? arr : new Array(validTimes.length).fill(null));
    const aTemp = fill(t2m).map(v => (v == null ? null : Number(v)));
    const aHum  = fill(rh2m).map(v => (v == null ? null : Number(v)));
    const aRain = fill(prcp).map(v => (v == null ? null : Number(v)));
    const aWind = fill(wspd).map(v => (v == null ? null : Number(v)));
    const aDir  = fill(wdir).map(v => (v == null ? null : Number(v)));

    await client.query(insSql, [runId, validTimes, aTemp, aHum, aWind, aDir, aRain]);

    await client.query('COMMIT');

    return {
      ok: true,
      source: cfg.source,
      model: normalizeOpenMeteoModel(cfg.model) || 'best_match',
      station: cfg.stationCode,
      issued_at: issuedAt,
      hours: cfg.hours,
      points: validTimes.length
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────
// Helpers de períodes
function parsePeriodWindow(period) {
  const now = new Date();
  const end = now;
  let start = null;

  const startOfTodayUTC = () => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

  switch ((period || '').toLowerCase()) {
    case 'last24h':
      start = new Date(now.getTime() - 24 * 3600 * 1000);
      return { start, end };
    case 'today':
      start = startOfTodayUTC();
      return { start, end };
    case 'yesterday': {
      const s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0));
      const e = startOfTodayUTC();
      return { start: s, end: e };
    }
    case 'last7d':
      start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return { start, end };
    case 'last30d':
      start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      return { start, end };
    default:
      return { start: null, end: null };
  }
}

function parseFromTo(from, to) {
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;
  if (start && Number.isNaN(start.getTime())) return { start: null, end: null };
  if (end && Number.isNaN(end.getTime())) return { start: null, end: null };
  return { start, end };
}

function getWindowFromQuery(req) {
  const period = req.query.period || null;
  const from = req.query.from || null;
  const to = req.query.to || null;

  if (from || to) return { ...parseFromTo(from, to), source: 'fromto' };
  if (period) return { ...parsePeriodWindow(period), source: 'period' };
  return { start: null, end: null, source: 'none' };
}

// ──────────────────────────────────────────────────────────
// Rutes METEO
app.get('/api/v1/mesures/darreres', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 5000);
  const estacioCodi = req.query.estacio || null;
  const { start, end } = getWindowFromQuery(req);

  try {
    const params = [];
    const wheres = [];

    if (estacioCodi) {
      params.push(estacioCodi);
      wheres.push(`m.estacio_id = (SELECT id FROM estacions WHERE codi = $${params.length})`);
    }
    if (start) { params.push(start.toISOString()); wheres.push(`m.instant >= $${params.length}`); }
    if (end)   { params.push(end.toISOString());   wheres.push(`m.instant < $${params.length}`); }

    const whereSql = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
    const sql = `SELECT m.* FROM mesures m ${whereSql} ORDER BY instant DESC LIMIT ${limit}`;
    const { rows } = await pool.query(sql, params);

    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'db query error' });
  }
});

// ──────────────────────────────────────────────────────────
// PREVI: retorna l'últim run guardat
app.get('/api/v1/previ/48h', async (req, res) => {
  const station = String(req.query.station || process.env.PREVI_STATION_CODE || process.env.ESTACIO_CODI || 'home');
  const model = String(req.query.model || process.env.PREVI_MODEL || 'best_match');
  const source = String(req.query.source || process.env.PREVI_SOURCE || 'open-meteo');

  try {
    const runQ = await pool.query(
      `SELECT id, source, model, station_code, issued_at, hours
       FROM forecast_run
       WHERE station_code = $1 AND model = $2 AND source = $3
       ORDER BY issued_at DESC
       LIMIT 1`,
      [station, normalizeOpenMeteoModel(model) || 'best_match', source]
    );

    const run = runQ.rows[0];
    if (!run) return res.status(404).json({ ok: false, error: 'no forecast saved yet' });

    const rowsQ = await pool.query(
      `SELECT valid_time, temp_c, hum_pct, wind_ms, wind_dir, rain_mm
       FROM forecast_hourly
       WHERE run_id = $1
       ORDER BY valid_time ASC`,
      [run.id]
    );

    return res.json({
      ok: true,
      run: {
        id: run.id,
        source: run.source,
        model: run.model,
        station: run.station_code,
        issued_at: run.issued_at,
        hours: run.hours
      },
      items: rowsQ.rows
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'db query error' });
  }
});

// ──────────────────────────────────────────────────────────
// HIDRO (tal qual el teu original)
app.get('/api/v1/hidro/darreres', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '200', 10) || 200, 5000);
  const codi = req.query.codi || null;

  const mode = (req.query.mode || '').toLowerCase(); // "latest" | "range" | ""
  const ensure = String(req.query.ensure || '0') === '1';

  const { start, end, source } = getWindowFromQuery(req);
  const hasWindow = !!(start || end || (source !== 'none'));
  const effectiveMode = mode || (hasWindow ? 'latest' : 'raw');

  try {
    if (effectiveMode === 'raw') {
      const params = [];
      let where = '';
      if (codi) { where = 'WHERE e.codi = $1'; params.push(codi); }

      const sql = `
        SELECT
          h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
          e.codi, e.nom, e.tipus, e.id AS estacio_id,
          EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
          (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
          false AS is_fallback,
          false AS is_outside_range
        FROM lectures_hidro h
        JOIN estacions_hidro e ON e.id = h.estacio_id
        ${where}
        ORDER BY h.instant DESC
        LIMIT ${limit}
      `;
      const { rows } = await pool.query(sql, params);
      return res.json({ ok: true, items: rows });
    }

    const wParams = [];
    const wConds = [];
    if (codi) { wParams.push(codi); wConds.push(`e.codi = $${wParams.length}`); }
    if (start) { wParams.push(start.toISOString()); wConds.push(`h.instant >= $${wParams.length}`); }
    if (end) { wParams.push(end.toISOString()); wConds.push(`h.instant < $${wParams.length}`); }
    const wWhere = wConds.length ? `WHERE ${wConds.join(' AND ')}` : '';

    if (effectiveMode === 'range') {
      if (codi) {
        const sqlRange = `
          SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            false AS is_fallback,
            false AS is_outside_range
          FROM lectures_hidro h
          JOIN estacions_hidro e ON e.id = h.estacio_id
          ${wWhere}
          ORDER BY h.instant DESC
          LIMIT ${limit}
        `;
        const { rows } = await pool.query(sqlRange, wParams);
        if (rows.length || !ensure) return res.json({ ok: true, items: rows, fallback: false });

        const sqlFallback = `
          SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            true AS is_fallback,
            true AS is_outside_range
          FROM lectures_hidro h
          JOIN estacions_hidro e ON e.id = h.estacio_id
          WHERE e.codi = $1
          ORDER BY h.instant DESC
          LIMIT 1
        `;
        const fb = await pool.query(sqlFallback, [codi]);
        return res.json({ ok: true, items: fb.rows, fallback: true });
      }

      const sqlAllRange = `
        SELECT
          h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
          e.codi, e.nom, e.tipus, e.id AS estacio_id,
          EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
          (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
          false AS is_fallback,
          false AS is_outside_range
        FROM lectures_hidro h
        JOIN estacions_hidro e ON e.id = h.estacio_id
        ${wWhere}
        ORDER BY h.instant DESC
        LIMIT ${limit}
      `;
      const rangeRes = await pool.query(sqlAllRange, wParams);
      let items = rangeRes.rows;
      if (!ensure) return res.json({ ok: true, items });

      const targets = [
        process.env.ACA_CODI_CARDENER,
        process.env.ACA_CODI_VALLS,
        process.env.ACA_CODI_LLOSA,
      ].filter(Boolean);

      let targetCodis = targets;
      if (!targetCodis.length) {
        const allStations = await pool.query(`SELECT codi FROM estacions_hidro WHERE activa = true`);
        targetCodis = allStations.rows.map(r => r.codi);
      }

      const present = new Set(items.map(r => r.codi));
      const missing = targetCodis.filter(c => !present.has(c));
      if (!missing.length) return res.json({ ok: true, items });

      const sqlLatestMissing = `
        WITH wanted AS (
          SELECT unnest($1::text[]) AS codi
        ),
        latest AS (
          SELECT DISTINCT ON (e.codi)
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id
          FROM wanted w
          JOIN estacions_hidro e ON e.codi = w.codi
          JOIN lectures_hidro h ON h.estacio_id = e.id
          ORDER BY e.codi, h.instant DESC
        )
        SELECT
          l.*,
          EXTRACT(EPOCH FROM (NOW() - l.instant)) / 3600 AS age_hours,
          (NOW() - l.instant) > INTERVAL '24 hours' AS is_stale,
          true AS is_fallback,
          true AS is_outside_range
        FROM latest l
      `;
      const missRes = await pool.query(sqlLatestMissing, [missing]);

      items = items.concat(missRes.rows);
      items.sort((a, b) => new Date(b.instant).getTime() - new Date(a.instant).getTime());

      return res.json({ ok: true, items });
    }

    // mode=latest
    {
      const targets = [
        process.env.ACA_CODI_CARDENER,
        process.env.ACA_CODI_VALLS,
        process.env.ACA_CODI_LLOSA,
      ].filter(Boolean);

      if (codi) {
        const sqlLatestInRange = `
          SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            false AS is_fallback,
            false AS is_outside_range
          FROM lectures_hidro h
          JOIN estacions_hidro e ON e.id = h.estacio_id
          ${wWhere}
          ORDER BY h.instant DESC
          LIMIT 1
        `;
        const inRange = await pool.query(sqlLatestInRange, wParams);
        if (inRange.rows.length) return res.json({ ok: true, items: inRange.rows, fallback: false });

        const sqlFallback = `
          SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            true AS is_fallback,
            true AS is_outside_range
          FROM lectures_hidro h
          JOIN estacions_hidro e ON e.id = h.estacio_id
          WHERE e.codi = $1
          ORDER BY h.instant DESC
          LIMIT 1
        `;
        const fb = await pool.query(sqlFallback, [codi]);
        return res.json({ ok: true, items: fb.rows, fallback: true });
      }

      let targetCodis = targets;
      if (!targetCodis.length) {
        const allStations = await pool.query(`SELECT codi FROM estacions_hidro WHERE activa = true`);
        targetCodis = allStations.rows.map(r => r.codi);
      }

      const sql = `
        WITH wanted AS (
          SELECT unnest($1::text[]) AS codi
        ),
        in_range AS (
          SELECT DISTINCT ON (e.codi)
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            false AS is_fallback,
            false AS is_outside_range
          FROM wanted w
          JOIN estacions_hidro e ON e.codi = w.codi
          JOIN lectures_hidro h ON h.estacio_id = e.id
          ${start ? `WHERE h.instant >= $2` : ''} ${start && end ? 'AND' : ''} ${end ? `h.instant < $3` : ''}
          ORDER BY e.codi, h.instant DESC
        ),
        missing AS (
          SELECT w.codi
          FROM wanted w
          LEFT JOIN in_range r ON r.codi = w.codi
          WHERE r.codi IS NULL
        ),
        fallback AS (
          SELECT DISTINCT ON (e.codi)
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            true AS is_fallback,
            true AS is_outside_range
          FROM missing m
          JOIN estacions_hidro e ON e.codi = m.codi
          JOIN lectures_hidro h ON h.estacio_id = e.id
          ORDER BY e.codi, h.instant DESC
        )
        SELECT
          x.*,
          EXTRACT(EPOCH FROM (NOW() - x.instant)) / 3600 AS age_hours,
          (NOW() - x.instant) > INTERVAL '24 hours' AS is_stale
        FROM (
          SELECT * FROM in_range
          UNION ALL
          SELECT * FROM fallback
        ) x
        ORDER BY x.codi;
      `;

      const params = [targetCodis];
      if (start) params.push(start.toISOString());
      if (end) params.push(end.toISOString());

      const { rows } = await pool.query(sql, params);
      return res.json({ ok: true, items: rows });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'db query error' });
  }
});

// ──────────────────────────────────────────────────────────
// Auth simple per tasques internes
function checkApiKey(req, res, next) {
  const key = req.get('x-api-key') || req.query.key;
  const serverKey = process.env.INGEST_API_KEY || '';
  if (!serverKey) return res.status(500).json({ ok: false, error: 'server missing INGEST_API_KEY' });
  if (key !== serverKey) return res.status(401).json({ ok: false, error: 'invalid api key' });
  next();
}

// ──────────────────────────────────────────────────────────
// Pull d’Ecowitt → meteo.mesures (amb fallback)
async function pullEcowittAndSave() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const codi = process.env.ESTACIO_CODI || process.env.STATION_ID || process.env.STATION_CODE || 'home';
  const nom  = process.env.ESTACIO_NOM || null;

  const adminId = await assegurarUsuariAdmin(adminEmail);
  const estacioId = await assegurarEstacio(codi, nom, adminId);
  await assegurarMembreEstacio(adminId, estacioId, 'propietari');

  // 1) Primary
  const primary = await fetchEcowitt('ECW');
  let chosen = primary;

  // 2) Fallback si cal
  if (!primary.ok) {
    if (hasEcw('ECW_FB')) {
      console.warn(`[ecowitt] primary failed (${primary.reason}) -> trying fallback`);
      const fb = await fetchEcowitt('ECW_FB');
      chosen = fb.ok ? fb : fb;
      if (!fb.ok) console.warn(`[ecowitt] fallback failed (${fb.reason}) -> skipped`);
    } else {
      console.warn(`[ecowitt] primary failed (${primary.reason}) and no fallback configured -> skipped`);
    }
  }

  // 3) Si no hi ha dades bones, no inserim (evita nulls i evita 500)
  if (!chosen.ok) {
    return {
      id: null,
      estacio: codi,
      instant: null,
      skipped: true,
      source: chosen.prefix,
      reason: chosen.reason
    };
  }

  const p = chosen.payload;
  const d = p?.data;

  const epochSec = Number(p?.time);
  const instant = !Number.isNaN(epochSec) ? new Date(epochSec * 1000).toISOString() : new Date().toISOString();

  const params = [
    estacioId, instant,

    +d?.outdoor?.temperature?.value || null,
    +d?.outdoor?.feels_like?.value || null,
    +d?.outdoor?.dew_point?.value || null,
    d?.outdoor?.humidity?.value != null ? parseInt(d.outdoor.humidity.value, 10) : null,

    +d?.solar_and_uvi?.solar?.value || null,
    d?.solar_and_uvi?.uvi?.value != null ? parseInt(d.solar_and_uvi.uvi.value, 10) : null,

    +d?.rainfall?.['rain_rate']?.value || null,
    +d?.rainfall?.daily?.value || null,
    +d?.rainfall?.event?.value || null,
    +d?.rainfall?.['1_hour']?.value || null,
    +d?.rainfall?.weekly?.value || null,
    +d?.rainfall?.monthly?.value || null,
    +d?.rainfall?.yearly?.value || null,

    kmhToMs(+d?.wind?.wind_speed?.value || null),
    kmhToMs(+d?.wind?.wind_gust?.value || null),
    d?.wind?.wind_direction?.value != null ? parseInt(d.wind.wind_direction.value,10) : null,

    +d?.pressure?.relative?.value || null,
    +d?.pressure?.absolute?.value || null,

    d?.battery?.sensor_array?.value != null
      ? (parseInt(d.battery.sensor_array.value,10) ? 100 : 0)
      : null,

    JSON.stringify({ indoor: d?.indoor ?? null, ecowitt_source: chosen.prefix })
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
  return { id: rows[0]?.id || null, estacio: codi, instant, skipped: false, source: chosen.prefix };
}

// Pull ACA → meteo.lectures_hidro (igual que el teu)
async function pullACAAndSave() {
  const [riversRes, reservoirsRes] = await Promise.all([
    fetch(ACA_RIVER_URL),
    fetch(ACA_RESERVOIR_URL),
  ]);
  if (!riversRes.ok) throw new Error('aca rivers status ' + riversRes.status);
  if (!reservoirsRes.ok) throw new Error('aca reservoirs status ' + reservoirsRes.status);

  const rivers = await riversRes.json();
  const reservoirs = await reservoirsRes.json();

  function indexBySiteCode(data) {
    const m = new Map();
    if (!data) return m;

    if (Array.isArray(data)) {
      for (const it of data) {
        const code = it?.siteCode ?? it?.codi ?? it?.code;
        if (code) m.set(String(code).trim(), it);
      }
      return m;
    }

    if (typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (!v) continue;
        if (typeof v === 'object') {
          const code = v.siteCode ?? v.codi ?? v.code ?? k;
          m.set(String(code).trim(), v);
        }
      }
    }
    return m;
  }

  const riversByCode = indexBySiteCode(rivers);
  const reservoirsByCode = indexBySiteCode(reservoirs);

  const getPath = (obj, tokens) => {
    try {
      return tokens.reduce((a, k) => (a && a[k] !== undefined && a[k] !== null) ? a[k] : undefined, obj);
    } catch { return undefined; }
  };
  const firstOf = (obj, listOfPaths) => {
    for (const p of listOfPaths) {
      const v = getPath(obj, p);
      if (v !== undefined && v !== null) return v;
    }
    return null;
  };
  const toNum = v => (v === null || v === '' || v === undefined ? null : Number(v));

  const CODE_CARD   = process.env.ACA_CODI_CARDENER;
  const CODE_VALLS  = process.env.ACA_CODI_VALLS;
  const CODE_LLOSA  = process.env.ACA_CODI_LLOSA;

  const CODE_LLOSA_FLOW = process.env.ACA_CODI_LLOSA_CABAL      || CODE_LLOSA;
  const CODE_LLOSA_CAP  = process.env.ACA_CODI_LLOSA_CAPACITAT  || CODE_LLOSA;

  const SITES = [
    { siteCode: CODE_CARD,  name: process.env.ACA_NOM_CARDENER || 'Cardener', tipusPreferit: 'riu',   flowKey: CODE_CARD,       capKey: null },
    { siteCode: CODE_VALLS, name: process.env.ACA_NOM_VALLS    || 'Valls',    tipusPreferit: 'riu',   flowKey: CODE_VALLS,      capKey: null },
    { siteCode: CODE_LLOSA, name: process.env.ACA_NOM_LLOSA    || 'La Llosa del Cavall', tipusPreferit: 'panta',
      flowKey: CODE_LLOSA_FLOW, capKey: CODE_LLOSA_CAP },
  ].filter(s => s.siteCode);

  const nowIso = new Date().toISOString();
  const results = [];

  for (const s of SITES) {
    const rObj = s.flowKey
      ? (riversByCode.get(String(s.flowKey).trim()) ?? rivers?.[s.flowKey] ?? null)
      : null;
    const zObj = s.capKey
      ? (reservoirsByCode.get(String(s.capKey).trim()) ?? reservoirs?.[s.capKey] ?? null)
      : null;

    const flowVal = toNum(firstOf(rObj, [
      ['popup','river_flow','value'],
      ['popup','flux_riu','value'],
      ['popup','cabal_riu','value'],
      ['finestra emergent','river_flow','valor'],
      ['finestra emergent','flux_riu','valor'],
      ['finestra emergent','cabal_riu','valor'],
      ['emergent','river_flow','valor'],
      ['emergent','flux_riu','valor'],
      ['emergent','cabal_riu','valor'],
      ['finestra','flux_riu','valor'],
      ['finestra','cabal_riu','valor'],
    ]));

    const capVal = toNum(firstOf(zObj, [
      ['popup','capacity','value'],
      ['popup','capacitat','valor'],
      ['finestra emergent','capacitat','valor'],
      ['emergent','capacitat','valor'],
      ['element emergent','capacitat','valor'],
    ]));

    const levelVal = toNum(firstOf(zObj, [
      ['popup','level','value'],
      ['finestra emergent','nivell','valor'],
      ['emergent','nivell','valor'],
    ]));

    const flowTs = firstOf(rObj, [
      ['popup','river_flow','time'], ['popup','flux_riu','time'], ['popup','cabal_riu','time'],
      ['finestra emergent','river_flow','hora'], ['finestra emergent','flux_riu','hora'], ['finestra emergent','cabal_riu','hora'],
      ['emergent','river_flow','hora'], ['emergent','flux_riu','hora'], ['emergent','cabal_riu','hora'],
    ]);
    const capTs = firstOf(zObj, [
      ['popup','capacity','time'], ['popup','capacitat','hora'],
      ['finestra emergent','capacitat','hora'],
      ['emergent','capacitat','hora'],
      ['element emergent','capacitat','hora'],
    ]);
    const instant = (flowTs || capTs || nowIso);

    if (flowVal === null && capVal === null && levelVal === null) {
      console.warn('[ACA] sense valors per', s.siteCode, { flowKey: s.flowKey, capKey: s.capKey });
      continue;
    }

    const tipusCalc =
      (flowVal !== null && capVal === null) ? 'riu' :
      (capVal  !== null && flowVal === null) ? 'panta' : (s.tipusPreferit || 'panta');

    const estacioId = await assegurarHidro(s.siteCode, tipusCalc, s.name);

    const sql = `
      INSERT INTO lectures_hidro (estacio_id, instant, cabal_m3s, capacitat_pct, nivell_m, extres)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (estacio_id, instant) DO UPDATE
      SET cabal_m3s     = COALESCE(lectures_hidro.cabal_m3s, EXCLUDED.cabal_m3s),
          capacitat_pct = COALESCE(lectures_hidro.capacitat_pct, EXCLUDED.capacitat_pct),
          nivell_m      = COALESCE(lectures_hidro.nivell_m, EXCLUDED.nivell_m),
          extres        = COALESCE(lectures_hidro.extres, EXCLUDED.extres)
      RETURNING id
    `;
    const extres = { river_raw: rObj ?? null, reservoir_raw: zObj ?? null };
    const { rows } = await pool.query(sql, [
      estacioId, new Date(instant).toISOString(),
      flowVal, capVal, levelVal,
      JSON.stringify(extres),
    ]);

    results.push({ codi: s.siteCode, id: rows[0]?.id || null, cabal_m3s: flowVal, capacitat_pct: capVal, nivell_m: levelVal, ts: instant });
  }

  return { ok: true, inserts: results };
}

// ──────────────────────────────────────────────────────────
// Rutes de tasca
app.post(['/tasks/pull-ecowitt','/api/tasks/pull-ecowitt'], checkApiKey, async (_req, res) => {
  try {
    const meteo = await pullEcowittAndSave();
    const hidro = await pullACAAndSave();

    // Si ecowitt va skip, NO retornem 500: retornem 200 amb info de skipped
    const status = meteo.id ? 201 : 200;
    return res.status(status).json({ ok: true, meteo, hidro });
  } catch (e) {
    console.error('pull-ecowitt error:', e);
    return res.status(500).json({ ok:false, error:'pull failed' });
  }
});

app.post(['/tasks/pull-aca','/api/tasks/pull-aca'], checkApiKey, async (_req, res) => {
  try {
    const hidro = await pullACAAndSave();
    return res.status(201).json({ ok: true, hidro });
  } catch (e) {
    console.error('pull-aca error:', e);
    return res.status(500).json({ ok:false, error:'pull aca failed' });
  }
});

app.post(['/tasks/pull-previ','/api/tasks/pull-previ'], checkApiKey, async (_req, res) => {
  try {
    const previ = await pullPreviAndSave();
    return res.status(201).json({ ok: true, previ });
  } catch (e) {
    console.error('pull-previ error:', e);
    return res.status(500).json({ ok:false, error:'pull previ failed' });
  }
});

// ──────────────────────────────────────────────────────────
// Arrencada
app.listen(PORT, () => console.log(`Backend escoltant a :${PORT}`));
