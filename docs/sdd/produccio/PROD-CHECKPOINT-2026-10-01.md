# Checkpoint productiu — 2026-10-01

## Classificació

**PASS operatiu dins l'abast documentat.** No és un tancament del projecte ni
una autorització per executar noves migracions o desplegaments.

## Migració de cutover

PROD-01 va migrar satisfactòriament, una sola vegada, el baseline legacy al
release `321b8a5`. No és una migració recurrent i no s'ha de tornar a
executar sobre `meteo`. L'executor i la seva evidència es conserven per
reproduïbilitat i auditoria. A data d'aquest checkpoint, la classificació
`COMPLETED / HISTORICAL` encara requeria un dry-run real sobre una restauració
pre-cutover independent.

**Nota de supersessió, 2026-10-04:** el dry-run físic V4 va finalitzar PASS i
el cleanup posterior dels recursos descartables es va completar. PROD-01 és
ara `COMPLETED / HISTORICAL`; aquesta nota no altera la fotografia operativa
del 2026-10-01 ni autoritza repetir el cutover.

## Funcionalitat verificada

- SUPERADMIN inicia sessió.
- La vista Meteo permet seleccionar TecnoLord i les 29 estacions Grafana.
- El canvi TecnoLord → Grafana → TecnoLord conserva la identitat correcta.
- Una Grafana sense lectura vàlida continua al catàleg i no hereta dades.
- Ecowitt continua operatiu.
- No s'ha activat històric Grafana.

## Estat de dades observat

| Indicador | Valor |
| --- | ---: |
| Estacions totals | 30 |
| Bindings Grafana validats | 29 |
| Snapshots Grafana | 29 |
| Mesures Grafana | 0 |
| Polítiques d'històric Grafana | 0 |

Primer refresh real: `TOTAL=29`, `SUCCESS=24`, `FAILED=5`, `SKIPPED=0`.
Aquest 24/5 és una fotografia temporal.

| Codi | Nom | External ID | Resultat |
| --- | --- | --- | --- |
| MLW04 | El Vancell | Meteo-007-3100206 | INVALID_FRAMES |
| MLW03 | Masia Guixerons | Meteo-021-000070 | INVALID_FRAMES |
| MLW17 | Cal Samarrà | Meteo-024-00225 | INVALID_FRAMES |
| MLW26 | Cal Sec | Meteo-026- | INVALID_FRAMES |
| imp-grafana-grafana_028 | Torrent Foranca | Meteo-028-300127 | INVALID_FRAMES |

## Identitats que cal preservar

MLW28:

- codi `MLW28`;
- nom `Granja Vaques ca l'Andal`;
- external ID `Meteo-001-3100044`;
- UUID canònic `5da7eece-6954-413f-8e22-390fe4144830`.

TecnoLord:

- id intern `1`;
- codi tècnic `home`;
- nom visible `TecnoLord`;
- public ID `a4228e14-6184-48b8-93c0-dbd60df989c5`;
- provider `ecowitt`;
- `LEGACY / ACTIVE / PUBLIC`;
- revision `1`.

No s'ha canviat la identitat tècnica de l'estació legacy.

## Backend desplegat

- contenidor: `tecnolord-apps-backend-1`;
- imatge: `meteolord-backend-rc:321b8a5`;
- image ID observat:
  `sha256:a1b0cd3e799794b1a79f07e312af4b11fc7df7e377d74221964487edf1e165a5`;
- política de reinici: `unless-stopped`;
- compose base: `/home/deploy/tecnolord-apps/docker-compose.yml`;
- overlay: `/home/deploy/backend-cutover-321b8a5.yml`.

Variables no sensibles rellevants:

```text
POSTGRES_DB=meteo
POSTGRES_HOST=db
POSTGRES_PORT=5432
STATION_ID=home
ESTACIO_CODI=home
ESTACIO_NOM=TecnoLord
PREVI_MODEL=icon
PREVI_SOURCE=open-meteo
PREVI_STATION_CODE=home
METEOLORD_GRAFANA_INTERNAL_ENABLED=true
```

`ESTACIO_CODI` ha de ser exactament `home`, sense comentaris inline. Amb
`ESTACIO_NOM=TecnoLord`, una ingesta Ecowitt real va verificar
`home_after_ecowitt|1|home|TecnoLord|1`; la regressió queda resolta.

## Punt de recuperació verificat

- dump:
  `/home/deploy/meteo-backups/meteo-final-pre-grafana-20261001T170841Z.dump`;
- SHA-256:
  `9ccbd4b1bb3e4686da6dd7d25a4344c3eca9834eee2bf4c7cc0cf2be3d96a4d0`;
- fitxer: PASS;
- `pg_restore -l`: PASS;
- restauració real en base temporal: PASS.

Gate observat a la restauració:

```text
schemas|6
users|2|1
credentials|1
home|1|home|Casa|a4228e14-6184-48b8-93c0-dbd60df989c5|LEGACY|ACTIVE|PUBLIC|0
stations|1
measures|94699
grafana_bindings|0
snapshots|0
import_batches|0
import_rows|0
```

És un recovery point comprovat i s'ha de conservar. El nom `Casa` és correcte
perquè el dump és anterior al canvi de nom productiu.

## Límit del checkpoint

No cobreix els elements enumerats a [STATE.md](STATE.md#fora-de-labast-del-pass).
El camí de continuació és [ROADMAP-METEOLORD.md](../ROADMAP-METEOLORD.md).
