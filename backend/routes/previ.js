// backend/routes/previ.js
const express = require('express');
const { normalizeOpenMeteoModel } = require('../utils/previ');

function makePreviRouter({ pool }) {
  const router = express.Router();

  // ──────────────────────────────────────────────────────────
  // PREVI: retorna l'últim run guardat
  router.get('/api/v1/previ/48h', async (req, res) => {
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

  return router;
}

module.exports = { makePreviRouter };
