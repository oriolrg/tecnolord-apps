# TerritoriLord — Domain Model 00

**Versió:** v0.2 consolidada
**Estat:** model conceptual, no esquema de base de dades
**Data:** 2026-09-18

---

# 1. Objectiu

Aquest document defineix les principals entitats, relacions i invariants del domini de TerritoriLord.

No defineix:

* taules SQL;
* endpoints;
* ORM;
* microserveis;
* classes definitives.

Una entitat conceptual no implica necessàriament una taula pròpia.

---

# 2. Àrees del domini

```text
IDENTITY
ACTIVITY
VALIDATION
EXPLORATION
KNOWLEDGE
TERRITORY
FLAGS
COMBAT
POI
PROGRESSION
TOURISM
SECURITY / GAME INTEGRITY
```

---

# 3. User

Representa el jugador.

Pot tenir:

* `id`;
* `username`;
* dades de perfil;
* identitats d'autenticació;
* progressió;
* configuració de privacitat.

Invariant:

```text
public identity
≠
civil identity
```

---

# 4. UserIdentity

Representa una forma d'autenticació associada al User.

Pot permetre en el futur:

```text
EMAIL_CREDENTIAL
GOOGLE
APPLE
OTHER_OIDC
```

Això evita modelar:

```text
User == email/password
```

---

# 5. Activity

Representa una sessió física.

Relacions principals:

```text
User 1 ── * Activity
Activity 1 ── * TrackSample
Activity 1 ── 1 ActivityValidation
Activity 1 ── * DerivedResult
```

Pot tenir un `ActivityPurpose`.

---

# 6. ActivityType

Valors conceptuals inicials:

```text
RUNNING
TRAIL_RUNNING
WALKING
HIKING
CYCLING
MTB
```

---

# 7. ActivityPurpose

Valors conceptuals:

```text
NORMAL
ATTACK_FLAG
DEFEND_FLAG
CREATE_FLAG
REPLANT_FLAG
```

La llista no és necessàriament definitiva.

Un Purpose no anul·la automàticament altres efectes legítims de l'Activity.

---

# 8. ActivityState

Pot incloure conceptualment:

```text
RECORDING
COMPLETED_LOCAL
SYNCING
COMPLETED
VALIDATING
VALID
PARTIALLY_VALID
INVALID
REJECTED
```

Els noms finals són tècnics i poden canviar.

---

# 9. TrackSample

Mostra original de GPS.

Pot contenir:

```text
sequence
timestamp
latitude
longitude
accuracy
altitude
speed
heading
```

quan el dispositiu ho proporciona.

---

# 10. Track

Representació ordenada del recorregut.

Pot derivar de `TrackSample`.

No ha d'eliminar necessàriament la font raw.

---

# 11. SyncChunk

Bloc idempotent de mostres sincronitzades.

Invariant:

```text
same Activity
+
same chunk identifier
=
no duplicated samples
```

---

# 12. ActivityValidation

Resultat del procés de validació.

Pot contenir:

* estat;
* anomalies;
* circularity;
* conclusions;
* `rulesVersion`.

---

# 13. ValidationCapability

Capacitat concedida a una Activity després de validar-la.

Exemples:

```text
CAN_COUNT_DISTANCE
CAN_EXPLORE
CAN_VISIT_POI
CAN_CAPTURE_TERRITORY
CAN_ATTACK_FLAG
CAN_DEFEND_FLAG
```

Invariant:

> una Activity pot disposar només d'un subconjunt.

---

# 14. ValidationIssue

Observació detectada durant validació.

Pot representar:

* GPS jump;
* impossible speed;
* missing segment;
* poor accuracy;
* timestamp inconsistency.

No implica necessàriament Fraud.

---

# 15. RulesVersion

Versió de regles utilitzada per obtenir un resultat.

Pot aplicar-se a:

* ActivityValidation;
* ActivityPower;
* TerritoryResolution;
* combat;
* decay.

---

# 16. ExplorationCell

Unitat geoespacial d'exploració.

Inicialment candidata a H3.

Té resolució potencialment superior a `TerritoryCell`.

---

# 17. UserExploration

Relació:

```text
User
+
ExplorationCell
```

Representa que l'usuari ha explorat físicament aquella zona.

És historial permanent.

Pot conservar:

* firstDiscoveredAt;
* lastVisitedAt;
* visitCount.

---

# 18. PhysicalDiscovery

Esdeveniment pel qual un User adquireix coneixement físic legítim sobre:

* una cell;
* Flag;
* POI;
* Summit;
* altre element.

No és equivalent a `DiscoveryAccess`.

---

# 19. ExplorationKnowledge

Representa el coneixement actual d'un User sobre una zona.

Pot tenir:

```text
UNKNOWN
DETECTED
DISCOVERED
STALE
HISTORICAL
```

No ha de substituir `UserExploration`.

---

# 20. KnowledgeRetention

Concepte/regla que determina la degradació de `ExplorationKnowledge`.

Inputs possibles:

* recency;
* own territory;
* own/control Flags;
* recent activities;
* POI relationship;
* presence.

Pot ser calculat i no necessàriament persistit.

---

# 21. DiscoverySignal

Indicació parcial sobre un element desconegut.

Exemple:

```text
typeHint = FLAG
approximateArea = ...
strength = ...
```

No revela necessàriament el target complet.

---

# 22. TerritoryCell

Unitat geoespacial de control territorial.

Inicialment H3.

---

# 23. TerritoryOwnership

Relació temporal:

```text
TerritoryCell
→ ownerUserId
```

Pot ser:

```text
USER
NONE
```

La història de propietat pot registrar-se separadament.

---

# 24. TerritoryHistory

Historial de canvis significatius:

* captures;
* propietaris;
* dates;
* pressió.

---

# 25. TerritoryDefense

Resistència actual de la TerritoryCell.

Pot dependre de:

* presence;
* connectivity;
* nearby Flags;
* inactivity.

Té sostre i decadència.

---

# 26. TerritoryPressure

Pressió generada per una Activity sobre TerritoryCells rivals.

No equival a propietat.

---

# 27. TerritoryBudget

Capacitat màxima territorial atribuïble a una Activity.

Evita conquestes desproporcionades.

---

# 28. TerritoryTopology

Concepte derivat que permet distingir:

```text
CONNECTED
DISCONNECTED
ISOLATED
```

o equivalents.

Pot afectar:

* retention;
* defense;
* decay.

---

# 29. Flag — concepte abstracte

`Flag` només s'utilitza conceptualment quan una regla és comuna.

Les dues entitats principals són:

```text
PublicFlagSite
UserFlag
```

No s'han de fusionar accidentalment.

---

# 30. PublicFlagSite

Punt físic permanent i disputable.

Atributs conceptuals:

* `id`;
* location;
* source;
* visibilityPolicy;
* currentOwner;
* importance;
* prestige;
* defense state.

La location no canvia.

---

# 31. PublicFlagSiteSource

Pot ser:

```text
SYSTEM
ADMIN
TOURISM_AUTHORIZED
```

o equivalent.

---

# 32. PublicFlagVisibilityPolicy

Pot incloure:

```text
PUBLIC_VISIBLE
FOG_DETECTED
FOG_HIDDEN
```

o equivalents.

---

# 33. UserFlag

Objecte creat originalment per un User.

Pot tenir:

* creatorUserId;
* currentOwnerUserId;
* status;
* FlagPrestige;
* currentPlacement.

El creator no canvia.

L'owner sí.

---

# 34. UserFlagStatus

Estats conceptuals:

```text
PLANTED
TRANSPORTED
NEUTRAL
DISABLED
```

Poden evolucionar.

---

# 35. UserFlagPlacement

Representa la ubicació activa actual d'una UserFlag.

Atributs possibles:

* flagId;
* location;
* placedAt;
* placedBy;
* locationImportance reference.

Una UserFlag només pot tenir:

```text
0..1 active placement
```

---

# 36. FlagOwnershipHistory

Historial dels propietaris.

Aplica a:

* PublicFlagSite;
* UserFlag.

Pot registrar:

* previousOwner;
* newOwner;
* timestamp;
* cause;
* relatedAttack.

---

# 37. FlagPlacementHistory

Especialment rellevant per UserFlag.

Registra:

* location;
* interval;
* owner;
* events.

---

# 38. FlagPrestige

Valor històric associat a la bandera.

Per una UserFlag:

> viatja amb l'objecte.

No és la mateixa cosa que `LocationImportance`.

---

# 39. LocationImportance

Valor comunitari d'una ubicació.

Pot derivar de:

* unique visitors;
* visits;
* recency;
* diversity;
* community use.

Una nova ubicació d'una UserFlag no hereta automàticament la importància de l'anterior.

---

# 40. FlagDefense

Defensa pròpia actual de la Flag.

Pot canviar mitjançant:

* attacks;
* defense activities;
* passive maintenance;
* decay.

---

# 41. TerritorySupport

Bonificació limitada derivada del territori circumdant.

Conceptualment:

```text
EffectiveFlagDefense
=
FlagDefense
+
TerritorySupport
```

---

# 42. FlagVisit

Visita física a una Flag.

No implica Attack.

---

# 43. EffectiveFlagVisit

Visita que pot contribuir a:

* Importance;
* community validation;
* rewards.

Pot aplicar:

* anti-farming;
* diminishing returns;
* unique user weighting.

---

# 44. FlagTarget

Target seleccionat abans d'una Activity `ATTACK_FLAG`.

Invariant:

```text
max 1 FlagTarget per Activity
```

No pot canviar després de començar.

---

# 45. FlagAttack

Procés d'atac.

Relacions:

```text
Activity 1 ── 0..1 FlagAttack
FlagAttack ── 1 FlagTarget
FlagAttack ── * AttackLocationAttempt
```

---

# 46. FlagAttackState

Pot incloure:

```text
PLANNED
SEARCHING
ATTACK_IN_PROGRESS
AWAITING_ACTIVITY_COMPLETION
RESOLVED
CANCELLED
INVALIDATED
```

Els noms finals no estan fixats.

---

# 47. AttackLocationAttempt

Intent explícit de localització.

Resultat:

```text
CONFIRMED
UNCERTAIN
INCORRECT
```

Pot conservar:

* location;
* accuracy;
* timestamp;
* result;
* penalty contribution.

---

# 48. AttackEfficiency

Factor derivat de la qualitat de la localització durant aquella Attack.

No afecta XP general ni Reputation.

---

# 49. EffectiveAttack

Resultat derivat conceptualment de:

```text
ActivityPower
×
AttackEfficiency
```

més modificadors limitats futurs si s'aproven.

---

# 50. FlagAttackResult

Pot ser:

```text
DEFENDED
DAMAGED
CAPTURED
```

---

# 51. FlagDefenseMission

Relació entre una Activity `DEFEND_FLAG` i una Flag pròpia.

Requereix visita física i Activity vàlida.

---

# 52. PassiveFlagMaintenance

Reforç limitat derivat d'una Activity normal que passa legítimament per una Flag pròpia.

No substitueix `FlagDefenseMission`.

---

# 53. UserFlagTransport

Estat o relació temporal després de capturar una UserFlag.

Pot contenir:

* currentOwner;
* capturedAt;
* previousPlacement;
* replantDeadline.

No implica necessàriament una entitat persistida separada.

---

# 54. UserFlagReturn

Esdeveniment si expira el termini de replantació.

Resultat conceptual:

```text
return previous location
owner = NONE
defense = low
```

---

# 55. FlagControlLimit

Model conceptual per:

```text
FLAG_CREATION_CAP
FLAG_CONTROL_CAP
```

Els valors són experimentals.

El control cap pot relacionar-se parcialment amb territori/progressió però amb sostre.

---

# 56. POI

Punt d'interès geogràfic.

Atributs conceptuals:

* location;
* type;
* source;
* status;
* metadata.

---

# 57. POIType

Exemples:

* water;
* viewpoint;
* refuge;
* natural;
* historical;
* cultural;
* service.

L'enumeració definitiva és PENDENT.

---

# 58. POISource

Pot ser:

```text
SYSTEM
COMMUNITY
SPONSORED
```

---

# 59. POIVisit

Visita física d'un User a un POI.

---

# 60. POIReport

Denúncia sobre:

* inexistència;
* duplicat;
* private property;
* incorrect location;
* dangerous access;
* inappropriate content.

---

# 61. POIModerationCase

Cas de revisió.

Una denúncia no implica eliminació automàtica.

---

# 62. Summit

Fita geogràfica independent.

Pot tenir:

* firstVisit;
* visitHistory;
* achievements.

No té necessàriament owner.

---

# 63. XP

Progrés permanent acumulat.

No és Power.

---

# 64. Level

Nivell derivat de progressió.

El model final és PENDENT.

---

# 65. Achievement

Fita permanent.

Pot derivar de:

* exploration;
* summits;
* campaigns;
* territory;
* other milestones.

---

# 66. Prestige

Reconeixement històric.

Pot aplicar-se a:

* User;
* Flag;
* llocs.

La semàntica concreta s'ha de mantenir diferenciada.

---

# 67. Reputation

Confiança comunitària del User.

Principalment útil per:

* CommunityPOI;
* reports;
* contributions;
* moderation weighting.

---

# 68. Rivalry

Relació emergent entre Users.

Pot derivar de:

* repeated captures;
* reconquests;
* shared borders;
* disputed Flags.

No necessita ser seleccionada manualment.

---

# 69. Notification

Esdeveniment comunicat a l'usuari.

Cal distingir notificacions crítiques de gameplay de la futura capa social.

Exemple crític:

```text
FLAG_ATTACK_STARTED
```

---

# 70. ActivityVisibility

Concepte pendent de detall per representar:

* private;
* shared;
* public.

La política inicial és privacitat per defecte.

---

# 71. TrackVisibility

Separada de `ActivityVisibility`.

Un resultat territorial pot ser visible sense publicar el track.

---

# 72. PrivacyZone

Concepte futur per protegir ubicacions sensibles d'inici/final.

No s'ha definit encara la implementació.

---

# 73. TourismCampaign

Campanya turística o patrocinada.

Pot agrupar:

```text
DiscoveryAccess
SponsoredDiscoveryZone
SponsoredPOI
CampaignChallenge
SponsoredClaim
```

Queda fora del primer MVP.

---

# 74. DiscoveryAccess

Permís temporal o contextual per mostrar contingut sota Fog.

No crea `UserExploration`.

Invariant:

```text
DiscoveryAccess
≠
PhysicalDiscovery
```

---

# 75. SponsoredDiscoveryZone

Geometria associada a una campanya que modifica parcialment la informació revelada.

---

# 76. SponsoredPOI

POI promocional/oficial.

Ha d'estar identificat.

Pot tenir recompenses específiques.

---

# 77. SponsoredClaim

Intent de reclamar una recompensa.

Inputs possibles:

```text
user
campaign
poi
QR/token
location
accuracy
timestamp
claimType
```

Validació server-side.

---

# 78. ClaimType

Inicialment:

```text
VISIT_CLAIM
ACTIVITY_CLAIM
```

---

# 79. ClaimLocationPolicy

Pot definir:

* point;
* ClaimRadius;
* geometry.

El valor concret depèn del lloc i s'ha de provar.

---

# 80. CampaignReward

Recompensa controlada per TerritoriLord.

Pot incloure:

* XP;
* campaign progress;
* achievement;
* cosmetic/future reward.

No pot concedir superioritat PvP desproporcionada.

---

# 81. Entitlement

Concepte futur per:

* VisitorPass;
* subscription;
* feature access.

No forma part del MVP.

---

# 82. Season

Extensió futura.

No s'ha decidit encara si existirà.

L'arquitectura no l'ha de requerir ara.

---

# 83. Team / Clan

Extensió futura.

No es defineix encara:

* collective territory;
* team ownership;
* shared Flags.

---

# 84. AuditEvent

Concepte necessari per traçabilitat competitiva.

Pot registrar:

```text
Activity
rulesVersion
validation
power
attack
defenseBefore
defenseAfter
result
```

No implica necessàriament una única taula.

---

# 85. FraudSignal

Senyal de possible manipulació.

No és equivalent a Fraud confirmat.

---

# 86. ModerationCase

Concepte general per casos de:

* content;
* safety;
* game integrity.

Pot especialitzar-se segons necessitat.

---

# 87. Invariants centrals

## Activity

```text
Activity belongs to exactly one User
```

## Territory

```text
Unvalidated Activity
cannot permanently resolve competitive territory changes
```

## Attack

```text
max 1 FlagTarget per Activity
```

## Target

```text
cannot change after Activity starts
```

## Visit

```text
Visit ≠ Attack
```

## Location attempt

```text
UNCERTAIN → no orientation penalty
```

## Attack resolution

```text
Flag localization alone
≠
successful attack
```

## PublicFlagSite

```text
capture changes owner
not location
```

## UserFlag

```text
capture can remove placement
and make Flag transportable
```

## UserFlag creator

```text
creator is immutable
```

## UserFlag prestige

```text
FlagPrestige travels
LocationImportance does not
```

## Exploration

```text
Physical exploration history is permanent
```

## Knowledge

```text
current knowledge may decay
```

## Monetization

```text
payment cannot directly buy PvP victory
```

---

# 88. Relacions simplificades

```text
User
 ├─ Activity
 │   ├─ TrackSample
 │   ├─ Validation
 │   ├─ Power
 │   ├─ Territory effects
 │   └─ FlagAttack / FlagDefenseMission
 │
 ├─ UserExploration
 ├─ ExplorationKnowledge
 ├─ TerritoryOwnership
 ├─ UserFlags created
 ├─ Flags controlled
 ├─ POI contributions
 ├─ Progression
 └─ SponsoredClaims
```

---

# 89. Flag model simplificat

```text
                    FLAG DOMAIN
                         │
          ┌──────────────┴──────────────┐
          │                             │
  PublicFlagSite                    UserFlag
          │                             │
   fixed location                movable object
          │                             │
 changes owner                  creator immutable
          │                             │
 location persists              owner mutable
                                        │
                                UserFlagPlacement
                                        │
                                0 or 1 active
```

---

# 90. Exploration model simplificat

```text
Physical visit
      │
      ├─ UserExploration → permanent
      │
      └─ ExplorationKnowledge
                 │
                 ↓
       DISCOVERED / STALE / ...
```

I separadament:

```text
DiscoveryAccess
      ↓
can reveal information
      ↓
does NOT create UserExploration
```

---

# 91. Estat

Aquest model conceptual cobreix el domini funcional definit fins ara.

Els principals elements que continuen intencionadament pendents són:

* fórmules;
* valors;
* enumeracions finals;
* persistència concreta;
* esquema SQL;
* API;
* lifecycle tècnic detallat.

Aquests punts no s'han de resoldre en aquest document.
