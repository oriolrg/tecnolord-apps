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

H05B (no iniciada)

## Invariants

- Ecowitt ha de continuar funcionant.
- Grafana history continua desactivat.
- Producció no es toca.
- No inventar external_id.
- No inventar coordenades.
- No inventar noms de mètriques.
- `Meteo-001-3100044` no es recrea.
