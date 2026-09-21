# TerritoriLord — Game Rules 03: Activity, Power & Validation

**Estat:** proposta funcional v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document defineix conceptualment:

* què és una Activity;
* quan és vàlida;
* circularitat;
* modalitats;
* Power;
* esforç;
* exploració;
* desnivell;
* anti-farming;
* anomalies;
* relació entre activitat i joc territorial.

No fixa encara fórmules definitives.

---

# 2. Principi central

> **El joc ha de recompensar activitat física real, no la manipulació del sistema.**

La Power és una representació del valor d'una Activity dins del joc.

No és una mesura mèdica ni esportiva absoluta.

---

# 3. Activity enregistrada vs Activity vàlida

S'han de separar:

```text
ACTIVITY RECORDED
```

i:

```text
ACTIVITY VALID FOR GAME
```

Una activitat pot existir correctament com a registre esportiu però no complir les condicions per:

* conquerir;
* atacar;
* defensar;
* generar determinades recompenses.

---

# 4. Estats d'una Activity

Possibles estats:

```text
RECORDING
COMPLETED
VALIDATING
VALID
PARTIALLY_VALID
INVALID
REJECTED
```

---

# 5. PARTIALLY_VALID

Pot existir un estat intermedi.

Exemple:

Una activitat és físicament plausible però no compleix les condicions de circularitat.

Pot donar:

* km;
* exploració;
* POI;
* estadístiques.

Però no:

* territori;
* atac;
* defensa territorial.

---

# 6. Tipus d'activitat

Inicialment:

```text
RUNNING
TRAIL_RUNNING
WALKING
HIKING
CYCLING
MTB
```

Cada modalitat tindrà criteris propis.

---

# 7. Modalitat declarada i modalitat observada

L'usuari selecciona una modalitat.

Però el sistema pot comparar-la amb:

* velocitat;
* acceleració;
* desnivell;
* durada;
* patró del track.

Exemple:

```text
modalitat declarada: RUNNING
velocitat sostinguda: 45 km/h
```

ha de generar una anomalia.

---

# 8. Circularitat

Per tenir efectes territorials forts:

> l'Activity ha de començar i acabar aproximadament al mateix lloc.

No cal retornar al mateix metre exacte.

---

# 9. CircularityRadius

S'haurà de definir un radi màxim entre:

```text
start point
end point
```

Tenint en compte:

* accuracy inicial;
* accuracy final;
* modalitat.

---

# 10. Circularitat no suficient

Això no serà vàlid:

```text
anar 100 m
fer una volta
tornar
```

si només es fa per generar una Activity artificial.

També caldran:

* distància mínima;
* durada mínima;
* moviment real;
* geometria suficient.

---

# 11. Geometria útil

Una ruta territorial ha de crear una geometria significativa.

Cal evitar:

* microbucles artificials;
* línies gairebé idèntiques d'anada i tornada;
* petites figures repetides.

La regla exacta queda pendent.

---

# 12. Distància

La distància contribueix a Power.

No de forma estrictament lineal.

Conceptualment:

```text
DistanceContribution = f(distance, activity_type)
```

amb rendiments decreixents.

---

# 13. Durada

La durada pot contribuir a validar l'activitat i a estimar esforç.

No ha de permetre generar Power quedant-se aturat.

S'ha de diferenciar:

* elapsed time;
* moving time.

---

# 14. Desnivell

El desnivell positiu pot aportar una contribució important.

Especialment per:

* trail;
* hiking;
* MTB.

No es considerarà directament tota variació d'altitud GPS sense filtratge.

---

# 15. ElevationValidation

Caldrà filtrar:

* soroll GPS;
* salts d'altitud;
* dades impossibles.

Idealment el desnivell derivat ha de poder ser recalculat.

---

# 16. PhysicalPower

Part de Power derivada de l'activitat física.

Conceptualment:

```text
PhysicalPower =
f(
  distance,
  moving_time,
  elevation_gain,
  activity_type
)
```

---

# 17. ExplorationPower

Descobrir territori nou genera Power addicional.

Conceptualment:

```text
ExplorationPower =
f(new_cells)
```

amb:

* sostre;
* rendiments decreixents.

---

# 18. DiscoveryPower

Elements especials poden aportar bonificació:

* cim nou;
* POI nou;
* bandera descoberta;
* zona nova.

---

# 19. ActivityPower

Conceptualment:

```text
ActivityPower =
PhysicalPower
+ ExplorationPower
+ DiscoveryPower
+ other_limited_contributions
```

No és encara una fórmula definitiva.

---

# 20. Transparència

El resultat ha de poder explicar-se.

Exemple:

```text
Distància              +18
Desnivell               +9
Exploració             +11
Cim                      +5
POI                      +2
                       ───
Power                    45
```

---

# 21. Límits

Cada contribució haurà de tenir límits.

Per exemple:

```text
POI
```

no ha de generar més Power que tota l'activitat física.

---

# 22. Rendiments decreixents

Alguns factors tindran una funció no lineal.

Especialment:

* distància molt alta;
* desnivell extrem;
* moltes descobertes en una sola Activity;
* repeticions.

Objectiu:

> una ultradistància ha de ser valuosa però no 20 vegades més poderosa que qualsevol activitat normal.

---

# 23. Modalitats diferents

No s'ha de comparar directament:

```text
10 km running
```

amb:

```text
10 km cycling
```

La modalitat forma part del càlcul.

---

# 24. Equilibri entre modalitats

No es busca que totes generin exactament la mateixa Power per quilòmetre.

Es busca que totes puguin ser competitivament útils dins del seu esforç real.

---

# 25. Cycling

La bicicleta permet recórrer molta més distància.

Per tant:

* distància tindrà menor pes relatiu;
* desnivell pot tenir gran importància;
* velocitats plausibles diferents;
* exploració podrà necessitar normalització.

---

# 26. Walking / Hiking

Distàncies habitualment inferiors.

Poden beneficiar-se de:

* durada;
* desnivell;
* dificultat;
* exploració.

No han de quedar inutilitzades davant del running.

---

# 27. Trail Running

Pot combinar:

* distància;
* desnivell;
* terreny;
* exploració.

No es pressuposa que sempre hagi de generar més Power.

---

# 28. Terreny

En el futur es podria incorporar dificultat del terreny.

No forma part obligatòria del MVP.

Evitar introduir classificacions difícils de verificar massa aviat.

---

# 29. Power associada a Activity

Power:

* no és saldo global;
* no s'emmagatzema indefinidament;
* es calcula per Activity.

---

# 30. ActivityPurpose

Possible classificació:

```text
NORMAL
EXPLORE
ATTACK_FLAG
DEFEND_FLAG
```

La mateixa Activity pot continuar generant exploració encara que tingui un propòsit concret.

---

# 31. ATTACK_FLAG

Requereix:

* FlagTarget seleccionada abans de començar;
* una única Flag;
* localització;
* Activity finalment vàlida.

---

# 32. DEFEND_FLAG

Requereix:

* Flag pròpia seleccionada;
* visita física;
* Activity vàlida.

---

# 33. NORMAL

Pot generar:

* exploració;
* territori;
* Power;
* visites.

No genera FlagAttack explícit.

---

# 34. EXPLORE

Inicialment pot ser només una intenció de l'usuari.

No necessita regles radicalment diferents.

Podria utilitzar-se per UX, reptes i estadístiques.

---

# 35. Una Activity, un atac

Regla fixa:

```text
max_flag_attacks_per_activity = 1
```

Independentment de la distància.

---

# 36. Circularitat per atac

Una Activity ATTACK_FLAG necessita complir circularitat.

Trobar una bandera no és suficient.

---

# 37. Atac pendent

Quan es localitza la Flag:

```text
FLAG_LOCATED
```

L'atac queda pendent fins al final.

---

# 38. Activitat invalidada després de localització

Si després:

* no es completa;
* no és circular;
* es detecta frau;

el FlagAttack no es resol favorablement.

---

# 39. AttackEfficiency

Es calcula separadament d'ActivityPower.

Conceptualment:

```text
EffectiveAttack =
ActivityPower × AttackEfficiency
```

---

# 40. Exploració nova

La primera exploració ha de donar una bonificació notable.

Objectiu:

> fer interessant sortir dels circuits habituals.

---

# 41. Repetició de territori

Repetir una ruta:

* continua comptant com activitat física;
* pot defensar;
* pot visitar Flags;
* pot refrescar Fog.

Però genera poca o cap ExplorationPower nova.

---

# 42. Similaritat de rutes

El sistema podria calcular si dues activitats són molt semblants.

No s'ha de penalitzar automàticament.

S'utilitzarà principalment per detectar:

* farming;
* comportament artificial.

---

# 43. Rutes habituals legítimes

Un corredor pot repetir legítimament el mateix circuit cada setmana.

Això ha de continuar aportant:

* PhysicalPower;
* defensa;
* manteniment.

No necessàriament:

* bonus de descoberta.

---

# 44. Micro-activities

Cal evitar dividir artificialment:

```text
10 km
```

en:

```text
5 activitats de 2 km
```

per multiplicar recompenses.

---

# 45. Possible cooldown

Es podrà aplicar una finestra temporal o territorial per evitar farming.

No s'ha de concretar encara.

---

# 46. Activitats consecutives

Diverses activitats seguides poden ser legítimes.

No s'han de prohibir simplement per proximitat temporal.

Caldrà observar:

* moviment;
* inici/final;
* repetició;
* propòsit.

---

# 47. GPS samples

Cada mostra idealment conté:

```text
timestamp
latitude
longitude
accuracy
altitude
speed
heading
```

quan estiguin disponibles.

---

# 48. Accuracy

Mostres amb `accuracy` molt dolenta poden:

* ignorar-se;
* rebaixar confiança;
* impedir una acció puntual.

No necessàriament invalidar tota l'activitat.

---

# 49. GPS gaps

Pèrdues temporals de GPS poden existir legítimament.

Cal diferenciar:

```text
gap curt plausible
```

de:

```text
teletransport GPS
```

---

# 50. Velocitat impossible

El sistema haurà de detectar trams incompatibles amb la modalitat.

Exemple conceptual:

```text
RUNNING
3 km en 3 minuts
```

---

# 51. Vehicle motoritzat

S'ha d'intentar detectar activitats declarades com running/hiking però realitzades:

* en cotxe;
* moto;
* altres vehicles.

No es pot garantir detecció perfecta només amb GPS.

---

# 52. Teletransport

Exemple:

```text
punt A
↓ 5 segons
punt B a 4 km
```

ha de generar una anomalia forta.

---

# 53. Pattern anomalies

Es podran considerar:

* velocitat;
* acceleració;
* salts;
* trajectòria;
* freqüència de mostres.

---

# 54. ValidationConfidence

Es pot derivar un grau de confiança.

Exemple conceptual:

```text
HIGH
MEDIUM
LOW
REJECTED
```

No implica necessàriament exposar-lo tal qual a l'usuari.

---

# 55. Activitat dubtosa

Una Activity dubtosa pot:

* conservar-se al registre;
* no modificar territori;
* no generar atac.

Això és preferible a eliminar-la automàticament.

---

# 56. FraudScore

Pot existir internament un score o conjunt d'indicadors antiabús.

No s'ha de confondre amb:

* reputació;
* XP;
* prestigi.

---

# 57. Dispositiu

En fases posteriors es podrà considerar informació del dispositiu per antiabús.

Caldrà respectar privacitat.

No és necessari per al MVP.

---

# 58. Importació d'activitats

Decisió oberta:

> es permetran activitats importades de Garmin, Strava, FIT, GPX...?

Per PvP és especialment sensible.

Inicialment es recomana que atacs i defenses requereixin enregistrament en viu per TerritoriLord.

---

# 59. Enregistrament en viu

Per accions com FlagAttack, l'app necessita saber:

* que l'activitat està activa;
* que l'usuari és físicament allà;
* l'accuracy actual;
* la interacció en aquell moment.

Això fa difícil utilitzar una activitat importada per atacar retroactivament.

---

# 60. Activitats importades i exploració

Es podria permetre en el futur que activitats externes aportin:

* historial esportiu;
* potser exploració.

Però no necessàriament:

* territori;
* FlagAttack;
* FlagDefense.

Decisió pendent.

---

# 61. Inici i final

Cal protegir la privacitat de:

* domicili;
* lloc de treball;
* ubicacions recurrents.

Aquest problema és independent de la validació de circularitat.

---

# 62. Circularitat privada

El servidor pot validar proximitat entre inici/final sense necessitat de mostrar públicament aquests punts.

---

# 63. ActivityPower i territori

La Power generada pot alimentar:

```text
TerritoryBudget
TerritoryPressure
FlagAttack
FlagDefense
```

Segons el propòsit.

---

# 64. No duplicació de Power

La mateixa Activity no ha de poder generar tota la Power simultàniament per múltiples accions incompatibles.

Exemple:

una Activity ATTACK_FLAG pot continuar conquerint territori, però caldrà definir com es reparteix Power.

---

# 65. Distribució de Power

Possible model futur:

```text
ActivityPower = 50

part territorial
part FlagAttack
```

o bé aplicar sistemes independents amb límits.

Aquesta decisió queda oberta.

---

# 66. Evitar decisió manual excessiva

No es recomana obligar l'usuari a repartir manualment:

```text
13 punts a territori
22 a bandera
7 a...
```

El joc ha de continuar sent esportiu, no una fulla Excel.

---

# 67. Càlcul automàtic

Preferiblement:

> el sistema determina automàticament els efectes segons ActivityPurpose.

---

# 68. POI durant Activity

Descobrir molts POI no ha de generar una escalada enorme de Power.

Hi haurà:

* límit per Activity;
* rendiments decreixents.

---

# 69. Banderes descobertes

Descobrir una Flag pot aportar:

* XP;
* informació;
* petita DiscoveryPower.

No hauria de tenir una recompensa tan alta que sigui explotable.

---

# 70. Cims

Primera ascensió:

* recompensa notable.

Repeticions:

* molt menor recompensa exploratòria.

---

# 71. Desnivell i repetibilitat

Pujar repetidament un mateix pendent continua sent esforç físic real.

Per tant:

* PhysicalPower continua existint.

Però:

* DiscoveryPower no.

---

# 72. Power màxima

És recomanable definir algun tipus de sostre pràctic per Activity.

No necessàriament un hard cap absolut.

Pot ser una corba que s'aplana.

---

# 73. Activitats extremes

Una ultramarató o gran travessa ha de rebre reconeixement.

Però no ha de permetre:

> destruir tot un territori amb una única activitat.

Les regles:

* TerritoryBudget;
* 1 FlagAttack;
* rendiments decreixents;

ja limiten aquest problema.

---

# 74. MinimumEffectiveActivity

Cada modalitat necessitarà criteris mínims.

Exemple conceptual:

```text
RUNNING
mínima distància
o mínima durada
```

No es defineixen números encara.

---

# 75. Activitats curtes legítimes

No s'han de descartar automàticament activitats curtes.

Poden ser útils per:

* salut;
* exploració;
* visites.

Però potser no per:

* conquestes;
* atac.

---

# 76. Diferents nivells de validesa

Una mateixa Activity podria ser:

```text
valid_for_record = true
valid_for_exploration = true
valid_for_territory = false
valid_for_attack = false
```

Aquesta separació és recomanable.

---

# 77. ValidationCapabilities

En lloc d'un únic booleà:

```text
valid = true/false
```

es recomana conceptualment derivar capacitats.

Exemple:

```text
CAN_COUNT_DISTANCE
CAN_EXPLORE
CAN_VISIT_POI
CAN_CAPTURE_TERRITORY
CAN_ATTACK_FLAG
CAN_DEFEND_FLAG
```

---

# 78. Benefici

Això evita haver d'invalidar completament una Activity per un únic defecte.

---

# 79. Atac i presència GPS

FlagAttack necessita una validació més estricta que simplement explorar.

Perquè és una acció competitiva.

---

# 80. Jerarquia de rigor

Conceptualment:

```text
registre esportiu
    ↓
exploració
    ↓
territori
    ↓
defensa
    ↓
atac PvP
```

Com més impacte competitiu, més rigor de validació.

---

# 81. Visita a POI

Pot requerir menys rigor que un FlagAttack.

Però si genera recompenses importants, també haurà de tenir controls.

---

# 82. Errors tècnics

Una fallada temporal del GPS no ha de destruir injustament una Activity completa.

El sistema ha de tolerar certa imperfecció.

---

# 83. Traçabilitat

Cal conservar prou evidència per explicar:

* per què una Activity ha estat rebutjada;
* per què no ha pogut atacar;
* com s'ha calculat Power.

---

# 84. Reprocessament

Si les fórmules canvien, cal decidir si:

* activitats antigues mantenen el resultat històric;
* es recalculen.

Per integritat del joc, es recomana conservar el resultat versionat aplicat en el moment.

---

# 85. RulesVersion

Els resultats derivats importants haurien de poder identificar:

```text
rules_version
```

Exemple:

```text
Power calculated with RULESET 1.2
```

Això facilitarà equilibratge futur.

---

# 86. Transparència de canvis

Quan canviïn regles significatives, els jugadors haurien de poder entendre:

* què ha canviat;
* a partir de quan.

---

# 87. Power i nivell

El nivell del jugador no hauria de multiplicar massivament ActivityPower.

Un veterà no pot ser automàticament més fort fent exactament la mateixa activitat.

---

# 88. Progressió sense invencibilitat

El nivell pot donar:

* cosmètics;
* estadístiques;
* més opcions;
* límit de banderes gradualment superior.

Però no:

```text
Nivell 50 = x5 AttackPower
```

---

# 89. Jugador nou

Ha de ser possible que un jugador nou, fent una Activity exigent i ben executada, pugui afectar una Flag veterana.

Potser necessitarà múltiples intents si la defensa és alta.

---

# 90. Activitat defensiva

La defensa també deriva d'una Activity real.

No d'un botó passiu:

```text
+10 defensa
```

---

# 91. DefensePower

Conceptualment:

```text
DefensePower =
ActivityPower
× defense_modifier
```

amb sostres.

---

# 92. Atac vs defensa

No necessiten tenir exactament la mateixa fórmula.

Però han de partir d'una base comparable i explicable.

---

# 93. Defensa repetida

No pot permetre:

```text
20 micro-rutes
→ defensa màxima immediata
```

Caldran rendiments decreixents i límits temporals.

---

# 94. TerritorialPressure

Per territori rival:

```text
TerritorialPressure =
f(ActivityPower, TerritoryBudget, route)
```

No cal que sigui equivalent a FlagAttackPower.

---

# 95. Diferenciar Flag i territori

Una bandera és un objectiu puntual.

El territori és una superfície.

La mateixa Activity pot relacionar-se amb tots dos, però són sistemes diferents.

---

# 96. Fog i activitat

Una Activity pot:

* descobrir zona nova;
* refrescar coneixement;
* reforçar KnowledgeRetention.

Aquest efecte existeix encara que l'Activity no sigui circular.

---

# 97. Presència territorial

Les activitats recurrents en una zona poden ajudar a mantenir-la:

* descoberta;
* actualitzada;
* sota menor degradació de Fog.

Això connecta amb `GAME-RULES-02 v0.2`.

---

# 98. Domini i Activity

Una Activity en territori propi pot contribuir simultàniament a:

* manteniment;
* coneixement;
* defensa limitada.

Sense generar automàticament una fortalesa.

---

# 99. Pèrdua de presència

Si cessen les Activities:

```text
Defense ↓
KnowledgeRetention ↓
Fog degradation ↑
```

Això fa que activitat, domini i coneixement evolucionin conjuntament.

---

# 100. Regles fixades

Es consideren acceptades:

* una Activity enregistrada no és automàticament vàlida per al joc;
* hi haurà validesa diferent segons efecte;
* activitats territorials necessiten circularitat;
* FlagAttack necessita una Activity circular vàlida;
* una Activity només ataca una Flag;
* Power pertany a l'Activity;
* exploració nova aporta Power;
* repeticions continuen aportant esforç físic;
* descobriments repetits tenen rendiments decreixents;
* modalitats tenen criteris diferents;
* el nivell no dona multiplicadors PvP desproporcionats;
* efectes competitius exigeixen més rigor de validació;
* Activity també refresca Fog i presència territorial.

---

# 101. Decisions pendents

Caldrà definir experimentalment:

1. mínims per modalitat;
2. CircularityRadius;
3. criteris geomètrics;
4. PhysicalPower;
5. ExplorationPower;
6. DiscoveryPower;
7. Power cap / corba;
8. diferències entre modalitats;
9. similitud de rutes;
10. cooldowns;
11. validació d'altitud;
12. velocitats plausibles;
13. gestió de GPS gaps;
14. importació externa;
15. distribució de Power;
16. RulesVersion;
17. criteris exactes de cada ValidationCapability.

---

# 102. Escenari

```text
TRAIL_RUNNING

13,2 km
+820 m
1,8 km² nous
1 cim nou
2 POI
```

Validation:

```text
GPS coherent
velocitat plausible
circularitat correcta
Activity valid
```

Power conceptual:

```text
PhysicalPower       29
ElevationPower      10
ExplorationPower    12
DiscoveryPower       6
                   ───
ActivityPower       57
```

Si és ATTACK_FLAG:

```text
AttackEfficiency = 84 %

EffectiveAttack ≈ 48
```

Si fos una Activity normal:

```text
Power alimenta territori
+ exploració
+ manteniment
```

---

# 103. Principi final

TerritoriLord no ha de premiar simplement:

> més quilòmetres.

Ha de premiar:

> **activitat física real + esforç + exploració + qualitat de l'acció dins del joc.**

---

# 104. Següent document

El següent artefacte recomanat és:

```text
docs/GAME-RULES-04-progression-reputation-economy.md
```

Hauria de definir:

* XP;
* nivell;
* progressió;
* límit de banderes;
* prestigi;
* reputació;
* recompenses;
* assoliments;
* què es conserva permanentment;
* què no dona avantatge PvP;
* base per a monetització futura.
