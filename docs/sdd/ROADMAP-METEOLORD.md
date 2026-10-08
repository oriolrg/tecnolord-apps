# Roadmap MeteoLord després del checkpoint productiu

Actualitzat: 2026-10-04.

## Baseline

El [checkpoint productiu de 2026-10-01](produccio/PROD-CHECKPOINT-2026-10-01.md)
és PASS dins el seu abast. La release desplegada `321b8a5` és immutable.
Aquest roadmap no autoritza implementació, migració ni desplegament.

## Estat operatiu de partida

- producció usa `meteolord-backend-rc:321b8a5` sobre `meteo`;
- `meteo_restore_test` continua protegida;
- hi ha 30 estacions: `home / TecnoLord` pública i 29 Grafana administrades,
  privades per defecte;
- el connector Grafana és intern al backend i el refresh periòdic s'executa
  cada cinc minuts mitjançant `scripts/refresh-stations.sh` i cron;
- hi ha snapshots actuals Grafana, però 0 mesures d'històric Grafana i 0
  polítiques d'històric Grafana actives;
- el bootstrap SUPERADMIN és operatiu; hi ha 2 usuaris, 1 credencial i
  exactament 1 SUPERADMIN actiu i aprovat;
- l'alta pública continua parcial: el backend existeix, però producció respon
  HTTP 503 mentre no hi hagi adaptador de correu productiu;
- PROD-01 és `COMPLETED / HISTORICAL`, inclosos dry-run V4 i cleanup.

## Inventari consolidat

### EXISTING_DONE

- UE-T01–UE-T18: fase local usuaris/estacions, inclosa policy compartida,
  onboarding amb mail sintètic, mapa, connectors, snapshots i històric opt-in.
- H01–H10: Grafana multiestació local i release candidate.
- Checkpoint productiu: login SUPERADMIN, TecnoLord/Ecowitt, selector amb 29
  Grafana i snapshots actuals.
- Cutover productiu legacy → `321b8a5` executat satisfactòriament.
- PROD-01: dry-run físic V4 PASS, cleanup completat i evidències/backups
  preservats; no forma part del runbook normal.
- Refresh Grafana periòdic cada cinc minuts operatiu, amb errors aïllats per
  estació i sense activar històric.

### EXISTING_PENDING

- G06–G09 de qualitat/accessibilitat: auditoria manual WCAG 2.2 AA pendent;
  les comprovacions existents no equivalen a conformitat.
- Transport real de correu per completar l'alta pública.
- Visibilitat/permisos finals, mapa final, vent Grafana i
  refresh-if-stale/sota demanda.
- Experiència productiva pendent: favorits, estació predeterminada,
  comparacions, gràfiques i alertes.
- Administració productiva de persistència i polítiques d'històric
  configurables per estació; cap política Grafana està activa.

### EXISTING_BLOCKED

- H05C: pressió i pluja Grafana sense contracte suficient.
- Publicació/redistribució Grafana: condicionada als drets aplicables.

### NEW_PENDING_FROM_CHECKPOINT

- UE-T19: correu productiu i alta pública.
- H11A/H11B: visibilitat individual interna/autenticada/pública.
- H12A/H12B: política i implementació de refresh-if-stale/sota demanda sobre
  el refresh periòdic ja operatiu.
- H13A/H13B: discovery i integració de vent.
- H14: mapa productiu segons permisos.
- PROD-02: diagnòstic i política de cache mòbil.
- PROD-03: collation, diferida.

## Camí recomanat

### Bloc 1 — Recuperar funcionalitat existent

1. **UE-T19**: fer executable en producció el flux d'alta ja decidit, separant
   codi de la configuració/secret del transport.
2. **PROD-02 diagnòstic**: reproduir la versió antiga en mòbil i demostrar-ne
   la causa abans de modificar headers o assets. Pot avançar en paral·lel.

### Bloc 2 — Tancar la frontera d'accés

3. **H11A**: decidir el contracte de visibilitat autenticada.
4. **H11B**: implementar-lo de manera centralitzada i amb gate de no-leak.

Aquest bloc precedeix qualsevol publicació Grafana, mapa per rol i refresh
sota demanda exposat per una ruta de lectura.

### Bloc 3 — Dades actuals coherents

5. **H12A**: decidir refresh-if-stale/sota demanda, dedupe i fallback sense
   substituir el cron de cinc minuts.
6. **H12B**: implementar la política aprovada al backend sense historial.
7. **H13A** i després **H13B**: acreditar i integrar vent. H13A pot començar
   abans si es manté com a discovery read-only.

### Bloc 4 — Experiència geogràfica

8. **H14**: reutilitzar H09B i H03 per publicar el mapa correcte per rol,
   sense inventar ubicacions.

### Bloc 5 — Gates i hardening

9. Completar la validació mòbil de **PROD-02** després del canvi.
10. Auditoria manual WCAG G06–G09.
11. **PROD-03** només quan es programi una finestra pròpia amb clon i backup.

H05C no entra a la seqüència fins obtenir evidència nova. L'històric Grafana
continua desactivat fins una autorització separada. Favorits, estació
predeterminada, comparacions, gràfiques, alertes i administració productiva de
persistència continuen al backlog sense alterar l'ordre anterior; aquest
document encara no els assigna una seqüència nova.

## Primera tasca recomanada

**UE-T19 — Transport de correu productiu i alta pública.** És un defecte
observable d'una funcionalitat ja implementada i decidida. En paral·lel es
pot executar només el diagnòstic read-only/local de PROD-02. Després, H11A és
la primera decisió de producte necessària per ampliar l'accés a Grafana.

## Dependències resumides

```text
UE-T19 ───────────────────────────────→ alta pública operativa

H11A → H11B ─┬→ H12A → H12B
             └→ H14

H13A → H13B

PROD-02 diagnòstic → correcció → gate mòbil
PROD-03 (DEFERRED, fora del camí funcional)
H05C (BLOCKED per evidència)
```
