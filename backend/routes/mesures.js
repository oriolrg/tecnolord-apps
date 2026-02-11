// backend/routes/mesures.js
const express = require('express');
const { getWindowFromQuery } = require('../utils/periods');

function makeMesuresRouter({ pool }) {
  const router = express.Router();

  // ──────────────────────────────────────────────────────────
  // Rutes METEO
  router.get('/api/v1/mesures/darreres', async (req, res) => {
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
      if (start) {
        params.push(start.toISOString());
        wheres.push(`m.instant >= $${params.length}`);
      }
      if (end) {
        params.push(end.toISOString());
        wheres.push(`m.instant < $${params.length}`);
      }

      const whereSql = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
      const diffDays = (start && end) ? (end - start) / (1000 * 3600 * 24) : 0;

      let sql;
      if (diffDays > 3) {
        // Agregació horària si demanem més de 3 dies
        sql = `SELECT date_trunc('hour', m.instant) AS instant, AVG(m.temp_c) AS temp_c, AVG(m.humitat_pct) AS humitat_pct, AVG(m.pressio_rel_hpa) AS pressio_rel_hpa, SUM(m.taxa_pluja_mm_h)/60.0 AS pluja_hora_mm, MAX(m.vent_rafega_ms) AS vent_rafega_ms, AVG(m.vent_ms) AS vent_ms FROM mesures m ${whereSql} GROUP BY 1 ORDER BY 1 DESC LIMIT ${limit}`;
      } else {
        sql = `SELECT m.* FROM mesures m ${whereSql} ORDER BY instant DESC LIMIT ${limit}`;
      }

      const { rows } = await pool.query(sql, params);
      res.json({ ok: true, items: rows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'db query error' });
    }
  });

  return router;
}

module.exports = { makeMesuresRouter };
