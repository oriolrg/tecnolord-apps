# FASE 0–1 — Diari operatiu (Tecnolord)

> **On guardar-ho al repo**: `docs/FASE0-1.md`

## Resum executiu
- **Objectiu**: tenir un esquelet mínim amb **backend JS (Express)** + **frontend HTML/JS** servits per **Caddy** a DigitalOcean.
- **Fase 0 (local)**: endpoints `GET /api/ping` i `GET /health` operatius; `/` encara 404 fins afegir frontend.
- **Fase 1 (prod DO)**: Caddy serveix `frontend/` i fa proxy a `/api/*` cap a backend.

---

## Estructura del repo (Fase 1)
```
/ (root)
├─ backend/
│  ├─ server.js           # /api/ping i /health + serveix / (frontend)
│  ├─ package.json
│  └─ Dockerfile          # build del backend
├─ frontend/
│  └─ index.html          # botó que fa fetch('/api/ping')
├─ Caddyfile              # proxy /api/* -> backend:3000, estàtics de /srv
└─ docker-compose.yml     # serveis: backend + caddy
```

---

## Fase 0 — Desenvolupament en local (resultats)
**Resultat esperat** (OK):
```
Backend escoltant a :3000
GET / 404 ...      # abans de tenir frontend
GET /api/ping 200  # { ok: true, msg: 'pong' }
GET /health 200    # { ok: true, time: <ISO>, version: '0.1.0' }
```

**Passos clau**
1. Crear projecte mínim (Express):
   - `GET /api/ping` → `{ ok:true, msg:'pong' }`
   - `GET /health` → `{ ok:true, time: ISO }`
2. Afegir `frontend/index.html` i servir-lo des d’Express (o via Caddy en prod).
3. **Git**: `git init`, commit petit per feature, `git push` al repo GitHub.

**Comandes de prova**
```bash
# local
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/api/ping
```

---

## Fase 1 — Desplegament a DigitalOcean

### 1) Accés i usuari
- Entrar com a `root` (inicial) i crear usuari **`deploy`** amb sudo:
  ```bash
  adduser deploy && usermod -aG sudo deploy
  ```
- **Restricció corporativa**: sense poder generar claus al PC → **solució temporal**: habilitar password **només per a `deploy`**:
  ```bash
  passwd deploy
  cat >/etc/ssh/sshd_config.d/99-local-override.conf <<'EOF'
  PubkeyAuthentication yes
  PermitRootLogin prohibit-password
  PasswordAuthentication no

  Match User deploy
      PasswordAuthentication yes
  EOF
  sshd -t && systemctl restart ssh
  ```

### 2) Firewall i Docker
```bash
apt-get update && apt-get install -y ufw git
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
# Docker + Compose plugin
apt-get install -y ca-certificates curl gnupg lsb-release
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
| tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker deploy
# nova sessió o 'newgrp docker' per aplicar grups
```

### 3) Clonar i arrencar
```bash
# com a usuari deploy
cd ~ && mkdir -p tecnolord-apps && cd tecnolord-apps
# repo públic o amb PAT si és privat
git clone https://github.com/<usuari>/<repo>.git tecnolord
cd tecnolord

# (si cal) crear fitxers de Fase 1
# Caddyfile i docker-compose.yml segons secció de dalt

# build + arrencada
docker compose up -d --build
```

### 4) Validació
```bash
# al servidor
curl http://localhost/health
curl http://localhost/api/ping

# des de fora
http://<IP>/             # frontend
http://<IP>/api/ping     # { ok:true, msg:'pong' }
http://<IP>/health       # salut
```

---

## Troubleshooting (Fase 1)
- **Port 80 ocupat**:
  ```bash
  sudo ss -ltnp | grep ':80' || true
  docker ps --format 'table {{.Names}}\t{{.Ports}}'
  docker stop <container> && docker rm <container>
  # temporal: ports: ["8080:80"] i entrar per http://IP:8080/
  ```
- **Docker sense permisos** (deploy):
  ```bash
  newgrp docker
  # o obrir una nova sessió; prova 'docker ps'
  ```
- **npm ci sense lockfile**: al `backend/Dockerfile` usar fallback:
  ```dockerfile
  RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
  ```
- **SSH amb password no funciona**: recorda que `60-cloudimg-settings.conf` força `PasswordAuthentication no`. L’override `99-local-override.conf` (damunt) ho resol.

---

## Definition of Done (Fases 0–1)
- **F0**: `/api/ping` i `/health` OK en local; commit a GitHub.
- **F1**: `http://<IP>/` carrega frontend; `http://<IP>/api/ping` i `/health` responen en prod.

---

## Proper pas — Fase 2 (DB)
**Objectiu**: afegir **Postgres**, endpoints d’ingesta i consulta, i wiring bàsic al frontend.

**Micro-tasques (proposta)**
1. **T2.1** Afegir servei `db` (Postgres 16) al `docker-compose.yml` + volum `pgdata`.
   - DoD: `/health` retorna `db:'ok'` amb `SELECT 1`.
2. **T2.2** `init.sql` amb taula `measurement` i índex `(station_id, at desc)`.
   - DoD: arrencada crea l’esquema.
3. **T2.3** Endpoint `POST /api/v1/measurements` amb validació i **API key** (`x-api-key`).
   - DoD: `201` i `id` retornat; sense clau → `401`.
4. **T2.4** `GET /api/v1/measurements/latest?limit=50&station_id=...`.
   - DoD: array ordenat DESC; límit ≤ 1000.
5. **T2.5** Frontend: taula simple dels últims N registres i botó de refresc.
   - DoD: es veuen dades reals.

**Notes**
- `.env`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `INGEST_API_KEY`.
- Backups bàsics amb `pg_dump` (planificar a Fase 3).

