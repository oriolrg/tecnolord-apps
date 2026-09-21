# TerritoriLord — Experiments 00

**Estat:** pla experimental funcional v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document defineix els experiments necessaris per validar les decisions que TerritoriLord ha deixat deliberadament obertes.

L'objectiu és evitar:

```text id="5z8m9d"
decidir números sobre paper
↓
implementar-los
↓
descobrir massa tard que no funcionen al món real
```

En lloc d'això:

```text id="pbn9ff"
HIPÒTESI
↓
PROTOTIP
↓
PROVA
↓
DADES
↓
DECISIÓ
```

---

# 2. Principi experimental

No tota decisió necessita la mateixa evidència.

Es diferencien tres tipus.

## Experiments tècnics

Validen:

* GPS;
* PWA;
* bateria;
* background;
* sincronització;
* cobertura;
* rendiment.

## Experiments geoespacials

Validen:

* H3;
* resolucions;
* geometria;
* circularitat;
* TerritoryCell;
* Fog.

## Experiments de joc

Validen:

* comprensió;
* motivació;
* equilibri;
* orientació;
* Power;
* Defense;
* decadència.

---

# 3. Regla de resultat

Cada experiment acabarà amb un dels estats:

```text id="s769h6"
ACCEPTED
ACCEPTED_WITH_CHANGES
REJECTED
INCONCLUSIVE
```

`INCONCLUSIVE` significa que no hi ha evidència suficient per decidir.

No s'ha de convertir en una aprovació implícita.

---

# 4. Registre mínim d'un experiment

Cada prova haurà de registrar:

```text id="ut03sd"
experiment_id
date
app_version
rules_version
device
OS/browser
activity_type
conditions
result
observations
decision
```

Quan sigui rellevant també:

* meteorologia;
* entorn urbà/rural;
* cobertura;
* bateria inicial/final;
* GPS accuracy;
* distància;
* durada.

---

# EXP-01 — Resolució H3 d'Exploration

## Pregunta

Quina mida de `ExplorationCell` permet que descobrir territori sigui:

* perceptible;
* progressiu;
* visualment interessant;
* prou precís?

## Hipòtesi

Les ExplorationCells han de ser sensiblement més petites que les TerritoryCells.

## Prova

Realitzar recorreguts:

* urbans;
* sender;
* muntanya;
* pista;
* recorregut irregular.

Representar el mateix track amb diverses resolucions H3 candidates.

## Observar

* nombre de cel·les descobertes;
* aparença visual;
* granularitat;
* sensació de progrés;
* artefactes estranys;
* cost de renderització;
* volum de dades.

## Evitar

Una resolució tan gran que:

> caminar uns metres descobreixi una zona enorme.

O tan petita que:

> el mapa sembli soroll digital.

## Resultat

Resolució inicial d'ExplorationCell.

---

# EXP-02 — Resolució H3 de Territory

## Pregunta

Quina mida ha de tenir una TerritoryCell perquè una conquesta sigui comprensible i tingui valor?

## Prova

Utilitzar diverses rutes circulars:

* curta;
* mitjana;
* llarga;
* urbana;
* muntanya.

Mostrar-les amb diferents resolucions.

## Observar

* quantes cel·les captura una Activity;
* fronteres;
* llegibilitat;
* sensació de control;
* fragmentació excessiva.

## Criteri

TerritoryCell ha de ser prou gran perquè cada cel·la tingui significat, però no tan gran que un circuit petit produeixi resultats absurds.

---

# EXP-03 — Relació Exploration / Territory

## Pregunta

Les dues resolucions triades funcionen bé conjuntament?

## Prova

Mostrar simultàniament:

```text id="w5l8rr"
Fog detallat
+
Territory control
```

## Validar

Que sigui comprensible que:

```text id="29jhm9"
una TerritoryCell
pot contenir múltiples ExplorationCells
```

sense generar confusió visual.

---

# EXP-04 — Llindar del 75%

## Pregunta

Quan una TerritoryCell es considera prou dins del polígon d'una ruta?

## Hipòtesi inicial

```text id="hc56nh"
>= 75 %
```

## Prova

Comparar almenys:

```text id="vsnaz2"
50 %
60 %
75 %
90 %
100 %
```

sobre diferents circuits.

## Observar

Especialment cel·les:

* a les vores;
* tallades per la ruta;
* en angles;
* en circuits estrets.

## Criteri

La conquesta visual ha de correspondre aproximadament amb la percepció humana de:

> «aquesta zona estava dins del meu circuit.»

## Important

El `75 %` no és un requisit a defensar.

És la primera hipòtesi.

---

# EXP-05 — TerritoryBudget

## Pregunta

Com evitar que una ruta enorme produeixi una captura desproporcionada?

## Prova

Simular:

* 3 km;
* 10 km;
* 25 km;
* activitats molt llargues.

Comparar:

```text id="2nmjjk"
surface enclosed
vs
territory affected
```

## Validar

Que una Activity gran tingui avantatge legítim sense convertir-se en:

```text id="9a1do4"
més km
=
conquesta il·limitada
```

## Resultat

Model inicial de TerritoryBudget.

No necessàriament fórmula definitiva.

---

# EXP-06 — CircularityRadius

## Pregunta

Quina distància entre inici i final continua percebent-se com una ruta circular?

## Prova

Activitats reals acabades a:

* mateix punt;
* molt a prop;
* una mica separades;
* clarament separades.

## Considerar

* GPS accuracy;
* distància total;
* tipus d'activitat;
* entorn.

## Evitar

Una regla rígida absurda com:

> 51 metres = invàlid
> 49 metres = vàlid

si la precisió GPS no ho justifica.

## Resultat

Primera regla de circularitat.

---

# EXP-07 — Geometries circulars estranyes

## Pregunta

Què passa amb tracks que tècnicament tornen al punt inicial però tenen una geometria inadequada?

## Casos

* anar i tornar pel mateix camí;
* figura de vuit;
* loops múltiples;
* track que s'autointerseca;
* corredor molt estret;
* volta amb gran desviació GPS.

## Objectiu

Evitar que:

```text id="msb66b"
start ≈ finish
```

sigui l'única condició per generar territori.

---

# EXP-08 — Radi d'interacció amb Flag

## Pregunta

A quina distància real s'ha de considerar que l'usuari ha localitzat una Flag?

## Hipòtesi inicial

Ordre de magnitud:

```text id="81mvu2"
10–20 m
```

però no és definitiu.

## Prova

Intentar validar una mateixa Flag des de diferents distàncies.

Registrar:

* distància real;
* accuracy;
* entorn;
* resultat.

## Entorns

* carrer obert;
* bosc;
* muntanya;
* parets;
* vall;
* nucli urbà.

## Resultat

No necessàriament un radi únic.

Pot derivar en una regla que combini:

```text id="9ool38"
distance
+
accuracy
```

---

# EXP-09 — CONFIRMED / UNCERTAIN / INCORRECT

## Pregunta

Podem distingir de manera justa entre error del jugador i mala precisió GPS?

## Prova

Generar casos coneguts de:

* posició correcta + accuracy bona;
* correcta + accuracy dolenta;
* incorrecta + accuracy bona;
* incorrecta + accuracy dolenta.

## Criteri crític

Quan el sistema dubta:

```text id="jjgp89"
UNCERTAIN
```

és preferible a penalitzar injustament.

---

# EXP-10 — Orientació: quant revelar?

## Pregunta

Quanta informació necessita el jugador per trobar una Flag sense eliminar el joc d'orientació?

## Variants

### A

Coordenada gairebé exacta.

### B

Radi aproximat.

### C

Indicador de proximitat.

### D

Només àrea/cel·la.

### E

Combinació progressiva.

## Mesurar

* temps per trobar-la;
* errors;
* frustració;
* ús excessiu del mòbil;
* satisfacció.

## Pregunta clau

> El jugador s'està orientant o simplement seguint un GPS?

---

# EXP-11 — Fog: quant amagar?

## Pregunta

Quina informació genera curiositat sense generar frustració?

## Provar

Diferents graus:

```text id="0nfqbl"
res visible
?
tipus d'element
zona aproximada
intensitat
```

## Mesurar

Després d'una sessió:

> Què t'ha fet voler anar cap a una zona concreta?

---

# EXP-12 — Fog: DETECTED

## Pregunta

El nivell `DETECTED` aporta valor real?

## Prova

Comparar:

```text id="p3z5q8"
UNKNOWN → DISCOVERED
```

contra:

```text id="zk328j"
UNKNOWN → DETECTED → DISCOVERED
```

## Criteri

`DETECTED` ha de generar:

* curiositat;
* planificació;

no soroll visual.

---

# EXP-13 — Knowledge decay

## Pregunta

A quina velocitat ha de degradar-se la informació?

## No esperar un any

El rellotge del sistema es simularà.

Per exemple:

```text id="bcg77n"
1 setmana
1 mes
3 mesos
6 mesos
1 any
```

com a escenaris simulats, no necessàriament valors finals.

## Observar

Quina informació continua sent útil en:

* DISCOVERED;
* STALE;
* HISTORICAL.

---

# EXP-14 — KnowledgeRetention per domini

## Pregunta

Quant ha de frenar la degradació:

* territori;
* Flags;
* activitat habitual?

## Casos simulats

### Zona A

Explorada i abandonada.

### Zona B

Territori propi sense Flag.

### Zona C

Territori propi + Flag.

### Zona D

Territori propi + activitat recurrent.

## Criteri

La diferència ha de ser perceptible però no convertir control territorial en omniscència.

---

# EXP-15 — Territori desconnectat

## Pregunta

Quin desavantatge necessita una illa territorial remota?

## Provar

* defensa;
* decadència;
* KnowledgeRetention;

amb diferents modificadors.

## Criteri

Ha de continuar sent viable conquistar territori durant viatges.

No ha de convertir-se en territori inútil només perquè estigui lluny.

---

# EXP-16 — FlagDefense base

## Pregunta

Quanta activitat ha de ser necessària per capturar una Flag?

## Prova

Encara sense equilibratge final, simular:

```text id="uz8d89"
Flag baixa
Flag mitjana
Flag forta
```

contra activitats reals de diferent magnitud.

## Criteri

Evitar:

### Massa fàcil

```text id="96vnkl"
qualsevol Activity
→ qualsevol Flag
```

### Massa difícil

```text id="pi39vn"
necessito una setmana
per atacar una bandera normal
```

---

# EXP-17 — TerritorySupport a una Flag

## Pregunta

Quant ha d'influir el territori circumdant en FlagDefense?

## Model provisional

```text id="kcqhr3"
EffectiveFlagDefense
=
FlagDefense
+
bounded TerritorySupport
```

## Prova

Comparar:

* Flag aïllada;
* Flag en territori petit;
* Flag en gran domini.

## Criteri

El territori ha de tenir valor estratègic sense generar fortaleses impossibles.

---

# EXP-18 — Passive Maintenance

## Pregunta

Quina diferència hi ha d'haver entre:

```text id="co2ijo"
passar per una Flag
```

i:

```text id="9scw27"
DEFEND_FLAG
```

## Criteri

L'activitat quotidiana ha de tenir valor.

Però si `Passive Maintenance` és massa potent:

> DEFEND_FLAG deixa de tenir sentit.

---

# EXP-19 — Defense decay

## Pregunta

Quant temps pot quedar una Flag sense activitat abans de tornar-se vulnerable?

## Prova

Simular temps accelerat.

Observar:

* jugador habitual;
* jugador ocasional;
* jugador absent.

## Criteri

No exigir manteniment diari.

Però tampoc permetre conservar indefinidament un imperi abandonat.

---

# EXP-20 — Power vs distància

## Pregunta

Com evitar una relació lineal excessiva?

## Provar conceptualment diferents corbes:

```text id="4lbh9t"
linear
sqrt-like
log-like
segments
caps
```

No cal comprometre's amb una funció matemàtica ara.

## Objectiu

Una Activity de 100 km ha de ser impressionant.

Però no ha de valer automàticament deu vegades una de 10 km en PvP.

---

# EXP-21 — Elevation contribution

## Pregunta

Quant ha de valorar-se el desnivell?

## Prova

Comparar activitats de:

* distància similar;
* terreny pla;
* desnivell moderat;
* desnivell alt.

## Important

Cal evitar premiar artificialment:

* errors d'altitud;
* tracks sorollosos.

---

# EXP-22 — ExplorationPower

## Pregunta

Quanta bonificació ha de donar explorar territori nou?

## Prova

Comparar:

```text id="g86dik"
10 km repetits
```

contra:

```text id="jtd694"
10 km majoritàriament nous
```

## Objectiu

Fer atractiu explorar sense penalitzar excessivament qui entrena habitualment a la mateixa zona.

---

# EXP-23 — DiscoveryPower

## Pregunta

Quin valor tenen:

* Summit;
* POI;
* Flag descoberta;

dins una Activity?

## Criteri

Ha d'afegir motivació.

No ha de permetre:

```text id="c7m6fg"
ruta artificial
passant per 40 POI
=
Power absurda
```

Caldran caps/rendiments decreixents.

---

# EXP-24 — AttackEfficiency

## Pregunta

Quina penalització ha de generar un intent `INCORRECT`?

## Provar

Diverses intensitats.

## Criteri

Un error ha de tenir conseqüència.

Però una primera equivocació no ha de destruir automàticament tota una Activity llarga.

---

# EXP-25 — Atac insuficient

## Pregunta

Com se sent una batalla gradual?

## Prova

Simular:

```text id="ryovob"
Attack 1
→ DAMAGED

Attack 2
→ DAMAGED

Attack 3
→ CAPTURED
```

## Preguntes

* genera motivació per tornar?
* sembla arbitrari?
* el defensor té temps raonable per reaccionar?

---

# EXP-26 — Notificació d'atac

## Pregunta

La notificació immediata afegeix emoció o frustració?

## Prova

Mostrar:

> La teva bandera està sent atacada.

sense acció immediata possible.

## Observar

* emoció;
* ansietat;
* comprensió.

## Important

La UI haurà d'explicar clarament:

> l'atac ja està bloquejat i es resoldrà quan l'altre jugador acabi l'activitat.

---

# EXP-27 — UserFlag transportada

## Pregunta

Quant temps ha de tenir un jugador per replantar una UserFlag capturada?

## Provar

Diferents terminis simulats.

## Criteri

Ha de permetre organitzar una nova sortida.

No ha de permetre acumular una col·lecció permanent de banderes “a la motxilla”.

---

# EXP-28 — FLAG_CREATION_CAP

## Pregunta

Quantes UserFlags necessita realment un jugador?

## No decidir abans d'usar-les.

Registrar durant proves:

* quantes crea;
* quantes defensa;
* quantes recorda;
* quantes generen decisions de ruta.

## Criteri

El límit ha de crear escassetat estratègica sense sentir-se artificial.

---

# EXP-29 — FLAG_CONTROL_CAP

## Pregunta

Quantes Flags pot controlar un jugador sense saturar el món?

## Considerar

Relació possible amb:

* Level;
* territori;
* captures.

## Criteri

Evitar efecte bola de neu:

```text id="bsjy7p"
més territori
→ més Flags
→ més defensa
→ encara més territori
→ ...
```

---

# EXP-30 — Abandonament de UserFlag

## Pregunta

Quin cooldown necessita l'abandonament remot?

## Objectiu

Evitar:

```text id="j6qte4"
abandonar
↓
recuperar slot immediat
↓
plantar
↓
abandonar
```

com a forma de teletransportar capacitat territorial.

---

# EXP-31 — PWA GPS amb pantalla activa

## Pregunta

La PWA registra adequadament tracks reals?

## Prova

Diversos dispositius i navegadors.

Mesurar:

* freqüència de mostres;
* accuracy;
* pèrdua de punts;
* bateria.

---

# EXP-32 — PWA amb pantalla bloquejada

## Pregunta crítica

Què passa amb l'enregistrament quan:

* la pantalla s'apaga;
* el navegador queda en background;
* el telèfon entra en estalvi de bateria?

## Resultat possible

Si la fiabilitat és insuficient:

> avançar el client natiu pot convertir-se en una prioritat molt anterior al previst.

Aquest experiment és un dels primers riscos tècnics a validar.

---

# EXP-33 — Canvi d'app durant Activity

## Prova

Durant una ruta:

* obrir càmera;
* WhatsApp;
* trucada;
* bloquejar/desbloquejar;
* canviar d'aplicació.

## Validar

Que TerritoriLord no perdi silenciosament una part important del track.

---

# EXP-34 — Consum de bateria

## Pregunta

Quin cost té una Activity real?

## Proves

* 30 min;
* 1 h;
* 3 h;
* activitat llarga.

Registrar:

```text id="fzp9vs"
battery_start
battery_end
GPS sample count
screen usage
sync usage
```

## Criteri

No fixar un objectiu arbitrari abans de disposar de mesures.

Comparar configuracions.

---

# EXP-35 — Freqüència de mostreig GPS

## Pregunta

Quina freqüència ofereix prou detall sense gastar bateria/emmagatzematge excessius?

## Comparar

Diferents estratègies:

* temps;
* distància;
* adaptativa.

## Mesurar

* geometria;
* distància calculada;
* bateria;
* bytes.

---

# EXP-36 — Volum de Raw GPS

## Pregunta

Quant emmagatzematge real necessita conservar totes les mostres?

## Mesurar

Després de diverses Activities:

```text id="3l71pp"
bytes / hour
samples / hour
compressed size
```

Projectar:

```text id="3ye0ib"
100 users
1.000 users
10.000 users
```

## Decisió futura

Determinar:

* retenció raw;
* compressió;
* cold storage;
* simplificació.

---

# EXP-37 — Sync amb cobertura intermitent

## Prova

Simular:

```text id="bb87jc"
online
↓
offline
↓
online
↓
offline
```

durant la mateixa Activity.

## Validar

* ordre de chunks;
* reintents;
* idempotència;
* cap punt duplicat;
* cap punt perdut.

---

# EXP-38 — Finalització offline

## Prova

Acabar una Activity sense Internet.

Tancar l'app.

Recuperar connexió més tard.

## Resultat obligatori

L'Activity ha de poder:

```text id="cpdoz9"
COMPLETED_LOCAL
↓
SYNC
↓
VALIDATED
```

sense intervenció complexa de l'usuari.

---

# EXP-39 — Atac amb cobertura limitada

## Pregunta

És acceptable exigir Internet al punt d'atac?

## Proves reals

Intentar en:

* poble;
* bosc;
* cim;
* vall;
* zona amb cobertura intermitent.

## Registrar

* operadora;
* senyal;
* latència;
* èxit.

## Pregunta de producte

> He arribat físicament fins a la Flag i no puc atacar per falta de cobertura: quant frustra això?

Aquest és un experiment crític.

---

# EXP-40 — Atac amb connexió breu

## Pregunta

Quanta connexió necessita realment `ATTACK_IN_PROGRESS`?

## Prova

Comprovar si és suficient una transacció curta per:

```text id="e3q830"
validate
+
lock
+
ack
```

i després continuar offline.

## Objectiu

Minimitzar la dependència de cobertura permanent.

---

# EXP-41 — MapLibre + moltes cel·les

## Pregunta

Pot el client representar de manera fluida:

* Fog;
* ExplorationCells;
* TerritoryCells;
* Flags;
* POI;
* Track?

## Prova

Carregar densitats creixents.

## Mesurar

* FPS;
* temps de render;
* memòria;
* resposta al zoom/pan.

---

# EXP-42 — Densitat urbana

## Pregunta

El model territorial funciona en zones molt denses?

## Prova

Simular:

* moltes Activities;
* moltes Flags;
* POI;
* fronteres curtes.

## Observar

Saturació visual i comprensió.

---

# EXP-43 — Densitat rural

## Pregunta

El mateix model continua sent interessant amb pocs jugadors?

## Prova

Simular una zona amb:

* 1 jugador;
* 2 jugadors;
* molt territori neutral.

## Pregunta clau

> El joc continua sent útil encara sense PvP?

Ha de funcionar gràcies a:

* exploració;
* cims;
* POI;
* turisme;
* progrés personal.

---

# EXP-44 — Motivació després de la primera Activity

## Pregunta

El mapa genera una raó per tornar a sortir?

## Després de l'activitat preguntar:

* què et crida l'atenció del mapa?
* on aniries la propera vegada?
* per què?
* hi ha massa informació?
* massa poca?

## Èxit

L'usuari pot identificar espontàniament algun objectiu futur.

---

# EXP-45 — Motivació no competitiva

## Pregunta

Una persona que no vol PvP continua trobant valor en TerritoriLord?

## Prova

Donar accés només a:

* Exploration;
* Fog;
* Summit;
* POI;
* historial.

## Validar

Que el producte no depengui exclusivament de rivals actius.

---

# EXP-46 — Comprensió de PublicFlagSite vs UserFlag

## Pregunta

Els jugadors entenen les dues tipologies?

## Prova

Sense explicar excessivament, mostrar:

```text id="5bhzos"
PublicFlagSite
UserFlag
```

i preguntar:

* què creus que passa si la captures?
* pots moure-la?
* què significa?

## Si genera confusió

Caldrà treballar:

* noms;
* iconografia;
* UX.

No necessàriament canviar el model.

---

# EXP-47 — FlagPrestige vs LocationImportance

## Pregunta

La distinció és comprensible?

## Cas

Una UserFlag famosa és robada i transportada a un lloc poc visitat.

## Validar

Que la UI pugui comunicar:

```text id="hjhu7p"
bandera famosa
+
ubicació nova poc important
```

sense semblar contradictori.

---

# EXP-48 — QR patrocinat i GPS

## Pregunta

Quin ClaimRadius és adequat?

## Proves

* comerç petit;
* museu;
* mirador;
* plaça;
* punt outdoor.

## Mesurar

* accuracy;
* fals rebuig;
* fals acceptat;
* possibilitat d'escanejar des de fora.

## Resultat

El radi pot variar segons tipus de POI.

No cal que sigui global.

---

# EXP-49 — QR compartit

## Prova

Escanejar el QR des de:

* mateix lloc;
* 50 m;
* 500 m;
* altra població.

## Validar

Que:

```text id="mlsqxt"
valid QR
+
invalid location
=
NO REWARD
```

---

# EXP-50 — Campanya “Descobreix 8 indrets”

## Objectiu

Validar tot el loop turístic.

## Preparació

Crear 8 POI de prova.

Alguns:

* públics;
* menys coneguts;
* comerç;
* mirador.

## Usuari

No coneix prèviament la zona.

## Mesurar

* quants visita;
* en quin ordre;
* si entén les pistes;
* si l'app realment el fa descobrir llocs;
* si la recompensa importa;
* si completaria una altra campanya.

---

# EXP-51 — Sponsored POI i percepció publicitària

## Pregunta

Quan una promoció aporta valor i quan molesta?

## Prova

Comparar diferents presentacions.

## Preguntar

* ho has percebut com publicitat?
* t'ha aportat un motiu real per visitar-lo?
* interferia amb el mapa?

## Principi

El contingut patrocinat ha d'estar identificat.

Però també ha d'aportar utilitat.

---

# EXP-52 — Pay-to-win perception

## Pregunta

Els jugadors perceben les funcionalitats turístiques/comercials com un avantatge competitiu injust?

## Prova

Presentar:

* Discovery Pass;
* Sponsored POI;
* bonus XP;
* informació turística.

## Validar

Que l'usuari entengui:

```text id="c3dmpa"
pagar
→ més experiència/contenut

NO

pagar
→ més força PvP
```

---

# EXP-53 — Seguretat de localització

## Pregunta

La informació mostrada permet inferir la casa o ubicació habitual d'un jugador?

## Prova

Revisar:

* inicis;
* finals;
* tracks;
* territoris;
* horaris;
* repeticions.

## Objectiu

Detectar exposició indirecta encara que no es publiqui el track complet.

---

# EXP-54 — Zona privada / inaccessible

## Pregunta

Què passa si una Flag o POI queda físicament inaccessible?

## Prova

Simular:

* finca privada;
* carretera perillosa;
* penya-segat;
* tancament temporal.

## Validar

* reports;
* restricció;
* radi segur;
* moderació.

---

# EXP-55 — Ús excessiu del mòbil

## Pregunta

TerritoriLord obliga a mirar massa la pantalla durant activitat física?

## Observar en:

* Fog;
* orientació;
* Attack;
* mapes;
* notificacions.

## Criteri

El joc no ha de convertir una sortida outdoor en:

> caminar mirant una pantalla constantment.

---

# EXP-56 — Primera setmana

## Objectiu

Validar retenció inicial.

## Prova amb validadors

Durant diversos dies observar:

* nombre d'Activities;
* territoris nous;
* objectius triats;
* retorn espontani.

## Pregunta central

> Quina mecànica t'ha fet tornar?

---

# EXP-57 — Primera derrota

## Pregunta

Perdre territori o una Flag és motivador o provoca abandonament?

## Observar

* frustració;
* voluntat de reconquesta;
* comprensió del que ha passat.

## Principi

La derrota ha d'afectar l'estat actual.

No destruir el progrés personal.

---

# EXP-58 — Primera reconquesta

## Pregunta

Recuperar una Flag genera una recompensa emocional superior a una captura normal?

## Resultat

Aquest experiment ajudarà a decidir si realment necessitem un bonus explícit de reconquesta.

Actualment:

```text id="mw8mct"
RECONQUEST BONUS = HIPÒTESI
```

No està fixat.

---

# EXP-59 — Rivalitat emergent

## Pregunta

Les disputes repetides generen rivalitats espontànies?

## Observar

Si els jugadors:

* recorden noms;
* planifiquen contra els mateixos rivals;
* valoren determinats FlagSites.

## Resultat

Determinar si cal una capa explícita de Rivalry o si l'historial ja és suficient.

---

# EXP-60 — El joc funciona amb molt poca població

## Pregunta crítica

Què passa si TerritoriLord només té uns pocs usuaris en una comarca?

## Prova

Simular món gairebé buit.

## Ha de continuar oferint

* Exploration;
* Fog;
* Summit;
* POI;
* PublicFlagSite neutral;
* progrés personal;
* TourismCampaign.

## Criteri

El producte no pot necessitar massa crítica de jugadors per ser útil des del primer dia.

---

# 5. Prioritat dels experiments

No tots s'han de fer alhora.

---

# PRIORITAT P0 — abans o durant les primeres fases

Aquests poden invalidar decisions arquitectòniques:

```text id="a3zj3d"
EXP-31 PWA GPS
EXP-32 pantalla bloquejada
EXP-33 background
EXP-34 bateria
EXP-35 sampling GPS
EXP-36 emmagatzematge
EXP-37 sync
EXP-38 finalització offline
```

Especialment:

```text id="fdsvwx"
EXP-32
```

pot accelerar la necessitat d'una app nativa.

---

# PRIORITAT P1 — Exploration / Territory

Quan arribem a F3/F4:

```text id="fnk03x"
EXP-01
EXP-02
EXP-03
EXP-04
EXP-05
EXP-06
EXP-07
EXP-11
EXP-12
```

---

# PRIORITAT P2 — Flag / Orientation / PvP

Quan arribem a F6–F10:

```text id="7ycvlc"
EXP-08
EXP-09
EXP-10
EXP-16
EXP-17
EXP-18
EXP-20
EXP-21
EXP-22
EXP-23
EXP-24
EXP-25
EXP-26
EXP-39
EXP-40
```

---

# PRIORITAT P3 — Persistència del món

F11–F16:

```text id="0pp7ri"
EXP-13
EXP-14
EXP-15
EXP-19
EXP-27
EXP-28
EXP-29
EXP-30
EXP-57
EXP-58
EXP-59
```

---

# PRIORITAT P4 — Turisme i monetització

Quan el core ja estigui validat:

```text id="v3cp09"
EXP-48
EXP-49
EXP-50
EXP-51
EXP-52
```

---

# 6. Experiments de producte transversals

Aquests s'han de repetir diverses vegades:

```text id="3gqgn5"
EXP-44 motivació
EXP-45 no-PvP
EXP-55 ús pantalla
EXP-56 retenció inicial
EXP-60 baixa densitat
```

No són una prova única.

---

# 7. Resultats que poden modificar decisions

Els experiments poden portar a canviar decisions provisionals com:

* PWA first;
* H3;
* MapLibre;
* radi d'interacció;
* threshold 75%;
* atac obligatòriament online;
* retenció raw GPS.

Això no és un fracàs.

És precisament l'objectiu del procés experimental.

---

# 8. Resultats que NO poden canviar silenciosament principis de producte

Un experiment no ha de convertir automàticament en negociables principis com:

```text id="kc1y95"
Physical activity remains central
No pay-to-win
Visit ≠ Attack
Exploration history permanent
No live rival location
User GPS errors are not automatically fraud
```

Si una prova suggereix canviar un d'aquests principis:

```text id="yicww4"
EXPERIMENT
↓
DESIGN REVIEW
↓
DECISION CHANGE
↓
documents
```

No es canvia només com a ajust tècnic.

---

# 9. Evidència quantitativa i qualitativa

Sempre que sigui possible combinar:

## Quantitativa

* metres;
* accuracy;
* bateria;
* bytes;
* FPS;
* temps;
* nombre d'intents;
* nombre de visites.

## Qualitativa

* frustració;
* comprensió;
* motivació;
* percepció de justícia;
* curiositat.

TerritoriLord és un producte físic i lúdic.

Només les mètriques tècniques no seran suficients.

---

# 10. Regla de calibratge

Els primers valors adoptats després d'un experiment continuaran sent:

```text id="ty4bdf"
CALIBRATION V1
```

no constants eternes.

Sempre que afectin resultats històrics s'haurà de considerar `RulesVersion`.

---

# 11. Experiment report

Cada experiment completat haurà de poder generar:

```text id="lmf965"
EXPERIMENT-REPORT-XX
```

amb:

1. hipòtesi;
2. configuració;
3. evidència;
4. resultats;
5. anomalies;
6. conclusió;
7. decisió;
8. documents afectats.

---

# 12. Principi final

> **No intentarem encertar el joc abans de jugar-hi.**

Els documents defineixen el sistema que volem construir.

Els experiments determinaran:

* quant;
* a quina distància;
* amb quina resolució;
* durant quant temps;
* amb quina intensitat.

Aquestes respostes s'obtindran progressivament amb dades tècniques i activitat física real.
