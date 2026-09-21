# TerritoriLord — Game Rules 05: Security, Privacy & Anti-Cheat

**Versió:** v0.2 consolidada
**Estat:** regles funcionals de seguretat
**Data:** 2026-09-18

---

# 1. Objectiu

Aquest document defineix principis de:

* privacitat;
* seguretat;
* GPS integrity;
* anti-cheat;
* moderació;
* seguretat física;
* auditabilitat.

No defineix encara una arquitectura de seguretat detallada.

---

# 2. Principi general

TerritoriLord processa informació geogràfica potencialment sensible.

Per tant:

> la funcionalitat de joc no justifica exposar informació personal innecessària.

---

# 3. Privacy by default

Les Activities han de ser privades per defecte.

Els resultats del joc poden ser visibles sense publicar:

* raw track;
* inici;
* final;
* timestamps precisos.

---

# 4. Public result ≠ Public track

Invariant:

```text
territory result visible
≠
track visible
```

---

# 5. Inici i final

Els punts d'inici/final són especialment sensibles perquè poden revelar:

* domicili;
* feina;
* rutines.

No s'han de publicar per defecte.

---

# 6. PrivacyZone

Es deixa oberta una futura capa de:

```text
PrivacyZone
```

manual o automàtica.

La pròpia zona de privacitat tampoc s'ha de revelar públicament.

---

# 7. Username públic

La identitat competitiva principal és:

```text
username
```

No es necessita exposar:

* email;
* nom civil;
* dades d'autenticació.

---

# 8. Sense ubicació rival en temps real

TerritoriLord no mostrarà per defecte:

* coordenades live;
* track live;
* posició actual rival.

---

# 9. Notificació d'atac

Quan existeix:

```text
ATTACK_IN_PROGRESS
```

el propietari pot rebre:

> «La teva bandera està sent atacada.»

Aquesta notificació no indica on és exactament l'atacant.

---

# 10. Timing de notificació

Es pot notificar immediatament després de validar l'atac.

El resultat final arriba:

> després de completar i validar l'Activity rival.

---

# 11. Bloqueig de la Flag

Durant `ATTACK_IN_PROGRESS`:

* no eliminar;
* no abandonar;
* no moure;
* no alterar retroactivament l'atac.

Això protegeix la integritat competitiva.

---

# 12. PublicFlagSite vs UserFlag

Les regles de seguretat han de distingir:

```text
PublicFlagSite
```

de:

```text
UserFlag
```

Especialment perquè una UserFlag pot:

* ser transportada;
* ser replantada;
* retornar neutral.

---

# 13. Creació física de UserFlag

No es pot crear una UserFlag remotament seleccionant una coordenada arbitrària.

Cal:

* Activity;
* presència física;
* validació.

---

# 14. Accessibilitat

Una Flag no necessita estar sobre:

* carretera;
* sender cartografiat.

Però ha de ser legítimament accessible.

---

# 15. Cartografia no és autoritat absoluta

Un mapa incomplet no invalida automàticament una ubicació.

La seguretat s'ha d'avaluar mitjançant múltiples indicadors.

---

# 16. Propietat privada i zones perilloses

Flags i POI poden denunciar-se per:

* private property;
* dangerous access;
* restricted access;
* incorrect location.

---

# 17. Safety first

El joc no ha d'exigir:

> arribar exactament a una coordenada si això implica risc físic.

La tolerància GPS i els radis d'interacció han de tenir en compte la seguretat.

---

# 18. Email verificat

Es requerirà email verificat per accions sensibles com:

* PvP;
* creació de Flags;
* contribucions comunitàries;
* reports.

El detall exacte pot evolucionar.

---

# 19. Multiaccount

No es pot garantir tècnicament:

```text
1 human = 1 account
```

sense mecanismes d'identitat molt més intrusius.

TerritoriLord reduirà el benefici dels comptes múltiples.

---

# 20. Sybil mitigation

Pot incloure:

* account age;
* limits;
* Reputation;
* trust weighting;
* behavioural patterns;
* rate limits.

No s'utilitzarà identificació civil obligatòria inicialment.

---

# 21. GPS spoofing

Les coordenades del client no s'han de considerar automàticament fiables.

Es poden analitzar:

* speed;
* acceleration;
* continuity;
* timestamps;
* accuracy;
* altitude;
* trajectory;
* historical behaviour.

---

# 22. GPS anomaly ≠ Fraud

Invariant:

```text
GPS anomaly
≠
Fraud
```

Una anomalia pot provenir de:

* cobertura;
* muntanya;
* edificis;
* dispositiu;
* sistema operatiu.

---

# 23. Evidència múltiple

Una sanció significativa no s'ha de basar normalment en:

> una sola lectura GPS estranya.

---

# 24. Severity

Les anomalies poden categoritzar-se conceptualment com:

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

Els noms finals no estan fixats.

---

# 25. ValidationCapabilities com a defensa

Una Activity sospitosa no necessita ser completament descartada.

Exemple:

```text
CAN_COUNT_DISTANCE = YES
CAN_EXPLORE = YES
CAN_ATTACK_FLAG = NO
```

---

# 26. PvP més estricte

L'exigència de confiança augmenta aproximadament així:

```text
history
<
exploration
<
territory
<
defense
<
attack
```

---

# 27. AttackLocationAttempt

La comprovació d'atac utilitza:

* location;
* accuracy;
* timing;
* target;
* Activity state.

---

# 28. UNCERTAIN

Si el GPS no permet una decisió fiable:

```text
UNCERTAIN
```

No penalitza.

Això és una regla de justícia i seguretat.

---

# 29. INCORRECT

Només quan la posició és clarament incorrecta amb accuracy suficient es pot aplicar penalització d'orientació.

---

# 30. Atac online inicial

Iniciar formalment l'atac requereix inicialment connexió.

El backend valida l'estat real de la Flag abans de crear:

```text
ATTACK_IN_PROGRESS
```

---

# 31. Limitació coneguda

Aquesta regla implica:

> una Flag sense cobertura pot no ser atacable inicialment.

S'ha de validar amb `EXP-39` i `EXP-40`.

---

# 32. Activity offline

La falta d'Internet durant una Activity:

> no és una anomalia anti-cheat per si mateixa.

L'enregistrament és local-first.

---

# 33. Sync idempotent

La sincronització ha de permetre:

* reintents;
* cobertura intermitent;
* chunks repetits.

Sense duplicar mostres.

---

# 34. Raw GPS

Inicialment es conservaran les mostres originals necessàries per:

* validation;
* debugging;
* anti-cheat;
* audit.

---

# 35. Retenció

No s'ha decidit que Raw GPS es conservi indefinidament.

Caldrà mesurar:

* cost;
* utilitat;
* volum;
* necessitat legal/operativa.

---

# 36. Derived data

Cal separar:

```text
RAW
```

de:

```text
DERIVED
```

Els resultats derivats poden estar associats a `RulesVersion`.

---

# 37. Imported Activities

Activitats importades futures poden potencialment aportar:

* history;
* exploration;
* XP.

No poden realitzar retroactivament:

* Attack;
* Defense.

---

# 38. Farming

Es considera farming la repetició artificial destinada a obtenir una recompensa desproporcionada.

Exemples:

* mateix POI;
* mateixa Flag;
* micro-routes;
* capture trading.

---

# 39. Diminishing returns

Quan sigui possible es prefereix:

```text
diminishing returns
```

a prohibicions arbitràries.

---

# 40. Importance anti-farming

LocationImportance ha de valorar especialment:

* usuaris independents;
* diversitat;
* ús real.

No el nombre brut de visites.

---

# 41. FlagDefense anti-farming

Repeated micro-defense no ha de permetre arribar immediatament a defensa màxima.

---

# 42. Rivalry vs collusion

Captures repetides entre els mateixos jugadors poden ser:

* Rivalry legítima;
* capture trading.

No es pot decidir només pel nombre d'interaccions.

---

# 43. Rate limits

Cal aplicar rate limiting especialment a:

* login;
* account actions;
* reports;
* Flag creation;
* AttackLocationAttempts;
* SponsoredClaims.

---

# 44. POI moderation

Cal distingir problemes de:

```text
CONTENT
SAFETY
GAME_INTEGRITY
```

No totes les denúncies segueixen el mateix procés.

---

# 45. Reports no auto-delete

Moltes denúncies no impliquen automàticament:

```text
DELETE
```

perquè podrien ser coordinades per rivals.

---

# 46. Safety restriction

En casos de risc físic important es pot justificar:

```text
temporary restriction
```

mentre es revisa.

---

# 47. SponsoredPOI

El contingut patrocinat ha d'estar identificat com a:

* official;
* sponsored;
* campaign content.

---

# 48. SponsoredClaim

Una recompensa promocional s'ha de validar server-side.

Inputs possibles:

```text
User
Campaign
QR/token
Location
Accuracy
Timestamp
ClaimType
```

---

# 49. QR no és suficient

Invariant:

```text
valid QR
+
wrong location
=
NO REWARD
```

Una fotografia compartida del QR no ha de funcionar remotament.

---

# 50. ClaimLocationPolicy

El servidor ha de comprovar:

* punt;
* radi;
* o geometria definida.

El ClaimRadius exacte és experimental.

---

# 51. QR static vs dynamic

Continua obert.

Un QR estàtic pot ser suficient si:

* GPS;
* rate limiting;
* claim reuse;
* campaign rules;

redueixen suficientment l'abús.

---

# 52. Sponsored farming

Cal controlar:

* repeated claims;
* multiaccount;
* GPS spoofing;
* QR sharing.

---

# 53. VISIT_CLAIM

No necessita necessàriament Activity esportiva activa.

La ubicació física continua sent obligatòria quan la campanya així ho defineixi.

---

# 54. ACTIVITY_CLAIM

Pot exigir:

* Active Activity;
* valid visit;
* ActivityValidation.

---

# 55. Admin

Les eines administratives han d'utilitzar:

* least privilege;
* audit trail.

No tots els administradors necessiten totes les capacitats.

---

# 56. Audit trail

Els resultats competitius importants han de ser reconstruïbles.

Com a mínim conceptualment:

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

---

# 57. Reversió

Si es confirma frau, el sistema pot necessitar revertir:

* TerritoryOwnership;
* capture;
* XP;
* Prestige;
* rewards.

Aquest mecanisme s'ha de dissenyar abans de necessitar moderació avançada.

---

# 58. Sancions

Poden existir gradualment:

* warning;
* restricted action;
* competitive restriction;
* suspension.

No cal implementar el sistema complet a l'MVP.

---

# 59. Explicabilitat

Quan una Activity és invalidada o limitada, l'usuari ha de poder entendre una causa general.

Exemple:

> «La precisió GPS no ha estat suficient per validar l'atac.»

No és necessari revelar detalls que facilitin evitar l'anti-cheat.

---

# 60. Blocking entre usuaris

Si s'implementa:

> bloquejar un User no pot eliminar artificialment l'estat compartit del món.

Ha de separar-se:

* social layer;
* territorial layer.

---

# 61. Biometria / identitat civil

No es considera necessària per l'MVP.

S'evita augmentar intrusivament la identificació sense necessitat demostrada.

---

# 62. Device fingerprinting

Només considerar en el futur si existeix un problema real de multiaccount/fraud.

Té implicacions de privacitat.

---

# 63. PublicFlagSite

Com que és persistent:

* el seu historial pot ser públic;
* la seva ubicació pot tenir política pròpia de visibilitat.

No implica revelar l'activitat actual d'un jugador.

---

# 64. UserFlag

La ubicació d'una UserFlag plantada forma part del món del joc segons Fog i discovery.

El seu historial de placements no implica que tots els punts històrics hagin de ser públics amb detall temporal complet.

---

# 65. Seguretat de domicili

La combinació de:

* Territory;
* Activities;
* timestamps;
* repetits starts;

pot revelar més del que revela una única Activity.

Cal revisar també inferències indirectes.

---

# 66. Map visibility

Fog no és una mesura de privacitat.

És una mecànica de joc.

No s'ha d'utilitzar com a única protecció d'informació sensible.

---

# 67. Tourism analytics

Una entitat turística pot rebre informació agregada.

No raw tracks personals per defecte.

---

# 68. Sponsor access

Un patrocinador no ha de poder consultar:

* moviment individual;
* historial privat;
* ubicació live;

simplement perquè finança una campanya.

---

# 69. Data minimization

Guardar una dada perquè:

> «potser algun dia serà útil»

no és suficient justificació indefinida.

Aquest principi serà especialment important per Raw GPS.

---

# 70. PWA risk

Cal validar aviat:

* background;
* locked screen;
* GPS continuity;
* browser lifecycle.

Si la plataforma no és prou fiable:

> el client natiu pot avançar-se.

---

# 71. Experiments crítics

Especialment:

```text
EXP-31 PWA GPS
EXP-32 locked screen
EXP-33 background
EXP-34 battery
EXP-35 sampling
EXP-36 storage
EXP-37 sync
EXP-38 offline finish
EXP-39 attack coverage
EXP-40 short connectivity
EXP-48 SponsoredClaim radius
EXP-49 QR sharing
EXP-53 location privacy
EXP-54 inaccessible places
```

---

# 72. Anti-cheat MVP mínim

Inicialment és suficient cobrir:

* timestamp inconsistencies;
* impossible speed;
* GPS jumps;
* poor PvP accuracy;
* max 1 attack per Activity;
* server-side attack validation;
* verified email;
* rate limits;
* diminishing repeated visits.

---

# 73. Anti-cheat avançat

Es deixa per una fase posterior:

* sophisticated pattern detection;
* Sybil graph;
* fraud scoring;
* ML;
* complex device signals.

Només després de disposar de dades reals.

---

# 74. Principi de seguretat

> **La competitivitat no pot justificar ni exposar ubicació sensible ni penalitzar injustament els errors normals del món físic.**

---

# 75. Principi d'integritat

> **El servidor decideix els resultats competitius; el dispositiu aporta evidència, no autoritat.**

---

# 76. Principi final

> **TerritoriLord ha de dificultar l'abús sense convertir una activitat outdoor normal en un procés de verificació hostil.**
