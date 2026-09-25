# PR04 — Pla candidat de migració a `meteo_beta`

## Propòsit i límits

Aquest és un runbook candidat. No conté una ordre autoritzada per executar la
migració. PR04 no crea `meteo_beta`, no modifica `meteo_restore_test`, no toca
`meteo`, no arrenca la beta i no activa cap font externa.

La primera execució futura serà exclusivament sobre una BD nova `meteo_beta`,
creada des del backup restaurable verificat a PR02/PR03.

## Estratègia

La migració serà additiva i específica per a legacy. No reutilitzarà
directament `backend/db/migrate.js` ni executarà en bloc `0001`–`0007`.

Es proposen cinc passos versionats sota un executor productiu separat, encara
no implementat:

| Pas | Contingut | Efecte sobre dades legacy |
|---|---|---|
| `P04-000-preflight` | fingerprint, asserts de destí i compatibilitat | cap; read-only |
| `P04-010-identity-stations` | columnes auth/estacions i taules noves base | backfills enumerats, sense promocions |
| `P04-020-catalog-snapshots` | PostGIS compatible, ubicacions, connectors, bindings, snapshots i catàleg | ubicacions privades només si són vàlides; bindings no inferits |
| `P04-030-history-forecast` | imports, auditoria, política històrica i reconciliació forecast | forecast existent adoptat; històric meteorològic/hidro intacte |
| `P04-040-reference-ledger` | singletons, sis punts d'estimació, índexs finals, validació i ledger | només files de referència enumerades |

Cada pas ha de tenir checksum, lock d'advisory propi, `lock_timeout`,
`statement_timeout`, transacció quan el DDL ho permeti i postcondicions. El
nom de la BD s'ha de validar com `meteo_beta`; qualsevol altre destí falla
abans de la primera escriptura.

## Fase 0 — Preparació fora de la BD

1. Fixar el commit `321b8a5` i els set checksums documentats a `PR04.md`.
2. Obtenir l'empremta read-only de `meteo_restore_test` i adjuntar-la a PR04.
3. Crear una nova `meteo_beta` des del mateix artefacte verificat, sense
   modificar el restore pristine.
4. Bloquejar connexions d'aplicació, workers, cron, ingesta Ecowitt/Grafana,
   forecast i purgues a la beta.
5. Capturar manifest previ de totes les taules de tots els esquemes:
   recomptes exactes, min/max de PK i temps, hashes per blocs, seqüències,
   constraints i índexs.

Gate: el fingerprint de `meteo_beta` ha de ser idèntic al de
`meteo_restore_test`. Una diferència atura el procés.

## Fase 1 — Preflight bloquejant

En una transacció read-only:

- confirmar `current_database()='meteo_beta'`;
- confirmar versions PostgreSQL/PostGIS compatibles;
- confirmar que no hi ha sessions d'escriptura de l'aplicació;
- verificar absència de files òrfenes a totes les FK legacy;
- verificar unicitat de correus, codis d'estació i parelles
  `(estacio_id, instant)`;
- verificar rang i completitud de coordenades legacy;
- classificar forecast com `MATCH`, `PARTIAL`, `ABSENT` o `CONFLICT`;
- verificar que cada `forecast_run.station_code` existent correspon a un
  `meteo.estacions.codi` abans d'afegir o validar la FK RC;
- confirmar que els objectes `biblioteca` i els seus ledgers existeixen amb la
  mateixa empremta del manifest;
- detectar si ja existeix qualsevol objecte RC nou. Una existència parcial no
  es tracta amb `IF NOT EXISTS`: es compara o es rebutja.

Gate: zero conflictes sense resolució. No es corregeix automàticament cap dada.

## Fase 2 — Identitat i estacions

### `auth.usuaris`

Afegir les quatre columnes RC de manera que el backfill sigui explícit:

- comptes existents: `account_status='PENDING_EMAIL'` i
  `application_role='USER'`;
- `email_verified_at=NULL` i `approved_at=NULL`;
- després establir defaults i NOT NULL de l'RC;
- afegir checks d'estat i rol.

Crear `credentials`, `sessions`, `account_tokens` i `user_preferences` amb les
FK, checks i índexs RC. No copiar `passwd_hash` sense un informe de format
compatible. No crear cap `SUPERADMIN`; el bootstrap administratiu és una
operació posterior explícita.

### `meteo.estacions`

Afegir, backfillejar i restringir en aquest ordre:

1. `public_id`: UUID diferent per fila, verificació de duplicats i UNIQUE;
2. `owner_id=NULL` amb FK a auth;
3. `management_kind='LEGACY'`;
4. `lifecycle`: `ACTIVE` per defecte; si existeix `activa=false`, proposar
   `RETIRED` i registrar el recompte exacte abans d'aplicar-ho;
5. `visibility='PRIVATE'`;
6. `revision=0`;
7. `description=NULL` amb límit de 500 caràcters.

No modificar les columnes legacy ni `id`, `codi`, `nom` o
`creat_per_usuari`. Ajustar `estacions_id_seq` només si el preflight demostra
que està per sota del màxim ID; registrar abans/després.

## Fase 3 — Catàleg, ubicacions i fonts

1. Confirmar PostGIS. Si és absent, instal·lar-lo a `public` només amb una
   decisió operativa prèvia i el rol adequat; si existeix en un altre schema,
   aturar-se.
2. Crear `station_locations` amb el contracte final de `0003+0005`.
3. Per cada estació amb longitud i latitud completes i vàlides, inserir només
   `private_geometry=ST_SetSRID(ST_MakePoint(longitud,latitud),4326)`, mode
   `HIDDEN`, geometria pública nul·la, sense consentiment i amb procedència
   legacy. Files parcials o invàlides s'informen i no es transformen.
4. Crear `station_connectors`, `connector_secrets`, `source_bindings` i
   `current_snapshots`.
5. No crear connectors o secrets automàticament. No copiar secrets des de
   fitxers o environment al SQL de migració.
6. Crear bindings Ecowitt només des d'un mapping de PR01/PR03 verificat. Si no
   hi ha external id demostrable, deixar la taula sense aquella fila.
7. No importar les 29 estacions Grafana en aquest pas. La importació H06 és una
   operació de dades posterior, transaccional i auditable.
8. Deixar `current_snapshots` buit. Un backfill opcional des de l'última mesura
   exigeix binding verificat i una tasca separada amb contracte de qualitat.

Crear `estimation_points`, `public_view_config` i `map_catalog_state`. Inserir
els singletons amb control de contingut, no amb una escriptura cega.

## Fase 4 — Imports, auditoria, històric i forecast

Crear exactament les taules, FK i checks RC:

- `import_batches`;
- `import_rows`;
- `manual_overrides`;
- `audit_events`;
- `station_history_policies`;
- `history_capture_runs`.

No crear cap política històrica habilitada i no executar captura o retenció.
No escriure a `meteo.mesures`.

Per forecast:

- `MATCH`: conservar i només afegir índexs/checks absents equivalents;
- `PARTIAL`: generar una adaptació revisada objecte per objecte, sense còpies
  ni recreació destructiva;
- `ABSENT`: crear `forecast_run` i `forecast_hourly` com a `0002`;
- `CONFLICT`: aturar la migració.

No modificar ni eliminar `forecast_feedback` o altres extensions legacy.

## Fase 5 — Índexs, validació i referència

1. Crear els índexs RC no implícits enumerats a `PR04.md`; comparar per
   definició, no només per nom.
2. Validar constraints creades `NOT VALID` després dels backfills.
3. Carregar els sis punts exactes de `0006`. No executar l'`UPDATE` que
   desactiva slugs aliens fins que l'inventari confirmi que no són dades
   productives a preservar.
4. Garantir els singletons `id=1` sense substituir configuració existent.
5. Registrar al ledger productiu els passos realment executats, els checksums,
   el fingerprint d'entrada i el fingerprint de sortida. No inserir entrades
   fictícies per `0001`–`0007`.

## Fase 6 — Verificació postmigració

La beta només supera el gate si:

- totes les taules legacy conserven el mateix recompte i hash de dades;
- `meteo.estacions` conserva IDs i codis;
- `meteo.mesures` conserva recompte, rang temporal, FK, unicitat i mostres;
- `meteo.lectures_hidro` i `meteo.estacions_hidro` coincideixen bit a bit en
  les columnes preexistents, incloses seqüències;
- forecast conserva runs, hores, IDs i rangs;
- `auth.usuaris`, `auth.aplicacions` i `auth.membres_app` conserven totes les
  files i columnes legacy;
- l'esquema `biblioteca`, els enums, el ledger Prisma i totes les dades tenen
  la mateixa empremta;
- les úniques files noves són singletons i els sis punts de referència
  enumerats;
- totes les taules/columnes/constraints/índexs RC existeixen amb definició
  equivalent;
- zero usuaris han estat promocionats, zero estacions han estat publicades i
  zero polítiques d'històric han estat activades;
- una segona execució en mode dry-run informa zero canvis pendents.

Després del gate de dades es pot arrencar el backend beta amb egress i
schedulers encara desactivats per fer un smoke test de lectura. Això pertany a
una tasca posterior i no queda autoritzat per PR04.

## Fallada i reversió

- Una fallada dins d'un pas transaccional implica `ROLLBACK` d'aquell pas.
- Una fallada després d'un pas confirmat no es repara sobre la mateixa còpia:
  es descarta `meteo_beta` i es crea una BD nova des del restore pristine.
- `meteo_restore_test` no s'usa mai com a espai de prova.
- La reversió no conté `DROP` sobre producció ni cap restauració damunt de
  `meteo`.

## Decisió GO/NO-GO per a PR05

`GO` només quan l'empremta efectiva del restore s'ha incorporat a la matriu i
no queda cap objecte `UNKNOWN` o `CONFLICT`.

Estat actual:

`NO-GO EXECUCIÓ — PLA CANDIDAT COMPLET, FINGERPRINT EFECTIU PENDENT`
