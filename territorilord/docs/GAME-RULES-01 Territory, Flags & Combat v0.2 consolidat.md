# TerritoriLord — Game Rules 01: Territory, Flags & Combat

**Versió:** v0.2 consolidada
**Estat:** regles funcionals per revisió
**Data:** 2026-09-18

---

# 1. Objectiu

Aquest document defineix les regles de:

* territori;
* conquesta;
* defensa;
* PublicFlagSite;
* UserFlag;
* visites;
* atac;
* orientació;
* captura;
* transport;
* replantació;
* rivalitat territorial.

No fixa encara:

* resolució H3;
* fórmules definitives;
* valors de Defense;
* TerritoryBudget;
* cooldowns;
* Flag limits;
* radis GPS.

---

# 2. Territori

El món de joc es divideix conceptualment en `TerritoryCells`.

Inicialment es provarà H3.

Cada TerritoryCell pot estar:

```text
NEUTRAL
OWNED_BY_USER
```

La propietat és temporal.

L'exploració de la zona és independent.

---

# 3. TerritoryOwnership ≠ Exploration

Un jugador pot:

* explorar una cel·la sense controlar-la;
* controlar una cel·la que després passa a tenir Knowledge obsolet.

Per tant:

```text
Exploration
≠
TerritoryOwnership
≠
Knowledge
```

---

# 4. Conquesta de territori neutral

Una Activity territorial vàlida i aproximadament circular pot generar territori.

El servidor:

1. valida l'Activity;
2. deriva la geometria;
3. calcula TerritoryCells candidates;
4. aplica regles territorials;
5. aplica TerritoryBudget;
6. resol els canvis.

---

# 5. Regla experimental de superfície

Primera hipòtesi:

```text
TerritoryCell candidate
if approximately >= 75%
inside activity polygon
```

Aquest percentatge és experimental.

No és una constant definitiva.

---

# 6. TerritoryBudget

Una ruta molt gran no pot conquistar superfície il·limitada.

Cada Activity disposa conceptualment d'un:

```text
TerritoryBudget
```

que limita quantes cel·les o quina superfície pot afectar.

---

# 7. Territori rival

Una ruta que envolta territori rival:

> no el captura automàticament.

L'Activity pot generar:

```text
TerritoryPressure
```

contra:

```text
TerritoryDefense
```

La captura pot requerir múltiples activitats.

---

# 8. Territori envoltat

Una illa rival completament envoltada:

* continua sent rival;
* pot perdre part de la seva resistència;
* pot tenir pitjor retenció;
* no canvia automàticament de propietari.

---

# 9. Territori desconnectat

Un jugador pot controlar territori lluny del seu domini principal.

Això és important per:

* viatges;
* turisme;
* activitats en altres regions.

El territori desconnectat pot tenir pitjor:

* defensa;
* retenció;
* consolidació.

---

# 10. TerritoryDefense

La defensa territorial és limitada.

Pot augmentar amb:

* activitat legítima;
* presència;
* suport de Flags.

Pot disminuir amb:

* inactivitat;
* pressió;
* aïllament.

Cap cel·la ha de ser invencible.

---

# 11. Dues classes de bandera

El domini competitivament diferencia:

```text
PublicFlagSite
```

i:

```text
UserFlag
```

No es poden tractar com la mateixa mecànica.

---

# 12. PublicFlagSite

Un PublicFlagSite és:

* un lloc geogràfic fix;
* persistent;
* disputable.

Pot ser:

* neutral;
* controlat per un User.

Pot tenir:

* Importance;
* Prestige;
* Defense;
* historial.

---

# 13. Ubicació immutable del PublicFlagSite

Invariant:

```text
Capture PublicFlagSite
→ owner changes
→ location remains
```

Mai es transporta.

---

# 14. Origen del PublicFlagSite

Pot ser creat per:

```text
SYSTEM
ADMIN
TOURISM_AUTHORIZED
```

Els usuaris normals no poden crear PublicFlagSites lliurement.

---

# 15. PublicFlagSite neutral

Pot existir:

```text
OWNER = NONE
```

No es captura simplement passant-hi.

Cal:

* Activity adequada;
* target;
* orientació;
* presència;
* finalització vàlida.

La seva defensa inicial serà baixa.

---

# 16. UserFlag

Una UserFlag és:

```text
persistent object
+
movable placement
```

Té:

* creator immutable;
* current owner mutable;
* FlagPrestige;
* historial.

---

# 17. UserFlagPlacement

Representa la ubicació activa actual de la UserFlag.

Pot haver-hi:

```text
0 or 1 active placement
```

per UserFlag.

Quan la bandera és retirada, capturada o transportada:

> el placement deixa d'estar actiu.

---

# 18. Crear una UserFlag

Requereix:

```text
available creation slot
+
valid Activity
+
physical presence
```

Només es pot plantar:

* en territori propi;
* o en territori neutral.

No en territori rival.

---

# 19. Plantar en territori neutral

Plantar una UserFlag:

> no captura automàticament les TerritoryCells.

L'Activity que ha portat el jugador fins allà pot, per les regles normals, haver conquistat territori.

---

# 20. FLAG_CREATION_CAP

Limita quantes UserFlags pot crear el jugador.

El valor és experimental.

---

# 21. FLAG_CONTROL_CAP

Limita quantes Flags pot controlar.

És diferent de `FLAG_CREATION_CAP`.

Pot relacionar-se parcialment amb:

* progressió;
* territori.

Sempre amb sostre.

---

# 22. FlagCreator

El creador original d'una UserFlag:

> no canvia mai.

---

# 23. FlagOwner

El propietari actual:

> pot canviar mitjançant captura.

---

# 24. FlagPrestige

Pertany a la bandera.

En una UserFlag:

```text
moves with the Flag
```

Pot representar:

* antiguitat;
* captures;
* reconquestes;
* notorietat.

---

# 25. LocationImportance

Pertany al lloc.

No es mou amb una UserFlag.

Una bandera famosa traslladada a un punt nou pot tenir:

```text
high FlagPrestige
+
low LocationImportance
```

---

# 26. Importància basada en comunitat

LocationImportance creix principalment amb:

* diferents usuaris;
* visites reals;
* recurrència;
* ús comunitari.

El propietari repetint la mateixa visita no ha de poder inflar-la fàcilment.

---

# 27. Importance ≠ Defense ≠ Prestige

Regla obligatòria:

```text
Importance
≠
Defense
≠
Prestige
```

Una bandera popular no és automàticament invencible.

---

# 28. FlagVisit

Passar físicament per una Flag pot generar:

* discovery;
* Knowledge refresh;
* Importance;
* XP.

No genera Attack automàtic.

---

# 29. Visit ≠ Attack

Invariant:

```text
Visit
≠
Attack
```

L'atac és explícit i planificat.

---

# 30. Preparació de FlagAttack

Abans de començar l'Activity:

```text
ActivityPurpose = ATTACK_FLAG
FlagTarget = X
```

Regles:

* màxim un target;
* target immutable durant Activity.

---

# 31. Una Flag per Activity

Invariant:

```text
MAX_FLAG_ATTACKS_PER_ACTIVITY = 1
```

Passar per altres Flags pot generar Visit, però no Attack.

---

# 32. Orientació

El jugador no rep necessàriament la coordenada exacta.

El sistema pot mostrar:

* zona;
* radi;
* proximitat;
* hints.

La finalitat és una mini-prova d'orientació.

---

# 33. Iniciar l'atac

Quan creu haver localitzat la Flag, el jugador executa:

```text
ATTACK
```

Inicialment aquesta acció requereix connexió.

---

# 34. Validació online inicial

El servidor comprova:

* Flag existeix;
* owner;
* state;
* attackability;
* Activity activa;
* FlagTarget correcte;
* GPS;
* accuracy;
* locks.

---

# 35. AttackLocationAttempt

Pot resultar:

```text
CONFIRMED
UNCERTAIN
INCORRECT
```

---

# 36. CONFIRMED

Posició compatible amb precisió suficient.

---

# 37. UNCERTAIN

GPS insuficient per decidir.

No penalitza.

---

# 38. INCORRECT

Posició clarament incorrecta amb precisió suficient.

Redueix `AttackEfficiency`.

No redueix:

* XP general;
* Reputation.

---

# 39. AttackEfficiency

Pertany només a l'atac actual.

Diversos intents incorrectes poden reduir-la progressivament.

La fórmula és experimental.

---

# 40. ATTACK_IN_PROGRESS

Després d'un `CONFIRMED`:

```text
FlagAttack
→ ATTACK_IN_PROGRESS
```

El resultat final encara no està resolt.

---

# 41. Lock de bandera

Durant `ATTACK_IN_PROGRESS` el defensor no pot evitar la batalla mitjançant:

* eliminar;
* abandonar;
* moure;
* substituir la Flag.

---

# 42. Notificació immediata

El defensor pot rebre:

> La teva bandera està sent atacada.

No rep:

* coordenada de l'atacant;
* track;
* posició en temps real.

---

# 43. Defensa reactiva

Una vegada iniciat formalment l'atac:

> una nova acció del defensor no modifica retroactivament aquest combat.

El defensor pot preparar accions futures.

---

# 44. L'atac continua després de la Flag

Trobar la Flag no és suficient.

Cal completar l'Activity.

---

# 45. Resolució

Només després de:

```text
Activity complete
↓
sync
↓
server validation
↓
ActivityPower
↓
combat resolution
```

es determina el resultat.

---

# 46. Activity invàlida

Si l'Activity finalment no té:

```text
CAN_ATTACK_FLAG
```

l'atac no pot capturar.

---

# 47. Power

Model conceptual:

```text
PhysicalPower
+
ExplorationPower
+
DiscoveryPower
=
ActivityPower
```

La fórmula exacta no està fixada.

---

# 48. EffectiveAttack

Conceptualment:

```text
ActivityPower
×
AttackEfficiency
=
EffectiveAttack
```

---

# 49. FlagDefense

Cada Flag té una defensa pròpia actual.

Pot:

* augmentar;
* disminuir;
* decaure.

---

# 50. TerritorySupport

Model provisional:

```text
EffectiveFlagDefense
=
FlagDefense
+
bounded TerritorySupport
```

El territori ajuda.

No fa la Flag invencible.

---

# 51. Resultats de combat

Possibles:

```text
DEFENDED
DAMAGED
CAPTURED
```

---

# 52. DEFENDED

L'atac no redueix suficientment la Flag.

---

# 53. DAMAGED

La Flag continua amb el propietari actual però perd Defense.

---

# 54. CAPTURED

La Defense és superada.

El comportament depèn del tipus de Flag.

---

# 55. Captura de PublicFlagSite

Resultat:

```text
old owner
↓
new owner
```

Ubicació:

```text
unchanged
```

Historial:

```text
preserved
```

---

# 56. Captura de UserFlag

Resultat conceptual:

```text
old UserFlagPlacement
→ inactive

UserFlag owner
→ attacker

UserFlag state
→ TRANSPORTED
```

---

# 57. UserFlag transportada

La bandera capturada:

* no té placement actiu;
* està sota control del nou owner;
* no pot quedar així indefinidament.

---

# 58. Replantació

Per replantar-la cal:

```text
new physical Activity
```

No es pot seleccionar simplement un punt remot del mapa.

---

# 59. Zona de replantació

Inicialment:

> qualsevol ubicació vàlida dins territori propi.

---

# 60. Flag Return

Si no es replanta dins del termini:

```text
TRANSPORTED
↓
deadline expires
↓
previous placement
↓
OWNER = NONE
↓
low Defense
```

Qualsevol User pot competir per recuperar-la.

---

# 61. Historial de UserFlag

Es conserva:

* creator;
* owners;
* captures;
* placements;
* Prestige.

La LocationImportance de l'antiga ubicació:

> no es transfereix a la nova.

---

# 62. Límit superat després de captura

Una captura no s'ha de bloquejar necessàriament just en el moment més interessant.

Si el nou owner supera el control cap:

> haurà de reorganitzar/abandonar una Flag segons la futura regla concreta.

El flux exacte continua pendent.

---

# 63. Abandonament remot

Una UserFlag pròpia pot abandonar-se remotament.

Això evita obligar un jugador a tornar físicament a un lloc remot només per alliberar capacitat.

---

# 64. Cooldown d'abandonament

Després d'abandonar:

```text
slot recovery
```

pot tenir cooldown.

Valor PENDENT.

---

# 65. Prohibició durant atac

No es pot abandonar una Flag que està:

```text
ATTACK_IN_PROGRESS
```

---

# 66. Defensa explícita

El propietari pot iniciar:

```text
ActivityPurpose = DEFEND_FLAG
```

abans de sortir.

Cal:

* visitar físicament la Flag;
* completar Activity;
* validar.

---

# 67. Passive Maintenance

Una Activity normal que passa per una Flag pròpia pot aportar manteniment menor.

Ha de ser inferior a la defensa explícita.

---

# 68. Defense cap

FlagDefense:

* té sostre;
* no pot créixer indefinidament.

---

# 69. Defense decay

Amb inactivitat:

```text
FlagDefense ↓
```

progressivament.

Això evita fortaleses eternes.

---

# 70. Territori i Flag capturada

Capturar una Flag:

> no transfereix automàticament TerritoryOwnership.

El territori conserva el seu owner actual.

La pèrdua de la Flag pot:

* reduir suport;
* reduir retenció;
* facilitar futurs atacs.

---

# 71. PublicFlagSite i territori

Capturar un PublicFlagSite tampoc captura automàticament la zona.

La mateixa Activity pot haver generat:

* TerritoryPressure;
* conquest neutral;
* exploració.

---

# 72. ATTACK_FLAG i altres efectes

Una Activity d'atac continua podent:

* explorar;
* descobrir;
* capturar territori neutral;
* exercir TerritoryPressure.

L'Activity física no es divideix artificialment en sistemes excloents.

---

# 73. PublicFlagSite + UserFlag

Poden coexistir a prop.

També poden coincidir conceptualment amb:

* POI;
* Summit.

La UI haurà de gestionar la densitat visual.

---

# 74. Visibilitat de PublicFlagSite

Pot variar segons política:

```text
PUBLIC_VISIBLE
FOG_DETECTED
FOG_HIDDEN
```

Això permet diferenciar:

* punts turístics;
* objectius estrictament competitius.

---

# 75. Fog i combat

Una Flag no descoberta no ha de revelar tota la seva informació.

Flux normal:

```text
DETECTED
↓
PhysicalDiscovery
↓
DISCOVERED
↓
plan future attack
```

---

# 76. Defense visible

Abans d'atacar, la informació serà aproximada.

Exemple:

```text
LOW
MEDIUM
HIGH
VERY_HIGH
```

No necessàriament:

```text
Defense = 67
```

---

# 77. Power preview

Durant l'Activity pot mostrar-se una estimació aproximada de Power.

El resultat definitiu és server-side.

---

# 78. Rivalry

Rivalry pot emergir per:

* repeated captures;
* reconquests;
* shared borders;
* Flag theft.

No necessita assignació artificial.

---

# 79. Locals i visitants

No existeix bonus per domicili.

L'avantatge local apareix per:

* presència;
* Knowledge;
* defense;
* consistency.

El visitant pot competir segons les mateixes regles.

---

# 80. Anti-farming

Cal aplicar rendiments decreixents quan sigui necessari.

Exemples:

* visites repetides;
* micro-defenses;
* captures pactades.

---

# 81. Imported Activities

No poden realitzar retroactivament:

```text
FlagAttack
FlagDefense
```

Aquestes mecàniques requereixen interacció en viu.

---

# 82. Auditabilitat

Els resultats competitius han de poder relacionar-se amb:

```text
Activity
RulesVersion
Validation
Power
Attack
DefenseBefore
DefenseAfter
Result
```

---

# 83. Seguretat física

Una Flag no ha d'incentivar:

* propietat privada;
* zona prohibida;
* punt físicament perillós.

La validació GPS ha de permetre suficient tolerància quan la seguretat ho requereixi.

---

# 84. Privacitat

La notificació d'atac no exposa la posició de l'atacant.

TerritoriLord no ha de convertir PvP virtual en persecució física.

---

# 85. Experiments associats

Especialment:

```text
EXP-04 threshold
EXP-05 TerritoryBudget
EXP-06 circularity
EXP-08 interaction radius
EXP-09 GPS classification
EXP-10 orientation UX
EXP-16 FlagDefense
EXP-17 TerritorySupport
EXP-18 Passive Maintenance
EXP-19 Defense decay
EXP-24 AttackEfficiency
EXP-25 gradual combat
EXP-26 attack notification
EXP-27 transported UserFlag
EXP-28/29 Flag caps
EXP-30 abandon cooldown
EXP-39/40 attack connectivity
```

---

# 86. Core territory loop

```text
Activity
↓
validation
↓
territory effect
↓
ownership
↓
defense
↓
rival pressure
↓
new Activity
```

---

# 87. Core PublicFlagSite loop

```text
detect
↓
discover
↓
plan attack
↓
orient
↓
complete Activity
↓
capture
↓
control same place
```

---

# 88. Core UserFlag loop

```text
create
↓
plant
↓
defend
↓
enemy captures
↓
TRANSPORTED
↓
new owner replants
```

o:

```text
TRANSPORTED
↓
timeout
↓
returns neutral
```

---

# 89. Principi final

> **TerritoriLord ha de premiar presència física, planificació i constància; mai permetre que una simple acció sobre el mapa substitueixi allò que el jugador hauria de fer al territori real.**
