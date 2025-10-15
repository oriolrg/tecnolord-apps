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
