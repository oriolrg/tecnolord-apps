# README — `deploy.sh` i hooks de desplegament

Aquest document descriu com instal·lar i utilitzar l’script **`scripts/deploy.sh`** i els **hooks de Git** per automatitzar el desplegament de Tecnolord al servidor.

## 👇 Què fa `deploy.sh`
- Actualitza el codi a la branca indicada: `git fetch` + `git reset --hard origin/<branca>`.
- Reconstrueix imatges (baixant bases noves si cal): `docker compose build --pull`.
- Re-crea els contenidors: `docker compose up -d`.
- Recarrega Caddy (si hi és): `caddy reload` (no falla si no cal).
- Netega imatges antigues: `docker image prune -f`.

> **Advertiment:** com que fa `reset --hard`, **descarta canvis locals no commitejats**. Usa aquest repo només per a desplegar.

## 🧩 Prerequisits
- **Docker** i **Docker Compose plugin** instal·lats al servidor.
- Usuari amb permisos per a Docker (grup `docker`) o bé ús de `sudo`.
- Repo clonado (p. ex. `/home/deploy/tecnolord-apps/tecnolord`).

## 🛠️ Instal·lació
Des de l’arrel del repo:
```bash
mkdir -p scripts
# crea l’script (si no existeix)
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

echo "[deploy] Reloading Caddy (if present) ..."
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || true

echo "[deploy] Pruning old images ..."
docker image prune -f || true

echo "[deploy] Done."
SH
chmod +x scripts/deploy.sh
```

### (Opcional) Hooks perquè cada `git pull` faci deploy
```bash
cat > .git/hooks/post-merge <<'SH'
#!/usr/bin/env bash
set -e
"$(git rev-parse --show-toplevel)/scripts/deploy.sh"
SH
chmod +x .git/hooks/post-merge

cat > .git/hooks/post-rewrite <<'SH'
#!/usr/bin/env bash
set -e
"$(git rev-parse --show-toplevel)/scripts/deploy.sh"
SH
chmod +x .git/hooks/post-rewrite
```
> Els **hooks són locals** a aquest clone (no es commitegen). Si clones en una altra ruta, caldrà tornar-los a crear.

## ▶️ Ús
Des de l’arrel del repo al servidor:
```bash
./scripts/deploy.sh          # desplega 'main'
./scripts/deploy.sh develop  # desplega una altra branca
```

## 🔍 Logs i validació
```bash
# estat
docker compose ps

# logs en viu
docker compose logs -f --tail=200 backend caddy

# health checks
curl -s http://localhost/health
curl -s http://localhost/api/ping
```

## 🧰 Troubleshooting
- **`permission denied` amb Docker**: obre una nova sessió (si acabes d’afegir-te al grup) o usa `sudo docker ...`. Comprova: `id`, `groups` i `ls -l /var/run/docker.sock`.
- **Port 80 ocupat**: mira qui el té `sudo ss -ltnp | grep ':80'` i atura l’altre contenidor/servei (`docker ps`, `docker stop ...`) o mapeja temporalment `8080:80` al `docker-compose.yml`.
- **`npm ci` sense lockfile**: al `backend/Dockerfile` usa el fallback:
  ```dockerfile
  RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
  ```
- **Caddy no es recarrega**: l’script ho ignora si no hi ha servei `caddy`. Un `docker compose up -d` ja recrea el contenidor si el `Caddyfile` ha canviat.
