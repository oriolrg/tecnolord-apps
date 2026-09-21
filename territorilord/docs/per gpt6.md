# TerritoriLord — Auditoria global del disseny funcional abans de SPEC-00

Actua com a **arquitecte de producte, game designer de sistemes geolocalitzats, arquitecte de software i revisor tècnic sènior**.

Estàs executant-te mitjançant Codex dins del workspace general:

```text
tecnolord-apps/
```

Aquest workspace conté múltiples projectes independents.

La teva tasca NO és desenvolupar TerritoriLord.

La teva tasca és fer una **auditoria profunda, crítica i transversal de tota la documentació funcional existent abans de començar `SPEC-00`**.

---

# 0. ABAST ESTRICTE

El projecte que has d'auditar és exclusivament:

```text
tecnolord-apps/territorilord/
```

La documentació principal es troba a:

```text
tecnolord-apps/territorilord/docs/
```

NO auditïs com a part de TerritoriLord els directoris germans com:

```text
orientatrack/
biblioteca/
entrenador-personal/
opos-backend/
opos-web/
pap_backend/
speclord/
backend/
site/
infra/
...
```

Aquests altres projectes només es poden consultar si un document de TerritoriLord hi fa una referència explícita que sigui necessària per entendre una decisió concreta.

Per exemple, pots inspeccionar `orientatrack/` si necessites verificar una afirmació explícita sobre possible reutilització futura, però:

- no l'auditis;
- no en dedueixis requisits nous per a TerritoriLord;
- no el modifiquis;
- no barregis el seu model amb el de TerritoriLord.

L'autoritat d'aquesta auditoria és el contingut existent sota:

```text
territorilord/
```

---

# 1. OBJECTIU PRINCIPAL

Determina si el disseny funcional actual de TerritoriLord és:

- coherent;
- complet en allò necessari;
- prou estable;
- implementable per fases;
- compatible amb l'arquitectura prevista;
- resistent als principals exploits funcionals;
- segur des del punt de vista de privacitat;
- segur des del punt de vista d'ús físic outdoor;
- preparat per començar especificacions tècniques.

No pressuposis que el disseny és correcte perquè estigui extensament documentat.

Busca activament:

- contradiccions;
- buits funcionals;
- regles circulars;
- comportaments emergents indesitjats;
- exploits;
- problemes de gameplay;
- problemes de domini;
- problemes de privacitat;
- problemes de seguretat;
- dependències incorrectes entre fases;
- decisions tècniques preses massa aviat;
- decisions necessàries encara no preses;
- detall funcional perdut durant consolidacions documentals.

L'objectiu final és determinar si podem passar de:

```text
FUNCTIONAL DESIGN
```

a:

```text
SPEC-00
```

sense construir sobre contradiccions o omissions importants.

---

# 2. IMPORTANT — NO DESENVOLUPIS

Durant aquesta tasca NO has de:

- escriure codi;
- modificar codi;
- generar `SPEC`;
- generar `PLAN`;
- generar `TASKS`;
- implementar funcionalitats;
- crear migracions;
- definir endpoints;
- definir l'esquema SQL final;
- crear components;
- decidir fórmules numèriques d'equilibratge;
- decidir arbitràriament resolucions H3;
- reescriure directament la documentació existent.

La teva feina és:

```text
INSPECT
↓
UNDERSTAND
↓
COMPARE
↓
CHALLENGE
↓
REPORT
```

---

# 3. ÚNICA MODIFICACIÓ PERMESA

No modifiquis cap fitxer existent.

No:

- moguis;
- reanomenis;
- eliminis;
- arxivis;
- reformatis;

cap document existent.

Això inclou documents que consideris:

- obsolets;
- duplicats;
- contradictoris.

Pots crear únicament:

```text
territorilord/docs/QA-00-FUNCTIONAL-DESIGN-GPT6.md
```

amb el resultat complet de l'auditoria.

Si aquest fitxer ja existeix abans de començar:

1. llegeix-lo;
2. no sobreescriguis silenciosament evidència anterior;
3. crea una nova versió amb un nom inequívoc si cal.

No facis cap altra modificació al workspace.

Abans d'acabar comprova:

```bash
git status
git diff
```

o equivalents, si Git està disponible.

Confirma dins de l'informe que no has modificat cap altre fitxer.

---

# 4. PRIMER PAS — INVENTARI REAL DE TERRITORILORD

Abans de fer conclusions:

1. inspecciona recursivament `territorilord/`;
2. inspecciona especialment `territorilord/docs/`;
3. identifica tots els documents funcionals existents;
4. identifica versions antigues i consolidades;
5. identifica còpies o duplicats potencials;
6. identifica documents sense successor;
7. identifica tots els fitxers de decisions;
8. identifica Glossary, Traceability, Scenarios, Experiments, MVP i roadmap;
9. identifica qualsevol QA previ;
10. comprova l'estat Git rellevant per `territorilord/` si està disponible.

No assumeixis que la llista inclosa en aquest prompt és exhaustiva.

Els noms dels fitxers poden contenir:

- espais;
- guions;
- versions;
- textos descriptius.

Treballa sobre els fitxers reals, no sobre noms inferits.

## Situació intencionada

És intencionat que temporalment puguin coexistir, per exemple:

```text
GAME-DESIGN-00.md
GAME-DESIGN-00 v0.2 consolidat.md
```

o equivalents.

Aquesta coexistència NO significa que una de les dues versions es pugui eliminar automàticament.

Precisament una part important de l'auditoria és determinar si les versions consolidades han preservat tota la informació funcional vàlida de les anteriors.

---

# 5. JERARQUIA D'AUTORITAT

Per interpretar contradiccions utilitza aquesta prioritat.

## Nivell 1 — Decisions explícites

Localitza tots els documents sota:

```text
territorilord/docs/decisions/
```

i qualsevol altre document de decisions dins de `territorilord/docs/`.

Pot haver-hi noms tant del tipus:

```text
DECISIONS-00.md
DECISIONS-01.md
DECISIONS-02 ...
DECISIONS-03 ...
```

com:

```text
DECISION-001 ...
```

o altres `DECISION-*` / `DECISIONS-*`.

NO assumeixis que només existeixen quatre documents.

Determina l'ordre temporal o l'autoritat a partir de:

- numeració;
- versió;
- contingut;
- dependències explícites;
- data si està disponible.

Una decisió posterior i explícita preval sobre una regla antiga incompatible.

Una nova decisió no invalida automàticament contingut anterior que sigui compatible.

---

## Nivell 2 — GLOSSARY

Utilitza el `GLOSSARY-*` vigent per interpretar el significat actual dels conceptes.

No ha de sobreescriure una decisió explícita.

També has de detectar si el Glossary mateix està incomplet o no està sincronitzat amb decisions posteriors.

---

## Nivell 3 — Documents funcionals consolidats

Versions marcades com:

```text
consolidat
v0.2
v0.3
```

o equivalents.

Però aplica obligatòriament la reconciliació de versions indicada més endavant.

---

## Nivell 4 — Documents funcionals originals

Les versions originals continuen sent fonts potencialment vàlides de:

- detall;
- casos límit;
- exemples;
- invariants;
- riscos;
- hipòtesis encara compatibles;
- domain events;
- criteris antiabús;
- comportaments que una síntesi posterior pugui haver omès.

---

## Regla crítica

> Una omissió en una versió consolidada NO equival automàticament a una decisió d'eliminar aquella regla.

---

## Contradicció no resoluble documentalment

Si dues fonts entren en conflicte i cap `DECISION-*` permet establir quina preval:

```text
DECISION NEEDED
```

No escullis arbitràriament.

---

# 6. RECONCILIACIÓ DE VERSIONS — OBLIGATÒRIA

El repositori pot contenir, per al mateix document:

- versió inicial;
- versió posterior;
- versió consolidada;
- còpia accidental.

NO assumeixis que:

```text
versió nova
=
superset perfecte de versió antiga
```

Les versions consolidades es van crear principalment per incorporar decisions posteriors.

Durant la síntesi podria haver-se perdut detall funcional útil.

Has de comparar explícitament cada família de versions.

---

# 7. CLASSIFICACIÓ DE DIFERÈNCIES

Per cada diferència rellevant utilitza una de les categories següents.

## PRESERVED

La informació antiga està correctament conservada a la versió nova.

---

## SUPERSEDED

La informació antiga ha quedat legítimament substituïda.

Indica:

- per quina decisió;
- per quin document;
- per quina regla posterior.

---

## LOST_DETAIL

Informació útil de la versió antiga que:

- no apareix a la consolidada;
- continua sent compatible;
- no ha estat explícitament descartada.

Aquesta categoria és especialment important.

---

## CONTRADICTION

Dues regles no poden coexistir.

Indica si:

```text
DECISION-*
DECISIONS-*
```

permeten resoldre la contradicció.

Si no:

```text
DECISION NEEDED
```

---

## DUPLICATION

Informació repetida sense valor semàntic addicional.

---

## NEW_IN_CONSOLIDATED

Informació introduïda legítimament a la versió nova.

---

# 8. NO CONFONGUIS SÍNTESI AMB REVOCACIÓ

Si un document antic desenvolupa detalladament:

- una mecànica;
- casos límit;
- factors;
- exemples;
- estats;
- transicions;
- antiabús;
- criteris;
- informació visible;
- comportament davant errors;

i la versió nova només manté una frase resumida:

NO concloguis que el detall s'ha descartat.

Avalua si aquest detall:

1. continua sent compatible;
2. continua sent útil;
3. hauria de tornar a la futura versió canònica.

---

# 9. OBJECTIU DE LA RECONCILIACIÓ

NO has de generar encara els documents canònics finals.

Has de determinar què haurà de contenir posteriorment una versió canònica que sigui:

> el conjunt coherent de tota la informació funcional vàlida acumulada fins ara.

La versió canònica haurà de conservar:

- decisions actuals;
- detall útil;
- casos límit;
- invariants;
- riscos;
- exemples útils.

Però eliminar:

- contradiccions;
- duplicació innecessària;
- conceptes superats;
- hipòtesis ja resoltes.

---

# 10. MODEL ACTUAL DE FLAGS — REVISIÓ PRIORITÀRIA

El model actual diferencia:

```text
PublicFlagSite
UserFlag
UserFlagPlacement
```

Això substitueix models antics basats en una única entitat `Flag`.

Revisa totes les regles antigues relacionades amb Flags i determina si són aplicables a:

```text
BOTH
PUBLIC_FLAG_SITE_ONLY
USER_FLAG_ONLY
SUPERSEDED
```

Presta especial atenció a:

- ownership;
- creator;
- placement;
- Prestige;
- LocationImportance;
- Defense;
- Influence;
- TerritorySupport;
- visits;
- captura;
- transport;
- retorn;
- replantació;
- neutralitat;
- historial.

NO recuperis mecànicament regles antigues de `Flag` si el nou model les fa incompatibles.

---

# 11. CORE PRODUCT LOOP

Avalua si aquest loop és coherent:

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
Validation
↓
Result
↓
new motivation
```

Busca:

- passos sense incentiu;
- passos redundants;
- dead ends;
- comportaments frustrants;
- dependències circulars;
- mecàniques que eliminin les ganes de repetir;
- situacions on l'usuari pugui quedar sense saber què fer.

El criteri de producte principal és:

> TerritoriLord ha de generar noves activitats físiques, no simplement temps dins l'app.

---

# 12. ACTIVITAT FÍSICA

Comprova que l'activitat física continua sent realment central.

Avalua especialment:

- Activity;
- ActivityType;
- ActivityPurpose;
- ActivityState;
- ValidationCapabilities;
- circularity;
- moving time;
- elevation;
- offline recording;
- raw GPS;
- sync;
- server authority;
- imported Activities;
- Power.

Pregunta't:

> existeix alguna forma de progressar significativament sense fer l'activitat física que el producte pretén incentivar?

---

# 13. ACTIVITY VALIDATION

Revisa que sigui coherent separar:

```text
ACTIVITY RECORDED
```

de:

```text
ACTIVITY VALID FOR SPECIFIC GAME CAPABILITIES
```

Comprova especialment:

```text
CAN_COUNT_DISTANCE
CAN_EXPLORE
CAN_VISIT_POI
CAN_CAPTURE_TERRITORY
CAN_ATTACK_FLAG
CAN_DEFEND_FLAG
```

Busca situacions on una única anomalia pugui invalidar injustament tota una Activity.

---

# 14. CIRCULARITY

Revisa:

- start/end proximity;
- GPS accuracy;
- geometria;
- microloops;
- anar/tornar pel mateix camí;
- figures de vuit;
- paths autointersectats;
- loops enormes;
- geometria artificial.

No decideixis `CircularityRadius`.

Determina si el problema està correctament preparat per experimentació.

---

# 15. EXPLORATION / KNOWLEDGE / FOG

Revisa exhaustivament la separació:

```text
Exploration
Knowledge
Fog
DiscoveryAccess
PhysicalDiscovery
```

Especialment:

```text
Exploration ≠ Knowledge
DiscoveryAccess ≠ PhysicalDiscovery
```

Revisa:

- UNKNOWN;
- DETECTED;
- DISCOVERED;
- STALE;
- HISTORICAL;
- KnowledgeRetention;
- territorial anchors;
- Flag anchors;
- POI anchors;
- pèrdua de domini;
- degradació;
- baixa densitat de jugadors.

Busca contradiccions entre:

- historial permanent;
- informació temporal;
- control territorial;
- Fog.

---

# 16. TERRITORY

Analitza:

- `TerritoryCell`;
- H3;
- diferència Exploration/Territory resolution;
- polígon de la ruta;
- threshold experimental;
- TerritoryBudget;
- TerritoryPressure;
- TerritoryDefense;
- connected/disconnected territory;
- isolation;
- neutral territory;
- rival territory;
- decadència.

Busca especialment exploits amb:

- loops gegants;
- loops estrets;
- anar/tornar pel mateix camí;
- shapes estranyes;
- territori remot;
- encerclament;
- fragmentació;
- bola de neu territorial.

No decideixis números finals.

---

# 17. TERRITORY BUDGET

Avalua el concepte de:

```text
TerritoryBudget
```

Comprova:

- si és realment necessari;
- si evita conquestes desproporcionades;
- si genera problemes de selecció de cel·les;
- si les versions antigues contenen criteris útils de priorització que s'han perdut.

No dissenyis encara la fórmula definitiva.

---

# 18. CONNECTED / DISCONNECTED TERRITORY

Comprova que sigui coherent permetre territori desconnectat per:

- viatges;
- turisme;
- ús real outdoor.

Però amb pitjor:

- consolidació;
- defensa;
- retenció;

sense convertir-lo en territori inútil.

Busca possibles exploits de teleport estratègic mitjançant viatges o activitat remota.

---

# 19. PUBLIC FLAGS

Revisa si `PublicFlagSite` té un model coherent.

Ha de poder representar:

- ubicació fixa;
- owner variable;
- neutralitat;
- Importance;
- Prestige;
- Defense;
- visibility policy;
- historial.

Comprova especialment si la combinació:

```text
public landmark
+
competitive objective
+
Fog
```

és coherent.

---

# 20. USER FLAGS

Revisa especialment:

```text
creation
↓
placement
↓
defense
↓
capture
↓
transport
↓
replant
```

i:

```text
transport
↓
timeout
↓
return previous location
↓
OWNER = NONE
```

Busca exploits relacionats amb:

- slots;
- capture;
- carrying;
- replanting;
- abandon;
- remote actions;
- control caps;
- creation caps;
- territory ownership;
- FlagPrestige;
- LocationImportance.

---

# 21. FLAG_CREATION_CAP / FLAG_CONTROL_CAP

Comprova que separar:

```text
FLAG_CREATION_CAP
FLAG_CONTROL_CAP
```

sigui coherent.

Busca:

- saturació del mapa;
- bloqueig injust de captures;
- exploits amb abandonament;
- acumulació de banderes transportades;
- bola de neu per Level o Territory.

No decideixis els valors.

---

# 22. FLAG PRESTIGE / LOCATION IMPORTANCE

Revisa estrictament:

```text
FlagPrestige
≠
LocationImportance
```

Per UserFlag:

```text
FlagPrestige
→ viatja amb l'objecte

LocationImportance
→ queda al lloc
```

Comprova que cap document consolidat o antic torni a barrejar aquests conceptes.

---

# 23. VISIT ≠ ATTACK

Revisa que una visita pugui:

- descobrir;
- refrescar Knowledge;
- aportar Importance;
- generar progrés legítim;

sense iniciar:

- Attack;
- Defense damage;
- Capture.

Busca documents on la distinció no sigui clara.

---

# 24. ATTACK / ORIENTATION / PVP

Revisa:

- target selected before Activity;
- max one target;
- immutable target;
- Visit != Attack;
- orientation;
- `CONFIRMED`;
- `UNCERTAIN`;
- `INCORRECT`;
- AttackEfficiency;
- `ATTACK_IN_PROGRESS`;
- locking;
- immediate notification;
- no live attacker location;
- Activity completion before resolution;
- Attack vs Defense.

Busca especialment:

- race conditions funcionals;
- exploits;
- griefing;
- impossibilitat de defensar-se;
- defensa reactiva injusta;
- atacs eterns;
- locks que puguin quedar penjats;
- problemes per mala cobertura.

No cal dissenyar encara la implementació tècnica del locking.

---

# 25. ATTACK_IN_PROGRESS

Revisa especialment aquest estat.

Quan l'atac és confirmat:

```text
ATTACK_IN_PROGRESS
```

el defensor pot ser notificat.

Però no ha de poder:

- eliminar la Flag;
- abandonar-la;
- moure-la;
- substituir-la;
- aplicar defensa retroactiva al combat actual.

Comprova:

- com acaba l'estat;
- què passa si l'atacant abandona;
- què passa si l'Activity no sincronitza immediatament;
- què passa si finalment és invalidada.

Si algun cas no està definit, registra'l.

No inventis la solució si pot esperar la SPEC corresponent.

---

# 26. CONNECTIVITY RISK DEL PVP

Una decisió actual és:

```text
Activity recording = offline capable
ATTACK action = online required initially
```

Avalua críticament aquesta decisió.

Especialment en:

- muntanya;
- zones remotes;
- valls;
- cobertura intermitent.

No dissenyis ara un protocol offline complet.

Determina si és:

```text
ACCEPTABLE INITIAL LIMITATION
MAJOR PRODUCT RISK
BLOCKER
```

i per què.

Comprova que els experiments existents permetin validar aquesta decisió.

---

# 27. POWER

Revisa la separació:

```text
PhysicalPower
ExplorationPower
DiscoveryPower
ActivityPower
XP
```

Especialment:

```text
XP ≠ Power
```

Comprova:

- loops de farming;
- esport extrem dominant;
- exploració dominant;
- POI farming;
- moltes descobertes en una única Activity;
- multiplicadors explosius;
- coherència entre modalitats esportives;
- rendiments decreixents.

No proposis fórmules numèriques finals.

---

# 28. MODALITATS ESPORTIVES

Comprova que:

```text
RUNNING
TRAIL_RUNNING
WALKING
HIKING
CYCLING
MTB
```

puguin coexistir sense que una sigui òbviament superior per una simple propietat com la distància.

Revisa especialment:

- distance;
- moving time;
- elevation;
- activity type;
- exploration;
- plausible speed.

No cal equilibrar-les numèricament ara.

---

# 29. DEFENSE

Revisa:

- FlagDefense;
- TerritoryDefense;
- TerritorySupport;
- Flag influence si apareix en versions antigues;
- Passive Maintenance;
- `DEFEND_FLAG`;
- decay;
- caps;
- diminishing returns.

Pregunta't si:

- un jugador pot crear fortaleses permanents;
- mantenir territori és massa costós;
- un jugador ocasional queda exclòs;
- un jugador hiperactiu esdevé matemàticament imbatible.

---

# 30. PROGRESSION

Revisa:

- XP;
- Level;
- Prestige;
- Reputation;
- Achievements;
- rankings;
- permanent vs temporary progress.

Especialment:

```text
FlagPrestige ≠ LocationImportance
Prestige ≠ Reputation
Level ≠ combat strength
XP ≠ Power
```

Revisa també informació útil de versions antigues sobre:

- player profiles;
- multidimensional progression;
- achievements;
- account limits;
- progressió no PvP;
- prestige local/regional.

Determina què mereix conservar-se a la futura versió canònica.

---

# 31. PERMANENT VS TEMPORARY PROGRESS

Comprova que el model diferenciï clarament:

## Permanent

Exemples:

- XP;
- Level;
- Achievements;
- ExplorationHistory;
- SummitHistory;
- historical Prestige.

## Temporal

Exemples:

- TerritoryOwnership;
- FlagOwnership;
- FlagDefense;
- TerritoryDefense;
- current Knowledge;
- pressure.

Principi:

```text
temporary defeat
≠
erase permanent progression
```

---

# 32. POI / SUMMITS

Revisa:

- SystemPOI;
- CommunityPOI;
- SponsoredPOI;
- Summit;
- visits;
- reports;
- moderation;
- Reputation;
- accessibility.

Busca:

- spam;
- farming;
- private property;
- unsafe points;
- duplicate content;
- malicious reports.

---

# 33. TOURISM / MONETIZATION

Avalua conceptualment:

```text
TourismCampaign
DiscoveryAccess
SponsoredDiscoveryZone
SponsoredPOI
SponsoredClaim
VisitorPass
VISIT_CLAIM
ACTIVITY_CLAIM
```

Comprova que:

```text
tourism
≠
pay-to-win
```

Revisa especialment:

- QR + GPS;
- shared QR photos;
- ClaimRadius;
- sponsor-defined rewards;
- privacy;
- analytics;
- monetització B2B;
- monetització B2G;
- monetització B2C;
- baixa densitat de jugadors.

No converteixis aquestes funcionalitats en abast del primer MVP.

---

# 34. SPONSORED CLAIMS

Revisa que un claim pugui exigir conceptualment:

```text
valid QR/token
+
active campaign
+
authenticated user
+
valid current GPS
+
accuracy
+
ClaimLocationPolicy
+
reuse policy
```

Comprova especialment:

```text
QR possession
≠
physical visit
```

Busca:

- shared QR photos;
- GPS spoofing;
- multiple claims;
- multiaccount;
- sponsor abuse.

---

# 35. PRIVACITAT

Revisa:

- raw GPS;
- start/end;
- ActivityVisibility;
- TrackVisibility;
- PrivacyZone;
- patterns;
- timestamps;
- territorial results;
- live location;
- attack notifications;
- sponsors;
- tourism analytics.

Busca no només exposicions directes sinó també:

> inferències indirectes.

Exemple:

```text
repeated activities
+
times
+
start/end patterns
+
territory
→ possible home/work inference
```

---

# 36. FOG NO ÉS PRIVACITAT

Comprova que cap document utilitzi:

```text
Fog
```

com a única mesura de privacitat.

Fog és:

> mecànica de joc.

No és un control d'accés de dades sensibles.

---

# 37. SEGURETAT FÍSICA

Aquest és un producte outdoor.

Analitza riscos com:

- propietat privada;
- carreteres;
- penya-segats;
- barrancs;
- zones restringides;
- punts no accessibles;
- mirar massa el mòbil;
- perseguir rivals;
- arribar exactament a coordenades perilloses.

No sacrifiquis seguretat per precisió de gameplay.

---

# 38. ANTI-CHEAT

Revisa:

- spoofing;
- impossible speed;
- GPS jumps;
- timestamp inconsistency;
- multiaccount;
- Sybil;
- farming;
- capture trading;
- report abuse;
- SponsoredClaim abuse.

Mantén el principi:

```text
anomaly
≠
fraud
```

Comprova que l'anti-cheat MVP sigui suficient sense exigir un sistema excessivament complex prematurament.

---

# 39. SYBIL

No assumeixis que TerritoriLord pot garantir:

```text
1 human = 1 account
```

sense mecanismes intrusius.

Avalua si el disseny redueix prou els incentius mitjançant:

- diminishing returns;
- Reputation;
- account age;
- limits;
- trust weighting;
- behavioural patterns;
- rate limits.

---

# 40. MODERATION

Revisa la separació:

```text
CONTENT
GAME_INTEGRITY
SAFETY
```

Comprova:

- reports;
- report abuse;
- temporary restriction;
- community evidence;
- admin review;
- least privilege.

Safety pot necessitar resposta més ràpida que altres tipus de moderació.

---

# 41. ARQUITECTURA ACTUAL

Avalua críticament les decisions actuals:

```text
PWA first
client + backend API
PostgreSQL
PostGIS
H3
MapLibre
server authoritative
raw GPS + derived data
local-first recorder
chunked idempotent sync
monorepo
```

No proposis un stack nou només perquè existeixin alternatives.

Només qüestiona una decisió arquitectònica si detectes:

- incompatibilitat;
- risc greu;
- bloqueig del roadmap;
- problema real amb els requisits físics.

---

# 42. PWA

Revisa especialment el risc de:

- background GPS;
- locked screen;
- battery;
- browser suspension;
- lifecycle del navegador;
- notificacions.

No concloguis automàticament que cal app nativa.

Comprova si els experiments previstos permeten decidir-ho amb evidència.

---

# 43. POSTGIS + H3

Comprova que la combinació sigui conceptualment coherent per:

- GPS;
- geometria;
- polígons;
- distàncies;
- ExplorationCell;
- TerritoryCell;
- adjacency.

No cal definir encara exactament quina operació correspon a cada tecnologia.

---

# 44. SERVER AUTHORITATIVE

Comprova que sigui compatible amb:

- offline Activity;
- sync posterior;
- validation;
- PvP;
- result resolution;
- RulesVersion.

El client pot fer previews.

El servidor decideix resultats competitius.

---

# 45. RAW VS DERIVED

Comprova que existeixi una separació clara entre:

```text
RAW GPS
```

i:

```text
DERIVED RESULTS
```

Avalua si es pot recalcular o auditar:

- distance;
- elevation;
- Power;
- Territory;
- Attack result.

No decideixis encara la política de retenció definitiva.

---

# 46. DOMAIN MODEL

Revisa `DOMAIN-MODEL-00` com a model conceptual.

Busca:

- entitats redundants;
- entitats que barregen responsabilitats;
- missing relationships;
- state/history confusion;
- current state vs events;
- domain events útils perduts entre versions;
- invariants no representats.

No converteixis el document en esquema SQL.

---

# 47. DOMAIN EVENTS

Comprova les versions antigues per detectar events conceptuals útils que potser s'han perdut.

Exemples possibles:

```text
ActivityStarted
ActivityCompleted
ActivityValidated
CellDiscovered
KnowledgeRefreshed
TerritoryCaptured
FlagCreated
FlagDiscovered
FlagVisited
FlagCaptured
...
```

No exigeix Event Sourcing.

Només determina si els events són útils per entendre el domini o l'auditabilitat.

---

# 48. CURRENT STATE VS HISTORY

Revisa especialment que el sistema pugui distingir:

```text
CURRENT STATE
```

de:

```text
HISTORY
```

en:

- Territory;
- Flags;
- ownership;
- placements;
- captures;
- Reputation;
- moderation;
- campaigns.

Busca qualsevol model que sobreescrigui informació històrica necessària.

---

# 49. AUDITABILITY

Comprova si el disseny permet explicar:

> per què ha passat aquest resultat?

Especialment:

```text
Activity
RulesVersion
Validation
Power
Attack
DefenseBefore
DefenseAfter
Result
```

No exigeix Event Sourcing.

Només traçabilitat suficient.

---

# 50. RULES VERSION

Revisa que els resultats històrics no depenguin silenciosament de:

> les regles actuals.

Una Activity antiga ha de poder mantenir relació amb la versió de regles amb què es va validar.

---

# 51. MVP

Revisa `MVP-00`.

Pregunta principal:

> és el mínim necessari per validar la hipòtesi central?

Busca:

- scope excessiu;
- scope insuficient;
- funcionalitats futures colades dins MVP;
- dependències ocultes;
- mecàniques que encara no caldrien per validar el core.

No redissenyis l'MVP sense una raó concreta.

---

# 52. HIPÒTESI DEL MVP

La hipòtesi principal és aproximadament:

> Veure territori desconegut, descobrir una bandera i preparar una nova Activity per arribar-hi i atacar-la genera ganes de tornar a sortir?

Comprova si el MVP realment permet respondre aquesta pregunta.

---

# 53. DEVELOPMENT PHASES

Revisa `DEVELOPMENT-PHASES-00`.

Per cada fase comprova:

- prerequisits;
- dependències;
- resultat verificable;
- experiment associat;
- si pot provar-se independentment;
- si construeix sobre una fase encara no validada.

Especialment:

```text
F0
F1
F2
F3
F4
F5
F6
F7
F8
F9
```

perquè formen el primer vertical slice.

---

# 54. PUBLICFLAG / USERFLAG EN EL ROADMAP

Comprova que:

```text
F5
F6
F9
```

representin correctament les dues classes de Flags.

Detecta qualsevol fase escrita encara amb el model antic d'una única `Flag`.

---

# 55. TOURISM ROADMAP

Comprova que la futura línia turística:

- no bloquegi el core;
- no s'implementi massa aviat;
- tingui un lloc clar al roadmap;
- pugui afegir-se sense redissenyar tot el model.

No cal numerar definitivament fases futures.

---

# 56. TRACEABILITY

Revisa `TRACEABILITY-00`.

No assumeixis que és correcte perquè sigui una matriu.

Comprova si realment es compleix:

```text
Decision
→ Glossary
→ Domain
→ Rule
→ Phase
→ Experiment/Test
```

Detecta entrades incorrectament marcades com:

```text
COVERED
```

si en realitat són parcials o estan desactualitzades.

---

# 57. GAME SCENARIOS

Utilitza `GAME-SCENARIOS-00` com una prova de consistència.

Per cada mecànica crítica comprova si existeix almenys un scenario capaç de demostrar-la.

Busca scenarios que revelin:

- contradiccions;
- estats impossibles;
- loopholes;
- comportament no definit;
- transicions incompletes.

No assumeixis que un scenario constitueix una decisió nova si només exemplifica una regla existent.

---

# 58. EXPERIMENTS

Revisa `EXPERIMENTS-00`.

Comprova que les decisions marcades com experimentals:

> realment tinguin un experiment capaç de produir evidència útil.

Detecta:

- experiments que no poden decidir res;
- mètriques insuficients;
- experiments duplicats;
- decisions sense experiment;
- experiments massa tardans per una decisió arquitectònica.

No decideixis ara els resultats dels experiments.

---

# 59. EXPERIMENTS CRÍTICS

Presta especial atenció als experiments relacionats amb:

- PWA GPS;
- locked screen;
- background;
- battery;
- sampling;
- raw storage;
- sync;
- offline completion;
- H3 resolution;
- 75% threshold;
- circularity;
- Flag interaction radius;
- GPS uncertainty;
- Fog;
- Power;
- Defense;
- attack connectivity;
- ClaimRadius.

---

# 60. VALIDATION PACK

Avalua si `VALIDATION-PACK-00`:

- evita preguntes dirigides;
- diferencia perfils;
- valida comportament i no només opinions;
- permet trobar problemes reals;
- separa interès declarat de comportament observat.

Aquesta part és secundària respecte del core funcional.

---

# 61. LOW-DENSITY WORLD

Avalua si TerritoriLord continua tenint valor amb:

- un únic jugador;
- molt pocs jugadors;
- poc PvP.

Comprova si:

- Exploration;
- Fog;
- Summits;
- POI;
- neutral PublicFlagSites;
- TourismCampaign;

poden sostenir el producte inicial.

---

# 62. RETURN MOTIVATION

Un dels criteris de producte més importants és:

```text
map state after Activity
↓
creates a new physical objective
↓
new Activity
```

Avalua si les mecàniques conjuntament poden produir aquest loop.

---

# 63. NO OBRIS DECISIONS SENSE MOTIU

No reobris una decisió només perquè existeix una alternativa possible.

Una decisió fixada només s'ha de qüestionar si detectes:

- contradicció;
- exploit;
- inviabilitat;
- greu problema UX;
- problema de seguretat;
- problema de privacitat;
- bloqueig arquitectònic;
- incompatibilitat amb fases futures ja previstes.

---

# 64. DECISIONS EXPERIMENTALS

No les classifiquis com defecte simplement perquè no tenen valor definitiu.

Exemples:

```text
H3 resolution
75% threshold
CircularityRadius
Flag interaction radius
TerritoryBudget
Power formula
Defense formula
decay
Fog intervals
Flag caps
cooldowns
```

La pregunta correcta és:

> està ben definida la hipòtesi i existeix una manera correcta de validar-la?

---

# 65. NIVELLS DE SEVERITAT

Classifica findings com:

## BLOCKER

Impedeix començar `SPEC-00` o fa inconsistent el core del producte.

---

## MAJOR

No bloqueja necessàriament `SPEC-00`, però s'ha de resoldre abans d'implementar la funcionalitat afectada.

---

## MINOR

Millora necessària però no afecta substancialment el model.

---

## EXPERIMENTAL

Problema o incertesa que ha de resoldre una prova, no una decisió immediata.

---

# 66. NO FACIS OVERENGINEERING

No marquis com a defecte l'absència de:

- Kubernetes;
- microservices;
- event sourcing;
- CQRS;
- ML anti-cheat;
- distributed systems;
- message brokers;
- service mesh;

si el producte actual no ho necessita.

Prefereix la solució mínima compatible amb el roadmap.

---

# 67. NO REDISSENYIS EL PRODUCTE

No proposis una mecànica completament diferent simplement perquè també podria funcionar.

Distingeix:

```text
defect
```

de:

```text
alternative design preference
```

Només el primer és finding.

---

# 68. INFORME — FITXER OBLIGATORI

Escriu:

```text
territorilord/docs/QA-00-FUNCTIONAL-DESIGN-GPT6.md
```

amb l'estructura següent.

---

# A. VERDICT

Una de:

```text
PASS
PASS WITH CHANGES
REWORK REQUIRED
```

Explica breument per què.

---

# B. EXECUTIVE SUMMARY

Màxim aproximadament 10 punts.

Inclou només conclusions importants.

---

# C. REPOSITORY / DOCUMENT INVENTORY

Llista:

- documents trobats;
- famílies versionades;
- possibles duplicats;
- documents aparentment obsolets;
- documents sense successor;
- documents únics.

No eliminis res.

---

# D. AUTHORITY / DECISION MAP

Identifica:

- tots els `DECISION-*`;
- tots els `DECISIONS-*`;
- ordre d'autoritat;
- decisions explícites;
- decisions provisionals;
- decisions experimentals.

Marca possibles conflictes entre decisions.

---

# E. VERSION RECONCILIATION REPORT

Una subsecció per cada família versionada.

Exemple:

```text
## GAME-RULES-01
```

Utilitza una taula:

| Element | Classificació | Font | Acció recomanada |
|---|---|---|---|
| ... | PRESERVED / SUPERSEDED / LOST_DETAIL / CONTRADICTION / DUPLICATION / NEW_IN_CONSOLIDATED | v0.x | KEEP / REMOVE / MERGE / DECISION NEEDED |

Al final de cada família:

```text
OLD VERSION SAFE TO DELETE: YES / NO
CONSOLIDATED VERSION COMPLETE: YES / NO
CANONICAL MERGE REQUIRED: YES / NO
```

---

# F. FINDINGS

Per cada finding:

```text
ID:
SEVERITY:
AREA:
DOCUMENTS:
STATUS:
```

Després:

## Problema

Descripció precisa.

## Per què importa

Conseqüència funcional o tècnica.

## Evidència

Documents i regles implicats.

## Recomanació mínima

Canvi mínim necessari.

## Quan s'ha de resoldre

Una de:

```text
BEFORE_SPEC_00
BEFORE_PHASE_X
EXPERIMENT
FUTURE
```

---

# G. DOCUMENTARY CONTRADICTIONS

Secció separada.

Inclou només contradiccions entre documents.

No problemes generals de producte.

---

# H. LOST DETAILS TO RECOVER

Llista clara del detall útil que les versions consolidades haurien de recuperar.

Per cada element indica:

- document antic;
- contingut;
- document canònic futur on hauria d'anar;
- si necessita adaptació al model actual.

Aquesta secció és crítica.

---

# I. SUPERSEDED CONTENT TO REMOVE

Indica què és realment obsolet i no s'ha de recuperar.

Especialment:

- model antic d'una única Flag;
- decisions substituïdes;
- hipòtesis ja resoltes;
- terminologia antiga incompatible.

---

# J. DECISIONS REQUIRED BEFORE SPEC-00

Inclou només decisions realment necessàries abans de començar `SPEC-00`.

No incloguis decisions que poden esperar un experiment o una fase posterior.

Per cada decisió:

```text
DECISION:
WHY NOW:
OPTIONS:
RECOMMENDATION:
```

La recomanació pot proposar una opció.

No inventis dades per justificar-la.

---

# K. DECISIONS THAT SHOULD REMAIN EXPERIMENTAL

Llista explícita.

Confirma que NO s'han de fixar encara.

---

# L. CORE LOOP REVIEW

Avalua:

```text
Activity
Exploration
Territory
Flags
Orientation
Combat
Return motivation
```

Identifica possibles ruptures del loop.

---

# M. ACTIVITY / VALIDATION REVIEW

Avalua:

- Activity model;
- capabilities;
- circularity;
- GPS;
- offline;
- sync;
- raw/derived;
- RulesVersion.

---

# N. EXPLORATION / FOG REVIEW

Avalua:

- Exploration;
- Knowledge;
- Fog;
- KnowledgeRetention;
- Detection;
- DiscoveryAccess;
- PhysicalDiscovery.

---

# O. TERRITORY REVIEW

Avalua:

- cells;
- H3;
- geometry;
- budget;
- connected/disconnected;
- pressure;
- defense;
- isolation.

---

# P. FLAGS REVIEW

Subdivideix en:

```text
PublicFlagSite
UserFlag
Shared Flag Rules
```

Inclou explícitament què s'ha de recuperar del model antic `Flag` i què no.

---

# Q. PVP REVIEW

Inclou:

- target selection;
- orientation;
- attempts;
- efficiency;
- ATTACK_IN_PROGRESS;
- locks;
- notification;
- resolution;
- connectivity risk.

---

# R. PROGRESSION / ECONOMY REVIEW

Inclou:

- XP;
- Level;
- Prestige;
- Reputation;
- Achievements;
- flag limits;
- rankings;
- monetization;
- no-pay-to-win.

---

# S. TOURISM REVIEW

Inclou:

- campaigns;
- DiscoveryAccess;
- SponsoredPOI;
- QR;
- claims;
- VisitorPass;
- analytics;
- business viability at conceptual level.

No facis una anàlisi comercial de mercat externa.

---

# T. DOMAIN MODEL REVIEW

Inclou:

- entitats;
- relacions;
- invariants;
- state vs history;
- domain events;
- auditability;
- missing concepts.

---

# U. SECURITY / PRIVACY / SAFETY REVIEW

Subseccions:

```text
Privacy
Physical safety
Anti-cheat
Sybil
PvP integrity
Sponsored claims
Moderation
```

---

# V. ARCHITECTURE REVIEW

Avalua les decisions existents.

No proposis un stack nou llevat que detectis una incompatibilitat concreta.

---

# W. MVP REVIEW

Classifica:

```text
TOO_SMALL
APPROPRIATE
TOO_LARGE
```

Argumenta-ho funcionalment.

Si recomanes treure o afegir alguna cosa, explica la raó concreta.

---

# X. DEVELOPMENT PHASES REVIEW

Per cada fase:

```text
READY
NEEDS_CHANGE
BLOCKED
```

Explica només problemes reals.

---

# Y. TRACEABILITY REVIEW

Indica:

- decisions no traçades;
- regles sense fase;
- experiments sense decisió;
- elements incorrectament marcats com covered.

---

# Z. EXPERIMENTS REVIEW

Indica:

- experiments crítics;
- experiments insuficients;
- decisions sense experiment;
- experiments redundants;
- experiments necessaris abans de certes fases.

---

# AA. GAME SCENARIOS REVIEW

Indica:

- scenarios crítics;
- scenarios que revelen ambigüitats;
- mecàniques importants sense scenario;
- scenarios incompatibles amb decisions actuals.

---

# AB. CANONICAL DOCUMENTATION PLAN

NO reescriguis els documents.

Indica com s'haurien de convertir en versions canòniques després de l'auditoria.

Exemple:

```text
GAME-RULES-01
→ merge v0.1 + v0.2
→ retain sections X
→ supersede Y
→ adapt Z to PublicFlagSite/UserFlag
```

Fes-ho per cada família versionada.

---

# AC. SAFE TO DELETE

Taula final:

| Fitxer | SAFE TO DELETE? | Motiu |
|---|---|---|

## Regla important

`SAFE TO DELETE` significa que el contingut semàntic útil del fitxer està completament:

- preservat;
- legítimament substituït;
- o duplicat;

en fonts que es conservaran.

No marquis:

```text
YES
```

només perquè existeix una versió amb número superior.

Si existeix qualsevol:

- decisió;
- invariant;
- cas límit;
- exemple útil;
- domain event;
- risc;
- hipòtesi compatible;

que encara no estigui preservat:

```text
SAFE TO DELETE = NO
```

Quan tinguis dubtes:

```text
SAFE TO DELETE = NO
```

Prefereix conservar temporalment un document redundant abans que perdre informació funcional.

---

# AD. READINESS CHECKLIST

Respon:

```text
Product vision ready: YES / NO
Core gameplay ready: YES / NO
Activity model ready: YES / NO
Exploration/Fog ready: YES / NO
Territory model ready: YES / NO
Flag model ready: YES / NO
PvP model ready: YES / NO
Progression model ready: YES / NO
Domain model ready: YES / NO
MVP scope ready: YES / NO
Development phases ready: YES / NO
Security/privacy baseline ready: YES / NO
Architecture direction ready: YES / NO
Documentation ready to canonicalize: YES / NO
Ready to create SPEC-00: YES / NO
```

Per cada `NO`, indica exactament què bloqueja.

---

# AE. FINAL RECOMMENDATION

Acaba obligatòriament amb una de:

```text
PROCEED TO SPEC-00
PROCEED AFTER DOCUMENT MERGE
PROCEED AFTER LIMITED DECISIONS
REWORK FUNCTIONAL DESIGN
```

No utilitzis una opció més severa si els problemes es poden resoldre documentalment.

---

# 69. CRITERI D'ÈXIT DE LA TEVA FEINA

L'auditoria haurà estat bona si després podem respondre amb seguretat:

1. Quines decisions estan realment fixades?
2. Quines continuen experimentals?
3. Quines contradiccions existeixen?
4. Què s'ha perdut durant la consolidació?
5. Quins documents antics podem eliminar?
6. Quins documents necessiten una fusió canònica?
7. Quines decisions falten abans de `SPEC-00`?
8. El roadmap és executable fase a fase?
9. El model té exploits evidents?
10. L'arquitectura actual pot suportar el model?
11. La privacitat i la seguretat física estan prou cobertes?
12. Podem començar `SPEC-00` sense construir sobre ambigüitats?

---

# 70. DISCIPLINA FINAL

No intentis impressionar amb una arquitectura més complexa.

No redissenyis TerritoriLord des de zero.

No converteixis preferències personals en defectes.

No inventis requisits.

No eliminis detall útil simplement perquè pugui simplificar-se.

No donis per vàlid el disseny perquè estigui molt documentat.

No converteixis valors experimentals en decisions definitives.

No facis implementació.

No modifiquis documents existents.

Sigues crític amb el model, però conservador amb els canvis.

L'objectiu és arribar al:

> **mínim conjunt coherent, complet, traçable i prou estable de decisions funcionals necessari per començar `SPEC-00`.**

---

# 71. COMPROVACIÓ FINAL ABANS DE TERMINAR

Abans de donar la tasca per acabada:

1. comprova que has llegit totes les famílies documentals rellevants;
2. comprova que has comparat versions antigues i consolidades;
3. comprova que has revisat tots els `DECISION-*` i `DECISIONS-*`;
4. comprova que no has modificat cap fitxer existent;
5. comprova l'estat Git si està disponible;
6. comprova que l'únic artefacte creat sigui l'informe QA corresponent;
7. comprova que el teu veredicte sigui coherent amb els blockers trobats.

Finalment escriu l'informe complet a:

```text
territorilord/docs/QA-00-FUNCTIONAL-DESIGN-GPT6.md
```