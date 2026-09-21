// backend/routes/mesures.js
const express = require('express');
const { getWindowFromQuery } = require('../utils/periods');
const { NULL_LOGGER, isLogger } = require('../lib/logger');
const { readSessionToken } = require('../services/identityService');
const { MEASUREMENT_FIELDS } = require('./stations');

function makeMesuresRouter({ pool, logger = NULL_LOGGER, identityService, stationCatalog }) {
  if (!isLogger(logger)) throw new TypeError('Mesures logger must implement debug/info/warn/error');
  const router = express.Router();

  // ──────────────────────────────────────────────────────────
  // Rutes METEO
  router.get('/api/v1/mesures/darreres', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vary', 'Cookie');
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10) || 50, 1), 5000);
    const estacioCodi = req.query.estacio || null;
    const { start, end } = getWindowFromQuery(req);

    try {
      const current = identityService
        ? await identityService.current(readSessionToken(req))
        : null;
      const station = stationCatalog
        ? (estacioCodi
          ? await stationCatalog.accessible({ code: estacioCodi, actor: current?.user, dataOnly: true })
          : await stationCatalog.globalPublic())
        : { id: null };
      if (!station) {
        return estacioCodi
          ? res.status(404).json({ error: 'not_found' })
          : res.json({ ok: true, items: [], status: 'no_public_station' });
      }
      const params = station.id == null ? [] : [station.id];
      const wheres = [];

      if (station.id != null) wheres.push('m.estacio_id = $1');
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
        sql = `SELECT date_trunc('hour', m.instant) AS instant, AVG(m.temp_c) AS temp_c, AVG(m.humitat_pct) AS humitat_pct, AVG(m.pressio_rel_hpa) AS pressio_rel_hpa, SUM(m.taxa_pluja_mm_h)/60.0 AS pluja_hora_mm, MAX(m.vent_rafega_ms) AS vent_rafega_ms, AVG(m.vent_ms) AS vent_ms FROM meteo.mesures m ${whereSql} GROUP BY 1 ORDER BY 1 DESC LIMIT ${limit}`;
      } else {
        sql = `SELECT ${MEASUREMENT_FIELDS} FROM meteo.mesures m ${whereSql} ORDER BY instant DESC LIMIT ${limit}`;
      }

      const { rows } = await pool.query(sql, params);
      res.json({ ok: true, items: rows });
    } catch {
      logger.error('route.mesures', {
        result: 'error',
        error_code: 'DB_QUERY_FAILED',
      });
      res.status(500).json({ ok: false, error: 'db query error' });
    }
  });

  return router;
}

module.exports = { makeMesuresRouter };
