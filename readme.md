# Tecnolord Apps

## TL;DR

Plataforma backend modular desplegada amb **Docker Compose** que serveix un frontend estàtic i executa **ingestes meteorològiques programades** (Ecowitt/ACA i Previ 48h) mitjançant endpoints interns protegits (`/api/tasks/*`).

Aquest README està pensat perquè:

* Qualsevol dev pugui entendre el sistema amb una sola lectura
* Es pugui passar directament a una IA i obtenir respostes útils
* Es pugui fer manteniment o relleu sense context previ

---

## Origen del projecte (context)

Aquest repo neix com a **Fase 1 mínima** (starter) amb:

* Backend JS (Express)
* Frontend HTML + JS senzill
* Desenvolupament possible en **entorn restringit** (GitHub Codespaces)
* Desplegament a **DigitalOcean** amb Docker (Caddy + backend)

A partir d’aquesta base s’hi han afegit:

* Ingesta de dades meteorològiques
* Tasques internes protegides
* Execució programada amb cron

---

## Arquitectura general

### Components

* **Frontend**: HTML + JS servit per Caddy
* **Backend**: Node.js (Express)
* **Reverse proxy**: Caddy
* **Ingesta**: endpoints interns `/api/tasks/*`
* **Scheduler**: cron del sistema (usuari `deploy`)
* **Contenidors**: Docker Compose

### Flux simplificat

```
Cron (host)
  → scripts/*.sh
    → docker compose exec backend
      → POST /api/tasks/* (localhost:3000)
        → persistència dades
          → API pública /api/v1/*
```

> 🔒 Els endpoints `/api/tasks/*` **NO són públics** i només s’executen des de dins del servidor.

---

## Estructura del repositori

```
/
├─ backend/           # API Express (ping, health, tasks, API pública)
├─ frontend/          # HTML + JS estàtic
├─ scripts/           # Scripts cridats per cron
├─ logs/              # Logs d’ingesta i cron
├─ docs/              # Documentació addicional (opcional)
├─ docker-compose.yml # Caddy + backend
├─ Caddyfile          # Proxy /api/* → backend:3000; frontend a /srv
└─ .devcontainer/     # Desenvolupament amb GitHub Codespaces (Node 20)
```

---

## Desenvolupament

### Opció recomanada: GitHub Codespaces

Pensat per treballar sense instal·lar Node localment.

1. Crear repo (privat o públic) i pujar-hi el projecte
2. **Code → Open with Codespaces → New codespace**
3. Terminal:

   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. Obre el **port 3000** (Forwarded)

Proves bàsiques:

* `GET /api/ping` → `{ ok: true, msg: "pong" }`
* `GET /health`   → `{ ok: true, time: ISO }`

---

## Desplegament a producció (DigitalOcean)

Servidor: Ubuntu + Docker + Docker Compose v2

```bash
git clone <URL_REPO> tecnolord-apps
cd tecnolord-apps
docker compose up -d --build
```

Comprovació:

```bash
curl http://IP_DEL_SERVER/health
```

Caddy:

* Serveix `frontend/`
* Fa proxy `/api/*` → `backend:3000`

---

## Variables d’entorn

### Obligatòries

* `INGEST_API_KEY`

  * Clau compartida per protegir `/api/tasks/*`
  * Es passa com a header `x-api-key`
  * Ha d’estar definida al servei `backend`

---

## Endpoints

### Endpoints interns (tasques)

| Endpoint                  | Mètode | Descripció                         |
| ------------------------- | ------ | ---------------------------------- |
| `/api/tasks/pull-ecowitt` | POST   | Ingesta dades Ecowitt + ACA        |
| `/api/tasks/pull-previ`   | POST   | Ingesta previsió meteorològica 48h |

> 🔒 Només cridables des de dins del servidor via scripts.

### API pública

Exemple:

* `GET /api/v1/previ/48h`

Prova ràpida:

```bash
curl -sS https://tecnolord.cat/api/v1/previ/48h | head
```

---

## Scripts de cron

Ubicació:

```
/home/deploy/tecnolord-apps/scripts/
```

### `pull-ecowitt.sh`

* **Freqüència**: cada 15 minuts
* **Funció**: ingesta Ecowitt + ACA
* **Log**: `logs/pull-ecowitt.log`

### `pull-previ.sh`

* **Freqüència**: cada hora
* **Funció**: ingesta previsió 48h
* **Log**: `logs/pull-previ.log`

Tots dos:

* Executen `docker compose exec backend`
* Fan `POST` amb Node (`node -e fetch`)
* Fallen si `INGEST_API_KEY` no existeix

---

## Cron del sistema

El cron **no està versionat**. Està al sistema, usuari `deploy`.

### Veure’l

```bash
sudo crontab -u deploy -l
```

### Cron actual

```cron
0,15,30,45 * * * * /home/deploy/tecnolord-apps/scripts/pull-ecowitt.sh >> /home/deploy/tecnolord-apps/logs/cron.log 2>&1
0 * * * * /home/deploy/tecnolord-apps/scripts/pull-previ.sh   >> /home/deploy/tecnolord-apps/logs/cron.log 2>&1
```


### Permisos (scripts i logs)

Els scripts s’executen com a usuari `deploy` (via cron). Si veus errors tipus:

- `Permission denied` escrivint a `logs/*.log`

Assegura’t que el directori `logs/` i els fitxers de log són propietat de `deploy` i es poden escriure:

```bash
sudo chown -R deploy:deploy /home/deploy/tecnolord-apps/logs
sudo chmod -R u+rwX,g+rwX /home/deploy/tecnolord-apps/logs
```

I que els scripts tenen bit executable:

```bash
sudo chmod +x /home/deploy/tecnolord-apps/scripts/pull-ecowitt.sh
sudo chmod +x /home/deploy/tecnolord-apps/scripts/pull-previ.sh
```

Per provar manualment com ho farà el cron:

```bash
sudo -u deploy /home/deploy/tecnolord-apps/scripts/pull-ecowitt.sh
sudo -u deploy /home/deploy/tecnolord-apps/scripts/pull-previ.sh
```


---

## Logs

```
logs/cron.log
logs/pull-ecowitt.log
logs/pull-previ.log
```

---

## Proves manuals (diagnosi)

```bash
sudo -u deploy scripts/pull-ecowitt.sh
sudo -u deploy scripts/pull-previ.sh
```

```bash
tail -n 50 logs/cron.log
tail -n 50 logs/pull-ecowitt.log
tail -n 50 logs/pull-previ.log
```

---

## Errors habituals

### `INGEST_API_KEY missing`

* Variable no definida al backend
* Script executat fora del contenidor

### `docker compose: command not found`

* Docker Compose v2 no instal·lat

---

## Bones pràctiques

* No tocar el cron d’ecowitt si funciona
* Un script = una responsabilitat
* Logs separats
* Provar scripts manualment abans de modificar cron

Opcional futur:

* `flock` per evitar execucions solapades
* Alertes si una ingesta falla repetidament

---

## Relleu a un nou desenvolupador (checklist)

1. Llegir aquest README
2. Revisar `docker-compose.yml`
3. Revisar `backend/` (routes, tasks)
4. Revisar `scripts/*.sh`
5. Veure cron (`sudo crontab -u deploy -l`)
6. Mirar logs
7. Provar una execució manual

---

## Notes finals

* El backend no s’ha de tocar per canviar freqüències
* El control temporal és exclusivament a cron
* Els endpoints `/api/tasks/*` són interns

