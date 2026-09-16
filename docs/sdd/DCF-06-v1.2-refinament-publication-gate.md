# DCF-06 v1.2 — Refinament del publication gate

**Versió:** 1.2
**Estat:** RESOLT
**Data:** 2026-09-16
**Data de ratificació:** 2026-09-16
**Ratificat per:** Oriol
**Document base:** DCF-06 v1.1
**Abast d'aquest document:** modifica únicament §5.3 de DCF-06 v1.1
**Naturalesa:** esmena a DCF-06 v1.1

## 0. Nota

Aquesta versió substitueix **únicament §5.3 (Aprovació) de DCF-06 v1.1**.
Resta de v1.1 (DCF-02, DCF-03, DCF-07, DCF-09) es manté vigent i ratificat.

Motiu: SPEC-00 v0.5, ara disponible íntegrament, diu explícitament que un
usuari aprovat publica directament sense segona aprovació administrativa.
DCF-06 v1.1 havia introduït \`PUBLICATION_APPROVER\` com a gate humà
obligatori, contradient SPEC-00. Cal resoldre la contradicció sense
trencar cap de les dues.

## 1. §5.3 — Aprovació (revisada)

### 1.1 Decisió

El **gate de publicació és automàtic** al backend. S'avalua quan el
titular fa opt-in i totes les condicions es compleixen.

**El gate automàtic comprova:**

- classificació DCF-02 completada (estació/sensor/camp);
- consentiment registrat, quan sigui la base aplicable;
- política de precisió geogràfica vàlida;
- \`quality_profile_id\` versionat existent;
- procedència i llicència/base jurídica aplicable;
- cap indicador productiu.

**Si totes les condicions passen:** l'estació passa a \`PUBLIC_ALLOWED\`
sense intervenció humana.

**Si alguna condició no es pot resoldre automàticament** (per exemple,
llicència ambigua, procedència no verificable), s'escala al capability
\`PUBLICATION_APPROVER\` (SPEC-09), que revisa i aprova o rebutja.

### 1.2 Correspondència amb SPEC-00 v0.5

| Aspecte | SPEC-00 v0.5 §2.2 / RF-03 | DCF-06 v1.2 |
|---------|---------------------------|-------------|
| Aprovació d'usuari | Manual, \`SUPERADMIN\` | Es manté |
| Publicació d'estació per usuari aprovat | Directa, sense segona aprovació | Es manté: gate automàtic, no humà |
| Intervenció administrativa a la publicació | No per defecte | Només excepcional, per escalat |
| Revocació | \`SUPERADMIN\` pot despublicar | Es manté |

**Conclusió:** DCF-06 v1.2 **no contradiu SPEC-00**. El gate automàtic
no és una "segona aprovació": és una validació tècnica equivalent a les
validacions tècniques que SPEC-00 §2.2 ja exigeix (font vàlida,
observació correcta, ubicació pública, acceptació).

### 1.3 Capabilities implicats

- **\`PUBLICATION_APPROVER\`**: capability de domini per resoldre casos
  ambigus. SPEC-09 en defineix la implementació (rol o grup).
- **\`DATA_REVIEWER\`**: capability de domini per resoldre estats
  \`EN_REVISIO\` de qualitat.

Ambdós són compatibles amb \`SUPERADMIN\` segons SPEC-00.

## 2. Impacte sobre DCF-06 v1.1

Les seccions següents de DCF-06 v1.1 **no es modifiquen**:

- §2 (DCF-02 classificació);
- §3 (DCF-03 qualitat);
- §4 (DCF-07 cartografia);
- §5.1, §5.2, §5.4, §5.5, §5.6, §5.7 (workflow, consentiment,
  revocació, eliminació de compte, despublicació vs supressió,
  auditoria).

Únicament §5.3 queda substituïda pel text de §1 d'aquesta esmena.

## 3. Acte de ratificació

El 2026-09-16, Oriol ratifica DCF-06 v1.2 com a esmena de §5.3 de
DCF-06 v1.1.

**Decisió ratificada:**

- el gate de publicació és automàtic;
- \`PUBLICATION_APPROVER\` intervé només per escalat quan el gate
  automàtic no es pot resoldre;
- SPEC-00 v0.5 i DCF-06 v1.2 són coherents;
- la resta de DCF-06 v1.1 continua vigent.

Aquesta ratificació NO autoritza:

- publicació sense consentiment quan sigui aplicable;
- bypass del gate automàtic;
- publicació d'estacions amb llicència/procedència no resolta;
- Grafana/i2CAT en cap superfície pública.

MAP-A continua limitat a fixtures sintètiques.

## 4. Historial

| Versió | Data | Canvi |
|--------|------|-------|
| 1.0 | 2026-09-16 | Resolució inicial |
| 1.1 | 2026-09-16 | Afegits catalog_version, sensors, DEFECT-01, eliminació de compte |
| **1.2** | **2026-09-16** | **Esmena de §5.3: gate automàtic + escalat excepcional. Coherència amb SPEC-00 v0.5.** |
