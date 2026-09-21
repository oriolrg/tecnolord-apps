# TerritoriLord — MVP 00: Scope

**Estat:** proposta funcional v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu del MVP

El MVP no ha de demostrar totes les funcionalitats previstes de TerritoriLord.

Ha de demostrar que el bucle principal és:

* tècnicament viable;
* comprensible;
* divertit;
* motivador per sortir a fer activitat física.

El MVP ha de permetre comprovar físicament:

> **activitat → exploració → territori → descoberta de bandera → orientació → atac → resultat**

---

# 2. Pregunta que ha de respondre el MVP

Després de provar-lo diverses vegades, s'ha de poder respondre:

> «Veure territori desconegut, descobrir una bandera i preparar una nova activitat per atacar-la em genera ganes de tornar a sortir?»

Si la resposta és negativa, cal ajustar les regles abans d'afegir funcionalitats avançades.

---

# 3. Principi de desenvolupament

Cada fase ha de produir:

* funcionalitat executable;
* criteris d'acceptació;
* tests;
* prova manual;
* conclusió.

No es continuarà automàticament a la fase següent només perquè el codi estigui implementat.

Cada fase ha de poder quedar:

```text
ACCEPTED
ACCEPTED_WITH_CHANGES
REJECTED
```

---

# 4. MVP obligatori

El primer MVP ha de contenir:

## Usuari

* registre;
* login;
* email verificat;
* perfil mínim.

## Activitat

* iniciar;
* enregistrar GPS;
* finalitzar;
* track;
* distància;
* durada;
* desnivell bàsic;
* modalitat.

## Validació

* circularitat;
* velocitat impossible;
* salts GPS;
* accuracy;
* estat de validesa.

## Exploració

* cel·les descobertes;
* Fog of War;
* descobriment permanent;
* coneixement actual.

## Territori

* ruta circular;
* cel·les interiors;
* territori neutral;
* propietat;
* representació al mapa.

## Banderes

* crear bandera;
* límit de banderes;
* descobrir bandera;
* ocultació sota Fog;
* selecció com a objectiu.

## Atac

* una bandera per Activity;
* objectiu seleccionat abans de sortir;
* orientació;
* comprovació GPS;
* CONFIRMED / UNCERTAIN / INCORRECT;
* AttackEfficiency;
* resolució després de completar Activity.

## Defensa

* defensa bàsica;
* reducció per atac;
* captura.

---

# 5. Fora del primer MVP

No són necessaris inicialment:

* monetització;
* clans;
* equips;
* xat;
* seguidors;
* imports Garmin/Strava;
* POI comunitaris complets;
* Reputation avançada;
* moderació avançada;
* rànquings complexos;
* temporades;
* quests;
* achievements extensos;
* models avançats anti-cheat;
* IA;
* fotografia social;
* notificacions sofisticades.

---

# 6. POI en MVP

Es poden mantenir POI simples del sistema per comprovar exploració.

No cal encara:

* creació comunitària completa;
* denúncies;
* reputació;
* moderació.

---

# 7. Power MVP

La primera fórmula ha de ser deliberadament simple.

Ha de permetre experimentar amb:

* distància;
* desnivell;
* exploració nova.

No intentar resoldre l'equilibratge definitiu.

---

# 8. Combat MVP

El model inicial pot ser:

```text
ActivityPower
× AttackEfficiency
=
EffectiveAttack
```

comparat amb:

```text
FlagDefense
```

La fórmula serà versionada i reemplaçable.

---

# 9. Fog MVP

Inicialment:

```text
UNKNOWN
DISCOVERED
STALE
```

pot ser suficient.

`DETECTED` i `HISTORICAL` es poden introduir progressivament.

---

# 10. Validació d'èxit

El MVP es considerarà validat si permet:

1. sortir amb el mòbil;
2. enregistrar una Activity real;
3. tornar aproximadament al punt inicial;
4. veure la ruta;
5. descobrir mapa;
6. obtenir territori;
7. descobrir una Flag;
8. preparar una nova activitat;
9. buscar la Flag físicament;
10. intentar localitzar-la;
11. completar la ruta;
12. resoldre l'atac;
13. veure el nou estat territorial.

---

# 11. Prova real

El MVP no queda validat només amb tests automatitzats.

Caldrà realitzar activitats reals.

Com a mínim:

```text
Exploració
Conquesta neutral
Descoberta de Flag
Atac correcte
Atac amb error de localització
Atac insuficient
Captura
Defensa
```

---

# 12. Resultat esperat

En finalitzar l'MVP haurem de saber si les mecàniques centrals funcionen abans d'invertir en les capes socials i comercials del producte.
