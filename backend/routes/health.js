// backend/routes/health.js
const express = require('express');
const { NULL_LOGGER, isLogger } = require('../lib/logger');

const DEFAULT_DB_TIMEOUT_MS = 2000;

function checkDatabase(pool, { timeoutMs = DEFAULT_DB_TIMEOUT_MS } = {}) {
  if (!pool || typeof pool.query !== 'function') {
    throw new TypeError('Health pool must implement query()');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError('Health timeout must be a positive integer');
  }

  let timeoutHandle;
  const query = Promise.resolve().then(() => pool.query({
    text: 'SELECT 1',
    query_timeout: timeoutMs,
  }));
  const deadline = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Database health check timed out')), timeoutMs);
  });

  return Promise.race([query, deadline]).finally(() => clearTimeout(timeoutHandle));
}

function makeHealthRouter({ pool, timeoutMs = DEFAULT_DB_TIMEOUT_MS, logger = NULL_LOGGER }) {
  if (!isLogger(logger)) throw new TypeError('Health logger must implement debug/info/warn/error');
  const router = express.Router();

  router.get('/health', async (_req, res) => {
    try {
      await checkDatabase(pool, { timeoutMs });
      return res.status(200).json({ ok: true });
    } catch {
      logger.error('health.database', {
        result: 'unavailable',
        error_code: 'DB_UNAVAILABLE',
      });
      return res.status(503).json({ ok: false, code: 'DB_UNAVAILABLE' });
    }
  });

  return router;
}

module.exports = { DEFAULT_DB_TIMEOUT_MS, checkDatabase, makeHealthRouter };
