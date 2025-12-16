-- 0) Índexos per a ON CONFLICT (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS uq_lectures_meteo_estacio_instant
  ON meteo.lectures_meteo (estacio_id, instant);
CREATE UNIQUE INDEX IF NOT EXISTS uq_lectures_hidro_punt_instant
  ON hidro.lectures_hidro (punt_id, instant);

-- 1) Estació
INSERT INTO meteo.estacions_meteo(codi, nom)
VALUES ('home','Estació Home') ON CONFLICT (codi) DO NOTHING;

-- 2) Meteo: legacy -> meteo.lectures_meteo
WITH s AS (SELECT id FROM meteo.estacions_meteo WHERE codi='home')
INSERT INTO meteo.lectures_meteo(
  estacio_id, instant,
  temp_c, humitat, punt_rosada_c, sensacio_termica_c,
  pressio_rel_hpa, pressio_abs_hpa,
  uvi, radiacio_solar,
  vent_vel_ms, vent_raf_ms, vent_dir_graus
)
SELECT
  s.id,
  COALESCE(l.created_at, l.updated_at)::timestamptz,
  NULLIF(l."temperature",'')::double precision,
  NULLIF(l."humidity",'')::double precision,
  NULLIF(l."dew_point",'')::double precision,
  NULLIF(l."feels_like",'')::double precision,
  NULLIF(l."relative",'')::double precision,
  NULLIF(l."absolute",'')::double precision,
  NULLIF(l."uvi",'')::double precision,
  NULLIF(l."solar",'')::double precision,
  NULLIF(l."wind_speed",'')::double precision / 3.6,
  NULLIF(l."wind_gust",'')::double precision / 3.6,
  NULLIF(l."wind_direction",'')::double precision
FROM legacy.meteo_raw l
CROSS JOIN s
WHERE COALESCE(l.created_at, l.updated_at) IS NOT NULL
ON CONFLICT (estacio_id, instant) DO NOTHING;

-- 3) Hidro: crea punts si cal
INSERT INTO hidro.punts_hidrologics (codi, nom, tipus) VALUES
  ('251116-005','Cardener','riu'),
  ('251116-004','Valls','riu'),
  ('081419-003','La Llosa del Cavall','panta')
ON CONFLICT (codi) DO NOTHING;

-- Cardener
INSERT INTO hidro.lectures_hidro (punt_id, instant, cabal_m3s, capacitat_pct)
SELECT p.id, l.created_at::timestamptz, NULLIF(l."cardener",'')::double precision, NULL
FROM legacy.meteo_raw l
JOIN hidro.punts_hidrologics p ON p.codi='251116-005'
WHERE l.created_at IS NOT NULL AND l."cardener" IS NOT NULL AND l."cardener"<>''
ON CONFLICT (punt_id, instant) DO NOTHING;

-- Valls
INSERT INTO hidro.lectures_hidro (punt_id, instant, cabal_m3s, capacitat_pct)
SELECT p.id, l.created_at::timestamptz, NULLIF(l."valls",'')::double precision, NULL
FROM legacy.meteo_raw l
JOIN hidro.punts_hidrologics p ON p.codi='251116-004'
WHERE l.created_at IS NOT NULL AND l."valls" IS NOT NULL AND l."valls"<>''
ON CONFLICT (punt_id, instant) DO NOTHING;

-- Llosa (cabal + capacitat)
INSERT INTO hidro.lectures_hidro (punt_id, instant, cabal_m3s, capacitat_pct)
SELECT p.id, l.created_at::timestamptz,
       NULLIF(l."llosa",'')::double precision,
       NULLIF(l."capacitatllosa",'')::double precision
FROM legacy.meteo_raw l
JOIN hidro.punts_hidrologics p ON p.codi='081419-003'
WHERE l.created_at IS NOT NULL
  AND ( (l."llosa" IS NOT NULL AND l."llosa"<>'')
     OR (l."capacitatllosa" IS NOT NULL AND l."capacitatllosa"<>'') )
ON CONFLICT (punt_id, instant) DO NOTHING;
