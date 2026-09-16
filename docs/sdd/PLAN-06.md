# PLAN-06 v0.1 — Mapa públic d'estacions: baseline cartogràfica MAP-A

**Versió:** 0.1
**Estat:** CANDIDAT A REFINAMENT v0.2
**Data:** 2026-09-17
**SPEC de referència:** SPEC-06 v0.8
**Resolucions vinculants:** DCF-06 v1.2, DCF-04 v1.0, DCF-08 v1.0, DCF-11 v1.0
**QA de la SPEC:** QA-06 v3.0; QA-06 v4.0
**QA del PLAN:** QA-PLAN-06 v0.1
**Abast:** DLT-MAP-01 a DLT-MAP-05; MAP-A amb dades exclusivament sintètiques.
**No autoritza:** TASKS-06, implementació, dades reals, desplegament ni MAP-B/MAP-C.

## 1. Objectiu

Definir la baseline tècnica del mapa públic de MAP-A sense introduir
egress extern ni dades reals. El mapa ha de consumir únicament el catàleg
públic filtrat, i la llista textual continua sent la interfície autoritativa
per a accessibilitat i degradació.

Aquesta versió resol les decisions cartogràfiques DLT-MAP-01..05. El model
físic resta deliberadament obert a DLT-MAP-06..11.

## 2. Límits i garanties

- Cap recurs de runtime es carrega des d'un CDN ni d'un altre origen.
- No s'utilitzen servidors públics de tiles.
- Les dades `INTERNAL_ONLY` no entren al GeoJSON públic ni al clustering.
- MAP-A usa només fixtures i basemap sintètics, deterministes i locals.
- Si falla la capa cartogràfica, llista, cerca, filtres i fitxa continuen
  disponibles.
- Els paràmetres de clustering d'aquest PLAN són valors inicials
  seleccionats: **P06-A-19 els ha de validar** amb el dataset normatiu de
  500 estacions. No són una prova de rendiment superada.

## 3. Arquitectura de referència

```text
Browser
  ├─ GET /api/map/stations             → GeoJSON només MAP_VISIBLE
  ├─ GET /meteo/map-assets/style.json
  ├─ Range GET /meteo/map-assets/basemap.pmtiles
  ├─ GET /meteo/map-assets/maplibre-gl.*
  └─ Worker same-origin
       └─ cap request exterior
```

El flux d'entrada al clustering és obligatori:

```text
catàleg → PUBLIC_ALLOWED → deduplicació DCF-11 → canonical_station
→ MAP_VISIBLE DCF-08 → GeoJSON públic → clustering
```

El clustering és visual; no determina identitat ni deduplicació.

## 4. Decisions tècniques resoltes

### DLT-MAP-01 — Motor cartogràfic

**Estat:** RESOLT
**Decisió:** MapLibre GL JS, autoallotjat al mateix origen.

La versió exacta s'ha de fixar al lockfile i als artefactes de build; el
runtime no admet rangs flotants. El worker, JavaScript i CSS s'han de servir
des de `/meteo/map-assets/`. La CSP final és una decisió posterior de
DLT-MAP-24, però ha de permetre `worker-src 'self'` sense recursos externs.

### DLT-MAP-02 — Sistema de tiles

**Estat:** RESOLT
**Decisió:** PMTiles vectorial autoallotjat al mateix origen.

MAP-A servirà un basemap local, sintètic i determinista:

```text
/meteo/map-assets/basemap.pmtiles
/meteo/map-assets/style.json
/meteo/map-assets/[sprites i fonts necessaris]
```

El servidor ha de suportar peticions Range per al PMTiles. Les fonts
cartogràfiques reals, la seva llicència i atribució no formen part de MAP-A.

### DLT-MAP-03 — Format cartogràfic

**Estat:** RESOLT
**Decisió:** vectorial.

PMTiles és el contenidor de distribució; el contingut del basemap és vectorial
i l'estil és un MapLibre Style JSON. Aquesta separació permet substituir un
dataset autoritzat en fases posteriors sense canviar el contracte tècnic.

### DLT-MAP-04 — Clustering

**Estat:** RESOLT
**Decisió:** clustering natiu d'una font GeoJSON, amb valors inicials
`clusterRadius: 50` i `cluster: true`.

El clusterer rep només estacions canòniques, `MAP_VISIBLE` i compatibles amb
els filtres actius. Els clusters de MAP-A només publiquen `point_count` i
`cluster_id`; no s'hi afegeixen agregats de temperatura, qualitat, fonts,
propietaris ni estats interns.

### DLT-MAP-05 — Desclustering i coincidències

**Estat:** RESOLT AMB VALIDACIÓ DE BENCHMARK
**Decisió:** `clusterMaxZoom: 14` com a valor inicial; a `z >= 15` es
mostren punts individuals, amb `maxZoom: 18`.

En activar un cluster s'ha d'utilitzar el zoom d'expansió proporcionat pel
motor, no un increment fix de zoom. Si diverses estacions públiques tenen la
mateixa `public_geometry` a `z >= 15`, MAP-A presenta un selector
accessible de les estacions coincidents. MAP-A no aplica spiderfy automàtic
ni altera coordenades públiques.

## 5. Configuració conceptual

Aquesta configuració descriu el contracte, no els noms definitius de runtime:

```text
map:
  enabled: true
  engine: maplibre
  basemap: /meteo/map-assets/basemap.pmtiles
  style: /meteo/map-assets/style.json
  clustering: true
  clusterRadius: 50
  clusterMaxZoom: 14
  geolocation: false
  analytics: false
```

## 6. Degradació obligatòria

Una fallada de `basemap.pmtiles`, style, worker, WebGL o renderer no pot
activar cap fallback extern. La resposta visible informa que el mapa no és
disponible temporalment i conserva llista, cerca, filtres i fitxa.

## 7. Validació requerida per MAP-A

P06-A-10 verifica motor, worker, style i PMTiles same-origin.
P06-A-11 verifica GeoJSON `MAP_VISIBLE`, clustering, expansió i selector de
punts coincidents.
P06-A-17 verifica la CSP específica.
P06-A-18 verifica E2E, zero egress, fallada de basemap i coincidències.
P06-A-19 executa el benchmark normatiu amb 100 i 500 estacions.
P06-A-20 és la gate de MAP-A.

El benchmark de P06-A-19 ha de registrar browser, viewport, classe de
CPU/dispositiu, cold/warm cache, temps fins que el mapa i els clusters estan
llestos, latència d'interacció, long tasks i errors. Si falla amb 500
estacions, es poden ajustar `clusterRadius`, `clusterMaxZoom`, estil o
nombre de capes; si persisteix, es reobren DLT-MAP-04/05 abans de qüestionar
DLT-MAP-01.

## 8. DLT pendents: model físic

Els punts següents no estan resolts en v0.1 i són obligatoris abans de
redactar PLAN-06 v0.2:

| DLT | Estat | Límite |
|---|---|---|
| DLT-MAP-06 | PENDENT | Model físic |
| DLT-MAP-07 | PENDENT | Model físic |
| DLT-MAP-08 | PENDENT | Model físic |
| DLT-MAP-09 | PENDENT | Model físic |
| DLT-MAP-10 | PENDENT | Model físic |
| DLT-MAP-11 | PENDENT | Model físic |

No s'infereix cap decisió per a aquests DLT a partir de DLT-MAP-01..05.

## 9. Traçabilitat

| Font | Aplicació en aquest PLAN |
|---|---|
| SPEC-06 v0.8 | RNF-MAP-01, RNF-MAP-06, CA-MAP-25, CA-MAP-43 i contractes de visibilitat |
| DCF-06 v1.2 | Gate de publicació automàtic; cap superfície pública no l'esquiva |
| DCF-04 v1.0 | Historials i agregació continuen fora de l'abast d'aquesta baseline |
| DCF-08 v1.0 | `MAP_VISIBLE` i geometria pública abans de clustering |
| DCF-11 v1.0 | Deduplicació i canònica abans de clustering |
| QA-06 v3.0 | Respostes documentals incorporades a SPEC-06 v0.8 |
| QA-06 v4.0 | Aptitud de SPEC-06 v0.8 per iniciar aquest PLAN |

## 10. Gates

Aquest PLAN només pot avançar a PLAN-06 v0.2 quan DLT-MAP-06..11 estiguin
definits i sotmesos a QA documental. TASKS-06 només pot començar després de
la QA favorable de PLAN-06 v0.2 i l'aprovació explícita corresponent.

## 11. Historial

| Versió | Data | Canvi |
|---|---|---|
| 0.1 | 2026-09-17 | Creació des de zero: baseline cartogràfica DLT-MAP-01..05 i forats explícits per DLT-MAP-06..11. |
