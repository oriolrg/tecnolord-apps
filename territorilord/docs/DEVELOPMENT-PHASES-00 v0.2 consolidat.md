# TerritoriLord — Development Phases 00

**Versió:** v0.2 consolidada
**Estat:** roadmap funcional pre-SPEC
**Data:** 2026-09-18

---

# 1. Principi

TerritoriLord es desenvoluparà incrementalment.

Cada fase segueix:

```text
SPEC
↓
PLAN
↓
TASKS
↓
IMPLEMENTATION
↓
AUTOMATED TESTS
↓
MANUAL TEST
↓
FIELD TEST when applicable
↓
DECISION
```

---

# 2. Resultat de fase

Cada fase pot quedar:

```text
ACCEPTED
ACCEPTED_WITH_CHANGES
REJECTED
```

No s'avança automàticament perquè el codi funcioni.

---

# 3. FASE 0 — Project Foundation

## Objectiu

Disposar d'una base local executable i testable.

## Inclou

* monorepo;
* PWA/web;
* API separada;
* PostgreSQL;
* PostGIS;
* packages inicials;
* tests;
* health checks;
* base d'identitat;
* configuració local.

## No inclou

* GPS;
* Territory;
* Flags;
* Fog;
* combat.

## Gate

```text
web runs
API runs
DB works
tests pass
```

---

# 4. FASE 1 — Activity Recorder

## Objectiu

Enregistrar Activities reals.

## Inclou

* start;
* stop;
* ActivityType;
* GPS;
* TrackSample;
* local persistence;
* offline recording;
* SyncChunk;
* idempotent sync;
* COMPLETED_LOCAL;
* track visualization.

## Experiments principals

```text
EXP-31
EXP-32
EXP-33
EXP-34
EXP-35
EXP-36
EXP-37
EXP-38
```

## Gate

Diverses Activities reals han de conservar-se correctament malgrat cobertura intermitent.

---

# 5. FASE 2 — Validation Engine

## Objectiu

Determinar què pot fer cada Activity.

## Inclou

* ActivityValidation;
* ValidationCapabilities;
* GPS anomalies;
* speed plausibility;
* gaps;
* circularity;
* RulesVersion.

## Gate

Una Activity pot ser vàlida per explorar però no per PvP.

---

# 6. FASE 3 — Exploration & Initial Fog

## Objectiu

Construir el primer loop motivacional.

## Inclou

* MapLibre;
* H3 prototype;
* ExplorationCell;
* UserExploration;
* UNKNOWN;
* DISCOVERED;
* physical discovery;
* basic Fog.

## Experiments

```text
EXP-01
EXP-03
EXP-11
EXP-31/41
```

---

# 7. FASE 4 — Neutral Territory

## Objectiu

Convertir Activity circular en territori.

## Inclou

* TerritoryCell;
* TerritoryOwnership;
* polygon derivation;
* experimental cell threshold;
* TerritoryBudget;
* map visualization.

## Només

Territori neutral.

No PvP territorial encara.

## Experiments

```text
EXP-02
EXP-04
EXP-05
EXP-06
EXP-07
```

---

# 8. FASE 5 — Basic Flags

## Objectiu

Introduir els objectius persistents.

## Ha de distingir des del principi

```text
PublicFlagSite
UserFlag
UserFlagPlacement
```

## PublicFlagSite inicial

* location fixa;
* neutral o owned;
* basic Defense;
* basic visibility policy.

## UserFlag inicial

* creator;
* owner;
* placement;
* physical creation;
* own/neutral territory rule;
* creation cap inicial.

## Encara no inclou

Combat complet.

---

# 9. FASE 6 — Flag Discovery & Fog

## Objectiu

Fer que les Flags generin exploració.

## Inclou

* DETECTED;
* signals;
* Flag discovery;
* PublicFlag visibility policy;
* UserFlag under Fog;
* Visit ≠ Attack.

## Experiments

```text
EXP-10
EXP-11
EXP-12
EXP-46
```

---

# 10. FASE 7 — Orientation Attack

## Objectiu

Construir la mecànica física d'orientació.

## Inclou

* FlagTarget;
* one target per Activity;
* immutable target;
* approximate guidance;
* AttackLocationAttempt;
* CONFIRMED;
* UNCERTAIN;
* INCORRECT;
* AttackEfficiency;
* initial online validation.

## Encara no

No cal resoldre captura completa.

## Experiments

```text
EXP-08
EXP-09
EXP-10
EXP-39
EXP-40
```

---

# 11. FASE 8 — Activity Power

## Objectiu

Convertir Activity en capacitat de joc.

## Inclou

```text
PhysicalPower
ExplorationPower
DiscoveryPower
ActivityPower
```

* RulesVersion;
* server authoritative result;
* approximate live preview;
* diminishing returns initial model.

## Experiments

```text
EXP-20
EXP-21
EXP-22
EXP-23
```

---

# 12. FASE 9 — Flag Combat

## Objectiu

Completar el primer PvP.

## Inclou

* ATTACK_IN_PROGRESS;
* Flag lock;
* immediate defender notification;
* EffectiveAttack;
* FlagDefense;
* DEFENDED;
* DAMAGED;
* CAPTURED.

## PublicFlagSite

Captura:

```text
owner changes
location remains
```

## UserFlag

Captura:

```text
placement inactive
owner changes
state = TRANSPORTED
```

També ha d'incloure:

* replant Activity;
* basic replanting;
* return if not replanted;
* control cap handling.

## Experiments

```text
EXP-16
EXP-24
EXP-25
EXP-26
EXP-27
EXP-29
```

---

# 13. Primera gran fita — Vertical Slice

En acabar F9:

```text
start Activity
↓
explore
↓
gain territory
↓
detect Flag
↓
discover Flag
↓
later plan attack
↓
orient
↓
attack
↓
complete Activity
↓
resolve
```

Aquest és el primer vertical slice que ha de validar-se amb jugadors reals.

---

# 14. FASE 10 — Defense

## Objectiu

Permetre resposta física del propietari.

## Inclou

* DEFEND_FLAG;
* Passive Maintenance;
* Defense caps;
* TerritorySupport inicial.

## Experiments

```text
EXP-17
EXP-18
```

---

# 15. FASE 11 — Rival Territory

## Objectiu

Introduir PvP territorial.

## Inclou

* TerritoryPressure;
* TerritoryDefense;
* connected/disconnected;
* isolation;
* border dynamics.

## Regla

Envoltar:

> no captura automàticament.

---

# 16. FASE 12 — Decay & Presence

## Objectiu

Fer que el món evolucioni amb la inactivitat.

## Inclou

* FlagDefense decay;
* TerritoryDefense decay;
* disconnected penalties;
* KnowledgeRetention base;
* presence effects.

## Experiments

```text
EXP-13
EXP-14
EXP-15
EXP-19
```

---

# 17. FASE 13 — Advanced Fog

## Objectiu

Completar el cicle de coneixement.

## Inclou

```text
UNKNOWN
DETECTED
DISCOVERED
STALE
HISTORICAL
```

També:

* domain anchors;
* Flag knowledge anchors;
* POI relationship;
* progressive decay.

---

# 18. FASE 14 — System POI & Summits

## Objectiu

Ampliar el loop no PvP.

## Inclou

* SystemPOI;
* Summit;
* visits;
* discovery;
* rewards;
* Fog integration.

## Important

Aquesta fase ajuda a comprovar que TerritoriLord funciona amb baixa densitat de rivals.

---

# 19. FASE 15 — Community POI

## Inclou

* CommunityPOI;
* physical creation;
* POIVisit;
* reports;
* moderation;
* basic Reputation.

---

# 20. FASE 16 — Progression

## Inclou

* XP;
* Level initial model;
* Achievement;
* Prestige;
* Reputation integration;
* FLAG_CREATION_CAP;
* FLAG_CONTROL_CAP progression.

## No cal

Decidir Seasons.

---

# 21. FASE 17 — Rivalries & Rankings

## Inclou

* Rivalry;
* capture history;
* rankings;
* multiple ranking dimensions.

---

# 22. FASE 18 — Advanced Anti-Cheat

## Inclou

* FraudSignal;
* Sybil patterns;
* farming;
* capture trading;
* advanced audit;
* trust weighting.

Només quan hi hagi dades reals suficients.

---

# 23. FASE 19 — Social Layer

## Inclou

* richer profiles;
* social notifications;
* future social relationships.

## Important

Les notificacions crítiques de gameplay:

```text
FLAG_ATTACK_STARTED
```

ja existeixen des de F9.

---

# 24. FASE 20 — Platform Monetization Base

## Objectiu

Preparar infraestructura comercial general.

## Pot incloure

* Entitlement;
* Subscription;
* feature flags;
* plan management.

## No inclou necessàriament

La implementació completa del producte turístic.

---

# 25. FUTURE BLOCK T — Tourism & Sponsored Experiences

No forma part del primer MVP.

S'ha de reservar explícitament com a bloc futur.

## Inclourà

```text
TourismCampaign
DiscoveryAccess
SponsoredDiscoveryZone
SponsoredPOI
SponsoredClaim
VisitorPass
CampaignReward
CampaignAnalytics
```

---

# 26. Tourism T1 — Campaigns & DiscoveryAccess

Primer subbloc futur.

Permetrà:

* crear TourismCampaign;
* revelar hints;
* destacar routes;
* mostrar SponsoredDiscoveryZones.

---

# 27. Tourism T2 — Sponsored POI

Permetrà:

* SponsoredPOI;
* clear sponsorship labeling;
* campaign progress.

---

# 28. Tourism T3 — QR + GPS

Permetrà:

```text
QR
+
ClaimLocationPolicy
+
server validation
```

i:

```text
VISIT_CLAIM
ACTIVITY_CLAIM
```

---

# 29. Tourism T4 — Analytics

Analítica agregada per:

* destinations;
* campaigns;
* POI;
* completion.

Sempre sota les regles de privacitat.

---

# 30. FUTURE — Imported Activities

Posteriorment es podrà incorporar:

* GPX;
* FIT;
* Garmin;
* Strava;
* altres providers.

Podran potencialment aportar:

* history;
* exploration;
* XP.

No:

* retroactive Attack;
* retroactive Defense.

---

# 31. FUTURE — Offline Maps

L'Activity Recorder ja és offline-first.

La cartografia offline completa és una capacitat separada.

---

# 32. FUTURE — Native Client

PWA és el primer client.

Si els experiments mostren limitacions de:

* background GPS;
* battery;
* notifications;

l'app nativa pot avançar-se al roadmap.

---

# 33. FUTURE — Teams / Clans

Es deixa preparada conceptualment.

No s'ha d'implementar ownership col·lectiu fins que existeixi una SPEC pròpia.

---

# 34. FUTURE — Seasons

No decidides.

No s'han de forçar dins l'arquitectura inicial.

---

# 35. Gates generals

Després de:

```text
F3
F6
F9
F13
```

s'ha de fer revisió funcional global.

---

# 36. Gate F3

Preguntar:

* el Fog genera curiositat?
* sortir a explorar té valor?
* la PWA és viable físicament?

---

# 37. Gate F6

Preguntar:

* les Flags generen nous objectius?
* PublicFlagSite vs UserFlag s'entenen?
* el mapa dona massa o massa poca informació?

---

# 38. Gate F9

Preguntar:

* el combat genera ganes de tornar?
* orientation és divertida?
* la notificació d'atac funciona?
* la connectivitat limita massa?
* UserFlag transportable funciona com s'espera?

---

# 39. Gate F13

Preguntar:

* decay funciona?
* Fog avançat és comprensible?
* presència i domini creen incentius correctes?
* el món se sent persistent?

---

# 40. Regla de scope

Una fase posterior no s'ha d'implementar només perquè:

> «ja sabem que algun dia la necessitarem.»

Cal arribar-hi mitjançant el roadmap.

---

# 41. Regla d'experiments

Un valor experimental no es converteix en definitiu dins una SPEC sense:

```text
experiment
or
explicit decision
```

---

# 42. Relació amb EXPERIMENTS-00

Cada fase outdoor ha d'utilitzar els experiments corresponents.

No s'ha de considerar la prova de camp com una activitat informal separada.

Forma part del gate.

---

# 43. Relació amb GAME-SCENARIOS-00

Els scenarios associats a cada fase es convertiran progressivament en:

```text
acceptance criteria
+
E2E tests
+
field tests
```

---

# 44. Relació amb TRACEABILITY-00

Quan una nova decisió introdueixi:

* entity;
* rule;
* phase;

s'ha d'actualitzar la traçabilitat.

---

# 45. MVP real

El primer MVP no és:

> «totes les fases».

El primer MVP de validació principal arriba aproximadament amb F9.

---

# 46. Post-MVP

F10–F18 converteixen el vertical slice en:

> món persistent, defensable i comunitari.

---

# 47. Tourism

El bloc Tourism s'ha de començar:

> després que el core d'exploració física sigui prou estable.

Això no impedeix parlar amb entitats turístiques molt abans.

---

# 48. Principi final

> **Construir una capa, jugar-hi, validar-la i només llavors construir la següent.**

TerritoriLord no s'ha de dissenyar completament des del despatx perquè bona part del seu comportament només es pot entendre al territori real.
