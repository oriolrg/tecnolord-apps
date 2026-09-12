# QA-11 — Revisió del PLAN-10 v0.2

**Versió:** 1.0
**Estat:** FAVORABLE
**Data original:** 2026-09-03 (aproximada)
**Data de reconstrucció documental:** 2026-09-12
**PLAN revisat:** PLAN-10 v0.2
**SPEC base:** SPEC-10 v0.3 — APROVADA PER A LA FASE A
**Naturalesa:** Reconstrucció documental

## 0. Nota sobre la reconstrucció

Aquest document és una reconstrucció del QA-11 v1.0 original, referenciat a
`TASKS-10 v0.1` com a font d'aprovació del PLAN-10 v0.2, però que no va ser
versionat al repositori.

La reconstrucció es basa en:

- les referències explícites de `TASKS-10 v0.1`;
- l'evolució de PLAN-10 v0.2 → v0.5 documentada al seu historial de versions;
- el contingut de `QA-10-PLAN-10.md` (versions 1.0–1.3).

La fidelitat al QA-11 original no pot ser garantida al 100 %, però es preserva
l'esperit, les conclusions i l'estat FAVORABLE que van permetre redactar
TASKS-10.

## 1. Abast de la revisió

El QA-11 va revisar el PLAN-10 v0.2, que definia la implementació de la fase A
de SPEC-10 (entorn local de MeteoLord).

## 2. Metodologia

Revisió documental i tècnica estàtica de:

- coherència amb SPEC-10 v0.3 (abast fase A);
- viabilitat tècnica de les decisions proposades;
- traçabilitat amb els requisits RF10, RNF10 i CA10;
- riscos residuals i la seva mitigació.

## 3. Findings i resolució

Les troballes del QA-11 van ser resoltes en versions posteriors del PLAN-10:

- v0.2 → v0.3: 12 correccions tancades (QA-10 v1.1);
- v0.3 → v0.4: 9 correccions tancades (QA-10 v1.2);
- v0.4 → v0.5: 7 correccions tancades (QA-10 v1.3).

Vegeu les referències detallades a `QA-10-PLAN-10.md`.

## 4. Decisió

**FAVORABLE** per redactar TASKS-10 v0.1.

## 5. Conseqüències

- Autoritza redactar `TASKS-10 v0.1`.
- Requereix que TASKS-10 implementi exactament les decisions fixades al
  PLAN-10.
- Les fases B i C continuen bloquejades.
- Cap criteri d'acceptació queda acreditat per aquest QA.

## 6. Traçabilitat

- `SPEC-10 v0.3`: base normativa.
- `PLAN-10 v0.2`: objecte de revisió.
- `PLAN-10 v0.5`: versió posterior documentada després de QA-10 v1.3.
- `TASKS-10 v0.1`: document derivat reconstruït.

### Nota de coherència amb el repositori actual

La capçalera versionada de `PLAN-10 v0.5` encara el qualifica de **CANDIDAT A
QA**, i `QA-10 v1.4` en recomana el refinament. Aquest fet posterior no es pot
reescriure ni es presenta aquí com una aprovació retroactiva. La decisió
FAVORABLE anterior acredita només la reconstrucció històrica del pas
`PLAN-10 v0.2` → `TASKS-10 v0.1`; l'acceptació tècnica de la implementació de
la fase A és l'evidència de T24, no aquest QA reconstruït.

## 7. Historial

| Versió | Data | Canvis |
|---|---|---|
| 1.0 (reconstruïda) | 2026-09-12 | Reconstrucció documental a partir de referències i evidència indirecta |
