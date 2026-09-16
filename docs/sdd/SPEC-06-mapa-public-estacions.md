📄 SPEC-06 v0.8 — Mapa públic d'estacions de MeteoLord
Versió: 0.8
Estat: CANDIDATA A QA DOCUMENTAL
Data: 2026-09-16
SPEC paraigua: SPEC-00 v0.5 — disponible; DCF-06 v1.2 la reconcilia
SPEC base de fase: SPEC-10 v0.3 — fase A aprovada
Descoberta relacionada: SPIKE-04 v1.1 — Grafana/i2CAT, viable amb condicions
Resolucions DCF: DCF-06 v1.1 + v1.2, DCF-04 v1.0 (04A RESOLT, 04B PENDENT), DCF-08 v1.0, DCF-11 v1.0
QA prèvia: QA-06 v1.0, v2.0, v3.0 — resolta a v0.8
Naturalesa: reconstrucció refinada; no autoritza PLAN-06 ni implementació.

0. Autoritat, fonts i límits
Aquesta especificació defineix el comportament públic desitjat del mapa d'estacions. No selecciona motor cartogràfic, llibreria de gràfiques, sistema de tiles, arquitectura, base de dades ni topologia. Aquestes decisions corresponen a un futur PLAN-06, després de QA documental i aprovació explícita.

Relació amb SPEC-00 v0.5: ara disponible íntegrament. DCF-06 v1.2
reconcilia el gate de publicació de §6.1 amb SPEC-00 (§2.2, RF-03):
la validació és automàtica i l'escalat humà és excepcional.

HA DE, NO POT i BLOQUEJA són normatius.

PENDENT requereix una decisió abans del PLAN-06.

Marca	Significat
FET-REPO	fet confirmat en documentació o evidència versionada
REQ-00	requisit atribuït a SPEC-00 pendent de contrast íntegre
REQ-06	requisit propi d'aquesta SPEC
SPIKE-04	condició de la descoberta Grafana/i2CAT
DCF-06	resolució DCF-02, DCF-03, DCF-07, DCF-09
DCF-04	resolució DCF-04A (04B delegat a SPEC-08)
DCF-08	resolució de l'àmbit geogràfic i ubicació
DCF-11	resolució de la política de duplicats
PENDENT	decisió oberta que bloqueja el seu àmbit
1. Objectiu
Definir un mapa públic que permeti a un visitant no autenticat:

consultar únicament estacions i camps autoritzats per a publicació;

identificar una estació i el seu estat global derivat de quatre eixos;

veure un resum actual i accedir a una fitxa per URL directa;

usar una alternativa textual funcionalment equivalent al mapa;

filtrar o cercar només elements del catàleg públic;

no rebre, deduir ni enumerar dades INTERNAL_ONLY.

2. Abast i exclusions
Inclou: mapa amb marcadors públics, resum, fitxa, llista alternativa, filtres/cerca, proves negatives de la frontera INTERNAL_ONLY, validació local amb fixtures sintètiques i historials governats per history_profile.

Exclou: identitat, sessions, rols i fluxos de propietari; alta o aprovació d'estacions; ingesta, retenció física i adaptadors; Grafana/i2CAT al mapa públic; canvis d'esquema, infraestructura o desplegament; dades privades i promoció.

Consumeix però no implementa: el procés de consentiment i publicació d'estacions correspon a SPEC-01 i SPEC-02. SPEC-06 consumeix: publicacio_estacio, publicacio_sensor, publicacio_camp, precisio_autoritzada, publicacio_revocada, catalog_version, retention_policy_ref i canonical_station_id.

3. Model de classificació pública
3.1 Classificació a tres nivells
Nivell estació: PUBLIC_ALLOWED | INTERNAL_ONLY
Nivell sensor: PUBLIC_ALLOWED | INTERNAL_ONLY
Nivell camp: PUBLIC_ALLOWED | INTERNAL_ONLY

3.2 Regla de visibilitat efectiva
text
PUBLIC(field) =
    source.publication_allowed
    AND station.classification == PUBLIC_ALLOWED
    AND sensor.classification == PUBLIC_ALLOWED
    AND field.classification == PUBLIC_ALLOWED
    AND publication_gate == PASSED
    AND quality_gate != NO_PUBLICABLE
Quan no existeixi el nivell sensor, el gate és estructuralment no aplicable però mai converteix un camp no classificat en públic.

Qualsevol resultat false, null, error o contracte desconegut → no públic.

Aquesta regla s'aplica al backend.

3.3 Model de dades (conceptual)
text
Estacio
├── publicacio: PUBLIC_ALLOWED | INTERNAL_ONLY
├── public_geometry: WGS84 GeoJSON [lon, lat]
├── privacy_radius_m: enter (>0)
├── geo_publication: APPROXIMATED | EXACT | HIDDEN
├── geo_policy_version: string
├── duplicate_group_id: string|null
├── canonical_station_id: string|null
├── sensors: Map<SensorId, SensorPublicacio>
│   └── publicacio: PUBLIC_ALLOWED | INTERNAL_ONLY
│   └── camps: Map<CampId, CampPublicacio>
│       ├── publicacio: PUBLIC_ALLOWED | INTERNAL_ONLY
│       └── history_profile_id: string|null
└── publicacio_revocada: boolean
3.4 Fail-closed per defecte
Classificació absent, desconeguda, caducada, inconsistent o no verificable → INTERNAL_ONLY.

3.5 Catalog version
catalog_version (monòton) canvia amb qualsevol modificació que alteri el conjunt o contingut públic:

publicació o despublicació d'estació;

canvi de classificació (estació/sensor/camp);

canvi de public_geometry, privacy_radius_m, geo_publication;

canvi de history_profile_id associat a un camp;

canvi de duplicate_group_id o canonical_station_id;

canvi de política que modifiqui la visibilitat efectiva.

L'API pública HA DE retornar el catalog_version. El frontend HA DE verificar-lo abans de reutilitzar cache. Una cache amb catalog_version anterior no és autoritativa.

3.6 Sensors múltiples
Una estació pot tenir sensors amb classificacions diferents. L'autorització pública de l'estació NO implica l'autorització automàtica de tots els sensors.

3.7 Identitat de duplicats
Veure §6.7.

4. Model d'estats multidimensionals
4.1 Quatre eixos ortogonals
Eix 1 — Publicació: PUBLIC_ALLOWED | INTERNAL_ONLY

Eix 2 — Disponibilitat (frescor): FRESCA | SENSE_DADES_RECENTS | OBSOLETA

Eix 3 — Qualitat: OK | SOSPITOSA | NO_PUBLICABLE

Eix 4 — Workflow de revisió: NORMAL | EN_REVISIO | REVISADA

4.2 Llindars i comportament — tancat normativament
Definicions temporals:

text
freshness_limit   = max(30 minuts, 3 × expected_update_interval)
obsolete_limit    = max(24 hores, 12 × expected_update_interval)
Si expected_update_interval no està definit:

freshness_limit = 30 minuts;

obsolete_limit = 24 hores;

la mesura NO POT considerar-se actual fiable.

Classificació per edat:

text
age <= freshness_limit                → FRESCA
freshness_limit < age <= obsolete_limit → SENSE_DADES_RECENTS
age > obsolete_limit                   → OBSOLETA
Comportament públic per estat:

Estat	Visible al mapa?	Valors actuals?	Indicador
FRESCA	SÍ	SÍ	cap
SENSE_DADES_RECENTS	SÍ	NO (només observed_at i valor històric)	"Sense dades recents"
OBSOLETA	SÍ	NO	"Dada obsoleta"
SOSPITOSA (qualitat)	SÍ	Camps afectats marcats "no fiable"; **no s'oculten**	"Dada sospitosa"
EN_REVISIO (workflow)	SÍ	Mesures sota revisió NO es publiquen	"En revisió"
NO_PUBLICABLE (qualitat)	NO	—	—

**Regla normativa única per a SOSPITOSA:** una estació `SOSPITOSA`
roman visible amb l'indicador "Dada sospitosa". Els camps afectats es
mostren amb marca "no fiable", **no s'oculten**. Aquesta és l'única
semàntica admesa; no és una decisió del PLAN-06.

Regla normativa explícita: una estació OBSOLETA continua sent visible al mapa amb l'indicador corresponent. Una estació EN_REVISIO continua sent visible amb l'indicador corresponent. Aquest comportament és normatiu i no pot ser canviat pel PLAN-06 sense modificar aquesta SPEC.

Justificació: eliminar una estació del mapa quan perd dades recents és pitjor per a l'usuari final que mostrar-la amb un indicador clar. La NO_PUBLICABLE per qualitat sí que l'elimina, perquè les dades són invalidades.

4.3 Taula resum
Situació	Visible	Valors actuals	Indicador
FRESCA + OK + NORMAL	SÍ	SÍ	—
SENSE_DADES_RECENTS	SÍ	NO	"Sense dades recents"
OBSOLETA	SÍ	NO	"Dada obsoleta"
SOSPITOSA	SÍ	parcial	"Dada sospitosa"
EN_REVISIO	SÍ	parcial	"En revisió"
NO_PUBLICABLE	NO	NO	—
INTERNAL_ONLY	NO	NO	—
4.4 DEFECT-01 com a condició de camp
DEFECT_01_AFFECTED NO és un estat global. És una condició aplicada a camps individuals.

Els camps afectats es tracten com INTERNAL_ONLY fins que la seva semàntica sigui validada. Exemple:

text
station.status = FRESCA + OK + NORMAL
temperature = PUBLIC_ALLOWED
humidity    = PUBLIC_ALLOWED
rain        = DEFECT_01_AFFECTED → INTERNAL_ONLY
L'estació continua visible; rain no apareix a cap superfície pública ni historial ni agregat.

4.5 Separació de responsabilitats
Backend: manté els quatre eixos i les condicions de camp.

API pública: retorna els eixos.

Frontend: deriva l'estat presentable i el mostra segons §4.2.

5. Frontera de publicació i INTERNAL_ONLY
5.1 Principi fail-closed
Tota estació, sensor o camp sense classificació pública explícita és INTERNAL_ONLY. La decisió és autoritativa al backend.

5.2 Superfícies cobertes
Marcadors, llista, modal, fitxa, cerca, filtres, comptadors, agregats, API pública, cache, logs, errors, sitemap i metadades.

5.3 Fonts
Font	Estat públic	Condició
Fixtures sintètiques	PUBLIC_ALLOWED	Exclusivament MAP-A
Ecowitt d'usuari	PENDENT	Elegible després de DCF-09
Camps DEFECT-01	INTERNAL_ONLY	Fins a validació
ACA/hidrologia	INTERNAL_ONLY	Fins a DCF-10
Open-Meteo	INTERNAL_ONLY	Fins a DCF-10
Grafana/i2CAT	INTERNAL_ONLY	Durant tota SPEC-06
5.4 Revocació
La retirada del consentiment o despublicació administrativa HA DE:

canviar l'estat autoritatiu a no públic;

impedir noves respostes de l'API pública;

incrementar catalog_version;

invalidar mapa i cerca;

invalidar resum i fitxa;

purgar caches sota control de MeteoLord;

retirar l'URL del sitemap;

registrar l'operació en auditoria interna.

Objectiu operatiu: invalidació de totes les caches sota control de MeteoLord en ≤ 60 segons.

Caches no controlades: còpies obtingudes per tercers o navegadors offline no són responsabilitat verificable de MeteoLord. El 404 de l'origin i la invalidació activa són la defensa; la seva propagació a còpies externes no es pot garantir.

5.5 Eliminació de compte
L'eliminació de compte (SPEC-01) revoca automàticament totes les estacions públiques associades. No es restaura si es crea un compte nou.

5.6 No enumeració
Consulta pública a un public_station_id no visible → 404 Not Found sense distingir causa.

5.7 Despublicació vs. supressió
Despublicar ≠ eliminar totes les dades internes. La supressió es gestiona via contracte de privacitat (SPEC-01/SPEC-08).

6. Contractes
6.1 Catàleg i publicació — RESOLT via DCF-06, DCF-11 (i refinament de SPEC-00)
Relació amb SPEC-00: SPEC-00 §2.2 i RF-03 diuen que un usuari aprovat publica directament sense segona aprovació administrativa. DCF-06 introdueix un gate de publicació explícit (publication_gate). Aquest document refina SPEC-00 així:

El gate de publicació és un check automàtic al backend que s'avalua quan l'usuari fa opt-in i totes les condicions es compleixen.

El gate inclou: classificació, consentiment (si escau), política de precisió geogràfica, perfil de qualitat, procedència, llicència/base jurídica.

El gate no requereix intervenció humana quan totes les condicions passen.

Un capability PUBLICATION_APPROVER (SPEC-09) intervé només quan el gate automàtic no es pot resoldre (p. ex. llicència ambigua).

Aquesta refinació deixa SPEC-00 funcionalment intacte per a l'usuari final (l'usuari aprovat publica directament) i afegeix un gate tècnic verificable. S'ha de reflectir en una futura revisió de SPEC-00; aquesta SPEC ho documenta com a refinament vàlid mentre SPEC-00 continuï com a candidata.

Cada entrada del catàleg HA DE definir:

text
public_station_id, source, sensor, field
publication_class, classification_version, classified_at, classified_by
provenance, quality_profile_id
geo_precision_policy, geo_publication, public_geometry, privacy_radius_m, geo_policy_version
history_profile_id
consent_required, licence_or_legal_basis_ref
duplicate_group_id, canonical_station_id
public_station_id HA DE ser estable i opac. NO POT reutilitzar identificadors interns d'usuari, dispositiu, proveïdor, serial, MAC.

Conjunt públic mínim: identificador públic, nom públic, ubicació generalitzada, estat, observed_at, temperatura i humitat (quan publicables), procedència de la font.

INTERNAL_ONLY per defecte: coordenades precises originals, identificadors d'usuari, MAC/serial/device ID, credencials, tokens, URLs internes, payloads crus, errors interns, camps diagnòstics, metadades no aprovades, sensors no classificats, camps no classificats.

6.2 Qualitat de dades — RESOLT via DCF-06
Rellotge: UTC del servidor, sincronitzat via NTP.

quality_profile_id versionat per font.

Llindars temporals: veure §4.2.

Detecció de sospita:

observed_at > server_now + 5 minuts → SOSPITOSA;

valor no finit quan se n'espera un de numèric;

unitat incompatible;

humitat fora de [0, 100];

timestamp inconsistent;

valor fora del rang declarat al quality_profile;

variació superior al màxim declarat;

error explícit de l'adaptador.

Cada camp publicable HA DE declarar al seu perfil: unit, valid_range, expected_update_interval, max_rate_of_change, validation_rules.

Nuls i zeros: null = desconegut/no disponible. NO es converteix en zero. Un valor 0 només és real si el contracte del camp ho confirma.

DEFECT-01: veure §4.4.

Transicions: SENSE_DADES_RECENTS → FRESCA si arriba dada fresca. EN_REVISIO si acumula 3 SOSPITOSA de 5 (substituïble per quality_profile). Sortir requereix DATA_REVIEWER (SPEC-01).

Auditoria interna: timestamp, previous_state, new_state, triggered_rule, quality_profile_id, quality_profile_version. INTERNAL_ONLY.

6.3 Historials i agregació — RESOLT via DCF-04A
history_profile versionat per camp:

text
history_profile_id
history_enabled: bool
profile_version: string

default_period: '24h' | '7d' | '30d'
allowed_periods: ['24h', '7d', '30d', 'custom']
max_query_window: 30d

resolution_policy:
  '24h' -> 'raw' | 'hourly' | 'daily'
  '7d'  -> 'raw' | 'hourly' | 'daily'
  '30d' -> 'raw' | 'hourly' | 'daily'

custom_resolution_rules:
  # Llista ordenada de {max_window_hours, resolution}. La primera regla
  # el màxim de la qual sigui >= amplada del rang sol·licitat s'aplica.
  # Si cap regla cobreix el rang → es rebutja amb error clar.
  - { max_window_hours: 24,  resolution: 'raw' | 'hourly' | 'daily' }
  - { max_window_hours: 168, resolution: 'raw' | 'hourly' | 'daily' }   # 7d
  - { max_window_hours: 720, resolution: 'raw' | 'hourly' | 'daily' }   # 30d

`custom_resolution_rules` és normativa i determinista. Cada
`history_profile` HA DE declarar-la si admet `custom`. Si un perfil no
declara `custom_resolution_rules`, el període `custom` es rebutja.

La resolució retornada pel backend HA DE ser exactament la declarada
per la primera regla que cobreixi l'amplada del rang sol·licitat. No
s'admet interpolació ni "regla de rang" no explícita.

raw_history_allowed: bool
allowed_resolutions: ['raw', 'hourly', 'daily']

aggregation_method: 'mean' | 'sum' | 'min' | 'max' | 'last' | 'circular' | 'counter_diff'
pre_aggregation_transform: string|null

statistics: ['min', 'max', 'mean'] | ['total'] | ...
missing_data_policy: 'null' | 'partial'
min_coverage_policy: 0.8

timezone_policy: 'station' | 'UTC'

retention_policy_ref: string|null
max_points_policy: int
Regla fail-closed:

text
history_profile absent/desconegut/inconsistent
→ historial del camp no publicable
resolution_policy és normativa. El backend HA DE retornar la resolució
declarada pel perfil per al període sol·licitat. Els períodes no coberts
es rebutgen amb error clar. El període custom només és vàlid segons
custom_resolution_rules.

Contracte públic:

text
HISTORY_PUBLIC(field) =
    station == PUBLIC_ALLOWED
    AND sensor == PUBLIC_ALLOWED
    AND field == PUBLIC_ALLOWED
    AND history_profile.history_enabled == true
    AND publication gates satisfied
    AND quality gates satisfied
    AND field NOT DEFECT_01_AFFECTED
    AND retention_policy_ref valid (per a dades reals)
Períodes MVP: 24h (per defecte), 7d, 30d, personalitzat (màxim 30 dies).

query window != retention period explícitament.

Agregació per camp i semàntica:

Magnitud	Operació
temperatura, humitat, pressió	mean/min/max
nivell, cabal	mean/min/max/last
precipitació incremental	sum
ratxa de vent	max
direcció del vent	circular
comptador acumulatiu	counter_diff
Dades absents: no interpolació, no zero, no carry-forward. n_valid, n_expected, coverage. n_valid == 0 → null.

Backend autoritatiu. Ordre normatiu:

text
observacions → filtre PUBLIC_ALLOWED → qualitat → exclusió DEFECT-01
→ agregació → estadístiques → API pública
Un agregat derivat de dades INTERNAL_ONLY no és publicable.

Zona horària: UTC autoritatiu; presentació amb zona de l'estació o UTC.

Casos especials:

Nova sense historial: missatge informatiu, no zeros ni extrapolació.

Inactiva: historial anterior visible mentre estigui retingut i PUBLIC_ALLOWED; no extrapolar.

Forats: missing != 0, != last-value, != interpolated. Gràfica perceptible, taula amb "sense dada", coverage explícit.

DEFECT-01: camps afectats exclosos d'historial, agregats, estadístiques, derivats, cache pública. Corregir el parser avui NO valida l'historial antic.

Retenció — DCF-04B PENDENT SPEC-08: sense retention_policy_ref, historial real no publicable.

6.4 Cartografia i requests — RESOLT via DCF-07
Criteris d'admissibilitat (no selecció de motor):

Àmbit	Contracte
Egress	El navegador NO POT contactar proveïdors de tercers directament
Origins	Només orígens controlats per MeteoLord i autoritzats per CSP
Tiles/estils/fonts	Des d'infraestructura controlada o proxy/cache
Llicència	Ha de permetre l'ús, atribució i mecanisme
Secrets	Cap secret al navegador
Privacitat	Sense tracking/fingerprinting/cookies de tercers
CSP	No pot requerir unsafe-eval
Accessibilitat	Interaccions per teclat; llista textual obligatòria
Degradació	Error cartogràfic no inutilitza llista, cerca o fitxa
Ubicació	Ha d'admetre ubicacions generalitzades
Testing	MAP-A determinista sense dependència externa
Observabilitat	Errors públics sense coordenades privades ni IDs interns
Rendiment	Ha de superar el benchmark de RNF-MAP-01
Proveïdor amb requests directes des del navegador o que impedeixi el control/proxy/cache → NO ELEGIBLE.

Fallback entre fonts de tiles sota control de MeteoLord; sense saltar la restricció d'orígens.

6.5 Àmbit geogràfic i ubicació — RESOLT via DCF-08
Àmbit: derivat del catàleg públic, sense frontera política fixa.

text
initial_extent = bounds(public_geometry of filtered MAP_VISIBLE stations)
Sense estacions → missatge informatiu (RF-MAP-13).

Geometria pública:

text
private_geometry
      ↓ geo_precision_policy
public_geometry + privacy_radius_m + geo_policy_version
Generalització autoritativa al backend. Algoritme estable (no punts aleatoris per request).

Política de precisió:

Tipus	Default	Configurable
MeteoLord pròpia	aproximada 100 m	exacta amb aprovació
Ecowitt usuari	aproximada 1 km	1/5/10 km o ocultar
ACA (després DCF-10)	100 m	exacta si contracte
Grafana/i2CAT	INTERNAL_ONLY	—
100 m i 1 km són política MeteoLord, no llindars GDPR.

Geolocalització del visitant:

OFF per defecte;

acció explícita;

permís del navegador requerit;

no s'envia al backend;

no es persisteix;

sense analytics;

funcionalitat completa si es denega.

Viewport:

text
viewport = optimització/presentació
viewport != autorització
viewport != filtre implícit
Contracte geoespacial: WGS 84 / GeoJSON [longitude, latitude], graus decimals, 1.2345 (no 1,2345).

Cerca MVP: nom públic, municipi/localitat, altres noms geogràfics públics. Fora: adreça, geocodificació externa, coordenada arbitrària.

6.6 Cache i invalidació — RESOLT via DCF-06
Veure §3.5 i §5.4. La despublicació té prioritat sobre la cache.

6.7 Duplicats i identitat — RESOLT via DCF-11
Tres conceptes: SAME_STATION, NEARBY, VISUAL_GROUP.

Un duplicat és dos o més registres que representen la mateixa estació. NO és suficient: mateixa coordenada, edifici, propietari, nom, proximitat o variables.

Cap llindar espacial universal confirma duplicació. La proximitat només genera CANDIDATE.

Evidència per SAME_STATION: identitat autoritativa (mateixa font + external_station_id immutable), mapping explícit o revisió administrativa (STATION_IDENTITY_REVIEWER, compatible amb SUPERADMIN).

Regla pública: PUBLIC_REPRESENTATION(group) = canonical_station. Aliases no apareixen com a entitats independents.

NO es fusionen observacions ni historials. La canònica mostra només les seves dades.

INTERNAL_ONLY fora de càlculs públics. EN_REVISIO no provoca canvi de canònica.

Despublicació de la canònica: NO fallback automàtic. Promoció d'alias requereix gates propis i aprovació.

Recanonicalització: incrementa catalog_version, invalida caches, actualitza cerca, sitemap i API.

Auditoria obligatòria (INTERNAL_ONLY): duplicate_group_id, member_station_ids, previous_relation, new_relation, canonical_station_id, decision_basis, actor, timestamp, decision_version, reason.

7. Requisits funcionals
ID	Requisit	Traça
RF-MAP-01	El mapa HA DE mostrar només estacions amb publicacio_estacio == PUBLIC_ALLOWED.	REQ-00 / SPIKE-04
RF-MAP-02	Cada marcador HA DE comunicar identitat pública, estat presentable i resum autoritzat.	REQ-00 / REQ-06
RF-MAP-03	Les operacions de mapa HAN DE tenir equivalent de teclat.	REQ-06
RF-MAP-04	El mapa HA DE mostrar data/hora de la informació presentada.	REQ-06
RF-MAP-05	El resum (modal) HA DE mostrar el conjunt públic mínim definit a §6.1 i el resum específic definit pel catàleg per al tipus d'estació.	REQ-06 (correcció QA-06-12)
RF-MAP-06	La fitxa HA DE tenir URL directa i estable, i HA DE mostrar el conjunt públic mínim (§6.1), el contracte específic per tipus i l'historial disponible.	REQ-00
RF-MAP-07	La fitxa HA DE respectar la mateixa frontera pública que el mapa.	SPIKE-04
RF-MAP-08	HA D'existir una llista textual que mostri totes les estacions que passen els filtres actius, independentment del viewport.	REQ-00 / REQ-06
RF-MAP-09	Filtres i cerca NO PODEN enumerar elements INTERNAL_ONLY.	SPIKE-04
RF-MAP-10	L'actualització automàtica HA DE poder-se pausar o desactivar.	REQ-06
RF-MAP-11	La despublicació HA DE retirar l'element de totes les superfícies públiques i invalidar les caches sota control de MeteoLord en ≤ 60 s.	DCF-06
RF-MAP-12	Un camp sense classificació pública NO POT aparèixer públicament.	SPIKE-04 / DCF-06
RF-MAP-13	Sense estacions públiques, el mapa HA DE mostrar un missatge informatiu, no un mapa buit.	REQ-06
RF-MAP-14	Durant la càrrega inicial, HA DE mostrar un indicador d'estat.	REQ-06
RF-MAP-15	Si l'API falla, la llista alternativa HA DE romandre funcional amb dades de cache verificades contra catalog_version o mostrar un error clar.	DCF-06
RF-MAP-16	El catàleg HA DE definir una política per a estacions duplicades o properes (§6.7).	DCF-11
RF-MAP-17	La interfície HA D'estar disponible en català.	REQ-06
RF-MAP-18	El sitemap públic HA D'incloure només les URL de fitxes públiques.	REQ-06
RF-MAP-19	Les fitxes d'estacions INTERNAL_ONLY NO PODEN aparèixer al sitemap.	REQ-06
RF-MAP-20	El frontend HA DE verificar el catalog_version abans de mostrar dades de cache.	DCF-06
RF-MAP-21	Si no es pot verificar el catalog_version, el frontend HA DE mostrar avís clar i no mostrar dades que poguessin estar despublicades.	DCF-06
RF-MAP-22	Una consulta a un public_station_id no visible HA DE respondre 404 Not Found sense distingir causa.	DCF-06
RF-MAP-23	L'API pública HA DE retornar el catalog_version corresponent.	DCF-06
RF-MAP-24	L'eliminació de compte revoca automàticament les estacions públiques.	DCF-06
RF-MAP-25	Els camps DEFECT-01 NO PODEN aparèixer en cap superfície pública.	DCF-06
RF-MAP-26	El viewport inicial HA DE contenir totes les estacions MAP_VISIBLE.	DCF-08
RF-MAP-27	La geometria pública HA DE ser derivada al backend; private_geometry NO POT arribar al frontend.	DCF-08
RF-MAP-28	Clusters, comptadors i cerques espacials només PODEN utilitzar estacions MAP_VISIBLE.	DCF-08
RF-MAP-29	La geolocalització del visitant només POT activar-se explícitament.	DCF-08
RF-MAP-30	La ubicació del visitant NO POT persistir-se ni enviar-se al backend.	DCF-08
RF-MAP-31	Una estació sense public_geometry vàlida NO POT aparèixer al mapa públic.	DCF-08
RF-MAP-32	Canvi de precisió pública HA D'incrementar catalog_version i invalidar caches.	DCF-08
RF-MAP-33	Una ubicació aproximada HA DE comunicar textualment que no és exacta.	DCF-08
RF-MAP-34	Una relació de duplicació NO POT confirmar-se exclusivament per proximitat, nom, propietari o coordenades.	DCF-11
RF-MAP-35	Cada grup SAME_STATION HA DE tenir exactament una canonical_station_id.	DCF-11
RF-MAP-36	Només la canònica POT aparèixer com a entitat independent.	DCF-11
RF-MAP-37	La deduplicació NO POT fusionar observacions, historials ni camps de fonts diferents.	DCF-11
RF-MAP-38	Els registres INTERNAL_ONLY NO PODEN participar en càlculs públics de duplicació.	DCF-11
RF-MAP-39	Un DUPLICATE_CANDIDATE NO POT ocultar ni modificar una estació pública fins a confirmació.	DCF-11
RF-MAP-40	La despublicació de la canònica NO POT provocar fallback automàtic.	DCF-11
RF-MAP-41	Canvis de relació o canònica HAN D'incrementar catalog_version.	DCF-11
RF-MAP-42	L'historial públic es governa via history_profile versionat per camp.	DCF-04A
RF-MAP-43	L'agregació pública autoritativa HA DE fer-se al backend després de classificació, qualitat i exclusió DEFECT-01.	DCF-04A
RF-MAP-44	Les dades absents NO s'interpolen ni es converteixen en zero.	DCF-04A
RF-MAP-45	El backend HA DE retornar la resolució declarada a resolution_policy per al període sol·licitat; períodes no coberts es rebutgen amb error clar.	DCF-04A (resol QA-06-10)
RF-MAP-46	Una estació OBSOLETA HA DE romandre visible amb l'indicador "dada obsoleta"; una estació EN_REVISIO HA DE romandre visible amb l'indicador "en revisió".	§4.2 (resol QA-06-09)
RF-MAP-47	El backend HA DE rebutjar el període `custom` quan el `history_profile` no declari `custom_resolution_rules`, o quan l'amplada del rang no quedi coberta per cap regla.	DCF-04A (resol QA-06-15)
8. Requisits no funcionals
ID	Requisit	Traça
RNF-MAP-01	El rendiment del mapa HA DE complir: (a) temps fins a primera pintura interactiva ≤ 2,5 s en 4G simulada sobre viewport mòbil 375×667 px amb 100 estacions; (b) temps de resposta del resum (modal) ≤ 500 ms p95; (c) temps de resposta de la fitxa ≤ 1 s p95; (d) suport per a 500 estacions amb clustering. El benchmark HA DE fixar dataset, dispositiu, navegador, cache i mètrica.	REQ-06 (resol QA-06-13)
RNF-MAP-02	Usable amb teclat, focus visible i sense keyboard trap.	REQ-06
RNF-MAP-03	WCAG 2.2 AA.	REQ-06
RNF-MAP-04	Mapa i llista HAN DE reflow sense pèrdua.	REQ-06
RNF-MAP-05	Color, mida o icona no són l'únic canal d'estat.	REQ-06
RNF-MAP-06	Cap request de navegador a origen no autoritzat.	SPIKE-04 / SPEC-10
RNF-MAP-07	Cap secret ni dada INTERNAL_ONLY en logs o errors públics.	SPIKE-04 / SPEC-10
RNF-MAP-08	La degradació conserva llista, cerca i fitxa.	REQ-06
RNF-MAP-09	SPEC-06 CONSUMEIX consentiment/publicació; no implementa el flux.	DCF-06
RNF-MAP-10	Ubicació pública per defecte aproximada.	DCF-08
RNF-MAP-11	Grau d'aproximació configurable pel titular.	DCF-08
RNF-MAP-12	Rate limiting a l'API pública.	REQ-06
RNF-MAP-13	Analytics respectuós amb la privacitat si s'usa.	REQ-06
RNF-MAP-14	Tests de càrrega abans de MAP-C.	REQ-06
RNF-MAP-15	Cache respecta catalog_version.	DCF-06
RNF-MAP-16	Despublicació propaga a caches controlades en ≤ 60 s.	DCF-06
RNF-MAP-17	Rellotge del servidor sincronitzat via NTP.	DCF-06
RNF-MAP-18	Generalització en metres, no decimals lat/lon.	DCF-08
RNF-MAP-19	Contracte geoespacial WGS 84/GeoJSON [lon, lat].	DCF-08
RNF-MAP-20	Retenció física via retention_policy_ref (SPEC-08).	DCF-04A
RNF-MAP-21	La despublicació d'una canònica no pot esquivar-se via canvi automàtic de font.	DCF-11
RNF-MAP-22	La cache del navegador s'invalida quan: (a) el client està actiu i amb connectivitat; (b) rep un catalog_version actualitzat; (c) el TTL definit al PLAN-06 expira. Un navegador offline no es pot purgar remotament en 60 s i això no es considera incompliment.	§5.4 (resol QA-06-11)
RNF-MAP-23	El backend HA DE retornar exactament la resolució declarada per la primera regla de `custom_resolution_rules` que cobreixi l'amplada del rang. No s'admet interpolació ni aproximació.	DCF-04A (resol QA-06-15)
9. Criteris d'acceptació de MAP-A local
ID	Criteri
CA-MAP-01	El catàleg sintètic usa classificació pública explícita a nivell d'estació, sensor i camp.
CA-MAP-02	Mapa, llista, resum i fitxa mostren el mateix conjunt públic.
CA-MAP-03	Proves negatives demostren absència d'elements INTERNAL_ONLY.
CA-MAP-04	Navegació de teclat, focus, diàleg i llista alternativa passen proves.
CA-MAP-05	Gràfiques o resums històrics sintètics tenen alternativa textual equivalent.
CA-MAP-06	No hi ha requests de navegador a origen no autoritzat.
CA-MAP-07	Proves E2E sintètiques passen sense violacions CSP.
CA-MAP-08	La interrupció de la capa cartogràfica no filtra dades i conserva llista i fitxa.
CA-MAP-09	L'estat buit, de càrrega i d'error es mostren correctament.
CA-MAP-10	Deduplicació: 8 condicions de §6.7 verificades amb fixtures.
CA-MAP-11	La interfície és disponible en català.
CA-MAP-12	L'API pública té rate limiting actiu.
CA-MAP-13	Una estació despublicada desapareix de: (a) l'API pública (immediat); (b) el sitemap (≤ 60 s); (c) les caches sota control de MeteoLord (≤ 60 s); (d) el navegador actiu amb connectivitat (al següent catalog_version). El comportament del navegador offline no és responsabilitat verificable.
CA-MAP-14	Si el catalog_version no es pot verificar, no es mostren dades de cache.
CA-MAP-15	El modal i la fitxa mostren el conjunt públic mínim (§6.1) i el contracte específic per tipus.
CA-MAP-16	La llista alternativa mostra totes les estacions que passen filtres, independentment del viewport.
CA-MAP-17	Consulta a public_station_id no visible → 404 sense distingir causa.
CA-MAP-18	L'API pública retorna el catalog_version.
CA-MAP-19	Camp DEFECT-01 no apareix a cap superfície pública ni historial ni agregat.
CA-MAP-20	Estació amb sensors de classificació diferent només publica els PUBLIC_ALLOWED.
CA-MAP-21	El viewport inicial es deriva únicament de geometries públiques.
CA-MAP-22	Fixtures amb coordenada privada i pública diferents: la privada no apareix a API, frontend, logs ni metadades.
CA-MAP-23	Una estació d'usuari amb precisió 1 km no exposa la seva coordenada original.
CA-MAP-24	Canviar la precisió incrementa catalog_version i invalida cache.
CA-MAP-25	Clusters i comptadors no revelen estacions INTERNAL_ONLY.
CA-MAP-26	Denegar geolocalització no impedeix mapa, llista, cerca o fitxa.
CA-MAP-27	La geolocalització del visitant no genera requests amb les seves coordenades ni persistència local.
CA-MAP-28	Una estació sense public_geometry no apareix al mapa ni al catàleg públic.
CA-MAP-29	La llista de totes les estacions filtrades continua independent del viewport.
CA-MAP-30	Les ubicacions aproximades s'identifiquen textualment.
CA-MAP-31	Historials governats per history_profile versionat per camp.
CA-MAP-32	Un camp sense history_profile no exposa historial.
CA-MAP-33	Agregats calculats al backend, mai al frontend.
CA-MAP-34	Filtre aplicat abans d'agregar: cap agregat deriva d'informació INTERNAL_ONLY.
CA-MAP-35	Dades absents no s'interpolen; buckets parcials amb coverage explícit.
CA-MAP-36	DEFECT-01 exclou historial, agregats, estadístiques i derivats.
CA-MAP-37	Un historial real sense retention_policy_ref no es publica.
CA-MAP-38	Zona horària: UTC autoritatiu, presentació amb zona de l'estació o UTC.
CA-MAP-39	El backend retorna la resolució declarada a resolution_policy per al període sol·licitat (24h/7d/30d/personalitzat). Períodes no coberts → error clar.
CA-MAP-40	Una estació OBSOLETA roman visible amb indicador "dada obsoleta"; una estació EN_REVISIO roman visible amb indicador "en revisió"; una NO_PUBLICABLE no apareix.
CA-MAP-41	El llindar obsolete_limit es calcula com max(24h, 12 × expected_update_interval) i és verificable amb fixtures sintètiques.
CA-MAP-42	El rendiment compleix els objectius de RNF-MAP-01: p95 modal ≤ 500 ms, p95 fitxa ≤ 1 s, 100 estacions en viewport mòbil amb TTI ≤ 2,5 s.
CA-MAP-43	Amb fixtures sintètiques que continguin 500 estacions públiques MAP_VISIBLE, el mapa: (a) es carrega dins del llindar TTI de RNF-MAP-01; (b) agrupa visualment les estacions quan la densitat ho requereix; (c) manté la llista alternativa completa amb les 500 estacions; (d) manté el comptador públic coherent amb el nombre d'estacions `MAP_VISIBLE`; (e) no exposa cap estació `INTERNAL_ONLY` en clusters ni comptadors; (f) el rendiment es verifica amb el benchmark definit a RNF-MAP-01.	RNF-MAP-01 (resol QA-06-17)
CA-MAP-44	Un `history_profile` sense `custom_resolution_rules` rebutja el període `custom` amb error clar. Un `history_profile` amb regles retorna exactament la resolució de la primera regla que cobreix el rang; rebutja amb error clar si cap regla cobreix el rang.	DCF-04A (resol QA-06-15)
CA-MAP-45	Una estació `SOSPITOSA` roman visible amb l'indicador "Dada sospitosa"; els camps afectats es mostren amb marca "no fiable"; cap camp afectat s'oculta.	§4.2 (resol QA-06-16)
MAP-B i MAP-C no s'autoritzen amb aquest document.

10. Riscos
ID	Risc	Impacte	Mitigació
R-MAP-01	Exposició INTERNAL_ONLY	Crític	Filtre backend fail-closed + proves negatives
R-MAP-02	Ubicació precisa sense consentiment	Alt	Contracte de precisió
R-MAP-03	Nuls/zeros mal interpretats	Alt	Contracte de qualitat i DEFECT-01
R-MAP-04	Cartografia incompatible amb zero egress	Alt	Política de request i fallback
R-MAP-05	Divergència mapa/llista	Alt	Contracte compartit
R-MAP-06	Rendiment no reproduïble	Mitjà	Benchmark normatiu
R-MAP-07	Actors o rols no definits	Alt	Excloure de MAP-A
R-MAP-08	Cache mostra dades despublicades	Crític	catalog_version + invalidació ≤ 60 s
R-MAP-09	Duplicats visibles	Mitjà	§6.7
R-MAP-10	Abús API pública	Mitjà	Rate limiting
R-MAP-11	Modal/fitxa no s'adapta al tipus	Alt	Contracte específic
R-MAP-12	Dependència DCF no resolta	Crític	Gates
R-MAP-13	DEFECT-01 publicat per error	Alt	Classificació a nivell de camp
R-MAP-14	Estació eliminada encara pública	Alt	Protocol automàtic
R-MAP-15	Agregat derivat d'INTERNAL_ONLY	Crític	Filtrar abans d'agregar
R-MAP-16	mean de direccions de vent	Alt	Agregació circular
R-MAP-17	Precipitació parcial com a total	Alt	coverage explícit
R-MAP-18	Triangulació per punts aleatoris	Alt	Geometria pública estable
R-MAP-19	Proximitat interpretada com identitat	Alt	Cap llindar universal
R-MAP-20	INTERNAL_ONLY influeix comptadors	Crític	Excloure abans de deduplicar
R-MAP-21	Contradicció SPEC-00 vs DCF-06 sobre aprovació	Crític	Refinament explícit §6.1
R-MAP-22	Llindar obsolete_limit no definit → decisió al PLAN	Alt	§4.2 tancat
11. Traçabilitat
11.1 QA-06 → SPEC-06 v0.8
Finding	Severitat	Resolució
QA-06-01	BLOQUEJANT	§3.1–3.2
QA-06-02	BLOQUEJANT	§4.1–4.2
QA-06-03	BLOQUEJANT	§3.5 + §5.4 + §6.6
QA-06-04	BLOQUEJANT	§6.1 + §6.3
QA-06-05	BLOQUEJANT	§12.2
QA-06-06	IMPORTANT	RF-MAP-08
QA-06-07	IMPORTANT	RNF-MAP-09
QA-06-08	BLOQUEJANT	§6.1 (refinament explícit SPEC-00 → DCF-06)
QA-06-09	BLOQUEJANT	§4.2 (llindars i comportament tancats)
QA-06-10	BLOQUEJANT	§6.3 (resolution_policy obligatori)
QA-06-11	IMPORTANT	CA-MAP-13 + RNF-MAP-22 reescrits
QA-06-12	IMPORTANT	RF-MAP-05 referència corregida
QA-06-13	IMPORTANT	RNF-MAP-01 amb objectius concrets
QA-06-14	BLOQUEJANT	DCF-06 v1.2 (resolt a nivell DCF) + §6.1
QA-06-15	BLOQUEJANT	§6.3 `custom_resolution_rules` + RF-MAP-47 + RNF-MAP-23 + CA-MAP-44
QA-06-16	IMPORTANT	§4.2 semàntica única + CA-MAP-45
QA-06-17	IMPORTANT	CA-MAP-43
11.2 DCF → SPEC-06 v0.8
DCF	§
DCF-02	§3.1–3.6, §5
DCF-03	§4.1–4.2, §6.2
DCF-04A	§4.4, §6.3, RF-MAP-42/43/44/45
DCF-04B	§6.3 (retention_policy_ref → SPEC-08)
DCF-07	§6.4
DCF-08	§3.3, §6.5, RF-MAP-26 a RF-MAP-33
DCF-09	§5.4, §5.5
DCF-06 v1.2	§6.1 (gate automàtic i escalat excepcional)
DCF-11	§3.7, §6.7, RF-MAP-34 a RF-MAP-41, CA-MAP-10
12. Decisions pendents i gates
12.1 Decisions pendents
ID	Decisió	Estat	Bloqueja
DCF-02	Classificació de camps, fonts i visibilitat	RESOLT (DCF-06 v1.1)	—
DCF-03	Qualitat, sospita i revisió	RESOLT (DCF-06 v1.1)	—
DCF-04A	Contracte públic d'historials	RESOLT (DCF-04 v1.0)	—
DCF-04B	Retenció física	PENDENT SPEC-08	Historials reals
DCF-07	Requisits cartogràfics	RESOLT (DCF-06 v1.1)	—
DCF-08	Àmbit geogràfic i ubicació	RESOLT (DCF-08 v1.0)	—
DCF-09	Consentiment, aprovació i despublicació	RESOLT (DCF-06 v1.1 + v1.2)	—
DCF-10	Llicència i republicació externes	PENDENT	ACA/Open-Meteo públics
DCF-11	Política de duplicats	RESOLT (DCF-11 v1.0)	—
DCF-12	Idiomes suportats	PENDENT	Interfície multiidioma
12.2 Gates per iniciar PLAN-06
PLAN-06 pot iniciar-se amb MAP-A sintètica. DCF-04B, DCF-10 i DCF-12 NO bloquegen MAP-A:

DCF	Bloqueja MAP-A?	Bloqueja dades reals?
DCF-04B	NO	SÍ (historials reals)
DCF-10	NO	SÍ (ACA/Open-Meteo públics)
DCF-12	NO	NO (base català)
DCF-06 v1.2 ja reconcilia el gate automàtic de §6.1 amb SPEC-00 v0.5;
no queda cap acció paral·lela oberta per aquesta contradicció.

13. Pipeline SDD
QA documental de SPEC-06 v0.8.

Aprovació explícita d'Oriol.

Redactar PLAN-06 (decisions tècniques).

QA del PLAN-06.

Redactar TASKS-06.

Implementació MAP-A.

Validació MAP-A.

Resolució de DCF-04B, DCF-10 + revisió SPEC-00 abans de MAP-B.

Implementació MAP-B.

Portes de Fase C abans de MAP-C.

14. Referències
SPEC-00 v0.5 — ara disponible; reconciliada amb DCF-06 v1.2.

SPEC-10 v0.3 — fase A aprovada.

SPIKE-04 v1.1 — frontera INTERNAL_ONLY.

DCF-06 v1.1 — DCF-02, 03, 07, 09.

DCF-06 v1.2 — esmena de §5.3 (gate automàtic).

DCF-04 v1.0 — DCF-04A; 04B delegat a SPEC-08.

DCF-08 v1.0 — àmbit geogràfic i ubicació.

DCF-11 v1.0 — política de duplicats.

DEFECT-01 — caracteritzat, no corregit.

WCAG 2.2 i WAI-ARIA.

CF Metadata Conventions 1.13.

RFC 3339, RFC 7946, IANA Time Zone Database.

GDPR (Reglament UE 2016/679).

QA-06 v1.0 (v0.3) i QA-06 v2.0 (v0.6).

QA-06 v3.0 — revisió funcional de SPEC-06 v0.7.

15. Historial
Versió	Data	Canvi
0.1	2026-09-12	Esborrany reconstruït
0.2	2026-09-16	Frontera fail-closed, contractes, accessibilitat, qualitat, cartografia
0.3	2026-09-16	Estats buit/càrrega/error, duplicats, GDPR, modal vs. fitxa, sitemap, rate limiting, idioma, tests càrrega
0.4	2026-09-16	Resolts 5 bloquejants + 2 importants del QA-06 v1.0
0.5	2026-09-16	Incorporació DCF-06 v1.1
0.6	2026-09-16	Incorporació DCF-04A, DCF-08, DCF-11; CA-MAP-10 redefinit
0.7	2026-09-16	Resolts 3 bloquejants i 3 importants del QA-06 v2.0: (1) refinament explícit SPEC-00 → DCF-06 a §6.1; (2) §4.2 tanca obsolete_limit i comportament d'OBSOLETA/EN_REVISIO (nous RF-MAP-46, CA-MAP-40/41); (3) resolution_policy obligatori al history_profile (nou RF-MAP-45, CA-MAP-39); (4) CA-MAP-13 i RNF-MAP-22 reescrits per caches controlades; (5) RF-MAP-05 referència corregida; (6) RNF-MAP-01 amb objectius concrets de rendiment (nou CA-MAP-42).
0.8	2026-09-16	Resolts 2 bloquejants i 2 importants del QA-06 v3.0: (1) `custom_resolution_rules` determinista al `history_profile` (nous RF-MAP-47, RNF-MAP-23, CA-MAP-44); (2) `SOSPITOSA` amb semàntica única "marcar no fiable, no ocultar" (nou CA-MAP-45); (3) CA-MAP-43 per al clustering de 500 estacions (RNF-MAP-01); (4) capçalera alineada amb DCF-06 v1.2.
