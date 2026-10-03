# PROD-01 — RC mínima de compatibilitat legacy

## Estat

**PROD-01 COMPLETED / HISTORICAL.**
El cutover productiu legacy → `321b8a5` ja es va executar satisfactòriament i
el runner V4 ha superat el dry-run PostgreSQL/PostGIS físic complet sobre una
restauració independent pre-cutover.

PROD-01 només és aplicable a una base legacy **PRE-CUTOVER**. La producció
actual `meteo` ja està migrada, queda fora de l'abast i no pot tornar a ser
target de PROD-01.

- **SCOPE:** `HISTORICAL / REPRODUCIBILITY ONLY`.
- **PRODUCTION:** `NEVER A VALID TARGET`.

L'executor es conserva per auditoria i reproducció del baseline pre-cutover; no
forma part del mecanisme normal de deploy.

Base del worktree `prod-minimal-rc`: `321b8a503873df62cfef6ab541fc2f8f5bbef2b3`.

## Tancament físic V4

Resultat acceptat el 2026-10-04:

- `RUN_ID=20261003_220226`;
- target exclusiu `meteo_prod_dryrun_20261003_220226`;
- bundle `prod01-operator-bundle-v4-20261003T182655Z.tar.gz`;
- RESTORE, PRE-CUTOVER, APPLY, VERIFY, postflight, tests i final safety: PASS;
- resultat final: `FINAL=PASS`.

La safety gate va demostrar que l'inventari de bases productiu, l'ID del
contenidor productiu i els mounts productius no van canviar. L'única connexió
d'inventari productiu va ser a `postgres`, les connexions a bases target de
producció van ser 0 i no es va executar cap ordre de cleanup.

El delta del clúster descartable va ser exactament:

```text
BEFORE                         AFTER
postgres                       meteo_prod_dryrun_20261003_220226
template_postgis               postgres
                               template_postgis
```

Les suites van passar amb 43/43 proves PROD-01, 219/219 unitàries, 43/43 HTTP,
4/4 de seguretat i `SKIP=0`. La suite general d'integració continua exclosa per
contracte perquè crea bases `meteolord_test_*` i trencaria l'aïllament d'aquest
dry-run; restore, PRE-CUTOVER, APPLY, VERIFY i postflight proporcionen la prova
PostgreSQL/PostGIS física dins l'entorn descartable.

### Traçabilitat dels runs físics

| Run | Resultat | Etapa | Defecte detectat i enduriment resultant |
|---|---|---|---|
| `20261002_223602` | FAIL | restore | Race de readiness; el runner passa a esperar el PostgreSQL final després del postmaster temporal. |
| `20261003_080833` | FAIL | apply | Pathname AF_UNIX massa llarg; el socket runtime passa a una ruta curta, exclusiva per run i amb límit de 100 bytes. |
| `20261003_175050` | FAIL | final-safety-gate | L'expectativa no incorporava el baseline real del clúster descartable; BEFORE i AFTER passen a usar el mateix inventari i el gate exigeix `baseline + target`. |
| `20261003_220226` | PASS | complet | Runner V4: totes les etapes, proves i safety gates superades. |

Els tres intents fallits es conserven com a evidència de l'enduriment del
runner. No s'ha autoritzat ni executat cleanup dels entorns físics i les seves
evidències. PROD-01 queda tancat per reproduïbilitat i auditoria i no forma part
del runbook normal; executar-lo de nou sobre `meteo` continua prohibit.

## Objectiu i abast

Afegir a un clon legacy l'esquema requerit per la RC sense canviar les files d'històric meteorològic, hidro, forecast, auth legacy ni Biblioteca. `home` (id 1, `Casa`, Ecowitt) continua sent l'estació principal. Cron Ecowitt, ingestió hidro i forecast continuen fent servir les taules legacy. La RC consulta `meteo.mesures` si no hi ha `current_snapshot`.

Aquesta fase no importa Grafana/Cabrera, no crea connectors, bindings, secrets, snapshots, credencials ni sessions, no activa captures d'històric, i no canvia cron, Caddy, Docker ni serveis.

## Inventari i diferències respecte les migracions locals

- `0001`: les taules `auth.usuaris`, `meteo.estacions`, `meteo.mesures`, hidro i membres s'adopten. La ruta de producció no les crea ni modifica files. El preflight comprova taules i columnes essencials; noms legacy de constraints poden diferir.
- `0002`: s'adopten `meteo.forecast_run` i `meteo.forecast_hourly`. Només s'afegeixen la FK `station_code → estacions(codi)`, el CHECK `hours BETWEEN 1 AND 48` i l'índex de consulta si falten; no es recreen taules ni files. Equivalents semàntics existents es conserven.
- `0003`: s'aplica el SQL additiu original: PostGIS si disponible, quatre columnes d'usuari, sis de metadades d'estació, noves taules de RC i el singleton `public_view_config`. Cap promoció a SUPERADMIN ni credencials inventades.
- `0004` i `0005`: s'apliquen els canvis additius de descripció, política de localització i `map_catalog_state`.
- `0006`: no s'aplica; les sis referències estimades i l'activació de punts són fora de la RC mínima. La taula `estimation_points` creada per `0003` queda buida.
- `0007`: s'aplica el DDL de polítiques d'històric; les taules queden buides i cap política activa.

Les migracions locals `0001`–`0007` no es reescriuen. L'executor selecciona explícitament els fitxers originals reutilitzats i verifica els seus SHA-256 durant la lectura. La ruta està separada de `backend/db/migrate.js`, que només accepta local/test.

## Model PRE/POST

`--apply` captura el PRE dinàmicament del target explícit, aplica tots els canvis dins una sola transacció, captura POST del mateix target i compara els agregats de totes les taules legacy abans de COMMIT. Inclou recompte, rangs de columnes temporals, `max(id)` i sumes numèriques quan apliquen, seqüències amb `last_value` i `is_called`, estat de `home`, estacions hidro i recomptes/rangs per estació, auth/aplicacions/membres, `public.measurement`, forecast i taules Biblioteca. La comparació és estricta i no usa valors de producció fixats en SQL. PRE s'escriu abans de migrar. El POST validat s'escriu com `POST.pending.json`; només després d'un COMMIT satisfactori es reanomena atòmicament a `POST.json`. Una divergència fa ROLLBACK i una fallada de COMMIT no pot publicar `POST.json`. Els manifests són evidència agregada sense emails, secrets ni files meteorològiques.

`--verify` és read-only i compara un PRE proporcionat amb una captura fresca, a més de comprovar l'esquema RC i `home`. En una base viva pot detectar escriptures legítimes posteriors; per això el gate de dades s'ha d'executar en una finestra sense escriptures concurrents. Els recomptes, rangs i sumes no constitueixen una prova criptogràfica de cada fila; l'absència de DML sobre les taules protegides i el rollback transaccional són controls complementaris.

## Guard de target

`TARGET_DB` és obligatori. El contracte vigent només autoritza
`meteo_prod_dryrun_YYYYMMDD_HHMMSS`, creat de nou des del backup pre-cutover
verificat. `meteo`, `meteo_restore_test`, `meteo_beta`, `postgres`, `template0`,
`template1` i altres noms estan prohibits. `--production` ja no és un argument
vàlid i les antigues variables `ALLOW_PRODUCTION` i
`PRODUCTION_CONFIRM_TARGET` no poden autoritzar cap target. El parseig i el
guard s'executen abans d'obrir la connexió.

Cada connexió valida `SELECT current_database()` abans de qualsevol DDL/DML i
de nou abans de cada bloc SQL. No hi ha `DROP DATABASE`, `DROP SCHEMA`,
`TRUNCATE`, `setval` ni reparació automàtica. Un target amb objectes RC previs
falla en lloc de reexecutar a cegues. Immediatament després d'obrir la
transacció APPLY s'adquireix un `pg_try_advisory_xact_lock` específic de
PROD-01. Si no s'obté, es fa ROLLBACK abans de PRE i de qualsevol migració.
VERIFY és read-only i no adquireix aquest lock.

## Dades que poden canviar

Només les noves columnes de `auth.usuaris` reben els defaults RC `PENDING_EMAIL`/`USER` o NULL; les noves columnes de `meteo.estacions` reben els defaults RC i UUID; `home.visibility` (columna nova) passa a `PUBLIC`. S'insereixen els singleton `meteo.public_view_config` apuntant a `home` i `meteo.map_catalog_state`. PostGIS i objectes RC nous són additius. `owner_id` continua NULL per `home` i no es copia `creat_per_usuari`.

## Dades que no poden canviar

Totes les columnes i files legacy de `meteo.mesures`, `meteo.mesures_bak_ytd`, `meteo.lectures_hidro`, `meteo.estacions_hidro`, `meteo.forecast_run`, `meteo.forecast_hourly`, `public.measurement`, `biblioteca.*`, `auth.*` legacy i la resta de dades existents. No es reinicien seqüències: `last_value > max(id)` és legítim i es preserva.

## `home` i compatibilitat de rollback

`home` ha de conservar `id=1`, `codi=home`, `nom=Casa`, `proveidor=ecowitt`, `activa=true` i coordenades NULL. Les noves metadades són `management_kind=LEGACY`, `lifecycle=ACTIVE`, `visibility=PUBLIC`, `owner_id=NULL`. `public_view_config.public_station_id=1`. `publicViewService` i `stationCatalogService.globalPublic()` no exigeixen `station_locations` per a una estació LEGACY pública; la ruta `/stations/.../current` té fallback a `meteo.mesures`. No es crea `station_locations`, connector Ecowitt, binding ni secret.

Tot el DDL previst és additiu sobre taules legacy, amb constraints/índexs nous de forecast; cap columna o objecte antic s'elimina o renombra. L'antic backend continua consultant i escrivint les seves taules. El rollback d'aplicació consisteix a tornar a usar el backend antic amb l'esquema ampliat; no existeix rollback destructiu d'esquema. Un preflight que descobreixi una incompatibilitat de dades o d’objectes RC s’atura abans d’escriure; qualsevol incompatibilitat de tipus o constraint descoberta durant el DDL provoca ROLLBACK. El writer antic de forecast limita `hours` a 1–48 i usa `home` per defecte; un `PREVI_STATION_CODE` configurat ha de referir-se a un codi d’estació existent perquè la FK nova el permeti.

## Backup candidat pre-cutover

Artefacte candidat:

- path documentat:
  `/home/deploy/backups/meteo/meteo-20260925T101137Z.dump`;
- format: PostgreSQL custom (`-Fc`), creat amb PostgreSQL 16.4;
- SHA-256:
  `0da4e0402aec92348632b334d41fb88dfe5e286f56f7c5af4b36696daf8a7f8b`;
- evidència: PR02 PASS, PR03 restore PASS i fingerprint PR04 READ ONLY PASS.

Evidències versionades que formen el baseline:

- [`PR02-backup-verification.json`](../evidence/PR02-backup-verification.json);
- [`PR03-restore-verification.json`](../evidence/PR03-restore-verification.json);
- [`PR04-readonly-fingerprint-summary.json`](../evidence/PR04-readonly-fingerprint-summary.json);
- [`PR04-readonly-fingerprint.ndjson`](../evidence/PR04-readonly-fingerprint.ndjson),
  SHA-256 immutable
  `4434d95f84e2301129626a6964679ee1d8fa2641682f366f16a85dbab333e469`.

Representa el baseline correcte perquè el restore PR03 va conservar les taules,
dades, seqüències, constraints i schemas legacy, i PR04 va demostrar que els
18 objectes RC nous, les quatre columnes RC d'`auth.usuaris` i les set
columnes RC de `meteo.estacions` eren absents. Els 12 invariants PR03 i tots
els preflights reportats coincidien; PostGIS també era absent.

El dump
`/home/deploy/meteo-backups/meteo-final-pre-grafana-20261001T170841Z.dump`
**no és candidat**: és anterior al cutover Grafana, però posterior a la
migració d'esquema PROD-01, com demostren `public_id`,
`management_kind`, `visibility` i la resta d'objectes RC presents.

## Gate PRE-CUTOVER obligatori

Abans d'APPLY, una transacció `REPEATABLE READ READ ONLY` sobre el clon nou
ha de demostrar conjuntament:

1. checksum exacte del dump PR02 i `pg_restore --list` satisfactori;
2. target nou amb nom `meteo_prod_dryrun_YYYYMMDD_HHMMSS`, diferent de
   `meteo`, `meteo_restore_test`, `meteo_beta` i templates;
3. els 18 objectes RC nous i `meteo_local.schema_migrations` absents;
4. columnes RC d'`auth.usuaris` i `meteo.estacions` absents;
5. PostGIS no instal·lat al target, però disponible a
   `pg_available_extensions`;
6. `home` legacy exacte: id 1, codi `home`, nom `Casa`, Ecowitt, activa i
   sense coordenades;
7. recomptes PR03 exactes: estacions 1, mesures 94.095,
   `mesures_bak_ytd` 61.942, estacions hidro 3, lectures hidro 246.234,
   forecast runs 5.933, forecast hourly 284.784, usuaris 1, aplicacions 1,
   membres estació 1 i `public.measurement` 18;
8. cap duplicat/orfe/valor forecast invàlid dels preflights PR04;
9. comparació amb el fingerprint PR04 immutable, normalitzant només
   `database`, `target_database`, `collected_at` i l'errata PR04 tancada dels
   cinc `rc_view_probe` que no pertanyen al contracte RC.

Qualsevol diferència és FAIL abans de DDL. `meteo_restore_test` es manté
immutable i no s'utilitza com a target del dry-run.

L'ordre única és `scripts/prod/prod-01-precutover.sh`. Executa el collector
parametritzat, que usa `REPEATABLE READ READ ONLY`, verifica silenciosament
`current_database()`, disponibilitat de PostGIS i el contracte exacte de
`home`, i després aplica el gate estricte al fingerprint. Publica
`PRE-CUTOVER.json` només si el resultat és `PROD01_PRECUTOVER_GATE_PASS`.
L'evidència del dry-run queda a:

```text
artifacts/prod-01/<run-id>/
  backup.sha256
  backup-stat.txt
  backup-toc.txt
  readiness.log
  socket-path.txt
  environment.txt
  source-sha256.txt
  restore.log
  PRE-CUTOVER.json
  apply/PRE.json
  apply/POST.json
  verify/VERIFY.json
  postflight.txt
  test-summary.txt
  manifest-sha256.txt
  PRODUCTION-SAFETY.txt
  EVIDENCE-SHA256SUMS.txt
  RESULT.txt
```

Cap fitxer inclou passwords, connection strings, API keys, secrets ni un
`.env` complet.

## Ordre exacta d'operador

L'agent local no executa ordres al Droplet. L'operador ha de disposar en aquell
host d'una còpia d'aquest worktree, amb dependències Node instal·lades, i
executar una única ordre des de l'arrel:

```sh
PROD01_EXTERNAL_BACKUP_COPY=PENDING \
  scripts/prod/prod-01-operator.sh
```

Si existeix evidència documental d'una còpia independent de PR02, es pot usar:

```sh
PROD01_EXTERNAL_BACKUP_COPY=PROVEN \
PROD01_EXTERNAL_BACKUP_REFERENCE='<referència documental sense secrets>' \
  scripts/prod/prod-01-operator.sh
```

El valor `PENDING` no bloqueja el dry-run, però queda registrat. No cal indicar
el target: l'script genera un `RUN_ID` UTC i deriva exclusivament
`meteo_prod_dryrun_YYYYMMDD_HHMMSS`. També es pot fixar el run abans de començar,
sempre sobre un directori, contenidor i volum inexistents:

```sh
PROD01_RUN_ID=YYYYMMDD_HHMMSS \
PROD01_EXTERNAL_BACKUP_COPY=PENDING \
  scripts/prod/prod-01-operator.sh
```

L'script atura el procés davant qualsevol divergència i no fa cleanup. Crea:

- el contenidor `meteolord-prod01-dryrun-<RUN_ID>` amb `--network none`;
- el volum nou `meteolord_prod01_dryrun_<RUN_ID>`;
- un socket Unix runtime exclusiu en una ruta curta, sense publicar ports;
- un únic target persistent `meteo_prod_dryrun_<RUN_ID>` des de `template0`.

El runner v4 conserva el gate de readiness v2 i no considera suficient un únic `pg_isready`: durant la
inicialització de la imatge oficial pot respondre el postmaster temporal i
aturar-se abans d'arrencar el procés final. El gate espera que PID 1 sigui
`postgres`, valida una consulta SQL sobre `postgres` i exigeix dos probes finals
consecutius. La seqüència `temporary ready → shutdown → final ready` està
coberta per regressió.

El socket Unix runtime queda separat de les evidències a
`/home/deploy/prod01-sockets/<RUN_ID>`. El directori ha de ser nou i exclusiu;
si ja existeix, l'execució falla abans de crear el contenidor. APPLY i VERIFY
usen exactament aquesta mateixa ruta. El pathname complet del socket es limita
a 100 bytes, per sota dels 108 bytes de `sockaddr_un.sun_path`, i es registra a
`socket-path.txt`. No hi ha cleanup automàtic del socket ni de l'entorn.

No s'executa la suite d'integració general perquè crea bases temporals
`meteolord_test_*` i contradiria el contracte d'aquest dry-run. La validació
PostgreSQL física queda coberta pel restore, PRE-CUTOVER, APPLY, VERIFY i
postflight sobre el target històric. Les proves dirigides, unitàries, HTTP i de
seguretat no creen bases addicionals. El gate final captura l'inventari inicial
real del clúster descartable i exigeix que l'inventari final sigui exactament
aquest baseline més `PROD01_TARGET`. BEFORE i AFTER provenen de la mateixa
funció, consulta i filtres; no es pressuposen ni es fixen noms propis de la
imatge com `template_postgis`.

L'ordre interna és: inventari productiu READ ONLY sobre `postgres`; checksum i
TOC de PR02; creació i guard de l'entorn descartable; target; restore;
PRE-CUTOVER; APPLY; VERIFY; postflight READ ONLY; proves dirigides, unitàries,
HTTP i de seguretat; gate final de bases i mounts. Ni
`prod-01-operator.sh` ni els seus auxiliars contenen `ssh`, `scp` o `rsync`.

El run `20261003_220226` va completar APPLY, VERIFY, postflight, tests i final
safety. Les evidències van ser retornades i revisades, i aquesta revisió tanca
PROD-01 com `COMPLETED / HISTORICAL`.

## Criteris PASS/FAIL

PASS exigeix, en aquest ordre: dump i TOC verificats; restore nou sense errors;
gate PRE-CUTOVER complet; APPLY amb PRE/POST idèntics per dades legacy;
postflight RC; COMMIT; publicació atòmica de `POST.json`; VERIFY read-only
sobre captura fresca; cap dada opcional o històric Grafana activat.

És FAIL qualsevol checksum diferent, target existent/prohibit, fingerprint
divergent, objecte o columna RC ja present, PostGIS ja instal·lat, invariant
PR03 diferent, preflight invàlid, lock no adquirit, error SQL, divergència
PRE/POST, fallada de COMMIT, absència de `POST.json` final, VERIFY divergent o
qualsevol diferència entre l'inventari final descartable i `baseline + target`.
Una fallada atura el procés i no autoritza reparació ni reexecució sobre el
mateix clon.

## Riscos i incoherències

- El run V4 va verificar físicament el path, checksum i TOC del dump PR02 abans
  del restore. L'ID real de la imatge i l'entorn queden registrats a les
  evidències del run; el tag `postgis/postgis:16-3.4` per si sol no és evidència
  immutable.
- El dump és al mateix Droplet segons PR02; cal preservar-ne una còpia externa
  abans de dependre'n com a artefacte històric.
- El restore amb `template0` va registrar collation 2.31/2.31, mentre la BD
  legacy original registrava 2.41 amb runtime 2.31. Reprodueix esquema i dades,
  però no el mismatch de metadades de collation. L'avís continua conegut i no
  s'ha executat `REFRESH COLLATION VERSION`.
- La comparació estricta també cobreix owner, ACL, build PostgreSQL i collation;
  una imatge o un usuari de restore diferents del baseline poden produir un
  FAIL legítim i no s'han de normalitzar per forçar el PASS.
- Les evidències PR02–PR04 estan empaquetades amb l'artefacte històric. El raw
  PR04 és immutable i el gate en comprova el SHA-256 abans de comparar.

## Validació local

El cutover productiu real i el dry-run històric físic V4 han completat la
migració satisfactòriament. Passen 43 tests dirigits, inclosos
els guards de target, el collector/gate, lock adquirit/no adquirit, concurrència
conceptual, COMMIT satisfactori/fallit, divergència PRE/POST i el delta estricte
de bases del clúster descartable. També passen 219
unitaris, 43 HTTP i 4 de seguretat, sense skips. La validació
PostgreSQL/PostGIS física és PASS. Estat documental final:
`COMPLETED / HISTORICAL`.
