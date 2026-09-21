# TerritoriLord — Game Scenarios 00

**Estat:** escenaris funcionals v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document descriu situacions completes d'ús de TerritoriLord.

No defineix:

* fórmules definitives;
* radis GPS;
* resolucions H3;
* valors de Power;
* valors de Defense.

L'objectiu és comprovar que les regles definides poden funcionar conjuntament en situacions reals.

Cada escenari haurà de poder convertir-se més endavant en:

```text
escenari funcional
↓
criteris d'acceptació
↓
tests
↓
prova manual
↓
prova física quan correspongui
```

---

# 2. Convencions

Els noms de jugadors són ficticis.

Quan apareixen valors numèrics són només exemples explicatius i no decisions d'equilibratge.

S'utilitzen els conceptes definits a `GLOSSARY-00.md`.

---

# SCENARIO-01 — Primera activitat

## Objectiu

Comprovar el primer contacte d'un usuari amb TerritoriLord.

## Situació inicial

Laia:

* acaba de crear el compte;
* té email verificat;
* no ha realitzat cap Activity;
* no té territori;
* no té banderes;
* el mapa de joc és majoritàriament desconegut.

## Flux

Laia obre el mapa.

Pot veure:

* cartografia base;
* la seva posició;
* Fog de joc;
* alguns indicis remots.

Prem:

```text
INICIAR ACTIVITAT
```

Selecciona:

```text
WALKING
```

L'aplicació comença a enregistrar GPS.

Durant el recorregut:

* les mostres es guarden localment;
* les zones recorregudes es van descobrint;
* el mapa mostra progressivament l'exploració.

Laia finalitza l'activitat.

## Resultat esperat

El servidor valida l'Activity.

Laia obté:

* historial de l'Activity;
* distància;
* durada;
* track;
* zones físicament descobertes;
* XP corresponent.

Si la ruta no és prou circular:

* continua sent una Activity vàlida;
* pot generar exploració;
* no genera necessàriament territori.

## Principi validat

```text
Activity vàlida
≠
Activity territorial
```

---

# SCENARIO-02 — Activitat sense cobertura

## Objectiu

Comprovar el principi offline-first.

## Situació

Marc inicia una ruta de muntanya.

Al cap d'uns minuts perd completament la cobertura.

## Flux

L'aplicació continua:

* enregistrant GPS;
* guardant timestamps;
* conservant accuracy;
* actualitzant informació local disponible.

No intenta convertir la manca de xarxa en invalidesa esportiva.

Marc finalitza la ruta encara sense cobertura.

## Estat local

L'Activity queda conceptualment com:

```text
COMPLETED_LOCAL
```

Quan recupera cobertura:

```text
sync chunks
↓
sync final
↓
server validation
↓
resultat
```

## Resultat esperat

La manca de cobertura no provoca:

* pèrdua del track;
* finalització prematura;
* Activity invàlida per si sola.

---

# SCENARIO-03 — Conquesta de territori neutral

## Objectiu

Validar el primer bucle territorial.

## Situació inicial

Anna explora una zona sense propietari.

## Flux

Realitza una ruta aproximadament circular.

El servidor:

1. valida l'Activity;
2. comprova circularitat;
3. construeix el polígon;
4. identifica TerritoryCells candidates;
5. comprova el percentatge de cada cel·la dins del perímetre;
6. aplica el `TerritoryBudget`.

## Regla experimental inicial

Una TerritoryCell pot ser candidata si aproximadament:

```text
>= 75 %
```

de la seva superfície queda dins del polígon.

## Resultat

Part de les TerritoryCells neutrals passen a Anna.

La descoberta física és independent i pot tenir major resolució que el territori.

## Principi validat

```text
ExplorationCell
≠
TerritoryCell
```

---

# SCENARIO-04 — Circuit molt gran

## Objectiu

Evitar conquestes desproporcionades.

## Situació

Pau completa una ruta circular extraordinàriament gran.

El polígon conté moltes TerritoryCells neutrals.

## Sense protecció

Podria capturar una superfície enorme amb una sola Activity.

## Amb TerritoryBudget

L'Activity genera una capacitat territorial limitada.

Per tant:

```text
cells geomètricament candidates
>
cells realment afectables
```

## Resultat esperat

L'activitat continua sent reconeguda com una gran activitat esportiva.

Però no permet dominar una regió sencera en una sola sortida.

---

# SCENARIO-05 — Territori lluny de casa

## Objectiu

Comprovar que no existeix penalització artificial al turista.

## Situació

Oriol viatja a una altra regió on mai ha jugat.

No té territori connectat.

## Flux

Realitza una Activity vàlida i circular.

Conquista TerritoryCells neutrals.

## Resultat

El territori:

* és completament legítim;
* forma part del seu domini;
* segueix les mateixes regles generals.

Però, en ser desconnectat i probablement no mantenir-hi presència, pot tenir:

* menor consolidació;
* major vulnerabilitat;
* decadència més ràpida.

## Principi validat

No existeix:

```text
territori local
vs
territori turista
```

Existeix territori amb diferent presència real.

---

# SCENARIO-06 — Descoberta d'una bandera

## Objectiu

Validar Fog + curiositat.

## Situació

Clara observa en una zona no explorada:

```text
🚩 ?
```

No veu:

* ubicació exacta;
* propietari exacte si la regla no ho permet;
* Defense;
* informació tàctica completa.

## Flux

Fa una Activity cap a aquella zona.

A mesura que s'hi aproxima:

* descobreix territori;
* actualitza Knowledge;
* acaba descobrint la Flag.

## Resultat

La bandera passa a ser coneguda.

Clara pot veure informació suficient per decidir:

> «Un altre dia vull intentar atacar-la.»

## Principi validat

```text
DETECTED
↓
exploració física
↓
DISCOVERED
```

---

# SCENARIO-07 — Visitar una bandera sense atacar

## Objectiu

Comprovar que Visit i Attack són independents.

## Situació

Jordi passa per una bandera rival durant una ruta normal.

No havia seleccionat:

```text
ATTACK_FLAG
```

## Resultat

La visita pot:

* descobrir la Flag;
* actualitzar Knowledge;
* donar XP;
* contribuir a LocationImportance.

Però:

```text
NO FlagAttack
NO Defense damage
NO Capture
```

## Principi validat

```text
Visit ≠ Attack
```

---

# SCENARIO-08 — Preparar un atac

## Objectiu

Validar la intencionalitat del PvP.

## Situació

Jordi ja coneix una bandera rival.

Abans de sortir selecciona:

```text
ActivityPurpose = ATTACK_FLAG
FlagTarget = X
```

## Regles

Un cop iniciada l'Activity:

* no pot canviar la FlagTarget;
* no pot afegir-ne una segona.

## Resultat

```text
MAX FLAG ATTACKS PER ACTIVITY = 1
```

fins i tot si passa per altres banderes rivals.

---

# SCENARIO-09 — Orientació correcta

## Objectiu

Validar l'atac com a prova física d'orientació.

## Flux

El jugador arriba a la zona aproximada.

L'app no mostra necessàriament la coordenada exacta.

Busca físicament el punt.

Quan creu haver-lo trobat prem:

```text
ATACAR
```

El backend rep:

* ubicació;
* accuracy;
* Activity;
* FlagTarget.

## Resultat

El servidor retorna:

```text
CONFIRMED
```

L'atac passa a:

```text
ATTACK_IN_PROGRESS
```

Però encara no es resol.

---

# SCENARIO-10 — Error d'orientació

## Objectiu

Validar la penalització específica.

## Situació

El jugador prem `ATACAR` massa lluny de la Flag.

El GPS té bona precisió.

## Resultat

```text
INCORRECT
```

La penalització afecta:

```text
AttackEfficiency
```

No afecta:

* XP global;
* Reputation;
* historial esportiu.

El jugador pot continuar buscant.

---

# SCENARIO-11 — GPS incert

## Objectiu

Evitar penalitzar errors del dispositiu.

## Situació

El jugador sembla ser a prop de la Flag però:

```text
accuracy = insuficient
```

## Resultat

El sistema respon:

```text
UNCERTAIN
```

No:

```text
INCORRECT
```

## Conseqüència

* no hi ha penalització;
* el jugador pot esperar millor senyal;
* pot acostar-se;
* pot repetir la comprovació.

## Principi validat

```text
GPS error ≠ user error
```

---

# SCENARIO-12 — Atac iniciat i notificació al defensor

## Objectiu

Validar emoció + privacitat.

## Situació

L'atacant obté `CONFIRMED`.

El servidor crea:

```text
ATTACK_IN_PROGRESS
```

## Defensor

Rep una notificació:

> La teva bandera està sent atacada.

No rep:

* coordenades actuals de l'atacant;
* track;
* posició en directe.

## Bloqueig

El defensor no pot ara:

* eliminar la Flag;
* abandonar-la;
* moure-la;
* impedir administrativament aquell atac.

## Principi

L'atac ja està en curs.

---

# SCENARIO-13 — Atacant no completa la ruta

## Objectiu

Comprovar que localitzar la Flag no és suficient.

## Situació

L'atacant obté `CONFIRMED`.

Després:

* abandona la ruta;
* no torna aproximadament a l'inici;
* o l'Activity acaba sent invàlida per PvP.

## Resultat

L'atac no es resol amb èxit.

No hi ha captura.

La localització correcta per si sola no és suficient.

---

# SCENARIO-14 — Atac insuficient

## Objectiu

Permetre combats graduals.

## Situació

L'Activity és vàlida.

Es calcula:

```text
EffectiveAttack < EffectiveFlagDefense
```

però l'atac té prou força per afectar la defensa.

## Resultat

```text
DAMAGED
```

La Flag continua amb el propietari actual però queda més vulnerable.

## Efecte de joc

El jugador pot decidir:

> «Demà torno a intentar-ho.»

---

# SCENARIO-15 — Captura d'un PublicFlagSite

## Objectiu

Validar una bandera pública fixa.

## Situació

Existeix:

```text
PublicFlagSite
```

en un coll de muntanya.

La seva ubicació és permanent.

## Flux

Un rival:

* selecciona l'objectiu;
* localitza el punt;
* completa una Activity vàlida;
* supera la defensa.

## Resultat

```text
OWNER
A → B
```

Però:

```text
LOCATION
no canvia
```

Es conserva:

* historial;
* captures;
* Prestige;
* Importance del lloc.

---

# SCENARIO-16 — PublicFlagSite neutral

## Objectiu

Validar captura d'un punt públic sense propietari.

## Situació

Un nou PublicFlagSite apareix:

```text
OWNER = NONE
```

amb defensa inicial baixa.

## Flux

No és suficient passar-hi casualment.

Cal:

* seleccionar-lo;
* Activity vàlida;
* orientació;
* localització física;
* completar Activity.

## Resultat

Pot passar a tenir propietari.

---

# SCENARIO-17 — Captura d'una UserFlag

## Objectiu

Validar la diferència amb PublicFlagSite.

## Situació

Una UserFlag de Marta està plantada en una zona rival.

Pere la captura.

## Resultat

La ubicació antiga deixa de ser un `UserFlagPlacement` actiu.

La bandera passa a:

```text
OWNER = Pere
STATE = TRANSPORTED
```

Conserva:

* creador original;
* Prestige;
* propietaris històrics;
* captures.

No conserva com a pròpia:

```text
LocationImportance
```

de l'antic punt.

---

# SCENARIO-18 — Replantar una UserFlag capturada

## Objectiu

Validar que moure una bandera requereix activitat física.

## Situació

Pere té una UserFlag capturada en estat:

```text
TRANSPORTED
```

## Flux

Inicia una nova Activity.

Va fins a un punt vàlid dins territori propi.

Completa la mecànica de replantació.

## Resultat

Es crea un nou:

```text
UserFlagPlacement
```

La UserFlag conserva:

* FlagPrestige;
* historial;
* creador;
* propietaris anteriors.

La nova ubicació comença amb:

```text
LocationImportance
```

pràcticament nova.

---

# SCENARIO-19 — No replantar una bandera robada

## Objectiu

Evitar emmagatzemar indefinidament banderes capturades.

## Situació

Pere captura una UserFlag però no la replanta dins del termini establert.

## Resultat

```text
TRANSPORTED
↓
timeout
↓
última ubicació coneguda
↓
OWNER = NONE
↓
Defense baixa
```

Qualsevol jugador pot intentar reclamar-la.

L'antic propietari no té exclusivitat.

---

# SCENARIO-20 — Crear una UserFlag en territori rival

## Objectiu

Validar una prohibició explícita.

## Situació

Una Activity porta l'usuari físicament a una zona controlada per un rival.

Intenta crear una bandera nova.

## Resultat

La creació és rebutjada.

Una nova UserFlag només pot plantar-se inicialment en:

```text
territori propi
OR
territori neutral
```

---

# SCENARIO-21 — Crear bandera en territori neutral

## Objectiu

Comprovar relació entre Flag i Territory.

## Situació

L'usuari completa una Activity en territori neutral.

Vol plantar-hi una UserFlag.

## Resultat

La Flag:

* pot ser creada si les altres condicions es compleixen;
* no captura passivament territori.

És probable que la mateixa Activity ja hagi conquerit alguna TerritoryCell per les regles normals.

---

# SCENARIO-22 — Perdre una UserFlag

## Objectiu

Evitar transferència automàtica de territori.

## Situació

Un rival captura una UserFlag.

## Resultat

El territori adjacent:

```text
NO canvia automàticament de propietari
```

Però el propietari anterior perd:

* suport defensiu;
* presència de Flag;
* possible KnowledgeRetention.

La zona queda potencialment més vulnerable.

---

# SCENARIO-23 — Defensar una bandera

## Objectiu

Validar defensa activa.

## Situació

El jugador sap que una Flag pròpia té defensa baixa.

Abans de sortir selecciona:

```text
DEFEND_FLAG
```

## Flux

Realitza una Activity vàlida i visita físicament la bandera.

## Resultat

La Flag recupera una quantitat limitada de Defense.

No pot superar el sostre definit.

---

# SCENARIO-24 — Manteniment passiu

## Objectiu

Premiar la presència quotidiana sense substituir la defensa explícita.

## Situació

Una Activity normal passa per una Flag pròpia.

## Resultat

Pot aportar:

```text
Passive Maintenance
```

però menys que una Activity:

```text
DEFEND_FLAG
```

---

# SCENARIO-25 — Bandera abandonada

## Objectiu

Validar decadència.

## Situació

El propietari deixa de visitar una Flag durant molt de temps.

## Resultat progressiu

* disminueix la Defense;
* disminueix el suport real de presència;
* el Knowledge de la zona pot degradar-se;
* la Flag es torna més fàcil d'atacar.

No desapareix automàticament només per inactivitat, tret que una futura regla ho estableixi.

---

# SCENARIO-26 — Territori rival envoltat

## Objectiu

Evitar captura automàtica per geometria.

## Situació

Un jugador controla totes les cel·les al voltant d'una petita illa rival.

## Resultat

El territori rival:

* continua sent rival;
* pot patir penalització per aïllament;
* pot perdre defensa més ràpidament.

Per capturar-lo continua calguent activitat física.

---

# SCENARIO-27 — Knowledge antic

## Objectiu

Validar degradació del coneixement.

## Situació

Laia havia explorat una zona un any enrere.

No hi ha tornat.

## Resultat

El sistema conserva:

```text
ExplorationHistory = sí
```

però pot mostrar:

```text
KnowledgeState = HISTORICAL
```

Laia recorda que hi havia estat, però no sap necessàriament:

* propietari actual;
* defenses;
* noves banderes;
* POI recents.

---

# SCENARIO-28 — Territori propi manté Knowledge

## Objectiu

Validar KnowledgeRetention.

## Situació

Laia no passa exactament per totes les seves cel·les cada setmana, però manté:

* territori;
* banderes;
* activitat freqüent a la zona.

## Resultat

El Knowledge es degrada més lentament que en una zona abandonada.

## Restricció

Això no significa omniscència.

Una nova bandera rival desconeguda no ha de revelar-se automàticament només perquè Laia tingui territori proper.

---

# SCENARIO-29 — Atac a una Flag pròpia mentre el propietari està connectat

## Objectiu

Evitar defensa reactiva injusta.

## Situació

El propietari rep:

> La teva bandera està sent atacada.

Obre immediatament l'app.

## No pot

* eliminar-la;
* abandonar-la;
* moure-la;
* aplicar una defensa retroactiva a l'atac actual.

## Sí pot

* veure que existeix un atac;
* preparar una futura Activity;
* actuar després del resultat.

---

# SCENARIO-30 — Dues banderes durant la mateixa Activity

## Objectiu

Validar la regla d'un únic atac.

## Situació

L'Activity té:

```text
FlagTarget = A
```

Durant la ruta passa també per:

```text
Flag B
Flag C
```

## Resultat

Pot:

* visitar B i C;
* descobrir-les;
* actualitzar Knowledge.

No pot atacar-les.

Només A és objectiu PvP.

---

# SCENARIO-31 — Activity ATTACK_FLAG també conquista

## Objectiu

Evitar separar artificialment efectes del moviment físic.

## Situació

Una ruta d'atac travessa territori neutral i rival.

## Resultat

La mateixa Activity pot:

* explorar;
* descobrir;
* afectar territori neutral;
* generar TerritoryPressure;
* atacar la Flag seleccionada.

Sempre segons les ValidationCapabilities corresponents.

---

# SCENARIO-32 — Activity importada

## Objectiu

Validar separació live/import.

## Situació

En el futur l'usuari importa un FIT o GPX d'una activitat legítima.

## Pot potencialment

* aparèixer a historial;
* aportar exploració;
* aportar XP.

## No pot

* atacar retroactivament una Flag;
* defensar retroactivament una Flag.

Aquestes accions requereixen interacció en viu.

---

# SCENARIO-33 — POI comunitari útil

## Objectiu

Validar reputació basada en valor real.

## Situació

Un usuari crea un POI:

> Font del Roure.

Altres jugadors:

* hi arriben;
* confirmen ubicació;
* l'utilitzen.

## Resultat

El POI guanya confiança.

El creador pot guanyar:

* Reputation;
* XP;
* reconeixement.

No simplement per haver creat molts POI.

---

# SCENARIO-34 — POI fals

## Objectiu

Validar moderació.

## Situació

Un POI comunitari:

* no existeix;
* està mal ubicat;
* és en propietat privada.

Diversos usuaris el denuncien.

## Resultat

No s'elimina automàticament només per nombre brut de denúncies.

Pot passar a:

```text
UNDER_REVIEW
```

o equivalent.

Es tenen en compte:

* evidències;
* Reputation;
* historial;
* tipus de denúncia.

---

# SCENARIO-35 — Cim

## Objectiu

Validar progrés no PvP.

## Situació

Un jugador arriba per primera vegada a un Summit.

## Resultat

Pot obtenir:

* PhysicalDiscovery;
* XP;
* Achievement;
* DiscoveryPower.

El cim no canvia de propietari.

Una UserFlag podria coexistir al mateix lloc si és vàlid.

---

# SCENARIO-36 — Turista amb Discovery Access

## Objectiu

Validar monetització turística sense falsa exploració.

## Situació

Un municipi activa:

> Descobreix 8 indrets del municipi.

El turista mai hi ha estat.

## Sense campanya

Veu principalment Fog.

## Amb campanya

Pot veure:

* indicis;
* categories;
* rutes;
* alguns POI.

## Important

Aquests elements:

```text
NO són PhysicalDiscovery
```

fins que el turista hi arriba realment.

---

# SCENARIO-37 — Expiració d'un VisitorPass

## Objectiu

Validar la separació DiscoveryAccess / PhysicalDiscovery.

## Situació

Durant tres dies un pass revela diversos POI.

L'usuari només visita físicament dos.

Quan expira:

## Els dos visitats

Continuen:

```text
DISCOVERED / historial permanent
```

## Els no visitats

Perden l'accés promocional i tornen a les regles normals de Fog.

---

# SCENARIO-38 — QR turístic correcte

## Objectiu

Validar SponsoredClaim.

## Situació

Una campanya promociona un mirador.

L'usuari arriba físicament.

Escaneja el QR.

## El servidor comprova

* QR vàlid;
* campanya activa;
* usuari;
* coordenada;
* accuracy;
* ClaimRadius;
* reutilització.

## Resultat

```text
SponsoredClaim = VALID
```

L'usuari rep la recompensa configurada.

---

# SCENARIO-39 — Foto compartida del QR

## Objectiu

Evitar frau simple.

## Situació

Un usuari rep per missatge una fotografia del QR d'un comerç situat a 200 km.

L'escaneja.

## Resultat

El QR és real.

Però:

```text
user location
NOT IN claim area
```

Per tant:

```text
SponsoredClaim = REJECTED
```

No obté recompensa.

---

# SCENARIO-40 — Comerç patrocinat

## Objectiu

Validar que el model no depèn d'una Activity esportiva.

## Situació

Un comerç participa en una campanya local.

El jugador:

* no té Activity activa;
* entra al comerç;
* escaneja QR;
* es troba dins la ubicació permesa.

## Resultat

Pot completar:

```text
VISIT_CLAIM
```

i rebre una recompensa turística.

No genera automàticament:

* Territory;
* AttackPower;
* Defense.

---

# SCENARIO-41 — Ruta turística esportiva

## Objectiu

Validar ActivityClaim.

## Situació

Una campanya defineix:

> Completa la ruta dels 5 miradors.

## Regla

Els punts han de visitar-se durant una Activity vàlida.

## Resultat

Es pot utilitzar:

```text
ACTIVITY_CLAIM
```

en lloc de `VISIT_CLAIM`.

---

# SCENARIO-42 — Sponsored POI amb recompensa superior

## Objectiu

Validar monetització sense pay-to-win.

## Situació

Un POI patrocinat dona una recompensa superior a un POI normal.

## Pot augmentar

* XP;
* Achievement progress;
* TourismCampaign progress.

## No pot augmentar directament

* AttackPower desproporcionadament;
* FlagDefense;
* territori;
* probabilitat de captura.

---

# SCENARIO-43 — Jugador veterà contra nou jugador

## Objectiu

Comprovar que Level no domina el PvP.

## Situació

Jugador A:

* Level alt;
* anys d'historial.

Jugador B:

* Level baix;
* Activity física molt bona.

## Resultat esperat

A no ha de guanyar simplement pel Level.

El combat depèn principalment de:

* Activity;
* orientació;
* Defense;
* context territorial.

El veterà pot tenir avantatges indirectes:

* coneixement;
* banderes;
* territori;
* experiència.

No un multiplicador massiu.

---

# SCENARIO-44 — Derrota sense pèrdua de progrés permanent

## Objectiu

Evitar frustració excessiva.

## Situació

Un jugador perd:

* una bandera;
* diverses TerritoryCells.

## Conserva

* XP;
* Level;
* cims;
* Achievement;
* historial;
* exploració permanent;
* Prestige històric corresponent.

## Principi

```text
Perdre estat actual
≠
esborrar trajectòria
```

---

# SCENARIO-45 — Activitat sospitosa

## Objectiu

Validar que anomalia i frau no són equivalents.

## Situació

Un track presenta:

* salt GPS;
* velocitat temporalment impossible.

## Resultat

El sistema pot:

* marcar una anomalia;
* reduir ValidationCapabilities;
* demanar revisió futura.

No conclou automàticament:

```text
FRAUD
```

---

# SCENARIO-46 — Activity vàlida per explorar però no per PvP

## Objectiu

Validar el model de capabilities.

## Situació

Una Activity té GPS acceptable per historial i exploració, però insuficient per validar un atac.

## Resultat

Pot tenir:

```text
CAN_COUNT_DISTANCE = YES
CAN_EXPLORE = YES
CAN_ATTACK_FLAG = NO
```

No cal rebutjar tota l'Activity.

---

# SCENARIO-47 — Territori i Fog no són el mateix

## Objectiu

Evitar una confusió conceptual.

## Situació

Un usuari controla una zona des de fa temps però no hi ha tornat.

## Resultat

Pot continuar tenint:

```text
TerritoryOwnership = USER
```

mentre:

```text
KnowledgeState = STALE
```

La propietat no implica informació perfecta.

---

# SCENARIO-48 — Explorat però no controlat

## Objectiu

Validar la situació inversa.

## Situació

L'usuari ha recorregut repetidament una zona controlada per un rival.

## Resultat

Té:

```text
Exploration = YES
Knowledge = recent
TerritoryOwnership = OTHER_USER
```

Els tres conceptes són independents.

---

# SCENARIO-49 — PublicFlagSite turístic visible

## Objectiu

Validar polítiques de visibilitat diferents.

## Situació

Existeix un gran punt turístic públic.

La seva política és:

```text
PUBLIC_VISIBLE
```

## Resultat

Pot aparèixer al mapa encara que la zona no estigui físicament descoberta.

La informació competitiva detallada pot continuar restringida.

---

# SCENARIO-50 — PublicFlagSite competitiu sota Fog

## Objectiu

Validar l'altra política.

## Situació

Un PublicFlagSite està pensat principalment com objectiu de joc.

## Política

```text
FOG_DETECTED
```

## Resultat

L'usuari només veu una pista fins que explora la zona.

---

# SCENARIO-51 — Límit de banderes

## Objectiu

Validar `FLAG_CREATION_CAP` i `FLAG_CONTROL_CAP`.

## Situació

Un jugador arriba al límit de banderes que pot controlar.

Captura una nova UserFlag.

## Resultat esperat conceptual

La captura pot completar-se.

Després el jugador haurà de reorganitzar/abandonar una Flag segons la futura regla concreta.

No s'ha de tallar necessàriament el moment de joc abans de la captura.

## Nota

El comportament exacte del límit continua subjecte a definició posterior.

---

# SCENARIO-52 — Flag pròpia antiga

## Objectiu

Validar Defense decay + Knowledge.

## Situació

Una Flag continua sent pròpia però no s'ha visitat durant molt de temps.

## Resultat

El jugador continua sabent que és seva.

Però:

* la Defense baixa;
* la informació circumdant pot estar obsoleta;
* la zona és més fàcil d'atacar.

---

# SCENARIO-53 — Rivalitat emergent

## Objectiu

Validar que Rivalry no necessita assignació artificial.

## Situació

Dos jugadors:

* comparteixen frontera;
* es capturen repetidament una PublicFlagSite;
* es roben UserFlags.

## Resultat

El sistema pot identificar una Rivalry basada en historial real.

No cal:

```text
SELECT RIVAL
```

---

# SCENARIO-54 — Mateix jugador visita repetidament una bandera

## Objectiu

Evitar farming d'Importance.

## Situació

Un usuari passa 50 vegades per la mateixa Flag.

## Resultat

Les primeres visites poden aportar valor.

Les posteriors tenen rendiments fortament decreixents.

Cinquanta visites d'una persona no han de pesar com cinquanta persones diferents.

---

# SCENARIO-55 — Multiaccount per inflar un POI

## Objectiu

Validar futura mitigació Sybil.

## Situació

Una persona crea diversos comptes per:

* visitar el mateix POI;
* validar-lo;
* augmentar Importance.

## Resultat esperat conceptual

El sistema no assumeix que pot demostrar perfectament que són la mateixa persona.

Però pot limitar l'impacte mitjançant:

* Reputation;
* antiguitat;
* patrons;
* rate limits;
* trust weighting.

---

# SCENARIO-56 — Error de sincronització

## Objectiu

Validar idempotència.

## Situació

El client envia:

```text
SyncChunk 17
```

La resposta es perd.

El client el torna a enviar.

## Resultat

El servidor no crea punts duplicats.

```text
same Activity
+
same chunk identity
=
same stored result
```

---

# SCENARIO-57 — Canvi de regles

## Objectiu

Validar RulesVersion.

## Situació

Una fórmula de Power canvia mesos després.

## Resultat

Una Activity antiga continua podent indicar:

```text
rules_version = X
```

i una nova:

```text
rules_version = Y
```

No s'ha de perdre la traçabilitat de com es va obtenir un resultat històric.

---

# SCENARIO-58 — Abandonament remot d'una UserFlag

## Objectiu

Evitar obligar el jugador a tornar físicament a una zona remota només per alliberar un slot.

## Situació

L'usuari ja no vol mantenir una UserFlag llunyana.

## Acció

L'abandona remotament.

## Resultat

* deixa de controlar-la;
* recupera el slot després del cooldown corresponent;
* no pot utilitzar l'acció per escapar d'un `ATTACK_IN_PROGRESS`.

---

# SCENARIO-59 — Atac sense cobertura

## Objectiu

Fer visible una limitació deliberada del MVP.

## Situació

Un jugador arriba físicament a la ubicació d'una Flag.

No té connexió.

## Resultat inicial

No pot iniciar formalment:

```text
ATTACK_IN_PROGRESS
```

encara que el GPS funcioni.

Pot continuar l'Activity.

## Motiu

El servidor necessita validar:

* estat actual de la Flag;
* target;
* locks;
* atacabilitat;
* notificació.

## Estat

Aquesta limitació s'haurà de provar especialment en entorns de muntanya.

Pot motivar una solució offline futura si perjudica excessivament el joc.

---

# SCENARIO-60 — PublicFlagSite i UserFlag al mateix lloc

## Objectiu

Validar coexistència.

## Situació

En un cim existeixen:

* Summit;
* PublicFlagSite;
* UserFlag;
* POI.

## Resultat

Poden coexistir perquè representen conceptes diferents.

La UI haurà de resoldre la densitat visual.

No s'han de fusionar les entitats només perquè comparteixin coordenades.

---

# SCENARIO-61 — El mapa motiva una nova sortida

## Objectiu

Validar el producte, no només el software.

## Situació

L'usuari acaba una Activity.

Al mapa observa:

* una franja de Fog propera;
* un `🚩 ?`;
* una bandera pròpia amb defensa baixa;
* una zona rival aïllada.

## Resultat esperat

TerritoriLord aconsegueix generar una decisió futura:

> «La propera vegada aniré cap allà.»

Aquest és un dels criteris centrals de validació del producte.

---

# 3. Escenaris especialment importants per al primer vertical slice

Abans d'ampliar el producte s'han de poder demostrar com a mínim:

```text
SCENARIO-01  Primera activitat
SCENARIO-02  Sense cobertura
SCENARIO-03  Conquesta neutral
SCENARIO-06  Descoberta de bandera
SCENARIO-07  Visit != Attack
SCENARIO-08  Preparació d'atac
SCENARIO-09  Orientació correcta
SCENARIO-10  Error d'orientació
SCENARIO-11  GPS incert
SCENARIO-12  Attack in Progress
SCENARIO-13  Activitat no completada
SCENARIO-14  Atac insuficient
SCENARIO-15  Captura PublicFlagSite
SCENARIO-17  Captura UserFlag
SCENARIO-18  Replantació
SCENARIO-23  Defensa
SCENARIO-31  Atac + territori
SCENARIO-46  ValidationCapabilities
SCENARIO-59  Atac sense cobertura
SCENARIO-61  Motivació per tornar a sortir
```

---

# 4. Escenaris que corresponen a fases posteriors

No han de bloquejar el primer MVP:

```text
Community POI
advanced moderation
Sybil detection
imported Activities
TourismCampaign
SponsoredPOI
SponsoredClaim
VisitorPass
advanced progression
Rivalry
```

Han d'estar documentats perquè l'arquitectura no els impossibiliti.

No cal implementar-los prematurament.

---

# 5. Ús futur com a tests

Cada scenario podrà evolucionar cap a una estructura:

```text
GIVEN
WHEN
THEN
```

Exemple:

```text
GIVEN
una Activity ATTACK_FLAG
amb FlagTarget A

WHEN
el jugador passa per Flag B

THEN
Flag B pot registrar Visit
però no pot generar FlagAttack
```

Això permetrà convertir el disseny funcional en criteris verificables.

---

# 6. Ús futur en proves de camp

Els escenaris que depenen del món físic s'hauran de validar amb dispositius reals.

Especialment:

* GPS;
* accuracy;
* circularitat;
* Fog;
* orientació;
* background;
* bateria;
* cobertura;
* ClaimRadius;
* H3;
* percepció visual de TerritoryCells.

---

# 7. Condició d'èxit transversal

Una mecànica pot ser tècnicament correcta i, tot i així, fallar com a producte.

Després de les proves s'han de fer preguntes com:

* he entès què estava passant?
* he percebut el resultat com a just?
* sabia què podia fer?
* m'ha generat curiositat?
* m'ha donat un motiu per moure'm?
* m'ha donat un motiu per tornar-hi?
* he necessitat mirar massa el mòbil?
* la mecànica ha interferit amb l'activitat física?

---

# 8. Principi de seguretat

Cap escenari ha de crear un incentiu perquè el jugador:

* entri en propietat privada;
* accedeixi a una zona restringida;
* assumeixi riscos físics per arribar exactament a una coordenada;
* persegueixi un rival físicament;
* comparteixi ubicació sensible.

La mecànica s'ha d'adaptar al món real, no a l'inrevés.

---

# 9. Conclusió

Els escenaris mostren que TerritoriLord té diversos bucles diferenciats però compatibles:

```text
SPORT LOOP
Activity → Result → Progress
```

```text
EXPLORATION LOOP
Fog → Curiosity → PhysicalDiscovery → History
```

```text
TERRITORY LOOP
CircularActivity → Territory → Defense → Rival Pressure
```

```text
FLAG LOOP
Detect → Discover → Plan → Orient → Attack → Capture/Defend
```

```text
TOURISM LOOP
Campaign → Hint → Visit → Claim → Reward → Discovery
```

El criteri principal continua sent:

> **cada capa digital ha de donar una nova raó per interactuar físicament amb el territori.**
