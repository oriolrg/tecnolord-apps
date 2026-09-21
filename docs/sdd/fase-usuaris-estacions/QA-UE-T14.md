# QA UE-T14 — Adaptador Grafana intern condicionat

Data d'execució: 2026-09-21. Estat: **FETA dins el límit condicional de UE-T12**. S'ha implementat i verificat el contracte intern amb fixtures inventades. L'activació contra Grafana real continua deshabilitada per defecte; no s'han persistit ni publicat dades Grafana.

## Resultat implementat

El servei [grafanaAdapterService.js](../../../backend/services/grafanaAdapterService.js) resol una estació pública només contra un binding `GRAFANA` validat d'una estació administrada. L'endpoint, datasource i PromQL són constants de servidor; el client no pot proporcionar URL, consulta ni identificador extern. La petició queda limitada a temperatura, una finestra de 15 minuts, interval de 5 minuts, 20 punts, timeout de 10 segons i resposta màxima de 2 MiB.

El normalitzador accepta la posició variable del camp temporal i múltiples frames o sèries. Aparella per índex, filtra la finestra exacta, ordena els punts i preserva `0` i `null` amb qualitat explícita. Rebutja IDs de sensor discordants, unitats incompatibles, longituds incoherents, timestamps invàlids, respostes buides o mal formades i errors d'autenticació, límit o disponibilitat sense exposar el cos de la font. Quan Grafana no declara la unitat, retorna `celsius` només amb `unit_basis=QUERY_CONTRACT` i l'advertiment `SOURCE_UNIT_UNDECLARED`. La pluja queda desactivada.

La ruta [grafana.js](../../../backend/routes/grafana.js) exposa només `GET /api/v1/admin/grafana/stations` i `GET /api/v1/admin/grafana/stations/:id/current`. Ambdues exigeixen `SUPERADMIN`, són `no-store` i no accepten paràmetres de consulta de la font. El resultat declara `INTERNAL_ONLY`, `persistence=DISABLED` i `rain_enabled=false`.

La [pantalla de compte](../../../site/compte/index.html) mostra a l'administrador els bindings verificats i permet fer una consulta puntual. Presenta hora, valor, qualitat, unitat, advertiments i els límits de persistència/pluja. El panell queda ocult i no genera peticions per a un usuari normal.

La frontera pública exclou qualsevol estació amb binding Grafana validat de la llista i detall públics, lectura actual, mapa i configuració global. La integració força deliberadament una estació Grafana a `PUBLIC`, hi afegeix geometria, snapshot i selecció global, i comprova que continua absent de totes aquestes superfícies. La consulta interna no modifica `current_snapshots` ni `mesures`.

## Evidència executada

- Fixture [grafana-frames.json](../../../backend/test/fixtures/grafana-frames.json): frames múltiples inventats amb camp temporal en posicions diferents, `0`, `null`, longitud inconsistent i unitat absent.
- Unitari [ue-grafana.test.js](../../../backend/test/unit/ue-grafana.test.js): **4/4 PASS**; query fixada, normalització, finestra buida, IDs, unitats, frames i classificació d'errors.
- HTTP [ue-grafana.test.js](../../../backend/test/http/ue-grafana.test.js): **1/1 PASS**; 401/403, `no-store`, ruta exclusivament administrativa, connector desactivat, 404 i error de font sanejat.
- Integració [ue-grafana.test.js](../../../backend/test/integration/ue-grafana.test.js), run `20260921-210000-14b14b1`: **1/1 PASS**, 0 SKIP; query exacta, normalització, negació pública i recomptes de persistència invariants.
- Navegador [check-ue-grafana-browser.js](../../../backend/scripts/check-ue-grafana-browser.js): PASS; dades internes d'admin, `0`/`null`, advertiment d'unitat, aïllament `USER`, 375 × 667 px, cap desbordament, 0 errors de pàgina i 0 peticions externes.
- Regressió de navegador UE-T13: PASS després d'afegir el nou panell administratiu.
- Regressió completa Node, run `20260921-220000-14e14e1`: **247/247 PASS**, 0 FAIL, 0 CANCELLED, 0 SKIP i 0 TODO.
- `node --check` i `git diff --check`: PASS. Després del reinici, el backend local de `8088` queda `running healthy`, `/health` retorna `{"ok":true}` i la ruta Grafana sense sessió retorna `401`.

## Activació i límits

`METEOLORD_GRAFANA_INTERNAL_ENABLED=false` és el valor documentat i l'absència de la variable també desactiva les consultes. No s'ha afegit cap scheduler, secret, persistència ni superfície pública. Abans d'activar la consulta real cal resoldre per escrit l'abast de consulta automatitzada i els límits de freqüència identificats a [QA-UE-T12](QA-UE-T12.md). La persistència i la republicació requereixen, a més, drets específics i no formen part d'aquesta activació interna.
