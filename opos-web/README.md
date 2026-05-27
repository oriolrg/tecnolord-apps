# Opos Web

App web independent dins de `tecnolord-apps` per estudiar i fer simulacres de l'oposicio de facultatiu/IVA informatica del Cos de Mossos d'Esquadra.

S'ha separat d'`entrenador-personal` perque son dominis diferents, tot i compartir stack:

- Next.js 14
- TypeScript estricte
- Tailwind CSS
- Prisma
- SQLite
- Zod
- Vitest

## Estructura

```text
opos-web/
|- app/
|  |- (app)/opos/...       # UI principal
|  |- api/opos/...         # importacio i tancament de sessions
|- components/
|  |- opos/
|  |- ui/
|- lib/opos/               # scoring, import, weak points, recommendations, review queue
|- prisma/schema.prisma    # model de dades SQLite
|- prisma/init.sql         # SQL inicial generat
|- opos.db                 # base SQLite local
|- tests/
```

## Instal.lacio

```bash
cd C:\Users\53395373e\tecnolord-apps\opos-web
npm install
```

## Variables d'entorn

Copia `.env.example` a `.env.local` o `.env`:

```env
OPOS_DATABASE_URL="file:./opos.db"
```

## Inicialitzar la base local

Si `opos.db` no existeix:

```bash
npm run prisma:generate
npm run db:init:sql
npm run db:init
```

Si `opos.db` ja existeix, no tornis a executar `db:init`; simplement arrenca l'app.

## Execucio local

```bash
npm run dev
```

Rutes principals:

- `/opos`
- `/opos/import`
- `/opos/imports`
- `/opos/questions`
- `/opos/tests/new`
- `/opos/mock-exams`
- `/opos/analytics`
- `/opos/recommendations`
- `/opos/progress`
- `/opos/settings`

## Validacio

Tests unitaris afegits:

```bash
npm run test
```

Cobertura actual:

- formula de puntuacio oficial
- penalitzacio d'errors
- blancs i limit inferior 0
- validacio JSON
- duplicats
- weak points
- recomanacions
- repas espaiat

## Notes de desplegament

Com a app separada, es pot desplegar en subruta `/opos` via reverse proxy o en un subdomini propi.

Abans d'exposar-la publicament:

- afegeix proteccio d'acces
- munta `opos.db` en volum persistent
- mantingues backup regular de la base SQLite

## DigitalOcean

Aquest repo ja queda preparat per Docker Compose + Caddy:

- servei `opos_web`
- proxy principal a `https://tecnolord.cat/opos`
- proxy API a `https://tecnolord.cat/api/opos/*`
- persistencia SQLite amb `./opos-web/opos.db:/app/opos.db`

Desplegament:

```bash
cd /home/deploy/tecnolord-apps
git pull
docker compose up -d --build opos_web caddy
```

Comprovacio:

```bash
docker compose ps
docker compose logs --tail=100 opos_web
curl -I https://tecnolord.cat/opos
```
