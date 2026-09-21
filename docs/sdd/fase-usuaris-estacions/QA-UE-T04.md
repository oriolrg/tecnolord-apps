# Evidència UE-T04 — alta verificada i aprovació administrativa

Data: 2026-09-19. Estat: **FETA** amb identitats, correus i estacions sintètiques.

[identityService.js](../../../backend/services/identityService.js) implementa el recorregut `PENDING_EMAIL → PENDING_APPROVAL → APPROVED` i les transicions administratives a `REJECTED` i `SUSPENDED`. El token de verificació caduca als 30 minuts, només se’n desa el digest i només es pot consumir una vegada. Una alta repetida retorna la mateixa resposta sense revelar si el correu ja existeix. Si falla el transport local, el compte nou pendent s’elimina per no deixar una identitat inaccessible.

[identity.js](../../../backend/routes/identity.js) exposa l’alta i la verificació amb comprovació d’origen. La cua i les decisions requereixen una sessió `SUPERADMIN`; les mutacions també exigeixen CSRF. Els límits d’intents d’alta, entrada i recuperació són independents. Aprovar abans de verificar es rebutja. Rebutjar o suspendre revoca sessions, les tres decisions queden auditades i suspendre força a `PRIVATE` totes les estacions públiques del compte dins la mateixa transacció.

La [pantalla de compte](../../../site/compte/index.html) permet demanar un compte, consumir el token des del fragment `#verify=…` i informar que encara falta l’aprovació. El fragment s’elimina de la barra d’adreces abans de fer la petició. Un superadministrador veu una cua adaptable a mòbil i pot aprovar, rebutjar o suspendre. Els valors d’usuari es creen amb nodes de text, sense injectar HTML.

## Proves executades

| Comanda / context | Resultat |
|---|---|
| `node --test test/unit/ue-identity.test.js` | 3 PASS, 0 FAIL: hash, normalització i guards locals |
| `node --test test/http/ue-onboarding.test.js` dins contenidor local | 1 PASS, 0 FAIL: contracte 202, verificació, autenticació admin, Origin i CSRF |
| `UE_INTEGRATION=1 node --test test/integration/ue-onboarding.test.js` en PostgreSQL/PostGIS Docker sintètic | 1 PASS, 0 FAIL, 0 SKIP: caducitat/reús de token, duplicat opac, fallada de correu, verificació, aprovació, rebuig, suspensió, revocació, retirada de publicació i auditoria |
| `node scripts/check-ue-account-browser.js` | PASS: alta, verificació, aprovació, logout i recuperació a 375 px; sense desbordament, errors de pàgina ni peticions externes |
| `npm test` amb T10/T13/T15/UE_INTEGRATION activats en Docker i `site/config` muntats | 200 PASS, 0 FAIL, 0 SKIP |

El navegador usa una API simulada per comprovar la interacció i l’adaptació mòbil; el mateix contracte HTTP i les transicions persistides es validen per separat contra PostgreSQL real de prova. El transport local només escriu la bústia privada `/tmp/meteolord-*.jsonl`. El transport de correu de producció continua sense configurar i no s’ha fet cap desplegament ni migració sobre dades reals.
