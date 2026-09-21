# TerritoriLord — Glossary 00

**Estat:** vocabulari funcional v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document defineix el vocabulari funcional principal de TerritoriLord.

La seva finalitat és evitar:

* ambigüitats;
* sinònims inconsistents;
* confusions entre conceptes semblants;
* interpretacions diferents entre documents;
* decisions tècniques basades en significats incorrectes.

Els noms tècnics definitius poden evolucionar.

El significat funcional, però, s'ha de conservar.

---

# 2. Principis de vocabulari

TerritoriLord diferencia explícitament conceptes que en altres aplicacions podrien fusionar-se.

Relacions especialment importants:

```text
Exploration ≠ Knowledge

DiscoveryAccess ≠ PhysicalDiscovery

XP ≠ Power

Importance ≠ Defense ≠ Prestige

PublicFlagSite ≠ UserFlag

FlagPrestige ≠ LocationImportance

Visit ≠ Attack

TerritoryOwnership ≠ Exploration

ActivityValidity ≠ PvPValidity

Location ≠ Ownership

Detection ≠ Discovery
```

---

# 3. User

## User

Persona amb compte a TerritoriLord.

Pot:

* registrar Activities;
* explorar;
* controlar territori;
* crear UserFlags;
* capturar Flags;
* visitar POI;
* participar en campanyes.

No implica que la seva identitat civil sigui pública.

---

## Username

Identificador públic principal del jugador.

No equival necessàriament a:

* nom real;
* email;
* identitat legal.

---

# 4. Activity

## Activity

Sessió d'activitat física registrada per TerritoriLord.

Exemples:

* running;
* trail running;
* walking;
* hiking;
* cycling;
* MTB.

Pot contenir:

* Track;
* mostres GPS;
* durada;
* distància;
* desnivell;
* modalitat;
* objectiu de joc;
* resultats derivats.

---

## ActivityType

Modalitat física declarada per a una Activity.

Exemples:

```text
RUNNING
TRAIL_RUNNING
WALKING
HIKING
CYCLING
MTB
```

Pot afectar:

* validació;
* Power;
* velocitats plausibles;
* regles futures.

---

## ActivityPurpose

Objectiu especial seleccionat per a una Activity.

Exemples conceptuals:

```text
NORMAL
ATTACK_FLAG
DEFEND_FLAG
CREATE_FLAG
```

Una Activity pot continuar generant altres efectes normals encara que tingui un Purpose específic.

---

# 5. Track

## Track

Trajectòria geogràfica d'una Activity.

És la representació ordenada de les posicions enregistrades durant l'activitat.

No és equivalent a les dades GPS originals.

---

## Raw GPS Sample

Mostra original obtinguda del dispositiu.

Pot incloure:

```text
timestamp
latitude
longitude
accuracy
altitude
speed
heading
```

Les mostres originals es conserven inicialment per:

* validació;
* auditoria;
* anti-cheat;
* recalcul.

---

## Derived Track

Representació derivada del Raw Track.

Pot estar:

* simplificada;
* corregida;
* agregada;
* convertida a geometria.

No substitueix necessàriament les dades originals.

---

# 6. Activity Validation

## ActivityValidation

Procés que determina si una Activity és suficientment coherent per produir determinats efectes.

Pot analitzar:

* timestamps;
* velocitats;
* salts GPS;
* accuracy;
* continuïtat;
* circularitat;
* distància;
* durada.

---

## ValidationCapability

Permís derivat de la validació.

Una mateixa Activity pot tenir:

```text
CAN_COUNT_DISTANCE
CAN_EXPLORE
CAN_VISIT_POI
CAN_CAPTURE_TERRITORY
CAN_ATTACK_FLAG
CAN_DEFEND_FLAG
```

No existeix necessàriament un únic:

```text
valid = true / false
```

per a totes les funcionalitats.

---

## ActivityValidity

Estat general de validació d'una Activity.

Pot conceptualment ser:

```text
VALID
PARTIALLY_VALID
INVALID
REJECTED
```

No s'ha de confondre amb les `ValidationCapabilities`.

---

# 7. Circularity

## Circularity

Mesura de fins a quin punt una Activity acaba aproximadament al lloc on havia començat.

És necessària per a determinades accions territorials.

No és suficient per si sola per validar una Activity.

---

## CircularityRadius

Distància màxima acceptable entre inici i final per considerar una Activity aproximadament circular.

Valor:

**PENDENT DE PROVES REALS.**

---

# 8. Exploration

## Exploration

Fet que un jugador ha recorregut físicament una zona.

Representa experiència real adquirida sobre el territori.

L'exploració forma part de l'historial permanent.

---

## ExplorationCell

Unitat geogràfica utilitzada per representar exploració.

Inicialment es planteja utilitzar H3.

Probablement tindrà una resolució més detallada que `TerritoryCell`.

---

## PhysicalDiscovery

Descoberta obtinguda perquè l'usuari ha estat físicament al lloc.

Pot afectar:

* Exploration;
* historial;
* Fog;
* POI;
* Flag;
* recompenses.

La descoberta física és permanent com a historial.

---

# 9. Knowledge

## Knowledge

Informació actual que un jugador té sobre una zona.

Pot incloure:

* propietaris;
* banderes;
* defenses aproximades;
* POI coneguts;
* estat territorial.

A diferència d'Exploration:

> Knowledge pot degradar-se.

---

## KnowledgeRetention

Conjunt de factors que determinen quant de temps es conserva actualitzada la informació d'una zona.

Pot dependre de:

* recència de visites;
* territori propi;
* UserFlags;
* PublicFlagSites controlats;
* POI relacionats;
* activitat recent.

No és necessari que sigui un únic valor persistent.

---

# 10. Fog of War

## Fog of War

Mecanisme que limita la informació que l'usuari coneix d'una zona.

No significa necessàriament ocultar completament el mapa base.

Afecta principalment informació de joc.

---

## UNKNOWN

Zona sense coneixement suficient.

La informació de joc està pràcticament oculta.

---

## DETECTED

El jugador sap que existeix alguna cosa interessant però no disposa encara d'informació completa.

Exemple:

```text
🚩 ?
🏔 ?
★ ?
```

---

## DISCOVERED

La zona o element ha estat descobert físicament i la informació és actual.

---

## STALE

La zona havia estat descoberta però la informació actual ha quedat parcialment obsoleta.

---

## HISTORICAL

Es conserva la memòria que el jugador hi havia estat, però pràcticament no hi ha informació tàctica actual.

---

# 11. Discovery Access

## DiscoveryAccess

Permís temporal, comercial, turístic o promocional per mostrar informació que normalment estaria amagada pel Fog.

No significa que l'usuari hagi visitat físicament aquella zona.

---

## Regla essencial

```text
DiscoveryAccess
≠
PhysicalDiscovery
```

Un pass turístic pot mostrar:

* pistes;
* POI;
* rutes;
* zones.

Però no converteix aquests llocs en explorats físicament.

---

# 12. Territory

## Territory

Part del món susceptible de control per jugadors.

No equival a Exploration.

Un usuari pot:

* haver explorat territori que no controla;
* controlar territori del qual després perd coneixement actual.

---

## TerritoryCell

Unitat geogràfica de control territorial.

Inicialment basada provisionalment en H3.

Probablement tindrà menor resolució que `ExplorationCell`.

---

## TerritoryOwnership

Relació que indica quin jugador controla una TerritoryCell en un moment determinat.

Pot canviar.

No forma part del progrés permanent.

---

## Neutral Territory

Territori sense propietari actual.

---

## Connected Territory

Territori propi connectat espacialment amb altres cel·les del mateix jugador.

Pot tenir avantatges de consolidació.

---

## Disconnected Territory

Territori propi separat geogràficament de la resta del domini del jugador.

És legal.

Pot tenir:

* menor defensa;
* menor retenció;
* major decadència.

---

# 13. Territory Pressure

## TerritoryPressure

Pressió produïda per una Activity sobre territori rival.

No implica captura automàtica.

Pot reduir o superar la defensa territorial.

---

## TerritoryDefense

Resistència actual d'una TerritoryCell a ser capturada.

Pot dependre de:

* activitat recent;
* presència;
* banderes;
* connectivitat;
* decadència.

---

## TerritoryBudget

Límit de territori que una única Activity pot afectar.

Evita que una ruta extremadament gran conquereixi una superfície desproporcionada.

---

# 14. Power

## Power

Valor derivat d'una Activity que representa la seva capacitat d'afectar el joc.

No és una moneda.

No s'acumula indefinidament entre activitats.

---

## PhysicalPower

Part de la Power derivada principalment de l'esforç físic.

Pot considerar:

* distància;
* durada;
* desnivell;
* modalitat.

---

## ExplorationPower

Part de la Power derivada d'explorar territori nou.

---

## DiscoveryPower

Part de la Power derivada de descobriments rellevants.

Exemples:

* cims;
* POI;
* zones;
* altres elements.

---

## ActivityPower

Power total calculada per una Activity.

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

La fórmula definitiva és PENDENT.

---

# 15. XP

## XP

Progrés permanent del jugador.

S'utilitza principalment per:

* Level;
* progressió;
* achievements;
* historial.

---

## Regla essencial

```text
XP ≠ Power
```

Fer una activitat pot generar simultàniament:

* XP permanent;
* Power utilitzable per aquella Activity.

Són conceptes diferents.

---

# 16. Level

## Level

Representació general de la progressió acumulada del jugador.

Pot desbloquejar:

* opcions;
* personalització;
* límits;
* estadístiques.

No ha de convertir-se en un gran multiplicador directe de combat.

El model final de Level continua PENDENT.

---

# 17. Prestige

## Prestige

Reconixement històric o notorietat.

Pot derivar de:

* conquestes;
* rivalitats;
* antiguitat;
* fites;
* banderes;
* exploració.

Prestige no és força militar directa.

---

# 18. Reputation

## Reputation

Mesura de confiança comunitària.

Pot tenir relació amb:

* POI creats;
* validacions;
* denúncies;
* contribucions.

No equival a XP ni Prestige.

---

# 19. Flag

## Flag

Terme genèric utilitzat només quan una regla és comuna a diferents tipologies de bandera.

Sempre que sigui rellevant cal distingir:

```text
PublicFlagSite
```

de:

```text
UserFlag
```

---

# 20. PublicFlagSite

## PublicFlagSite

Punt geogràfic permanent que funciona com a bandera pública.

Característiques:

* ubicació fixa;
* no es transporta;
* pot tenir propietari;
* pot quedar neutral;
* pot ser capturat;
* conserva historial permanent.

Pot ser creat per:

* sistema;
* administrador;
* organisme turístic autoritzat.

---

## Regla essencial

En capturar un PublicFlagSite:

```text
canvia OWNER
```

però:

```text
NO canvia LOCATION
```

---

# 21. UserFlag

## UserFlag

Bandera creada per un jugador i susceptible de transport.

Té:

* creador original;
* propietari actual;
* Prestige;
* historial;
* ubicacions històriques.

Pot ser capturada.

---

## Regla essencial

Una UserFlag és:

```text
objecte persistent
+
ubicació variable
```

---

# 22. UserFlagPlacement

## UserFlagPlacement

Ubicació actual on està plantada una UserFlag.

No és necessàriament un lloc persistent després que la bandera sigui retirada.

---

# 23. Creator

## FlagCreator

Usuari que va crear originalment una UserFlag.

No canvia quan la bandera és capturada.

---

# 24. FlagOwner

## FlagOwner

Jugador que controla actualment una Flag.

Pot canviar moltes vegades.

No s'ha de confondre amb `FlagCreator`.

---

# 25. Flag History

## FlagHistory

Historial dels esdeveniments significatius d'una Flag.

Pot incloure:

* creació;
* propietaris;
* ubicacions;
* captures;
* reconquestes;
* períodes neutrals.

---

# 26. FlagPrestige

## FlagPrestige

Prestigi acumulat per la UserFlag com a objecte històric.

Viatja amb ella encara que canviï d'ubicació.

---

# 27. LocationImportance

## LocationImportance

Importància comunitària d'un punt geogràfic concret.

Pot dependre de:

* visites;
* usuaris diferents;
* ús real;
* recurrència.

No viatja amb una UserFlag.

---

## Regla essencial

```text
FlagPrestige
→ segueix la bandera

LocationImportance
→ queda al lloc
```

---

# 28. FlagImportance

## FlagImportance

Terme utilitzat quan la importància està associada al lloc d'una bandera, especialment en un `PublicFlagSite`.

No s'ha de confondre amb:

* FlagDefense;
* FlagPrestige.

---

# 29. FlagDefense

## FlagDefense

Resistència actual d'una Flag davant d'un atac.

Pot:

* augmentar amb defensa;
* disminuir amb atacs;
* degradar-se amb inactivitat.

Té un límit.

---

# 30. TerritorySupport

## TerritorySupport

Bonificació limitada que el territori circumdant pot aportar a la defensa d'una Flag.

No substitueix `FlagDefense`.

Conceptualment:

```text
EffectiveFlagDefense
=
FlagDefense
+
TerritorySupport
```

amb límit.

---

# 31. Visit

## FlagVisit

Presència legítima d'un jugador a prop d'una Flag.

Pot contribuir a:

* descoberta;
* Importance;
* XP;
* actualització de Knowledge.

---

## Regla essencial

```text
Visit ≠ Attack
```

Passar per una bandera no inicia combat.

---

# 32. EffectiveVisit

## EffectiveFlagVisit

Visita considerada vàlida per contribuir a mètriques comunitàries.

Pot aplicar:

* diversitat d'usuaris;
* rendiments decreixents;
* anti-farming;
* validació GPS.

---

# 33. Attack Target

## FlagTarget

Flag seleccionada com a objectiu abans de començar una Activity d'atac.

Una Activity pot tenir com a màxim:

```text
1 FlagTarget
```

---

# 34. FlagAttack

## FlagAttack

Intent explícit de capturar o debilitar una Flag.

Requereix:

* objectiu preseleccionat;
* Activity activa;
* presència física;
* orientació;
* validació;
* Activity completada.

---

# 35. AttackLocationAttempt

## AttackLocationAttempt

Intent explícit de confirmar que el jugador ha localitzat físicament la Flag.

Pot tenir resultat:

```text
CONFIRMED
UNCERTAIN
INCORRECT
```

---

# 36. CONFIRMED

La ubicació del jugador és compatible amb la Flag amb precisió suficient.

---

# 37. UNCERTAIN

La informació GPS no permet decidir amb confiança.

No penalitza el jugador.

---

# 38. INCORRECT

La ubicació és clarament incorrecta amb precisió suficient.

Pot reduir `AttackEfficiency`.

---

# 39. AttackEfficiency

## AttackEfficiency

Factor que representa l'eficiència de l'atac segons la qualitat de la localització de la Flag.

Pot disminuir amb intents incorrectes.

No afecta XP global ni Reputation.

---

# 40. EffectiveAttack

## EffectiveAttack

Potència efectiva aplicada contra una Flag.

Conceptualment:

```text
ActivityPower
×
AttackEfficiency
=
EffectiveAttack
```

La fórmula exacta és PENDENT.

---

# 41. Attack In Progress

## ATTACK_IN_PROGRESS

Estat temporal que indica que un jugador ha localitzat i iniciat formalment l'atac contra una Flag.

Durant aquest estat el propietari no pot evitar-lo mitjançant accions com:

* retirar la Flag;
* abandonar-la;
* moure-la.

El resultat definitiu encara no està resolt.

---

# 42. Flag Capture

## Capture

Canvi de propietat produït després de superar la defensa corresponent.

El significat depèn del tipus de Flag.

### PublicFlagSite

```text
owner canvia
location no canvia
```

### UserFlag

```text
owner canvia
placement pot desaparèixer
bandera pot ser transportada
```

---

# 43. Transported UserFlag

## Transported UserFlag

UserFlag capturada que encara no ha estat replantada.

És propietat del nou jugador però no té ubicació activa.

Requereix una nova Activity física per replantar-la.

---

# 44. Flag Return

## FlagReturn

Mecanisme que s'activa si una UserFlag capturada no és replantada dins del termini establert.

Flux:

```text
capturada
↓
no replantada
↓
expira termini
↓
retorna a última ubicació
↓
OWNER = NONE
↓
Defense baixa
```

---

# 45. Defend Flag

## DEFEND_FLAG

ActivityPurpose explícit destinat principalment a reforçar una Flag pròpia.

Aporta més defensa que passar-hi durant una Activity normal.

---

# 46. Passive Maintenance

## Passive Maintenance

Petit reforç o manteniment obtingut quan una Activity normal passa legítimament per una Flag pròpia.

No equival a una missió `DEFEND_FLAG`.

---

# 47. POI

## POI

Point of Interest.

Element geogràfic que pot tenir interès:

* natural;
* cultural;
* esportiu;
* històric;
* turístic;
* pràctic.

---

# 48. System POI

## SystemPOI

POI creat o importat pel sistema o administració.

---

# 49. Community POI

## CommunityPOI

POI proposat per un usuari.

Pot requerir:

* validació;
* visites;
* Reputation;
* moderació.

---

# 50. Sponsored POI

## SponsoredPOI

POI vinculat a una campanya comercial, turística o institucional.

Ha d'estar clarament identificat com a patrocinat/oficial.

Pot donar recompenses específiques.

No concedeix avantatge PvP desproporcionat.

---

# 51. Summit

## Summit

Cim o fita geogràfica del món.

És independent de:

* UserFlag;
* PublicFlagSite;
* TerritoryOwnership.

Pot coexistir amb qualsevol d'aquests elements.

---

# 52. TourismCampaign

## TourismCampaign

Campanya orientada a promocionar una zona o conjunt de llocs.

Pot incloure:

* DiscoveryAccess;
* POI;
* rutes;
* reptes;
* SponsoredClaims;
* achievements.

Exemple:

> Descobreix 8 indrets del municipi.

---

# 53. SponsoredDiscoveryZone

## SponsoredDiscoveryZone

Zona geogràfica en què una TourismCampaign modifica parcialment què pot veure el jugador.

No equival a marcar la zona com explorada.

---

# 54. Visitor Pass

## VisitorPass

Possible producte B2C futur que concedeix `DiscoveryAccess` temporal o limitat.

No concedeix propietat ni força PvP.

---

# 55. Sponsored Claim

## SponsoredClaim

Intent d'un usuari de reclamar una recompensa associada a un POI, comerç, esdeveniment o campanya.

La validació és server-side.

Pot requerir:

```text
QR
+
GPS
+
proximitat
+
usuari
+
campanya activa
+
regles de reutilització
```

---

# 56. Visit Claim

## VISIT_CLAIM

SponsoredClaim que només requereix una visita física vàlida.

No necessita necessàriament una Activity esportiva activa.

Útil per:

* comerços;
* museus;
* equipaments;
* turisme urbà.

---

# 57. Activity Claim

## ACTIVITY_CLAIM

SponsoredClaim que requereix que la visita formi part d'una Activity vàlida.

Útil per:

* rutes esportives;
* reptes;
* circuits;
* activitats outdoor.

---

# 58. QR patrocinat

## Sponsored QR

QR físic utilitzat per confirmar una interacció amb un punt patrocinat.

No és suficient per si sol.

La possessió d'una fotografia del QR no ha de permetre reclamar la recompensa remotament.

---

# 59. Claim Radius

## ClaimRadius

Radi o geometria dins de la qual el servidor considera que un usuari es troba prou a prop d'un SponsoredPOI per fer un claim.

El valor dependrà del context i és PENDENT DE PROVES.

---

# 60. Achievement

## Achievement

Reconeixement permanent obtingut per assolir una fita.

Exemples:

* visitar diversos POI;
* completar una col·lecció;
* pujar cims;
* participar en una campanya.

---

# 61. Rivalry

## Rivalry

Relació emergent entre jugadors derivada d'interaccions repetides.

Pot aparèixer per:

* captures;
* reconquestes;
* fronteres compartides;
* banderes disputades.

No s'assigna necessàriament manualment.

---

# 62. Anti-cheat

## Anti-cheat

Conjunt de mecanismes destinats a detectar o reduir comportaments que trenquen les regles.

Pot analitzar:

* velocitats impossibles;
* GPS jumps;
* timestamps;
* accuracy;
* trajectòries;
* repeticions;
* interaccions.

No equival a moderació de contingut.

---

# 63. GPS Anomaly

## GPS Anomaly

Comportament inesperat o inconsistent en dades GPS.

No implica automàticament frau.

Pot ser degut a:

* cobertura deficient;
* dispositiu;
* rebots;
* muntanya;
* entorn urbà.

---

# 64. Fraud

## Fraud

Manipulació deliberada del sistema per obtenir avantatge il·legítim.

Requereix més evidència que una única anomalia GPS.

---

# 65. Farming

## Farming

Repetició artificial o excessiva d'una acció amb l'objectiu d'obtenir recompenses desproporcionades.

Exemples:

* visitar repetidament el mateix POI;
* micro-rutes;
* comptes coordinats;
* captures pactades.

Es prefereixen rendiments decreixents quan sigui possible abans que prohibicions arbitràries.

---

# 66. Sybil Behaviour

## Sybil Behaviour

Ús de múltiples comptes per simular usuaris independents o manipular:

* Importance;
* Reputation;
* visites;
* territoris;
* recompenses.

TerritoriLord no assumeix que podrà demostrar sempre una persona = un compte.

---

# 67. Moderation

## Moderation

Gestió de problemes relacionats amb:

* contingut;
* POI;
* denúncies;
* seguretat;
* comportament.

És diferent del motor anti-cheat.

---

# 68. Game Integrity

## Game Integrity

Conjunt de garanties perquè els resultats competitius siguin coherents amb les regles del joc.

Inclou:

* validació;
* anti-cheat;
* auditoria;
* reversió de resultats fraudulents.

---

# 69. RulesVersion

## RulesVersion

Identificador de la versió de les regles utilitzada per calcular un resultat derivat.

Pot associar-se a:

* ActivityPower;
* validations;
* territori;
* combat.

Permet modificar l'equilibri futur mantenint traçabilitat.

---

# 70. Server Authoritative

## Server Authoritative

Principi segons el qual el backend és l'autoritat final sobre l'estat del joc.

El client pot mostrar estimacions.

Però decisions com:

* captura;
* Power definitiva;
* TerritoryOwnership;
* FlagDefense;
* recompensa;

les determina el servidor.

---

# 71. Local-first

## Local-first Activity

Activity que continua enregistrant-se al dispositiu encara que desaparegui la connexió.

Internet no és necessari per continuar recollint GPS.

---

# 72. Sync Chunk

## SyncChunk

Bloc de dades d'una Activity enviat progressivament al servidor.

Ha de poder reenviar-se sense duplicar dades.

---

# 73. Idempotent Sync

## Idempotent Sync

Propietat segons la qual repetir una operació de sincronització produeix el mateix resultat que executar-la una sola vegada.

És essencial amb cobertura intermitent.

---

# 74. COMPLETED_LOCAL

## COMPLETED_LOCAL

Estat conceptual d'una Activity acabada al dispositiu però encara no completament sincronitzada o validada pel servidor.

No equival a resultat final del joc.

---

# 75. Offline Recording

## Offline Recording

Capacitat de continuar enregistrant l'Activity sense xarxa.

És diferent de:

```text
Offline Maps
```

---

# 76. Offline Maps

## Offline Maps

Capacitat de consultar cartografia descarregada sense connexió.

No és requisit del primer MVP.

---

# 77. H3

## H3

Sistema de discretització geoespacial proposat provisionalment per dividir el món en cel·les jeràrquiques.

TerritoriLord el preveu inicialment per:

* ExplorationCell;
* TerritoryCell;
* Fog;
* veïnatges.

Les resolucions definitives són experimentals.

---

# 78. PostGIS

## PostGIS

Extensió geoespacial prevista per PostgreSQL.

S'utilitzarà conceptualment per operacions amb:

* punts;
* línies;
* polígons;
* distàncies;
* interseccions.

Complementa H3.

---

# 79. MapLibre

## MapLibre

Motor de mapa previst inicialment per al client.

No forma part de les regles de joc.

És una decisió arquitectònica provisional.

---

# 80. MVP

## MVP

Primera versió destinada a demostrar que el bucle principal té sentit.

No significa:

> implementar totes les funcionalitats previstes.

El bucle principal és:

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

# 81. Vertical Slice

## Vertical Slice

Versió funcional que travessa diverses capes del producte i permet experimentar el bucle real de principi a fi.

La primera gran fita de TerritoriLord serà poder:

```text
sortir
↓
explorar
↓
descobrir Flag
↓
planificar atac
↓
orientar-se
↓
atacar
↓
completar Activity
↓
obtenir resultat
```

---

# 82. Experimental Value

## Experimental Value

Valor inicial utilitzat per poder provar una mecànica.

No constitueix una decisió definitiva.

Exemples actuals:

* aproximadament 75% d'una TerritoryCell dins del polígon;
* radi d'interacció de Flag;
* resolució H3;
* decadència;
* fórmules Power/Defense.

---

# 83. Fixed Decision

## FIXAT

Decisió funcional adoptada.

No pot ser canviada silenciosament per una SPEC, PLAN o implementació.

---

# 84. Provisional Decision

## FIXAT PROVISIONALMENT

Decisió adoptada com a millor opció actual però explícitament subjecta a validació tècnica o real.

---

# 85. Hypothesis

## HIPÒTESI

Proposta considerada raonable però no confirmada.

Necessita:

* experiment;
* prova;
* dades;
* decisió posterior.

---

# 86. Pending

## PENDENT

Decisió que deliberadament encara no s'ha pres.

El silenci no implica cap opció per defecte.

---

# 87. Core semantic rules

Aquestes equivalències s'han de considerar especialment importants per qualsevol agent que treballi amb el projecte:

```text
Exploration = historial de llocs físicament explorats

Knowledge = informació actual disponible d'una zona

Fog = restricció sobre Knowledge

DiscoveryAccess = permís per veure informació

PhysicalDiscovery = haver-hi estat físicament

Territory = control actual

XP = progrés permanent

Power = capacitat derivada d'una Activity

PublicFlagSite = lloc fix disputable

UserFlag = bandera mòbil disputable

UserFlagPlacement = ubicació actual d'una UserFlag

FlagPrestige = història de la bandera

LocationImportance = valor comunitari del lloc

Visit = presència

Attack = acció PvP explícita

SponsoredClaim = validació d'una recompensa promocional

ActivityValidation = comprovació de la qualitat de l'Activity

ValidationCapability = què pot fer aquella Activity després de validar-la
```

---

# 88. Regla d'ús documental

Quan un document utilitzi un terme definit aquí:

> ha d'utilitzar-lo amb aquest significat.

Si una nova funcionalitat necessita modificar-ne el significat, cal:

```text
detectar conflicte
↓
prendre nova decisió
↓
actualitzar Glossary
↓
actualitzar documents afectats
```

No s'ha de redefinir silenciosament dins d'una SPEC.

---

# 89. Estat

Aquest Glossary cobreix el vocabulari funcional definit fins al moment.

S'haurà d'actualitzar quan:

* apareguin noves entitats;
* es tanquin decisions pendents;
* GPT-6 detecti ambigüitats;
* les proves de camp obliguin a modificar alguna mecànica.

L'objectiu no és congelar els noms per sempre.

L'objectiu és que, en cada moment del projecte, **una paraula signifiqui una sola cosa**.
