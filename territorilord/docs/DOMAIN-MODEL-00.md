# TerritoriLord — Model de Domini v0.1

**Estat:** esborrany funcional
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document defineix el model conceptual de TerritoriLord.

No defineix encara:

* esquema SQL;
* endpoints;
* ORM;
* tecnologia geoespacial;
* fórmules definitives;
* arquitectura física.

L'objectiu és identificar:

* entitats;
* responsabilitats;
* relacions;
* estats;
* invariants del joc.

---

# 2. Agregats principals

El domini es divideix inicialment en set àrees:

1. Usuaris i identitat
2. Activitats
3. Exploració
4. Territori
5. Banderes
6. POI i món
7. Comunitat i competició

---

# 3. User

Representa un jugador.

## Responsabilitats

Manté:

* identitat;
* perfil;
* progressió;
* reputació;
* preferències;
* estat del compte.

## Informació conceptual

* id
* username
* email verificat
* display name
* account status
* created at
* level
* XP
* reputation
* active flag allowance

## Relacions

Un User pot tenir:

* moltes Activities;
* moltes exploracions;
* territori;
* banderes;
* visites;
* atacs;
* defenses;
* POI creats;
* denúncies;
* assoliments;
* rivalitats.

---

# 4. Activity

Representa una activitat física registrada.

És una de les entitats centrals del sistema.

## Exemples

* running;
* trail running;
* walking;
* hiking;
* cycling;
* MTB.

## Responsabilitats

Manté:

* inici i final;
* tipus;
* track;
* distància;
* durada;
* desnivell;
* estat de validació;
* objectiu de joc;
* resultat.

## Estats possibles

* recording
* completed
* validating
* valid
* invalid
* rejected

## Invariants

Una activitat:

* pertany a un únic usuari;
* té un únic tipus;
* pot tenir com a màxim un objectiu d'atac;
* no produeix efectes territorials definitius fins que és validada.

---

# 5. ActivityType

Defineix una modalitat esportiva.

## Exemples inicials

* RUNNING
* TRAIL_RUNNING
* WALKING
* HIKING
* CYCLING
* MTB

## Pot definir

* velocitats plausibles;
* distància mínima;
* durada mínima;
* coeficient d'esforç;
* tractament del desnivell;
* criteris territorials.

No s'han de fixar encara els valors.

---

# 6. Track

Representa la trajectòria espacial d'una Activity.

## Pot contenir

Seqüència de mostres:

* latitude;
* longitude;
* altitude;
* timestamp;
* accuracy;
* speed;
* heading.

## Responsabilitats

Permet calcular:

* distància;
* desnivell;
* velocitat;
* tancament de ruta;
* territori;
* visites;
* detecció d'anomalies.

El track original s'ha de conservar separat dels resultats derivats.

---

# 7. ActivityValidation

Representa el resultat de validar una Activity.

## Pot incloure

* valid / invalid;
* motius;
* score de confiança;
* anomalies;
* circularitat;
* coherència GPS;
* velocitat;
* continuïtat.

## Principi

No s'ha de confondre:

> activitat enregistrada

amb

> activitat vàlida per afectar el joc.

---

# 8. ActivityPurpose

Una activitat pot tenir un propòsit explícit.

Inicialment:

* NORMAL
* EXPLORE
* ATTACK_FLAG
* DEFEND_FLAG

Una activitat normal també pot generar exploració i progressió.

---

# 9. CircularActivity

No és necessàriament una entitat persistent separada.

Representa una Activity que compleix les condicions necessàries per generar efectes territorials.

## Condició principal

El final ha d'estar suficientment pròxim a l'inici.

També haurà de complir:

* distància;
* durada;
* coherència;
* validació antiabús.

---

# 10. ExplorationCell

Representa una unitat geogràfica que un usuari ha explorat.

## Responsabilitats

Permet saber:

* si el jugador hi ha estat;
* quan hi va estar;
* quan va actualitzar la informació;
* quin nivell de coneixement conserva.

## Informació conceptual

* user
* cell
* first discovered at
* last visited at
* knowledge state
* visit count

---

# 11. ExplorationKnowledgeState

Estats inicials:

* UNKNOWN
* DETECTED
* DISCOVERED
* STALE
* HISTORICAL

## UNKNOWN

Mai explorat.

## DETECTED

El jugador té alguna pista sobre contingut.

## DISCOVERED

Informació actualitzada disponible.

## STALE

La informació pot estar desactualitzada.

## HISTORICAL

Només es conserva memòria permanent d'haver-hi estat.

---

# 12. TerritoryCell

Unitat territorial interna del joc.

La tecnologia concreta encara no està decidida.

## Responsabilitats

Representa una porció del món sobre la qual es poden calcular:

* propietat;
* defensa;
* activitat;
* fronteres;
* historial.

## Principi

El polígon visual i la unitat territorial interna no han de ser necessàriament el mateix.

---

# 13. TerritoryOwnership

Representa qui controla una TerritoryCell en un moment determinat.

## Informació conceptual

* cell
* owner
* captured at
* defense
* last reinforced at
* previous owner

## Invariants

Una cel·la només pot tenir:

* zero propietaris;
* o un propietari actual.

L'historial es conserva separadament.

---

# 14. TerritoryHistory

Manté la història territorial.

Pot registrar:

* captura;
* pèrdua;
* reconquesta;
* reforç;
* degradació.

Això permet construir:

* estadístiques;
* rivalitats;
* mapes històrics.

---

# 15. TerritoryDefense

Valor derivat de la capacitat de resistència d'una cel·la.

No ha de créixer indefinidament.

## Factors possibles

* activitats defensives;
* activitat recent;
* influència de banderes;
* decadència;
* situació fronterera.

La fórmula no està decidida.

---

# 16. Flag

Representa una bandera territorial.

És una entitat central del joc PvP.

## Informació conceptual

* id
* creator
* current owner
* location
* created at
* status
* importance
* defense
* prestige
* accessibility status

## Principi

Importància, defensa i prestigi són conceptes diferents.

---

# 17. FlagStatus

Possibles estats:

* PROVISIONAL
* ACTIVE
* UNDER_REVIEW
* RESTRICTED
* DISABLED
* REMOVED

---

# 18. FlagAccessibilityStatus

Possibles estats:

* UNVERIFIED
* LIKELY
* VERIFIED
* RESTRICTED
* DISPUTED

No implica necessàriament una veritat cartogràfica absoluta.

---

# 19. FlagOwnership

Representa el control actual d'una Flag.

Permet separar:

* bandera com a lloc persistent;
* propietari actual.

Això és important perquè una bandera conserva:

* història;
* valor;
* importància;

encara que canviï de propietari.

---

# 20. FlagVisit

Representa que un jugador ha visitat físicament una bandera.

## Pot registrar

* user
* flag
* activity
* timestamp
* distance
* accuracy
* validation result

## Principi

Visitar no significa atacar.

---

# 21. EffectiveFlagVisit

Concepte derivat.

No totes les visites compten igual per augmentar importància.

Es poden tenir en compte:

* jugador diferent;
* freqüència;
* antiguitat;
* historial del compte;
* validesa de l'activitat.

---

# 22. FlagImportance

Representa la importància comunitària d'una bandera.

## Pot dependre de

* usuaris únics;
* visites;
* recurrència;
* activitat recent;
* diversitat.

Ha de tenir:

* sostre;
* rendiments decreixents.

---

# 23. FlagPrestige

Representa la història i notorietat d'una bandera.

## Pot incloure

* antiguitat;
* visites totals;
* captures;
* reconquestes;
* rivalitats;
* rècords.

No és equivalent a defensa.

---

# 24. FlagDefense

Representa la resistència actual d'una bandera.

## Pot augmentar per

* activitats defensives;
* manteniment;
* influència territorial;
* importància limitada.

## Pot disminuir per

* atacs;
* decadència;
* abandonament.

## Invariant

Ha d'existir un sostre.

---

# 25. FlagTarget

Representa que una bandera ha estat seleccionada abans d'iniciar una Activity.

## Invariant principal

Una Activity només pot tenir:

> zero o un FlagTarget d'atac.

No es pot seleccionar una segona bandera durant la mateixa activitat.

---

# 26. FlagAttack

Representa un intent d'atac a una bandera.

## Informació conceptual

* attacker
* flag
* activity
* selected before start
* efficiency
* attack power
* defense before
* defense after
* result

## Estats possibles

* PLANNED
* ACTIVE
* FLAG_LOCATED
* ACTIVITY_PENDING
* RESOLVED
* FAILED
* INVALID

---

# 27. AttackLocationAttempt

Cada vegada que el jugador prem “atacar” intentant confirmar la bandera.

## Pot registrar

* timestamp;
* GPS;
* accuracy;
* distance to flag;
* result.

## Resultats

* CONFIRMED
* UNCERTAIN
* INCORRECT

## Efectes

CONFIRMED:

* permet continuar l'atac.

UNCERTAIN:

* no penalitza.

INCORRECT:

* redueix eficiència.

---

# 28. AttackEfficiency

Comença en un valor màxim.

Els intents clarament incorrectes la degraden.

Exemple conceptual:

100 → 95 → 87 → 76

No és una penalització permanent del jugador.

Només afecta l'atac actual.

---

# 29. AttackPower

Potència efectiva d'un atac.

Conceptualment:

ActivityPower × AttackEfficiency

La fórmula definitiva queda pendent.

---

# 30. FlagAttackResult

Possibles resultats:

* INVALID_ACTIVITY
* FAILED_LOCATION
* DEFENDED
* DAMAGED
* CAPTURED

## DEFENDED

La defensa resisteix.

## DAMAGED

La bandera continua amb el mateix propietari però amb menys defensa.

## CAPTURED

Canvia de propietari.

---

# 31. FlagDefenseMission

Representa una activitat preparada per defensar una bandera pròpia.

Flux conceptual:

1. seleccionar bandera pròpia;
2. iniciar activitat;
3. visitar-la;
4. completar activitat;
5. validar;
6. aplicar reforç.

---

# 32. Power

Concepte derivat de les activitats.

Pot ser utilitzat per:

* atac;
* defensa;
* progressió.

No s'ha de convertir necessàriament en una moneda persistent acumulable.

Això és important per evitar que un jugador guardi durant anys una quantitat enorme de força i la gasti de cop.

---

# 33. PowerContribution

Permet explicar d'on prové la potència.

Exemple:

* distance;
* elevation;
* duration;
* exploration;
* summit;
* POI;
* difficulty.

Això facilita:

* transparència;
* equilibratge;
* depuració;
* anti-cheat.

---

# 34. POI

Representa un punt d'interès.

Pot provenir de:

* sistema;
* comunitat.

## Informació conceptual

* id
* location
* type
* name
* description
* creator
* status

---

# 35. POIType

Exemples inicials:

* WATER
* REFUGE
* VIEWPOINT
* NATURAL
* CULTURAL
* SUMMIT
* COMMUNITY
* OTHER

La taxonomia queda pendent.

---

# 36. POIVisit

Representa que un jugador ha visitat físicament un POI.

Pot contribuir a:

* exploració;
* XP;
* validació;
* reputació;
* progressió.

---

# 37. POIReport

Representa una denúncia sobre un POI.

## Motius possibles

* DOES_NOT_EXIST
* DUPLICATE
* PRIVATE_PROPERTY
* WRONG_LOCATION
* DANGEROUS_ACCESS
* INAPPROPRIATE_CONTENT
* OTHER

## Invariant

Una denúncia no elimina automàticament un POI.

---

# 38. POIModerationCase

Representa el procés de revisió d'un POI o bandera denunciats.

Pot acabar en:

* mantenir;
* corregir;
* restringir;
* eliminar.

---

# 39. Summit

Representa una fita geogràfica especial.

Un Summit pot ser també un POI, però conceptualment pot tenir comportament propi.

## Pot aportar

* exploració;
* assoliments;
* XP;
* potència limitada;
* historial.

No és territori ni bandera per defecte.

---

# 40. Achievement

Representa un assoliment del jugador.

Exemples futurs:

* primer cim;
* 100 km explorats;
* primera captura;
* 10 banderes descobertes;
* visitar diferents regions.

Els assoliments poden donar:

* XP;
* cosmètics;
* prestigi;
* desbloquejos limitats.

No han de generar avantatges PvP desproporcionats.

---

# 41. Reputation

Representa confiança comunitària.

Pot ser afectada per:

* POI útils;
* validacions;
* denúncies confirmades;
* abús.

No és equivalent a XP.

---

# 42. Rivalry

Representa una rivalitat emergent entre dos jugadors.

No necessita ser creada manualment.

Pot derivar-se de:

* captures mútues;
* fronteres;
* banderes disputades;
* reconquestes.

## Informació conceptual

* player A
* player B
* first conflict
* last conflict
* captures A→B
* captures B→A
* disputed territory

---

# 43. Notification

Representa esdeveniments que poden requerir l'atenció del jugador.

Exemples:

* bandera atacada;
* bandera capturada;
* defensa baixa;
* territori perdut;
* POI validat;
* rivalitat activa.

---

# 44. Season

Entitat futura opcional.

Podria permetre:

* rànquings estacionals;
* recompenses;
* renovació parcial;
* competicions.

Encara no està decidit si el joc tindrà temporades.

No s'ha d'introduir al MVP sense necessitat.

---

# 45. Team / Clan

Possible funcionalitat futura.

No forma part encara del domini obligatori.

Si s'introdueix, haurà de definir:

* propietat individual o col·lectiva;
* banderes;
* territori;
* competició.

No s'ha de dissenyar prematurament.

---

# 46. Subscription / Entitlement

Entitats futures per monetització.

## Subscription

Representa un pla comercial.

## Entitlement

Representa una funcionalitat habilitada.

Exemples:

* estadístiques avançades;
* exportació;
* personalització;
* historial ampliat.

## Invariant

Cap entitlement de pagament ha de concedir directament:

* AttackPower;
* FlagDefense;
* TerritoryOwnership.

---

# 47. Relacions principals

Esquema conceptual simplificat:

```text
User
 ├── Activity
 │    ├── Track
 │    ├── Validation
 │    ├── Exploration
 │    ├── PowerContribution
 │    └── FlagAttack / FlagDefenseMission
 │
 ├── ExplorationCell
 │
 ├── TerritoryOwnership
 │
 ├── Flag
 │    ├── FlagVisit
 │    ├── FlagAttack
 │    ├── FlagDefense
 │    └── FlagHistory
 │
 ├── POI
 │    ├── POIVisit
 │    └── POIReport
 │
 ├── Achievement
 ├── Reputation
 └── Rivalry
```

---

# 48. Esdeveniments de domini

És recomanable pensar el sistema mitjançant esdeveniments.

Exemples:

```text
ActivityStarted
ActivityCompleted
ActivityValidated
ActivityRejected

CellDiscovered
KnowledgeRefreshed
KnowledgeBecameStale

TerritoryCaptured
TerritoryLost
TerritoryReinforced

FlagCreated
FlagDiscovered
FlagVisited
FlagSelectedAsTarget
FlagLocationAttempted
FlagLocated
FlagAttacked
FlagDamaged
FlagCaptured
FlagDefended

POICreated
POIVisited
POIReported
POIValidated

RivalryUpdated
```

No implica encara utilitzar Event Sourcing.

Són esdeveniments conceptuals.

---

# 49. Invariants crítics

Aquestes regles s'han de considerar especialment importants.

## Activitat

* Una Activity pertany a un únic User.
* Una Activity no validada no modifica definitivament territori.
* Una Activity només pot atacar una bandera.

## Atac

* El FlagTarget s'ha de seleccionar abans de començar l'activitat.
* No es pot canviar l'objectiu durant l'activitat.
* La bandera s'ha de localitzar físicament.
* Un intent GPS incert no penalitza.
* Un intent clarament erroni redueix l'eficiència.
* L'atac només es resol després de validar l'activitat completa.

## Bandera

* El nombre de banderes actives per jugador és limitat.
* Importància, defensa i prestigi són independents.
* Una bandera no és invencible.
* La visita no implica atac.

## Exploració

* L'historial d'haver explorat una zona és permanent.
* La informació tàctica pot degradar-se.

## Monetització

* No es compra potència territorial.

---

# 50. Informació que no s'ha de duplicar

Algunes dades han de derivar-se sempre que sigui possible.

Exemples:

No guardar de manera independent:

* distància si es pot recalcular del track, excepte com a resultat derivat versionat;
* AttackPower sense conservar-ne les contribucions;
* importància sense conservar les dades que permeten auditar-la.

S'ha de poder explicar:

> Per què aquest jugador ha generat aquesta potència?

i:

> Per què aquesta bandera té aquest valor?

---

# 51. Històric vs estat actual

Cal separar clarament:

## Estat actual

Exemple:

```text
Flag owner = Oriol
Defense = 42
```

## Historial

Exemple:

```text
Marc created
Oriol captured
Marc recaptured
Oriol captured
```

Aquesta separació serà especialment important en:

* banderes;
* territori;
* reputació;
* moderació.

---

# 52. Dades sensibles

Caldrà prestar especial atenció a:

* tracks GPS;
* punts d'inici i final;
* patrons habituals;
* localització actual;
* historial d'activitat.

El model de privacitat es definirà en un document específic.

No s'ha de donar per fet que tota Activity és pública.

---

# 53. Entitats probables del MVP

Per evitar sobredisseny, el primer MVP probablement necessitarà només:

```text
User
Activity
ActivityType
Track
ActivityValidation

ExplorationCell
TerritoryCell
TerritoryOwnership

Flag
FlagOwnership
FlagVisit
FlagAttack
AttackLocationAttempt

POI
POIVisit
POIReport
```

La resta pot aparèixer progressivament.

---

# 54. Entitats que poden esperar

No haurien de bloquejar un MVP:

* Season
* Team
* Clan
* Subscription
* Rivalry persistent
* achievements complexos
* reputació avançada
* moderació automatitzada sofisticada

---

# 55. Decisions obertes detectades

Aquest model deixa especialment pendents:

1. Com es representa exactament el territori.
2. Quina mida tenen les cel·les.
3. Com una ruta circular selecciona cel·les.
4. Què passa amb cel·les rivals dins una ruta.
5. Com es calcula Power.
6. Com es calcula Defense.
7. Com funciona la decadència.
8. Com una Flag influencia territori.
9. Com evoluciona FlagImportance.
10. Com es degrada ExplorationKnowledgeState.
11. Quina informació mostra cada estat del Fog.
12. Quins criteris defineixen una Activity vàlida.
13. Com detectar activitat fraudulenta.
14. Com protegir privacitat dels tracks.
15. Quina informació de rivals és pública.

---

# 56. Següent artefacte recomanat

Abans d'entrar en arquitectura, convé definir les regles que afecten directament l'equilibri del joc.

El següent document recomanat és:

```text
docs/GAME-RULES-01-territory-flags-combat.md
```

Hauria de fixar conceptualment:

* conquesta territorial;
* potència;
* atac;
* defensa;
* banderes;
* decadència;
* relació entre territori i bandera;
* límits anti-invencibilitat.

No caldrà encara assignar tots els números definitius.
