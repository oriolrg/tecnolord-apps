#!/usr/bin/env bash
set -euo pipefail

# Llegeix variables de la DB des del contenidor (amb fallback a .env si cal)
DB_USER="$(docker compose exec -T db printenv POSTGRES_USER 2>/dev/null | tr -d '\r' || true)"
DB_NAME="$(docker compose exec -T db printenv POSTGRES_DB   2>/dev/null | tr -d '\r' || true)"

if [[ -z "$DB_USER" || -z "$DB_NAME" ]]; then
  # intenta llegir-les de .env del repo
  if [[ -f .env ]]; then
    # shellcheck disable=SC2046
    export $(grep -E '^(POSTGRES_USER|POSTGRES_DB)=' .env | xargs)
    DB_USER="${POSTGRES_USER:-postgres}"
    DB_NAME="${POSTGRES_DB:-postgres}"
  else
    echo "ERROR: no puc obtenir POSTGRES_USER/POSTGRES_DB ni del contenidor ni de .env" >&2
    exit 1
  fi
fi


# ---------------------------------------------
# Migració de dades legacy.meteo (MySQL dump) a Postgres (meteo.*)
# Ús: scripts/migrate_legacy.sh meteo.sql
# Requisits:
#   - docker compose amb servei "db" (Postgres)
#   - variables POSTGRES_USER/POSTGRES_DB (ja presents al contenidor "db")
#   - el dump MySQL només conté la taula/insert de "meteo"
# ---------------------------------------------

DUMP_FILE="${1:-}"
TZ_LOCAL="${TZ_LOCAL:-Europe/Madrid}"   # pots canviar via export TZ_LOCAL=...

if [[ -z "$DUMP_FILE" || ! -f "$DUMP_FILE" ]]; then
  echo "ERROR: cal passar el camí al dump MySQL (p.ex.: meteo.sql)" >&2
  exit 1
fi

echo ">> Verificant contenidor de DB..."
DB_CID="$(docker compose ps -q db || true)"
if [[ -z "$DB_CID" ]]; then
  echo "ERROR: no s'ha trobat el servei 'db'. Està en marxa 'docker compose up -d db'?" >&2
  exit 1
fi

WORKDIR="$(pwd)"
OUT_PG="meteo.sql"
mkdir -p "$(dirname "$OUT_PG")"

echo ">> Creant esquema 'legacy' a Postgres (si no existeix)..."
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" \
  -c "CREATE SCHEMA IF NOT EXISTS legacy;"

echo ">> Convertint dump MySQL -> Postgres-friendly: $OUT_PG"
# - Canvia backticks per dobles cometes
# - Elimina UNSIGNED, ENGINE/CHARSET/COLLATE
# - Converteix bigint(20) -> bigint
# - Converteix timestamp -> timestamp without time zone
# - Reescriu CREATE/INSERT/DROP per usar legacy.meteo
sed -E \
  -e 's/`/"/g' \
  -e 's/[[:space:]]+UNSIGNED//Ig' \
  -e 's/ENGINE=[^;]*//Ig' \
  -e 's/DEFAULT[[:space:]]+CHARSET=[^;]*//Ig' \
  -e 's/COLLATE=[^;]*//Ig' \
  -e 's/\bbigint\([0-9]+\)/bigint/Ig' \
  -e 's/\btimestamp\b/timestamp without time zone/Ig' \
  -e 's/\bCREATE[[:space:]]+TABLE[[:space:]]+"?meteo"?/CREATE TABLE legacy.meteo/Ig' \
  -e 's/\bDROP[[:space:]]+TABLE[[:space:]]+IF[[:space:]]+EXISTS[[:space:]]+"?meteo"?/DROP TABLE IF EXISTS legacy.meteo/Ig' \
  -e 's/\bINSERT[[:space:]]+INTO[[:space:]]+"?meteo"?/INSERT INTO legacy.meteo/Ig' \
  "$DUMP_FILE" > "$OUT_PG"

echo ">> Copiant i important legacy_meteo_pg.sql al Postgres..."
docker cp "$OUT_PG" "$DB_CID":/tmp/legacy_meteo_pg.sql
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/legacy_meteo_pg.sql

echo ">> Garantint claus i columnes a l’esquema nou (idempotent)..."
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" <<SQL
-- Estació meteo 'home'
INSERT INTO meteo.estacions_meteo (codi, nom)
VALUES ('home','Estació principal')
ON CONFLICT (codi) DO NOTHING;

-- Estacions hidro
INSERT INTO meteo.estacions_hidro (codi, nom, tipus) VALUES
('251116-005','Cardener','riu'),
('251116-004','Valls','riu'),
('081419-003','La Llosa del Cavall','panta')
ON CONFLICT (codi) DO NOTHING;

-- Columnes i uniques
ALTER TABLE meteo.lectures_meteo
  ADD COLUMN IF NOT EXISTS extres jsonb,
  ADD COLUMN IF NOT EXISTS pluja_diaria_mm numeric;

DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='uq_lectures_meteo_estacio_instant'
  ) THEN
    ALTER TABLE meteo.lectures_meteo
      ADD CONSTRAINT uq_lectures_meteo_estacio_instant UNIQUE (estacio_id, instant);
  END IF;
END\$\$;

DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='lectures_hidro_estacio_instant_key'
  ) THEN
    ALTER TABLE meteo.lectures_hidro
      ADD CONSTRAINT lectures_hidro_estacio_instant_key UNIQUE (estacio_id, instant);
  END IF;
END\$\$;

-- Taula d'agregat de pluja diària
CREATE TABLE IF NOT EXISTS meteo.pluja_diaria (
  estacio_id  integer NOT NULL REFERENCES meteo.estacions_meteo(id) ON DELETE CASCADE,
  data        date    NOT NULL,
  total_mm    numeric NOT NULL CHECK (total_mm >= 0),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pluja_diaria_pk PRIMARY KEY (estacio_id, data)
);
SQL

echo ">> Carregant METEO (legacy.meteo -> meteo.lectures_meteo) ..."
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" <<SQL
WITH src AS (
  SELECT
    -- interpreta created_at com a hora local $TZ_LOCAL
    (created_at AT TIME ZONE '$TZ_LOCAL')::timestamptz AS instant,
    NULLIF(regexp_replace(temperature,    ',', '.', 'g'),'')::numeric AS temp_c,
    NULLIF(regexp_replace(humidity,       ',', '.', 'g'),'')::numeric AS humidity,
    NULLIF(regexp_replace(relative,       ',', '.', 'g'),'')::numeric AS pressure_hpa,
    NULLIF(regexp_replace(daily,          ',', '.', 'g'),'')::numeric AS pluja_diaria_mm,
    (NULLIF(regexp_replace(wind_speed,    ',', '.', 'g'),'')::numeric) * (1000.0/3600.0) AS vent_ms,
    NULLIF(regexp_replace(wind_direction, ',', '.', 'g'),'')::numeric AS direccio_graus,
    jsonb_build_object(
      'dew_point',     NULLIF(regexp_replace(dew_point,  ',', '.', 'g'),'')::numeric,
      'feels_like',    NULLIF(regexp_replace(feels_like, ',', '.', 'g'),'')::numeric,
      'uvi',           NULLIF(regexp_replace(uvi,        ',', '.', 'g'),'')::numeric,
      'solar',         NULLIF(regexp_replace(solar,      ',', '.', 'g'),'')::numeric,
      'wind_gust_kmh', NULLIF(regexp_replace(wind_gust,  ',', '.', 'g'),'')::numeric,
      'rain_rate',     NULLIF(regexp_replace(rain_rate,  ',', '.', 'g'),'')::numeric,
      'hourly',        NULLIF(regexp_replace(hourly,     ',', '.', 'g'),'')::numeric,
      'weekly',        NULLIF(regexp_replace(weekly,     ',', '.', 'g'),'')::numeric,
      'monthly',       NULLIF(regexp_replace(monthly,    ',', '.', 'g'),'')::numeric,
      'absolute_hpa',  NULLIF(regexp_replace(absolute,   ',', '.', 'g'),'')::numeric,
      'event_mm',      NULLIF(regexp_replace(event,      ',', '.', 'g'),'')::numeric
    ) AS extres
  FROM legacy.meteo
  WHERE created_at IS NOT NULL
)
INSERT INTO meteo.lectures_meteo
  (estacio_id, instant, temp_c, humidity, pressure_hpa, pluja_diaria_mm, vent_ms, direccio_graus, extres)
SELECT e.id, s.instant, s.temp_c, s.humidity, s.pressure_hpa, s.pluja_diaria_mm, s.vent_ms, s.direccio_graus, s.extres
FROM src s
JOIN meteo.estacions_meteo e ON e.codi = 'home'
ON CONFLICT (estacio_id, instant) DO UPDATE
SET temp_c          = COALESCE(meteo.lectures_meteo.temp_c,          EXCLUDED.temp_c),
    humidity        = COALESCE(meteo.lectures_meteo.humidity,        EXCLUDED.humidity),
    pressure_hpa    = COALESCE(meteo.lectures_meteo.pressure_hpa,    EXCLUDED.pressure_hpa),
    pluja_diaria_mm = COALESCE(meteo.lectures_meteo.pluja_diaria_mm, EXCLUDED.pluja_diaria_mm),
    vent_ms         = COALESCE(meteo.lectures_meteo.vent_ms,         EXCLUDED.vent_ms),
    direccio_graus  = COALESCE(meteo.lectures_meteo.direccio_graus,  EXCLUDED.direccio_graus),
    extres          = COALESCE(meteo.lectures_meteo.extres,          EXCLUDED.extres);
SQL

echo ">> Carregant HIDRO (Cardener, Valls, Llosa) ..."
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" <<SQL
-- Cardener (cabal)
INSERT INTO meteo.lectures_hidro (estacio_id, instant, cabal_m3s)
SELECT e.id, (m.created_at AT TIME ZONE '$TZ_LOCAL')::timestamptz,
       NULLIF(regexp_replace(m.cardener, ',', '.', 'g'),'')::numeric
FROM legacy.meteo m
JOIN meteo.estacions_hidro e ON e.codi = '251116-005'
WHERE NULLIF(m.cardener,'') IS NOT NULL
ON CONFLICT (estacio_id, instant) DO UPDATE
SET cabal_m3s = COALESCE(meteo.lectures_hidro.cabal_m3s, EXCLUDED.cabal_m3s);

-- Valls (cabal)
INSERT INTO meteo.lectures_hidro (estacio_id, instant, cabal_m3s)
SELECT e.id, (m.created_at AT TIME ZONE '$TZ_LOCAL')::timestamptz,
       NULLIF(regexp_replace(m.valls, ',', '.', 'g'),'')::numeric
FROM legacy.meteo m
JOIN meteo.estacions_hidro e ON e.codi = '251116-004'
WHERE NULLIF(m.valls,'') IS NOT NULL
ON CONFLICT (estacio_id, instant) DO UPDATE
SET cabal_m3s = COALESCE(meteo.lectures_hidro.cabal_m3s, EXCLUDED.cabal_m3s);

-- Llosa (cabal)
INSERT INTO meteo.lectures_hidro (estacio_id, instant, cabal_m3s)
SELECT e.id, (m.created_at AT TIME ZONE '$TZ_LOCAL')::timestamptz,
       NULLIF(regexp_replace(m.llosa, ',', '.', 'g'),'')::numeric
FROM legacy.meteo m
JOIN meteo.estacions_hidro e ON e.codi = '081419-003'
WHERE NULLIF(m.llosa,'') IS NOT NULL
ON CONFLICT (estacio_id, instant) DO UPDATE
SET cabal_m3s = COALESCE(meteo.lectures_hidro.cabal_m3s, EXCLUDED.cabal_m3s);

-- Llosa (capacitat %)
INSERT INTO meteo.lectures_hidro (estacio_id, instant, capacitat_pct)
SELECT e.id, (m.created_at AT TIME ZONE '$TZ_LOCAL')::timestamptz,
       NULLIF(regexp_replace(m.capacitatllosa, ',', '.', 'g'),'')::numeric
FROM legacy.meteo m
JOIN meteo.estacions_hidro e ON e.codi = '081419-003'
WHERE NULLIF(m.capacitatllosa,'') IS NOT NULL
ON CONFLICT (estacio_id, instant) DO UPDATE
SET capacitat_pct = COALESCE(meteo.lectures_hidro.capacitat_pct, EXCLUDED.capacitat_pct);
SQL

echo ">> Recalculant agregat de pluja diària ..."
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" <<SQL
INSERT INTO meteo.pluja_diaria (estacio_id, data, total_mm)
SELECT
  lm.estacio_id,
  (lm.instant AT TIME ZONE '$TZ_LOCAL')::date AS data,
  MAX(lm.pluja_diaria_mm) AS total_mm
FROM meteo.lectures_meteo lm
WHERE lm.pluja_diaria_mm IS NOT NULL
GROUP BY lm.estacio_id, (lm.instant AT TIME ZONE '$TZ_LOCAL')::date
ON CONFLICT (estacio_id, data) DO UPDATE
SET total_mm  = GREATEST(EXCLUDED.total_mm, meteo.pluja_diaria.total_mm),
    updated_at = now();
SQL

echo ">> Validació ràpida:"
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c \
"SELECT instant,temp_c,humidity,pressure_hpa FROM meteo.lectures_meteo ORDER BY instant DESC LIMIT 3;"

docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c \
"SELECT * FROM meteo.lectures_hidro ORDER BY instant DESC LIMIT 3;"

docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c \
"SELECT * FROM meteo.pluja_diaria ORDER BY data DESC LIMIT 5;"

echo "✅ Migració completada."
