# TerritoriLord — Game Rules 04: Progression, Reputation & Economy

**Versió:** v0.2 consolidada
**Estat:** regles funcionals per revisió
**Data:** 2026-09-18

---

# 1. Objectiu

Aquest document defineix:

* XP;
* Level;
* Prestige;
* Reputation;
* Achievements;
* limits;
* rankings;
* economia;
* monetització;
* turisme patrocinat.

No defineix encara valors numèrics finals.

---

# 2. Separació principal

TerritoriLord diferencia:

```text
XP
Power
Prestige
Reputation
```

No són sinònims.

---

# 3. XP

`XP` representa progressió permanent.

Pot obtenir-se per:

* Activities;
* Exploration;
* Discovery;
* Summit;
* POI;
* achievements;
* TourismCampaigns;
* altres fites legítimes.

---

# 4. XP ≠ Power

Invariant:

```text
XP
≠
ActivityPower
```

XP persisteix.

ActivityPower pertany principalment a una Activity.

---

# 5. Perdre no elimina XP

Perdre:

* Territory;
* Flag;
* combat;

no elimina la progressió acumulada.

---

# 6. Level

`Level` deriva principalment de XP.

Pot desbloquejar:

* funcionalitats;
* personalització;
* estadístiques;
* límits addicionals.

---

# 7. Level no domina PvP

Un Level alt no pot donar grans multiplicadors automàtics de:

* Attack;
* Defense.

El jugador veterà pot tenir avantatges indirectes per:

* Knowledge;
* territori;
* experiència;
* Flags.

---

# 8. Model final de Level

Continua PENDENT decidir entre:

* nivell finit;
* nivell indefinit;
* nivell finit + Prestige posterior.

No bloqueja l'MVP.

---

# 9. Prestige

Prestige representa reconeixement històric.

Pot existir en diferents contextos:

* User Prestige;
* FlagPrestige;
* llocs emblemàtics.

No equival a força militar.

---

# 10. FlagPrestige

En UserFlag:

> viatja amb la bandera.

Pot créixer amb:

* antiguitat;
* captures;
* reconquestes;
* notorietat;
* historial.

---

# 11. LocationImportance

És diferent de FlagPrestige.

Pertany al lloc.

Pot augmentar amb:

* visites;
* diversitat d'usuaris;
* activitat;
* ús comunitari.

---

# 12. Regla essencial

```text
FlagPrestige
→ objecte

LocationImportance
→ lloc
```

Una UserFlag traslladada no transporta automàticament la fama territorial de l'antiga ubicació.

---

# 13. PublicFlagSite

En un PublicFlagSite, Prestige i Importance poden relacionar-se amb el mateix lloc perquè:

> la ubicació és permanent.

Continuen sent mètriques diferents.

---

# 14. Reputation

Representa confiança comunitària.

Pot augmentar per:

* POI útils;
* contribucions;
* validacions;
* comportament fiable.

---

# 15. Reputation ≠ combat

No concedeix força PvP significativa.

Pot influir en:

* moderació;
* trust weighting;
* creació comunitària;
* reports.

---

# 16. Achievements

Representen fites permanents.

Exemples:

* Summit;
* exploration;
* campaigns;
* collection;
* rivalries;
* territorial milestones.

---

# 17. Progrés permanent

Inclou principalment:

```text
XP
Level
Achievements
ExplorationHistory
SummitHistory
historical Prestige
```

---

# 18. Estat temporal

Inclou:

```text
TerritoryOwnership
FlagOwnership
FlagDefense
TerritoryDefense
Knowledge
current pressure
```

---

# 19. Principi de pèrdua

```text
temporary defeat
≠
erase permanent progression
```

---

# 20. FLAG_CREATION_CAP

Limita UserFlags creades.

Ha de ser prou baix per evitar saturació.

Valor experimental.

---

# 21. FLAG_CONTROL_CAP

Limita el control actual de Flags.

Pot ser superior a creation cap per permetre captures.

---

# 22. Relació amb territori

El control cap pot créixer parcialment segons:

* progressió;
* territori.

Però necessita sostre.

---

# 23. Evitar bola de neu

No s'ha de crear:

```text
more territory
→ unlimited Flags
→ more Defense
→ more territory
→ unlimited dominance
```

---

# 24. Rankings

No es recomana un únic score universal.

Poden existir rankings separats:

```text
Exploration
Territory
Flags
Community
Sport
```

---

# 25. Períodes

Poden existir:

* weekly;
* monthly;
* yearly;
* historical.

No s'han de confondre amb Seasons.

---

# 26. Seasons

Continuen PENDENTS.

L'arquitectura pot permetre-les.

No s'ha de construir suport específic ara.

---

# 27. Rivalry

Pot generar reconeixement per:

* captures repetides;
* reconquestes;
* shared borders.

No cal que sigui una font directa de gran Power.

---

# 28. Economia inicial

TerritoriLord no necessita una moneda virtual per al MVP.

Els recursos escassos ja són:

* temps;
* Activity;
* Flags;
* Knowledge;
* territori;
* presència.

---

# 29. Per què evitar moneda inicialment

Afegir una moneda prematurament podria:

* complicar el sistema;
* introduir farming;
* desviar la motivació física;
* dificultar equilibratge.

Només s'afegiria si apareix una necessitat funcional real.

---

# 30. Monetització

El sistema deixa obertes diverses vies comercials.

Principi:

> monetitzar utilitat i experiència, no victòria competitiva.

---

# 31. No pay-to-win

No es vendrà:

```text
AttackPower
FlagDefense
Territory
invulnerability
guaranteed capture
```

---

# 32. B2C futur

Pot incloure:

* advanced analytics;
* map layers;
* customization;
* planning;
* export;
* VisitorPass;
* clubs.

---

# 33. B2B / B2G

Pot incloure:

* TourismCampaign;
* SponsoredDiscoveryZone;
* SponsoredPOI;
* DestinationChallenge;
* analytics;
* local commerce campaigns.

---

# 34. TourismCampaign

Una entitat externa pot pagar per:

> crear una experiència de descoberta territorial.

Exemple:

> Descobreix 8 indrets del municipi.

---

# 35. DiscoveryAccess

Pot revelar:

* POI;
* hints;
* routes;
* zones.

No crea:

```text
PhysicalDiscovery
```

---

# 36. VisitorPass

Possible producte B2C futur.

Pot donar accés temporal a:

* discovery content;
* tourism layers;
* routes.

No dona avantatge directe PvP.

---

# 37. SponsoredPOI

POI clarament identificat com:

* sponsored;
* official;
* campaign content.

Pot donar una recompensa superior.

---

# 38. Sponsored reward

Pot augmentar:

* XP;
* campaign progress;
* badge progress;
* Achievement.

No ha de donar superioritat competitiva directa desproporcionada.

---

# 39. Sponsored QR

Es deixa oberta la validació amb:

```text
QR
+
current GPS
+
ClaimRadius
+
server
```

---

# 40. SponsoredClaim

El servidor comprova:

* user;
* campaign;
* token;
* location;
* accuracy;
* reuse policy.

---

# 41. VISIT_CLAIM

No requereix necessàriament Activity activa.

Útil per:

* museu;
* comerç;
* equipament;
* turisme urbà.

---

# 42. ACTIVITY_CLAIM

Requereix Activity vàlida.

Útil per:

* ruta;
* circuit;
* challenge esportiu.

---

# 43. Comerç local

Una campanya futura pot portar el jugador:

```text
discover area
↓
visit POI
↓
visit participating business
↓
QR claim
↓
campaign reward
```

---

# 44. Recompensa patrocinada controlada

El patrocinador no defineix lliurement recompenses que puguin trencar el joc.

TerritoriLord controla:

* tipus;
* màxims;
* efectes.

---

# 45. DiscoveryAccess comprat

Quan expira:

* contingut no visitat torna al Fog normal;
* PhysicalDiscovery real persisteix.

---

# 46. Tourism ≠ PvP intelligence

Pagar no ha de revelar automàticament:

* Defense exacta;
* target competitive coordinates;
* hidden owner data;
* privileged tactical state.

---

# 47. Monetització i baixa densitat

La capa turística també pot aportar valor en zones amb:

* pocs rivals;
* comunitat inicial petita.

Permet un món interessant mitjançant:

* routes;
* POI;
* PublicFlagSites;
* campaigns.

---

# 48. Campaign analytics

Una entitat pot rebre analítica agregada sobre:

* participació;
* POI visitats;
* completion;
* zones explorades.

No implica accés a tracks personals individuals.

---

# 49. Privacitat comercial

Cap patrocinador ha de rebre automàticament:

* ubicació en viu;
* raw GPS;
* identity privada;
* home/work inference.

---

# 50. Future Entitlement

El domini pot incorporar:

```text
Entitlement
Subscription
VisitorPass
```

sense vincular-los directament a Power.

---

# 51. Feature flags

Les funcionalitats comercials poden activar-se de manera independent.

No cal construir-les dins l'MVP.

---

# 52. Teams / Clans

Es deixa oberta aquesta extensió.

No es defineix ara:

* ownership compartit;
* economy d'equip;
* territori col·lectiu.

---

# 53. Imported Activity

Pot donar progressió futura segons regles.

No pot donar:

* attack retroactiu;
* defense retroactiva.

---

# 54. Farming

Progressió i recompenses han d'utilitzar quan calgui:

* diminishing returns;
* unique users;
* caps;
* trust weighting.

---

# 55. Sponsored farming

Els SponsoredClaims han de controlar:

* reuse;
* multiple scans;
* account abuse;
* location spoofing.

---

# 56. QR no substitueix presència

Invariant:

```text
QR possession
≠
physical visit
```

---

# 57. Progressió turística

Una TourismCampaign pot crear progressió específica:

```text
2/8 POI
5/8 POI
8/8 complete
```

Aquesta progressió pot coexistir amb XP general.

---

# 58. Producte comercial sense dependència del PvP

Una entitat turística pot utilitzar TerritoriLord encara que:

> el seu públic no vulgui competir.

Això és intencionat.

---

# 59. Experiments associats

Especialment:

```text
EXP-22 ExplorationPower
EXP-23 DiscoveryPower
EXP-28/29 Flag limits
EXP-43 low density
EXP-45 non-PvP
EXP-48 ClaimRadius
EXP-50 TourismCampaign
EXP-51 sponsored perception
EXP-52 pay-to-win perception
EXP-56 retention
```

---

# 60. Principi final

> **La progressió ha de premiar haver fet coses al món real; la monetització pot enriquir què descobreixes i com ho vius, però no comprar el resultat competitiu.**
