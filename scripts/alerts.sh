#!/usr/bin/env bash
set -euo pipefail

# =======================
# TECNOLORD - alerts.sh
# - DB table size + disk usage
# - Web + API healthchecks
# - Telegram notify (token/chat_id from .env via cron/export)
# =======================

# ========= CONFIG =========

# Telegram (expects env vars from .env)
: "${TG_BOT_TOKEN:?Missing TG_BOT_TOKEN env var}"
: "${TG_CHAT_ID:?Missing TG_CHAT_ID env var}"

# DB (expects env var DB_URL or uses default)
DB_URL="${DB_URL:-postgresql://meteo:meteo@127.0.0.1:5432/meteo}"
SCHEMA="meteo"
TABLE="forecast_hourly"

# Thresholds
MAX_TABLE_BYTES=$((1024 * 1024 * 1024))   # 1 GiB
MAX_DISK_PCT=85                           # 85% on /

# Health checks
BASE_URL="https://tecnolord.cat"
WEB_PATH="/meteo/"
API1="/api/v1/mesures/darreres"
API2="/api/v1/hidro/darreres"
CURL_TIMEOUT=12
CURL_MAX_TIME=15

# Logs
LOG_FILE="/home/deploy/tecnolord-apps/logs/alerts.log"

# ========= HELPERS =========

ts() { date -Is; }

log() {
  mkdir -p "$(dirname "$LOG_FILE")"
  echo "[$(ts)] $*" >> "$LOG_FILE"
}

human_bytes() {
  local b="$1"
  if command -v numfmt >/dev/null 2>&1; then
    numfmt --to=iec --suffix=B "$b"
  else
    echo "${b}B"
  fi
}

tg_send() {
  local text="$1"
  # Robust telegram send: POST + data-urlencode + timeout
  curl -fsS --max-time 20 \
    -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${TG_CHAT_ID}" \
    --data-urlencode "text=${text}" \
    >/dev/null || true
}

check_http() {
  local url="$1"
  # returns: "code total_time" (or fails)
  curl -sS -o /dev/null \
    -w "%{http_code} %{time_total}\n" \
    --connect-timeout "$CURL_TIMEOUT" \
    --max-time "$CURL_MAX_TIME" \
    "$url"
}

# ========= CHECKS =========

HOST="$(hostname -f 2>/dev/null || hostname)"
NOW="$(ts)"
alerts=()

# 1) Disk usage
disk_pct="$(df -P / | awk 'NR==2{gsub("%","",$5); print $5}')"
if [ "${disk_pct:-0}" -ge "$MAX_DISK_PCT" ]; then
  alerts+=("DISC: / a ${disk_pct}% (llindar ${MAX_DISK_PCT}%)")
fi

# 2) Table size (includes indexes)
table_bytes="$(psql "$DB_URL" -Atc "SELECT pg_total_relation_size('${SCHEMA}.${TABLE}');" 2>/dev/null || echo 0)"
if [ "${table_bytes:-0}" -ge "$MAX_TABLE_BYTES" ]; then
  alerts+=("DB: ${SCHEMA}.${TABLE} mida $(human_bytes "$table_bytes") (llindar $(human_bytes "$MAX_TABLE_BYTES"))")
fi

# 3) Web + APIs health
web_url="${BASE_URL}${WEB_PATH}"
api1_url="${BASE_URL}${API1}"
api2_url="${BASE_URL}${API2}"

# Web
if out="$(check_http "$web_url" 2>/dev/null)"; then
  code="$(awk '{print $1}' <<<"$out")"
  t="$(awk '{print $2}' <<<"$out")"
  if [ "$code" -lt 200 ] || [ "$code" -ge 400 ]; then
    alerts+=("WEB: ${web_url} HTTP ${code} (t=${t}s)")
  fi
else
  alerts+=("WEB: ${web_url} NO RESPONSE (timeout/error)")
fi

# API1
if out="$(check_http "$api1_url" 2>/dev/null)"; then
  code="$(awk '{print $1}' <<<"$out")"
  t="$(awk '{print $2}' <<<"$out")"
  if [ "$code" -lt 200 ] || [ "$code" -ge 400 ]; then
    alerts+=("API: ${API1} HTTP ${code} (t=${t}s)")
  fi
else
  alerts+=("API: ${API1} NO RESPONSE (timeout/error)")
fi

# API2
if out="$(check_http "$api2_url" 2>/dev/null)"; then
  code="$(awk '{print $1}' <<<"$out")"
  t="$(awk '{print $2}' <<<"$out")"
  if [ "$code" -lt 200 ] || [ "$code" -ge 400 ]; then
    alerts+=("API: ${API2} HTTP ${code} (t=${t}s)")
  fi
else
  alerts+=("API: ${API2} NO RESPONSE (timeout/error)")
fi

# Extra DB stats (only when alert)
db_stats=""
if [ "${#alerts[@]}" -gt 0 ]; then
  db_stats="$(psql "$DB_URL" -Atc "
    SELECT
      (SELECT count(*) FROM ${SCHEMA}.${TABLE}) AS rows,
      (SELECT min(valid_time) FROM ${SCHEMA}.${TABLE}) AS min_valid_time,
      (SELECT max(valid_time) FROM ${SCHEMA}.${TABLE}) AS max_valid_time;
  " 2>/dev/null || true)"
fi

# ========= NOTIFY =========

if [ "${#alerts[@]}" -gt 0 ]; then
  msg="[TECNOLORD ALERT] ${HOST}
${NOW}

$(printf '%s\n' "${alerts[@]}")

Disk(/): ${disk_pct}%
Table(${SCHEMA}.${TABLE}): $(human_bytes "$table_bytes")

DB stats:
${db_stats}
"
  log "ALERT triggered: ${alerts[*]}"
  tg_send "$msg"
else
  log "OK: disk=${disk_pct}% table=$(human_bytes "$table_bytes") web/api ok"
fi
