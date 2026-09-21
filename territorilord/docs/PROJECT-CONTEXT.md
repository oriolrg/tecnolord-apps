# TerritoriLord — Project Context

**Estat:** disseny funcional inicial
**Data:** 2026-09-18
**Nom provisional:** TerritoriLord

---

# 1. Objectiu del projecte

TerritoriLord és una aplicació esportiva basada en geolocalització que utilitza exploració, territori, orientació i competició per motivar els usuaris a realitzar activitat física i descobrir nous llocs.

El joc s'ha de construir al voltant d'una idea principal:

> L'activitat física real ha de ser necessària per progressar, explorar, conquerir, atacar i defensar.

No es vol crear un joc digital al qual posteriorment s'afegeixi GPS.

Es vol crear un sistema en què el món físic sigui el tauler de joc.

---

# 2. Relació amb OrientaTrack

TerritoriLord està conceptualment relacionat amb OrientaTrack.

Comparteix interessos com:

* GPS;
* activitats outdoor;
* orientació;
* navegació;
* verificació de posició;
* mapes;
* recorreguts.

TerritoriLord és, però, una aplicació independent.

En el futur es podrien compartir components o llibreries geogràfiques entre projectes, però aquesta decisió encara no està presa.

---

# 3. Principi rector

> **El mapa ha de donar prou informació per despertar curiositat, però no tanta com per eliminar la necessitat d'explorar físicament.**

Aquest principi s'ha de conservar en totes les decisions de producte.

---

# 4. Motivacions principals

El sistema té quatre capes de motivació.

## Explorar

Descobrir territori, camins, cims, POI i altres elements.

## Conquerir

Completar activitats circulars que permetin obtenir territori.

## Competir

Atacar banderes, defensar-les, disputar territoris i generar rivalitats entre jugadors.

## Construir

Crear una empremta persistent al món mitjançant:

* territori;
* banderes;
* POI;
* descobriments;
* historial;
* reputació.

---

# 5. Modalitats d'activitat

El sistema ha de diferenciar tipus d'activitat.

Inicialment es contemplen:

* running;
* trail running;
* walking;
* hiking;
* cycling;
* MTB.

Cada modalitat podrà tenir criteris diferents de:

* distància;
* durada;
* esforç;
* desnivell;
* validació;
* generació de potència.

Els valors exactes encara no estan definits.

---

# 6. Activitats territorials

Per tenir efectes territorials importants, una activitat haurà de ser vàlida.

Una de les condicions principals serà que:

> el punt final estigui aproximadament a prop del punt inicial.

Aquesta condició no serà suficient per si sola.

També s'hauran de validar aspectes com:

* durada;
* distància;
* velocitat;
* GPS;
* precisió;
* continuïtat;
* possibles manipulacions.

---

# 7. Territori

Les activitats circulars permetran conquerir territori.

El jugador percebrà zones pintades sobre el mapa.

Internament, el territori probablement serà representat mitjançant cel·les geoespacials per facilitar:

* propietat;
* solapaments;
* defensa;
* fronteres;
* captures;
* estadístiques.

La tecnologia concreta encara no està decidida.

---

# 8. Fog of War

Les zones no explorades no mostraran tota la informació.

El sistema diferenciarà conceptualment:

* desconegut;
* detectat;
* descobert;
* obsolet.

Una zona desconeguda pot mostrar indicis que hi existeixen:

* banderes;
* POI;
* altres elements interessants.

Però no ha de revelar informació suficient per eliminar l'exploració.

---

# 9. Exploració permanent i informació temporal

S'han de separar dos conceptes.

## Historial d'exploració

Permanent.

L'usuari conserva constància que ha estat en una zona.

Això permet donar valor a:

* viatges;
* vacances;
* exploració;
* cims;
* POI;
* regions visitades.

## Informació territorial

Temporal.

La informació tàctica es degrada quan l'usuari deixa de visitar una zona.

Si passa molt temps, haurà de tornar-hi per actualitzar:

* banderes;
* propietaris;
* defenses;
* territoris;
* altres dades del joc.

Com a hipòtesi inicial, la degradació completa podria aproximar-se a un any.

No és encara una regla definitiva.

---

# 10. Banderes

Les banderes són punts estratègics creats o controlats per jugadors.

Cada jugador tindrà un nombre limitat de banderes actives.

Aquest nombre podrà créixer amb la progressió, però existirà un sostre.

L'objectiu és evitar saturació del mapa.

---

# 11. Valor de les banderes

Una bandera no tindrà un únic valor.

Conceptualment es diferencien:

## Importància

Valor comunitari del lloc.

Creix principalment perquè altres jugadors passen físicament per aquella zona.

## Defensa

Dificultat actual per capturar-la.

## Prestigi

Historial de la bandera:

* visites;
* antiguitat;
* captures;
* reconquestes;
* rivalitats.

Una bandera important no ha de convertir-se en una bandera invencible.

---

# 12. Visites

Visitar una bandera no significa atacar-la.

Les visites poden aportar:

Al jugador:

* exploració;
* XP;
* descoberta;
* informació territorial.

A la bandera:

* importància;
* validació;
* activitat comunitària.

Les visites repetides pel mateix jugador tindran rendiments decreixents.

La diversitat de jugadors serà més important que la quantitat bruta de visites.

---

# 13. Descobriment de banderes

Les banderes existents en zones no explorades no es mostraran completament.

El sistema podrà donar una pista aproximada.

Exemple conceptual:

> Presència territorial detectada.

No es mostrarà necessàriament:

* coordenada exacta;
* propietari;
* defensa;
* importància;
* historial.

Primer caldrà explorar la zona.

---

# 14. Atac a una bandera

Atacar és una acció explícita i planificada.

Abans de començar una activitat, el jugador selecciona una bandera descoberta com a objectiu.

Una activitat només pot tenir:

> **un únic objectiu d'atac.**

Flux:

1. seleccionar bandera;
2. iniciar activitat;
3. arribar a la zona;
4. localitzar físicament la bandera;
5. iniciar interacció d'atac;
6. validar posició;
7. continuar l'activitat;
8. acabar aproximadament al punt inicial;
9. validar activitat;
10. resoldre la batalla.

---

# 15. Component d'orientació

Atacar una bandera ha de semblar-se parcialment a una cursa d'orientació amb un únic control.

El sistema no ha de donar necessàriament la posició exacta.

Pot proporcionar:

* zona aproximada;
* informació de proximitat;
* indicis progressius.

El jugador ha de localitzar físicament el punt.

---

# 16. Validació GPS de l'atac

Quan el jugador creu haver localitzat la bandera, inicia l'atac.

S'ha de validar:

* distància;
* GPS;
* accuracy;
* coherència de lectures.

Hi haurà tres casos.

## Correcte

Posició confirmada.

## Incert

La precisió GPS és insuficient.

No hi ha penalització.

## Incorrecte

La posició és clarament incorrecta.

S'aplica penalització a l'atac actual.

---

# 17. Eficiència d'atac

Cada atac comença amb eficiència màxima.

Els intents incorrectes redueixen aquesta eficiència.

La penalització s'acumula fins que el jugador localitza correctament la bandera.

Exemple conceptual:

100 % → 95 % → 87 % → 76 %

Aquesta penalització modifica la potència final de l'atac.

No penalitza necessàriament tot el progrés general del jugador.

---

# 18. Potència

Les activitats generen potència.

Pot dependre de:

* distància;
* durada;
* desnivell;
* modalitat;
* esforç;
* territori nou;
* cims;
* POI;
* exploració;
* dificultat.

La fórmula encara no està definida.

Han d'existir:

* límits;
* rendiments decreixents;
* controls antiabús.

---

# 19. Resolució de l'atac

La batalla no es resol en trobar físicament la bandera.

Primer cal completar l'activitat.

Després:

potència generada × eficiència = atac efectiu.

L'atac efectiu es compara amb la defensa.

Possibles resultats:

* la bandera resisteix;
* baixa la defensa;
* la bandera canvia de propietari.

La fórmula definitiva queda pendent.

---

# 20. Defensa

Un jugador podrà seleccionar una bandera pròpia abans de realitzar una activitat de defensa.

Una activitat vàlida podrà reforçar-la.

La defensa no pot créixer indefinidament.

Hi haurà:

* sostre;
* decadència;
* rendiments decreixents.

Cap bandera ha de ser permanentment invencible.

---

# 21. Banderes i accessibilitat

Una bandera no necessita estar situada sobre un sender cartografiat.

Pot estar en:

* cim;
* coll;
* mirador;
* clariana;
* font;
* roca;
* cruïlla;
* altres punts físicament accessibles.

La regla és:

> la bandera ha de ser accessible legítimament.

La cartografia només serà una font d'evidència.

---

# 22. Creació de banderes

No es podrà crear una bandera arbitràriament des del mapa.

El jugador haurà d'haver estat físicament al punt.

La creació podrà requerir:

* activitat vàlida;
* permanència al lloc;
* diverses lectures GPS;
* precisió suficient.

---

# 23. Validació comunitària

Les banderes poden tenir estats com:

* provisional;
* probable;
* validada;
* restringida;
* en revisió.

Altres jugadors poden ajudar a validar l'accessibilitat mitjançant visites reals.

També poden denunciar problemes.

---

# 24. POI

Els punts d'interès poden ser:

* del sistema;
* creats per usuaris.

Exemples:

* fonts;
* refugis;
* miradors;
* patrimoni;
* elements naturals;
* altres llocs útils.

Podran:

* visitar-se;
* valorar-se;
* confirmar-se;
* denunciar-se.

---

# 25. Moderació

Els POI i banderes comunitaris podran denunciar-se.

Motius possibles:

* inexistent;
* duplicat;
* propietat privada;
* ubicació incorrecta;
* accés perillós;
* contingut inadequat.

Les denúncies no implicaran automàticament eliminació.

Caldrà sistema de revisió.

---

# 26. Reputació

Els usuaris podran adquirir reputació comunitària.

Pot augmentar quan:

* creen POI útils;
* altres persones els visiten;
* aportacions són confirmades.

Pot disminuir per:

* contingut fals;
* abús;
* denúncies confirmades.

La reputació no ha de donar un avantatge territorial desproporcionat.

---

# 27. Rivalitats

El sistema podrà detectar rivalitats emergents.

Exemples:

* captures recurrents entre dos jugadors;
* fronteres compartides;
* reconquestes;
* banderes disputades.

Aquestes rivalitats poden convertir-se en part del perfil i de les estadístiques.

---

# 28. Jugadors locals i visitants

El sistema ha de funcionar bé per als dos perfils.

## Local

Guanya avantatge natural per:

* constància;
* coneixement actualitzat;
* manteniment;
* defensa;
* rivalitats.

## Visitant

Pot progressar mitjançant:

* exploració;
* descobriments;
* cims;
* POI;
* historial;
* prestigi.

L'exploració feta durant un viatge queda registrada permanentment.

---

# 29. Antiabús

S'hauran de controlar:

* GPS manipulat;
* ús de vehicle motoritzat;
* comptes múltiples;
* farming;
* visites artificials;
* POI falsos;
* atacs automatitzats;
* rutes repetides artificialment.

Possibles mesures:

* verificació de correu;
* rate limiting;
* reputació;
* historial;
* verificació GPS;
* detecció d'anomalies;
* restriccions inicials de comptes.

---

# 30. Monetització

El sistema ha de permetre monetització futura.

Principi:

> No pay-to-win.

No s'ha de poder comprar directament:

* territori;
* força;
* atac;
* defensa;
* invulnerabilitat.

Possibles serveis premium:

* estadístiques avançades;
* historial complet;
* personalització;
* mapes;
* clubs;
* reptes;
* planificació;
* exportacions;
* analítica avançada.

---

# 31. Principis de producte

1. L'activitat física és el centre.
2. Les accions importants requereixen presència física.
3. Explorar ha de tenir valor independentment de competir.
4. La constància importa més que l'antiguitat.
5. Cap jugador pot ser invencible.
6. El turista també ha de progressar.
7. La informació territorial actual s'ha de guanyar físicament.
8. El mapa ha de generar curiositat.
9. El joc no ha d'incentivar comportaments perillosos.
10. La monetització no pot comprar victòries.

---

# 32. Decisions pendents

Encara no s'han de considerar decidits:

* nom comercial definitiu;
* mida de cel·les;
* tecnologia de cel·les;
* fórmula de potència;
* fórmula d'atac;
* fórmula de defensa;
* decadència;
* XP;
* nivells;
* nombre de banderes;
* durada exacta del Fog;
* llindars GPS;
* criteris de cada activitat;
* equips o clans;
* temporades;
* arquitectura tècnica;
* model de dades;
* stack definitiu.

---

# 33. Documents del projecte

Estructura inicial recomanada:

```text
territorilord/
├── docs/
│   ├── PROJECT-CONTEXT.md
│   ├── GAME-DESIGN-00.md
│   └── decisions/
└── README.md
```

`GAME-DESIGN-00.md` conté el disseny funcional detallat.

`PROJECT-CONTEXT.md` és el document curt d'entrada al projecte.

La carpeta `decisions/` servirà per registrar decisions importants sense reescriure l'historial.

---

# 34. Fase actual

El projecte està encara en fase de disseny funcional.

No s'ha de començar implementació fins haver definit almenys:

1. model de domini;
2. regles territorials;
3. atac i defensa;
4. exploració i Fog of War;
5. validació d'activitats;
6. model antiabús;
7. MVP.

El següent artefacte recomanat és un **Model de Domini v0.1**.
