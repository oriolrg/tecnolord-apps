# STATE — Producció MeteoLord

Actualitzat: 2026-10-04.

## Checkpoint operatiu

**CHECKPOINT PRODUCCIÓ 2026-10-01: PASS**

L'abast del PASS és:

- backend RC `meteolord-backend-rc:321b8a5` desplegat;
- login SUPERADMIN operatiu;
- estació legacy TecnoLord/Ecowitt operativa, amb codi tècnic `home`;
- catàleg amb 30 estacions: TecnoLord i 29 Grafana;
- selector SUPERADMIN i lectura actual per estació operatius;
- 29 bindings Grafana validats i 29 snapshots;
- refresh Grafana periòdic actiu cada 5 minuts;
- primer refresh observat: 24 èxits i 5 `INVALID_FRAMES`, errors aïllats;
- 0 mesures Grafana i 0 polítiques d'històric Grafana;
- regressió Ecowitt posterior al canvi de nom superada.

El recompte 24/5 és una observació del primer refresh, no una invariant. Les
invariants són conservar les 29 estacions al catàleg, aïllar errors, no
reutilitzar dades entre estacions i no activar històric implícitament.

L'evidència consolidada del checkpoint productiu pertany al seu conjunt
documental propi i queda fora del commit de tancament de PROD-01.

## PROD-01 — tancament històric

**PROD-01: COMPLETED / HISTORICAL.**

El dry-run físic V4 `20261003_220226`, sobre el target descartable
`meteo_prod_dryrun_20261003_220226`, va completar RESTORE, PRE-CUTOVER, APPLY,
VERIFY, postflight, tests i final safety. L'inventari, l'ID del contenidor i els
mounts productius van quedar invariants; no hi va haver connexions a targets
productius ni ordres de cleanup. El delta disposable va ser exactament el
baseline `postgres`, `template_postgis` més el target del run.

La traçabilitat conserva els tres intents d'enduriment anteriors:

1. `20261002_223602`: FAIL a restore per race de readiness;
2. `20261003_080833`: FAIL a apply per pathname AF_UNIX massa llarg;
3. `20261003_175050`: FAIL a final-safety-gate per baseline disposable
   incomplet;
4. `20261003_220226`: PASS complet amb runner V4.

Els entorns i les evidències es mantenen sense cleanup. PROD-01 queda només com
a artefacte de reproduïbilitat i auditoria; no forma part del runbook normal i
no es pot executar sobre `meteo`. La suite general d'integració no formava part
del dry-run aïllat perquè crea bases temporals alienes al seu contracte.

## Fora de l'abast del PASS

- alta pública d'usuaris amb correu productiu;
- nivell de visibilitat per a usuaris autenticats;
- publicació selectiva d'estacions Grafana;
- mapa final de producció per cada nivell d'accés;
- vent Grafana;
- correcció de cache en mòbil;
- pressió/pluja mentre la semàntica no estigui acreditada;
- activació d'històric Grafana;
- resolució de l'avís de collation.

## Incidències i pendents operatius

- PostgreSQL informa que `meteo` es va crear amb collation 2.41 i el sistema
  ofereix 2.31. És una incidència separada i diferida.
- No s'ha d'executar `ALTER DATABASE meteo REFRESH COLLATION VERSION` sense
  una tasca específica, backup, estudi d'índexs/objectes i prova en clon.
- PROD-02 diagnosticarà la versió antiga observada en alguns mòbils.
- El cutover one-shot legacy → `321b8a5` i el dry-run històric físic de
  [PROD-01](tasks/PROD-01.md) s'han completat. PROD-01 queda tancat com
  `COMPLETED / HISTORICAL` i no es pot tornar a executar sobre `meteo`.

## Estat general

Checkpoint productiu operatiu; projecte no finalitzat. El backlog general i
l'ordre de continuació pertanyen al conjunt documental del roadmap, fora
d'aquest commit.
