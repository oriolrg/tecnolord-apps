# DEPLOY — Automatització (Tecnolord)

## Quan cal reconstruir/rearrencar?

* **Frontend (Caddy + volum `./frontend:/srv:ro`)**: després de `git pull` **no cal res**; Caddy serveix els fitxers nous al moment. *(Només cal restart si canvies el `Caddyfile`.)*
* **Backend (contenidor)**: després de `git pull` cal fer **rebuild** i **recreate** perquè s’apliquin canvis de codi/deps.

  * `docker compose up -d --build` ja fa les dues coses.
  * El **Dockerfile** copia `package*.json` i executa `npm ci|install` dins la imatge, per tant **no cal `npm install` al host**.

---

## Opció A — Comanda manual única (recomanat com a base)

Arrel del repo crea `scripts/deploy.sh`:

```bash
#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."

branch=${1:-main}

echo "[deploy] Pulling latest ($branch) ..."
# si prefereixes: git pull --rebase
git fetch origin && git reset --hard origin/$branch

echo "[deploy] Building images (pull base if newer) ..."
docker compose build --pull

echo "[deploy] Recreating containers ..."
docker compose up -d

echo "[deploy] Pruning old images ..."
docker image prune -f || true

echo "[deploy] Done."
```

Fes-lo executable:

```bash
chmod +x scripts/deploy.sh
```

Ús:

```bash
./scripts/deploy.sh            # deploy de main
./scripts/deploy.sh develop    # o una altra branca
```

---

## Opció B — Auto després d’un `git pull` (hook)

A la màquina **del servidor**, dins el repo, crea el hook `.git/hooks/post-merge`:

```bash
#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(git rev-parse --show-toplevel)"
./scripts/deploy.sh "$1" || ./scripts/deploy.sh
```

I també `.git/hooks/post-rewrite` (per rebase):

```bash
#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(git rev-parse --show-toplevel)"
./scripts/deploy.sh
```

Dóna permisos d’execució:

```bash
chmod +x .git/hooks/post-merge .git/hooks/post-rewrite
```

> Resultat: **cada cop** que facis `git pull` al servidor, es reconstruirà i re-engegarà automàticament.

---

## Opció C — Deploy automàtic amb GitHub Actions (push a main)

Arrel del repo crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  ssh-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          password: ${{ secrets.SSH_PASSWORD }} # o bé 'key' si uses clau privada
          script: |
            set -Eeuo pipefail
            cd ~/tecnolord-apps/tecnolord
            git fetch origin && git reset --hard origin/main
            docker compose build --pull
            docker compose up -d
            docker image prune -f || true
```

Secrets necessaris (al repo → Settings → Secrets → Actions):

* `SSH_HOST` (IP del servidor)
* `SSH_USER` (deploy)
* `SSH_PASSWORD` **o** `SSH_KEY` (si fas servir clau; millor opció)

---

## Logs i verificacions útils

```bash
# seguiment en viu (últimes 200 línies)
docker compose logs -f --tail=200 backend caddy

# estat i versions
docker compose ps
docker ps --filter publish=80 --format 'table {{.Names}}\t{{.Ports}}'

# health checks
curl -s http://localhost/health | jq . || curl -s http://localhost/health
curl -s http://localhost/api/ping | jq . || curl -s http://localhost/api/ping
```

---

## Notes de capaçats

* Per actualitzar base images de Node/Caddy, afegeix `--pull` al build (ja inclòs) o fes-ho periòdicament.
* Si el **Caddyfile** canvia, caldrà `docker compose restart caddy` (o l’`up -d` ja el recrearà si detecta canvi de volum).
* Si algun dia muntes **DB**, afegeix migracions/`init.sql` al procés de deploy.
* Si vols un sol botó: crea `make deploy` al `Makefile` que cridi `scripts/deploy.sh`.
