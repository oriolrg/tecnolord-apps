# Evidència UE-T05 — propietat i catàleg privat d’estacions

Data: 2026-09-20. Estat: **FETA** amb usuaris, estacions i mesures sintètiques.

La migració [0004-ue-station-metadata.sql](../../../backend/db/migrations/0004-ue-station-metadata.sql) afegeix la descripció visible sense alterar l’esquema ni les dades de mesures existents. [stationCatalogService.js](../../../backend/services/stationCatalogService.js) crea cada estació d’usuari com a `DRAFT` i `PRIVATE`, sense límit d’una estació per compte. El codi intern, l’ID del propietari i qualsevol camp no inclòs al DTO no arriben al client. L’edició i la retirada fan el `UPDATE` amb `owner_id`, tipus `USER`, lifecycle i revisió al mateix predicat SQL; ser `SUPERADMIN` permet llegir una privada aliena, però no editar-la.

[stations.js](../../../backend/routes/stations.js) aplica sessió, Origin i CSRF a les mutacions i retorna el mateix 404 per una estació privada inexistent o aliena. Les lectures privades usen `no-store` i `Vary: Cookie`. La llista pública només admet estacions actives i públiques amb propietari aprovat. Els endpoints de dades projecten una llista explícita de camps i exclouen `extres`, IDs interns i codis. Una estació retirada queda privada, desapareix de les lectures actuals i conserva les mesures a la BD.

La ruta antiga [mesures.js](../../../backend/routes/mesures.js) passa per la mateixa política. Amb un codi explícit, només el propietari o l’administrador poden llegir una privada. Sense codi resol exclusivament `public_view_config.public_station_id`; ja no pot barrejar mesures de totes les estacions. La [pantalla de compte](../../../site/compte/index.html) permet crear, editar i retirar diverses estacions, amb confirmació en dues passes per a la retirada i disposició usable a 375 px.

## Proves executades

| Comanda / context | Resultat |
|---|---|
| `node --test test/unit/ue-ownership.test.js` | 1 PASS, 0 FAIL: validació de nom/descripció/UUID i DTO explícit |
| `node --test test/http/ue-ownership.test.js` dins contenidor local | 1 PASS, 0 FAIL: sessió, Origin, CSRF, rol admin i crides owner-scoped |
| `UE_INTEGRATION=1 node --test test/integration/ue-ownership.test.js` en PostgreSQL/PostGIS Docker sintètic | 1 PASS, 0 FAIL, 0 SKIP: A/B amb dues estacions, visitant, admin lector, mutacions alienes, conflicte de revisió, selector públic, lectura actual/històrica legacy i retirada sense esborrar mesures |
| `node scripts/check-ue-account-browser.js` | PASS: crear, editar i retirar amb confirmació, alta i cua admin a 375 px; sense desbordament, errors de pàgina ni peticions externes |
| `npm test` amb T10/T13/T15/UE_INTEGRATION activats en Docker i `site/config` muntats | 203 PASS, 0 FAIL, 0 SKIP |

Les estacions noves encara no es poden activar ni publicar des del formulari: necessiten el connector, la ubicació i les comprovacions de publicació de les tasques següents. No s’han usat dades, credencials o bases reals i no s’ha desplegat res.
