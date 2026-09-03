# DEFECT-01 - Zeros Ecowitt convertits a `null`

**Versió:** 1.0
**Estat:** CONFIRMAT PER INSPECCIÓ ESTÀTICA; CORRECCIÓ PENDENT
**Data:** 2026-09-03
**Abast:** registre documental del defecte; no autoritza canvis de codi ni de dades

## 1. Resum

La normalització de la ingesta Ecowitt usa expressions de la forma `+valor || null`. En JavaScript, un valor numèric `0` és falsy i, per tant, aquestes expressions el converteixen en `null`. El defecte és observable per lectura del codi; no s'ha executat la ingesta ni s'ha modificat cap implementació durant aquest QA.

## 2. Evidència observada

- `backend/services/ecowittService.js`, línies 156-177, construeix els paràmetres SQL amb múltiples expressions `+... || null`.
- En vent, les línies 172-173 apliquen `|| null` abans de cridar `kmhToMs`, de manera que un zero també arriba com a absència.
- La consulta posterior insereix aquests paràmetres a `mesures`.
- `INSPECCIO-00-entorn-meteolord.md` registra el risc i l'absència de tests automatitzats del contracte.

Aquesta evidència confirma el comportament de conversió al camí de codi inspeccionat. No confirma quants registres productius, si n'hi ha, n'han resultat afectats.

## 3. Fitxers i funcions potencialment implicats

| Fitxer | Funció o bloc | Relació |
|---|---|---|
| `backend/services/ecowittService.js` | `makeEcowittService()` / `pullEcowittAndSave()` | normalitza els camps i prepara els paràmetres persistits |
| `backend/services/ecowittService.js` | `kmhToMs()` i les crides que rep | la funció preservaria `0`, però les crides actuals poden convertir-lo en `null` abans |
| `backend/routes/mesures.js` | consulta de mesures | pot retornar els nuls ja persistits; no és l'origen confirmat de la conversió |
| `site/src/ui/screens/meteoScreen.js` | representació de valors | mostra l'absència; cal provar la regressió de presentació quan es corregeixi l'origen |

La llista identifica superfícies de prova i impacte potencial; no atribueix defectes no demostrats als consumidors.

## 4. Camps potencialment afectats

Segons les expressions observades, poden quedar afectats:

- `temp_c`, `sensacio_c` i `punt_rosada_c`;
- `solar_wm2`;
- `taxa_pluja_mm_h`, `pluja_diaria_mm`, `pluja_event_mm`, `pluja_hora_mm`, `pluja_setmana_mm`, `pluja_mes_mm` i `pluja_any_mm`;
- `vent_ms` i `vent_rafega_ms`;
- `pressio_rel_hpa` i `pressio_abs_hpa`.

`humitat_pct`, `uvi`, `vent_direccio_graus` i `bateria_pct` segueixen expressions diferents i no es classifiquen com a afectats per aquest patró sense una prova addicional.

## 5. Impacte funcional

Un zero meteorològic legítim es pot presentar i tractar com si la dada fos absent. Això pot alterar la lectura actual, les gràfiques, els resums o els càlculs que distingeixen `0` de `null`. La severitat concreta depèn del camp i del contracte funcional encara pendent a `DCF-05`.

## 6. Impacte sobre dades històriques

L'impacte històric és `PENDENT DE CONFIRMAR`. El patró podria haver persistit nuls en lloc de zeros mentre aquest camí d'ingesta hagi estat actiu, però no s'ha consultat la DB de producció, no s'ha inspeccionat cap secret ni s'ha executat cap anàlisi de dades. No s'ha d'inferir volum, dates, estacions afectades ni possibilitat de reconstrucció sense una fase autoritzada i una font fiable de comparació.

## 7. Comportament actual

Donat un camp afectat amb representació numèrica zero, la conversió unària produeix `0` i l'operador `||` selecciona `null`. El paràmetre preparat per a la inserció és, per tant, absent. Aquesta conclusió és estàtica; falta una prova automatitzada que recorri el servei amb un payload sintètic.

## 8. Comportament esperat

Un zero numèric vàlid s'ha de conservar com a zero. Només una absència real, una cadena buida o un valor invàlid segons el contracte aprovat s'ha de convertir en `null`. Els detalls de validació per camp i unitat depenen de `DCF-05` i no es decideixen en aquest document.

## 9. Informació pendent

- contracte Ecowitt aprovat per camp, unitat, rang i representació d'absència (`DCF-05`);
- confirmació de quins camps admeten zero com a valor vàlid;
- abast temporal i quantitatiu de dades històriques afectades;
- disponibilitat d'una font original fiable per contrastar o reconstruir registres;
- tractament de valors no numèrics, infinits o fora de rang;
- política aprovada de reparació històrica, si és necessària.

## 10. Riscos de la correcció

- confondre una cadena buida o un valor invàlid amb zero;
- canviar unitats o arrodoniments mentre es corregeix la nul·litat;
- modificar camps que no comparteixen el defecte;
- reprocessar dades històriques sense una font verificable;
- introduir duplicats o vulnerar la idempotència per `(estacio_id, instant)`;
- alterar agregacions, gràfiques o la representació d'absència sense proves de regressió.

## 11. Criteris d'acceptació

- **DEF01-CA-01:** donat un payload sintètic amb `0` en cada camp afectat i un timestamp controlat, quan es normalitza, el valor preparat per persistir és numèricament zero.
- **DEF01-CA-02:** donats camp absent, cadena buida i valor invàlid segons el contracte aprovat, quan es normalitzen, no es confonen amb un zero legítim.
- **DEF01-CA-03:** donats valors no zero vàlids, quan es normalitzen, es conserven amb les conversions d'unitat esperades.
- **DEF01-CA-04:** donada la mateixa observació dues vegades, quan es persisteix, es conserva la idempotència existent.
- **DEF01-CA-05:** donats zero i absència com a casos diferents, quan es consulten i visualitzen, zero no es representa com `—` i l'absència sí.
- **DEF01-CA-06:** qualsevol conclusió o reparació històrica queda sustentada per evidència traçable i no per inferència.

## 12. Proves necessàries

- prova unitària de normalització per a cada camp potencialment afectat;
- prova de `kmhToMs` i de la seva crida amb zero;
- prova d'integració del servei amb pool simulat o DB de test i payloads exclusivament sintètics;
- prova de persistència i lectura diferenciant `0` i `null`;
- prova de regressió frontend per a zero, absència i extrems vàlids;
- prova d'idempotència amb el mateix instant;
- prova de camps no numèrics i fora de rang quan `DCF-05` els defineixi;
- anàlisi històrica separada, només si s'autoritza i amb una font original fiable.

Cap d'aquestes proves s'ha executat en aquesta fase documental.

## 13. Fora d'abast

- modificar `backend/services/ecowittService.js` o qualsevol altre codi;
- decidir el contracte funcional complet d'Ecowitt;
- consultar Ecowitt o la DB productiva;
- quantificar o afirmar impacte històric sense evidència;
- reparar, reprocessar o eliminar dades històriques;
- canviar esquemes, migracions, agregacions, UI o desplegament;
- incorporar la correcció com a condició d'acceptació del nucli local de `SPEC-10`.

Referències: [INSPECCIO-00](./INSPECCIO-00-entorn-meteolord.md), [PROJECT-CONTEXT-METEOLORD](./PROJECT-CONTEXT-METEOLORD.md), [SPEC-10](./SPEC-10-entorn-local-proves-desplegament-segur.md).
