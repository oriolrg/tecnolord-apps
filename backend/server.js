// ──────────────────────────────────────────────────────────
// Imports i Pool (ja els tens)
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST || 'db',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
});

// IMPORTANT: usem esquemes en català
pool.on('connect', (client) => {
  client.query("SET search_path TO meteo,auth,public").catch(console.error);
});

// ──────────────────────────────────────────────────────────
// Middlewares
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '256kb', type: ['application/json', 'application/*+json'] }));

// Estàtics (Caddy ja serveix /frontend; això és innocu)
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
app.get('/', (_req, res) => res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html')));

// Salut
app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: 'ok', time: new Date().toISOString() }); }
  catch { res.json({ ok: true, db: 'down', time: new Date().toISOString() }); }
});

// Ping
app.get('/api/ping', (_req, res) => res.json({ ok: true, msg: 'pong' }));

// ──────────────────────────────────────────────────────────
// Helpers de permisos/entitats
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
// Helpers de mapping i URLs

const kmhToMs = v => (v == null || v === '' ? null : Number(v) / 3.6);

function ecowittURL() {
  const params = new URLSearchParams({
    application_key: process.env.ECW_APPLICATION_KEY,
    api_key: process.env.ECW_API_KEY,
    mac: process.env.ECW_MAC,
    call_back: 'all',
    temp_unitid: process.env.ECW_TEMP_UNITID || '1',
    wind_speed_unitid: process.env.ECW_WIND_SPEED_UNITID || '8',
    rainfall_unitid: process.env.ECW_RAINFALL_UNITID || '12',
    pressure_unitid: process.env.ECW_PRESSURE_UNITID || '3',
  });
  return `https://api.ecowitt.net/api/v3/device/real_time?${params.toString()}`;
}

const ACA_RIVER_URL = 'http://aplicacions.aca.gencat.cat/aetr/vishid/v2/data/public/rivergauges/river_flow_6min';
const ACA_RESERVOIR_URL = 'http://aplicacions.aca.gencat.cat/aetr/vishid/v2/data/public/reservoir/capacity_6min';

// ──────────────────────────────────────────────────────────
// Rutes d’API (consulta) — darreres mesures
app.get('/api/v1/mesures/darreres', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 1000);
  const estacioCodi = req.query.estacio || null;
  try {
    const params = [];
    let where = '';
    if (estacioCodi) {
      where = 'WHERE m.estacio_id = (SELECT id FROM estacions WHERE codi = $1)';
      params.push(estacioCodi);
    }
    const sql = `SELECT m.* FROM mesures m ${where} ORDER BY instant DESC LIMIT ${limit}`;
    const { rows } = await pool.query(sql, params);
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error(e); res.status(500).json({ ok:false, error:'db query error' });
  }
});

// (opcional) hidrologia
app.get('/api/v1/hidro/darreres', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 1000);
  const codi = req.query.codi || null;
  try {
    const params = [];
    let where = '';
    if (codi) { where = 'WHERE h.estacio_id = (SELECT id FROM estacions_hidro WHERE codi = $1)'; params.push(codi); }
    const sql = `SELECT h.* FROM lectures_hidro h ${where} ORDER BY instant DESC LIMIT ${limit}`;
    const { rows } = await pool.query(sql, params);
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error(e); res.status(500).json({ ok:false, error:'db query error' });
  }
});

// ──────────────────────────────────────────────────────────
// Auth simple per tasques internes
function checkApiKey(req, res, next) {
  const key = req.get('x-api-key') || req.query.key;
  const serverKey = process.env.INGEST_API_KEY || '';
  if (!serverKey) return res.status(500).json({ ok: false, error: 'server missing INGEST_API_KEY' });
  if (key !== serverKey) return res.status(401).json({ ok: false, error: 'invalid api key' });
  next();
}

// ──────────────────────────────────────────────────────────
// Pull d’Ecowitt → meteo.mesures (TOTES les dades rellevants)
async function pullEcowittAndSave() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const codi = process.env.ESTACIO_CODI || process.env.STATION_ID || process.env.STATION_CODE || 'home';
  const nom  = process.env.ESTACIO_NOM || null;

  const adminId = await assegurarUsuariAdmin(adminEmail);
  const estacioId = await assegurarEstacio(codi, nom, adminId);
  await assegurarMembreEstacio(adminId, estacioId, 'propietari');

  const r = await fetch(ecowittURL());
  if (!r.ok) throw new Error('ecowitt status ' + r.status);
  const p = await r.json();
  const d = p?.data;
  const epochSec = Number(p?.time);
  const instant = !Number.isNaN(epochSec) ? new Date(epochSec * 1000).toISOString() : new Date().toISOString();

  const params = [
    estacioId, instant,

    +d?.outdoor?.temperature?.value || null,          // temp_c
    +d?.outdoor?.feels_like?.value || null,           // sensacio_c
    +d?.outdoor?.dew_point?.value || null,            // punt_rosada_c
    d?.outdoor?.humidity?.value != null ? parseInt(d.outdoor.humidity.value, 10) : null, // humitat_pct

    +d?.solar_and_uvi?.solar?.value || null,          // solar_wm2
    d?.solar_and_uvi?.uvi?.value != null ? parseInt(d.solar_and_uvi.uvi.value, 10) : null, // uvi

    +d?.rainfall?.['rain_rate']?.value || null,       // taxa_pluja_mm_h
    +d?.rainfall?.daily?.value || null,               // pluja_diaria_mm
    +d?.rainfall?.event?.value || null,               // pluja_event_mm
    +d?.rainfall?.['1_hour']?.value || null,          // pluja_hora_mm
    +d?.rainfall?.weekly?.value || null,              // pluja_setmana_mm
    +d?.rainfall?.monthly?.value || null,             // pluja_mes_mm
    +d?.rainfall?.yearly?.value || null,              // pluja_any_mm

    kmhToMs(+d?.wind?.wind_speed?.value || null),     // vent_ms
    kmhToMs(+d?.wind?.wind_gust?.value || null),      // vent_rafega_ms
    d?.wind?.wind_direction?.value != null ? parseInt(d.wind.wind_direction.value,10) : null, // vent_direccio_graus

    +d?.pressure?.relative?.value || null,            // pressio_rel_hpa
    +d?.pressure?.absolute?.value || null,            // pressio_abs_hpa

    d?.battery?.sensor_array?.value != null
      ? (parseInt(d.battery.sensor_array.value,10) ? 100 : 0)
      : null,                                         // bateria_pct

    JSON.stringify({ indoor: d?.indoor ?? null })     // extres
  ];

  const sql = `
    INSERT INTO mesures (
      estacio_id, instant,
      temp_c, sensacio_c, punt_rosada_c, humitat_pct,
      solar_wm2, uvi,
      taxa_pluja_mm_h, pluja_diaria_mm, pluja_event_mm, pluja_hora_mm, pluja_setmana_mm, pluja_mes_mm, pluja_any_mm,
      vent_ms, vent_rafega_ms, vent_direccio_graus,
      pressio_rel_hpa, pressio_abs_hpa,
      bateria_pct,
      extres
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
    )
    ON CONFLICT (estacio_id, instant) DO NOTHING
    RETURNING id;
  `;

  const { rows } = await pool.query(sql, params);
  return { id: rows[0]?.id || null, estacio: codi, instant };
}

// Pull ACA → meteo.lectures_hidro (Cardener, Valls, Llosa)
async function pullACAAndSave() {
  const nowIso = new Date().toISOString();

  // Llegeix dades
  const [riversRes, reservoirsRes] = await Promise.all([ fetch(ACA_RIVER_URL), fetch(ACA_RESERVOIR_URL) ]);
  if (!riversRes.ok) throw new Error('aca rivers status ' + riversRes.status);
  if (!reservoirsRes.ok) throw new Error('aca reservoirs status ' + reservoirsRes.status);
  const rivers = await riversRes.json();
  const reservoirs = await reservoirsRes.json();

  // Map codis → { tipus, nom, camins... }
  const cfg = [
    { envCode: 'ACA_CODI_CARDENER', envName: 'ACA_NOM_CARDENER', tipus: 'riu',   path: ['popup','river_flow','value'] },
    { envCode: 'ACA_CODI_VALLS',    envName: 'ACA_NOM_VALLS',    tipus: 'riu',   path: ['popup','river_flow','value'] },
    { envCode: 'ACA_CODI_LLOSA',    envName: 'ACA_NOM_LLOSA',    tipus: 'panta', path: ['popup','capacity','value']  },
  ];

  const inserts = [];
  for (const c of cfg) {
    const codi = process.env[c.envCode];
    if (!codi) continue;
    const nom = process.env[c.envName] || null;
    const tipus = c.tipus;

    // extreu valor amb guarda
    const src = tipus === 'panta' ? reservoirs : rivers;
    const obj = src?.[codi];
    let valor = null;
    try {
      valor = c.path.reduce((acc, k) => acc && acc[k] != null ? acc[k] : null, obj);
    } catch { valor = null; }

    const estacioId = await assegurarHidro(codi, tipus, nom);

    // decideix camps segons tipus
    const cabal_m3s     = (tipus === 'riu'   ? (valor != null ? Number(valor) : null) : null);
    const capacitat_pct = (tipus === 'panta' ? (valor != null ? Number(valor) : null) : null);

    // inserta (usa nowIso; si un dia trobem timestamp a la resposta, el mapejem)
    const sql = `
      INSERT INTO lectures_hidro (estacio_id, instant, cabal_m3s, capacitat_pct, nivell_m, extres)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (estacio_id, instant) DO NOTHING
      RETURNING id
    `;
    const { rows } = await pool.query(sql, [
      estacioId, nowIso, cabal_m3s, capacitat_pct, null,
      JSON.stringify({ raw: obj ?? null })
    ]);
    inserts.push({ codi, id: rows[0]?.id || null, tipus });
  }

  return { ok: true, inserts };
}

// ──────────────────────────────────────────────────────────
// Rutes de “tasca”: ara el pull d’Ecowitt TAMBÉ fa ACA
app.post(['/tasks/pull-ecowitt','/api/tasks/pull-ecowitt'], checkApiKey, async (_req, res) => {
  try {
    const meteo = await pullEcowittAndSave();
    const hidro = await pullACAAndSave();
    return res.status(meteo.id ? 201 : 200).json({ ok: true, meteo, hidro });
  } catch (e) {
    console.error('pull-ecowitt error:', e);
    return res.status(500).json({ ok:false, error:'pull failed' });
  }
});

// (també exposem una ruta separada només ACA, si et cal)
app.post(['/tasks/pull-aca','/api/tasks/pull-aca'], checkApiKey, async (_req, res) => {
  try {
    const hidro = await pullACAAndSave();
    return res.status(201).json({ ok: true, hidro });
  } catch (e) {
    console.error('pull-aca error:', e);
    return res.status(500).json({ ok:false, error:'pull aca failed' });
  }
});

// ──────────────────────────────────────────────────────────
// Arrencada
app.listen(PORT, () => console.log(`Backend escoltant a :${PORT}`));
