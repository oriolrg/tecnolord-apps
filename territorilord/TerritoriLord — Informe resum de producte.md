# TerritoriLord — Informe resum de producte

**Estat del projecte:** disseny funcional avançat, previ a especificació tècnica
**Nom provisional:** TerritoriLord
**Data:** 18 de setembre de 2026

---

# 1. Resum executiu

TerritoriLord és una aplicació esportiva i geogràfica que converteix el territori real en un espai de joc.

L'usuari surt a córrer, caminar, fer trail, senderisme, ciclisme o MTB i, a través de la seva activitat física, pot:

* explorar zones noves;
* descobrir camins, cims i punts d'interès;
* revelar un mapa inicialment parcialment ocult;
* conquerir territori mitjançant recorreguts circulars;
* crear i controlar banderes;
* atacar i defensar punts estratègics;
* competir amb altres jugadors;
* construir un historial permanent dels llocs que ha conegut.

La idea central és que el joc no substitueixi l'activitat física, sinó que li doni un motiu.

> **“Avui sortiré per aquí perquè vull descobrir, conquerir, defensar o recuperar alguna cosa.”**

TerritoriLord combina conceptes d'aplicacions esportives, exploració geogràfica, orientació i joc territorial persistent.

---

# 2. Problema que vol resoldre

Moltes aplicacions esportives permeten registrar:

* quilòmetres;
* temps;
* velocitat;
* desnivell;
* rècords.

Aquestes mètriques són útils, però sovint no donen resposta a una pregunta important:

> **Per què sortir avui i per què anar precisament cap allà?**

TerritoriLord introdueix objectius geogràfics persistents que converteixen l'entorn en una font contínua de motivació.

En lloc de repetir sempre la mateixa ruta:

> «Avui haig de fer 10 km.»

el jugador pot pensar:

> «Hi ha una zona que encara no he descobert.»

> «Han atacat una de les meves banderes.»

> «Vull recuperar aquell coll.»

> «He detectat alguna cosa al mapa que encara no sé què és.»

---

# 3. Proposta de valor

TerritoriLord busca unir quatre motivacions diferents.

## Explorar

Descobrir nous camins, zones, cims i punts d'interès.

## Conquerir

Convertir recorreguts circulars reals en territori controlat.

## Competir

Disputar banderes, fronteres i zones amb altres jugadors.

## Construir

Crear una empremta personal permanent sobre el mapa:

* territori descobert;
* banderes;
* POI;
* cims;
* conquestes;
* historial.

Aquesta combinació permet que el producte sigui interessant tant per a usuaris competitius com per a persones que simplement volen explorar.

---

# 4. El món físic és el tauler de joc

TerritoriLord parteix d'una regla fonamental:

> **Les accions importants del joc han de requerir activitat física real.**

No es vol construir un joc digital al qual s'afegeixi GPS.

El propi territori és el joc.

Per progressar caldrà:

* caminar;
* córrer;
* pedalar;
* explorar;
* arribar físicament als punts;
* completar recorreguts.

La geolocalització no és una funció secundària, sinó el centre del producte.

---

# 5. Tipus d'activitat

El sistema està plantejat per diferenciar diverses modalitats:

* running;
* trail running;
* walking;
* hiking;
* cycling;
* MTB.

No es pretén que 10 km tinguin automàticament el mateix valor en totes les modalitats.

El sistema podrà valorar de manera diferenciada:

* distància;
* durada;
* desnivell;
* esforç;
* exploració;
* tipus d'activitat.

Això permet que diferents perfils esportius puguin participar sense reduir-ho tot a quilòmetres acumulats.

---

# 6. Conquesta territorial

Una de les mecàniques centrals consisteix a completar recorreguts aproximadament circulars.

La ruta genera una geometria tancada i les zones que queden dins poden convertir-se en territori del jugador.

Exemple conceptual:

```text
        ruta
     ╭────────╮
   ╱            ╲
  │  TERRITORI   │
   ╲            ╱
     ╰────────╯
```

El territori es representarà internament mitjançant cel·les geogràfiques.

Actualment es planteja utilitzar H3, amb resolucions diferents per a:

* exploració;
* control territorial.

Això permet gestionar millor:

* propietat;
* fronteres;
* defensa;
* solapaments;
* historial;
* Fog of War.

---

# 7. Fog of War

Una de les mecàniques diferencials del producte és el mapa parcialment desconegut.

El principi és:

> **El mapa ha de donar prou informació per despertar curiositat, però no tanta com per eliminar la necessitat d'explorar físicament.**

Una zona pot passar per estats conceptuals com:

```text
UNKNOWN
DETECTED
DISCOVERED
STALE
HISTORICAL
```

Quan una zona no s'ha visitat, el jugador no veu tota la informació.

Però el mapa pot mostrar pistes:

```text
🚩 ?
🏔 ?
★ ?
```

Això genera un objectiu:

> «Hi ha alguna cosa allà. Vull descobrir què és.»

---

# 8. Exploració permanent i informació temporal

TerritoriLord diferencia dos conceptes.

## Historial d'exploració

És permanent.

Si el jugador ha estat en una zona, sempre quedarà constància que l'ha explorada.

Això permet crear un mapa personal de:

* zones visitades;
* viatges;
* vacances;
* cims;
* POI;
* regions;
* municipis.

## Coneixement territorial

És temporal.

Si el jugador deixa de visitar una zona, la informació es va degradant.

Pot deixar de saber:

* qui controla el territori;
* quines banderes hi ha;
* l'estat de les defenses;
* quins POI nous han aparegut.

Això provoca una nova motivació:

> tornar a un lloc conegut per actualitzar el mapa.

---

# 9. Domini i coneixement

La velocitat amb què torna el Fog no dependrà només del temps.

També dependrà de la relació actual del jugador amb aquella zona.

La informació es conserva millor quan existeixen:

* territori propi;
* banderes;
* activitat recent;
* POI relacionats;
* presència habitual.

Quan es perd:

* territori;
* banderes;
* activitat;

el coneixement es degrada més ràpidament.

Això crea una relació natural:

```text
ACTIVITAT
   ↓
PRESÈNCIA
   ↓
DOMINI
   ↓
CONEIXEMENT
```

---

# 10. Banderes

TerritoriLord planteja dues tipologies de bandera.

## PublicFlagSite

Són punts geogràfics permanents.

Poden correspondre a:

* llocs emblemàtics;
* punts estratègics;
* elements públics;
* contingut turístic.

Característiques:

* no es mouen;
* poden canviar de propietari;
* conserven historial;
* poden acumular prestigi;
* poden generar rivalitats.

Exemple:

```text
🚩 Coll del Port

Propietaris:
Marc
→ Anna
→ Oriol
→ Marc
```

## UserFlag

Són banderes creades pels jugadors.

Característiques:

* es planten físicament;
* es poden capturar;
* es poden transportar;
* poden replantar-se en una altra zona;
* conserven historial i prestigi.

Això crea una segona mecànica:

> no només es disputa un lloc, també es poden robar i redistribuir recursos territorials.

---

# 11. Valor de les banderes

No es vol utilitzar un únic valor.

Cada bandera pot tenir conceptes diferents.

## Importància

Mesura com de rellevant és aquell lloc per a la comunitat.

Pot augmentar quan:

* hi passen diferents jugadors;
* existeix activitat recurrent;
* el punt és realment utilitzat.

## Defensa

Mesura com de difícil és capturar-la en aquell moment.

## Prestigi

Reflecteix la seva història:

* antiguitat;
* captures;
* reconquestes;
* rivalitats;
* visites.

Una bandera molt important no serà automàticament invencible.

---

# 12. Visitar no és atacar

Un jugador pot passar per una bandera sense iniciar combat.

Això pot:

* descobrir-la;
* actualitzar informació;
* generar experiència;
* augmentar-ne la importància;
* validar que el punt és realment accessible.

L'atac és una acció explícita.

---

# 13. Atac a una bandera

L'atac està plantejat com una petita prova d'orientació.

Abans de començar l'activitat, el jugador selecciona una bandera concreta.

Només es podrà atacar una bandera per activitat.

Flux:

```text
seleccionar objectiu
        ↓
iniciar Activity
        ↓
anar fins a la zona
        ↓
orientar-se
        ↓
localitzar físicament la bandera
        ↓
prémer ATACAR
        ↓
validar GPS
        ↓
continuar la ruta
        ↓
tornar aproximadament al punt inicial
        ↓
validar Activity
        ↓
resoldre combat
```

---

# 14. Orientació

L'aplicació no haurà de portar necessàriament el jugador exactament fins al punt.

Pot mostrar:

* una zona aproximada;
* indicis;
* proximitat;
* distància aproximada.

L'objectiu és introduir una mecànica similar a una cursa d'orientació amb un únic control.

---

# 15. Errors d'orientació

Quan el jugador creu haver trobat la bandera, l'app comprova:

* distància;
* coordenades;
* `accuracy`;
* coherència de les lectures.

Hi ha tres casos:

## CONFIRMED

La posició és compatible.

## UNCERTAIN

La precisió GPS és insuficient.

No penalitza.

## INCORRECT

La posició és clarament incorrecta.

Redueix l'eficiència de l'atac.

Això permet premiar també la qualitat de l'orientació.

---

# 16. Potència de l'activitat

Una activitat genera una quantitat de Power.

Conceptualment pot provenir de:

```text
PhysicalPower
+
ExplorationPower
+
DiscoveryPower
```

Tenint en compte factors com:

* distància;
* desnivell;
* durada;
* modalitat;
* territori nou;
* cims;
* POI;
* descobriments.

La Power no s'acumula indefinidament durant mesos.

Pertany principalment a aquella activitat.

---

# 17. Combat

Conceptualment:

```text
ActivityPower
×
AttackEfficiency
=
EffectiveAttack
```

que es compara amb la defensa de la bandera.

Possibles resultats:

```text
DEFENDED
DAMAGED
CAPTURED
```

Un atac pot debilitar una bandera sense capturar-la.

Per tant, una zona molt defensada pot requerir diverses activitats de diversos dies.

---

# 18. Defensa

El propietari també pot sortir a defensar.

Una activitat pot marcar-se prèviament com:

```text
DEFEND_FLAG
```

i reforçar una bandera pròpia.

Les activitats normals que passen per una bandera pròpia poden donar manteniment menor.

Això provoca una mecànica especialment important:

> el joc pot donar-te un motiu real per decidir la ruta de la teva propera sortida.

---

# 19. Defensa limitada i decadència

Cap jugador ha de poder convertir-se en invencible.

Per això:

* Defense té sostre;
* hi ha rendiments decreixents;
* el territori abandonat es debilita;
* les banderes abandonades perden defensa.

Un jugador molt actiu pot mantenir un territori fort.

Però no eternament.

---

# 20. Local versus turista

TerritoriLord està pensat perquè tots dos perfils tinguin incentius diferents.

## Jugador local

Té avantatge natural per:

* constància;
* coneixement;
* defensa;
* rivalitats;
* presència.

## Visitant

Té oportunitats de:

* territori nou;
* exploració;
* cims;
* POI;
* descobriments;
* historial de viatge.

No existeix una penalització artificial pel fet de ser turista.

---

# 21. POI i cims

El món pot contenir punts d'interès:

* fonts;
* miradors;
* refugis;
* patrimoni;
* elements naturals;
* cims;
* altres punts útils.

Els usuaris podran, en fases posteriors, proposar POI comunitaris.

Altres jugadors els podran:

* visitar;
* confirmar;
* valorar;
* denunciar.

La utilitat real del POI tindrà més valor que simplement haver-lo creat.

---

# 22. Moderació comunitària

Els POI podran denunciar-se per motius com:

* no existeix;
* és duplicat;
* propietat privada;
* ubicació incorrecta;
* accés perillós;
* contingut inadequat.

Les denúncies no implicaran eliminació automàtica.

L'objectiu és evitar tant contingut fals com denúncies utilitzades per perjudicar rivals.

---

# 23. Turisme com a línia de producte

TerritoriLord deixa preparada una línia específica de monetització turística.

Una destinació podrà utilitzar el joc per fomentar la descoberta del territori.

Exemple:

> **Descobreix 8 indrets del municipi.**

Es podrien crear:

* rutes;
* POI oficials;
* col·leccions;
* reptes;
* zones promocionades;
* campanyes temporals.

---

# 24. Discovery Access

Un organisme turístic o usuari pot disposar d'accés parcial al contingut ocult pel Fog.

Per exemple:

```text
🏔 ?
💧 ?
★ ?
```

El sistema pot mostrar pistes de llocs interessants sense considerar-los físicament descoberts.

La regla és:

```text
DiscoveryAccess
!=
PhysicalDiscovery
```

Només anar realment al lloc converteix aquella informació en exploració permanent.

---

# 25. POI patrocinats

Un organisme o establiment podrà disposar en el futur d'un POI patrocinat.

Aquest contingut estarà clarament identificat.

Pot proporcionar una recompensa superior en:

* XP;
* progressió turística;
* achievements;
* col·leccions.

No proporcionarà una superioritat PvP directa.

---

# 26. QR + geolocalització

Una de les mecàniques comercials plantejades és validar una visita mitjançant QR.

Exemple:

```text
arribo al comerç / mirador / museu
          ↓
escanejo QR
          ↓
servidor valida el QR
          +
servidor comprova GPS
          ↓
recompensa
```

Compartir una fotografia del QR no és suficient.

El servidor comprovarà:

* campanya;
* usuari;
* ubicació;
* radi admès;
* reutilització;
* estat del QR.

Això permet experiències de promoció local físicament verificades.

---

# 27. Models comercials futurs

TerritoriLord pot arribar a monetitzar per diferents vies.

## B2G / B2B

Administracions, destinacions o empreses poden contractar:

* TourismCampaign;
* SponsoredDiscoveryZone;
* SponsoredPOI;
* rutes;
* reptes;
* col·leccions;
* analítica agregada.

## B2C

L'usuari podria adquirir:

* Visitor Pass;
* analítica avançada;
* personalització;
* planificació;
* mapes avançats.

---

# 28. No pay-to-win

Principi comercial:

> **Pagar pot enriquir l'experiència, però no comprar la victòria.**

No es vol vendre:

* AttackPower;
* Defense;
* captures;
* territori;
* invulnerabilitat.

---

# 29. Progressió

S'han separat diversos conceptes.

## XP

Progrés permanent.

## Level

Experiència general dins del sistema.

## Prestige

Reconeixement per trajectòria, conquestes, exploració i rivalitats.

## Reputation

Confiança comunitària associada especialment a:

* POI;
* validacions;
* denúncies;
* contribucions.

La reputació no dona superioritat directa en combat.

---

# 30. Perdre no esborra el progrés

El joc diferencia:

## Progrés permanent

* XP;
* historial;
* exploració;
* cims;
* achievements;
* Prestige històric.

## Estat actual

* territori;
* banderes;
* defensa;
* Fog;
* domini.

Així una derrota territorial no significa perdre mesos de progrés personal.

---

# 31. Privacitat

TerritoriLord tracta els tracks GPS com informació sensible.

Principis inicials:

* activitat privada per defecte;
* inici/final no públics;
* efectes territorials separats del track;
* no exposar ubicació actual;
* no mostrar email ni dades personals als rivals.

Es podrà saber:

> «Aquest territori ha estat capturat.»

sense haver de saber:

> «Aquesta persona va sortir de casa a les 7:32.»

---

# 32. Anti-cheat

El producte haurà de controlar:

* GPS spoofing;
* vehicles declarats com running;
* salts GPS;
* comptes múltiples;
* farming;
* POI falsos;
* captures pactades.

Però amb un principi:

> una anomalia no implica automàticament frau.

Els errors normals del GPS s'han de diferenciar de manipulacions deliberades.

---

# 33. Arquitectura inicial prevista

La primera arquitectura plantejada és:

```text
PWA
  ↓
API pròpia
  ↓
PostgreSQL + PostGIS + H3
```

Amb:

* MapLibre per al mapa;
* backend autoritatiu;
* recorder GPS offline-first;
* sincronització local-first;
* sincronització per blocs;
* monorepo;
* separació de domini, geografia i contractes.

---

# 34. Offline

Una activitat esportiva haurà de poder continuar sense cobertura.

Flux:

```text
GPS
↓
persistència local
↓
sincronització quan hi hagi xarxa
```

Això és especialment important en muntanya.

Els mapes completament offline poden arribar en una fase posterior.

---

# 35. PvP i connexió

Inicialment, iniciar formalment un atac requerirà connexió.

Això permet al backend:

* validar la bandera;
* bloquejar-la;
* comprovar l'estat actual;
* notificar el propietari.

Una vegada iniciat, l'activitat pot continuar amb la filosofia offline-first.

Aquesta limitació s'haurà de provar en zones de baixa cobertura.

---

# 36. Desenvolupament per fases

TerritoriLord no es desenvoluparà tot de cop.

Cada fase seguirà:

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

I podrà quedar:

```text
ACCEPTED
ACCEPTED_WITH_CHANGES
REJECTED
```

---

# 37. Principals fases

## Bloc A — Motor outdoor

* skeleton;
* Activity Recorder;
* validation;
* mapa;
* Fog.

## Bloc B — Joc individual

* territori neutral;
* banderes;
* descoberta;
* orientació;
* Power.

## Bloc C — PvP

* atac;
* defensa;
* territori rival;
* decadència;
* Fog avançat.

## Bloc D — Món persistent

* POI;
* cims;
* comunitat;
* progressió;
* rànquings;
* turisme;
* monetització.

---

# 38. Primer vertical slice

La primera fita realment important permetrà:

```text
surto
↓
exploro
↓
descobreixo una bandera
↓
torno un altre dia
↓
m'oriento
↓
intento atacar-la
↓
completo la ruta
↓
guanyo o fallo
```

Aquest vertical slice servirà per determinar si el nucli és realment divertit abans d'invertir en capes socials o comercials complexes.

---

# 39. Decisions deliberadament no tancades

Alguns valors no s'han volgut inventar abans de disposar de proves reals.

Entre altres:

* resolució exacta H3;
* radi de circularitat;
* distància exacta d'interacció amb bandera;
* fórmula de Power;
* fórmula de Defense;
* decadència;
* TerritoryBudget;
* nombre final de banderes;
* intervals exactes del Fog.

Aquests paràmetres es determinaran experimentalment.

---

# 40. Principals riscos a validar

## GPS i PWA

Cal comprovar el comportament real de l'enregistrament:

* background;
* pantalla bloquejada;
* consum de bateria.

## Cobertura en PvP

L'atac necessita inicialment connexió en el punt de la bandera.

Cal validar si és acceptable en entorns remots.

## Equilibri territorial

S'haurà de comprovar que:

* conquistar no sigui trivial;
* defensar no faci invencible;
* repetir rutes no permeti farming.

## Densitat

Caldrà trobar resolucions territorials adequades per:

* ciutat;
* muntanya;
* zones poc poblades.

---

# 41. Oportunitats

TerritoriLord pot evolucionar en diferents direccions sense canviar el seu nucli:

* aplicació esportiva;
* joc territorial;
* orientació;
* turisme actiu;
* descoberta patrimonial;
* promoció de territori;
* reptes municipals;
* comerç local;
* clubs;
* esdeveniments;
* rànquings.

Aquesta flexibilitat és possible perquè totes aquestes capes parteixen d'un mateix element:

> **la presència física de l'usuari al territori.**

---

# 42. Estat actual

El projecte no està encara en fase d'implementació funcional.

S'ha completat una primera etapa de:

* disseny de producte;
* model de domini;
* regles de joc;
* exploració;
* combat;
* progressió;
* seguretat;
* monetització futura;
* MVP;
* desenvolupament per fases;
* arquitectura inicial.

El següent pas previst és una revisió transversal externa del disseny abans de començar les especificacions tècniques.

---

# 43. Visió final

TerritoriLord pretén que el mapa deixi de ser simplement una representació del lloc on entrenes.

El mapa es converteix en:

* història personal;
* territori;
* objectiu;
* rivalitat;
* exploració;
* descoberta.

L'èxit del producte no s'hauria de mesurar només en hores dins de l'aplicació.

Al contrari.

Una de les millors mètriques seria que TerritoriLord aconsegueixi que una persona tanqui el mòbil, es calci les sabatilles i pensi:

> **«Vaig a veure què hi ha allà.»**
