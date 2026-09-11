// backend/routes/previ.js
const express = require('express');
const { NULL_LOGGER, isLogger } = require('../lib/logger');

function makePreviRouter({ previService, logger = NULL_LOGGER }) {
  if (!isLogger(logger)) throw new TypeError('Previ logger must implement debug/info/warn/error');
  const router = express.Router();

  // PREVI: retorna l'últim run guardat
  router.get('/api/v1/previ/48h', async (req, res) => {
    try {
      const payload = await previService.getLatestPrevi48h({
        station: req.query.station,
        model: req.query.model,
        source: req.query.source
      });
      if (!payload) return res.status(404).json({ ok: false, error: 'no forecast saved yet' });
      return res.json(payload);
    } catch {
      logger.error('route.previ.latest', {
        result: 'error',
        error_code: 'DB_QUERY_FAILED',
      });
      return res.status(500).json({ ok: false, error: 'db query error' });
    }
  });

  // PREVI: retorna passades 48h i properes 48h al voltant d'ara
  router.get('/api/v1/previ/past48-next48', async (req, res) => {
    try {
      const payload = await previService.getPreviPast48AndNext48({
        station: req.query.station,
        model: req.query.model,
        source: req.query.source
      });
      if (!payload) return res.status(404).json({ ok: false, error: 'no forecast data in +/-48h window' });
      return res.json(payload);
    } catch {
      logger.error('route.previ.window', {
        result: 'error',
        error_code: 'DB_QUERY_FAILED',
      });
      return res.status(500).json({ ok: false, error: 'db query error' });
    }
  });

  return router;
}

module.exports = { makePreviRouter };
