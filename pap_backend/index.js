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

// 1. Servir fitxers estàtics de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 2. Ruta de diagnòstic
app.get('/ping', (req, res) => {
    res.json({ ok: true, msg: "Backend de PaP operatiu" });
});

// 3. Lògica de l'estat (Ruta que rep de Caddy)
app.get(['/estat', '/estat/'], (req, res) => {
  const ara = new Date();
  const diaSetmana = ara.getDay(); // 0 (dg) a 6 (ds)
  const hora = ara.getHours();
  
  // Ajust: Dilluns=1, Diumenge=7
  const diaAjustat = diaSetmana === 0 ? 7 : diaSetmana;

  // Què toca avui?
  let queTocaAvui = [];
  for (const [residu, dies] of Object.entries(calendariPaP)) {
    if (dies.includes(diaAjustat)) {
      queTocaAvui.push({ id: residu, nom: nomsResidus[residu] });
    }
  }

  // Càlcul de properes recollides
  let properes = {};
  for (const [residu, dies] of Object.entries(calendariPaP)) {
    let diesFaltants = Infinity;
    dies.forEach(diaRecollida => {
      let diff = diaRecollida - diaAjustat;
      // Si ja han passat les 8am d'avui o el dia ja ha passat, mirem setmana vinent
      if (diff < 0 || (diff === 0 && hora >= 8)) diff += 7;
      if (diff < diesFaltants) diesFaltants = diff;
    });
    
    let text = "";
    if (diesFaltants === 0) text = "Avui mateix";
    else if (diesFaltants === 1) text = "Demà";
    else text = `D'aquí a ${diesFaltants} dies`;
    
    properes[nomsResidus[residu]] = text;
  }

  res.json({
    ok: true,
    data_servidor: ara,
    avui: queTocaAvui,
    passatHora: hora >= 8,
    properes_recollides: properes,
    missatge: hora >= 8 ? "La recollida ja s'ha fet (08:00h)" : "Encara ets a temps!"
  });
});

// 4. Qualsevol altra ruta serveix l'index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`PaP backend corrent al port ${port}`);
});