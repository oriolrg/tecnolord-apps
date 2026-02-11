// ──────────────────────────────────────────────────────────
// server.js — tecnolord backend
// - Express + routers
// - Serveis: previService, acaService, ecowittService
// - Auth: checkApiKey via middleware/authApiKey.js (INGEST_API_KEY)
// ──────────────────────────────────────────────────────────

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { createPool } = require('./db/pool');

require('dotenv').config();

const { checkApiKey } = require('./middleware/authApiKey.js');

const { router: pingRouter } = require('./routes/ping');
const { makeHealthRouter } = require('./routes/health');
const { makeMesuresRouter } = require('./routes/mesures');
const { makeHidroRouter } = require('./routes/hidro');
const { makePreviRouter } = require('./routes/previ');
const { makeTasksRouter } = require('./routes/tasks');

const { makePreviService } = require('./services/previService');
const { makeAcaService } = require('./services/acaService');
const { makeEcowittService } = require('./services/ecowittService');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = createPool();

// ──────────────────────────────────────────────────────────
// Middlewares
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '256kb', type: ['application/json', 'application/*+json'] }));

// Estàtics (robust: no depèn de __dirname)
const FRONTEND_DIR = path.resolve(process.cwd(), 'frontend');
app.use(express.static(FRONTEND_DIR));
app.get('/', (_req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

// ──────────────────────────────────────────────────────────
// Helpers DB (usuaris/estacions/hidro)
async function assegurarUsuariAdmin(email) {
  const { rows } = await pool.query(
    `INSERT INTO auth.usuaris (email, nom, actiu)
     VALUES ($1, $2, true)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id`,
    [email, email]
  );
  return rows[0].id;
}

async function assegurarEstacio(codi, nom, creatPerUserId) {
  const { rows } = await pool.query(
    `INSERT INTO estacions (codi, nom, creat_per_usuari)
     VALUES ($1, $2, $3)
     ON CONFLICT (codi) DO UPDATE SET nom = COALESCE(EXCLUDED.nom, estacions.nom)
     RETURNING id`,
    [codi, nom || null, creatPerUserId || null]
  );
  return rows[0].id;
}

async function assegurarMembreEstacio(usuariId, estacioId, rol = 'propietari') {
  await pool.query(
    `INSERT INTO membres_estacio (usuari_id, estacio_id, rol)
     VALUES ($1,$2,$3)
     ON CONFLICT (usuari_id, estacio_id) DO NOTHING`,
    [usuariId, estacioId, rol]
  );
}

async function assegurarHidro(codi, tipus, nom) {
  const { rows } = await pool.query(
    `INSERT INTO estacions_hidro (codi, tipus, nom, activa)
     VALUES ($1,$2,$3,true)
     ON CONFLICT (codi) DO UPDATE SET nom = COALESCE(EXCLUDED.nom, estacions_hidro.nom)
     RETURNING id`,
    [codi, tipus, nom || null]
  );
  return rows[0].id;
}

// ──────────────────────────────────────────────────────────
// Serveis
const previService = makePreviService({ pool });
const acaService = makeAcaService({ pool, assegurarHidro });
const ecowittService = makeEcowittService({
  pool,
  assegurarUsuariAdmin,
  assegurarEstacio,
  assegurarMembreEstacio
});

// ──────────────────────────────────────────────────────────
// Routers
app.use(pingRouter);
app.use(makeHealthRouter({ pool }));
app.use(makeMesuresRouter({ pool }));
app.use(makeHidroRouter({ pool }));
app.use(makePreviRouter({ pool }));

app.use(makeTasksRouter({
  checkApiKey,
  pullEcowittAndSave: ecowittService.pullEcowittAndSave,
  pullACAAndSave: acaService.pullACAAndSave,
  pullPreviAndSave: previService.pullPreviAndSave
}));

// ──────────────────────────────────────────────────────────
// Arrencada
app.listen(PORT, () => console.log(`Backend escoltant a :${PORT}`));
