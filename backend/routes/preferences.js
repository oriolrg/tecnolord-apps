'use strict';

const express = require('express');
const { readSessionToken } = require('../services/identityService');
const { sameOriginMutation } = require('./identity');

function makePreferencesRouter({ identityService, preferences, mode } = {}) {
  if (!identityService || !preferences) throw new TypeError('Preference route dependencies are required');
  const router = express.Router();
  const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'preference_unavailable' });
  });

  router.use('/api/v1/me/preferences', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Vary', 'Cookie');
    next();
  });

  const requireUser = safe(async (req, res, next) => {
    const current = await identityService.current(readSessionToken(req));
    if (!current) return res.status(401).json({ error: 'unauthenticated' });
    req.userSession = current;
    return next();
  });
  const requireMutation = safe(async (req, res, next) => {
    if (!sameOriginMutation(req, mode)
        || !identityService.validCsrf(req.userSession, req.get('x-csrf-token'))) {
      return res.status(403).json({ error: 'forbidden' });
    }
    return next();
  });

  router.get('/api/v1/me/preferences', requireUser, safe(async (req, res) => {
    return res.json({ preference: await preferences.get(req.userSession.user.id) });
  }));

  router.put('/api/v1/me/preferences/default-station', requireUser, requireMutation, safe(async (req, res) => {
    const result = await preferences.setDefault(req.userSession.user.id, req.body);
    if (result.invalid) return res.status(400).json({ error: 'invalid_preference' });
    if (result.conflict) return res.status(409).json({ error: 'revision_conflict' });
    if (result.notFound) return res.status(404).json({ error: 'not_found' });
    return res.json(result);
  }));

  router.delete('/api/v1/me/preferences/default-station', requireUser, requireMutation, safe(async (req, res) => {
    const result = await preferences.clearDefault(req.userSession.user.id, req.body);
    if (result.invalid) return res.status(400).json({ error: 'invalid_preference' });
    if (result.conflict) return res.status(409).json({ error: 'revision_conflict' });
    return res.json(result);
  }));

  return router;
}

module.exports = { makePreferencesRouter };
