const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const port = 4000;

// Connexió a la DB (per quan la necessitem)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 1. Endpoints de l'API
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, msg: 'Backend d’OrientaTrack operatiu' });
});

// 2. Servir el Frontend (fitxers estàtics)
// Quan entris a /orientatrack, Express buscarà a la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Qualsevol ruta que no sigui l'API, serveix el frontend (per a SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`OrientaTrack funcionant a http://localhost:${port}`);
});