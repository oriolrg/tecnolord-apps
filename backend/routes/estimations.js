'use strict';

const express = require('express');

function makeEstimationsRouter({ estimations } = {}) {
  if (!estimations) throw new TypeError('Estimation service is required');
  const router = express.Router();
  const safe = (handler) => (req, res) => Promise.resolve(handler(req, res)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'estimations_unavailable' });
  });
  router.use('/api/v1/estimations', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0'); next();
  });
  router.get('/api/v1/estimations', safe(async (_req, res) => res.json({ items: await estimations.list() })));
  router.get('/api/v1/estimations/:id/current', safe(async (req, res) => {
    const item = await estimations.current(req.params.id);
    if (!item) return res.status(404).json({ error: 'not_found' });
    return res.json({ estimation: item, items: item.values ? [item.values] : [], source: {
      provider: 'OPEN_METEO', status: item.status, freshness: item.freshness,
      reference_label: item.reference.label, attribution: item.source.attribution,
    } });
  }));
  return router;
}

module.exports = { makeEstimationsRouter };
