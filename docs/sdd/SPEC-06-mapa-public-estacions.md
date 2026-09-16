# SPEC-06 — Mapa públic d'estacions de MeteoLord

**Versió:** 0.5
**Estat:** CANDIDATA A QA DOCUMENTAL
**Data:** 2026-09-16
**SPEC paraigua:** SPEC-00 v0.5 — pendent d'aprovació i no disponible íntegrament
**SPEC base de fase:** SPEC-10 v0.3 — fase A aprovada
**Descoberta relacionada:** SPIKE-04 v1.1 — Grafana/i2CAT, viable amb condicions
**Resolució DCF:** DCF-06 v1.1 — DCF-02, DCF-03, DCF-07, DCF-09 resoltes
**QA prèvia:** QA-06 v1.0 (funcional sobre v0.3) — resolt a v0.4 i v0.5
**Naturalesa:** reconstrucció refinada; no autoritza PLAN-06 ni implementació.

## 0. Autoritat, fonts i límits

Aquesta especificació defineix el comportament públic desitjat del mapa
d'estacions. No selecciona motor cartogràfic, llibreria de gràfiques, sistema
de tiles, arquitectura, base de dades ni topologia. Aquestes decisions
corresponen a un futur PLAN-06, després de QA documental i aprovació explícita.

Com que no es disposa del contingut complet de SPEC-00 v0.5, qualsevol requisit
que en depengui es conserva com a `REQ-00` i no es considera confirmat.
`INFERIT` identifica una reconstrucció que no pot convertir-se en decisió
d'implementació sense validació de producte.

- **HA DE**, **NO POT** i **BLOQUEJA** són normatius.
- **PENDENT** requereix una decisió abans del PLAN-06.
- **INFERIT** és una proposta de treball, no una font normativa.

| Marca | Significat |
|---|---|
| `FET-REPO` | fet confirmat en documentació o evidència versionada |
| `REQ-00` | requisit atribuït a SPEC-00 pendent de contrast íntegre |
| `REQ-06` | requisit propi d'aquesta SPEC |
| `SPIKE-04` | condició de la descoberta Grafana/i2CAT |
| `DCF-06` | resolució normativa de decisions bloquejants |
| `INFERIT` | reconstrucció pendent de validació |
| `PENDENT` | decisió oberta que bloqueja el seu àmbit |

## 1. Objectiu

Definir un mapa públic que permeti a un visitant no autenticat:

- consultar únicament estacions i camps autoritzats per a publicació;
- identificar una estació i el seu estat global (derivat de diversos eixos);
- veure un resum actual i accedir a una fitxa per URL directa;
- usar una alternativa textual funcionalment equivalent al mapa;
- filtrar o cercar només elements del catàleg públic;
- no rebre, deduir ni enumerar dades `INTERNAL_ONLY`.

## 2. Abast i exclusions

**Inclou:** mapa amb marcadors públics, resum, fitxa, llista alternativa,
filtres/cerca condicionats als contractes pendents, proves negatives de la
frontera `INTERNAL_ONLY` i validació local amb fixtures sintètiques.

**Exclou:** identitat, sessions, rols i fluxos de propietari; alta o aprovació
d'estacions; ingesta, retenció i adaptadors; Grafana/i2CAT al mapa públic;
canvis d'esquema, infraestructura o desplegament; dades privades i promoció.

**Consumeix però no implementa:** el procés de consentiment i publicació
d'estacions és responsabilitat de SPEC-01 (identitat) i SPEC-02 (estacions).
SPEC-06 només **consumeix** el resultat: `publicacio_estacio`,
`publicacio_sensor`, `publicacio_camp`, `precisio_autoritzada`,
`publicacio_revocada` i `catalog_version`.

## 3. Model de classificació pública

### 3.1 Classificació a tres nivells

La publicació es decideix a **tres nivells independents**:

**Nivell estació:**

| Valor | Significat |
|-------|-----------|
| `PUBLIC_ALLOWED` | L'estació pot aparèixer en superfícies públiques |
| `INTERNAL_ONLY` | L'estació no pot aparèixer en cap superfície pública |

**Nivell sensor:**

| Valor | Significat |
|-------|-----------|
| `PUBLIC_ALLOWED` | El sensor pot aparèixer en superfícies públiques |
| `INTERNAL_ONLY` | El sensor no pot aparèixer en cap superfície pública |

**Nivell camp:**

| Valor | Significat |
|-------|-----------|
| `PUBLIC_ALLOWED` | El camp pot aparèixer en superfícies públiques |
| `INTERNAL_ONLY` | El camp no pot aparèixer en cap superfície pública |

### 3.2 Regla de visibilitat efectiva

Un camp és visible en una superfície pública si i només si:
PUBLIC(field) =
source.publication_allowed
AND station.classification == PUBLIC_ALLOWED
AND sensor.classification == PUBLIC_ALLOWED
AND field.classification == PUBLIC_ALLOWED
AND publication_approval == APPROVED
AND consent_gate == SATISFIED
AND quality_gate != NO_PUBLICABLE

text

Quan no existeixi el nivell `sensor` per a una font determinada, aquest gate
pot considerar-se estructuralment no aplicable, però **mai** pot convertir un
camp no classificat en públic.

Qualsevol resultat `false`, `null`, error de lectura o contracte desconegut HA
DE produir un resultat **no públic**.

Aquesta regla s'aplica **al backend**. El frontend no pot inferir, reconstruir
ni sobreescriure aquesta decisió.

### 3.3 Model de dades (conceptual)
Estacio
├── publicacio: PUBLIC_ALLOWED | INTERNAL_ONLY
├── precisio_autoritzada: EXACTA | APROXIMADA_<metres> | OCULTA
├── sensors: Map<SensorId, SensorPublicacio>
│ └── publicacio: PUBLIC_ALLOWED | INTERNAL_ONLY
│ └── camps: Map<CampId, CampPublicacio>
│ └── publicacio: PUBLIC_ALLOWED | INTERNAL_ONLY
└── publicacio_revocada: boolean

text

**Nota:** El model físic concret (SQL, JSON, etc.) correspon al PLAN-06.

### 3.4 Fail-closed per defecte

Una classificació absent, desconeguda, caducada, inconsistent o que no es
pugui verificar equival a `INTERNAL_ONLY`.

### 3.5 Catalog version

A més de `classification_version` per element classificable, el catàleg
global HA DE mantenir un `catalog_version`.

`catalog_version` HA DE canviar amb qualsevol modificació que pugui alterar el
conjunt o contingut públic, incloent com a mínim:

- publicació d'una estació;
- despublicació;
- canvi de classificació d'estació;
- canvi de classificació de sensor;
- canvi de classificació de camp;
- canvi de política que modifiqui la visibilitat efectiva.

El valor HA DE ser monòton o equivalentment inequívoc per detectar una versió
anterior del catàleg.

L'API pública HA DE retornar el `catalog_version` corresponent a les dades
servides.

El frontend, abans de reutilitzar dades procedents de cache, HA DE poder
comprovar que corresponen a una versió encara vàlida del catàleg.

Una cache amb `catalog_version` anterior NO POT considerar-se autoritativa
quan existeix una versió posterior coneguda.

La invalidació explícita definida a §5.4 continua essent obligatòria:
`catalog_version` és una defensa addicional i **no substitueix** la purga de
caches.

### 3.6 Sensors múltiples

Els sensors individuals d'una mateixa estació poden tenir classificacions
diferents.

Exemple admissible:
station = PUBLIC_ALLOWED

temperature_sensor = PUBLIC_ALLOWED
humidity_sensor = PUBLIC_ALLOWED
diagnostic_sensor = INTERNAL_ONLY

text

La publicació s'avalua independentment per sensor/camp.

L'autorització pública de l'estació **NO** implica l'autorització automàtica
de tots els sensors que conté.

## 4. Model d'estats multidimensionals

### 4.1 Quatre eixos ortogonals

Els estats d'una estació es descriuen en **quatre eixos independents**, no en
un sol enum:

**Eix 1 — Publicació:**

| Valor | Significat |
|-------|-----------|
| `PUBLIC_ALLOWED` | Visible en superfícies públiques |
| `INTERNAL_ONLY` | No visible |

**Eix 2 — Disponibilitat (frescor):**

| Valor | Significat |
|-------|-----------|
| `FRESCA` | Dades recents (< llindar) |
| `SENSE_DADES_RECENTS` | Última dada > llindar |
| `OBSOLETA` | Última dada > llindar crític |

**Eix 3 — Qualitat:**

| Valor | Significat |
|-------|-----------|
| `OK` | Dades dins dels paràmetres esperats |
| `SOSPITOSA` | Dades fora de paràmetres però no invalidades |
| `NO_PUBLICABLE` | Dades invalidades, no es poden mostrar |

**Eix 4 — Workflow de revisió:**

| Valor | Significat |
|-------|-----------|
| `NORMAL` | Sense revisió pendent |
| `EN_REVISIO` | Revisió manual en curs |
| `REVISADA` | Revisió completada |

### 4.2 Estat presentable (derivat)

La UI deriva un **estat presentable** combinant els quatre eixos. La regla
exacta de derivació correspon al PLAN-06, però ha de complir:

- Si `publicacio == INTERNAL_ONLY` → no es mostra.
- Si `qualitat == NO_PUBLICABLE` → no es mostra.
- Si `disponibilitat == OBSOLETA` → es mostra amb indicador "sense dades
  recents" o s'oculta (decisió de producte).
- Si `qualitat == SOSPITOSA` → es mostra amb indicador visual.
- Si `revisio == EN_REVISIO` → es mostra amb indicador "en revisió" (o
  s'oculta, decisió de producte).

### 4.3 Taula de comportament públic

| Estat | Comportament públic |
|-------|---------------------|
| `DISPONIBLE` | Es poden mostrar valors actuals autoritzats |
| `SENSE_DADES_RECENTS` | L'estació pot continuar visible; la dada antiga no es presenta com a actual |
| `SOSPITOSA` | L'estació pot continuar visible; els camps afectats no es presenten com a dades fiables |
| `EN_REVISIO` | L'estació pot continuar visible si DCF-02/09 ho permeten; les mesures sotmeses a revisió no es publiquen |
| `NO_PUBLICABLE` | L'estació queda exclosa de totes les superfícies públiques |

### 4.4 Separació de responsabilitats

- **Backend:** manté els quatre eixos.
- **API pública:** retorna els eixos per a cada estació.
- **Frontend:** deriva l'estat presentable i el mostra.

Aquesta separació permet que el frontend canviï la presentació sense que el
backend canviï el model.

## 5. Frontera de publicació i `INTERNAL_ONLY`

### 5.1 Principi fail-closed

Tota estació, sensor o camp sense classificació pública explícita és
`INTERNAL_ONLY`. La decisió d'inclusió és autoritativa al backend: el frontend
no pot convertir una dada interna en pública mitjançant filtre, cache,
paràmetre o estat de UI.

### 5.2 Superfícies cobertes

La frontera s'aplica a marcadors, llista, modal, fitxa, cerca, filtres,
comptadors, agregats, API pública, cache, logs, errors, sitemap i metadades.
Cap d'aquestes superfícies pot revelar existència, ubicació, sensor, valor,
estat o error d'una font `INTERNAL_ONLY`.

### 5.3 Fonts

| Font | Estat públic per defecte | Condició |
|---|---|---|
| Fixtures sintètiques | `PUBLIC_ALLOWED` | Exclusivament dins MAP-A |
| Ecowitt d'usuari | `PENDENT` | Elegible després de DCF-09, perfil de qualitat i classificació explícita |
| Camps afectats per DEFECT-01 | `INTERNAL_ONLY` | Fins a validació semàntica |
| ACA/hidrologia | `INTERNAL_ONLY` | Fins a resolució favorable de DCF-10 |
| Open-Meteo/previsió | `INTERNAL_ONLY` | Fins a resolució favorable de DCF-10 |
| Grafana/i2CAT | `INTERNAL_ONLY` | Durant tota SPEC-06 |

Que una font sigui accessible tècnicament **NO** implica autorització de
republicació.

### 5.4 Revocació

La retirada del consentiment o una despublicació administrativa HA DE:

1. canviar l'estat autoritatiu a no públic;
2. impedir noves respostes de l'API pública;
3. incrementar `catalog_version`;
4. invalidar mapa i cerca;
5. invalidar resum i fitxa;
6. purgar caches controlades;
7. retirar l'URL del sitemap;
8. registrar l'operació en auditoria interna.

L'origin HA DE deixar de servir la dada quan es confirma la transacció
autoritativa de revocació.

Les caches públiques HAN DE disposar d'invalidació explícita per
`public_station_id`.

No s'accepta un TTL llarg com a únic mecanisme de revocació.

**Objectiu operatiu:** invalidació de totes les caches controlades en
**≤ 60 segons**.

A partir de la invalidació, les URL retirades han de respondre com a recurs no
existent.

### 5.5 Eliminació de compte

Quan un usuari completa l'eliminació del seu compte segons SPEC-01, totes les
estacions públiques vinculades a aquell compte passen automàticament a
`REVOKED`.

Aquesta transició HA DE produir el mateix procés d'invalidació que qualsevol
altra revocació (veure §5.4).

La publicació **NO** es restaura automàticament si la mateixa persona crea
posteriorment un compte nou.

### 5.6 No enumeració

Una consulta pública a un `public_station_id` no visible HA DE comportar-se com
un recurs inexistent.

Resposta pública esperada:

```http
404 Not Found
La resposta NO POT permetre diferenciar:

identificador inexistent;

estació INTERNAL_ONLY;

estació revocada;

estació pendent d'aprovació.

5.7 Despublicació vs. supressió
Despublicar significa retirar una dada de les superfícies públiques.

No equival necessàriament a eliminar totes les dades internes.

Quan sigui aplicable un dret o obligació de supressió, aquest procés s'ha de
gestionar conforme al contracte específic de privacitat i retenció.

La resposta 404, la retirada del sitemap i la invalidació de caches sota
control de MeteoLord no poden garantir l'eliminació immediata de còpies
prèviament obtingudes per tercers.

6. Contractes que s'han de resoldre
6.1 Catàleg i publicació — BLOQUEJANT
Cada entrada del catàleg ha de definir com a mínim:

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
consent_required
licence_or_legal_basis_ref
public_station_id HA DE ser estable i opac. NO POT reutilitzar
identificadors interns d'usuari, dispositiu, proveïdor, serial, MAC o
equivalents.

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

«Tots els camps públics» a RF-MAP-06 significa tots els camps amb
classificació efectiva PUBLIC_ALLOWED. NO significa tots els camps
disponibles a la font original.

PENDENT: qui aprova, quins criteris usa, com es revoca una publicació i
quina invalidació s'aplica a mapa, cerca, cache i fitxa. Els fluxos dependents
de rols no poden entrar en acceptació fins a SPEC-01.

PENDENT: política per a estacions duplicades o properes (DCF-11). Cal
definir un llindar de proximitat i una regla de prioritat.

6.2 Qualitat de dades — BLOQUEJANT
La qualitat es descriu a §4.1 (eix 3).

Rellotge de referència: UTC del servidor, sincronitzat via NTP. Si la
diferència amb el rellotge de referència és superior al llindar definit al
PLAN-06, les mesures es tracten com a SOSPITOSA.

quality_profile_id versionat per font: cada font real HA DE disposar
d'un perfil de qualitat versionat. Els llindars específics de cada sensor
pertanyen al perfil i no al codi del mapa.

Freshness per defecte:

text
freshness_limit = max(30 minuts, 3 × expected_update_interval)
Si expected_update_interval no està definit, una mesura NO POT
presentar-se com a dada actual fiable.

Detecció de sospita: una observació amb
observed_at > server_now + 5 minuts és SOSPITOSA. També és sospitosa quan
es produeix:

valor no finit quan se n'espera un de numèric;

unitat incompatible;

humitat fora de [0, 100];

timestamp inconsistent;

valor fora del rang declarat al quality_profile;

variació superior al màxim declarat;

error explícit reportat per l'adaptador.

No s'estableixen límits meteorològics universals inventats. Cada camp
publicable HA DE declarar al seu perfil:

text
unit
valid_range
expected_update_interval
max_rate_of_change
validation_rules
Nuls i zeros: null significa desconegut/no disponible. NO es converteix
silenciosament en zero, interpolació ni valor anterior. Un valor 0 només es
considera una observació real si la semàntica de la font/camp ho confirma.

DEFECT-01: els camps afectats es tracten com a INTERNAL_ONLY a efectes
de publicació fins que la seva semàntica sigui validada. Aquesta és una
condició a nivell de camp, independent de l'estat global de l'estació. La
resolució de DEFECT-01 HA DE provocar una nova classificació explícita abans
que el camp pugui esdevenir PUBLIC_ALLOWED.

Transicions:

Una dada fresca i vàlida pot provocar
SENSE_DADES_RECENTS → DISPONIBLE.

Una estació entra automàticament en EN_REVISIO si acumula 3 observacions
SOSPITOSA entre les 5 darreres (llevat que el quality_profile defineixi
una altra regla aprovada).

Sortir d'EN_REVISIO requereix el capability DATA_REVIEWER
(correspondència amb rols a SPEC-01).

Auditoria interna: els canvis d'estat HAN DE registrar:

text
timestamp
previous_state
new_state
triggered_rule
quality_profile_id
quality_profile_version
Aquesta informació és INTERNAL_ONLY.

6.3 Fitxa i historial — BLOQUEJANT PER A DADES REALS
Contracte mínim comú (totes les estacions):

nom públic;

estat presentable (derivat);

data/hora de l'última actualització;

font de les dades;

conjunt de mesures públiques de resum (definit pel catàleg).

Contracte específic per tipus d'estació (definit pel catàleg):

Estació meteorològica: temperatura, humitat, vent, pluja...

Estació hidrològica: cabal, nivell, capacitat...

Altres tipus: el catàleg defineix.

Contracte d'historial:

Períodes disponibles.

Agregació (si escau).

Estadístiques.

Zona horària.

PENDENT: DCF-04 ha de resoldre quins històrics i agregacions existeixen.

Les gràfiques no poden ser l'única forma d'accedir a l'historial: cal una
descripció i representació textual o tabular.

6.4 Cartografia i requests — BLOQUEJANT
El contracte cartogràfic defineix criteris d'admissibilitat, no selecció
de motor.

El component seleccionat posteriorment per PLAN-06 HA DE complir
simultàniament:

Àmbit	Contracte
Egress	El navegador NO POT contactar directament proveïdors cartogràfics de tercers
Origins	Només orígens controlats per MeteoLord i autoritzats per CSP
Tiles/estils/fonts	Han de poder servir-se des d'infraestructura controlada o proxy/cache autoritzat
Llicència	Ha de permetre l'ús, atribució i mecanisme de distribució/cache escollit
Secrets	Cap secret pot arribar al navegador
Privacitat	Sense tracking, fingerprinting o cookies de tercers
CSP	No pot requerir unsafe-eval com a prerequisit
Accessibilitat	Interaccions necessàries disponibles per teclat; la llista textual continua obligatòria
Degradació	Error cartogràfic no pot inutilitzar llista, cerca o fitxa
Ubicació	Ha d'admetre ubicacions generalitzades
Testing	MAP-A ha de poder executar-se de forma determinista sense dependència externa
Observabilitat	Errors públics no poden incloure coordenades privades, payloads ni IDs interns
Rendiment	Ha de superar el benchmark normatiu que concreti RNF-MAP-01
Si un proveïdor requereix requests directes des del navegador o contractualment
impedeix el mecanisme necessari de control/proxy/cache, és NO ELEGIBLE per
PLAN-06.

La indisponibilitat del mapa NO POT alterar el conjunt d'estacions
autoritzades ni desencadenar cap fallback cap a dades internes.

El PLAN-06 HA DE definir un ordre de fallback entre fonts de tiles, totes
elles sota control de MeteoLord. Cap fallback pot saltar-se la restricció
d'orígens controlats.

6.5 Àmbit geogràfic — PENDENT
Cal decidir bounding box, zoom inicial, política d'ubicació aproximada i si la
geolocalització del visitant existeix. No es pot demanar ni usar ubicació del
visitant per defecte; qualsevol ús ha de ser exprés, reversible i justificat.

PENDENT: DCF-08.

6.6 Cache i invalidació — BLOQUEJANT
Veure §3.5 (catalog_version) i §5.4 (protocol de revocació).

Regla fonamental: la despublicació (RF-MAP-11) té prioritat sobre la
disponibilitat de cache (RF-MAP-15).

7. Requisits funcionals
ID	Requisit	Traça
RF-MAP-01	El mapa HA DE mostrar només estacions amb publicacio_estacio == PUBLIC_ALLOWED.	REQ-00 / SPIKE-04
RF-MAP-02	Cada marcador HA DE comunicar identitat pública, estat presentable i resum autoritzat.	REQ-00 / REQ-06
RF-MAP-03	Les operacions de mapa HAN DE tenir equivalent de teclat.	REQ-06
RF-MAP-04	El mapa HA DE mostrar data/hora de la informació presentada.	REQ-06
RF-MAP-05	El resum (modal) HA DE mostrar el contracte mínim comú definit a §6.3 i el resum específic definit pel catàleg per al tipus d'estació.	REQ-06
RF-MAP-06	La fitxa HA DE tenir URL directa i estable, i HA DE mostrar el contracte mínim comú, el contracte específic per tipus i l'historial disponible.	REQ-00
RF-MAP-07	La fitxa HA DE respectar la mateixa frontera pública que el mapa.	SPIKE-04
RF-MAP-08	HA D'existir una llista textual que mostri totes les estacions que passen els filtres actius, independentment del viewport del mapa.	REQ-00 / REQ-06
RF-MAP-09	Filtres i cerca NO PODEN enumerar elements INTERNAL_ONLY.	SPIKE-04
RF-MAP-10	L'actualització automàtica HA DE poder-se pausar o desactivar.	REQ-06
RF-MAP-11	La despublicació HA DE retirar l'element de totes les superfícies públiques i invalidar les caches rellevants en ≤ 60 s.	REQ-06 / DCF-06
RF-MAP-12	Un camp sense classificació pública NO POT aparèixer públicament.	SPIKE-04 / DCF-06
RF-MAP-13	Quan no hi ha estacions públiques, el mapa HA DE mostrar un missatge informatiu, no un mapa buit.	REQ-06
RF-MAP-14	Durant la càrrega inicial, HA DE mostrar un indicador d'estat.	REQ-06
RF-MAP-15	Si l'API falla, la llista alternativa HA DE romandre funcional amb dades de cache verificades contra catalog_version o mostrar un error clar.	REQ-06 / DCF-06
RF-MAP-16	El catàleg HA DE definir una política per a estacions duplicades o properes (DCF-11).	REQ-06
RF-MAP-17	La interfície del mapa HA D'estar disponible en català.	REQ-06
RF-MAP-18	El sitemap públic HA D'incloure només les URL de les fitxes públiques.	REQ-06
RF-MAP-19	Les fitxes d'estacions INTERNAL_ONLY NO PODEN aparèixer al sitemap.	REQ-06
RF-MAP-20	El frontend HA DE verificar el catalog_version abans de mostrar dades de cache.	DCF-06
RF-MAP-21	Si el catalog_version no es pot verificar, el frontend HA DE mostrar un avís clar i no mostrar dades que poguessin estar despublicades.	DCF-06
RF-MAP-22	Una consulta pública a un public_station_id no visible HA DE respondre 404 Not Found sense permetre distingir la causa.	DCF-06
RF-MAP-23	L'API pública HA DE retornar el catalog_version corresponent a les dades servides.	DCF-06
RF-MAP-24	L'eliminació de compte d'un usuari HA DE revocar automàticament les seves estacions públiques.	DCF-06
RF-MAP-25	Els camps afectats per DEFECT-01 NO PODEN aparèixer en cap superfície pública fins que la seva semàntica sigui validada.	DCF-06
8. Requisits no funcionals
ID	Requisit	Traça
RNF-MAP-01	El rendiment HA DE definir dataset, dispositiu, navegador, cache, mètrica i percentil.	REQ-06
RNF-MAP-02	La interfície HA DE ser usable amb teclat, focus visible i sense keyboard trap.	REQ-06
RNF-MAP-03	La conformitat objectiu HA DE ser WCAG 2.2 AA, llevat de requisit contractual contrari.	REQ-06
RNF-MAP-04	Mapa i llista HAN DE reflow sense pèrdua d'informació ni funcionalitat.	REQ-06
RNF-MAP-05	Color, mida o icona no poden ser l'únic canal d'estat.	REQ-06
RNF-MAP-06	Cap request de navegador pot anar a un origen no autoritzat.	SPIKE-04 / SPEC-10
RNF-MAP-07	Cap secret, valor intern ni dada INTERNAL_ONLY pot aparèixer en logs o errors públics.	SPIKE-04 / SPEC-10
RNF-MAP-08	La degradació del mapa HA DE conservar llista, cerca i fitxa pública.	REQ-06
RNF-MAP-09	SPEC-06 CONSUMEIX el resultat del consentiment i la publicació; NO implementa el flux de consentiment. Aquest és responsabilitat de SPEC-01 i SPEC-02.	DCF-06
RNF-MAP-10	La ubicació pública per defecte HA DE ser aproximada, no precisa.	REQ-06
RNF-MAP-11	El grau d'aproximació HA DE ser configurable pel titular de les dades (mínim X metres, a definir).	REQ-06
RNF-MAP-12	L'API pública HA DE tenir un límit de peticions per IP per evitar abús.	REQ-06
RNF-MAP-13	Si s'usa analytics, HA DE ser respectuós amb la privacitat (sense cookies, sense fingerprinting).	REQ-06
RNF-MAP-14	Abans de MAP-C (publicació), s'han d'executar tests de càrrega per validar el rendiment sota concurrència.	REQ-06
RNF-MAP-15	La cache del navegador HA DE respectar el catalog_version i no mostrar dades despublicades.	DCF-06
RNF-MAP-16	La despublicació HA DE propagar-se a totes les caches controlades en ≤ 60 s.	DCF-06
RNF-MAP-17	El rellotge del servidor HA D'estar sincronitzat via NTP.	DCF-06
9. Criteris d'acceptació de MAP-A local
MAP-A és l'única fase que pot preparar-se abans de dades reals. Usa
exclusivament fixtures sintètiques.

ID	Criteri
CA-MAP-01	El catàleg sintètic usa classificació pública explícita a nivell d'estació, sensor i camp.
CA-MAP-02	Mapa, llista, resum i fitxa mostren el mateix conjunt públic.
CA-MAP-03	Proves negatives demostren absència d'elements INTERNAL_ONLY a totes les superfícies.
CA-MAP-04	Navegació de teclat, focus, diàleg i llista alternativa passen proves definides.
CA-MAP-05	Gràfiques o resums històrics sintètics tenen alternativa textual equivalent.
CA-MAP-06	No hi ha requests de navegador a origen no autoritzat.
CA-MAP-07	Proves E2E sintètiques passen sense violacions CSP.
CA-MAP-08	La interrupció de la capa cartogràfica no filtra dades i conserva llista i fitxa.
CA-MAP-09	L'estat buit, l'estat de càrrega i l'estat d'error es mostren correctament.
CA-MAP-10	Els duplicats d'estacions es mostren segons la política definida (DCF-11).
CA-MAP-11	La interfície és disponible en català.
CA-MAP-12	L'API pública té rate limiting actiu.
CA-MAP-13	Una estació despublicada s'elimina de la cache del navegador en ≤ 60 s.
CA-MAP-14	Si el catalog_version no es pot verificar, no es mostren dades de cache.
CA-MAP-15	El modal i la fitxa mostren el contracte mínim comú i el contracte específic per tipus.
CA-MAP-16	La llista alternativa mostra totes les estacions que passen filtres, independentment del viewport.
CA-MAP-17	Una consulta a un public_station_id no visible retorna 404 sense distingir la causa.
CA-MAP-18	L'API pública retorna el catalog_version corresponent.
CA-MAP-19	Un camp afectat per DEFECT-01 no apareix a cap superfície pública.
CA-MAP-20	Una estació amb sensors de classificació diferent només publica els sensors PUBLIC_ALLOWED.
MAP-B i MAP-C no s'autoritzen amb aquest document.

10. Riscos
ID	Risc	Impacte	Mitigació requerida
R-MAP-01	Exposició de dades INTERNAL_ONLY	Crític	Filtre backend fail-closed i proves negatives
R-MAP-02	Ubicació precisa sense consentiment	Alt	Contracte de precisió i publicació
R-MAP-03	Nuls, zeros o dades sospitoses mal interpretades	Alt	Contracte de qualitat i DEFECT-01
R-MAP-04	Dependència cartogràfica incompatible amb zero egress	Alt	Política de request i fallback
R-MAP-05	Divergència entre mapa i llista textual	Alt	Contracte compartit i proves d'equivalència
R-MAP-06	Rendiment no reproduïble	Mitjà	Benchmark normatiu complet
R-MAP-07	Actors o rols no definits	Alt	Excloure'ls de MAP-A fins a SPEC-01
R-MAP-08	Cache mostra dades despublicades	Crític	catalog_version + invalidació activa ≤ 60 s
R-MAP-09	Estacions duplicades visibles	Mitjà	Política de duplicats al catàleg (DCF-11)
R-MAP-10	Abús de l'API pública	Mitjà	Rate limiting
R-MAP-11	Modal/fitxa no s'adapta al tipus d'estació	Alt	Contracte específic per tipus
R-MAP-12	Dependència de DCF no resolta	Crític	Gates ampliades
R-MAP-13	Camp afectat per DEFECT-01 publicat per error	Alt	Classificació a nivell de camp
R-MAP-14	Estació eliminada d'usuari encara pública	Alt	Protocol automàtic de revocació
11. Traçabilitat QA-06 → SPEC-06 v0.5
Finding QA-06	Severitat	Resolució a v0.5
QA-06-01	BLOQUEJANT	§3.1 (classificació a 3 nivells) + §3.2 (regla de visibilitat efectiva)
QA-06-02	BLOQUEJANT	§4.1 (quatre eixos ortogonals) + §4.2 (estat presentable derivat)
QA-06-03	BLOQUEJANT	§3.5 (catalog_version) + §5.4 (revocació 8 passos) + §6.6 (cache)
QA-06-04	BLOQUEJANT	§6.3 (contracte mínim comú + específic per tipus)
QA-06-05	BLOQUEJANT	§11.2 (gates ampliades: DCF-04, 08, 11)
QA-06-06	IMPORTANT	RF-MAP-08 (definit: totes les estacions filtrades, no viewport)
QA-06-07	IMPORTANT	RNF-MAP-09 (SPEC-06 consumeix, no implementa)
12. Decisions pendents i gates
12.1 Decisions pendents
ID	Decisió	Estat	Bloqueja
DCF-02	Classificació de camps, fonts i visibilitat	RESOLT (DCF-06 v1.1)	—
DCF-03	Qualitat, sospita i revisió	RESOLT (DCF-06 v1.1)	—
DCF-04	Històrics, agregació i retenció	PENDENT	Gràfiques i estadístiques
DCF-07	Requisits de motor cartogràfic	RESOLT (DCF-06 v1.1)	—
DCF-08	Àmbit geogràfic i ubicació	PENDENT	Experiència inicial
DCF-09	Consentiment, aprovació i despublicació	RESOLT (DCF-06 v1.1)	—
DCF-10	Llicència i republicació de fonts externes	PENDENT	ACA/Open-Meteo públics
DCF-11	Política de duplicats d'estacions	PENDENT	Catàleg
DCF-12	Idiomes suportats	PENDENT	Interfície
12.2 Gates per iniciar PLAN-06
No es pot iniciar PLAN-06 mentre aquestes decisions no tinguin resolució
aprovada o l'MVP les exclogui explícitament:

DCF	Motiu	Estat
DCF-02	Classificació pública afecta §3, §6.1 i RF-MAP-01/12	✅ RESOLT
DCF-03	Qualitat afecta §4 i §6.2	✅ RESOLT
DCF-04	Històrics afecten RF-MAP-06 i CA-MAP-05	⏳ PENDENT
DCF-07	Motor cartogràfic afecta §6.4	✅ RESOLT
DCF-08	Àmbit geogràfic afecta RF-MAP-06 i RNF-MAP-10/11	⏳ PENDENT
DCF-09	Consentiment afecta §6.1 i RNF-MAP-09	✅ RESOLT
DCF-11	Duplicats afecten CA-MAP-10	⏳ PENDENT
Conclusió: PLAN-06 pot iniciar-se quan DCF-04, DCF-08 i DCF-11 tinguin
resolució aprovada o l'MVP les exclogui explícitament. Si l'MVP exclou alguna
d'aquestes, cal documentar-ho i ajustar els RF/CA dependents.

13. Pipeline SDD
Contrastar la SPEC amb el contingut complet de SPEC-00 v0.5.

Resoldre les DCF pendents (DCF-04, DCF-08, DCF-11) amb especialistes.

Fer QA documental de SPEC-06 v0.5.

Aprovar explícitament la SPEC-06.

Redactar PLAN-06.

Fer QA del PLAN-06, TASKS-06 i implementació local sintètica.

14. Referències
SPEC-00 v0.5 — font paraigua pendent de contrast íntegre.

SPEC-10 v0.3 — fase A local aprovada.

SPIKE-04 v1.1 — frontera INTERNAL_ONLY.

DCF-06 v1.1 — resolució de DCF-02, DCF-03, DCF-07, DCF-09.

DEFECT-01 — semàntica de zeros Ecowitt caracteritzada, no corregida.

WCAG 2.2 i pràctiques WAI-ARIA — referència d'accessibilitat.

Spatial Data on the Web Best Practices — publicació de dades geoespacials.

GDPR (Reglament UE 2016/679) — protecció de dades personals.

QA-06 v1.0 — QA funcional de SPEC-06 v0.3.

15. Historial
Versió	Data	Canvi
0.1	2026-09-12	Esborrany reconstruït a partir de fragments
0.2	2026-09-16	Refinament: frontera fail-closed, bloquejos de contracte, accessibilitat, qualitat i cartografia
0.3	2026-09-16	Afegits: estats buit/càrrega/error, duplicats d'estacions, GDPR, modal vs. fitxa, sitemap, rate limiting, idioma, tests de càrrega
0.4	2026-09-16	Resolts 5 bloquejants + 2 importants del QA-06: model a dos nivells, eixos d'estat, cache, contracte mínim modal/fitxa, gates, llista equivalent, GDPR
0.5	2026-09-16	Incorporades resolucions de DCF-06 v1.1: classificació a tres nivells (estació/sensor/camp), catalog_version, DEFECT-01 com a condició de camp, revocació amb 8 passos, eliminació de compte, no enumeració 404, nous RF (22-25), nous RNF (17), nous CA (17-20). Afegida traçabilitat explícita QA-06 → SPEC-06 v0.5 (§11).