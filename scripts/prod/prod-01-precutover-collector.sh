#!/usr/bin/env bash
set -Eeuo pipefail

# PROD-01 historical PRE-CUTOVER collector. It writes NDJSON only to stdout;
# callers decide the local filesystem evidence path. PostgreSQL remains read-only.
readonly PROD01_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
: "${TARGET_DB:?TARGET_DB is required}"
: "${PROD01_PG_CONTAINER:?PROD01_PG_CONTAINER is required}"
: "${PROD01_PG_USER:?PROD01_PG_USER is required}"

node "${PROD01_ROOT}/scripts/prod/prod-01-precutover.js" target "${TARGET_DB}" >/dev/null

exec docker exec -i \
  -e PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=120000 -c lock_timeout=3000 -c idle_in_transaction_session_timeout=300000' \
  "${PROD01_PG_CONTAINER}" \
  psql \
    --no-psqlrc \
    --set=ON_ERROR_STOP=1 \
    --set=VERBOSITY=terse \
    --username="${PROD01_PG_USER}" \
    --dbname="${TARGET_DB}" \
    --variable=expected_target="${TARGET_DB}" \
    2>&1 <<'PROD01_SQL'
\set QUIET 1
\pset pager off
\pset format unaligned
\pset tuples_only on

BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '120s';
SET LOCAL lock_timeout = '3s';
SET LOCAL idle_in_transaction_session_timeout = '300s';

SELECT current_database() = :'expected_target' AS pr04_target_ok \gset
\if :pr04_target_ok
\else
  \echo '{"section":"fatal","reason":"unexpected_database"}'
  \quit 40
\endif

SELECT EXISTS (
  SELECT 1
  FROM pg_available_extensions
  WHERE name = 'postgis'
    AND default_version IS NOT NULL
) AS prod01_postgis_available \gset
\if :prod01_postgis_available
\else
  \echo '{"section":"fatal","reason":"postgis_is_not_available"}'
  \quit 42
\endif

SELECT count(*) = 1 AND bool_and(
  id = 1
  AND codi = 'home'
  AND nom = 'Casa'
  AND proveidor = 'ecowitt'
  AND activa
  AND latitud IS NULL
  AND longitud IS NULL
  AND altitud_m IS NULL
) AS prod01_home_ok
FROM meteo.estacions
WHERE id = 1 \gset
\if :prod01_home_ok
\else
  \echo '{"section":"fatal","reason":"legacy_home_contract_differs"}'
  \quit 43
\endif

SELECT current_setting('transaction_read_only') = 'on' AS pr04_read_only_ok \gset
\if :pr04_read_only_ok
\else
  \echo '{"section":"fatal","reason":"transaction_is_not_read_only"}'
  \quit 41
\endif

\echo PR04_FINGERPRINT_V1_BEGIN

SELECT jsonb_build_object(
  'section', 'collector',
  'format_version', 1,
  'target_database', current_database(),
  'transaction_read_only', current_setting('transaction_read_only'),
  'transaction_isolation', current_setting('transaction_isolation'),
  'collected_at', transaction_timestamp()
)::text;

SELECT jsonb_build_object(
  'section', 'database',
  'server_version', current_setting('server_version'),
  'server_version_num', current_setting('server_version_num'),
  'server_build', version(),
  'database', d.datname,
  'encoding', pg_encoding_to_char(d.encoding),
  'collate', d.datcollate,
  'ctype', d.datctype,
  'collation_version_recorded', d.datcollversion,
  'collation_version_actual', pg_database_collation_actual_version(d.oid)
)::text
FROM pg_database AS d
WHERE d.datname = current_database();

SELECT jsonb_build_object(
  'section', 'extension',
  'name', e.extname,
  'version', e.extversion,
  'schema', n.nspname,
  'relocatable', e.extrelocatable
)::text
FROM pg_extension AS e
JOIN pg_namespace AS n ON n.oid = e.extnamespace
ORDER BY e.extname;

SELECT jsonb_build_object(
  'section', 'schema',
  'name', n.nspname,
  'owner', pg_get_userbyid(n.nspowner)
)::text
FROM pg_namespace AS n
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
ORDER BY n.nspname;

SELECT jsonb_build_object(
  'section', 'database_acl',
  'database', d.datname,
  'owner', pg_get_userbyid(d.datdba),
  'grantor', pg_get_userbyid(x.grantor),
  'grantee', CASE WHEN x.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END,
  'privilege', x.privilege_type,
  'grantable', x.is_grantable
)::text
FROM pg_database AS d
CROSS JOIN LATERAL aclexplode(COALESCE(d.datacl, acldefault('d'::"char", d.datdba))) AS x
WHERE d.datname = current_database()
ORDER BY x.grantee, x.privilege_type;

SELECT jsonb_build_object(
  'section', 'schema_acl',
  'schema', n.nspname,
  'owner', pg_get_userbyid(n.nspowner),
  'grantor', pg_get_userbyid(x.grantor),
  'grantee', CASE WHEN x.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END,
  'privilege', x.privilege_type,
  'grantable', x.is_grantable
)::text
FROM pg_namespace AS n
CROSS JOIN LATERAL aclexplode(COALESCE(n.nspacl, acldefault('n'::"char", n.nspowner))) AS x
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
ORDER BY n.nspname, x.grantee, x.privilege_type;

SELECT jsonb_build_object(
  'section', 'relation',
  'schema', n.nspname,
  'name', c.relname,
  'kind', CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'p' THEN 'partitioned_table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized_view'
    WHEN 'f' THEN 'foreign_table'
    ELSE c.relkind::text
  END,
  'persistence', CASE c.relpersistence
    WHEN 'p' THEN 'permanent'
    WHEN 'u' THEN 'unlogged'
    WHEN 't' THEN 'temporary'
    ELSE c.relpersistence::text
  END,
  'owner', pg_get_userbyid(c.relowner),
  'row_security', c.relrowsecurity,
  'force_row_security', c.relforcerowsecurity
)::text
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
ORDER BY n.nspname, c.relname;

SELECT jsonb_build_object(
  'section', 'relation_acl',
  'schema', n.nspname,
  'relation', c.relname,
  'kind', CASE c.relkind
    WHEN 'S' THEN 'sequence'
    WHEN 'r' THEN 'table'
    WHEN 'p' THEN 'partitioned_table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized_view'
    WHEN 'f' THEN 'foreign_table'
    ELSE c.relkind::text
  END,
  'owner', pg_get_userbyid(c.relowner),
  'grantor', pg_get_userbyid(x.grantor),
  'grantee', CASE WHEN x.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END,
  'privilege', x.privilege_type,
  'grantable', x.is_grantable
)::text
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
CROSS JOIN LATERAL aclexplode(
  COALESCE(c.relacl, acldefault(CASE WHEN c.relkind = 'S' THEN 'S'::"char" ELSE 'r'::"char" END, c.relowner))
) AS x
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
ORDER BY n.nspname, c.relname, x.grantee, x.privilege_type;

SELECT jsonb_build_object(
  'section', 'view_definition',
  'schema', n.nspname,
  'name', c.relname,
  'kind', CASE c.relkind WHEN 'v' THEN 'view' ELSE 'materialized_view' END,
  'definition', pg_get_viewdef(c.oid, true)
)::text
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
  AND c.relkind IN ('v', 'm')
ORDER BY n.nspname, c.relname;

SELECT jsonb_build_object(
  'section', 'column',
  'schema', n.nspname,
  'relation', c.relname,
  'ordinal', a.attnum,
  'name', a.attname,
  'type', pg_catalog.format_type(a.atttypid, a.atttypmod),
  'nullable', NOT a.attnotnull,
  'default', pg_get_expr(ad.adbin, ad.adrelid),
  'identity', NULLIF(a.attidentity, ''),
  'generated', NULLIF(a.attgenerated, ''),
  'collation', CASE
    WHEN a.attcollation = 0 THEN NULL
    ELSE quote_ident(cn.nspname) || '.' || quote_ident(co.collname)
  END
)::text
FROM pg_attribute AS a
JOIN pg_class AS c ON c.oid = a.attrelid
JOIN pg_namespace AS n ON n.oid = c.relnamespace
LEFT JOIN pg_attrdef AS ad
  ON ad.adrelid = a.attrelid
 AND ad.adnum = a.attnum
LEFT JOIN pg_collation AS co ON co.oid = a.attcollation
LEFT JOIN pg_namespace AS cn ON cn.oid = co.collnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY n.nspname, c.relname, a.attnum;

SELECT jsonb_build_object(
  'section', 'constraint',
  'schema', n.nspname,
  'relation', c.relname,
  'name', con.conname,
  'kind', CASE con.contype
    WHEN 'p' THEN 'primary_key'
    WHEN 'f' THEN 'foreign_key'
    WHEN 'u' THEN 'unique'
    WHEN 'c' THEN 'check'
    ELSE con.contype::text
  END,
  'validated', con.convalidated,
  'deferrable', con.condeferrable,
  'initially_deferred', con.condeferred,
  'definition', pg_get_constraintdef(con.oid, true)
)::text
FROM pg_constraint AS con
JOIN pg_class AS c ON c.oid = con.conrelid
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
  AND con.contype IN ('p', 'f', 'u', 'c')
ORDER BY n.nspname, c.relname, con.conname;

SELECT jsonb_build_object(
  'section', 'index',
  'schema', n.nspname,
  'relation', tbl.relname,
  'name', idx.relname,
  'access_method', am.amname,
  'primary', i.indisprimary,
  'unique', i.indisunique,
  'valid', i.indisvalid,
  'ready', i.indisready,
  'definition', pg_get_indexdef(i.indexrelid)
)::text
FROM pg_index AS i
JOIN pg_class AS tbl ON tbl.oid = i.indrelid
JOIN pg_namespace AS n ON n.oid = tbl.relnamespace
JOIN pg_class AS idx ON idx.oid = i.indexrelid
JOIN pg_am AS am ON am.oid = idx.relam
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
ORDER BY n.nspname, tbl.relname, idx.relname;

SELECT jsonb_build_object(
  'section', 'sequence',
  'schema', s.schemaname,
  'name', s.sequencename,
  'owner', s.sequenceowner,
  'data_type', s.data_type,
  'start_value', s.start_value,
  'minimum_value', s.min_value,
  'maximum_value', s.max_value,
  'increment_by', s.increment_by,
  'cycle', s.cycle,
  'cache_size', s.cache_size,
  'last_value', s.last_value
)::text
FROM pg_sequences AS s
WHERE s.schemaname <> 'information_schema'
  AND s.schemaname !~ '^pg_'
ORDER BY s.schemaname, s.sequencename;

SELECT jsonb_build_object(
  'section', 'sequence_ownership',
  'sequence_schema', seq_ns.nspname,
  'sequence', seq.relname,
  'table_schema', tbl_ns.nspname,
  'table', tbl.relname,
  'column', att.attname,
  'dependency_type', dep.deptype
)::text
FROM pg_depend AS dep
JOIN pg_class AS seq
  ON seq.oid = dep.objid
 AND seq.relkind = 'S'
JOIN pg_namespace AS seq_ns ON seq_ns.oid = seq.relnamespace
JOIN pg_class AS tbl ON tbl.oid = dep.refobjid
JOIN pg_namespace AS tbl_ns ON tbl_ns.oid = tbl.relnamespace
JOIN pg_attribute AS att
  ON att.attrelid = tbl.oid
 AND att.attnum = dep.refobjsubid
WHERE dep.classid = 'pg_class'::regclass
  AND dep.refclassid = 'pg_class'::regclass
  AND dep.deptype IN ('a', 'i')
  AND seq_ns.nspname <> 'information_schema'
  AND seq_ns.nspname !~ '^pg_'
ORDER BY seq_ns.nspname, seq.relname;

SELECT jsonb_build_object(
  'section', 'trigger',
  'schema', n.nspname,
  'relation', c.relname,
  'name', t.tgname,
  'enabled', t.tgenabled,
  'function', quote_ident(fn_ns.nspname) || '.' || quote_ident(p.proname),
  'definition', pg_get_triggerdef(t.oid, true)
)::text
FROM pg_trigger AS t
JOIN pg_class AS c ON c.oid = t.tgrelid
JOIN pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_proc AS p ON p.oid = t.tgfoid
JOIN pg_namespace AS fn_ns ON fn_ns.oid = p.pronamespace
WHERE NOT t.tgisinternal
  AND n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
ORDER BY n.nspname, c.relname, t.tgname;

SELECT jsonb_build_object(
  'section', 'function_signature',
  'schema', n.nspname,
  'name', p.proname,
  'kind', CASE p.prokind
    WHEN 'f' THEN 'function'
    WHEN 'p' THEN 'procedure'
    WHEN 'a' THEN 'aggregate'
    WHEN 'w' THEN 'window'
    ELSE p.prokind::text
  END,
  'identity_arguments', pg_get_function_identity_arguments(p.oid),
  'result', pg_get_function_result(p.oid),
  'owner', pg_get_userbyid(p.proowner),
  'language', l.lanname,
  'volatility', p.provolatile,
  'security_definer', p.prosecdef,
  'parallel', p.proparallel
)::text
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
JOIN pg_language AS l ON l.oid = p.prolang
WHERE n.nspname IN ('auth', 'meteo', 'biblioteca', 'hidro', 'legacy')
ORDER BY n.nspname, p.proname, pg_get_function_identity_arguments(p.oid);

SELECT jsonb_build_object(
  'section', 'user_defined_type',
  'schema', n.nspname,
  'name', t.typname,
  'kind', CASE t.typtype
    WHEN 'e' THEN 'enum'
    WHEN 'd' THEN 'domain'
    WHEN 'r' THEN 'range'
    WHEN 'm' THEN 'multirange'
    ELSE t.typtype::text
  END,
  'base_type', CASE
    WHEN t.typtype = 'd' THEN pg_catalog.format_type(t.typbasetype, t.typtypmod)
    ELSE NULL
  END,
  'not_null', CASE WHEN t.typtype = 'd' THEN t.typnotnull ELSE NULL END,
  'default', CASE WHEN t.typtype = 'd' THEN t.typdefault ELSE NULL END,
  'enum_labels', CASE WHEN t.typtype = 'e' THEN (
    SELECT jsonb_agg(e.enumlabel ORDER BY e.enumsortorder)
    FROM pg_enum AS e
    WHERE e.enumtypid = t.oid
  ) ELSE NULL END
)::text
FROM pg_type AS t
JOIN pg_namespace AS n ON n.oid = t.typnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname !~ '^pg_'
  AND t.typtype IN ('e', 'd', 'r', 'm')
ORDER BY n.nspname, t.typname;

WITH expected(schema_name, relation_name, expected_kind, migration_role) AS (
  VALUES
    ('auth', 'usuaris', 'table', 'legacy_required'),
    ('auth', 'credentials', 'table', 'rc_new'),
    ('auth', 'sessions', 'table', 'rc_new'),
    ('auth', 'account_tokens', 'table', 'rc_new'),
    ('auth', 'user_preferences', 'table', 'rc_new'),
    ('meteo', 'estacions', 'table', 'legacy_extended'),
    ('meteo', 'membres_estacio', 'table', 'legacy_required'),
    ('meteo', 'mesures', 'table', 'legacy_required'),
    ('meteo', 'estacions_hidro', 'table', 'legacy_preserve'),
    ('meteo', 'lectures_hidro', 'table', 'legacy_preserve'),
    ('meteo', 'forecast_run', 'table', 'legacy_preserve'),
    ('meteo', 'forecast_hourly', 'table', 'legacy_preserve'),
    ('meteo', 'station_locations', 'table', 'rc_new'),
    ('meteo', 'station_connectors', 'table', 'rc_new'),
    ('meteo', 'connector_secrets', 'table', 'rc_new'),
    ('meteo', 'source_bindings', 'table', 'rc_new'),
    ('meteo', 'current_snapshots', 'table', 'rc_new'),
    ('meteo', 'estimation_points', 'table', 'rc_new'),
    ('meteo', 'public_view_config', 'table', 'rc_new'),
    ('meteo', 'map_catalog_state', 'table', 'rc_new'),
    ('meteo', 'import_batches', 'table', 'rc_new'),
    ('meteo', 'import_rows', 'table', 'rc_new'),
    ('meteo', 'manual_overrides', 'table', 'rc_new'),
    ('meteo', 'audit_events', 'table', 'rc_new'),
    ('meteo', 'station_history_policies', 'table', 'rc_new'),
    ('meteo', 'history_capture_runs', 'table', 'rc_new')
)
SELECT jsonb_build_object(
  'section', 'rc_relation_probe',
  'schema', e.schema_name,
  'relation', e.relation_name,
  'expected_kind', e.expected_kind,
  'migration_role', e.migration_role,
  'status', CASE WHEN c.oid IS NULL THEN 'ABSENT' ELSE 'PRESENT' END,
  'actual_kind', CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'p' THEN 'partitioned_table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized_view'
    WHEN 'f' THEN 'foreign_table'
    ELSE c.relkind::text
  END
)::text
FROM expected AS e
LEFT JOIN pg_namespace AS n ON n.nspname = e.schema_name
LEFT JOIN pg_class AS c
  ON c.relnamespace = n.oid
 AND c.relname = e.relation_name
ORDER BY e.schema_name, e.relation_name;

WITH expected(schema_name, table_name, column_name, migration_role) AS (
  VALUES
    ('auth', 'usuaris', 'id', 'legacy_required'),
    ('auth', 'usuaris', 'email', 'legacy_required'),
    ('auth', 'usuaris', 'nom', 'legacy_required'),
    ('auth', 'usuaris', 'passwd_hash', 'legacy_required'),
    ('auth', 'usuaris', 'actiu', 'legacy_required'),
    ('auth', 'usuaris', 'creat_el', 'legacy_required'),
    ('auth', 'usuaris', 'account_status', 'rc_addition'),
    ('auth', 'usuaris', 'application_role', 'rc_addition'),
    ('auth', 'usuaris', 'email_verified_at', 'rc_addition'),
    ('auth', 'usuaris', 'approved_at', 'rc_addition'),
    ('meteo', 'estacions', 'id', 'legacy_required'),
    ('meteo', 'estacions', 'codi', 'legacy_required'),
    ('meteo', 'estacions', 'nom', 'legacy_required'),
    ('meteo', 'estacions', 'proveidor', 'legacy_required'),
    ('meteo', 'estacions', 'activa', 'legacy_required'),
    ('meteo', 'estacions', 'latitud', 'legacy_required'),
    ('meteo', 'estacions', 'longitud', 'legacy_required'),
    ('meteo', 'estacions', 'altitud_m', 'legacy_required'),
    ('meteo', 'estacions', 'creat_per_usuari', 'legacy_required'),
    ('meteo', 'estacions', 'etiquetes', 'legacy_required'),
    ('meteo', 'estacions', 'creat_el', 'legacy_required'),
    ('meteo', 'estacions', 'public_id', 'rc_addition'),
    ('meteo', 'estacions', 'owner_id', 'rc_addition'),
    ('meteo', 'estacions', 'management_kind', 'rc_addition'),
    ('meteo', 'estacions', 'lifecycle', 'rc_addition'),
    ('meteo', 'estacions', 'visibility', 'rc_addition'),
    ('meteo', 'estacions', 'revision', 'rc_addition'),
    ('meteo', 'estacions', 'description', 'rc_addition')
)
SELECT jsonb_build_object(
  'section', 'rc_column_probe',
  'schema', e.schema_name,
  'table', e.table_name,
  'column', e.column_name,
  'migration_role', e.migration_role,
  'status', CASE WHEN a.attnum IS NULL THEN 'ABSENT' ELSE 'PRESENT' END,
  'actual_type', CASE WHEN a.attnum IS NULL THEN NULL ELSE pg_catalog.format_type(a.atttypid, a.atttypmod) END,
  'nullable', CASE WHEN a.attnum IS NULL THEN NULL ELSE NOT a.attnotnull END,
  'default', CASE WHEN a.attnum IS NULL THEN NULL ELSE pg_get_expr(ad.adbin, ad.adrelid) END
)::text
FROM expected AS e
LEFT JOIN pg_namespace AS n ON n.nspname = e.schema_name
LEFT JOIN pg_class AS c
  ON c.relnamespace = n.oid
 AND c.relname = e.table_name
 AND c.relkind IN ('r', 'p')
LEFT JOIN pg_attribute AS a
  ON a.attrelid = c.oid
 AND a.attname = e.column_name
 AND a.attnum > 0
 AND NOT a.attisdropped
LEFT JOIN pg_attrdef AS ad
  ON ad.adrelid = a.attrelid
 AND ad.adnum = a.attnum
ORDER BY e.schema_name, e.table_name, e.column_name;

WITH probes(schema_name, relation_name, reason) AS (
  VALUES
    ('meteo', 'mesures_bak_ytd', 'legacy_preserve'),
    ('meteo', 'forecast_feedback', 'legacy_preserve_if_present'),
    ('public', 'measurement', 'legacy_preserve'),
    ('biblioteca', '_prisma_migrations', 'prisma_history_preserve'),
    ('meteo_local', 'schema_migrations', 'must_not_be_used_as_runtime_ledger')
)
SELECT jsonb_build_object(
  'section', 'preservation_probe',
  'schema', p.schema_name,
  'relation', p.relation_name,
  'reason', p.reason,
  'status', CASE WHEN c.oid IS NULL THEN 'ABSENT' ELSE 'PRESENT' END,
  'actual_kind', CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'p' THEN 'partitioned_table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized_view'
    ELSE c.relkind::text
  END
)::text
FROM probes AS p
LEFT JOIN pg_namespace AS n ON n.nspname = p.schema_name
LEFT JOIN pg_class AS c
  ON c.relnamespace = n.oid
 AND c.relname = p.relation_name
ORDER BY p.schema_name, p.relation_name;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'meteo.estacions',
  'row_count', count(*),
  'expected_row_count', 1,
  'matches_pr03', count(*) = 1
)::text
FROM meteo.estacions;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'meteo.mesures',
  'row_count', count(*),
  'first_instant', min(instant),
  'last_instant', max(instant),
  'expected_row_count', 94095,
  'expected_first_instant', '2023-05-09T06:00:03Z',
  'expected_last_instant', '2026-09-25T10:00:03Z',
  'matches_pr03', count(*) = 94095
    AND min(instant) = '2023-05-09T06:00:03Z'::timestamptz
    AND max(instant) = '2026-09-25T10:00:03Z'::timestamptz
)::text
FROM meteo.mesures;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'meteo.mesures_bak_ytd',
  'row_count', count(*),
  'first_instant', min(instant),
  'last_instant', max(instant),
  'expected_row_count', 61942,
  'expected_first_instant', '2023-05-09T06:00:03Z',
  'expected_last_instant', '2025-10-20T12:15:03Z',
  'matches_pr03', count(*) = 61942
    AND min(instant) = '2023-05-09T06:00:03Z'::timestamptz
    AND max(instant) = '2025-10-20T12:15:03Z'::timestamptz
)::text
FROM meteo.mesures_bak_ytd;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'meteo.estacions_hidro',
  'row_count', count(*),
  'expected_row_count', 3,
  'matches_pr03', count(*) = 3
)::text
FROM meteo.estacions_hidro;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'meteo.lectures_hidro',
  'row_count', count(*),
  'first_instant', min(instant),
  'last_instant', max(instant),
  'expected_row_count', 246234,
  'expected_first_instant', '2023-05-09T06:00:03Z',
  'expected_last_instant', '2026-09-25T09:50:00Z',
  'matches_pr03', count(*) = 246234
    AND min(instant) = '2023-05-09T06:00:03Z'::timestamptz
    AND max(instant) = '2026-09-25T09:50:00Z'::timestamptz
)::text
FROM meteo.lectures_hidro;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'meteo.forecast_run',
  'row_count', count(*),
  'first_issued_at', min(issued_at),
  'last_issued_at', max(issued_at),
  'expected_row_count', 5933,
  'expected_first_issued_at', '2026-01-07T09:04:34.704Z',
  'expected_last_issued_at', '2026-09-25T10:10:02.262Z',
  'matches_pr03', count(*) = 5933
    AND min(issued_at) = '2026-01-07T09:04:34.704Z'::timestamptz
    AND max(issued_at) = '2026-09-25T10:10:02.262Z'::timestamptz
)::text
FROM meteo.forecast_run;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'meteo.forecast_hourly',
  'row_count', count(*),
  'first_valid_time', min(valid_time),
  'last_valid_time', max(valid_time),
  'expected_row_count', 284784,
  'expected_first_valid_time', '2026-01-07T09:00:00Z',
  'expected_last_valid_time', '2026-09-27T09:00:00Z',
  'matches_pr03', count(*) = 284784
    AND min(valid_time) = '2026-01-07T09:00:00Z'::timestamptz
    AND max(valid_time) = '2026-09-27T09:00:00Z'::timestamptz
)::text
FROM meteo.forecast_hourly;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'auth.usuaris',
  'row_count', count(*),
  'expected_row_count', 1,
  'matches_pr03', count(*) = 1
)::text
FROM auth.usuaris;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'auth.aplicacions',
  'row_count', count(*),
  'expected_row_count', 1,
  'matches_pr03', count(*) = 1
)::text
FROM auth.aplicacions;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'auth.membres_app',
  'row_count', count(*),
  'expected_row_count', 0,
  'matches_pr03', count(*) = 0
)::text
FROM auth.membres_app;

SELECT jsonb_build_object(
  'section', 'authorization_aggregate',
  'object', 'auth.usuaris',
  'row_count', count(*),
  'active_rows', count(*) FILTER (WHERE actiu),
  'inactive_rows', count(*) FILTER (WHERE NOT actiu)
)::text
FROM auth.usuaris;

SELECT EXISTS (
  SELECT 1
  FROM pg_attribute AS a
  WHERE a.attrelid = 'auth.usuaris'::regclass
    AND a.attname = 'passwd_hash'
    AND a.attnum > 0
    AND NOT a.attisdropped
) AS pr04_has_passwd_hash \gset
\if :pr04_has_passwd_hash
  SELECT jsonb_build_object(
    'section', 'password_hash_aggregate',
    'object', 'auth.usuaris.passwd_hash',
    'status', 'PRESENT',
    'rows_with_password_hash', count(*) FILTER (WHERE passwd_hash IS NOT NULL),
    'rows_without_password_hash', count(*) FILTER (WHERE passwd_hash IS NULL),
    'rc_scrypt_format_rows', count(*) FILTER (
      WHERE passwd_hash ~ '^scrypt\$131072\$8\$1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$'
    ),
    'other_nonnull_hash_format_rows', count(*) FILTER (
      WHERE passwd_hash IS NOT NULL
        AND passwd_hash !~ '^scrypt\$131072\$8\$1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$'
    )
  )::text
  FROM auth.usuaris;
\else
  SELECT jsonb_build_object(
    'section', 'password_hash_aggregate',
    'object', 'auth.usuaris.passwd_hash',
    'status', 'ABSENT'
  )::text;
\endif

SELECT jsonb_build_object(
  'section', 'authorization_aggregate',
  'object', 'auth.membres_app',
  'role', rol,
  'row_count', count(*)
)::text
FROM auth.membres_app
GROUP BY rol
ORDER BY rol;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'meteo.membres_estacio',
  'row_count', count(*),
  'expected_row_count', 1,
  'matches_pr03', count(*) = 1
)::text
FROM meteo.membres_estacio;

SELECT jsonb_build_object(
  'section', 'authorization_aggregate',
  'object', 'meteo.membres_estacio',
  'role', rol,
  'row_count', count(*)
)::text
FROM meteo.membres_estacio
GROUP BY rol
ORDER BY rol;

SELECT jsonb_build_object(
  'section', 'pr03_invariant',
  'object', 'public.measurement',
  'row_count', count(*),
  'first_at', min(at),
  'last_at', max(at),
  'expected_row_count', 18,
  'expected_first_at', '2025-10-16T08:39:38.744Z',
  'expected_last_at', '2025-10-16T11:15:02.902Z',
  'matches_pr03', count(*) = 18
    AND min(at) = '2025-10-16T08:39:38.744Z'::timestamptz
    AND max(at) = '2025-10-16T11:15:02.902Z'::timestamptz
)::text
FROM public.measurement;

WITH high_water(object_name, max_id) AS (
  SELECT 'auth.usuaris', max(id)::numeric FROM auth.usuaris
  UNION ALL SELECT 'auth.aplicacions', max(id)::numeric FROM auth.aplicacions
  UNION ALL SELECT 'meteo.estacions', max(id)::numeric FROM meteo.estacions
  UNION ALL SELECT 'meteo.mesures', max(id)::numeric FROM meteo.mesures
  UNION ALL SELECT 'meteo.mesures_bak_ytd', max(id)::numeric FROM meteo.mesures_bak_ytd
  UNION ALL SELECT 'meteo.estacions_hidro', max(id)::numeric FROM meteo.estacions_hidro
  UNION ALL SELECT 'meteo.lectures_hidro', max(id)::numeric FROM meteo.lectures_hidro
  UNION ALL SELECT 'meteo.forecast_run', max(id)::numeric FROM meteo.forecast_run
  UNION ALL SELECT 'public.measurement', max(id)::numeric FROM public.measurement
)
SELECT jsonb_build_object(
  'section', 'sequence_high_water',
  'object', object_name,
  'max_id', max_id
)::text
FROM high_water
ORDER BY object_name;

SELECT jsonb_build_object(
  'section', 'hydro_station_invariant',
  'station_code', e.codi,
  'reading_count', count(l.*),
  'first_instant', min(l.instant),
  'last_instant', max(l.instant)
)::text
FROM meteo.estacions_hidro AS e
LEFT JOIN meteo.lectures_hidro AS l ON l.estacio_id = e.id
GROUP BY e.codi
ORDER BY e.codi;

WITH duplicates AS (
  SELECT codi
  FROM meteo.estacions
  GROUP BY codi
  HAVING count(*) > 1
)
SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'duplicate_station_codes',
  'violation_groups', count(*),
  'pass', count(*) = 0
)::text
FROM duplicates;

WITH duplicates AS (
  SELECT lower(email)
  FROM auth.usuaris
  GROUP BY lower(email)
  HAVING count(*) > 1
)
SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'duplicate_casefolded_user_emails',
  'violation_groups', count(*),
  'pass', count(*) = 0
)::text
FROM duplicates;

SELECT (
  SELECT count(*) = 2
  FROM pg_attribute AS a
  WHERE a.attrelid = 'meteo.estacions'::regclass
    AND a.attname IN ('latitud', 'longitud')
    AND a.attnum > 0
    AND NOT a.attisdropped
) AS pr04_has_coordinate_columns \gset
\if :pr04_has_coordinate_columns
  SELECT jsonb_build_object(
    'section', 'migration_preflight',
    'check', 'legacy_station_coordinates',
    'status', 'EVALUATED',
    'row_count', count(*),
    'complete_pairs', count(*) FILTER (WHERE latitud IS NOT NULL AND longitud IS NOT NULL),
    'partial_pairs', count(*) FILTER (WHERE (latitud IS NULL) <> (longitud IS NULL)),
    'out_of_range', count(*) FILTER (
      WHERE (latitud IS NOT NULL AND (latitud < -90 OR latitud > 90))
         OR (longitud IS NOT NULL AND (longitud < -180 OR longitud > 180))
    ),
    'pass', count(*) FILTER (WHERE (latitud IS NULL) <> (longitud IS NULL)) = 0
      AND count(*) FILTER (
        WHERE (latitud IS NOT NULL AND (latitud < -90 OR latitud > 90))
           OR (longitud IS NOT NULL AND (longitud < -180 OR longitud > 180))
      ) = 0
  )::text
  FROM meteo.estacions;
\else
  SELECT jsonb_build_object(
    'section', 'migration_preflight',
    'check', 'legacy_station_coordinates',
    'status', 'NOT_EVALUATED_MISSING_COLUMN',
    'latitud_present', EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'meteo.estacions'::regclass AND attname = 'latitud'
        AND attnum > 0 AND NOT attisdropped
    ),
    'longitud_present', EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = 'meteo.estacions'::regclass AND attname = 'longitud'
        AND attnum > 0 AND NOT attisdropped
    ),
    'pass', false
  )::text;
\endif

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'legacy_station_creator_reference',
  'station_rows', count(*),
  'missing_creator', count(*) FILTER (WHERE creat_per_usuari IS NULL),
  'orphan_creator', count(*) FILTER (WHERE creat_per_usuari IS NOT NULL AND u.id IS NULL),
  'owner_backfill_policy', 'do_not_copy_to_owner_id',
  'pass', count(*) FILTER (WHERE creat_per_usuari IS NOT NULL AND u.id IS NULL) = 0
)::text
FROM meteo.estacions AS e
LEFT JOIN auth.usuaris AS u ON u.id = e.creat_per_usuari;

SELECT EXISTS (
  SELECT 1
  FROM pg_attribute AS a
  WHERE a.attrelid = 'meteo.estacions'::regclass
    AND a.attname = 'activa'
    AND a.attnum > 0
    AND NOT a.attisdropped
) AS pr04_has_station_active \gset
\if :pr04_has_station_active
  SELECT jsonb_build_object(
    'section', 'migration_preflight',
    'check', 'legacy_station_lifecycle_profile',
    'status', 'EVALUATED',
    'active_rows', count(*) FILTER (WHERE activa),
    'inactive_rows', count(*) FILTER (WHERE NOT activa),
    'null_active_rows', count(*) FILTER (WHERE activa IS NULL)
  )::text
  FROM meteo.estacions;
\else
  SELECT jsonb_build_object(
    'section', 'migration_preflight',
    'check', 'legacy_station_lifecycle_profile',
    'status', 'NOT_EVALUATED_COLUMN_ABSENT'
  )::text;
\endif

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'blank_station_codes',
  'violation_rows', count(*) FILTER (WHERE codi IS NULL OR btrim(codi) = ''),
  'pass', count(*) FILTER (WHERE codi IS NULL OR btrim(codi) = '') = 0
)::text
FROM meteo.estacions;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'blank_user_emails',
  'violation_rows', count(*) FILTER (WHERE email IS NULL OR btrim(email) = ''),
  'pass', count(*) FILTER (WHERE email IS NULL OR btrim(email) = '') = 0
)::text
FROM auth.usuaris;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'orphan_meteo_mesures_station',
  'violation_rows', count(*),
  'pass', count(*) = 0
)::text
FROM meteo.mesures AS m
LEFT JOIN meteo.estacions AS e ON e.id = m.estacio_id
WHERE e.id IS NULL;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'orphan_station_memberships',
  'violation_rows', count(*),
  'pass', count(*) = 0
)::text
FROM meteo.membres_estacio AS me
LEFT JOIN meteo.estacions AS e ON e.id = me.estacio_id
LEFT JOIN auth.usuaris AS u ON u.id = me.usuari_id
WHERE e.id IS NULL OR u.id IS NULL;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'orphan_application_memberships',
  'violation_rows', count(*),
  'pass', count(*) = 0
)::text
FROM auth.membres_app AS ma
LEFT JOIN auth.usuaris AS u ON u.id = ma.usuari_id
LEFT JOIN auth.aplicacions AS a ON a.id = ma.app_id
WHERE u.id IS NULL OR a.id IS NULL;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'orphan_hydro_readings',
  'violation_rows', count(*),
  'pass', count(*) = 0
)::text
FROM meteo.lectures_hidro AS l
LEFT JOIN meteo.estacions_hidro AS e ON e.id = l.estacio_id
WHERE e.id IS NULL;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'orphan_forecast_hourly_runs',
  'violation_rows', count(*),
  'pass', count(*) = 0
)::text
FROM meteo.forecast_hourly AS h
LEFT JOIN meteo.forecast_run AS r ON r.id = h.run_id
WHERE r.id IS NULL;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'forecast_run_station_code_without_legacy_station',
  'violation_rows', count(*),
  'pass', count(*) = 0
)::text
FROM meteo.forecast_run AS r
LEFT JOIN meteo.estacions AS e ON e.codi = r.station_code
WHERE e.id IS NULL;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'forecast_hours_out_of_range',
  'violation_rows', count(*) FILTER (WHERE hours NOT BETWEEN 1 AND 48 OR hours IS NULL),
  'pass', count(*) FILTER (WHERE hours NOT BETWEEN 1 AND 48 OR hours IS NULL) = 0
)::text
FROM meteo.forecast_run;

WITH duplicates AS (
  SELECT estacio_id, instant
  FROM meteo.mesures
  GROUP BY estacio_id, instant
  HAVING count(*) > 1
)
SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'duplicate_measure_station_instant',
  'violation_groups', count(*),
  'pass', count(*) = 0
)::text
FROM duplicates;

WITH duplicates AS (
  SELECT estacio_id, instant
  FROM meteo.lectures_hidro
  GROUP BY estacio_id, instant
  HAVING count(*) > 1
)
SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'duplicate_hydro_station_instant',
  'violation_groups', count(*),
  'pass', count(*) = 0
)::text
FROM duplicates;

SELECT jsonb_build_object(
  'section', 'migration_preflight',
  'check', 'postgis_extension_state',
  'installed', EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis'),
  'required_before_geometry_migration', true
)::text;

SELECT jsonb_build_object(
  'section', 'collector_complete',
  'target_database', current_database(),
  'transaction_read_only', current_setting('transaction_read_only'),
  'complete', true
)::text;

ROLLBACK;
\echo PR04_FINGERPRINT_V1_END
PROD01_SQL
