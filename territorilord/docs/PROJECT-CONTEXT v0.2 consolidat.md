# TerritoriLord — Project Context

**Versió:** v0.2 consolidada
**Estat:** context funcional i tècnic pre-SPEC
**Data:** 2026-09-18

---

# 1. Projecte

**Nom provisional:** TerritoriLord

TerritoriLord és una aplicació esportiva i geogràfica que converteix el territori físic en un món persistent de:

* exploració;
* conquesta;
* orientació;
* rivalitat;
* descoberta;
* progressió.

La presència física de l'usuari és el centre del sistema.

---

# 2. Objectiu principal

TerritoriLord ha de generar motius perquè l'usuari faci activitats físiques reals.

L'objectiu no és maximitzar el temps dins de l'aplicació.

L'objectiu és generar decisions com:

> «Avui aniré cap allà.»

---

# 3. Principi rector

> **El mapa ha de donar prou informació per despertar curiositat, però no tanta com per eliminar la necessitat d'explorar físicament.**

---

# 4. Motivacions principals

El producte combina:

```text
EXPLORE
CONQUER
COMPETE
BUILD
```

---

# 5. Relació amb OrientaTrack

TerritoriLord és un projecte independent.

Comparteix conceptualment amb OrientaTrack:

* GPS;
* navegació;
* orientació;
* treball geogràfic.

En el futur es podran reutilitzar:

* components;
* llibreries;
* coneixement;
* serveis.

No s'ha decidit encara una integració tècnica directa.

---

# 6. Modalitats previstes

Inicialment:

```text
RUNNING
TRAIL_RUNNING
WALKING
HIKING
CYCLING
MTB
```

Les regles i coeficients específics es calibraran posteriorment.

---

# 7. Activity

Una `Activity` representa una activitat física real.

Pot generar:

* track;
* exploració;
* XP;
* Power;
* territori;
* visites;
* atac;
* defensa.

No totes les Activities tenen necessàriament les mateixes capacitats.

---

# 8. ValidationCapabilities

La validesa no es redueix a:

```text
valid = true / false
```

Una Activity pot tenir, per exemple:

```text
CAN_COUNT_DISTANCE
CAN_EXPLORE
CAN_VISIT_POI
CAN_CAPTURE_TERRITORY
CAN_ATTACK_FLAG
CAN_DEFEND_FLAG
```

---

# 9. Offline-first

L'enregistrament GPS d'una Activity ha de continuar sense Internet.

Flux conceptual:

```text
RECORDING
↓
offline
↓
continua localment
↓
COMPLETED_LOCAL
↓
sync
↓
server validation
```

---

# 10. Exploració

L'exploració física és permanent com a historial.

Si l'usuari ha estat físicament en una zona:

> el sistema recordarà que l'ha explorada.

---

# 11. Knowledge

El coneixement actual de la zona és temporal.

Pot degradar-se segons:

* temps;
* territori;
* banderes;
* activitat;
* presència.

Per tant:

```text
Exploration
≠
Knowledge
```

---

# 12. Fog of War

Estats conceptuals:

```text
UNKNOWN
DETECTED
DISCOVERED
STALE
HISTORICAL
```

Les zones desconegudes poden mostrar pistes sense revelar tota la informació.

---

# 13. Territori

El territori es representarà provisionalment amb H3.

Es preveu:

```text
ExplorationCell
→ resolució més fina

TerritoryCell
→ resolució més gran
```

Les resolucions exactes són experimentals.

---

# 14. Conquesta

Una Activity aproximadament circular pot generar territori.

Hipòtesi inicial:

```text
TerritoryCell candidate
≈ >= 75% dins del polígon
```

Aquesta regla s'ha de validar.

---

# 15. TerritoryBudget

Una ruta molt gran no implica conquesta il·limitada.

Cada Activity tindrà una capacitat territorial limitada.

---

# 16. Territori rival

El territori rival no es captura simplement perquè queda envoltat.

La mecànica diferencia:

```text
TerritoryPressure
TerritoryDefense
```

La conquesta pot ser gradual.

---

# 17. Dues tipologies de bandera

TerritoriLord diferencia obligatòriament:

```text
PublicFlagSite
UserFlag
```

---

# 18. PublicFlagSite

És un punt geogràfic fix.

Característiques:

* ubicació immutable;
* pot ser neutral;
* pot canviar de propietari;
* conserva historial;
* pot tenir Importance, Prestige i Defense.

Pot ser creat per:

* sistema;
* administrador;
* organisme turístic autoritzat.

---

# 19. UserFlag

És una bandera creada per un jugador.

Característiques:

* creador original immutable;
* propietari mutable;
* pot ser capturada;
* pot ser transportada;
* pot ser replantada.

La ubicació activa es representa mitjançant:

```text
UserFlagPlacement
```

---

# 20. UserFlag capturada

Flux conceptual:

```text
PLANTED
↓
CAPTURED
↓
TRANSPORTED
↓
nova Activity
↓
REPLANTED
```

Si no es replanta dins del termini:

```text
retorna a última ubicació
↓
OWNER = NONE
↓
Defense baixa
```

---

# 21. FlagPrestige i LocationImportance

Per una UserFlag:

```text
FlagPrestige
→ viatja amb la bandera

LocationImportance
→ pertany al lloc
```

No s'han de fusionar.

---

# 22. Visit ≠ Attack

Passar per una Flag pot:

* descobrir;
* actualitzar Knowledge;
* aportar Importance;
* donar XP.

No inicia automàticament combat.

---

# 23. Atac

Abans de començar:

```text
ActivityPurpose = ATTACK_FLAG
FlagTarget = X
```

Regles:

* màxim una Flag per Activity;
* target immutable.

---

# 24. Orientació

L'atac incorpora una prova física d'orientació.

La UI pot mostrar:

* zona;
* proximitat;
* pistes.

No necessita revelar exactament la coordenada.

---

# 25. Validació de localització

Un intent pot ser:

```text
CONFIRMED
UNCERTAIN
INCORRECT
```

`UNCERTAIN` no penalitza.

`INCORRECT` pot reduir `AttackEfficiency`.

---

# 26. ATTACK_IN_PROGRESS

Després d'una localització confirmada:

```text
ATTACK_IN_PROGRESS
```

La Flag queda bloquejada contra:

* eliminació;
* abandonament;
* trasllat.

El defensor pot ser notificat.

No rep la ubicació en viu de l'atacant.

---

# 27. Resolució posterior

L'atac només es resol quan:

```text
Activity complete
↓
server validation
↓
ActivityPower
↓
EffectiveAttack
↓
FlagDefense
↓
result
```

---

# 28. Power

Conceptualment:

```text
PhysicalPower
+
ExplorationPower
+
DiscoveryPower
=
ActivityPower
```

Les fórmules definitives són experimentals.

---

# 29. Defensa

Una Activity:

```text
DEFEND_FLAG
```

pot reforçar principalment una Flag pròpia.

Una Activity normal pot aportar:

```text
Passive Maintenance
```

en menor mesura.

---

# 30. Decadència

Defense i domini no són permanents.

La inactivitat pot reduir:

* FlagDefense;
* TerritoryDefense;
* KnowledgeRetention.

---

# 31. POI

Poden existir:

```text
SystemPOI
CommunityPOI
SponsoredPOI
```

---

# 32. Summit

Un `Summit` és una fita geogràfica independent de:

* Territory;
* Flag;
* POI ownership.

Pot coexistir físicament amb altres entitats.

---

# 33. Progressió

Es diferencien:

```text
XP
Level
Prestige
Reputation
Power
```

Especialment:

```text
XP ≠ Power
```

---

# 34. Turisme

TerritoriLord deixa preparada una línia específica de producte turístic.

Conceptes:

```text
TourismCampaign
DiscoveryAccess
SponsoredDiscoveryZone
SponsoredPOI
SponsoredClaim
VisitorPass
```

No formen part del primer MVP.

---

# 35. DiscoveryAccess

Permet revelar contingut sense afirmar que l'usuari hi ha estat físicament.

Invariant:

```text
DiscoveryAccess
≠
PhysicalDiscovery
```

---

# 36. SponsoredClaim

Una futura recompensa patrocinada pot validar-se mitjançant:

```text
QR
+
current GPS
+
accuracy
+
ClaimRadius
+
server validation
```

Això permet casos com:

> «Descobreix 8 indrets del municipi.»

o promocionar:

* comerços;
* museus;
* miradors;
* equipaments.

---

# 37. No pay-to-win

La monetització pot oferir:

* contingut;
* experiències;
* analítica;
* turisme;
* personalització.

No pot vendre directament:

* AttackPower;
* Defense;
* Territory;
* captures.

---

# 38. Privacitat

Principis:

* Activity privada per defecte;
* inici/final sensibles;
* track separat del resultat territorial;
* sense ubicació rival en temps real;
* username públic separat de la identitat privada.

---

# 39. Anti-cheat

El sistema pot analitzar:

* velocitat;
* timestamps;
* GPS jumps;
* accuracy;
* trajectòries;
* patrons.

Invariant:

```text
GPS anomaly
≠
Fraud
```

---

# 40. Arquitectura inicial

Decisions provisionals:

```text
PWA first
client + API separats
PostgreSQL
PostGIS
H3
MapLibre
server authoritative
local-first recorder
chunked idempotent sync
monorepo
```

---

# 41. Client futur

L'arquitectura ha de permetre incorporar una app nativa.

Especialment si les proves de:

* background GPS;
* pantalla bloquejada;
* bateria;

mostren limitacions importants de la PWA.

---

# 42. PvP online inicial

L'Activity pot funcionar offline.

Però iniciar formalment:

```text
ATTACK_IN_PROGRESS
```

requerirà inicialment connexió amb el backend.

Aquesta decisió s'ha de validar en zones de mala cobertura.

---

# 43. MVP

Primer vertical slice:

```text
Activity
↓
Exploration
↓
Territory
↓
Flag discovery
↓
Orientation
↓
Attack
↓
Result
```

---

# 44. Desenvolupament per fases

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
TESTS
↓
FIELD TEST
↓
DECISION
```

---

# 45. Documents principals

```text
docs/
├── PROJECT-CONTEXT.md
├── GAME-DESIGN-00.md
├── DOMAIN-MODEL-00.md
├── GAME-RULES-01-territory-flags-combat.md
├── GAME-RULES-02-exploration-fog-poi.md
├── GAME-RULES-03-activity-power-validation.md
├── GAME-RULES-04-progression-reputation-economy.md
├── GAME-RULES-05-security-privacy-anticheat.md
├── MVP-00-scope.md
├── DEVELOPMENT-PHASES-00.md
├── GLOSSARY-00.md
├── TRACEABILITY-00.md
├── GAME-SCENARIOS-00.md
├── EXPERIMENTS-00.md
├── VALIDATION-PACK-00.md
└── decisions/
    ├── DECISIONS-00.md
    ├── DECISIONS-01.md
    ├── DECISIONS-02.md
    └── DECISIONS-03.md
```

---

# 46. Decisions deliberadament obertes

No s'han de fixar sense proves:

* H3 resolutions;
* 75%;
* CircularityRadius;
* Flag interaction radius;
* Power;
* Defense;
* TerritoryBudget;
* decay;
* Fog intervals;
* Flag caps;
* cooldowns.

---

# 47. Estat actual

El projecte es troba en:

```text
FUNCTIONAL DESIGN
↓
DOCUMENT CONSOLIDATION
↓
EXTERNAL DESIGN REVIEW
```

Encara no s'ha de considerar iniciada la SPEC tècnica.

---

# 48. Pas següent

El paquet documental consolidat s'ha de sotmetre a una revisió externa transversal.

La revisió ha de buscar:

* contradiccions;
* exploits;
* gaps;
* riscos;
* problemes de domini;
* incompatibilitats amb el roadmap.

Només després:

```text
SPEC-00
```

---

# 49. Principi final

> **Primer entendre i validar el joc; després especificar la tecnologia que l'ha de suportar.**
