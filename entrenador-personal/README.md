# Entrenador Personal

Aplicacio web inicial per planificar, seguir i analitzar entrenaments personals amb JSON com a format central.

## Stack

- Next.js 14 + TypeScript estricte
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth preparat per Google OAuth
- Zod + JSON Schema per validar el pla
- Vitest per tests basics

## Estructura

```text
entrenador-personal/
|- app/                       # Pantalles App Router
|- components/                # UI i blocs reutilitzables
|- lib/
|  |- data/                   # Dades demo i biblioteca d'exercicis
|  |- domain/services/        # Parser, replanificacio, analisi, resum
|  |- domain/types/           # Tipus del domini
|  |- providers/              # ActivityProvider i formats inicials
|  |- validation/             # Zod schema del pla
|- prisma/schema.prisma       # Models de dades
|- training-plan.schema.json  # JSON Schema canonic
|- monthly-plan.example.json  # Exemple de pla mensual realista
|- AI_PLAN_PROMPT.md          # Prompt base per IA futura
|- tests/                     # Parser i motor de replanificacio
```

## Instal.lacio

```bash
cd C:\Users\53395373e\tecnolord-apps\entrenador-personal
npm install
```

## Variables d'entorn

Copia `.env.example` a `.env` i omple:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/entrenador_personal"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

## Desenvolupament

```bash
npm run dev
```

Rutes principals:

- `/login`
- `/dashboard`
- `/calendar`
- `/week`
- `/day/2026-05-04`
- `/exercises`
- `/import-plan`
- `/import-activity`
- `/weekly-summary`
- `/settings`

## Base de dades

Quan tinguis PostgreSQL disponible:

```bash
npx prisma generate
npx prisma db push
```

Els models mins inclosos son:

- `User`
- `TrainingPlan`
- `PlannedSession`
- `Exercise`
- `WorkoutLog`
- `ImportedActivity`
- `WeeklySummary`
- `ActivityProviderConnection`

## Domini implementat

- Parser de plans JSON amb `parseTrainingPlan`
- Validacio amb Zod i esquema JSON separats
- Motor simple de replanificacio basat en regles
- Resum setmanal i analisi basica previst vs real
- Abstraccio `ActivityProvider` per JSON, CSV i GPX
- Preparacio per ampliar a FIT i APIs de plataformes esportives

## Notes sobre autenticacio

L'arquitectura ja inclou:

- `next-auth`
- proveidor Google
- ruta `app/api/auth/[...nextauth]/route.ts`

Falta connectar:

- persistencia real de sessions/usuaris amb Prisma adapter
- proteccio de rutes amb middleware o `auth()`
- flux de sign in/out en components interactius

## DigitalOcean

El repositori queda preparat per desplegar aquesta app com a servei separat:

- servei `entrenador_personal_web`
- reverse proxy a `https://entrenador.tecnolord.cat`
- PostgreSQL reutilitzant el servei `db` existent

Variables necessaries al `.env` del servidor:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
ENTRENADOR_PUBLIC_URL=https://entrenador.tecnolord.cat
```

Desplegament:

```bash
cd /home/deploy/tecnolord-apps
git pull
docker compose up -d --build entrenador_personal_web caddy
```

Comprovacio:

```bash
docker compose ps
docker compose logs --tail=100 entrenador_personal_web
curl -I https://entrenador.tecnolord.cat
```

## Tests

```bash
npm run test
```

Cobertura actual:

- el fitxer d'exemple valida correctament
- els payloads invalids fallen
- la replanificacio prioritza recuperacio i versio curta

## Següents passos recomanats

1. Instal.lar dependencies i arrencar l'app.
2. Connectar Prisma a PostgreSQL i afegir seeds per exercicis.
3. Fer interactius els formularis de registre manual i importacio.
4. Afegir adapter Prisma a NextAuth i protegir les rutes privades.
5. Incorporar persistencia real de resums i logs.
