# Evidència UE-T07 — snapshots i Meteo per estació

Data: 2026-09-20. Estat: **FETA** exclusivament amb BD, identitats, connectors i respostes de proveïdor sintètics.

[snapshotService.js](../../../backend/services/snapshotService.js) implementa el worker per estació amb lease consultiu PostgreSQL, un màxim de dues estacions simultànies i snapshot únic per binding. El connector Ecowitt crea un binding validat amb la MAC representada per un digest no reversible. El worker normalitza unitats, conserva zeros, representa absència i valors fora de rang amb qualitat per camp, rebutja observacions sense timestamp o més de cinc minuts futures i no escriu a l’històric. Una lectura vàlida activa l’estació sense fer-la pública.

La frescor es calcula amb rellotge injectable: `FRESH` fins a 30 minuts inclosos, `STALE` després de 30 i fins a 120 minuts inclosos, i `OBSOLETE` després de 120. Els errors de xarxa o proveïdor actualitzen `fetched_at` i `provider_error` però conserven `observed_at` i l’últim snapshot bo. Una observació obsoleta no retorna els valors com a dades actuals. El client Ecowitt fixa host i endpoint, impedeix redirects, aplica timeout de 10 segons i limita el cos a 2 MiB.

[stations.js](../../../backend/routes/stations.js) serveix el snapshot mitjançant `/api/v1/stations/:id/current` després de comprovar la mateixa política propietari/SUPERADMIN/pública de la UE-T05. [tasks.js](../../../backend/routes/tasks.js) exposa `/api/tasks/refresh-stations` només darrere la clau d’ingesta existent. La ruta retorna resultats sanejats, sense credencials ni URL del proveïdor.

[meteoScreen.js](../../../site/src/ui/screens/meteoScreen.js) afegeix un selector accessible que uneix el catàleg públic amb les estacions pròpies. La tria es conserva a l’estat local i a `station_id` de l’URL, sobreviu una recàrrega i no canvia quan falla la font. La pantalla mostra nom, hora i avís de dades antigues, obsoletes o d’error; el valor zero es mostra i l’absència continua com `—`.

Validació executada en contenidors locals sense credencials ni dades reals:

- `node --test test/unit/ue-snapshots.test.js test/http/ue-snapshots.test.js test/integration/ue-snapshots.test.js`: 7/7 PASS. Cobreix llindars exactes, zero/null/parcial, unitats i rangs, timeout, 429, 5xx, cos massa gran, timestamp futur, lease duplicat, aïllament de dues estacions, conservació de l’últim valor bo i zero files d’històric.
- Regressió Node amb T10/T13/T15/UE integrades sobre bases temporals: 214/214 PASS, 0 FAIL, 0 SKIP.
- `node scripts/check-ue-snapshots-browser.js` a Chromium, viewport 375×667: PASS; selector, canvi d’estació, snapshot diferenciat, persistència després de recarregar, sense overflow horitzontal, errors JS ni peticions externes.

No s’ha contactat Ecowitt ni cap font de producció. L’activació amb dades reals requereix configurar les credencials de cada estació i programar la crida autenticada al worker en l’entorn de desplegament.
