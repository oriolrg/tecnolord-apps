const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// DB config
const pgConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST || 'db',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
};
const pool = new Pool(pgConfig);

// middlewares
// --- protecció per clau ---
function checkApiKey(req, res, next) {
  const key = req.get('x-api-key') || req.query.key;
  const serverKey = process.env.INGEST_API_KEY || '';
  if (!serverKey) return res.status(500).json({ ok: false, error: 'server missing INGEST_API_KEY' });
  if (key !== serverKey) return res.status(401).json({ ok: false, error: 'invalid api key' });
  next();
}

// --- ingesta ---
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
app.use(express.json());

// (si en local vols servir el frontend des d'aquí)
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
app.get('/', (_req, res) =>
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html'))
);

// health (inclou DB)
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'ok', time: new Date().toISOString() });
  } catch (e) {
    res.json({ ok: true, db: 'down', time: new Date().toISOString() });
  }
});

// ping de sempre
app.get('/api/ping', (_req, res) => res.json({ ok: true, msg: 'pong' }));

app.listen(PORT, () => console.log(`Backend escoltant a :${PORT}`));
