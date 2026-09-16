# DCF-06 v1.1 — Resolució dels DCF bloquejants de SPEC-06

**Versió:** 1.1
**Estat:** CANDIDATA A RATIFICACIÓ
**Data:** 2026-09-16
**SPEC afectada:** SPEC-06
**Abast:** DCF-02, DCF-03, DCF-07 i DCF-09
**Naturalesa:** Resolució documental; no autoritza implementació ni dades reals per si sola.

## 1. Resultat

| DCF | Estat proposat | Efecte |
|---|---|---|
| DCF-02 | RESOLT | Desbloqueja contracte de catàleg i API pública |
| DCF-03 | RESOLT | Desbloqueja model de qualitat; cada font real necessita perfil propi |
| DCF-07 | RESOLT | Desbloqueja PLAN-06 sense seleccionar motor cartogràfic |
| DCF-09 | RESOLT | Desbloqueja contracte de publicació; identitat i rols reals continuen subjectes a SPEC-01 |

`RESOLT` significa que existeix una decisió normativa suficient per continuar el pipeline. No significa `APROVAT`: la ratificació continua requerint l'acte de governança corresponent.

## 2. DCF-02 — Classificació de camps, fonts i visibilitat

### 2.1 Decisió

La publicació aplica un model `default-deny` amb dues classificacions normatives:

- `PUBLIC_ALLOWED`: el recurs, sensor o camp pot formar part d'una resposta pública si compleix també tots els gates aplicables.
- `INTERNAL_ONLY`: el recurs, sensor o camp no pot aparèixer ni ser inferible des de cap superfície pública.

No existeix cap estat implícit de publicació.

Una classificació absent, desconeguda, caducada, inconsistent o que no es pugui verificar equival a `INTERNAL_ONLY`.

La visibilitat efectiva s'avalua com a mínim a nivell d'estació, sensor i camp:
PUBLIC(field) =
source.publication_allowed
AND station.classification == PUBLIC_ALLOWED
AND sensor.classification == PUBLIC_ALLOWED
AND field.classification == PUBLIC_ALLOWED
AND publication_approval == APPROVED
AND consent_gate == SATISFIED
AND quality_gate != NO_PUBLICABLE

text

Quan no existeixi el nivell `sensor` per a una font determinada, aquest gate pot considerar-se estructuralment no aplicable, però mai pot convertir un camp no classificat en públic.

Qualsevol resultat `false`, `null`, error de lectura o contracte desconegut HA DE produir un resultat no públic.

### 2.2 Catàleg normatiu

Cada entrada classificable HA DE conservar com a mínim:
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

text

`public_station_id` HA DE ser estable i opac. NO POT reutilitzar identificadors interns d'usuari, dispositiu, proveïdor, serial, MAC o equivalents.

### 2.3 Versionat global del catàleg

A més de `classification_version` per element classificable, el catàleg global HA DE mantenir un `catalog_version`.

`catalog_version` HA DE canviar amb qualsevol modificació que pugui alterar el conjunt o contingut públic, incloent com a mínim:

- Publicació d'una estació.
- Despublicació.
- Canvi de classificació d'estació.
- Canvi de classificació de sensor.
- Canvi de classificació de camp.
- Canvi de política que modifiqui la visibilitat efectiva.

El valor HA DE ser monòton o equivalentment inequívoc per detectar una versió anterior del catàleg.

L'API pública HA DE retornar el `catalog_version` corresponent a les dades servides.

El frontend, abans de reutilitzar dades procedents de cache, HA DE poder comprovar que corresponen a una versió encara vàlida del catàleg.

Una cache amb `catalog_version` anterior NO POT considerar-se autoritativa quan existeix una versió posterior coneguda.

La invalidació explícita definida a DCF-09 continua essent obligatòria: `catalog_version` és una defensa addicional i no substitueix la purga de caches.

### 2.4 Sensors múltiples

Els sensors individuals d'una mateixa estació poden tenir classificacions diferents.

Exemple admissible:
station = PUBLIC_ALLOWED

temperature_sensor = PUBLIC_ALLOWED
humidity_sensor = PUBLIC_ALLOWED
diagnostic_sensor = INTERNAL_ONLY

text

La publicació s'avalua independentment per sensor/camp. L'autorització pública de l'estació NO implica l'autorització automàtica de tots els sensors que conté.

### 2.5 Conjunt públic

Per a una estació autoritzada, el conjunt mínim pot incloure:

- Identificador públic.
- Nom públic.
- Ubicació generalitzada segons DCF-08.
- Estat de disponibilitat/qualitat.
- `observed_at`.
- Temperatura actual autoritzada.
- Humitat actual autoritzada.
- Procedència pública de la font.

Són `INTERNAL_ONLY` per defecte:

- Coordenades precises originals.
- Identificadors d'usuari.
- MAC, serial o device ID.
- Credencials.
- Tokens i claus API.
- URLs internes.
- Payloads crus.
- Errors interns.
- Camps diagnòstics.
- Metadades no aprovades.
- Sensors no classificats.
- Camps no classificats.

«Tots els camps públics» a RF-MAP-06 significa tots els camps amb classificació efectiva `PUBLIC_ALLOWED`. NO significa tots els camps disponibles a la font original.

### 2.6 Classificació inicial de fonts

| Font | Resolució |
|---|---|
| Fixtures sintètiques | `PUBLIC_ALLOWED` exclusivament dins MAP-A |
| Ecowitt d'usuari | Elegible només després de DCF-09, perfil de qualitat i classificació explícita |
| Camps afectats per DEFECT-01 | `INTERNAL_ONLY` fins a validació semàntica |
| ACA/hidrologia | `INTERNAL_ONLY` fins a resolució favorable de DCF-10 |
| Open-Meteo | `INTERNAL_ONLY` fins a resolució favorable de DCF-10 |
| Grafana/i2CAT | `INTERNAL_ONLY` durant tota SPEC-06 |

Que una font sigui accessible tècnicament NO implica autorització de republicació.

### 2.7 No enumeració

Una consulta pública a un `public_station_id` no visible HA DE comportar-se com un recurs inexistent.

Resposta pública esperada:

```http
404 Not Found
La resposta NO POT permetre diferenciar:

Identificador inexistent.

Estació INTERNAL_ONLY.

Estació revocada.

Estació pendent d'aprovació.

3. DCF-03 — Qualitat, sospita i revisió
3.1 Decisió
La qualitat es calcula al backend utilitzant un rellotge de referència UTC.

Cada font real HA DE disposar d'un quality_profile_id versionat.

Els llindars específics de cada font, sensor o magnitud pertanyen al perfil de qualitat i no al codi de presentació del mapa.

Per defecte:

text
freshness_limit = max(30 minuts, 3 × expected_update_interval)
Si expected_update_interval no està definit, una mesura NO POT presentar-se com a dada actual fiable.

Una observació amb observed_at > server_now + 5 minuts es considera SOSPITOSA.

També és sospitosa una mesura quan es produeix, entre altres:

Valor no finit quan se n'espera un de numèric.

Unitat incompatible.

Humitat fora de [0,100].

Timestamp inconsistent.

Valor fora del rang declarat al quality_profile.

Variació superior al màxim declarat.

Error explícit reportat per l'adaptador.

No s'estableixen límits meteorològics universals inventats. Cada camp publicable HA DE declarar al seu perfil, quan correspongui:

text
unit
valid_range
expected_update_interval
max_rate_of_change
validation_rules
3.2 Nuls i zeros
null significa desconegut/no disponible. NO es converteix silenciosament en zero, interpolació ni valor anterior.

Un valor 0 només es considera una observació real si la semàntica de la font/camp ho confirma.

3.3 Estats
Estat	Comportament públic
DISPONIBLE	Es poden mostrar valors actuals autoritzats
SENSE_DADES_RECENTS	L'estació pot continuar visible; la dada antiga no es presenta com a actual
SOSPITOSA	L'estació pot continuar visible; els camps afectats no es presenten com a dades fiables
EN_REVISIO	L'estació pot continuar visible si DCF-02/09 ho permeten; les mesures sotmeses a revisió no es publiquen
NO_PUBLICABLE	L'estació queda exclosa de totes les superfícies públiques
Qualitat de l'estació i classificació de camps són dimensions diferents.

3.4 DEFECT-01
DEFECT_01_AFFECTED NO és un nou estat global de qualitat de l'estació. És una condició aplicada als camps afectats.

Els camps afectats per DEFECT-01 es tracten com INTERNAL_ONLY a efectes de publicació fins que la seva semàntica sigui validada.

Això és independent de l'estat global de l'estació.

Exemple:

text
station.status = DISPONIBLE

temperature = PUBLIC_ALLOWED
humidity    = PUBLIC_ALLOWED
rain        = DEFECT_01_AFFECTED -> INTERNAL_ONLY
En aquest cas l'estació continua visible i temperatura/humitat es poden publicar, però rain no apareix en:

API pública.

Marcador.

Modal.

Fitxa.

Històrics.

Gràfiques.

Filtres.

Agregats.

Cache pública.

La resolució de DEFECT-01 HA DE provocar una nova classificació explícita abans que el camp pugui esdevenir PUBLIC_ALLOWED.

3.5 Transicions
Una dada fresca i vàlida pot provocar:

text
SENSE_DADES_RECENTS -> DISPONIBLE
Una estació entra automàticament en EN_REVISIO quan acumula, per defecte:

text
3 observacions SOSPITOSA
d'entre les 5 darreres observacions avaluades
El quality_profile pot substituir aquesta regla si existeix una decisió aprovada i versionada.

Sortir d'EN_REVISIO requereix el capability DATA_REVIEWER. La correspondència entre aquest capability i usuaris/rols concrets correspon a SPEC-01.

3.6 Auditoria
Els canvis d'estat HAN DE registrar internament com a mínim:

text
timestamp
previous_state
new_state
triggered_rule
quality_profile_id
quality_profile_version
Aquesta informació és INTERNAL_ONLY.

4. DCF-07 — Requisits del motor cartogràfic
4.1 Decisió
DCF-07 defineix criteris d'admissibilitat. NO selecciona motor, llibreria JS, proveïdor, format raster/vector, sistema de tiles ni infraestructura concreta.

El component seleccionat posteriorment per PLAN-06 HA DE complir simultàniament:

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
Si un proveïdor requereix requests directes des del navegador o contractualment impedeix el mecanisme necessari de control/proxy/cache, és NO ELEGIBLE per PLAN-06.

La indisponibilitat del mapa NO POT alterar el conjunt d'estacions autoritzades ni desencadenar cap fallback cap a dades internes.

5. DCF-09 — Consentiment, aprovació i despublicació
5.1 Decisió
Per a estacions aportades per usuaris, publicar una estació és una operació diferent de donar-la d'alta o utilitzar-la privadament.

Workflow normatiu:

text
INTERNAL_ONLY
    |
    | owner opt-in
    v
PENDING_APPROVAL
    |
    | publication approval
    v
PUBLIC_ALLOWED
    |
    | withdrawal
    | administrative revocation
    | account deletion
    | NO_PUBLICABLE
    v
REVOKED
REVOKED NO pot tornar automàticament a PUBLIC_ALLOWED. Una nova publicació requereix una nova seqüència d'autorització aplicable.

5.2 Consentiment
Quan sigui la base aplicable, el consentiment HA DE ser:

Opt-in.

Separat de condicions no relacionades.

Comprensible.

Registrable.

Revocable.

Granular respecte de les dades publicades.

Granular respecte de la ubicació generalitzada.

El sistema HA DE conservar internament un rebut de consentiment amb com a mínim:

text
subject
station
scope
policy_version
timestamp
language
current_status
El consentiment NO es dedueix de l'ús ordinari del servei.

5.3 Aprovació
Abans de publicar, el capability PUBLICATION_APPROVER HA DE verificar:

Classificació DCF-02.

Consentiment quan correspongui.

Política de precisió geogràfica.

Perfil DCF-03.

Procedència.

Llicència o base jurídica aplicable.

PUBLICATION_APPROVER i DATA_REVIEWER són capabilities de domini. SPEC-01 definirà els usuaris, grups, permisos o rols concrets que els implementen. MAP-A pot simular aquestes decisions amb fixtures.

5.4 Revocació
La retirada del consentiment o una despublicació administrativa HA DE:

text
1. canviar l'estat autoritatiu a no públic;
2. impedir noves respostes de l'API pública;
3. incrementar catalog_version;
4. invalidar mapa i cerca;
5. invalidar resum i fitxa;
6. purgar caches controlades;
7. retirar l'URL del sitemap;
8. registrar l'operació en auditoria interna.
L'origin HA DE deixar de servir la dada quan es confirma la transacció autoritativa de revocació.

Les caches públiques HAN DE disposar d'invalidació explícita per public_station_id.

No s'accepta un TTL llarg com a únic mecanisme de revocació.

Objectiu operatiu:

text
invalidació de totes les caches controlades <= 60 segons
A partir de la invalidació, les URL retirades han de respondre com a recurs no existent.

5.5 Eliminació de compte
Quan un usuari completa l'eliminació del seu compte segons SPEC-01, totes les estacions públiques vinculades a aquell compte passen automàticament a REVOKED.

Aquesta transició HA DE produir el mateix procés d'invalidació que qualsevol altra revocació.

La publicació NO es restaura automàticament si la mateixa persona crea posteriorment un compte nou.

Qualsevol nova publicació requereix un nou procés d'alta, consentiment quan correspongui i aprovació.

5.6 Despublicació vs. supressió
Despublicar significa retirar una dada de les superfícies públiques. No equival necessàriament a eliminar totes les dades internes.

Quan sigui aplicable un dret o obligació de supressió, aquest procés s'ha de gestionar conforme al contracte específic de privacitat i retenció.

La resposta 404, la retirada del sitemap i la invalidació de caches sota control de MeteoLord no poden garantir l'eliminació immediata de còpies prèviament obtingudes per tercers.

5.7 Auditoria
La revocació HA DE registrar com a mínim:

text
actor_or_capability
previous_state
new_state
reason
timestamp
consent_version
classification_version
catalog_version
cache_invalidation_result
Aquesta auditoria és INTERNAL_ONLY.

6. Gate resultant per PLAN-06
Després de ratificar aquest document:

text
DCF-02 = RESOLT
DCF-03 = RESOLT
DCF-07 = RESOLT
DCF-09 = RESOLT
Queda satisfeta la condició explícita de SPEC-06 que impedia iniciar PLAN-06 per aquests quatre DCF.

Això NO autoritza indiscriminadament dades reals. Continuen aplicant-se els gates següents:

Decisió	Conseqüència
DCF-10	Continua bloquejant publicació ACA/Open-Meteo fins a resolució
DCF-04	Continua condicionant històrics, agregacions i retenció reals
DCF-08	Ha de concretar àmbit i precisió geogràfica
DCF-11	Necessari per donar per superat CA-MAP-10
SPEC-01	Necessari per identitat, compte i assignació real dels capabilities
MAP-A continua limitat a fixtures sintètiques fins que els gates de dades reals estiguin resolts.

7. Tancament dels gaps de v1.0
Gap	Resolució v1.1
QA-06-03 / cache vs. despublicació	Afegit catalog_version, retorn per API, validació de cache i increment en revocació
DEFECT-01 no representat explícitament	Definit com a condició de camp independent de l'estat global de l'estació
Eliminació de compte	Definida transició automàtica de totes les publicacions associades a REVOKED
Addicionalment, s'explicita que la classificació és independent per sensor/camp.

8. Decisió de ratificació proposada
Text proposat per a l'acta o registre de decisió:

Es ratifica DCF-06 v1.1 com a resolució normativa de DCF-02, DCF-03, DCF-07 i DCF-09. Les quatre decisions passen a estat RESOLT i poden incorporar-se a SPEC-06 v0.5. Aquesta ratificació permet iniciar PLAN-06 després del QA i aprovació de SPEC-06 v0.5, sense autoritzar fonts o dades reals que continuïn condicionades per altres DCF, SPEC-01 o contractes de privacitat/llicència.

9. Historial
Versió	Data	Canvi
1.0	2026-09-16	Resolució inicial de DCF-02, DCF-03, DCF-07 i DCF-09
1.1	2026-09-16	Afegits catalog_version, classificació per sensor, tractament explícit de DEFECT-01 i eliminació de compte
text

---

## 📄 FITXER 3 de 3 — `docs/sdd/SPEC-06-mapa-public-estacions.md` (v0.5)

Aquest fitxer és molt llarg. El tens ja al xat en el meu missatge anterior (bloc "SPEC-06 v0.5"). **Copia'l d'allà** i desa'l com `docs/sdd/SPEC-06-mapa-public-estacions.md`.

Si vols que te'l torni a generar en aquest mateix bloc per comoditat, digues-m'ho i el repeteixo.

---

## 🎯 Després de crear els 3 fitxers

### Verificació ràpida

```bash
# Comprova que existeixen i que la capçalera de SPEC-06 diu v0.5
head -20 docs/sdd/SPEC-06-mapa-public-estacions.md
head -20 docs/sdd/DCF-06-v1.1-resolucio-bloquejants-spec-06.md
head -20 docs/sdd/QA-06-SPEC-06-v0.3.md