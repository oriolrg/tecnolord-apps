const express = require('express');
const path = require('path');
const app = express();
const port = 5000; // 4000 per a orientatrack

// SERVIR EL FRONTEND
// Qualsevol fitxer dins de la carpeta 'public' es veurà a tecnolord.cat/opos/
app.use(express.static(path.join(__dirname, 'public')));

// API PING
// Caddy ja ha retallat el prefix, així que aquí només posem /ping
app.get('/ping', (req, res) => {
  res.json({ ok: true, msg: "Backend d’Opos operatiu" });
});

// FALLBACK PER AL FRONTEND
// Això permet que si recarregues la pàgina, segueixi funcionant
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor opos corrent al port ${port}`);
});