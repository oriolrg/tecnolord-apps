# Acta d'aprovació — TASKS-06 v0.2.2

**Data:** 2026-09-17
**Aprovat per:** Oriol
**Document aprovat:** TASKS-06 v0.2.2 — Mapa públic d'estacions, MAP-A sintètica
**QA prèvia:** QA-TASKS-06 v0.2 (TANCAT, favorable)

## Decisió

Es ratifica TASKS-06 v0.2.2 com a full de ruta d'implementació de MAP-A
sintètica, amb l'abast limitat a fixtures sintètiques, recursos same-origin
i baseline de Fase A verificada.

## Abast autoritzat

- T06-01 a T06-13, en ordre.
- Instal·lació de `maplibre-gl` i `pmtiles` per `npm ci` amb versions
  fixades al lockfile i registrades al preflight.
- Execució del benchmark P06-A-19 amb paràmetres fixats abans de mesurar.
- Redacció de `QA-TASKS-06-v0.2.2-implementacio.md` com a gate final.

## Abast NO autoritzat

- Dades reals.
- Grafana/i2CAT.
- ACA/Open-Meteo públics.
- MAP-B.
- MAP-C.
- Desplegament.
- Declarar P06-A-19 superat abans de mesurar.
- Re-executar la gate sencera de Fase A per cada tasca de MAP-A.

## Condicions de validació

- El commit d'inici de MAP-A ha de ser `0bf9a141` o un descendent amb canvis
  només a `docs/sdd/`.
- Cap tasca posterior no pot començar sense l'acceptació de la tasca anterior.
- Qualsevol contradicció amb SPEC-06 v0.8, PLAN-06 v0.2, DCF-06 v1.2,
  DCF-04A, DCF-08 o DCF-11 atura el treball i obliga a refinar abans de
  continuar.

## Acta

Signat el 2026-09-17 per Oriol.
