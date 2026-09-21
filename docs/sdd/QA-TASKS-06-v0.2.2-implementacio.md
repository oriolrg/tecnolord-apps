# QA d'implementació — MAP-A sintètica

**Data:** 2026-09-17  
**Base:** TASKS-06 v0.2.2, SPEC-06 v0.8, PLAN-06 v0.2  
**HEAD previ de continuació:** `78bc33b1c51a563b8e9e2f8866fd6900bce7b164`  
**Estat:** funcionalment validat; gate final G06-09 pendent de revisió manual completa d'accessibilitat.

## Abast i resultat

La variant local mostra temperatures d'estacions sintètiques en un mapa MapLibre amb PMTiles i recursos exclusivament del mateix origen. La llista textual completa, la cerca, els filtres, els resums i les fitxes amb URL directa funcionen independentment del mapa. El backend aplica classificació, deduplicació, geometria pública i qualitat abans de l'API; la revocació canvia `catalog_version` i retira immediatament l'estació de les superfícies públiques. La previsualització d'aquesta variant MAP-A es pot iniciar amb `MAP_PREVIEW_MODE=synthetic node backend/scripts/serve-map-demo.js`.

La revisió visual local prioritza el mapa en escriptori i mòbil: capçalera compacta, resum d'estacions i rang de temperatures, cerca al costat del mapa, filtres secundaris plegables en pantalles estretes, llegenda persistent i llista de valors llegibles. La capçalera amb el logotip, el fons clar amb accents blaus i els panells arrodonits segueixen la presentació del panell Meteo d'una estació. Les captures `desktop.png` i `mobile.png` i la suite de navegador s'han regenerat després d'aquesta revisió.

L'evidència no versionada és a `artifacts/phase-a/78bc33b1c51a563b8e9e2f8866fd6900bce7b164/map-a-completion/map-a/`. El registre de baseline de Fase A preexistent és a `artifacts/phase-a/41bca02e949b4e4f56eb77a7d762bcc8a16fde00/a61f1b10/map-a/preflight/baseline.json`. L'execució actual és una continuació sobre els commits T06-01..04 i canvis locals T06-05; no reobre ni declara una nova baseline neta.

La imatge local immutable `sha256:6eba5f1e1e8ccf7653aa3c21b614fa4dc55e1b2750d35ba1b0a1357c5fd34155` s'ha construït amb `npm ci` i comprovat en un contenidor efímer sense xarxa; `compose.meteolord-local.yml` hi apunta, però no s'ha arrencat ni desplegat el stack. No s'han usat dades reals, Grafana/i2CAT ni dades públiques ACA/Open-Meteo. MAP-B i MAP-C no estan habilitats.

## Evidència executada

| Control | Resultat | Evidència |
|---|---|---|
| Proves unitàries, HTTP i seguretat | PASS, 162/162 en la suite final | `unit-http-security.tap`; `backend/test/unit/mapPublicCatalog.test.js`, `mapContracts.test.js`, `backend/test/http/mapPublic.test.js` i suites existents |
| Navegador | PASS | `browser-tests.json`; cercador, filtres, estats, mapa, selector de coincidències z15, fitxa directa, historial, teclat, revocació, offline, degradació de motor/worker/style/PMTiles |
| CSP i egress del navegador | PASS | `browser-tests.json`: zero violacions CSP i zero peticions fora de l'origen local observades en la suite; CSP local sense `unsafe-inline` a `script-src` |
| PMTiles i actius | PASS | `assets-manifest.json`; petició Range amb HTTP 206; style, mòduls, worker i PMTiles al mateix origen; versions exactes `maplibre-gl@6.10.0` i `pmtiles@4.5.0` |
| Contrast mesurat | PASS per als 12 parells de colors auditats | `contrast.json`, tots ≥4,5:1 per text i focus i contorns de controls ≥3:1 |
| Reflow/teclat | PASS per als recorreguts provats | `browser-tests.json`, 375 px i 320 px sense desbordament; diàleg amb focus contingut i Escape que retorna el focus |
| P06-A-19 | PASS en les dues poblacions | `benchmark-environment.json` i `p06-a-19.json`: 20 mostres per població, viewport 375×667, xarxa 4G simulada, cache freda i percentil nearest-rank p95 |
| Auditoria WCAG 2.2 AA completa | PENDENT | Les captures `desktop.png` i `mobile.png`, contrast i proves de teclat són parcials; no s'ha executat una revisió manual completa de tots els criteris aplicables amb tecnologia d'assistència. No es declara conformitat WCAG global. |

**P06-A-19, paràmetres fixats abans de mesurar:** Chrome 153.0.8010.36, CPU de l'host amb WebGL per programari, 40 ms de latència, 1.125.000 bytes/s de descàrrega, sense cache entre contextos, 20 mostres per conjunt, `clusterRadius=50` i `clusterMaxZoom=14`.

| Estacions | TTI p95 | Resum p95 | Fitxa p95 | Clústers i llista | Resultat |
|---:|---:|---:|---:|---|---|
| 100 | 1.721 ms | 430 ms | 295 ms | Presents; 100 files | PASS |
| 500 | 1.938 ms | 192 ms | 408 ms | Presents; 500 files | PASS |

Els llindars són TTI ≤2.500 ms, resum p95 ≤500 ms i fitxa p95 ≤1.000 ms. Aquest resultat correspon exclusivament al dispositiu i les condicions fixades en l'evidència; no substitueix proves en dispositius reals. Les tasques llargues i les mostres individuals consten a `p06-a-19.json`.

## Acceptació de tasques T06

| Tasca | Estat | Traça principal |
|---|---|---|
| T06-01 | PASS heretat | Baseline Fase A registrada abans de la continuació i preflight actual sense dades reals. |
| T06-02 | PASS | Lockfile, integritats SHA-512, manifest d'actius, PMTiles amb Range, cap CDN. |
| T06-03 | PASS | Fixtures canòniques prèvies, 500 estacions i fixture nova amb geometria privada/pública sintètica. |
| T06-04 | PASS | `mapPublicCatalog.js`, `mapGeometry.js`: classificació explícita, canònica, geometria pública, filtres i GeoJSON. |
| T06-05 | PASS | API de mapa, llista, resum, fitxa, sitemap JSON/XML i rate limiting actiu. |
| T06-06 | PASS per MAP-A | Historial sintètic governat per perfil i retenció fictícia; cobertura, agregacions i qualitat provades. L'historial real continua prohibit sense política de retenció. |
| T06-07 | PASS | Llista sense dependència del viewport, cerca, filtres, estats, fitxa directa i configuració local tancada. |
| T06-08 | PASS | GeoJSON amb clustering natiu, 50/14, expansió calculada i selector accessible de punts coincidents. |
| T06-09 | PARCIAL | Teclat, reflow, text d'estat, contrast, degradació i CSP provats; auditoria WCAG 2.2 AA completa pendent. |
| T06-10 | PASS | Versió monòtona en els canvis de política i visibilitat provats, `no-store`, revocació immediata i client que descarta la representació no verificable. |
| T06-11 | PASS per a la suite definida | Proves unitàries, HTTP i navegador, negatives d'interns, revocació, CSP, egress i fallades d'actius. |
| T06-12 | PASS | P06-A-19 mesurat amb 100/500 estacions i paràmetres predefinits. |
| T06-13 | PARCIAL | Informe i traça presents; no es declara QA final favorable fins a tancar T06-09. |

## Traçabilitat de requisits

La taula usa **PASS** només per a controls amb prova en l'abast MAP-A. **N/A MAP-A** identifica una obligació de sistema real o fase posterior que les fixtures sintètiques no poden demostrar. **PENDENT** impedeix declarar la gate final favorable.

| Referències | Estat | Evidència o límit |
|---|---|---|
| RF-MAP-01..09 | PASS | Frontera pública, mapa, resum, fitxa i llista independent del viewport. |
| RF-MAP-10..17 | PASS | Pausa, revocació, camps classificats, càrrega/error, deduplicació i català. |
| RF-MAP-18..23 | PASS | Sitemap sense internes, verificació de versió, 404 uniforme i versió a l'API. |
| RF-MAP-24 | N/A MAP-A | Eliminació de compte: no hi ha comptes en la variant sintètica. |
| RF-MAP-25..33 | PASS en MAP-A | DEFECT-01 exclòs, extent públic, generalització backend en metres quan hi ha geometria privada sintètica, sense geolocalització del visitant ni persistència. |
| RF-MAP-34..41 | PASS | Grups confirmats, candidats, proximitat, canònica, no-fallback, no-fusió i canvi de versió. |
| RF-MAP-42..47 | PASS | Perfils d'historial, agregació al backend, nul·ls, resolució declarada i estats SOSPITOSA/OBSOLETA/EN_REVISIO. |
| RNF-MAP-01 | PASS | P06-A-19 sobre 100/500 estacions. |
| RNF-MAP-02..05 | PENDENT global; controls parcials PASS | Teclat, reflow, text i contrast auditats; conformitat WCAG 2.2 AA completa encara sense acreditar. |
| RNF-MAP-06..08 | PASS | Zero egress/CSP, logs estructurats i llista que sobreviu a fallades del renderer. |
| RNF-MAP-09, 13, 14, 17, 20 | N/A MAP-A | Consentiment real, analítica opcional, càrrega prèvia a MAP-C, NTP operatiu i retenció real. |
| RNF-MAP-10..12, 15..16, 18..19, 21..23 | PASS en MAP-A | Precisió sintètica, rate limit, versió/cache, WGS84, canònica i resolució custom. |
| CA-MAP-01..03 | PASS | Classificació explícita i absència d'INTERNAL_ONLY. |
| CA-MAP-04 | PENDENT global | Recorreguts de teclat i diàleg PASS; auditoria manual WCAG completa pendent. |
| CA-MAP-05..09 | PASS | Taula textual d'historial, zero egress/CSP, degradació i estats. |
| CA-MAP-10..20 | PASS en MAP-A | Deduplicació, idioma, rate limit, revocació, versió, resum, llista, 404 i DEFECT-01. |
| CA-MAP-21..30 | PASS en MAP-A | Extent de public_geometry, geometria privada sintètica absent de l'API, 1 km, cap geolocalització/persistència i ubicació aproximada textual. |
| CA-MAP-31..41 | PASS en MAP-A | Perfil, retenció, agregació, cobertura, zona UTC, resolucions, qualitat i obsolete_limit. |
| CA-MAP-42..45 | PASS | Rendiment mesurat, 500 estacions amb clústers/llista, custom i SOSPITOSA textual. |

## Gates

| Gate | Estat | Motiu |
|---|---|---|
| G06-01 | PASS | Actius, worker i PMTiles same-origin. |
| G06-02 | PASS | Fixtures i territori inventats. |
| G06-03 | PASS | Classificació i canònica abans de l'exposició i el clustering. |
| G06-04 | PASS | Llista completa, filtrable i navegable amb teclat. |
| G06-05 | PASS | Historial i qualitat deterministes; DEFECT-01 absent. |
| G06-06 | PASS | Catàleg versionat i revocació simulada. |
| G06-07 | PASS | Proves de navegador sense petició externa ni violació CSP. |
| G06-08 | PASS | P06-A-19 executat i llindars complerts. |
| G06-09 | PENDENT | Auditoria manual WCAG 2.2 AA completa i QA final favorable encara no acreditats. |
| G06-10 | PASS | Rate limiting públic provat per HTTP. |
| G06-11 | PASS | Sitemap públic JSON/XML i retirada immediata de URL despublicada. |

**Decisió:** la variant MAP-A queda implementada i validada funcionalment per a ús local sintètic. La gate formal de tancament MAP-A continua pendent de G06-09. No s'autoritza inferir habilitació de MAP-B, MAP-C ni desplegament a partir d'aquest informe.
