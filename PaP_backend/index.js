const express = require('express');
const path = require('path');
const app = express();
const port = 6000;

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/ping', (req, res) => {
    res.json({ ok: true, msg: "Backend de PaP operatiu" });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log("PaP backend a punt al portt 6000");
});