'use strict';

const express = require('express');
const { readSessionToken } = require('../services/identityService');

function makeGrafanaRouter({ identityService, grafana } = {}) {
  if (!identityService || !grafana) throw new TypeError('Grafana route dependencies are required');
  const router = express.Router();
  const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'grafana_unavailable' });
  });
  router.use('/api/v1/admin/grafana', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Vary', 'Cookie');
    next();
  });
  const requireAdmin = safe(async (req, res, next) => {
    const current = await identityService.current(readSessionToken(req));
    if (!current) return res.status(401).json({ error: 'unauthenticated' });
    if (current.user.role !== 'SUPERADMIN') return res.status(403).json({ error: 'forbidden' });
    req.userSession = current;
    return next();
  });
  router.get('/api/v1/admin/grafana/stations', requireAdmin,
    safe(async (_req, res) => res.json({ items: await grafana.list() })));
  router.get('/api/v1/admin/grafana/stations/:id/current', requireAdmin, safe(async (req, res) => {
    const result = await grafana.query(req.params.id);
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    if (result.disabled) return res.status(503).json({ error: 'grafana_disabled' });
    if (result.upstreamError) return res.status(502).json({ error: 'grafana_upstream', code: result.upstreamError });
    return res.json(result.data);
  }));
  return router;
}

module.exports = { makeGrafanaRouter };
