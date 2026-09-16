# PLAN-06 v0.2 — Mapa públic d'estacions de MeteoLord
**Versió:** 0.2
**Estat:** APROVAT
**Data:** 2026-09-17
**Aprovat per:** Oriol
**SPEC base:** SPEC-06 v0.8
**Autoritzat per QA:** QA-PLAN-06 v0.1 i v0.2
**Traça DCF:** DCF-06 v1.1, DCF-06 v1.2, DCF-04 v1.0 (04A), DCF-08 v1.0, DCF-11 v1.0
**Traça QA:** QA-06 v3.0, QA-06 v4.0
**Naturalesa:** refinament tècnic; autoritza redactar TASKS-06 per a MAP-A sintètica, no la implementació ni MAP-B/MAP-C
**Abast d'aquesta versió:** tancar DLT-MAP-06..11

Nota de traçabilitat: aquest document assumeix que QA-PLAN-06 v0.1 està versionat al commit corresponent. Si en el moment de llegir-lo hi ha canvis locals no versionats a aquest QA, el commit s'ha de tancar abans que aquesta v0.2 es declari CANDIDATA ferma; el contingut tècnic no en depèn, però la cadena SDD sí.

0. Límits d'aquesta versió
Aquesta v0.2:

manté les decisions ja fixades a PLAN-06 v0.1 (DLT-MAP-01..05);

tanca DLT-MAP-06..11;

autoritza redactar TASKS-06 per a MAP-A sintètica;

no autoritza implementació;

no reobre cap decisió de SPEC-06, DCF-06 v1.2, DCF-04A, DCF-08 ni DCF-11;

no declara cap rendiment aprovat;

manté clusterRadius=50 i clusterMaxZoom=14 com a configuració inicial seleccionada, sotmesa a validació per P06-A-19.

Si una decisió d'aquesta v0.2 entra en contradicció amb SPEC-06 v0.8, DCF-06 v1.2, DCF-04A, DCF-08 o DCF-11, preval la font superior i aquest PLAN s'ha de refinar.

1. Estat heretat de PLAN-06 v0.1
Es mantenen vigents i sense canvi:

ID	Decisió heretada
DLT-MAP-01	Motor cartogràfic: MapLibre GL JS autoallotjat al mateix origen
DLT-MAP-02	Sistema de tiles: PMTiles vectorial autoallotjat al mateix origen
DLT-MAP-03	Format del basemap: vectorial amb MapLibre Style JSON
DLT-MAP-04	Clustering GeoJSON natiu; clusterRadius inicial = 50
DLT-MAP-05	clusterMaxZoom inicial = 14; expansió dinàmica i selector accessible per punts coincidents
Aquesta v0.2 no modifica DLT-MAP-01..05.

2. DLT-MAP-06 — Model físic canònic del catàleg públic
2.1 Naturalesa
MAP-A ha de poder-se executar amb fixtures sintètiques sense exigir una instància PostgreSQL. Per tant, el model físic de MAP-A és un model de fixtures versionat, amb els mateixos contractes que el futur model persistit, de manera que quan SPEC-08 autoritzi dades reals es pugui canviar l'emmagatzematge sense canviar el contracte de consum.

DLT-MAP-06 fixa:

les entitats canòniques del catàleg;

les seves claus i relacions;

quins camps són obligatoris i quins opcionals;

la separació entre INTERNAL_ONLY i PUBLIC_ALLOWED a nivell de fila.

No fixa motor de base de dades, ni tipus SQL concrets, ni ordre d'índexs; ho deixarà DLT-MAP-07 i, si cal, una futura v0.3 d'integració amb SPEC-08.

2.2 Entitats canòniques
text
PublicStation
  public_station_id: string (opac, estable)
  canonical_station_id: string (self o referència)
  duplicate_group_id: string|null
  publication_class: PUBLIC_ALLOWED | INTERNAL_ONLY
  publication_revoked: boolean
  public_name: string
  public_geometry: { type: "Point", coordinates: [lon, lat] } | null
  privacy_radius_m: integer > 0
  geo_publication: APPROXIMATED | EXACT | HIDDEN
  geo_policy_version: string
  sensors: SensorEntry[]        # vegeu 2.3
  observed_at: string (RFC 3339 UTC) | null
  provenance: { source, licence_or_legal_basis_ref }
  consent_required: boolean
  catalog_version: string

SensorEntry
  sensor_id: string
  publication_class: PUBLIC_ALLOWED | INTERNAL_ONLY
  fields: FieldEntry[]

FieldEntry
  field_id: string
  unit: string
  publication_class: PUBLIC_ALLOWED | INTERNAL_ONLY
  history_profile_id: string | null
  quality_profile_id: string
  defect_01_affected: boolean
  current_value: number | null

HistoryProfile
  history_profile_id: string
  profile_version: string
  history_enabled: boolean
  default_period: "24h"
  allowed_periods: ("24h" | "7d" | "30d" | "custom")[]
  max_query_window: "30d"
  resolution_policy: { [period]: "raw" | "hourly" | "daily" }
  custom_resolution_rules: { max_window_hours: int, resolution: ... }[]
  raw_history_allowed: boolean
  allowed_resolutions: ("raw" | "hourly" | "daily")[]
  aggregation_method: "mean" | "sum" | "min" | "max" | "last" | "circular" | "counter_diff"
  pre_aggregation_transform: string | null
  statistics: string[]
  missing_data_policy: "null" | "partial"
  min_coverage_policy: number (0..1)
  timezone_policy: "station" | "UTC"
  retention_policy_ref: string | null
  max_points_policy: integer

QualityProfile
  quality_profile_id: string
  profile_version: string
  unit: string
  valid_range: [number, number] | null
  expected_update_interval_s: integer | null
  max_rate_of_change: number | null
  freshness_limit_s: integer
  obsolete_limit_s: integer
  validation_rules: string[]
2.3 Regles de coherència
sensor.publication_class == PUBLIC_ALLOWED no implica que tots els seus field.publication_class ho siguin.

field.publication_class == PUBLIC_ALLOWED no implica historial; cal history_profile_id != null i history_enabled == true.

field.defect_01_affected == true força el tractament INTERNAL_ONLY del camp encara que la resta de gates passin.

retention_policy_ref == null bloqueja publicació d'historial real, però no bloqueja MAP-A amb fixtures.

public_geometry == null → MAP_VISIBLE = false.

geo_publication == HIDDEN → MAP_VISIBLE = false.

publication_revoked == true → tot el recurs tractat com a no existent a l'API pública.

2.4 Fixtures de MAP-A
MAP-A ha de proporcionar com a mínim:

Fixture	Cobertura
stations-basic.json	3-5 estacions PUBLIC_ALLOWED amb geometria aproximada vàlida
stations-internal.json	1 estació INTERNAL_ONLY que no apareix en cap superfície
stations-defect01.json	1 estació amb un camp DEFECT_01_AFFECTED
stations-duplicate.json	1 parell SAME_STATION confirmat, amb canònica explícita
stations-nearby.json	2 estacions diferents a la mateixa coordenada pública
stations-nogeo.json	1 estació amb public_geometry == null
stations-500.json	500 estacions MAP_VISIBLE per a P06-A-19
history-profile-24h-raw.json	perfil amb resolució raw per a 24h
history-profile-custom-uncovered.json	perfil sense custom_resolution_rules
quality-ok-sospitosa.json	perfil amb detecció de sospita
Els fixtures no poden contenir dades reals, ni coordenades reals, ni valors d'estacions reals, ni cap referència a Grafana/i2CAT.

2.5 No-decisions
DLT-MAP-06 no selecciona:

SGBD, extensió geoespacial ni motor de cerca;

format binari d'emmagatzematge de fixtures;

esquema SQL concret;

mecanisme de càrrega.

Aquestes decisions poden aparèixer en una futura PLAN-06 v0.3 o en el PLA d'integració amb SPEC-08.

3. DLT-MAP-07 — Índexs, particionament i rendiment estructural
3.1 Abast
DLT-MAP-07 no selecciona tecnologia; fixa els requisits que el futur model persistit haurà de complir, i com MAP-A ha de validar la forma de les consultes amb fixtures.

3.2 Requisits
La consulta pública del mapa s'ha de poder satisfer amb un conjunt acotat d'estacions MAP_VISIBLE, sense enumerar INTERNAL_ONLY.

La consulta de fitxa per public_station_id ha de poder retornar la mateixa informació que la consulta de mapa per a aquell element.

La consulta de llista filtrada ha de retornar totes les estacions que passen els filtres actius, amb independència del viewport.

Els filtres i la cerca no poden avaluar camps INTERNAL_ONLY ni derivar-hi cap senyal.

Qualsevol índex espacial ha de treballar exclusivament sobre public_geometry.

No s'introdueix cap índex sobre camps INTERNAL_ONLY per al consum públic.

3.3 Fora d'abast de MAP-A
selecció d'extensió espacial;

estratègia de particionament;

materialized views i preagregació física (vegeu DLT-MAP-09);

caches concretes (vegeu DLT-MAP-08).

3.4 Evidència de MAP-A
test de llista filtrada sense dependència del viewport;

test de consulta a public_station_id inexistent → 404 sense distingir causa;

test de consulta a public_station_id INTERNAL_ONLY → 404 idèntic;

test que cap camp INTERNAL_ONLY participa en filtres ni en cerca.

4. DLT-MAP-08 — Caches i invalidació
4.1 Regla
La despublicació té prioritat sobre qualsevol cache. Cap cache de MAP-A pot sobreviure a un increment de catalog_version.

4.2 Contracte
text
catalog_version
  monòton
  retornat per l'API pública
  verificat pel frontend abans de reutilitzar cache
  incrementat per:
    publicació / despublicació
    canvi de classificació (estació, sensor, camp)
    canvi de public_geometry / privacy_radius_m / geo_publication
    canvi de history_profile_id associat a un camp
    canvi de duplicate_group_id o canonical_station_id
    canvi de política que modifiqui la visibilitat efectiva
Caches sota control de MeteoLord:

es purguen en ≤ 60 s des de la revocació autoritativa;

no accepten un TTL llarg com a únic mecanisme de revocació;

la purga ha de ser per public_station_id.

Caches no controlades (navegador offline, còpies de tercers):

fora de la garantia verificable;

el frontend ha de rebutjar mostrar dades amb catalog_version anterior al conegut.

4.3 Estat del navegador
El frontend pot conservar dades en memòria, però:

abans de reutilitzar-les ha de verificar catalog_version contra l'últim conegut;

si no el pot verificar, ha de mostrar avís clar i no mostrar dades potencialment despublicades;

quan rep un catalog_version nou, ha d'invalidar la cache local dels recursos afectats.

4.4 Evidència de MAP-A
test que catalog_version incrementa en cada esdeveniment de la llista;

test que el frontend rebutja cache amb catalog_version anterior;

test que una despublicació simulada invalida llistes i fitxes en ≤ 60 s a la cache controlada.

4.5 Fora d'abast
selecció de tecnologia de cache;

CDN concret;

política de TTL numèrica concreta (ha de ser coherent amb RNF-MAP-15/16 i pot quedar per a PLAN-06 v0.3).

5. DLT-MAP-09 — Agregació, preagregació i materialized views
5.1 Regla normativa heretada
L'ordre autoritatiu és:

text
observacions
  → classificació PUBLIC_ALLOWED
  → validació de qualitat
  → exclusió DEFECT-01
  → agregació
  → estadístiques
  → API pública
No és admissible cap agregat derivat d'informació INTERNAL_ONLY.

5.2 Abast de MAP-A
MAP-A treballa amb history_profile sintètics i valida:

resolution_policy i custom_resolution_rules retornen la resolució exacta declarada;

períodes no coberts es rebutgen amb error clar;

raw_history_allowed == false no exposa raw;

agregació de precipitació com a sum, direcció del vent com a circular, ratxa com a max, comptadors com a counter_diff;

buckets amb n_valid, n_expected i coverage;

n_valid == 0 → null;

cap interpolació, cap carry-forward, cap conversió silenciosa de zero.

5.3 Preagregació
Es considera opcional i no s'activa a MAP-A. Si en el futur s'introdueix:

ha de respectar l'ordre normatiu;

ha de ser invalidable per catalog_version;

no pot servir cap agregat que inclogui INTERNAL_ONLY;

ha de conservar coverage i n_valid.

5.4 Materialized views
No es decideixen en aquesta versió. Queden per a una futura v0.3 d'integració amb SPEC-08.

5.5 Evidència de MAP-A
test de resolution_policy per a 24h, 7d, 30d;

test de custom_resolution_rules amb 2 regles i un rang cobert per la primera;

test de custom sense regles → error clar;

test de bucket amb coverage < min_coverage_policy → marcat parcial o null;

test d'absència total en un bucket → null, no zero.

6. DLT-MAP-10 — Interfície amb retention_policy_ref
6.1 Regla
MAP-A no decideix retenció física. Consumeix el contracte:

text
field.history_profile.retention_policy_ref:
  null  → historial real no publicable
  vàlid → historial real elegible (subjecte a la resta de gates)
6.2 Comportament a MAP-A
fixtures amb retention_policy_ref = null → historial no exposat;

fixtures amb retention_policy_ref fictici → historial exposat (perquè és sintètic);

cap dada real, cap política real, cap retenció física implementada.

6.3 Comportament fora de MAP-A
si SPEC-08 no proporciona retention_policy_ref per una font real → historial d'aquella font no publicable;

el bloqueig és per font, no global;

MAP-B pot continuar avançant amb fixtures.

6.4 Evidència de MAP-A
test de camp sense retention_policy_ref amb historial sintètic → no exposat;

test de camp amb retention_policy_ref fictici → exposat.

7. DLT-MAP-11 — Benchmark P06-A-19
7.1 Objectiu
Validar, amb el dataset normatiu de 500 estacions, els objectius de RNF-MAP-01 i CA-MAP-43.

7.2 Dataset
fixtures stations-500.json amb 500 estacions MAP_VISIBLE;

cap estació INTERNAL_ONLY;

cap dada real;

coordenades inventades dins d'una regió sintètica, sense correspondència geogràfica real.

7.3 Mètriques i llindars
Mètrica	Llindar	Font
TTI en viewport mòbil 375×667, 4G simulada, 100 estacions	≤ 2,5 s	RNF-MAP-01 (a)
TTI en viewport mòbil 375×667, 4G simulada, 500 estacions	≤ 2,5 s	RNF-MAP-01 (a'), CA-MAP-43
Temps de resposta del modal	≤ 500 ms p95	RNF-MAP-01 (b)
Temps de resposta de la fitxa	≤ 1 s p95	RNF-MAP-01 (c)
Clustering present amb densitat alta	sí	CA-MAP-43 (b)
Llista alternativa amb 500 estacions	completa	CA-MAP-43 (c)
Comptador públic coherent amb MAP_VISIBLE	sí	CA-MAP-43 (d)
Cap INTERNAL_ONLY a clusters o comptadors	sí	CA-MAP-43 (e)
El benchmark ha de fixar explícitament:

dispositiu;

navegador;

cache;

estat de xarxa;

percentils.

7.4 Configuració inicial de clustering
text
clusterRadius  = 50
clusterMaxZoom = 14
Natura:

configuració inicial seleccionada al PLAN-06;

sotmesa a validació per P06-A-19;

alineada amb RNF-MAP-01 i CA-MAP-43;

no és rendiment aprovat;

no és una decisió de SPEC-06;

si P06-A-19 falla, es revisen els paràmetres abans de reobrir decisions superiors.

7.5 Protocol de decisió
Si el benchmark passa amb els valors inicials → MAP-A supera la validació de rendiment.

Si el benchmark falla → es revisen clusterRadius i clusterMaxZoom i, si cal, l'estratègia de càrrega, però no es reobren decisions de SPEC-06 sense una nova iteració SDD.

Si el falliment és per causes estructurals (per exemple, dataset no representatiu), s'atura la validació i es refina P06-A-19.

7.6 Evidència
informe p06-a-19.json amb:

commit;

fixtures usats;

paràmetres de clustering;

resultats per mètrica i percentil;

resultat agregat;

captures sintètiques sense dades reals.

8. Riscos
ID	Risc	Impacte	Control
R-PLAN06-01	Exposició INTERNAL_ONLY en alguna superfície	Crític	Frontera fail-closed a DLT-MAP-03, MAP-06 i MAP-07; proves negatives
R-PLAN06-02	Agregat derivat de dades no publicables	Crític	Ordre normatiu DLT-MAP-09
R-PLAN06-03	Cache mostra dades despublicades	Crític	catalog_version + purga ≤ 60 s (DLT-MAP-08)
R-PLAN06-04	clusterRadius / clusterMaxZoom fixats com a rendiment aprovat	Alt	Cauteles explícites a DLT-MAP-11
R-PLAN06-05	Historial real sense retention_policy_ref	Alt	Fail-closed a DLT-MAP-10
R-PLAN06-06	Fixtures contaminats amb dades reals	Alt	Regla a DLT-MAP-06 §2.4
R-PLAN06-07	resolution_policy no determinista	Alt	custom_resolution_rules a DLT-MAP-06 i MAP-09
R-PLAN06-08	Duplicats actius no detectats a MAP-A	Mitjà	Fixtures stations-duplicate i DLT-MAP-06
R-PLAN06-09	Benchmark no reproduïble	Mitjà	Protocol a DLT-MAP-11 §7.4
R-PLAN06-10	PLAN-06 v0.2 interpretat com a autorització d'implementació	Alt	Capçalera i §0
9. Decisions encara pendents
ID	Descripció	Moment de resolució
SPEC-08	retention_policy_ref real per font	abans de MAP-B
SPEC-08	model físic persistit i migracions	abans de MAP-B
SPEC-08	preagregació i materialized views	abans de MAP-B
SPEC-01	identitat i rols	fora d'abast de SPEC-06
DCF-10	llicència i republicació ACA/Open-Meteo	abans de MAP-B
DCF-12	idiomes suportats	abans de MAP-B
QA-PLAN-06 v0.2	revisió d'aquesta versió	següent pas SDD
10. Pipeline SDD proposat
QA-PLAN-06 v0.1 — tancat (autoritza v0.2).

Redacció de PLAN-06 v0.2 — aquest document.

QA-PLAN-06 v0.2.

Aprovació explícita d'Oriol.

Redacció de TASKS-06.

Implementació MAP-A.

Validació MAP-A (inclou P06-A-19).

Resolució SPEC-08, DCF-10, DCF-12 i revisió SPEC-00 abans de MAP-B.

11. Estat final proposat
text
PLAN-06 v0.2
= APROVAT

DLT-MAP-01..05: heretats, sense canvi
DLT-MAP-06..11: tancats en aquesta v0.2
clustering: configuració inicial, no rendiment aprovat
TASKS-06: autoritzat per redactar MAP-A sintètica
implementació: no autoritzada
MAP-B/MAP-C: no autoritzats
12. Historial
Versió	Data	Canvi
0.1	2026-09-17	Creació inicial; DLT-MAP-01..05; cauteles de clustering
0.2	2026-09-17	Tancament de DLT-MAP-06..11; configuració inicial de clustering fixada; riscos, pipeline i aprovació explícita per redactar TASKS-06 de MAP-A sintètica.

## 13. Aprovació

El 2026-09-17, Oriol aprova PLAN-06 v0.2 com a pla tècnic de MAP-A.

Aquesta aprovació autoritza redactar TASKS-06 dins l'abast sintètic de MAP-A.
No autoritza implementar, desplegar, utilitzar dades reals, habilitar MAP-B/MAP-C
ni presentar el benchmark P06-A-19 com a superat abans d'executar-lo.
