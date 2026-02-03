const express = require('express');
const path = require('path');
const app = express();
const port = 6000;

// --- DADES DEL CALENDARI ---
// Segons la imatge de Sant Llorenç de Morunys
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
// Això serveix el teu index.html taronja/modern
app.use('/', express.static(path.join(__dirname, 'public')));

// --- RUTES API ---

// Ruta de diagnòstic
app.get('/ping', (req, res) => {
    res.json({ ok: true, msg: "Backend de PaP operatiu" });
});

// Ruta principal de lògica
app.get('/estat', (req, res) => {
  const ara = new Date();
  const diaSetmana = ara.getDay(); // 0 (dg) a 6 (ds)
  const hora = ara.getHours();
  
  // Ajustem: Dilluns=1, ..., Diumenge=7
  const diaAjustat = diaSetmana === 0 ? 7 : diaSetmana;

  // 1. Què toca avui?
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
      
      // Si és avui i ja han passat les 8, o si el dia ja ha passat: mirem la setmana que ve
      if (diff < 0 || (diff === 0 && hora >= 8)) {
        diff += 7;
      }
      
      // Si és avui i encara no són les 8, la diff és 0 (toca avui)
      if (diff < diesFaltants) diesFaltants = diff;
    });
    
    let textTemps = "";
    if (diesFaltants === 0) textTemps = "Avui mateix";
    else if (diesFaltants === 1) textTemps = "Demà";
    else textTemps = `D'aquí a ${diesFaltants} dies`;
    
    properes[nomsResidus[residu]] = textTemps;
  }

  const passatHora = hora >= 8;

  res.json({
    data_servidor: ara,
    dia_setmana: diaAjustat,
    avui: queTocaAvui,
    passatHora: passatHora,
    properes_recollides: properes,
    missatge: passatHora ? "La recollida ja s'ha fet (08:00h)" : "Encara ets a temps!"
  });
});

// --- EL COMODÍ (*) SEMPRE AL FINAL ---
// Si l'usuari escriu qualsevol altra cosa, li enviem el frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`PaP backend a punt al port ${port}`);
});