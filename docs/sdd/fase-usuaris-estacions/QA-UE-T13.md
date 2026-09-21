# QA UE-T13 — Importador repetible amb staging i quarantena

Data d'execució: 2026-09-21. Estat: **FETA**. Entorn: backend local i PostgreSQL/PostGIS temporal amb un inventari exclusivament inventat. No s'ha importat el PDF real, no s'ha consultat Grafana i no s'ha publicat cap estació.

## Resultat implementat

El servei [importService.js](../../../backend/services/importService.js) implementa el flux administratiu `dry-run → apply → rollback` sobre les taules de staging de la migració 0003. Normalitza i ordena l'inventari abans de calcular un SHA-256 estable; la clau única `(source_namespace, content_hash)` i un advisory lock fan que dues peticions concurrents del mateix contingut retornin el mateix lot.

Cada fila conserva un `inventory_code` estable. Les identitats de font només es validen amb un `external_id` complet i un `mapping_status=VERIFIED`. Els codis `TEST*`, mappings incerts, IDs incomplets i ubicacions incoherents queden en quarantena. Els IDs duplicats dins el lot, un canvi d'identitat per al mateix codi, un ID ja vinculat i qualsevol divergència amb un override manual queden com a conflicte. Les files desaparegudes es registren com `MISSING_FROM_BATCH`; no es retiren ni s'esborren automàticament.

`apply` bloqueja el lot i les estacions en una única transacció. Crea estacions `ADMIN`, privades i amb ubicació `HIDDEN`, o actualitza només una estació administrada privada amb la revisió esperada. Les files en quarantena o conflicte no modifiquen el catàleg. Si una identitat es vincula entre el dry-run i l'apply, qualsevol canvi anterior del mateix lot també es desfà.

`rollback` fa una comprovació prèvia de totes les files. Només elimina una alta encara sense dades dependents o restaura els camps atribuïbles a una actualització. Una revisió posterior, un override manual, mesures o snapshots bloquegen tota la reversió amb `409`, sense trepitjar cap canvi posterior. Apply i rollback generen esdeveniments d'auditoria sense copiar candidats complets.

La ruta [imports.js](../../../backend/routes/imports.js) exposa `/api/v1/admin/imports`, `/dry-run`, `/:id/apply` i `/:id/rollback`. Tot el recurs exigeix `SUPERADMIN`, `Cache-Control: no-store` i `Vary: Cookie`; les mutacions també exigeixen mateix origen i CSRF.

La [pantalla de compte](../../../site/compte/index.html) permet seleccionar la font, enganxar o carregar un JSON, generar el dry-run, revisar recompte i incidència de cada fila, aplicar les files validades i revertir un lot aplicat. El panell no és visible ni consultat pels usuaris normals. La taula s'ha verificat sense desbordament a 375 px.

Durant la regressió es va detectar i corregir un defecte preexistent a [identityService.js](../../../backend/services/identityService.js): `created_at`, `last_seen_at` i `expires_at` d'una sessió ara provenen del mateix rellotge. Això evita sessions invàlides quan s'utilitza un rellotge injectat i PostgreSQL té una data diferent.

## Evidència executada

- Fixture [ue-import-synthetic.json](../../../backend/test/fixtures/ue-import-synthetic.json): quatre files inventades; dues vàlides amb nom i coordenades iguals però identitats diferents, una incompleta i una `TEST`.
- Unitari i HTTP `ue-imports`: **4/4 PASS**. Inclou hash estable, límits, quarantena, DTO sense dades internes de rollback, 401/403, mateix origen, CSRF i respostes 400/404/409.
- Integració [ue-imports.test.js](../../../backend/test/integration/ue-imports.test.js) sobre PostGIS temporal: **1/1 PASS**. Cobreix repetició i concurrència, no fusió per nom/coordenada, canvi de nom, ID duplicat, canvi d'ID, correcció manual posterior, fila desapareguda, rollback d'alta, rollback bloquejat per override i rollback atòmic davant una cursa d'identitat.
- Navegador [check-ue-imports-browser.js](../../../backend/scripts/check-ue-imports-browser.js): PASS; dry-run, revisió, quarantena visible, apply, aïllament `USER`, 375 × 667 px, cap desbordament, 0 errors de pàgina i 0 peticions externes.
- Regressió completa Node amb totes les integracions sintètiques habilitades, run `20260921-150000-13f13f1`: **241/241 PASS**, 0 FAIL, 0 CANCELLED, 0 SKIP i 0 TODO.
- `node --check`, `git diff --check` i comprovació del backend local: PASS. `http://127.0.0.1:8088/health` retorna `{"ok":true}`, la ruta sense sessió retorna `401` i el contenidor queda `running healthy`.

## Límits

El format exercitat és JSON i té un màxim de 500 files per lot. Aquesta tasca no converteix automàticament el PDF ni activa el connector Grafana. Les estacions importades continuen privades i sense exposició pública; qualsevol integració real queda subjecta a les condicions documentades a UE-T12 i UE-T14.
