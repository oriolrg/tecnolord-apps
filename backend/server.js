const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path'); // ⬅️ afegeix això a dalt

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

// servir l'HTML de frontend (carpeta del root: /frontend)
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
app.get('/', (_req, res) =>
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html'))
);