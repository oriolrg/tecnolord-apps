#!/usr/bin/env bash
set -Eeuo pipefail

# Root del repo (carpeta pare de 'scripts')
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd -P)"
LOG_DIR="$REPO_DIR/logs"
COMPOSE_FILE="$REPO_DIR/docker-compose.yml"

mkdir -p "$LOG_DIR"

ts() { date -Is; }

# Helper: extreure un env dins del container (INGEST_API_KEY)
get_ingest_key() {
  /usr/bin/docker compose -f "$COMPOSE_FILE" exec -T backend sh -lc 'printf "%s" "${INGEST_API_KEY:-}"'
}

# Helper: fer POST a un endpoint intern via curl DES DE DINS del backend
# (així "localhost:3000" sempre és el backend container i no depens de xarxes externes)
post_task() {
  local endpoint="$1"  # ex: /api/tasks/pull-ecowitt
  local key="$2"

  /usr/bin/docker compose -f "$COMPOSE_FILE" exec -T backend sh -lc "
    set -e;
    curl -fsS -X POST \"http://localhost:3000${endpoint}\" \
      -H \"x-api-key: ${key}\" \
      -H \"accept: application/json\"
  "
}

LOG_FILE="$LOG_DIR/pull-ingest.log"

echo "[$(ts)] ingest: start" >> "$LOG_FILE"

KEY="$(get_ingest_key || true)"
if [ -z "${KEY:-}" ]; then
  echo "[$(ts)] ingest: ERROR missing INGEST_API_KEY in backend container env" >> "$LOG_FILE"
  exit 1
fi

# 1) Ecowitt + ACA
if out="$(post_task "/api/tasks/pull-ecowitt" "$KEY" | head -c 4000)"; then
  echo "[$(ts)] pull-ecowitt: ${out}" >> "$LOG_FILE"
else
  echo "[$(ts)] pull-ecowitt: ERROR (see docker logs)" >> "$LOG_FILE"
fi

# 2) Previ (forecast 48h)
if out="$(post_task "/api/tasks/pull-previ" "$KEY" | head -c 4000)"; then
  echo "[$(ts)] pull-previ: ${out}" >> "$LOG_FILE"
else
  echo "[$(ts)] pull-previ: ERROR (see docker logs)" >> "$LOG_FILE"
fi

echo "[$(ts)] ingest: done" >> "$LOG_FILE"
