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

CLEANUP_ARMED=false

cleanup_trap() {
  local status="${1:-0}"
  trap - INT TERM EXIT

  if [[ "${CLEANUP_ARMED}" == 'true' ]]; then
    if ! cleanup "${PROJECT}"; then
      status=70
    fi
  fi

  exit "${status}"
}

trap 'cleanup_trap 130' INT TERM
trap 'cleanup_trap $?' EXIT

usage() {
  printf 'Usage: %s {validate|inventory|cleanup|report}\n' "${0##*/}"
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
    *)
      usage >&2
      die 'unknown command'
      ;;
  esac
}

main "$@"
