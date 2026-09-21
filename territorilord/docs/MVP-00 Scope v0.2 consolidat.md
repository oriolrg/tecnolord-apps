# TerritoriLord — MVP 00: Scope

**Versió:** v0.2 consolidada
**Estat:** scope funcional inicial
**Data:** 2026-09-18

---

# 1. Objectiu

El MVP ha de demostrar que el core loop de TerritoriLord:

* funciona tècnicament;
* és comprensible;
* genera curiositat;
* motiva noves activitats físiques.

No ha de demostrar tot el producte futur.

---

# 2. Hipòtesi principal

La pregunta central és:

> **Veure territori desconegut, descobrir una bandera i preparar una nova Activity per arribar-hi i atacar-la genera ganes de tornar a sortir?**

---

# 3. Core loop del MVP

```text
Activity
↓
Exploration
↓
Territory
↓
Flag detection
↓
Physical discovery
↓
plan new Activity
↓
Orientation
↓
Attack
↓
Activity completion
↓
Result
```

---

# 4. Principi de desenvolupament

Cada fase:

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

Pot quedar:

```text
ACCEPTED
ACCEPTED_WITH_CHANGES
REJECTED
```

---

# 5. Usuari

El MVP necessita:

* registre;
* login;
* email verificat;
* username públic;
* perfil mínim.

OAuth pot arribar després.

---

# 6. Activity

Cal poder:

* iniciar;
* enregistrar GPS;
* continuar sense cobertura;
* finalitzar;
* sincronitzar;
* visualitzar track.

Tipus inicials segons implementació progressiva.

L'arquitectura ha de suportar les modalitats definides.

---

# 7. Offline

L'Activity Recorder ha de funcionar:

```text
without continuous Internet
```

El mapa offline complet:

> no forma part obligatòria del primer MVP.

---

# 8. Validation Engine

Ha de validar almenys:

* timestamps;
* GPS jumps;
* accuracy;
* velocitats impossibles;
* continuïtat;
* circularity.

Ha de produir:

```text
ValidationCapabilities
```

---

# 9. Exploració

Ha de permetre:

* ExplorationCell;
* PhysicalDiscovery;
* historial permanent;
* Fog inicial.

No és necessari implementar inicialment tots els estats avançats.

---

# 10. Fog MVP

Inicialment pot utilitzar:

```text
UNKNOWN
DISCOVERED
```

i introduir:

```text
DETECTED
```

quan arribi la descoberta de Flags.

`STALE` i `HISTORICAL` poden arribar en fases posteriors.

---

# 11. Territori

Cal implementar:

* TerritoryCell;
* TerritoryOwnership;
* territori neutral;
* ruta circular;
* polígon;
* TerritoryBudget inicial;
* visualització.

Primer:

> territori neutral.

El PvP territorial arribarà després.

---

# 12. Regles experimentals

El MVP utilitzarà configuracions inicials per:

* H3;
* llindar de superfície;
* circularitat;
* TerritoryBudget.

No són constants definitives.

---

# 13. Banderes

El MVP ha de diferenciar des del principi:

```text
PublicFlagSite
UserFlag
```

---

# 14. PublicFlagSite MVP

Cal poder representar:

* ubicació fixa;
* neutral/owned;
* basic Defense;
* visibility policy;
* historial mínim.

---

# 15. UserFlag MVP

Cal poder representar:

* creator;
* owner;
* UserFlagPlacement;
* creation;
* own/neutral placement rule;
* captura;
* estat transportat;
* replantació;
* retorn neutral.

---

# 16. Visit

Una visita a una Flag:

```text
Visit ≠ Attack
```

Ha de poder servir per:

* descobrir;
* actualitzar informació.

---

# 17. Flag detection

Una Flag desconeguda pot aparèixer inicialment com:

```text
🚩 ?
```

sense informació completa.

---

# 18. Atac

Per atacar:

```text
select FlagTarget
before Activity
```

Una Activity:

```text
max 1 FlagTarget
```

---

# 19. Orientation

Ha de permetre:

* aproximar-se;
* buscar físicament;
* intentar confirmar ubicació.

---

# 20. AttackLocationAttempt

Ha de distingir:

```text
CONFIRMED
UNCERTAIN
INCORRECT
```

`UNCERTAIN` no penalitza.

---

# 21. ATTACK_IN_PROGRESS

Quan el servidor confirma la localització:

* crea l'estat d'atac;
* bloqueja accions incompatibles;
* pot notificar el defensor.

---

# 22. Connexió

Inicialment:

> començar formalment l'atac requereix connexió.

La resta de l'Activity continua amb filosofia offline-first.

---

# 23. Power

El MVP necessita una primera fórmula simple i versionada.

Conceptualment:

```text
PhysicalPower
+
ExplorationPower
+
DiscoveryPower
```

No és necessari equilibratge final.

---

# 24. Combat

Model mínim:

```text
ActivityPower
×
AttackEfficiency
=
EffectiveAttack
```

contra una `EffectiveFlagDefense`.

---

# 25. Resultats mínims

```text
DEFENDED
DAMAGED
CAPTURED
```

---

# 26. PublicFlagSite capture

La captura:

* canvia owner;
* no mou location.

---

# 27. UserFlag capture

La captura:

* desactiva l'antic placement;
* canvia owner;
* deixa la UserFlag transportada.

---

# 28. Replantació

Una UserFlag capturada necessita:

> una nova Activity física per replantar-se.

---

# 29. Defense

El vertical slice ha de permetre una defensa mínima posterior:

```text
DEFEND_FLAG
```

i un model bàsic de Defense.

L'equilibratge avançat pot arribar després.

---

# 30. Privacy baseline

Des de l'MVP:

* Activity privada per defecte;
* no exposar raw track públicament;
* protegir inici/final;
* username separat de dades privades;
* no mostrar ubicació live de rivals.

---

# 31. Anti-cheat mínim

Incloure:

* impossible speed;
* GPS jumps;
* poor accuracy for PvP;
* max one Flag attack;
* live attack requirement;
* verified email;
* basic rate limits.

No cal anti-cheat avançat.

---

# 32. Server authoritative

El client pot mostrar:

* previews;
* estimacions.

Però el servidor decideix:

* validation;
* territory;
* Power final;
* combat;
* capture.

---

# 33. Persistència del track

Inicialment:

* Raw GPS Samples;
* derived data separades;
* RulesVersion.

La política de retenció definitiva:

> queda pendent de dades reals d'emmagatzematge.

---

# 34. Fora del MVP

No són necessaris per validar el core:

* TourismCampaign;
* SponsoredPOI;
* SponsoredClaim;
* VisitorPass;
* monetització;
* CommunityPOI complet;
* clans;
* Seasons;
* social avançat;
* imported activities;
* mapes offline complets;
* anti-cheat avançat;
* rankings complexos.

---

# 35. Extensions conegudes

L'arquitectura no ha d'impedir posteriorment:

* Tourism;
* Sponsored experiences;
* native apps;
* imports;
* clans;
* Seasons;
* subscriptions.

No cal implementar-les ara.

---

# 36. Prova end-to-end principal

El MVP ha de permetre:

1. crear User;
2. iniciar Activity;
3. perdre cobertura i continuar;
4. finalitzar;
5. sincronitzar;
6. validar;
7. descobrir mapa;
8. aconseguir territori neutral;
9. detectar una Flag;
10. descobrir-la;
11. iniciar una nova Activity d'atac;
12. orientar-se;
13. obtenir `CONFIRMED`;
14. generar `ATTACK_IN_PROGRESS`;
15. continuar ruta;
16. completar Activity;
17. calcular Power;
18. resoldre combat;
19. mostrar resultat.

---

# 37. UserFlag scenario addicional

El MVP o immediatament després ha de poder demostrar:

```text
UserFlag captured
↓
TRANSPORTED
↓
new Activity
↓
REPLANTED
```

perquè és una diferència central respecte de PublicFlagSite.

---

# 38. Proves físiques obligatòries

Com a mínim:

* activitat real;
* activitat offline;
* circularitat;
* conquesta neutral;
* Flag discovery;
* orientation correct;
* orientation incorrect;
* poor GPS;
* attack notification;
* attack incomplete;
* combat;
* UserFlag capture;
* UserFlag replant;
* defense.

---

# 39. Experimentació

El MVP no busca tancar encara:

* H3 resolution;
* 75%;
* Flag radius;
* Power formula;
* Defense formula;
* decay;
* Flag limits.

S'utilitzarà `EXPERIMENTS-00`.

---

# 40. Criteri tècnic d'èxit

El sistema ha de completar el core loop sense:

* perdre Activities;
* duplicar sync;
* aplicar captures incorrectes;
* dependre de cobertura contínua.

---

# 41. Criteri de gameplay

L'usuari ha d'entendre:

* què ha fet;
* què ha guanyat;
* què ha fallat;
* per què.

---

# 42. Criteri de producte

La prova més important:

> **Després d'una Activity, el mapa genera una raó concreta per voler fer-ne una altra?**

---

# 43. Condició de no èxit

El MVP no es considerarà validat simplement perquè:

```text
tests pass
```

si els usuaris no mostren:

* curiositat;
* comprensió;
* voluntat de repetir.

---

# 44. Estat final esperat

En acabar el primer vertical slice haurem de saber si val la pena continuar construint:

* món persistent;
* PvP territorial;
* POI comunitari;
* turisme;
* monetització.

---

# 45. Principi final

> **L'MVP ha de demostrar una motivació física repetible, no una llista de funcionalitats.**
