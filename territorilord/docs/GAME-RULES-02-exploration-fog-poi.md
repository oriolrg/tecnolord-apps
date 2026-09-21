TerritoriLord — Game Rules 02: Exploration, Fog & POI

Estat: proposta funcional v0.2
Data: 2026-09-18
Projecte: TerritoriLord

Addició v0.2 — Persistència del coneixement segons domini

El Fog of War no depèn exclusivament del temps transcorregut des de l'última visita.

El sistema ha de considerar també el grau de vinculació actual del jugador amb aquella zona.

Una zona pot conservar coneixement durant més temps si el jugador manté una presència significativa.

Factors que poden alentir la degradació:

territori encara controlat;
banderes pròpies;
banderes defensades recentment;
POI creats o mantinguts;
visites recents;
activitats recurrents;
domini territorial proper;
interacció comunitària pròpia relacionada amb la zona.

Factors que poden accelerar la degradació:

pèrdua progressiva del territori;
captura de banderes pròpies;
decadència de les defenses;
absència prolongada d'activitat;
desaparició del domini territorial;
canvis importants detectats des de l'última visita.

Conceptualment:

TEMPS
+
PRESÈNCIA
+
DOMINI
+
ACTIVITAT
=
VELOCITAT DE DEGRADACIÓ DEL CONEIXEMENT

No es considera equivalent:

zona visitada fa 8 mesos
sense cap vinculació actual

i:

zona visitada fa 8 mesos
amb territori propi
+ bandera pròpia
+ POI propis
+ activitat comunitària relacionada

La segona ha de conservar més informació.

Coneixement territorial assistit pel domini

El control territorial pot mantenir una part del coneixement sense necessitat de visita física constant.

Això no significa informació perfecta.

Exemple:

DOMINI FORT

territori propi
+ bandera activa
+ activitat recent

→ coneixement es degrada lentament

En canvi:

DOMINI EN RETROCÉS

territori perdut
+ bandera capturada
+ mesos sense activitat

→ degradació accelerada
Pèrdua de domini i Fog

Quan un jugador perd control sobre una zona, la informació no desapareix instantàniament.

El procés és gradual:

CONTROL ACTIU
     ↓
CONTROL FEBLE
     ↓
PÈRDUA DE DOMINI
     ↓
CONEIXEMENT STALE
     ↓
FOG PARCIAL
     ↓
HISTORICAL

Això reforça una mecànica important:

perdre territori no significa només perdre puntuació; també significa perdre progressivament coneixement tàctic de la zona.

Banderes com a ancoratges de coneixement

Una bandera pròpia pot actuar com un ancoratge territorial.

Mentre es manté sota control:

el Fog proper es degrada més lentament;
es conserva millor la informació de la zona;
la pèrdua de coneixement no s'atura completament.

Una bandera no proporciona informació perfecta a distància.

La seva influència sobre el coneixement és limitada geogràficament.

POI i memòria territorial

Els POI també creen vinculació amb una zona, però amb menys pes que una bandera territorial.

Especialment:

POI creat pel jugador;
POI confirmat;
POI visitat diverses vegades;
POI comunitari amb interacció pròpia.

Aquests elements poden alentir la degradació del Fog local.

No haurien de permetre mantenir indefinidament informació tàctica completa.

Domini no equival a visió omniscient

Principi:

controlar una zona ajuda a conservar-ne el coneixement, però no substitueix completament la presència física.

Per exemple, una bandera pròpia no hauria de revelar automàticament:

noves banderes rivals;
POI nous;
canvis recents;
informació precisa d'un atac rival.

Per obtenir informació actualitzada continua sent útil tornar-hi físicament.

Variable conceptual: KnowledgeRetention

Es podrà derivar una variable conceptual:

KnowledgeRetention

que depèn de:

recency
+ territorial_control
+ own_flags
+ own_POI_relationship
+ recent_activity
+ community_presence

Aquesta variable no necessita existir com un camp únic persistent.

Pot ser calculada.

Nou principi fixat

S'afegeix als principis del sistema:

Com més presència real i domini manté un jugador en una zona, més lentament es degrada el seu coneixement; quan perd domini i activitat, el Fog retorna progressivament més ràpid.

---

# 1. Objectiu

Aquest document defineix les regles conceptuals de:

* exploració;
* Fog of War;
* memòria territorial;
* degradació del coneixement;
* detecció de banderes;
* detecció de POI;
* cims i fites;
* POI comunitaris;
* visites;
* validació comunitària;
* experiència del jugador local i del visitant.

No fixa encara llindars temporals ni fórmules definitives.

---

# 2. Principi rector

> **El mapa ha de donar prou informació per despertar curiositat, però no tanta com per eliminar la necessitat d'explorar físicament.**

Aquest principi té prioritat sobre la comoditat de mostrar tota la informació disponible.

---

# 3. Dos conceptes diferents

El sistema ha de separar:

## Historial d'exploració

Representa:

> «Jo he estat aquí.»

És permanent.

## Coneixement actual

Representa:

> «Jo sé què està passant aquí ara.»

És temporal.

Aquesta distinció és central.

---

# 4. Historial permanent

Quan un jugador explora una zona per primera vegada, aquesta descoberta queda registrada permanentment.

Pot alimentar:

* mapa personal;
* estadístiques;
* km² explorats;
* regions visitades;
* països;
* municipis;
* cims;
* POI;
* assoliments;
* perfil de jugador.

El pas del temps no elimina aquesta informació.

---

# 5. Coneixement temporal

El jugador no conserva indefinidament informació tàctica completa d'una zona.

Amb el temps poden quedar obsolets:

* propietaris;
* fronteres;
* banderes;
* defensa;
* importància;
* POI nous;
* POI desapareguts;
* activitat territorial.

Per recuperar informació actualitzada, cal tornar físicament a la zona.

---

# 6. Estats del coneixement

Es proposen cinc estats conceptuals:

```text
UNKNOWN
DETECTED
DISCOVERED
STALE
HISTORICAL
```

---

# 7. UNKNOWN

El jugador mai ha explorat aquella zona.

El mapa territorial queda cobert pel Fog of War.

No es mostra:

* propietari;
* fronteres;
* defensa;
* banderes exactes;
* POI exactes.

Pot haver-hi indicis.

---

# 8. DETECTED

El jugador encara no ha explorat la zona, però el sistema li revela que hi ha alguna cosa interessant.

Pot veure:

```text
🚩 ?
```

o:

```text
★ ?
```

o altres indicadors.

No implica conèixer el punt exacte.

---

# 9. DISCOVERED

El jugador ha explorat físicament la zona recentment.

Pot accedir a informació actualitzada segons les regles del joc.

Pot incloure:

* territori;
* propietaris;
* banderes;
* POI;
* informació de banderes;
* activitat rellevant.

---

# 10. STALE

La zona havia estat descoberta però la informació ha començat a envellir.

El jugador continua sabent que hi ha estat.

Part de la informació tàctica pot quedar:

* difuminada;
* aproximada;
* marcada com antiga;
* completament oculta.

---

# 11. HISTORICAL

Ha passat molt temps sense revisitar la zona.

Es conserva:

* descoberta històrica;
* activitats antigues;
* cims assolits;
* POI visitats;
* estadístiques.

Però la informació territorial actual queda pràcticament perduda.

---

# 12. Degradació progressiva

No es farà:

```text
dia 364 → informació completa
dia 365 → desapareix tot
```

La degradació serà progressiva.

Model conceptual:

```text
DISCOVERED
   ↓
informació lleugerament antiga
   ↓
STALE
   ↓
informació parcial
   ↓
HISTORICAL
```

---

# 13. Horitzó temporal

Com a hipòtesi inicial:

```text
0–30 dies
→ informació molt actual

30–90 dies
→ degradació lleu

90–365 dies
→ degradació progressiva

>365 dies
→ principalment memòria històrica
```

Aquests períodes NO estan fixats.

S'hauran d'equilibrar.

---

# 14. Revisitar refresca coneixement

Tornar físicament a una zona:

```text
STALE / HISTORICAL
        ↓
     Activity
        ↓
DISCOVERED
```

La visita pot actualitzar:

* propietaris;
* banderes;
* POI;
* fronteres;
* activitat;
* informació territorial.

---

# 15. Cobertura d'exploració

No cal que el jugador passi exactament per cada metre.

La seva trajectòria pot descobrir una franja al voltant del track.

Conceptualment:

```text
        zona descoberta
   ┌────────────────────┐
────── track GPS ─────────
   └────────────────────┘
```

L'amplada exacta queda pendent.

---

# 16. Modalitat i exploració

El radi o criteri de descoberta podria dependre de:

* accuracy;
* tipus d'activitat;
* entorn;
* velocitat.

No s'ha decidit encara si totes les modalitats descobriran exactament igual.

---

# 17. Exploració nova

Es considera exploració nova quan el jugador descobreix una zona que mai havia visitat.

Ha de tenir una recompensa notable.

Pot contribuir a:

* XP;
* Power;
* assoliments;
* estadístiques;
* progressió.

---

# 18. Revisita

Tornar a territori conegut continua sent útil.

Pot aportar:

* refresc de Fog;
* informació actualitzada;
* defensa;
* visites de banderes;
* POI;
* activitat física.

Però no ha de donar el mateix bonus d'exploració inicial.

---

# 19. Mapes personals

L'usuari podrà tenir una visualització diferenciada de:

```text
mai explorat
explorat recentment
explorat fa temps
explorat històricament
```

Això ha de generar motivació visual per completar zones.

---

# 20. Fog of War i territori

En zona UNKNOWN:

```text
████████████████
████████████████
████████████████
```

No es mostra la capa territorial completa.

El jugador no sap necessàriament:

* qui controla la zona;
* quines fronteres hi ha;
* quina defensa té.

---

# 21. Senyals dins del Fog

El Fog no ha de ser completament buit.

Pot mostrar senyals d'interès.

Exemples:

```text
🚩 ?
★ ?
🏔 ?
```

Aquests senyals serveixen per provocar:

> «Què hi ha allà?»

---

# 22. Posició imprecisa dels senyals

En zona no descoberta, els indicadors no han de revelar necessàriament la coordenada exacta.

Es pot mostrar:

* una zona;
* un radi;
* una cel·la aproximada;
* una indicació difusa.

Exemple:

```text
      ┌─────────┐
      │   🚩 ?  │
      │         │
      └─────────┘
```

El jugador sap que existeix alguna cosa dins aquella àrea.

---

# 23. Intensitat del senyal

Els elements importants poden generar indicis més visibles.

Exemple conceptual:

```text
🚩 ?      baixa rellevància

🚩 ??     rellevància notable

🔥 🚩 ?   element territorial molt important
```

Això no revela encara:

* propietari;
* defensa;
* valor exacte.

---

# 24. Què determina la intensitat

Per una bandera, podria dependre de:

* FlagImportance;
* activitat comunitària;
* notorietat.

No hauria de revelar directament la seva Defense.

---

# 25. Descobrir una bandera

Quan el jugador entra a la zona necessària:

```text
🚩 ?
 ↓
🚩 Flag descoberta
```

A partir d'aquest moment pot obtenir informació suficient per decidir si vol atacar-la.

---

# 26. Descobrir no és atacar

Flux:

```text
DETECTAR
  ↓
EXPLORAR
  ↓
DESCOBRIR
  ↓
AVALUAR
  ↓
PLANIFICAR UNA ALTRA ACTIVITY
  ↓
ATACAR
```

Això és intencionat.

Una bandera pot provocar més d'una sortida.

---

# 27. Informació inicial de bandera descoberta

En estat DISCOVERED es podrà mostrar, segons disseny final:

* nom;
* propietari;
* importància;
* defensa aproximada;
* prestigi;
* historial resumit;
* activitat recent.

No està decidit quins valors seran exactes i quins aproximats.

---

# 28. Bandera obsoleta

Quan passa temps:

```text
🚩 Marc
Defense 61
```

pot convertir-se en:

```text
🚩 ?
Dades antigues
```

o:

```text
Últim propietari conegut: Marc
Informació no actualitzada
```

---

# 29. Intel·ligència i estratègia

Explorar una zona rival sense atacar-la té valor perquè actualitza informació.

Això crea una activitat estratègica:

> reconèixer territori.

No requereix una mecànica artificial separada.

Simplement explorar ja proporciona intel·ligència.

---

# 30. POI

Un POI representa un punt d'interès físic.

Pot ser:

* predefinit;
* importat de fonts externes;
* creat per la comunitat.

---

# 31. Categories inicials de POI

Possibles categories:

```text
SUMMIT
VIEWPOINT
WATER
REFUGE
NATURAL
CULTURAL
HISTORICAL
TRAIL_FEATURE
COMMUNITY
OTHER
```

La taxonomia definitiva queda pendent.

---

# 32. POI i Fog

Un POI dins territori UNKNOWN pot aparèixer únicament com a pista.

Exemple:

```text
★ ?
```

Opcionalment es pot revelar categoria general:

```text
💧 ?
🏔 ?
🏛 ?
```

sense revelar nom ni ubicació exacta.

---

# 33. Valor de descoberta

Arribar per primera vegada a un POI pot aportar:

* XP;
* exploració;
* Power limitada;
* assoliments;
* historial.

---

# 34. Visites repetides a POI

No han de generar infinitament la mateixa recompensa.

Exemple conceptual:

```text
primera visita
→ alta recompensa

revisita després de temps
→ petita recompensa

repetició constant
→ gairebé cap recompensa exploratòria
```

---

# 35. Cims

Els cims tenen un valor especial com a fites del món.

Un Summit:

* no pertany a cap jugador;
* no és territori;
* no és bandera per defecte.

Pot estar relacionat amb una Flag pròxima.

---

# 36. Recompensa per cim

La primera ascensió registrada pot aportar:

* XP;
* Achievement;
* ExplorationPower;
* registre permanent.

Es poden considerar factors futurs com:

* altitud;
* prominència;
* dificultat;
* raresa.

No s'han de definir encara fórmules.

---

# 37. Cims repetits

Un jugador pot tornar al mateix cim.

Això pot aportar:

* activitat física;
* estadístiques;
* reptes;
* refresc territorial.

Però no ha de repetir indefinidament la recompensa de primera descoberta.

---

# 38. POI comunitaris

Els jugadors poden proposar nous POI.

Exemples:

* font no cartografiada;
* mirador;
* element patrimonial;
* curiositat natural;
* punt útil.

---

# 39. Creació física de POI

Com amb les banderes, es recomana exigir evidència que el jugador ha estat físicament al lloc.

No s'hauria de permetre crear lliurement qualsevol POI remot només clicant el mapa.

---

# 40. Informació mínima d'un POI comunitari

Pot requerir:

* ubicació;
* categoria;
* nom o descripció;
* creador;
* data.

Opcionalment:

* fotografia;
* observacions;
* accessibilitat.

---

# 41. Estat d'un POI comunitari

Possibles estats:

```text
PROVISIONAL
CONFIRMED
UNDER_REVIEW
RESTRICTED
REMOVED
```

---

# 42. Confirmació comunitària

Altres usuaris poden reforçar la confiança d'un POI mitjançant visites físiques.

Conceptualment:

```text
creador
   +
diversos visitants independents
   +
cap incidència important
   ↓
POI confirmat
```

---

# 43. Valor dels POI comunitaris

Crear molts POI no ha de generar gran quantitat de Power.

El valor arriba principalment quan altres usuaris:

* els visiten;
* els confirmen;
* els consideren útils.

Això evita incentivar spam.

---

# 44. Recompensa al creador

El creador pot obtenir:

* reputació;
* XP;
* assoliments;
* reconeixement.

Preferiblement de manera progressiva quan el POI demostra utilitat.

---

# 45. Visites independents

No totes les visites tenen el mateix pes.

Es poden considerar:

* antiguitat del compte;
* historial real d'activitats;
* independència respecte del creador;
* diversitat geogràfica;
* comportament anòmal.

Això ajudarà contra comptes secundaris.

---

# 46. Denúncies

Qualsevol POI o Flag comunitari pot ser denunciat.

Motius possibles:

```text
DOES_NOT_EXIST
DUPLICATE
PRIVATE_PROPERTY
WRONG_LOCATION
DANGEROUS_ACCESS
RESTRICTED_ACCESS
INAPPROPRIATE_CONTENT
OTHER
```

---

# 47. Denúncia no equival a eliminació

Una denúncia és evidència.

No és una sentència automàtica.

El sistema ha d'evitar:

> diversos rivals denuncien una bandera per fer-la desaparèixer.

---

# 48. Evidències de moderació

Una revisió pot considerar:

* nombre de denúncies;
* reputació dels denunciants;
* visites reals;
* cartografia;
* historial;
* aportacions del creador.

---

# 49. Accessibilitat

Un POI o bandera ha de ser accessible legítimament.

No necessita:

* carretera;
* pista;
* sender cartografiat.

Pot estar en un punt accessible fora de vies representades al mapa.

---

# 50. Informació cartogràfica

La cartografia pot ajudar a detectar:

* edificis;
* propietat privada;
* access restrictions;
* instal·lacions restringides;
* camins;
* cims;
* elements naturals.

Però:

> l'absència d'un camí al mapa no implica que el lloc sigui inaccessible.

---

# 51. Validació pel món real

Les activitats reals dels jugadors aporten evidència.

Exemple:

```text
15 usuaris independents
+
arribades GPS coherents
+
0 denúncies d'accés
```

augmenten la confiança que el punt és accessible.

---

# 52. Distància de visita

Per considerar un POI o Flag visitat, el jugador ha d'estar físicament pròxim.

S'ha proposat conceptualment un radi d'ordre:

```text
10–20 metres
```

però no queda fixat.

---

# 53. Accuracy GPS

La distància no s'ha d'avaluar ignorant `accuracy`.

S'han de distingir:

```text
posició compatible
posició incerta
posició incompatible
```

Especialment en:

* bosc;
* muntanya;
* carrers estrets.

---

# 54. No obligar a entrar al punt exacte

L'objectiu és validar presència física sense incentivar:

* saltar una tanca;
* entrar en una propietat;
* acostar-se a una zona perillosa.

La ubicació d'un POI/Flag ha de permetre interacció des d'un punt legítim i segur.

---

# 55. Turisme

Explorar lluny de la zona habitual ha de tenir valor permanent.

Un jugador que visita un territori durant vacances pot obtenir:

* km² nous;
* cims;
* POI;
* banderes descobertes;
* activitats;
* assoliments;
* estadístiques.

---

# 56. Memòria de viatge

Encara que la informació territorial es degradi, el perfil pot conservar:

```text
Pirineus — explorat 2026
Madeira — explorat 2027
Alps — explorat 2028
```

Això converteix el mapa personal en una mena de registre vital esportiu.

---

# 57. Avantatge local

El jugador local té:

* informació fresca;
* banderes conegudes;
* coneixement territorial;
* capacitat de defensa freqüent.

Aquest avantatge emergeix de la constància.

No s'aplica artificialment un bonus per domicili.

---

# 58. Avantatge del visitant

El visitant obté més oportunitats de:

* exploració nova;
* descobriments;
* cims nous;
* POI nous.

Això compensa parcialment la menor familiaritat territorial.

---

# 59. No penalitzar el viatge

No s'ha d'exigir haver explorat una zona durant setmanes per participar.

Un visitant pot:

```text
arribar
↓
explorar
↓
descobrir
↓
participar
```

Si vol atacar una Flag, haurà de respectar igualment el flux normal.

---

# 60. Exploració i Power

La descoberta de territori nou pot afegir ExplorationPower a l'Activity.

Aquesta bonificació ha de tenir:

* sostre;
* rendiments;
* protecció antiabús.

---

# 61. Evitar rutes artificials d'exploració

Cal evitar que un jugador intenti maximitzar cel·les fent:

```text
zig-zag artificial extrem
```

únicament per explotar la mecànica.

La solució concreta queda pendent d'anti-cheat i equilibratge.

---

# 62. Exploració en bicicleta

La velocitat més alta permet descobrir més superfície en menys temps.

Això no implica necessàriament que cada cel·la tingui la mateixa recompensa que en una activitat més lenta.

Aquesta és una decisió d'equilibratge pendent.

---

# 63. Exploració per modalitat

Es podrà decidir si existeixen mapes parcials per modalitat:

```text
explorat corrent
explorat caminant
explorat en bici
```

o només una descoberta global.

Per MVP es recomana una descoberta global amb estadístiques separades per modalitat.

---

# 64. Informació compartida entre modalitats

Si un usuari descobreix una zona fent MTB, no sembla necessari tornar-hi corrent només per eliminar el Fog.

Per tant, per defecte:

> la descoberta geogràfica és del jugador, no de la modalitat.

La modalitat queda registrada estadísticament.

---

# 65. Senyals de POI en Fog

Els POI poden generar diferents tipus d'indicis.

Exemple:

```text
?             contingut desconegut
🏔 ?          fita natural
💧 ?          possible aigua
🏛 ?          cultural
🚩 ?          bandera
```

La quantitat d'informació dependrà del tipus de contingut.

---

# 66. Descobriment per proximitat

Un element pot considerar-se descobert quan:

* el jugador passa prou a prop;
* la seva Activity és vàlida;
* la precisió GPS és suficient.

No cal necessàriament interactuar manualment per descobrir.

---

# 67. Interacció específica

Algunes recompenses sí que poden requerir interacció.

Exemple:

```text
POI descobert automàticament
```

però:

```text
POI confirmat
```

pot requerir una acció explícita.

---

# 68. No interrompre excessivament l'activitat

El joc no ha d'obligar el corredor a mirar constantment el mòbil.

Especialment durant:

* running;
* cycling;
* trail.

Les interaccions han de ser puntuals.

---

# 69. Informació postactivitat

Molts descobriments poden mostrar-se en acabar:

```text
ACTIVITAT COMPLETADA

+ 2,4 km² nous
+ 1 cim
+ 3 POI
+ 1 bandera descoberta
+ 14 cel·les actualitzades
```

Això redueix distraccions durant l'activitat.

---

# 70. Elements que sí requereixen interacció immediata

Principalment:

* atac a bandera;
* possible creació de bandera;
* accions específiques d'orientació.

La resta pot resoldre's automàticament.

---

# 71. Descobriments especials

El sistema pot tenir en el futur elements excepcionals:

* reptes temporals;
* POI especials;
* esdeveniments;
* fites estacionals.

No formen part necessària del MVP.

---

# 72. Privacitat i Fog

Fog of War és una mecànica de joc.

No s'ha de confondre amb privacitat.

Una zona descoberta per un usuari no implica que:

* els seus tracks siguin públics;
* altres jugadors coneguin on viu;
* altres usuaris vegin totes les seves activitats.

La privacitat tindrà regles independents.

---

# 73. Informació pública de POI

Els POI destinats a comunitat poden ser públics.

Però caldrà definir:

* autoria visible o no;
* fotografies;
* comentaris;
* historial.

---

# 74. Informació pública de Flags

Una Flag descoberta pot exposar informació de joc.

No ha d'exposar dades personals innecessàries del propietari.

---

# 75. Progressió exploratòria

Es poden calcular estadístiques com:

```text
km² explorats
cel·les descobertes
cims assolits
POI descoberts
regions visitades
percentatge de municipi explorat
```

Aquestes mètriques poden ser una progressió independent del PvP.

---

# 76. Jugador no competitiu

Un usuari ha de poder obtenir una experiència satisfactòria sense atacar ningú.

Pot centrar-se en:

* explorar;
* cims;
* POI;
* completar mapes;
* assoliments;
* turisme.

Això amplia el públic potencial.

---

# 77. Jugador competitiu

El mateix sistema d'exploració alimenta el PvP:

```text
exploro
↓
detecto rivals
↓
descobreixo banderes
↓
obtinc intel·ligència
↓
planifico atac
```

No cal crear un segon mapa independent.

---

# 78. Regles fixades

Es consideren acceptades:

* l'historial d'exploració és permanent;
* la informació tàctica es degrada;
* Fog no oculta necessàriament tots els indicis;
* les banderes poden ser detectables abans de ser descobertes;
* els indicis no han de revelar tota la informació;
* explorar físicament desbloqueja informació;
* una zona antiga necessita revisita per actualitzar-se;
* POI i Flags poden ser validats per visites reals;
* una bandera no necessita estar sobre un sender;
* cartografia és evidència, no autoritat absoluta;
* turista i local han de tenir incentius diferents;
* descobrir una Flag no és atacar-la.

---

# 79. Decisions pendents

Caldrà decidir:

1. mida de les cel·les d'exploració;
2. radi de descoberta al voltant del track;
3. calendari exacte de degradació;
4. informació visible en cada estat;
5. precisió dels indicis dins del Fog;
6. criteris de descoberta d'una Flag;
7. criteris de descoberta d'un POI;
8. recompensa d'exploració;
9. recompensa de cims;
10. tractament per modalitat;
11. sistema de validació comunitària;
12. límit de POI creats;
13. reputació necessària per crear contingut;
14. moderació;
15. fonts externes de POI.

---

# 80. Escenari: jugador local

```text
Oriol corre habitualment en una zona.

↓
Fog eliminat

↓
coneix:
territori
banderes
POI

↓
deixa d'anar-hi durant mesos

↓
informació passa a STALE

↓
torna a córrer

↓
descobreix:
nova bandera
nou propietari
POI nou

↓
coneixement refrescat
```

---

# 81. Escenari: turista

```text
Jugador arriba de vacances

↓
mapa principalment UNKNOWN

↓
veu:
🏔 ?
🚩 ?
★ ?

↓
planifica ruta cap a la zona

↓
fa Hiking

↓
descobreix:
cim
2 POI
bandera rival
territori

↓
tot queda al seu historial permanent
```

Un any més tard:

```text
historial continua visible
informació territorial → HISTORICAL
```

Si torna:

```text
reexplora
↓
actualitza la zona
```

---

# 82. Escenari: descoberta que provoca atac

```text
Fog
↓
🚩 ?

↓
Activity d'exploració

↓
Flag descoberta

Importància: alta
Propietari rival
Defense aproximada: mitjana

↓
el jugador torna a casa

↓
decideix preparar un atac

↓
nova Activity
ATTACK_FLAG
```

Aquest flux és intencionat.

---

# 83. Bucle exploratori principal

```text
veig una pista
      ↓
sento curiositat
      ↓
planifico ruta
      ↓
faig activitat
      ↓
descobreixo
      ↓
guanyo exploració
      ↓
apareixen nous objectius
      ↓
planifico nova activitat
```

---

# 84. Principi final

TerritoriLord no ha de tractar el món desconegut com una absència de contingut.

Ha de tractar-lo com una:

> **promesa de contingut.**

El Fog of War no serveix només per ocultar.

Serveix per generar curiositat.

---

# 85. Següent document

El següent artefacte recomanat és:

```text
docs/GAME-RULES-03-activity-power-validation.md
```

Ha de definir:

* què és una Activity vàlida;
* circularitat;
* diferències entre modalitats;
* càlcul conceptual de Power;
* distància;
* desnivell;
* exploració;
* rendiments decreixents;
* detecció d'activitats impossibles;
* anti-farming;
* relació entre Activity i atac/defensa.
