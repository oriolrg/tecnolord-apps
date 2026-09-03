# SPEC-10 - Entorn local, proves i desplegament segur de MeteoLord

**Versió:** 0.3
**Estat:** APROVADA
**Abast d’aprovació:** FASE A — NUCLI LOCAL
**Data d’aprovació:** 2026-09-03
**Aprovada per:** Oriol
**Data:** 2026-09-03
**SPEC paraigua:** `SPEC-00 v0.5`, encara no aprovada
**Descoberta relacionada:** `SPIKE-04 v1.1`, `VIABLE AMB CONDICIONS`

## 0. Naturalesa, fonts i llenguatge normatiu

Aquesta és una especificació verificable, no un PLAN. Defineix què ha de complir l'entorn local i quines portes bloquegen una promoció. No selecciona eines, no modifica Docker/Caddy, no crea variables i no autoritza implementació ni desplegament. El futur `PLAN-10` podrà proposar i justificar els canvis necessaris a Docker, Docker Compose, Caddy, configuració, variables, dependències, migracions i scripts de prova. Els requisits normatius, les recomanacions i les decisions pendents es presenten separadament; cap exemple o recomanació fixa una solució tècnica.

Els termes **HA DE**, **NO POT** i **BLOQUEJA** són normatius. `PENDENT DE CONFIRMAR` identifica una decisió no resolta.

Classificació de traçabilitat:

- **FET-REPO:** fet confirmat a `INSPECCIO-00` i als artefactes versionats;
- **REQ-00:** requisit candidat procedent de `SPEC-00 v0.5`;
- **COND-04:** condició procedent de `SPIKE-04 v1.1`;
- **REQ-10:** requisit propi d'aquesta SPEC per fer verificables l'aïllament, les proves i la promoció;
- **HIPÒTESI:** no autoritza implementació i necessita validació;
- **RECOMANACIÓ:** opció no vinculant per al futur PLAN.

L'autorització d'Albert per a ús intern i proves Grafana és informació comunicada per l'usuari. No s'ha aportat com a document contractual verificat i no autoritza republicació.

## 1. Objectiu

Definir un entorn MeteoLord local reproduïble, diagnosticable i aïllat de producció que permeti:

- arrencar els components necessaris de MeteoLord des d'un checkout net;
- crear la base de dades des de zero mitjançant migracions versionades;
- treballar amb fixtures exclusivament sintètics;
- validar el frontend, backend, persistència i tasques sense contactar producció;
- executar builds i proves automatitzades amb resultats repetibles;
- permetre validar primer un nucli local bàsic sense Grafana;
- demostrar, en una fase posterior i separada, que qualsevol dada Grafana roman `INTERNAL_ONLY` abans de fer-ne el PoC local;
- impedir una promoció si falla qualsevol porta crítica;
- definir condicions verificables de promoció i reversió sense executar-les en aquesta fase.

Traçabilitat: REQ-00 RF-19, RNF-11, RNF-12; COND-04 seccions 6, 7 i 11; FET-REPO `INSPECCIO-00`.

## 2. Abast

Inclou l'especificació de:

- configuració local d'exemple sense secrets;
- topologia mínima local de MeteoLord;
- separació de xarxa, configuració, DB i volums;
- migracions des d'una DB buida;
- fixtures sintètics i dobles de proveïdor;
- execució del frontend `site/`, backend `backend`, PostgreSQL `db` i tasques periòdiques;
- tractament de l'API Python segons el seu estat real;
- logs, salut i diagnosi;
- build, validacions estàtiques, proves automatitzades i proves funcionals mínimes;
- condicions prèvies del PoC Grafana intern;
- porta local obligatòria abans de qualsevol prova al servidor;
- evidències de promoció i procediment verificat de reversió.

L'abast tècnic parteix dels noms confirmats `db`, `backend`, `caddy`, `site/` i `api_py`; no en crea de nous.

### 2.1 Fases i dependències

| Fase | Resultat verificable | Dependència i límit |
|---|---|---|
| A — Nucli local bàsic | configuració segura, serveis MeteoLord mínims, DB local recreable, migracions canòniques, fixtures sintètics, tasques simulades, logs, salut, build i proves | no depèn del mapa, del login definitiu ni de Grafana; Grafana ha de romandre absent o desactivat |
| B — PoC Grafana intern | consulta només des del backend, separació de dades, accés intern segur amb `SUPERADMIN` o control equivalent aprovat, proves negatives, límits i allowlist | només pot començar després de validar la fase A i de resoldre les decisions de categoria B; no autoritza servidor, persistència productiva ni publicació |
| C — Promoció segura al servidor | promoció del mateix artefacte provat, configuració de destí validada, compatibilitat de DB, còpia de seguretat, migració provada, comprovacions postdesplegament, reversió verificada i cap dependència de recursos irreproduïbles | requereix autorització separada per actuar al servidor; no inclou implementar mapa, login, usuaris, multiestació ni publicació |

La fase A és una unitat aprovable i implementable per si mateixa després del PLAN corresponent. Una decisió oberta exclusiva de les fases B o C no la bloqueja.

## 3. Elements exclosos

Aquesta SPEC no autoritza ni defineix la implementació de:

- mapa comunitari o selecció cartogràfica;
- registre, login, aprovació, suspensió o reactivació d'usuaris;
- rol o sessió `SUPERADMIN`;
- alta Ecowitt multiestació;
- adaptador Grafana productiu;
- ingesta històrica nova o regla de resum horari;
- retenció de dades;
- canvis d'esquema o migracions concrets;
- canvis a Docker, Compose, Caddy o dependències;
- variables d'entorn noves;
- execució del PoC Grafana;
- prova des del servidor;
- desplegament o canvi de producció;
- ingesta, persistència o publicació productiva Grafana;
- selecció entre Instamaps, Leaflet i MapLibre.

Tampoc s'inclou importar els bolcats o CSV reals presents al repositori com a fixtures locals.

Aquestes exclusions limiten què especifica o autoritza el document actual; no impedeixen que el futur `PLAN-10` proposi canvis tècnics justificats per satisfer els requisits de la fase corresponent. Les funcionalitats de mapa, identitat, usuaris, multiestació i publicació continuen sota les seves SPEC específiques i no formen part de la fase C.

## 4. Actors

### ACT-10-01 - Desenvolupador local

Prepara i executa l'entorn local, migracions sobre una DB local buida, fixtures sintètics i proves. No necessita ni rep accés a secrets o volums productius.

### ACT-10-02 - Revisor tècnic

Verifica les evidències de build, migració, proves, separació d'entorns, protecció de secrets i no-publicació. Pot bloquejar la promoció.

### ACT-10-03 - Operador de promoció

Només pot preparar una promoció quan totes les portes locals són verdes i hi ha una autorització separada per actuar al servidor. Aquesta SPEC no concedeix aquesta autorització.

### ACT-10-04 - `SUPERADMIN` local

Actor previst per REQ-00/COND-04 per consultar el resultat del futur PoC Grafana. La fase B pot usar `SUPERADMIN` o un control intern equivalent explícitament aprovat, sempre amb autenticació i autorització al servidor. La identitat definitiva del producte continua `PENDENT DE CONFIRMAR` a `DCF-01`; l'absència d'aquest control bloqueja el PoC, però no la fase A.

### ACT-10-05 - Visitant no autenticat de prova

Actor usat per demostrar que les superfícies públiques no revelen estacions, metadades, valors o errors Grafana `INTERNAL_ONLY`.

## 5. Requisits funcionals

### RF10-01 - Preparació des d'un checkout net

L'entorn HA DE poder preparar-se des d'un checkout net mitjançant un procediment versionat i documentat, sense copiar artefactes, DB, volums o secrets del servidor. Els artefactes i les ordres exactes són `PENDENT DE CONFIRMAR` al futur PLAN.

### RF10-02 - Perfil mínim MeteoLord

HA D'existir una forma documentada d'executar només els components requerits per MeteoLord. L'arrencada local NO POT arrossegar obligatòriament OrientaTrack, Entrenador Personal, Opos, Biblioteca, PaP o Umami.

### RF10-03 - Entrada web local

El frontend HA DE ser accessible en un origen local explícit i NO POT requerir els dominis productius. L'host i port publicat exactes són `PENDENT DE CONFIRMAR`; abans de fixar-los s'han de comprovar col·lisions i compatibilitat amb `<base href="/meteo/">`.

### RF10-04 - Serveis mínims

La fase A HA DE proporcionar:

- `site/` sota `/meteo/`;
- API Node `backend`;
- PostgreSQL `db` amb l'esquema canònic;
- un mecanisme local reproduïble per disparar o simular les tasques periòdiques;
- un punt d'entrada local que conservi mateix origen i rutes quan sigui necessari.

`api_py` només formarà part del criteri d'arrencada quan tingui una API real i un contracte aprovat. Fins aleshores, les rutes que hi apunten NO PODEN produir un fals estat de servei disponible.

### RF10-05 - Configuració comprovable

Abans d'arrencar, una validació HA DE llistar les variables obligatòries absents només pel nom, sense imprimir valors. Configuració incompleta HA DE fallar abans de contactar cap proveïdor.

### RF10-06 - Bootstrap de DB

Des d'una DB buida, una única seqüència canònica HA DE crear totes les relacions que usa el backend. `public.measurement`, `meteo.estacions`/`meteo.mesures`, les variants `estacions_meteo`/`lectures_meteo`, `hidro.*` i les taules de previsió NO ES PODEN barrejar implícitament.

### RF10-07 - Fixtures sintètics

Un procediment versionat HA DE carregar un conjunt mínim de dades inventades, recognoscibles com a sintètiques i deterministes. La càrrega HA DE ser idempotent i NO POT llegir els bolcats ni CSV reals del repositori. L'ordre i el format concrets corresponen al PLAN.

### RF10-08 - Proveïdors externs desactivats per defecte

L'arrencada local base i la suite normal NO PODEN cridar Ecowitt, ACA, Open-Meteo, Grafana, analítica productiva ni cap altra font externa. Les proves de contracte externes han de ser explícites, separades i opt-in.

### RF10-09 - Dobles de prova d'ingesta

Les ingestes HAURAN de poder provar èxit, resposta buida, zero legítim, timeout, error HTTP, timestamp invàlid i fallback mitjançant fixtures o dobles locals. En el cas del zero, la fase A HA DE caracteritzar de manera reproduïble el comportament actual descrit a `DEFECT-01`; corregir-lo queda fora d'aquesta SPEC. El mecanisme concret és `PENDENT DE CONFIRMAR`.

### RF10-10 - Tasques periòdiques reproduïbles

Les tasques Ecowitt+ACA i previsió HAURAN de poder disparar-se manualment en local sense instal·lar cron a l'host. El scheduler local futur NO POT contactar fonts reals per defecte. La freqüència productiva no es redefineix aquí.

### RF10-11 - Rutes base

L'entorn HA DE permetre validar `/meteo/`, `/api/ping`, `/health`, `/api/v1/mesures/darreres`, `/api/v1/hidro/darreres` i les rutes de previsió existents. La ruta de salut HA DE representar correctament l'estat de la dependència DB i no pot dependre d'un `api_py` absent.

### RF10-12 - Baseline visual i de dades

Amb fixtures sintètics, la pantalla actual HA DE continuar representant els camps disponibles, l'antiguitat, els guions per a absència, les cards i els històrics descrits a `PROJECT-CONTEXT-METEOLORD.md`.

### RF10-13 - Logs de diagnosi

Cada servei i tasca HA DE generar logs locals identificables, amb timestamps, resultat i causa útil. Els logs NO PODEN contenir secrets, cookies, claus, URLs amb credencials, PromQL aportat pel client ni payloads Grafana reals.

### RF10-14 - Neteja segura

El procediment local HA DE permetre eliminar només recursos del projecte local identificats explícitament. NO POT usar paths amplis, volums productius, `git reset --hard`, `git clean`, `docker system prune` o una selecció basada en variables no resoltes.

### RF10-15 - Evidències de prova

Cada execució candidata a promoció HA DE registrar commit, configuració no sensible, versions d'eina, proves executades, resultat i artefactes. Cap prova no executada es pot presentar com a superada.

## 6. Requisits no funcionals

### RNF10-01 - Aïllament

Local i producció HAN DE tenir identificadors de recursos, xarxes, volums, DB, credencials, orígens web i destinacions de logs diferents. L'absència d'una marca d'entorn HA DE fallar de manera segura. La convenció tècnica exacta dels identificadors correspon al PLAN.

### RNF10-02 - Reproduïbilitat

Dos checkouts del mateix commit i la mateixa arquitectura suportada HAN de resoldre versions equivalents i produir el mateix esquema i fixtures. El PLAN HA DE seleccionar un mecanisme verificable de resolució i fixació de dependències; aquesta SPEC no pressuposa que hagi de ser un lockfile concret ni autoritza actualitzacions de dependències.

### RNF10-03 - Seguretat per defecte

Cap servei de dades HA DE publicar-se a totes les interfícies de l'host per defecte. Només el punt d'entrada web local necessari pot ser accessible, i l'administració Caddy no pot quedar exposada fora de loopback.

### RNF10-04 - Protecció de secrets

Els secrets NO ES PODEN versionar, copiar de producció, imprimir, incloure en captures, persistir en fixtures ni enviar al navegador. Els exemples només poden usar placeholders.

### RNF10-05 - Temps

Fixtures, migracions i proves HAN d'usar instants inequívocs en UTC. La presentació a la zona del navegador s'ha de provar separadament. Aquesta SPEC no modifica la política funcional de temps.

### RNF10-06 - Idempotència

Reexecutar migracions, fixtures i tasques idempotents NO POT crear duplicats ni canviar dades de manera no determinista.

### RNF10-07 - Diagnosi

Una fallada de configuració, DB, migració o proveïdor HA DE distingir-se i retornar un estat que les proves puguin detectar. Un `health` amb DB caiguda no es pot considerar saludable.

### RNF10-08 - Rendiment mínim

La suite local HA DE detectar consultes o respostes no acotades i HA DE conservar els límits de consulta existents quan siguin explícits. Els llindars quantitatius i la forma concreta de mesurar-los són `PENDENT DE CONFIRMAR`.

### RNF10-09 - Portabilitat

El flux HA DE funcionar amb Docker Engine i Docker Compose compatibles documentats. Sistemes operatius i arquitectures suportats són `PENDENT DE CONFIRMAR`.

### RNF10-10 - Accessibilitat de la prova

Les proves funcionals de la vista HAN d'incloure navegació bàsica, etiquetes accessibles i representació alternativa a dades absents. Els criteris complets del mapa pertanyen a `SPEC-06`.

### RNF10-11 - Fallada tancada de Grafana

Qualsevol absència, error o configuració desconeguda de l'abast Grafana HA DE resultar en `INTERNAL_ONLY` i absència total a superfícies públiques.

## 7. Separació entre local i producció

| Recurs | Requisit local | Prohibició |
|---|---|---|
| Identificador d'entorn | explícit i verificable | no inferir “local” només per hostname |
| Identificador de recursos | exclusiu de local | no usar identificadors productius; la convenció concreta queda per al PLAN |
| Xarxa | creada per al projecte local | no unir-se a xarxes externes productives |
| DB | instància/DB exclusivament local | no acceptar host o URL productius |
| Volums | noms locals i inventariables | no muntar `pgdata` productiu ni backups reals |
| Secrets | credencials locals o placeholders | no copiar `.env` del servidor |
| Caddy/origen | hostname local | no requerir certificats o dominis productius |
| Egress | denegat o controlat per defecte | no contactar proveïdors/analítica en la suite base |
| Logs | directori local | no escriure al directori de logs productiu |
| Dades | fixtures sintètics | no importar SQL/CSV reals per defecte |

La validació prèvia HA DE detectar indicadors de producció a hosts, URLs, noms de volum o configuració i HA DE bloquejar l'arrencada/migració. El conjunt exacte d'indicadors i el mecanisme són `PENDENT DE CONFIRMAR`.

## 8. Configuració d'exemple sense secrets

La configuració local versionada futura HA DE derivar exclusivament de noms ja utilitzats pel repositori. El nom i format final de l'artefacte són `PENDENT DE CONFIRMAR`. Aquest bloc és contractualment il·lustratiu; els tokens entre `<...>` no són valors executables:

```dotenv
# Procés i PostgreSQL local
NODE_ENV=<LOCAL_MODE>
PORT=<BACKEND_INTERNAL_PORT>
POSTGRES_USER=<LOCAL_ONLY_USER>
POSTGRES_PASSWORD=<LOCAL_ONLY_SECRET>
POSTGRES_DB=<LOCAL_ONLY_DATABASE>
POSTGRES_HOST=<LOCAL_DB_HOST>
POSTGRES_PORT=<LOCAL_DB_PORT>

# Protecció de tasques, només local
INGEST_API_KEY=<LOCAL_ONLY_SECRET>

# Identificació de l'estació sintètica
ADMIN_EMAIL=<SYNTHETIC_EMAIL>
ESTACIO_CODI=<SYNTHETIC_STATION_CODE>
ESTACIO_NOM=<SYNTHETIC_STATION_NAME>

# Previsió: només per a doble local en la suite base
PREVI_LAT=<SYNTHETIC_LATITUDE>
PREVI_LON=<SYNTHETIC_LONGITUDE>
PREVI_MODEL=<CONFIRMED_TEST_MODEL>
PREVI_SOURCE=<TEST_SOURCE_APPROVED_IN_PLAN>
PREVI_STATION_CODE=<SYNTHETIC_STATION_CODE>
PREVI_HOURS=<BOUNDED_TEST_HOURS>
```

La configuració Ecowitt real (`ECW_*`, `ECW_FB_*`) NO és necessària per a la suite base i no hi ha d'aparèixer amb valors. Quan una prova externa Ecowitt sigui autoritzada, usarà els noms existents identificats a `INSPECCIO-00`, fora del repositori.

No es defineixen noms de variables Grafana en aquesta SPEC perquè el repositori no en conté i inventar-los anticiparia `SPEC-05`/PLAN. Els noms, tipus i obligatorietat són `PENDENT DE CONFIRMAR`.

La configuració d'exemple final HA DE:

- incloure tots els noms obligatoris del perfil local;
- separar obligatoris, opcionals i exclusius de proves externes;
- usar comentaris `#` vàlids;
- no incloure URLs productives com a valors locals per defecte;
- superar una prova automàtica d'absència de secrets reals.

## 9. Base de dades i volums exclusivament locals

### RF10-DB-01

La DB local HA DE crear-se en un volum identificat inequívocament com a local. La prova de destrucció/recreació només pot actuar sobre aquest volum resolt i validat.

### RF10-DB-02

El port PostgreSQL NO s'ha de publicar a l'host si les proves no ho exigeixen. Si es publica, l'enllaç HA DE limitar-se a loopback i el port exacte serà `PENDENT DE CONFIRMAR` després de comprovar col·lisions.

### RF10-DB-03

Cap ordre local HA DE contenir host, credencial, path de backup o nom de volum de producció.

### RF10-DB-04

Els tests de DB HAN d'usar persistència temporal o una DB de test separada inequívocament de la DB local de desenvolupament. El mecanisme de persistència concret correspon al PLAN.

### RF10-DB-05

La prova HA DE demostrar que l'arrencada no depèn de `scripts/meteo.sql`, `migration/legacy_inserts_*.sql` ni `backend/db/*.csv`.

## 10. Esquema local i compatibilitat productiva

La inspecció ha trobat vocabularis incompatibles, cap seqüència completa de migracions i cap evidència de l'esquema real del servidor. Aquesta SPEC diferencia tres contractes que no es poden donar per equivalents.

### 10.1 Esquema canònic local — Fase A

El futur `PLAN-10` de fase A pot definir un esquema canònic exclusivament local basat en:

- les relacions realment utilitzades pel runtime;
- els endpoints existents;
- les ingestes existents;
- fixtures sintètics;
- les proves locals exigides per aquesta SPEC.

Aquest esquema serveix per executar i provar el sistema local. NO ES POT considerar automàticament la baseline de producció ni prova de compatibilitat amb el servidor.

Les migracions locals HAN DE proporcionar:

1. una única font de veritat de l'esquema local;
2. versions ordenades i traçables;
3. aplicació automàtica sobre PostgreSQL buit;
4. registre de versions aplicades;
5. reexecució segura;
6. creació de totes les relacions requerides pel runtime actual;
7. restriccions i índexs idempotents;
8. cap importació de dades reals en el camí base.

La prova neta de fase A HA DE:

- crear una DB o persistència temporal identificada;
- aplicar totes les migracions locals;
- verificar esquemes, taules, constraints i índexs esperats;
- arrencar el backend contra aquella DB;
- carregar fixtures sintètics;
- executar les proves d'integració;
- destruir només el recurs temporal identificat.

Qualsevol error d'aquest flux BLOQUEJA la validació de la fase A. L'eina de migracions, els noms locals finals i el tractament local del legacy corresponen a `DLT-01` i `DLT-02`.

### 10.2 Baseline productiva — Fase C

L'esquema real de producció no s'ha inspeccionat i continua `PENDENT DE CONFIRMAR`. Abans de qualsevol promoció, una actuació separada, autoritzada, segura i de només lectura HA DE:

- inventariar l'esquema real del servidor;
- identificar versions, objectes i divergències respecte de l'artefacte candidat;
- definir i verificar una còpia de seguretat recuperable;
- establir una baseline productiva explícita.

Aquest inventari no forma part de la fase A i no en bloqueja el `PLAN-10`. Aquesta SPEC no autoritza accedir ara al servidor.

### 10.3 Camí de migració compatible — Fase C

Abans de promocionar, el futur pla de fase C HA DE:

- comparar la baseline productiva amb l'esquema requerit per l'artefacte candidat;
- demostrar compatibilitat o identificar cada canvi necessari;
- preparar una migració traçable i acotada;
- definir un avanç correctiu o una reversió per als canvis no retrocompatibles;
- provar migració, comprovacions posteriors i recuperació en un entorn descartable representatiu.

L'artefacte, la promoció i la reversió corresponen a `DLT-12`; l'inventari, baseline i compatibilitat productiva corresponen a `DLT-13`.

## 11. Fixtures sintètics

Els fixtures HAN DE ser:

- completament inventats i marcats com a prova;
- petits, llegibles, versionats i deterministes;
- independents del rellotge real o amb rellotge controlat;
- idempotents;
- coherents amb UTC;
- lliures de dades, noms, coordenades, identificadors i respostes reals Grafana;
- lliures de secrets Ecowitt, tokens, cookies i dades del servidor;
- aptes per provar valors zero, nuls, extrems vàlids i timestamps antics/recents.

Conjunt mínim requerit:

- una estació meteorològica sintètica activa amb lectures recents i històriques;
- una lectura amb camps absents;
- una lectura amb zeros meteorològics legítims;
- punts hidrològics sintètics amb cabal/capacitat;
- una previsió sintètica amb diversos horitzons;
- configuració de proveïdor simulada per provar èxit i fallada.

Qualsevol fixture per a models futurs d'usuari, publicació o Grafana s'afegirà només després d'aprovar les SPEC corresponents.

## 12. Serveis que s'han de poder executar

| Component | Capacitat exigida | Estat actual |
|---|---|---|
| `db` | arrencar saludable amb volum local buit i migracions completes | no compleix |
| `backend` | arrencar amb configuració local, consultar DB i servir API | parcial; depèn d'esquema absent |
| `site/` | servir-se sota `/meteo/` sense dependència productiva | parcial; Caddy i analítica estan orientats a producció |
| `caddy` o equivalent local | conservar `/meteo` i `/api` en mateix origen | configuració local pendent |
| tasques | execució manual contra dobles locals | no compleix per defecte; serveis contacten fonts reals |
| `api_py` | només si hi ha contracte i aplicació real | no implementat; exclòs del mínim actual |

L'ordre d'arrencada, healthchecks, profiles/overrides i noms d'artefacte són decisions de PLAN, no d'aquesta SPEC.

## 13. Logs i diagnosi

Els logs locals HAN d'incloure com a mínim:

- servei/tasca;
- timestamp UTC;
- identificador de correlació per execució;
- tipus de resultat (`ok`, `skipped`, `validation_error`, `source_error`, `db_error` o equivalent aprovat);
- durada;
- recompte de files afectades quan sigui segur;
- causa resumida sense payload sensible.

Els diagnòstics HAN DE diferenciar:

- variable absent;
- DB no accessible;
- migració pendent/fallida;
- fixture fallit;
- proveïdor simulat amb error;
- endpoint no saludable;
- intent d'egress bloquejat;
- intent d'accés públic a dades internes.

El sistema de logs NO POT:

- escriure valors de secrets;
- registrar `x-api-key`, query keys, cookies o headers d'autorització;
- registrar URLs Ecowitt amb claus;
- registrar consultes o respostes Grafana reals en superfícies públiques;
- confondre DB caiguda amb estat saludable.

Format de log, llibreria i política de retenció local: `PENDENT DE CONFIRMAR`.

## 14. Build i proves automatitzades

Cada categoria s'aplica només a la fase indicada. No hi ha actualment framework de test MeteoLord ni scripts `test`/`build`; runner, cobertura i ordres exactes corresponen al futur PLAN de cada fase.

### 14.1 Fase A — Nucli local

| Categoria | Resultat verificable |
|---|---|
| Configuració | configuració local resol sense secrets, destinacions productives ni variables obligatòries buides |
| Serveis mínims | només els components MeteoLord necessaris queden disponibles |
| Dependències | instal·lació reproduïble amb el mecanisme de resolució aprovat |
| Sintaxi/lint | backend, frontend, shell, SQL/migracions i configuració del punt d'entrada |
| Build | artefactes locals exactes del commit candidat |
| Unitat | normalització actual, zeros/nuls, temps i fallback; sense proves de login o adaptador Grafana |
| Integració | backend + DB amb esquema local migrat + fixtures sintètics |
| Contracte intern | forma de les respostes i errors de les API actuals |
| Migració local neta | PostgreSQL buit → esquema canònic local actual |
| Regressió frontend | `/meteo/`, cards, cabals, històrics i absències actuals |
| Salut i logs | DB disponible/no disponible, causes diferenciades i absència de secrets |
| Egress | cap contacte amb producció, analítica o proveïdors externs |
| Grafana desactivat | integració absent o desactivada i cap dada Grafana als fixtures o artefactes |
| End-to-end | flux del nucli actual complet amb tasques simulades i sense serveis productius |

### 14.2 Fase B — PoC Grafana intern

| Categoria | Resultat verificable |
|---|---|
| Adaptador backend | cap consulta Grafana s'origina al navegador |
| Allowlist i límits | només sensors aprovats i consultes acotades |
| Contracte | resposta correcta, buida, frame absent, sèrie múltiple, timeout i canvi de forma |
| Inputs manipulats | PromQL, URL, datasource i sensor arbitraris es rebutgen |
| Autenticació | absència o invalidesa de sessió es denega |
| Autorització | només `SUPERADMIN` o control equivalent aprovat accedeix al resultat intern |
| No-publicació | mapa, llistes, fitxes, API, cache, logs i errors públics no revelen dades `INTERNAL_ONLY` |

### 14.3 Fase C — Promoció segura

| Categoria | Resultat verificable |
|---|---|
| Artefacte | el destí rep exactament l'artefacte provat |
| Configuració de destí | valors obligatoris validats sense copiar-los a artefactes o evidències |
| Compatibilitat DB | baseline productiva inventariada i comparada amb el candidat |
| Còpia de seguretat | recuperació comprovada abans de migrar |
| Migració | camí compatible provat en un entorn descartable representatiu |
| Postdesplegament | salut i regressió crítica comprovades després de la promoció |
| Reversió | retorn o avanç correctiu provat sense operacions destructives globals |
| Funcions externes | qualsevol integració sense autorització específica roman desactivada i `INTERNAL_ONLY` quan sigui aplicable |

Una fallada crítica BLOQUEJA només la fase a la qual s'aplica i qualsevol fase que en depengui. Cap prova exclusiva de B o C pot bloquejar l'acceptació de la fase A.

## 15. Proves funcionals mínimes

### 15.1 Fase A — Nucli local

Amb DB local neta migrada i fixtures sintètics, s'HA DE verificar:

1. `/meteo/` carrega HTML, CSS, JavaScript i icones des de l'origen local;
2. `/api/ping` respon correctament;
3. `/health` diferencia DB saludable de DB no disponible amb estat detectable;
4. la consulta meteo per estació retorna només la fixture sol·licitada;
5. els rangs i l'agregació horària conserven forma i ordre;
6. la pantalla mostra valors presents i `—` per absència;
7. el cas de zero legítim reprodueix i registra el defecte de `DEFECT-01` i la prova demostra que el detecta, sense exigir corregir-lo;
8. la pantalla calcula antiguitat i gràfiques amb timestamps controlats;
9. les pantalles Cabals i Històrics carreguen dades sintètiques;
10. la previsió desada es pot consultar;
11. una tasca amb API key absent o incorrecta es rebutja sense filtrar la clau;
12. una tasca simulada reeixida persisteix una vegada;
13. reexecutar la mateixa observació no duplica;
14. una resposta buida no crea una mesura buida;
15. una font principal fallida prova el fallback simulat;
16. un proveïdor fallit no trenca les lectures ja persistides;
17. el navegador no envia consultes de proveïdor ni contacta producció;
18. Grafana roman absent o desactivat i els fixtures i artefactes no contenen dades Grafana reals.

Aquestes proves no depenen de login, `SUPERADMIN`, allowlist ni adaptador Grafana.

### 15.2 Fase B — PoC Grafana intern

Només quan la fase B estigui autoritzada, s'HA DE verificar:

1. l'adaptador construeix la consulta exclusivament al backend;
2. només accepta sensors de l'allowlist i aplica els límits aprovats;
3. gestiona èxit, buit, frame absent, sèrie múltiple, timeout i canvi de contracte;
4. rebutja PromQL, URL, datasource o sensor manipulats pel client;
5. denega l'accés sense autenticació vàlida;
6. denega rols no autoritzats i permet només `SUPERADMIN` o el control equivalent aprovat;
7. les proves negatives confirmen que cap superfície, cache, log o error públic revela dades `INTERNAL_ONLY`.

### 15.3 Fase C — Promoció segura

Amb autorització específica per actuar al servidor, s'HA DE verificar:

1. l'artefacte promogut és el mateix que s'ha provat;
2. la configuració del destí és completa i no queda empaquetada ni registrada;
3. la baseline productiva ha estat inventariada de manera segura i comparada;
4. la còpia de seguretat és recuperable;
5. la migració compatible s'ha provat en un entorn descartable representatiu;
6. les comprovacions postdesplegament de salut i regressió crítica passen;
7. la reversió o l'avanç correctiu resta provat i acotat;
8. qualsevol funcionalitat externa sense autorització específica continua desactivada i, si és Grafana, `INTERNAL_ONLY`.

## 16. Tractament `INTERNAL_ONLY` de Grafana

Aquesta secció és normativa per a la fase B i per a qualsevol fase C que inclogui codi o configuració Grafana. A la fase A, l'obligació verificable és que Grafana romangui absent o desactivat. S'apliquen REQ-00 RF-18 i COND-04:

- tota font Grafana neix i roman `INTERNAL_ONLY` per defecte;
- absència o error de configuració manté `INTERNAL_ONLY`;
- l'abast s'aplica al backend, independentment del rol de qui administra;
- mapa, llista, modal, fitxa, cerca, agregació, metadades, sitemap, cache, logs i qualsevol API pública NO PODEN revelar existència, ubicació, sensor, valors ni errors específics;
- fixtures, captures, documentació pública i artefactes de test NO PODEN contenir dades Grafana reals;
- un desplegament de codi NO modifica implícitament l'abast;
- `PUBLIC_ALLOWED` només serà possible amb autorització explícita, separada i traçada de republicació i amb una SPEC aprovada.

Les proves negatives HAN de cobrir usuaris anònims, usuaris normals, identificadors coneguts/inventats, llistats, accessos directes, errors, cache i serialitzacions.

## 17. PoC Grafana exclusivament des del backend

El PoC forma part exclusivament de la fase B. NO es pot executar fins que la fase A sigui vàlida i hagin passat la separació local, la protecció de secrets, les proves d'autorització i les proves negatives de no-publicació.

Quan s'autoritzi una fase posterior, el PoC HA DE:

- iniciar-se en el backend local, mai al navegador;
- construir la consulta des de plantilles internes;
- rebutjar PromQL, URL base, datasource o paràmetres arbitraris del client;
- validar el sensor amb allowlist;
- usar base URL i datasource controlats;
- limitar rang temporal, `maxDataPoints`, timeout, mida i reintents;
- validar codi HTTP i forma dels frames;
- gestionar resposta buida, frame absent, sèrie múltiple i canvi de contracte;
- no escriure la resposta a logs públics, fixtures, captures o documentació;
- no alimentar rutes públiques;
- quedar desactivat per defecte.

Límits exactes, freqüència, unitats pendents, autenticació alternativa, persistència fora de prova i noms de configuració: `PENDENT DE CONFIRMAR` a `DCF-06`/`SPEC-05`.

No s'ha executat cap PoC durant la redacció d'aquesta SPEC.

## 18. Accés al resultat només per `SUPERADMIN` o control equivalent aprovat

El resultat del PoC només pot ser visible en local a un `SUPERADMIN` autenticat i autoritzat pel servidor o a un control intern equivalent aprovat abans d'executar la fase B. L'equivalència només és vàlida per al PoC intern i no resol `DCF-01` ni l'accés del producte final.

Requisits:

- denegació per defecte sense sessió;
- denegació per a `PENDING`, `REJECTED`, `SUSPENDED` i rols no `SUPERADMIN` quan aquests estats existeixin;
- comprovació de rol a cada petició al backend, no només a la UI;
- sessió revocable i protecció CSRF si s'usen cookies;
- cap resultat incrustat en HTML/JavaScript públic;
- cap cache compartida amb rutes públiques;
- auditoria de l'intent i resultat sense registrar payloads ni secrets.

Com que el repositori no implementa cap d'aquests mecanismes i la decisió de categoria B corresponent és oberta, el PoC roman **BLOQUEJAT**. `DCF-01` continua obert per a la SPEC funcional d'identitat, fora de l'abast de la fase C.

## 19. Porta obligatòria abans del servidor

No es pot preparar ni executar cap canvi al servidor fins que existeixi un informe local associat al commit candidat amb les portes aplicables verdes:

| Porta | Condició de pas | Efecte de fallada |
|---|---|---|
| G10-01 Build | tots els artefactes es construeixen de manera reproduïble | BLOQUEJA |
| G10-02 Migració local | DB local buida → esquema canònic local + fixtures + integració | BLOQUEJA |
| G10-03 Proves crítiques | unitat, integració, regressió i E2E mínim passen | BLOQUEJA |
| G10-04 Separació d'entorns | cap host, DB, volum, secret o egress productiu | BLOQUEJA |
| G10-05 Secrets | escaneig i revisió sense filtracions | BLOQUEJA |
| G10-06 Grafana no públic | si la versió inclou Grafana, totes les proves negatives passen; si no l'inclou, se'n demostra l'absència o desactivació i la inexistència d'exposició pública | BLOQUEJA |
| G10-07 Reversió | procediment provat en entorn descartable | BLOQUEJA |
| G10-08 Evidència | commit, versions, ordres i resultats registrats | BLOQUEJA |
| G10-09 Compatibilitat productiva | inventari i baseline segurs, còpia recuperable i migració compatible provada | BLOQUEJA |

Qualsevol error de build, migració, prova crítica, separació d'entorns, protecció de secrets o control Grafana aplicable bloqueja obligatòriament el desplegament. Una porta de fase B no bloqueja l'acceptació de la fase A, però sí qualsevol promoció que incorpori Grafana.

Superar la porta local no autoritza actuar al servidor; només permet demanar l'autorització corresponent.

## 20. Condicions de promoció i reversió

### 20.1 Promoció

Una versió només és candidata a promoció quan:

- `SPEC-10` està aprovada;
- el PLAN corresponent està aprovat i implementat;
- totes les portes G10 estan verdes sobre el mateix commit;
- la baseline productiva s'ha inventariat de manera segura i els canvis de DB tenen compatibilitat, còpia de seguretat i reversió/avanç correctiu documentats;
- l'artefacte desplegable és el mateix que s'ha provat;
- no depèn de volums, DB, secrets, fitxers o altres recursos locals no reproduïbles al destí;
- configuració i secrets productius no s'han copiat a local ni empaquetat;
- hi ha autorització explícita per al desplegament concret;
- l'activació de funcionalitats externes està separada del desplegament de codi.

Per Grafana, la promoció de codi NO autoritza el PoC al servidor, la ingesta productiva, la persistència productiva ni la republicació. Cada pas exigeix les condicions i autoritzacions pròpies de `SPIKE-04`/`SPEC-05`.

### 20.2 Reversió

Abans de promocionar HA D'existir un procediment provat en un entorn descartable que:

- identifica de forma immutable la versió anterior;
- conserva compatibilitat amb l'estat de DB o defineix un avanç correctiu segur;
- evita destrucció de dades no recuperable;
- no depèn de `git reset --hard`, `git clean` ni prune global;
- limita ordres als serveis i recursos del release;
- inclou comprovació de salut i funcionalitat després de revertir;
- manté Grafana `INTERNAL_ONLY` i desactivat si ho estava;
- registra inici, resultat i responsable de la reversió.

L'eina, estratègia d'imatges, política de backups i compatibilitat de migracions són `PENDENT DE CONFIRMAR`.

## 21. Riscos

| ID | Risc | Impacte | Tractament exigit |
|---|---|---|---|
| R10-01 | esquema canònic indeterminat | crític | resoldre abans de crear migracions |
| R10-02 | volum/DB local apunta a producció | crític | validació d'entorn i noms locals exclusius |
| R10-03 | Caddy local usa dominis productius | crític | origen local explícit i prova sense egress |
| R10-04 | exposició Grafana interna | crític | fail-closed, filtres backend i proves negatives |
| R10-05 | control d'accés intern al PoC inexistent | crític | bloquejar la fase B fins a `SUPERADMIN` o equivalent aprovat i provat; mantenir `DCF-01` per al producte final |
| R10-06 | deploy destructiu actual | crític | no usar `scripts/deploy.sh`; flux nou sota PLAN aprovat |
| R10-07 | migració legacy sobreescriu entrada | crític | no executar; corregir i provar amb temporals |
| R10-08 | inicialització DB incompleta | alt | migració neta com a gate |
| R10-09 | variables d'exemple incompletes | alt | contracte de configuració validable |
| R10-10 | dependències flotants | alt | mecanisme reproduïble de resolució i versions aprovades |
| R10-11 | manca total de tests | alt | suite per capes abans de promoció |
| R10-12 | tasques accessibles pel proxy | alt | política de xarxa, auth servidor i no query key |
| R10-13 | health retorna fals positiu | alt | estat detectable de DB |
| R10-14 | zeros Ecowitt es tornen nuls | alt | caracterització a la fase A; correcció fora d'aquesta SPEC segons `DEFECT-01` |
| R10-15 | scheduler no versionat | mitjà | disparador local reproduïble i contracte operatiu |
| R10-16 | fixtures basats en dades reals | alt | generació sintètica i test de procedència |
| R10-17 | frontend contacta analítica/producció | mitjà/alt | desactivació local i prova de xarxa |
| R10-18 | API Python aparent però absent | alt | no anunciar salut/capacitat fins a implementació real |
| R10-19 | esquema productiu desconegut | crític | no assimilar-lo a l'esquema local; inventari segur, baseline, backup i compatibilitat abans de fase C |

## 22. Decisions pendents

Les categories indiquen l'únic abast que poden bloquejar:

- **A:** bloqueja el nucli local bàsic;
- **B:** bloqueja només el PoC Grafana intern;
- **C:** bloqueja només la promoció segura al servidor;
- **EXTERNA:** bloqueja una SPEC funcional diferent, però no la fase A ni la redacció del seu `PLAN-10`.

### 22.1 Decisions funcionals conservades de `SPEC-00`

| ID | Descripció pendent | Categoria | Raó | Rol responsable | Moment de resolució |
|---|---|---|---|---|---|
| DCF-01 | identitat d'accés definitiva del producte | EXTERNA | el repositori no implementa registre, sessió ni rols | responsable de producte i seguretat | abans de la SPEC/implementació funcional d'identitat |
| DCF-02 | classificació dels camps comuns i específics | EXTERNA | l'inventari actual no aprova el model multiproveïdor | responsable funcional de MeteoLord | abans d'aprovar el contracte de visualització multiestació |
| DCF-03 | regla de persistència o resum horari | EXTERNA | l'exigència horària no defineix quina observació o agregació conservar | responsable funcional i de dades | abans de dissenyar persistència multiestació |
| DCF-04 | retenció i agregació posterior | EXTERNA | no hi ha política funcional aprovada | responsable funcional i de dades | abans d'aprovar el model històric complet |
| DCF-05 | contracte Ecowitt real, inclosos camps, zeros, timestamps, límits i multiestació | EXTERNA | l'evidència de repositori descriu el flux existent però no n'aprova el contracte futur | responsable d'integracions i producte | abans d'implementar l'alta Ecowitt multiestació |
| DCF-06 | límits, unitats i autenticació del PoC; persistència, ús productiu i republicació Grafana | B per al PoC; EXTERNA per a ús productiu/publicació | `SPIKE-04` declara viabilitat condicionada, no un contracte o permís de publicació | responsable d'integracions, seguretat i titular de l'autorització | límits/unitats/control abans de la fase B; abast productiu i republicació a la SPEC funcional corresponent |
| DCF-07 | motor cartogràfic | EXTERNA | no s'ha validat cap opció contra tots els criteris funcionals i d'accessibilitat | responsable tècnic i de producte | abans de la SPEC/PLAN cartogràfica |
| DCF-08 | àmbit geogràfic configurable | EXTERNA | no hi ha bounding box o política territorial aprovats | responsable de producte | abans d'aprovar el mapa públic complet |
| DCF-09 | contracte tècnic exacte de l'entorn local | A | aquesta SPEC fixa resultats, però no artefactes, ports ni ordres | responsable tècnic de MeteoLord | al PLAN de la fase A, abans d'implementar-la |

Totes aquestes decisions continuen `PENDENT DE CONFIRMAR`. L'evidència del repositori redueix incertesa, però no resol per si sola cap decisió funcional.

### 22.2 Decisions tècniques per al futur PLAN

| ID | Descripció pendent | Categoria | Raó | Rol responsable | Moment de resolució |
|---|---|---|---|---|---|
| DLT-01 | esquema canònic local i noms de les relacions requerides pel runtime actual | A | les fonts SQL observades són incompatibles | responsable tècnic i de dades | al PLAN de fase A, abans de crear la primera migració local |
| DLT-02 | mecanisme de migracions locals aplicables des de zero | A | no hi ha cadena versionada aplicable a una DB local buida | responsable tècnic i de dades | al PLAN de fase A, abans d'implementar migracions locals |
| DLT-03 | artefactes i topologia mínima dels serveis MeteoLord | A | el Compose actual arrossega serveis veïns | responsable tècnic | al PLAN de fase A, abans de preparar l'arrencada local |
| DLT-04 | origen, host i ports locals sense col·lisions | A | el repositori només aporta dominis i ports orientats a servidor | responsable tècnic | al PLAN de fase A, després de validar compatibilitat local |
| DLT-05 | mecanisme de bloqueig/control d'egress i analítica | A | la suite base no pot contactar producció ni tercers | responsable tècnic i de seguretat | abans d'executar la primera suite de fase A |
| DLT-06 | runner, ordres, cobertura i format d'evidència de proves | A | no existeix infraestructura de proves MeteoLord | responsable de QA i tècnic | al PLAN de fase A, abans d'implementar la porta local |
| DLT-07 | mecanisme de resolució i fixació de dependències | A | les versions actuals no són prou reproduïbles | responsable tècnic | al PLAN de fase A, abans de validar un checkout net |
| DLT-08 | format i càrrega dels fixtures sintètics | A | no hi ha fixtures segurs i els fitxers de dades reals no són reutilitzables | responsable de QA i dades | abans d'implementar les proves d'integració |
| DLT-09 | disparador local reproduïble de tasques periòdiques | A | el cron de l'host no és versionat ni apte per a la suite base | responsable tècnic | al PLAN de fase A, abans de provar ingestes simulades |
| DLT-10 | contracte de salut del backend i tractament de les rutes `api_py` | A | la salut actual pot donar fals positiu i Caddy apunta a un placeholder | responsable tècnic | abans de definir la porta de salut de fase A |
| DLT-11 | format, destí i retenció de logs locals | A | cal evidència diagnosticable sense filtrar secrets | responsable tècnic i de seguretat | al PLAN de fase A, abans d'instrumentar proves |
| DLG-01 | control intern de `SUPERADMIN` o equivalent per al PoC | B | no existeix autenticació/autorització d'usuari al repositori | responsable de seguretat i producte | abans d'executar la fase B |
| DLG-02 | allowlist de sensors i responsable del seu manteniment | B | el client no pot seleccionar sensors arbitraris | responsable d'integracions | abans de qualsevol consulta del PoC |
| DLG-03 | límits, errors esperats i casos negatius del contracte Grafana | B | són condicions explícites de `SPIKE-04` | responsable d'integracions i QA | al PLAN de fase B, abans d'executar el PoC |
| DLT-12 | empaquetat reproduïble, promoció del mateix artefacte i estratègia de reversió | C | el flux actual no constitueix una porta segura ni reproduïble | responsable d'operació i tècnic | abans de qualsevol prova o promoció al servidor |
| DLT-13 | inventari segur, baseline i compatibilitat de l'esquema productiu | C | el servidor no s'ha inspeccionat i l'esquema local no prova compatibilitat productiva | responsable d'operació, tècnic i de dades | abans de preparar qualsevol migració o promoció al servidor |

Cap decisió d'aquestes taules es dona per aprovada pel fet d'aprovar els resultats normatius de la SPEC. El futur PLAN haurà de proposar opcions, justificar la selecció i traçar-la.

### 22.3 Recomanacions no vinculants per al PLAN

| ID | Recomanació | Límit |
|---|---|---|
| REC10-01 | avaluar un perfil, override o mecanisme equivalent per limitar els serveis locals | no selecciona Compose ni el nom de cap artefacte |
| REC10-02 | preferir dependències i artefactes resolts de manera immutable o equivalentment reproduïble | no imposa una eina o format de lock concret |
| REC10-03 | automatitzar la verificació d'egress, secrets i separació de recursos | no fixa runner, política de xarxa ni llindars |
| REC10-04 | conservar separades les evidències de fase A, fase B i promoció C | no defineix pipeline ni sistema de CI |

## 23. Criteris d'acceptació

### CA10-01 - Checkout net reproduïble

**Traça:** RF10-01, RF10-05, RNF10-02
**Aplicabilitat:** fase A.
**Donat** un checkout net del commit candidat i només la configuració local d'exemple, **quan** s'executa la preparació documentada, **aleshores** totes les dependències i validacions es resolen sense copiar res del servidor.

### CA10-02 - Topologia mínima

**Traça:** RF10-02, RF10-04
**Aplicabilitat:** fase A.
**Donat** el perfil MeteoLord, **quan** s'arrenca, **aleshores** no arrenca ni exigeix cap servei veí del monorepo.

### CA10-03 - Origen local

**Traça:** RF10-03, RNF10-01
**Aplicabilitat:** fase A.
**Donat** l'entorn local, **quan** s'obre `/meteo/`, **aleshores** el frontend i l'API funcionen en l'origen local sense usar dominis ni certificats productius.

### CA10-04 - Configuració incompleta

**Traça:** RF10-05, RNF10-04
**Aplicabilitat:** fase A.
**Donada** una variable obligatòria absent, **quan** es valida l'entorn, **aleshores** falla abans d'arrencar la ingesta, informa només del nom i no imprimeix cap valor.

### CA10-05 - DB buida

**Traça:** RF10-06, secció 10
**Aplicabilitat:** fase A.
**Donada** una DB local buida, **quan** s'aplica la seqüència canònica, **aleshores** es creen totes i només les relacions de runtime esperades i el backend pot iniciar-se.

### CA10-06 - Migració idempotent

**Traça:** RNF10-06, secció 10
**Aplicabilitat:** fase A.
**Donat** un esquema ja migrat, **quan** es torna a executar el mecanisme admès, **aleshores** no duplica objectes ni dades i informa que no hi ha migracions pendents.

### CA10-07 - Volum local

**Traça:** RNF10-01, RF10-DB-01
**Aplicabilitat:** fase A.
**Donat** l'inventari de recursos, **quan** es resol el volum PostgreSQL, **aleshores** el seu identificador és local i no coincideix amb cap recurs productiu conegut.

### CA10-08 - Fixtures sintètics

**Traça:** RF10-07, secció 11
**Aplicabilitat:** fase A.
**Donada** una DB migrada, **quan** es carreguen fixtures, **aleshores** totes les dades són sintètiques, la càrrega és repetible i cap bolcat/CSV real és llegit.

### CA10-09 - Sense egress per defecte

**Traça:** RF10-08, RNF10-01
**Aplicabilitat:** fase A.
**Donada** la suite base, **quan** s'executa completa, **aleshores** no hi ha peticions a Ecowitt, ACA, Open-Meteo, Grafana, analítica ni dominis productius.

### CA10-10 - Ingesta simulada

**Traça:** RF10-09, RF10-10
**Aplicabilitat:** fase A.
**Donats** dobles locals, **quan** es proven èxit, buit, zero, timeout, error, timestamp invàlid i fallback, **aleshores** el backend persisteix o rebutja cada cas segons el contracte aplicable, registra el comportament actual del zero i no contacta fonts reals.

### CA10-11 - Caracterització del zero Ecowitt

**Traça:** RF10-09, prova funcional 7
**Aplicabilitat:** fase A.
**Donada** una lectura Ecowitt sintètica amb un zero al camp afectat, **quan** s'executa la caracterització, **aleshores** es reprodueix el comportament actual, se'n registra el resultat i la prova demostra que detecta la conversió defectuosa descrita a `DEFECT-01`. Superar la fase A no exigeix corregir-la.

### CA10-12 - Salut DB

**Traça:** RF10-11, RNF10-07
**Aplicabilitat:** fase A.
**Donada** una DB disponible, **quan** es consulta salut, **aleshores** l'estat és saludable; **i donada** una DB no disponible, **quan** es repeteix, **aleshores** l'estat/codi és no saludable i detectable per la porta.

### CA10-13 - Regressió de la vista

**Traça:** RF10-12, secció 15
**Aplicabilitat:** fase A.
**Donats** fixtures amb camps presents, absents i antics, **quan** es carrega Meteo i Històrics, **aleshores** es conserven cards, camps, períodes, antiguitat, gràfiques i `—` per absència.

### CA10-14 - Secret no registrat

**Traça:** RF10-13, RNF10-04
**Aplicabilitat:** fase A.
**Donada** una tasca autenticada i una fallada externa simulada, **quan** s'inspeccionen resposta, logs i artefactes, **aleshores** no contenen claus, cookies, URLs sensibles ni payloads externs.

### CA10-15 - Neteja acotada

**Traça:** RF10-14
**Aplicabilitat:** fase A.
**Donat** un conjunt de recursos locals creats per la prova, **quan** s'executa la neteja, **aleshores** només desapareixen aquests recursos i no s'usa cap ordre destructiva global o Git destructiu.

### CA10-16 - Grafana desactivat

**Traça:** RNF10-11, secció 16
**Aplicabilitat:** fase A.
**Donada** la fase A o una configuració Grafana absent, incompleta o errònia, **quan** s'arrenca l'aplicació, **aleshores** la integració roman absent o desactivada i qualsevol font coneguda és tractada com `INTERNAL_ONLY`.

### CA10-17 - Sense PromQL del navegador

**Traça:** secció 17
**Aplicabilitat:** fase B i qualsevol fase C amb Grafana.
**Donat** un client manipulat que envia PromQL, URL, datasource o sensor no autoritzat, **quan** arriba al backend, **aleshores** el backend ho rebutja i no ho reenvia.

### CA10-18 - PoC només backend

**Traça:** secció 17
**Aplicabilitat:** fase B.
**Donades** totes les portes de fase A verdes i autorització per al PoC, **quan** el `SUPERADMIN` o control equivalent aprovat l'inicia, **aleshores** la petició externa es construeix exclusivament al backend amb allowlist i límits aprovats.

### CA10-19 - Accés exclusiu `SUPERADMIN`

**Traça:** secció 18
**Aplicabilitat:** fase B.
**Donat** un resultat intern sintètic de prova, **quan** hi accedeixen un anònim, un usuari no autoritzat i un `SUPERADMIN` o control equivalent aprovat, **aleshores** els dos primers no poden confirmar-ne ni l'existència i només el tercer el pot consultar localment.

### CA10-20 - Absència pública total de Grafana

**Traça:** secció 16, G10-06
**Aplicabilitat:** fase B i qualsevol fase C amb Grafana.
**Donada** una estació/observació sintètica marcada `INTERNAL_ONLY`, **quan** es consulten mapa, llista, modal, fitxa, cerca, metadades, agregacions, caches, errors i APIs públiques, **aleshores** no es revela ni es pot inferir existència, ubicació o valors.

### CA10-21 - Build i suite

**Traça:** secció 14, G10-01, G10-03
**Aplicabilitat:** fase A.
**Donat** el commit candidat, **quan** s'executen totes les ordres versionades de build i prova, **aleshores** finalitzen correctament i l'informe enumera exactament què s'ha executat.

### CA10-22 - Error bloquejant

**Traça:** secció 19
**Aplicabilitat:** fase C, aplicant només les portes de les funcionalitats incloses a l'artefacte.
**Donat** un error de build, migració, prova crítica, separació d'entorns, protecció de secrets o control Grafana aplicable a la versió, **quan** s'avalua la promoció, **aleshores** queda bloquejada sense excepció implícita. Una prova exclusiva de fase B no s'aplica a una fase A sense Grafana.

### CA10-23 - Reversió provada

**Traça:** G10-07, secció 20.2
**Aplicabilitat:** fase C.
**Donada** una versió candidata en entorn descartable, **quan** s'aplica el procediment de reversió, **aleshores** torna a la versió anterior saludable sense pèrdua inesperada ni ordres destructives globals.

### CA10-24 - Porta abans del servidor

**Traça:** seccions 19 i 20
**Aplicabilitat:** fase C.
**Donat** que falta una porta verda o una autorització separada, **quan** algú intenta preparar una prova o desplegament al servidor, **aleshores** el procés s'atura abans de qualsevol canvi extern.

### CA10-25 - Promoció no activa Grafana

**Traça:** secció 20.1, COND-04
**Aplicabilitat:** fase C.
**Donat** un codi promocionat en una fase futura, **quan** no hi ha autorització específica d'ingesta o republicació Grafana, **aleshores** Grafana continua desactivat/`INTERNAL_ONLY` i no apareix en cap superfície pública.

## 24. Condicions d'aprovació per fase

Aquesta SPEC pot ser aprovada expressament com a contracte de la fase A quan:

- s'accepti l'arquitectura i els bloquejos confirmats a `INSPECCIO-00`;
- s'accepti que `api_py` no és part funcional del mínim actual;
- s'accepti que el futur PLAN definirà l'esquema canònic local abans d'implementar l'entorn, sense assimilar-lo a producció;
- s'accepti l'aplicabilitat de les proves i portes de fase A;
- s'accepti l'aïllament sense egress i amb fixtures sintètics com a valor per defecte;
- s'accepti que la fase A no depèn del mapa, del login definitiu ni del PoC Grafana;
- s'accepti que `DEFECT-01` es caracteritza però no es corregeix en aquesta SPEC;
- es mantinguin pendents per al futur PLAN les decisions A de la secció 22.

L'aprovació per a la fase A NO aprova ni autoritza la fase B, el PoC Grafana, la fase C, cap accés al servidor ni cap funcionalitat de mapa, identitat, usuari, multiestació o publicació. La fase B continua bloquejada fins que A sigui vàlida i hi hagi aïllament provat, allowlist, límits i `SUPERADMIN` o control equivalent aprovat. La fase C requereix l'autorització, baseline i portes pròpies.

Després de l'aprovació expressa per a la fase A es podrà redactar un `PLAN-10` limitat a aquesta fase i basat en els fitxers reals. Fins aleshores no s'ha d'implementar l'entorn ni cap funcionalitat de `SPEC-00`.

## 25. Historial de versions

| Versió | Data | Canvis |
|---|---|---|
| 0.1 | 2026-09-03 | Primera candidata derivada de la inspecció i de les condicions de `SPIKE-04`. |
| 0.2 | 2026-09-03 | Refinament QA: separació de fases A/B/C, aplicabilitat de portes, decisions classificades, requisits expressats com a resultats, exemples no prescriptius i caracterització separada de `DEFECT-01`. Sense selecció d'eines ni implementació. |
| 0.3 | 2026-09-03 | Reparació UTF-8 i refinament final: fase C limitada a promoció segura; proves i CA separats per fase; caracterització del zero; ordre SDD coherent; separació entre esquema local, baseline i compatibilitat productiva; decisions `DLT-01`, `DLT-02`, `DLT-12` i nova `DLT-13` ajustades. QA final favorable i aprovació expressa d'Oriol limitada a la fase A — nucli local; les fases B i C continuen bloquejades. Les decisions tècniques `DCF-09` i `DLT-01`–`DLT-11` s'han de resoldre i justificar al futur `PLAN-10`. L'aprovació no acredita cap criteri d'acceptació com a implementat. |

## 26. Referències documentals

- [SPEC-00 - Mapa comunitari d'estacions meteorològiques](./SPEC-00-mapa-estacions-meteolord.md)
- [SPIKE-04 - Descoberta Grafana/i2CAT](./SPIKE-04-descoberta-grafana-i2cat.md)
- [INSPECCIO-00 - Entorn i arquitectura real](./INSPECCIO-00-entorn-meteolord.md)
- [PROJECT-CONTEXT-METEOLORD](./PROJECT-CONTEXT-METEOLORD.md)
- [DEFECT-01 - Zeros Ecowitt convertits a null](./DEFECT-01-zeros-ecowitt-convertits-null.md)
- [QA-00 - QA de SPEC-10](./QA-00-SPEC-10.md)
