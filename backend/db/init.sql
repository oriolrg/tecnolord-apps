CREATE TABLE IF NOT EXISTS measurement (
  id BIGSERIAL PRIMARY KEY,
  station_id TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temp_c NUMERIC,
  humidity NUMERIC,
  pressure_hpa NUMERIC,
  rain_mm NUMERIC,
  wind_speed_ms NUMERIC,
  wind_dir_deg SMALLINT
);

CREATE INDEX IF NOT EXISTS idx_measurement_station_time
  ON measurement (station_id, at DESC);
