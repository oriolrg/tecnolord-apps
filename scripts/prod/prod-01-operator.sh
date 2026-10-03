#!/usr/bin/env bash
set -Eeuo pipefail

readonly PROD01_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly PROD01_RUNNER_VERSION='4'
readonly PROD01_IMAGE='postgis/postgis:16-3.4'
readonly PROD01_PRODUCTION_DB_CONTAINER='tecnolord-apps-db-1'
readonly PROD01_DUMP="${PROD01_DUMP:-/home/deploy/backups/meteo/meteo-20260925T101137Z.dump}"
readonly PROD01_EXPECTED_DUMP_SHA256='0da4e0402aec92348632b334d41fb88dfe5e286f56f7c5af4b36696daf8a7f8b'
readonly PROD01_RUN_ID="${PROD01_RUN_ID:-$(date -u +%Y%m%d_%H%M%S)}"
readonly PROD01_TARGET="meteo_prod_dryrun_${PROD01_RUN_ID}"
readonly PROD01_CONTAINER="meteolord-prod01-dryrun-${PROD01_RUN_ID}"
readonly PROD01_VOLUME="meteolord_prod01_dryrun_${PROD01_RUN_ID}"
readonly PROD01_OUT="${PROD01_OUT:-${PROD01_ROOT}/artifacts/prod-01/${PROD01_RUN_ID}}"
readonly PROD01_SOCKET_ROOT='/home/deploy/prod01-sockets'
readonly PROD01_SOCKET_DIR="${PROD01_SOCKET_ROOT}/${PROD01_RUN_ID}"
readonly PROD01_SOCKET_FILE="${PROD01_SOCKET_DIR}/.s.PGSQL.5432"
readonly PROD01_DB_USER='meteo'
PROD01_DB_PASSWORD=''
readonly PROD01_EXTERNAL_BACKUP_COPY="${PROD01_EXTERNAL_BACKUP_COPY:-PENDING}"
readonly PROD01_EXTERNAL_BACKUP_REFERENCE="${PROD01_EXTERNAL_BACKUP_REFERENCE:-}"
readonly PROD01_STATUS_FILE="${PROD01_OUT}/RESULT.txt"

source "${PROD01_ROOT}/scripts/prod/prod-01-readiness.sh"
source "${PROD01_ROOT}/scripts/prod/prod-01-runtime.sh"

stage='bootstrap'

on_error() {
  local code=$?
  trap - ERR
  if [[ -d "${PROD01_OUT}" ]]; then
    if docker container inspect "${PROD01_CONTAINER}" >/dev/null 2>&1; then
      docker logs "${PROD01_CONTAINER}" >"${PROD01_OUT}/container.log" 2>&1 || true
    fi
    printf 'FINAL=FAIL\nFAILED_STAGE=%s\nEXIT_CODE=%s\nNO_CLEANUP_PERFORMED=true\n' \
      "${stage}" "${code}" >>"${PROD01_STATUS_FILE}"
  fi
  printf 'PROD-01 OPERATOR FAIL stage=%s exit=%s; no cleanup performed\n' "${stage}" "${code}" >&2
  exit "${code}"
}
trap on_error ERR

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'Required command is missing: %s\n' "$1" >&2
    return 1
  }
}

production_database_inventory() {
  docker exec -i "${PROD01_PRODUCTION_DB_CONTAINER}" sh -eu -c \
    'psql --no-psqlrc --set=ON_ERROR_STOP=1 --tuples-only --no-align --username="$POSTGRES_USER" --dbname=postgres' <<'SQL'
\set QUIET 1
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT current_database() = 'postgres' AS target_ok \gset
\if :target_ok
\else
  \quit 90
\endif
SELECT current_setting('transaction_read_only') = 'on' AS read_only_ok \gset
\if :read_only_ok
\else
  \quit 91
\endif
SELECT datname
FROM pg_database
WHERE datallowconn
  AND datname NOT IN ('template0', 'template1')
ORDER BY datname;
ROLLBACK;
SQL
}

disposable_psql() {
  local database="$1"
  shift
  docker exec -i "${PROD01_CONTAINER}" psql \
    --no-psqlrc \
    --set=ON_ERROR_STOP=1 \
    --username="${PROD01_DB_USER}" \
    --dbname="${database}" \
    "$@"
}

disposable_database_inventory() {
  disposable_psql postgres --tuples-only --no-align <<'SQL'
SELECT datname
FROM pg_database
WHERE datallowconn
  AND datname NOT IN ('template0', 'template1')
ORDER BY datname;
SQL
}

stage='local-prerequisites'
for command in docker node npm sha256sum stat openssl grep awk tee seq cmp sort cat wc; do
  require_command "${command}"
done
PROD01_DB_PASSWORD="$(openssl rand -hex 24)"
readonly PROD01_DB_PASSWORD
[[ "${PROD01_RUN_ID}" =~ ^[0-9]{8}_[0-9]{6}$ ]]
[[ "${PROD01_TARGET}" =~ ^meteo_prod_dryrun_[0-9]{8}_[0-9]{6}$ ]]
prod01_assert_socket_path "${PROD01_SOCKET_FILE}"
[[ ! -e "${PROD01_SOCKET_DIR}" ]]
if [[ -e "${PROD01_SOCKET_ROOT}" ]]; then
  [[ -d "${PROD01_SOCKET_ROOT}" && ! -L "${PROD01_SOCKET_ROOT}" ]]
fi
[[ "${PROD01_EXTERNAL_BACKUP_COPY}" =~ ^(PENDING|PROVEN)$ ]]
if [[ "${PROD01_EXTERNAL_BACKUP_COPY}" == 'PROVEN' ]]; then
  [[ -n "${PROD01_EXTERNAL_BACKUP_REFERENCE}" ]]
else
  [[ -z "${PROD01_EXTERNAL_BACKUP_REFERENCE}" ]]
fi
[[ ! -e "${PROD01_OUT}" ]]
[[ -f "${PROD01_ROOT}/scripts/prod/prod-01.js" ]]
[[ -f "${PROD01_ROOT}/scripts/prod/prod-01-readiness.sh" ]]
[[ -f "${PROD01_ROOT}/scripts/prod/prod-01-runtime.sh" ]]
[[ -f "${PROD01_ROOT}/scripts/prod/prod-01-precutover.sh" ]]
[[ -f "${PROD01_ROOT}/scripts/prod/prod-01-postflight.sql" ]]
[[ -f "${PROD01_ROOT}/docs/sdd/produccio/evidence/PR04-readonly-fingerprint.ndjson" ]]
node -e "require(require.resolve('pg',{paths:[process.argv[1]]}))" "${PROD01_ROOT}/backend"

mkdir -m 0700 -p "${PROD01_OUT}"
printf 'FINAL=RUNNING\nRUN_ID=%s\nTARGET=%s\n' \
  "${PROD01_RUN_ID}" "${PROD01_TARGET}" >"${PROD01_STATUS_FILE}"

stage='production-read-only-inventory'
readonly PROD01_PRODUCTION_CONTAINER_ID="$(docker inspect --format '{{.Id}}' "${PROD01_PRODUCTION_DB_CONTAINER}")"
readonly PROD01_PRODUCTION_MOUNTS_SHA_BEFORE="$(docker inspect --format '{{json .Mounts}}' "${PROD01_PRODUCTION_DB_CONTAINER}" | sha256sum | awk '{print $1}')"
production_database_inventory >"${PROD01_OUT}/production-databases-before.txt"
grep -Fx 'meteo' "${PROD01_OUT}/production-databases-before.txt" >/dev/null
grep -Fx 'meteo_restore_test' "${PROD01_OUT}/production-databases-before.txt" >/dev/null
grep -Fx 'postgres' "${PROD01_OUT}/production-databases-before.txt" >/dev/null
df -h >"${PROD01_OUT}/disk-before.txt"

stage='backup-verification'
[[ -f "${PROD01_DUMP}" ]]
[[ -r "${PROD01_DUMP}" ]]
stat --printf='path=%n\nsize_bytes=%s\nmode=%a\nowner_uid=%u\ngroup_gid=%g\n' \
  "${PROD01_DUMP}" >"${PROD01_OUT}/backup-stat.txt"
sha256sum "${PROD01_DUMP}" >"${PROD01_OUT}/backup.sha256"
readonly PROD01_ACTUAL_DUMP_SHA256="$(awk '{print $1}' "${PROD01_OUT}/backup.sha256")"
[[ "${PROD01_ACTUAL_DUMP_SHA256}" == "${PROD01_EXPECTED_DUMP_SHA256}" ]]

stage='socket-runtime-create'
mkdir -m 0700 -p "${PROD01_SOCKET_ROOT}"
[[ -d "${PROD01_SOCKET_ROOT}" && ! -L "${PROD01_SOCKET_ROOT}" ]]
mkdir -m 1777 "${PROD01_SOCKET_DIR}"
{
  printf 'socket_dir=%s\n' "${PROD01_SOCKET_DIR}"
  printf 'socket_file=%s\n' "${PROD01_SOCKET_FILE}"
  printf 'socket_path_bytes=%s\n' "$(prod01_socket_path_bytes "${PROD01_SOCKET_FILE}")"
  printf 'socket_path_safe_max_bytes=%s\n' "${PROD01_UNIX_SOCKET_PATH_SAFE_MAX_BYTES}"
} >"${PROD01_OUT}/socket-path.txt"

stage='disposable-environment-create'
docker image inspect "${PROD01_IMAGE}" >/dev/null
if docker container inspect "${PROD01_CONTAINER}" >/dev/null 2>&1; then
  printf 'Disposable container already exists: %s\n' "${PROD01_CONTAINER}" >&2
  false
fi
if docker volume inspect "${PROD01_VOLUME}" >/dev/null 2>&1; then
  printf 'Disposable volume already exists: %s\n' "${PROD01_VOLUME}" >&2
  false
fi
docker volume create --label meteolord.prod01=historical-dryrun "${PROD01_VOLUME}" \
  >"${PROD01_OUT}/volume-create.txt"
docker run --detach --pull never \
  --name "${PROD01_CONTAINER}" \
  --hostname "${PROD01_CONTAINER}" \
  --network none \
  --label meteolord.prod01=historical-dryrun \
  --label "meteolord.prod01.run_id=${PROD01_RUN_ID}" \
  --mount "type=volume,source=${PROD01_VOLUME},target=/var/lib/postgresql/data" \
  --mount "type=bind,source=${PROD01_SOCKET_DIR},target=/var/run/postgresql" \
  --mount "type=bind,source=${PROD01_DUMP},target=/pr02/pr02.dump,readonly" \
  --env "POSTGRES_USER=${PROD01_DB_USER}" \
  --env "POSTGRES_PASSWORD=${PROD01_DB_PASSWORD}" \
  --env POSTGRES_DB=postgres \
  "${PROD01_IMAGE}" >"${PROD01_OUT}/container-create.txt"

stage='disposable-postgres-final-readiness'
prod01_wait_for_final_postgres "${PROD01_CONTAINER}" "${PROD01_DB_USER}" \
  2>&1 | tee "${PROD01_OUT}/readiness.log"

stage='disposable-environment-guard'
readonly PROD01_CONTAINER_ID="$(docker inspect --format '{{.Id}}' "${PROD01_CONTAINER}")"
readonly PROD01_IMAGE_ID="$(docker image inspect --format '{{.Id}}' "${PROD01_IMAGE}")"
readonly PROD01_NETWORK_MODE="$(docker inspect --format '{{.HostConfig.NetworkMode}}' "${PROD01_CONTAINER}")"
readonly PROD01_MOUNTS="$(docker inspect --format '{{range .Mounts}}{{println .Type "|" .Name "|" .Source "|" .Destination "|" .RW}}{{end}}' "${PROD01_CONTAINER}")"
[[ "${PROD01_NETWORK_MODE}" == 'none' ]]
grep -F "| ${PROD01_VOLUME} |" <<<"${PROD01_MOUNTS}" >/dev/null
grep -F "| ${PROD01_SOCKET_DIR} | /var/run/postgresql | true" <<<"${PROD01_MOUNTS}" >/dev/null
grep -F "| ${PROD01_DUMP} | /pr02/pr02.dump | false" <<<"${PROD01_MOUNTS}" >/dev/null
if grep -F 'tecnolord-apps_pgdata' <<<"${PROD01_MOUNTS}" >/dev/null; then
  printf 'Production volume detected in disposable container mounts\n' >&2
  false
fi

readonly PROD01_POSTGRES_VERSION="$(disposable_psql postgres --tuples-only --no-align --command='SHOW server_version_num')"
[[ "${PROD01_POSTGRES_VERSION}" == '160004' ]]
readonly PROD01_POSTGIS_AVAILABLE="$(disposable_psql postgres --tuples-only --no-align --command="SELECT default_version FROM pg_available_extensions WHERE name='postgis'")"
[[ -n "${PROD01_POSTGIS_AVAILABLE}" ]]
disposable_database_inventory >"${PROD01_OUT}/disposable-databases-before.txt"
for forbidden in meteo meteo_restore_test meteo_beta; do
  if grep -Fx "${forbidden}" "${PROD01_OUT}/disposable-databases-before.txt" >/dev/null; then
    printf 'Forbidden database exists in disposable server: %s\n' "${forbidden}" >&2
    false
  fi
done
if grep -E '^meteo_prod_dryrun_' "${PROD01_OUT}/disposable-databases-before.txt" >/dev/null; then
  printf 'A previous PROD-01 target exists in the new disposable server\n' >&2
  false
fi

docker exec "${PROD01_CONTAINER}" pg_restore --list /pr02/pr02.dump \
  >"${PROD01_OUT}/backup-toc.txt" 2>"${PROD01_OUT}/backup-toc.stderr.txt"
[[ -s "${PROD01_OUT}/backup-toc.txt" ]]

{
  printf 'runner_version=%s\n' "${PROD01_RUNNER_VERSION}"
  printf 'run_id=%s\n' "${PROD01_RUN_ID}"
  printf 'target=%s\n' "${PROD01_TARGET}"
  printf 'container=%s\n' "${PROD01_CONTAINER}"
  printf 'container_id=%s\n' "${PROD01_CONTAINER_ID}"
  printf 'image=%s\n' "${PROD01_IMAGE}"
  printf 'image_id=%s\n' "${PROD01_IMAGE_ID}"
  printf 'postgres_server_version_num=%s\n' "${PROD01_POSTGRES_VERSION}"
  printf 'postgis_available_version=%s\n' "${PROD01_POSTGIS_AVAILABLE}"
  printf 'network=%s\n' "${PROD01_NETWORK_MODE}"
  printf 'volume=%s\n' "${PROD01_VOLUME}"
  printf 'socket_dir=%s\n' "${PROD01_SOCKET_DIR}"
  printf 'socket_file=%s\n' "${PROD01_SOCKET_FILE}"
  printf 'socket_path_bytes=%s\n' "$(prod01_socket_path_bytes "${PROD01_SOCKET_FILE}")"
  printf 'socket_path_safe_max_bytes=%s\n' "${PROD01_UNIX_SOCKET_PATH_SAFE_MAX_BYTES}"
  printf 'mounts_begin\n%s\nmounts_end\n' "${PROD01_MOUNTS}"
  printf 'external_backup_copy=%s\n' "${PROD01_EXTERNAL_BACKUP_COPY}"
  if [[ "${PROD01_EXTERNAL_BACKUP_COPY}" == 'PROVEN' ]]; then
    printf 'external_backup_reference=%s\n' "${PROD01_EXTERNAL_BACKUP_REFERENCE}"
  fi
} >"${PROD01_OUT}/environment.txt"

sha256sum \
  "${PROD01_ROOT}/scripts/prod/prod-01-operator.sh" \
  "${PROD01_ROOT}/scripts/prod/prod-01-operator.test.js" \
  "${PROD01_ROOT}/scripts/prod/prod-01-readiness.sh" \
  "${PROD01_ROOT}/scripts/prod/prod-01-runtime.sh" \
  "${PROD01_ROOT}/scripts/prod/prod-01.js" \
  "${PROD01_ROOT}/scripts/prod/prod-01-precutover.sh" \
  "${PROD01_ROOT}/scripts/prod/prod-01-precutover-collector.sh" \
  "${PROD01_ROOT}/scripts/prod/prod-01-precutover.js" \
  "${PROD01_ROOT}/scripts/prod/prod-01-postflight.sql" \
  "${PROD01_ROOT}/docs/sdd/produccio/evidence/PR04-readonly-fingerprint.ndjson" \
  >"${PROD01_OUT}/source-sha256.txt"

stage='target-create'
if disposable_psql postgres --tuples-only --no-align --variable=target="${PROD01_TARGET}" <<'SQL' | grep -Fx '1' >/dev/null; then
SELECT count(*) FROM pg_database WHERE datname = :'target';
SQL
  printf 'Target already exists: %s\n' "${PROD01_TARGET}" >&2
  false
fi
docker exec "${PROD01_CONTAINER}" createdb \
  --username="${PROD01_DB_USER}" \
  --template=template0 \
  --encoding=UTF8 \
  --lc-collate=en_US.utf8 \
  --lc-ctype=en_US.utf8 \
  "${PROD01_TARGET}"

stage='restore'
docker exec "${PROD01_CONTAINER}" pg_restore \
  --username="${PROD01_DB_USER}" \
  --dbname="${PROD01_TARGET}" \
  --no-owner \
  --no-acl \
  --exit-on-error \
  --single-transaction \
  /pr02/pr02.dump 2>&1 | tee "${PROD01_OUT}/restore.log"

stage='pre-cutover'
TARGET_DB="${PROD01_TARGET}" \
PROD01_PG_CONTAINER="${PROD01_CONTAINER}" \
PROD01_PG_USER="${PROD01_DB_USER}" \
PROD01_EVIDENCE_DIR="${PROD01_OUT}" \
  "${PROD01_ROOT}/scripts/prod/prod-01-precutover.sh" \
  2>&1 | tee "${PROD01_OUT}/pre-cutover.log"

stage='apply'
mkdir -m 0700 "${PROD01_OUT}/apply"
POSTGRES_HOST="${PROD01_SOCKET_DIR}" \
POSTGRES_PORT=5432 \
POSTGRES_USER="${PROD01_DB_USER}" \
POSTGRES_PASSWORD="${PROD01_DB_PASSWORD}" \
TARGET_DB="${PROD01_TARGET}" \
  node "${PROD01_ROOT}/scripts/prod/prod-01.js" \
    --apply \
    --out-dir "${PROD01_OUT}/apply" \
    2>&1 | tee "${PROD01_OUT}/apply.log"

stage='verify'
mkdir -m 0700 "${PROD01_OUT}/verify"
POSTGRES_HOST="${PROD01_SOCKET_DIR}" \
POSTGRES_PORT=5432 \
POSTGRES_USER="${PROD01_DB_USER}" \
POSTGRES_PASSWORD="${PROD01_DB_PASSWORD}" \
TARGET_DB="${PROD01_TARGET}" \
  node "${PROD01_ROOT}/scripts/prod/prod-01.js" \
    --verify \
    --pre "${PROD01_OUT}/apply/PRE.json" \
    --out-dir "${PROD01_OUT}/verify" \
    2>&1 | tee "${PROD01_OUT}/verify.log"

stage='postflight'
docker exec -i "${PROD01_CONTAINER}" psql \
  --no-psqlrc \
  --set=ON_ERROR_STOP=1 \
  --set=VERBOSITY=terse \
  --username="${PROD01_DB_USER}" \
  --dbname="${PROD01_TARGET}" \
  --variable=expected_target="${PROD01_TARGET}" \
  <"${PROD01_ROOT}/scripts/prod/prod-01-postflight.sql" \
  >"${PROD01_OUT}/postflight.txt" 2>&1
grep -Fx 'PROD01_POSTFLIGHT_V1_PASS' "${PROD01_OUT}/postflight.txt" >/dev/null
sha256sum \
  "${PROD01_OUT}/apply/PRE.json" \
  "${PROD01_OUT}/apply/POST.json" \
  "${PROD01_OUT}/verify/VERIFY.json" \
  >"${PROD01_OUT}/manifest-sha256.txt"

stage='directed-unit-http-security-tests'
{
  printf '## PROD-01 directed\n'
  node --test \
    "${PROD01_ROOT}/scripts/prod/prod-01.test.js" \
    "${PROD01_ROOT}/scripts/prod/prod-01-precutover.test.js" \
    "${PROD01_ROOT}/scripts/prod/prod-01-operator.test.js"
  printf '\n## unit\n'
  npm --prefix "${PROD01_ROOT}/backend" run test:unit
  printf '\n## HTTP\n'
  npm --prefix "${PROD01_ROOT}/backend" run test:http
  printf '\n## security\n'
  npm --prefix "${PROD01_ROOT}/backend" run test:security
} 2>&1 | tee "${PROD01_OUT}/test-summary.txt"

stage='final-safety-gate'
disposable_database_inventory >"${PROD01_OUT}/disposable-databases-after.txt"
prod01_assert_database_delta \
  "${PROD01_OUT}/disposable-databases-before.txt" \
  "${PROD01_OUT}/disposable-databases-after.txt" \
  "${PROD01_TARGET}"

production_database_inventory >"${PROD01_OUT}/production-databases-after.txt"
cmp "${PROD01_OUT}/production-databases-before.txt" "${PROD01_OUT}/production-databases-after.txt"
readonly PROD01_PRODUCTION_CONTAINER_ID_AFTER="$(docker inspect --format '{{.Id}}' "${PROD01_PRODUCTION_DB_CONTAINER}")"
readonly PROD01_PRODUCTION_MOUNTS_SHA_AFTER="$(docker inspect --format '{{json .Mounts}}' "${PROD01_PRODUCTION_DB_CONTAINER}" | sha256sum | awk '{print $1}')"
[[ "${PROD01_PRODUCTION_CONTAINER_ID_AFTER}" == "${PROD01_PRODUCTION_CONTAINER_ID}" ]]
[[ "${PROD01_PRODUCTION_MOUNTS_SHA_AFTER}" == "${PROD01_PRODUCTION_MOUNTS_SHA_BEFORE}" ]]
docker logs "${PROD01_CONTAINER}" >"${PROD01_OUT}/container.log" 2>&1

{
  printf 'production_database_inventory_unchanged=true\n'
  printf 'production_container_id_unchanged=true\n'
  printf 'production_mounts_sha256_unchanged=true\n'
  printf 'production_database_connected_for_inventory=postgres_only\n'
  printf 'production_target_database_connections=0\n'
  printf 'production_cleanup_commands=0\n'
} >"${PROD01_OUT}/PRODUCTION-SAFETY.txt"

sha256sum \
  "${PROD01_OUT}/backup.sha256" \
  "${PROD01_OUT}/backup-stat.txt" \
  "${PROD01_OUT}/backup-toc.txt" \
  "${PROD01_OUT}/environment.txt" \
  "${PROD01_OUT}/source-sha256.txt" \
  "${PROD01_OUT}/restore.log" \
  "${PROD01_OUT}/readiness.log" \
  "${PROD01_OUT}/socket-path.txt" \
  "${PROD01_OUT}/pre-cutover.log" \
  "${PROD01_OUT}/PRE-CUTOVER.json" \
  "${PROD01_OUT}/apply.log" \
  "${PROD01_OUT}/apply/PRE.json" \
  "${PROD01_OUT}/apply/POST.json" \
  "${PROD01_OUT}/verify.log" \
  "${PROD01_OUT}/verify/VERIFY.json" \
  "${PROD01_OUT}/postflight.txt" \
  "${PROD01_OUT}/manifest-sha256.txt" \
  "${PROD01_OUT}/test-summary.txt" \
  "${PROD01_OUT}/disposable-databases-before.txt" \
  "${PROD01_OUT}/disposable-databases-after.txt" \
  "${PROD01_OUT}/production-databases-before.txt" \
  "${PROD01_OUT}/production-databases-after.txt" \
  "${PROD01_OUT}/PRODUCTION-SAFETY.txt" \
  >"${PROD01_OUT}/EVIDENCE-SHA256SUMS.txt"

stage='complete'
cat >>"${PROD01_STATUS_FILE}" <<'RESULT'
RESTORE=PASS
PRE_CUTOVER=PASS
APPLY=PASS
VERIFY=PASS
POSTFLIGHT=PASS
TESTS=PASS
NO_CLEANUP_PERFORMED=true
FINAL=PASS
RESULT
trap - ERR
printf 'PROD-01 HISTORICAL PHYSICAL DRY-RUN PASS\n'
printf 'evidence=%s\ncontainer=%s\nvolume=%s\ntarget=%s\n' \
  "${PROD01_OUT}" "${PROD01_CONTAINER}" "${PROD01_VOLUME}" "${PROD01_TARGET}"
