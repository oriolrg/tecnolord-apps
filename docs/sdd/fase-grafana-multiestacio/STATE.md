# STATE — Grafana multiestació

Actualitzat: 2026-09-24

## Baseline validada

G01 PASS — configuració i cadència Grafana.
G02 PASS — Grafana -> snapshot canònic en memòria.
G03 PASS — estació/binding local idempotent.
G04 PASS — Grafana real -> current_snapshots.
G05 PASS — current snapshot -> API MeteoLord ordinària.
G06 PASS — selector i vista Meteo.

G07 PASS — gate final de la integració Grafana local.

## Evidència G07 ja obtinguda

Suite general:
- PASS: 288
- FAIL: 0
- SKIP: 3

Suite dirigida:
- PASS: 37
- FAIL: 0
- SKIP: 0

Grafana real:
- resposta real: PASS
- última lectura verificada: 15.2 °C
- observed_at verificat: 2026-09-23T20:25:00Z
- snapshot count: 1

API:
- admin catalog: 200
- current: 200
- no autoritzat: 404
- metadades internes Grafana exposades: NO

UI real:
- estació visible: PASS
- temperatura: PASS
- freshness: PASS
- camps absents -> —
- Ecowitt -> Grafana -> Ecowitt: PASS
- logout: PASS
- errors consola: 0

Network navegador:
- Grafana directe: NO
- `/admin/grafana/...`: NO

Persistència observada abans del tancament:
- estacions Grafana: 1
- bindings Grafana: 1
- snapshots Grafana: 1
- mesures Grafana: 0
- polítiques històriques Grafana: 0

## Estació Grafana existent

UUID:
`5da7eece-6954-413f-8e22-390fe4144830`

Binding:
`GRAFANA / Meteo-001-3100044 / VALIDATED`

Codi temporal:
`GRAFANA_LOCAL_001`

Identitat real coneguda:
- external_id: `Meteo-001-3100044`
- codi: `MLW28`
- nom: `Granja Vaques ca l'Andal`

IMPORTANT:
No duplicar aquesta estació.
La reconciliació ha de preservar UUID, binding i snapshots.

## Fase activa

Grafana multiestació.

H01 PASS — discovery de sensors Grafana.

Evidència:
- `evidence/H01-grafana-sensors.json`;
- variable `sensor`: query `{tag1="I2CAT"}`, extracció literal de `tag4`;
- 29 valors actuals descoberts per dues respostes Grafana coincidents amb l'interval de 24 hores del dashboard;
- 24 `MATCH`, 3 `PARTIAL_MATCH`, 2 `GRAFANA_ONLY`;
- 0 `CATALOG_ONLY`, 0 `CONFLICT`;
- `Meteo-026-`, `Meteo-027-` i `Meteo-029-` continuen sense sufix demostrable.

H02 PASS — mapping Grafana ↔ catàleg ↔ PDF.

Evidència:
- `evidence/H02-station-mapping.json`;
- 29 sensors actuals classificats: 21 `CONFIRMED`, 3 `PARTIAL_EXTERNAL_ID`, 2 `UNIDENTIFIED_GRAFANA`, 3 `PENDENT_REVISIO`;
- 23 codis MLW acreditats i 6 sense codi acreditable;
- 7 sensors `HISTORICAL_NOT_CURRENT` separats de l'inventari actual;
- divergències pendents: Cal Reli, El Planàs i Granja Vaques ca l'Andal;
- els tres external IDs parcials continuen literals i els dos S31 continuen sense identitat.

H03 PASS — geolocalització inicial contrastada.

Evidència:
- `evidence/H03-station-locations.json`;
- 27 estacions elegibles investigades exactament una vegada;
- 10 ubicacions `HIGH`, 3 `MEDIUM`, 2 `LOW` i 12 `UNRESOLVED`;
- 13 ubicacions amb coordenades de fitxes concretes de Google Maps;
- 10 `CANDIDATE_APPLY`, 3 `REVIEW` i 14 `DO_NOT_APPLY`;
- cap coordenada aplicada a BD i cap external_id parcial completat.

H04 PASS — discovery de mètriques Grafana.

Evidència:
- `evidence/H04-grafana-metrics.json`;
- dashboard Vall de Lord versió 46 inspeccionat;
- temperatura i humitat disponibles als 29 sensors `CURRENT`;
- pressió i pluja disponibles en 27 sensors i absents als dos S31;
- temperatura confirmada com `xoic_I2CAT_temperatura` → `temp_c`;
- humitat relativa confirmada com `xoic_I2CAT_humitat` → `humitat_pct`;
- pressió `xoic_I2CAT_pressio` sense unitat ni tipus demostrats: `SEMANTICS_UNRESOLVED`;
- pluja calculada com diferència mòbil de l'acumulador a 24 h, sense unitat ni tractament de reset demostrats: `SEMANTICS_UNRESOLVED`;
- cadència modal observada de 900 s, amb timestamps coincidents a les mostres MLW01, MLW02 i MLW28 però completitud independent per variable;
- cap mapping nou aplicat i cap canvi de BD, backend o frontend.

H05A PASS — snapshot Grafana multivariable confirmat.

Evidència:
- `evidence/H05A-validation.json`;
- `xoic_I2CAT_temperatura` → `temp_c` i `xoic_I2CAT_humitat` → `humitat_pct`, sense mapar pressió ni pluja;
- timestamps individuals a `quality.observed_at_by_field` i `observed_at` global derivat del màxim camp vàlid;
- persistència monotònica per camp en un únic `current_snapshots`, sense files a `meteo.mesures`;
- cadència Grafana de 900 s confirmada sobre els 29 sensors actuals, amb override conservat i cap scheduler;
- prova real PASS per MLW01, MLW02 i MLW28;
- suite general: 295 PASS, 0 FAIL, 0 SKIP.

H05B PASS — semàntica de pressió i pluja investigada, sense mapping autoritzat.

Evidència:
- `evidence/H05B-pressure-rain-semantics.json`;
- les metadades Prometheus declaren ambdues mètriques com `type=unknown` i unitat buida;
- pressió continua `SEMANTICS_UNRESOLVED`: no es pot distingir pressió absoluta/local de pressió corregida a nivell del mar;
- pluja continua `SEMANTICS_UNRESOLVED` i `RESET_BEHAVIOR_UNRESOLVED`;
- MLW28 presenta un descens real del comptador de pluja de 28,4 a 1,5 el 2026-04-20T15:20:00Z;
- la resta `current - offset 1d` no implementa tractament de resets i no és universalment defensable com a precipitació de 24 h;
- `pressure: BLOCKED` i `rain: BLOCKED` per a H05C;
- cap canvi funcional, de BD, schema, snapshot o migració.

H06 PASS — importació i reconciliació del catàleg Grafana local.

Evidència:
- `evidence/H06-import-plan.json` creat abans de l'aplicació: 26 `CREATE`, 1 `UPDATE_EXISTING`, 2 `CREATE_TECHNICAL`, 0 conflictes;
- `evidence/H06-import-result.json`: 29 sensors representats com `ADMIN / PRIVATE / GRAFANA / VALIDATED`;
- MLW28 actualitzada a codi `MLW28` i nom `Granja Vaques ca l'Andal`, conservant UUID, binding 2 i snapshot;
- external IDs parcials conservats literalment i dos S31 creats sense identitat física ni coordenades inventades;
- 10 ubicacions HIGH aplicades; 0 MEDIUM, LOW o UNRESOLVED aplicades;
- refresh manual amb 2 workers: 28 snapshots amb temperatura i humitat; `S31-119416` va respondre `EMPTY_DATA` a la finestra CURRENT de 30 minuts i no es van inventar valors;
- 0 mesures Grafana, 0 polítiques d'històric, pressió i pluja sense mapping;
- segona execució idempotent, sense bindings duplicats;
- suite general: 301 PASS, 0 FAIL, 0 SKIP; regressió Ecowitt PASS.

H07 PASS — integració API/UI/mapa del catàleg Grafana multiestació.

Evidència:
- `evidence/H07-ui-map-validation.json`;
- selector SUPERADMIN amb les 29 estacions Grafana, sense duplicats;
- API ordinària i vista Meteo verificades per MLW01, MLW02, MLW28, MLW26, S31-119416, S31-99933 i Ecowitt;
- corregida només la pèrdua del nom seleccionat quan una estació no té lectura actual;
- `S31-119416` validada amb estat buit sanejat, sense targetes antigues, i recuperació posterior de la font observada;
- canvi ràpid amb resposta retardada PASS, retorn a Ecowitt PASS i logout PASS;
- mapa administratiu amb exactament 10 ubicacions Grafana HIGH; 0 estacions Grafana al mapa, catàleg o vista pública;
- 0 peticions directes a Grafana i 0 peticions a `/admin/grafana/...`;
- 0 mesures Grafana i 0 polítiques d'històric;
- suite general: 302 PASS, 0 FAIL, 0 SKIP; regressió Ecowitt, permisos i històric existent PASS.

H08 PASS — gate final Grafana multiestació completada en local.

Evidència:
- `evidence/H08-final-gate.json`;
- HEAD `b1c7557`; backend i PostgreSQL existents i saludables, sense recrear BD ni volums;
- 29 estacions, 29 bindings `VALIDATED`, 0 duplicats, totes `ADMIN / PRIVATE` i UUID de MLW28 preservat;
- refresh manual repetit: 29 snapshots únics, 0 regressions temporals, 0 pèrdues de camp i últim valor bo preservat davant errors;
- 27 lectures actuals utilitzables i 2 fonts temporalment no disponibles amb `INVALID_FRAMES`, sense trencar API ni UI;
- selector i navegador real PASS amb 29 Grafana, canvi ràpid, camps absents `—`, retorn Ecowitt → Grafana i logout net;
- mapa administratiu amb 10 ubicacions HIGH i 0 filtracions públiques; 0 coordenades MEDIUM, LOW o UNRESOLVED aplicades;
- 0 peticions directes a Grafana, 0 peticions a `/admin/grafana/...` i 0 metadades internes exposades;
- pressió i pluja continuen bloquejades i sense valors canònics;
- 29 snapshots Grafana, 0 mesures Grafana i 0 polítiques d'històric;
- regressió Ecowitt completa PASS, incloent refresh, snapshot, API, UI, frescor i històric existent;
- suite completa: 302 PASS, 0 FAIL, 0 SKIP; sintaxi i `git diff --check` PASS.

Ordre:

H01 discovery sensors Grafana
H02 mapping catàleg/PDF
H03 geolocalització
H04 discovery mètriques
H05 snapshot multivariable
H06 import/reconciliació
H07 API/UI/mapa
H08 gate multiestació

## Següent tasca

Fase Grafana multiestació completada. Cap fase productiva iniciada.

H05C continua bloquejada per pressió i pluja fins a obtenir contractes de font suficients (no iniciada).

## Invariants

- Ecowitt ha de continuar funcionant.
- Grafana history continua desactivat.
- Producció no es toca.
- No inventar external_id.
- No inventar coordenades.
- No inventar noms de mètriques.
- `Meteo-001-3100044` no es recrea.
