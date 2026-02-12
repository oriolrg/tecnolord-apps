// backend/routes/previ.js
const express = require('express');

function makePreviRouter({ previService  }) {
  const router = express.Router();

  // ──────────────────────────────────────────────────────────
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
      } catch (e) {
        console.error(e);
        return res.status(500).json({ ok: false, error: 'db query error' });
      }
  });

  return router;
}

module.exports = { makePreviRouter };
