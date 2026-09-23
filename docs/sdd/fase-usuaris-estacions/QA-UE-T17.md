# QA UE-T17 — Política d’històric administrada per estació

Data d’execució: 2026-09-23. Estat: **FETA**.

## Resultat implementat

La migració [0007-ue-station-history-policies.sql](../../../backend/db/migrations/0007-ue-station-history-policies.sql) afegeix una política independent per estació i un registre idempotent de captures. No crea cap política implícita: una estació sense política activa continua tenint només el snapshot actual i no entra en cap captura ni purga. Els límits persistents i de servei són de 5–1440 minuts i 1–3650 dies; el servei també rebutja un període inferior a la cadència de la font.

El servei [stationHistoryService.js](../../../backend/services/stationHistoryService.js) captura el snapshot validat amb una lease per estació, conserva zeros i nuls i usa la clau única `(estacio_id, instant)` per no duplicar mesures. Una font absent, amb error o massa antiga no genera cap punt. La purga té una lease diferent, transacció, lots limitats, bloqueig de política i el predicat estricte `estacio_id = ... AND instant < cutoff`; el registre situat exactament al tall es conserva. Una política desactivada no captura ni elimina dades.

Les estacions legacy comencen en mode compatible. La primera activació exigeix una previsualització per a la mateixa retenció, informa del recompte i del tall, i desar la política no elimina l’històric existent. Les actualitzacions tenen revisió optimista i generen auditoria. La tasca protegida `POST /api/tasks/capture-station-history` executa captures i purgues degudes i queda disponible per al planificador operatiu existent, sense instal·lar cap scheduler dins l’aplicació.

L’API [stationHistory.js](../../../backend/routes/stationHistory.js) només permet llistar, previsualitzar i editar a `SUPERADMIN`, amb sessió, same-origin, CSRF i `Cache-Control: no-store`. La pantalla de compte carrega les polítiques sota demanda, mostra activació, període, retenció, última captura i impacte legacy, i evita consultar aquesta API per a un usuari normal. La lectura de `/api/v1/stations/:id/history` reutilitza la política comuna d’estació: propietari i admin poden llegir una privada, mentre que un altre usuari i un visitant reben 404; una estació pública activa continua accessible.

## Evidència executada

- Unitari i HTTP [ue-history.test.js](../../../backend/test/unit/ue-history.test.js) i [ue-history.test.js](../../../backend/test/http/ue-history.test.js): **4/4 PASS**; límits, revisió, admin únic, CSRF, previsualització, worker protegit i senyal d’error agregat.
- Integració [ue-history.test.js](../../../backend/test/integration/ue-history.test.js), run `20260923-074000-98bf3dd`: PASS amb polítiques A `15 min / 30 dies` i B `60 min / 90 dies`, C sense política, idempotència, snapshot antic, lease ocupada, tall exacte, aïllament entre estacions, desactivació, upgrade legacy, rollback de purga fallida i continuació de les altres estacions.
- Matriu d’accés ampliada a [ue-ownership.test.js](../../../backend/test/integration/ue-ownership.test.js): propietari/admin/altre usuari/visitant sobre històric privat i públic; PASS sense skips a la regressió final.
- Navegador [check-ue-history-browser.js](../../../backend/scripts/check-ue-history-browser.js): PASS a 375 × 667 px; configuració B a 60/90, previsualització legacy de 17 registres, activació, USER sense panell ni consulta, cap desbordament, error de pàgina o petició externa. [Sortida conjunta final](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-075000-98bf3dd/specialized-final.txt).
- Regressió completa Node, run `20260923-074500-98bf3dd`: **257/257 PASS**, 0 FAIL, 0 CANCELLED, 0 SKIP i 0 TODO; cobertura global 95,16 % línies, 82,22 % branques i 91,80 % funcions. [Sortida TAP](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-074500-98bf3dd/coverage/tap-output.txt).
- `node --check` i `git diff --check`: PASS.
- Entorn local: migració 0007 aplicada a `meteolord_local`; `meteolord-ue-current-backend` reiniciat i `running healthy`; la ruta administrativa retorna 401 sense sessió i `no-store`.

## Límits operatius

No s’ha activat cap política sobre una font externa real. Grafana continua en mode de consulta interna sense persistència fins confirmar drets i límits; per això la prova usa bindings sintètics. L’execució periòdica del worker correspon al planificador de l’entorn i la reversió segura és deixar d’invocar-lo o desactivar polítiques, sense esborrar les taules ni l’històric. El gate complet posterior és UE-T18; G06-09 manual continua separat.
