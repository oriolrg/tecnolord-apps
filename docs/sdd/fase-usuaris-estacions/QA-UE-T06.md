# Evidència UE-T06 — connector Ecowitt per estació

Data: 2026-09-20. Estat: **FETA** amb credencials i respostes sintètiques.

[connectorRegistryService.js](../../../backend/services/connectorRegistryService.js) valida exactament `application_key`, `api_key` i `mac`, rebutja camps addicionals com URL o host i desa els secrets amb AES-256-GCM, nonce aleatori de 12 bytes, etiqueta de 16 bytes i AAD vinculada a l’ID intern de l’estació. La configuració no secreta fixa l’endpoint Ecowitt v3 i les unitats canòniques. El keyring versionat manté claus antigues per desxifrar i permet re-xifrar cada estació amb la clau primària abans de retirar-les.

Les rutes de [stations.js](../../../backend/routes/stations.js) només permeten al propietari escriure o consultar l’estat del connector, amb sessió, Origin i CSRF. L’administrador no obté permís d’edició sobre connectors aliens. Tant GET com PUT retornen només `{type, enabled, status, configured}`; les claus no es poden llegir després de desar-les. La [pantalla de compte](../../../site/compte/index.html) presenta els tres camps com a contrasenya, no els precarrega i els buida després d’una escriptura correcta.

[ecowittService.js](../../../backend/services/ecowittService.js) té un adaptador que rep configuració per estació sense mutar `process.env`, construeix només `https://api.ecowitt.net/api/v3/device/real_time`, rebutja redirects i conserva separades dues configuracions. La normalització ja no usa `valor || null`: temperatura, pluja, vent, pressió i radiació iguals a zero es desen com `0`; l’absència continua sent `null`.

## Proves executades

| Comanda / context | Resultat |
|---|---|
| `node --test test/unit/ue-ecowitt.test.js test/unit/providers.test.js` | PASS: AES-GCM vinculat a estació, keyring, host fix, redirects, zero/null i escenaris de proveïdor |
| `node --test test/http/ue-ecowitt.test.js` dins contenidor local | 1 PASS, 0 FAIL: propietari, CSRF, resposta write-only i URL arbitrària rebutjada |
| `UE_INTEGRATION=1 node --test test/integration/ue-ecowitt.test.js` en PostgreSQL/PostGIS Docker sintètic | 1 PASS, 0 FAIL, 0 SKIP: dues estacions i claus diferents, ciphertext/nonce/tag, intent aliè, cap secret a resposta/log, rotació old→new i peticions independents |
| `node scripts/check-ue-account-browser.js` | PASS: configuració Ecowitt write-only, camps buidats i recorregut d’estació a 375 px; 0 peticions externes |
| `npm test` amb T10/T13/T15/UE_INTEGRATION activats en Docker i `site/config` muntats | 207 PASS, 0 FAIL, 0 SKIP |

La clau inclosa a l’entorn local és sintètica i exclusiva de desenvolupament. La producció ha de muntar un keyring propi fora del repositori. Aquesta tasca comprova l’adaptador i el registre; el worker periòdic de snapshots i la representació de dades antigues corresponen a UE-T07. No s’ha contactat Ecowitt ni s’han usat credencials o dades reals.
