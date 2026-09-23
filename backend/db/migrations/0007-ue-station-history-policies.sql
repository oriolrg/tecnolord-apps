-- UE-T17: per-station history capture and retention policy.
CREATE TABLE meteo.station_history_policies (
  station_id INTEGER PRIMARY KEY REFERENCES meteo.estacions(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  capture_interval_minutes INTEGER NOT NULL
    CHECK (capture_interval_minutes BETWEEN 5 AND 1440),
  retention_days INTEGER NOT NULL CHECK (retention_days BETWEEN 1 AND 3650),
  revision BIGINT NOT NULL DEFAULT 0 CHECK (revision >= 0),
  last_capture_at TIMESTAMPTZ,
  previewed_retention_days INTEGER CHECK (previewed_retention_days BETWEEN 1 AND 3650),
  previewed_at TIMESTAMPTZ,
  previewed_delete_count BIGINT CHECK (previewed_delete_count IS NULL OR previewed_delete_count >= 0),
  updated_by BIGINT NOT NULL REFERENCES auth.usuaris(id) ON DELETE NO ACTION,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meteo.history_capture_runs (
  id BIGSERIAL PRIMARY KEY,
  station_id INTEGER NOT NULL REFERENCES meteo.estacions(id) ON DELETE CASCADE,
  source_binding_id BIGINT NOT NULL REFERENCES meteo.source_bindings(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  run_status TEXT NOT NULL CHECK (run_status IN ('CAPTURED','DUPLICATE','NO_RECENT_DATA','ERROR')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details)='object'),
  CONSTRAINT history_capture_runs_unique UNIQUE(station_id,source_binding_id,observed_at)
);
CREATE INDEX idx_history_capture_runs_station_created
  ON meteo.history_capture_runs(station_id,created_at DESC);

