# TASKS-06 v0.2.1 — Mapa públic d'estacions, MAP-A sintètica

**Versió:** 0.2.1
**Estat:** CANDIDAT A QA DOCUMENTAL
**Data:** 2026-09-17
**SPEC base:** SPEC-06 v0.8
**PLAN base:** PLAN-06 v0.2, aprovat
**QA prèvia:** QA-06 v4.0, QA-PLAN-06 v0.2 i QA-TASKS-06 v0.1
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

Afegir al lockfile de `backend/package.json` les dependències cartogràfiques
següents:

- `maplibre-gl` — darrera versió estable disponible compatible amb el
  contracte DCF-07 (sense `unsafe-eval`).
- `pmtiles` — darrera versió estable del paquet oficial que exposa
  `Protocol` per a MapLibre.

Instal·lar-les exclusivament amb `npm ci` des del lockfile versionat.
**Prohibit:** `latest`, ranges oberts, `npm install` interactiu, tarball
arbitrari o càrrega des de CDN.

Servir motor, worker, CSS, style, PMTiles sintètic i qualsevol sprite o font
estrictament necessaris al build bloquejat des de `/meteo/map-assets/`.
Verificar Range requests per al PMTiles. Registrar al manifest del preflight
(T06-01):

- versió exacta instal·lada de `maplibre-gl`;
- versió exacta instal·lada de `pmtiles`;
- digest SHA-512 del tarball de cada dependència;
- hash del lockfile `backend/package-lock.json`.

**Acceptació:** cap CDN; les versions queden fixades al lockfile i al
manifest de preflight; cap `latest` ni range obert; CSP compatible amb
worker same-origin; basemap, style i worker funcionen sense xarxa exterior.

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
`public_station_id`, sitemap públic, rate limiting actiu i resposta de
`catalog_version`. Una estació `INTERNAL_ONLY` o inexistent retorna el
mateix 404 públic.

**Acceptació:** mapa, llista, resum i fitxa representen el mateix conjunt
públic; els filtres no observen camps interns; els comptadors coincideixen amb
`MAP_VISIBLE`; el rate limiting és actiu a tota API pública; el sitemap
només enumera fitxes públiques vigents.

### T06-06 — Historial, qualitat i retenció

Aplicar `history_profile`, `resolution_policy` i
`custom_resolution_rules` deterministes. El perfil absent o inconsistent no
publica historial. Aplicar `raw_history_allowed`,
`allowed_resolutions`, `min_coverage_policy`, `timezone_policy` i les
operacions `sum`, `circular`, `max` i `counter_diff` segons el perfil.
Cada bucket publica `n_valid`, `n_expected` i `coverage`.

Aplicar qualitat i frescor: `SOSPITOSA` manté el camp visible amb marca «no
fiable»; `OBSOLETA` i `EN_REVISIO` romanen visibles amb l'indicador
normatiu; `obsolete_limit` és `max(24h, 12 × expected_update_interval)`.
Cap historial real es publica sense `retention_policy_ref`.

**Acceptació:** `default_period` és `24h`; la primera
`custom_resolution_rule` que cobreix el rang retorna exactament la seva
resolució i custom sense regla o fora de rang falla clarament;
`raw_history_allowed=false` no exposa raw; precipitació, vent, ratxa i
comptadors utilitzen respectivament `sum`, `circular`, `max` i
`counter_diff`; cobertura insuficient és parcial o `null` segons perfil;
`n_valid=0` retorna `null`, no zero; absències no s'interpolen ni es fan
carry-forward; DEFECT-01 no alimenta historial, agregats, estadístiques ni
derivats. Provar MAP-A amb `retention_policy_ref=null` (historial no
exposat) i amb referència fictícia (historial sintètic elegible).

### T06-07 — Frontend funcional sense mapa

Implementar runtime config fail-closed, llista completa, cerca, filtres,
estats de càrrega/buit/error, resum i fitxa. La interfície mostra només el
conjunt retornat pel backend.

**Acceptació:** llista independent del viewport; català; estats textuals
per qualitat/frescor; una ubicació aproximada comunica textualment que no és
exacta; navegació per URL directa; cap analítica ni enllaç extern en local.

### T06-08 — Mapa i clustering

Integrar el motor autoallotjat amb el GeoJSON públic, PMTiles local i
clustering. Configurar inicialment `clusterRadius=50` i
`clusterMaxZoom=14`; fer servir expansió de cluster calculada pel motor.
A partir de z15, els punts coincidents obren un selector accessible, sense
spiderfy.

**Acceptació:** clusters només de dades `MAP_VISIBLE`; cap `INTERNAL_ONLY`
influencia `point_count`, bounds, posició o comptadors. Els paràmetres són
registrats com a inicials i pendents de P06-A-19. L'extent inicial es deriva
únicament de totes les geometries públiques `MAP_VISIBLE` que passen els
filtres actius.

### T06-09 — Accessibilitat, CSP i degradació

Completar navegació de teclat, focus visible, semàntica de marcadors,
diàlegs, alternatives textuals de gràfiques i contrast. Si falla renderer,
worker, style o PMTiles, conservar llista, cerca, filtres i fitxa sense
fallback extern.

**Acceptació:** a més dels tests automàtics, les proves E2E/manuals acrediten
WCAG 2.2 AA aplicable: teclat, ordre i visibilitat del focus, absència de
keyboard trap, reflow, contrast, i que color/mida/icona no és l'únic canal
d'estat. La CSP no permet scripts externs ni unsafe-inline a script-src.

### T06-10 — Cache, catalog_version, sitemap i despublicació simulada

Fer que `catalog_version` invalidi caches controlades i representacions
locals. Incrementar-lo per publicació/despublicació, classificació
d'estació/sensor/camp, `public_geometry`, `privacy_radius_m`,
`geo_publication`, `history_profile_id`, `duplicate_group_id`,
`canonical_station_id` i qualsevol política que alteri la visibilitat.
Simular aquests esdeveniments i la retirada de la URL del sitemap.

**Acceptació:** API pública desapareix immediatament; caches controlades es
purgan en ≤60 s; el client rebutja cache amb versió anterior o no verificable;
el sitemap deixa d'enumerar la URL despublicada en ≤60 s.

### T06-11 — Proves funcionals i de seguretat

Ampliar proves unitàries, HTTP i E2E amb dades sintètiques. Cobrir
classificació, deduplicació, geolocalització pública, extent inicial,
qualitat, history profiles, rate limiting, sitemap, cache, degradació,
accessibilitat, CSP i zero egress.

**Acceptació:** prova HTTP de rate limiting actiu; sitemap sense
`INTERNAL_ONLY` i sense URL despublicada; consoles sense violacions CSP;
proves negatives demostren absència d'`INTERNAL_ONLY` i secrets. Executar o
reutilitzar la comprovació d'egress de la gate de Fase A i rebutjar qualsevol
request fora dels orígens locals que aquella gate autoritza per a cada
context.

### T06-12 — Benchmark P06-A-19

**Fixar abans de mesurar** (no ajustables després) els paràmetres del
benchmark: dispositiu, navegador, cache, xarxa simulada, dataset (100 i 500
estacions), viewport 375×667 i protocol de percentils. Un cop fixats,
**registrar** les mètriques: TTI, temps fins a clusters, latència, long
tasks, errors i percentils.

**Acceptació:** els paràmetres del benchmark queden fixats al manifest del
preflight (T06-01) abans d'executar cap mesura. RNF-MAP-01 i CA-MAP-43
només es marquen PASS si l'evidència mesurada ho acredita. Si falla,
revisar `clusterRadius`, `clusterMaxZoom`, estil o càrrega; no reescriure
SPEC-06 per ajustar. No s'accepten ajustos retroactius dels paràmetres per
fer passar el benchmark.

### T06-13 — Tancament MAP-A

Generar informe de traçabilitat i evidència sanejada sota
`artifacts/phase-a/<commit>/<run-id>/map-a/`. Redactar l'artefacte
`QA-TASKS-06-v0.2.1-implementacio.md` (o el nom equivalent aprovat per la
cadena SDD) amb:

- verificació de cada acceptació de T06-01..T06-12;
- resultats de les proves de T06-11;
- resultat del benchmark P06-A-19 de T06-12;
- traça a RF-MAP-01..47, RNF-MAP-01..23, CA-MAP-01..45 i G06-01..G06-11;
- declaració explícita de PASS/FAIL per cada gate.

Aquest QA de la implementació és el gate obligatori abans de qualsevol
decisió sobre MAP-B/MAP-C.

**Acceptació:** cap control omès es presenta com a PASS; resultats de
benchmark, egress, CSP, accessibilitat i exclusió d'INTERNAL_ONLY queden
traçats; l'artefacte QA de la implementació queda versionat i referenciat.

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
| G06-10 | Rate limiting actiu a l'API pública |
| G06-11 | Sitemap només públic i revocació propagada |

## 5. Traçabilitat

- SPEC-06 v0.8: RF-MAP-01..47, RNF-MAP-01..23 i CA-MAP-01..45 aplicables.
- PLAN-06 v0.2: DLT-MAP-01..11, en especial DLT-MAP-06..11.
- DCF-06 v1.1 + v1.2: classificació, catalog_version, revocació, cache i
  gate automàtic de publicació.
- DCF-04 v1.0: history profile, agregació i retenció.
- DCF-08 v1.0: geometria pública i `MAP_VISIBLE`.
- DCF-11 v1.0: deduplicació i canònica.
- QA-06 v4.0, QA-PLAN-06 v0.2 i QA-TASKS-06 v0.1: habilitació documental.

## 6. Historial

| Versió | Data | Canvi |
|---|---|---|
| 0.1 | 2026-09-17 | Primera seqüència d'implementació MAP-A sintètica, derivada de PLAN-06 v0.2. |
| 0.2 | 2026-09-17 | Correcció dels findings QT06-01..03: rate limiting, sitemap, contracte complet d'historial/qualitat, matriu catalog_version, extent, accessibilitat, egress i traçabilitat. |
| 0.2.1 | 2026-09-17 | Aplicats QT06-N01 i QT06-N02 del QA-TASKS-06 v0.1: T06-12 fixa i registra els paràmetres del benchmark; T06-13 referencia l'artefacte QA de la implementació. T06-02 concreta el contracte de versions cartogràfiques fixades per lockfile. |