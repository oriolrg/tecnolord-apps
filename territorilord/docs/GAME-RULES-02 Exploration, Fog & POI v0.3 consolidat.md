# TerritoriLord — Game Rules 02: Exploration, Fog & POI

**Versió:** v0.3 consolidada
**Estat:** regles funcionals per revisió
**Data:** 2026-09-18

---

# 1. Objectiu

Aquest document defineix les regles de:

* exploració;
* Fog of War;
* coneixement;
* descoberta;
* POI;
* cims;
* turisme;
* DiscoveryAccess.

No defineix:

* resolucions H3 definitives;
* intervals exactes;
* ClaimRadius;
* recompenses numèriques.

---

# 2. Principi rector

> **El mapa ha de donar prou informació per despertar curiositat, però no tanta com per eliminar la necessitat d'explorar físicament.**

El Fog no serveix només per amagar.

Serveix per crear:

```text
curiositat
↓
desplaçament físic
↓
descoberta
↓
nou coneixement
```

---

# 3. Exploration

`Exploration` representa haver estat físicament en una zona.

És una dada històrica permanent.

Quan una zona ha estat explorada:

> el sistema no torna a afirmar que l'usuari mai hi havia estat.

---

# 4. PhysicalDiscovery

Un element es considera físicament descobert quan el jugador compleix les condicions de presència requerides.

Pot aplicar a:

* ExplorationCell;
* Flag;
* POI;
* Summit.

---

# 5. Exploration i Knowledge són independents

Un jugador pot haver explorat una zona però tenir informació obsoleta.

Exemple:

```text
Exploration = YES
KnowledgeState = HISTORICAL
```

També pot tenir:

```text
Exploration = YES
TerritoryOwner = OTHER_PLAYER
```

No s'han de fusionar aquests conceptes.

---

# 6. Knowledge

Knowledge és la informació actual coneguda pel jugador.

Pot incloure:

* territori;
* propietari;
* Flags;
* Defense aproximada;
* POI;
* canvis recents.

Knowledge pot degradar-se.

---

# 7. Estats de Knowledge

Model conceptual:

```text
UNKNOWN
DETECTED
DISCOVERED
STALE
HISTORICAL
```

No tots necessiten implementar-se des de la primera fase.

---

# 8. UNKNOWN

La zona no té coneixement significatiu.

Pot mostrar:

* cartografia base;
* informació pública;
* senyals molt limitats.

No mostra informació tàctica completa.

---

# 9. DETECTED

El jugador detecta que existeix alguna cosa.

Exemples:

```text
🚩 ?
🏔 ?
💧 ?
★ ?
```

`DETECTED` no implica saber:

* ubicació exacta;
* propietari;
* Defense;
* detalls complets.

---

# 10. DISCOVERED

El jugador ha explorat físicament la zona o element i disposa d'informació actual.

---

# 11. STALE

El jugador hi havia estat però la informació ja no és prou actual.

Es pot degradar:

* precisió;
* propietat;
* detalls;
* status.

---

# 12. HISTORICAL

L'usuari conserva principalment:

> «Jo havia estat aquí.»

Però no necessàriament:

> «Sé què hi passa ara.»

---

# 13. Degradació gradual

No s'utilitzarà una regla conceptual del tipus:

```text
day 364 = perfect knowledge
day 365 = zero knowledge
```

La degradació ha de ser progressiva.

Els intervals exactes es determinaran experimentalment.

---

# 14. KnowledgeRetention

La velocitat de degradació depèn de més factors que el temps.

Poden contribuir:

```text
recency
+
territorial presence
+
controlled Flags
+
recent Activities
+
POI relationship
+
local presence
```

---

# 15. Territori propi

Controlar territori pot:

> alentir la degradació del Knowledge.

No actualitza automàticament tot el que hi passa.

---

# 16. Flags com knowledge anchors

Una Flag pròpia/controlada pot ajudar a conservar coneixement al seu entorn.

L'efecte:

* és limitat;
* disminueix amb distància;
* no crea omniscència.

---

# 17. POI com anchor menor

Una relació significativa amb POI pot ajudar modestament a retenir coneixement.

L'efecte és inferior al d'una presència territorial forta.

---

# 18. Activitat recent

Activities recents refresquen el coneixement de les zones físicament recorregudes.

---

# 19. Pèrdua de domini

Quan el jugador:

* perd territori;
* perd Flags;
* deixa d'estar actiu;

Knowledge pot degradar-se més ràpidament.

---

# 20. Domain ≠ omniscience

Regla obligatòria:

```text
Own territory
≠
automatic knowledge of all new events
```

Per exemple:

una nova UserFlag rival no ha d'aparèixer automàticament amb informació completa perquè estigui dins una zona antigament coneguda.

---

# 21. Signals sota Fog

Elements rellevants poden generar una pista abans de ser descoberts.

La pista pot revelar:

* categoria;
* àrea aproximada;
* intensitat.

No necessàriament:

* coordenada exacta;
* propietari;
* Defense.

---

# 22. Intensitat del signal

Per una Flag, un signal més intens pot estar relacionat amb:

* importància;
* notorietat;
* rol públic.

No s'ha d'utilitzar simplement com un indicador exacte de Defense.

---

# 23. PublicFlagSite i Fog

Cada PublicFlagSite pot disposar d'una política de visibilitat.

Conceptualment:

```text
PUBLIC_VISIBLE
FOG_DETECTED
FOG_HIDDEN
```

Exemples:

## Gran fita turística

Pot ser `PUBLIC_VISIBLE`.

## Objectiu competitiu

Pot ser `FOG_DETECTED`.

---

# 24. UserFlag i Fog

Una UserFlag no descoberta no necessita revelar:

* ubicació exacta;
* owner;
* Defense.

Pot generar només un signal.

---

# 25. Discover Flag ≠ Attack Flag

Descobrir una Flag és una acció d'exploració.

Atacar-la requereix una Activity posterior explícita amb `FlagTarget`.

Flux normal:

```text
DETECTED
↓
physical exploration
↓
DISCOVERED
↓
player evaluates target
↓
new ATTACK_FLAG Activity
```

Això pot generar deliberadament dues sortides diferents.

---

# 26. Actualització per visita

Passar físicament per una Flag sense atacar pot:

* descobrir-la;
* refrescar Knowledge;
* registrar FlagVisit;
* contribuir a Importance;
* donar progressió legítima.

No genera PvP.

---

# 27. ExplorationCell

L'exploració es representarà inicialment amb cel·les geoespacials.

H3 és la primera opció.

La resolució és PENDENT de `EXPERIMENTS-00`.

---

# 28. ExplorationCell vs TerritoryCell

S'utilitzarà inicialment el mateix sistema geoespacial però amb resolucions diferents.

Principi:

```text
ExplorationCell
→ més detall

TerritoryCell
→ menys detall
```

Per tant:

> una TerritoryCell pot estar només parcialment explorada.

---

# 29. POI

Un `POI` representa un punt d'interès.

Pot ser:

```text
SystemPOI
CommunityPOI
SponsoredPOI
```

---

# 30. Categories POI

Exemples possibles:

* water;
* refuge;
* viewpoint;
* natural;
* historical;
* cultural;
* trail feature;
* service.

La taxonomia definitiva és PENDENT.

---

# 31. SystemPOI

Creat/importat per:

* sistema;
* fonts autoritzades;
* administrador.

No necessita reputació comunitària per existir.

---

# 32. CommunityPOI

Creat per un User.

Es recomana que el creador:

> sigui físicament al lloc durant la creació.

Pot requerir:

* location;
* category;
* name;
* description.

---

# 33. POI sense camí cartografiat

L'absència d'un sender cartografiat no invalida un POI.

Pot existir en:

* cim;
* clariana;
* roca;
* font;
* punt natural.

La cartografia és evidència, no autoritat absoluta.

---

# 34. Accessibilitat

Un POI ha de tenir relació amb un lloc físicament legítimament accessible.

No s'ha d'incentivar:

* propietat privada;
* zones prohibides;
* accessos perillosos.

---

# 35. POIVisit

Una visita pot:

* confirmar existència;
* refrescar Knowledge;
* generar XP;
* validar comunitàriament el POI.

---

# 36. Visites repetides

Un mateix User visitant repetidament un POI no ha de tenir el mateix pes que molts usuaris independents.

S'aplicaran:

* diminishing returns;
* unique-user weighting;
* anti-farming.

---

# 37. Valor del creador

Crear molts POI no genera automàticament gran Reputation.

La contribució adquireix valor quan:

> altres jugadors la troben útil i la visiten realment.

---

# 38. Reports

Un CommunityPOI pot denunciar-se per:

```text
NON_EXISTENT
DUPLICATE
PRIVATE_PROPERTY
WRONG_LOCATION
DANGEROUS_ACCESS
INAPPROPRIATE_CONTENT
```

o equivalents.

---

# 39. Report no és eliminació

Una denúncia:

```text
Report
≠
automatic deletion
```

Cal evitar que rivals eliminin contingut legítim mitjançant denúncies coordinades.

---

# 40. Moderation

La resolució pot considerar:

* evidència;
* Reputation;
* independència dels reporters;
* historial;
* gravetat.

Casos de seguretat poden justificar restriccions temporals preventives.

---

# 41. Summit

Un `Summit` és una fita geogràfica persistent.

No és automàticament:

* territori;
* Flag;
* POI propietat d'un User.

Pot coexistir amb aquests elements.

---

# 42. Primera visita a Summit

Pot generar:

* XP;
* Achievement;
* DiscoveryPower;
* historial permanent.

Les repeticions no han de replicar indefinidament la recompensa inicial.

---

# 43. Turista

Un turista pot explorar exactament igual que un resident.

La novetat territorial pot fer el viatge especialment ric en:

* Exploration;
* Summit;
* POI;
* Discovery.

---

# 44. Local

El jugador local obté avantatge emergent per:

* visites repetides;
* Knowledge actual;
* domini;
* defensa.

No per haver declarat una residència.

---

# 45. Travel history

L'exploració feta durant un viatge continua permanentment a l'historial.

Quan el jugador marxa:

* PhysicalDiscovery persisteix;
* Knowledge pot degradar-se;
* territori pot debilitar-se segons les regles normals.

---

# 46. DiscoveryAccess

Una capa separada pot permetre mostrar informació sense haver-la descobert físicament.

Pot provenir de:

* TourismCampaign;
* VisitorPass;
* SponsoredDiscoveryZone;
* altres futurs Entitlements.

---

# 47. Invariant de DiscoveryAccess

```text
DiscoveryAccess
does NOT create
UserExploration
```

El jugador continua havent d'anar físicament al lloc.

---

# 48. TourismCampaign

Una futura campanya pot:

* revelar hints;
* destacar POI;
* suggerir rutes;
* plantejar col·leccions;
* donar challenges.

Exemple:

> **Descobreix 8 indrets del municipi.**

---

# 49. SponsoredDiscoveryZone

Una campanya pot revelar parcialment:

* una zona;
* corredor;
* ruta;
* conjunt de POI.

No necessita descobrir tota una comarca.

---

# 50. Expiració

Quan expira DiscoveryAccess:

## Elements visitats físicament

Continuen a ExplorationHistory.

## Elements només revelats

Tornen a les regles normals de Fog.

---

# 51. SponsoredPOI

POI relacionat amb:

* turisme;
* administració;
* empresa;
* comerç;
* campanya.

Ha d'estar identificat clarament.

---

# 52. Sponsored reward

Un SponsoredPOI pot aportar:

* XP addicional;
* campaign progress;
* achievement;
* badge.

No:

* gran AttackPower;
* gran Defense;
* territory automàtic.

---

# 53. SponsoredClaim

Una recompensa patrocinada es valida al servidor.

Pot requerir:

```text
valid user
+
active campaign
+
valid QR/token
+
current location
+
sufficient accuracy
+
ClaimRadius
+
reuse policy
```

---

# 54. QR no és presència

Invariant:

```text
valid QR
alone
≠
physical visit
```

Una fotografia compartida del QR no ha de permetre obtenir la recompensa remotament.

---

# 55. VISIT_CLAIM

Pot utilitzar-se per:

* comerç;
* museu;
* equipament;
* punt turístic.

No necessita necessàriament una Activity esportiva activa.

---

# 56. ACTIVITY_CLAIM

Pot exigir que:

> la visita es produeixi durant una Activity vàlida.

Útil per:

* circuits;
* rutes esportives;
* challenges outdoor.

---

# 57. Fog i monetització

La monetització pot donar:

> una invitació més clara a explorar.

No:

> una descoberta física falsa.

Ni:

> intel·ligència competitiva privilegiada.

---

# 58. Informació PvP protegida

DiscoveryAccess no ha de revelar automàticament:

* Defense exacta;
* propietari ocult que requeriria descoberta;
* ubicació exacta d'un target competitiu ocult;
* estat tàctic privilegiat.

---

# 59. No pay-to-win

El turisme pot pagar per:

```text
content
hints
routes
campaigns
analytics
discovery experiences
```

No per:

```text
capture
AttackPower
Defense
territory
```

---

# 60. Low-density world

El sistema d'exploració ha de continuar sent interessant encara que hi hagi pocs jugadors.

Ha de poder funcionar amb:

* Fog;
* Summits;
* POI;
* PublicFlagSites neutrals;
* personal history;
* TourismCampaigns.

PvP no pot ser l'única font de valor.

---

# 61. Seguretat física

Fog, POI i orientació no han d'incentivar:

* entrar en propietat privada;
* arribar exactament a un punt perillós;
* abandonar vies segures.

Els radis i validacions s'han d'adaptar a la realitat física.

---

# 62. Privacitat

La descoberta d'una zona per un User no ha de permetre a tercers inferir fàcilment:

* domicili;
* ubicació en viu;
* horaris sensibles.

Exploration i publicació social són capes diferents.

---

# 63. Experiments obligatoris

Abans de tancar els valors cal provar especialment:

```text
EXP-01 Exploration H3 resolution
EXP-03 Exploration/Territory relationship
EXP-08 Flag interaction radius
EXP-10 orientation information
EXP-11 Fog amount
EXP-12 DETECTED usefulness
EXP-13 Knowledge decay
EXP-14 domain retention
EXP-43 rural density
EXP-44 motivation
EXP-45 non-PvP motivation
EXP-48 Sponsored Claim radius
EXP-50 TourismCampaign
```

---

# 64. Regla principal d'exploració

El loop objectiu és:

```text
UNKNOWN
↓
signal
↓
curiosity
↓
physical movement
↓
DISCOVERED
↓
knowledge
↓
time / loss of presence
↓
STALE
↓
reason to return
```

---

# 65. Regla principal turística

```text
DiscoveryAccess
↓
invitation
↓
physical visit
↓
PhysicalDiscovery
↓
permanent history
```

---

# 66. Principi final

> **TerritoriLord pot ajudar el jugador a saber que hi ha alguna cosa per descobrir; no ha de descobrir-la en lloc seu.**
