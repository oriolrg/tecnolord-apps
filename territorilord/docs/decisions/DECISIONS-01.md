# TerritoriLord — Decisions 01: Flags, Territory & PvP

**Estat:** decisions funcionals v0.1
**Data:** 2026-09-18
**Complementa:** `DECISIONS-00.md`

---

# 1. Dues tipologies de bandera

## D-108 — PublicFlagSite

**Estat:** FIXAT

Existeix una tipologia de bandera pública i geogràficament fixa:

```text
PublicFlagSite
```

Característiques:

* té una ubicació permanent;
* és pública;
* no es pot traslladar;
* pot passar d'un propietari a un altre;
* conserva permanentment el seu historial;
* pot tenir Importance, Prestige i Defense;
* pot ser objectiu de rivalitats;
* pot provenir del sistema, administració o futures campanyes turístiques.

Exemple conceptual:

```text
🚩 Coll de Port

ubicació: permanent
propietari actual: Oriol

historial:
Marc
↓
Anna
↓
Oriol
```

La captura canvia el propietari, no la ubicació.

---

# 2. Bandera creada per un jugador

## D-109 — UserFlag

**Estat:** FIXAT

Una bandera creada per un jugador és un objecte territorial transportable:

```text
UserFlag
```

Característiques:

* té creador original;
* té propietari actual;
* només pot estar plantada en una ubicació cada vegada;
* aquesta ubicació pot canviar;
* pot ser capturada;
* el nou propietari pot transportar-la a una altra part del seu territori.

La bandera conserva el seu historial encara que canviï d'ubicació.

---

# 3. UserFlagPlacement

## D-110 — La ubicació d'una UserFlag no és un FlagSite permanent

**Estat:** FIXAT

Quan una UserFlag està plantada, existeix conceptualment:

```text
UserFlagPlacement
```

que representa la seva ubicació actual.

Si la bandera és capturada i retirada:

```text
UserFlagPlacement
→ deixa d'estar actiu
```

No és necessari conservar aquell punt com una bandera pública permanent.

L'historial sí que es conserva.

---

# 4. Historial de propietaris

## D-111

**Estat:** FIXAT

Tant les banderes públiques com les UserFlag conservaran:

* creador original quan existeixi;
* propietaris successius;
* captures;
* reconquestes;
* dates;
* ubicacions històriques quan siguin rellevants.

---

# 5. H3

## D-112

**Estat:** FIXAT PROVISIONALMENT

S'utilitzarà H3 com a primera solució per representar les unitats geogràfiques.

Es podrà substituir si les proves demostren que no funciona adequadament.

---

# 6. Resolucions H3

## D-113

**Estat:** FIXAT PROVISIONALMENT

Exploració i territori utilitzaran el mateix sistema H3 però amb resolucions diferents.

Conceptualment:

```text
ExplorationCell
→ cel·la més petita

TerritoryCell
→ cel·la més gran
```

El Fog podrà, per tant, tenir més detall que el control territorial.

Les resolucions concretes es determinaran amb proves.

---

# 7. Cel·les dins una ruta circular

## D-114

**Estat:** HIPÒTESI DE PROVA ACCEPTADA

Una TerritoryCell serà candidata a quedar inclosa dins una ruta circular quan aproximadament:

```text
>= 75 %
```

de la seva superfície quedi dins del polígon delimitat per l'Activity.

El `75 %` és un valor inicial experimental.

S'haurà de validar amb:

* circuits petits;
* circuits grans;
* formes irregulars;
* límits de cel·les.

---

# 8. TerritoryBudget

## D-115

**Estat:** FIXAT conceptualment

Que una cel·la estigui dins la ruta no significa necessàriament que una única Activity pugui afectar una superfície il·limitada.

Continuarà existint el concepte:

```text
TerritoryBudget
```

per limitar conquestes excessivament grans.

---

# 9. Territori desconnectat

## D-116

**Estat:** FIXAT

Es pot conquerir territori que no estigui connectat al territori actual del jugador.

Això és necessari especialment per:

* turisme;
* viatges;
* noves zones d'activitat.

Però el territori desconnectat tindrà menor capacitat de consolidació.

Podrà tenir, per exemple:

* pitjor retenció;
* major decadència;
* menor bonus defensiu.

La fórmula concreta és PENDENT.

---

# 10. Creació d'una UserFlag

## D-117

**Estat:** FIXAT

Una UserFlag només es podrà plantar:

* dins territori propi;
* o en territori neutral.

No es podrà crear directament una bandera nova dins territori controlat per un altre jugador.

---

# 11. Territori neutral i UserFlag

## D-118

**Estat:** FIXAT

Plantar una UserFlag en territori neutral:

> no captura territori automàticament.

La Flag pot facilitar la consolidació o defensa posterior.

Normalment, però, l'Activity necessària per arribar-hi i plantar-la ja haurà pogut generar efectes territorials per les regles normals.

---

# 12. Creació física

## D-119

**Estat:** FIXAT

Crear una UserFlag requerirà:

```text
slot disponible
+
Activity específica vàlida
+
presència física
```

No existirà una moneda virtual obligatòria per crear-la.

---

# 13. Límit de banderes

## D-120

**Estat:** FIXAT

Existiran dos conceptes diferenciats:

```text
FLAG_CREATION_CAP
FLAG_CONTROL_CAP
```

El primer limita la capacitat de crear banderes.

El segon limita quantes en pot arribar a controlar un jugador.

---

# 14. Control cap i territori

## D-121

**Estat:** FIXAT conceptualment

El `FLAG_CONTROL_CAP` podrà estar parcialment relacionat amb el territori controlat.

Principi:

> més domini territorial pot permetre mantenir més banderes.

Però existirà:

* sostre;
* progressió limitada;
* protecció contra creixement exponencial.

La fórmula és PENDENT.

---

# 15. Captura d'una UserFlag

## D-122

**Estat:** FIXAT

Quan un jugador captura una UserFlag rival:

```text
UserFlag rival
↓
CAPTURED
↓
passa a possessió de l'atacant
```

No queda necessàriament plantada al mateix lloc.

---

# 16. Transport d'una bandera capturada

## D-123

**Estat:** FIXAT

Per tornar a plantar la UserFlag capturada caldrà:

> una nova Activity física.

No es podrà traslladar simplement des del mapa.

---

# 17. Territori de replantació

## D-124

**Estat:** FIXAT

La UserFlag capturada podrà replantar-se en qualsevol ubicació vàlida dins territori propi.

---

# 18. Bandera capturada no replantada

## D-125

**Estat:** FIXAT conceptualment

Una UserFlag capturada només podrà romandre transportada durant un període limitat.

Si no es replanta a temps:

```text
capturada
↓
no replantada
↓
expira període
↓
bandera alliberada
↓
retorna a l'última ubicació on estava plantada
↓
OWNER = NONE
```

Queda amb defensa molt baixa i és fàcil de:

* recuperar;
* capturar.

El temps exacte és PENDENT.

---

# 19. Valor estratègic de robar una bandera

Això implica que una captura pot:

1. retirar una defensa del territori rival;
2. donar una bandera a l'atacant;
3. obligar l'antic propietari a recuperar-la;
4. generar una nova Activity per poder replantar-la.

Aquesta mecànica forma part intencionada del bucle de joc.

---

# 20. PublicFlagSite capturat

## D-126

**Estat:** FIXAT

Una PublicFlagSite funciona diferent.

En capturar-la:

```text
ubicació
→ no canvia

propietari
→ canvia
```

No es transporta.

---

# 21. Territori rival completament envoltat

## D-127

**Estat:** FIXAT

Territori rival completament aïllat no es captura automàticament.

Però podrà patir una penalització limitada:

* defensa inferior;
* decadència superior;
* menor capacitat de consolidació.

Encara requerirà activitat real per capturar-lo.

---

# 22. Territori propi aïllat

## D-128

**Estat:** FIXAT

Territori propi desconnectat:

* continua sent propi;
* no desapareix automàticament;
* té pitjor defensa/retenció que territori consolidat.

---

# 23. FlagDefense i TerritoryDefense

## D-129

**Estat:** PROVISIONAL ACCEPTAT

S'utilitzarà inicialment:

```text
FlagDefense pròpia
+
bonus territorial limitat
```

És a dir:

```text
EffectiveFlagDefense =
FlagDefense
+
TerritorySupport
```

amb:

```text
TerritorySupport <= límit
```

Això evita que:

* una bandera ignori completament el territori;
* un territori fort faci una bandera invencible.

Aquesta decisió s'haurà de validar especialment durant les fases de PvP.

---

# 24. Abandonar una UserFlag

## D-130

**Estat:** FIXAT

El propietari podrà abandonar voluntàriament una UserFlag remotament.

No requerirà tornar físicament al lloc.

Per evitar moviments constants:

```text
abandonar Flag
↓
cooldown
↓
recuperació del slot
```

El cooldown és PENDENT.

---

# 25. POI i Flag

## D-131

**Estat:** FIXAT

Un POI i una bandera són entitats independents.

Poden coexistir a la mateixa ubicació.

Exemple:

```text
🏔 Cim
📍 POI
🚩 Flag
```

---

# 26. Cims i Flag

## D-132

**Estat:** FIXAT

Es podrà plantar una UserFlag en un cim si:

* la ubicació és vàlida;
* és accessible legítimament;
* es compleixen les altres regles.

El cim continua sent independent.

---

# 27. KnowledgeRetention

## D-133

**Estat:** FIXAT

La informació territorial d'un jugador es refresca principalment per:

> la seva pròpia presència física.

L'activitat d'altres jugadors no actualitza automàticament el seu mapa.

---

# 28. Excepció: notificacions

## D-134

**Estat:** FIXAT

Alguns esdeveniments poden generar informació explícita:

```text
La teva bandera està sent atacada.
La teva bandera ha estat capturada.
```

Això no equival a refrescar tot el coneixement territorial de la zona.

---

# 29. Notificació immediata d'atac

## D-135

**Estat:** FIXAT

Quan un rival valida físicament l'atac contra una Flag:

> el propietari pot rebre una notificació immediata que la bandera està sent atacada.

Aquesta notificació forma part de l'emoció del joc.

No ha d'exposar:

* posició de l'atacant;
* track;
* ubicació en temps real.

---

# 30. Flag bloquejada durant atac actiu

## D-136

**Estat:** FIXAT

Una vegada l'atac arriba a l'estat vàlid:

```text
ATTACK IN PROGRESS
```

el propietari no podrà alterar l'estat de la Flag per evitar l'atac.

Queden bloquejades almenys:

* eliminació;
* abandonament;
* trasllat;
* substitució;
* accions defensives aplicades retroactivament a aquell atac.

Principi:

> una vegada el rival ha arribat i ha validat l'atac, la batalla ja està en curs.

---

# 31. Resolució posterior

## D-137

**Estat:** FIXAT

La notificació inicial no significa que la Flag ja hagi estat capturada.

El resultat només es determina quan:

```text
Activity rival finalitza
↓
Activity validada
↓
AttackPower calculada
↓
combat resolt
```

Llavors el propietari rep el resultat final.

---

# 32. Exemple

```text
11:04
⚠ La teva bandera està sent atacada.

No pots:
- retirar-la
- moure-la
- anul·lar l'atac

↓
l'atacant continua corrent

12:02
Activity completada

↓
validació

12:03
🚩 La bandera ha resistit.
```

o:

```text
🚩 La bandera ha estat capturada.
```

---

# 33. Importància alta

## D-138

**Estat:** FIXAT

Una Flag molt important podrà proporcionar:

* més XP;
* més Prestige;
* més notorietat;
* més valor en rànquings;
* més interès estratègic.

No tindrà necessàriament una gran multiplicació militar.

---

# 34. Tourism Discovery Access

## D-139

**Estat:** FIXAT

Es deixen oberts:

```text
B2B
+
B2C
```

amb preferència inicial d'exploració del model B2B.

---

# 35. Informació turística

## D-140

**Estat:** FIXAT

Tourism Discovery Access podrà revelar:

* POI;
* rutes;
* pistes;
* zones;
* contingut turístic.

No revelarà intel·ligència PvP privilegiada.

---

# 36. Territori durant viatges

## D-141

**Estat:** FIXAT

Territori aconseguit com a turista segueix exactament les mateixes regles generals.

No hi ha una categoria de territori turístic inferior.

La falta de presència posterior farà actuar:

* decadència;
* pèrdua de defensa;
* Fog.

---

# 37. Activitats importades

## D-142

**Estat:** FIXAT PROVISIONALMENT

Activitats provinents en el futur de:

* Garmin;
* Strava;
* FIT;
* GPX;
* altres fonts compatibles;

podran potencialment aportar:

* historial;
* XP;
* exploració.

No podran realitzar retroactivament:

* FlagAttack;
* FlagDefense.

Aquestes necessiten sessió en viu.

---

# 38. Defense visible

## D-143

**Estat:** FIXAT

Abans d'atacar no es mostrarà necessàriament:

```text
Defense = 67
```

Es mostrarà informació aproximada:

```text
BAIXA
MITJANA
ALTA
MOLT ALTA
```

o sistema equivalent.

---

# 39. Power durant l'activitat

## D-144

**Estat:** FIXAT

Es podrà mostrar una estimació aproximada de Power durant l'Activity.

No el valor exacte final.

El valor real es calcula després de completar i validar.

---

# 40. AttackFlag i territori

## D-145

**Estat:** FIXAT PROVISIONALMENT

Una Activity `ATTACK_FLAG` també podrà:

* explorar;
* conquerir territori neutral;
* exercir pressió territorial;

segons les regles normals.

Atacar la Flag no anul·la els altres efectes físics de la ruta.

---

# 41. Defensa passiva per activitat

## D-146

**Estat:** FIXAT

Passar legítimament per una Flag pròpia durant una Activity normal pot aportar:

* manteniment;
* petita recuperació;
* presència.

---

# 42. Defensa explícita

## D-147

**Estat:** FIXAT

Una Activity:

```text
DEFEND_FLAG
```

seleccionada explícitament abans de sortir proporcionarà el reforç defensiu principal.

---

# 43. Model resultant de banderes

El model queda conceptualment així:

```text
                    FLAGS
                      │
          ┌───────────┴────────────┐
          │                        │
   PublicFlagSite              UserFlag
          │                        │
    ubicació fixa             objecte mòbil
          │                        │
 canvia propietari        creador + propietaris
          │                        │
 mai es trasllada          UserFlagPlacement
                                   │
                            pot ser capturada
                                   │
                            transport temporal
                                   │
                              nova Activity
                                   │
                              nova ubicació
```

---

# 44. Principi resultant

Les dues mecàniques proporcionen objectius diferents:

## PublicFlagSite

> «Vull controlar aquest lloc.»

## UserFlag

> «Vull protegir aquesta bandera, robar la del rival i decidir on desplegar-la.»

Aquesta diferència es considera intencionada i forma part del disseny del joc.
