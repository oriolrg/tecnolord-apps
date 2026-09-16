# QA-06 v1.0 — Revisió funcional de SPEC-06 v0.3

**Versió:** 1.0
**Estat:** COMPLETAT
**Data:** 2026-09-16
**Document revisat:** SPEC-06 v0.3 — Mapa públic d'estacions
**Revisor:** Expert extern (QA funcional)
**Naturalesa:** Revisió documental

## 0. Resum executiu

La SPEC-06 v0.3 està ben encaminada, especialment en la frontera PUBLIC /
INTERNAL_ONLY, el principi fail-closed, l'accessibilitat i la separació entre
SPEC i futur PLAN. Però encara no està preparada per aprovar. Hi ha algunes
decisions funcionals que ara mateix el PLAN hauria d'inventar.

**Veredicte:** NECESSITA REVISIÓ
**QA documental:** NO PREPARADA

## 1. Findings

| ID | Severitat | Punt | Problema |
|---|---|---|---|
| QA-06-01 | BLOQUEJANT | §3, §4.1, RF-MAP-01/12 | PUBLIC_ALLOWED s'utilitza com a classificació autoritativa però el contracte de publicació no està formalment definit. |
| QA-06-02 | BLOQUEJANT | §4.2 | La taxonomia de qualitat barreja disponibilitat, qualitat, workflow i publicació malgrat afirmar que qualitat i visibilitat són eixos diferents. |
| QA-06-03 | BLOQUEJANT | RF-MAP-11 / RF-MAP-15 / §4.1 | La cache pot entrar en contradicció amb la despublicació fail-closed. |
| QA-06-04 | BLOQUEJANT | RF-MAP-05/06 / §4.3 | El contracte de modal i fitxa pressuposa camps i històrics que no estan garantits per totes les fonts. |
| QA-06-05 | BLOQUEJANT | §9 | Les gates per iniciar PLAN-06 no inclouen totes les decisions de les quals depenen RF/CA actuals. |
| QA-06-06 | IMPORTANT | RF-MAP-08 / RNF-MAP-08 | «llista equivalent als marcadors visibles» no determina exactament quin conjunt ha de mostrar. |
| QA-06-07 | IMPORTANT | RNF-MAP-09/10 | El contracte GDPR està formulat massa absolutament i, a més, exigeix funcionalitats d'usuari que l'abast exclou. |

## 2. Desenvolupament dels findings

### 2.1 QA-06-01 — Falta definir la classificació pública

La regla és bona: allò que no tingui classificació pública explícita és
INTERNAL_ONLY. Però després apareix PUBLIC_ALLOWED sense haver definit
formalment el domini d'aquest estat.

Cal definir inequívocament:
I una regla:
estació pública
AND camp públic
→ pot aparèixer a API/superfície pública

text

És especialment important perquè una estació pot ser publicable però no
necessàriament tots els seus camps.

### 2.2 QA-06-02 — La taxonomia d'estats necessita separar dimensions

La SPEC actual té un sol enum:

- DISPONIBLE
- SENSE_DADES_RECENTS
- SOSPITOSA
- EN_REVISIO
- NO_PUBLICABLE

Però aquests estats no pertanyen al mateix eix:

- SENSE_DADES_RECENTS és disponibilitat/frescor.
- SOSPITOSA és qualitat.
- EN_REVISIO és workflow.
- NO_PUBLICABLE és visibilitat/publicació.

Cal separar conceptualment: publicació, qualitat, disponibilitat/frescor,
revisió. Després la UI pot derivar un estat presentable.

### 2.3 QA-06-03 — Cache vs despublicació

Contradicció potencial:

- RF-MAP-11: despublicació → retirada de totes les superfícies públiques.
- RF-MAP-15: si falla l'API, llista → continua amb dades en cache.

Escenari problemàtic:
12:00 estació pública
12:01 browser/cache la conserva
12:02 estació despublicada
12:03 API no disponible
12:04 frontend mostra cache

text

Cal decidir el contracte de stale data i revocació abans del PLAN.

### 2.4 QA-06-04 — Modal i fitxa massa específics

RF-MAP-05 obliga tota estació a mostrar temperatura i humitat. Però la SPEC
contempla Ecowitt, ACA/hidrologia i Open-Meteo. Una estació hidrològica no
té necessàriament temperatura i humitat com a variables principals.

Cal un contracte mínim comú + contracte específic per tipus. El catàleg
determina quines mesures són les de resum.

### 2.5 QA-06-05 — Gates incompletes

Les gates actuals diuen que PLAN-06 queda bloquejat per DCF-02, DCF-03,
DCF-07, DCF-09, però hi ha més dependències:

- DCF-04 afecta RF-MAP-06 i CA-MAP-05 (historial i gràfiques).
- DCF-08 afecta RF-MAP-06 i RNF-MAP-11/12 (precisió i àmbit).
- DCF-11 afecta CA-MAP-10 (duplicats).

Cal ampliar les gates o excloure explícitament els RF/CA dependents de l'MVP.

### 2.6 QA-06-06 — «Llista equivalent»

RF-MAP-08 diu: «llista textual equivalent als marcadors visibles». Ambigu:

A) Totes les estacions que passen els filtres.
B) Només les estacions dins del viewport actual.

Si la capa cartogràfica cau, RNF-MAP-08 exigeix que la llista continuï
funcionant. Cal definir quin conjunt mostra.

### 2.7 QA-06-07 — GDPR

RNF-MAP-10 diu que l'usuari ha de poder revocar el consentiment i sol·licitar
l'eliminació de les seves dades. El dret de supressió no és absolut (article
17 GDPR defineix supòsits i excepcions).

Cal reformular per parlar de "permetre exercir els drets aplicables segons la
base jurídica i el contracte de privacitat".

A més, la SPEC diu que identitat, rols i fluxos de propietari estan fora
d'abast, però RNF-MAP-10 necessita saber qui és el titular de les dades.
Això és més propi de SPEC-01, mentre SPEC-06 només hauria de consumir el
resultat: PUBLIC_ALLOWED / INTERNAL_ONLY, precisió autoritzada, publicació
revocada.

## 3. Què es manté

- La frontera fail-closed és un bon nucli de la SPEC.
- Les proves negatives sobre totes les superfícies.
- La separació mapa/llista.
- La URL directa de fitxa.
- La prohibició de filtrar INTERNAL_ONLY només al frontend.
- La degradació segura.
- L'objectiu WCAG 2.2 AA.
- La no autorització prematura de PLAN-06.

## 4. Veredicte

**SPEC-06 v0.3**
- Estat: NECESSITA REVISIÓ
- QA documental: NO PREPARADA

La següent v0.4 ha de centrar-se sobretot en:

1. Classificació PUBLIC/INTERNAL formal.
2. Separació d'eixos d'estat.
3. Contracte de cache i despublicació.
4. Contracte mínim modal/fitxa.
5. Correcció de les gates DCF.

## 5. Traçabilitat

- Document revisat: SPEC-06 v0.3
- Resolucions: SPEC-06 v0.4 (parcial) i v0.5 (final)
- DCF relacionades: DCF-06 v1.1

## 6. Historial

| Versió | Data | Canvi |
|---|---|---|
| 1.0 | 2026-09-16 | Revisió funcional inicial de SPEC-06 v0.3 |