# TerritoriLord — Development Phases 00

**Estat:** proposta de desenvolupament v0.1
**Data:** 2026-09-18

---

# 1. Filosofia

TerritoriLord es desenvoluparà incrementalment.

Cada fase:

```text
SPEC
↓
PLAN
↓
TASKS petites
↓
IMPLEMENTACIÓ
↓
TESTS
↓
PROVA REAL
↓
DECISIÓ
```

Només després:

```text
SEGÜENT FASE
```

---

# 2. Regla de validació

Una fase no es considera acabada perquè:

> «el codi funciona.»

Ha de complir:

* tests automatitzats;
* criteris funcionals;
* prova manual;
* quan correspongui, prova física outdoor.

---

# FASE 0 — Skeleton del projecte

## Objectiu

Tenir TerritoriLord executable localment.

## Inclou

* estructura repositori;
* frontend;
* backend;
* base de dades;
* entorn local;
* tests;
* configuració;
* health checks.

## No inclou

Cap mecànica real de joc.

## Gate

```text
app arrenca
backend respon
DB funciona
tests passen
```

---

# FASE 1 — Activity Recorder

## Objectiu

Enregistrar correctament una activitat real.

## Inclou

* iniciar Activity;
* GPS;
* mostres;
* accuracy;
* timestamps;
* modalitat;
* finalitzar;
* track al mapa;
* distància;
* durada.

## Prova real

Sortir físicament i enregistrar diverses activitats.

## Gate

El track ha de representar adequadament el recorregut real.

---

# FASE 2 — Validation Engine

## Objectiu

Decidir què pot fer cada Activity dins del joc.

## Inclou

* circularitat;
* velocitats;
* GPS jumps;
* accuracy;
* gaps;
* `ValidationCapabilities`.

Exemple:

```text
CAN_EXPLORE
CAN_CAPTURE_TERRITORY
CAN_ATTACK_FLAG
```

## Proves

* activitat correcta;
* activitat no circular;
* GPS pobre;
* salt artificial;
* activitat massa curta.

## Gate

No continuar fins que les decisions siguin explicables i consistents.

---

# FASE 3 — Mapa i Fog of War

## Objectiu

Introduir el primer bucle motivacional.

## Inclou

* mapa;
* cel·les d'exploració;
* UNKNOWN;
* DISCOVERED;
* historial;
* descoberta al voltant del track.

## Prova real

Fer una ruta nova i veure com el mapa es revela físicament.

## Pregunta de validació

> «Em genera curiositat veure què em falta descobrir?»

---

# FASE 4 — Conquesta de territori neutral

## Objectiu

Convertir una ruta circular en territori propi.

## Inclou

* geometria tancada;
* TerritoryCell;
* TerritoryOwnership;
* TerritoryBudget inicial;
* representació visual.

Inicialment:

* només territori neutral;
* sense PvP.

## Prova real

Crear diferents circuits.

Comparar:

* circuit petit;
* circuit gran;
* circuit irregular;
* rutes solapades.

## Gate

La conquesta ha de resultar intuïtiva.

---

# FASE 5 — Banderes bàsiques

## Objectiu

Introduir objectius físics persistents.

## Inclou

* crear Flag;
* haver estat físicament al lloc;
* posició;
* límit inicial;
* propietari;
* defensa;
* visualització.

Encara sense combat.

## Prova real

Crear diverses banderes i comprovar si les ubicacions resulten interessants.

---

# FASE 6 — Fog + descoberta de banderes

## Objectiu

Fer que les banderes generin exploració.

## Inclou

* Flag amagada sota Fog;
* senyal aproximat;
* descoberta física;
* informació desbloquejada.

Flux:

```text
🚩 ?
↓
explorar
↓
🚩 descoberta
```

## Prova real

Crear prèviament una Flag i intentar descobrir-la com ho faria un jugador que no coneix la ubicació exacta.

## Gate

La pista ha de motivar sense revelar massa.

---

# FASE 7 — Orientació d'atac

## Objectiu

Construir el minijoc d'orientació.

## Inclou

* seleccionar Flag abans de sortir;
* AttackTarget;
* proximitat aproximada;
* botó ATACAR;
* mostres GPS;
* accuracy;
* CONFIRMED;
* UNCERTAIN;
* INCORRECT;
* AttackEfficiency.

Encara no cal captura completa.

## Proves físiques

Fer intents:

* exactes;
* a 10 m;
* a 20 m;
* a 50 m;
* amb GPS pobre.

## Gate

La mecànica ha de ser difícil però justa.

---

# FASE 8 — Power

## Objectiu

Convertir l'activitat en capacitat de joc.

## Primera versió

```text
PhysicalPower
+
ElevationPower
+
ExplorationPower
=
ActivityPower
```

## Inclou

* breakdown;
* RulesVersion;
* rendiments inicials;
* visualització postactivitat.

## Gate

Diferents activitats reals han de generar resultats raonables.

No cal equilibri definitiu.

---

# FASE 9 — Combat de banderes

## Objectiu

Completar el bucle PvP principal.

## Inclou

```text
ActivityPower
× AttackEfficiency
=
EffectiveAttack
```

contra:

```text
FlagDefense
```

Resultats:

```text
DEFENDED
DAMAGED
CAPTURED
```

## Prova real

Simular dos usuaris.

Fer:

* atac feble;
* atac fort;
* diversos atacs;
* captura.

## Gate

El combat ha de generar ganes de tornar-hi.

---

# FASE 10 — Defensa

## Objectiu

Permetre resposta del propietari.

## Inclou

* seleccionar Flag pròpia;
* Activity defensiva;
* visita física;
* DefensePower;
* límits;
* sostre.

## Prova

```text
atac
↓
bandera debilitada
↓
propietari surt
↓
defensa
↓
nou atac
```

---

# FASE 11 — Territori rival

## Objectiu

Introduir guerra territorial.

## Inclou

* TerritoryDefense;
* TerritoryPressure;
* conquest gradual;
* territori rival;
* fronteres inicials.

Les banderes ja poden influir limitadament en defensa.

## Gate

Evitar:

* captures massives;
* territoris invencibles.

---

# FASE 12 — Decadència i presència

## Objectiu

Fer que el món evolucioni encara que els jugadors desapareguin.

## Inclou

* Defense decay;
* Territory decay;
* KnowledgeRetention;
* presència territorial.

Relació:

```text
ACTIVITY ↓
DOMAIN ↓
KNOWLEDGE ↓
FOG ↑
```

## Prova

Inicialment es farà accelerant artificialment el temps en entorn de test.

---

# FASE 13 — Fog avançat

## Inclou

```text
UNKNOWN
DETECTED
DISCOVERED
STALE
HISTORICAL
```

També:

* senyals;
* importància;
* zones antigues;
* banderes conegudes però desactualitzades;
* retenció segons domini.

---

# FASE 14 — POI i cims

## Objectiu

Ampliar l'exploració no competitiva.

## Inclou

* Summit;
* POI;
* descoberta;
* visites;
* recompensa;
* Fog.

Primer amb dades controlades.

No encara comunitaris.

---

# FASE 15 — POI comunitaris

## Inclou

* crear POI;
* validació;
* visites;
* denúncies;
* estats;
* moderació mínima.

---

# FASE 16 — Progressió

## Inclou

* XP;
* Level;
* Achievement inicial;
* Prestige;
* límit progressiu de Flags.

Sense avantatge PvP fort.

---

# FASE 17 — Rivalitats i rànquings

## Inclou

* historial de captures;
* rivals recurrents;
* estadístiques;
* rànquings temporals;
* rànquings territorials i exploratoris separats.

---

# FASE 18 — Anti-cheat avançat

Només quan existeixi informació real suficient.

## Pot incloure

* patrons;
* múltiples comptes;
* activity similarity;
* capture trading;
* TrustWeight;
* FraudScore.

No construir algoritmes complexos sense dades.

---

# FASE 19 — Social i notificacions

Possibles funcionalitats:

* perfil;
* rivalitats;
* alertes;
* banderes atacades;
* defenses baixes.

Sense exposar ubicació en temps real.

---

# FASE 20 — Monetització preparada

Només quan el producte principal funcioni.

## Inclou

* Subscription;
* Entitlement;
* feature flags.

Possibles funcionalitats:

* estadístiques avançades;
* personalització;
* mapes;
* planificació;
* clubs.

Mai:

```text
PAY → POWER
```

---

# 3. Fases agrupades

Es poden veure com quatre grans blocs.

## Bloc A — Motor outdoor

```text
F0–F3
```

Resultat:

> tenim una app GPS amb exploració.

## Bloc B — Joc individual

```text
F4–F8
```

Resultat:

> puc explorar, conquerir, descobrir una bandera i orientar-me.

## Bloc C — PvP

```text
F9–F13
```

Resultat:

> puc atacar, defensar i disputar territori.

## Bloc D — Món persistent

```text
F14+
```

Resultat:

> POI, comunitat, progressió, rivalitats i futura monetització.

---

# 4. Primera gran fita

La primera versió realment interessant serà després de:

```text
FASE 9
```

Perquè ja podrem fer:

```text
surto
↓
exploro
↓
descobreixo bandera
↓
torno un altre dia
↓
m'oriento
↓
ataco
↓
capturo o fallo
```

Aquest és el primer vertical slice complet de TerritoriLord.

---

# 5. Revisió obligatòria

En acabar les fases:

```text
3
6
9
13
```

es farà una revisió funcional general.

Preguntes:

* continua sent divertit?
* estem incentivant sortir?
* hi ha mecàniques sobrants?
* apareixen exploits?
* és comprensible?
* cal canviar les regles abans de seguir?

---

# 6. Principi de desenvolupament final

> **No construir la següent capa fins haver jugat amb l'anterior.**

TerritoriLord depèn massa del comportament real al carrer perquè pugui dissenyar-se completament només des del codi o des de documents.
