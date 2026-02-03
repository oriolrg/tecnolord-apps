const express = require('express');
const path = require('path');
const app = express();
const port = 6000;

const calendariPaP = {
  organica: [1, 3, 6], envasos: [1, 5], paper_cartro: [5], resta: [3], bolquers: [1, 3, 5, 6]
};
const nomsResidus = {
  organica: "Brossa Orgànica", envasos: "Envasos", paper_cartro: "Paper i Cartró", resta: "Resta", bolquers: "Bolquers i Compreses"
};

// 1. Servir estàtics primer
app.use(express.static(path.join(__dirname, 'public')));

// 2. Rutes d'API blindades (accepten amb barra i sense barra)
app.get(['/estat', '/estat/', '/api/pap/estat', '/api/pap/estat/'], (req, res) => {
  const ara = new Date();
  const diaSetmana = ara.getDay();
  const hora = ara.getHours();
  const diaAjustat = diaSetmana === 0 ? 7 : diaSetmana;

  let queTocaAvui = [];
  for (const [residu, dies] of Object.entries(calendariPaP)) {
    if (dies.includes(diaAjustat)) queTocaAvui.push({ id: residu, nom: nomsResidus[residu] });
  }

  let properes = {};
  for (const [residu, dies] of Object.entries(calendariPaP)) {
    let diesFaltants = Infinity;
    dies.forEach(diaRecollida => {
      let diff = diaRecollida - diaAjustat;
      if (diff < 0 || (diff === 0 && hora >= 8)) diff += 7;
      if (diff < diesFaltants) diesFaltants = diff;
    });
    properes[nomsResidus[residu]] = diesFaltants === 0 ? "Avui mateix" : (diesFaltants === 1 ? "Demà" : `D'aquí a ${diesFaltants} dies`);
  }

  res.json({
    ok: true,
    data_servidor: ara,
    avui: queTocaAvui,
    passatHora: hora >= 8,
    properes_recollides: properes
  });
});

// 3. Fallback per HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => console.log("PaP Backend Running"));