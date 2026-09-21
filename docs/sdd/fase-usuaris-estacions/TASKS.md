# Tasques executables

Estat 2026-09-21: **UE-T01–14 FETES** amb [QA-UE-T01](QA-UE-T01.md), [QA-UE-T02](QA-UE-T02.md), [QA-UE-T03](QA-UE-T03.md), [QA-UE-T04](QA-UE-T04.md), [QA-UE-T05](QA-UE-T05.md), [QA-UE-T06](QA-UE-T06.md), [QA-UE-T07](QA-UE-T07.md), [QA-UE-T08](QA-UE-T08.md), [QA-UE-T09](QA-UE-T09.md), [QA-UE-T10](QA-UE-T10.md), [QA-UE-T11](QA-UE-T11.md), [QA-UE-T12](QA-UE-T12.md), [QA-UE-T13](QA-UE-T13.md) i [QA-UE-T14](QA-UE-T14.md); UE-T15–18 NO INICIADES. La fase completa continua en curs. Contractes: [SPEC](SPEC.md), [PLAN](PLAN.md); bloquejos: [DECISIONS](DECISIONS.md).

## Convencions de proves i finalització

Les rutes `ue-*` següents són **proves a crear**, no fitxers existents ni resultats PASS. Ordres des de `backend/`, amb dependències i navegador preinstal·lats pel bootstrap existent:

- `node --test test/unit/ue-NOM.test.js test/http/ue-NOM.test.js` per lògica i contracte HTTP.
- `UE_INTEGRATION=1 node --test test/integration/ue-NOM.test.js` per persistència. El harness UE-T01 connectarà exclusivament a la BD sintètica creada pel wrapper, amb credencials injectades des del seu fitxer local; amb aquest flag, absència de BD/guard és FAIL, mai SKIP. No es crea ni es migra una BD real.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8088 npx --no-install playwright test test/e2e/ue-NOM.spec.js` per flux complet amb backend sintètic arrencat pel harness. Si es corre dins del contenidor E2E, usar `http://backend:8080` segons la configuració existent.
- Regressió: `npm test` i `npx --no-install playwright test`; després gate existent `bash scripts/meteolord-local.sh gate` des de l’arrel amb run/config d’entorn ja preparats segons TASKS-10. No fer pull/build dins la gate.

Per cada tasca, `NOM` és el sufix indicat. Crear només els nivells pertinents detallats; per spike el control és manual. Si una ordre enumera fitxer encara no creat, primer implementar la prova, no comptar l’error com a verificació. UE-T01 ha de documentar arrencada/fixtures del harness amb ordres copiables adaptades al run aïllat; no assumir un servidor live a 8096.

**Fet** en cada tasca significa acceptació satisfeta, proves indicades executades amb evidència (ordre, commit/diff, run, recompte, skips, resultat), revisió de permisos/regressió afectada i actualització d’aquesta fitxa. Una prova fallida o decisió pendent impedeix marcar-la acabada. Sense rollback específic addicional, revertir només el diff propi sobre la baseline preservada.

## Increments i ordre

1. UE-T01: baseline offline útil i segura, primer increment proposat.
2. UE-T02–04: identitat funcional amb dades sintètiques.
3. UE-T05–08: dues estacions per propietari, ingesta i mapa coherent.
4. UE-T09–11: preferències i administració visibles.
5. UE-T12–14: descoberta i importació; connector real condicional.
6. UE-T15–16: sis estimacions i verificació integrada de la fase principal.
7. UE-T17–18: política històrica per estació i gate final que inclou captura, retenció i llegat.

L’ordre és topològic, però una tasca bloquejada no impedeix executar altres dependències satisfetes. UE-D01–05 estan resoltes; els bloquejos restants són tècnics o de drets, especialment Grafana. UE-T12 pot avançar després UE-T01 sense esperar formularis. UE-T13 no necessita accés a Grafana. L’usuari ha indicat començar la implementació el 2026-09-18; continuar amb UE-T02 després de UE-T01.

## UE-T01 — Aïllar harness sintètic i registrar baseline

- **Dependències:** —.
- **Precondicions:** Cap decisió de producte; iniciar només quan es demani implementar.
- **Abast:** serve-map-demo.js, runtime config i harness existent; separar mode sintètic complet del live explícit.
- **Resultat observable:** Meteo i mapa locals funcionen sense cap petició externa.
- **Acceptació:** UE-CA11; Interceptar i fer fallar qualsevol egress; navegar Meteo/mapa, comprovar errors i rutes directes.
- **Proves i execució:** `cd backend && node --test test/http/ue-offline.test.js`; `cd backend && node scripts/check-ue-offline-browser.js` amb Chrome local; `cd backend && npm test` per regressió. Aquesta tasca no modifica BD, per tant integració de migració és N/A. Les 19 proves d’integració preexistents que salten sense BD no es compten com a PASS. Vegeu [QA-UE-T01](QA-UE-T01.md).
- **Finalització:** FETA el 2026-09-18: endpoints locals, cinc pantalles a navegador 375 px, cap petició externa; regressió Node sense falles en els tests executats. [Evidència](QA-UE-T01.md).
- **Reversió:** Restaurar només configuració d’aquest increment; conservar preview live explícita.

## UE-T02 — Afegir esquema compatible i reconciliació legacy

- **Dependències:** UE-T01.
- **Precondicions:** BD sintètica descartable; numeració de migració lliure comprovada.
- **Abast:** Migració additiva 0003, fixture d’upgrade i estratègia explícita de reconciliació legacy; conservar IDs, FK i mesures. Els repositoris d’identitat i catàleg es creen a UE-T03/UE-T05, quan existeixin els seus contractes d’autorització.
- **Resultat observable:** Base antiga sintètica actualitzada sense pèrdua i sense concedir rols implícits.
- **Acceptació:** UE-CA01, UE-CA11; Upgrade, reexecució, rollback per fallada injectada; recompte i contingut de mesures; usuari antic sense login.
- **Proves i execució:** `UE_INTEGRATION=1 node test/integration/ue-migration.test.js` dins el contenidor de test aïllat amb `backend/` muntat; `npm test` amb T10/T13/T15/UE_INTEGRATION=1 i site/config muntats. Proves de BD obligatòries, cap SKIP. La migració no canvia UI i no necessita E2E de navegador pròpia. Vegeu [QA-UE-T02](QA-UE-T02.md).
- **Finalització:** FETA el 2026-09-18: upgrade legacy, reexecució, recàrrega de fixtures i rollback provats en BD sintètica; regressió completa 194/194, 0 SKIP. [Evidència](QA-UE-T02.md).
- **Reversió:** Restaurar snapshot del volum de test; mai editar una migració aplicada.

## UE-T03 — Sessió, recuperació i bootstrap segur amb comptes de prova

- **Dependències:** UE-T02.
- **Precondicions:** Identitats sintètiques; mail fake exclusiu de test. Esquemes de verificació i recuperació separats.
- **Abast:** Serveis auth, middleware sessió/CSRF, login/logout/reset UI, CLI bootstrap.
- **Resultat observable:** Compte aprovat pot entrar/sortir/recuperar; permisos no provenen del client.
- **Acceptació:** UE-CA01, UE-CA10; Cookie, CSRF, intents limitats, tokens caducats/reusats, revocació, elevació manipulada, bootstrap idempotent.
- **Proves i execució:** `node test/unit/ue-identity.test.js`; `UE_INTEGRATION=1 node test/integration/ue-identity.test.js` dins la BD Docker aïllada; `node scripts/check-ue-account-browser.js`; regressió `npm test` amb totes les integracions activades. Vegeu [QA-UE-T03](QA-UE-T03.md).
- **Finalització:** FETA el 2026-09-18: sessions, CSRF, recuperació, bootstrap i UI de compte verificats; regressió 198/198 sense SKIP. [Evidència](QA-UE-T03.md).
- **Reversió:** Desactivar login, revocar sessions; conservar hashes i audit, cap credencial per defecte.

## UE-T04 — Sol·licitud i aprovació de comptes de punta a punta

- **Dependències:** UE-T03.
- **Precondicions:** UE-D01 resolta: sol·licitud pública, verificació d’email, després aprovació manual. Transport de correu sintètic local.
- **Abast:** Formulari alta, tokens d’email, estats PENDING_EMAIL/PENDING_APPROVAL/APPROVED/REJECTED/SUSPENDED, cua admin, aprovació/rebuig/suspensió, API i audit.
- **Resultat observable:** Sol·licitant verifica email i queda pendent; admin aprova i activa; suspensió revoca sessions i publicació.
- **Acceptació:** UE-CA01; email no verificat no es pot aprovar ni iniciar sessió; token caducat/reutilitzat falla; verificació sola no activa el compte; visitant no aprova; admin aprova; suspès no conserva accés ni publicació.
- **Proves i execució:** `node --test test/unit/ue-identity.test.js test/http/ue-onboarding.test.js`; `UE_INTEGRATION=1 node --test test/integration/ue-onboarding.test.js` dins la BD Docker aïllada; `node scripts/check-ue-account-browser.js`; regressió `npm test` amb totes les integracions activades. Vegeu [QA-UE-T04](QA-UE-T04.md).
- **Finalització:** FETA el 2026-09-19: alta pública, verificació, cua i decisions admin, auditoria, revocació i retirada de publicació verificades; regressió 200/200 sense SKIP. [Evidència](QA-UE-T04.md).
- **Reversió:** Desactivar altes; no revertir suspensions automàticament.

## UE-T05 — Catàleg propi i frontera d’autorització també legacy

- **Dependències:** UE-T03.
- **Precondicions:** UE-D02 resolta: admin pot llegir totes les privades, propietari només pròpies i un altre usuari cap. Prova amb usuaris aprovats sintètics.
- **Abast:** CRUD metadata/lifecycle, policy compartida, DTO, mesures/history antigues, selector mínim i formulari estació.
- **Resultat observable:** Usuari gestiona dues estacions; cap lectura barreja estacions ni revela privades.
- **Acceptació:** UE-CA02, UE-CA05, UE-CA10; matriu completa visitant/A/B/admin i IDs alterats en GET/PATCH/DELETE: admin llegeix privada aliena però no n’edita metadades, connector, ubicació ni visibilitat; lectura sense ID resol global; camps extres absents.
- **Proves i execució:** `node --test test/unit/ue-ownership.test.js test/http/ue-ownership.test.js`; `UE_INTEGRATION=1 node --test test/integration/ue-ownership.test.js` dins la BD Docker aïllada; `node scripts/check-ue-account-browser.js`; regressió `npm test` amb totes les integracions activades. Vegeu [QA-UE-T05](QA-UE-T05.md).
- **Finalització:** FETA el 2026-09-20: dues estacions per propietari, matriu visitant/A/B/admin, CRUD propi, retirada conservadora i lectures antigues tancades; regressió 203/203 sense SKIP. [Evidència](QA-UE-T05.md).
- **Reversió:** Deshabilitar ingressos/lectures de nova fase; no tornar a rutes antigues insegures amb dades privades.

## UE-T06 — Connector Ecowitt per estació i correcció dels zeros

- **Dependències:** UE-T05.
- **Precondicions:** Secret key local de test muntada; cap credencial real.
- **Abast:** Extreure adaptador injectable de ecowittService; configuració validada i secrets xifrats; actualitzar tests de DEFECT-01.
- **Resultat observable:** Dues configuracions s’aïllen; 0 real sobreviu, secret és write-only.
- **Acceptació:** UE-CA02, UE-CA09, UE-CA10; Fixtures 0/null/parcial/unitats, dues MAC, secret absent a errors/logs/DTO, host/redirect rebutjats, rotació clau.
- **Proves i execució:** `node --test test/unit/ue-ecowitt.test.js test/http/ue-ecowitt.test.js`; `UE_INTEGRATION=1 node --test test/integration/ue-ecowitt.test.js` dins la BD Docker aïllada; `node scripts/check-ue-account-browser.js`; regressió `npm test` amb totes les integracions activades. Vegeu [QA-UE-T06](QA-UE-T06.md).
- **Finalització:** FETA el 2026-09-20: dos connectors aïllats, secrets write-only xifrats, host fix, rotació de clau i zeros preservats; regressió 207/207 sense SKIP. [Evidència](QA-UE-T06.md).
- **Reversió:** Pausar connectors; conservar clau antiga fins re-xifrat validat, no recuperar zeros històrics inventats.

## UE-T07 — Ingesta de snapshots i Meteo realista amb fixtures

- **Dependències:** UE-T06.
- **Precondicions:** UE-D05 resolta: snapshot actual sempre; històric nou només quan una política administrativa específica s’activi a UE-T17.
- **Abast:** Worker amb lease, snapshots, estat font, stationRead i targetes Meteo.
- **Resultat observable:** Dues estacions mostren les seves dades, temps i errors independents.
- **Acceptació:** UE-CA02, UE-CA09; Rellotge als llindars, timeout/429/5xx, resposta massa gran, duplicació worker, timestamps futurs, fallada parcial; UI conserva selecció.
- **Proves i execució:** sufix `ue-snapshots`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** FETA el 2026-09-20: worker amb lease i màxim dues fonts simultànies, snapshot per binding, estat de frescor/error, lectura autoritzada i selector Meteo persistent al dispositiu; regressió 214/214 sense SKIP i Playwright mòbil sense egress. [Evidència](QA-UE-T07.md).
- **Reversió:** Pausar worker, mantenir últim snapshot amb estat antic; no esborrar històric legacy.

## UE-T08 — Geometria i mapa públic/propietari coherent

- **Dependències:** UE-T05, UE-T07.
- **Precondicions:** UE-D02 resolta; endpoint de propietari i vista administrativa separats, amb dades privades sense cache compartida.
- **Abast:** Repositori geo, mapGeometry/publication gate, endpoint me/map i capes client, invalidació de versió.
- **Resultat observable:** Privada al mapa del propietari i a la vista administrativa, mai al mapa públic; pública aproximada segons DCF-08.
- **Acceptació:** UE-CA05, UE-CA06, UE-CA10; coordenades límit/NaN/invertides, generalització estable en metres, HIDDEN, revocació i cache, llista/bounds/sitemap/history sense filtracions; admin veu privades en ruta autenticada i un altre usuari rep 404.
- **Proves i execució:** sufix `ue-visibility`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** FETA el 2026-09-20: geometria privada i pública separades, precisió d’usuari 1/5/10 km o oculta, opt-in transaccional, mapa públic/propietari/admin i invalidació monòtona; regressió 219/219 sense SKIP i Playwright mòbil sense egress. [Evidència](QA-UE-T08.md).
- **Reversió:** Desactivar capa autenticada; gate públic restrictiu es conserva sempre.

## UE-T09 — Preferència persistent i selecció temporal

- **Dependències:** UE-T07.
- **Precondicions:** Propietat validada al servidor.
- **Abast:** Preferences API/BD, store i URL, botó explícit, selector públic/propietari.
- **Resultat observable:** A recupera predeterminada entre sessions, B/global no canvien.
- **Acceptació:** UE-CA03; Dos contextos de navegador; canvi temporal, privada pròpia, estació aliena rebutjada com a default, retirada/desactivació/fallada font, logout neteja estat.
- **Proves i execució:** sufix `ue-preferences`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** FETA el 2026-09-20: preferència pròpia transaccional i versionada, selecció temporal per URL/selector, fallback amb avís, aïllament entre comptes i neteja de l'estat local; regressió 224/224 sense SKIP i navegador mòbil sense egress. [Evidència](QA-UE-T09.md).
- **Reversió:** Desactivar escriptura de preferències i resoldre global; conservar registres per reprendre.

## UE-T10 — Edició limitada de la vista pública

- **Dependències:** UE-T05, UE-T09.
- **Precondicions:** Global només pot apuntar a estació pública elegible.
- **Abast:** Formulari admin, config amb revision, targetes existents, resolució global.
- **Resultat observable:** Visitant i usuari sense preferència veuen ordre/targetes guardats.
- **Acceptació:** UE-CA04; 403 no admin, estació privada/interna rebutjada, conflicte de revision, revocació posterior, subconjunt buit rebutjat.
- **Proves i execució:** sufix `ue-publicview`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** FETA el 2026-09-20: configuració administrativa versionada de l'estació pública i del subconjunt/ordre de les sis targetes; resolució per a visitants i usuaris sense preferència; revocació fail-closed; regressió 230/230 sense SKIP i navegador mòbil sense egress. [Evidència](QA-UE-T10.md).
- **Reversió:** Restaurar revisió anterior només si estació encara publicable; altrament estat sense configuració.

## UE-T11 — Catàleg administrat i correccions de coordenades

- **Dependències:** UE-T05, UE-T08.
- **Precondicions:** UE-D02 concedeix lectura administrativa de recursos USER aliens; l’edició de metadades, ubicació, visibilitat i connector aliens continua fora d’abast. La política d’històric és l’única configuració administrativa transversal prevista a UE-T17.
- **Abast:** API/UI admin metadata/font/ubicació, overrides i audit.
- **Resultat observable:** Admin corregeix font administrada i conserva precisió/procedència.
- **Acceptació:** UE-CA06, UE-CA10; Mutacions alienes prohibides fins per admin; validació geo; exactes no filtrades; audit sense secrets.
- **Proves i execució:** sufix `ue-admincatalog`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** FETA el 2026-09-20: catàleg `ADMIN` separat, alta i correcció de metadata/font/ubicació amb revisió, overrides i auditoria; coordenada exacta només administrativa i projecció pública aproximada; mutacions d'estacions `USER` alienes rebutjades; regressió 236/236 sense SKIP. [Evidència](QA-UE-T11.md).
- **Reversió:** Revertir revisió sense escriptures posteriors; conflictes requereixen revisió.

## UE-T12 — Revalidar integració Grafana amb spike acotat

- **Dependències:** UE-T01.
- **Precondicions:** Ús intern autoritzat segons SPIKE-04; comprovar-ne l’abast abans de consultes.
- **Abast:** Només experiment local aïllat segons PLAN; documentar accés, límits, unitats, IDs i drets.
- **Resultat observable:** Informe amb evidència sanejada i conclusió, fins i tot si font no accessible.
- **Acceptació:** UE-CA07; Checklist manual: dues sèries conegudes, màxim 15 min, frames/unitats/nulls; cap rastreig ni publicació. No forma part de suite habitual.
- **Proves i execució:** protocol manual de PLAN, evidència datada i sanejada; sense consulta real obligatòria a la suite.
- **Finalització:** FETA el 2026-09-21 amb resultat CONDICIONAL: dashboard, datasource i dos frames revalidats en local; unitat absent al frame, drets limitats a prova interna, 0 persistència i 0 exposició pública. [Evidència](QA-UE-T12.md).
- **Reversió:** Eliminar credencials temporals; cap dada real persistida al catàleg operatiu.

## UE-T13 — Importador repetible amb staging i quarantena

- **Dependències:** UE-T11.
- **Precondicions:** Format d’inventari definit; no necessita connector real; usar fixtures inventades.
- **Abast:** Import dry-run/apply admin, hash, mapping, overrides i revisió de conflictes.
- **Resultat observable:** Repetir lot no altera catàleg; TEST/incomplets queden interns pendents.
- **Acceptació:** UE-CA07; Repetició, canvi de nom, ID duplicat, coordenada manual posterior, fila desapareguda, concurrència, rollback de lot sense trepitjar overrides.
- **Proves i execució:** sufix `ue-imports`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** FETA el 2026-09-21: dry-run/apply/rollback transaccionals, hash idempotent, quarantena i conflictes revisables, overrides preservats i UI només admin; regressió 241/241, 0 SKIP. [Evidència](QA-UE-T13.md).
- **Reversió:** Compensar només canvis atribuïbles al lot; no esborrar dades o correccions posteriors.

## UE-T14 — Adaptador Grafana intern condicionat

- **Dependències:** UE-T12, UE-T13, UE-T07.
- **Precondicions:** BLOQUEJADA si spike no confirma contracte/accés/límits; republicació continua desactivada.
- **Abast:** Adaptador de queries fixades i normalització de frames, binding verificat, vista interna admin.
- **Resultat observable:** Admin consulta sensor verificat intern amb unitats i temps; API pública no el retorna.
- **Acceptació:** UE-CA07, UE-CA09, UE-CA10; Fixtures múltiples frames/sèries, IDs desconeguts, nulls, longitud inconsistent, errors/auth; pluja desactivada si no validada; negació pública.
- **Proves i execució:** sufix `ue-grafana`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** FETA el 2026-09-21 dins el límit condicional de UE-T12: consulta backend fixada, normalització defensiva, UI interna només admin i exclusió pública completa; activació real, persistència, pluja i republicació continuen deshabilitades. Regressió 247/247, 0 SKIP. [Evidència](QA-UE-T14.md).
- **Reversió:** Desactivar adaptador i revocar secret; catàleg intern preservat.

## UE-T15 — Substituir només estimacions pels sis punts requerits

- **Dependències:** UE-T07, UE-T08, UE-T09.
- **Precondicions:** UE-D03 resolta: Andorra la Vella és la referència del punt «Andorra». Cal documentar les coordenades geogràfiques de les sis localitats abans de publicar-les.
- **Abast:** estimation_points, adaptador Open-Meteo, retirada dels cinc punts hardcoded, etiquetes a totes les superfícies.
- **Resultat observable:** Sis estimacions exactes, cap estació real eliminada, referències i hores visibles.
- **Acceptació:** UE-CA08, UE-CA09; comparar conjunt exacte de sis slugs; preservar IDs reals; «Estimació» a mapa/llista/selector/Meteo; errors/null/stale; mostrar Andorra la Vella com a ubicació de referència.
- **Proves i execució:** sufix `ue-estimates`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** regla comuna «Fet», amb evidència dels criteris indicats; estat actual NO INICIADA.
- **Reversió:** Restaurar configuració versionada de punts sense tocar estacions observades; no publicar coordenada provisional.

## UE-T16 — Verificació integrada i dossier de continuació

- **Dependències:** UE-T04, UE-T08, UE-T10, UE-T11, UE-T13, UE-T15.
- **Precondicions:** UE-T14 només si spike confirma contracte; si no, declarar connector Grafana pendent i fase principal parcial. UE-T17/18 verificaran després la política d’històric acordada.
- **Abast:** Suites existents + noves, gate local, accessibilitat manual pendent, QA de traçabilitat.
- **Resultat observable:** Evidència reproduïble de recorreguts complets, regressió i bloquejos restants.
- **Acceptació:** UE-CA01, UE-CA02, UE-CA03, UE-CA04, UE-CA05, UE-CA06, UE-CA07, UE-CA08, UE-CA09, UE-CA10, UE-CA11; Suite Node, integració obligatòria sense skips, Playwright 375px/desktop/teclat, regressió Cabals/Històrics/Previ, G06-09 manual separat.
- **Proves i execució:** sufix `ue-regression`; unit/http + integració + E2E, amb les ordres anteriors i els escenaris d’acceptació d’aquesta fitxa.
- **Finalització:** regla comuna «Fet», amb evidència dels criteris indicats; estat actual NO INICIADA.
- **Reversió:** Aturar promoció i mantenir increment segur anterior; no desplegar producció.

## UE-T17 — Política d’històric administrada per estació

- **Dependències:** UE-T07, UE-T11, UE-T16. UE-T14 és necessària només per provar una font Grafana real; el contracte s’exercita amb fixtures sense ella.
- **Precondicions:** UE-D05 resolta. BD sintètica i històric legacy de prova; drets de persistència verificats abans d’activar una font real externa.
- **Abast:** Migració additiva de polítiques per estació, API/UI només admin, scheduler amb lease i captura idempotent, purga per retenció individual, previsualització de l’impacte en estacions legacy, audit i lectura subjecta a stationPolicy.
- **Resultat observable:** Admin activa estació A a 15 min/30 dies i B a 60 min/90 dies; C sense política conserva només snapshot. Captures i purgues no s’interfereixen.
- **Acceptació:** UE-CA12, UE-CA10, UE-CA11; període >= cadència de font i dins 5–1440 min, retenció 1–3650 dies; admin únic editor de política; inserció repetida no duplica; aturada de font no inventa històric; purga amb predicate station_id i límit exacte; desactivar no esborra; l’estació MeteoLord legacy conserva la captura anterior fins tenir política explícita, sense purga durant el mode compatible; primera purga de llegat exigeix previsualització i conserva dades durant la migració; propietari/altre usuari/visitant només llegeixen històric si el permís de l’estació ho permet.
- **Proves i execució:** sufix `ue-history`; unit/http + integració + E2E amb les ordres anteriors. Integració obligatòria sobre dues polítiques, una sense política, timestamps al límit, concurrència, upgrade de mesures legacy i fallada de purga; E2E de configuració admin i d’accés a històrics privats.
- **Finalització:** regla comuna «Fet», amb evidència de captures, purga per estació i preservació del llegat; estat actual NO INICIADA.
- **Reversió:** Pausar scheduler i purga, preservar dades i polítiques; restaurar snapshot sintètic en proves. Cap rollback destructiu automàtic d’històrics reals.

## UE-T18 — Gate final amb històrics i decisions adoptades

- **Dependències:** UE-T16, UE-T17. UE-T14 s’exigeix només si el spike valida la integració; si queda bloquejada, declarar el connector real pendent amb motiu.
- **Precondicions:** Evidències de les tasques completes, run aïllat, cap dada real a fixtures. Revisió dels drets Grafana documentada per separat de la funcionalitat local.
- **Abast:** Reexecutar gate local, traçar UE-R01–12 ↔ UE-CA01–12 ↔ proves, revisar permisos admin sobre privades, verificació email i polítiques de retenció. Documentar G06-09 manual i qualsevol límit de publicació.
- **Resultat observable:** Dossier final que diferencia funcionalitat local verificada, connector Grafana condicional, dret de publicació i controls manuals pendents.
- **Acceptació:** UE-CA01–UE-CA12; sense skips d’integració, regressió Meteo/Cabals/Històrics/Previ i mapa, alta verificada, matriu d’accés, dues retencions diferents i cap exposició pública de dades no autoritzades.
- **Proves i execució:** `npm test`, `npx --no-install playwright test` i `bash scripts/meteolord-local.sh gate` amb run configurat; revisió manual d’accessibilitat separada segons G06-09. Registrar ordres, resultats i skips.
- **Finalització:** regla comuna «Fet», amb QA datada; estat actual NO INICIADA. Cap declaració de producció preparada si falten drets, transport de correu o gate manual.
- **Reversió:** Mantenir l’últim increment segur local; no promoure ni desplegar fins resoldre les comprovacions pendents.
