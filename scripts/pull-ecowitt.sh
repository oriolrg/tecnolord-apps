#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="/home/deploy/tecnolord-apps/tecnolord"
LOG_DIR="$REPO_DIR/logs"
mkdir -p "$LOG_DIR"
cd "$REPO_DIR"

# Executa des de dins del contenidor backend amb Node (fetch)
OUT=$(/usr/bin/docker compose exec -T backend node -e "const url='http://localhost:3000/tasks/pull-ecowitt'; const key=process.env.INGEST_API_KEY||''; if(!key){console.error('INGEST_API_KEY missing');process.exit(1)} fetch(url,{method:'POST',headers:{'x-api-key':key}}).then(async r=>{const t=await r.text(); console.log(r.status+' '+t)}).catch(e=>{console.error('ERR',e);process.exit(1)})")
echo \"$(date -Is) $OUT\" >> \"$LOG_DIR/pull-ecowitt.log\"
