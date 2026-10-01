# PROD-01 — RC mínima de compatibilitat legacy

## Estat

PROD-01 READY FOR REVIEW. Disseny i implementació locals; no és un desplegament ni una autorització per executar contra `meteo`.
Base del worktree `prod-minimal-rc`: `321b8a503873df62cfef6ab541fc2f8f5bbef2b3`.

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

`--apply` captura el PRE dinàmicament del target explícit, aplica tots els canvis dins una sola transacció, captura POST del mateix target i compara els agregats de totes les taules legacy abans de COMMIT. Inclou recompte, rangs de columnes temporals, `max(id)` i sumes numèriques quan apliquen, seqüències amb `last_value` i `is_called`, estat de `home`, estacions hidro i recomptes/rangs per estació, auth/aplicacions/membres, `public.measurement`, forecast i taules Biblioteca. La comparació és estricta, no fa servir valors de producció fixats en SQL. Si divergeix, es fa ROLLBACK de la transacció. Els manifests host `PRE.json` i `POST.json` són evidència agregada; no contenen emails, secrets ni files meteorològiques.

`--verify` és read-only i compara un PRE proporcionat amb una captura fresca, a més de comprovar l'esquema RC i `home`. En una base viva pot detectar escriptures legítimes posteriors; per això el gate de dades s'ha d'executar en una finestra sense escriptures concurrents. Els recomptes, rangs i sumes no constitueixen una prova criptogràfica de cada fila; l'absència de DML sobre les taules protegides i el rollback transaccional són controls complementaris.

## Guard de target

`TARGET_DB` és obligatori. Només s'admet `meteo_prod_dryrun_YYYYMMDD_HHMMSS` o `meteo` amb `--production`, `ALLOW_PRODUCTION=PROD-01-APPLY-meteo` i `PRODUCTION_CONFIRM_TARGET=meteo`. `meteo_restore_test`, `meteo_beta`, `postgres`, `template0`, `template1` i altres noms sempre fallen. Cada connexió valida `SELECT current_database()` abans de qualsevol DDL/DML i de nou abans de cada bloc SQL. No hi ha `DROP DATABASE`, `DROP SCHEMA`, `TRUNCATE`, `setval` ni reparació automàtica. Un target amb objectes RC previs falla en lloc de reexecutar a cegues.

## Dades que poden canviar

Només les noves columnes de `auth.usuaris` reben els defaults RC `PENDING_EMAIL`/`USER` o NULL; les noves columnes de `meteo.estacions` reben els defaults RC i UUID; `home.visibility` (columna nova) passa a `PUBLIC`. S'insereixen els singleton `meteo.public_view_config` apuntant a `home` i `meteo.map_catalog_state`. PostGIS i objectes RC nous són additius. `owner_id` continua NULL per `home` i no es copia `creat_per_usuari`.

## Dades que no poden canviar

Totes les columnes i files legacy de `meteo.mesures`, `meteo.mesures_bak_ytd`, `meteo.lectures_hidro`, `meteo.estacions_hidro`, `meteo.forecast_run`, `meteo.forecast_hourly`, `public.measurement`, `biblioteca.*`, `auth.*` legacy i la resta de dades existents. No es reinicien seqüències: `last_value > max(id)` és legítim i es preserva.

## `home` i compatibilitat de rollback

`home` ha de conservar `id=1`, `codi=home`, `nom=Casa`, `proveidor=ecowitt`, `activa=true` i coordenades NULL. Les noves metadades són `management_kind=LEGACY`, `lifecycle=ACTIVE`, `visibility=PUBLIC`, `owner_id=NULL`. `public_view_config.public_station_id=1`. `publicViewService` i `stationCatalogService.globalPublic()` no exigeixen `station_locations` per a una estació LEGACY pública; la ruta `/stations/.../current` té fallback a `meteo.mesures`. No es crea `station_locations`, connector Ecowitt, binding ni secret.

Tot el DDL previst és additiu sobre taules legacy, amb constraints/índexs nous de forecast; cap columna o objecte antic s'elimina o renombra. L'antic backend continua consultant i escrivint les seves taules. El rollback d'aplicació consisteix a tornar a usar el backend antic amb l'esquema ampliat; no existeix rollback destructiu d'esquema. Un preflight que descobreixi una incompatibilitat de dades o d’objectes RC s’atura abans d’escriure; qualsevol incompatibilitat de tipus o constraint descoberta durant el DDL provoca ROLLBACK. El writer antic de forecast limita `hours` a 1–48 i usa `home` per defecte; un `PREVI_STATION_CODE` configurat ha de referir-se a un codi d’estació existent perquè la FK nova el permeti.

## Execució posterior sobre clon i VERIFY

Des d'aquest worktree, amb Node i dependències backend instal·lades i variables `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` configurades per l'operador:

```sh
TARGET_DB=meteo_prod_dryrun_20260930_211605 node scripts/prod/prod-01.js --apply --out-dir artifacts/prod-01/dryrun-20260930-211605
TARGET_DB=meteo_prod_dryrun_20260930_211605 node scripts/prod/prod-01.js --verify --pre artifacts/prod-01/dryrun-20260930-211605/PRE.json --out-dir artifacts/prod-01/dryrun-20260930-211605/verify
```

Aquestes ordres són per a una execució posterior autoritzada. No s'executen en PROD-01.

## Riscos i criteris PASS/FAIL

PASS exigeix target autoritzat i verificat, esquema legacy preflight compatible, PostGIS disponible, `home` exacte, PRE/POST iguals, postflight RC i absència de dades opcionals activades. Qualsevol target desconegut, objecte RC preexistent, FK forecast no vàlida, divergència de dades o de seqüència, o contracte públic trencat és FAIL amb ROLLBACK. PostgreSQL pot mantenir estat de seqüències no transaccional si alguna operació les avançés; aquest executor no demana `nextval` sobre seqüències legacy i la comparació ho detecta.

## Validació local

Els tests dirigits de PROD-01, la suite unitària, HTTP i de seguretat de la RC passen. La suite d'integració sense BD local executa les proves independents de BD i deixa les proves amb PostgreSQL en SKIP; això no acredita l'execució dels SQL contra un clon. El primer dry-run documentat és el gate pendent de compatibilitat física amb el legacy real.
