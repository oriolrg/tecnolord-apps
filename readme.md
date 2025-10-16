# Tecnolord – Phase 1 Starter (Modular, micro-tasques)

Objectiu: **Fase 1 mínima** amb backend JS (Express) i frontend HTML+JS senzill. Parat per:
- Desenvolupar en **entorn restringit** (sense instal·lar Node): **GitHub Codespaces**
- Desplegar a **DigitalOcean** amb Docker (Caddy + backend)

## Estructura
```
/
├─ backend/           # API mínima
├─ frontend/          # HTML + JS que crida l'API
├─ docker-compose.yml # Caddy (serveix frontend) + backend
├─ Caddyfile          # Reverse proxy /api/* -> backend:3000; root /srv per a frontend
└─ .devcontainer/     # Per obrir directament a Codespaces (Node 20)
```

## 1) Desenvolupament (recomanat) — GitHub Codespaces
1. Crea repo privat a GitHub i puja aquests fitxers.
2. Code → **Open with Codespaces** → New codespace.
3. Terminal:
   ```bash
   cd backend && npm install && npm run dev
   ```
4. Obre el **port 3000** (Forwarded). Prova:
   - `GET /api/ping` → `{ "ok":true, "msg":"pong" }`
   - `GET /health`   → `{ "ok":true, ... }`
5. (Opcional) Caddy local: `docker compose up` (si el Codespace ho permet)

## 2) Desplegar a DigitalOcean (sense domini, HTTP)
1. Al servidor (Ubuntu + Docker instal·lat):
   ```bash
   git clone <URL_REPO> tecnolord
   cd tecnolord
   docker compose up -d --build
   curl http://165.232.83.103/health
   ```
2. Caddy servirà `frontend/` i farà proxy a `backend` per a `/api/*`.

## 3) Micro-tasques i DoD (Definition of Done)
- **T1: Backend “ping”**  
  DoD: `curl http://localhost:3000/api/ping` retorna `pong`.
- **T2: Healthcheck**  
  DoD: `GET /health` retorna `{ ok: true }` amb hora ISO.
- **T3: Frontend “hola”**  
  DoD: Arrel `GET /` mostra pàgina i botó que fa `fetch('/api/ping')` i pinta la resposta.
- **T4: Caddy reverse proxy**  
  DoD: A DO, `GET http://IP/` serveix el frontend i `GET http://IP/api/ping` arriba al backend.

> Fase 2 (més endavant): DB, endpoint ingesta, llistats, etc.

## Scripts útils
- Backend: `npm run dev` (watch) | `npm start` (prod)