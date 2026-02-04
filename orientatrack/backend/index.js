const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// Servir estàtics des de la carpeta public del contenidor
// IMPORTANT: Això farà que si demanen /js/compass.js, el busqui a public/js/compass.js
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/estat', (req, res) => {
    res.json({ status: 'ok', missatge: 'OrientaTrack API connectada' });
});

// Per a qualsevol altra ruta, servim l'index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`OrientaTrack escoltant al port ${port}`);
});