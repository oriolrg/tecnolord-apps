# QA-10 — Revisió de PLAN-10 entorn local fase A

Versió: 1.4
Estat: COMPLETAT
Document revisat: PLAN-10 v0.5
SPEC base: SPEC-10 v0.3 — APROVADA PER A LA FASE A
Abast: QA DOCUMENTAL I CONTRAST ESTÀTIC
Data: 2026-09-05

## 1. Resum executiu

**Recomanació final:** `REFINAR PLAN-10`.

`PLAN-10 v0.5` resol materialment bona part de les set correccions tancades de QA-10 v1.3: selecciona IDs complets per als namespaces, incorpora el Dockerfile productiu al build de compatibilitat, adopta l'npm 11.19.0 inclòs a Node 24.20.0, separa P10 `checkpoint` de P12 `final` i captura stdout/stderr per separat. L'abast continua estrictament limitat a la fase A i no incorpora Grafana, mapa, login, multiestació, servidor, desplegament ni correcció de `DEFECT-01`.

El nou contrast detecta, tanmateix, quatre defectes bloquejants:

1. els probes negatius s'executen amb `docker run --rm`, però dos passos després el PLAN exigeix capturar-ne `HostConfig.NetworkMode`; quan el procés acaba, `--rm` ja n'ha eliminat el contenidor i la inspecció no és reproduïble;
2. `backend/.dockerignore` es classifica com a exclusiu local/test, tot i que el Compose productiu construeix amb `context: ./backend`: Docker aplica aquest fitxer al context productiu i, per tant, falta a la matriu de compatibilitat i el recompte correcte de compartits no és 23;
3. el checkpoint diu que exigeix evidència dels requisits amb «pas primari P01..P10», però la matriu normativa només defineix `Pas` i moltes files tenen diversos passos; no existeix un registre tancat que decideixi quins artefactes són obligatoris, futurs o prohibits a P10;
4. la validació estructural de `PF10-A-18` prohibeix qualsevol endpoint al manual `docs/meteolord-local.md`, encara que aquest manual és el procediment versionat que ha de documentar l'origen local i les rutes de fase A; el control és incompatible amb RF10-01/RF10-03/RF10-11.

Les correccions de npm, lock productiu i separació dels streams sí queden resoltes. Resta també una incoherència editorial menor: `RP10-06` encara parla d'una «matriu de 22 contractes» després d'haver-la recalculat a 23. Per tant, el PLAN encara no permet redactar `TASKS-10` sense decisions que corresponen al mateix PLAN. Aquest QA no implementa res, no modifica el PLAN, no crea TASKS i no acredita cap gate de runtime.

Resultat dels catorze controls:

| Resultat | Nombre |
|---|---:|
| `PASS` | 7 |
| `PASS AMB OBSERVACIONS` | 2 |
| `FAIL` | 5 |
| `BLOQUEJAT PER EVIDÈNCIA` | 0 |
| `NO APLICABLE` | 0 |
| **Total** | **14** |

## 2. Documents i codi inspeccionats

Documents llegits íntegrament durant el cicle de QA i refinament:

- [PLAN-10 v0.5](./PLAN-10-entorn-local-fase-a.md);
- QA-10 v1.3, contingut anterior d'aquest fitxer;
- [SPEC-10 v0.3](./SPEC-10-entorn-local-proves-desplegament-segur.md);
- [SPEC-00](./SPEC-00-mapa-estacions-meteolord.md);
- [INSPECCIO-00](./INSPECCIO-00-entorn-meteolord.md);
- [PROJECT-CONTEXT-METEOLORD](./PROJECT-CONTEXT-METEOLORD.md);
- [QA-00](./QA-00-SPEC-10.md);
- [DEFECT-01](./DEFECT-01-zeros-ecowitt-convertits-null.md);
- [SPIKE-04](./SPIKE-04-descoberta-grafana-i2cat.md), només per verificar que Grafana continua fora de fase A.

Codi i configuració contrastats sense modificar:

- `docker-compose.yml`, `Caddyfile`, `.env.example`, `.gitignore` i Dockerfiles actuals;
- `backend/package.json`, `backend/server.js`, pool, middleware, rutes i serveis;
- SQL d'inicialització, schema, previsió i scripts legacy;
- scripts de tasques, cron, alertes, migració i desplegament;
- `site/index.html`, configuració, serveis, store, pantalles, components i CSS;
- consultes SQL identificables del runtime sota `backend/`.

Referències públiques primàries consultades per validar compatibilitats que no es poden inferir del repositori:

- [Node.js 24.20.0](https://nodejs.org/en/blog/release/v24.20.0), [arxiu 24.20.0](https://nodejs.org/download/archive/v24.20.0) i [CLI de Node](https://nodejs.org/api/cli.html), per LTS, npm incorporat i flags de cobertura;
- [Playwright Docker](https://playwright.dev/docs/docker), [release notes](https://playwright.dev/docs/release-notes) i [tag MCR 1.62.1 Noble](https://mcr.microsoft.com/en-us/artifact/mar/playwright/tag/v1.62.1-noble), per package/imatge i Node de la imatge;
- [Docker Compose `run`](https://docs.docker.com/reference/cli/docker/compose/run/), [networking](https://docs.docker.com/compose/how-tos/networking/) i [Compose spec de serveis](https://github.com/compose-spec/compose-spec/blob/main/05-services.md), per one-shots i `network_mode`;
- [Docker `run`](https://docs.docker.com/reference/cli/docker/container/run/) i [build context](https://docs.docker.com/build/concepts/context/), per la neteja automàtica amb `--rm` i l'aplicació de `.dockerignore` a l'arrel del context;
- [Moby GHSA-mq39-4gv4-mvpx](https://github.com/moby/moby/security/advisories/GHSA-mq39-4gv4-mvpx), per la semàntica d'una xarxa interna i DNS en versions corregides;
- [npm install i lockfile](https://github.com/npm/cli/blob/latest/docs/lib/content/commands/npm-install.md), per l'efecte real de la presència de `package-lock.json`;
- [docker-postgis `Dockerfile.template`](https://github.com/postgis/docker-postgis/blob/master/Dockerfile.template) i [`initdb-postgis.sh`](https://github.com/postgis/docker-postgis/blob/master/initdb-postgis.sh), com a contrast del hook i extensions, sense acreditar encara el futur digest fixat.

No s'ha llegit cap `.env`, secret, payload real, CSV de dades ni font Grafana.

## 3. Estat Git

Estat inicial d'aquest QA:

```text
Branca: main
HEAD: eeb2da29aec03fa285e018c30e28bcf63ca87f0d
?? docs/sdd/PLAN-10-entorn-local-fase-a.md
?? docs/sdd/QA-10-PLAN-10.md
```

Hashes inicials d'aquesta iteració:

```text
PLAN-10 v0.5: 55005f72d4d4a22e4fc36313f64b63efdb48c935352a5cac07e2c25cd8bdfe80
QA-10 v1.3:   8e4985a809d5645eb723559a72f27435753c28f67a1404de0b7f4349e30b9e85
```

`QA-10` ja era un fitxer no seguit en començar aquesta iteració; s'ha refinat a v1.4. `PLAN-10` no s'ha modificat i el seu hash final ha de continuar sent l'inicial. No s'ha fet staging, commit, push ni cap operació d'historial.

## 4. Metodologia

S'han aplicat set nivells:

1. correspondència de `SPEC-10` amb les decisions i els dotze passos;
2. verificació semàntica de les set correccions declarades resoltes des de QA-10 v1.3;
3. contrast amb rutes, SQL, serveis, frontend i configuració reals;
4. comprovació de la compatibilitat literal de les ordres amb les versions seleccionades;
5. simulació estàtica de l'ordre de gate, els namespaces, els modes de runner i el flux d'artefactes;
6. anàlisi de l'efecte de cada fitxer nou o modificat sobre els contexts de build, Dockerfiles i defaults productius existents;
7. validacions mecàniques de recomptes, IDs, enllaços, taules, encoding, secrets i Git.

No s'ha classificat com a defecte que els fitxers o artefactes futurs encara no existeixin. Sí que és defecte una ordre incompatible amb el runtime seleccionat, una prova que no pot demostrar una gate, una traça contrària al codi real o una decisió que TASKS hauria d'inventar.

## 5. Resultat general

| Dimensió | Resultat | Conclusió |
|---|---|---|
| executable | `FAIL` | els probes negatius s'autoeliminen abans de la inspecció requerida i el checkpoint no té un registre tancat d'artefactes exigibles |
| complet | `FAIL` | falta classificar un input del build productiu, tancar el checkpoint i corregir el domini estructural de PF10-A-18 |
| coherent amb SPEC | `PASS AMB OBSERVACIONS` | abast i model normatiu són correctes; G10-04/G10-05/G10-06/G10-08 no es poden demostrar amb el contracte actual |
| compatible amb arquitectura real | `FAIL` | `backend/.dockerignore` afecta el context `./backend` del build productiu però no es tracta com a compartit |
| limitat a fase A | `PASS` | no incorpora cap implementació B/C ni Grafana |
| segur respecte de producció | `FAIL` | un input efectiu del build productiu queda fora de la matriu de compatibilitat |
| suficient per a `TASKS-10` | `FAIL` | quatre correccions bloquejants encara exigeixen decisió de PLAN |

## 6. Matriu QA-P10-01 a QA-P10-14

| Control | Resultat | Evidència i veredicte |
|---|---|---|
| QA-P10-01 — Abast mínim i 58 fitxers | `FAIL` | hi ha 58 rutes úniques, 40 noves i 18 modificades, però `backend/.dockerignore` consta com a N/S tot i governar també el context de build productiu; el subconjunt compartit i el recompte de 23 són incorrectes |
| QA-P10-02 — Topologia Docker i egress | `FAIL` | els cinc IDs complets i `container:<ID>` eliminen l'ambigüitat anterior, però cada probe negatiu usa `docker run --rm` i després se n'exigeix `HostConfig.NetworkMode`; el contenidor ja no existeix quan arriba la inspecció |
| QA-P10-03 — Impacte productiu | `FAIL` | el Dockerfile i el lock productius ja entren al build de compatibilitat, però `.dockerignore` també afecta `build.context: ./backend` i queda fora de la matriu de compartits i de la prova before/after |
| QA-P10-04 — Relacions PostgreSQL | `PASS` | les vuit relacions cobreixen les consultes persistents reals; el model físic i el catàleg final estan especificats. `auth.usuaris` i `meteo.membres_estacio` són efectes actuals d'Ecowitt, no una implementació de login |
| QA-P10-05 — Bootstrap de migracions | `PASS AMB OBSERVACIONS` | bootstrap intern, detecció global, allowlist d'extensions, lock de sessió, checksums, transacció per migració i forward-only són suficients. Els objectes exactes creats pel futur digest PostGIS continuen sent evidència obligatòria de P02 |
| QA-P10-06 — Forward-only i reversió | `PASS` | la reversió només recrea la DB local descartable i reaplica la cadena; els guards de projecte, prefix, labels i noms resolts impedeixen una neteja global |
| QA-P10-07 — Dependències reproduïbles | `PASS` | Node 24.20.0 LTS ofereix els flags, Playwright 1.62.1 concorda amb la imatge, npm 11.19.0 és el binari incorporat i els digests/plataforma es resolen abans del build; el lock i el build productiu queden explícitament acreditats |
| QA-P10-08 — Dobles, rellotge i compatibilitat | `PASS` | l'activació synthetic exigeix perfil, mode i guard literals; rebutja credencials i coordenades reals. Sense el triple guard, productiu conserva clients i rellotge reals |
| QA-P10-09 — Salut | `PASS` | `/api/ping` conserva exactament el contracte real; `/health` diferencia readiness DB amb 200/503, cos sanejat i healthchecks encadenats |
| QA-P10-10 — CSP, analítica i egress navegador | `PASS` | CSP completa, analítica/externs desactivats en local, origen host resolt i origen E2E literal `http://caddy:8080`; cada context té allowlist pròpia i el loopback queda prohibit dins `qa-e2e` |
| QA-P10-11 — Traçabilitat | `FAIL` | els 65 IDs i 18 casos són presents, però «pas primari» no és un camp normatiu de la matriu i PF10-A-18 prohibeix endpoints al manual que ha de documentar els orígens i rutes locals |
| QA-P10-12 — Incoherències editorials | `PASS AMB OBSERVACIONS` | versió, estat, IDs, enllaços, UTF-8 i taules són coherents; `RP10-06` conserva, però, el recompte obsolet de 22 contractes i tots els recomptes compartits s'han de recalcular |
| QA-P10-13 — Seguretat de neteja | `PASS` | projecte, run ID, labels, prefixos, xarxa, volum i directori d'artefactes es resolen i validen explícitament; no hi ha prune, globs amplis ni operacions Git destructives |
| QA-P10-14 — Suficiència per TASKS | `FAIL` | els dotze passos tenen tretze camps formals, però TASKS hauria d'inventar el cicle de vida inspeccionable dels probes, l'abast compartit de `.dockerignore`, el registre del checkpoint i una excepció segura per al manual local |

## 7. Traçabilitat SPEC → PLAN

La matriu de PLAN conté 65 files úniques: 15 RF, 5 RF-DB, 11 RNF, 25 CA i 9 gates. Els 18 casos `PF10-A-01` a `PF10-A-18` també són únics. La separació de `CA10-22` és correcta: la regla equivalent de fase A bloqueja l'acceptació local, mentre la promoció continua N/A perquè pertany a C.

| Bloc | Cobertura estructural | Contrast semàntic |
|---|---|---|
| RF10-01..07 | completa | FAIL parcial: el Dockerfile i el lock productius són coberts, però no `.dockerignore`, que també governa el context productiu |
| RF10-08..10 | completa | FAIL parcial: el target `container:<ID>` és correcte, però `--rm` elimina els probes abans de la inspecció exigida |
| RF10-11..12 | completa | PASS: paràmetre meteo, rutes i orígens estan alineats amb el codi real |
| RF10-13..15 | completa | FAIL parcial: logs i report final són deterministes; el checkpoint no defineix per ID un conjunt tancat d'evidència exigible a P10 |
| RF10-DB-01..05 | completa | PASS; hook i objectes exactes continuen bloquejats per evidència del futur digest |
| RNF10-01..07 | completa | FAIL parcial pels defectes d'inspecció dels probes i de classificació del context productiu |
| RNF10-08..10 | completa | PASS: frontera 5 MiB, baseline mantinguda i E2E intern estan determinats |
| RNF10-11 | completa | FAIL: el domini de control prohibeix endpoints necessaris al manual local versionat |
| CA10-01..25 | completa | aplicabilitat A/B/C correcta; CA10-01, 09, 16 i 21 hereten els defectes indicats |
| G10-01..09 | completa | G10-04, G10-05, G10-06 i G10-08 no són demostrables encara; gates C resten N/A |

Les decisions d'identitat, mapa, Grafana, servidor o promoció no bloquegen artificialment la fase A. Grafana només apareix en controls d'absència i no s'hi consulta cap font real.

## 8. Inventari SQL de runtime

| Relació SQL | Fitxer real | Operació | Ruta/tasca consumidora | Necessària A | Coberta pel PLAN |
|---|---|---|---|---|---|
| `auth.usuaris` | `backend/server.js` | insert/upsert | ingesta Ecowitt | sí, efecte actual | sí |
| `meteo.estacions` | `backend/server.js`, `backend/routes/mesures.js` | upsert/select | Ecowitt i API meteo | sí | sí |
| `meteo.membres_estacio` | `backend/server.js` | insert idempotent | ingesta Ecowitt | sí, efecte actual | sí |
| `meteo.mesures` | `backend/services/ecowittService.js`, `backend/routes/mesures.js` | insert/select/agregació | Ecowitt i API meteo | sí | sí |
| `meteo.estacions_hidro` | `backend/server.js`, `backend/routes/hidro.js` | upsert/select | ACA i API hidro | sí | sí |
| `meteo.lectures_hidro` | `backend/services/acaService.js`, `backend/routes/hidro.js` | upsert/select/fallback | ACA i API hidro | sí | sí |
| `meteo.forecast_run` | `backend/services/previService.js` | select/upsert | previsió | sí | sí |
| `meteo.forecast_hourly` | `backend/services/previService.js` | select/upsert | previsió | sí | sí |

No s'ha identificat una novena relació persistent necessària per arrencar o provar el runtime de fase A. Les taules d'autenticació enumerades són necessàries perquè formen part dels efectes actuals d'ingesta, però el PLAN no implementa login ni usuaris.

## 9. Revisió dels 58 fitxers

| Fitxer | Nou/modificat | Necessitat fase A | Afecta runtime compartit | Risc productiu | Veredicte |
|---|---|---|---|---|---|
| `.gitignore` | modificat | exclusions exactes | no runtime | ignorar lock per error | `IMPRESCINDIBLE` |
| `docs/meteolord-local.md` | nou | operació reproduïble | no | divergència documental | `IMPRESCINDIBLE` |
| `compose.meteolord-local.yml` | nou | topologia aïllada | no | xarxa/volum equivocats | `IMPRESCINDIBLE` |
| `Caddyfile.meteolord-local` | nou | entrada/CSP local | no | origen/rutes | `IMPRESCINDIBLE` |
| `config/meteolord/local.env.example` | nou | config sanejada | no | placeholder insegur | `IMPRESCINDIBLE` |
| `config/meteolord/runtime-config.local.js` | nou | overlay local | no | default incorrecte | `JUSTIFICADA` |
| `config/meteolord/images.lock` | nou | imatges immutables | no | digest obsolet | `IMPRESCINDIBLE` |
| `scripts/meteolord-local.sh` | nou | guards/gate/cleanup | no | operació destructiva | `IMPRESCINDIBLE` |
| `backend/Dockerfile` | modificat | build productiu compatible amb el lock | sí | base, install o closure divergents | `IMPRESCINDIBLE` |
| `backend/Dockerfile.local` | nou | runtime local | no | context amb dades | `IMPRESCINDIBLE` |
| `backend/Dockerfile.e2e` | nou | navegador fixat | no | runtime divergent | `JUSTIFICADA` |
| `backend/.dockerignore` | nou | excloure dades del context `./backend` | sí, context de build productiu | exclusions productives sense contracte | `PENDENT DE RECLASSIFICACIÓ` |
| `backend/package.json` | modificat | scripts i deps QA | sí | start/deps | `IMPRESCINDIBLE` |
| `backend/package-lock.json` | nou | closure reproduïble | sí, activa `npm ci` productiu | incompatibilitat de closure | `IMPRESCINDIBLE` |
| `backend/server.js` | modificat | factory/injecció | sí | arrencada/respostes | `IMPRESCINDIBLE` |
| `backend/db/pool.js` | modificat | pool tancable | sí | connexió/search path | `JUSTIFICADA` |
| `backend/db/migrate.js` | nou | runner canònic | local/test | DB equivocada | `IMPRESCINDIBLE` |
| `backend/db/migrations/0001-current-runtime.sql` | nou | model runtime | local/test | DDL divergent | `IMPRESCINDIBLE` |
| `backend/db/migrations/0002-current-forecast.sql` | nou | model forecast | local/test | DDL divergent | `IMPRESCINDIBLE` |
| `backend/scripts/validate-local-config.js` | nou | fail-fast | no | fals positiu | `IMPRESCINDIBLE` |
| `backend/scripts/load-local-fixtures.js` | nou | seed sintètic | local/test | dada/DB errònia | `IMPRESCINDIBLE` |
| `backend/scripts/run-local-task.js` | nou | tasques manuals | no | lògica divergent | `IMPRESCINDIBLE` |
| `backend/scripts/phase-a-report.js` | nou | gate/evidència | no | PASS fals | `IMPRESCINDIBLE` |
| `backend/providers/syntheticProvider.js` | nou | dobles | sí | activació productiva | `JUSTIFICADA` |
| `backend/lib/logger.js` | nou | logs locals | sí | filtració/default | `JUSTIFICADA` |
| `backend/middleware/requestContext.js` | nou | correlació | sí | contracte HTTP | `JUSTIFICADA` |
| `backend/routes/health.js` | modificat | readiness | sí | canvi 200/503 | `IMPRESCINDIBLE` |
| `backend/routes/tasks.js` | modificat | composició CLI/HTTP | sí | cos/codi divergent | `IMPRESCINDIBLE` |
| `backend/services/ecowittService.js` | modificat | injecció | sí | zero/normalització | `IMPRESCINDIBLE` |
| `backend/services/acaService.js` | modificat | injecció | sí | fallback/camps | `IMPRESCINDIBLE` |
| `backend/services/previService.js` | modificat | injecció | sí | transacció/model | `IMPRESCINDIBLE` |
| `site/runtime-config.js` | nou | default productiu | sí | analítica/default | `JUSTIFICADA` |
| `site/index.html` | modificat | bootstrap config | sí | ordre de càrrega | `IMPRESCINDIBLE` |
| `site/src/analytics.js` | nou | analítica condicional | sí | doble càrrega | `JUSTIFICADA` |
| `site/src/config.js` | modificat | validar config | sí | endpoints | `JUSTIFICADA` |
| `site/src/ui/screens/meteoScreen.js` | modificat | CSP/externs | sí | UI/enllaços | `IMPRESCINDIBLE` |
| `site/src/ui/screens/cabalsScreen.js` | modificat | CSP/externs | sí | UI/enllaç | `JUSTIFICADA` |
| `site/src/ui/screens/historicsScreen.js` | modificat | CSP | sí | gràfics/estils | `IMPRESCINDIBLE` |
| `site/src/ui/screens/app.js` | modificat | config/listener | sí | inicialització | `IMPRESCINDIBLE` |
| `site/src/ui/components/tecnolordHeader.js` | modificat | CSP | sí | fallback imatge | `JUSTIFICADA` |
| `site/src/styles.css` | modificat | retirar inline | sí | regressió visual | `IMPRESCINDIBLE` |
| `backend/playwright.config.js` | nou | E2E reproduïble | no | origen/retries | `IMPRESCINDIBLE` |
| `backend/test/fixtures/manifest.json` | nou | procedència | no | declaració falsa | `IMPRESCINDIBLE` |
| `backend/test/fixtures/meteo.json` | nou | casos meteo | no | semblança real | `IMPRESCINDIBLE` |
| `backend/test/fixtures/hidro.json` | nou | casos hidro | no | semblança real | `IMPRESCINDIBLE` |
| `backend/test/fixtures/forecast.json` | nou | previsió | no | temps incoherent | `IMPRESCINDIBLE` |
| `backend/test/fixtures/provider-scenarios.json` | nou | errors/fallback | no | contracte incomplet | `IMPRESCINDIBLE` |
| `backend/test/helpers/clock.js` | nou | temps determinista | no | injecció parcial | `JUSTIFICADA` |
| `backend/test/helpers/fetchDouble.js` | nou | doble HTTP | no | fallback de xarxa | `JUSTIFICADA` |
| `backend/test/helpers/testDb.js` | nou | DB temporal | no | cleanup ampli | `IMPRESCINDIBLE` |
| `backend/test/helpers/egressProbe.js` | nou | prova namespace | no | fals PASS/cronologia | `IMPRESCINDIBLE` |
| `backend/test/unit/config.test.js` | nou | guards | no | combinació absent | `IMPRESCINDIBLE` |
| `backend/test/unit/providers.test.js` | nou | dobles/zero | no | canvi funcional ocult | `IMPRESCINDIBLE` |
| `backend/test/integration/migrations.test.js` | nou | DB/lock | no | concurrència omesa | `IMPRESCINDIBLE` |
| `backend/test/integration/tasks.test.js` | nou | tasques | no | idempotència omesa | `IMPRESCINDIBLE` |
| `backend/test/http/routes.test.js` | nou | HTTP/salut/límits | no | contracte erroni | `IMPRESCINDIBLE` |
| `backend/test/security/logs-egress.test.js` | nou | secrets/egress/logs | no | evidència incompleta | `IMPRESCINDIBLE` |
| `backend/test/e2e/frontend.spec.js` | nou | frontend/xarxa | no | origen/flakiness | `IMPRESCINDIBLE` |

No hi ha entrades `AJORNABLE`, `FORA D'ABAST` o `DUPLICADA`. El parell `backend/Dockerfile`/`backend/package-lock.json` queda justificat i cobert pel build de compatibilitat. En canvi, `backend/.dockerignore` és un input efectiu del mateix context productiu i s'ha de marcar `S`, incorporar a la matriu before/after i al control de compatibilitat, i incloure en el recompte recalculat de compartits. Les altres evidències de P02 continuen sent precondicions d'execució i no qüestionen la necessitat de les rutes que les generen.

## 10. Defectes bloquejants

### QA14-B01 — `--rm` elimina els probes abans de poder inspeccionar-los

P09 crea cada negatiu amb `docker run --rm --pull=never --network "container:${holder_id}"` i, dos punts després, exigeix capturar `HostConfig.NetworkMode=container:<ID>` de cada probe. Docker elimina automàticament un contenidor `--rm` quan el procés surt. Com que els intents DNS/TCP ja han d'haver acabat abans de recollir el resultat, l'ID del probe deixa de ser inspeccionable i no es pot acreditar que hagi compartit el namespace validat. El PLAN ha de fixar noms/IDs dels probes, conservar-los fins després de `docker inspect` i eliminar-los explícitament amb els guards existents.

### QA14-B02 — `.dockerignore` està mal classificat respecte del build productiu

El Compose real defineix el servei `backend` amb `build.context: ./backend`. Docker busca i aplica `.dockerignore` a l'arrel del context abans d'enviar-lo al builder; per tant, el nou `backend/.dockerignore` modifica també el build productiu. El manifest el marca `N/S`, la llista de 23 compartits l'omet i la matriu de compatibilitat no en fixa el before/after. La `COPY` allowlist redueix el risc d'inclusió, però no anul·la l'efecte de les exclusions sobre fitxers runtime necessaris. Cal classificar-lo `S`, afegir el seu contracte productiu i recalcular tots els recomptes derivats.

### QA14-B03 — El checkpoint no té un registre tancat d'artefactes exigibles

El mode `checkpoint` exigeix evidència dels requisits i casos amb «pas primari P01..P10». La matriu normativa de la secció 13 només té una columna `Pas`, i nombroses files contenen diversos passos, inclosos P11/P12. No hi ha cap camp ni taula que determini quin és el primari, ni un registre exhaustiu que marqui cada artefacte com a obligatori a P10, pendent de P11/P12 o prohibit abans del final. Els exemples de futurs pendents no resolen la resta del conjunt. Així, `phase-a-report.js` i TASKS haurien d'inventar la classificació i podrien acceptar un checkpoint incomplet o rebutjar-ne un de correcte.

### QA14-B04 — La regla de control de PF10-A-18 contradiu el manual local requerit

El domini estructural de PF10-A-18 inclou `docs/meteolord-local.md` entre els tres controls allowlisted i estableix que aquest document «no pot contenir endpoint». Però RF10-01, RF10-03 i RF10-11 exigeixen un procediment versionat amb l'origen local, les rutes d'entrada i la manera de verificar-les. Prohibir-hi tot endpoint força una documentació operativa incompleta o un FAIL fals. El control ha de permetre exclusivament els orígens i rutes locals de fase A documentats i continuar prohibint endpoints Grafana, externs, productius o reals.

## 11. Defectes no bloquejants

| ID | Severitat | Defecte | Correcció requerida |
|---|---|---|---|
| QA14-N01 | `MENOR` | `RP10-06` encara diu «matriu de 22 contractes», tot i que la versió 0.5 declara 23 compartits abans de reclassificar `.dockerignore` | actualitzar la xifra al recompte recalculat i revisar totes les referències derivades |

No s'han identificat defectes `MAJOR` no bloquejants.

## 12. Decisions correctament resoltes

| Decisió | Valoració |
|---|---|
| `DLT-01` | model físic complet i limitat a les vuit relacions reals |
| `DLT-02` | bootstrap intern sense circularitat, lock de sessió, checksums, transaccions i forward-only |
| `DLT-03` parcial | una sola xarxa `core internal`, cap `edge`, volum local i xarxa de control efímera; els holders es resolen per ID complet, però resta conservar els probes fins a la inspecció |
| `DLT-04` | Caddy únic exposat a loopback, DB/backend sense ports i orígens host/E2E separats |
| `DLT-05` parcial | triple guard sintètic, cinc IDs complets i certificació atòmica a P09; resta fer inspeccionable cada probe negatiu |
| `DLT-06` parcial | Node test, cobertura, llindars, Playwright i modes checkpoint/final coherents; resta tancar l'assignació d'artefactes de P10 |
| `DLT-07` parcial | Node 24.20.0, npm incorporat, imatges, arquitectura, digests, lock i build productiu coherents; resta incloure `.dockerignore` com a input compartit |
| `DLT-08` | fixtures inventades, clock injectat i `DEFECT-01` només caracteritzat |
| `DLT-09` | tasques manuals sense cron, compartint funcions amb HTTP |
| `DLT-10` | liveness/readiness i cos real de `/api/ping` alineats |
| `DLT-11` | fonts crues per servei/runner, streams separats, ordre intrastream, ordinals, checkpoint i finalització determinats |
| autenticació | `?key=` es conserva; no s'amplia l'abast amb una reforma de seguretat |
| consulta meteo | `PF10-A-04` usa `?estacio=synthetic-meteo-01`, igual que ruta i frontend reals |
| imatges i rendiment | historial/capes/filesystem i datasets de frontera de 5 MiB estan determinats |
| CSP/analítica | política local completa, orígens separats i defaults productius conservats |
| retenció | clock host real, límits de 30 dies i rebuig de timestamps futurs/incoherents |
| cleanup | recursos, prefixos, labels i run ID validats sense ordres globals |
| aplicabilitat | `CA10-22` separa correctament gate A de promoció C |

## 13. Decisions que requereixen refinament

| Decisió | Estat | Necessitat |
|---|---|---|
| `DLT-03`/`DLT-05` | bloquejant | fixar noms/IDs dels probes, inspecció mentre encara existeixen i cleanup explícit guardat després de recollir l'evidència |
| `DLT-07`/manifest | bloquejant | classificar `backend/.dockerignore` com a compartit, donar-li contracte before/after i incloure'l al build productiu de compatibilitat |
| `DLT-06`/G10-08 | bloquejant | crear un registre tancat per ID/artefacte amb estat `REQUIRED_CHECKPOINT`, `PENDING_FINAL` o `FORBIDDEN_BEFORE_FINAL`, sense inferir un «pas primari» inexistent |
| RNF10-11/`PF10-A-18` | bloquejant | distingir endpoints locals documentals permesos d'endpoints Grafana, externs, productius o reals prohibits al domini de control |

No cal reobrir el model SQL, l'autenticació, el guard sintètic, la salut, la CSP, els orígens, `?estacio=`, la política forward-only, el scan de capes, la frontera de 5 MiB, npm incorporat, el build del Dockerfile productiu, la captura separada de streams, el clock de retenció, el cleanup ni l'abast de fase A.

## 14. Riscos productius

| Risc | Evidència | Control necessari |
|---|---|---|
| evidència d'egress no inspeccionable | `docker run --rm` elimina el probe abans del `docker inspect` posterior | contenidor amb nom/ID validat, sense `--rm`, inspecció i cleanup explícit guardat |
| build productiu divergent | `.dockerignore` s'aplica al context productiu però no té contracte compartit | fila `S`, before/after, inventari de context/closure i smoke de compatibilitat |
| checkpoint falsament complet o bloquejat | «pas primari» no existeix a la matriu normativa | registre exhaustiu per ID i artefacte amb estat temporal inequívoc |
| manual inoperable o fals FAIL Grafana | el domini de control prohibeix qualsevol endpoint al document operatiu | allowlist exacta d'orígens/rutes locals i prohibició explícita de Grafana/externs/reals |
| recompte de controls obsolet | `RP10-06` conserva 22 i `.dockerignore` obliga a recalcular 23 | recalcular una vegada el conjunt compartit i propagar la xifra resultant |

## 15. Validacions executades

| Validació | Resultat |
|---|---|
| `git branch --show-current` | `main` |
| `git rev-parse HEAD` | `eeb2da29aec03fa285e018c30e28bcf63ca87f0d` |
| `git status --short` inicial | només PLAN-10 i QA-10 no seguits |
| hash inicial/final del PLAN | `55005f72d4d4a22e4fc36313f64b63efdb48c935352a5cac07e2c25cd8bdfe80` |
| lectura i contrast documental | completats per PLAN, SPEC i documents obligatoris; SPIKE-04 només per abast |
| inventari de codi/rutes | completat; runtime real sota `backend/`, no `backend/src/` |
| inventari SQL | vuit relacions persistents, totes cobertes físicament |
| manifest del PLAN | 58 files, 58 paths únics, 40 N i 18 M; tots els M existeixen i tots els N encara no |
| compatibilitat productiva | 23 files i el mateix conjunt declarat de 23 `S`; FAIL semàntic perquè `.dockerignore` també és compartit i en falta una |
| traçabilitat | 65 IDs: 15 RF, 5 RF-DB, 11 RNF, 25 CA i 9 gates |
| casos funcionals | 18 IDs únics; `PF10-A-04` coincideix amb `req.query.estacio` i `meteoService.js` |
| passos | 12 IDs únics, cadascun amb els 13 camps en ordre |
| matriu de correccions v1.3 | set files úniques, totes `RESOLTA`; npm, lock/build, modes i streams resolts, però quatre contractes resten incomplets pels defectes QA14 |
| enllaços Markdown del PLAN | set enllaços locals, tots resolts |
| taules Markdown del PLAN | 33 taules amb amplada de fila coherent |
| UTF-8/mojibake del PLAN | UTF-8 correcte i cap patró de mojibake detectat |
| secrets/dades Grafana al PLAN | cap secret, URL Grafana real, identificador o payload detectat |
| sintaxi JavaScript existent | PASS amb `node --check` sobre `backend/` i `site/src/` |
| sintaxi Bash existent | PASS amb `bash -n` sobre `scripts/*.sh` |
| Compose global amb `.env.example` | FAIL abans de resoldre Compose: `.env.example` conté un comentari existent amb `//`; no és el nou env local ni s'ha modificat |
| CLI local | Node 22.22.2, npm 10.9.7, Docker 29.1.3, Compose 5.5.0 i Buildx 0.36.1 |
| CLI Node local | conté els vuit flags de test/cobertura seleccionats; no substitueix la prova futura dins Node 24.20.0 |
| CLI Compose local | `run` confirma one-shot, `--name`, `--entrypoint`, `--pull`; `logs` confirma `--no-log-prefix` i `--timestamps` |
| documentació Node 24.20.0 | confirma LTS, flags i npm 11.19.0 incorporat |
| documentació Playwright | confirma correspondència package/imatge i canvi de les imatges a Node 24 |
| documentació Docker/Compose | confirma one-shots, `container:`, semàntica de xarxa interna, eliminació automàtica amb `--rm` i aplicació de `.dockerignore` al context |
| documentació npm | confirma que la presència del lock governa la instal·lació i que `npm ci` n'exigeix coherència |
| `git diff --check` i comprovació no-index dels Markdown | PASS final |

La fallada de `docker compose config` sobre el Compose global confirma una desalineació prèvia de `.env.example`; no és un defecte creat per `PLAN-10`, que defineix un fitxer local nou amb comentaris dotenv vàlids i un Compose dedicat. No s'ha corregit perquè queda fora d'aquest QA.

## 16. Validacions no executades

No s'han executat:

- `docker compose up`, contenidors, builds, pulls ni inspecció dinàmica d'imatges;
- `npm install`, `npm ci`, generació del lockfile o Playwright;
- proves futures, cobertura, lint futur o E2E;
- SQL, migracions, fixtures o connexions a DB;
- tasques, ingestes, crons o APIs reals;
- probes dinàmics d'egress o connexions a proveïdors;
- Caddy local, healthchecks o navegació;
- accés a Grafana, dades externes, producció o servidor;
- desplegament, cleanup Docker, staging, commit o push.

La lectura de documentació pública de Node, npm, Playwright, Docker/Compose i docker-postgis només ha servit per contrastar contractes de versions/eines; no ha contactat cap API de negoci ni cap font de dades MeteoLord.

## 17. Recomanació final

**`REFINAR PLAN-10`**

Llista tancada de correccions necessàries per produir `PLAN-10 v0.6`:

1. substituir `docker run --rm` dels cinc negatius per probes amb nom i ID derivats/validats, conservar-los fins a capturar resultat i `HostConfig.NetworkMode`, i eliminar cada ID explícitament després amb els guards de cleanup; mantenir els cinc namespaces i la finestra atòmica de P09;
2. reclassificar `backend/.dockerignore` com a `S`, afegir-lo a la matriu before/after i a la prova exacta del context productiu, i recalcular el conjunt compartit —24 si no canvia cap altra ruta ni classificació— en totes les referències;
3. definir un registre tancat del checkpoint per als 65 IDs, 18 casos, gates i artefactes: cada element ha de ser `REQUIRED_CHECKPOINT`, `PENDING_FINAL` o `FORBIDDEN_BEFORE_FINAL`; eliminar la inferència per «pas primari» i conservar els modes P10/P12 ja separats;
4. corregir el domini estructural de PF10-A-18 perquè `docs/meteolord-local.md` pugui contenir només els orígens i rutes locals de fase A exigits, mentre continuen prohibits endpoints Grafana, externs, productius o reals; mantenir la comprovació d'inèrcia/no-import dels tres controls;
5. actualitzar `RP10-06` i qualsevol recompte, fila o referència derivada després de la reclassificació, sense preservar artificialment 23.

No cal afegir fase B/C, Grafana, mapa, login, servidor, desplegament, dades reals ni la correcció de `DEFECT-01`.

## 18. Següent pas SDD

El següent pas exacte és refinar exclusivament `docs/sdd/PLAN-10-entorn-local-fase-a.md` a la versió 0.6 amb les cinc correccions tancades de la secció 17 i sotmetre'l a un nou QA documental i tècnic estàtic.

No s'ha de crear `TASKS-10` ni implementar res fins que el PLAN refinat superi el QA i sigui aprovat expressament.

## 19. Historial de versions

| Versió | Data | Canvi |
|---|---|---|
| 1.0 | 2026-09-03 | QA inicial de PLAN-10 v0.1 |
| 1.1 | 2026-09-04 | nou QA de PLAN-10 v0.2 després del primer refinament |
| 1.2 | 2026-09-05 | QA de PLAN-10 v0.3; cinc defectes bloquejants i recomanació de refinament a v0.4 |
| 1.3 | 2026-09-05 | QA de PLAN-10 v0.4; nou correccions anteriors confirmades, quatre defectes bloquejants nous, dues precisions majors i recomanació de refinament a v0.5 |
| 1.4 | 2026-09-05 | QA de PLAN-10 v0.5; npm, build productiu, modes i streams confirmats, quatre defectes bloquejants nous, una incoherència menor i recomanació de refinament a v0.6 |
