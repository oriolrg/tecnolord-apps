// backend/routes/health.js
const express = require('express');

function makeHealthRouter({ pool }) {
  const router = express.Router();

  router.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true, db: 'ok', time: new Date().toISOString() });
    } catch {
      res.json({ ok: true, db: 'down', time: new Date().toISOString() });
    }
  });

  return router;
}

module.exports = { makeHealthRouter };
