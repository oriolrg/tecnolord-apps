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
const { createPool } = require('./db/pool');

require('dotenv').config();
const { checkApiKey } = require('./middleware/authApiKey.js');
const { router: pingRouter } = require('./routes/ping');
const { makeHealthRouter } = require('./routes/health');
const { makeMesuresRouter } = require('./routes/mesures');
const { makeHidroRouter } = require('./routes/hidro');
const { makePreviRouter } = require('./routes/previ');
const { normalizeOpenMeteoModel } = require('./utils/previ');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = createPool();


// ──────────────────────────────────────────────────────────
// Middlewares
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '256kb', type: ['application/json', 'application/*+json'] }));

// Estàtics (robust: no depèn de __dirname)
const FRONTEND_DIR = path.resolve(process.cwd(), 'frontend');
app.use(express.static(FRONTEND_DIR));
app.get('/', (_req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));


app.use(pingRouter);
app.use(makeHealthRouter({ pool }));
app.use(makeMesuresRouter({ pool }));
app.use(makeHidroRouter({ pool }));
app.use(makePreviRouter({ pool }));

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
// Pull d’Ecowitt → meteo.mesures (amb fallback)
//“Si Ecowitt retorna data buida -> usar fallback”
//“Mai inserir all-null”
//“instant sempre ve d’epoch Ecowitt, no de now()”
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
