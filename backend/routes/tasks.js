// backend/routes/tasks.js
const express = require('express');

function makeTasksRouter({ checkApiKey, pullEcowittAndSave, pullACAAndSave, pullPreviAndSave }) {
  const router = express.Router();

  router.post(['/tasks/pull-ecowitt', '/api/tasks/pull-ecowitt'], checkApiKey, async (_req, res) => {
    try {
      const meteo = await pullEcowittAndSave();
      const hidro = await pullACAAndSave();

      // Si ecowitt va skip, NO retornem 500: retornem 200 amb info de skipped
      const status = meteo.id ? 201 : 200;
      return res.status(status).json({ ok: true, meteo, hidro });
    } catch (e) {
      console.error('pull-ecowitt error:', e);
      return res.status(500).json({ ok: false, error: 'pull failed' });
    }
  });

  router.post(['/tasks/pull-aca', '/api/tasks/pull-aca'], checkApiKey, async (_req, res) => {
    try {
      const hidro = await pullACAAndSave();
      return res.status(201).json({ ok: true, hidro });
    } catch (e) {
      console.error('pull-aca error:', e);
      return res.status(500).json({ ok: false, error: 'pull aca failed' });
    }
  });

  router.post(['/tasks/pull-previ', '/api/tasks/pull-previ'], checkApiKey, async (_req, res) => {
    try {
      const previ = await pullPreviAndSave();
      return res.status(201).json({ ok: true, previ });
    } catch (e) {
      console.error('pull-previ error:', e);
      return res.status(500).json({ ok: false, error: 'pull previ failed' });
    }
  });

  return router;
}

module.exports = { makeTasksRouter };
