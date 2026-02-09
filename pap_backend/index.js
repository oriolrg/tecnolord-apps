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

// 1. PRIORITAT MÀXIMA: Servir fitxers reals de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 2. Rutes de diagnòstic
app.get('/ping', (req, res) => {
    res.json({ ok: true, msg: "Backend de PaP operatiu" });
});

// 3. Lògica de l'estat (AMB CONTROL DE CACHE)
app.get(['/estat', '/estat/', '/api/pap/estat', '/api/pap/estat/'], (req, res) => {
  
  // --- MILLORA CLAU: Evitar que les dades es guardin a la memòria cau ---
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  const ara = new Date();
  const diaSetmana = ara.getDay(); // 0 (dg) a 6 (ds)
  const hora = ara.getHours();
  
  const passatHora = hora >= 8;
  
  // Ajust: Dilluns=1, Diumenge=7
  const diaAvuiReal = (diaSetmana === 0 ? 7 : diaSetmana);

  // LÒGICA: Si ja ha passat la recollida d'avui (08:00h), mirem què toca per DEMÀ
  let diaObjectiu = diaAvuiReal;
  if (passatHora) {
    diaObjectiu = (diaAvuiReal === 7 ? 1 : diaAvuiReal + 1);
  }

  // Què toca treure ARA o AQUESTA NIT?
  let queTocaTreure = [];
  for (const [residu, dies] of Object.entries(calendariPaP)) {
    if (dies.includes(diaObjectiu)) {
      queTocaTreure.push({ id: residu, nom: nomsResidus[residu] });
    }
  }

  // Càlcul de la llista de properes recollides
  let properes = {};
  for (const [residu, dies] of Object.entries(calendariPaP)) {
    let diesFaltants = Infinity;
    dies.forEach(diaRecollida => {
      let diff = diaRecollida - diaAvuiReal;
      if (diff < 0 || (diff === 0 && passatHora)) diff += 7;
      if (diff < diesFaltants) diesFaltants = diff;
    });
    
    let text = "";
    if (diesFaltants === 0) text = "Avui (abans 08h)";
    else if (diesFaltants === 1) text = "Demà matí";
    else text = `D'aquí a ${diesFaltants} dies`;
    
    properes[nomsResidus[residu]] = text;
  }

  res.json({
    ok: true,
    data_servidor: ara,
    treure: queTocaTreure, 
    passatHora: passatHora,
    dia_objectiu: diaObjectiu,
    properes_recollides: properes,
    missatge: passatHora ? "Prepara el que toca per demà al matí" : "Encara ets a temps!"
  });
});

// 4. L'ÚLTIM RECURS: Qualsevol altra ruta serveix l'index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`PaP backend corrent al port ${port}`);
});