// ──────────────────────────────────────────────────────────
// Imports i Pool
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

// Estàtics
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
// Helpers de períodes (meteo/hidro)
function parsePeriodWindow(period) {
  const now = new Date();
  const end = now;
  let start = null;

  const startOfTodayUTC = () => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const startOfTomorrowUTC = () => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));

  switch ((period || '').toLowerCase()) {
    case 'last24h':
      start = new Date(now.getTime() - 24 * 3600 * 1000);
      return { start, end };

    case 'today': {
      start = startOfTodayUTC();
      return { start, end };
    }

    case 'yesterday': {
      const s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0));
      const e = startOfTodayUTC();
      return { start: s, end: e };
    }

    case 'last7d':
      start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return { start, end };

    case 'last30d':
      start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      return { start, end };

    default:
      return { start: null, end: null };
  }
}

function parseFromTo(from, to) {
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;
  if (start && Number.isNaN(start.getTime())) return { start: null, end: null };
  if (end && Number.isNaN(end.getTime())) return { start: null, end: null };
  return { start, end };
}

function getWindowFromQuery(req) {
  const period = req.query.period || null;
  const from = req.query.from || null;
  const to = req.query.to || null;

  if (from || to) {
    const w = parseFromTo(from, to);
    return { ...w, source: 'fromto' };
  }
  if (period) {
    const w = parsePeriodWindow(period);
    return { ...w, source: 'period' };
  }
  return { start: null, end: null, source: 'none' };
}

// ──────────────────────────────────────────────────────────
// Rutes d’API — METEO darreres mesures + períodes
app.get('/api/v1/mesures/darreres', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 5000);
  const estacioCodi = req.query.estacio || null;

  const { start, end } = getWindowFromQuery(req);

  try {
    const params = [];
    const wheres = [];

    if (estacioCodi) {
      params.push(estacioCodi);
      wheres.push(`m.estacio_id = (SELECT id FROM estacions WHERE codi = $${params.length})`);
    }

    if (start) {
      params.push(start.toISOString());
      wheres.push(`m.instant >= $${params.length}`);
    }
    if (end) {
      params.push(end.toISOString());
      wheres.push(`m.instant < $${params.length}`);
    }

    const whereSql = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
    const sql = `SELECT m.* FROM mesures m ${whereSql} ORDER BY instant DESC LIMIT ${limit}`;
    const { rows } = await pool.query(sql, params);

    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'db query error' });
  }
});

// ──────────────────────────────────────────────────────────
// HIDRO: mode=latest (default quan hi ha rang) o mode=range (històric del rang)
// - mode=latest: 1 registre per estació (amb fallback si no hi ha dades al rang)
// - mode=range: registres del rang (i opcionalment ensure=1 per garantir 1 valor antic si falta)
app.get('/api/v1/hidro/darreres', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '200', 10) || 200, 5000);
  const codi = req.query.codi || null;

  const mode = (req.query.mode || '').toLowerCase(); // "latest" | "range" | ""
  const ensure = String(req.query.ensure || '0') === '1';

  const { start, end, source } = getWindowFromQuery(req);
  const hasWindow = !!(start || end || (source !== 'none'));

  // Per defecte: si hi ha rang → latest (resum). Si no hi ha rang → comportament antic (llista desc limit)
  const effectiveMode = mode || (hasWindow ? 'latest' : 'raw');

  try {
    // ── Cas 1: raw (comportament antic)
    if (effectiveMode === 'raw') {
      const params = [];
      let where = '';
      if (codi) { where = 'WHERE e.codi = $1'; params.push(codi); }

      const sql = `
        SELECT
          h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
          e.codi, e.nom, e.tipus, e.id AS estacio_id,
          EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
          (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
          false AS is_fallback,
          false AS is_outside_range
        FROM lectures_hidro h
        JOIN estacions_hidro e ON e.id = h.estacio_id
        ${where}
        ORDER BY h.instant DESC
        LIMIT ${limit}
      `;
      const { rows } = await pool.query(sql, params);
      return res.json({ ok: true, items: rows });
    }

    // Preparem filtre de rang
    const wParams = [];
    const wConds = [];
    if (codi) {
      wParams.push(codi);
      wConds.push(`e.codi = $${wParams.length}`);
    }
    if (start) {
      wParams.push(start.toISOString());
      wConds.push(`h.instant >= $${wParams.length}`);
    }
    if (end) {
      wParams.push(end.toISOString());
      wConds.push(`h.instant < $${wParams.length}`);
    }
    const wWhere = wConds.length ? `WHERE ${wConds.join(' AND ')}` : '';

    // ── Cas 2: mode=range (històric dins del rang)
    if (effectiveMode === 'range') {
      // Si hi ha codi → simple (i opcional fallback si no hi ha res al rang)
      if (codi) {
        const sqlRange = `
          SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            false AS is_fallback,
            false AS is_outside_range
          FROM lectures_hidro h
          JOIN estacions_hidro e ON e.id = h.estacio_id
          ${wWhere}
          ORDER BY h.instant DESC
          LIMIT ${limit}
        `;
        const { rows } = await pool.query(sqlRange, wParams);

        if (rows.length || !ensure) {
          return res.json({ ok: true, items: rows, fallback: false });
        }

        // ensure=1 i no hi ha res al rang → torna l’últim registre existent
        const sqlFallback = `
          SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            true AS is_fallback,
            true AS is_outside_range
          FROM lectures_hidro h
          JOIN estacions_hidro e ON e.id = h.estacio_id
          WHERE e.codi = $1
          ORDER BY h.instant DESC
          LIMIT 1
        `;
        const fb = await pool.query(sqlFallback, [codi]);
        return res.json({ ok: true, items: fb.rows, fallback: true });
      }

      // Sense codi:
      //  - retornen tots els registres dins del rang (limit)
      //  - si ensure=1: per cada estació “important” que no tingui dades al rang, afegim l’últim registre existent
      const sqlAllRange = `
        SELECT
          h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
          e.codi, e.nom, e.tipus, e.id AS estacio_id,
          EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
          (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
          false AS is_fallback,
          false AS is_outside_range
        FROM lectures_hidro h
        JOIN estacions_hidro e ON e.id = h.estacio_id
        ${wWhere}
        ORDER BY h.instant DESC
        LIMIT ${limit}
      `;
      const rangeRes = await pool.query(sqlAllRange, wParams);
      let items = rangeRes.rows;

      if (!ensure) {
        return res.json({ ok: true, items });
      }

      // Estacions “objectiu”: millor limitar a les que uses a la UI (env), per no inflar.
      const targets = [
        process.env.ACA_CODI_CARDENER,
        process.env.ACA_CODI_VALLS,
        process.env.ACA_CODI_LLOSA,
      ].filter(Boolean);

      // si no hi ha env, fallback: totes les estacions
      let targetCodis = targets;
      if (!targetCodis.length) {
        const allStations = await pool.query(`SELECT codi FROM estacions_hidro WHERE activa = true`);
        targetCodis = allStations.rows.map(r => r.codi);
      }

      const present = new Set(items.map(r => r.codi));

      const missing = targetCodis.filter(c => !present.has(c));
      if (!missing.length) {
        return res.json({ ok: true, items });
      }

      // Agafem l’últim registre per cada codi absent
      const sqlLatestMissing = `
        WITH wanted AS (
          SELECT unnest($1::text[]) AS codi
        ),
        latest AS (
          SELECT DISTINCT ON (e.codi)
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id
          FROM wanted w
          JOIN estacions_hidro e ON e.codi = w.codi
          JOIN lectures_hidro h ON h.estacio_id = e.id
          ORDER BY e.codi, h.instant DESC
        )
        SELECT
          l.*,
          EXTRACT(EPOCH FROM (NOW() - l.instant)) / 3600 AS age_hours,
          (NOW() - l.instant) > INTERVAL '24 hours' AS is_stale,
          true AS is_fallback,
          true AS is_outside_range
        FROM latest l
      `;
      const missRes = await pool.query(sqlLatestMissing, [missing]);

      items = items.concat(missRes.rows);

      // Ordenem: primer els del rang (ja ho estan), després els fallback (i tots junts desc per instant)
      items.sort((a, b) => new Date(b.instant).getTime() - new Date(a.instant).getTime());

      return res.json({ ok: true, items });
    }

    // ── Cas 3: mode=latest (resum per estació amb fallback)
    // Retorna 1 registre per estació (en rang si n’hi ha; sinó el global com fallback)
    {
      // Target codis (igual que abans): els 3 que uses a la UI
      const targets = [
        process.env.ACA_CODI_CARDENER,
        process.env.ACA_CODI_VALLS,
        process.env.ACA_CODI_LLOSA,
      ].filter(Boolean);

      // Si passes codi -> fem latest dins rang i fallback global
      if (codi) {
        const sqlLatestInRange = `
          SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            false AS is_fallback,
            false AS is_outside_range
          FROM lectures_hidro h
          JOIN estacions_hidro e ON e.id = h.estacio_id
          ${wWhere}
          ORDER BY h.instant DESC
          LIMIT 1
        `;
        const inRange = await pool.query(sqlLatestInRange, wParams);
        if (inRange.rows.length) {
          return res.json({ ok: true, items: inRange.rows, fallback: false });
        }

        const sqlFallback = `
          SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            true AS is_fallback,
            true AS is_outside_range
          FROM lectures_hidro h
          JOIN estacions_hidro e ON e.id = h.estacio_id
          WHERE e.codi = $1
          ORDER BY h.instant DESC
          LIMIT 1
        `;
        const fb = await pool.query(sqlFallback, [codi]);
        return res.json({ ok: true, items: fb.rows, fallback: true });
      }

      // Sense codi: 1 per estació (targets). Si no hi ha targets → totes.
      let targetCodis = targets;
      if (!targetCodis.length) {
        const allStations = await pool.query(`SELECT codi FROM estacions_hidro WHERE activa = true`);
        targetCodis = allStations.rows.map(r => r.codi);
      }

      const sql = `
        WITH wanted AS (
          SELECT unnest($1::text[]) AS codi
        ),
        in_range AS (
          SELECT DISTINCT ON (e.codi)
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            false AS is_fallback,
            false AS is_outside_range
          FROM wanted w
          JOIN estacions_hidro e ON e.codi = w.codi
          JOIN lectures_hidro h ON h.estacio_id = e.id
          ${start ? `WHERE h.instant >= $2` : ''} ${start && end ? 'AND' : ''} ${end ? `h.instant < $3` : ''}
          ORDER BY e.codi, h.instant DESC
        ),
        missing AS (
          SELECT w.codi
          FROM wanted w
          LEFT JOIN in_range r ON r.codi = w.codi
          WHERE r.codi IS NULL
        ),
        fallback AS (
          SELECT DISTINCT ON (e.codi)
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            true AS is_fallback,
            true AS is_outside_range
          FROM missing m
          JOIN estacions_hidro e ON e.codi = m.codi
          JOIN lectures_hidro h ON h.estacio_id = e.id
          ORDER BY e.codi, h.instant DESC
        )
        SELECT
          x.*,
          EXTRACT(EPOCH FROM (NOW() - x.instant)) / 3600 AS age_hours,
          (NOW() - x.instant) > INTERVAL '24 hours' AS is_stale
        FROM (
          SELECT * FROM in_range
          UNION ALL
          SELECT * FROM fallback
        ) x
        ORDER BY x.codi;
      `;

      const params = [targetCodis];
      if (start) params.push(start.toISOString());
      if (end) params.push(end.toISOString());

      const { rows } = await pool.query(sql, params);
      return res.json({ ok: true, items: rows });
    }

  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'db query error' });
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
// Pull d’Ecowitt → meteo.mesures
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

    +d?.outdoor?.temperature?.value || null,
    +d?.outdoor?.feels_like?.value || null,
    +d?.outdoor?.dew_point?.value || null,
    d?.outdoor?.humidity?.value != null ? parseInt(d.outdoor.humidity.value, 10) : null,

    +d?.solar_and_uvi?.solar?.value || null,
    d?.solar_and_uvi?.uvi?.value != null ? parseInt(d.solar_and_uvi.uvi.value, 10) : null,

    +d?.rainfall?.['rain_rate']?.value || null,
    +d?.rainfall?.daily?.value || null,
    +d?.rainfall?.event?.value || null,
    +d?.rainfall?.['1_hour']?.value || null,
    +d?.rainfall?.weekly?.value || null,
    +d?.rainfall?.monthly?.value || null,
    null,

    kmhToMs(+d?.wind?.wind_speed?.value || null),
    kmhToMs(+d?.wind?.wind_gust?.value || null),
    d?.wind?.wind_direction?.value != null ? parseInt(d.wind.wind_direction.value,10) : null,

    +d?.pressure?.relative?.value || null,
    +d?.pressure?.absolute?.value || null,

    d?.battery?.sensor_array?.value != null
      ? (parseInt(d.battery.sensor_array.value,10) ? 100 : 0)
      : null,

    JSON.stringify({ indoor: d?.indoor ?? null })
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

// Pull ACA → meteo.lectures_hidro
async function pullACAAndSave() {
  const [riversRes, reservoirsRes] = await Promise.all([
    fetch(ACA_RIVER_URL),
    fetch(ACA_RESERVOIR_URL),
  ]);
  if (!riversRes.ok) throw new Error('aca rivers status ' + riversRes.status);
  if (!reservoirsRes.ok) throw new Error('aca reservoirs status ' + reservoirsRes.status);

  const rivers = await riversRes.json();
  const reservoirs = await reservoirsRes.json();

  function indexBySiteCode(data) {
    const m = new Map();
    if (!data) return m;

    if (Array.isArray(data)) {
      for (const it of data) {
        const code = it?.siteCode ?? it?.codi ?? it?.code;
        if (code) m.set(String(code).trim(), it);
      }
      return m;
    }

    if (typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (!v) continue;
        if (typeof v === 'object') {
          const code = v.siteCode ?? v.codi ?? v.code ?? k;
          m.set(String(code).trim(), v);
        }
      }
    }
    return m;
  }

  const riversByCode = indexBySiteCode(rivers);
  const reservoirsByCode = indexBySiteCode(reservoirs);

  const getPath = (obj, tokens) => {
    try {
      return tokens.reduce((a, k) => (a && a[k] !== undefined && a[k] !== null) ? a[k] : undefined, obj);
    } catch { return undefined; }
  };
  const firstOf = (obj, listOfPaths) => {
    for (const p of listOfPaths) {
      const v = getPath(obj, p);
      if (v !== undefined && v !== null) return v;
    }
    return null;
  };
  const toNum = v => (v === null || v === '' || v === undefined ? null : Number(v));

  const CODE_CARD   = process.env.ACA_CODI_CARDENER;
  const CODE_VALLS  = process.env.ACA_CODI_VALLS;
  const CODE_LLOSA  = process.env.ACA_CODI_LLOSA;

  const CODE_LLOSA_FLOW = process.env.ACA_CODI_LLOSA_CABAL      || CODE_LLOSA;
  const CODE_LLOSA_CAP  = process.env.ACA_CODI_LLOSA_CAPACITAT  || CODE_LLOSA;

  const SITES = [
    { siteCode: CODE_CARD,  name: process.env.ACA_NOM_CARDENER || 'Cardener', tipusPreferit: 'riu',   flowKey: CODE_CARD,       capKey: null },
    { siteCode: CODE_VALLS, name: process.env.ACA_NOM_VALLS    || 'Valls',    tipusPreferit: 'riu',   flowKey: CODE_VALLS,      capKey: null },
    { siteCode: CODE_LLOSA, name: process.env.ACA_NOM_LLOSA    || 'La Llosa del Cavall', tipusPreferit: 'panta',
      flowKey: CODE_LLOSA_FLOW, capKey: CODE_LLOSA_CAP },
  ].filter(s => s.siteCode);

  const nowIso = new Date().toISOString();
  const results = [];

  for (const s of SITES) {
    const rObj = s.flowKey
      ? (riversByCode.get(String(s.flowKey).trim()) ?? rivers?.[s.flowKey] ?? null)
      : null;
    const zObj = s.capKey
      ? (reservoirsByCode.get(String(s.capKey).trim()) ?? reservoirs?.[s.capKey] ?? null)
      : null;

    const flowVal = toNum(firstOf(rObj, [
      ['popup','river_flow','value'],
      ['popup','flux_riu','value'],
      ['popup','cabal_riu','value'],
      ['finestra emergent','river_flow','valor'],
      ['finestra emergent','flux_riu','valor'],
      ['finestra emergent','cabal_riu','valor'],
      ['emergent','river_flow','valor'],
      ['emergent','flux_riu','valor'],
      ['emergent','cabal_riu','valor'],
      ['finestra','flux_riu','valor'],
      ['finestra','cabal_riu','valor'],
    ]));

    const capVal = toNum(firstOf(zObj, [
      ['popup','capacity','value'],
      ['popup','capacitat','valor'],
      ['finestra emergent','capacitat','valor'],
      ['emergent','capacitat','valor'],
      ['element emergent','capacitat','valor'],
    ]));

    const levelVal = toNum(firstOf(zObj, [
      ['popup','level','value'],
      ['finestra emergent','nivell','valor'],
      ['emergent','nivell','valor'],
    ]));

    const flowTs = firstOf(rObj, [
      ['popup','river_flow','time'], ['popup','flux_riu','time'], ['popup','cabal_riu','time'],
      ['finestra emergent','river_flow','hora'], ['finestra emergent','flux_riu','hora'], ['finestra emergent','cabal_riu','hora'],
      ['emergent','river_flow','hora'], ['emergent','flux_riu','hora'], ['emergent','cabal_riu','hora'],
    ]);
    const capTs = firstOf(zObj, [
      ['popup','capacity','time'], ['popup','capacitat','hora'],
      ['finestra emergent','capacitat','hora'],
      ['emergent','capacitat','hora'],
      ['element emergent','capacitat','hora'],
    ]);
    const instant = (flowTs || capTs || nowIso);

    if (flowVal === null && capVal === null && levelVal === null) {
      console.warn('[ACA] sense valors per', s.siteCode, { flowKey: s.flowKey, capKey: s.capKey });
      continue;
    }

    const tipusCalc =
      (flowVal !== null && capVal === null) ? 'riu' :
      (capVal  !== null && flowVal === null) ? 'panta' : (s.tipusPreferit || 'panta');

    const estacioId = await assegurarHidro(s.siteCode, tipusCalc, s.name);

    const sql = `
      INSERT INTO lectures_hidro (estacio_id, instant, cabal_m3s, capacitat_pct, nivell_m, extres)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (estacio_id, instant) DO UPDATE
      SET cabal_m3s     = COALESCE(lectures_hidro.cabal_m3s, EXCLUDED.cabal_m3s),
          capacitat_pct = COALESCE(lectures_hidro.capacitat_pct, EXCLUDED.capacitat_pct),
          nivell_m      = COALESCE(lectures_hidro.nivell_m, EXCLUDED.nivell_m),
          extres        = COALESCE(lectures_hidro.extres, EXCLUDED.extres)
      RETURNING id
    `;
    const extres = { river_raw: rObj ?? null, reservoir_raw: zObj ?? null };
    const { rows } = await pool.query(sql, [
      estacioId, new Date(instant).toISOString(),
      flowVal, capVal, levelVal,
      JSON.stringify(extres),
    ]);

    results.push({ codi: s.siteCode, id: rows[0]?.id || null, cabal_m3s: flowVal, capacitat_pct: capVal, nivell_m: levelVal, ts: instant });
  }

  return { ok: true, inserts: results };
}

// ──────────────────────────────────────────────────────────
// Rutes de tasca
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
