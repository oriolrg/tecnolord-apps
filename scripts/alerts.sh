#!/usr/bin/env bash
set -euo pipefail

# ========= CONFIG =========

# Telegram
TG_BOT_TOKEN="${TG_BOT_TOKEN:-PUT_YOUR_BOT_TOKEN_HERE}"
TG_CHAT_ID="${TG_CHAT_ID:-PUT_YOUR_CHAT_ID_HERE}"

# DB (posa la teva URL real si no la tens per env var)
DB_URL="${DB_URL:-postgresql://meteo:meteo@127.0.0.1:5432/meteo}"
SCHEMA="meteo"
TABLE="forecast_hourly"

# Llindars
MAX_TABLE_BYTES=$((1024 * 1024 * 1024))   # 1 GiB
MAX_DISK_PCT=85                           # 85% ple

# Health checks
BASE_URL="https://tecnolord.cat"
WEB_PATH="/meteo/"
API1="/api/v1/mesures/darreres"
API2="/api/v1/hidro/darreres"
CURL_TIMEOUT=12                           # segons
CURL_MAX_TIME=15                          # segons

# Logs
LOG_FILE="/home/deploy/tecnolord-apps/logs/alerts.log"

# ========= HELPERS =========

ts() { date -Is; }

log() {
  echo "[$(ts)] $*" | tee -a "$LOG_FILE" >/dev/null
}

tg_send() {
  local text="$1"
  # Escape mínim: Telegram accepta text pla; fem URL-encode via jq si hi és
  if command -v jq >/dev/null 2>&1; then
    local enc
    enc="$(jq -rn --arg t "$text" '$t|@uri')"
    curl -fsS --max-time 20 \
      "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${enc}" \
      >/dev/null || true
  else
    # fallback sense encoding (funciona si no hi ha caràcters “estranys”)
    curl -fsS --max-time 20 \
      -d "chat_id=${TG_CHAT_ID}" \
      --data-urlencode "text=${text}" \
      "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
      >/dev/null || true
  fi
}

human_bytes() {
  local b="$1"
  if command -v numfmt >/dev/null 2>&1; then
    numfmt --to=iec --suffix=B "$b"
  else
    echo "${b}B"
  fi
}

check_http() {
  local url="$1"
  # retorna "code total_time" o falla
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

# 2) Table size (pg_total_relation_size inclou indexes)
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

# Extra info DB (si hi ha alerta)
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
