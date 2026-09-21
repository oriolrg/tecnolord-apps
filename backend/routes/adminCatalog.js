'use strict';

const express = require('express');
const { readSessionToken } = require('../services/identityService');
const { sameOriginMutation } = require('./identity');

function makeAdminCatalogRouter({ identityService, adminCatalog, mode } = {}) {
  if (!identityService || !adminCatalog) throw new TypeError('Admin catalog route dependencies are required');
  const router = express.Router();
  const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'admin_catalog_unavailable' });
  });
  router.use('/api/v1/admin/external-stations', (_req, res, next) => {
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
  function sendResult(res, result, created = false) {
    if (result.invalid) return res.status(400).json({ error: 'invalid_external_station' });
    if (result.conflict) return res.status(409).json({ error: 'revision_conflict' });
    if (result.duplicate) return res.status(409).json({ error: 'source_identity_conflict' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.status(created ? 201 : 200).json(result);
  }
  router.get('/api/v1/admin/external-stations', requireAdmin,
    safe(async (_req, res) => res.json({ items: await adminCatalog.list() })));
  router.get('/api/v1/admin/external-stations/:id', requireAdmin, safe(async (req, res) => {
    const station = await adminCatalog.get(req.params.id);
    return station ? res.json({ station }) : res.status(404).json({ error: 'not_found' });
  }));
  router.post('/api/v1/admin/external-stations', requireAdmin, mutation,
    safe(async (req, res) => sendResult(res, await adminCatalog.create(req.userSession.user.id, req.body), true)));
  router.put('/api/v1/admin/external-stations/:id', requireAdmin, mutation,
    safe(async (req, res) => sendResult(res, await adminCatalog.update(req.userSession.user.id, req.params.id, req.body))));
  return router;
}

module.exports = { makeAdminCatalogRouter };
