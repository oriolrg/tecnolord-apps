const express = require('express');
const path = require('path');
const app = express();
const port = 6000;

// --- DADES DEL CALENDARI ---
const calendariPaP = {
  organica: [1, 3, 6],    // Dilluns, Dimecres, Dissabte
  envasos: [1, 5],        // Dilluns, Divendres
  paper_cartro: [5],      // Divendres
  resta: [3],             // Dimecres
  bolquers: [1, 3, 5, 6]  // Dilluns, Dimecres, Divendres, Dissabte
};

const nomsResidus = {
  organica: "Brossa Orgànica",
  envasos: "Envasos",
  paper_cartro: "Paper i Cartró",
  resta: "Resta",
  bolquers: "Bolquers i Compreses"
};

// --- SERVIR ESTÀTICS ---
app.use('/', express.static(path.join(__dirname, 'public')));

// --- RUTES API ---
app.get('/ping', (req, res) => {
    res.json({ ok: true, msg: "Backend de PaP operatiu" });
});

app.get('/estat', (req, res) => {
  const ara = new Date();
  const diaSetmana = ara.getDay(); // 0 (dg) a 6 (ds)
  const hora = ara.getHours();
  
  const diaAjustat = diaSetmana === 0 ? 7 : diaSetmana;

  // 1. Què toca avui
  let queTocaAvui = [];
  for (const [residu, dies] of Object.entries(calendariPaP)) {
    if (dies.includes(diaAjustat)) {
      queTocaAvui.push({ id: residu, nom: nomsResidus[residu] });
    }
  }

  // 2. Calcular propera recollida per a cada tipus
  let properes = {};
  for (const [residu, dies] of Object.entries(calendariPaP)) {
    let diesFaltants = Infinity;
    dies.forEach(diaRecollida => {
      let diff = diaRecollida - diaAjustat;
      if (diff <= 0) diff += 7; // Si el dia ja ha passat o és avui (per la propera setmana)
      if (diff < diesFaltants) diesFaltants = diff;
    });
    properes[nomsResidus[residu]] = `D'aquí a ${diesFaltants} dia/es`;
  }

  const passatHora = hora >= 8;

  res.json({
    dia_actual: diaAjustat,
    avui: queTocaAvui,
    passatHora: passatHora,
    properes_recollides: properes,
    missatge: passatHora ? "La recollida ja s'ha fet (eren les 08:00h)" : "Encara ets a temps!"
  });
});

// --- EL COMODÍ (*) SEMPRE AL FINAL ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log("PaP backend a punt al port 6000");
});