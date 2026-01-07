#!/usr/bin/env bash
set -euo pipefail

# =======================
# TECNOLORD - alerts.sh
# - DB table size + disk usage
# - Web + API healthchecks (status + latency)
# - Data "silence" (staleness) checks:
#     * forecast_run.issued_at
#     * mesures.instant
#     * lectures_hidro.instant
# - Telegram notify (TG_BOT_TOKEN / TG_CHAT_ID from .env)
# - DB via docker exec (psql inside container)
# =======================

APP_DIR="/home/deploy/tecnolord-apps"
LOG_FILE="${APP_DIR}/logs/alerts.log"
ENV_FILE="${APP_DIR}/.env"

# ========= Load env (safe) =========
# Loads ONLY lines like KEY=VALUE where KEY is a valid env var name.
# Ignores comments and "human text" lines (with spaces etc).
load_env_kv() {
  local f="$1"
  [ -f "$f" ] || return 0

  while IFS= read -r line; do
    # trim
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"

    # skip empty / comments
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^# ]] && continue

    # accept KEY=VALUE where KEY is valid shell var name
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line"
    fi
  done < "$f"
}

mkdir -p "$(dirname "$LOG_FILE")"
load_env_kv "$ENV_FILE"

# ========= REQUIRED (Telegram) =========
: "${TG_BOT_TOKEN:?Missing TG_BOT_TOKEN in ${ENV_FILE} or environment}"
: "${TG_CHAT_ID:?Missing TG_CHAT_ID in ${ENV_FILE} or environment}"

# ========= CONFIG =========

# DB is inside docker
DB_CONTAINER="${DB_CONTAINER:-tecnolord-apps-db-1}"
DB_USER="${DB_USER:-meteo}"
DB_NAME="${DB_NAME:-meteo}"

SCHEMA="meteo"
TABLE="forecast_hourly"

# Thresholds
MAX_TABLE_BYTES=$((1024 * 1024 * 1024))   # 1 GiB total relation size (table+indexes)
MAX_DISK_PCT=85                           # 85% usage on /

# Data staleness thresholds (minutes)
MAX_FORECAST_AGE_MIN=90   # forecast_run.issued_at no més vell de 90 min
MAX_METEO_AGE_MIN=30      # mesures.instant no més vell de 30 min
MAX_HIDRO_AGE_MIN=30      # lectures_hidro.instant no més vell de 30 min

# Health checks
BASE_URL="${BASE_URL:-https://tecnolord.cat}"
WEB_PATH="/meteo/"
API1="/api/v1/mesures/darreres"
API2="/api/v1/hidro/darreres"

CURL_TIMEOUT=12
CURL_MAX_TIME=15

# Latency thresholds (seconds)
MAX_WEB_TIME_S=3.0
MAX_API_TIME_S=2.0

# ========= HELPERS =========
ts() { date -Is; }

log() { echo "[$(ts)] $*" >> "$LOG_FILE"; }

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
  curl -fsS --max-time 20 \
    -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${TG_CHAT_ID}" \
    --data-urlencode "text=${text}" \
    >/dev/null || true
}

check_http() {
  local url="$1"
  # returns: "code total_time" or fails
  curl -sS -o /dev/null \
    -w "%{http_code} %{time_total}\n" \
    --connect-timeout "$CURL_TIMEOUT" \
    --max-time "$CURL_MAX_TIME" \
    "$url"
}

db_psql() {
  local sql="$1"
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -Atc "$sql"
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

# 2) DB table size + connectivity
table_bytes=""
db_err=""
if table_bytes="$(db_psql "SELECT pg_total_relation_size('${SCHEMA}.${TABLE}');" 2>/dev/null)"; then
  table_bytes="${table_bytes:-0}"
  if [ "$table_bytes" -ge "$MAX_TABLE_BYTES" ]; then
    alerts+=("DB: ${SCHEMA}.${TABLE} mida $(human_bytes "$table_bytes") (llindar $(human_bytes "$MAX_TABLE_BYTES"))")
  fi
else
  db_err="DB: NO CONNECT (${DB_CONTAINER} / ${DB_USER}@${DB_NAME})"
  alerts+=("$db_err")
  table_bytes="0"
fi

# 2b) Data staleness (silence)
if [ -z "$db_err" ]; then
  # Forecast staleness (issued_at)
  if max_ts="$(db_psql "SELECT max(issued_at) FROM meteo.forecast_run;" 2>/dev/null)"; then
    if [ -n "$max_ts" ]; then
      age_min="$(db_psql "SELECT EXTRACT(EPOCH FROM (now() - max(issued_at)))/60 FROM meteo.forecast_run;" 2>/dev/null || echo "")"
      age_min_int="${age_min%.*}"
      if [ -n "$age_min_int" ] && [ "$age_min_int" -ge "$MAX_FORECAST_AGE_MIN" ]; then
        alerts+=("SILENCE: forecast_run últim issued_at fa ${age_min_int} min (llindar ${MAX_FORECAST_AGE_MIN} min)")
      fi
    else
      alerts+=("SILENCE: forecast_run sense dades (max issued_at NULL)")
    fi
  else
    alerts+=("SILENCE: no es pot llegir forecast_run (DB)")
  fi

  # Meteo staleness (mesures.instant)
  if max_ts="$(db_psql "SELECT max(instant) FROM meteo.mesures;" 2>/dev/null)"; then
    if [ -n "$max_ts" ]; then
      age_min="$(db_psql "SELECT EXTRACT(EPOCH FROM (now() - max(instant)))/60 FROM meteo.mesures;" 2>/dev/null || echo "")"
      age_min_int="${age_min%.*}"
      if [ -n "$age_min_int" ] && [ "$age_min_int" -ge "$MAX_METEO_AGE_MIN" ]; then
        alerts+=("SILENCE: meteo.mesures últim instant fa ${age_min_int} min (llindar ${MAX_METEO_AGE_MIN} min)")
      fi
    else
      alerts+=("SILENCE: meteo.mesures sense dades (max instant NULL)")
    fi
  else
    alerts+=("SILENCE: no es pot llegir meteo.mesures (DB)")
  fi

  # Hidro staleness (lectures_hidro.instant)
  if max_ts="$(db_psql "SELECT max(instant) FROM meteo.lectures_hidro;" 2>/dev/null)"; then
    if [ -n "$max_ts" ]; then
      age_min="$(db_psql "SELECT EXTRACT(EPOCH FROM (now() - max(instant)))/60 FROM meteo.lectures_hidro;" 2>/dev/null || echo "")"
      age_min_int="${age_min%.*}"
      if [ -n "$age_min_int" ] && [ "$age_min_int" -ge "$MAX_HIDRO_AGE_MIN" ]; then
        alerts+=("SILENCE: meteo.lectures_hidro últim instant fa ${age_min_int} min (llindar ${MAX_HIDRO_AGE_MIN} min)")
      fi
    else
      alerts+=("SILENCE: meteo.lectures_hidro sense dades (max instant NULL)")
    fi
  else
    alerts+=("SILENCE: no es pot llegir meteo.lectures_hidro (DB)")
  fi
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

  if awk "BEGIN{exit !($t > $MAX_WEB_TIME_S)}"; then
    alerts+=("SLOW: WEB ${web_url} t=${t}s (llindar ${MAX_WEB_TIME_S}s)")
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

  if awk "BEGIN{exit !($t > $MAX_API_TIME_S)}"; then
    alerts+=("SLOW: API ${API1} t=${t}s (llindar ${MAX_API_TIME_S}s)")
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

  if awk "BEGIN{exit !($t > $MAX_API_TIME_S)}"; then
    alerts+=("SLOW: API ${API2} t=${t}s (llindar ${MAX_API_TIME_S}s)")
  fi
else
  alerts+=("API: ${API2} NO RESPONSE (timeout/error)")
fi

# Extra DB stats (only when alert and DB OK)
db_stats=""
if [ "${#alerts[@]}" -gt 0 ] && [ -z "$db_err" ]; then
  db_stats="$(db_psql "
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
