# QA-06 v4.0 — Revisió funcional de SPEC-06 v0.8

**Versió:** 4.0
**Estat:** COMPLETAT
**Data:** 2026-09-17
**Document revisat:** SPEC-06 v0.8
**Revisor:** QA documental
**Naturalesa:** Revisió funcional posterior a QA-06 v3.0

## 1. Veredicte

**APTA PER INICIAR PLAN-06 PER A MAP-A SINTÈTICA.**

La SPEC-06 v0.8 resol els dos bloquejants i els dos ajustos importants
identificats per QA-06 v3.0. Aquesta aptitud no autoritza implementació,
dades reals, desplegament, MAP-B ni MAP-C.

## 2. Verificació dels findings de QA-06 v3.0

| ID | Severitat anterior | Resultat | Evidència a SPEC-06 v0.8 |
|---|---|---|---|
| QA-06-14 | BLOQUEJANT | PASS | DCF-06 v1.2 reconcilia el gate automàtic i l'escalat excepcional; §6.1 i la traçabilitat ho referencien. |
| QA-06-15 | BLOQUEJANT | PASS | §6.3 defineix `custom_resolution_rules` ordenades i deterministes; RF-MAP-47, RNF-MAP-23 i CA-MAP-44 en fan el contracte executable. |
| QA-06-16 | IMPORTANT | PASS | §4.2 fixa que `SOSPITOSA` roman visible i els camps afectats es marquen «no fiable», sense ocultar-los; CA-MAP-45 ho comprova. |
| QA-06-17 | IMPORTANT | PASS | CA-MAP-43 fixa el dataset de 500 estacions, clustering, llista alternativa, comptador públic i exclusió d'`INTERNAL_ONLY`. |

## 3. Comprovacions addicionals

- `default_period` és un valor únic (`24h`); la selecció d'altres períodes
  depèn d'`allowed_periods`.
- RNF-MAP-01 aplica explícitament el llindar de TTI a 500 estacions.
- El benchmark de 500 estacions continua pendent d'execució: cap paràmetre
  de clustering es presenta com a validat abans de P06-A-19.
- DCF-04B, DCF-10 i DCF-12 romanen fora de MAP-A segons les gates de la SPEC.

## 4. Límits de l'aprovació documental

QA-06 v4.0 permet redactar PLAN-06 per a MAP-A sintètica. Abans de
TASKS-06 caldrà una QA favorable del PLAN complet; abans de dades reals
continuen aplicant les gates documentals i d'operació corresponents.

## 5. Historial

| Versió | Data | Canvi |
|---|---|---|
| 4.0 | 2026-09-17 | QA de SPEC-06 v0.8: tanca QA-06-14..17 i habilita PLAN-06 per a MAP-A sintètica. |
