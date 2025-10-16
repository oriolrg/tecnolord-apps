-- Esquemes
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS meteo;

-- =========================
-- AUTH
-- =========================
CREATE TABLE IF NOT EXISTS auth.usuaris (
  id              BIGSERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  nom             TEXT,
  passwd_hash     TEXT,
  actiu           BOOLEAN NOT NULL DEFAULT TRUE,
  creat_el        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth.aplicacions (
  id              SERIAL PRIMARY KEY,
  codi            TEXT NOT NULL UNIQUE,    -- ex: 'meteo'
  nom             TEXT NOT NULL,
  creat_el        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth.membres_app (
  usuari_id       BIGINT  NOT NULL REFERENCES auth.usuaris(id) ON DELETE CASCADE,
  app_id          INTEGER NOT NULL REFERENCES auth.aplicacions(id) ON DELETE CASCADE,
  rol             TEXT NOT NULL CHECK (rol IN ('admin','editor','lector')),
  creat_el        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuari_id, app_id)
);

INSERT INTO auth.aplicacions (codi, nom)
VALUES ('meteo','Aplicacio Meteo')
ON CONFLICT (codi) DO NOTHING;

-- =========================
-- METEO: estacions i mesures
-- =========================
CREATE TABLE IF NOT EXISTS meteo.estacions (
  id               SERIAL PRIMARY KEY,
  codi             TEXT NOT NULL UNIQUE,        -- slug: 'home', 'santpedor-1'
  nom              TEXT,
  proveidor        TEXT CHECK (proveidor IN ('ecowitt','manual','altre')) DEFAULT 'ecowitt',
  activa           BOOLEAN NOT NULL DEFAULT TRUE,
  latitud          REAL,
  longitud         REAL,
  altitud_m        REAL,
  creat_per_usuari BIGINT REFERENCES auth.usuaris(id),
  etiquetes        JSONB,
  creat_el         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meteo.membres_estacio (
  usuari_id   BIGINT  NOT NULL REFERENCES auth.usuaris(id) ON DELETE CASCADE,
  estacio_id  INTEGER NOT NULL REFERENCES meteo.estacions(id) ON DELETE CASCADE,
  rol         TEXT NOT NULL CHECK (rol IN ('propietari','editor','lector')),
  creat_el    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuari_id, estacio_id)
);

CREATE TABLE IF NOT EXISTS meteo.mesures (
  id                  BIGSERIAL PRIMARY KEY,
  estacio_id          INTEGER NOT NULL REFERENCES meteo.estacions(id) ON DELETE CASCADE,
  instant             TIMESTAMPTZ NOT NULL,

  temp_c              REAL,
  sensacio_c          REAL,
  punt_rosada_c       REAL,
  humitat_pct         SMALLINT,

  solar_wm2           REAL,
  uvi                 SMALLINT,

  taxa_pluja_mm_h     REAL,   -- rain_rate
  pluja_diaria_mm     REAL,
  pluja_event_mm      REAL,
  pluja_hora_mm       REAL,
  pluja_setmana_mm    REAL,
  pluja_mes_mm        REAL,
  pluja_any_mm        REAL,

  vent_ms             REAL,
  vent_rafega_ms      REAL,
  vent_direccio_graus SMALLINT,

  pressio_rel_hpa     REAL,
  pressio_abs_hpa     REAL,

  bateria_pct         SMALLINT,
  extres              JSONB,

  CONSTRAINT mesures_unic UNIQUE (estacio_id, instant)
);

CREATE INDEX IF NOT EXISTS idx_mesures_estacio_instant
  ON meteo.mesures (estacio_id, instant DESC);

CREATE INDEX IF NOT EXISTS idx_mesures_extres_gin
  ON meteo.mesures USING GIN (extres);

-- =========================
-- METEO: hidrologia (rius/pantans)
-- =========================
CREATE TABLE IF NOT EXISTS meteo.estacions_hidro (
  id          SERIAL PRIMARY KEY,
  codi        TEXT NOT NULL UNIQUE,     -- ex: '251116-005'
  nom         TEXT,
  tipus       TEXT NOT NULL CHECK (tipus IN ('riu','panta')),
  activa      BOOLEAN NOT NULL DEFAULT TRUE,
  latitud     REAL,
  longitud    REAL,
  id_extern   TEXT,
  creat_el    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meteo.lectures_hidro (
  id          BIGSERIAL PRIMARY KEY,
  estacio_id  INTEGER NOT NULL REFERENCES meteo.estacions_hidro(id) ON DELETE CASCADE,
  instant     TIMESTAMPTZ NOT NULL,
  cabal_m3s   REAL,     -- rius
  capacitat_pct REAL,   -- pantans
  nivell_m    REAL,
  extres      JSONB,
  CONSTRAINT lectures_hidro_unic UNIQUE (estacio_id, instant)
);

CREATE INDEX IF NOT EXISTS idx_hidro_estacio_instant
  ON meteo.lectures_hidro (estacio_id, instant DESC);
