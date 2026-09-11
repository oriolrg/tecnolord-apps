// backend/routes/ping.js
const express = require('express');
const router = express.Router();

router.get('/api/ping', (_req, res) => res.json({ ok: true }));

module.exports = { router };
