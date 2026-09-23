# QA UE-T15 — Sis punts d’estimació meteorològica

Data d’execució: 2026-09-22. Estat: **FETA**.

## Resultat implementat

La migració [0006-ue-estimation-points.sql](../../../backend/db/migrations/0006-ue-estimation-points.sql) defineix exactament els sis recursos `ESTIMATION` requerits i desactiva qualsevol punt d’estimació anterior. Els UUID són estables i no comparteixen taules, relacions ni identificadors amb les estacions físiques. La publicació de l’estació observada no s’elimina ni es converteix en estimació.

| Slug | Nom | Referència WGS84 (longitud, latitud) |
|---|---|---:|
| `manresa` | Manresa | 1.82399, 41.72815 |
| `solsona` | Solsona | 1.51706, 41.99389 |
| `berga` | Berga | 1.84628, 42.10429 |
| `vic` | Vic | 2.25486, 41.93012 |
| `la-seu-durgell` | La Seu d’Urgell | 1.46144, 42.35877 |
| `andorra` | Andorra | 1.52184, 42.50632, referència «Andorra la Vella» |

El servei [estimationService.js](../../../backend/services/estimationService.js) agrupa els sis punts en una única consulta servidor a Open-Meteo, amb endpoint, camps i unitats fixats, timeout de 10 segons, cos màxim d’1 MiB, memòria cau i coalescència de 120 segons. Conserva els zeros i els nuls, valida coordenades i timestamps, i diferencia `FRESH`, `STALE`, `OBSOLETE` i `UNAVAILABLE`. Una fallada de la font manté els sis recursos visibles amb valors actuals buits i sense inventar observacions.

Les rutes públiques [estimations.js](../../../backend/routes/estimations.js) exposen el catàleg i la lectura actual amb `no-store`. El mapa combina estacions observades i estimacions tipades; els mapes privats continuen contenint només estacions. El selector, les targetes Meteo, els marcadors, la llista i el detall indiquen «Estimació», la font, l’hora i la localitat de referència. Les estimacions no es poden desar com a estació predeterminada.

## Evidència executada

- Unitari [ue-estimates.test.js](../../../backend/test/unit/ue-estimates.test.js): **3/3 PASS**; petició fixada, zero/null, identitat de referència, llindars d’antiguitat, dades obsoletes, error de coordenades, cache i coalescència.
- HTTP [ue-estimates.test.js](../../../backend/test/http/ue-estimates.test.js) i regressió de preview: **4/4 PASS**; catàleg exacte, detall, cap mutació i substitució dels cinc punts antics.
- Integració [ue-estimates.test.js](../../../backend/test/integration/ue-estimates.test.js), run `20260922-090000-15a15a1`: **1/1 PASS**, 0 SKIP; migració, sis slugs exactes i preservació d’IDs d’estació.
- Integració conjunta UE-T08/UE-T15, run `20260922-120000-15f15f1`: **2/2 PASS**, 0 SKIP; separació entre estacions físiques i estimacions al mapa i revocació conservada.
- Navegador [check-ue-estimates-browser.js](../../../backend/scripts/check-ue-estimates-browser.js): PASS a 375 × 812 px; sis opcions, valor zero, error sense dades, avís de dada antiga, etiquetes a selector/Meteo/mapa/llista/detall, referència Andorra la Vella, cap desbordament ni petició externa.
- Regressió completa Node, run `20260922-123000-15a15b2`: **252/252 PASS**, 0 FAIL, 0 CANCELLED, 0 SKIP i 0 TODO.
- `node --check` i `git diff --check`: PASS.
- Backend local `8088`: contenidor `running healthy`; `/health` retorna `ok`, `/meteo/` retorna 200, el catàleg retorna els sis punts exactes i la lectura d’Andorra identifica la referència Andorra la Vella i Open-Meteo.

## Límits operatius

Open-Meteo és una font de model i el producte ho presenta sempre com a estimació, no com una observació física. La disponibilitat de valors actuals depèn de la font externa; el catàleg i la posició de referència continuen disponibles durant una incidència. Les estimacions no tenen propietari, membres, ingesta Ecowitt, preferència predeterminada ni històric d’estació.
