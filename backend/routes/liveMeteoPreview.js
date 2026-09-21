'use strict';

const express = require('express');

const LIVE_API = 'https://tecnolord.cat/api/v1/mesures/darreres';
const ALLOWED_PARAMS = new Set(['estacio', 'limit', 'period', 'from', 'to']);

function makeLiveMeteoPreviewRouter({ fetchImpl = globalThis.fetch } = {}) {
  const router = express.Router();
  router.get('/api/v1/mesures/darreres', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const entries = Object.entries(req.query);
    if (entries.some(([key, value]) => !ALLOWED_PARAMS.has(key) || typeof value !== 'string')) {
      return res.status(400).json({ ok: false, error: 'invalid_query' });
    }
    const limit = Number(req.query.limit ?? 48);
    if (!Number.isInteger(limit) || limit < 1 || limit > 300) {
      return res.status(400).json({ ok: false, error: 'invalid_limit' });
    }
    const target = new URL(LIVE_API);
    for (const [key, value] of entries) target.searchParams.set(key, value);
    target.searchParams.set('limit', String(limit));
    try {
      const upstream = await fetchImpl(target, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!upstream.ok) return res.status(502).json({ ok: false, error: 'upstream_unavailable' });
      const body = await upstream.json();
      if (!body || body.ok !== true || !Array.isArray(body.items)) throw new Error('invalid_response');
      return res.json({ ok: true, items: body.items.map(({ id, estacio_id, extres, ...measure }) => measure) });
    } catch {
      return res.status(502).json({ ok: false, error: 'upstream_unavailable' });
    }
  });
  for (const route of ['hidro/darreres', 'previ/48h']) {
    const allowed = route === 'hidro/darreres'
      ? new Set(['codi', 'limit', 'period', 'from', 'to', 'mode', 'ensure'])
      : new Set();
    router.get(`/api/v1/${route}`, async (req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      if (Object.entries(req.query).some(([key, value]) => !allowed.has(key) || typeof value !== 'string')) {
        return res.status(400).json({ ok: false, error: 'invalid_query' });
      }
      const target = new URL(`https://tecnolord.cat/api/v1/${route}`);
      for (const [key, value] of Object.entries(req.query)) target.searchParams.set(key, value);
      try {
        const upstream = await fetchImpl(target, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        });
        if (!upstream.ok) return res.status(502).json({ ok: false, error: 'upstream_unavailable' });
        return res.json(await upstream.json());
      } catch {
        return res.status(502).json({ ok: false, error: 'upstream_unavailable' });
      }
    });
  }
  return router;
}

module.exports = { makeLiveMeteoPreviewRouter };
