# TASKS-10 — Entorn local de MeteoLord, fase A

**Versió:** 0.1
**Estat:** COMPLETADA (reconstrucció documental)
**Data original:** 2026-09 (aproximada)
**Data de reconstrucció documental:** 2026-09-12
**SPEC base:** [SPEC-10 v0.3](./SPEC-10-entorn-local-proves-desplegament-segur.md)
**Antecedent de QA:** [QA-11 v1.0 reconstruït](./QA-11-PLAN-10-v0.2.md)

## 0. Nota sobre la reconstrucció

El fitxer original de `TASKS-10 v0.1` no estava versionat. Aquest document no
pretén ser-ne una còpia literal: reconstrueix el pla d'execució que es va
aplicar a partir dels encàrrecs T01–T24, les evidències de fase A i les
referències SDD disponibles al repositori. Les dades, els secrets i les
operacions de producció no formen part d'aquest document.

## 1. Objectiu i límits

Implementar i acreditar un nucli MeteoLord local, reproduïble i descartable:

- configuració local fail-closed i exclusivament sintètica;
- imatges fixades, lock npm, builds allowlist i DB local migrable;
- serveis backend i DB estrictament necessaris, fixtures i tasques injectables;
- salut, logs sanejats, proves Node/E2E i gate traçable;
- cap accés a producció, Grafana, fase B o fase C.

La fase A no corregeix DEFECT-01, no promou canvis a servidor i no converteix
dades reals en fixtures.

## 2. Regles d'execució

- Treballar sempre sobre un HEAD identificat i registrar el `run-id`.
- Aturar la tasca davant canvis aliens, falta de documents aprovats o evidència
  no reproduïble.
- No publicar ports de DB; l'origen local és el backend en loopback.
- Usar només configuració, clocks, transports i fixtures sintètiques en local
  o test.
- No fer `pull` ni `build` durant la gate; bootstrap i gate són passos separats.
- Mantindre guards de projecte abans de qualsevol cleanup.
- No presentar una prova no executada com a `PASS`.

## 3. Seqüència normativa de tasques

| Tasca | Resultat verificable | Dependència |
|---|---|---|
| T01 | Preflight, estat Git i inventari inicial | cap |
| T02 | Contracte de configuració local fail-closed | T01 |
| T03 | Wrapper segur, run IDs, evidències i guards de cleanup | T02 |
| T04 | Pins reals d'imatges i lock npm reproduïble | T03 |
| T05 | Contexts de build allowlist sense dades legacy | T04 |
| T06 | Compose local estàtic i configuració runtime local | T05 |
| T07 | Topologia dinàmica, publicació loopback i comprovacions d'aïllament | T06 |
| T08 | Runner de migracions forward-only amb lock i checksum | T07 |
| T09 | DDL de les vuit relacions canòniques | T08 |
| T10 | Proves de recreació, rollback, concurrència i idempotència | T09 |
| T11 | Pool i composició injectable sense regressió productiva | T10 |
| T12 | Fixtures, rellotge i doble de transport deterministes | T11 |
| T13 | Carregador idempotent de fixtures | T12 |
| T14 | Serveis Ecowitt, ACA i previsió injectables | T13 |
| T15 | Disparador manual i paritat CLI/HTTP | T14 |
| T16 | Liveness, readiness i recuperació DB | T15 |
| T17 | Logs JSONL, correlació i redacció | T16 |
| T18 | Suites Node i cobertura traçable | T17 |
| T19 | Runtime config, CSP i compatibilitat frontend | T18 |
| T20 | Playwright E2E, requests locals i CSP | T19 |
| T21 | Informe d'evidències sanejat | T20 |
| T22 | Gate de 19 controls amb fail-fast | T21 |
| T23 | Documentació operativa local | T22 |
| T24 | Gate final des de checkout net i tancament de fase A | T23 |

## 4. Controls de la gate

La gate normativa executa, en aquest ordre, els 19 controls següents:

1. `config-check`
2. `deps-check`
3. `static-check`
4. `topology-check`
5. `test-db-create`
6. `migrate --target test`
7. `fixtures --target test`
8. `backend-check`
9. `frontend-check`
10. `health-check`
11. `health-db-down-check`
12. `tasks-check`
13. `idempotency-check`
14. `egress-check`
15. `secrets-check`
16. `defect-01-characterization`
17. `frontend-regression`
18. `test-cleanup`
19. `report`

Una fallada crítica atura la cadena. Els controls no executats han de constar
com a `NOT_RUN` a l'informe; mai com a `PASS`.

## 5. Evidència i criteris de tancament

Cada execució desa evidència sota
`artifacts/phase-a/<commit>/<run-id>/`. El tancament requereix, com a mínim:

- pins i hash del lock verificats per `linux/amd64`;
- migracions, fixtures i reexecució idempotent en una DB de prova nova;
- salut 200/503/200, liveness independent de DB i tasques autenticades;
- absència de requests externs i dades no sintètiques;
- E2E amb CSP sense violacions i requests només a l'origen intern;
- neteja limitada al projecte de prova, sense recursos residuals;
- informe machine-readable amb 19 controls i els seus artifacts.

## 6. Traçabilitat SDD

- [SPEC-10 v0.3](./SPEC-10-entorn-local-proves-desplegament-segur.md): base
  normativa de fase A.
- [PLAN-10 v0.5](./PLAN-10-entorn-local-fase-a.md): referència tècnica
  versionada; la seva capçalera actual encara diu `CANDIDAT A QA`.
- [QA-10](./QA-10-PLAN-10.md): evolució documental i findings posteriors.
- [QA-11 reconstruït](./QA-11-PLAN-10-v0.2.md): antecedent històric favorable
  per a la redacció de TASKS-10.
- [DEFECT-01](./DEFECT-01-zeros-ecowitt-convertits-null.md): defecte conegut
  caracteritzat, fora de l'abast de correcció de fase A.

## 7. Resultat d'execució (afegit 2026-09-12)

**Estat final:** COMPLETADA

**Commit d'acceptació:** `0bf9a1411d6b4455f12c18b3cb9e77e86d2dc132`

**Run ID de la gate final:** `20260912-225949-0bf9a14`

**Resultat:** 19/19 controls PASS, exit code 0, zero recursos residuals.

**Evidència:** `artifacts/phase-a/0bf9a1411d6b4455f12c18b3cb9e77e86d2dc132/20260912-225949-0bf9a14/`

### Tasques completades

Totes les tasques T01–T24 han estat completades i versionades. Les
correccions T05-fix (Dockerfile.local) i T16-fix (pool error handler)
han estat integrades i revalidades.

### Deute residual documentat

- **QA-11:** reconstruït (aquest mateix conjunt de documents).
- **DEFECT-01:** caracteritzat, no corregit (fora d'abast de Fase A).
- **T07 (egress):** traslladat a T14 com a control d'aplicació.
- **Caddy local:** eliminat de la topologia local (backend serveix el frontend).

### Traçabilitat

- `QA-11 v1.0` (reconstruït): FAVORABLE per a `PLAN-10 v0.2` → `TASKS-10 v0.1`.
- `PLAN-10 v0.5`: referència tècnica; el seu estat versionat actual és
  `CANDIDAT A QA`, no una aprovació retroactiva.
- `SPEC-10 v0.3`: fase A aprovada per Oriol.
- `TASKS-10 v0.1`: aquest document reconstruït.
- Commit `0bf9a141`: baseline acceptada per la gate final de fase A.

## 8. Historial

| Versió | Data | Canvis |
|---|---|---|
| 0.1 (reconstruïda) | 2026-09-12 | Formalització de TASKS-10 a partir de l'execució T01–T24 i de l'evidència T24 |
