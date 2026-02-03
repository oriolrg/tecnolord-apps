const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.get('/api/orienta/ping', (req, res) => {
  res.json({ ok: true, msg: 'pong de OrientaTrack', timestamp: new Date() });
});

app.get('/orientatrack', (req, res) => {
  res.send('<h1>OrientaTrack</h1><p>Backend operatiu. Fase 0 completada.</p>');
});

app.listen(port, () => {
  console.log('OrientaTrack backend escoltant al port ' + port);
});
