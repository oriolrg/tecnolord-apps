// backend/services/previService.js
const { normalizeOpenMeteoModel } = require('../utils/previ');

function mustNumEnv(name) {
  const v = process.env[name];
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`missing/invalid env ${name}`);
  return n;
}

function previConfig() {
  const lat = mustNumEnv('PREVI_LAT');
  const lon = mustNumEnv('PREVI_LON');
  const hours = Math.min(Math.max(parseInt(process.env.PREVI_HOURS || '48', 10) || 48, 1), 48);

  return {
    source: (process.env.PREVI_SOURCE || 'open-meteo').trim(),
    model: (process.env.PREVI_MODEL || 'best_match').trim(),
    stationCode: (process.env.PREVI_STATION_CODE || process.env.ESTACIO_CODI || 'home').trim(),
    hours, lat, lon
  };
}

function openMeteoURL({ lat, lon, model, hours }) {
  const hourly = [
    'temperature_2m',
    'relative_humidity_2m',
    'precipitation',
    'wind_speed_10m',
    'wind_direction_10m'
  ].join(',');

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly,
    forecast_hours: String(hours),
    timezone: 'UTC',
    windspeed_unit: 'ms',
    precipitation_unit: 'mm',
    temperature_unit: 'celsius',
  });

  const m = normalizeOpenMeteoModel(model);
  if (m) params.set('models', m);

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function makePreviService({ pool }) {
  async function getLatestPrevi48h({ station, model, source } = {}) {
    const stationCode = String(
      station || process.env.PREVI_STATION_CODE || process.env.ESTACIO_CODI || 'home'
    );
    const modelCode = String(model || process.env.PREVI_MODEL || 'best_match');
    const sourceCode = String(source || process.env.PREVI_SOURCE || 'open-meteo');

    const runQ = await pool.query(
      `SELECT id, source, model, station_code, issued_at, hours
       FROM forecast_run
       WHERE station_code = $1 AND model = $2 AND source = $3
       ORDER BY issued_at DESC
       LIMIT 1`,
      [stationCode, normalizeOpenMeteoModel(modelCode) || 'best_match', sourceCode]
    );

    const run = runQ.rows[0];
    if (!run) return null;

    const rowsQ = await pool.query(
      `SELECT valid_time, temp_c, hum_pct, wind_ms, wind_dir, rain_mm
       FROM forecast_hourly
       WHERE run_id = $1
       ORDER BY valid_time ASC`,
      [run.id]
    );

    return {
      ok: true,
      run: {
        id: run.id,
        source: run.source,
        model: run.model,
        station: run.station_code,
        issued_at: run.issued_at,
        hours: run.hours
      },
      items: rowsQ.rows
    };
  }

  async function getPreviPast48AndNext48({ station, model, source } = {}) {
    const stationCode = String(
      station || process.env.PREVI_STATION_CODE || process.env.ESTACIO_CODI || 'home'
    );
    const modelCode = normalizeOpenMeteoModel(model || process.env.PREVI_MODEL || 'best_match') || 'best_match';
    const sourceCode = String(source || process.env.PREVI_SOURCE || 'open-meteo');

    const sql = `
      WITH picked AS (
        SELECT DISTINCT ON (fh.valid_time)
          fh.valid_time,
          fh.temp_c,
          fh.hum_pct,
          fh.wind_ms,
          fh.wind_dir,
          fh.rain_mm,
          fr.id AS run_id,
          fr.issued_at
        FROM forecast_run fr
        JOIN forecast_hourly fh ON fh.run_id = fr.id
        WHERE fr.station_code = $1
          AND fr.model = $2
          AND fr.source = $3
          AND fh.valid_time >= (now() - interval '48 hours')
          AND fh.valid_time <= (now() + interval '48 hours')
        ORDER BY fh.valid_time ASC, fr.issued_at DESC
      )
      SELECT valid_time, temp_c, hum_pct, wind_ms, wind_dir, rain_mm, run_id, issued_at
      FROM picked
      ORDER BY valid_time ASC
    `;

    const rowsQ = await pool.query(sql, [stationCode, modelCode, sourceCode]);

    if (!rowsQ.rows.length) return null;

    return {
      ok: true,
      window: {
        past_hours: 48,
        future_hours: 48
      },
      filter: {
        source: sourceCode,
        model: modelCode,
        station: stationCode
      },
      items: rowsQ.rows
    };
  }

  async function pullPreviAndSave() {
    const cfg = previConfig();
    const issuedAt = new Date().toISOString();

    if (cfg.source !== 'open-meteo') {
      throw new Error(`Unsupported PREVI_SOURCE=${cfg.source} (for now only 'open-meteo')`);
    }

    const url = openMeteoURL(cfg);
    const r = await fetch(url);

    if (!r.ok) {
      let body = '';
      try { body = await r.text(); } catch {}
      throw new Error(`previ status ${r.status} url=${url} body=${body || '(no body)'}`);
    }

    const data = await r.json();
    const h = data?.hourly;
    const times = Array.isArray(h?.time) ? h.time : [];

    const t2m = Array.isArray(h?.temperature_2m) ? h.temperature_2m : [];
    const rh2m = Array.isArray(h?.relative_humidity_2m) ? h.relative_humidity_2m : [];
    const prcp = Array.isArray(h?.precipitation) ? h.precipitation : [];
    const wspd = Array.isArray(h?.wind_speed_10m) ? h.wind_speed_10m : [];
    const wdir = Array.isArray(h?.wind_direction_10m) ? h.wind_direction_10m : [];

    if (!times.length) throw new Error('previ malformed: missing hourly.time');
    const validTimes = times.map((t) => new Date(t).toISOString());

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const runSql = `
        INSERT INTO forecast_run (source, model, station_code, issued_at, hours)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (source, model, station_code, issued_at)
        DO UPDATE SET hours = EXCLUDED.hours
        RETURNING id
      `;
      const runRes = await client.query(runSql, [
        cfg.source, normalizeOpenMeteoModel(cfg.model) || 'best_match', cfg.stationCode, issuedAt, cfg.hours
      ]);
      const runId = runRes.rows[0].id;

      const insSql = `
        INSERT INTO forecast_hourly
          (run_id, valid_time, temp_c, hum_pct, wind_ms, wind_dir, rain_mm)
        SELECT
          $1::bigint,
          x.valid_time::timestamptz,
          x.temp_c::real,
          x.hum_pct::real,
          x.wind_ms::real,
          x.wind_dir::real,
          x.rain_mm::real
        FROM UNNEST(
          $2::timestamptz[],
          $3::real[],
          $4::real[],
          $5::real[],
          $6::real[],
          $7::real[]
        ) AS x(valid_time, temp_c, hum_pct, wind_ms, wind_dir, rain_mm)
        ON CONFLICT (run_id, valid_time) DO UPDATE SET
          temp_c   = EXCLUDED.temp_c,
          hum_pct  = EXCLUDED.hum_pct,
          wind_ms  = EXCLUDED.wind_ms,
          wind_dir = EXCLUDED.wind_dir,
          rain_mm  = EXCLUDED.rain_mm
      `;

      const fill = (arr) => (arr.length === validTimes.length ? arr : new Array(validTimes.length).fill(null));
      const aTemp = fill(t2m).map(v => (v == null ? null : Number(v)));
      const aHum  = fill(rh2m).map(v => (v == null ? null : Number(v)));
      const aRain = fill(prcp).map(v => (v == null ? null : Number(v)));
      const aWind = fill(wspd).map(v => (v == null ? null : Number(v)));
      const aDir  = fill(wdir).map(v => (v == null ? null : Number(v)));

      await client.query(insSql, [runId, validTimes, aTemp, aHum, aWind, aDir, aRain]);

      await client.query('COMMIT');

      return {
        ok: true,
        source: cfg.source,
        model: normalizeOpenMeteoModel(cfg.model) || 'best_match',
        station: cfg.stationCode,
        issued_at: issuedAt,
        hours: cfg.hours,
        points: validTimes.length
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  return { getLatestPrevi48h, getPreviPast48AndNext48, pullPreviAndSave };
}

module.exports = { makePreviService };
