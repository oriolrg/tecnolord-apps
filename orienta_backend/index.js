const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 4000;

// Connexió a la base de dades (usant la variable d'entorn del docker-compose)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/ping', (req, res) => {
  res.json({ ok: true, msg: 'pong', db: 'connected' });
});

// Endpoint per llistar les rutes de la Fase 1
app.get('/routes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description FROM ot_routes ORDER BY id DESC');
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Endpoint per veure els punts (checkpoints) d'una ruta
app.get('/routes/:id/checkpoints', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, sequence_order, radius_meters, 
       ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat 
       FROM ot_checkpoints 
       WHERE route_id = $1 
       ORDER BY sequence_order ASC`, 
      [id]
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`OrientaTrack API corrent al port ${port}`);
});