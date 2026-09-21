# TerritoriLord — Traceability 00

**Estat:** matriu de traçabilitat funcional v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document connecta les decisions funcionals de TerritoriLord amb:

* regles de joc;
* entitats del domini;
* MVP;
* fases de desenvolupament;
* experiments;
* criteris futurs de validació.

L'objectiu és detectar situacions com:

```text
decisió presa
↓
però no representada al domini
```

o:

```text
entitat definida
↓
però sense cap regla funcional que la justifiqui
```

o:

```text
funcionalitat prevista
↓
però sense fase on implementar-la
```

---

# 2. Fonts autoritatives actuals

Ordre funcional actual:

```text
DECISIONS-00
DECISIONS-01
DECISIONS-02
DECISIONS-03
        ↓
GLOSSARY-00
        ↓
PROJECT-CONTEXT
GAME-DESIGN-00
GAME-RULES-01..05
DOMAIN-MODEL-00
        ↓
MVP-00
DEVELOPMENT-PHASES-00
```

Important:

els documents antics encara poden contenir conceptes previs a les últimes decisions.

Aquesta matriu utilitza les decisions més recents com a autoritat.

---

# 3. Estat de traçabilitat

S'utilitzen els estats:

```text
COVERED
PARTIAL
FUTURE
EXPERIMENTAL
NEEDS_SYNC
```

## COVERED

El concepte ja té representació suficient.

## PARTIAL

Existeix parcialment però falta alguna peça.

## FUTURE

Està decidit però queda expressament fora de les primeres fases.

## EXPERIMENTAL

La mecànica existeix però algun paràmetre necessita proves.

## NEEDS_SYNC

La decisió és clara però algun document anterior encara s'ha d'actualitzar.

---

# 4. User i identitat

| Concepte                       | Decisió       | Domini                  | Fase   | Estat   |
| ------------------------------ | ------------- | ----------------------- | ------ | ------- |
| User                           | base          | User                    | F0     | COVERED |
| Username públic                | D-175         | User / Profile          | F0     | PARTIAL |
| Nom real no públic per defecte | D-175         | User/Profile            | F0     | PARTIAL |
| Email verificat                | D-093 / D-176 | Identity / Verification | F0     | PARTIAL |
| OAuth futur                    | D-176         | IdentityProvider        | futura | FUTURE  |
| Reputation                     | D-084         | Reputation              | F15+   | COVERED |
| XP                             | D-078/D-079   | Progression             | F16    | COVERED |
| Level                          | D-080/D-081   | Level                   | F16    | PARTIAL |

### Observació

Cal evitar que `User` quedi tècnicament acoblat a:

```text
email + password
```

per permetre OAuth posterior.

---

# 5. Activity

| Concepte          | Decisió             | Domini               | Fase | Estat      |
| ----------------- | ------------------- | -------------------- | ---- | ---------- |
| Activity          | D-006...010         | Activity             | F1   | COVERED    |
| ActivityType      | D-006/D-007         | ActivityType         | F1   | COVERED    |
| Track             | arquitectura        | Track                | F1   | COVERED    |
| Raw GPS Sample    | D-177               | TrackSample          | F1   | PARTIAL    |
| ActivityPurpose   | múltiples decisions | ActivityPurpose      | F1+  | COVERED    |
| Offline recording | D-170               | local Activity state | F1   | PARTIAL    |
| Sync per blocs    | D-180/D-181         | SyncChunk            | F1   | PARTIAL    |
| COMPLETED_LOCAL   | D-182               | ActivityState        | F1   | NEEDS_SYNC |

---

# 6. Validació

| Concepte               | Decisió       | Domini                         | Fase | Estat        |
| ---------------------- | ------------- | ------------------------------ | ---- | ------------ |
| ActivityValidation     | D-009         | ActivityValidation             | F2   | COVERED      |
| ValidationCapabilities | D-010         | ActivityPurpose / capabilities | F2   | COVERED      |
| Circularity            | D-008         | validation                     | F2   | COVERED      |
| CircularityRadius      | pendent       | rules config                   | F2   | EXPERIMENTAL |
| GPS jumps              | D-009         | validation                     | F2   | COVERED      |
| Velocitats impossibles | D-009         | validation                     | F2   | COVERED      |
| Accuracy               | D-009         | validation                     | F2   | COVERED      |
| RulesVersion           | GAME-RULES-03 | RulesVersion                   | F2   | COVERED      |

---

# 7. Exploration

| Concepte                 | Decisió     | Domini                  | Fase | Estat        |
| ------------------------ | ----------- | ----------------------- | ---- | ------------ |
| Exploration              | D-021       | ExplorationCell/history | F3   | COVERED      |
| Exploration permanent    | D-021       | ExplorationHistory      | F3   | COVERED      |
| ExplorationCell          | D-109/D-113 | ExplorationCell         | F3   | PARTIAL      |
| H3                       | D-108/D-112 | geo layer               | F3   | EXPERIMENTAL |
| Resolució Exploration H3 | pendent     | config                  | F3   | EXPERIMENTAL |
| PhysicalDiscovery        | múltiples   | discovery state         | F3   | PARTIAL      |

---

# 8. Fog of War

| Concepte                      | Decisió     | Domini             | Fase    | Estat        |
| ----------------------------- | ----------- | ------------------ | ------- | ------------ |
| UNKNOWN                       | D-017       | KnowledgeState     | F3      | COVERED      |
| DETECTED                      | D-018       | KnowledgeState     | F6/F13  | COVERED      |
| DISCOVERED                    | D-021       | KnowledgeState     | F3      | COVERED      |
| STALE                         | D-022/D-023 | KnowledgeState     | F13     | COVERED      |
| HISTORICAL                    | D-021/D-023 | KnowledgeState     | F13     | COVERED      |
| KnowledgeRetention            | D-025...028 | knowledge rules    | F12/F13 | PARTIAL      |
| Domini retarda Fog            | D-025       | KnowledgeRetention | F12     | COVERED      |
| Pèrdua de domini accelera Fog | D-028       | KnowledgeRetention | F12     | COVERED      |
| Flag com ancoratge            | D-026       | KnowledgeRetention | F12     | COVERED      |
| POI com ancoratge menor       | D-027       | KnowledgeRetention | F12     | COVERED      |
| Intervals temporals           | pendent     | rules config       | F12/F13 | EXPERIMENTAL |

---

# 9. Territory

| Concepte                        | Decisió     | Domini             | Fase    | Estat        |
| ------------------------------- | ----------- | ------------------ | ------- | ------------ |
| TerritoryCell                   | D-011/D-113 | TerritoryCell      | F4      | COVERED      |
| TerritoryOwnership              | D-013       | TerritoryOwnership | F4      | COVERED      |
| Territori neutral               | D-013       | ownership          | F4      | COVERED      |
| Ruta circular                   | D-008       | territory resolver | F4      | COVERED      |
| >=75% dins perímetre            | D-114       | geometry rule      | F4      | EXPERIMENTAL |
| TerritoryBudget                 | D-115       | TerritoryBudget    | F4      | PARTIAL      |
| Territori desconnectat          | D-116       | ownership/topology | F11/F12 | COVERED      |
| Pitjor retenció si desconnectat | D-116/D-128 | defense rules      | F11/F12 | PARTIAL      |
| TerritoryPressure               | D-014/D-015 | TerritoryPressure  | F11     | COVERED      |
| TerritoryDefense                | D-016       | TerritoryDefense   | F11     | COVERED      |
| Envoltat ≠ captura automàtica   | D-127       | territory rules    | F11     | COVERED      |
| Penalització per aïllament      | D-127       | defense modifier   | F11     | PARTIAL      |

---

# 10. PublicFlagSite

| Concepte                         | Decisió     | Domini           | Fase   | Estat      |
| -------------------------------- | ----------- | ---------------- | ------ | ---------- |
| PublicFlagSite                   | D-108/D-148 | PublicFlagSite   | F5+    | NEEDS_SYNC |
| Ubicació fixa                    | D-108/D-126 | PublicFlagSite   | F5+    | COVERED    |
| Pot canviar owner                | D-126       | FlagOwnership    | F9     | COVERED    |
| Pot quedar neutral               | D-149       | FlagOwnership    | F5/F9  | COVERED    |
| Captura amb orientació           | D-150       | FlagAttack       | F7/F9  | COVERED    |
| Defensa inicial baixa si neutral | D-150       | FlagDefense      | F9     | PARTIAL    |
| Creat per sistema/admin/turisme  | D-148       | creator/source   | futura | PARTIAL    |
| Visibilitat segons tipus         | D-158       | VisibilityPolicy | F6/F13 | PARTIAL    |

### Gap documental conegut

Els documents inicials tractaven principalment una única entitat `Flag`.

Caldrà actualitzar-los per representar explícitament:

```text
PublicFlagSite
≠
UserFlag
```

Estat:

**NEEDS_SYNC**

---

# 11. UserFlag

| Concepte                      | Decisió     | Domini              | Fase | Estat      |
| ----------------------------- | ----------- | ------------------- | ---- | ---------- |
| UserFlag                      | D-109       | UserFlag            | F5   | NEEDS_SYNC |
| Creator persistent            | D-111       | creatorUserId       | F5   | PARTIAL    |
| Owner mutable                 | D-111       | ownership           | F9   | COVERED    |
| UserFlagPlacement             | D-110       | UserFlagPlacement   | F5   | NEEDS_SYNC |
| Creació física                | D-119       | creation mission    | F5   | COVERED    |
| Només territori propi/neutral | D-117       | placement validator | F5   | COVERED    |
| No captura passivament        | D-118       | territory rules     | F5   | COVERED    |
| Capturable                    | D-122       | FlagAttack          | F9   | COVERED    |
| Transportable                 | D-122/D-123 | transported state   | F9   | NEEDS_SYNC |
| Replantació amb nova Activity | D-123       | ActivityPurpose     | F9+  | PARTIAL    |
| Replantar en territori propi  | D-124       | placement validator | F9+  | COVERED    |
| Retorn si no es replanta      | D-125/D-154 | FlagReturn          | F9+  | NEEDS_SYNC |
| Retorna neutral               | D-125       | ownership           | F9+  | COVERED    |
| Defense baixa al retorn       | D-125       | FlagDefense         | F9+  | PARTIAL    |

---

# 12. Límit de banderes

| Concepte                         | Decisió     | Domini                | Fase   | Estat        |
| -------------------------------- | ----------- | --------------------- | ------ | ------------ |
| FLAG_CREATION_CAP                | D-120       | limits                | F5/F16 | PARTIAL      |
| FLAG_CONTROL_CAP                 | D-120       | limits                | F9/F16 | PARTIAL      |
| Control relacionat amb territori | D-121       | progression/territory | F16    | PARTIAL      |
| Sostre global                    | D-030/D-121 | limits                | F16    | PARTIAL      |
| Valor exacte                     | pendent     | config                | F16    | EXPERIMENTAL |
| Abandonament remot               | D-130       | UserFlag action       | F9+    | COVERED      |
| Cooldown d'abandonament          | D-130       | rules config          | F9+    | EXPERIMENTAL |

---

# 13. Flag Importance / Prestige / Defense

| Concepte                         | Decisió     | Domini             | Fase   | Estat      |
| -------------------------------- | ----------- | ------------------ | ------ | ---------- |
| Importance                       | D-035...039 | LocationImportance | F5+    | COVERED    |
| Defense                          | D-035       | FlagDefense        | F9/F10 | COVERED    |
| Prestige                         | D-035       | FlagPrestige       | F16    | COVERED    |
| Diversitat usuaris > repetició   | D-037       | importance rules   | F14+   | COVERED    |
| Diminishing returns              | D-038       | rules              | F14+   | COVERED    |
| FlagPrestige viatja              | D-151       | UserFlag           | F9+    | NEEDS_SYNC |
| LocationImportance queda al lloc | D-151/D-152 | location metric    | F9+    | NEEDS_SYNC |
| Visites històriques globals      | D-153       | FlagHistory        | F9+    | PARTIAL    |

---

# 14. Flag Visit

| Concepte                         | Decisió      | Domini             | Fase   | Estat   |
| -------------------------------- | ------------ | ------------------ | ------ | ------- |
| Visit ≠ Attack                   | D-041        | FlagVisit          | F5/F6  | COVERED |
| EffectiveVisit                   | anti-farming | EffectiveFlagVisit | F14+   | PARTIAL |
| Visita pot actualitzar Knowledge | Fog rules    | visit handler      | F6/F13 | COVERED |
| Visita pot aportar Importance    | D-036        | importance         | F14+   | COVERED |

---

# 15. Flag Attack

| Concepte               | Decisió | Domini             | Fase  | Estat   |
| ---------------------- | ------- | ------------------ | ----- | ------- |
| Atac explícit          | D-042   | FlagAttack         | F7/F9 | COVERED |
| Target abans de sortir | D-043   | FlagTarget         | F7    | COVERED |
| Max 1 Flag / Activity  | D-044   | invariant          | F7    | COVERED |
| Target immutable       | D-045   | invariant          | F7    | COVERED |
| Orientació física      | D-046   | attack flow        | F7    | COVERED |
| Informació aproximada  | D-047   | UI policy          | F7    | COVERED |
| Acció manual ATACAR    | D-048   | attack interaction | F7    | COVERED |
| Connexió necessària    | D-184   | server validation  | F7/F9 | COVERED |

---

# 16. AttackLocationAttempt

| Concepte                   | Decisió     | Domini           | Fase | Estat        |
| -------------------------- | ----------- | ---------------- | ---- | ------------ |
| CONFIRMED                  | D-049       | AttemptResult    | F7   | COVERED      |
| UNCERTAIN                  | D-049/D-050 | AttemptResult    | F7   | COVERED      |
| INCORRECT                  | D-049/D-051 | AttemptResult    | F7   | COVERED      |
| Accuracy obligatòria       | D-052       | validation       | F7   | COVERED      |
| Radi                       | D-053       | config           | F7   | EXPERIMENTAL |
| Error penalitza només atac | D-051       | AttackEfficiency | F7   | COVERED      |

---

# 17. Attack resolution

| Concepte                       | Decisió      | Domini           | Fase  | Estat   |
| ------------------------------ | ------------ | ---------------- | ----- | ------- |
| Trobar Flag no resol atac      | D-054        | FlagAttack state | F7/F9 | COVERED |
| Cal completar Activity         | D-055        | attack resolver  | F9    | COVERED |
| Activity invàlida anul·la atac | D-056        | attack resolver  | F9    | COVERED |
| EffectiveAttack                | D-063        | combat engine    | F9    | COVERED |
| DEFENDED                       | combat rules | result           | F9    | COVERED |
| DAMAGED                        | D-068        | result           | F9    | COVERED |
| CAPTURED                       | D-069        | result           | F9    | COVERED |

---

# 18. Attack In Progress

| Concepte                           | Decisió | Domini          | Fase | Estat      |
| ---------------------------------- | ------- | --------------- | ---- | ---------- |
| ATTACK_IN_PROGRESS                 | D-136   | FlagAttackState | F9   | NEEDS_SYNC |
| Bloqueig Flag                      | D-136   | lock/invariant  | F9   | COVERED    |
| Notificació immediata              | D-135   | Notification    | F9   | COVERED    |
| Sense posició atacant              | D-135   | privacy policy  | F9   | COVERED    |
| Resultat després d'acabar Activity | D-137   | resolver        | F9   | COVERED    |

---

# 19. Defense

| Concepte               | Decisió | Domini              | Fase    | Estat        |
| ---------------------- | ------- | ------------------- | ------- | ------------ |
| DEFEND_FLAG            | D-147   | ActivityPurpose     | F10     | COVERED      |
| Passive Maintenance    | D-146   | defense maintenance | F10     | COVERED      |
| Defense limitada       | D-065   | FlagDefense         | F10     | COVERED      |
| Decadència             | D-066   | defense decay       | F12     | COVERED      |
| Rendiments decreixents | D-067   | rules               | F10/F12 | COVERED      |
| TerritorySupport       | D-129   | defense modifier    | F10/F11 | PARTIAL      |
| Fórmula exacta         | pendent | config              | F10/F11 | EXPERIMENTAL |

---

# 20. Power

| Concepte                  | Decisió     | Domini             | Fase | Estat        |
| ------------------------- | ----------- | ------------------ | ---- | ------------ |
| ActivityPower             | D-057       | Power              | F8   | COVERED      |
| PhysicalPower             | D-058       | PowerContribution  | F8   | COVERED      |
| ExplorationPower          | D-058/D-059 | PowerContribution  | F8   | COVERED      |
| DiscoveryPower            | D-058/D-060 | PowerContribution  | F8   | COVERED      |
| Diminishing returns       | D-062       | power rules        | F8   | COVERED      |
| Estimació durant Activity | D-144       | client estimate    | F8   | COVERED      |
| Valor final server-side   | D-173       | server calculation | F8   | COVERED      |
| Fórmula                   | pendent     | RulesVersion       | F8   | EXPERIMENTAL |

---

# 21. Territory + Attack simultanis

| Concepte                       | Decisió | Domini              | Fase | Estat   |
| ------------------------------ | ------- | ------------------- | ---- | ------- |
| ATTACK_FLAG també explora      | D-145   | activity processing | F9   | COVERED |
| També pot conquerir neutral    | D-145   | territory processor | F9   | COVERED |
| També pot pressionar territori | D-145   | territory processor | F11  | COVERED |

Aquesta regla evita convertir els diferents efectes físics d'una Activity en sistemes artificialment exclusius.

---

# 22. POI

| Concepte                | Decisió | Domini               | Fase    | Estat   |
| ----------------------- | ------- | -------------------- | ------- | ------- |
| POI                     | D-072   | POI                  | F14     | COVERED |
| SystemPOI               | D-072   | POISource            | F14     | PARTIAL |
| CommunityPOI            | D-072   | POI                  | F15     | COVERED |
| POI Visit               | D-075   | POIVisit             | F14/F15 | COVERED |
| Report                  | D-073   | POIReport            | F15     | COVERED |
| Moderation              | D-074   | POIModerationCase    | F15     | COVERED |
| Flag + POI coexistència | D-131   | independent entities | F14     | COVERED |

---

# 23. Summit

| Concepte                      | Decisió | Domini           | Fase | Estat   |
| ----------------------------- | ------- | ---------------- | ---- | ------- |
| Summit                        | D-076   | Summit           | F14  | COVERED |
| Independent de Territory/Flag | D-076   | domain invariant | F14  | COVERED |
| Primera visita més valuosa    | D-077   | reward rule      | F14  | COVERED |
| Flag al mateix cim            | D-132   | coexistence      | F14  | COVERED |

---

# 24. TourismCampaign

| Concepte                     | Decisió        | Domini                 | Fase   | Estat      |
| ---------------------------- | -------------- | ---------------------- | ------ | ---------- |
| TourismCampaign              | D-139          | TourismCampaign        | futura | NEEDS_SYNC |
| B2B                          | D-139          | commercial layer       | futura | FUTURE     |
| B2C                          | D-139          | entitlement            | futura | FUTURE     |
| DiscoveryAccess              | D-165          | DiscoveryAccess        | futura | NEEDS_SYNC |
| SponsoredDiscoveryZone       | tourism design | SponsoredDiscoveryZone | futura | NEEDS_SYNC |
| Expiració access             | D-165          | entitlement rules      | futura | COVERED    |
| PhysicalDiscovery persisteix | D-165          | exploration            | futura | COVERED    |

---

# 25. Sponsored POI

| Concepte            | Decisió | Domini                | Fase   | Estat      |
| ------------------- | ------- | --------------------- | ------ | ---------- |
| SponsoredPOI        | D-159   | SponsoredPOI          | futura | NEEDS_SYNC |
| Identificació clara | D-159   | presentation metadata | futura | COVERED    |
| Recompensa superior | D-160   | reward config         | futura | PARTIAL    |
| No pay-to-win       | D-160   | reward restriction    | futura | COVERED    |

---

# 26. Sponsored QR / SponsoredClaim

| Concepte                 | Decisió      | Domini          | Fase   | Estat        |
| ------------------------ | ------------ | --------------- | ------ | ------------ |
| SponsoredClaim           | D-186        | SponsoredClaim  | futura | NEEDS_SYNC   |
| QR                       | D-161        | claim proof     | futura | COVERED      |
| GPS simultani            | D-162/D-186  | claim validator | futura | COVERED      |
| Server-side              | D-163/D-186  | claim service   | futura | COVERED      |
| ClaimRadius              | D-186        | config          | futura | EXPERIMENTAL |
| VISIT_CLAIM              | DECISIONS-03 | ClaimType       | futura | PARTIAL      |
| ACTIVITY_CLAIM           | DECISIONS-03 | ClaimType       | futura | PARTIAL      |
| Reutilització controlada | D-163/D-186  | anti-abuse      | futura | COVERED      |

---

# 27. Exemple turístic complet

Cas:

```text
"Descobreix 8 indrets del municipi"
```

Traçabilitat:

```text
TourismCampaign
↓
SponsoredDiscoveryZone / DiscoveryAccess
↓
POI visibles parcialment
↓
usuari es desplaça físicament
↓
PhysicalDiscovery
↓
SponsoredClaim
↓
QR + GPS
↓
recompensa
↓
exploració permanent
```

Estat:

**CONCEPTUALMENT COVERED**

Implementació:

**FUTURE**

---

# 28. Progression

| Concepte          | Decisió     | Domini      | Fase    | Estat   |
| ----------------- | ----------- | ----------- | ------- | ------- |
| XP                | D-078/D-079 | XP          | F16     | COVERED |
| Level             | D-080/D-081 | Level       | F16     | PARTIAL |
| Prestige          | D-082/D-083 | Prestige    | F16     | COVERED |
| Reputation        | D-084/D-085 | Reputation  | F15/F16 | COVERED |
| Achievements      | design      | Achievement | F16     | COVERED |
| Level model final | D-166       | Level       | F16     | PENDENT |
| Seasons           | D-167       | Season      | futura  | FUTURE  |
| Clans             | D-168       | Team/Clan   | futura  | FUTURE  |

---

# 29. Local vs visitor

| Concepte                 | Decisió     | Domini           | Fase   | Estat   |
| ------------------------ | ----------- | ---------------- | ------ | ------- |
| Sense bonus per domicili | D-086       | rules            | global | COVERED |
| Avantatge per presència  | D-087       | decay/knowledge  | F12    | COVERED |
| Turista pot conquerir    | D-088/D-141 | territory        | F4+    | COVERED |
| Mateixes regles          | D-141       | domain invariant | global | COVERED |

---

# 30. Privacy

| Concepte                   | Decisió | Domini                | Fase  | Estat   |
| -------------------------- | ------- | --------------------- | ----- | ------- |
| Activity privada           | D-089   | Visibility            | F1/F0 | PARTIAL |
| Inici/final sensibles      | D-090   | privacy processing    | F1    | PARTIAL |
| Sense ubicació rival live  | D-091   | API/privacy           | F9    | COVERED |
| Resultat separat del track | D-092   | public representation | F4+   | COVERED |
| Username públic            | D-175   | profile               | F0    | COVERED |

---

# 31. Anti-cheat

| Concepte                       | Decisió       | Domini          | Fase   | Estat   |
| ------------------------------ | ------------- | --------------- | ------ | ------- |
| GPS anomaly ≠ fraud            | D-094         | anomaly model   | F2/F18 | COVERED |
| PvP més estricte               | D-095         | capabilities    | F2/F7  | COVERED |
| Evidència múltiple             | D-096         | fraud rules     | F18    | COVERED |
| Sybil mitigation               | D-097         | anti-abuse      | F18    | PARTIAL |
| Imported Activity no PvP       | D-098/D-142   | activity source | futura | COVERED |
| Rate limits                    | GAME-RULES-05 | security        | F0+    | PARTIAL |
| Reversió resultats fraudulents | GAME-RULES-05 | audit           | F18    | PARTIAL |

---

# 32. Imported Activities

| Concepte              | Decisió | Domini         | Fase   | Estat   |
| --------------------- | ------- | -------------- | ------ | ------- |
| Garmin/Strava/FIT/GPX | D-142   | ActivitySource | futura | FUTURE  |
| Pot donar historial   | D-142   | Activity       | futura | COVERED |
| Pot donar exploració  | D-142   | Exploration    | futura | COVERED |
| Pot donar XP          | D-142   | progression    | futura | COVERED |
| No Attack             | D-142   | invariant      | futura | COVERED |
| No Defense            | D-142   | invariant      | futura | COVERED |

---

# 33. Architecture

| Decisió              | Component       | Fase   | Estat        |
| -------------------- | --------------- | ------ | ------------ |
| PWA first            | apps/web        | F0     | COVERED      |
| Native future        | future client   | futura | FUTURE       |
| API separada         | apps/api        | F0     | COVERED      |
| PostgreSQL           | DB              | F0     | COVERED      |
| PostGIS              | geo persistence | F0/F3  | COVERED      |
| H3                   | geo domain      | F3/F4  | EXPERIMENTAL |
| MapLibre             | map client      | F3     | COVERED      |
| Server authoritative | API/domain      | F0+    | COVERED      |
| Monorepo             | repository      | F0     | COVERED      |
| packages/domain      | shared domain   | F0     | COVERED      |
| packages/geo         | geo primitives  | F0     | COVERED      |
| packages/contracts   | API contracts   | F0     | COVERED      |

---

# 34. Offline / sync

| Decisió                  | Component         | Fase   | Estat   |
| ------------------------ | ----------------- | ------ | ------- |
| Recorder offline         | client storage    | F1     | COVERED |
| Sync oportunista         | sync engine       | F1     | COVERED |
| Chunks                   | SyncChunk         | F1     | PARTIAL |
| Idempotència             | API contract      | F1     | COVERED |
| Final sync               | Activity workflow | F1     | COVERED |
| Mapes offline posteriors | map storage       | futura | FUTURE  |
| PvP attack online        | attack API        | F7/F9  | COVERED |

---

# 35. Raw data / derived data

| Concepte               | Decisió     | Component          | Estat   |
| ---------------------- | ----------- | ------------------ | ------- |
| Raw GPS                | D-177       | track persistence  | COVERED |
| Derived data separades | D-178       | result persistence | COVERED |
| RulesVersion           | D-178       | derived results    | COVERED |
| Retenció indefinida    | NO decidida | storage policy     | PENDENT |
| Compactació            | futura      | storage policy     | FUTURE  |
| Mesurar cost real      | D-179       | operations         | FUTURE  |

---

# 36. Monetització

| Concepte                | Estat    |
| ----------------------- | -------- |
| No pay-to-win           | COVERED  |
| TourismCampaign         | FUTURE   |
| VisitorPass             | FUTURE   |
| SponsoredPOI            | FUTURE   |
| Sponsored QR            | FUTURE   |
| Advanced analytics      | FUTURE   |
| Personalització         | FUTURE   |
| Clubs                   | FUTURE   |
| AttackPower de pagament | PROHIBIT |
| Defense de pagament     | PROHIBIT |
| Captura de pagament     | PROHIBIT |

---

# 37. Development phases traceability

## Fase 0 — Foundation

Cobreix:

* arquitectura;
* monorepo;
* web;
* API;
* DB;
* PostGIS;
* contracts;
* tests;
* identity base.

No ha d'implementar mecàniques de joc.

---

## Fase 1 — Activity Recorder

Cobreix:

* Activity;
* Track;
* GPS;
* offline;
* sync.

---

## Fase 2 — Validation Engine

Cobreix:

* ActivityValidation;
* capabilities;
* GPS anomalies;
* circularity.

---

## Fase 3 — Map + Fog

Cobreix:

* ExplorationCell;
* Fog inicial;
* PhysicalDiscovery.

---

## Fase 4 — Neutral Territory

Cobreix:

* TerritoryCell;
* TerritoryOwnership;
* geometria circular;
* TerritoryBudget inicial.

---

## Fase 5 — Basic Flags

Ha de diferenciar:

```text
PublicFlagSite
UserFlag
UserFlagPlacement
```

Aquesta és una actualització necessària respecte al document de fases original.

---

## Fase 6 — Flag discovery

Cobreix:

* Fog;
* Detection;
* Discovery;
* visibilitat de Flags.

---

## Fase 7 — Orientation Attack

Cobreix:

* FlagTarget;
* orientation;
* AttackLocationAttempt;
* CONFIRMED/UNCERTAIN/INCORRECT.

---

## Fase 8 — Power

Cobreix:

* ActivityPower;
* contributions;
* preview;
* RulesVersion.

---

## Fase 9 — Flag Combat

Cobreix:

* EffectiveAttack;
* FlagDefense;
* ATTACK_IN_PROGRESS;
* capture;
* PublicFlagSite ownership;
* UserFlag capture/transport.

---

## Fase 10 — Defense

Cobreix:

* DEFEND_FLAG;
* Passive Maintenance;
* TerritorySupport inicial.

---

## Fase 11 — Rival Territory

Cobreix:

* TerritoryPressure;
* TerritoryDefense;
* aïllament;
* fronteres.

---

## Fase 12 — Decay & Presence

Cobreix:

* Defense decay;
* territorial decay;
* KnowledgeRetention.

---

## Fase 13 — Advanced Fog

Cobreix:

* DETECTED;
* STALE;
* HISTORICAL;
* retenció avançada.

---

## Fase 14 — POI & Summits

Cobreix:

* POI del sistema;
* Summit;
* descoberta.

---

## Fase 15 — Community POI

Cobreix:

* CommunityPOI;
* report;
* moderation;
* Reputation inicial.

---

## Fase 16 — Progression

Cobreix:

* XP;
* Level;
* Prestige;
* Achievements;
* limits.

---

## Fase 17 — Rivalries

Cobreix:

* Rivalry;
* rankings;
* capture history.

---

## Fase 18 — Advanced Anti-cheat

Cobreix:

* fraud patterns;
* Sybil;
* farming;
* audit.

---

## Fase 19 — Social & Notifications

Cobreix:

* perfil ampliat;
* notifications;
* social layer.

Nota:

les notificacions mínimes necessàries per PvP han d'existir abans, a F9.

F19 representa la capa social completa.

---

## Fase 20 — Monetization

Cobreix infraestructura general de monetització.

Però les funcionalitats turístiques poden necessitar un bloc propi posterior.

---

# 38. Gap detectat — Tourism

`DEVELOPMENT-PHASES-00` no defineix encara amb prou precisió una fase per:

* TourismCampaign;
* DiscoveryAccess;
* SponsoredPOI;
* SponsoredClaim;
* QR + GPS;
* VisitorPass.

Això no bloqueja el MVP.

Però abans d'arribar a monetització s'haurà d'afegir una fase específica.

Proposta conceptual futura:

```text
FASE T — Tourism & Sponsored Experiences
```

No cal numerar-la ni planificar-la ara.

Estat:

**FUTURE / NEEDS_SYNC**

---

# 39. Gap detectat — model de Flags

`DOMAIN-MODEL-00` i els GAME-RULES inicials es van definir abans de consolidar:

```text
PublicFlagSite
UserFlag
UserFlagPlacement
```

Caldrà actualitzar-los.

Estat:

**NEEDS_SYNC**

No és una decisió pendent.

És una actualització documental pendent.

---

# 40. Gap detectat — UserFlag transportada

Cal assegurar que el model futur representa explícitament els estats:

```text
PLANTED
CAPTURED / TRANSPORTED
RETURNED_NEUTRAL
```

o equivalents.

No s'han de fixar encara els noms tècnics definitius.

Estat:

**NEEDS_SYNC**

---

# 41. Gap detectat — LocationImportance

Cal evitar que `FlagImportance` continuï modelant-se com una propietat universal de `Flag`.

Per UserFlag:

```text
FlagPrestige
→ bandera

LocationImportance
→ ubicació
```

Estat:

**NEEDS_SYNC**

---

# 42. Gap detectat — SponsoredClaim

El domini inicial no contenia encara:

```text
TourismCampaign
DiscoveryAccess
SponsoredDiscoveryZone
SponsoredPOI
SponsoredClaim
ClaimType
```

Això és correcte perquè es van decidir posteriorment.

S'haurà d'incorporar quan es consolidi `DOMAIN-MODEL-00`.

Estat:

**NEEDS_SYNC / FUTURE**

---

# 43. Gap detectat — Privacy model

Les regles estan definides, però encara no existeix un model conceptual prou explícit per:

* ActivityVisibility;
* TrackVisibility;
* privacy zones;
* public territorial result.

No bloqueja F0.

S'ha de resoldre abans de publicar tracks o perfils socials.

Estat:

**PARTIAL**

---

# 44. Gap detectat — Audit trail

El disseny anti-cheat requereix poder reconstruir:

```text
Activity
RulesVersion
Validation
Power
Attack
Defense before
Defense after
Result
```

El concepte existeix però encara no està representat formalment al model de domini.

Estat:

**PARTIAL**

---

# 45. Gap detectat — notificacions mínimes

`Notification` existeix al domini inicial.

Cal distingir:

```text
GAMEPLAY_CRITICAL_NOTIFICATION
```

com l'avís d'atac, de futures notificacions socials.

Les primeres són necessàries a F9, no a F19.

Estat:

**PARTIAL**

---

# 46. Decisions experimentals correctament obertes

No són gaps:

```text
H3 resolution
75% threshold
CircularityRadius
Flag interaction radius
Power formula
Defense formula
TerritoryBudget exact
Knowledge decay
FlagInfluenceRadius
FLAG_CREATION_CAP value
FLAG_CONTROL_CAP value
cooldowns
Fog intervals
```

Estat:

**EXPERIMENTAL**

Aquestes decisions no s'han de forçar abans de disposar de proves.

---

# 47. Decisions que poden continuar futures

Tampoc són gaps:

```text
Level model final
Seasons
Teams / Clans
Premium plans
QR static vs dynamic
Imported activity providers
Offline maps
native app
```

No bloquegen `SPEC-00`.

---

# 48. Readiness per àrea

## Product vision

```text
READY
```

## Core gameplay loop

```text
READY FOR REVIEW
```

## Activity model

```text
READY FOR REVIEW
```

## Exploration / Fog

```text
READY FOR REVIEW
```

## Territory

```text
READY FOR REVIEW
```

## Flag model

```text
READY AFTER DOCUMENT SYNC
```

## PvP

```text
READY FOR REVIEW
```

## Progression

```text
READY ENOUGH FOR MVP
```

## Tourism

```text
CONCEPTUALLY READY
FUTURE IMPLEMENTATION
```

## Privacy / anti-cheat

```text
READY ENOUGH FOR MVP
DETAILS LATER
```

## Architecture

```text
READY FOR REVIEW
```

---

# 49. Principals actualitzacions documentals pendents

Abans de considerar la documentació completament consolidada:

1. actualitzar `DOMAIN-MODEL-00`;
2. actualitzar `GAME-DESIGN-00`;
3. actualitzar `GAME-RULES-01`;
4. consolidar `GAME-RULES-02`;
5. revisar `GAME-RULES-04` amb la nova separació Prestige/LocationImportance;
6. incorporar turisme als documents funcionals corresponents;
7. actualitzar `DEVELOPMENT-PHASES-00` perquè F5/F9 reflecteixin les dues classes de Flag;
8. deixar una futura fase Tourism explícitament reservada.

Aquesta feina correspon al punt de consolidació documental que s'ha decidit deixar per més endavant.

---

# 50. Traçabilitat del core loop

El bucle principal queda completament connectat:

```text
USER
↓
ACTIVITY
↓
RAW GPS
↓
VALIDATION
↓
EXPLORATION
↓
FOG / KNOWLEDGE
↓
TERRITORY
↓
FLAG DETECTION
↓
FLAG DISCOVERY
↓
FLAG TARGET
↓
NEW ACTIVITY
↓
ORIENTATION
↓
ATTACK LOCATION ATTEMPT
↓
ATTACK IN PROGRESS
↓
ACTIVITY COMPLETION
↓
SERVER VALIDATION
↓
ACTIVITY POWER
↓
EFFECTIVE ATTACK
↓
FLAG DEFENSE
↓
RESULT
↓
TERRITORY / FLAG / HISTORY
↓
NEW MOTIVATION
```

No s'ha identificat actualment cap salt conceptual obligatori sense una mecànica definida.

---

# 51. Traçabilitat turística

El bucle turístic queda conceptualment:

```text
TOURISM CAMPAIGN
↓
DISCOVERY ACCESS
↓
HINT / POI / ROUTE
↓
PHYSICAL VISIT
↓
PHYSICAL DISCOVERY
↓
OPTIONAL QR
↓
SERVER LOCATION VALIDATION
↓
SPONSORED CLAIM
↓
REWARD
↓
PERMANENT EXPLORATION HISTORY
```

Aquesta capa no necessita modificar el core PvP.

---

# 52. Principi de control

Quan s'afegeixi una nova decisió:

```text
DECISION
↓
GLOSSARY
↓
DOMAIN
↓
RULE
↓
PHASE
↓
TEST / EXPERIMENT
```

Si una d'aquestes connexions no existeix:

> la decisió encara no està completament traçada.

---

# 53. Conclusió

La traçabilitat actual mostra que el nucli funcional de TerritoriLord està àmpliament definit.

Els principals forats detectats no són decisions de producte pendents, sinó conseqüència natural que diversos documents es van escriure abans de les decisions més recents.

Els principals punts a sincronitzar més endavant són:

```text
PublicFlagSite
UserFlag
UserFlagPlacement
LocationImportance
transport de UserFlag
TourismCampaign
DiscoveryAccess
SponsoredPOI
SponsoredClaim
```

No s'ha detectat cap necessitat, a partir d'aquesta traçabilitat, d'obrir una nova ronda general de disseny abans de la revisió funcional externa.
