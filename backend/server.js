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
// ──────────────────────────────────────────────────────────

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { createPool } = require('./db/pool');

require('dotenv').config();

const { checkApiKey } = require('./middleware/authApiKey.js');
const { router: pingRouter } = require('./routes/ping');
const { makeHealthRouter } = require('./routes/health');
const { makeMesuresRouter } = require('./routes/mesures');
const { makeHidroRouter } = require('./routes/hidro');
const { makePreviRouter } = require('./routes/previ');
const { makeTasksRouter } = require('./routes/tasks');

const { makePreviService } = require('./services/previService');
const { makeAcaService } = require('./services/acaService');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = createPool();
const previService = makePreviService({ pool });

// ──────────────────────────────────────────────────────────
// Middlewares
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '256kb', type: ['application/json', 'application/*+json'] }));

// Estàtics (robust: no depèn de __dirname)
const FRONTEND_DIR = path.resolve(process.cwd(), 'frontend');
app.use(express.static(FRONTEND_DIR));
app.get('/', (_req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

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

const acaService = makeAcaService({ pool, assegurarHidro });

// ──────────────────────────────────────────────────────────
// Helpers Ecowitt
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
      chosen = fb;
      if (!fb.ok) console.warn(`[ecowitt] fallback failed (${fb.reason}) -> skipped`);
    } else {
      console.warn(`[ecowitt] primary failed (${primary.reason}) and no fallback configured -> skipped`);
    }
  }

  // 3) Si no hi ha dades bones, no inserim
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
    d?.wind?.wind_direction?.value != null ? parseInt(d.wind.wind_direction.value, 10) : null,

    +d?.pressure?.relative?.value || null,
    +d?.pressure?.absolute?.value || null,

    d?.battery?.sensor_array?.value != null
      ? (parseInt(d.battery.sensor_array.value, 10) ? 100 : 0)
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

// ──────────────────────────────────────────────────────────
// Routers (després que tot existeixi)
app.use(pingRouter);
app.use(makeHealthRouter({ pool }));
app.use(makeMesuresRouter({ pool }));
app.use(makeHidroRouter({ pool }));
app.use(makePreviRouter({ pool }));
app.use(makeTasksRouter({
  checkApiKey,
  pullEcowittAndSave,
  pullACAAndSave: acaService.pullACAAndSave,
  pullPreviAndSave: previService.pullPreviAndSave
}));

// ──────────────────────────────────────────────────────────
// Arrencada
app.listen(PORT, () => console.log(`Backend escoltant a :${PORT}`));
