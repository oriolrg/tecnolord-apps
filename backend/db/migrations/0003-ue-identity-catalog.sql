-- UE-T02: additive schema only. Existing users and stations receive no new authority.
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

ALTER TABLE auth.usuaris
  ADD COLUMN account_status TEXT NOT NULL DEFAULT 'PENDING_EMAIL'
    CONSTRAINT usuaris_account_status_check
      CHECK (account_status IN ('PENDING_EMAIL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  ADD COLUMN application_role TEXT NOT NULL DEFAULT 'USER'
    CONSTRAINT usuaris_application_role_check CHECK (application_role IN ('USER', 'SUPERADMIN')),
  ADD COLUMN email_verified_at TIMESTAMPTZ,
  ADD COLUMN approved_at TIMESTAMPTZ;

CREATE TABLE auth.credentials (
  user_id BIGINT PRIMARY KEY REFERENCES auth.usuaris(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES auth.usuaris(id) ON DELETE CASCADE,
  token_hash BYTEA NOT NULL UNIQUE,
  csrf_hash BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT sessions_expiry_check CHECK (expires_at > created_at)
);
CREATE INDEX idx_sessions_user_active ON auth.sessions(user_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE auth.account_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES auth.usuaris(id) ON DELETE CASCADE,
  token_hash BYTEA NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK (purpose IN ('VERIFY_EMAIL', 'RESET_PASSWORD')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  CONSTRAINT account_tokens_expiry_check CHECK (expires_at > created_at)
);
CREATE INDEX idx_account_tokens_user_purpose
  ON auth.account_tokens(user_id, purpose, expires_at)
  WHERE consumed_at IS NULL;

ALTER TABLE meteo.estacions
  ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN owner_id BIGINT REFERENCES auth.usuaris(id) ON DELETE NO ACTION,
  ADD COLUMN management_kind TEXT NOT NULL DEFAULT 'LEGACY'
    CONSTRAINT estacions_management_kind_check CHECK (management_kind IN ('LEGACY', 'USER', 'ADMIN')),
  ADD COLUMN lifecycle TEXT NOT NULL DEFAULT 'ACTIVE'
    CONSTRAINT estacions_lifecycle_check CHECK (lifecycle IN ('DRAFT', 'ACTIVE', 'RETIRED')),
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'PRIVATE'
    CONSTRAINT estacions_visibility_check CHECK (visibility IN ('PRIVATE', 'PUBLIC')),
  ADD COLUMN revision BIGINT NOT NULL DEFAULT 0
    CONSTRAINT estacions_revision_check CHECK (revision >= 0),
  ADD CONSTRAINT estacions_user_owner_check CHECK (management_kind <> 'USER' OR owner_id IS NOT NULL),
  ADD CONSTRAINT estacions_public_id_unique UNIQUE (public_id);
CREATE INDEX idx_estacions_owner ON meteo.estacions(owner_id, lifecycle);

CREATE TABLE meteo.station_locations (
  station_id INTEGER PRIMARY KEY REFERENCES meteo.estacions(id) ON DELETE CASCADE,
  private_geometry public.geometry(Point, 4326),
  public_geometry public.geometry(Point, 4326),
  publication_mode TEXT NOT NULL DEFAULT 'HIDDEN'
    CHECK (publication_mode IN ('HIDDEN', 'APPROX_100M', 'APPROX_1KM', 'APPROX_5KM', 'APPROX_10KM')),
  accuracy_m INTEGER CHECK (accuracy_m IS NULL OR accuracy_m >= 0),
  provenance TEXT,
  reference_label TEXT,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_station_locations_public_geom ON meteo.station_locations USING GIST(public_geometry);

CREATE TABLE meteo.station_connectors (
  station_id INTEGER PRIMARY KEY REFERENCES meteo.estacions(id) ON DELETE CASCADE,
  connector_type TEXT NOT NULL CHECK (connector_type IN ('ECOWITT', 'GRAFANA')),
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(configuration) = 'object'),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'UNCONFIGURED'
    CHECK (status IN ('UNCONFIGURED', 'READY', 'ERROR', 'DISABLED')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE meteo.connector_secrets (
  station_id INTEGER PRIMARY KEY REFERENCES meteo.station_connectors(station_id) ON DELETE CASCADE,
  ciphertext BYTEA NOT NULL,
  nonce BYTEA NOT NULL CHECK (octet_length(nonce) = 12),
  auth_tag BYTEA NOT NULL CHECK (octet_length(auth_tag) = 16),
  key_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meteo.source_bindings (
  id BIGSERIAL PRIMARY KEY,
  station_id INTEGER NOT NULL REFERENCES meteo.estacions(id) ON DELETE CASCADE,
  source_namespace TEXT NOT NULL,
  external_id TEXT,
  binding_status TEXT NOT NULL DEFAULT 'CANDIDATE'
    CHECK (binding_status IN ('CANDIDATE', 'VALIDATED', 'REJECTED')),
  evidence_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT source_bindings_validated_id_check
    CHECK (binding_status <> 'VALIDATED' OR external_id IS NOT NULL)
);
CREATE UNIQUE INDEX idx_source_bindings_verified_identity
  ON meteo.source_bindings(source_namespace, external_id)
  WHERE binding_status = 'VALIDATED' AND external_id IS NOT NULL;
CREATE INDEX idx_source_bindings_station ON meteo.source_bindings(station_id);
CREATE UNIQUE INDEX idx_source_bindings_station_namespace
  ON meteo.source_bindings(station_id, source_namespace);

CREATE TABLE meteo.current_snapshots (
  binding_id BIGINT PRIMARY KEY REFERENCES meteo.source_bindings(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  values_json JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(values_json) = 'object'),
  quality_json JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(quality_json) = 'object'),
  provider_error TEXT
);

CREATE TABLE meteo.estimation_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  reference_geometry public.geometry(Point, 4326) NOT NULL,
  reference_label TEXT NOT NULL,
  reference_provenance TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'OPEN_METEO' CHECK (provider = 'OPEN_METEO'),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth.user_preferences (
  user_id BIGINT PRIMARY KEY REFERENCES auth.usuaris(id) ON DELETE CASCADE,
  default_station_id INTEGER REFERENCES meteo.estacions(id) ON DELETE SET NULL,
  revision BIGINT NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meteo.public_view_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  public_station_id INTEGER REFERENCES meteo.estacions(id) ON DELETE SET NULL,
  card_ids JSONB NOT NULL DEFAULT '["wind","temperature","rain","pressure","humidity","uv"]'::jsonb
    CHECK (jsonb_typeof(card_ids) = 'array'),
  revision BIGINT NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO meteo.public_view_config(id) VALUES (1);

CREATE TABLE meteo.import_batches (
  id BIGSERIAL PRIMARY KEY,
  source_namespace TEXT NOT NULL,
  content_hash CHAR(64) NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  batch_status TEXT NOT NULL DEFAULT 'STAGED'
    CHECK (batch_status IN ('STAGED', 'APPLIED', 'REJECTED')),
  created_by BIGINT REFERENCES auth.usuaris(id) ON DELETE NO ACTION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_at TIMESTAMPTZ,
  CONSTRAINT import_batches_identity_unique UNIQUE (source_namespace, content_hash)
);
CREATE TABLE meteo.import_rows (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT NOT NULL REFERENCES meteo.import_batches(id) ON DELETE CASCADE,
  inventory_code TEXT NOT NULL,
  candidate JSONB NOT NULL CHECK (jsonb_typeof(candidate) = 'object'),
  row_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (row_status IN ('PENDING', 'VALIDATED', 'QUARANTINED', 'CONFLICT', 'APPLIED')),
  station_id INTEGER REFERENCES meteo.estacions(id) ON DELETE SET NULL,
  issue_code TEXT,
  CONSTRAINT import_rows_batch_code_unique UNIQUE (batch_id, inventory_code)
);
CREATE TABLE meteo.manual_overrides (
  station_id INTEGER NOT NULL REFERENCES meteo.estacions(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  value_json JSONB NOT NULL,
  changed_by BIGINT NOT NULL REFERENCES auth.usuaris(id) ON DELETE NO ACTION,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT manual_overrides_pkey PRIMARY KEY (station_id, field_key)
);
CREATE TABLE meteo.audit_events (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT REFERENCES auth.usuaris(id) ON DELETE NO ACTION,
  action TEXT NOT NULL,
  resource_kind TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_events_resource ON meteo.audit_events(resource_kind, resource_id, created_at DESC);
