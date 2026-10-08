# DECISIONS — Continuació Grafana multiestació

Actualitzat: 2026-10-04.

## Decisions vigents

- UE-D02 continua protegint estacions PUBLIC/PRIVATE i totes les vies de
  lectura mitjançant una policy compartida.
- UE-D04 manté Grafana exclusivament al backend.
- UE-D05 manté l'històric opt-in per estació; el checkpoint no activa cap
  política Grafana.
- La cadència source/freshness de referència és 900 s i la resolució de query
  és 300 s. Aquests valors no creen per si sols un scheduler; el refresh
  periòdic operatiu cada cinc minuts és una decisió d'operació separada.
- Una estació Grafana nova continua PRIVATE/interna per defecte.
- Una font sense dada vàlida conserva identitat i últim snapshot bo, però mai
  rep dades d'una altra estació.

## Decisions obertes

### H-D01 — Abast d'accés per estació

**OPEN; es resol a H11A.** Cal decidir si el nivell «qualsevol usuari
autenticat» es representa reutilitzant el model actual, ampliant
`visibility` o amb una policy separada. No s'afegeix cap enum abans de
demostrar que `PUBLIC/PRIVATE`, propietat i membres no són suficients.

La decisió ha d'incloure una matriu única per current, selector, mapa i
històric. Fins llavors, totes les Grafana continuen restringides.

### H-D02 — Política de refresh complementari

**PARTIAL; es completa a H12A.** El scheduler periòdic cada cinc minuts ja és
operatiu i no es reobre en aquesta decisió. Continua obert si s'afegeix
refresh-if-stale/sota demanda a les lectures, i amb quina política. H12A ha de
fixar minimum interval, lease/dedupe, errors, 429, timeout i fallback sense
duplicar consultes ni convertir snapshots en històric.

### H-D03 — Vent Grafana

**OPEN tècnica; es resol a H13A.** No hi ha encara noms de mètrica, unitats ni
disponibilitat demostrats. Cap mapping queda autoritzat.

### H-D04 — Publicació del mapa

**PENDING H-D01.** El mapa reutilitzarà H09B i les ubicacions H03. No es
decidirà cap publicació d'una estació abans de tenir policy i drets coherents.

## Bloquejos conservats

- H05C pressió: unitat i tipus de pressió no demostrats.
- H05C pluja: unitat i tractament de resets no demostrats.
- Drets de redistribució pública Grafana: validar abans de qualsevol
  publicació; l'accés tècnic no els substitueix.
