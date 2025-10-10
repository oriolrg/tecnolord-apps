cd ~/tecnolord-apps
mkdir -p scripts
cat > scripts/deploy.sh <<'SH'
#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."

branch="${1:-main}"

echo "[deploy] Pulling latest ($branch) ..."
git fetch origin "$branch"
git reset --hard "origin/$branch"

echo "[deploy] Building images (pull base if newer) ..."
docker compose build --pull

echo "[deploy] Recreating containers ..."
docker compose up -d

# Reload Caddy config if changed (no-op si no hi és)
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || true

echo "[deploy] Pruning old images ..."
docker image prune -f || true

echo "[deploy] Done."
SH
chmod +x scripts/deploy.sh
