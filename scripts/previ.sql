-- meteo.forecast_run: un “run” de forecast guardat
CREATE TABLE IF NOT EXISTS forecast_run (
  id           BIGSERIAL PRIMARY KEY,
  source       TEXT NOT NULL,                -- ex: 'open-meteo'
  model        TEXT NOT NULL,                -- ex: 'icon', 'ifs', etc.
  station_code TEXT NOT NULL,                -- ex: 'TL01' o el codi que facis servir
  issued_at    TIMESTAMPTZ NOT NULL,         -- quan ho has capturat/servit
  hours        INT NOT NULL DEFAULT 48,
  UNIQUE (source, model, station_code, issued_at)
);

-- meteo.forecast_hourly: valors horaris per cada valid_time
CREATE TABLE IF NOT EXISTS forecast_hourly (
  run_id     BIGINT NOT NULL REFERENCES forecast_run(id) ON DELETE CASCADE,
  valid_time TIMESTAMPTZ NOT NULL,           -- per quan prediu
  temp_c     REAL,
  hum_pct    REAL,
  wind_ms    REAL,
  wind_dir   REAL,
  rain_mm    REAL,
  PRIMARY KEY (run_id, valid_time)
);

-- feedback anònim (NO usuari persistent)
CREATE TABLE IF NOT EXISTS forecast_feedback (
  id         BIGSERIAL PRIMARY KEY,
  run_id     BIGINT REFERENCES forecast_run(id) ON DELETE SET NULL,
  valid_time TIMESTAMPTZ,                    -- sobre quina hora opinava
  variable   TEXT NOT NULL,                  -- 'temp','wind','rain'
  horizon_h  INT,                            -- +6,+12,+24...
  vote       TEXT NOT NULL,                  -- 'low'|'ok'|'high' o 'yes'|'no'
  comment    TEXT,                           -- curt (limita a backend)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forecast_hourly_valid ON forecast_hourly(valid_time);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON forecast_feedback(created_at);
