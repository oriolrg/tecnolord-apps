#!/usr/bin/env bash
set -Eeuo pipefail

readonly PROD01_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
: "${TARGET_DB:?TARGET_DB is required}"
: "${PROD01_EVIDENCE_DIR:?PROD01_EVIDENCE_DIR is required}"
: "${PROD01_PG_CONTAINER:?PROD01_PG_CONTAINER is required}"
: "${PROD01_PG_USER:?PROD01_PG_USER is required}"

readonly PROD01_BASELINE="${PROD01_BASELINE:-${PROD01_ROOT}/docs/sdd/produccio/evidence/PR04-readonly-fingerprint.ndjson}"
readonly PROD01_PRECUTOVER="${PROD01_EVIDENCE_DIR}/PRE-CUTOVER.json"
readonly PROD01_PENDING="${PROD01_PRECUTOVER}.pending"

node "${PROD01_ROOT}/scripts/prod/prod-01-precutover.js" target "${TARGET_DB}" >/dev/null
test -f "${PROD01_BASELINE}"
mkdir -p "${PROD01_EVIDENCE_DIR}"
test ! -e "${PROD01_PRECUTOVER}"
test ! -e "${PROD01_PENDING}"

cleanup() {
  rm -f "${PROD01_PENDING}"
}
trap cleanup EXIT

"${PROD01_ROOT}/scripts/prod/prod-01-precutover-collector.sh" >"${PROD01_PENDING}"
node "${PROD01_ROOT}/scripts/prod/prod-01-precutover.js" gate \
  "${PROD01_BASELINE}" \
  "${PROD01_PENDING}" \
  "${TARGET_DB}"
mv "${PROD01_PENDING}" "${PROD01_PRECUTOVER}"
trap - EXIT
