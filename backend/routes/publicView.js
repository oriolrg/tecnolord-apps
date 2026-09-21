'use strict';

const express = require('express');
const { readSessionToken } = require('../services/identityService');
const { sameOriginMutation } = require('./identity');

function makePublicViewRouter({ identityService, publicView, mode } = {}) {
  if (!identityService || !publicView) throw new TypeError('Public view route dependencies are required');
  const router = express.Router();
  const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'public_view_unavailable' });
  });
  router.use(['/api/v1/public-view', '/api/v1/admin/public-view'], (_req, res, next) => {
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
  const mutation = safe(async (req, res, next) => {
    if (!sameOriginMutation(req, mode)
        || !identityService.validCsrf(req.userSession, req.get('x-csrf-token'))) {
      return res.status(403).json({ error: 'forbidden' });
    }
    return next();
  });
  router.get('/api/v1/public-view', safe(async (_req, res) => res.json({ config: await publicView.get() })));
  router.get('/api/v1/admin/public-view', requireAdmin,
    safe(async (_req, res) => res.json({ config: await publicView.get({ admin: true }) })));
  router.put('/api/v1/admin/public-view', requireAdmin, mutation, safe(async (req, res) => {
    const result = await publicView.update(req.userSession.user.id, req.body);
    if (result.invalid) return res.status(400).json({ error: 'invalid_public_view' });
    if (result.conflict) return res.status(409).json({ error: 'revision_conflict' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.json(result);
  }));
  return router;
}

module.exports = { makePublicViewRouter };
