# MeteoLord — Pla de preproducció i producció

## Baseline

- Release Candidate: `321b8a5`
- Gate local: `H10 PASS — RELEASE CANDIDATE LOCAL`
- source/freshness cadence Grafana: `900 s`
- query resolution Grafana: `300 s`

La producció conté dades Meteo, Ecowitt, hidro, forecast, auth, Biblioteca i
objectes legacy que s'han de preservar. Cap migració RC s'executarà directament
sobre la BD productiva sense haver superat abans el flux complet sobre una
còpia restaurada.

## Flux obligatori

```text
production
  → pg_dump
  → restore pristine (meteo_restore_test)
  → còpia de treball (meteo_beta)
  → schema diff i migració sobre la còpia
  → gate de dades, esquema i aplicació
  → meteo-beta.tecnolord.cat
  → validació beta
  → preparació del cutover
  → producció
```

`meteo_restore_test` és immutable. Qualsevol prova de migració es farà sobre
una BD nova `meteo_beta` o una còpia de treball equivalent.

## Fases

| Fase | Resultat | Estat |
|---|---|---|
| PR01 | Inventari read-only de servidor, runtime, Docker, Git i PostgreSQL | PASS |
| PR02 | Backup PostgreSQL complet en format custom i validació estructural | PASS |
| PR03 | Restore separat i verificació d'invariants | PASS |
| PR04 | Diff exacte de l'esquema productiu respecte de l'RC i pla de migració | NEXT |
| PR05 | Migració candidata exclusivament sobre `meteo_beta` | PENDENT |
| PR06 | Gate postmigració de dades, esquema i aplicació | PENDENT |
| BETA-01 | Deploy a `meteo-beta.tecnolord.cat` | PENDENT |
| BETA-02 | Validació HTTPS, sessions, mapa, Grafana, Ecowitt, hidro i forecast | PENDENT |
| PR07 | Backup immediat, rollback, ordres i criteris GO/NO-GO de cutover | PENDENT |
| PROD-01 | Cutover controlat | PENDENT |

Hi ha documentació preparatòria de PR04 a `tasks/PR04.md` i
`tasks/PR04-migration-candidate.md`. No representa una migració executada ni un
gate PR04 tancat. PR04 s'ha de completar contra l'empremta efectiva del restore
abans de començar PR05.

## Invariants de preservació

La comparació abans/després ha d'utilitzar `COUNT(*)` i empremtes reals, no
estimacions de `pg_stat_user_tables`. Com a mínim s'han de conservar:

- `meteo.estacions` i tots els IDs/codis existents;
- 94.095 files de `meteo.mesures` del backup PR02;
- 61.942 files de `meteo.mesures_bak_ytd`;
- 3 estacions i 246.234 lectures hidro;
- 5.933 runs i 284.784 hores de forecast;
- auth i membres existents, sense exposar dades personals;
- les 18 files de `public.measurement` fins a una decisió explícita posterior;
- les views Meteo/ML inventariades;
- l'esquema, dades i ledger Prisma de Biblioteca;
- seqüències, constraints, FK, índexs i objectes no utilitzats directament per
  l'RC però inclosos al backup complet.

Els recomptes, rangs i detalls verificats són a `evidence/PR01-production-inventory.json`
i `evidence/PR03-restore-verification.json`.

## Regles de seguretat

Mai directament sobre producció:

- `docker compose down -v`;
- eliminar `tecnolord-apps_pgdata` o altres volums persistents;
- fer DROP/recreate de `meteo`;
- executar fixtures o migracions no provades;
- substituir la BD amb una còpia local buida;
- usar `git reset`, checkout o una altra neteja que esborri canvis existents;
- executar un `docker compose up` global sense revisar configuració i serveis;
- fer `ALTER DATABASE ... REFRESH COLLATION VERSION` sense una tasca específica
  provada sobre clon.

La futura migració ha de validar explícitament que el destí és `meteo_beta`.
Una fallada sobre la còpia es resol recreant-la des del restore pristine, no
reparant o reutilitzant `meteo_restore_test`.

## Consideracions de deploy

- El backend productiu executa el codi inclòs a la imatge i no té bind mount de
  codi.
- Caddy serveix el frontend des del bind mount
  `/home/deploy/tecnolord-apps/site` → `/srv`.
- Frontend i backend tenen mecanismes de desplegament diferents i s'han de
  versionar i validar conjuntament.
- `meteo-beta.tecnolord.cat` encara no existeix al Caddyfile; PR01 no va
  detectar cap col·lisió.
- Els cron d'Ecowitt i forecast són escriptors actius i s'han de coordinar al
  cutover. Les alertes també s'executen periòdicament.
- La configuració productiva és a `.env`; els secrets s'han de traslladar per
  un canal segur i mai al repositori.
- `docker compose config` va advertir de variables absents a l'entorn
  interactiu. No es pot regenerar el stack global a cegues.

## Riscos coneguts

- La BD productiva registra collation `2.41` amb runtime `2.31`; PostgreSQL
  emet `collation version mismatch`. No s'ha corregit en producció.
- El restore creat amb `template0` registra `2.31 / 2.31` i no presenta el
  mismatch.
- La imatge és PostGIS, però l'extensió PostGIS no estava activada dins
  `meteo`; PR04 n'ha de tractar la compatibilitat abans de crear geometries RC.
- El working tree productiu no era net: `logs/cron.log` i una migració Prisma
  de Biblioteca estaven modificats. No s'han de netejar ni sobreescriure.
- El backup PR02 és recuperable però continua al mateix Droplet. El cutover
  exigirà una còpia addicional fora del Droplet.
- El servidor observat té 1,9 GiB de RAM i sense swap; qualsevol beta paral·lela
  necessita una revisió de capacitat.

## Següent pas

`NEXT: PR04 — schema diff i pla de migració RC sobre un clon`

PR04 no autoritza encara crear `meteo_beta`, migrar, desplegar la beta ni
modificar DNS, Caddy o producció.
