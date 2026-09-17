# QA-TASKS-06 v0.1 — Revisió documental de TASKS-06 v0.2.1

**Versió:** 0.1
**Estat:** TANCAT
**Data:** 2026-09-17
**Document revisat:** TASKS-06 v0.2.1
**SPEC base:** SPEC-06 v0.8
**PLAN base:** PLAN-06 v0.2 (aprovat)
**QA prèvia:** QA-06 v4.0, QA-PLAN-06 v0.2
**Naturalesa:** QA documental d'execució

## 1. Veredicte

**FAVORABLE PER A APROVACIÓ EXPLÍCITA I, DESPRÉS, PER INICIAR MAP-A SINTÈTICA.**

TASKS-06 v0.2.1 tanca les tres observacions menors de la primera passada i
no introdueix cap decisió que correspongui al PLAN-06 o a SPEC-06. L'aprovació
explícita continua sent un pas separat: aquest QA no autoritza per si sol la
implementació, ni MAP-B, ni MAP-C, ni dades reals.

## 2. Comprovacions

| ID | Resultat | Evidència |
|---|---|---|
| QT06-01 | PASS | Rate limiting actiu a T06-05, prova HTTP a T06-11 i gate G06-10. |
| QT06-02 | PASS | Sitemap només públic a T06-05, retirada per despublicació ≤60 s a T06-10, proves negatives a T06-11 i gate G06-11. |
| QT06-03 | PASS | T06-06 cobreix `history_profile`, `resolution_policy`, `custom_resolution_rules`, `raw_history_allowed`, `allowed_resolutions`, `min_coverage_policy`, `timezone_policy`, agregacions, `n_valid`/`n_expected`/`coverage`, frescor, `obsolete_limit`, `SOSPITOSA`/`OBSOLETA`/`EN_REVISIO` i `DEFECT-01`. |
| QT06-04 | PASS | T06-10 enumera tots els esdeveniments de `catalog_version`. |
| QT06-05 | PASS | T06-08 fixa que l'extent inicial es deriva únicament de geometries públiques `MAP_VISIBLE` filtrades. |
| QT06-06 | PASS | T06-09 exigeix WCAG 2.2 AA amb E2E/manuals, no només scanner. |
| QT06-07 | PASS | T06-11 lliga l'egress a la comprovació/allowlist de la gate de Fase A. |
| QT06-08 | PASS | Traçabilitat corregida a RF-MAP-01..47 i DCF-06 v1.1 + v1.2. |
| QT06-09 | PASS | Cap tasca depèn de DCF-10, DCF-12 o SPEC-08. |
| QT06-10 | PASS | Cap tasca autoritza MAP-B ni MAP-C; T06-13 ho explicita. |
| QT06-11 | PASS | `clusterRadius=50` i `clusterMaxZoom=14` romanen explícitament com a configuració inicial pendent de P06-A-19; cap tasca declara el benchmark superat. |
| QT06-12 | PASS | T06-06 prova MAP-A amb `retention_policy_ref=null` i amb referència fictícia. |
| QT06-13 | PASS | T06-04 manté l'ordre classificació → deduplicació → MAP_VISIBLE → filtres → GeoJSON. |
| QT06-14 | PASS | T06-01 reutilitza la gate de Fase A, guards de cleanup i configuració fail-closed existents. |
| QT06-15 | PASS | T06-02 no introdueix cap decisió tecnològica no fixada al PLAN-06 v0.2. |
| QT06-16 | PASS | Cap tasca introdueix un llindar numèric no fixat al PLAN-06 o a SPEC-06. |
| QT06-17 | PASS | T06-13 tanca MAP-A amb informe de traçabilitat i QA d'implementació abans de MAP-B/MAP-C. |

## 3. Tancament de les observacions de la primera passada

| Finding | Resultat | Resolució a v0.2.1 |
|---|---|---|
| QT06-N01 | PASS | T06-12 separa «Fixar» (paràmetres, abans de mesurar) i «Registrar» (mètriques). Alineat amb RNF-MAP-01. |
| QT06-N02 | PASS | T06-13 referencia explícitament `QA-TASKS-06-v0.2.1-implementacio.md`. |
| QT06-N03 | PASS | T06-02 fixa el contracte de versions: instal·lació per `npm ci`, versions exactes al lockfile i al manifest de preflight, digests SHA-512 registrats, prohibit `latest` o CDN. |

## 4. Observacions residuals (no bloquejants)

| ID | Severitat | Observació |
|---|---|---|
| QT06-N04 | MENOR | T06-02 no concreta encara el número exacte de `maplibre-gl` ni de `pmtiles`. És acceptable: el contracte exigeix la darrera estable disponible al moment d'iniciar MAP-A i en fixa la traça al preflight. |

No hi ha bloquejants ni defectes majors.

## 5. Condicions abans d'iniciar MAP-A

1. Versionar TASKS-06 v0.2.1 al repositori.
2. Obtenir l'aprovació explícita d'Oriol per a TASKS-06 v0.2.1.
3. Verificar que la gate de Fase A continua verda sobre el commit d'inici de MAP-A.
4. Mantenir P06-A-19 com a validació posterior: cap tasca ni implementació pot presentar els paràmetres inicials de clustering com a rendiment provat.
5. Mantenir fora d'abast: dades reals, Grafana/i2CAT, ACA/Open-Meteo públics, MAP-B, MAP-C i desplegament.

## 6. Historial

| Versió | Data | Canvi |
|---|---|---|
| 0.1 | 2026-09-17 | QA de TASKS-06 v0.2.1: tancada favorablement amb una observació menor. Autoritza aprovació explícita i inici de MAP-A sintètica, no dades reals ni MAP-B/MAP-C. |