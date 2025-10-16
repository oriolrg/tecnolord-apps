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

// middlewares
// --- protecció per clau ---
// --- protecció per clau d’ingesta ---
function checkApiKey(req, res, next) {
  const key = req.get('x-api-key') || req.query.key;
  const serverKey = process.env.INGEST_API_KEY || '';
  if (!serverKey) return res.status(500).json({ ok: false, error: 'server missing INGEST_API_KEY' });
  if (key !== serverKey) return res.status(401).json({ ok: false, error: 'invalid api key' });
  next();
}

// --- endpoint d’ingesta ---
app.post('/api/v1/measurements', checkApiKey, async (req, res) => {
  const { station_id, at, temp_c, humidity, pressure_hpa, rain_mm, wind_speed_ms, wind_dir_deg } = req.body || {};
  if (!station_id) return res.status(400).json({ ok: false, error: 'station_id required' });

  const ts = at ? new Date(at) : new Date();
  if (Number.isNaN(ts.getTime())) return res.status(400).json({ ok: false, error: 'invalid at' });

  try {
    const sql = `INSERT INTO measurement (station_id, at, temp_c, humidity, pressure_hpa, rain_mm, wind_speed_ms, wind_dir_deg)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`;
    const params = [station_id, ts.toISOString(), temp_c, humidity, pressure_hpa, rain_mm, wind_speed_ms, wind_dir_deg];
    const { rows } = await pool.query(sql, params);
    return res.status(201).json({ ok: true, id: rows[0]?.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'db insert error' });
  }
});


app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '256kb', type: ['application/json', 'application/*+json'] }));


// (si en local vols servir el frontend des d'aquí)
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
app.get('/', (_req, res) => res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html')));


// Health amb DB
app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'ok', time: new Date().toISOString() }); }
  catch { res.json({ ok: true, db: 'down', time: new Date().toISOString() }); }
});

// Ping
app.get('/api/ping', (_req, res) => res.json({ ok: true, msg: 'pong' }));

// Clau d’ingesta
function checkApiKey(req, res, next) {
  const key = req.get('x-api-key') || req.query.key;
  const serverKey = process.env.INGEST_API_KEY || '';
  if (!serverKey) return res.status(500).json({ ok: false, error: 'server missing INGEST_API_KEY' });
  if (key !== serverKey) return res.status(401).json({ ok: false, error: 'invalid api key' });
  next();
}

// POST ingesta
app.post('/api/v1/measurements', checkApiKey, async (req, res) => {
  const { station_id, at, temp_c, humidity, pressure_hpa, rain_mm, wind_speed_ms, wind_dir_deg } = req.body || {};
  if (!station_id) return res.status(400).json({ ok: false, error: 'station_id required' });

  const ts = at ? new Date(at) : new Date();
  if (Number.isNaN(ts.getTime())) return res.status(400).json({ ok: false, error: 'invalid at' });

  try {
    const sql = `INSERT INTO measurement (station_id, at, temp_c, humidity, pressure_hpa, rain_mm, wind_speed_ms, wind_dir_deg)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`;
    const params = [station_id, ts.toISOString(), temp_c, humidity, pressure_hpa, rain_mm, wind_speed_ms, wind_dir_deg];
    const { rows } = await pool.query(sql, params);
    return res.status(201).json({ ok: true, id: rows[0]?.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'db insert error' });
  }
});

// --- helper unitats ---
const kmhToMs = v => (v == null ? null : Number(v) / 3.6);

// --- construeix URL Ecowitt ---
function ecowittURL() {
  const params = new URLSearchParams({
    application_key: process.env.ECW_APPLICATION_KEY,
    api_key: process.env.ECW_API_KEY,
    mac: process.env.ECW_MAC,
    call_back: 'all',
    temp_unitid: process.env.ECW_TEMP_UNITID || '1',
    wind_speed_unitid: process.env.ECW_WIND_SPEED_UNITID || '8',
    rainfall_unitid: process.env.ECW_RAINFALL_UNITID || '12',
    pressure_unitid: process.env.ECW_PRESSURE_UNITID || '3',
  });
  return `https://api.ecowitt.net/api/v3/device/real_time?${params.toString()}`;
}

// --- ruta protegida per fer el pull i guardar ---
app.post(['/tasks/pull-ecowitt','/api/tasks/pull-ecowitt'], checkApiKey, async (req,res) => {
  try {
    const url = ecowittURL();
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: 'ecowitt bad status', status: r.status });
    }
    const payload = await r.json(); // estructura similar a la del teu PHP
    const d = payload?.data;

    // extreu valors (amb opcional chaining i defaults)
    const stationId = process.env.STATION_ID || process.env.ECW_MAC || 'default';
    const at = new Date().toISOString(); // si Ecowitt dona timestamp i el vols, substitueix-lo aquí

    const temp_c        = d?.outdoor?.temperature?.value ?? null;
    const humidity      = d?.outdoor?.humidity?.value ?? null;
    const pressure_hpa  = d?.pressure?.relative?.value ?? null; // podries triar 'absolute'
    const rain_mm       = d?.rainfall?.daily?.value ?? null;     // triem 'daily' com a total bàsic
    const wind_kmh      = d?.wind?.wind_speed?.value ?? null;
    const wind_speed_ms = kmhToMs(wind_kmh);
    const wind_dir_deg  = d?.wind?.wind_direction?.value ?? null;

    const sql = `INSERT INTO measurement
      (station_id, at, temp_c, humidity, pressure_hpa, rain_mm, wind_speed_ms, wind_dir_deg)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id`;
    const params = [stationId, at, temp_c, humidity, pressure_hpa, rain_mm, wind_speed_ms, wind_dir_deg];

    const { rows } = await pool.query(sql, params);
    return res.status(201).json({ ok: true, id: rows[0]?.id, station_id: stationId });
  } catch (e) {
    console.error('pull-ecowitt error:', e);
    return res.status(500).json({ ok: false, error: 'pull failed' });
  }
});


app.listen(PORT, () => console.log(`Backend escoltant a :${PORT}`));