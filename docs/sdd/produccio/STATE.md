# MeteoLord — Estat de producció

## Baseline

- RC: `321b8a5`
- gate: `H10 PASS — RELEASE CANDIDATE LOCAL`
- Grafana source/freshness cadence: `900 s`
- Grafana query resolution: `300 s`

## Gates completats

- `PR01 PASS — INVENTARI READ-ONLY COMPLET`
- `PR02 PASS — BACKUP CREAT I ESTRUCTURALMENT VALIDAT`
- `PR03 PASS — RESTORE VERIFICAT`

No s'ha modificat la BD productiva i no s'ha desplegat
`meteo-beta.tecnolord.cat`.

## Backup i restore vigents

- backup: `/home/deploy/backups/meteo/meteo-20260925T101137Z.dump`
- format: PostgreSQL custom (`-Fc`)
- mida observada: aproximadament 8,9 MB
- SHA-256: `0da4e0402aec92348632b334d41fb88dfe5e286f56f7c5af4b36696daf8a7f8b`
- restore pristine: `meteo_restore_test`
- restore: sense errors, amb invariants verificats

El backup continua al mateix Droplet; abans del cutover cal una còpia externa.
`meteo_restore_test` no es modifica ni s'utilitza per provar migracions.

## Invariants crítics del backup PR02

| Objecte | Files |
|---|---:|
| `meteo.estacions` | 1 |
| `meteo.mesures` | 94.095 |
| `meteo.mesures_bak_ytd` | 61.942 |
| `meteo.estacions_hidro` | 3 |
| `meteo.lectures_hidro` | 246.234 |
| `meteo.forecast_run` | 5.933 |
| `meteo.forecast_hourly` | 284.784 |
| `auth.usuaris` | 1 |
| `auth.aplicacions` | 1 |
| `auth.membres_app` | 0 |
| `meteo.membres_estacio` | 1 |
| `public.measurement` | 18 |

Els rangs temporals, estacions hidro, views i detalls de runtime consten a les
evidències PR01–PR03. Els invariants fan servir comptatges reals.

## Riscos oberts

- mismatch de collation a `meteo`: registrada `2.41`, runtime `2.31`;
- PostGIS no estava activat a la BD malgrat la imatge PostGIS;
- working tree productiu amb una migració de Biblioteca i `logs/cron.log`
  modificats;
- variables absents en executar `docker compose config` des de l'entorn
  interactiu;
- writers actius: Ecowitt cada 15 minuts i forecast cada hora;
- frontend amb bind mount i backend empaquetat dins la imatge;
- backup encara sense còpia externa al Droplet;
- servidor amb 1,9 GiB RAM i sense swap.

## Encara no executat

- gate PR04 de compatibilitat efectiva contra el restore;
- creació de `meteo_beta`;
- migració RC sobre clon;
- deploy o configuració DNS/Caddy de beta;
- cutover productiu.

Els documents `tasks/PR04.md` i `tasks/PR04-migration-candidate.md` són
preparació documental; no acrediten execució ni PASS de PR04.

## Next

`NEXT: PR04 — schema diff / pla de migració RC sobre clon`
