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

// --- MODIFICACIÓ 1: CONTROL DE SUBRUTES ---
// Si l'usuari entra a /pap (sense barra), el redirigim a /pap/ 
// Això és vital perquè el navegador resolgui correctament els fitxers ./sw.js i estat
app.use((req, res, next) => {
    const url = req.originalUrl || req.url;
    if (url === '/pap' || url === '/api/pap') {
        return res.redirect(301, url + '/');
    }
    next();
});

// --- MODIFICACIÓ 2: SERVIR ESTÀTICS AMB PREFIX ---
// Servim la carpeta public tant a l'arrel com al subcamí /pap
app.use('/pap', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// 2. Rutes de diagnòstic
app.get(['/ping', '/pap/ping'], (req, res) => {
    res.json({ ok: true, msg: "Backend de PaP operatiu" });
});

// 3. Lògica de l'estat (AMB RUTES AMPLIADES)
// Ara respon a /estat i també a /pap/estat per seguretat
app.get(['/estat', '/estat/', '/pap/estat', '/pap/estat/', '/api/pap/estat'], (req, res) => {
  
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

// --- MODIFICACIÓ 3: GESTIÓ DE RUTES NO TROBADES (WILDCARD) ---
// Evitem retornar index.html si el que es demana és un fitxer real (.js, .css, etc.)
app.get(['/pap/*', '*'], (req, res) => {
    // Si la ruta té un punt (és un fitxer) i ha arribat aquí, és que no existeix
    if (req.path.includes('.')) {
        return res.status(404).send('Fitxer no trobat');
    }
    // Per a qualsevol altra ruta de navegació, servim l'index.html
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`PaP backend corrent al port ${port}`);
});