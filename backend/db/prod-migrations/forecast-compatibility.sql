-- PROD-01: adopt semantically equivalent legacy objects; add only missing 0002 objects.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint co
    WHERE co.conrelid='meteo.forecast_run'::regclass
      AND co.confrelid='meteo.estacions'::regclass
      AND co.contype='f' AND co.confdeltype='a'
      AND co.conkey=ARRAY[(SELECT attnum FROM pg_attribute
        WHERE attrelid=co.conrelid AND attname='station_code')]::smallint[]
      AND co.confkey=ARRAY[(SELECT attnum FROM pg_attribute
        WHERE attrelid=co.confrelid AND attname='codi')]::smallint[]
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_constraint
      WHERE conrelid='meteo.forecast_run'::regclass AND conname='forecast_run_station_fk') THEN
      RAISE EXCEPTION 'forecast_run_station_fk exists with different semantics';
    END IF;
    ALTER TABLE meteo.forecast_run ADD CONSTRAINT forecast_run_station_fk
      FOREIGN KEY (station_code) REFERENCES meteo.estacions(codi) ON DELETE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint co
    WHERE co.conrelid='meteo.forecast_run'::regclass AND co.contype='c'
      AND pg_get_expr(co.conbin,co.conrelid) ~ 'hours[[:space:]]*>=[[:space:]]*1'
      AND pg_get_expr(co.conbin,co.conrelid) ~ 'hours[[:space:]]*<=[[:space:]]*48'
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_constraint
      WHERE conrelid='meteo.forecast_run'::regclass AND conname='forecast_run_hours_check') THEN
      RAISE EXCEPTION 'forecast_run_hours_check exists with different semantics';
    END IF;
    ALTER TABLE meteo.forecast_run ADD CONSTRAINT forecast_run_hours_check
      CHECK (hours BETWEEN 1 AND 48);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_index ix
    WHERE ix.indrelid='meteo.forecast_run'::regclass
      AND pg_get_indexdef(ix.indexrelid) LIKE '%(station_code, source, model, issued_at DESC)%'
  ) THEN
    IF to_regclass('meteo.idx_forecast_run_lookup') IS NOT NULL THEN
      RAISE EXCEPTION 'idx_forecast_run_lookup exists with different semantics';
    END IF;
    CREATE INDEX idx_forecast_run_lookup
      ON meteo.forecast_run (station_code, source, model, issued_at DESC);
  END IF;
END
$$;
