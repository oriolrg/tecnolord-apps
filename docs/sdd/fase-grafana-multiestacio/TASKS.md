# TASKS — Continuació Grafana multiestació

Actualitzat: 2026-10-04. H01–H10 continuen PASS. Aquest fitxer només ordena la
continuació posterior al checkpoint productiu de 2026-10-01.

## Inventari

### EXISTING_DONE

- H01–H10: discovery, mapping, ubicacions, mètriques, snapshots, importació,
  API/UI/mapa local, estadístiques 24 h, basemap i release candidate.
- Refresh Grafana periòdic operatiu cada cinc minuts mitjançant
  `scripts/refresh-stations.sh` i cron, amb fallades aïllades per estació.

### EXISTING_BLOCKED

- H05C: pressió i pluja canòniques. Continua bloquejada perquè la font no
  demostra unitat/tipus de pressió ni semàntica/reset fiable de pluja.

### NEW_PENDING_FROM_CHECKPOINT

- H11A/H11B: visibilitat individual per estació.
- H12A/H12B: política de refresh-if-stale/sota demanda sobre el scheduler
  periòdic ja operatiu.
- H13A/H13B: discovery i integració de vent.
- H14: mapa productiu coherent amb permisos.
- Administració/activació productiva de polítiques d'històric configurables
  per estació: PENDING, encara sense tasca seqüenciada i sense cap política
  Grafana activa.

L'alta productiva és UE-T19 i la cache mòbil és PROD-02; no es dupliquen aquí.

## Convenció comuna

Cap tasca pot exposar URL Grafana, datasource UID, PromQL, `external_id`,
payload upstream o secrets. Grafana continua exclusivament backend, PRIVATE
per defecte, sense històric i sense consultes directes del navegador.

## H11A — Contracte de visibilitat per estació

- **Estat:** READY; primera tasca Grafana recomanada.
- **Objectiu:** decidir el canvi mínim que permeti distingir accés
  SUPERADMIN/intern, autenticat i públic per estació.
- **Motivació:** `PUBLIC/PRIVATE` ja protegeix propietari/admin, però encara
  s'ha de demostrar si pot expressar un catàleg visible per qualsevol usuari
  autenticat sense propietat.
- **Dependències:** UE-D02, UE-T05, UE-T08, UE-T10, UE-T11 i checkpoint.
- **Fitxers probables:** `stationPolicy`, serveis de catàleg/mapa/current/
  history, esquema d'estacions i documentació de decisions.
- **Implementació prevista:** inspeccionar `visibility`,
  `membres_estacio`, permisos de catàleg i `public_view_config`; comparar
  reutilització, nou valor i policy separada; produir contracte, matriu
  d'accés i migració candidata si fos imprescindible. No implementar H11B.
- **Tests:** matriu visitant/usuari/propietari/SUPERADMIN per selector,
  current, mapa i històric; IDs alterats; no-leak entre estacions.
- **PASS:** una única opció justificada, default Grafana restrictiu, impacte
  de dades i reversió definits, cap decisió inventada.
- **Riscos/reversió:** una semàntica duplicada pot obrir vies laterals.
  Fail-closed i conservar `PRIVATE` fins a completar H11B.
- **Evidència:** decisió H-D01 a `DECISIONS.md` i matriu d'accés versionada.

## H11B — Implementar visibilitat i administració individual

- **Estat:** BLOCKED per H11A.
- **Objectiu:** aplicar el contracte decidit a totes les lectures i permetre
  que SUPERADMIN gestioni l'abast estació per estació.
- **Dependències:** H11A PASS.
- **Fitxers probables:** migració additiva si H11A l'exigeix, policy/service,
  rutes admin, compte, Meteo i mapa.
- **Implementació prevista:** canvi mínim, revisió optimista/auditoria en
  mutacions i policy compartida per current, catàleg, mapa i històric.
- **Tests:** matriu completa HTTP/integració/E2E, canvi de visibilitat,
  invalidació de cache i revocació immediata, regressió Ecowitt/Grafana.
- **PASS:** cap endpoint revela una estació fora del seu abast; Grafana nova
  continua restringida; SUPERADMIN conserva accés total.
- **Riscos/reversió:** regressió d'autorització. Reversió funcional:
  restringir totes les Grafana a intern, sense eliminar dades.
- **Evidència:** QA H11B i gate de no-leak.

## H12A — Decidir política de refresh-if-stale/sota demanda

- **Estat:** READY després d'H11A; no modifica el cron operatiu.
- **Objectiu:** decidir si una lectura pot provocar refresh quan el snapshot és
  stale o sota demanda, sense una consulta upstream per cada render.
- **Motivació:** el refresh periòdic cada cinc minuts ja és operatiu, però la
  lectura normal no implementa refresh-if-stale ni una acció sota demanda.
- **Dependències:** contracte de cadence/freshness (900 s modal, amb fonts
  observades de 600/1200 s), leases existents i H11A per autorització.
- **Fitxers probables:** `sourceCadence`, snapshot/adaptador Grafana,
  station read i documentació.
- **Implementació prevista:** comparar refresh síncron stale,
  stale-while-revalidate i on-demand sobre el scheduler existent; definir
  minimum interval, dedupe, timeout/429, últim snapshot bo i estat d'error.
- **Tests:** rellotge als llindars, concurrència, lease, timeout, 429, errors,
  camps parcials i absència de peticions directes del navegador.
- **PASS:** decisió H-D02 versionada, cost/concurrència explícits i zero
  activació d'històric.
- **Riscos/reversió:** thundering herd o latència UI. El mode segur és servir
  l'últim snapshot i conservar només el refresh periòdic existent.
- **Evidència:** decisió, diagrama de seqüència i pressupost de consultes.

## H12B — Implementar refresh-if-stale/sota demanda segur

- **Estat:** BLOCKED per H12A i H11B.
- **Objectiu:** implementar la política complementària aprovada exclusivament
  al backend, sense substituir el cron de cinc minuts.
- **Dependències:** H12A PASS i policy d'accés H11B.
- **Fitxers probables:** serveis de snapshot/Grafana, rutes current, config i
  tests de concurrència.
- **Implementació prevista:** freshness, lease/dedupe per estació, fallback a
  snapshot bo i resposta sanejada.
- **Tests:** càrrega concurrent, exactament una consulta elegible, snapshot
  fresh/stale/obsolete, font fallida i regressió Ecowitt.
- **PASS:** dades recents quan és raonable, límit de consultes respectat, cap
  egress del navegador i cap mesura històrica Grafana.
- **Riscos/reversió:** desactivar el trigger on-demand conservant snapshots.
- **Evidència:** QA H12B amb comptadors de consulta i timestamps.

## H13A — Discovery real de vent Grafana

- **Estat:** READY; independent d'H12B.
- **Objectiu:** demostrar sèrie/camp, unitat, timestamp i disponibilitat de
  velocitat i direcció del vent.
- **Dependències:** H04/H05A i accés Grafana backend ja validat.
- **Fitxers probables:** només evidència i documentació.
- **Implementació prevista:** discovery acotat sobre diverses estacions,
  incloent sensor sense vent, zero, null i unitat inesperada.
- **Tests:** comparació font/evidència; cap mapping en aquesta tasca.
- **PASS:** contracte demostrable per cada camp o resultat BLOCKED explícit.
- **Riscos/reversió:** N/A; tasca read-only, sense inventar mètriques/unitats.
- **Evidència:** inventari sanejat H13A.

## H13B — Integrar vent canònic

- **Estat:** BLOCKED per H13A.
- **Objectiu:** mapar vent demostrat als camps canònics que ja usa Ecowitt.
- **Dependències:** H13A PASS per almenys un camp.
- **Fitxers probables:** adaptador Grafana, snapshot, DTO/API i targeta vent.
- **Implementació prevista:** reutilitzar model existent; absència és `null`
  i 0 és vàlid; no crear un model paral·lel.
- **Tests:** velocitat, direcció, 0, null, sensor absent, unitat inesperada,
  timestamp, selecció entre estacions i regressió Ecowitt.
- **PASS:** binding real per estació, UI sense dades heretades i cap canvi
  d'històric.
- **Riscos/reversió:** desactivar mappings nous i conservar snapshot anterior.
- **Evidència:** QA H13B amb comparació directa.

## H14 — Mapa productiu segons permisos i ubicacions acreditades

- **Estat:** BLOCKED per H11B.
- **Objectiu:** portar al producte el mapa ja existent, filtrat per policy,
  sense crear una segona implementació.
- **Dependències:** H09B, H11B i evidència H03.
- **Fitxers probables:** `/meteo/mapa/`, endpoints public/me/admin, policy i
  runtime config.
- **Implementació prevista:** reutilitzar mapa/capes actuals; TecnoLord i
  Grafana només quan tenen coordenades acreditades i accés; mantenir
  `private_geometry` separada de `public_geometry`.
- **Tests:** visitant/autenticat/SUPERADMIN, estació sense coordenades,
  generalització, revocació, bounds/selecció i absència de leak.
- **PASS:** cada actor veu exactament el seu conjunt; cap coordenada inventada
  i cap geometria privada exposada.
- **Riscos/reversió:** desactivar la capa de dades conservant el basemap.
- **Evidència:** QA H14 amb recompte per rol i network del navegador.

## Ordre dins la fase

`H11A → H11B → (H12A → H12B)` i `H11B → H14`.
`H13A → H13B` pot avançar en paral·lel després del checkpoint. H05C continua
fora d'aquest camí fins que aparegui evidència nova. L'activació productiva de
polítiques d'històric continua fora de la seqüència fins que rebi una tasca i
autorització explícites.
