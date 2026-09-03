# SPEC-00 - Mapa comunitari d'estacions meteorològiques MeteoLord

**Versió:** 0.5  
**Estat:** CANDIDATA A REFINAMENT  
**Projecte:** MeteoLord / Tecnolord  
**Tipus:** SPEC paraigua  
**Data:** 2026-09-03

---

## 1. Objectiu

Ampliar MeteoLord amb un apartat públic que mostri sobre un mapa les estacions meteorològiques de la zona i la seva temperatura més recent.

Els propietaris d'estacions Ecowitt podran sol·licitar un compte. L'administrador principal aprovarà o rebutjarà l'usuari. Un usuari aprovat podrà configurar i publicar la seva estació sense una segona aprovació, sempre que la font sigui vàlida, hi hagi una observació correcta, s'hagi triat una ubicació pública i s'accepti expressament que aquesta ubicació es publicarà.

L'administrador podrà incorporar estacions externes, inicialment les de la xarxa mostrada al dashboard Grafana de la Vall de Lord. Mentre no hi hagi autorització expressa de publicació, les estacions i observacions procedents de Grafana seran exclusivament internes i no apareixeran al mapa, modals, fitxes ni API públiques. Cada estació que tingui publicació permesa tindrà una vista de detall coherent amb la pantalla actual de MeteoLord. Les dades històriques de les noves estacions es persistiran cada hora quan l'abast d'autorització de la font ho permeti.

## 2. Context i decisions confirmades

### 2.1 Plataforma existent

- Caddy és el reverse proxy declarat i serveix el frontend estàtic `site/` sota `/meteo*`.
- Les rutes generals `/api/*` es deriven al backend Node accessible internament a `backend:3000`.
- Caddy conserva rutes més específiques, inclosa `/health`, cap a `api_py:8000`, però `api_py` està comentat a Compose i el seu Dockerfile és un placeholder: no és una API funcional al checkout inspeccionat.
- La base declarada usa la imatge `postgis/postgis:16-3.4`, és a dir, PostgreSQL/PostGIS 16.
- Els scripts d'ingesta Ecowitt/ACA i previsió existeixen; el README documenta un cron de l'host, però el crontab efectiu no és versionat ni s'ha verificat.
- Els esquemes principals declaren instants amb `TIMESTAMPTZ`, però no hi ha una cadena canònica de migracions aplicable des de zero.
- No hi ha entorn MeteoLord local complet, autenticació d'usuari, suite automatitzada ni porta de promoció implementats al checkout inspeccionat.
- La pantalla i les rutes funcionals actuals s'han de conservar.

### 2.2 Decisions funcionals

- El mapa és públic.
- El compte només és necessari per gestionar una estació pròpia.
- L'alta d'usuari requereix aprovació manual del `SUPERADMIN`.
- Cada usuari normal pot gestionar una estació Ecowitt en la primera versió.
- Un usuari aprovat no necessita una segona aprovació per publicar l'estació.
- Cada usuari amb estació té aquella estació com a predeterminada.
- La ubicació pública es tria clicant el mapa; no es dedueix automàticament.
- La posició publicada és el punt que l'usuari decideix comunicar, que pot no coincidir exactament amb la posició física.
- La persistència històrica de les noves estacions és horària.
- Les estacions Grafana s'integren des de la font de dades, no des del DOM.
- L'autorització comunicada per Albert permet fer-ne ús intern i proves locals; no permet encara publicar les dades de Grafana.
- La prova de Grafana es farà primer en local, en un entorn aïllat i reproduïble.
- Cap canvi es desplegarà al servidor fins que hagi superat les proves locals definides.
- Instamaps o una tecnologia similar es pot avaluar, però la SPEC no fixa encara la implementació cartogràfica.

### 2.3 Resultat de la descoberta Grafana

`SPIKE-04` conclou `VIABLE AMB CONDICIONS`.

Fets observats el 2026-09-02:

- Grafana 12.3.2.
- Dashboard UID `i2cat-public-jul27`.
- Organització pública `orgId=11`.
- Accés anònim `Viewer`.
- Datasource Prometheus UID `SWLXFBHvz`, id `11`.
- Endpoint `POST /api/ds/query`.
- Consultes identificades per temperatura, humitat, vent, direcció i pluja acumulada.
- Resposta correcta observada als sensors `Meteo-001-3100044` i `Meteo-007-3100206`.

Estat d'autorització comunicat per l'usuari:

- Albert ha autoritzat l'ús de les dades per a la integració i les proves internes;
- aquesta confirmació no s'ha aportat com a document adjunt a la SPEC;
- les dades de Grafana no es poden fer públiques encara.

Condicions pendents:

- prova inicial des de l'entorn local MeteoLord;
- prova posterior des del servidor abans d'activar ingesta de producció;
- abast documentat de consulta automatitzada i persistència fora de l'entorn de prova;
- autorització explícita i separada de republicació abans de qualsevol exposició pública;
- límits o freqüència acordats;
- unitats completes;
- tests de contracte i detecció de canvis.

### 2.4 Decisió cartogràfica pendent de PLAN

Instamaps permet crear, publicar i incrustar mapes i disposa d'opcions de consum de dades externes. Abans de triar-lo s'ha de demostrar que cobreix:

- clic per obtenir coordenades dins del formulari autenticat;
- marcador dinàmic amb temperatura;
- modal controlat per MeteoLord;
- actualització sense republicar manualment el mapa;
- navegació accessible alternativa;
- integració amb el disseny i rutes existents.

Si això no queda confirmat, s'utilitzarà una llibreria integrada com Leaflet o MapLibre amb una cartografia base compatible. La decisió no pot obligar a duplicar les dades ni a administrar manualment els marcadors en una plataforma externa.

## 3. Abast

### 3.1 Inclòs

- Registre, autenticació i aprovació d'usuaris.
- Rebuig, suspensió i reactivació pel `SUPERADMIN`.
- Una estació Ecowitt per usuari normal.
- Publicació directa per l'usuari ja aprovat després de les validacions tècniques.
- Selecció i edició de la ubicació pública clicant el mapa.
- Catàleg administratiu d'estacions pròpies i externes.
- Mapa públic amb temperatura actual i estat d'antiguitat.
- Modal amb valors actuals disponibles.
- Llista accessible alternativa al mapa.
- Vista completa multiestació amb URL estable.
- Adaptador Grafana en local i amb visibilitat `INTERNAL_ONLY`, condicionat al tancament productiu de `SPIKE-04`.
- Normalització multi-proveïdor.
- Persistència horària, idempotència i aïllament d'errors.
- Traçabilitat administrativa.
- Entorn local reproduïble, aïllat de producció i documentat abans del desplegament.

### 3.2 Fora d'abast inicial

- Aplicació mòbil nativa.
- Edició d'una estació per diversos usuaris.
- Més d'una estació per usuari normal.
- Prediccions i alertes personalitzades.
- Exportació massiva.
- Facturació.
- Inferir coordenades o identificadors absents.
- Scraping HTML o DOM de Grafana.
- Exposició pública de qualsevol estació, observació o valor procedent de Grafana mentre no hi hagi autorització expressa de republicació.
- Permetre PromQL aportat pel navegador.
- Automatitzar l'alta a partir dels colors del PDF.

## 4. Actors i permisos

### ACT-01 - Visitant

Pot veure el mapa, la llista, els modals i les fitxes públiques, i sol·licitar un compte. No pot modificar dades.

### ACT-02 - Usuari pendent

Ha completat el registre però no pot gestionar ni publicar una estació. Veu l'estat `PENDING`.

### ACT-03 - Usuari aprovat

Pot:

- iniciar i tancar sessió;
- configurar una estació Ecowitt pròpia;
- validar-ne la connexió;
- triar la ubicació pública al mapa;
- publicar-la quan compleix les validacions;
- editar-la o despublicar-la;
- accedir per defecte a la seva fitxa.

No pot modificar usuaris, estacions externes ni estacions alienes.

### ACT-04 - SUPERADMIN

Pot:

- gestionar l'estat dels usuaris;
- crear, editar, publicar, despublicar i desactivar qualsevol estació;
- assignar propietari;
- incorporar estacions externes;
- corregir ubicacions i metadades;
- consultar errors d'ingesta sense veure secrets en clar;
- revocar la publicació d'una estació d'usuari.

## 5. Entitats funcionals

### 5.1 Usuari

- Identificador intern.
- Identitat d'accés definida a `SPEC-01`.
- Nom visible.
- Estat `PENDING`, `APPROVED`, `REJECTED` o `SUSPENDED`.
- Rol `USER` o `SUPERADMIN`.
- Dates de registre i canvi d'estat.
- Estació predeterminada.

### 5.2 Estació

- Identificador intern estable.
- Nom públic i slug únic.
- Tipus de font.
- Propietari opcional.
- Latitud i longitud públiques triades.
- Estat operatiu i visibilitat.
- Abast de publicació `INTERNAL_ONLY` o `PUBLIC_ALLOWED`, aplicat pel servidor i independent del rol de l'usuari.
- Identificador extern opcional.
- Darrera observació correcta.
- Estat de qualitat i antiguitat.
- URL de referència externa opcional.

Tipus inicials:

- `ECOWITT`;
- `GRAFANA_I2CAT`.

### 5.3 Configuració de font

Conté la configuració necessària per consultar el proveïdor. Secrets, tokens i claus no poden aparèixer a l'API pública, al navegador ni als logs.

### 5.4 Observació

- Estació.
- Instant observat pel sensor.
- Instant recuperat per MeteoLord.
- Valors normalitzats disponibles.
- Valor i unitat d'origen necessaris per auditar.
- Font.
- Estat de validesa o qualitat.

## 6. Requisits funcionals

### RF-01 - Registre i aprovació

Una sol·licitud crea un usuari `PENDING`. Només el `SUPERADMIN` pot aprovar-lo, rebutjar-lo, suspendre'l o reactivar-lo. La decisió queda traçada.

### RF-02 - Autenticació i revocació

Només `APPROVED` pot gestionar una estació. Una suspensió o rebuig invalida la capacitat de mutació d'una sessió anterior.

### RF-03 - Alta Ecowitt

Un usuari aprovat pot configurar una estació amb el contracte de dades de MeteoLord. Abans de publicar cal:

- configuració de font vàlida;
- almenys una observació vàlida;
- ubicació pública seleccionada;
- acceptació de la publicació de la ubicació.

No hi ha una segona aprovació administrativa. El `SUPERADMIN` conserva la facultat de despublicar o suspendre.

### RF-04 - Selecció de coordenades

El formulari mostra un mapa editable. En clicar:

- apareix o es mou un marcador;
- es mostren latitud i longitud;
- es demana confirmació abans de desar;
- s'informa que el punt serà públic.

La ubicació es pot canviar posteriorment. S'han de rebutjar coordenades fora dels rangs geogràfics i, si es configura un àmbit Vall de Lord, fora del bounding box administratiu. No hi ha geolocalització automàtica obligatòria.

### RF-05 - Estació predeterminada

L'usuari entra per defecte a la seva estació, amb el mateix format funcional que la vista MeteoLord actual.

### RF-06 - Mapa públic

Mostra estacions actives, geolocalitzades, amb estat representable i abast `PUBLIC_ALLOWED`. El marcador mostra principalment la temperatura. L'antiguitat o absència de dades ha de ser inequívoca. Una estació o observació `INTERNAL_ONLY` no pot aparèixer ni permetre inferir valors al mapa públic.

### RF-07 - Modal

En clicar el marcador o temperatura s'obre un modal amb:

- nom;
- temperatura i instant;
- valors actuals disponibles;
- qualitat/antiguitat;
- enllaç a la fitxa completa.

Un valor absent es mostra com a no disponible, mai com a zero.

### RF-08 - Vista completa

Cada estació pública té URL estable. La fitxa reutilitza el format de la pantalla actual i només mostra camps disponibles per aquell proveïdor. L'enllaç del modal pot obrir la fitxa en una nova pestanya.

### RF-09 - Estacions externes

El `SUPERADMIN` pot definir nom, codi, sensor, coordenades, URL de referència, font, estat i abast de publicació. No es pot activar una fila sense identificador complet, ubicació i font funcional. Les fonts Grafana neixen amb `INTERNAL_ONLY` i només poden passar a `PUBLIC_ALLOWED` quan consti una autorització explícita de republicació.

### RF-10 - Consulta Grafana

L'adaptador utilitza `POST /api/ds/query` des del backend amb:

- URL base fixa i controlada;
- datasource configurat;
- plantilles PromQL internes;
- sensor en allowlist;
- rang temporal limitat;
- timeout i mida màxima;
- tractament de respostes buides i canvis de contracte.

No s'accepta PromQL ni URL externa des del client.

### RF-11 - Camps Grafana inicials

La vista interna d'una estació Grafana ha de poder obtenir, quan existeixin:

- temperatura;
- humitat;
- màxim cop d'aire convertit explícitament a km/h;
- direcció del vent;
- pluja acumulada 24 h.

La vista completa pot incorporar bateria, intensitat de llum, pluviòmetre, pressió, UV i velocitat del vent quan unitats i significat estiguin confirmats.

### RF-12 - Normalització

Conserva instant, procedència, unitat d'origen i regla de conversió. Les conversions són explícites i provables.

### RF-13 - Consulta i persistència

La freqüència de consulta de dades actuals i la persistència històrica són separades. L'històric desa com a màxim una observació representativa per hora. La regla exacta es defineix a `SPEC-08`. La ingesta Ecowitt actual cada 15 minuts no canvia.

### RF-14 - Idempotència

La reexecució no crea duplicats de la mateixa observació normalitzada.

### RF-15 - Qualitat

Es distingeix `RECENT`, `DEGRADED`, `STALE`, `NO_DATA` i `SOURCE_ERROR`. Els llindars es defineixen a `SPEC-08`.

### RF-16 - Traçabilitat

Es tracen aprovacions, rols, propietaris, publicacions, despublicacions i canvis de font o ubicació.

### RF-17 - Desactivació

Desactivar impedeix mapa i noves ingestes, però no elimina automàticament l'històric.

### RF-18 - Control de publicació per origen

L'autorització es controla per font i estació, no només pel rol de qui l'administra. El backend ha d'excloure dades `INTERNAL_ONLY` de:

- mapa i llista públics;
- modal i fitxa pública;
- endpoints sense autenticació;
- metadades, cerques, agregacions o errors que en puguin revelar valors.

Canviar a `PUBLIC_ALLOWED` requereix una acció explícita i traçada del `SUPERADMIN`, sustentada per l'autorització de republicació corresponent. En cap cas l'aprovació d'un usuari o la publicació de la seva Ecowitt modifica l'abast d'una font Grafana.

### RF-19 - Entorn local de desenvolupament i prova

Abans d'implementar les funcionalitats noves d'aquesta SPEC, la fase A de `SPEC-10` ha de permetre executar i provar de manera reproduïble el nucli actual de MeteoLord. El futur `PLAN-10` concretarà la implementació tècnica, però el nucli local ha de proporcionar:

- configuració d'exemple sense secrets;
- base de dades i volums locals separats de producció;
- esquema canònic local i migracions aplicables des d'un entorn net;
- fixtures exclusivament sintètics i sense dades Grafana reals;
- execució local del frontend actual, el backend actual i la DB local;
- disparadors reproduïbles de les tasques actuals contra dobles locals, sense cron de l'host ni fonts externes per defecte;
- logs, comprovacions de salut, build i proves del nucli actual;
- Grafana absent o desactivat.

L'entorn local no reutilitza credencials, base de dades ni volums del servidor de producció.

Les proves de registre, aprovació, mapa, multiestació i Grafana s'afegiran només quan s'implementin les seves SPEC específiques. La fase A no depèn de resoldre `DCF-01`, del login, del mapa, de `SUPERADMIN` ni de l'adaptador Grafana.

## 7. Requisits no funcionals

### RNF-01 - Identitat

- Contrasenyes amb hash adequat, mai en clar.
- Sessions revocables.
- CSRF en mutacions basades en cookies.
- Autorització al servidor.
- Origen públic correcte darrere de Caddy.

### RNF-02 - Secrets

- Secrets protegits en repòs.
- Mai retornats després de desar.
- Logs sense tokens, cookies o URLs sensibles.

### RNF-03 - Privacitat geogràfica

- El punt públic és escollit per l'usuari.
- La interfície explica que serà visible.
- No es publica una ubicació capturada automàticament sense confirmació.

### RNF-04 - Seguretat de la font externa

- Sense PromQL del client.
- Sense URLs arbitràries.
- Allowlist de sensors.
- Límit de rang, mida, timeout i reintents.
- Cap credencial Grafana exposada al frontend.

### RNF-05 - Integritat temporal

- UTC a persistència.
- Presentació local opcional.
- Diferència explícita entre `observed_at` i `retrieved_at`.

### RNF-06 - Resiliència

La fallada d'un sensor no bloqueja la resta. Si Grafana falla, l'última dada es pot mostrar com a antiga únicament a la superfície interna autoritzada mentre la font sigui `INTERNAL_ONLY`.

### RNF-07 - Rendiment

El mapa no consulta proveïdors per visitant. Llegeix dades agregades de MeteoLord. La ingesta externa s'executa programadament i evita una petició independent innecessària per cada camp.

### RNF-08 - Accessibilitat

- Llista alternativa al mapa.
- Marcadors accessibles per teclat quan sigui viable.
- Modal amb focus, `Escape`, títol i etiquetes.
- El selector de coordenades ofereix també camps numèrics validats com a alternativa.

### RNF-09 - Regressió

La vista i ingesta actuals continuen funcionant.

### RNF-10 - Dependència externa

La integració Grafana no es considera estable per ser pública. Cal prova de salut, alerta de canvi de contracte i configuració reemplaçable de datasource i mètriques.

### RNF-11 - Separació d'entorns

Local i producció tenen configuracions, secrets, bases de dades i volums diferents. Els valors per defecte són segurs: una font Grafana és `INTERNAL_ONLY` encara que falti una variable de configuració. Cap exportació, còpia o desplegament pot convertir dades internes en públiques de manera implícita.

### RNF-12 - Porta de desplegament

El desplegament al servidor només es pot preparar després de superar en local les migracions, el build, les proves automatitzades i els casos funcionals crítics. L'activació de Grafana en producció és una decisió separada de desplegar el codi i roman desactivada fins que es tanquin les condicions de `SPIKE-04`.

## 8. Criteris d'acceptació

### CA-01 - Alta pendent

**Donat** un registre nou, **quan** es completa, **aleshores** queda `PENDING` i no pot gestionar una estació.

### CA-02 - Aprovació i publicació

**Donat** un usuari aprovat, **quan** valida Ecowitt, tria ubicació i accepta la publicació, **aleshores** pot publicar sense segona aprovació.

### CA-03 - Autorització

**Donat** un usuari normal, **quan** intenta modificar una estació aliena o l'estat d'un usuari, **aleshores** el servidor ho rebutja.

### CA-04 - Clic al mapa

**Quan** l'usuari clica un punt, **aleshores** el marcador i les coordenades s'actualitzen; només es desen després de confirmar.

### CA-05 - Mapa públic

**Quan** un visitant entra sense sessió, **aleshores** veu les estacions publicades amb temperatura o estat explícit de falta de dades.

### CA-06 - Modal i fitxa

**Quan** clica un marcador, **aleshores** veu el modal accessible i pot obrir la fitxa completa estable.

### CA-07 - Estació externa incompleta

**Donada** una estació sense sensor complet, ubicació o font, **quan** s'intenta activar, **aleshores** es bloqueja i s'indiquen els camps que falten.

### CA-08 - Grafana sense DOM

**Donat** un sensor aprovat, **quan** s'executa l'adaptador, **aleshores** obté frames de `/api/ds/query` sense llegir el DOM.

### CA-09 - Bloqueig d'injecció

**Quan** el client envia PromQL, una URL o un sensor no autoritzat, **aleshores** el servidor no els reenvia a Grafana.

### CA-10 - Històric horari

**Donades** diverses lectures en una hora, **aleshores** es desa una observació segons la regla aprovada i la reexecució no duplica.

### CA-11 - Aïllament

**Donat** un sensor amb error, **aleshores** els altres continuen i el sensor queda `SOURCE_ERROR` o `STALE` sense valors inventats.

### CA-12 - Regressió

**Quan** es desplega, **aleshores** l'estació MeteoLord existent manté vista i ingesta.

### CA-13 - Grafana no públic

**Donada** una estació o observació Grafana `INTERNAL_ONLY`, **quan** un visitant consulta el mapa, la llista, una fitxa, una cerca o qualsevol API pública, **aleshores** no rep ni pot inferir la seva existència, ubicació o valors.

### CA-14 - Prova Grafana local

**Donat** l'entorn local configurat, **quan** el `SUPERADMIN` executa el PoC Grafana des del backend, **aleshores** la resposta es valida i es pot inspeccionar en local sense exposar-la en cap ruta pública.

### CA-15 - Entorn local reproduïble

**Donat** un checkout net i la documentació del projecte, **quan** es crea la configuració local d'exemple i s'executen les ordres documentades, **aleshores** serveis, migracions i proves s'inicien sense dependències de la base de dades o els volums de producció.

### CA-16 - Bloqueig de desplegament

**Donat** un error de build, migració, prova crítica o control de no-publicació, **quan** s'avalua el desplegament, **aleshores** no es promou la versió al servidor.

## 9. Descomposició SDD

1. `SPEC-01` - Identitat, registre i aprovació.
2. `SPEC-02` - Catàleg, propietat, ubicació i publicació d'estacions.
3. `SPEC-03` - Adaptador Ecowitt multiestació.
4. `SPIKE-04` - Descoberta Grafana/i2CAT. **Completat: VIABLE AMB CONDICIONS.**
5. `SPEC-05` - Adaptador Grafana/i2CAT, només quan es tanquin les condicions productives.
6. `SPEC-06` - Mapa públic, selector de coordenades, modal i llista accessible.
7. `SPEC-07` - Vista completa multiestació.
8. `SPEC-08` - Ingesta, qualitat i històric horari.
9. `SPEC-09` - Administració i importació assistida de l'inventari.
10. `SPEC-10` - Entorn local, proves, configuració i desplegament segur.

## 10. Ordre recomanat

1. Aprovar `SPEC-10` exclusivament com a contracte de la fase A, encara que `SPEC-00` continuï candidata i `DCF-01` romangui oberta.
2. Redactar i aprovar `PLAN-10` limitat a la fase A.
3. Implementar i validar l'entorn local bàsic contra els requisits de la fase A.
4. Refinar, aprovar i implementar les SPEC funcionals (`SPEC-01`, `SPEC-02`, `SPEC-03`, `SPEC-06`, `SPEC-07`, `SPEC-08` i `SPEC-09`) segons les seves dependències i decisions pendents.
5. Redactar i autoritzar separadament la fase B de `SPEC-10` i `SPEC-05` abans de qualsevol PoC Grafana intern.
6. Preparar una promoció segura de fase C només després de superar les portes aplicables i obtenir una autorització específica per actuar al servidor.
7. Habilitar qualsevol ús productiu o publicació Grafana únicament amb autorització expressa i després de superar els criteris productius corresponents.

Aquest ordre només habilita preparar el nucli local. No autoritza implementar el mapa, el login, la multiestació, Grafana ni la resta de funcionalitats de `SPEC-00` abans d'aprovar-ne les SPEC específiques.

## 11. Dades encara pendents

### DCF-01 - Identitat

Definir si l'accés utilitza correu, nom d'usuari o tots dos, i si hi ha verificació de correu.

### DCF-02 - Camps de la vista actual

Inventariar els camps exactes de la vista MeteoLord i classificar-los com a comuns o específics.

### DCF-03 - Regla horària

Escollir última lectura, primera, més propera al canvi d'hora o resum amb mínim/màxim/mitjana/acumulats.

### DCF-04 - Retenció

Definir temps de conservació i agregació posterior.

### DCF-05 - Contracte Ecowitt

L'evidència de repositori ja identifica el flux i diversos camps, però cal aprovar el contracte futur complet, inclosos credencials, camps, zeros, timestamps, límits i comportament multiestació.

### DCF-06 - Grafana productiu

Executar primer el PoC en local. Després cal concretar i documentar l'abast de persistència fora de prova, límits, unitats i alternativa d'autenticació; executar el PoC des del servidor; i obtenir autorització expressa de republicació abans de canviar cap font Grafana a `PUBLIC_ALLOWED`.

### DCF-07 - Motor cartogràfic

Comparar Instamaps i llibreria integrada amb una matriu de criteris funcionals, d'accessibilitat, dependència i manteniment.

### DCF-08 - Àmbit geogràfic

Definir el bounding box configurable de la zona si es vol impedir punts fora de la Vall de Lord.

### DCF-09 - Contracte de l'entorn local

`SPEC-10` concreta els resultats verificables de serveis, configuració, migracions, fixtures, aïllament, proves i promoció. Les eines, ports, artefactes i ordres exactes continuen pendents del futur PLAN.

## 12. Condicions d'aprovació

La `SPEC-00` pot passar a `APROVADA` quan:

- es resolgui `DCF-01`;
- s'accepti la descomposició;
- s'accepti `SPIKE-04` com a viable amb condicions, no com a contracte garantit;
- s'accepti que la ubicació pública és la que tria l'usuari;
- s'accepti que un usuari aprovat pot publicar sense segona aprovació;
- s'accepti que l'autorització actual de Grafana és només per a ús intern i prova local, i que la publicació queda bloquejada;
- s'accepti l'entorn local com a porta obligatòria abans del servidor;
- no hi hagi contradicció amb la conservació de la pantalla actual.

Aquestes condicions regulen l'aprovació funcional completa de `SPEC-00`; no són prerequisits per aprovar `SPEC-10` exclusivament per a la fase A.

## 13. Historial de versions

| Versió | Data | Canvis |
|---|---|---|
| 0.3 | 2026-09-02 | Candidata incorporada al repositori sense canvis de contingut. |
| 0.4 | 2026-09-03 | Correccions factuals segons `INSPECCIO-00`: estat real de Caddy, rutes, PostgreSQL/PostGIS 16, cron de l'host, `api_py`, entorn local, autenticació, migracions i proves. Aclariment que el nucli local no depèn del PoC Grafana. No es modifiquen les decisions funcionals del mapa. |
| 0.5 | 2026-09-03 | Ordre SDD corregit perquè `SPEC-10` i `PLAN-10` de fase A precedeixin les SPEC funcionals; `RF-19` limitat al nucli actual. `DCF-01`, login, mapa i Grafana no bloquegen l'entorn local. Sense canvis a les decisions funcionals del mapa. |

## 14. Referències

- [SPIKE-04 - Descoberta de dades Grafana/i2CAT](./SPIKE-04-descoberta-grafana-i2cat.md)
- [INSPECCIO-00 - Entorn i arquitectura real de MeteoLord](./INSPECCIO-00-entorn-meteolord.md)
- [SPEC-10 - Entorn local, proves i desplegament segur](./SPEC-10-entorn-local-proves-desplegament-segur.md)
- [Dashboard Vall de Lord — Meteo-001-3100044](https://grafana.commonscloud.coop/d/i2cat-public-jul27/vall-de-lord?orgId=11&from=now-24h&to=now&timezone=browser&var-sensor=Meteo-001-3100044)
- [Dashboard Vall de Lord — Meteo-007-3100206](https://grafana.commonscloud.coop/d/i2cat-public-jul27/vall-de-lord?orgId=11&from=now-24h&to=now&timezone=browser&var-sensor=Meteo-007-3100206)
- [Grafana Labs — Data source HTTP API](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/api-legacy/data_source/)
- [Grafana Labs — Configure anonymous access](https://grafana.com/docs/grafana/latest/setup-grafana/configure-access/configure-authentication/anonymous-auth/)
- [ICGC — Instamaps](https://www.icgc.cat/en/Tools-and-viewers/Tools/Instamaps)
- [Leaflet — API reference](https://leafletjs.com/reference.html)
