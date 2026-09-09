CREATE TABLE meteo.forecast_run (
  id BIGSERIAL,
  source TEXT NOT NULL,
  model TEXT NOT NULL,
  station_code TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  hours INTEGER NOT NULL DEFAULT 48,
  CONSTRAINT forecast_run_pkey PRIMARY KEY (id),
  CONSTRAINT forecast_run_unic UNIQUE (source, model, station_code, issued_at),
  CONSTRAINT forecast_run_station_fk
    FOREIGN KEY (station_code)
    REFERENCES meteo.estacions (codi)
    ON DELETE NO ACTION,
  CONSTRAINT forecast_run_hours_check CHECK (hours BETWEEN 1 AND 48)
);

CREATE INDEX idx_forecast_run_lookup
  ON meteo.forecast_run (station_code, source, model, issued_at DESC);

CREATE TABLE meteo.forecast_hourly (
  run_id BIGINT NOT NULL,
  valid_time TIMESTAMPTZ NOT NULL,
  temp_c REAL,
  hum_pct REAL,
  wind_ms REAL,
  wind_dir REAL,
  rain_mm REAL,
  CONSTRAINT forecast_hourly_pkey PRIMARY KEY (run_id, valid_time),
  CONSTRAINT forecast_hourly_run_fk
    FOREIGN KEY (run_id)
    REFERENCES meteo.forecast_run (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_forecast_hourly_valid
  ON meteo.forecast_hourly (valid_time);
