# TerritoriLord — Game Rules 04: Progression, Reputation & Economy

**Estat:** proposta funcional v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document defineix conceptualment:

* XP;
* nivell;
* progressió;
* prestigi;
* reputació;
* assoliments;
* límit de banderes;
* recompenses;
* desbloquejos;
* economia futura;
* monetització;
* límits entre progressió i avantatge competitiu.

No fixa encara valors numèrics definitius.

---

# 2. Principi central

> **Progressar ha de donar més opcions, reconeixement i objectius, però no convertir un jugador veterà en algú matemàticament invencible.**

La progressió ha de premiar:

* constància;
* exploració;
* activitat;
* contribució;
* rivalitat;
* descoberta.

No simplement antiguitat del compte.

---

# 3. Sistemes diferenciats

TerritoriLord ha de separar com a mínim:

```text
XP
LEVEL
PRESTIGE
REPUTATION
ACHIEVEMENTS
```

Aquests conceptes no són equivalents.

---

# 4. XP

XP representa progrés general del jugador.

Pot obtenir-se mitjançant:

* activitats vàlides;
* exploració nova;
* cims;
* POI;
* descoberta de banderes;
* conquestes;
* defenses;
* captures;
* contribucions comunitàries.

---

# 5. XP no és Power

Regla important:

```text
XP != ActivityPower
```

XP és progressió permanent.

Power pertany principalment a una Activity concreta.

Un jugador amb molta XP no genera automàticament més AttackPower.

---

# 6. XP per activitat

Una Activity pot generar XP independentment de la seva Power.

Exemple conceptual:

```text
Running                  +80 XP
Territori nou            +30 XP
Cim nou                  +20 XP
Bandera descoberta       +10 XP
```

Els números no estan decidits.

---

# 7. Rendiments d'XP

Algunes accions poden tenir rendiments decreixents.

Especialment:

* mateixa ruta;
* mateix POI;
* mateixa Flag;
* mateixa zona.

L'activitat física continua aportant XP base.

---

# 8. Level

El nivell deriva principalment d'XP acumulada.

Conceptualment:

```text
XP → Level
```

El nivell representa experiència general dins de TerritoriLord.

---

# 9. Corba de nivell

La progressió no ha de ser lineal.

Conceptualment:

```text
Level 1 → fàcil
Level 5 → moderat
Level 20 → necessita constància
Level alt → cada vegada més difícil
```

No s'ha de crear una progressió infinita ràpida.

---

# 10. Què pot desbloquejar Level

Level pot desbloquejar:

* més banderes actives;
* personalització;
* estadístiques;
* insígnies;
* reptes;
* opcions socials;
* funcionalitats avançades no competitives.

---

# 11. Què NO ha de desbloquejar Level

No hauria de donar directament:

```text
+50 % AttackPower
+50 % DefensePower
```

ni avantatges equivalents.

---

# 12. Límit de banderes

El nombre de banderes actives és un dels desbloquejos importants.

Hipòtesi conceptual:

```text
jugador inicial → poques banderes
progressió → més banderes
sostre absolut → limitat
```

---

# 13. Sostre de banderes

Ha d'existir un màxim global.

Objectius:

* evitar saturació;
* evitar dominis desproporcionats;
* obligar a triar ubicacions;
* mantenir valor estratègic.

---

# 14. Banderes com a recurs escàs

Una bandera ha de representar una decisió.

Si el jugador només pot tenir poques:

> «On em compensa plantar-la?»

Això genera estratègia.

---

# 15. Reubicació de banderes

Caldrà permetre abandonar o retirar una Flag pròpia.

Per evitar canvis constants, es podrà aplicar:

* cooldown;
* cost temporal;
* període de desactivació.

No s'ha definit encara.

---

# 16. Captura d'una bandera i límit

Si un jugador ja té el màxim de banderes i captura una altra, cal definir què passa.

Possibles models:

### Model A

Les banderes capturades no compten igual que les creades.

### Model B

Existeix un únic límit global.

### Model C

Crear i controlar tenen límits diferents.

Decisió pendent.

---

# 17. Recomanació inicial

Es recomana separar:

```text
FLAG_CREATION_CAP
FLAG_CONTROL_CAP
```

Això permet:

* limitar spam de creació;
* mantenir viable el PvP.

El model exacte queda pendent.

---

# 18. Prestige

Prestige representa reconeixement esportiu i territorial.

No és equivalent a reputació comunitària.

---

# 19. Fonts de Prestige

Pot derivar de:

* captures;
* reconquestes;
* defensa;
* territoris mantinguts;
* banderes importants;
* cims destacats;
* exploració;
* assoliments.

---

# 20. Prestige històric

Prestige ha de reflectir part de l'historial del jugador.

Perdre una bandera no elimina tot el prestigi obtingut.

---

# 21. Prestige no és força directa

Un jugador amb molt Prestige:

* és reconegut;
* té historial;
* pot aparèixer en classificacions.

Però:

```text
Prestige alt
```

no implica:

```text
AttackPower alt
```

---

# 22. Prestige local

Es podrà calcular prestigi relacionat amb:

* municipi;
* regió;
* zona;
* tipus d'activitat.

No ha de substituir el Prestige global.

---

# 23. Prestige de banderes

Les Flags també poden tenir Prestige.

Una bandera pot ser prestigiosa per:

* antiguitat;
* visites;
* captures;
* rivalitats;
* ubicació;
* notorietat.

Aquest valor pertany al lloc, no necessàriament al propietari.

---

# 24. Reputation

Reputation representa confiança comunitària.

S'utilitza especialment per:

* POI;
* denúncies;
* validacions;
* contingut aportat pels usuaris.

---

# 25. Reputation i PvP

Regla:

> Reputation no ha de donar una superioritat directa en combat.

Pot donar confiança en accions comunitàries, no força.

---

# 26. Fonts positives de Reputation

Pot augmentar quan:

* POI creats són confirmats;
* altres usuaris els visiten;
* denúncies resulten correctes;
* correccions són útils;
* contribucions són consistents.

---

# 27. Fonts negatives de Reputation

Pot disminuir per:

* POI falsos;
* ubicacions incorrectes;
* spam;
* denúncies abusives;
* contingut inapropiat;
* comportaments fraudulents confirmats.

---

# 28. Reputation no pública necessàriament

No cal mostrar:

```text
Reputation = 73
```

Pot ser intern o mostrar-se per nivells:

```text
Nou
Contribuent
Confiable
Veterà
```

Aquesta decisió queda pendent.

---

# 29. Reputation i permisos

Algunes accions comunitàries poden requerir cert historial.

Exemples:

* crear molts POI;
* validar ubicacions;
* proposar correccions;
* moderació comunitària futura.

---

# 30. Compte nou

Un compte nou no ha de poder:

* crear centenars de POI;
* crear moltes banderes;
* generar moltes denúncies.

Els límits poden créixer amb:

* antiguitat mínima;
* activitats reals;
* Reputation;
* Level.

---

# 31. Achievements

Achievements representen fites concretes.

Poden relacionar-se amb:

* esport;
* exploració;
* territori;
* orientació;
* comunitat;
* turisme.

---

# 32. Exemples esportius

```text
Primer 10K
100 km running
1.000 m D+
Primera ruta trail
```

---

# 33. Exemples d'exploració

```text
Primer cim
10 cims
10 km² explorats
100 km² explorats
5 municipis
3 regions
```

---

# 34. Exemples territorials

```text
Primera conquesta
Primera bandera
Primera captura
Primera reconquesta
100 cel·les controlades
```

---

# 35. Exemples d'orientació

```text
Primera Flag localitzada
Atac sense errors
10 atacs amb eficiència perfecta
```

---

# 36. Exemples comunitaris

```text
Primer POI creat
POI visitat per 10 jugadors
5 POI confirmats
```

---

# 37. Rewards d'Achievement

Poden donar:

* XP;
* badges;
* cosmètics;
* perfil;
* personalització;
* petits desbloquejos.

No haurien de donar multiplicadors PvP forts.

---

# 38. Progressió exploratòria

El joc ha de permetre progressar encara que l'usuari no vulgui PvP.

Exemple de perfil:

```text
Level             18
Exploration       62 %
Territory         21 %
Community         34 %
Combat             5 %
```

Aquesta representació és només conceptual.

---

# 39. Perfils de jugador

El sistema pot acabar identificant estadísticament perfils:

* Explorer;
* Conqueror;
* Defender;
* Orienter;
* Contributor.

No cal convertir-los en classes rígides.

---

# 40. No classes obligatòries

L'usuari no hauria d'haver de triar:

```text
Soc Explorer per sempre
```

La seva manera de jugar pot evolucionar.

---

# 41. Progressió multidimensional

Es podrien mostrar estadístiques independents:

```text
Exploració
Territori
Orientació
Comunitat
Activitat
```

Sense que necessàriament siguin cinc nivells diferents.

---

# 42. Permanent vs temporal

Cal separar clarament.

## Permanent

* XP;
* Level;
* Achievements;
* historial;
* territori explorat;
* cims descoberts;
* Prestige històric.

## Temporal

* territori controlat;
* FlagDefense;
* informació del Fog;
* control de banderes;
* pressió territorial.

---

# 43. Importància de la separació

Perdre una guerra territorial no ha de fer sentir:

> «he perdut tot el progrés.»

El jugador conserva la seva història.

---

# 44. Recompensa per derrota

Una Activity d'atac fallida continua sent activitat real.

Pot conservar:

* XP esportiu;
* exploració;
* cims;
* POI;
* estadístiques.

Simplement no captura la Flag.

---

# 45. Recompensa per defensa fallida

Perdre una bandera tampoc elimina:

* Prestige històric;
* historial;
* captures anteriors.

---

# 46. Rànquings

Es poden crear classificacions diferents.

No un únic:

```text
millor jugador
```

---

# 47. Rànquing d'exploració

Pot considerar:

* superfície descoberta;
* cims;
* regions;
* POI.

---

# 48. Rànquing territorial

Pot considerar:

* territori actual;
* territori històric;
* captures;
* defenses.

Cal separar estat actual d'historial.

---

# 49. Rànquing de banderes

Possibles estadístiques:

* captures;
* banderes controlades;
* Prestige;
* reconquestes.

---

# 50. Rànquing comunitari

Pot considerar:

* POI confirmats;
* contribucions;
* Reputation.

---

# 51. Temporalitat dels rànquings

Es poden tenir:

```text
setmana
mes
any
històric
```

Això permet que jugadors nous puguin competir en períodes recents.

---

# 52. Rànquing local

El sistema pot oferir classificacions per:

* zona;
* municipi;
* regió.

Caldrà evitar exposar informació personal sensible.

---

# 53. Rànquings i invencibilitat

Els rànquings no han de proporcionar avantatge mecànic.

Guanyar un rànquing dona:

* reconeixement;
* badge;
* Prestige.

No AttackPower.

---

# 54. Economia

TerritoriLord no necessita necessàriament una moneda virtual per al MVP.

Això és intencionat.

---

# 55. Evitar economia artificial inicial

No es recomana començar amb:

```text
gold
coins
gems
energy
```

si no tenen una funció clara.

La complexitat no implica més jugabilitat.

---

# 56. Recursos de joc

Actualment els recursos principals ja són:

```text
temps
activitat
Power
banderes limitades
coneixement
territori
```

Són suficients per construir el bucle principal.

---

# 57. Possible moneda futura

Si més endavant cal una moneda interna, hauria d'utilitzar-se principalment per:

* cosmètics;
* personalització;
* elements socials.

No per comprar victòries.

---

# 58. Cosmetics

Exemples:

* estil de bandera;
* marc de perfil;
* iconografia;
* aparença del territori;
* insígnies;
* personalització visual.

---

# 59. Personalització del mapa

Podria ser una via futura de progressió o monetització.

Sempre sense ocultar informació necessària per competir.

---

# 60. Monetització

L'arquitectura ha de deixar preparada monetització futura.

No és necessari activar-la en MVP.

---

# 61. Principi de monetització

> **Pagar pot millorar l'experiència, però no substituir l'activitat física ni comprar superioritat territorial.**

---

# 62. Prohibit conceptualment

No vendre:

```text
+100 AttackPower
+50 Defense
bandera invulnerable
captura automàtica
doble territori
```

---

# 63. Opcions Premium futures

Poden incloure:

* estadístiques avançades;
* analítica;
* històric ampliat;
* comparacions;
* planificador de rutes;
* exportacions;
* personalització;
* clubs;
* reptes privats;
* eines avançades de mapes.

---

# 64. Històric Premium

Cal anar amb compte.

No s'ha de cobrar per conservar dades essencials que el jugador ha guanyat.

Es podria cobrar per:

* analítica avançada;
* comparació;
* visualitzacions.

No per recuperar el seu historial bàsic.

---

# 65. Mapes Premium

Podrien existir:

* capes addicionals;
* mapes topogràfics avançats;
* eines de planificació.

Però no informació tàctica exclusiva que doni avantatge PvP.

---

# 66. Clubs

Possibilitat futura.

Un pla Premium podria donar eines de:

* gestió;
* estadístiques;
* reptes;
* esdeveniments.

No força territorial directa.

---

# 67. Reptes patrocinats

Possible monetització futura:

```text
visita 5 cims
completa ruta X
descobreix zona Y
```

amb patrocinador.

S'han d'evitar incentius insegurs.

---

# 68. POI patrocinats

Podrien existir punts promocionats en el futur.

Han d'estar clarament diferenciats del contingut orgànic.

No haurien de donar avantatge territorial desproporcionat.

---

# 69. Publicitat

Si s'introdueix:

* no ha d'interrompre activitats;
* no ha d'aparèixer en moments crítics;
* no ha d'obligar a mirar el mòbil durant moviment.

---

# 70. Subscription

El model de dades podrà preveure:

```text
Subscription
Entitlement
```

encara que inicialment no hi hagi plans de pagament.

---

# 71. Entitlement

Una funcionalitat pot estar controlada per entitlement.

Exemple:

```text
ADVANCED_STATS
ROUTE_PLANNER
EXPORT_DATA
CUSTOM_PROFILE
```

---

# 72. Feature flags

Es recomana que moltes funcionalitats avançades puguin activar-se amb feature flags.

Això facilitarà:

* proves;
* MVP;
* monetització futura;
* experiments.

---

# 73. Progressió i antiabús

XP també pot ser objectiu de farming.

Caldrà detectar:

* microactivities;
* visites artificials;
* POI falsos;
* captures coordinades.

---

# 74. XP i activitats invalidades

Una Activity fraudulenta:

* no genera XP de joc;
* no genera Power;
* no genera territori.

Una Activity parcialment vàlida podria conservar una part de la progressió esportiva.

---

# 75. Penalitzacions permanents

No es recomana restar XP permanentment per errors normals.

Exemple:

fallar la localització d'una Flag:

```text
AttackEfficiency ↓
```

però no:

```text
XP global ↓
```

---

# 76. Penalitzacions per abús

Fraus confirmats sí que poden comportar:

* anul·lació d'efectes;
* pèrdua de privilegis;
* limitació de compte;
* suspensió.

Això pertany al sistema antiabús.

---

# 77. Prestige i derrota

El Prestige no ha de funcionar com una barra de vida.

Un jugador pot perdre control actual sense perdre la seva història.

---

# 78. Rivalries

Les rivalitats poden generar Prestige.

Exemple:

```text
10 captures creuades
```

pot convertir una rivalitat en rellevant.

No cal recompensar directament amb força.

---

# 79. Streaks

Es podrien introduir ratxes.

Exemple:

* setmanes amb activitat;
* mesos explorant;
* visites regulars.

Han de motivar, no castigar excessivament.

---

# 80. No convertir Streak en obligació

Perdre una setmana no ha de destruir mesos de progrés.

Es pot conservar:

```text
best streak
```

separat de:

```text
current streak
```

---

# 81. Daily rewards

No es recomanen recompenses passives només per obrir l'app.

El principi és:

> activitat física > login.

---

# 82. Quests

Poden existir objectius:

```text
descobreix 5 km²
visita 3 POI
puja un cim
defensa una bandera
```

---

# 83. Quests no obligatoris

No han de convertir el joc en una llista de tasques que substitueixi l'exploració lliure.

Han de suggerir objectius.

---

# 84. Quests contextuals

El Fog pot generar reptes naturals.

Exemple:

```text
S'ha detectat una bandera desconeguda a 3 km.
```

Això és més coherent que:

```text
camina 5 km perquè sí.
```

---

# 85. Progressió turística

Es poden crear col·leccions permanents:

```text
regions visitades
parcs naturals
cims
municipis
països
```

Això dona valor a jugar durant viatges.

---

# 86. Collections

Els descobriments poden generar col·leccions.

Exemple:

```text
Cims del Solsonès
4 / 12
```

o:

```text
Fonts descobertes
23
```

Sense necessitat que totes donin Power.

---

# 87. Completion

Es pot mostrar percentatge de descoberta quan existeixi una divisió geogràfica significativa.

Exemple:

```text
Zona X
67 % explorada
```

Caldrà definir què significa exactament.

---

# 88. Nivell i banderes

El desbloqueig de banderes ha de ser progressiu però conservador.

Exemple purament conceptual:

```text
nivell inicial      1
progressió baixa    2
progressió mitjana  3
progressió alta     4+
```

No són valors aprovats.

---

# 89. Altres fonts d'augment del límit

No necessàriament només Level.

Es podria exigir:

```text
Level
+
activitat real
+
Achievements
```

per desbloquejar una nova Flag.

Això evita comptes que només acumulen XP fàcil.

---

# 90. Bandera addicional i monetització

Regla especialment important:

> no vendre slots de bandera que proporcionin avantatge territorial directe.

Si algun dia existeixen slots comercials, haurien de ser purament decoratius o separats del PvP.

---

# 91. ProgressionVersion

Com amb les fórmules de Power, es recomana versionar regles importants.

```text
progression_rules_version
```

---

# 92. Reequilibratge

Si es modifica la corba d'XP:

* no s'ha de perdre historial;
* cal definir com es recalculen Levels.

Aquesta política es definirà abans de producció.

---

# 93. Perfil públic

Pot mostrar:

* Level;
* Achievements;
* Prestige;
* territori;
* exploració;
* banderes destacades.

No necessàriament:

* Reputation interna;
* FraudScore;
* informació privada.

---

# 94. Perfil privat

Pot incloure:

* historial complet;
* estadístiques;
* contribucions;
* progressió;
* informació de compte.

---

# 95. Identitat i rivalitat

El sistema ha de permetre competir sense exposar:

* email;
* domicili;
* ubicació actual;
* informació personal innecessària.

---

# 96. Comparació entre jugadors

Es poden comparar mètriques concretes:

```text
exploració
captures
km
cims
```

sense necessitar un únic score que decideixi qui és "millor".

---

# 97. Score global

No és necessari per al MVP.

Un únic score pot simplificar massa estils de joc molt diferents.

---

# 98. Objectiu de la progressió

La progressió ha de provocar:

```text
he fet activitat
↓
he avançat
↓
tinc nous objectius
↓
vull tornar a sortir
```

No:

```text
necessito grind per poder competir.
```

---

# 99. Regles fixades

Es consideren acceptades:

* XP i Power són diferents;
* Level no multiplica massivament AttackPower;
* Prestige i Reputation són diferents;
* Reputation serveix principalment per confiança comunitària;
* el nombre de banderes és limitat;
* existirà un sostre de banderes;
* l'exploració i historial són progressió permanent;
* territori i defenses són progressió temporal;
* una derrota PvP no elimina el progrés permanent;
* no cal moneda virtual al MVP;
* monetització no pot vendre victòries;
* activitats físiques són la principal font de progressió.

---

# 100. Decisions pendents

Caldrà definir:

1. corba d'XP;
2. nivells;
3. màxim de Level o progressió oberta;
4. número inicial de banderes;
5. FLAG_CREATION_CAP;
6. FLAG_CONTROL_CAP;
7. desbloqueig de slots;
8. fórmula de Prestige;
9. model de Reputation;
10. Achievement inicials;
11. rànquings;
12. quests;
13. col·leccions;
14. model Premium;
15. cosmètics;
16. Subscription / Entitlements.

---

# 101. Exemple de progressió

Jugador nou:

```text
Level 1
Flags creades disponibles: limitades
Exploració: 0,4 km²
Cims: 0
POI confirmats: 0
Prestige: baix
```

Després de mesos d'activitat:

```text
Level 12
Exploració: 94 km²
Cims: 17
POI confirmats: 8
Captures: 14
Defenses: 21
Flags disponibles: incrementades segons progressió
Prestige: notable
```

Això no implica que la seva següent Activity generi automàticament més Power que la d'un jugador de Level 2.

---

# 102. Exemple de derrota

Jugador veterà:

```text
Level 25
Prestige alt
```

perd una bandera.

Resultat:

```text
Level        = es manté
XP           = es manté
Achievements = es mantenen
Historial    = es manté
Prestige històric = es manté

FlagOwnership = perdut
Territori actual = pot disminuir
```

La derrota afecta el món actual, no esborra la trajectòria.

---

# 103. Principi final

TerritoriLord ha de permetre que el jugador pugui dir simultàniament:

> «He progressat molt.»

i:

> «Encara em poden guanyar.»

Aquest equilibri és essencial per mantenir el joc competitiu a llarg termini.

---

# 104. Següent document

El següent artefacte recomanat és:

```text
docs/GAME-RULES-05-security-privacy-anticheat.md
```

Ha de definir:

* privacitat dels tracks;
* protecció del domicili;
* ubicació en temps real;
* comptes duplicats;
* GPS spoofing;
* activitats motoritzades;
* farming;
* interaccions abusives;
* moderació;
* seguretat de banderes i POI;
* mesures graduals de confiança del compte.
