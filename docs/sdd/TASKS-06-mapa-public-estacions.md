# TASKS-06 v0.1 — Mapa públic d'estacions, MAP-A sintètica

**Versió:** 0.1
**Estat:** CANDIDAT A QA DOCUMENTAL
**Data:** 2026-09-17
**SPEC base:** SPEC-06 v0.8
**PLAN base:** PLAN-06 v0.2, aprovat
**QA prèvia:** QA-06 v4.0 i QA-PLAN-06 v0.2
**Abast:** implementació MAP-A només amb fixtures sintètiques i recursos same-origin.
**No autoritza:** dades reals, Grafana/i2CAT, ACA/Open-Meteo públics, MAP-B, MAP-C ni desplegament.

## 1. Regles d'execució

- Reutilitzar la gate local de Fase A, els guards de cleanup i la configuració
  fail-closed existents.
- No carregar recursos, tiles, fonts, scripts, workers ni API des d'orígens
  externs.
- Tota fixture ha de ser sintètica, determinista i sense coordenades o dades
  reals.
- El backend aplica classificació, deduplicació, geometria pública i qualitat
  abans de construir qualsevol superfície pública.
- La llista textual és una alternativa funcional completa al mapa.
- P06-A-19 és una validació futura de rendiment; cap tasca la pot declarar
  superada abans d'executar-la.
- Aturar el treball si un contracte de SPEC-06, DCF-06 v1.2, DCF-04A,
  DCF-08 o DCF-11 queda ambigu.

## 2. Seqüència normativa

| Tasca | Resultat verificable | Dependència |
|---|---|---|
| T06-01 | Preflight, espai de treball i evidència de l'execució | Fase A verda |
| T06-02 | Dependències cartogràfiques bloquejades i actius same-origin | T06-01 |
| T06-03 | Fixtures canòniques sintètiques i contractes de catàleg | T06-01 |
| T06-04 | Adaptador de catàleg públic fail-closed | T06-03 |
| T06-05 | API pública de catàleg, llista, resum i fitxa | T06-04 |
| T06-06 | Contractes d'historial, qualitat i retenció per a MAP-A | T06-03, T06-05 |
| T06-07 | Frontend: runtime config, llista, cerca, filtres i estats | T06-05 |
| T06-08 | Mapa same-origin, clusters i punts coincidents | T06-02, T06-07 |
| T06-09 | Accessibilitat, degradació i CSP | T06-07, T06-08 |
| T06-10 | Cache, catalog_version i despublicació simulada | T06-05, T06-07 |
| T06-11 | Suites unitàries, HTTP, E2E i proves negatives | T06-04 a T06-10 |
| T06-12 | Benchmark P06-A-19 i gate MAP-A | T06-11 |
| T06-13 | Informe sanejat, QA d'implementació i decisió MAP-A | T06-12 |

## 3. Detall de tasques

### T06-01 — Preflight i evidència

Registrar commit, run-id, estat Git, versions d'eines i configuració local
validada. Crear evidència sota
`artifacts/phase-a/<commit>/<run-id>/map-a/`.

**Acceptació:** arbre net abans d'iniciar; cap secret, dada real ni recurs
extern en l'evidència.

### T06-02 — Actius cartogràfics controlats

Afegir el motor cartogràfic, worker, CSS, style, PMTiles sintètic i qualsevol
sprite o font estrictament necessaris al build bloquejat. Servir-los des de
`/meteo/map-assets/` i verificar Range requests per al PMTiles.

**Acceptació:** cap CDN; CSP compatible amb worker same-origin; basemap,
style i worker funcionen sense xarxa exterior.

### T06-03 — Fixtures i model canònic

Crear fixtures versionades per al model de DLT-MAP-06: estacions bàsiques,
internes, DEFECT-01, duplicats confirmats, punts coincidents, sense geometria,
perfiles d'historial/qualitat i dataset de 500 estacions.

**Acceptació:** les fixtures compleixen claus, coherència de classificació,
RFC 3339 UTC, geometria pública i contractes de quality/history profile. Cap
fixture conté dades reals o Grafana/i2CAT.

### T06-04 — Adaptador públic fail-closed

Implementar la composició del catàleg públic en ordre: classificació
`PUBLIC_ALLOWED`, deduplicació i canònica, `MAP_VISIBLE`, filtres actius i
GeoJSON públic. Les absències de classificació es tracten com
`INTERNAL_ONLY`.

**Acceptació:** `INTERNAL_ONLY`, camps DEFECT-01, geometria absent, revocació
i recursos no publicables no apareixen a mapa, llista, comptadors, cerca,
clusters ni errors.

### T06-05 — API pública

Implementar contractes per catàleg GeoJSON, llista filtrada, resum, fitxa per
`public_station_id` i resposta de `catalog_version`. Una estació
`INTERNAL_ONLY` o inexistent retorna el mateix 404 públic.

**Acceptació:** mapa, llista, resum i fitxa representen el mateix conjunt
públic; els filtres no observen camps interns; els comptadors coincideixen amb
`MAP_VISIBLE`.

### T06-06 — Historial, qualitat i retenció

Aplicar `history_profile`, `resolution_policy` i
`custom_resolution_rules` deterministes. Els camps sospitosos es mantenen
visibles amb marca «no fiable»; no s'oculten. Cap historial real es publica
sense `retention_policy_ref`.

**Acceptació:** `default_period` és `24h`; custom sense regla o fora de
rang falla clarament; absències no es converteixen en zero; DEFECT-01 no
alimenta historial, agregats, estadístiques ni derivats.

### T06-07 — Frontend funcional sense mapa

Implementar runtime config fail-closed, llista completa, cerca, filtres,
estats de càrrega/buit/error, resum i fitxa. La interfície mostra només el
conjunt retornat pel backend.

**Acceptació:** llista independent del viewport; català; estats textuals
per qualitat/frescor; navegació per URL directa; cap analítica ni enllaç
extern en local.

### T06-08 — Mapa i clustering

Integrar el motor autoallotjat amb el GeoJSON públic, PMTiles local i
clustering. Configurar inicialment `clusterRadius=50` i
`clusterMaxZoom=14`; fer servir expansió de cluster calculada pel motor.
A partir de z15, els punts coincidents obren un selector accessible, sense
spiderfy.

**Acceptació:** clusters només de dades `MAP_VISIBLE`; cap `INTERNAL_ONLY`
influencia `point_count`, bounds, posició o comptadors. Els paràmetres són
registrats com a inicials i pendents de P06-A-19.

### T06-09 — Accessibilitat, CSP i degradació

Completar navegació de teclat, focus visible, semàntica de marcadors,
diàlegs, alternatives textuals de gràfiques i contrast. Si falla renderer,
worker, style o PMTiles, conservar llista, cerca, filtres i fitxa sense
fallback extern.

**Acceptació:** proves automatitzades d'accessibilitat i E2E no detecten
violacions bloquejants; la CSP no permet scripts externs ni unsafe-inline a
script-src.

### T06-10 — Cache i despublicació simulada

Fer que `catalog_version` invalidi caches controlades i representacions
locals. Simular despublicació, canvi de geometria, classificació, perfil i
canònica.

**Acceptació:** API pública desapareix immediatament; caches controlades es
purgan en ≤60 s; el client rebutja cache amb versió anterior o no verificable.

### T06-11 — Proves funcionals i de seguretat

Ampliar proves unitàries, HTTP i E2E amb dades sintètiques. Cobrir
classificació, deduplicació, geolocalització pública, qualitat, history
profiles, cache, degradació, accessibilitat, CSP i zero egress.

**Acceptació:** requests del navegador només same-origin; consoles sense
violacions CSP; proves negatives demostren absència d'INTERNAL_ONLY i secrets.

### T06-12 — Benchmark P06-A-19

Executar el protocol amb 100 i 500 estacions en viewport 375×667 i 4G
simulada. Registrar dispositiu, navegador, cache, xarxa, TTI, temps fins a
clusters, latència, long tasks, errors i percentils.

**Acceptació:** RNF-MAP-01 i CA-MAP-43 només es marquen PASS si l'evidència
mesurada ho acredita. Si falla, revisar `clusterRadius`,
`clusterMaxZoom`, estil o càrrega; no reescriure SPEC-06 per ajustar.

### T06-13 — Tancament MAP-A

Generar informe de traçabilitat i evidència sanejada. Fer QA de la
implementació abans de qualsevol decisió sobre MAP-B/MAP-C.

**Acceptació:** cap control omès es presenta com a PASS; resultats de
benchmark, egress, CSP, accessibilitat i exclusió d'INTERNAL_ONLY queden
traçats.

## 4. Gates

| Gate | Requisit |
|---|---|
| G06-01 | Assets, worker i PMTiles exclusivament same-origin |
| G06-02 | Fixtures íntegrament sintètiques |
| G06-03 | Filtrat fail-closed abans de GeoJSON, clustering i comptadors |
| G06-04 | Llista alternativa completa i accessible |
| G06-05 | Historial/qualitat determinista i DEFECT-01 exclòs |
| G06-06 | Cache i despublicació verificades |
| G06-07 | E2E sense egress ni violacions CSP |
| G06-08 | P06-A-19 mesurat, no assumit |
| G06-09 | Informe i QA d'implementació favorables |

## 5. Traçabilitat

- SPEC-06 v0.8: RF-MAP-42..47, RNF-MAP-01..23 i CA-MAP-01..45 aplicables.
- PLAN-06 v0.2: DLT-MAP-01..11, en especial DLT-MAP-06..11.
- DCF-06 v1.2: gate automàtic de publicació.
- DCF-04 v1.0: history profile, agregació i retenció.
- DCF-08 v1.0: geometria pública i `MAP_VISIBLE`.
- DCF-11 v1.0: deduplicació i canònica.
- QA-06 v4.0 i QA-PLAN-06 v0.2: habilitació documental.

## 6. Historial

| Versió | Data | Canvi |
|---|---|---|
| 0.1 | 2026-09-17 | Primera seqüència d'implementació MAP-A sintètica, derivada de PLAN-06 v0.2. |
