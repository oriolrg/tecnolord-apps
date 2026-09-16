# QA-PLAN-06 v0.2 — Revisió documental de PLAN-06 v0.2

**Versió:** 0.2
**Estat:** TANCAT
**Data:** 2026-09-17
**Document revisat:** PLAN-06 v0.2
**Naturalesa:** QA documental de planificació

## 1. Veredicte

**APTA PER A APROVACIÓ EXPLÍCITA I, DESPRÉS, PER REDACTAR TASKS-06.**

PLAN-06 v0.2 tanca DLT-MAP-06..11 sense relaxar les garanties de
SPEC-06 v0.8 ni les DCF referenciades. L'aprovació explícita continua sent
un pas separat: aquesta QA no autoritza per si sola la implementació.

## 2. Comprovacions

| ID | Resultat | Evidència |
|---|---|---|
| QP06-20 | PASS | DLT-MAP-06..11 estan descrits i els límits de MAP-A sintètica són explícits. |
| QP06-21 | PASS | DLT-MAP-11 vincula el benchmark de 500 estacions amb RNF-MAP-01 i CA-MAP-43. |
| QP06-22 | PASS | `clusterRadius=50` i `clusterMaxZoom=14` són configuració inicial del PLAN, no rendiment aprovat ni decisió de SPEC. |
| QP06-23 | PASS | El protocol revisa els paràmetres si P06-A-19 falla. |
| QP06-24 | PASS | TASKS-06, implementació, MAP-B i MAP-C es mantenen fora de l'autorització automàtica del PLAN. |
| QP06-25 | PASS | DLT-MAP-01..05 conserven exactament la identitat definida a PLAN-06 v0.1. |
| QP06-26 | PASS | `HistoryProfile.default_period` és el valor únic `"24h"`; la resta de períodes es governen amb `allowed_periods`. |

## 3. Tancament dels findings previs

| ID | Resultat | Resolució |
|---|---|---|
| QA-P06-08 | PASS | QA-PLAN-06 v0.1 és tancada i versionada; v0.2 queda pendent de versionar en la ruta canònica abans de l'aprovació formal. |
| QA-P06-09 | PASS | La taula heretada de DLT-MAP-01..05 ara coincideix amb PLAN-06 v0.1. |
| QA-P06-10 | PASS | `default_period` s'ha corregit a `"24h"`. |
| QA-P06-11 | PENDENT MAP-B | La retenció real es manté limitada per SPEC-08; cap excepció s'aplica a dades reals. |
| QA-P06-12 | PASS | L'ús de fixtures de MAP-A no modifica els contractes persistits de la Fase A. |

## 4. Condicions abans de TASKS-06

1. Versionar PLAN-06 v0.2 a la ruta canònica acordada.
2. Obtenir l'aprovació explícita d'Oriol per al PLAN-06 v0.2.
3. Redactar TASKS-06 dins l'abast de MAP-A sintètica.
4. Mantenir P06-A-19 com a validació posterior: cap tasca ni implementació
   pot presentar els paràmetres inicials de clustering com a rendiment provat.

## 5. Historial

| Versió | Data | Canvi |
|---|---|---|
| 0.2 | 2026-09-17 | QA de PLAN-06 v0.2: tancada després de corregir traçabilitat DLT i default_period. |
