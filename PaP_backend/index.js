const express = require('express');
const path = require('path');
const app = express();

// 1. Servir fitxers estàtics
// Com que Caddy ja ha tret la paraula "/pap", aquí usem "/"
app.use('/', express.static(path.join(__dirname, 'public')));

// 2. API Ping
// Com que Caddy ha tret "/api/pap", aquí només posem "/ping"
app.get('/ping', (req, res) => {
    res.json({ ok: true, msg: "Backend d'PaP operatiu" });
});

// 3. Fallback per a Single Page Application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(6000, '0.0.0.0', () => {
    console.log("PaP backend a punt al port 6000");
});