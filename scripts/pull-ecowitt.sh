#!/usr/bin/env bash
set -Eeuo pipefail

# Root del repo (carpeta pare de 'scripts')
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd -P)"
LOG_DIR="$REPO_DIR/logs"
COMPOSE_FILE="$REPO_DIR/docker-compose.yml"

mkdir -p "$LOG_DIR"

# Comanda docker compose (camí absolut per cron)
DOCKER="$(command -v docker)"
COMPOSE="$DOCKER compose -f \"$COMPOSE_FILE\""

# Executa dins del contenidor backend amb Node (fetch)
OUT=$($DOCKER compose -f "$COMPOSE_FILE" exec -T backend node -e '
const url = "http://localhost:3000/tasks/pull-ecowitt";
const key = process.env.INGEST_API_KEY || "";
if (!key) { console.error("INGEST_API_KEY missing"); process.exit(1); }
fetch(url, { method: "POST", headers: { "x-api-key": key } })
  .then(async r => { const t = await r.text(); console.log(r.status + " " + t); })
  .catch(e => { console.error("ERR " + e); process.exit(1); });
')

# Append al log (sense cometes estranyes)
printf '%s %s\n' "$(date -Is)" "$OUT" >> "$LOG_DIR/pull-ecowitt.log"
