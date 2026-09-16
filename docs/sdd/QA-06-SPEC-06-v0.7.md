# QA-06 v3.0 — Revisió funcional de SPEC-06 v0.7

**Versió:** 3.0
**Estat:** COMPLETAT
**Data:** 2026-09-16
**Document revisat:** SPEC-06 v0.7
**Revisor:** Expert extern (QA funcional)
**Naturalesa:** Revisió documental

## 0. Resum executiu

La SPEC-06 v0.7 resol materialment la major part dels findings de v2.0,
però encara té **dos bloquejants** i **dos ajustos importants** que
impedeixen aprovar-la directament.

**Veredicte:** NECESSITA REVISIÓ MÍNIMA
**QA documental:** NO PREPARADA

## 1. Findings

| ID | Severitat | Problema |
|----|-----------|----------|
| QA-06-14 | BLOQUEJANT | SPEC-06 v0.7 redefineix el gate de publicació com a automàtic amb escalat, però DCF-06 v1.1 (ratificada) exigeix \`PUBLICATION_APPROVER\` com a gate humà obligatori. Contradicció no resolta a nivell de DCF. |
| QA-06-15 | BLOQUEJANT | \`resolution_policy\` encara deixa "regla de rang" per al període \`custom\` sense mapatge determinista. Dues implementacions vàlides podrien retornar resolucions diferents. |
| QA-06-16 | IMPORTANT | §4.2 diu que \`SOSPITOSA\` pot "ocultar o marcar no fiable". Cal una única semàntica. |
| QA-06-17 | IMPORTANT | RNF-MAP-01 exigeix 500 estacions amb clustering, però no hi ha criteri d'acceptació corresponent. |

## 2. Desenvolupament

### 2.1 QA-06-14 — DCF-06 v1.1 vs SPEC-06 v0.7

SPEC-06 v0.7 §6.1 defineix el gate com a automàtic amb escalat excepcional.
DCF-06 v1.1 §5.3 (ratificada) diu que abans de publicar,
\`PUBLICATION_APPROVER\` HA DE verificar. Són textos normatius divergents.

**Resolució necessària:** DCF-06 v1.2 que ratifiqui el gate automàtic.
La contradicció no es pot resoldre només a SPEC-06.

### 2.2 QA-06-15 — Període custom

\`resolution_policy\` de §6.3 no resol quin \`resolution\` aplica a \`custom\`
quan l'amplada no coincideix exactament amb 24h/7d/30d. "Regla de rang"
no és determinista.

**Resolució necessària:** afegir \`custom_resolution_rules\` al
\`history_profile\` o rebutjar \`custom\` explícitament.

### 2.3 QA-06-16 — SOSPITOSA

§4.2 diu: "Camps afectats ocults o marcats 'no fiable'". Ambdues opcions
són compatibles amb la lletra del text, però canvien el resultat visible.

**Resolució necessària:** escollir "marcar no fiable" (visible amb
indicador), per coherència amb \`OBSOLETA\` i \`EN_REVISIO\`.

### 2.4 QA-06-17 — CA per a clustering

RNF-MAP-01 (d) diu "suport per a 500 estacions amb clustering", però no
hi ha cap \`CA-MAP-XX\` que ho verifiqui.

**Resolució necessària:** afegir \`CA-MAP-43\` amb contracte executable.

## 3. Veredicte

**SPEC-06 v0.7**

- Estat: NECESSITA REVISIÓ MÍNIMA
- QA documental: NO PREPARADA

Resolucions necessàries:

1. DCF-06 v1.2 ratificada (gate automàtic + escalat excepcional);
2. SPEC-06 v0.8 amb:
   - \`custom_resolution_rules\` determinista;
   - \`SOSPITOSA\` amb semàntica única (marcar, no ocultar);
   - \`CA-MAP-43\` per al clustering de 500 estacions.

## 4. Historial

| Versió | Data | Canvi |
|--------|------|-------|
| 1.0 | 2026-09-16 | Revisió funcional de SPEC-06 v0.3 |
| 2.0 | 2026-09-16 | Revisió funcional de SPEC-06 v0.6 |
| **3.0** | **2026-09-16** | **Revisió funcional de SPEC-06 v0.7** |
