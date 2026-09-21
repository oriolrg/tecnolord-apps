# TerritoriLord — Game Rules 01: Territory, Flags & Combat

**Estat:** proposta funcional v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document defineix les regles conceptuals de:

* territori;
* conquesta;
* potència;
* atac;
* defensa;
* banderes;
* decadència;
* rivalitats territorials.

No fixa encara fórmules matemàtiques definitives.

---

# 2. Principis

Les regles han de complir:

1. l'activitat física és obligatòria;
2. explorar ha de ser útil;
3. repetir sempre el mateix recorregut ha de tenir rendiments decreixents;
4. els jugadors actius han de poder defensar;
5. cap territori ha de ser invencible;
6. un jugador nou ha de poder afectar territori veterà amb prou activitat;
7. les banderes han de generar objectius interessants;
8. el sistema ha de premiar activitat real i diversa;
9. visitar no implica atacar;
10. cada atac ha de correspondre a una activitat concreta.

---

# 3. Unitat territorial

El món es dividirà internament en cel·les.

Cada cel·la pot estar:

* lliure;
* controlada per un jugador;
* disputada temporalment.

La tecnologia concreta queda pendent.

Visualment les cel·les poden representar-se com una superfície contínua.

---

# 4. Conquesta territorial bàsica

Una Activity territorial vàlida:

1. comença;
2. dibuixa un recorregut;
3. acaba aproximadament prop de l'inici;
4. genera una geometria tancada;
5. determina les cel·les candidates;
6. aplica les regles de conquesta.

Les cel·les completament noves poden ser adquirides directament si l'activitat compleix els requisits.

---

# 5. Territori buit

Quan una ruta encercla cel·les sense propietari:

```text
Activity vàlida
      ↓
cel·les lliures
      ↓
conquesta
```

Aquest ha de ser el cas més senzill.

No cal combat contra cap altre jugador.

---

# 6. Territori propi

Quan una ruta inclou territori ja propi, aquesta activitat pot:

* refrescar-lo;
* reforçar-lo;
* reduir-ne decadència;
* aportar defensa.

No genera una nova conquesta.

---

# 7. Territori rival

Envoltar territori rival no ha de significar capturar-lo automàticament.

La ruta genera:

> **pressió territorial**

La pressió es compara amb la defensa de les cel·les rivals.

---

# 8. Pressió territorial

Una Activity pot generar una quantitat de pressió.

Pot dependre de:

* potència generada;
* modalitat;
* territori nou explorat;
* forma de la ruta;
* superfície;
* activitat recent del jugador.

La pressió s'aplica únicament al territori físicament relacionat amb la ruta.

---

# 9. Conquesta gradual

Una cel·la rival pot necessitar diversos intents.

Exemple conceptual:

```text
Defensa inicial: 70

Activitat rival:
pressió 22

70 → 48

Nova activitat:
pressió 30

48 → 18

Nova activitat:
pressió 25

18 → 0
CAPTURA
```

Això crea batalles de diversos dies.

---

# 10. Defensa territorial

Cada TerritoryCell té defensa limitada.

La defensa pot augmentar per:

* activitats del propietari;
* activitats defensives;
* proximitat de banderes;
* activitat recent;
* situació dins d'un territori consolidat.

No pot superar un màxim.

---

# 11. Defensa no lineal

Arribar a defensa alta ha de ser progressivament més difícil.

Exemple conceptual:

```text
20 → 40   relativament fàcil
40 → 60   moderat
60 → 80   difícil
80 → 100  molt difícil
```

Això evita que un jugador pugui fortificar enormes extensions fàcilment.

---

# 12. Decadència

La defensa disminueix si el territori queda abandonat.

La decadència pot dependre de:

* temps sense activitat;
* tipus de territori;
* activitat rival;
* presència de banderes.

No implica necessàriament perdre el territori automàticament.

Inicialment:

```text
propietat es conserva
defensa disminueix
```

Quan la defensa és baixa, capturar-lo resulta més fàcil.

---

# 13. Territori abandonat

Si una zona passa molt temps sense activitat, podria arribar a un estat:

```text
CONTROL FEBLE
```

No necessàriament torna automàticament a neutral.

Aquesta decisió es manté oberta.

---

# 14. Potència

Una Activity genera Power.

Power representa el valor esportiu i exploratori de l'activitat.

Contribucions possibles:

```text
PhysicalPower
ExplorationPower
ElevationPower
DiscoveryPower
AchievementPower
```

---

# 15. Potència física

Pot dependre de:

* distància;
* temps;
* desnivell;
* modalitat.

No s'utilitzarà simplement:

```text
1 km = 1 punt
```

La fórmula haurà de considerar l'esforç de cada tipus d'activitat.

---

# 16. Potència d'exploració

Descobrir territori nou genera bonificació.

Aquesta contribució ha de ser notable.

Objectiu:

> incentivar que el jugador canviï de recorregut.

---

# 17. Cims i fites

Assolir una fita nova pot aportar Power addicional.

Exemples:

* cim;
* coll;
* POI;
* descoberta especial.

Les visites repetides no generaran indefinidament la mateixa bonificació.

---

# 18. Power no acumulable indefinidament

Power no ha de funcionar com una moneda que es pugui guardar durant anys.

Per defecte:

> la Power pertany a una Activity.

Això evita:

```text
Jugador veterà
300.000 Power acumulada
→ atac impossible d'equilibrar
```

---

# 19. Ús de Power

Segons ActivityPurpose, la Power pot aplicar-se a:

```text
NORMAL
→ territori / exploració

ATTACK_FLAG
→ bandera objectiu + efectes territorials relacionats

DEFEND_FLAG
→ defensa de bandera / territori

EXPLORE
→ progressió exploratòria
```

Una mateixa fórmula base pot alimentar resultats diferents.

---

# 20. Superfície i explotació

Una ruta enorme no ha de conquistar automàticament una superfície enorme.

Exemple problemàtic:

```text
20 km de perímetre
→ 40 km² encerrats
```

La conquesta ha de quedar limitada per:

* Power;
* superfície;
* nombre de cel·les;
* modalitat;
* altres criteris.

---

# 21. Pressupost territorial

Cada Activity pot generar un:

> TerritoryBudget

Aquest valor limita quanta superfície pot afectar.

Per exemple:

```text
Ruta encercla 70 cel·les

TerritoryBudget = 24

→ només pot afectar fins a 24
```

L'algoritme de selecció queda pendent.

---

# 22. Prioritat territorial

Si no hi ha prou pressupost per a totes les cel·les, es poden prioritzar segons:

1. cel·les per les quals el jugador ha passat;
2. cel·les properes al track;
3. cel·les interiors;
4. cel·les estratègicament connectades.

Aquesta regla s'haurà de validar amb prototips.

---

# 23. Connectivitat

Es recomana evitar territoris completament arbitraris i fragmentats.

El sistema pot afavorir:

* continuïtat;
* expansió des de territori existent;
* connexió amb banderes pròpies.

Però explorar zones llunyanes també ha de ser possible.

---

# 24. Banderes i territori

Una Flag és un punt estratègic.

No captura territori per si sola.

Principi:

> cap bandera conquereix passivament el mapa.

Però pot influir sobre territori proper.

---

# 25. Influència de bandera

Una bandera controlada pot aportar un bonus limitat a cel·les pròximes.

Exemple conceptual:

```text
        +2
     +4 +4 +4
   +2 +6 🚩 +6 +2
     +4 +4 +4
        +2
```

La influència disminueix amb distància.

---

# 26. Límit d'influència

La influència d'una bandera:

* té radi limitat;
* té bonus màxim;
* no pot fer invencible una cel·la.

La seva funció és donar valor estratègic, no bloquejar territori.

---

# 27. Importància de bandera

La Importància depèn principalment de la comunitat.

Factors possibles:

* usuaris únics;
* visites vàlides;
* recurrència;
* activitat recent.

No depèn principalment del propietari.

---

# 28. Importància i recompensa

Una bandera important pot donar:

* més prestigi;
* més XP en capturar-la;
* més notorietat;
* una influència territorial lleugerament superior.

Però l'efecte sobre Defense estarà limitat.

---

# 29. Visites a bandera

Un jugador pot passar per una Flag sense atacar-la.

Això pot aportar:

* descoberta;
* XP;
* actualització del mapa;
* augment de FlagImportance.

No afecta necessàriament el propietari.

---

# 30. Comptabilització de visites

Per Importància:

> jugadors diferents > visites totals

Exemple conceptual:

```text
1 jugador × 100 visites
```

ha de valer molt menys que:

```text
30 jugadors × 2 visites
```

---

# 31. Rendiments decreixents de visita

Un mateix usuari pot tenir:

```text
primera visita → alta contribució
segona        → petita
repeticions   → gairebé zero
```

Els intervals exactes queden pendents.

---

# 32. Selecció d'una bandera rival

Per atacar:

1. la bandera ha d'haver estat descoberta;
2. el jugador la selecciona abans d'iniciar Activity;
3. queda registrada com a AttackTarget.

No es pot canviar durant l'activitat.

---

# 33. Una Activity, una Flag

Regla fixa:

> una activitat només pot atacar una bandera.

No importa la distància.

Una activitat de 50 km continua tenint un sol objectiu de FlagAttack.

---

# 34. Orientació

Arribar a la zona aproximada no és suficient.

El jugador ha de localitzar la bandera.

L'app pot mostrar:

```text
zona aproximada
↓
proximitat
↓
indicis
```

Sense necessitat de mostrar directament la coordenada exacta.

---

# 35. Intent de localització

Quan el jugador creu haver-la trobat:

```text
ATACAR
```

El sistema avalua:

* distància;
* accuracy;
* mostres recents;
* coherència.

---

# 36. Resultat de localització

## CONFIRMED

La posició és correcta.

## UNCERTAIN

La precisió no permet determinar-ho.

Cap penalització.

## INCORRECT

La posició és clarament incorrecta.

Es redueix AttackEfficiency.

---

# 37. Eficiència

L'eficiència representa com de bé s'ha executat l'orientació.

Comença alta.

Els errors confirmats la redueixen.

Exemple conceptual:

```text
100 %
  ↓
94 %
  ↓
86 %
  ↓
74 %
```

No s'han definit encara els percentatges reals.

---

# 38. Potència efectiva d'atac

Conceptualment:

```text
EffectiveAttack =
    ActivityPower
    × AttackEfficiency
    × altres modificadors limitats
```

Els modificadors no han de generar multiplicacions extremes.

---

# 39. Resolució tardana

Trobar la Flag no resol el combat.

Cal completar l'Activity.

Després:

```text
Activity completa
      ↓
validació
      ↓
Power
      ↓
AttackEfficiency
      ↓
EffectiveAttack
      ↓
combat
```

---

# 40. Activitat incompleta

Si el jugador troba la bandera però:

* abandona l'activitat;
* no torna aproximadament al punt inicial;
* l'activitat és invalidada;

l'atac no produeix efecte.

---

# 41. Defensa de bandera

Una Flag té Defense pròpia.

Pot augmentar mitjançant:

* activitats defensives;
* activitat recent;
* influència territorial.

Té sostre.

---

# 42. Atacs parcials

Un atac que no captura pot reduir Defense.

Exemple:

```text
Defense = 60
Attack = 23

Defense final = 37
```

La bandera continua en mans del propietari.

---

# 43. Recuperació defensiva

El propietari pot realitzar una Activity de defensa.

Exemple:

```text
Defense = 37
DefensivePower = 18

37 → 55
```

Sense superar el màxim.

---

# 44. Evitar curacions instantànies

Una bandera molt danyada no hauria de recuperar-se necessàriament del tot amb una única activitat trivial.

S'aplicaran:

* rendiments decreixents;
* límit de recuperació;
* criteris mínims.

---

# 45. Captura

Quan EffectiveAttack supera la defensa restant:

```text
CAPTURED
```

La Flag canvia de propietari.

---

# 46. Efectes de captura

En capturar:

* nou propietari;
* historial actualitzat;
* rivalitat actualitzada;
* possible XP/prestigi;
* Defense reiniciada a un valor base.

No hereta tota la fortificació anterior.

---

# 47. Valor persistent de bandera

La captura no elimina:

* Importància;
* visites;
* historial;
* prestigi del lloc.

Això permet que algunes banderes siguin objectius valuosos independentment del propietari.

---

# 48. Bonus de reconquesta

Es pot aplicar una petita bonificació temporal al propietari anterior.

Objectiu:

> incentivar rivalitats i contraatacs.

La bonificació:

* ha de ser limitada;
* no ha de garantir reconquesta.

Aquesta mecànica queda pendent de prova.

---

# 49. Banderes abandonades

Si el propietari no hi torna:

```text
Defense ↓
```

La Importància comunitària no desapareix necessàriament.

Això fa que:

> una bandera popular però abandonada sigui una presa atractiva.

---

# 50. Banderes d'alt valor

Les banderes més atractives poden combinar:

* alta Importància;
* molt prestigi;
* molta disputa;
* posició estratègica;
* història.

No necessàriament alta Defense.

---

# 51. Rivalitats emergents

Cada captura entre jugadors pot alimentar una Rivalry.

Exemple:

```text
Oriol ↔ Marc

captures: 4 / 5
reconquestes: 3 / 4
banderes disputades: 2
```

No s'ha d'assignar artificialment un rival.

La rivalitat emergeix del joc.

---

# 52. Fronteres

Una cel·la pròpia adjacent a una rival és una frontera.

Les fronteres poden utilitzar-se per:

* estadístiques;
* alertes;
* mapa;
* estratègia.

Podrien tenir regles específiques en fases posteriors.

---

# 53. Fog i combat

No es pot atacar una bandera que el jugador encara no ha descobert.

El Fog pot mostrar només:

```text
🚩?
```

o una zona aproximada.

Per atacar cal:

```text
detectar
↓
explorar
↓
descobrir
↓
planificar atac
```

---

# 54. Intel·ligència obsoleta

Si una bandera va ser descoberta fa molt temps, el jugador pot conservar:

* existència històrica;
* ubicació aproximada.

Però perdre informació actual com:

* propietari;
* Defense;
* Importància actual.

Pot ser necessari revisitar la zona abans de planificar un atac.

---

# 55. Jugador visitant

El visitant pot:

* descobrir territori;
* generar Power;
* descobrir banderes;
* capturar;
* crear historial.

No necessita residir habitualment a la zona.

---

# 56. Avantatge del local

El local tindrà avantatge natural per:

* coneixement actualitzat;
* activitat regular;
* defenses mantingudes.

No tindrà un multiplicador arbitrari simplement per residència.

---

# 57. Repetició abusiva

Fer repetidament la mateixa ruta ha de continuar sent útil per entrenar i defensar, però no pot escalar indefinidament.

Possible model:

```text
primera activitat → 100 %
següents similars → rendiments decreixents
```

No s'ha de penalitzar excessivament l'usuari que legítimament entrena sempre per la mateixa zona.

---

# 58. Anti-farming territorial

S'hauran de detectar patrons com:

* microcircuits repetits;
* activitats separades artificialment;
* múltiples activitats consecutives sense sentit;
* captures coordinades entre comptes.

Les regles exactes quedaran per l'especificació anti-cheat.

---

# 59. Seguretat física

Cap recompensa ha d'incentivar:

* entrada en propietat privada;
* zones prohibides;
* accions perilloses;
* ús del mòbil en situacions inadequades.

Una bandera pot denunciar-se per:

* accés privat;
* perill;
* ubicació incorrecta.

---

# 60. Transparència

El jugador ha de poder entendre per què ha passat alguna cosa.

Després d'una Activity es podria mostrar:

```text
Potència física          24
Desnivell                 8
Exploració                9
POI                       3
                         ──
Power                    44

Eficiència orientació    82 %

Atac efectiu             36
Defensa bandera          31

RESULTAT: CAPTURA
```

Això serà important per evitar que les regles semblin arbitràries.

---

# 61. Nombres ocults o visibles

No està decidit si tots els valors s'han de mostrar amb exactitud.

Possibilitats:

```text
Defense = 67
```

o:

```text
Defense: ALTA
```

Pot ser interessant mostrar aproximacions abans de l'atac i valors exactes després.

Aquesta decisió queda oberta.

---

# 62. Regles fixades

Es consideren acceptades:

* una activitat només pot atacar una bandera;
* l'atac s'ha de seleccionar abans de començar;
* la bandera s'ha de trobar físicament;
* GPS incert no penalitza;
* error GPS clar penalitza eficiència;
* l'activitat s'ha de completar abans de resoldre l'atac;
* visitar no és atacar;
* Importància, Defense i Prestige són diferents;
* les banderes no conquereixen territori passivament;
* Power no s'acumula indefinidament;
* cap defensa és infinita;
* explorar aporta Power;
* territori abandonat es debilita;
* una captura conserva el valor històric de la Flag.

---

# 63. Decisions pendents

Caldrà experimentar amb:

1. mida de TerritoryCell;
2. TerritoryBudget;
3. selecció de cel·les dins un circuit;
4. fórmula ActivityPower;
5. fórmula AttackPower;
6. Defense màxima;
7. decadència;
8. recuperació defensiva;
9. FlagInfluenceRadius;
10. fórmula FlagImportance;
11. bonus de reconquesta;
12. rendiments decreixents;
13. informació visible abans d'un atac;
14. durada de la intel·ligència territorial.

---

# 64. Escenari complet

Exemple conceptual:

```text
Jugador A descobreix:
🚩 Bandera de Coll X

Importància alta
Defense aparent: mitjana

↓
la selecciona com objectiu

↓
inicia Trail Running

↓
12,4 km
+680 m
territori nou
1 cim nou

↓
arriba a la zona

↓
primer intent:
UNCERTAIN
sense penalització

↓
segon intent:
INCORRECT
Efficiency 100 → 93

↓
tercer intent:
CONFIRMED

↓
continua ruta

↓
acaba prop del punt inicial

↓
Activity validada

Power = 47
Efficiency = 93 %

EffectiveAttack ≈ 44

Defense = 38

↓
CAPTURED
```

La bandera:

* canvia de propietari;
* manté Importància;
* manté historial;
* reinicia Defense parcialment;
* actualitza la Rivalry.

---

# 65. Bucle de joc resultant

```text
veig una pista al mapa
      ↓
exploro
      ↓
descobreixo una bandera
      ↓
avaluo si m'interessa
      ↓
planifico una activitat
      ↓
faig esport
      ↓
m'oriento
      ↓
localitzo la bandera
      ↓
completo el circuit
      ↓
ataco
      ↓
capturo o debilito
      ↓
el rival reacciona
      ↓
nova activitat
```

Aquest és el bucle PvP principal de TerritoriLord.

---

# 66. Següent document

El següent artefacte hauria de ser:

```text
docs/GAME-RULES-02-exploration-fog-poi.md
```

Ha de definir:

* exploració;
* Fog of War;
* degradació del coneixement;
* detecció de banderes i POI;
* cims;
* POI comunitaris;
* visites;
* turisme;
* actualització de zones antigues.
