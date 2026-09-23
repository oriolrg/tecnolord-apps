'use strict';
const express = require('express');
const { readSessionToken } = require('../services/identityService');
const { sameOriginMutation } = require('./identity');

function makeStationHistoryRouter({ identityService, historyService, mode } = {}) {
  if (!identityService || !historyService) throw new TypeError('History route dependencies are required');
  const router = express.Router();
  const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'history_policy_unavailable' });
  });
  router.use('/api/v1/admin/station-history-policies', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  const admin = safe(async (req, res, next) => {
    const current = await identityService.current(readSessionToken(req));
    if (!current) return res.status(401).json({ error: 'unauthenticated' });
    if (current.user.role !== 'SUPERADMIN') return res.status(403).json({ error: 'forbidden' });
    req.userSession = current; return next();
  });
  const mutation = (req, res, next) => sameOriginMutation(req, mode)
    && identityService.validCsrf(req.userSession, req.get('x-csrf-token')) ? next() : res.status(403).json({ error: 'forbidden' });
  router.get('/api/v1/admin/station-history-policies', admin, safe(async (_req, res) => res.json({ items: await historyService.list() })));
  router.post('/api/v1/admin/station-history-policies/:id/preview', admin, mutation, safe(async (req, res) => {
    const result = await historyService.preview(req.userSession.user.id, req.params.id, req.body?.retention_days);
    if (result.invalid) return res.status(400).json({ error: 'invalid_policy' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.json({ preview: result });
  }));
  router.put('/api/v1/admin/station-history-policies/:id', admin, mutation, safe(async (req, res) => {
    const result = await historyService.update(req.userSession.user.id, req.params.id, req.body);
    if (result.invalid) return res.status(400).json({ error: 'invalid_policy' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    if (result.conflict) return res.status(409).json({ error: 'revision_conflict' });
    if (result.interval) return res.status(400).json({ error: 'interval_below_source', minimum: result.minimum });
    if (result.previewRequired) return res.status(409).json({ error: 'legacy_preview_required' });
    return res.json(result);
  }));
  return router;
}
module.exports = { makeStationHistoryRouter };
