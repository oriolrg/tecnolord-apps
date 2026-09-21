# TerritoriLord — Decisions 00

**Estat:** registre de decisions v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document registra les decisions funcionals adoptades durant el disseny inicial de TerritoriLord.

La seva funció és evitar:

* reinterpretacions posteriors;
* decisions contradictòries;
* canvis implícits;
* que una SPEC, PLAN o implementació decideixi qüestions de producte que ja han estat resoltes.

Aquest document diferencia explícitament entre:

* **FIXAT** — decisió adoptada;
* **HIPÒTESI** — proposta encara per validar;
* **PENDENT** — decisió encara no presa.

---

# 2. Nom del projecte

## D-001 — Nom provisional

**Estat:** FIXAT provisionalment

Nom de treball:

```text
TerritoriLord
```

Directori:

```text
territorilord/
```

El nom comercial definitiu es podrà canviar en el futur.

---

# 3. Naturalesa del producte

## D-002 — Aplicació independent

**Estat:** FIXAT

TerritoriLord serà una aplicació independent d'OrientaTrack.

Pot compartir en el futur:

* components GPS;
* utilitats geogràfiques;
* lògica d'orientació;
* llibreries.

No es considera actualment un mòdul intern d'OrientaTrack.

---

## D-003 — El món físic és el tauler

**Estat:** FIXAT

TerritoriLord no serà un joc digital amb GPS afegit.

L'activitat física real serà necessària per a les accions principals.

---

# 4. Principi rector

## D-004 — Informació limitada del mapa

**Estat:** FIXAT

> **El mapa ha de donar prou informació per despertar curiositat, però no tanta com per eliminar la necessitat d'explorar físicament.**

Aquesta regla té prioritat en decisions relacionades amb:

* Fog of War;
* POI;
* banderes;
* intel·ligència territorial;
* orientació.

---

# 5. Motivacions del joc

## D-005 — Quatre capes de motivació

**Estat:** FIXAT

TerritoriLord combinarà:

1. explorar;
2. conquerir;
3. competir;
4. construir.

---

# 6. Activitat física

## D-006 — Modalitats diferenciades

**Estat:** FIXAT

El sistema diferenciarà com a mínim:

```text
RUNNING
TRAIL_RUNNING
WALKING
HIKING
CYCLING
MTB
```

Els criteris i coeficients exactes són PENDENTS.

---

## D-007 — Modalitat afecta el joc

**Estat:** FIXAT

La mateixa distància no tindrà necessàriament el mateix valor entre modalitats.

S'hauran de considerar:

* esforç;
* desnivell;
* durada;
* velocitat;
* capacitat d'exploració.

---

# 7. Activitats territorials

## D-008 — Circularitat

**Estat:** FIXAT

Per produir efectes territorials forts, l'activitat haurà de començar i acabar aproximadament al mateix lloc.

El radi concret és PENDENT.

---

## D-009 — Circularitat no és suficient

**Estat:** FIXAT

També s'hauran de validar:

* distància;
* durada;
* GPS;
* velocitat;
* continuïtat;
* possibles anomalies.

---

## D-010 — Validesa per capacitats

**Estat:** FIXAT

No existirà necessàriament només:

```text
valid = true / false
```

Una Activity podrà ser vàlida per unes funcionalitats i no per altres.

Exemple:

```text
CAN_COUNT_DISTANCE
CAN_EXPLORE
CAN_VISIT_POI
CAN_CAPTURE_TERRITORY
CAN_ATTACK_FLAG
CAN_DEFEND_FLAG
```

---

# 8. Territori

## D-011 — Territori intern per unitats geoespacials

**Estat:** FIXAT conceptualment

El territori no es gestionarà només com polígons arbitraris.

Internament es dividirà en unitats/cel·les geoespacials.

La tecnologia concreta és PENDENT.

---

## D-012 — Visualització contínua

**Estat:** FIXAT

Encara que internament existeixin cel·les, el jugador podrà percebre el territori com una superfície contínua.

---

## D-013 — Territori neutral

**Estat:** FIXAT

Una Activity circular vàlida podrà conquerir territori sense propietari.

---

## D-014 — Territori rival no es captura automàticament

**Estat:** FIXAT

Envoltar territori rival no implica captura instantània.

Es generarà pressió territorial contra defensa.

---

## D-015 — Conquesta gradual

**Estat:** FIXAT

Una zona rival pot requerir diverses Activities per ser capturada.

---

## D-016 — Defensa limitada

**Estat:** FIXAT

Cap TerritoryCell ni Flag podrà tenir defensa infinita.

Existiran:

* sostre;
* decadència;
* rendiments decreixents.

---

# 9. Fog of War

## D-017 — Fog de territori desconegut

**Estat:** FIXAT

Les zones no explorades ocultaran:

* territori;
* propietaris;
* fronteres;
* informació tàctica detallada.

---

## D-018 — Fog no significa mapa completament buit

**Estat:** FIXAT

Es podran mostrar indicis com:

```text
🚩 ?
★ ?
🏔 ?
```

per motivar l'exploració.

---

## D-019 — Indicis imprecisos

**Estat:** FIXAT

Una bandera o POI desconegut no ha de revelar necessàriament la coordenada exacta.

Es podrà indicar:

* zona;
* radi;
* cel·la aproximada;
* presència.

---

## D-020 — Intensitat dels indicis

**Estat:** FIXAT conceptualment

Elements especialment rellevants poden generar un senyal més destacat.

Per una Flag dependrà preferentment de la seva Importància, no de la seva Defense.

---

# 10. Historial i coneixement

## D-021 — Exploració permanent

**Estat:** FIXAT

Si un jugador ha explorat físicament una zona, aquesta dada forma part permanent del seu historial.

---

## D-022 — Coneixement territorial temporal

**Estat:** FIXAT

La informació tàctica d'una zona es degrada amb el temps.

---

## D-023 — Degradació progressiva

**Estat:** FIXAT

No existirà un canvi sobtat del tipus:

```text
364 dies = tot visible
365 dies = tot ocult
```

La degradació serà progressiva.

---

## D-024 — Aproximadament un any

**Estat:** HIPÒTESI

S'ha proposat que, aproximadament després d'un any sense relació significativa amb una zona, el coneixement pugui arribar a un estat principalment històric.

No és un llindar definitiu.

---

# 11. Domini i retenció del coneixement

## D-025 — El Fog depèn també del domini

**Estat:** FIXAT

La velocitat de degradació no dependrà exclusivament del temps.

També dependrà de:

* territori controlat;
* banderes pròpies;
* activitat recent;
* POI relacionats;
* presència territorial.

---

## D-026 — Banderes com ancoratges de coneixement

**Estat:** FIXAT

Una Flag pròpia farà que el coneixement de la zona pròxima es degradi més lentament.

No proporcionarà visió omniscient.

---

## D-027 — POI com ancoratge menor

**Estat:** FIXAT

POI creats, visitats o mantinguts poden alentir la degradació local, amb menys efecte que una Flag.

---

## D-028 — Pèrdua de domini accelera el Fog

**Estat:** FIXAT

Si un jugador:

* perd territori;
* perd banderes;
* deixa d'estar actiu;

la seva informació tàctica es degradarà més ràpidament.

---

# 12. Banderes

## D-029 — Nombre limitat

**Estat:** FIXAT

Cada jugador podrà tenir un nombre limitat de banderes.

---

## D-030 — Sostre global

**Estat:** FIXAT

Encara que el límit creixi amb la progressió, existirà un sostre.

El valor exacte és PENDENT.

---

## D-031 — Creation cap i control cap

**Estat:** HIPÒTESI RECOMANADA

Es considera convenient separar:

```text
FLAG_CREATION_CAP
FLAG_CONTROL_CAP
```

per evitar que limitar la creació impedeixi un PvP interessant.

Cal validar-ho.

---

## D-032 — Creació física

**Estat:** FIXAT

No es podrà plantar lliurement una bandera fent clic sobre qualsevol punt del mapa.

El jugador haurà d'haver estat físicament al lloc.

---

## D-033 — No necessita sender cartografiat

**Estat:** FIXAT

Una bandera pot estar en:

* cim;
* coll;
* mirador;
* clariana;
* font;
* roca;
* punt estratègic.

La condició és que sigui legítimament accessible.

---

## D-034 — Cartografia com evidència

**Estat:** FIXAT

L'absència d'un sender cartografiat no fa invàlida una ubicació.

Les dades cartogràfiques són evidència auxiliar.

---

# 13. Valors de bandera

## D-035 — Tres conceptes separats

**Estat:** FIXAT

Una Flag tindrà separats:

```text
Importance
Defense
Prestige
```

---

## D-036 — Importància comunitària

**Estat:** FIXAT

Importance dependrà principalment de l'activitat d'altres usuaris al lloc.

Especialment:

* usuaris diferents;
* visites;
* recurrència;
* activitat recent.

---

## D-037 — Diversitat > quantitat bruta

**Estat:** FIXAT

Cent visites del mateix jugador han de pesar molt menys que visites de molts jugadors independents.

---

## D-038 — Rendiments decreixents

**Estat:** FIXAT

Les visites repetides tindran rendiments decreixents.

---

## D-039 — Importància no implica invencibilitat

**Estat:** FIXAT

Importance podrà donar una bonificació limitada, però no una Defense proporcional sense sostre.

---

## D-040 — Valor del lloc persisteix

**Estat:** FIXAT

Quan una Flag canvia de propietari, no desapareixen:

* Importance;
* visites;
* Prestige del lloc;
* historial.

---

# 14. Visitar una bandera

## D-041 — Visitar no és atacar

**Estat:** FIXAT

Passar per una Flag pot aportar:

* descoberta;
* XP;
* importància;
* validació comunitària.

No inicia automàticament combat.

---

# 15. Atac de bandera

## D-042 — Atac explícit

**Estat:** FIXAT

Un FlagAttack sempre serà deliberat.

---

## D-043 — Selecció abans de sortir

**Estat:** FIXAT

La Flag objectiu s'haurà de seleccionar abans d'iniciar l'Activity.

---

## D-044 — Una bandera per Activity

**Estat:** FIXAT

```text
MAX_FLAG_ATTACKS_PER_ACTIVITY = 1
```

No importa la distància de l'Activity.

---

## D-045 — L'objectiu no canvia durant l'Activity

**Estat:** FIXAT

Una vegada iniciada l'activitat, no es podrà substituir la Flag objectiu.

---

# 16. Orientació

## D-046 — Atac com mini cursa d'orientació

**Estat:** FIXAT

Arribar a la zona general de la Flag no serà suficient.

El jugador haurà de localitzar físicament el punt.

---

## D-047 — Navegació no exacta

**Estat:** FIXAT conceptualment

L'app podrà proporcionar:

* zona;
* proximitat;
* indicis.

No necessàriament navegació precisa fins a la coordenada.

---

## D-048 — Interacció manual

**Estat:** FIXAT

Quan el jugador creu ser al lloc correcte haurà d'executar explícitament l'acció d'atac.

---

# 17. Validació GPS d'atac

## D-049 — Tres resultats

**Estat:** FIXAT

Un intent de localització podrà ser:

```text
CONFIRMED
UNCERTAIN
INCORRECT
```

---

## D-050 — UNCERTAIN no penalitza

**Estat:** FIXAT

Si `accuracy` és insuficient per decidir, el jugador no serà penalitzat.

---

## D-051 — INCORRECT penalitza l'atac actual

**Estat:** FIXAT

Una posició clarament incorrecta reduirà AttackEfficiency.

No reduirà XP global ni Reputation.

---

## D-052 — Accuracy forma part de la decisió

**Estat:** FIXAT

No es validarà únicament la distància matemàtica a la Flag.

---

## D-053 — Radi 10–20 m

**Estat:** HIPÒTESI

S'ha proposat un radi aproximat de 10–20 metres, adaptat a accuracy.

Cal provar-lo físicament.

---

# 18. Resolució de l'atac

## D-054 — Trobar la Flag no resol la batalla

**Estat:** FIXAT

Després de localitzar-la, l'Activity ha de continuar.

---

## D-055 — Cal completar l'activitat

**Estat:** FIXAT

L'atac només es resol després de:

* finalitzar;
* complir circularitat;
* validar l'Activity.

---

## D-056 — Activitat invàlida anul·la combat

**Estat:** FIXAT

Una Flag localitzada durant una Activity posteriorment invàlida no genera captura.

---

# 19. Power

## D-057 — Power associada a l'Activity

**Estat:** FIXAT

Power no serà un saldo permanent acumulable indefinidament.

---

## D-058 — Components inicials

**Estat:** FIXAT conceptualment

Power podrà derivar de:

```text
PhysicalPower
ExplorationPower
DiscoveryPower
```

amb contribució del desnivell.

---

## D-059 — Exploració nova aporta Power

**Estat:** FIXAT

Descobrir zones noves tindrà una bonificació significativa.

---

## D-060 — Cims i POI poden aportar Power limitada

**Estat:** FIXAT

La recompensa no serà infinita ni repetible indefinidament.

---

## D-061 — Distància no lineal

**Estat:** FIXAT

No existirà una equivalència simple:

```text
1 km = 1 Power
```

---

## D-062 — Rendiments decreixents

**Estat:** FIXAT

Activitats extremes continuaran tenint valor però no escalaran indefinidament.

---

# 20. AttackPower

## D-063 — Fórmula conceptual

**Estat:** FIXAT conceptualment

```text
EffectiveAttack =
ActivityPower × AttackEfficiency
```

amb possibles modificadors futurs limitats.

---

# 21. Defense

## D-064 — Defensa mitjançant activitat real

**Estat:** FIXAT

No existirà un simple botó per afegir defensa.

El propietari haurà de realitzar activitat física.

---

## D-065 — Defensa limitada

**Estat:** FIXAT

Defense tindrà sostre.

---

## D-066 — Decadència

**Estat:** FIXAT

La inactivitat farà disminuir progressivament Defense.

---

## D-067 — Defensa repetida amb rendiments decreixents

**Estat:** FIXAT

Micro-rutes repetides no permetran arribar immediatament al màxim.

---

# 22. Captura

## D-068 — Atacs parcials

**Estat:** FIXAT

Un atac insuficient pot reduir la defensa sense capturar.

---

## D-069 — Captura quan la defensa és superada

**Estat:** FIXAT conceptualment

Quan EffectiveAttack supera la defensa restant, la Flag canvia de propietari.

---

## D-070 — Reinici parcial de defensa

**Estat:** FIXAT conceptualment

El nou propietari no hereta tota la fortificació anterior.

El valor concret és PENDENT.

---

## D-071 — Bonus de reconquesta

**Estat:** HIPÒTESI

Es considera interessant una bonificació temporal i limitada de reconquesta per fomentar rivalitats.

S'ha de provar.

---

# 23. POI

## D-072 — POI del sistema i comunitaris

**Estat:** FIXAT

Podran existir ambdós tipus.

---

## D-073 — POI comunitaris denunciables

**Estat:** FIXAT

Altres usuaris podran denunciar:

* inexistència;
* duplicat;
* propietat privada;
* ubicació incorrecta;
* accés perillós;
* altres problemes.

---

## D-074 — Denúncies no eliminen automàticament

**Estat:** FIXAT

Caldrà moderació o suficient evidència.

---

## D-075 — Valor pel món real

**Estat:** FIXAT

El valor d'un POI creat per un usuari augmentarà principalment quan altres persones l'utilitzin o validin físicament.

---

# 24. Cims

## D-076 — Cims independents del PvP

**Estat:** FIXAT

Un cim és una fita del món.

No pertany automàticament a cap jugador.

---

## D-077 — Primera ascensió especialment valuosa

**Estat:** FIXAT conceptualment

La primera visita personal aportarà més recompensa que les repeticions.

---

# 25. Progressió

## D-078 — XP diferent de Power

**Estat:** FIXAT

```text
XP != Power
```

---

## D-079 — XP és permanent

**Estat:** FIXAT

Serveix per progressió general.

---

## D-080 — Level no multiplica fortament el PvP

**Estat:** FIXAT

Un veterà no obtindrà grans multiplicadors automàtics d'atac/defensa.

---

## D-081 — Level pot ampliar opcions

**Estat:** FIXAT

Per exemple:

* banderes;
* personalització;
* funcionalitats;
* estadístiques.

---

# 26. Prestige

## D-082 — Prestige és historial/reconeixement

**Estat:** FIXAT

No és equivalent a Defense ni AttackPower.

---

## D-083 — Perdre territori no esborra Prestige històric

**Estat:** FIXAT

La derrota afecta el present, no tota la trajectòria.

---

# 27. Reputation

## D-084 — Reputation és confiança comunitària

**Estat:** FIXAT

S'utilitzarà principalment per:

* POI;
* denúncies;
* validacions;
* contribucions.

---

## D-085 — Reputation no dona força directa

**Estat:** FIXAT

No ha de proporcionar avantatge PvP significatiu.

---

# 28. Jugadors locals i visitants

## D-086 — No bonus per domicili

**Estat:** FIXAT

No existirà una bonificació explícita perquè una persona resideixi en una zona.

---

## D-087 — Avantatge local emergent

**Estat:** FIXAT

El local tindrà avantatge natural per:

* constància;
* informació actual;
* defensa;
* presència.

---

## D-088 — Visitant progressa

**Estat:** FIXAT

El turista podrà:

* explorar;
* descobrir;
* aconseguir cims;
* POI;
* banderes;
* territori;
* historial.

---

# 29. Privacitat

## D-089 — Activitats privades per defecte

**Estat:** FIXAT

Els efectes del joc no requeriran publicar el track complet.

---

## D-090 — Inici/final sensibles

**Estat:** FIXAT

No es mostraran públicament per defecte.

---

## D-091 — Sense ubicació rival en temps real

**Estat:** FIXAT

El PvP no exposarà per defecte on es troba físicament un altre jugador.

---

## D-092 — Resultat separat del track

**Estat:** FIXAT

Es podrà publicar una captura territorial sense publicar la ruta exacta.

---

# 30. Seguretat i anti-cheat

## D-093 — Email verificat

**Estat:** FIXAT

Funcionalitats sensibles requeriran email verificat.

---

## D-094 — GPS incert no és frau

**Estat:** FIXAT

Errors de dispositiu no han de convertir-se automàticament en acusacions.

---

## D-095 — PvP exigeix més confiança

**Estat:** FIXAT

La validació serà progressivament més estricta:

```text
registre
<
exploració
<
territori
<
defensa
<
atac
```

---

## D-096 — Una anomalia no implica sanció

**Estat:** FIXAT

S'han de combinar evidències.

---

## D-097 — Comptes múltiples

**Estat:** FIXAT

No es promet garantir una persona = un compte.

Es reduirà el benefici del comportament Sybil.

---

## D-098 — Activitats importades i PvP

**Estat:** FIXAT provisionalment

Els atacs i defenses requeriran enregistrament/interacció en viu.

No es podran importar retroactivament.

---

# 31. Monetització

## D-099 — Porta oberta a monetització

**Estat:** FIXAT

L'arquitectura ho haurà de permetre en el futur.

---

## D-100 — No pay-to-win

**Estat:** FIXAT

No es vendrà directament:

* AttackPower;
* Defense;
* territori;
* invulnerabilitat;
* captures.

---

## D-101 — Possibles serveis Premium

**Estat:** HIPÒTESI

* estadístiques avançades;
* planificació;
* personalització;
* exportació;
* mapes;
* clubs;
* analítica.

---

# 32. Desenvolupament

## D-102 — Desenvolupament incremental

**Estat:** FIXAT

El projecte es desenvoluparà per fases.

Cada fase inclourà:

```text
SPEC
PLAN
TASKS
IMPLEMENTACIÓ
TESTS
PROVA REAL
DECISIÓ
```

---

## D-103 — No avançar automàticament

**Estat:** FIXAT

Cada fase podrà quedar:

```text
ACCEPTED
ACCEPTED_WITH_CHANGES
REJECTED
```

---

## D-104 — Proves outdoor

**Estat:** FIXAT

Les funcionalitats GPS i de joc físic no es consideraran validades únicament amb tests automatitzats.

---

## D-105 — Vertical slice principal

**Estat:** FIXAT

La primera gran fita és arribar aproximadament a la Fase 9:

```text
explorar
↓
descobrir Flag
↓
planificar atac
↓
orientar-se
↓
completar Activity
↓
resoldre combat
```

---

# 33. MVP

## D-106 — MVP centrat en el bucle principal

**Estat:** FIXAT

No s'intentarà implementar inicialment tot TerritoriLord.

---

## D-107 — Fora del primer MVP

**Estat:** FIXAT

Inicialment poden quedar fora:

* monetització;
* clans;
* xat;
* imports externs;
* Reputation avançada;
* moderació sofisticada;
* anti-cheat avançat;
* rànquings complexos;
* social avançat.

---

# 34. Decisions numèriques encara obertes

**Estat:** PENDENT

No estan fixats:

* mida TerritoryCell;
* radi d'exploració;
* CircularityRadius;
* radi de visita;
* Power;
* Defense màxima;
* decadència;
* rendiments decreixents;
* TerritoryBudget;
* FlagInfluenceRadius;
* FLAG_CREATION_CAP;
* FLAG_CONTROL_CAP;
* corba XP;
* nivells;
* cooldowns;
* períodes exactes de Fog.

Aquests valors s'han de derivar de:

* prototips;
* proves;
* dades reals;
* equilibratge.

No s'han d'inventar dins d'una SPEC tècnica.

---

# 35. Decisions arquitectòniques obertes

**Estat:** PENDENT

Encara s'ha de decidir:

* stack concret;
* model de dades;
* PostGIS o alternatives;
* sistema concret de cel·les;
* motor de mapes;
* PWA/app nativa;
* sistema d'autenticació;
* arquitectura frontend/backend;
* hosting;
* sincronització offline;
* persistència de tracks;
* fonts cartogràfiques.

---

# 36. Regla per a futures SPEC

Una SPEC pot:

* concretar una decisió ja adoptada;
* implementar-la;
* detectar una contradicció.

Una SPEC no pot canviar silenciosament una decisió d'aquest document.

Si apareix una necessitat de canvi:

```text
DECISION CHANGE
↓
actualitzar DECISIONS
↓
actualitzar documents afectats
↓
després SPEC
```

---

# 37. Regla davant silencis

L'absència d'una decisió en aquest document no significa aprovació d'una opció.

Si un punt continua PENDENT:

> s'ha de resoldre explícitament quan sigui necessari.

---

# 38. Fonts autoritatives del projecte

Ordre conceptual de consulta:

```text
DECISIONS-00
        ↓
PROJECT-CONTEXT
        ↓
GAME-DESIGN
        ↓
GAME-RULES
        ↓
DOMAIN-MODEL
        ↓
MVP
        ↓
DEVELOPMENT-PHASES
        ↓
SPEC / PLAN / TASKS
```

En cas de contradicció accidental, s'ha de revisar explícitament abans d'implementar.

---

# 39. Documents actuals

```text
territorilord/
└── docs/
    ├── PROJECT-CONTEXT.md
    ├── GAME-DESIGN-00.md
    ├── DOMAIN-MODEL-00.md
    ├── GAME-RULES-01-territory-flags-combat.md
    ├── GAME-RULES-02-exploration-fog-poi.md
    ├── GAME-RULES-03-activity-power-validation.md
    ├── GAME-RULES-04-progression-reputation-economy.md
    ├── GAME-RULES-05-security-privacy-anticheat.md
    ├── MVP-00-scope.md
    ├── DEVELOPMENT-PHASES-00.md
    ├── DECISIONS-00.md
    └── decisions/
```

---

# 40. Estat actual

El disseny funcional inicial està prou avançat per començar a preparar la primera fase tècnica.

Encara no s'ha de desenvolupar directament el sistema complet.

El següent pas és preparar:

```text
SPEC-00 — Project Foundation / Fase 0
```

amb l'únic objectiu de construir una base local executable, testable i preparada per les fases posteriors.

---

# 41. Principi final

> **Primer fixem la regla, després l'especifiquem, després la desenvolupem i finalment la provem al món real.**

Cap resultat de disseny s'ha de donar per bo només perquè sigui elegant sobre el paper.
