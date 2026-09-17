# Acta d'aprovació — TASKS-06 v0.2.1

**Data:** 2026-09-17
**Aprovat per:** Oriol
**Document aprovat:** TASKS-06 v0.2.1 — Mapa públic d'estacions, MAP-A sintètica
**QA prèvia:** QA-TASKS-06 v0.1 (TANCAT, favorable)

## Decisió

Es ratifica TASKS-06 v0.2.1 com a full de ruta d'implementació de MAP-A
sintètica, amb l'abast limitat a fixtures sintètiques, recursos same-origin
i gate de Fase A verda.

## Abast autoritzat

- T06-01 a T06-13, en ordre.
- Instal·lació de `maplibre-gl` i `pmtiles` per `npm ci` amb versions
  fixades al lockfile i registrades al preflight.
- Execució del benchmark P06-A-19 amb paràmetres fixats abans de mesurar.
- Redacció de `QA-TASKS-06-v0.2.1-implementacio.md` com a gate final.

## Abast NO autoritzat

- Dades reals.
- Grafana/i2CAT.
- ACA/Open-Meteo públics.
- MAP-B.
- MAP-C.
- Desplegament.
- Declarar P06-A-19 superat abans de mesurar.

## Condicions de validació

- El commit d'inici de MAP-A ha de tenir la gate de Fase A verda.
- Cap tasca posterior no pot començar sense l'acceptació de la tasca
  anterior.
- Qualsevol contradicció amb SPEC-06 v0.8, PLAN-06 v0.2, DCF-06 v1.2,
  DCF-04A, DCF-08 o DCF-11 atura el treball i obliga a refinar abans de
  continuar.

## Acta

Signat el 2026-09-17 per Oriol.