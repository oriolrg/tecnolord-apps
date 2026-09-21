# TerritoriLord — Game Rules 05: Security, Privacy & Anti-Cheat

**Estat:** proposta funcional v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document defineix conceptualment les regles de:

* privacitat;
* seguretat de comptes;
* protecció de localització;
* tracks GPS;
* banderes i POI;
* GPS spoofing;
* activitats fraudulentes;
* comptes múltiples;
* farming;
* denúncies;
* moderació;
* resposta davant comportament abusiu.

No defineix encara tecnologies concretes d'autenticació ni algoritmes anti-cheat definitius.

---

# 2. Principi central

> **Les mesures de seguretat han de protegir la competició sense convertir errors normals del GPS o del món real en acusacions de frau.**

El sistema ha de diferenciar sempre entre:

* error;
* dada incerta;
* comportament anòmal;
* frau probable;
* frau confirmat.

---

# 3. Principis generals

1. minimitzar dades personals;
2. no exposar ubicació actual innecessàriament;
3. protegir punts habituals;
4. validar amb més rigor les accions PvP;
5. no confiar en una única senyal anti-cheat;
6. conservar traçabilitat;
7. aplicar penalitzacions proporcionals;
8. permetre revisió dels casos importants;
9. no incentivar accessos perillosos;
10. dificultar l'ús de comptes secundaris.

---

# 4. Privacitat per defecte

Una Activity no ha de considerar-se pública automàticament.

El jugador podrà tenir controls sobre:

* activitat pública;
* activitat privada;
* visibilitat del track;
* estadístiques;
* perfil.

Els efectes territorials poden ser públics sense publicar el track complet.

---

# 5. Separació entre activitat i resultat

Exemple:

El sistema pot mostrar:

```text
Oriol ha capturat aquesta zona.
```

sense mostrar:

```text
ruta exacta
hora exacta
punt inicial
punt final
```

Aquesta separació és important.

---

# 6. Punt inicial i final

Els extrems dels tracks són especialment sensibles.

Poden revelar:

* domicili;
* feina;
* allotjament;
* rutines.

Per tant, no han de mostrar-se públicament per defecte.

---

# 7. Zones de privacitat

Es podrà implementar una zona privada al voltant de punts sensibles.

Exemples:

* domicili;
* lloc habitual;
* ubicació definida manualment.

El servidor pot conservar les dades necessàries per validar l'activitat però ocultar-les en representacions públiques.

---

# 8. Zones de privacitat automàtiques

El sistema pot detectar que múltiples activitats:

```text
comencen
o
acaben
```

repetidament en la mateixa zona.

Això pot suggerir una ubicació sensible.

Es podrà aplicar ocultació automàtica.

---

# 9. No revelar la zona privada

Una protecció de privacitat no hauria de mostrar:

```text
"Aquí hi ha la casa de l'usuari"
```

La mateixa zona de protecció és informació sensible.

---

# 10. Circularitat i privacitat

El servidor pot validar que:

```text
inici ≈ final
```

sense necessitat que altres jugadors vegin cap dels dos.

---

# 11. Ubicació en temps real

Per defecte, altres jugadors no han de poder consultar la ubicació en temps real d'un usuari.

Especialment:

* rivals;
* propietaris de banderes;
* visitants de territori.

---

# 12. Notificacions PvP

Un propietari pot saber:

```text
La teva bandera ha estat atacada.
```

Però no necessàriament:

```text
Oriol està ara mateix a 200 m.
```

---

# 13. Retard d'informació

Algunes actualitzacions PvP poden publicar-se amb retard.

Exemple:

* activitat finalitzada;
* validació completada;
* atac resolt;
* després notificació.

Això evita convertir TerritoriLord en una eina de seguiment de persones.

---

# 14. Tracks públics

Si en el futur es permet compartir tracks, la visibilitat ha de ser explícita.

Possibles opcions:

```text
PRIVATE
FRIENDS
PUBLIC
```

La mecànica territorial no ha de requerir PUBLIC.

---

# 15. Localització de banderes

Les banderes són intencionadament geogràfiques.

Però la seva coordenada exacta no sempre ha de mostrar-se.

Especialment:

* abans de descobrir-les;
* durant Fog;
* durant una missió d'orientació.

---

# 16. Accessibilitat segura

Crear o atacar una Flag no ha d'exigir entrar:

* propietats privades;
* recintes prohibits;
* llocs evidentment perillosos.

---

# 17. Radi d'interacció

La interacció es farà a una distància física suficientment pròxima.

S'ha plantejat conceptualment:

```text
10–20 m
```

però haurà d'adaptar-se a `accuracy`.

---

# 18. Seguretat abans que exactitud

Si una Flag es troba físicament en un punt on arribar exactament implica risc:

> la ubicació és incorrecta per al joc.

No s'ha de compensar amb una tolerància que incentivi l'accés.

---

# 19. Denúncia de bandera

Motius possibles:

```text
PRIVATE_PROPERTY
RESTRICTED_ACCESS
DANGEROUS_LOCATION
WRONG_LOCATION
DOES_NOT_EXIST
ABUSIVE_CONTENT
DUPLICATE
OTHER
```

---

# 20. Denúncia de POI

Motius equivalents:

```text
DOES_NOT_EXIST
DUPLICATE
PRIVATE_PROPERTY
RESTRICTED_ACCESS
DANGEROUS_ACCESS
WRONG_LOCATION
INAPPROPRIATE_CONTENT
OTHER
```

---

# 21. Denúncia no és sentència

Una denúncia no elimina immediatament contingut.

Cal evitar atacs coordinats contra:

* rivals;
* banderes importants;
* POI legítims.

---

# 22. Contingut temporalment restringit

En casos greus es podrà posar:

```text
UNDER_REVIEW
```

i desactivar temporalment:

* creació d'atacs;
* recompenses;
* visibilitat pública.

Especialment per risc físic.

---

# 23. Seguretat del compte

Com a mínim es preveu:

* email verificat;
* credencials protegides;
* sessions revocables;
* rate limiting;
* controls contra automatització.

---

# 24. Verificació de correu

Un compte no verificat hauria de tenir capacitats limitades.

Especialment:

* creació de Flags;
* POI comunitaris;
* PvP;
* denúncies.

---

# 25. Comptes múltiples

No es pot garantir tècnicament:

> una persona = un compte.

Sense identificació forta.

Per tant, l'objectiu és:

> reduir el benefici de tenir comptes secundaris.

---

# 26. Mesures contra comptes secundaris

Es poden considerar conjuntament:

* verificació de correu;
* historial d'activitats;
* antiguitat;
* reputació;
* dispositius;
* patrons GPS;
* xarxes;
* interaccions sospitoses.

Cap indicador únic ha de ser suficient per acusar.

---

# 27. Comptes nous

Poden tenir límits inicials.

Exemple conceptual:

```text
pocs POI
poques denúncies
poca capacitat de crear Flags
```

Els límits creixen amb activitat real.

---

# 28. Sybil attacks

Un atac Sybil consisteix conceptualment en crear múltiples identitats per manipular el sistema.

Riscos:

* visitar una Flag pròpia;
* valorar POI;
* denúncies coordinades;
* augmentar Importance;
* facilitar captures.

---

# 29. Independència de visites

Per calcular FlagImportance o validació de POI no s'ha de comptar:

```text
10 comptes
```

com deu evidències iguals sense considerar confiança.

---

# 30. TrustWeight

Cada contribució comunitària pot tenir un pes derivat de factors com:

* historial;
* activitats legítimes;
* antiguitat;
* reputació;
* patrons independents.

No cal exposar aquest valor a l'usuari.

---

# 31. GPS spoofing

El sistema ha d'assumir que les coordenades del dispositiu poden ser manipulades.

No es pot confiar només en:

```text
lat/lon rebudes
```

---

# 32. Senyals anti-spoofing

Es poden combinar:

* velocitat;
* acceleració;
* continuïtat;
* timestamps;
* accuracy;
* trajectòria;
* altitud;
* historial;
* interaccions físiques.

---

# 33. Cap senyal és prova absoluta

Exemple:

```text
GPS jump
```

pot ser:

* spoofing;
* mala cobertura;
* error del dispositiu.

Per tant, cal combinar evidències.

---

# 34. Severity

Les anomalies poden classificar-se conceptualment:

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 35. GPS impossible

Exemple:

```text
2 km en 3 segons
```

és evidència forta d'error o manipulació.

Aquest tram no hauria de comptar.

---

# 36. GPS degradat

Exemple:

```text
accuracy = 150 m
```

no implica frau.

Simplement pot fer impossible:

* atacar;
* confirmar POI;
* validar visita.

---

# 37. Jerarquia de rigor

Els requisits anti-cheat augmenten segons impacte:

```text
registre
<
exploració
<
territori
<
defensa
<
atac PvP
```

---

# 38. Activity anti-cheat

S'han de buscar patrons com:

* salts impossibles;
* velocitat incompatible;
* trajectòria artificial;
* timestamps incoherents;
* dades repetides;
* recorreguts impossibles.

---

# 39. Activitat motoritzada

Risc:

```text
RUNNING declarat
+
cotxe real
```

El sistema pot detectar indicis per:

* velocitat;
* acceleració;
* perfil;
* pauses;
* recorregut.

---

# 40. Falsos positius

Un ciclista molt ràpid o corredor en baixada no s'ha de marcar automàticament com a trampós.

Les regles dependran d'ActivityType.

---

# 41. Canvi de modalitat

Si una Activity sembla incompatible amb la modalitat declarada, es pot:

* invalidar per PvP;
* reclassificar;
* demanar revisió.

No necessàriament eliminar-la.

---

# 42. FraudScore

Es pot derivar internament un conjunt d'indicadors o `FraudScore`.

No és:

* XP;
* Prestige;
* Reputation.

No s'ha de fer públic.

---

# 43. FraudScore no implica sanció automàtica

Un score pot:

* limitar efectes;
* generar revisió;
* augmentar controls.

Les sancions severes requereixen més evidència.

---

# 44. Activitat importada

Per defecte, una Activity importada no hauria de poder realitzar:

* FlagAttack retroactiu;
* FlagDefense retroactiva.

Aquestes accions requereixen presència i interacció en directe.

---

# 45. Exploració importada

Es podrà valorar en el futur permetre imports per:

* historial;
* estadístiques;
* exploració.

Però és una decisió separada del PvP.

---

# 46. Live activity

Atac i defensa poden requerir:

```text
activity session activa
+
GPS actual
+
interacció en temps real
```

---

# 47. Integritat temporal

No es podrà:

```text
pujar una ruta antiga
```

i afirmar que:

```text
avui he atacat aquesta Flag.
```

---

# 48. Farming

Farming és repetir accions principalment per explotar recompenses.

Exemples:

* microcircuits;
* visites repetides;
* crear i visitar POI propis;
* activitats segmentades;
* captures pactades.

---

# 49. Farming legítim vs entrenament

Repetir una ruta habitual:

> no és frau per si sol.

Pot generar:

* PhysicalPower;
* defensa;
* activitat.

Simplement té menys recompenses de descoberta.

---

# 50. Diminishing returns

És preferible reduir rendiment que prohibir moltes conductes legítimes.

Això s'aplica a:

* visites;
* exploració repetida;
* defenses;
* POI.

---

# 51. Capture trading

Dos usuaris podrien pactar:

```text
jo et capturo
tu em captures
```

per generar Prestige o XP.

S'han de detectar patrons de captures repetides artificials.

---

# 52. Rivalitat legítima

Dos veïns també poden disputar legítimament la mateixa bandera moltes vegades.

Per tant:

> repetició no implica automàticament frau.

Cal context.

---

# 53. Recompensa de captures repetides

Per evitar farming, les captures repetides entre els mateixos usuaris i Flag poden tenir rendiments decreixents en XP/Prestige.

La captura territorial continua sent real.

---

# 54. FlagImportance farming

El propietari no hauria de poder fer créixer gaire Importance amb les seves pròpies visites.

Tampoc comptes molt relacionats haurien de tenir el mateix pes que usuaris independents.

---

# 55. POI farming

Crear un POI propi i visitar-lo repetidament:

* no ha de generar reputació important;
* no ha de generar Power indefinidament.

---

# 56. Report farming

Denunciar contingut massivament no ha de proporcionar reputació automàtica.

Només denúncies confirmades podrien contribuir limitadament.

---

# 57. Rate limits

Es poden aplicar límits a:

* creació POI;
* banderes;
* denúncies;
* intents d'interacció;
* autenticació.

---

# 58. AttackLocationAttempt

També necessita rate limit.

No ha de ser possible prémer:

```text
ATACAR
```

centenars de vegades per segon.

---

# 59. Penalització d'orientació

Els intents INCORRECT redueixen AttackEfficiency.

Però:

* UNCERTAIN no penalitza;
* errors tècnics tampoc.

---

# 60. No convertir l'error en càstig permanent

Una mala localització durant un atac no ha de reduir:

* XP global;
* Level;
* Reputation.

Només afecta aquella missió.

---

# 61. Abús deliberat

Comportaments fraudulents confirmats sí poden implicar:

* anul·lació Activity;
* reversió de captura;
* retirada de recompenses;
* restricció temporal;
* suspensió.

---

# 62. Reversió d'efectes

El sistema ha de poder revertir:

* TerritoryOwnership;
* FlagCapture;
* XP fraudulenta;
* Prestige fraudulenta.

Això requereix historial auditable.

---

# 63. Audit trail

Accions competitives importants han de conservar:

* Activity relacionada;
* RulesVersion;
* resultat de validació;
* atac;
* defensa anterior;
* defensa posterior.

---

# 64. Moderació

La moderació es divideix en:

```text
CONTENT MODERATION
GAME INTEGRITY
SAFETY
```

---

# 65. Content Moderation

Afecta:

* noms;
* descripcions;
* fotografies;
* POI;
* Flags.

---

# 66. Game Integrity

Afecta:

* trampes;
* farming;
* múltiples comptes;
* manipulació GPS.

---

# 67. Safety

Afecta:

* punts perillosos;
* propietat privada;
* accessos restringits.

Safety pot requerir actuació més ràpida.

---

# 68. Administració

Caldrà un panell o eines d'administració per revisar:

* denúncies;
* Flags;
* POI;
* Activity sospitoses;
* usuaris;
* sancions.

No necessàriament al primer prototip.

---

# 69. Moderació comunitària

La comunitat pot aportar evidència.

No hauria de tenir poder absolut per eliminar directament contingut.

---

# 70. Reputation i moderació

Usuaris amb historial fiable poden tenir més pes.

Però no poder unilateral.

---

# 71. Apel·lacions

Per sancions importants, es recomana deixar prevista una via de revisió.

Especialment:

* suspensions;
* eliminació de contingut rellevant;
* reversions competitives.

---

# 72. Assetjament

Les mecàniques territorials poden generar rivalitat.

No han de facilitar assetjament personal.

---

# 73. Perfil rival

Mostrar només informació necessària per al joc.

Evitar exposar:

* email;
* nom real obligatori;
* domicili;
* rutines;
* localització actual.

---

# 74. Username

Es recomana identitat pública mitjançant:

```text
username / display name
```

en lloc d'identitat civil obligatòria.

---

# 75. Bloqueig d'usuaris

En el futur pot ser necessari permetre:

```text
BLOCK USER
```

per impedir:

* missatges;
* interacció social directa.

No necessàriament eliminar la realitat territorial compartida.

---

# 76. Rivalitat i bloqueig

Bloquejar un usuari no hauria de permetre:

> fer desaparèixer el seu territori del món.

S'han de separar:

* capa social;
* capa territorial.

---

# 77. Harassment through flags

No s'han de permetre noms de Flag o POI destinats a atacar altres jugadors.

Això forma part de moderació de contingut.

---

# 78. Banderes prop de domicilis

Crear una Flag davant d'un domicili pot ser problemàtic encara que estigui en via pública.

El sistema podrà restringir ubicacions que generin:

* risc de privacitat;
* conflicte;
* accés inadequat.

---

# 79. POI residencials

Per defecte, habitatges particulars no haurien de ser POI comunitaris.

---

# 80. Fotografies

Si s'introdueixen, caldrà controlar:

* dades personals;
* persones identificables;
* matrícules;
* ubicacions privades;
* contingut inadequat.

No és necessari per al MVP.

---

# 81. Metadata

Fotografies i fitxers pujats poden contenir metadades sensibles.

El sistema hauria de considerar eliminar metadades innecessàries abans de publicar.

---

# 82. Retenció de dades

Caldrà una política específica per:

* tracks;
* mostres GPS;
* activitats;
* logs;
* dades anti-cheat.

No es defineix encara la durada.

---

# 83. Minimització

No s'ha de conservar una dada sensible:

> només perquè podria ser útil algun dia.

Cada dada ha de tenir una finalitat.

---

# 84. Eliminació del compte

Caldrà definir què passa amb:

* activitats;
* tracks;
* POI;
* Flags;
* territori;
* historial comunitari.

No s'ha de decidir implícitament.

---

# 85. Contingut persistent després d'eliminació

Pot ser necessari separar:

* dades personals;
* història del món.

Exemple:

un POI útil podria continuar existint de manera anonimitzada si la política ho permet.

Això requerirà decisió específica.

---

# 86. Administrador

L'administrador pot necessitar més visibilitat per:

* moderació;
* seguretat;
* incidències.

L'accés ha de quedar auditat.

---

# 87. Principi de mínim privilegi

Cap rol ha de tenir més accés del necessari.

Especialment a:

* tracks;
* ubicació;
* dades personals.

---

# 88. Logs d'administració

Accions sensibles haurien de generar auditoria:

```text
who
what
when
why
```

---

# 89. Anti-cheat progressiu

No cal construir el sistema anti-cheat perfecte abans del MVP.

Es recomana una evolució:

```text
Fase 1
validacions bàsiques

Fase 2
detecció d'anomalies

Fase 3
correlació de patrons

Fase 4
models avançats si realment són necessaris
```

---

# 90. MVP anti-cheat mínim

El primer sistema hauria de cobrir almenys:

* timestamps incoherents;
* velocitats impossibles;
* salts GPS;
* `accuracy` insuficient per PvP;
* una Flag per Activity;
* atac en sessió activa;
* email verificat;
* rate limits;
* visites repetides amb rendiments decreixents.

---

# 91. No sobredissenyar biometria

No es recomana començar requerint:

* DNI;
* reconeixement facial;
* identificació civil.

Seria desproporcionat per al producte inicial.

---

# 92. Device fingerprinting

Pot ser útil contra abús.

Però té implicacions de privacitat.

No es considera requisit inicial.

---

# 93. Fair play

Es podrà definir un codi bàsic de joc:

* no falsificar GPS;
* no entrar en propietats;
* no crear contingut fals;
* no utilitzar comptes per manipular.

---

# 94. Informació de sanció

Quan sigui possible, una sanció hauria d'explicar:

```text
què s'ha invalidat
quina regla s'ha infringit
```

sense revelar detalls que facilitin eludir l'anti-cheat.

---

# 95. Errors del sistema

Si el sistema comet un error:

* no s'ha de presentar com a frau confirmat;
* cal poder corregir l'efecte.

---

# 96. Integritat del joc

En cas de conflicte entre:

```text
preservar un resultat dubtós
```

i:

```text
evitar impacte PvP injust
```

es pot optar per deixar l'Activity registrada però suspendre temporalment els efectes competitius.

---

# 97. FlagAttack de baixa confiança

Una Activity amb confiança insuficient pot quedar:

```text
PENDING_REVIEW
```

o anul·lada competitivament.

No necessàriament eliminada del registre esportiu.

---

# 98. Privacy by design

La privacitat s'ha de considerar en:

* model de dades;
* API;
* mapes;
* notificacions;
* logs;
* exportacions.

No només a la UI.

---

# 99. Security by design

Seguretat també ha d'estar present des del model inicial:

* permisos;
* ownership;
* validacions server-side;
* rate limiting;
* auditoria.

---

# 100. Regles fixades

Es consideren acceptades:

* email verificat per funcionalitats sensibles;
* Activity privada per defecte;
* els efectes territorials no obliguen a publicar el track;
* punt inicial/final són sensibles;
* ubicació en temps real no es comparteix per defecte;
* PvP exigeix més validació que exploració;
* GPS incert no equival a frau;
* una única anomalia no implica sanció;
* comptes múltiples s'han de dificultar, no es pot garantir una persona = un compte;
* denúncies no eliminen contingut automàticament;
* contingut perillós pot restringir-se preventivament;
* el sistema ha de poder revertir efectes fraudulents;
* les accions competitives han de ser auditables.

---

# 101. Decisions pendents

Caldrà definir:

1. sistema d'autenticació;
2. política de contrasenyes o alternatives;
3. sessions;
4. privacitat del perfil;
5. radi de zones privades;
6. política exacta de tracks públics;
7. latència de notificacions;
8. retention de GPS;
9. algoritme anti-spoofing;
10. FraudScore;
11. procés de revisió;
12. sancions;
13. bloqueig d'usuaris;
14. eliminació de compte;
15. tractament dels POI després de baixa;
16. eines d'administració;
17. política de fotografies;
18. importació externa.

---

# 102. Escenari GPS incert

```text
Jugador prem ATACAR

distance = 17 m
accuracy = 28 m

↓
UNCERTAIN

↓
cap penalització

↓
espera o es mou

↓
nova lectura:
distance = 6 m
accuracy = 5 m

↓
CONFIRMED
```

---

# 103. Escenari clarament incorrecte

```text
distance = 72 m
accuracy = 4 m

↓
INCORRECT

↓
AttackEfficiency disminueix
```

No es marca el jugador com a trampós.

---

# 104. Escenari potencialment fraudulent

```text
RUNNING

punt 1
↓ 4 segons
punt 2 a 5 km
↓
velocitat posterior normal
```

Resultat possible:

```text
anomalia GPS severa
↓
tram descartat
↓
Activity revisada
```

No necessàriament sanció de compte.

---

# 105. Escenari de comptes coordinats

```text
5 comptes nous
↓
mateixa zona
↓
només visiten banderes del mateix propietari
↓
mateixos POI
↓
mateixes franges horàries
```

Això pot reduir el pes de les contribucions i generar revisió.

No és prova automàtica de frau.

---

# 106. Escenari de privacitat

```text
Activity comença a casa
↓
12 km running
↓
acaba a casa
```

El servidor utilitza el track complet per validar.

El mapa públic pot mostrar:

```text
12 km
+ activitat territorial
```

sense mostrar:

* casa;
* inici;
* final;
* track complet.

---

# 107. Principi final

TerritoriLord ha de ser capaç de saber prou sobre una Activity per validar el joc,

sense convertir-se en un sistema que exposa innecessàriament on és, on viu o què fa una persona.

La integritat competitiva i la privacitat s'han de dissenyar conjuntament.

---

# 108. Següent document

El següent artefacte recomanat és:

```text
docs/MVP-00-scope.md
```

Hauria de separar:

## MVP obligatori

El mínim necessari per demostrar que:

> activitat → exploració → territori → bandera → orientació → atac

és realment divertit.

## Després de l'MVP

* POI comunitaris complets;
* Reputation avançada;
* rànquings complexos;
* monetització;
* clans;
* imports externs;
* anti-cheat avançat;
* moderació sofisticada.

L'objectiu serà evitar intentar construir tot TerritoriLord abans de poder provar el seu bucle principal.
