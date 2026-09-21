# Fase usuaris i estacions — diagnòstic i requisits

Data: 2026-09-18. Estat: **planificació candidata; implementació no iniciada**.

Ordre de lectura: aquest diagnòstic → [SPEC](SPEC.md) → [PLAN](PLAN.md) → [TASKS](TASKS.md). [DECISIONS](DECISIONS.md) recull les decisions adoptades i les validacions tècniques; [INVENTARI](INVENTARI.md), el contrast del PDF. Identificadors UE independents de la numeració històrica. Aquest paquet desenvolupa els dominis 01/02/03/05/07/09 reservats a [SPEC-00](../SPEC-00-mapa-estacions-meteolord.md); no declara aprovades noves fases MAP-B/C.

## Diagnòstic contrastat

Inspecció sobre HEAD `78bc33b1c51a563b8e9e2f8866fd6900bce7b164` i arbre de treball amb canvis locals previs, que es conserven. No s'ha trobat cap AGENTS.md aplicable al projecte ni als directoris ascendents consultats.

| Àmbit | Documentat | Implementat al checkout | Verificat / límit |
|---|---|---|---|
| Plataforma | SPEC-00 descriu mancances antigues de local/tests/migracions | Express/pg, frontend estàtic, PostgreSQL/PostGIS; [servidor](../../../backend/server.js), [migracions](../../../backend/db/migrate.js), [Compose local](../../../compose.meteolord-local.yml) | Inspecció de codi; les mancances històriques no descriuen l'estat actual |
| Entorn local | [TASKS-10](../TASKS-10-entorn-local-fase-a.md) reconstruït com a complet | Wrapper amb guards, fixtures, gate, proves Node i Playwright: [script](../../../scripts/meteolord-local.sh), [tests](../../../backend/test) | Evidència anterior, no reexecutada en aquesta planificació |
| Mapa | SPEC/PLAN/TASKS-06, DCF-06/08/11 | MapLibre/PMTiles, publicació, geometria, qualitat, versió, llista i fitxes: [proveïdor](../../../backend/providers/mapPublicCatalog.js), [rutes](../../../backend/routes/mapPublic.js), [client](../../../site/src/map.js) | [QA MAP-A](../QA-TASKS-06-v0.2.2-implementacio.md): funcional; G06-09 accessibilitat manual pendent |
| Dades reals locals | [QA live](../QA-LIVE-LOCAL-2026-09-18.md) | [Mapa live](../../../backend/routes/liveMapPreview.js): una observació MeteoLord aproximada i cinc punts Open-Meteo fixats al codi. [Proxy Meteo](../../../backend/routes/liveMeteoPreview.js) | QA anterior informa rutes sense 404 i navegador correcte. No és catàleg multiusuari ni validació de publicació real |
| Separació sintètic/real | Fase A requereix aïllament sintètic | [Preview](../../../backend/scripts/serve-map-demo.js) usa mode real per defecte; mode mapa sintètic encara consulta Meteo real. OSM extern en estil live | Desviació explícita a corregir abans de prendre aquest servidor com a harness offline |
| Identitat | SPEC-00: aprovació manual, una estació, privilegis amplis d'admin | [Esquema](../../../backend/db/migrations/0001-current-runtime.sql): usuaris i membres, sense credencials/sessions/rol d'aplicació. [API key](../../../backend/middleware/authApiKey.js) només protegeix tasques. Botó de login sense flux funcional | No hi ha autenticació funcional d'usuaris; no confondre membres ni ADMIN_EMAIL d'ingesta amb superadmin |
| Consulta i preferència | Predeterminada antiga implícita | [Mesures](../../../backend/routes/mesures.js): lectura anònima, SELECT m.*, consulta sense estació pot barrejar-ne diverses. [Store](../../../site/src/state/store.js): localStorage compartit; [app](../../../site/src/ui/screens/app.js) inicialitza també pantalles ocultes | **Bloquejant abans d'ingestar dades privades**: protegir totes les rutes i evitar persistència entre comptes |
| Connectors | DEFECT-01 reconegut | [Ecowitt](../../../backend/services/ecowittService.js): configuració global i fallback; expressions `+value || null` perden zeros. [Proves](../../../backend/test/unit/providers.test.js) caracteritzen el defecte | Defecte continua al codi; no declarar-lo resolt perquè hi ha tests |
| Grafana | [SPIKE-04](../SPIKE-04-descoberta-grafana-i2cat.md): viable amb condicions, observacions 2026-09-02 | Sense connector canònic persistent multiestació verificat en aquest paquet | Intent actual d'obrir dashboard i API de metadades: eina no hi accedeix. No prova que el servei falli; spike de revalidació necessari |

## Requisits i traçabilitat

| ID | Requisit | Acceptació | Tasques principals |
|---|---|---|---|
| UE-R01 | Sol·licitud pública, verificació d’email, aprovació manual, sessió, recuperació i admin segur | UE-CA01 | UE-T02, UE-T03, UE-T04 |
| UE-R02 | Diverses estacions pròpies; metadades, connector, secrets i observacions separats | UE-CA02 | UE-T05, UE-T06, UE-T07 |
| UE-R03 | Preferència pròpia persistent, consulta pública aliena, selecció temporal | UE-CA03 | UE-T09 |
| UE-R04 | Vista pública global editable amb components actuals | UE-CA04 | UE-T10 |
| UE-R05 | Mapa coherent, privacitat i geometria segons publicació | UE-CA05 | UE-T05, UE-T08 |
| UE-R06 | Catàleg extern administrat i correcció manual de coordenades | UE-CA06 | UE-T11 |
| UE-R07 | Contrast Grafana/PDF, importació idempotent i quarantena | UE-CA07 | UE-T12, UE-T13, UE-T14 |
| UE-R08 | Exactament sis estimacions, etiquetatge i referències | UE-CA08 | UE-T15 |
| UE-R09 | Qualitat, zeros, errors, antiguitat i cache | UE-CA09 | UE-T06, UE-T07, UE-T15 |
| UE-R10 | Autorització servidor, IDOR, secrets i destinacions segures | UE-CA10 | UE-T03, UE-T05, UE-T06, UE-T08, UE-T16 |
| UE-R11 | Continuïtat, migració compatible i proves deterministes | UE-CA11 | UE-T01, UE-T02, UE-T16, UE-T18 |
| UE-R12 | Històric optatiu per estació, activació i política d’emmagatzematge només d’admin, purga individual i conservació del llegat | UE-CA12 | UE-T17, UE-T18 |

## Canvis respecte de documents anteriors

La petició actual substitueix el límit d'una estació per usuari, separa preferència personal de vista global i no autoritza editar estacions alienes. Aquests punts de SPEC-00 són antecedents, no requisits d'aquesta fase. UE-D01 confirma verificació d’email i aprovació manual. UE-D02 concedeix a l’admin lectura de totes les privades, sense donar-li edició de metadades o credencials alienes. UE-D03 fixa Andorra la Vella. UE-D04 fixa el connector Grafana com a objectiu intern de producció, amb publicació condicionada als drets. UE-D05 resol l’abast funcional de DCF-04B amb una política històrica configurable per estació. Continuen vigents DCF-06 (publicació), DCF-08 (geometria), DCF-11 (deduplicació) i la restricció de publicació Grafana fins comprovar els drets. Una nova dada privada no pot entrar mentre només hi hagi filtres al frontend.

Lliurament d'aquesta execució: només documents. No s'han executat proves de producte, migracions, ingesta ni desplegaments; els PASS dels QA anteriors s'atribueixen exclusivament a aquelles execucions.

## Revisió de coherència executada

2026-09-18: comprovació documental original dels sis documents. Després de les decisions UE-D01–05, reconciliació repetida d’enllaços, dependències, camps obligatoris i cobertura UE-R01–12 ↔ UE-CA01–12 ↔ tasques UE-T01–18. Inventari: 35 codis únics; 20 MLW amb ID aparentment complet. Aquestes comprovacions no són proves del producte ni validen dades externes.
