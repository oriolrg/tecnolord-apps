📄 SPEC-06 v0.6 — Mapa públic d'estacions de MeteoLord
Versió: 0.6
Estat: CANDIDATA A QA DOCUMENTAL
Data: 2026-09-16
SPEC paraigua: SPEC-00 v0.5 — pendent d'aprovació i no disponible íntegrament
SPEC base de fase: SPEC-10 v0.3 — fase A aprovada
Descoberta relacionada: SPIKE-04 v1.1 — Grafana/i2CAT, viable amb condicions
Resolucions DCF: DCF-06 v1.1 (RESOLT), DCF-04 v1.0 (04A RESOLT, 04B PENDENT), DCF-08 v1.0 (RESOLT), DCF-11 v1.0 (RESOLT)
QA prèvia: QA-06 v1.0 — resolt a v0.5 i v0.6
Naturalesa: reconstrucció refinada; no autoritza PLAN-06 ni implementació.

0. Autoritat, fonts i límits
Aquesta especificació defineix el comportament públic desitjat del mapa d'estacions. No selecciona motor cartogràfic, llibreria de gràfiques, sistema de tiles, arquitectura, base de dades ni topologia. Aquestes decisions corresponen a un futur PLAN-06, després de QA documental i aprovació explícita.

Com que no es disposa del contingut complet de SPEC-00 v0.5, qualsevol requisit que en depengui es conserva com a REQ-00 i no es considera confirmat. INFERIT identifica una reconstrucció que no pot convertir-se en decisió d'implementació sense validació de producte.

HA DE, NO POT i BLOQUEJA són normatius.

PENDENT requereix una decisió abans del PLAN-06.

INFERIT és una proposta de treball, no una font normativa.

Marca	Significat
FET-REPO	fet confirmat en documentació o evidència versionada
REQ-00	requisit atribuït a SPEC-00 pendent de contrast íntegre
REQ-06	requisit propi d'aquesta SPEC
SPIKE-04	condició de la descoberta Grafana/i2CAT
DCF-06	resolució DCF-02, DCF-03, DCF-07, DCF-09
DCF-04	resolució DCF-04A (DCF-04B delegat a SPEC-08)
DCF-08	resolució de l'àmbit geogràfic i ubicació
DCF-11	resolució de la política de duplicats
INFERIT	reconstrucció pendent de validació
PENDENT	decisió oberta que bloqueja el seu àmbit
1. Objectiu
Definir un mapa públic que permeti a un visitant no autenticat:

consultar únicament estacions i camps autoritzats per a publicació;

identificar una estació i el seu estat global (derivat de diversos eixos);

veure un resum actual i accedir a una fitxa per URL directa;

usar una alternativa textual funcionalment equivalent al mapa;

filtrar o cercar només elements del catàleg públic;

no rebre, deduir ni enumerar dades INTERNAL_ONLY.

2. Abast i exclusions
Inclou: mapa amb marcadors públics, resum, fitxa, llista alternativa, filtres/cerca condicionats als contractes pendents, proves negatives de la frontera INTERNAL_ONLY, validació local amb fixtures sintètiques i historials governats per history_profile.

Exclou: identitat, sessions, rols i fluxos de propietari; alta o aprovació d'estacions; ingesta, retenció física i adaptadors; Grafana/i2CAT al mapa públic; canvis d'esquema, infraestructura o desplegament; dades privades i promoció.

Consumeix però no implementa: el procés de consentiment i publicació d'estacions és responsabilitat de SPEC-01 i SPEC-02. SPEC-06 només consumeix: publicacio_estacio, publicacio_sensor, publicacio_camp, precisio_autoritzada, publicacio_revocada, catalog_version, retention_policy_ref i canonical_station_id.

3. Model de classificació pública
3.1 Classificació a tres nivells
La publicació es decideix a tres nivells independents:

Nivell estació:

Valor	Significat
PUBLIC_ALLOWED	L'estació pot aparèixer en superfícies públiques
INTERNAL_ONLY	L'estació no pot aparèixer en cap superfície pública
Nivell sensor:

Valor	Significat
PUBLIC_ALLOWED	El sensor pot aparèixer en superfícies públiques
INTERNAL_ONLY	El sensor no pot aparèixer en cap superfície pública
Nivell camp:

Valor	Significat
PUBLIC_ALLOWED	El camp pot aparèixer en superfícies públiques
INTERNAL_ONLY	El camp no pot aparèixer en cap superfície pública
3.2 Regla de visibilitat efectiva
Un camp és visible en una superfície pública si i només si:

text
PUBLIC(field) =
    source.publication_allowed
    AND station.classification == PUBLIC_ALLOWED
    AND sensor.classification == PUBLIC_ALLOWED
    AND field.classification == PUBLIC_ALLOWED
    AND publication_approval == APPROVED
    AND consent_gate == SATISFIED
    AND quality_gate != NO_PUBLICABLE
Quan no existeixi el nivell sensor per a una font determinada, aquest gate pot considerar-se estructuralment no aplicable, però mai pot convertir un camp no classificat en públic.

Qualsevol resultat false, null, error de lectura o contracte desconegut HA DE produir un resultat no públic.

Aquesta regla s'aplica al backend. El frontend no pot inferir, reconstruir ni sobreescriure aquesta decisió.

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
Nota: El model físic concret (SQL, JSON, etc.) correspon al PLAN-06.

3.4 Fail-closed per defecte
Una classificació absent, desconeguda, caducada, inconsistent o que no es pugui verificar equival a INTERNAL_ONLY.

3.5 Catalog version
A més de classification_version per element classificable, el catàleg global HA DE mantenir un catalog_version.

catalog_version HA DE canviar amb qualsevol modificació que pugui alterar el conjunt o contingut públic, incloent com a mínim:

publicació o despublicació d'una estació;

canvi de classificació d'estació, sensor o camp;

canvi de public_geometry, privacy_radius_m o geo_publication;

canvi de history_profile associat a un camp;

canvi de duplicate_group_id o canonical_station_id;

canvi de política que modifiqui la visibilitat efectiva.

El valor HA DE ser monòton o equivalentment inequívoc per detectar una versió anterior del catàleg.

L'API pública HA DE retornar el catalog_version corresponent a les dades servides.

El frontend, abans de reutilitzar dades procedents de cache, HA DE poder comprovar que corresponen a una versió encara vàlida del catàleg.

Una cache amb catalog_version anterior NO POT considerar-se autoritativa quan existeix una versió posterior coneguda.

La invalidació explícita definida a §5.4 continua essent obligatòria: catalog_version és una defensa addicional i no substitueix la purga de caches.

3.6 Sensors múltiples
Els sensors individuals d'una mateixa estació poden tenir classificacions diferents.

Exemple admissible:

text
station = PUBLIC_ALLOWED
temperature_sensor = PUBLIC_ALLOWED
humidity_sensor    = PUBLIC_ALLOWED
diagnostic_sensor  = INTERNAL_ONLY
La publicació s'avalua independentment per sensor/camp. L'autorització pública de l'estació NO implica l'autorització automàtica de tots els sensors que conté.

3.7 Identitat de duplicats
Una estació pot pertànyer a un duplicate_group_id si s'ha confirmat que ella i unes altres representen la mateixa estació física/lògica. En aquest cas:

el grup HA DE tenir exactament una canonical_station_id;

només la canònica és representable públicament;

els aliases no apareixen com a entitats independents;

les observacions de fonts diferents NO es fusionen.

Veure §6.7 per al contracte complet.

4. Model d'estats multidimensionals
4.1 Quatre eixos ortogonals
Eix 1 — Publicació:

Valor	Significat
PUBLIC_ALLOWED	Visible en superfícies públiques
INTERNAL_ONLY	No visible
Eix 2 — Disponibilitat (frescor):

Valor	Significat
FRESCA	Dades recents (< llindar)
SENSE_DADES_RECENTS	Última dada > llindar
OBSOLETA	Última dada > llindar crític
Eix 3 — Qualitat:

Valor	Significat
OK	Dades dins dels paràmetres esperats
SOSPITOSA	Dades fora de paràmetres però no invalidades
NO_PUBLICABLE	Dades invalidades, no es poden mostrar
Eix 4 — Workflow de revisió:

Valor	Significat
NORMAL	Sense revisió pendent
EN_REVISIO	Revisió manual en curs
REVISADA	Revisió completada
4.2 Estat presentable (derivat)
La UI deriva un estat presentable combinant els quatre eixos. La regla exacta correspon al PLAN-06, però ha de complir:

Si publicacio == INTERNAL_ONLY → no es mostra.

Si qualitat == NO_PUBLICABLE → no es mostra.

Si disponibilitat == OBSOLETA → es mostra amb indicador "sense dades recents" o s'oculta (decisió de producte).

Si qualitat == SOSPITOSA → es mostra amb indicador visual.

Si revisio == EN_REVISIO → es mostra amb indicador "en revisió" (o s'oculta, decisió de producte).

4.3 Taula de comportament públic
Estat	Comportament públic
DISPONIBLE	Es poden mostrar valors actuals autoritzats
SENSE_DADES_RECENTS	L'estació pot continuar visible; la dada antiga no es presenta com a actual
SOSPITOSA	L'estació pot continuar visible; els camps afectats no es presenten com a dades fiables
EN_REVISIO	L'estació pot continuar visible si DCF-02/09 ho permeten; les mesures sotmeses a revisió no es publiquen
NO_PUBLICABLE	L'estació queda exclosa de totes les superfícies públiques
4.4 DEFECT-01 com a condició de camp
DEFECT_01_AFFECTED NO és un estat global de l'estació. És una condició aplicada a camps individuals afectats pel defecte de conversió de zeros Ecowitt.

Els camps afectats es tracten com INTERNAL_ONLY a efectes de publicació fins que la seva semàntica sigui validada. Això és independent de l'estat global de l'estació.

Exemple:

text
station.status = DISPONIBLE
temperature = PUBLIC_ALLOWED
humidity    = PUBLIC_ALLOWED
rain        = DEFECT_01_AFFECTED → INTERNAL_ONLY
L'estació continua visible, però rain no apareix a cap superfície pública.

La resolució de DEFECT-01 HA DE provocar una nova classificació explícita abans que el camp pugui esdevenir PUBLIC_ALLOWED.

Aquest principi s'aplica també a historials, agregacions, estadístiques i derivats: un camp afectat per DEFECT-01 no pot participar en cap càlcul públic.

4.5 Separació de responsabilitats
Backend: manté els quatre eixos i les condicions de camp.

API pública: retorna els eixos per a cada estació.

Frontend: deriva l'estat presentable i el mostra.

5. Frontera de publicació i INTERNAL_ONLY
5.1 Principi fail-closed
Tota estació, sensor o camp sense classificació pública explícita és INTERNAL_ONLY. La decisió d'inclusió és autoritativa al backend: el frontend no pot convertir una dada interna en pública mitjançant filtre, cache, paràmetre o estat de UI.

5.2 Superfícies cobertes
La frontera s'aplica a marcadors, llista, modal, fitxa, cerca, filtres, comptadors, agregats, API pública, cache, logs, errors, sitemap i metadades. Cap d'aquestes superfícies pot revelar existència, ubicació, sensor, valor, estat o error d'una font INTERNAL_ONLY.

5.3 Fonts
Font	Estat públic per defecte	Condició
Fixtures sintètiques	PUBLIC_ALLOWED	Exclusivament dins MAP-A
Ecowitt d'usuari	PENDENT	Elegible després de DCF-09, perfil de qualitat i classificació explícita
Camps afectats per DEFECT-01	INTERNAL_ONLY	Fins a validació semàntica
ACA/hidrologia	INTERNAL_ONLY	Fins a resolució favorable de DCF-10
Open-Meteo/previsió	INTERNAL_ONLY	Fins a resolució favorable de DCF-10
Grafana/i2CAT	INTERNAL_ONLY	Durant tota SPEC-06
Que una font sigui accessible tècnicament NO implica autorització de republicació.

5.4 Revocació
La retirada del consentiment o una despublicació administrativa HA DE:

canviar l'estat autoritatiu a no públic;

impedir noves respostes de l'API pública;

incrementar catalog_version;

invalidar mapa i cerca;

invalidar resum i fitxa;

purgar caches controlades;

retirar l'URL del sitemap;

registrar l'operació en auditoria interna.

L'origin HA DE deixar de servir la dada quan es confirma la transacció autoritativa de revocació.

Les caches públiques HAN DE disposar d'invalidació explícita per public_station_id.

No s'accepta un TTL llarg com a únic mecanisme de revocació.

Objectiu operatiu: invalidació de totes les caches controlades en ≤ 60 segons.

5.5 Eliminació de compte
Quan un usuari completa l'eliminació del seu compte segons SPEC-01, totes les estacions públiques vinculades a aquell compte passen automàticament a REVOKED.

Aquesta transició HA DE produir el mateix procés d'invalidació que qualsevol altra revocació (§5.4). La publicació NO es restaura automàticament.

5.6 No enumeració
Una consulta pública a un public_station_id no visible HA DE comportar-se com un recurs inexistent:

http
404 Not Found
La resposta NO POT permetre diferenciar entre: identificador inexistent, estació INTERNAL_ONLY, estació revocada o pendent d'aprovació.

5.7 Despublicació vs. supressió
Despublicar significa retirar una dada de les superfícies públiques. No equival a eliminar totes les dades internes.

Quan sigui aplicable un dret o obligació de supressió, s'ha de gestionar conforme al contracte de privacitat i retenció (SPEC-01/SPEC-08).

6. Contractes
6.1 Catàleg i publicació — RESOLT via DCF-06, DCF-11
Cada entrada del catàleg HA DE definir com a mínim:

text
public_station_id
source
sensor
field
publication_class
classification_version
classified_at
classified_by
provenance
quality_profile_id
geo_precision_policy
geo_publication
public_geometry
privacy_radius_m
geo_policy_version
history_profile_id
consent_required
licence_or_legal_basis_ref
duplicate_group_id
canonical_station_id
public_station_id HA DE ser estable i opac. NO POT reutilitzar identificadors interns d'usuari, dispositiu, proveïdor, serial, MAC o equivalents.

Conjunt públic mínim per a una estació autoritzada:

identificador públic;

nom públic;

ubicació generalitzada (segons DCF-08);

estat de disponibilitat/qualitat;

observed_at;

temperatura i humitat quan siguin publicables i vàlides;

procedència pública de la font.

Són INTERNAL_ONLY per defecte:

coordenades precises originals;

identificadors d'usuari;

MAC, serial o device ID;

credencials;

tokens i claus API;

URLs internes;

payloads crus;

errors interns;

camps diagnòstics;

metadades no aprovades;

sensors no classificats;

camps no classificats.

«Tots els camps públics» a RF-MAP-06 significa tots els camps amb classificació efectiva PUBLIC_ALLOWED. NO significa tots els camps disponibles a la font original.

Qui aprova, criteris, revocació: els fluxos dependents de rols corresponen a SPEC-01/SPEC-09. SPEC-06 consumeix el resultat.

6.2 Qualitat de dades — RESOLT via DCF-06
La qualitat es descriu a §4.1 (eix 3).

Rellotge de referència: UTC del servidor, sincronitzat via NTP. Diferència superior al llindar del PLAN-06 → SOSPITOSA.

quality_profile_id versionat per font: cada font real HA DE disposar d'un perfil versionat.

Freshness per defecte:

text
freshness_limit = max(30 minuts, 3 × expected_update_interval)
Detecció de sospita:

observed_at > server_now + 5 minuts → SOSPITOSA;

valor no finit quan se n'espera un de numèric;

unitat incompatible;

humitat fora de [0, 100];

timestamp inconsistent;

valor fora del rang declarat al quality_profile;

variació superior al màxim declarat;

error explícit reportat per l'adaptador.

Cada camp publicable HA DE declarar al seu perfil:

text
unit
valid_range
expected_update_interval
max_rate_of_change
validation_rules
Nuls i zeros: null significa desconegut/no disponible. NO es converteix silenciosament en zero, interpolació ni valor anterior. Un valor 0 només és observació real si la semàntica del camp ho confirma.

DEFECT-01: veure §4.4.

Transicions:

SENSE_DADES_RECENTS → DISPONIBLE si arriba dada fresca i vàlida.

EN_REVISIO si acumula 3 SOSPITOSA de les 5 darreres (substituïble per quality_profile).

Sortir d'EN_REVISIO requereix DATA_REVIEWER (SPEC-01).

Auditoria interna: timestamp, previous_state, new_state, triggered_rule, quality_profile_id, quality_profile_version. INTERNAL_ONLY.

6.3 Historials i agregació — RESOLT via DCF-04A
Els historials públics es governen mitjançant un history_profile versionat per camp.

Estructura del perfil (conceptual):

text
history_profile_id
history_enabled: bool
profile_version: string

default_period: '24h' | '7d' | '30d'
allowed_periods: ['24h', '7d', '30d', 'custom']
max_query_window: 30d

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
Contracte públic:

Un historial és publicable només si:

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
Períodes per defecte: 24h. Presets MVP: 24h, 7d, 30d, personalitzat (màxim 30 dies per consulta).

query window != retention period explícitament.

Agregació per camp i semàntica:

Magnitud	Operació típica
temperatura, humitat, pressió	mean, min, max
nivell d'aigua, cabal	mean, min, max, last
precipitació incremental	sum
ratxa de vent	max
direcció del vent	agregació circular
comptador acumulatiu	transformació específica
Dades absents: no interpolació, no zero, no carry-forward. Cada bucket pot expressar n_valid, n_expected, coverage. n_valid == 0 → null.

Backend autoritatiu: l'agregació pública HA DE fer-se al backend. El frontend només pot representar/formatar.

Ordre normatiu d'aplicació:

text
observacions
   ↓
classificació PUBLIC_ALLOWED
   ↓
validació de qualitat
   ↓
exclusió DEFECT-01
   ↓
agregació
   ↓
estadístiques
   ↓
API pública
NO:

text
observacions internes
   ↓
agregació
   ↓
"com que només és una mitjana, publicar-la"
Un agregat derivat d'informació INTERNAL_ONLY continua essent informació derivada de dades no autoritzades.

Zona horària: intercanvi autoritatiu UTC; presentació per defecte amb zona de l'estació (Europe/Madrid o IANA equivalent); fallback UTC si no hi ha zona pública autoritzada.

Rendiment (funcional): la consulta pública HA DE:

ser temporalment acotada;

aplicar resolució/agregació abans de lliurar datasets excessius;

no delegar al frontend l'agregació autoritativa;

no truncar dades silenciosament;

indicar la resolució retornada;

fallar explícitament si no pot complir el contracte.

Casos especials:

Estació nova sense historial: missatge "Encara no hi ha historial disponible"; no inventar zeros ni extrapolar.

Estació inactiva: l'historial anterior continua visible mentre estigui retingut i PUBLIC_ALLOWED; no extrapolar valors posteriors.

Forats: missing != 0, missing != last-value, missing != interpolated. Gràfica perceptible; taula amb "sense dada"; agregació amb coverage.

DEFECT-01 a l'historial:

Mentre un camp estigui DEFECT_01_AFFECTED, es tracta com INTERNAL_ONLY també per a historial, agregacions, estadístiques, gràfiques, taules, cache pública i qualsevol derivat. Corregir el parser avui NO demostra que l'historial anterior sigui fiable. Només un interval històric verificat pot reclassificar-se.

Retenció — DCF-04B PENDENT SPEC-08:

Cada font real HA DE disposar d'un retention_policy_ref aprovat abans de publicar historials. L'absència → fail-closed.

SPEC-08 haurà de definir: retention_policy_id, version, scope, raw_retention, aggregate_retention, archive_policy, deletion_policy, correction_policy, legal_or_licence_constraints.

6.4 Cartografia i requests — RESOLT via DCF-07
El contracte cartogràfic defineix criteris d'admissibilitat, no selecció de motor.

El component seleccionat per PLAN-06 HA DE complir simultàniament:

Àmbit	Contracte
Egress	El navegador NO POT contactar directament proveïdors de tercers
Origins	Només orígens controlats per MeteoLord i autoritzats per CSP
Tiles/estils/fonts	Han de poder servir-se des d'infraestructura controlada o proxy/cache
Llicència	Ha de permetre l'ús, atribució i mecanisme de distribució
Secrets	Cap secret pot arribar al navegador
Privacitat	Sense tracking, fingerprinting ni cookies de tercers
CSP	No pot requerir unsafe-eval
Accessibilitat	Interaccions per teclat; llista textual obligatòria
Degradació	Error cartogràfic no pot inutilitzar llista, cerca o fitxa
Ubicació	Ha d'admetre ubicacions generalitzades
Testing	MAP-A executables sense dependència externa
Observabilitat	Errors públics no poden incloure coordenades privades ni IDs interns
Rendiment	Ha de superar el benchmark de RNF-MAP-01
Si un proveïdor requereix requests directes des del navegador o impedeix el control/proxy/cache, és NO ELEGIBLE per PLAN-06.

La indisponibilitat del mapa NO POT alterar el conjunt d'estacions autoritzades ni desencadenar fallback cap a dades internes.

PLAN-06 HA DE definir un ordre de fallback entre fonts de tiles, totes sota control de MeteoLord.

6.5 Àmbit geogràfic i ubicació — RESOLT via DCF-08
Àmbit geogràfic:

El mapa NO té una frontera política fixa. L'extensió inicial es calcula a partir de les geometries públiques de totes les estacions MAP_VISIBLE que passen els filtres inicials:

text
initial_extent = bounds(public_geometry of filtered MAP_VISIBLE stations)
Cas zero estacions → missatge informatiu (RF-MAP-13).

El visitant pot navegar fora de l'extensió inicial.

Geometria pública:

text
private_geometry
      ↓ geo_precision_policy
public_geometry + privacy_radius_m + geo_policy_version
La generalització és autoritativa al backend. private_geometry NO POT arribar al frontend quan la política és aproximada.

L'algoritme de generalització HA DE ser estable i NO POT regenerar un punt aleatori nou a cada request.

Política de precisió proposada:

Tipus	Default	Configurable
MeteoLord pròpia	aproximada 100 m	exacta només amb aprovació explícita
Ecowitt usuari	aproximada 1 km	1 km / 5 km / 10 km / ocultar
ACA (després DCF-10)	aproximada 100 m	exacta si contracte ho autoritza
Grafana/i2CAT	INTERNAL_ONLY	no aplicable
Nota: 100 m i 1 km són política MeteoLord, no llindars GDPR.

Distinció entre:

source_positional_accuracy_m (exactitud tècnica de la font);

privacy_radius_m (política de privacitat).

No s'han de confondre.

Geolocalització del visitant:

text
default: OFF
trigger: acció explícita de l'usuari
browser permission: REQUIRED
backend transfer: NO
persistent storage: NO (localStorage, cookies, logs)
analytics: NO
purpose: centrar mapa, ordenar proximitat aproximada
denial: funcionalitat completa disponible
Clustering i viewport:

El conjunt lògic NO depèn del viewport:

text
PUBLIC + filtres actius
La implementació pot carregar/renderitzar per viewport sempre que NO alteri:

autorització;

llista;

cerca;

comptadors;

semàntica del catàleg.

Regla:

text
viewport = optimització/presentació
viewport != autorització
viewport != filtre implícit
Contracte geoespacial:

WGS 84 / GeoJSON;

ordre [longitude, latitude];

unitats graus decimals;

1.2345 a l'API, no 1,2345.

Cerca MVP:

nom públic d'estació;

municipi/localitat pública;

altres noms geogràfics públics.

Fora de l'MVP: adreça postal, geocodificació externa, coordenada arbitrària.

Ordenació: rellevància; distància només si Usa la meva ubicació està actiu.

6.6 Cache i invalidació — RESOLT via DCF-06
Veure §3.5 (catalog_version) i §5.4 (revocació).

Regla fonamental: la despublicació (RF-MAP-11) té prioritat sobre la disponibilitat de cache (RF-MAP-15).

6.7 Duplicats i identitat — RESOLT via DCF-11
Tres conceptes diferents:

Concepte	Significat	Conseqüència
SAME_STATION	Dos registres representen la mateixa estació	Unic canonical_station_id
NEARBY	Dues estacions properes espacialment	Dues estacions independents
VISUAL_GROUP	Agrupació visual per densitat	Responsabilitat de DCF-08
Un duplicat és:

dos o més registres que s'ha confirmat que identifiquen la mateixa estació física/lògica.

NO és suficient:

mateixa coordenada;

mateix edifici;

mateix propietari;

mateix nom;

proximitat espacial;

mateixes variables.

Cap llindar espacial universal confirma duplicació. La proximitat només genera CANDIDATE.

Evidència per confirmar SAME_STATION:

Identitat autoritativa (mateixa font + mateix external_station_id immutable + contracte);

Mapping explícit entre fonts aprovat;

Revisió administrativa documentada (STATION_IDENTITY_REVIEWER, compatible amb SUPERADMIN).

Regla pública:

text
PUBLIC_REPRESENTATION(duplicate_group) = canonical_station
Els aliases no apareixen com a marcadors, files, resultats de cerca, sitemap, comptadors o entitats independents a l'API pública.

NO es fusionen observacions ni historials de fonts diferents. La canònica mostra només les seves dades pròpies.

INTERNAL_ONLY fora de càlculs públics: no influeix en marcadors, comptadors, proximitat, sinònims de cerca o metadades.

EN_REVISIO no provoca canvi de canònica.

Despublicació de la canònica: NO provoca fallback automàtic. La promoció d'un alias requereix:

PUBLIC_ALLOWED independent;

gates de consentiment/llicència;

aprovació de nova canònica.

Recanonicalització: incrementa catalog_version, invalida caches, actualitza cerca, sitemap i API.

Auditoria obligatòria: duplicate_group_id, member_station_ids, previous_relation, new_relation, canonical_station_id, decision_basis, actor_or_capability, timestamp, decision_version, reason. INTERNAL_ONLY.

STATION_IDENTITY_REVIEWER: capability de domini. Implementació a SPEC-09.

7. Requisits funcionals
ID	Requisit	Traça
RF-MAP-01	El mapa HA DE mostrar només estacions amb publicacio_estacio == PUBLIC_ALLOWED.	REQ-00 / SPIKE-04
RF-MAP-02	Cada marcador HA DE comunicar identitat pública, estat presentable i resum autoritzat.	REQ-00 / REQ-06
RF-MAP-03	Les operacions de mapa HAN DE tenir equivalent de teclat.	REQ-06
RF-MAP-04	El mapa HA DE mostrar data/hora de la informació presentada.	REQ-06
RF-MAP-05	El resum (modal) HA DE mostrar el contracte mínim comú (§6.3) i el resum específic del catàleg.	REQ-06
RF-MAP-06	La fitxa HA DE tenir URL directa i estable, i HA DE mostrar contracte mínim, contracte específic i historial disponible.	REQ-00
RF-MAP-07	La fitxa HA DE respectar la mateixa frontera pública que el mapa.	SPIKE-04
RF-MAP-08	HA D'existir una llista textual que mostri totes les estacions que passen els filtres actius, independentment del viewport.	REQ-00 / REQ-06
RF-MAP-09	Filtres i cerca NO PODEN enumerar elements INTERNAL_ONLY.	SPIKE-04
RF-MAP-10	L'actualització automàtica HA DE poder-se pausar o desactivar.	REQ-06
RF-MAP-11	La despublicació HA DE retirar l'element de totes les superfícies públiques i invalidar les caches rellevants en ≤ 60 s.	DCF-06
RF-MAP-12	Un camp sense classificació pública NO POT aparèixer públicament.	SPIKE-04 / DCF-06
RF-MAP-13	Sense estacions públiques, el mapa HA DE mostrar un missatge informatiu, no un mapa buit.	REQ-06
RF-MAP-14	Durant la càrrega inicial, HA DE mostrar un indicador d'estat.	REQ-06
RF-MAP-15	Si l'API falla, la llista alternativa HA DE romandre funcional amb dades de cache verificades contra catalog_version o mostrar un error clar.	DCF-06
RF-MAP-16	El catàleg HA DE definir una política per a estacions duplicades o properes (veure §6.7).	DCF-11
RF-MAP-17	La interfície HA D'estar disponible en català.	REQ-06
RF-MAP-18	El sitemap públic HA D'incloure només les URL de fitxes públiques.	REQ-06
RF-MAP-19	Les fitxes d'estacions INTERNAL_ONLY NO PODEN aparèixer al sitemap.	REQ-06
RF-MAP-20	El frontend HA DE verificar el catalog_version abans de mostrar dades de cache.	DCF-06
RF-MAP-21	Si no es pot verificar el catalog_version, el frontend HA DE mostrar avís clar i no mostrar dades que poguessin estar despublicades.	DCF-06
RF-MAP-22	Una consulta pública a un public_station_id no visible HA DE respondre 404 Not Found sense distingir causa.	DCF-06
RF-MAP-23	L'API pública HA DE retornar el catalog_version corresponent.	DCF-06
RF-MAP-24	L'eliminació de compte d'un usuari HA DE revocar automàticament les seves estacions públiques.	DCF-06
RF-MAP-25	Els camps afectats per DEFECT-01 NO PODEN aparèixer en cap superfície pública fins a validació semàntica.	DCF-06
RF-MAP-26	El viewport inicial HA DE contenir totes les estacions MAP_VISIBLE que passen els filtres inicials.	DCF-08
RF-MAP-27	La geometria pública d'una estació aproximada HA DE ser derivada al backend; private_geometry NO POT arribar al frontend públic.	DCF-08
RF-MAP-28	Clusters, comptadors i cerques espacials només PODEN utilitzar estacions MAP_VISIBLE.	DCF-08
RF-MAP-29	La geolocalització del visitant només POT activar-se mitjançant acció explícita.	DCF-08
RF-MAP-30	La ubicació del visitant NO POT persistir-se ni enviar-se al backend dins l'MVP.	DCF-08
RF-MAP-31	Una estació sense public_geometry vàlida NO POT aparèixer al catàleg del mapa públic.	DCF-08
RF-MAP-32	Qualsevol canvi de precisió pública HA D'incrementar catalog_version i invalidar caches.	DCF-08
RF-MAP-33	Una ubicació aproximada HA DE comunicar textualment que no representa la posició exacta.	DCF-08
RF-MAP-34	Una relació de duplicació NO POT confirmar-se exclusivament per proximitat, nom, propietari o coincidència de coordenades.	DCF-11
RF-MAP-35	Cada grup SAME_STATION confirmat HA DE tenir exactament una canonical_station_id pública.	DCF-11
RF-MAP-36	Només la canònica POT aparèixer com a entitat independent a mapa, llista, cerca, comptadors, sitemap i API pública.	DCF-11
RF-MAP-37	La deduplicació NO POT fusionar automàticament observacions, historials ni camps de fonts diferents.	DCF-11
RF-MAP-38	Els registres INTERNAL_ONLY NO PODEN participar en cap càlcul, comptador o indicador públic de duplicació/proximitat.	DCF-11
RF-MAP-39	Un DUPLICATE_CANDIDATE NO POT ocultar ni modificar una estació pública fins a confirmació.	DCF-11
RF-MAP-40	La despublicació de la canònica NO POT provocar fallback automàtic a una altra font del grup.	DCF-11
RF-MAP-41	Qualsevol canvi de relació o canònica HA D'incrementar catalog_version i invalidar les caches rellevants.	DCF-11
RF-MAP-42	L'historial públic es governa mitjançant un history_profile versionat per camp.	DCF-04A
RF-MAP-43	L'agregació pública autoritativa HA DE fer-se al backend després d'aplicar classificació, qualitat i exclusió DEFECT-01.	DCF-04A
RF-MAP-44	Les dades absents NO s'interpolen ni es converteixen en zero a l'historial.	DCF-04A
8. Requisits no funcionals
ID	Requisit	Traça
RNF-MAP-01	El rendiment HA DE definir dataset, dispositiu, navegador, cache, mètrica i percentil.	REQ-06
RNF-MAP-02	La interfície HA DE ser usable amb teclat, focus visible i sense keyboard trap.	REQ-06
RNF-MAP-03	La conformitat objectiu HA DE ser WCAG 2.2 AA.	REQ-06
RNF-MAP-04	Mapa i llista HAN DE reflow sense pèrdua d'informació ni funcionalitat.	REQ-06
RNF-MAP-05	Color, mida o icona no poden ser l'únic canal d'estat.	REQ-06
RNF-MAP-06	Cap request de navegador pot anar a un origen no autoritzat.	SPIKE-04 / SPEC-10
RNF-MAP-07	Cap secret, valor intern ni dada INTERNAL_ONLY pot aparèixer en logs o errors públics.	SPIKE-04 / SPEC-10
RNF-MAP-08	La degradació del mapa HA DE conservar llista, cerca i fitxa pública.	REQ-06
RNF-MAP-09	SPEC-06 CONSUMEIX el resultat del consentiment i la publicació; NO implementa el flux.	DCF-06
RNF-MAP-10	La ubicació pública per defecte HA DE ser aproximada, no precisa.	DCF-08
RNF-MAP-11	El grau d'aproximació HA DE ser configurable pel titular.	DCF-08
RNF-MAP-12	L'API pública HA DE tenir un límit de peticions per IP per evitar abús.	REQ-06
RNF-MAP-13	Si s'usa analytics, HA DE ser respectuós amb la privacitat.	REQ-06
RNF-MAP-14	Abans de MAP-C s'han d'executar tests de càrrega.	REQ-06
RNF-MAP-15	La cache HA DE respectar el catalog_version i no mostrar dades despublicades.	DCF-06
RNF-MAP-16	La despublicació HA DE propagar-se a totes les caches controlades en ≤ 60 s.	DCF-06
RNF-MAP-17	El rellotge del servidor HA D'estar sincronitzat via NTP.	DCF-06
RNF-MAP-18	La generalització de la ubicació s'expressa en metres, no en decimals de lat/lon.	DCF-08
RNF-MAP-19	El contracte geoespacial públic HA DE ser WGS 84/GeoJSON [longitude, latitude].	DCF-08
RNF-MAP-20	La retenció física s'hereta de SPEC-08 mitjançant retention_policy_ref; sense política, historial real no publicable.	DCF-04A
RNF-MAP-21	La despublicació d'una canònica no pot esquivar-se mitjançant canvi automàtic de font.	DCF-11
9. Criteris d'acceptació de MAP-A local
ID	Criteri
CA-MAP-01	El catàleg sintètic usa classificació pública explícita a nivell d'estació, sensor i camp.
CA-MAP-02	Mapa, llista, resum i fitxa mostren el mateix conjunt públic.
CA-MAP-03	Proves negatives demostren absència d'elements INTERNAL_ONLY a totes les superfícies.
CA-MAP-04	Navegació de teclat, focus, diàleg i llista alternativa passen proves.
CA-MAP-05	Gràfiques o resums històrics sintètics tenen alternativa textual equivalent.
CA-MAP-06	No hi ha requests de navegador a origen no autoritzat.
CA-MAP-07	Proves E2E sintètiques passen sense violacions CSP.
CA-MAP-08	La interrupció de la capa cartogràfica no filtra dades i conserva llista i fitxa.
CA-MAP-09	L'estat buit, de càrrega i d'error es mostren correctament.
CA-MAP-10	Deduplicació (redefinit — DCF-11): amb fixtures sintètiques: (1) dos registres SAME_STATION produeixen una única estació canònica; (2) dues estacions diferents a la mateixa coordenada continuen sent dues estacions; (3) un DUPLICATE_CANDIDATE no suprimeix cap estació; (4) un registre INTERNAL_ONLY no modifica cap resultat públic; (5) no es fusionen dades dels membres del grup; (6) cerca, llista, comptadors, sitemap i API exposen només la canònica; (7) despublicar la canònica no promou cap alias; (8) un canvi de canònica incrementa catalog_version.
CA-MAP-11	La interfície és disponible en català.
CA-MAP-12	L'API pública té rate limiting actiu.
CA-MAP-13	Una estació despublicada s'elimina de la cache del navegador en ≤ 60 s.
CA-MAP-14	Si el catalog_version no es pot verificar, no es mostren dades de cache.
CA-MAP-15	El modal i la fitxa mostren el contracte mínim comú i el contracte específic per tipus.
CA-MAP-16	La llista alternativa mostra totes les estacions que passen filtres, independentment del viewport.
CA-MAP-17	Una consulta a un public_station_id no visible retorna 404 sense distingir causa.
CA-MAP-18	L'API pública retorna el catalog_version corresponent.
CA-MAP-19	Un camp afectat per DEFECT-01 no apareix a cap superfície pública ni en historials ni agregats.
CA-MAP-20	Una estació amb sensors de classificació diferent només publica els sensors PUBLIC_ALLOWED.
CA-MAP-21	El viewport inicial es deriva únicament de geometries públiques.
CA-MAP-22	Fixtures amb coordenada privada i pública diferents demostren que la privada no apareix a API, frontend, logs ni metadades.
CA-MAP-23	Una estació d'usuari amb precisió 1 km no exposa la seva coordenada original.
CA-MAP-24	Canviar la precisió incrementa catalog_version i invalida cache.
CA-MAP-25	Clusters i comptadors no revelen estacions INTERNAL_ONLY.
CA-MAP-26	Denegar geolocalització no impedeix mapa, llista, cerca o fitxa.
CA-MAP-27	La geolocalització del visitant no genera requests amb les seves coordenades ni persistència local.
CA-MAP-28	Una estació sense public_geometry no apareix al mapa ni al catàleg públic.
CA-MAP-29	La llista de totes les estacions filtrades continua independent del viewport.
CA-MAP-30	Les ubicacions aproximades s'identifiquen textualment, no només per color, icona o forma.
CA-MAP-31	Historials governats per history_profile versionat per camp.
CA-MAP-32	Un camp sense history_profile no exposa historial.
CA-MAP-33	Agregats calculats al backend, mai al frontend.
CA-MAP-34	Filtre aplicat abans d'agregar: cap agregat deriva d'informació INTERNAL_ONLY.
CA-MAP-35	Dades absents no s'interpolen; buckets parcials amb coverage explícit.
CA-MAP-36	DEFECT-01 exclou historial, agregats, estadístiques i derivats.
CA-MAP-37	Un historial real sense retention_policy_ref no es publica.
CA-MAP-38	Zona horària: UTC autoritatiu, presentació amb zona de l'estació o UTC.
MAP-B i MAP-C no s'autoritzen amb aquest document.

10. Riscos
ID	Risc	Impacte	Mitigació
R-MAP-01	Exposició de dades INTERNAL_ONLY	Crític	Filtre backend fail-closed i proves negatives
R-MAP-02	Ubicació precisa sense consentiment	Alt	Contracte de precisió
R-MAP-03	Nuls, zeros o dades sospitoses mal interpretades	Alt	Contracte de qualitat i DEFECT-01
R-MAP-04	Dependència cartogràfica incompatible amb zero egress	Alt	Política de request i fallback
R-MAP-05	Divergència mapa/llista	Alt	Contracte compartit
R-MAP-06	Rendiment no reproduïble	Mitjà	Benchmark complet
R-MAP-07	Actors o rols no definits	Alt	Excloure'ls de MAP-A
R-MAP-08	Cache mostra dades despublicades	Crític	catalog_version + invalidació ≤ 60 s
R-MAP-09	Duplicats visibles	Mitjà	Política §6.7
R-MAP-10	Abús de l'API pública	Mitjà	Rate limiting
R-MAP-11	Modal/fitxa no s'adapta al tipus d'estació	Alt	Contracte específic
R-MAP-12	Dependència de DCF no resolta	Crític	Gates
R-MAP-13	Camp DEFECT-01 publicat per error	Alt	Classificació a nivell de camp
R-MAP-14	Estació eliminada encara pública	Alt	Protocol automàtic
R-MAP-15	Agregat derivat d'INTERNAL_ONLY	Crític	Filtrar abans d'agregar
R-MAP-16	Generalització de privacitat amb mean de direccions de vent	Alt	Agregació circular específica
R-MAP-17	Suma de precipitació parcial presentada com a total	Alt	coverage explícit
R-MAP-18	Triangulació per múltiples punts aleatoris	Alt	Geometria pública estable
R-MAP-19	Proximitat interpretada com a identitat	Alt	Cap llindar universal
R-MAP-20	INTERNAL_ONLY influeix comptadors	Crític	Excloure abans de deduplicar
11. Traçabilitat
11.1 Traçabilitat QA-06 → SPEC-06 v0.6
Finding	Severitat	Resolució
QA-06-01	BLOQUEJANT	§3.1–3.2 (classificació 3 nivells + regla visibilitat)
QA-06-02	BLOQUEJANT	§4.1–4.2 (quatre eixos ortogonals + estat presentable)
QA-06-03	BLOQUEJANT	§3.5 (catalog_version) + §5.4 (revocació 8 passos) + §6.6
QA-06-04	BLOQUEJANT	§6.3 (contracte mínim + específic per tipus)
QA-06-05	BLOQUEJANT	§12.2 (gates ampliades)
QA-06-06	IMPORTANT	RF-MAP-08 (definit: totes les filtrades, no viewport)
QA-06-07	IMPORTANT	RNF-MAP-09 (SPEC-06 consumeix, no implementa)
11.2 Traçabilitat DCF → SPEC-06 v0.6
DCF	§ on es resol
DCF-02	§3.1, §3.2, §3.4, §3.6, §5
DCF-03	§4.1, §6.2
DCF-04A	§4.4, §6.3, RF-MAP-42/43/44
DCF-04B (pendent)	§6.3 (retention_policy_ref delegat a SPEC-08)
DCF-07	§6.4
DCF-08	§3.3, §6.5, RF-MAP-26 a RF-MAP-33
DCF-09	§5.4, §5.5
DCF-11	§3.7, §6.7, RF-MAP-34 a RF-MAP-41, CA-MAP-10
12. Decisions pendents i gates
12.1 Decisions pendents
ID	Decisió	Estat	Bloqueja
DCF-02	Classificació de camps, fonts i visibilitat	RESOLT (DCF-06 v1.1)	—
DCF-03	Qualitat, sospita i revisió	RESOLT (DCF-06 v1.1)	—
DCF-04A	Contracte públic d'historials	RESOLT (DCF-04 v1.0)	—
DCF-04B	Retenció física	PENDENT SPEC-08	Historials reals
DCF-07	Motor cartogràfic (requisits)	RESOLT (DCF-06 v1.1)	—
DCF-08	Àmbit geogràfic i ubicació	RESOLT (DCF-08 v1.0)	—
DCF-09	Consentiment, aprovació i despublicació	RESOLT (DCF-06 v1.1)	—
DCF-10	Llicència i republicació externes	PENDENT	ACA/Open-Meteo públics
DCF-11	Política de duplicats	RESOLT (DCF-11 v1.0)	—
DCF-12	Idiomes suportats	PENDENT	Interfície multiidioma
12.2 Gates per iniciar PLAN-06
PLAN-06 pot iniciar-se amb MAP-A sintètica. Les DCF pendents (04B, 10, 12) NO bloquegen MAP-A:

DCF	Bloqueja PLAN-06/MAP-A?	Bloqueja dades reals?
DCF-04B	NO	SÍ (historials reals sense retention_policy_ref)
DCF-10	NO	SÍ (ACA/Open-Meteo públics)
DCF-12	NO	NO (idioma base: català)
Conclusió: PLAN-06 queda desbloquejat per a MAP-A (fixtures sintètiques). Abans de MAP-B/C caldrà resoldre DCF-04B, DCF-10 i els contractes de SPEC-01/SPEC-02.

13. Pipeline SDD
QA documental de SPEC-06 v0.6.

Aprovació explícita d'Oriol.

Redactar PLAN-06 (decisions tècniques).

QA del PLAN-06.

Redactar TASKS-06.

Implementació MAP-A (fixtures sintètiques).

Validació MAP-A.

Resolució de DCF-04B, DCF-10 abans de MAP-B.

Implementació MAP-B (dades reals públiques).

Portes de Fase C abans de MAP-C.

14. Referències
SPEC-00 v0.5 — font paraigua pendent.

SPEC-10 v0.3 — fase A local aprovada.

SPIKE-04 v1.1 — frontera INTERNAL_ONLY.

DCF-06 v1.1 — resolució de DCF-02, 03, 07, 09.

DCF-04 v1.0 — resolució de DCF-04A; DCF-04B delegada a SPEC-08.

DCF-08 v1.0 — àmbit geogràfic i ubicació.

DCF-11 v1.0 — política de duplicats.

DEFECT-01 — semàntica de zeros Ecowitt caracteritzada, no corregida.

WCAG 2.2 i WAI-ARIA — referència d'accessibilitat.

CF Metadata Conventions 1.13 — semàntica d'agregacions.

RFC 3339 — timestamps.

IANA Time Zone Database — zones horàries.

RFC 7946 — GeoJSON i WGS 84.

GDPR (Reglament UE 2016/679) — protecció de dades.

QA-06 v1.0 — QA funcional de SPEC-06 v0.3.

15. Historial
Versió	Data	Canvi
0.1	2026-09-12	Esborrany reconstruït
0.2	2026-09-16	Frontera fail-closed, contractes, accessibilitat, qualitat, cartografia
0.3	2026-09-16	Estats buit/càrrega/error, duplicats, GDPR, modal vs. fitxa, sitemap, rate limiting, idioma, tests càrrega
0.4	2026-09-16	Resolts 5 bloquejants + 2 importants del QA-06
0.5	2026-09-16	Incorporació de DCF-06 v1.1 (DCF-02, 03, 07, 09)
0.6	2026-09-16	Incorporació de DCF-04A, DCF-08 i DCF-11 ratificades. Nous RF-MAP-26 a RF-MAP-44, RNF-MAP-18 a RNF-MAP-21, CA-MAP-21 a CA-MAP-38. CA-MAP-10 redefinit amb 8 condicions de deduplicació. §6.3 historials reescrita (DCF-04A). §6.5 àmbit geogràfic reescrita (DCF-08). §6.7 duplicats reescrita (DCF-11). §4.4 DEFECT-01 com a condició de camp. Gate desbloquejada per a PLAN-06/MAP-A.
