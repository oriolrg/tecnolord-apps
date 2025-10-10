const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), version: process.env.npm_package_version || null });
});

app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, msg: 'pong' });
});

app.listen(PORT, () => {
  console.log(`Backend escoltant a :${PORT}`);
});