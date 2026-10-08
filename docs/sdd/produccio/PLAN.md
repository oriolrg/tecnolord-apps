# PLAN — Runbook productiu MeteoLord

Baseline desplegada el 2026-10-01; estat reconciliat el 2026-10-04. Aquest
document no autoritza cap ordre contra producció.

## Inventari operatiu actual

- backend `tecnolord-apps-backend-1`, imatge
  `meteolord-backend-rc:321b8a5`;
- base productiva `meteo` i restauració protegida `meteo_restore_test`;
- PostgreSQL/PostGIS `postgis/postgis:16-3.4`;
- 30 estacions: `home / TecnoLord` i 29 Grafana administrades;
- 2 usuaris, 1 credencial i exactament 1 SUPERADMIN actiu i aprovat;
- connector Grafana intern al backend, sense accés directe del client;
- refresh Grafana cada cinc minuts amb `scripts/refresh-stations.sh` i cron
  `*/5 * * * *`;
- cron Ecowitt als minuts `00,15,30,45`, forecast al minut `10` de cada hora i
  alertes als minuts `3,8,13,...,58`.

Els contenidors `meteolord-frontend-prod-preview` i `meteolord-prod04-rc`
continuen temporalment en execució per decisió explícita. No són serveis
definitius ni s'han d'eliminar automàticament.

## Recreació exclusiva del backend actual

El compose base encara pot referenciar una imatge anterior. La recreació del
backend `321b8a5` requereix el compose base i l'overlay:

```sh
docker compose \
  -f /home/deploy/tecnolord-apps/docker-compose.yml \
  -f /home/deploy/backend-cutover-321b8a5.yml \
  up -d \
  --no-deps \
  --force-recreate \
  --pull never \
  --no-build \
  backend
```

No executar aquesta ordre com a part d'una tasca documental. Abans d'una
execució futura cal verificar que l'overlay, la imatge local i les variables
no sensibles coincideixen amb el [checkpoint](PROD-CHECKPOINT-2026-10-01.md).

## Gates post-recreació

1. backend saludable i health HTTP 200;
2. login SUPERADMIN;
3. catàleg amb TecnoLord i 29 Grafana;
4. selecció TecnoLord → Grafana → TecnoLord;
5. lectura Ecowitt real conserva `home / TecnoLord`;
6. 29 bindings i 29 snapshots Grafana;
7. errors upstream aïllats, sense dades creuades;
8. refresh periòdic de cinc minuts operatiu;
9. 0 mesures Grafana i 0 polítiques Grafana.

No fixar 24/5 com a resultat obligatori: és una font viva.

## Backup i rollback conceptual

El recovery point verificat és el dump i SHA-256 documentats al
[checkpoint](PROD-CHECKPOINT-2026-10-01.md#punt-de-recuperació-verificat).
La reversió d'aplicació ha de preservar PostgreSQL i les dades. Qualsevol
migració futura exigeix backup, restauració en clon, dry-run i gate propi.

PROD-01 és `COMPLETED / HISTORICAL`: cutover, dry-run físic V4 i cleanup dels
recursos descartables completats, amb evidències i backups preservats. No forma
part del runbook normal i no s'ha de repetir sobre `meteo`.

## Collation diferida

L'avís 2.41/2.31 no s'ha de barrejar amb tasques funcionals. No executar
`ALTER DATABASE meteo REFRESH COLLATION VERSION` fins que una tasca
específica acrediti backup, objectes/índexs afectats, prova en clon i
procediment de reversió.

## Accions prohibides

- `docker compose down -v`;
- DROP/recreate de `meteo` o PostgreSQL;
- fixtures o migracions no assajades a producció;
- reexecutar PROD-01 sobre la producció actual;
- tocar `meteo_restore_test`;
- recrear globalment l'stack;
- publicar Grafana per defecte;
- activar històric Grafana implícitament;
- exposar secrets o copiar el `.env` complet;
- substituir tota la carpeta `tecnolord-apps` amb una release;
- modificar retroactivament `321b8a5`.
