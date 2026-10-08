\set QUIET 1
\pset pager off
\pset format unaligned
\pset tuples_only on

BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '120s';
SET LOCAL lock_timeout = '3s';

SELECT current_database() = :'expected_target' AS target_ok \gset
\if :target_ok
\else
  \echo '{"section":"fatal","reason":"unexpected_database"}'
  \quit 70
\endif

SELECT current_setting('transaction_read_only') = 'on' AS read_only_ok \gset
\if :read_only_ok
\else
  \echo '{"section":"fatal","reason":"transaction_is_not_read_only"}'
  \quit 71
\endif

SELECT EXISTS (
  SELECT 1
  FROM pg_extension AS e
  JOIN pg_namespace AS n ON n.oid = e.extnamespace
  WHERE e.extname = 'postgis'
    AND n.nspname = 'public'
) AS postgis_ok \gset
\if :postgis_ok
\else
  \echo '{"section":"fatal","reason":"postgis_missing_or_wrong_schema"}'
  \quit 72
\endif

WITH required(name) AS (
  VALUES
    ('auth.credentials'), ('auth.sessions'), ('auth.account_tokens'),
    ('auth.user_preferences'), ('meteo.station_locations'),
    ('meteo.station_connectors'), ('meteo.connector_secrets'),
    ('meteo.source_bindings'), ('meteo.current_snapshots'),
    ('meteo.estimation_points'), ('meteo.public_view_config'),
    ('meteo.import_batches'), ('meteo.import_rows'),
    ('meteo.manual_overrides'), ('meteo.audit_events'),
    ('meteo.map_catalog_state'), ('meteo.station_history_policies'),
    ('meteo.history_capture_runs')
)
SELECT count(*) = 18 AND count(*) FILTER (WHERE to_regclass(name) IS NOT NULL) = 18 AS rc_relations_ok
FROM required \gset
\if :rc_relations_ok
\else
  \echo '{"section":"fatal","reason":"rc_relations_missing"}'
  \quit 73
\endif

WITH required(schema_name, table_name, column_name) AS (
  VALUES
    ('auth', 'usuaris', 'account_status'),
    ('auth', 'usuaris', 'application_role'),
    ('auth', 'usuaris', 'email_verified_at'),
    ('auth', 'usuaris', 'approved_at'),
    ('meteo', 'estacions', 'public_id'),
    ('meteo', 'estacions', 'owner_id'),
    ('meteo', 'estacions', 'management_kind'),
    ('meteo', 'estacions', 'lifecycle'),
    ('meteo', 'estacions', 'visibility'),
    ('meteo', 'estacions', 'revision'),
    ('meteo', 'estacions', 'description')
)
SELECT count(*) = 11 AND count(c.column_name) = 11 AS rc_columns_ok
FROM required AS r
LEFT JOIN information_schema.columns AS c
  ON c.table_schema = r.schema_name
 AND c.table_name = r.table_name
 AND c.column_name = r.column_name \gset
\if :rc_columns_ok
\else
  \echo '{"section":"fatal","reason":"rc_columns_missing"}'
  \quit 74
\endif

SELECT count(*) = 1 AND bool_and(
  e.id = 1
  AND e.codi = 'home'
  AND e.nom = 'Casa'
  AND e.proveidor = 'ecowitt'
  AND e.activa
  AND e.latitud IS NULL
  AND e.longitud IS NULL
  AND e.altitud_m IS NULL
  AND e.management_kind = 'LEGACY'
  AND e.lifecycle = 'ACTIVE'
  AND e.visibility = 'PUBLIC'
  AND e.owner_id IS NULL
  AND c.public_station_id = 1
) AS home_ok
FROM meteo.estacions AS e
CROSS JOIN meteo.public_view_config AS c
WHERE e.id = 1
  AND c.id = 1 \gset
\if :home_ok
\else
  \echo '{"section":"fatal","reason":"home_contract_differs"}'
  \quit 75
\endif

SELECT
  (SELECT count(*) FROM auth.credentials) = 0
  AND (SELECT count(*) FROM auth.sessions) = 0
  AND (SELECT count(*) FROM auth.account_tokens) = 0
  AND (SELECT count(*) FROM auth.user_preferences) = 0
  AND (SELECT count(*) FROM meteo.station_locations) = 0
  AND (SELECT count(*) FROM meteo.station_connectors) = 0
  AND (SELECT count(*) FROM meteo.connector_secrets) = 0
  AND (SELECT count(*) FROM meteo.source_bindings) = 0
  AND (SELECT count(*) FROM meteo.current_snapshots) = 0
  AND (SELECT count(*) FROM meteo.estimation_points) = 0
  AND (SELECT count(*) FROM meteo.import_batches) = 0
  AND (SELECT count(*) FROM meteo.import_rows) = 0
  AND (SELECT count(*) FROM meteo.manual_overrides) = 0
  AND (SELECT count(*) FROM meteo.audit_events) = 0
  AND (SELECT count(*) FROM meteo.station_history_policies) = 0
  AND (SELECT count(*) FROM meteo.history_capture_runs) = 0
  AS optional_data_empty \gset
\if :optional_data_empty
\else
  \echo '{"section":"fatal","reason":"optional_or_invented_data_present"}'
  \quit 76
\endif

SELECT
  (SELECT count(*) FROM meteo.estacions) = 1
  AND (SELECT count(*) FROM meteo.mesures) = 94095
  AND (SELECT count(*) FROM meteo.mesures_bak_ytd) = 61942
  AND (SELECT count(*) FROM meteo.estacions_hidro) = 3
  AND (SELECT count(*) FROM meteo.lectures_hidro) = 246234
  AND (SELECT count(*) FROM meteo.forecast_run) = 5933
  AND (SELECT count(*) FROM meteo.forecast_hourly) = 284784
  AND (SELECT count(*) FROM auth.usuaris) = 1
  AND (SELECT count(*) FROM auth.aplicacions) = 1
  AND (SELECT count(*) FROM auth.membres_app) = 0
  AND (SELECT count(*) FROM meteo.membres_estacio) = 1
  AND (SELECT count(*) FROM public.measurement) = 18
  AND (SELECT min(instant) FROM meteo.mesures) = '2023-05-09T06:00:03Z'::timestamptz
  AND (SELECT max(instant) FROM meteo.mesures) = '2026-09-25T10:00:03Z'::timestamptz
  AND (SELECT min(instant) FROM meteo.mesures_bak_ytd) = '2023-05-09T06:00:03Z'::timestamptz
  AND (SELECT max(instant) FROM meteo.mesures_bak_ytd) = '2025-10-20T12:15:03Z'::timestamptz
  AND (SELECT min(instant) FROM meteo.lectures_hidro) = '2023-05-09T06:00:03Z'::timestamptz
  AND (SELECT max(instant) FROM meteo.lectures_hidro) = '2026-09-25T09:50:00Z'::timestamptz
  AND (SELECT min(issued_at) FROM meteo.forecast_run) = '2026-01-07T09:04:34.704Z'::timestamptz
  AND (SELECT max(issued_at) FROM meteo.forecast_run) = '2026-09-25T10:10:02.262Z'::timestamptz
  AND (SELECT min(valid_time) FROM meteo.forecast_hourly) = '2026-01-07T09:00:00Z'::timestamptz
  AND (SELECT max(valid_time) FROM meteo.forecast_hourly) = '2026-09-27T09:00:00Z'::timestamptz
  AS legacy_invariants_ok \gset
\if :legacy_invariants_ok
\else
  \echo '{"section":"fatal","reason":"legacy_counts_or_ranges_differ"}'
  \quit 77
\endif

\echo PROD01_POSTFLIGHT_V1_BEGIN

SELECT jsonb_build_object(
  'section', 'postflight_summary',
  'target_database', current_database(),
  'transaction_read_only', current_setting('transaction_read_only'),
  'transaction_isolation', current_setting('transaction_isolation'),
  'postgis_schema', (
    SELECT n.nspname FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace
    WHERE e.extname='postgis'
  ),
  'postgis_version', (
    SELECT extversion FROM pg_extension WHERE extname='postgis'
  ),
  'rc_relations', 18,
  'rc_columns', 11,
  'home', 'PASS',
  'optional_data_empty', true,
  'legacy_invariants', 'PASS'
)::text;

SELECT jsonb_build_object(
  'section', 'home',
  'id', e.id,
  'code', e.codi,
  'name', e.nom,
  'provider', e.proveidor,
  'active', e.activa,
  'management_kind', e.management_kind,
  'lifecycle', e.lifecycle,
  'visibility', e.visibility,
  'owner_is_null', e.owner_id IS NULL,
  'coordinates_are_null', e.latitud IS NULL AND e.longitud IS NULL AND e.altitud_m IS NULL,
  'public_station_id', c.public_station_id
)::text
FROM meteo.estacions e
CROSS JOIN meteo.public_view_config c
WHERE e.id=1 AND c.id=1;

SELECT jsonb_build_object(
  'section', 'optional_counts',
  'credentials', (SELECT count(*) FROM auth.credentials),
  'sessions', (SELECT count(*) FROM auth.sessions),
  'account_tokens', (SELECT count(*) FROM auth.account_tokens),
  'user_preferences', (SELECT count(*) FROM auth.user_preferences),
  'station_locations', (SELECT count(*) FROM meteo.station_locations),
  'station_connectors', (SELECT count(*) FROM meteo.station_connectors),
  'connector_secrets', (SELECT count(*) FROM meteo.connector_secrets),
  'source_bindings', (SELECT count(*) FROM meteo.source_bindings),
  'current_snapshots', (SELECT count(*) FROM meteo.current_snapshots),
  'history_policies', (SELECT count(*) FROM meteo.station_history_policies),
  'active_history_policies', (SELECT count(*) FROM meteo.station_history_policies WHERE enabled),
  'history_capture_runs', (SELECT count(*) FROM meteo.history_capture_runs),
  'import_batches', (SELECT count(*) FROM meteo.import_batches),
  'import_rows', (SELECT count(*) FROM meteo.import_rows),
  'manual_overrides', (SELECT count(*) FROM meteo.manual_overrides),
  'audit_events', (SELECT count(*) FROM meteo.audit_events)
)::text;

SELECT jsonb_build_object(
  'section', 'legacy_counts',
  'meteo.estacions', (SELECT count(*) FROM meteo.estacions),
  'meteo.mesures', (SELECT count(*) FROM meteo.mesures),
  'meteo.mesures_bak_ytd', (SELECT count(*) FROM meteo.mesures_bak_ytd),
  'meteo.estacions_hidro', (SELECT count(*) FROM meteo.estacions_hidro),
  'meteo.lectures_hidro', (SELECT count(*) FROM meteo.lectures_hidro),
  'meteo.forecast_run', (SELECT count(*) FROM meteo.forecast_run),
  'meteo.forecast_hourly', (SELECT count(*) FROM meteo.forecast_hourly),
  'meteo.forecast_feedback', (SELECT count(*) FROM meteo.forecast_feedback),
  'auth.usuaris', (SELECT count(*) FROM auth.usuaris),
  'auth.aplicacions', (SELECT count(*) FROM auth.aplicacions),
  'auth.membres_app', (SELECT count(*) FROM auth.membres_app),
  'meteo.membres_estacio', (SELECT count(*) FROM meteo.membres_estacio),
  'public.measurement', (SELECT count(*) FROM public.measurement),
  'biblioteca._prisma_migrations', (SELECT count(*) FROM biblioteca._prisma_migrations)
)::text;

SELECT jsonb_build_object(
  'section', 'sequence',
  'schema', schemaname,
  'name', sequencename,
  'last_value', last_value
)::text
FROM pg_sequences
WHERE schemaname IN ('auth', 'biblioteca', 'hidro', 'legacy', 'meteo', 'public')
ORDER BY schemaname, sequencename;

SELECT jsonb_build_object(
  'section', 'sequence_ownership',
  'sequence_schema', seq_ns.nspname,
  'sequence', seq.relname,
  'table_schema', tbl_ns.nspname,
  'table', tbl.relname,
  'column', att.attname
)::text
FROM pg_depend dep
JOIN pg_class seq ON seq.oid=dep.objid AND seq.relkind='S'
JOIN pg_namespace seq_ns ON seq_ns.oid=seq.relnamespace
JOIN pg_class tbl ON tbl.oid=dep.refobjid
JOIN pg_namespace tbl_ns ON tbl_ns.oid=tbl.relnamespace
JOIN pg_attribute att ON att.attrelid=tbl.oid AND att.attnum=dep.refobjsubid
WHERE dep.classid='pg_class'::regclass
  AND dep.refclassid='pg_class'::regclass
  AND dep.deptype IN ('a','i')
  AND seq_ns.nspname IN ('auth', 'biblioteca', 'hidro', 'legacy', 'meteo', 'public')
ORDER BY seq_ns.nspname, seq.relname;

ROLLBACK;
\echo PROD01_POSTFLIGHT_V1_PASS
