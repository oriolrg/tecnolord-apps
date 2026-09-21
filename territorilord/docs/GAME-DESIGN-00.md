# TerritoriLord — Game Design v0.1

**Estat:** esborrany funcional inicial
**Data:** 2026-09-18
**Nom de projecte provisional:** TerritoriLord

---

# 1. Visió

TerritoriLord és una aplicació esportiva i geogràfica en què l'activitat física real permet explorar el món, descobrir punts d'interès, conquistar territori, crear i disputar banderes i competir amb altres jugadors.

El joc ha de provocar principalment una decisió:

> «Avui sortiré per aquí.»

L'objectiu no és afegir un minijoc a una aplicació esportiva, sinó utilitzar les mecàniques de joc per motivar l'usuari a:

* fer activitat física;
* descobrir nous recorreguts;
* conèixer camins i indrets;
* sortir de les rutes habituals;
* tornar a zones que fa temps que no visita;
* competir i cooperar amb altres persones.

---

# 2. Principi rector

> **El mapa ha de donar prou informació per despertar curiositat, però no tanta com per eliminar la necessitat d'explorar físicament.**

Totes les mecàniques futures s'han d'avaluar respecte d'aquest principi.

---

# 3. Capes de motivació

## 3.1 Explorar

L'usuari descobreix territori físicament.

Motivació:

> «Què hi ha per aquest camí?»

L'exploració permet:

* eliminar Fog of War;
* descobrir banderes;
* descobrir POI;
* assolir cims i altres fites;
* obtenir experiència i recursos;
* actualitzar informació territorial antiga.

---

## 3.2 Conquerir

Una activitat circular permet obtenir territori.

Motivació:

> «Vull controlar aquesta zona.»

La ruta GPS defineix una zona o conjunt de cel·les territorials que poden ser incorporades al domini del jugador segons les regles del joc.

---

## 3.3 Competir

Els territoris i banderes es poden disputar.

Motivació:

> «M'han pres aquesta zona i la vull recuperar.»

La competició ha de generar noves activitats físiques, no substituir-les.

---

## 3.4 Construir

El jugador deixa una empremta persistent al món mitjançant:

* territori;
* banderes;
* POI;
* descobriments;
* historial;
* reputació.

Motivació:

> «Aquest és el territori que he explorat i construït.»

---

# 4. Activitats

El joc ha de diferenciar modalitats d'activitat.

Exemples inicials:

* running;
* trail running;
* walking;
* hiking;
* cycling;
* MTB.

Cada modalitat podrà tenir:

* criteris de validació diferents;
* coeficients diferents;
* distàncies mínimes;
* exigències de durada;
* tractament diferent del desnivell;
* generació de potència diferent.

Els valors concrets queden pendents d'equilibratge.

---

# 5. Activitat circular

Per considerar una activitat territorial finalitzada, el punt final ha d'estar aproximadament a prop del punt inicial.

No n'hi haurà prou amb complir aquesta condició.

També s'hauran de validar, segons modalitat:

* distància;
* durada;
* trajectòria GPS;
* velocitats plausibles;
* continuïtat;
* precisió;
* possibles manipulacions;
* repetició abusiva de recorreguts.

Els llindars es definiran posteriorment.

---

# 6. Territori

El recorregut circular pot generar territori.

Visualment el jugador percebrà una zona contínua.

Internament es recomana representar-la mitjançant cel·les geoespacials, de manera que es puguin gestionar:

* solapaments;
* propietaris;
* defensa;
* fronteres;
* historial;
* captures;
* estadístiques.

La tecnologia concreta queda pendent de decisió arquitectònica.

---

# 7. Fog of War

El mapa no mostrarà tota la informació des del principi.

Hi haurà com a mínim quatre estats conceptuals.

## Desconegut

El jugador no ha explorat aquella zona.

El territori i la informació detallada estan ocults.

Poden existir indicis de contingut interessant.

## Detectat

El jugador sap que aproximadament existeix alguna cosa:

* bandera;
* POI;
* fita;
* activitat territorial.

La ubicació o informació pot ser imprecisa.

## Descobert

El jugador hi ha estat físicament.

Pot accedir a informació completa o gairebé completa.

## Obsolet

El jugador havia descobert la zona però fa molt temps que no hi torna.

Part de la informació actual queda oculta.

---

# 8. Memòria permanent del món

Explorar un lloc no s'ha d'esborrar completament.

El sistema ha de diferenciar entre:

## Historial d'exploració

Permanent.

Permet recordar:

* països;
* regions;
* zones;
* cims;
* POI;
* territoris;
* viatges;
* activitats.

## Intel·ligència territorial

Temporal.

Es degrada progressivament quan l'usuari deixa de visitar una zona.

Un usuari que torna després de molt temps haurà d'explorar de nou per conèixer l'estat actual.

El període exacte queda pendent.

Com a hipòtesi inicial, la degradació completa podria produir-se aproximadament al llarg d'un any.

---

# 9. Jugador local i jugador visitant

El sistema ha de ser atractiu per als dos perfils.

## Jugador local

Avantatge natural per:

* constància;
* coneixement actualitzat;
* defensa;
* manteniment;
* rivalitats;
* descobriment profund del territori.

## Visitant

Ha de poder obtenir:

* exploració permanent;
* XP;
* cims;
* POI;
* descobriments;
* historial;
* prestigi;
* participació territorial temporal.

El sistema no ha de convertir el visitant en un jugador de segona categoria.

---

# 10. Banderes

Les banderes són punts estratègics del joc.

Cada jugador podrà tenir un nombre limitat de banderes actives.

Aquest límit podrà evolucionar amb:

* progressió;
* nivell;
* assoliments;
* reputació.

Hi haurà un sostre màxim per evitar saturació del mapa.

El valor exacte queda pendent d'equilibratge.

---

# 11. Creació d'una bandera

Una bandera no es podrà plantar arbitràriament des del mapa.

El jugador haurà d'haver estat físicament al lloc.

La creació podrà requerir:

* activitat GPS vàlida;
* permanència mínima al punt;
* diverses lectures GPS coherents;
* precisió suficient.

Una bandera no necessita estar sobre un sender cartografiat.

Pot correspondre, per exemple, a:

* cim;
* coll;
* mirador;
* clariana;
* roca;
* font;
* cruïlla;
* element natural;
* punt estratègic.

Ha de ser físicament accessible de forma legítima.

---

# 12. Accessibilitat de les banderes

La validació no serà únicament cartogràfica.

El sistema pot utilitzar:

* cartografia;
* informació d'accés;
* ús comunitari;
* visites reals;
* denúncies.

Possibles estats:

* provisional;
* probable;
* validada;
* restringida;
* en revisió.

Les dades cartogràfiques seran evidència, no veritat absoluta.

---

# 13. Importància d'una bandera

La importància representa el valor del lloc per a la comunitat.

No depèn principalment del propietari.

Pot créixer segons:

* jugadors diferents que passen per la zona;
* visites reals;
* recurrència;
* activitat recent;
* diversitat de jugadors;
* ús comunitari.

Les visites repetides del mateix jugador aportaran molt poc valor.

S'aplicaran rendiments decreixents.

---

# 14. Importància, defensa i prestigi

No s'ha d'utilitzar un únic valor.

Una bandera tindrà conceptualment:

## Importància

Valor comunitari del lloc.

## Defensa

Dificultat actual per capturar-la.

## Prestigi

Historial acumulat:

* antiguitat;
* captures;
* reconquestes;
* visites;
* rivalitats;
* fites.

Una bandera important no ha de ser automàticament invencible.

---

# 15. Visitar no és atacar

Passar prop d'una bandera no inicia automàticament un atac.

Una visita pot aportar:

Al jugador:

* exploració;
* XP;
* descoberta;
* coneixement territorial.

A la bandera:

* importància;
* validació comunitària;
* activitat del lloc.

---

# 16. Descobrir una bandera

Una bandera situada en territori no explorat no es mostra completament.

El Fog of War pot donar una pista aproximada:

> Presència territorial detectada.

No es mostrarà necessàriament:

* propietari;
* valor;
* defensa;
* coordenada exacta;
* historial.

El jugador haurà d'explorar aquella zona per obtenir informació.

---

# 17. Atac a una bandera

Un atac és deliberat.

Abans de començar l'activitat, el jugador selecciona una bandera descoberta com a objectiu.

Una activitat només podrà atacar una bandera.

Flux conceptual:

1. seleccionar bandera;
2. iniciar activitat;
3. dirigir-se cap a la zona;
4. localitzar físicament la bandera;
5. interactuar amb l'aplicació;
6. validar posició;
7. completar l'activitat;
8. tornar aproximadament al punt inicial;
9. validar activitat;
10. resoldre batalla.

---

# 18. Orientació durant l'atac

L'atac ha de tenir un component semblant a una cursa d'orientació amb un únic control.

L'aplicació no ha de proporcionar necessàriament navegació exacta.

Pot mostrar progressivament:

* zona aproximada;
* proximitat;
* distància aproximada;
* indicis.

L'usuari ha de localitzar físicament el punt.

---

# 19. Validació de posició

Quan el jugador creu que ha localitzat la bandera, inicia l'atac.

El sistema comprova:

* coordenada GPS;
* distància;
* accuracy;
* coherència de lectures.

Es diferenciaran tres casos.

## Confirmat

La posició és suficientment fiable.

## Incert

La precisió GPS no permet decidir.

No hi ha penalització.

## Incorrecte

La posició és clarament incompatible amb la bandera.

S'aplica penalització a l'eficiència de l'atac.

---

# 20. Eficiència d'atac

Cada atac comença amb eficiència màxima.

Els intents incorrectes redueixen progressivament l'eficiència.

Exemple conceptual:

100 % → 95 % → 87 % → 76 %

Quan la bandera és finalment localitzada, la potència generada per l'activitat es multiplica per l'eficiència resultant.

La penalització afecta l'atac actual, no necessàriament el progrés global del jugador.

---

# 21. Potència

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

No s'ha d'establir encara la fórmula definitiva.

S'aplicaran:

* límits;
* rendiments decreixents;
* mesures antiabús.

---

# 22. Resolució d'un atac

Localitzar una bandera no resol immediatament la batalla.

L'activitat s'ha de completar i validar.

Després:

Potència generada × eficiència d'atac = atac efectiu.

Aquest atac es compara amb la defensa.

Si l'atac no és suficient:

* la bandera resisteix;
* pot perdre part de la defensa.

Si l'atac supera la defensa:

* la bandera pot canviar de propietari.

La fórmula definitiva queda pendent d'equilibratge.

---

# 23. Defensa

El propietari pot seleccionar una bandera pròpia abans de començar una activitat.

Una activitat vàlida de defensa pot reforçar-la.

La defensa pot dependre de:

* activitat recent;
* esforç;
* visita física;
* manteniment;
* territori relacionat;
* importància, amb efecte limitat.

Cap bandera serà invencible.

---

# 24. Decadència

Les defenses territorials i de banderes no són permanents.

La inactivitat provoca decadència progressiva.

Això evita:

* propietaris eterns;
* avantatge desproporcionat dels veterans;
* territoris abandonats impossibles de recuperar.

---

# 25. Recompensa per exploració

Descobrir món ha de generar més valor que repetir indefinidament el mateix recorregut.

Poden aportar bonificacions:

* territori nou;
* camins nous;
* cims;
* POI;
* fites especials;
* zones remotes.

Repetir recorreguts continua aportant activitat i defensa, però amb rendiments decreixents.

---

# 26. Cims

Els cims són fites del món independents dels jugadors.

Poden aportar:

* XP;
* prestigi;
* exploració;
* assoliments;
* potència limitada.

No són automàticament banderes.

---

# 27. POI

Els punts d'interès poden provenir del sistema o ser afegits per jugadors.

Exemples:

* fonts;
* refugis;
* miradors;
* patrimoni;
* elements naturals;
* punts útils;
* descobriments.

Els POI comunitaris poden ser:

* visitats;
* valorats;
* confirmats;
* denunciats.

---

# 28. Moderació dels POI

Els POI han de mantenir:

* autor;
* coordenades;
* categoria;
* descripció;
* estat;
* historial.

Possibles denúncies:

* inexistent;
* duplicat;
* propietat privada;
* ubicació incorrecta;
* accés perillós;
* contingut inadequat.

L'acumulació de denúncies no implicarà necessàriament eliminació automàtica.

---

# 29. Reputació

El sistema podrà mantenir reputació dels contribuents.

Augmenta quan:

* POI creats són visitats;
* altres jugadors els confirmen;
* aportacions són útils.

Disminueix amb:

* contingut fals;
* denúncies confirmades;
* abús.

La reputació no ha de convertir-se directament en una gran força territorial.

---

# 30. Antiabús

Caldrà prevenir:

* GPS falsificat;
* cotxe/moto declarats com running;
* comptes múltiples;
* farming de visites;
* valoracions coordinades;
* POI falsos;
* repetició artificial de rutes;
* atacs massius.

Mesures possibles:

* correu verificat;
* detecció de patrons;
* rate limiting;
* historial;
* confiança del compte;
* verificacions GPS;
* restriccions per comptes nous.

No es pot garantir estrictament una persona = un compte sense identificació forta.

---

# 31. Rivalitats

El sistema pot detectar rivalitats de manera orgànica.

Exemple:

* captures entre dos jugadors;
* territori disputat;
* reconquestes;
* banderes compartides;
* fronteres comunes.

Aquestes rivalitats poden formar part de:

* perfil;
* estadístiques;
* notificacions;
* historial.

---

# 32. Història de les banderes

Algunes banderes poden adquirir fama per:

* nombre de captures;
* visites;
* antiguitat;
* canvis de propietari;
* altitud;
* ubicació remota;
* rivalitats.

Això crea objectius emergents sense haver-los de definir manualment.

---

# 33. Fronteres

Les cel·les properes a territoris rivals poden considerar-se fronteres.

Poden tenir més valor estratègic.

Les activitats per fronteres poden tenir utilitat per:

* manteniment;
* defensa;
* observació;
* expansió.

La mecànica exacta queda pendent.

---

# 34. Monetització futura

L'arquitectura ha de deixar espai per monetització.

Principi:

> No convertir el joc en pay-to-win.

No s'hauria de poder comprar directament:

* atac;
* defensa;
* territori;
* invulnerabilitat.

Possibles serveis premium futurs:

* estadístiques avançades;
* historial ampliat;
* personalització;
* mapes;
* clubs;
* reptes;
* planificació;
* exportacions;
* anàlisi avançada.

---

# 35. Entitats conceptuals inicials

El model de domini probablement necessitarà com a mínim:

* User
* Activity
* ActivityType
* Track
* TerritoryCell
* TerritoryOwnership
* Exploration
* FogState
* Flag
* FlagVisit
* FlagAttack
* FlagDefense
* FlagHistory
* POI
* POIVisit
* POIReport
* Summit
* Achievement
* Reputation
* Rivalry

Aquesta llista és conceptual i no constitueix encara l'esquema de base de dades.

---

# 36. Bucles principals

## Exploració

Activitat → territori nou → descobriments → recompenses → nova curiositat.

## Conquesta

Activitat circular → territori → propietat → expansió.

## Atac

Descobrir bandera → seleccionar objectiu → activitat → orientació → atac → resultat.

## Defensa

Avís o decisió → seleccionar bandera → activitat → reforç.

## Comunitat

Descobrir → crear POI → altres jugadors visiten → validació → reputació.

---

# 37. Principis que no s'han de trencar

1. L'activitat física és el centre del joc.
2. Cap acció territorial important ha de produir-se només des del sofà.
3. Explorar ha de tenir valor per si mateix.
4. La constància ha d'importar més que l'antiguitat del compte.
5. Cap jugador ha de ser invencible.
6. La competició no ha d'eliminar el valor del turisme i l'exploració.
7. La informació territorial actual s'ha de guanyar físicament.
8. El mapa ha de generar curiositat.
9. Les recompenses no han d'incentivar comportaments perillosos.
10. La monetització no ha de comprar victòries.

---

# 38. Decisions encara pendents

Caldrà definir posteriorment:

* nom definitiu;
* mida de les cel·les;
* sistema territorial exacte;
* fórmula de potència;
* fórmula d'atac;
* fórmula de defensa;
* decadència;
* nombre màxim de banderes;
* durada del Fog of War;
* llindars GPS;
* criteris de cada modalitat;
* sistema de nivells;
* XP;
* recompenses;
* equips o clans;
* estacionalitat;
* privacitat;
* model anti-cheat;
* arquitectura tècnica.

---

# 39. Estat del disseny

Aquest document defineix el nucli funcional inicial.

Encara no és una especificació tècnica ni un conjunt de tasques de desenvolupament.

El pas següent serà transformar aquestes regles en:

1. model de domini;
2. decisions funcionals pendents;
3. SPEC funcional;
4. arquitectura;
5. pla de desenvolupament;
6. tasques petites i verificables.
