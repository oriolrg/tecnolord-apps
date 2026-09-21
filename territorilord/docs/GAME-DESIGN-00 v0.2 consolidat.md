# TerritoriLord — Game Design 00

**Versió:** v0.2 consolidada
**Estat:** disseny funcional base per revisió
**Data:** 2026-09-18

---

# 1. Visió

TerritoriLord és una aplicació esportiva i geogràfica que converteix el territori físic en un món persistent de:

* exploració;
* conquesta;
* orientació;
* rivalitat;
* descoberta;
* progressió.

L'activitat física real és el centre del sistema.

TerritoriLord no pretén ser un joc digital al qual s'afegeix GPS.

El territori real és el tauler de joc.

---

# 2. Principi rector

> **El mapa ha de donar prou informació per despertar curiositat, però no tanta com per eliminar la necessitat d'explorar físicament.**

La funció principal del sistema és generar decisions com:

> «Avui aniré per allà.»

Les mecàniques digitals han d'incentivar:

* caminar;
* córrer;
* pedalar;
* explorar;
* tornar a una zona;
* defensar;
* descobrir.

---

# 3. Quatre motivacions principals

TerritoriLord combina quatre capes.

## Explore

Descobrir:

* territori;
* camins;
* POI;
* cims;
* banderes;
* zones noves.

## Conquer

Transformar activitats físiques vàlides en control territorial.

## Compete

Atacar i defensar:

* PublicFlagSites;
* UserFlags;
* territori.

## Build

Construir una empremta persistent:

* historial d'exploració;
* territori;
* banderes;
* POI;
* cims;
* Prestige;
* achievements.

---

# 4. Modalitats esportives

El sistema es planteja inicialment per:

```text
RUNNING
TRAIL_RUNNING
WALKING
HIKING
CYCLING
MTB
```

Cada modalitat podrà tenir criteris específics de:

* validació;
* velocitat plausible;
* esforç;
* Power.

Els coeficients exactes no estan fixats.

---

# 5. Activity

Una `Activity` representa una activitat física enregistrada.

Pot generar diferents efectes segons la seva qualitat.

Una mateixa activitat pot ser vàlida per:

```text
CAN_COUNT_DISTANCE
CAN_EXPLORE
CAN_VISIT_POI
CAN_CAPTURE_TERRITORY
CAN_ATTACK_FLAG
CAN_DEFEND_FLAG
```

sense haver de ser vàlida per totes les capacitats.

---

# 6. Activitat offline-first

L'enregistrament esportiu no dependrà de disposar de cobertura contínua.

Una Activity pot:

```text
RECORDING
↓
perdre Internet
↓
continuar enregistrant GPS
↓
COMPLETED_LOCAL
↓
sincronitzar després
↓
SERVER VALIDATION
```

El servidor continua sent l'autoritat final dels resultats de joc.

---

# 7. Exploració

L'exploració representa haver estat físicament en una zona.

És progrés permanent.

Una vegada un jugador ha explorat físicament un lloc:

> TerritoriLord conservarà que hi ha estat.

Aquesta memòria no desapareix perquè el jugador deixi de visitar la zona.

---

# 8. Exploration no és Knowledge

Cal separar:

```text
Exploration
```

de:

```text
Knowledge
```

## Exploration

Respon:

> «He estat aquí?»

És històric i permanent.

## Knowledge

Respon:

> «Què sé actualment d'aquesta zona?»

Pot degradar-se.

---

# 9. Fog of War

El Fog limita la informació de joc visible.

Estats conceptuals:

```text
UNKNOWN
DETECTED
DISCOVERED
STALE
HISTORICAL
```

El mapa base no necessita desaparèixer.

El que es limita és principalment la informació del món de TerritoriLord.

---

# 10. DETECTED

Una zona desconeguda pot mostrar indicis.

Exemples:

```text
🚩 ?
🏔 ?
💧 ?
★ ?
```

L'usuari sap que hi ha alguna cosa interessant.

No coneix necessàriament:

* coordenada exacta;
* propietari;
* Defense;
* estat territorial actual.

---

# 11. KnowledgeRetention

La informació no es degrada només segons el temps.

També depèn de la relació del jugador amb el territori.

Poden ajudar a retenir coneixement:

* territori propi;
* PublicFlagSites controlats;
* UserFlags;
* activitat recent;
* POI relacionats;
* presència habitual.

Perdre:

* territori;
* banderes;
* activitat;

pot accelerar la degradació.

---

# 12. Domini no és omniscència

Controlar una zona no significa rebre automàticament tota la informació nova.

Per exemple:

> una nova bandera rival no necessita aparèixer automàticament només perquè el jugador tingui territori proper.

La presència física continua sent rellevant.

---

# 13. Territori

El món territorial es divideix conceptualment en `TerritoryCells`.

La primera tecnologia candidata és H3.

Es preveu utilitzar:

```text
ExplorationCell
→ resolució més fina

TerritoryCell
→ resolució més gran
```

Les resolucions exactes s'han de decidir experimentalment.

---

# 14. Conquesta per ruta circular

Una Activity territorial necessita ser aproximadament circular.

Però:

```text
start ≈ finish
```

no és suficient.

També cal validar:

* continuïtat;
* geometria;
* velocitat;
* durada;
* GPS;
* possibles anomalies.

---

# 15. Àrea conquerida

Hipòtesi inicial:

una `TerritoryCell` pot considerar-se candidata si aproximadament:

```text
>= 75 %
```

de la seva superfície queda dins del polígon delimitat per la ruta.

És un valor experimental.

---

# 16. TerritoryBudget

Una Activity no pot conquistar superfície il·limitada simplement perquè la ruta sigui enorme.

Cada Activity tindrà una capacitat territorial limitada.

Conceptualment:

```text
Territory candidates
↓
TerritoryBudget
↓
Territory affected
```

La fórmula és PENDENT.

---

# 17. Territori rival

Envoltar una zona rival no la captura automàticament.

Es diferencia:

```text
TerritoryPressure
```

de:

```text
TerritoryDefense
```

La conquesta rival pot requerir diverses activitats.

---

# 18. Territori desconnectat

Un jugador pot crear territori lluny del seu domini principal.

Això permet jugar:

* durant vacances;
* viatges;
* en diferents regions.

El territori desconnectat pot tenir pitjor:

* retenció;
* defensa;
* consolidació.

No és territori de segona categoria.

---

# 19. Aïllament

Territori rival completament envoltat:

* no canvia automàticament de propietari;
* pot patir una penalització limitada de defensa o retenció.

Continua requerint activitat física per conquistar-lo.

---

# 20. Dos tipus de bandera

TerritoriLord diferencia explícitament:

```text
PublicFlagSite
```

i:

```text
UserFlag
```

No són dues variants visuals d'una mateixa mecànica.

Representen dos tipus diferents d'objectiu.

---

# 21. PublicFlagSite

Un `PublicFlagSite` representa un lloc físic fix i disputable.

Característiques:

* ubicació permanent;
* pot ser neutral;
* pot tenir propietari;
* pot canviar de propietari;
* no pot ser transportat;
* conserva l'historial del lloc.

Pot provenir de:

* sistema;
* administració;
* organisme turístic autoritzat.

Exemples:

* cim emblemàtic;
* coll;
* mirador;
* lloc públic estratègic.

---

# 22. UserFlag

Una `UserFlag` és una bandera creada per un jugador.

És un objecte persistent amb ubicació variable.

Té:

* creador original;
* propietari actual;
* historial;
* Prestige;
* ubicacions històriques.

Pot ser:

```text
PLANTED
TRANSPORTED
NEUTRAL / RETURNED
```

o estats equivalents futurs.

---

# 23. UserFlagPlacement

Quan una UserFlag està plantada existeix un:

```text
UserFlagPlacement
```

que representa la seva ubicació actual.

Aquest lloc no necessita convertir-se en un FlagSite permanent.

Si la bandera desapareix:

> el placement deixa d'estar actiu.

---

# 24. Captura de UserFlag

Quan es captura:

```text
UserFlag
↓
nou propietari
↓
TRANSPORTED
```

El nou propietari no pot teletransportar-la des del mapa.

Per replantar-la necessita:

> una nova Activity física.

---

# 25. Retorn d'una UserFlag

Una UserFlag capturada no pot quedar indefinidament transportada.

Si no es replanta dins el termini:

```text
TRANSPORTED
↓
timeout
↓
última ubicació
↓
OWNER = NONE
↓
Defense baixa
```

El termini és PENDENT de calibratge.

---

# 26. Crear una UserFlag

Una nova UserFlag només pot plantar-se:

* en territori propi;
* o en territori neutral.

No es pot crear directament dins territori rival.

La creació requerirà:

```text
slot
+
Activity
+
presència física
```

---

# 27. FlagPrestige i LocationImportance

Una UserFlag pot moure's.

Per tant cal separar:

```text
FlagPrestige
```

de:

```text
LocationImportance
```

## FlagPrestige

Viatja amb la bandera.

Representa la seva història.

## LocationImportance

Pertany al lloc.

Es construeix amb:

* visites;
* usuaris diferents;
* activitat real;
* ús comunitari.

---

# 28. Importance, Defense i Prestige

No són equivalents.

```text
Importance
≠
Defense
≠
Prestige
```

## Importance

Valor comunitari del lloc.

## Defense

Resistència competitiva actual.

## Prestige

Valor històric i notorietat.

---

# 29. Visitar no és atacar

Passar físicament per una bandera pot:

* descobrir-la;
* actualitzar Knowledge;
* aportar XP;
* contribuir a Importance.

Però:

```text
Visit ≠ Attack
```

L'atac és explícit.

---

# 30. Planificació d'atac

Abans d'iniciar l'Activity:

```text
ActivityPurpose = ATTACK_FLAG
FlagTarget = X
```

Regles:

* una Flag per Activity;
* el target no pot canviar durant l'activitat;
* passar per altres Flags no les ataca.

---

# 31. Orientació

Atacar una bandera incorpora una prova física d'orientació.

El jugador:

1. coneix aproximadament la zona;
2. s'hi desplaça;
3. busca físicament el punt;
4. prem `ATACAR`.

La UI no ha de convertir necessàriament la prova en navegació exacta.

---

# 32. AttackLocationAttempt

El servidor pot retornar:

```text
CONFIRMED
UNCERTAIN
INCORRECT
```

## CONFIRMED

Ubicació compatible i precisió suficient.

## UNCERTAIN

GPS insuficient.

No penalitza.

## INCORRECT

Posició clarament incorrecta amb accuracy suficient.

Redueix `AttackEfficiency`.

---

# 33. Attack In Progress

Després d'una localització confirmada:

```text
ATTACK_IN_PROGRESS
```

El defensor pot rebre una notificació immediata.

No rep:

* posició de l'atacant;
* track en viu.

La Flag queda protegida contra accions oportunistes com:

* eliminar-la;
* moure-la;
* abandonar-la.

---

# 34. L'atac no acaba al punt

Trobar la Flag no resol el combat.

L'atacant ha de continuar l'Activity.

Només després:

```text
Activity complete
↓
server validation
↓
Power
↓
combat resolution
```

---

# 35. Power

La Power pertany principalment a una Activity.

No és una moneda acumulable indefinidament.

Contribucions conceptuals:

```text
PhysicalPower
ExplorationPower
DiscoveryPower
```

amb possibles aportacions de:

* distància;
* desnivell;
* modalitat;
* territori nou;
* cims;
* POI.

---

# 36. Rendiments decreixents

Les activitats molt grans continuen tenint valor.

Però no s'aplicarà necessàriament:

```text
100 km = 10 × 10 km
```

en combat.

Les fórmules s'han de calibrar.

---

# 37. Combat

Model conceptual:

```text
ActivityPower
×
AttackEfficiency
=
EffectiveAttack
```

comparat amb la defensa efectiva.

Possibles resultats:

```text
DEFENDED
DAMAGED
CAPTURED
```

---

# 38. TerritorySupport

Una Flag pot rebre un suport limitat del territori.

Model provisional:

```text
EffectiveFlagDefense
=
FlagDefense
+
bounded TerritorySupport
```

Aquesta regla s'ha de validar jugant.

---

# 39. Defensa

Una Activity pot seleccionar:

```text
DEFEND_FLAG
```

abans de començar.

Aquesta missió aporta el reforç principal.

Una Activity normal que visita una Flag pròpia pot aportar només:

```text
Passive Maintenance
```

---

# 40. Decadència

Cap territori o bandera ha de ser invencible permanentment.

La inactivitat pot reduir:

* FlagDefense;
* TerritoryDefense;
* KnowledgeRetention.

S'aplicaran:

* sostres;
* decadència;
* rendiments decreixents.

---

# 41. POI

Els POI poden ser:

```text
SystemPOI
CommunityPOI
SponsoredPOI
```

Poden representar:

* fonts;
* patrimoni;
* refugis;
* miradors;
* elements naturals;
* comerços o equipaments patrocinats.

---

# 42. POI comunitari

Un usuari podrà proposar POI.

Altres usuaris podran:

* visitar;
* confirmar;
* denunciar;
* validar indirectament.

El valor de crear POI prové sobretot de:

> que altres persones els utilitzin realment.

---

# 43. Summit

Un cim és una fita independent.

No necessita propietari.

Pot coincidir amb:

* POI;
* PublicFlagSite;
* UserFlag.

La primera visita personal pot tenir valor especial.

---

# 44. XP

`XP` és progressió permanent.

No és Power.

```text
XP ≠ Power
```

Perdre una batalla no elimina XP.

---

# 45. Level

El Level deriva de progressió permanent.

Pot desbloquejar:

* opcions;
* estadístiques;
* límits;
* personalització.

No ha de proporcionar grans multiplicadors automàtics de PvP.

El model final continua PENDENT.

---

# 46. Prestige

Representa:

* història;
* notorietat;
* fites;
* conquestes;
* rivalitats.

Perdre una zona no esborra l'historial.

---

# 47. Reputation

Representa confiança comunitària.

Té més relació amb:

* POI;
* reports;
* contribucions;
* validacions.

No és una força de combat.

---

# 48. Rivalry

Les rivalitats han d'emergir de:

* captures;
* reconquestes;
* fronteres;
* banderes disputades.

No és necessari que el sistema assigni artificialment un rival.

---

# 49. Jugador local

El jugador local té avantatge natural per:

* presència;
* Knowledge;
* defensa;
* continuïtat.

No existeix un multiplicador perquè el sistema conegui el seu domicili.

---

# 50. Turista

El turista pot:

* explorar;
* conquistar;
* descobrir POI;
* visitar cims;
* capturar;
* crear historial permanent.

El territori aconseguit segueix les mateixes regles generals.

---

# 51. DiscoveryAccess

El sistema deixa preparada una futura capa:

```text
DiscoveryAccess
```

que pot revelar informació sense convertir-la en descoberta física.

Regla:

```text
DiscoveryAccess
≠
PhysicalDiscovery
```

---

# 52. TourismCampaign

Una futura `TourismCampaign` pot agrupar:

* POI;
* rutes;
* DiscoveryAccess;
* reptes;
* SponsoredDiscoveryZones;
* SponsoredClaims.

Exemple:

> «Descobreix 8 indrets del municipi.»

---

# 53. SponsoredPOI

Un POI patrocinat:

* està identificat com a patrocinat/oficial;
* pot donar recompenses addicionals;
* pot formar part d'una campanya.

No pot comprar superioritat PvP.

---

# 54. QR + geolocalització

Una futura recompensa patrocinada pot requerir:

```text
QR
+
GPS
+
ClaimRadius
+
server validation
```

Compartir una fotografia del QR no ha de permetre reclamar-la remotament.

---

# 55. VisitClaim i ActivityClaim

Una campanya pot utilitzar:

```text
VISIT_CLAIM
```

per una visita física normal.

O:

```text
ACTIVITY_CLAIM
```

quan la visita ha de formar part d'una Activity esportiva.

---

# 56. No pay-to-win

La monetització pot vendre:

* contingut;
* experiències;
* analítica;
* personalització;
* discovery;
* turisme.

No:

```text
money → AttackPower
money → Defense
money → territory
money → guaranteed capture
```

---

# 57. Privacitat

Principis:

* Activity privada per defecte;
* inici/final sensibles;
* resultat territorial separat del track públic;
* sense ubicació rival en temps real;
* username públic separat de dades personals.

---

# 58. Anti-cheat

El sistema pot analitzar:

* timestamps;
* velocitat;
* continuïtat;
* GPS jumps;
* accuracy;
* trajectòria;
* patrons.

Però:

```text
GPS anomaly
≠
Fraud
```

Una única anomalia no és prova suficient.

---

# 59. Imported Activities

En el futur activitats importades poden potencialment aportar:

* historial;
* exploració;
* XP.

No podran realitzar retroactivament:

* Attack;
* Defense.

---

# 60. Arquitectura inicial prevista

Decisions inicials:

```text
PWA first
API separada
PostgreSQL + PostGIS + H3
MapLibre
server authoritative
local-first Activity recording
sync per chunks idempotents
monorepo
```

Aquesta arquitectura encara s'ha de revisar externament abans de SPEC.

---

# 61. MVP

El primer vertical slice ha de demostrar:

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

No necessita encara:

* clans;
* monetització;
* POI comunitari complet;
* seasons;
* anti-cheat avançat;
* social avançat.

---

# 62. Desenvolupament

Cada fase seguirà:

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
REAL TEST
↓
DECISION
```

Cap fase outdoor es donarà per validada només perquè els tests automatitzats passin.

---

# 63. Decisions experimentals

No estan congelats:

* resolucions H3;
* 75 % territorial;
* CircularityRadius;
* Flag interaction radius;
* Power;
* Defense;
* TerritoryBudget;
* decay;
* Fog intervals;
* limits;
* cooldowns.

Es determinaran mitjançant `EXPERIMENTS-00`.

---

# 64. Core loops

## Sport

```text
Activity
→ result
→ progress
```

## Exploration

```text
Fog
→ curiosity
→ physical exploration
→ discovery
→ new curiosity
```

## Territory

```text
circular Activity
→ territory
→ defense
→ rival pressure
```

## Flag

```text
detect
→ discover
→ plan
→ orient
→ attack
→ defend/capture
```

## Tourism

```text
campaign
→ hint
→ visit
→ claim
→ reward
→ permanent discovery
```

---

# 65. Criteri de producte

TerritoriLord no ha de maximitzar necessàriament:

> minuts mirant la pantalla.

Ha de maximitzar la capacitat de generar:

> noves activitats físiques motivades pel territori.

---

# 66. Estat

El Game Design és prou complet per passar a revisió funcional externa.

Encara s'ha de:

* sincronitzar la resta de documents antics;
* revisar el model transversalment;
* validar mecàniques experimentals al carrer.

No s'ha d'interpretar aquesta versió com un equilibratge final.
