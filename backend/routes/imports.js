'use strict';

const express = require('express');
const { readSessionToken } = require('../services/identityService');
const { sameOriginMutation } = require('./identity');

function makeImportsRouter({ identityService, imports, mode } = {}) {
  if (!identityService || !imports) throw new TypeError('Import route dependencies are required');
  const router = express.Router();
  const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'imports_unavailable' });
  });

  router.use('/api/v1/admin/imports', (_req, res, next) => {
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
    if (result.invalid) return res.status(400).json({ error: 'invalid_inventory' });
    if (result.conflict) return res.status(409).json({ error: 'import_conflict' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.status(created && !result.idempotent ? 201 : 200).json(result);
  }

  router.get('/api/v1/admin/imports', requireAdmin,
    safe(async (_req, res) => res.json({ items: await imports.list() })));
  router.get('/api/v1/admin/imports/:id', requireAdmin, safe(async (req, res) => {
    const batch = await imports.get(req.params.id);
    return batch ? res.json({ batch }) : res.status(404).json({ error: 'not_found' });
  }));
  router.post('/api/v1/admin/imports/dry-run', requireAdmin, mutation,
    safe(async (req, res) => sendResult(res, await imports.stage(req.userSession.user.id, req.body), true)));
  router.post('/api/v1/admin/imports/:id/apply', requireAdmin, mutation,
    safe(async (req, res) => sendResult(res, await imports.apply(req.userSession.user.id, req.params.id))));
  router.post('/api/v1/admin/imports/:id/rollback', requireAdmin, mutation,
    safe(async (req, res) => sendResult(res, await imports.rollback(req.userSession.user.id, req.params.id))));
  return router;
}

module.exports = { makeImportsRouter };
