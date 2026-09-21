# TerritoriLord — Gameplay Guide 00

**Estat:** guia funcional i narrativa inicial
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document explica TerritoriLord des del punt de vista de la jugabilitat.

Ha de servir simultàniament per:

* entendre com funciona el joc;
* orientar el desenvolupament;
* definir l'experiència d'usuari;
* preparar tutorials i onboarding;
* redactar una futura ajuda dins l'aplicació;
* explicar TerritoriLord a nous jugadors.

No substitueix:

* `GAME-RULES-*`;
* `DOMAIN-MODEL-*`;
* `DECISIONS-*`;
* `SPEC-*`.

Aquest document respon principalment:

> **Què fa el jugador, què veu i què espera que passi?**

---

# 2. Fantasia principal del joc

TerritoriLord parteix d'una idea senzilla:

> **el territori que tens al teu voltant és més gran del que coneixes.**

El mapa no és només un mapa.

Representa:

* llocs on ja has estat;
* llocs que encara desconeixes;
* territori controlat;
* territori rival;
* punts que altres persones han descobert;
* banderes;
* cims;
* POI;
* pistes del que existeix més enllà.

El jugador no progressa perquè passa temps dins l'aplicació.

Progressa perquè:

> **es mou pel món real.**

---

# 3. Relat base

La narrativa de TerritoriLord no necessita explicar un univers fictici independent.

El món real és l'univers.

La idea narrativa és:

> **El mapa que coneixes mai és complet.**

Quan comences, gran part del territori és desconegut.

A mesura que:

* camines;
* corres;
* pedales;
* explores;

el món es va revelant.

Però descobrir no significa posseir.

I posseir no significa conèixer per sempre.

Altres persones recorren aquell mateix territori.

Poden:

* explorar-lo;
* conquistar-lo;
* plantar-hi banderes;
* disputar les teves;
* descobrir llocs que tu encara no coneixes.

El mapa està viu.

---

# 4. Frase narrativa central

Una possible frase d'introducció:

> **El territori ja existeix. El que encara no existeix és el teu mapa.**

Alternativa:

> **El món no està buit. Simplement encara no l'has explorat.**

I com a idea final:

> **Surt. Descobreix. Deixa-hi la teva empremta.**

---

# 5. Quatre formes de jugar

TerritoriLord no obliga tots els jugadors a jugar igual.

Hi ha quatre motivacions principals.

## EXPLORAR

> «Què hi ha allà?»

Descobrir:

* zones noves;
* camins;
* cims;
* POI;
* banderes;
* llocs desconeguts.

---

## CONQUERIR

> «Puc convertir aquesta ruta en territori meu?»

Fer activitats circulars que permeten obtenir control territorial.

---

## COMPETIR

> «Aquesta bandera és seva. Puc arribar-hi i prendre-la?»

Atacar:

* Flags;
* territori;
* objectius rivals.

---

## CONSTRUIR

> «Quina empremta estic deixant al mapa?»

Acumular:

* exploració;
* territori;
* banderes;
* història;
* cims;
* Prestige;
* Achievements.

---

# 6. El bucle principal

El loop que ha de percebre el jugador és:

```text
VEIG ALGUNA COSA INTERESSANT
↓
DECIDEIXO ANAR-HI
↓
FAIG UNA ACTIVITY
↓
DESCOBREIXO / CONQUEREIXO / INTERACTUO
↓
ACABO L'ACTIVITY
↓
EL MAPA HA CANVIAT
↓
VEIG UN NOU OBJECTIU
↓
TORNO A SORTIR
```

Aquest és el loop fonamental de TerritoriLord.

---

# 7. El mapa

Quan el jugador obre TerritoriLord, ha de percebre tres coses diferents.

## El món físic

Cartografia normal:

* carreteres;
* camins;
* relleu;
* llocs.

## El seu coneixement

Què ha:

* explorat;
* descobert;
* vist recentment.

## L'estat del joc

* territori;
* banderes;
* POI;
* cims;
* objectius.

Aquestes tres capes no són equivalents.

---

# 8. Fog of War

Gran part del món de TerritoriLord pot començar sota Fog.

Fog no significa:

> «aquí no hi ha res.»

Significa:

> «encara no saps exactament què hi ha.»

---

# 9. Pistes sota Fog

El mapa pot insinuar coses.

Per exemple:

```text
🚩 ?
```

pot indicar:

> hi ha alguna bandera en aquesta zona.

Però no necessàriament:

* exactament on;
* de qui és;
* quina Defense té.

Altres exemples:

```text
🏔 ?
★ ?
💧 ?
```

L'objectiu és crear:

> curiositat.

No donar la resposta.

---

# 10. Explorar

Per descobrir una zona:

> cal anar-hi físicament.

Quan una Activity travessa una zona desconeguda:

```text
UNKNOWN
↓
PHYSICAL VISIT
↓
DISCOVERED
```

El mapa es revela progressivament.

---

# 11. El joc recorda on has estat

Una vegada has explorat un lloc:

> TerritoriLord recorda que hi has estat.

Aquesta part és permanent.

És el teu historial d'exploració.

---

# 12. Però el món canvia

Saber que havies estat en una zona no significa saber què hi passa avui.

Per això diferenciem:

```text
EXPLORATION
```

de:

```text
KNOWLEDGE
```

---

# 13. Exemple

Fa mesos vas explorar una vall.

TerritoriLord conserva:

> «Ja hi havies estat.»

Però potser ja no saps:

* qui controla el territori;
* quines banderes existeixen;
* quina Defense tenen;
* si han aparegut nous POI.

El mapa pot mostrar aquella informació com:

```text
STALE
```

o:

```text
HISTORICAL
```

---

# 14. Tornar-hi té valor

Això crea una nova raó per sortir:

> «Fa molt que no passo per allà.»

Tornar-hi:

* actualitza Knowledge;
* reforça presència;
* pot defensar territori;
* pot revelar canvis.

---

# 15. Iniciar una Activity

El jugador selecciona una modalitat.

Inicialment:

```text
Running
Trail Running
Walking
Hiking
Cycling
MTB
```

Després prem:

> **INICIAR ACTIVITAT**

---

# 16. Durant l'Activity

TerritoriLord registra el recorregut.

El jugador pot veure:

* track;
* distància;
* temps;
* descoberta;
* informació del mapa;
* objectius relacionats.

El joc no ha d'exigir mirar constantment la pantalla.

---

# 17. Sense cobertura

Una Activity no s'atura perquè desaparegui Internet.

El mòbil continua enregistrant.

Conceptualment:

```text
RECORDING
↓
OFFLINE
↓
RECORDING
```

---

# 18. Finalitzar

Quan acaba:

> **FINALITZAR ACTIVITAT**

El dispositiu conserva la ruta.

Si no hi ha Internet:

```text
COMPLETED_LOCAL
```

Quan torna la cobertura:

```text
SYNC
↓
VALIDATION
↓
RESULT
```

---

# 19. Una Activity no és simplement vàlida o invàlida

TerritoriLord pot acceptar diferents parts d'una mateixa Activity.

Per exemple:

```text
distància       ✓
exploració      ✓
POI             ✓
territori       ✗
atac PvP        ✗
```

Això evita que un petit problema invalidi tota una sortida.

---

# 20. Conquerir territori

Per tenir efecte territorial important, una Activity ha de formar aproximadament un circuit.

Conceptualment:

```text
SURTO
↓
RECORRO UNA ZONA
↓
TORNO APROXIMADAMENT A L'ORIGEN
↓
EL CIRCUIT DEFINEIX UNA ÀREA
```

---

# 21. Per què circular?

Perquè la ruta no representa només:

> una línia.

Representa:

> una zona que has recorregut i envoltat físicament.

---

# 22. No qualsevol circuit serveix

El servidor també comprova:

* GPS;
* continuïtat;
* velocitat;
* durada;
* geometria;
* possibles anomalies.

Tornar al punt inicial no és suficient per si sol.

---

# 23. Territori neutral

La conquesta més senzilla és:

```text
TERRITORI NEUTRAL
↓
ACTIVITY VÀLIDA
↓
TERRITORI PROPI
```

---

# 24. Una Activity no pot conquistar-ho tot

Una ruta gegant no permet obtenir una superfície il·limitada.

Existeix conceptualment:

```text
TerritoryBudget
```

que limita l'impacte territorial d'una sola Activity.

La regla exacta encara s'ha de calibrar.

---

# 25. Territori rival

El territori d'una altra persona no desapareix simplement perquè l'envoltes.

Una Activity pot generar:

```text
PRESSIÓ
```

contra:

```text
DEFENSA
```

Poden ser necessàries diverses sortides.

---

# 26. Territori lluny de casa

TerritoriLord no necessita saber on vius.

Si viatges:

> pots jugar igualment.

Pots explorar i conquistar territori lluny de la teva zona habitual.

La diferència és natural:

> serà més difícil mantenir presència allà si no hi tornes.

---

# 27. Les banderes

Les banderes creen objectius més concrets que el territori.

Però no totes les banderes són iguals.

Hi ha dos tipus.

---

# 28. PublicFlagSite

Un `PublicFlagSite` és:

> un lloc permanent del món.

Exemples conceptuals:

* un cim;
* un coll;
* un mirador;
* un lloc emblemàtic.

La bandera pot canviar de propietari.

El lloc no es mou.

---

# 29. Exemple

```text
PUBLIC FLAG SITE
Coll del Vent

Owner: Laia
```

Si Marc el captura:

```text
Owner: Marc
```

Però:

```text
Coll del Vent
```

continua al mateix lloc.

---

# 30. PublicFlagSite neutral

Alguns poden començar:

```text
OWNER = NONE
```

Per capturar-los:

> no és suficient passar-hi.

Cal una acció deliberada de joc.

---

# 31. UserFlag

Una `UserFlag` és diferent.

És una bandera creada originalment per un jugador.

Pot:

* plantar-se;
* defensar-se;
* ser robada;
* ser transportada;
* tornar a plantar-se.

---

# 32. La UserFlag és un objecte

Conceptualment:

```text
USER FLAG
      │
      └── PLACEMENT ACTUAL
```

La bandera i el lloc on està plantada no són la mateixa cosa.

---

# 33. Crear una UserFlag

Per crear-ne una:

* necessites un slot disponible;
* cal activitat física;
* has de ser al lloc.

Es pot crear inicialment en:

```text
territori propi
```

o:

```text
territori neutral
```

No directament en territori rival.

---

# 34. Plantar una bandera no conquista automàticament

Una UserFlag:

> no pinta territori al seu voltant simplement perquè existeixi.

El territori continua seguint les seves pròpies regles.

---

# 35. Descobrir una bandera

Pots veure sota Fog:

```text
🚩 ?
```

Decideixes explorar aquella zona.

Quan hi arribes físicament:

```text
DETECTED
↓
DISCOVERED
```

Ara tens informació suficient per valorar-la.

---

# 36. Descobrir no és atacar

Una regla molt important:

```text
VISIT
≠
ATTACK
```

Pots descobrir una bandera durant una sortida normal.

I pensar:

> «Demà intentaré atacar-la.»

Això és intencionat.

---

# 37. Preparar un atac

Abans de començar una nova Activity:

1. esculls una bandera descoberta;
2. selecciones `ATTACK_FLAG`;
3. inicies l'Activity.

---

# 38. Un objectiu per Activity

Una Activity només pot tenir:

```text
1 FlagTarget
```

No pots sortir i atacar totes les banderes que trobis pel camí.

---

# 39. L'objectiu no es canvia

Una vegada has començat:

> no pots substituir la bandera objectiu per una altra més convenient.

Això converteix l'atac en:

> una missió planificada.

---

# 40. Arribar a la zona

Durant l'Activity vas cap a la bandera.

Però TerritoriLord no necessita donar-te:

> «ves exactament a aquesta coordenada.»

Pot proporcionar:

* zona aproximada;
* pistes;
* proximitat.

---

# 41. Orientació

La idea és aproximar l'experiència a:

> una petita prova d'orientació amb un únic control.

Has d'interpretar:

* mapa;
* entorn;
* pistes.

---

# 42. He trobat la bandera

Quan creus que ets al punt correcte:

> **ATACAR**

---

# 43. El servidor comprova la posició

Pot respondre:

```text
CONFIRMED
```

o:

```text
UNCERTAIN
```

o:

```text
INCORRECT
```

---

# 44. CONFIRMED

Vol dir:

> la posició és compatible amb la bandera i el GPS és prou fiable.

L'atac queda iniciat.

---

# 45. UNCERTAIN

Vol dir:

> el GPS no permet saber-ho amb prou confiança.

No és culpa del jugador.

Per tant:

> no hi ha penalització.

Pots esperar, moure't o tornar-ho a provar.

---

# 46. INCORRECT

Vol dir:

> la posició és clarament incorrecta i el GPS és prou fiable per saber-ho.

Això pot reduir:

```text
AttackEfficiency
```

de l'atac actual.

---

# 47. Un error no et castiga permanentment

Una equivocació d'orientació no redueix:

* XP;
* Level;
* Reputation.

Afecta només:

> aquella missió d'atac.

---

# 48. ATTACK IN PROGRESS

Quan obtens:

```text
CONFIRMED
```

el servidor crea:

```text
ATTACK_IN_PROGRESS
```

---

# 49. El defensor pot saber-ho

El propietari pot rebre:

> **La teva bandera està sent atacada.**

Això afegeix tensió.

---

# 50. Però no sap on ets

No veu:

* la teva coordenada;
* el teu track;
* la teva ubicació en directe.

TerritoriLord no és una eina per perseguir rivals físicament.

---

# 51. El defensor tampoc pot escapar administrativament

Una vegada existeix:

```text
ATTACK_IN_PROGRESS
```

no pot evitar aquell atac:

* eliminant la bandera;
* movent-la;
* abandonant-la.

---

# 52. Trobar la bandera no és guanyar

Aquesta és una de les regles més importants.

Encara has d'acabar l'Activity.

Flux:

```text
FLAG CONFIRMED
↓
CONTINUO LA RUTA
↓
FINALITZO
↓
ACTIVITY VALIDATION
↓
COMBAT
```

---

# 53. Per què?

Perquè l'atac no consisteix només en:

> arribar físicament a un punt.

Consisteix en:

> completar una Activity física capaç de generar prou força.

---

# 54. Power

Cada Activity genera una capacitat pròpia.

Conceptualment pot considerar:

```text
PhysicalPower
+
ExplorationPower
+
DiscoveryPower
```

---

# 55. PhysicalPower

Representa principalment l'esforç físic.

Pot considerar:

* distància;
* temps;
* desnivell;
* modalitat.

---

# 56. ExplorationPower

Pot reconèixer:

> haver recorregut zones noves.

---

# 57. DiscoveryPower

Pot reconèixer:

* cims;
* POI;
* descobertes.

---

# 58. Power no és XP

Regla important:

```text
XP ≠ Power
```

XP és progrés permanent.

Power és principalment:

> capacitat produïda per aquella Activity.

---

# 59. Un veterà no acumula força infinita

No existeix:

```text
10 anys jugant
↓
500.000 Power permanent
↓
ningú em pot derrotar
```

Cada nova batalla necessita:

> nova activitat física.

---

# 60. Resolució de l'atac

Conceptualment:

```text
ActivityPower
×
AttackEfficiency
↓
EffectiveAttack
```

contra:

```text
EffectiveFlagDefense
```

---

# 61. Resultats

Un atac pot acabar:

```text
DEFENDED
DAMAGED
CAPTURED
```

---

# 62. DEFENDED

La bandera resisteix.

---

# 63. DAMAGED

La bandera continua sent del mateix propietari.

Però la seva Defense baixa.

Això pot generar:

> «Hi tornaré demà.»

---

# 64. CAPTURED — PublicFlagSite

Si és un PublicFlagSite:

```text
OWNER A
↓
OWNER B
```

El lloc continua exactament on era.

---

# 65. CAPTURED — UserFlag

Aquí passa una cosa diferent.

La UserFlag:

```text
PLANTED
↓
CAPTURED
↓
TRANSPORTED
```

El placement anterior deixa d'estar actiu.

---

# 66. Has robat una bandera

Ara la bandera és teva.

Però encara no està plantada.

Has de fer:

> una altra Activity.

---

# 67. Replantar

Durant una nova sortida pots portar-la a:

> un punt vàlid del teu territori.

Allà crees un nou:

```text
UserFlagPlacement
```

---

# 68. La història viatja amb la bandera

Una UserFlag capturada conserva:

* creador;
* propietaris anteriors;
* captures;
* historial;
* FlagPrestige.

---

# 69. Però el lloc no viatja

Una bandera famosa pot arribar a un lloc desconegut.

Per tant:

```text
FlagPrestige = HIGH
LocationImportance = LOW
```

és perfectament possible.

---

# 70. Si no la replantes

No pots guardar una bandera robada indefinidament.

Després del termini definit:

```text
TRANSPORTED
↓
TIMEOUT
↓
retorna a l'últim lloc
↓
OWNER = NONE
↓
Defense baixa
```

---

# 71. Recuperar una bandera

L'antic propietari pot intentar recuperar-la.

Però:

> no té dret exclusiu.

Una vegada és neutral:

> altres jugadors també poden disputar-la.

---

# 72. Defensar

També pots sortir deliberadament per defensar una bandera.

Abans de començar:

```text
DEFEND_FLAG
```

---

# 73. Defensa activa

Visites físicament la teva bandera durant l'Activity.

Si la completes correctament:

> reforces la seva Defense.

---

# 74. Manteniment passiu

Si simplement passes per una bandera pròpia durant una Activity normal:

> també pot tenir un efecte menor.

Però:

```text
PASSIVE MAINTENANCE
<
DEFEND_FLAG
```

---

# 75. Defense no és infinita

Una bandera:

* té un màxim;
* decau;
* pot ser atacada.

Cap imperi ha de poder quedar congelat permanentment.

---

# 76. Abandonar territori

Si deixes d'anar a una zona:

* Defense disminueix;
* Knowledge queda antic;
* rivals poden pressionar-la.

La propietat no ha de desaparèixer necessàriament immediatament.

Però:

> mantenir presència importa.

---

# 77. Progressió personal

Encara que perdis una batalla:

> no perds tot el que has fet.

Es conserva:

* XP;
* Level;
* ExplorationHistory;
* cims;
* Achievements;
* Prestige històric.

---

# 78. La derrota afecta el present

Pots perdre:

* Territory;
* Flag;
* Defense.

Però no:

> la teva història.

---

# 79. XP

Representa progressió permanent.

Pot reconèixer:

* esport;
* exploració;
* descobertes;
* cims;
* POI;
* achievements.

---

# 80. Level

Representa progressió global.

Pot desbloquejar:

* opcions;
* estadístiques;
* personalització;
* capacitats limitades.

No ha de convertir automàticament un veterà en una força PvP impossible de derrotar.

---

# 81. Prestige

Representa:

> què has fet i què ha passat al teu voltant.

No és exactament força.

És història i notorietat.

---

# 82. Reputation

Representa principalment:

> fins a quin punt les teves contribucions comunitàries són fiables.

Especialment:

* POI;
* reports;
* validacions.

---

# 83. Cims

Els cims són fites independents.

Pots descobrir-los.

La primera ascensió personal pot tenir un valor especial.

Però:

> un cim no necessita tenir propietari.

---

# 84. POI

Els punts d'interès poden fer que vulguis desviar una ruta.

Exemples:

* font;
* mirador;
* refugi;
* patrimoni;
* element natural.

---

# 85. CommunityPOI

En fases posteriors, els jugadors podran proposar POI.

El valor no vindrà de:

> crear-ne cent.

Vindrà de:

> que altres persones els trobin útils.

---

# 86. Turisme

TerritoriLord també pot utilitzar aquesta mateixa lògica per:

> ajudar a descobrir un lloc nou.

---

# 87. DiscoveryAccess

Imagina que visites un municipi.

Una campanya pot revelar:

```text
★ ?
★ ?
★ ?
```

o donar pistes.

Però:

> veure la pista no significa haver visitat el lloc.

---

# 88. Exemple turístic

```text
DESCOBREIX 8 INDRETS
```

El mapa et dona:

* hints;
* zones;
* rutes opcionals.

Tu encara has d'anar-hi.

---

# 89. El que visites queda

Quan acaba la campanya:

* els llocs només revelats poden tornar al Fog normal;
* els llocs visitats físicament continuen al teu historial.

---

# 90. Sponsored POI

Un museu, mirador o comerç pot formar part d'una campanya.

Ha d'aparèixer clarament com:

> contingut patrocinat/oficial.

---

# 91. QR + GPS

Alguns punts poden tenir un QR físic.

Escanejar-lo no és suficient.

Conceptualment:

```text
QR
+
GPS
+
SERVER
=
VALID CLAIM
```

---

# 92. Foto del QR

Si algú t'envia una foto del QR des de 200 km:

```text
QR = VALID
LOCATION = INVALID
```

Per tant:

```text
NO REWARD
```

---

# 93. No pay-to-win

Pagar pot donar:

* contingut;
* experiències;
* rutes;
* DiscoveryAccess;
* personalització.

No:

```text
money → more AttackPower
money → more Defense
money → guaranteed territory
```

---

# 94. Diferents maneres de ser bon jugador

No cal que tothom sigui competitiu.

Una persona pot destacar principalment en:

```text
EXPLORATION
```

una altra en:

```text
TERRITORY
```

una altra en:

```text
ORIENTATION
```

una altra en:

```text
COMMUNITY
```

---

# 95. TerritoriLord sense rivals

Fins i tot si no hi ha altres jugadors propers:

encara existeixen:

* Fog;
* Exploration;
* Summits;
* POI;
* neutral PublicFlagSites;
* personal progress.

El joc no pot dependre completament del PvP.

---

# 96. Regles que el jugador ha d'entendre sempre

La UI ha de deixar clars aquests principis.

## 1

```text
VISIT ≠ ATTACK
```

## 2

```text
EXPLORATION ≠ TERRITORY
```

## 3

```text
EXPLORATION ≠ CURRENT KNOWLEDGE
```

## 4

```text
XP ≠ POWER
```

## 5

```text
PublicFlagSite ≠ UserFlag
```

## 6

```text
GPS UNCERTAIN ≠ USER ERROR
```

## 7

```text
PAYMENT ≠ COMPETITIVE POWER
```

---

# 97. Guió narratiu d'onboarding

A continuació es descriu una possible primera experiència.

No és encara copy definitiu.

És una base per UX, desenvolupament i narrativa.

---

# ESCENA 1 — El mapa

Pantalla:

un mapa parcialment cobert per Fog.

Text:

> **Aquest és el teu territori.**
>
> O, més exactament, la petita part que coneixes.

Pausa.

> **La resta no està buida.**
>
> Encara no l'has explorada.

Botó:

```text
COMENÇAR
```

---

# ESCENA 2 — El moviment

Mapa amb la posició del jugador.

Text:

> **TerritoriLord no es juga des del sofà.**

> Camina, corre o pedala.

> El teu moviment real revelarà el mapa.

Botó:

```text
INICIAR PRIMERA ACTIVITAT
```

---

# ESCENA 3 — Primera descoberta

Durant la ruta, una zona de Fog desapareix.

Text curt:

> **Zona descoberta.**

Després:

> Tot lloc que exploris formarà part de la teva història.

---

# ESCENA 4 — Una pista

Apareix:

```text
🚩 ?
```

Text:

> **Hi ha alguna cosa allà.**

> No saps exactament què.

> Encara.

Aquesta escena és important.

No cal explicar més.

L'objectiu és que el jugador pensi:

> «Què hi ha?»

---

# ESCENA 5 — Finalitzar

El jugador acaba la primera Activity.

Pantalla de resultats:

```text
DISTÀNCIA
TEMPS
ZONA EXPLORADA
XP
```

Si la ruta és territorial:

```text
NOU TERRITORI
```

Text:

> **El mapa ja no és el mateix que quan has sortit.**

---

# ESCENA 6 — El següent objectiu

El mapa torna a mostrar:

```text
🚩 ?
```

Text:

> Has acabat l'activitat.

> Però ara saps que allà hi ha alguna cosa.

Pregunta:

> **On aniràs la propera vegada?**

Aquest és el moment clau de TerritoriLord.

---

# ESCENA 7 — Descoberta de Flag

En una futura Activity el jugador arriba a la zona.

La Flag passa de:

```text
🚩 ?
```

a:

```text
🚩 Coll del Vent
Owner: Marc
Defense: aproximada
```

Text:

> **Bandera descoberta.**

> Ara la coneixes.

> Però descobrir-la no significa atacar-la.

---

# ESCENA 8 — Preparar una missió

Pantalla de la Flag.

Opció:

```text
PREPARAR ATAC
```

Text:

> Per atacar una bandera hauràs de preparar una nova Activity.

> Només pots seleccionar un objectiu.

---

# ESCENA 9 — Comença l'atac

Abans de sortir:

```text
OBJECTIU
🚩 Coll del Vent
```

Botó:

```text
INICIAR ACTIVITAT
```

Text:

> Arriba fins a la zona.

> Troba el punt.

> I completa la ruta.

---

# ESCENA 10 — Orientació

A prop de la Flag:

> **Ets a prop.**

No mostrar necessàriament coordenada exacta.

Pista progressiva.

El jugador busca físicament.

---

# ESCENA 11 — Intent

Botó:

```text
ATACAR
```

Possibilitat A:

```text
UNCERTAIN
```

Text:

> El GPS no és prou precís.

> No has perdut eficiència.

Possibilitat B:

```text
INCORRECT
```

Text:

> No sembla que sigui aquí.

> L'eficiència d'aquest atac ha disminuït.

Possibilitat C:

```text
CONFIRMED
```

---

# ESCENA 12 — Confirmació

Pantalla:

```text
OBJECTIU LOCALITZAT
ATTACK IN PROGRESS
```

Text:

> **L'atac ha començat.**

> Ara acaba l'Activity.

---

# ESCENA 13 — El rival

En el dispositiu del defensor:

> **La teva bandera està sent atacada.**

No mostrar:

* mapa de l'atacant;
* posició;
* track.

---

# ESCENA 14 — Final de l'Activity

L'atacant acaba.

Pantalla:

```text
VALIDANT ACTIVITAT...
```

Després:

```text
ACTIVITY VALID
```

---

# ESCENA 15A — Atac fallit

```text
DEFENDED
```

Text:

> La bandera ha resistit.

Si queda danyada:

> Però ara és més vulnerable.

El mapa torna.

La pregunta implícita:

> «Hi tornaràs?»

---

# ESCENA 15B — Captura PublicFlagSite

```text
CAPTURED
🚩 Coll del Vent
```

Text:

> **Ara controles aquest lloc.**

La ubicació continua sent la mateixa.

Però la història ha canviat.

---

# ESCENA 15C — Captura UserFlag

```text
USER FLAG CAPTURED
```

Text:

> **Has capturat la bandera.**

> Però encara no està plantada.

> Hauràs de portar-la a un nou lloc durant una altra Activity.

Aquesta escena ha de deixar molt clara la diferència amb PublicFlagSite.

---

# ESCENA 16 — Replantació

Nova sortida.

El jugador arriba a un punt vàlid del seu territori.

Opció:

```text
PLANTAR BANDERA
```

Resultat:

```text
NEW USER FLAG PLACEMENT
```

Text:

> La bandera té una nova ubicació.

> La seva història continua.

---

# ESCENA 17 — El món persistent

Mapa després de diverses activitats.

Visible:

* territori;
* Fog;
* cims;
* Flags;
* POI;
* zones antigues.

Text:

> **El mapa canvia perquè tu i altres jugadors us moveu.**

> Algunes coses conservaràs per sempre.

> Altres les hauràs de defensar.

---

# ESCENA 18 — Tancament del tutorial

Text:

> Explora llocs que no coneixes.

> Torna als que no vols perdre.

> Busca objectius.

> Crea rutes.

> Conquista.

> Defensa.

Pausa.

> **I quan miris el mapa i pensis “demà aniré allà”, TerritoriLord estarà funcionant.**

---

# 98. Traducció del guió a requisits UX

Cada escena implica una necessitat funcional.

| Escena | Necessitat                |
| ------ | ------------------------- |
| 1      | Fog visible               |
| 2      | Start Activity            |
| 3      | live exploration feedback |
| 4      | Detection signal          |
| 5      | Activity results          |
| 6      | post-Activity map         |
| 7      | Flag discovery            |
| 8      | FlagTarget                |
| 9      | ActivityPurpose           |
| 10     | orientation UI            |
| 11     | AttackLocationAttempt     |
| 12     | ATTACK_IN_PROGRESS        |
| 13     | defender notification     |
| 14     | validation                |
| 15     | combat resolution         |
| 16     | UserFlagPlacement         |
| 17     | persistent world          |

Aquest mapa ajuda a convertir el gameplay en funcionalitats implementables.

---

# 99. Informació que NO cal explicar d'entrada al jugador

No cal ensenyar al tutorial:

* H3;
* PostGIS;
* RulesVersion;
* TerritoryBudget intern;
* fórmules;
* anti-cheat;
* arquitectura.

L'usuari necessita entendre:

> causa i efecte.

No:

> implementació.

---

# 100. Informació progressiva

Les regles es poden ensenyar quan apareixen.

## Primera Activity

* Activity;
* Exploration;
* Fog.

## Primera ruta circular

* Territory.

## Primera Flag

* Visit;
* Discovery.

## Primer atac

* Target;
* Orientation;
* AttackEfficiency;
* completion.

## Primera UserFlag capturada

* Transport;
* Replant.

Això evita un tutorial inicial enorme.

---

# 101. Principi de UX

El jugador ha de poder entendre sempre:

```text
QUÈ ESTIC FENT?
```

```text
QUÈ HA PASSAT?
```

```text
PER QUÈ HA PASSAT?
```

```text
QUÈ PUC FER ARA?
```

---

# 102. Principi de feedback

Després d'una acció important, la UI ha de respondre clarament.

Exemples:

```text
ZONA DESCOBERTA
```

```text
TERRITORI CONQUERIT
```

```text
FLAG DETECTADA
```

```text
UBICACIÓ INCERTA
```

```text
ATAC EN CURS
```

```text
DEFENSE REDUCED
```

```text
FLAG CAPTURED
```

---

# 103. Principi narratiu

La narrativa no ha de tapar les regles.

En cas de conflicte:

> claredat funcional > lore.

El relat serveix per reforçar una sensació:

> **el territori és un món viu que es descobreix caminant-lo.**

---

# 104. Estat de les regles descrites

Aquest document utilitza les decisions funcionals actuals.

Els valors següents continuen intencionadament experimentals:

* H3 resolution;
* territorial threshold;
* circularity;
* Power;
* Defense;
* Flag radius;
* decay;
* limits;
* cooldowns.

Per tant, la guia explica:

> com funciona la mecànica.

No:

> els números definitius.

---

# 105. Criteri final

La millor manera de resumir TerritoriLord a un jugador és:

> **Surt a explorar el món real. El que facis canviarà el teu mapa. El que descobreixis et donarà una raó per tornar a sortir.**
