// backend/routes/tasks.js
const express = require('express');

const TASK_NAMES = Object.freeze(['ecowitt', 'aca', 'ecowitt-aca', 'previ']);

function createTaskRunner({ pullEcowittAndSave, pullACAAndSave, pullPreviAndSave }) {
  for (const dependency of [pullEcowittAndSave, pullACAAndSave, pullPreviAndSave]) {
    if (typeof dependency !== 'function') throw new TypeError('Task runner dependency must be a function');
  }

  return async function runTask(taskName) {
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
  };
}

function makeTasksRouter({
  checkApiKey,
  taskRunner,
  pullEcowittAndSave,
  pullACAAndSave,
  pullPreviAndSave,
}) {
  const router = express.Router();
  const runTask = taskRunner || createTaskRunner({
    pullEcowittAndSave,
    pullACAAndSave,
    pullPreviAndSave,
  });

  router.post(['/tasks/pull-ecowitt', '/api/tasks/pull-ecowitt'], checkApiKey, async (_req, res) => {
    try {
      const result = await runTask('ecowitt-aca');

      // Si ecowitt va skip, NO retornem 500: retornem 200 amb info de skipped
      const status = result.meteo.id ? 201 : 200;
      return res.status(status).json(result);
    } catch (e) {
      console.error('pull-ecowitt error:', e);
      return res.status(500).json({ ok: false, error: 'pull failed' });
    }
  });

  router.post(['/tasks/pull-aca', '/api/tasks/pull-aca'], checkApiKey, async (_req, res) => {
    try {
      return res.status(201).json(await runTask('aca'));
    } catch (e) {
      console.error('pull-aca error:', e);
      return res.status(500).json({ ok: false, error: 'pull aca failed' });
    }
  });

  router.post(['/tasks/pull-previ', '/api/tasks/pull-previ'], checkApiKey, async (_req, res) => {
    try {
      return res.status(201).json(await runTask('previ'));
    } catch (e) {
      console.error('pull-previ error:', e);
      return res.status(500).json({ ok: false, error: 'pull previ failed' });
    }
  });

  router.post(['/tasks/run/:task', '/api/tasks/run/:task'], checkApiKey, async (req, res) => {
    if (!TASK_NAMES.includes(req.params.task)) {
      return res.status(404).json({ ok: false, error: 'unknown task' });
    }
    try {
      return res.status(200).json(await runTask(req.params.task));
    } catch (error) {
      console.error(`local task ${req.params.task} failed`, error);
      return res.status(500).json({ ok: false, error: 'task failed' });
    }
  });

  return router;
}

module.exports = { TASK_NAMES, createTaskRunner, makeTasksRouter };
