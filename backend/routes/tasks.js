// backend/routes/tasks.js
const express = require('express');
const { randomUUID } = require('node:crypto');
const { NULL_LOGGER, isLogger } = require('../lib/logger');
const { currentRequestContext } = require('../middleware/requestContext');

const TASK_NAMES = Object.freeze(['ecowitt', 'aca', 'ecowitt-aca', 'previ']);

function createTaskRunner({
  pullEcowittAndSave,
  pullACAAndSave,
  pullPreviAndSave,
  logger = NULL_LOGGER,
}) {
  for (const dependency of [pullEcowittAndSave, pullACAAndSave, pullPreviAndSave]) {
    if (typeof dependency !== 'function') throw new TypeError('Task runner dependency must be a function');
  }
  if (!isLogger(logger)) throw new TypeError('Task logger must implement debug/info/warn/error');

  async function executeTask(taskName) {
    if (!TASK_NAMES.includes(taskName)) throw new RangeError('Unknown local task');

    if (taskName === 'ecowitt') {
      return { ok: true, meteo: await pullEcowittAndSave() };
    }
    if (taskName === 'aca') {
      return { ok: true, hidro: await pullACAAndSave() };
    }
    if (taskName === 'previ') {
      return { ok: true, previ: await pullPreviAndSave() };
    }

    const meteo = await pullEcowittAndSave();
    const hidro = await pullACAAndSave();
    return { ok: true, meteo, hidro };
  }

  return async function runTask(taskName, context) {
    const correlationId = context?.correlation_id
      || currentRequestContext()?.correlation_id
      || randomUUID();
    const startedAt = process.hrtime.bigint();
    try {
      const result = await executeTask(taskName);
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      logger.info(`task.${taskName}`, {
        correlation_id: correlationId,
        result: 'ok',
        duration_ms: Number(durationMs.toFixed(3)),
      });
      return result;
    } catch (error) {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      logger.error(`task.${TASK_NAMES.includes(taskName) ? taskName : 'unknown'}`, {
        correlation_id: correlationId,
        result: 'error',
        duration_ms: Number(durationMs.toFixed(3)),
        error_code: TASK_NAMES.includes(taskName) ? 'TASK_EXECUTION_FAILED' : 'TASK_UNKNOWN',
      });
      throw error;
    }
  };
}

function makeTasksRouter({
  checkApiKey,
  taskRunner,
  pullEcowittAndSave,
  pullACAAndSave,
  pullPreviAndSave,
  logger,
}) {
  const router = express.Router();
  const runTask = taskRunner || createTaskRunner({
    pullEcowittAndSave,
    pullACAAndSave,
    pullPreviAndSave,
    logger,
  });

  router.post(['/tasks/pull-ecowitt', '/api/tasks/pull-ecowitt'], checkApiKey, async (req, res) => {
    try {
      const result = await runTask('ecowitt-aca', req.requestContext);

      // Si ecowitt va skip, NO retornem 500: retornem 200 amb info de skipped
      const status = result.meteo.id ? 201 : 200;
      return res.status(status).json(result);
    } catch {
      return res.status(500).json({ ok: false, error: 'pull failed' });
    }
  });

  router.post(['/tasks/pull-aca', '/api/tasks/pull-aca'], checkApiKey, async (req, res) => {
    try {
      return res.status(201).json(await runTask('aca', req.requestContext));
    } catch {
      return res.status(500).json({ ok: false, error: 'pull aca failed' });
    }
  });

  router.post(['/tasks/pull-previ', '/api/tasks/pull-previ'], checkApiKey, async (req, res) => {
    try {
      return res.status(201).json(await runTask('previ', req.requestContext));
    } catch {
      return res.status(500).json({ ok: false, error: 'pull previ failed' });
    }
  });

  router.post(['/tasks/run/:task', '/api/tasks/run/:task'], checkApiKey, async (req, res) => {
    if (!TASK_NAMES.includes(req.params.task)) {
      return res.status(404).json({ ok: false, error: 'unknown task' });
    }
    try {
      return res.status(200).json(await runTask(req.params.task, req.requestContext));
    } catch {
      return res.status(500).json({ ok: false, error: 'task failed' });
    }
  });

  return router;
}

module.exports = { TASK_NAMES, createTaskRunner, makeTasksRouter };
