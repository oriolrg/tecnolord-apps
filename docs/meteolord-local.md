# MeteoLord local — guia operativa de la fase A

Aquesta guia descriu exclusivament el flux local implementat i verificat. Totes les ordres parteixen de l'arrel del repositori. L'entorn només admet dades sintètiques i no autoritza cap connexió o operació sobre producció.

## Prerequisits i plataforma certificada

La plataforma certificada és `linux/amd64` amb aquestes versions:

- Docker Engine `29.1.3`;
- Docker Compose `v5.5.1`;
- Node.js `20.20.2` i npm `10.8.2` dins la imatge Node fixada;
- Playwright `1.63.0` dins la imatge E2E fixada.

Node.js no és un prerequisit de l'host. Docker ha de poder accedir al seu daemon i el port TCP `127.0.0.1:8088` ha d'estar lliure abans d'arrencar el projecte de desenvolupament. La gate usa un projecte test propi i no publica aquest port.

Els selectors immutables aprovats són a [`config/meteolord/images.lock.env`](../config/meteolord/images.lock.env). Un digest absent, no verificable o d'una arquitectura diferent bloqueja el bootstrap.

## Bootstrap separat

El bootstrap és l'única fase que pot necessitar accés als registres d'imatges. No forma part de la gate, que sempre treballa amb `--pull never --no-build`.

Carrega els identificadors sense modificar-los:

```bash
set -a
. ./config/meteolord/images.lock.env
set +a
```

Amb accés explícit al registre i arquitectura `linux/amd64`, les descàrregues aprovades són:

```bash
docker pull --platform linux/amd64 "$NODE_IMAGE"
docker pull --platform linux/amd64 "$POSTGIS_IMAGE"
docker pull --platform linux/amd64 "$PLAYWRIGHT_IMAGE"
```

El pin de Caddy es conserva al lock històric, però Caddy no forma part de la topologia actual i no s'ha d'arrencar.

Les construccions provades, des de l'arrel, són:

```bash
docker build --pull=false -f backend/Dockerfile.local -t meteolord-local:test backend
docker build --pull=false --build-arg PLAYWRIGHT_IMAGE="$PLAYWRIGHT_IMAGE" -f backend/Dockerfile.e2e -t meteolord-e2e:t20-9a1a9e3 backend
```

El Compose referencia la imatge backend pel seu ID immutable, no pel tag `meteolord-local:test`. Després del build cal comparar, sense editar la configuració:

```bash
docker image inspect meteolord-local:test --format '{{.Id}}'
docker compose -f compose.meteolord-local.yml config --images
```

Si els identificadors no coincideixen amb la configuració versionada, cal aturar-se. No s'ha de substituir el pin ni activar un tag flotant.

## Creació de `local.env`

El fitxer local es crea una sola vegada a partir de l'exemple versionat:

```bash
test ! -e config/meteolord/local.env
cp config/meteolord/local.env.example config/meteolord/local.env
chmod 600 config/meteolord/local.env
```

[`config/meteolord/local.env.example`](../config/meteolord/local.env.example) només conté valors sintètics. `local.env` està ignorat per Git i no s'ha de versionar, compartir ni copiar als artefactes.

La validació fail-closed es pot executar amb la imatge Node fixada, sense xarxa:

```bash
docker run --pull never --rm --network none \
  --env-file config/meteolord/local.env \
  --volume "$PWD:/workspace:ro" \
  --workdir /workspace \
  node@sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb \
  node backend/scripts/validate-local-config.js
```

## Arrencada local

Amb els pins disponibles, `local.env` validat i el port 8088 lliure:

```bash
docker compose -f compose.meteolord-local.yml up -d --pull never --no-build
docker compose -f compose.meteolord-local.yml ps
```

Una fallada de configuració, imatge, salut o port és bloquejant. No s'ha d'afegir `--build`, eliminar `pull_policy: never` ni publicar ports addicionals per evitar-la.

## Ordres del wrapper

El contracte real de [`scripts/meteolord-local.sh`](../scripts/meteolord-local.sh) és:

| Operació | Ordre disponible | Estat i precondició |
| --- | --- | --- |
| Validar guards i paths | `./scripts/meteolord-local.sh validate` | Segura; no crea recursos Docker. |
| Inventariar | `./scripts/meteolord-local.sh inventory` | Segura; només llegeix contenidors, xarxes i volums del projecte guardat. |
| Netejar | `./scripts/meteolord-local.sh cleanup` | Destructiva però acotada; inventaria abans i només admet `meteolord-local` o el projecte test derivat del run ID. |
| Executar la gate | `./scripts/meteolord-local.sh gate` | Segura sobre un projecte test nou; exigeix imatges ja presents i no fa pull ni build. |
| Generar un report standalone | `./scripts/meteolord-local.sh report` | Requereix el `report-input.json` complet del mateix commit i run ID; si falta, falla tancat. |

Els noms següents apareixen en planificació però **no estan implementats** al wrapper actual i retornen error d'ús: `bootstrap`, `stop`, `clean`, `status` i `task <nom>`. No s'han de presentar com a aliases funcionals.

Els equivalents operatius provats són:

- `bootstrap`: les ordres Docker de la secció «Bootstrap separat»;
- `stop`: `docker compose -f compose.meteolord-local.yml stop`;
- `clean`: `./scripts/meteolord-local.sh cleanup`;
- `status`: `./scripts/meteolord-local.sh inventory` i `docker compose -f compose.meteolord-local.yml ps`;
- `task <nom>`: el script Node descrit a «Tasques», amb totes les seves precondicions.

## Serveis i origen

La topologia actual conté només `db` i `backend`. L'únic port publicat és el backend a `127.0.0.1:8088`; PostgreSQL no publica cap port. No hi ha Caddy ni cap servei veí.

L'origen local del frontend és:

```text
http://127.0.0.1:8088/meteo/
```

## Migracions i fixtures

[`backend/db/migrate.js`](../backend/db/migrate.js) aplica migracions forward-only, amb advisory lock, transacció per fitxer i validació de checksum. [`backend/scripts/load-local-fixtures.js`](../backend/scripts/load-local-fixtures.js) només admet DB `local`/`test` migrada i fixtures marcades com a sintètiques.

Les invocacions Node requereixen dependències backend, variables locals validades i resolució del host intern `db`:

```bash
node backend/db/migrate.js
node backend/scripts/load-local-fixtures.js
```

Aquestes dues ordres no estan certificades sobre un host sense dependències Node. La gate les executa dins la imatge fixada i la xarxa del projecte test. Tant les migracions com les fixtures són idempotents: repetir-les verifica checksums i evita duplicats.

## Tasques

[`backend/scripts/run-local-task.js`](../backend/scripts/run-local-task.js) accepta exactament:

- `ecowitt`;
- `aca`;
- `ecowitt-aca`;
- `previ`.

Exemple, només dins un runtime Node amb dependències backend, DB local resoluble i els dos guards sintètics actius:

```bash
node backend/scripts/run-local-task.js ecowitt
```

La gate proporciona aquesta composició segura. No s'ha d'executar el script amb configuració productiva ni afegir clients reals.

Les rutes HTTP equivalents són `POST /api/tasks/run/<nom>`. Mantenen l'autenticació existent mitjançant `x-api-key` i la compatibilitat `?key=`; cap clau s'ha d'escriure en documentació, logs o artefactes. Les proves d'integració acrediten paritat de resultat i idempotència entre CLI i HTTP.

## Salut

- `GET /api/ping` és liveness: respon `200 {"ok":true}` sense consultar la DB.
- `GET /health` és readiness: reserva un client nou, executa `SELECT 1` amb timeout de dos segons i l'allibera.
- `/health` respon `200 {"ok":true}` amb DB disponible.
- `/health` respon `503 {"ok":false,"code":"DB_UNAVAILABLE"}` durant una incidència de DB.

El backend registra la pèrdua de connexió en JSONL sense secrets, continua viu i recupera `/health` quan torna PostgreSQL.

## Suites

Des de `backend/`, `npm test` selecciona les suites unitària, integració, HTTP i seguretat:

```bash
cd backend
npm test
```

La precondició és executar-les dins la imatge preparada, amb les dependències i, per als casos d'integració, una DB test descartable. Una suite omesa o marcada `SKIP` no compta com a superada. La forma certificada d'orquestrar totes les precondicions és la gate.

Playwright usa [`backend/playwright.config.js`](../backend/playwright.config.js), `workers: 1`, temps sintètic i un backend resoluble dins la xarxa Docker:

```bash
npx playwright test
```

Aquesta ordre té com a precondicions la imatge E2E preparada, el backend test saludable, `PLAYWRIGHT_BASE_URL` local i el directori d'evidència. Fora d'aquesta composició no es presenta com una execució certificada; la gate és el camí provat.

## Artifacts

Cada execució usa:

```text
artifacts/phase-a/<commit>/<run-id>/
```

`run-id` té format `YYYYMMDD-HHmmss-<sha-curt>`. `artifacts/` està ignorat per Git. Els reports distingeixen `PASS`, `FAIL` i `NOT_RUN`; una prova no executada mai no es presenta com a superada.

## Neteja

Per al projecte seleccionat i només després de revisar l'inventari:

```bash
./scripts/meteolord-local.sh inventory
./scripts/meteolord-local.sh cleanup
```

`cleanup` executa l'inventari abans de `docker compose down --volumes`. Els guards rebutgen projectes diferents de `meteolord-local` i `meteolord-test-<run-id>`. No s'autoritzen `docker system prune`, `docker volume prune`, `docker network prune`, `git reset --hard`, `git clean` ni neteges recursives àmplies.

## Bloquejos coneguts de T04 i T07

T04 és fail-closed: si qualsevol manifest o digest de `linux/amd64` no es pot consultar i verificar, el bootstrap queda bloquejat. No s'inventa ni se substitueix cap digest.

T07 va demostrar que la xarxa Compose actual necessita connectivitat ordinària per publicar el port loopback. Per tant, la configuració no afirma aïllament d'egress a nivell de xarxa. T14 trasllada el control al nivell d'aplicació: en `local`/`test`, els transports injectats rebutgen destinacions no registrades abans de fer xarxa. La gate executa les proves de transport amb `--network none`. No s'ha de relaxar aquest control ni interpretar-lo com permís per usar proveïdors reals.

## Tractament de DEFECT-01

[`DEFECT-01`](sdd/DEFECT-01-zeros-ecowitt-convertits-null.md) descriu la conversió coneguda de zero a `null` en la normalització Ecowitt. La fase A no el corregeix: el cas només està caracteritzat per una prova específica i no compta com a PASS funcional.

## Exclusions de les fases B/C

- Grafana no s'activa ni forma part de la topologia local.
- No s'accedeix a producció ni se'n copien dades o configuracions.
- No es publica cap dada classificada `INTERNAL_ONLY`.
- No s'afegeixen serveis, ports, schedulers o integracions externes.

## Resolució d'incidències

Comprova primer els guards i l'inventari:

```bash
./scripts/meteolord-local.sh validate
./scripts/meteolord-local.sh inventory
docker compose -f compose.meteolord-local.yml config --quiet
docker compose -f compose.meteolord-local.yml ps
```

Per recrear només el backend sense descarregar ni construir imatges:

```bash
docker compose -f compose.meteolord-local.yml up -d --force-recreate --pull never --no-build backend
```

No canviïs el bind de loopback, els pins, el projecte o els guards per resoldre una incidència. Si la DB està temporalment indisponible, `/api/ping` ha de continuar a 200, `/health` ha de donar 503 i recuperar 200 quan la DB torni.

Una comprovació negativa segura dels guards és:

```bash
PROJECT=projecte-no-autoritzat ./scripts/meteolord-local.sh validate
```

Ha de fallar abans de qualsevol acció Docker. Si no falla, no executis cap neteja i tracta-ho com un bloqueig de seguretat.
