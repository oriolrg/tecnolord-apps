'use strict';

const express = require('express');
const {
  clearSessionCookie,
  makeIdentityService,
  readSessionToken,
  sessionCookie,
} = require('../services/identityService');

function sameOriginMutation(req, mode) {
  const origin = req.get('origin');
  const host = req.get('host');
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    const expectedProtocol = ['local', 'test'].includes(mode) ? 'http:' : 'https:';
    return parsed.protocol === expectedProtocol && parsed.host === host && parsed.pathname === '/';
  } catch { return false; }
}

function createLoginLimiter({ now = Date.now } = {}) {
  const buckets = new Map();
  return function limited(req) {
    const timestamp = now();
    if (buckets.size > 10000) {
      for (const [key, value] of buckets) if (value.resetAt <= timestamp) buckets.delete(key);
      if (buckets.size > 10000) return true;
    }
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const keys = [`ip:${req.ip}`, `email:${email.slice(0, 254)}`];
    let blocked = false;
    for (const key of keys) {
      const limit = key.startsWith('ip:') ? 40 : 5;
      const entry = buckets.get(key);
      const current = !entry || entry.resetAt <= timestamp
        ? { count: 0, resetAt: timestamp + 15 * 60 * 1000 } : entry;
      current.count += 1;
      buckets.set(key, current);
      if (current.count > limit) blocked = true;
    }
    return blocked;
  };
}

function makeIdentityRouter({ pool, mode, now = Date.now, mailAdapter, identityService } = {}) {
  const router = express.Router();
  const service = identityService || makeIdentityService({ pool, now, mailAdapter });
  const secure = !['local', 'test'].includes(mode);
  const loginLimited = createLoginLimiter({ now });
  const registrationLimited = createLoginLimiter({ now });
  const recoveryLimited = createLoginLimiter({ now });
  const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(() => {
    if (!res.headersSent) res.status(503).json({ error: 'auth_unavailable' });
  });
  router.use('/api/v1/auth', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.use('/api/v1/auth', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    return sameOriginMutation(req, mode) ? next() : res.status(403).json({ error: 'forbidden' });
  });

  router.post('/api/v1/auth/login', safe(async (req, res) => {
    if (loginLimited(req)) return res.status(429).json({ error: 'too_many_attempts' });
    const result = await service.login(req.body?.email, req.body?.password);
    if (!result) return res.status(401).json({ error: 'invalid_credentials' });
    res.setHeader('Set-Cookie', sessionCookie(result.token, { secure }));
    return res.json({ user: result.user, csrf_token: result.csrfToken });
  }));

  router.get('/api/v1/auth/me', safe(async (req, res) => {
    const current = await service.current(readSessionToken(req));
    return current
      ? res.json({ user: current.user, csrf_token: current.csrfToken })
      : res.status(401).json({ error: 'unauthenticated' });
  }));

  router.post('/api/v1/auth/logout', safe(async (req, res) => {
    const current = await service.current(readSessionToken(req));
    if (!current) return res.status(401).json({ error: 'unauthenticated' });
    if (!service.validCsrf(current, req.get('x-csrf-token'))) return res.status(403).json({ error: 'forbidden' });
    await service.logout(current);
    res.setHeader('Set-Cookie', clearSessionCookie({ secure }));
    return res.json({ ok: true });
  }));

  router.post('/api/v1/auth/recover', safe(async (req, res) => {
    if (recoveryLimited(req)) return res.status(429).json({ error: 'too_many_attempts' });
    const available = await service.requestRecovery(req.body?.email);
    return available
      ? res.json({ ok: true })
      : res.status(503).json({ error: 'recovery_unavailable' });
  }));

  router.post('/api/v1/auth/reset', safe(async (req, res) => {
    const changed = await service.resetPassword(req.body?.token, req.body?.password);
    return changed
      ? res.json({ ok: true })
      : res.status(400).json({ error: 'invalid_or_expired_token' });
  }));

  router.post('/api/v1/auth/request', safe(async (req, res) => {
    if (registrationLimited(req)) return res.status(429).json({ error: 'too_many_attempts' });
    const result = await service.requestRegistration(req.body);
    if (result.unavailable) return res.status(503).json({ error: 'registration_unavailable' });
    if (result.invalid) return res.status(400).json({ error: 'invalid_registration' });
    return res.status(202).json({ ok: true });
  }));

  router.post('/api/v1/auth/verify-email', safe(async (req, res) => {
    const verified = await service.verifyEmail(req.body?.token);
    return verified
      ? res.json({ ok: true, status: 'PENDING_APPROVAL' })
      : res.status(400).json({ error: 'invalid_or_expired_token' });
  }));

  router.use('/api/v1/admin/accounts', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.use('/api/v1/admin/accounts', safe(async (req, res, next) => {
    const current = await service.current(readSessionToken(req));
    if (!current) return res.status(401).json({ error: 'unauthenticated' });
    if (current.user.role !== 'SUPERADMIN') return res.status(403).json({ error: 'forbidden' });
    if (!['GET', 'HEAD'].includes(req.method)
        && (!sameOriginMutation(req, mode) || !service.validCsrf(current, req.get('x-csrf-token')))) {
      return res.status(403).json({ error: 'forbidden' });
    }
    req.adminSession = current;
    return next();
  }));

  router.get('/api/v1/admin/accounts', safe(async (_req, res) => {
    return res.json({ items: await service.listManagedAccounts() });
  }));

  router.post('/api/v1/admin/accounts/:id/:action', safe(async (req, res) => {
    if (!/^[1-9][0-9]{0,18}$/.test(req.params.id)) return res.status(400).json({ error: 'invalid_id' });
    const changed = await service.decideAccount({
      actorId: req.adminSession.user.id,
      targetId: req.params.id,
      action: req.params.action,
    });
    return changed ? res.json({ ok: true }) : res.status(409).json({ error: 'invalid_transition' });
  }));

  return router;
}

module.exports = { createLoginLimiter, makeIdentityRouter, sameOriginMutation };
