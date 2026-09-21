# TerritoriLord — Com es juga?

**Versió:** v0.1
**Estat:** primera versió orientada a l'usuari
**Data:** 2026-09-18

---

# El territori és el joc

TerritoriLord converteix les teves activitats reals en un món persistent d'exploració, territori i rivalitat.

Camina. Corre. Pedala.

Explora llocs nous, descobreix què amaga el mapa, conquista territori i disputa banderes amb altres jugadors.

> **El món ja existeix. El que encara no existeix és el teu mapa.**

---

# 1. Surt a explorar

Quan comences, no coneixes tot el que existeix al teu voltant.

Algunes zones del mapa estan cobertes pel **Fog of War**.

Pots veure pistes com:

```text
🚩 ?
🏔 ?
★ ?
```

Saps que hi ha alguna cosa interessant.

Per saber exactament què és:

> hauràs d'anar-hi.

---

# 2. Inicia una activitat

Escull com sortiràs:

* running;
* trail running;
* walking;
* hiking;
* cycling;
* MTB.

Prem:

> **INICIAR ACTIVITAT**

TerritoriLord enregistrarà el teu recorregut mentre et mous.

Si perds la cobertura, pots continuar l'activitat.

---

# 3. Descobreix el mapa

Quan passes físicament per una zona nova:

> la descobreixes.

Aquell lloc passa a formar part del teu historial.

TerritoriLord recordarà que hi has estat.

Però el món continua canviant.

Amb el temps, la informació que tens sobre una zona pot quedar antiga i donar-te una nova raó per tornar-hi.

---

# 4. Conquista territori

Les activitats que formen aproximadament un circuit poden tenir efectes territorials.

```text
surts
↓
recorres una zona
↓
tornes prop de l'inici
↓
completes el circuit
↓
conquistes territori
```

No n'hi ha prou amb dibuixar qualsevol forma.

TerritoriLord comprova que l'activitat sigui real i coherent.

---

# 5. El territori neutral és el més fàcil

Si recorres una zona sense propietari:

> pots incorporar part d'aquell territori al teu domini.

Si el territori ja és d'un rival, conquistar-lo serà més difícil.

Pot necessitar diverses activitats.

---

# 6. Descobreix banderes

Les banderes són punts especials del mapa.

Una bandera desconeguda pot aparèixer simplement com:

```text
🚩 ?
```

Explora aquella zona i podràs descobrir:

* quin lloc és;
* quin jugador la controla;
* el seu estat;
* si val la pena intentar atacar-la.

---

# 7. Hi ha dos tipus de bandera

## PublicFlagSite

És un lloc fix del món.

Per exemple:

* un cim;
* un coll;
* un mirador;
* un punt emblemàtic.

Pot canviar de propietari.

Però:

> **mai canvia de lloc.**

---

## UserFlag

És una bandera creada per un jugador.

Aquesta sí que pot:

* ser plantada;
* defensada;
* capturada;
* transportada;
* replantada en un altre lloc.

---

# 8. Visitar no és atacar

Passar per una bandera no inicia automàticament cap combat.

Una visita pot servir per:

* descobrir-la;
* actualitzar la informació;
* progressar;
* donar valor al lloc.

Per atacar:

> ho has de decidir abans de començar l'activitat.

---

# 9. Prepara l'atac

Escull una bandera descoberta i selecciona:

> **PREPARAR ATAC**

Aquella serà la teva missió.

Durant aquesta activitat només pots tenir:

> **una bandera objectiu.**

No la podràs canviar per una altra a mig camí.

---

# 10. Troba-la

Quan arribis a la zona, TerritoriLord no necessita donar-te la coordenada exacta.

Pot donar-te:

* una zona aproximada;
* proximitat;
* pistes.

La resta depèn de tu.

> **Hauràs d'orientar-te.**

---

# 11. Quan creguis que l'has trobat...

Prem:

> **ATACAR**

TerritoriLord comprovarà la teva posició.

Poden passar tres coses.

### CONFIRMED

Ets al lloc correcte.

L'atac comença.

### UNCERTAIN

El GPS no és prou precís.

No reps cap penalització.

### INCORRECT

El GPS és prou precís per saber que no ets al lloc correcte.

L'eficiència d'aquell atac disminueix.

---

# 12. Trobar-la no és suficient

Quan localitzes correctament la bandera:

```text
ATTACK IN PROGRESS
```

Però encara no has guanyat.

Has de:

> **continuar i completar l'activitat.**

Només llavors TerritoriLord podrà resoldre l'atac.

---

# 13. El defensor ho pot saber

Quan l'atac queda confirmat, el propietari de la bandera pot rebre:

> **La teva bandera està sent atacada.**

Però no veu:

* on ets;
* el teu track;
* la teva posició en temps real.

La rivalitat és dins del joc.

No consisteix a perseguir altres jugadors físicament.

---

# 14. Completa la ruta

Quan acabes, TerritoriLord valida l'activitat i calcula la força que has generat.

Hi influeixen conceptes com:

* activitat física;
* exploració;
* descobertes.

El resultat final pot ser:

```text
DEFENDED
DAMAGED
CAPTURED
```

---

# 15. Si la bandera resisteix

Pot quedar:

> **DEFENDED**

o:

> **DAMAGED**

Si queda danyada, la seva defensa serà menor.

Potser no l'has conquistada avui.

Però ara tens una nova raó per tornar.

---

# 16. Si captures un PublicFlagSite

El lloc passa a ser teu.

```text
Owner: Rival
↓
Owner: Tu
```

El punt continua exactament on era.

Has canviat:

> la història del lloc.

---

# 17. Si captures una UserFlag

Aquí passa una cosa diferent.

La bandera deixa la seva ubicació anterior i passa a estar:

```text
TRANSPORTED
```

Ara la controles tu.

Però encara no està plantada.

---

# 18. Porta-la a un lloc nou

Per replantar una UserFlag capturada hauràs de fer:

> **una nova activitat física.**

Porta-la fins a un punt vàlid del teu territori i planta-la.

La bandera conserva:

* la seva història;
* els seus antics propietaris;
* les captures;
* el seu Prestige.

Però:

> la nova ubicació haurà de construir la seva pròpia importància.

---

# 19. No la pots guardar per sempre

Si captures una UserFlag però no la replantes dins del termini corresponent:

```text
TRANSPORTED
↓
retorna a l'últim lloc
↓
sense propietari
↓
defensa baixa
```

I torna a estar disponible per a tothom.

---

# 20. Defensa el que és teu

També pots preparar una activitat de defensa.

Selecciona una bandera pròpia i surt a reforçar-la.

```text
DEFEND FLAG
```

Visita-la físicament i completa l'activitat.

---

# 21. La presència importa

Passar habitualment pel teu territori i per les teves banderes també pot ajudar.

Però:

> una defensa preparada expressament té més valor que simplement passar-hi.

Si abandones una zona durant molt de temps:

* les defenses es debiliten;
* la informació queda obsoleta;
* els rivals ho tindran més fàcil.

---

# 22. Perdre no esborra la teva història

Pots perdre:

* territori;
* banderes;
* batalles.

Però no perds tot el que has fet.

Es conserva el teu progrés permanent:

* XP;
* Level;
* exploració;
* cims;
* Achievements;
* historial;
* Prestige.

> **Pots perdre el present sense perdre la teva història.**

---

# 23. XP no és força de combat

L'XP representa la teva progressió.

La força d'un atac prové principalment de:

> l'activitat que acabes de fer.

Això evita que un jugador veterà sigui invencible simplement perquè porta més temps jugant.

---

# 24. No cal competir

TerritoriLord també es pot jugar sense centrar-se en PvP.

Pots dedicar-te sobretot a:

* explorar;
* descobrir cims;
* visitar POI;
* completar zones;
* descobrir nous llocs;
* ampliar el teu mapa personal.

No hi ha una única manera correcta de jugar.

---

# 25. Descobreix punts d'interès

Durant les teves activitats podràs trobar:

* fonts;
* miradors;
* refugis;
* patrimoni;
* llocs naturals;
* altres punts interessants.

En el futur, la comunitat també podrà ajudar a construir aquest mapa.

---

# 26. Descobreix cims

Els cims són fites pròpies.

No cal conquistar-los.

Arribar-hi ja és l'objectiu.

La primera ascensió queda registrada com una part permanent de la teva història.

---

# 27. Quan viatges, el joc continua

No necessites jugar sempre a la mateixa zona.

Si vas a un lloc nou:

* descobriràs territori;
* trobaràs nous POI;
* podràs visitar cims;
* podràs conquistar;
* podràs interactuar amb banderes.

Un viatge també amplia:

> el teu mapa personal.

---

# 28. Experiències turístiques

TerritoriLord també podrà oferir experiències com:

> **Descobreix 8 indrets del municipi.**

Una campanya pot mostrar-te pistes o suggerir-te llocs.

Però veure una pista no significa haver descobert físicament aquell lloc.

Encara hauràs d'anar-hi.

---

# 29. QR i recompenses

Alguns punts patrocinats o turístics poden tenir un QR físic.

Per validar una visita:

```text
QR
+
ubicació real
+
servidor
```

Per tant:

> una fotografia del QR enviada per una altra persona no és suficient.

---

# 30. Pagar no et fa més fort

TerritoriLord no és pay-to-win.

Pagar pot donar accés a:

* contingut;
* experiències;
* rutes;
* personalització;
* informació turística.

No permet comprar:

* territori;
* AttackPower;
* Defense;
* captures garantides.

---

# 31. Les set regles que has de recordar

### 1

> **Moure't pel món real és la base del joc.**

### 2

> **Explorar no és el mateix que conquistar.**

### 3

> **Haver estat en un lloc no significa saber què hi passa ara.**

### 4

> **Visitar una bandera no significa atacar-la.**

### 5

> **PublicFlagSite i UserFlag funcionen diferent.**

### 6

> **XP no és Power.**

### 7

> **Trobar una bandera no és suficient: has de completar l'activitat.**

---

# 32. En resum

```text
VEUS ALGUNA COSA
↓
ET GENERA CURIOSITAT
↓
SURTS
↓
EXPLORES
↓
DESCobreixes
↓
CONQUISTES O INTERACTUES
↓
EL MAPA CANVIA
↓
APAREIX UN NOU OBJECTIU
↓
TORNES A SORTIR
```

---

# 33. I ara què?

Obre el mapa.

Busca:

* una zona que encara no coneixes;
* una bandera que encara no has descobert;
* un tros de territori que podries conquistar;
* un lloc al qual fa temps que no tornes.

I pensa:

> **«Avui aniré cap allà.»**
