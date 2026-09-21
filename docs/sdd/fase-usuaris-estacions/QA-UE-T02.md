# Evidència UE-T02 — esquema additiu i llegat

Data: 2026-09-18. Estat: **FETA** sobre base de dades Docker aïllada, projecte `meteolord-ue20260918`. Cap migració sobre dades reals.

[0003-ue-identity-catalog.sql](../../../backend/db/migrations/0003-ue-identity-catalog.sql) afegeix identitat, sessions/tokens, catàleg, geometria, connectors/secrets, bindings, snapshots, estimacions, preferències, vista pública, staging/import i auditoria. No modifica 0001/0002. Per defecte, els usuaris antics són `PENDING_EMAIL`/`USER`; les estacions antigues són `LEGACY`/`PRIVATE` amb owner_id NULL. No s'atorga accés de compte o permisos de propietari per inferència. La política d'històric per estació continua programada a UE-T17; durant la transició es preserva la sèrie antiga.

## Proves executades

- `UE_INTEGRATION=1 node test/integration/ue-migration.test.js` en contenidor amb DB test: **2 PASS, 0 FAIL, 0 SKIP**. Es crea un DB temporal, s'apliquen 0001–02, es carreguen fixtures, s'aplica 0003 i es comprova que IDs, mesures (inclòs zero), FK i noms no canvien. Recàrrega idempotent i segona migració sense duplicats. Una còpia alterada de 0003 falla a mig procés i no deixa taules, columnes ni registre de migració parcials.
- `npm test` en el mateix projecte, amb T10/T13/T15/UE_INTEGRATION actius i muntatges `backend`, `site`, `config`: **194 PASS, 0 FAIL, 0 SKIP**. Inclou tests previs d'ingesta, fixtures, API, seguretat i migracions.
- `git diff --check`: PASS.

El primer intent de regressió completa va fallar perquè el contenidor temporal no tenia `site/` ni `config/` muntats. Repetició amb els dos muntatges: 194/194 PASS. Això era un problema del comandament de test, no de la migració.

Per reproduir sense accés a dades reals, arrencar només el servei `db` amb un nom de projecte Docker únic, i executar el test des d'un contenidor efímer amb `backend/` de només lectura, `NODE_PATH=/app/node_modules`, `UE_INTEGRATION=1` i `UE_RUN_ID=YYYYMMDD-HHmmss-xxxxxxx`; el test crea i destrueix només DBs `meteolord_test_*` mitjançant `testDb.js`. Les ordres exactes d'aquesta execució figuren a la conversa i al registre de l'entorn local; no s'han inserit secrets reals.

Reversió en test: recrear el DB temporal o restaurar el volum aïllat. El runner és forward-only, de manera que una eventual reversió fora del test requereix snapshot verificat i migració compensatòria; això no s'ha executat.
