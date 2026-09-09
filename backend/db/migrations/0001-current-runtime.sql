CREATE SCHEMA auth;
CREATE SCHEMA meteo;

CREATE TABLE auth.usuaris (
  id BIGSERIAL,
  email TEXT NOT NULL,
  nom TEXT,
  actiu BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT usuaris_pkey PRIMARY KEY (id),
  CONSTRAINT usuaris_email_key UNIQUE (email)
);

CREATE TABLE meteo.estacions (
  id SERIAL,
  codi TEXT NOT NULL,
  nom TEXT,
  creat_per_usuari BIGINT,
  CONSTRAINT estacions_pkey PRIMARY KEY (id),
  CONSTRAINT estacions_codi_key UNIQUE (codi),
  CONSTRAINT estacions_creador_fk
    FOREIGN KEY (creat_per_usuari)
    REFERENCES auth.usuaris (id)
    ON DELETE NO ACTION
);

CREATE TABLE meteo.membres_estacio (
  usuari_id BIGINT NOT NULL,
  estacio_id INTEGER NOT NULL,
  rol TEXT NOT NULL,
  creat_el TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT membres_estacio_pkey PRIMARY KEY (usuari_id, estacio_id),
  CONSTRAINT membres_estacio_usuari_fk
    FOREIGN KEY (usuari_id)
    REFERENCES auth.usuaris (id)
    ON DELETE CASCADE,
  CONSTRAINT membres_estacio_estacio_fk
    FOREIGN KEY (estacio_id)
    REFERENCES meteo.estacions (id)
    ON DELETE CASCADE,
  CONSTRAINT membres_estacio_rol_check
    CHECK (rol IN ('propietari', 'editor', 'lector'))
);

CREATE TABLE meteo.mesures (
  id BIGSERIAL,
  estacio_id INTEGER NOT NULL,
  instant TIMESTAMPTZ NOT NULL,
  temp_c REAL,
  sensacio_c REAL,
  punt_rosada_c REAL,
  humitat_pct SMALLINT,
  solar_wm2 REAL,
  uvi SMALLINT,
  taxa_pluja_mm_h REAL,
  pluja_diaria_mm REAL,
  pluja_event_mm REAL,
  pluja_hora_mm REAL,
  pluja_setmana_mm REAL,
  pluja_mes_mm REAL,
  pluja_any_mm REAL,
  vent_ms REAL,
  vent_rafega_ms REAL,
  vent_direccio_graus SMALLINT,
  pressio_rel_hpa REAL,
  pressio_abs_hpa REAL,
  bateria_pct SMALLINT,
  extres JSONB,
  CONSTRAINT mesures_pkey PRIMARY KEY (id),
  CONSTRAINT mesures_estacio_fk
    FOREIGN KEY (estacio_id)
    REFERENCES meteo.estacions (id)
    ON DELETE CASCADE,
  CONSTRAINT mesures_unic UNIQUE (estacio_id, instant)
);

CREATE INDEX idx_mesures_estacio_instant
  ON meteo.mesures (estacio_id, instant DESC);

CREATE TABLE meteo.estacions_hidro (
  id SERIAL,
  codi TEXT NOT NULL,
  nom TEXT,
  tipus TEXT NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT estacions_hidro_pkey PRIMARY KEY (id),
  CONSTRAINT estacions_hidro_codi_key UNIQUE (codi),
  CONSTRAINT estacions_hidro_tipus_check CHECK (tipus IN ('riu', 'panta'))
);

CREATE TABLE meteo.lectures_hidro (
  id BIGSERIAL,
  estacio_id INTEGER NOT NULL,
  instant TIMESTAMPTZ NOT NULL,
  cabal_m3s REAL,
  capacitat_pct REAL,
  nivell_m REAL,
  extres JSONB,
  CONSTRAINT lectures_hidro_pkey PRIMARY KEY (id),
  CONSTRAINT lectures_hidro_estacio_fk
    FOREIGN KEY (estacio_id)
    REFERENCES meteo.estacions_hidro (id)
    ON DELETE CASCADE,
  CONSTRAINT lectures_hidro_unic UNIQUE (estacio_id, instant)
);

CREATE INDEX idx_hidro_estacio_instant
  ON meteo.lectures_hidro (estacio_id, instant DESC);
