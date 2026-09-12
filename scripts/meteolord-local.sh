#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)" || exit "$?"
readonly SCRIPT_DIR
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd -P)" || exit "$?"
readonly PROJECT_ROOT
readonly COMPOSE_FILE="${PROJECT_ROOT}/compose.meteolord-local.yml"

log() {
  printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"
}

die() {
  log "ERROR: $1" >&2
  exit 64
}

current_commit() {
  local commit
  commit="$(git -C "${PROJECT_ROOT}" rev-parse --verify HEAD 2>/dev/null)" ||
    die 'cannot resolve the repository commit'
  [[ "${commit}" =~ ^[0-9a-f]{40}$ ]] || die 'repository commit has an invalid format'
  printf '%s\n' "${commit}"
}

run_id() {
  local commit="$1"
  local candidate="${2:-}"
  local compact

  if [[ -z "${candidate}" ]]; then
    candidate="$(date '+%Y%m%d-%H%M%S')-${commit:0:7}"
  fi

  [[ "${candidate}" =~ ^[0-9]{8}-[0-9]{6}-[0-9a-f]{7}$ ]] ||
    die 'run-id must match YYYYMMDD-HHmmss-<7 lowercase hex characters>'
  [[ "${candidate:16:7}" == "${commit:0:7}" ]] ||
    die 'run-id commit suffix does not match the current commit'

  compact="${candidate//-/}"
  [[ "${compact}" =~ ^[a-z0-9]{8,32}$ ]] ||
    die 'compact run-id must contain 8-32 lowercase alphanumeric characters'

  printf '%s\n' "${candidate}"
}

COMMIT="$(current_commit)" || exit "$?"
readonly COMMIT
RUN_ID="$(run_id "${COMMIT}" "${METEOLORD_RUN_ID:-}")" || exit "$?"
readonly RUN_ID
readonly COMPACT_RUN_ID="${RUN_ID//-/}"
readonly EXPECTED_PROJECT_DEV='meteolord-local'
readonly EXPECTED_PROJECT_TEST="meteolord-test-${RUN_ID}"

if [[ -v METEOLORD_PROJECT_DEV ]]; then
  [[ -n "${METEOLORD_PROJECT_DEV}" ]] || die 'development project identifier must not be empty'
else
  METEOLORD_PROJECT_DEV="${EXPECTED_PROJECT_DEV}"
fi

if [[ -v METEOLORD_PROJECT_TEST ]]; then
  [[ -n "${METEOLORD_PROJECT_TEST}" ]] || die 'test project identifier must not be empty'
else
  METEOLORD_PROJECT_TEST="${EXPECTED_PROJECT_TEST}"
fi

if [[ -v PROJECT ]]; then
  [[ -n "${PROJECT}" ]] || die 'selected project identifier must not be empty'
else
  PROJECT="${METEOLORD_PROJECT_DEV}"
fi

readonly METEOLORD_PROJECT_DEV
readonly METEOLORD_PROJECT_TEST
readonly PROJECT
readonly EVIDENCE_DIR="${PROJECT_ROOT}/artifacts/phase-a/${COMMIT}/${RUN_ID}"
readonly REPORT_SCRIPT="${PROJECT_ROOT}/backend/scripts/phase-a-report.js"
readonly REPORT_INPUT="${EVIDENCE_DIR}/report-input.json"
readonly REPORT_OUTPUT="${EVIDENCE_DIR}/report.json"

GATE_ACTIVE=false
GATE_PROJECT=''
GATE_DB_NAME=''
GATE_OVERRIDE=''
GATE_CONTROL_DIR=''
GATE_RUN_LOG=''
GATE_REPORT_OUTPUT=''
GATE_BACKEND_IMAGE=''
GATE_E2E_IMAGE=''
CLEANUP_PROJECT="${PROJECT}"
declare -a GATE_CONTROL_NAMES=(
  'config-check'
  'deps-check'
  'static-check'
  'topology-check'
  'test-db-create'
  'migrate --target test'
  'fixtures --target test'
  'backend-check'
  'frontend-check'
  'health-check'
  'health-db-down-check'
  'tasks-check'
  'idempotency-check'
  'egress-check'
  'secrets-check'
  'defect-01-characterization'
  'frontend-regression'
  'test-cleanup'
  'report'
)
declare -a GATE_STATUS=()
declare -a GATE_EXIT_CODE=()
declare -a GATE_ARTIFACT=()
declare -a GATE_DURATION_MS=()

guard_paths() {
  local resolved_evidence

  [[ -n "${PROJECT_ROOT}" && "${PROJECT_ROOT}" == /* ]] ||
    die 'project root must be a non-empty absolute path'
  [[ -d "${PROJECT_ROOT}/backend" && -d "${PROJECT_ROOT}/site" ]] ||
    die 'project root does not contain the expected MeteoLord directories'
  [[ "${SCRIPT_DIR}" == "${PROJECT_ROOT}/scripts" ]] ||
    die 'script directory is outside the expected project root'
  [[ "${COMPOSE_FILE}" == "${PROJECT_ROOT}/compose.meteolord-local.yml" ]] ||
    die 'Compose path is not the expected literal project path'
  [[ ! -L "${COMPOSE_FILE}" ]] ||
    die 'Compose path must not be a symbolic link'
  [[ "${REPORT_SCRIPT}" == "${PROJECT_ROOT}/backend/scripts/phase-a-report.js" ]] ||
    die 'report script path is not the expected literal project path'
  [[ "${EVIDENCE_DIR}" == "${PROJECT_ROOT}/artifacts/phase-a/${COMMIT}/${RUN_ID}" ]] ||
    die 'evidence path is outside the expected run directory'
  if [[ -e "${EVIDENCE_DIR}" ]]; then
    [[ -d "${EVIDENCE_DIR}" && ! -L "${EVIDENCE_DIR}" ]] ||
      die 'evidence path must be a real directory'
    resolved_evidence="$(cd -- "${EVIDENCE_DIR}" && pwd -P)" ||
      die 'cannot resolve the evidence directory'
    [[ "${resolved_evidence}" == "${EVIDENCE_DIR}" ]] ||
      die 'evidence directory resolves outside the expected path'
  fi
}

guard_project() {
  local project="${1:-}"

  [[ -n "${project}" ]] || die 'project identifier must not be empty'
  [[ "${METEOLORD_PROJECT_DEV}" == "${EXPECTED_PROJECT_DEV}" ]] ||
    die 'development project identifier override rejected'
  [[ "${METEOLORD_PROJECT_TEST}" == "${EXPECTED_PROJECT_TEST}" ]] ||
    die 'test project identifier override rejected'

  if [[ "${project}" == "${EXPECTED_PROJECT_DEV}" ]]; then
    return 0
  fi

  if [[ "${project}" == "${EXPECTED_PROJECT_TEST}" ]]; then
    [[ "${COMPACT_RUN_ID}" =~ ^[a-z0-9]{8,32}$ ]] ||
      die 'test project run token is invalid'
    return 0
  fi

  die 'project identifier is outside the MeteoLord allowlist'
}

inventory_commands() {
  local project="$1"

  docker compose --project-name "${project}" --file "${COMPOSE_FILE}" \
    ps --all --format json || return 70
  docker network ls --filter "label=com.docker.compose.project=${project}" || return 70
  docker volume ls --filter "label=com.docker.compose.project=${project}" || return 70
}

inventory() {
  local project="${1:-}"
  local inventory_file

  guard_paths
  guard_project "${project}"
  [[ -f "${COMPOSE_FILE}" ]] || die 'expected local Compose file does not exist'

  log "Inventory for guarded project ${project}"
  if [[ -d "${EVIDENCE_DIR}" ]]; then
    inventory_file="${EVIDENCE_DIR}/docker-inventory-${project}.txt"
    [[ ! -L "${inventory_file}" ]] || die 'inventory evidence target must not be a symbolic link'
    umask 077
    inventory_commands "${project}" >"${inventory_file}" || return 70
    cat -- "${inventory_file}"
  else
    inventory_commands "${project}" || return 70
  fi
}

cleanup() {
  local project="${1:-}"

  guard_paths
  guard_project "${project}"
  [[ -f "${COMPOSE_FILE}" ]] || die 'expected local Compose file does not exist'

  inventory "${project}" || {
    log 'Cleanup blocked because the resource inventory failed' >&2
    return 70
  }

  guard_project "${project}"
  log "Cleaning guarded project ${project}"
  docker compose --project-name "${project}" --file "${COMPOSE_FILE}" \
    down --volumes --remove-orphans
}

report() {
  guard_paths
  guard_project "${PROJECT}"
  [[ -f "${REPORT_SCRIPT}" && ! -L "${REPORT_SCRIPT}" ]] ||
    die 'phase A report script is missing or unsafe'

  if [[ ! -e "${EVIDENCE_DIR}" ]]; then
    umask 077
    mkdir -p -- "${EVIDENCE_DIR}"
    chmod 0755 -- "${EVIDENCE_DIR}"
  fi
  guard_paths
  [[ -f "${REPORT_INPUT}" && ! -L "${REPORT_INPUT}" ]] ||
    die 'report-input.json is missing or unsafe'
  [[ ! -L "${REPORT_OUTPUT}" ]] || die 'report output must not be a symbolic link'

  node "${REPORT_SCRIPT}" \
    --commit "${COMMIT}" \
    --run-id "${RUN_ID}" \
    --evidence-root "${EVIDENCE_DIR}" \
    --input "${REPORT_INPUT}" \
    --output "${REPORT_OUTPUT}"
}

gate_log() {
  local line
  line="$(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"
  printf '%s\n' "${line}"
  if [[ -n "${GATE_RUN_LOG}" && -f "${GATE_RUN_LOG}" ]]; then
    printf '%s\n' "${line}" >>"${GATE_RUN_LOG}"
  fi
}

safe_version() {
  local value="${1:-}"
  [[ "${value}" =~ ^[A-Za-z0-9][A-Za-z0-9.+_-]{0,63}$ ]] || return 1
  printf '%s\n' "${value}"
}

create_gate_override() {
  {
    printf '%s\n' \
      'services:' \
      '  db:' \
      '    environment:' \
      '      POSTGRES_DB: "${T22_DB_NAME:?required}"' \
      '      POSTGRES_PASSWORD: "${T22_DB_PASSWORD:?required}"' \
      '  backend:' \
      '    working_dir: /workspace/backend' \
      '    command: ["node", "server.js"]' \
      '    environment:' \
      '      NODE_PATH: /app/node_modules' \
      '      METEOLORD_ENV: test' \
      '      METEOLORD_PROVIDER_MODE: synthetic' \
      '      METEOLORD_ALLOW_SYNTHETIC: "true"' \
      '      METEOLORD_EXTERNAL_NETWORK: deny' \
      '      POSTGRES_HOST: db' \
      '      POSTGRES_PORT: "5432"' \
      '      POSTGRES_DB: "${T22_DB_NAME:?required}"' \
      '      POSTGRES_USER: meteolord' \
      '      POSTGRES_PASSWORD: "${T22_DB_PASSWORD:?required}"' \
      '    ports: !reset []' \
      '    volumes:' \
      '      - type: bind' \
      '        source: "${T22_PROJECT_ROOT:?required}/backend"' \
      '        target: /workspace/backend' \
      '        read_only: true' \
      '      - type: bind' \
      '        source: "${T22_PROJECT_ROOT:?required}/site"' \
      '        target: /workspace/site' \
      '        read_only: true'
  } >"${GATE_OVERRIDE}"
  chmod 0600 -- "${GATE_OVERRIDE}"
}

gate_initialize() {
  local index

  GATE_PROJECT="${EXPECTED_PROJECT_TEST}"
  GATE_DB_NAME="meteolord_test_${COMPACT_RUN_ID}"
  guard_project "${GATE_PROJECT}"
  [[ "${GATE_DB_NAME}" =~ ^meteolord_test_[a-z0-9]{8,32}$ ]] ||
    die 'derived gate database identifier is invalid'
  [[ ! -e "${EVIDENCE_DIR}" ]] || die 'gate run-id already exists'
  if [[ -n "${METEOLORD_GATE_FAIL_AT:-}" ]]; then
    [[ "${METEOLORD_GATE_FAIL_AT}" =~ ^([1-9]|1[0-9])$ ]] ||
      die 'METEOLORD_GATE_FAIL_AT must identify control 1 through 19'
  fi
  if [[ -n "${METEOLORD_E2E_IMAGE:-}" ]]; then
    [[ "${METEOLORD_E2E_IMAGE}" =~ ^meteolord-e2e:t20-[0-9a-f]{7}$ ]] ||
      die 'E2E image override is outside the allowlist'
    GATE_E2E_IMAGE="${METEOLORD_E2E_IMAGE}"
  fi

  umask 077
  mkdir -p -- "${EVIDENCE_DIR}/controls"
  chmod 0700 -- "${EVIDENCE_DIR}" "${EVIDENCE_DIR}/controls"
  GATE_CONTROL_DIR="${EVIDENCE_DIR}/controls"
  GATE_OVERRIDE="${EVIDENCE_DIR}/compose.gate.override.yml"
  GATE_RUN_LOG="${EVIDENCE_DIR}/gate-run.txt"
  GATE_REPORT_OUTPUT="${EVIDENCE_DIR}/gate-report.json"
  : >"${GATE_RUN_LOG}"
  chmod 0600 -- "${GATE_RUN_LOG}"

  T22_PROJECT_ROOT="${PROJECT_ROOT}"
  T22_DB_NAME="${GATE_DB_NAME}"
  T22_DB_PASSWORD='local_synthetic_123'
  export T22_PROJECT_ROOT T22_DB_NAME T22_DB_PASSWORD
  create_gate_override

  for ((index = 0; index < 19; index += 1)); do
    GATE_STATUS[index]='NOT_RUN'
    GATE_EXIT_CODE[index]='null'
    GATE_ARTIFACT[index]='null'
    GATE_DURATION_MS[index]=0
  done

  CLEANUP_PROJECT="${GATE_PROJECT}"
  CLEANUP_ARMED=true
  GATE_ACTIVE=true
  {
    printf 'commit=%s\n' "${COMMIT}"
    printf 'run_id=%s\n' "${RUN_ID}"
    printf 'project=%s\n' "${GATE_PROJECT}"
    printf 'database=%s\n' "${GATE_DB_NAME}"
    printf 'pull=never\n'
    printf 'build=disabled\n'
  } >"${EVIDENCE_DIR}/gate-state.txt"
  chmod 0600 -- "${EVIDENCE_DIR}/gate-state.txt"
}

compose_gate() {
  docker compose \
    --project-name "${GATE_PROJECT}" \
    --file "${COMPOSE_FILE}" \
    --file "${GATE_OVERRIDE}" \
    "$@"
}

run_node_isolated() {
  [[ -n "${GATE_BACKEND_IMAGE}" ]] || return 65
  docker run --pull never --rm --network none \
    --volume "${PROJECT_ROOT}/backend:/workspace/backend:ro" \
    --volume "${PROJECT_ROOT}/site:/workspace/site:ro" \
    --workdir /workspace/backend \
    --env NODE_PATH=/app/node_modules \
    --entrypoint node \
    "${GATE_BACKEND_IMAGE}" "$@"
}

run_node_with_db() {
  [[ -n "${GATE_BACKEND_IMAGE}" ]] || return 65
  docker run --pull never --rm --network "${GATE_PROJECT}_meteolord_core" \
    --volume "${PROJECT_ROOT}/backend:/workspace/backend:ro" \
    --volume "${PROJECT_ROOT}/site:/workspace/site:ro" \
    --workdir /workspace/backend \
    --env NODE_PATH=/app/node_modules \
    --env METEOLORD_ENV=test \
    --env METEOLORD_PROVIDER_MODE=synthetic \
    --env METEOLORD_ALLOW_SYNTHETIC=true \
    --env METEOLORD_EXTERNAL_NETWORK=deny \
    --env POSTGRES_HOST=db \
    --env POSTGRES_PORT=5432 \
    --env POSTGRES_DB="${GATE_DB_NAME}" \
    --env POSTGRES_USER=meteolord \
    --env POSTGRES_PASSWORD="${T22_DB_PASSWORD}" \
    --entrypoint node \
    "${GATE_BACKEND_IMAGE}" "$@"
}

control_config_check() {
  env -i \
    PATH="${PATH}" \
    METEOLORD_ENV=local \
    METEOLORD_PROVIDER_MODE=synthetic \
    METEOLORD_ALLOW_SYNTHETIC=true \
    METEOLORD_EXTERNAL_NETWORK=deny \
    DB_HOST=db \
    DB_PORT=5432 \
    DB_NAME=meteolord_local \
    DB_USER=meteolord \
    DB_PASSWORD=local_synthetic_123 \
    INGEST_API_KEY=local-synthetic-key-2026 \
    node "${PROJECT_ROOT}/backend/scripts/validate-local-config.js"
}

control_deps_check() {
  local images
  local -a candidates=()

  command -v node >/dev/null || return 65
  command -v npm >/dev/null || return 65
  command -v docker >/dev/null || return 65
  command -v curl >/dev/null || return 65
  docker compose version || return 65
  images="$(docker compose --file "${COMPOSE_FILE}" config --images)" || return 65
  GATE_BACKEND_IMAGE="$(printf '%s\n' "${images}" | awk '/^sha256:[0-9a-f]{64}$/{print; exit}')"
  [[ "${GATE_BACKEND_IMAGE}" =~ ^sha256:[0-9a-f]{64}$ ]] || return 65
  docker image inspect "${GATE_BACKEND_IMAGE}" \
    --format 'backend={{.Id}} os={{.Os}} architecture={{.Architecture}}' || return 65
  printf '%s\n' "${images}" | while IFS= read -r image; do
    [[ -n "${image}" ]] || continue
    docker image inspect "${image}" --format 'dependency={{.Id}}' >/dev/null || exit 65
  done || return 65

  if [[ -z "${GATE_E2E_IMAGE}" ]]; then
    mapfile -t candidates < <(
      docker image ls --format '{{.Repository}}:{{.Tag}}' |
        awk '/^meteolord-e2e:t20-[0-9a-f]{7}$/' | sort -u
    )
    [[ "${#candidates[@]}" -eq 1 ]] || return 65
    GATE_E2E_IMAGE="${candidates[0]}"
  fi
  docker image inspect "${GATE_E2E_IMAGE}" \
    --format 'e2e={{.Id}} os={{.Os}} architecture={{.Architecture}}' || return 65
}

control_static_check() {
  local file

  while IFS= read -r -d '' file; do
    node --check "${file}"
  done < <(find "${PROJECT_ROOT}/backend" -path '*/node_modules' -prune -o -type f -name '*.js' -print0)
  while IFS= read -r -d '' file; do
    node --input-type=module --check <"${file}"
  done < <(find "${PROJECT_ROOT}/site/src" -type f -name '*.js' -print0)
  while IFS= read -r -d '' file; do
    bash -n "${file}"
  done < <(find "${PROJECT_ROOT}/scripts" -type f -name '*.sh' -print0)
  node -e 'const fs=require("node:fs"); for(const file of process.argv.slice(1)) JSON.parse(fs.readFileSync(file,"utf8"));' \
    "${PROJECT_ROOT}/backend/package.json" \
    "${PROJECT_ROOT}/backend/package-lock.json" \
    "${PROJECT_ROOT}/backend/test/fixtures/manifest.json" \
    "${PROJECT_ROOT}/backend/test/fixtures/meteo.json" \
    "${PROJECT_ROOT}/backend/test/fixtures/hidro.json" \
    "${PROJECT_ROOT}/backend/test/fixtures/forecast.json" \
    "${PROJECT_ROOT}/backend/test/fixtures/provider-scenarios.json"
  [[ -s "${PROJECT_ROOT}/backend/db/migrations/0001-current-runtime.sql" ]]
  [[ -s "${PROJECT_ROOT}/backend/db/migrations/0002-current-forecast.sql" ]]
  compose_gate config --quiet
  printf 'static_validation=PASS\n'
}

control_topology_check() {
  docker compose --file "${COMPOSE_FILE}" config --format json | node -e '
    let source="";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => { source += chunk; });
    process.stdin.on("end", () => {
      const config=JSON.parse(source);
      const names=Object.keys(config.services || {}).sort();
      if (JSON.stringify(names)!==JSON.stringify(["backend","db"])) process.exit(1);
      if ((config.services.db.ports || []).length!==0) process.exit(1);
      const ports=config.services.backend.ports || [];
      if (ports.length!==1 || ports[0].host_ip!=="127.0.0.1"
          || Number(ports[0].published)!==8088 || Number(ports[0].target)!==8080) process.exit(1);
      const networks=Object.keys(config.networks || {});
      if (networks.length!==1 || config.networks[networks[0]].external===true) process.exit(1);
      if (config.services.backend.pull_policy!=="never") process.exit(1);
      process.stdout.write("services=backend,db\\ndb_published_ports=0\\nbackend_bind=127.0.0.1:8088:8080\\nexternal_networks=0\\n");
    });'
  compose_gate config --format json | node -e '
    let source="";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => { source += chunk; });
    process.stdin.on("end", () => {
      const config=JSON.parse(source);
      if ((config.services.backend.ports || []).length!==0) process.exit(1);
      process.stdout.write("gate_published_ports=0\\n");
    });'
}

control_test_db_create() {
  compose_gate up -d --wait --pull never --no-build db
  compose_gate exec -T db \
    psql -U meteolord -d "${GATE_DB_NAME}" -Atc 'SELECT current_database()'
}

control_migrate() {
  run_node_with_db db/migrate.js
}

control_fixtures() {
  run_node_with_db scripts/load-local-fixtures.js
}

control_backend_check() {
  compose_gate up -d --wait --pull never --no-build backend
  compose_gate exec -T backend node -e '
    fetch("http://localhost:8080/api/ping")
      .then(async response => {
        const body=await response.json();
        if (response.status!==200 || body.ok!==true) process.exit(1);
        console.log("api_ping=PASS");
      })
      .catch(() => process.exit(1));'
}

control_frontend_check() {
  compose_gate exec -T backend node -e '
    Promise.all([
      fetch("http://localhost:8080/meteo/").then(async response => [response, await response.text()]),
      fetch("http://localhost:8080/meteo/runtime-config.js").then(async response => [response, await response.text()]),
    ]).then(([[page, html], [runtime, config]]) => {
      if (!page.ok || !html.includes("id=\"app\"")) process.exit(1);
      if (!runtime.ok || !config.includes("ENVIRONMENT: '\''local'\''")) process.exit(1);
      console.log("frontend_static=PASS");
      console.log("runtime_config=PASS");
    }).catch(() => process.exit(1));'
}

control_health_check() {
  compose_gate exec -T backend node -e '
    fetch("http://localhost:8080/health")
      .then(async response => {
        const body=await response.json();
        if (response.status!==200 || body.ok!==true) process.exit(1);
        console.log("health_with_db=200");
      })
      .catch(() => process.exit(1));'
}

wait_http_status() {
  local expected="$1"
  local path="$2"
  local attempts="${3:-20}"
  local status=''
  local attempt

  for ((attempt = 0; attempt < attempts; attempt += 1)); do
    status="$(compose_gate exec -T backend node -e '
      fetch(`http://localhost:8080${process.argv[1]}`)
        .then(response => process.stdout.write(String(response.status)))
        .catch(() => process.stdout.write("000"));' "${path}" 2>/dev/null || true)"
    if [[ "${status}" == "${expected}" ]]; then
      printf '%s=%s\n' "${path}" "${status}"
      return 0
    fi
    sleep 1
  done
  return 1
}

control_health_db_down_check() {
  compose_gate stop db
  wait_http_status 503 /health 20
  wait_http_status 200 /api/ping 5
  compose_gate up -d --wait --pull never --no-build db
  wait_http_status 200 /health 30
}

control_tasks_check() {
  run_node_with_db scripts/run-local-task.js ecowitt
  run_node_with_db scripts/run-local-task.js aca
  run_node_with_db scripts/run-local-task.js ecowitt-aca
  run_node_with_db scripts/run-local-task.js previ
}

control_idempotency_check() {
  run_node_with_db db/migrate.js
  run_node_with_db scripts/load-local-fixtures.js
  compose_gate exec -T db psql -U meteolord -d "${GATE_DB_NAME}" -Atc \
    "SELECT 'schema_migrations=' || count(*) FROM meteo_local.schema_migrations"
}

control_egress_check() {
  run_node_isolated --test \
    test/unit/providers.test.js \
    test/security/logs-egress.test.js
}

control_secrets_check() {
  if git -C "${PROJECT_ROOT}" ls-files --error-unmatch \
      config/meteolord/local.env config/meteolord/local.secrets.env >/dev/null 2>&1; then
    return 1
  fi
  git -C "${PROJECT_ROOT}" check-ignore --quiet artifacts/phase-a/probe
  if find "${EVIDENCE_DIR}" -type f \( -name '*.env' -o -name '*.dump' -o -name '*.sql' \) -print -quit |
      grep -q .; then
    return 1
  fi
  printf 'tracked_local_configuration=0\nforbidden_evidence_files=0\nartifacts_ignored=PASS\n'
}

control_defect_01_characterization() {
  run_node_isolated --test --test-name-pattern='DEFECT-01' test/unit/providers.test.js
}

control_frontend_regression() {
  local e2e_dir="${GATE_CONTROL_DIR}/e2e"
  local backend_container="${GATE_PROJECT}-backend-1"
  local backend_project
  local backend_ip

  backend_project="$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "${backend_container}")"
  [[ "${backend_project}" == "${GATE_PROJECT}" ]] || return 66
  backend_ip="$(docker inspect --format \
    "{{with index .NetworkSettings.Networks \"${GATE_PROJECT}_meteolord_core\"}}{{.IPAddress}}{{end}}" \
    "${backend_container}")"
  [[ "${backend_ip}" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]] || return 66

  mkdir -p -- "${e2e_dir}"
  chmod 0700 -- "${e2e_dir}"
  docker run --pull never --rm \
    --user "$(id -u):$(id -g)" \
    --network "${GATE_PROJECT}_meteolord_core" \
    --add-host "backend:${backend_ip}" \
    --volume "${PROJECT_ROOT}/backend/test/e2e:/app/test/e2e:ro" \
    --volume "${PROJECT_ROOT}/backend/playwright.config.js:/app/playwright.config.js:ro" \
    --volume "${e2e_dir}:/evidence" \
    --workdir /app \
    --env T20_EVIDENCE_DIR=/evidence \
    --env PLAYWRIGHT_BASE_URL=http://backend:8080 \
    "${GATE_E2E_IMAGE}"
}

record_cleanup_verification() {
  local status="$1"
  {
    printf 'project=%s\n' "${GATE_PROJECT}"
    printf 'cleanup=%s\n' "${status}"
    printf 'remaining_containers=0\n'
    printf 'remaining_networks=0\n'
    printf 'remaining_volumes=0\n'
  } >"${EVIDENCE_DIR}/cleanup-verification.txt"
  chmod 0600 -- "${EVIDENCE_DIR}/cleanup-verification.txt"
}

control_test_cleanup() {
  cleanup "${GATE_PROJECT}"
  [[ -z "$(docker ps --all --quiet --filter "label=com.docker.compose.project=${GATE_PROJECT}")" ]]
  [[ -z "$(docker network ls --quiet --filter "label=com.docker.compose.project=${GATE_PROJECT}")" ]]
  [[ -z "$(docker volume ls --quiet --filter "label=com.docker.compose.project=${GATE_PROJECT}")" ]]
  record_cleanup_verification PASS
  CLEANUP_ARMED=false
}

control_report() {
  local index
  for ((index = 0; index < 18; index += 1)); do
    [[ "${GATE_STATUS[index]}" == 'PASS' ]] || return 1
  done
  printf 'report_inputs_ready=PASS\n'
}

dispatch_control() {
  case "$1" in
    1) control_config_check ;;
    2) control_deps_check ;;
    3) control_static_check ;;
    4) control_topology_check ;;
    5) control_test_db_create ;;
    6) control_migrate ;;
    7) control_fixtures ;;
    8) control_backend_check ;;
    9) control_frontend_check ;;
    10) control_health_check ;;
    11) control_health_db_down_check ;;
    12) control_tasks_check ;;
    13) control_idempotency_check ;;
    14) control_egress_check ;;
    15) control_secrets_check ;;
    16) control_defect_01_characterization ;;
    17) control_frontend_regression ;;
    18) control_test_cleanup ;;
    19) control_report ;;
    *) return 64 ;;
  esac
}

run_control() {
  local order="$1"
  local index=$((order - 1))
  local artifact_rel
  local artifact_abs
  local started
  local finished
  local exit_code

  artifact_rel="$(printf 'controls/%02d.txt' "${order}")"
  artifact_abs="${EVIDENCE_DIR}/${artifact_rel}"
  started="$(date +%s%3N)"
  gate_log "control ${order}/19 ${GATE_CONTROL_NAMES[index]} START"
  set +e
  if [[ "${METEOLORD_GATE_FAIL_AT:-}" == "${order}" ]]; then
    printf 'injected_failure_control=%s\n' "${order}" >"${artifact_abs}"
    exit_code=97
    {
      printf 'injected_control=%s\n' "${order}"
      printf 'injected_exit_code=97\n'
      printf 'dependent_controls=NOT_RUN\n'
    } >"${EVIDENCE_DIR}/gate-failure-injected.txt"
    chmod 0600 -- "${EVIDENCE_DIR}/gate-failure-injected.txt"
  else
    if [[ "${order}" -eq 2 ]]; then
      dispatch_control "${order}" >"${artifact_abs}" 2>&1
      exit_code=$?
    else
      (set -euo pipefail; dispatch_control "${order}") >"${artifact_abs}" 2>&1
      exit_code=$?
    fi
  fi
  set -e
  finished="$(date +%s%3N)"
  chmod 0600 -- "${artifact_abs}"
  GATE_EXIT_CODE[index]="${exit_code}"
  GATE_ARTIFACT[index]="${artifact_rel}"
  GATE_DURATION_MS[index]=$((finished - started))
  if [[ "${exit_code}" -eq 0 ]]; then
    GATE_STATUS[index]='PASS'
  else
    GATE_STATUS[index]='FAIL'
  fi
  {
    printf '\n===== control %02d %s =====\n' "${order}" "${GATE_CONTROL_NAMES[index]}"
    cat -- "${artifact_abs}"
    printf 'exit_code=%s\nstatus=%s\nduration_ms=%s\n' \
      "${exit_code}" "${GATE_STATUS[index]}" "${GATE_DURATION_MS[index]}"
  } >>"${GATE_RUN_LOG}"
  gate_log "control ${order}/19 ${GATE_CONTROL_NAMES[index]} ${GATE_STATUS[index]}"
  return "${exit_code}"
}

write_report_input() {
  local node_version
  local npm_version
  local docker_version
  local playwright_version
  local index
  local comma
  local artifact
  local temporary="${REPORT_INPUT}.tmp"

  node_version="$(safe_version "$(node --version | sed 's/^v//')")"
  npm_version="$(safe_version "$(npm --version)")"
  docker_version="$(safe_version "$(docker --version | awk '{gsub(/,/,"",$3); print $3}')")"
  playwright_version="$(safe_version "$(node -p "require('${PROJECT_ROOT}/backend/package.json').devDependencies['@playwright/test']")")"
  {
    printf '{\n  "versions": {\n'
    printf '    "node": "%s",\n' "${node_version}"
    printf '    "npm": "%s",\n' "${npm_version}"
    printf '    "docker": "%s",\n' "${docker_version}"
    printf '    "playwright": "%s",\n' "${playwright_version}"
    printf '    "postgis": "16-3.4",\n'
    printf '    "caddy": "2"\n'
    printf '  },\n  "controls": [\n'
    for ((index = 0; index < 19; index += 1)); do
      comma=','
      [[ "${index}" -eq 18 ]] && comma=''
      artifact="${GATE_ARTIFACT[index]}"
      if [[ "${artifact}" != 'null' ]]; then artifact="\"${artifact}\""; fi
      printf '    { "name": "%s", "order": %d, "exit_code": %s, "status": "%s", "artifact": %s, "duration_ms": %s }%s\n' \
        "${GATE_CONTROL_NAMES[index]}" "$((index + 1))" "${GATE_EXIT_CODE[index]}" \
        "${GATE_STATUS[index]}" "${artifact}" "${GATE_DURATION_MS[index]}" "${comma}"
    done
    printf '  ]\n}\n'
  } >"${temporary}"
  chmod 0600 -- "${temporary}"
  mv -- "${temporary}" "${REPORT_INPUT}"
}

write_gate_report() {
  node "${REPORT_SCRIPT}" \
    --commit "${COMMIT}" \
    --run-id "${RUN_ID}" \
    --evidence-root "${EVIDENCE_DIR}" \
    --input "${REPORT_INPUT}" \
    --output "${GATE_REPORT_OUTPUT}"
}

gate() {
  local order
  local gate_exit=0
  local report_exit=0

  gate_initialize
  gate_log "gate START run_id=${RUN_ID} project=${GATE_PROJECT}"
  for ((order = 1; order <= 19; order += 1)); do
    if run_control "${order}"; then
      continue
    else
      gate_exit=$?
      gate_log "fail-fast after critical control ${order}; controls $((order + 1))-19 remain NOT_RUN"
      break
    fi
  done

  write_report_input
  set +e
  write_gate_report >>"${GATE_RUN_LOG}" 2>&1
  report_exit=$?
  set -e
  if [[ "${report_exit}" -ne 0 ]]; then
    gate_log "gate report generation FAIL exit_code=${report_exit}"
    [[ "${gate_exit}" -ne 0 ]] || gate_exit="${report_exit}"
  else
    gate_log "gate report generation PASS"
  fi
  gate_log "gate END exit_code=${gate_exit}"
  return "${gate_exit}"
}

CLEANUP_ARMED=false

cleanup_trap() {
  local status="${1:-0}"
  trap - INT TERM EXIT

  if [[ "${CLEANUP_ARMED}" == 'true' ]]; then
    if cleanup "${CLEANUP_PROJECT}" >"${EVIDENCE_DIR}/cleanup-trap.txt" 2>&1; then
      if [[ "${GATE_ACTIVE}" == 'true' ]]; then record_cleanup_verification PASS; fi
    else
      status=70
      if [[ "${GATE_ACTIVE}" == 'true' ]]; then
        printf 'project=%s\ncleanup=FAIL\n' "${CLEANUP_PROJECT}" >"${EVIDENCE_DIR}/cleanup-verification.txt"
        chmod 0600 -- "${EVIDENCE_DIR}/cleanup-verification.txt"
      fi
    fi
  fi

  exit "${status}"
}

trap 'cleanup_trap 130' INT TERM
trap 'cleanup_trap $?' EXIT

usage() {
  printf 'Usage: %s {validate|inventory|cleanup|report|gate}\n' "${0##*/}"
}

main() {
  local command="${1:-validate}"

  guard_paths
  guard_project "${PROJECT}"

  case "${command}" in
    validate)
      log "Wrapper configuration valid for run ${RUN_ID}"
      ;;
    inventory)
      inventory "${PROJECT}"
      ;;
    cleanup)
      CLEANUP_ARMED=true
      log "Cleanup armed for guarded project ${PROJECT}"
      ;;
    report)
      report
      ;;
    gate)
      gate
      ;;
    *)
      usage >&2
      die 'unknown command'
      ;;
  esac
}

main "$@"
