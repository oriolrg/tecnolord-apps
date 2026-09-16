# DCF-04 v1.0 — Històrics, agregació i retenció de dades

**Data:** 2026-09-16
**SPEC afectada:** SPEC-06 v0.5
**Àmbit:** mapa i fitxa pública de MeteoLord
**Estat:** RESOLT (DCF-04A) / PENDENT SPEC-08 (DCF-04B)
**Data de ratificació:** 2026-09-16
**Ratificat per:** Oriol
**Dependències:** DCF-02, DCF-03 i DCF-09 resoltes a DCF-06 v1.1
**Fora d'abast:** tecnologia d'emmagatzematge, esquema físic, índexs, particionament, caches concretes, materialized views o arquitectura del PLAN-06.

---

# 1. Resum executiu

DCF-04 s'ha de separar conceptualment en dues decisions.

**DCF-04A — Contracte públic d'històrics i agregacions:** es pot considerar **RESOLT** amb aquesta decisió. Defineix períodes, semàntica d'agregació, estadístiques, absències, zona horària, DEFECT-01 i comportament de la fitxa.

**DCF-04B — Retenció física i cicle de vida de les dades:** queda **PENDENT** i és **BLOQUEJANT per publicar històrics reals** mentre no existeixi una política de retenció aprovada a SPEC-08 o document equivalent.

Aquesta separació és coherent amb SPEC-06, que exclou explícitament ingesta i retenció del seu abast, però necessita consumir-ne el resultat per poder mostrar historials.

MAP-A pot continuar amb fixtures sintètiques després d'incorporar DCF-04A. Les dades reals necessiten, a més, `retention_policy_ref`, autorització de publicació i la resta de gates aplicables.

Grafana/i2CAT continua completament fora de l'històric públic: SPIKE-04 només acredita viabilitat tècnica per ús intern i no autoritza republicació, persistència productiva o retenció pública.

---

# 2. Contracte transversal: `history_profile`

## Decisió

Cada camp que pugui tenir historial públic HA DE disposar d'un perfil versionat:

```text
history_profile_id
```

amb, conceptualment:

```text
history_enabled
profile_version

default_period
allowed_periods
max_query_window

raw_history_allowed
allowed_resolutions
aggregation_method

statistics
missing_data_policy
min_coverage_policy

timezone_policy

retention_policy_ref

max_points_policy
```

El perfil és **per camp o magnitud**, no necessàriament per estació.

Una estació pot tenir:

```text
temperatura -> historial públic
humitat     -> historial públic
pluja       -> historial públic amb SUM
diagnòstic  -> INTERNAL_ONLY
```

La publicació de l'estació no autoritza automàticament l'historial de tots els seus camps, d'acord amb la classificació a nivell d'estació/sensor/camp de DCF-06.

Regla fail-closed:

```text
history_profile absent/desconegut/inconsistent
-> historial del camp no publicable
```

---

# 3. A — Períodes històrics

## Q1. Quin període ha de mostrar la fitxa per defecte?

**Estat: `MODIFICAR`**

### Resposta

La fitxa HA DE mostrar per defecte les:

```text
últimes 24 hores
```

És una finestra mòbil:

```text
[now - 24 h, now]
```

i no «el dia d'avui».

### Justificació

Una finestra de 24 h és estable independentment de l'hora d'accés. «Avui» podria representar 5 minuts a les 00:05 i gairebé 24 hores a les 23:55.

### Recomanació

Mostrar sempre el rang temporal exacte al costat de la gràfica/taula.

### Risc

Confondre «24 h» amb un dia civil.

---

## Q2. Els períodes han de ser configurables?

**Estat: `CONFIRMAT`**

### Resposta

Sí, però dins d'un conjunt de rangs autoritzats.

Contracte MVP proposat:

```text
24 hores
7 dies
30 dies
Personalitzat
```

### Justificació

Permet consulta operativa, setmanal i mensual sense deixar obertes consultes arbitràriament grans.

### Recomanació

`Avui` i `Ahir` poden existir com a dreceres, però no són necessàries per resoldre DCF-04.

### Risc

Permetre que el client defineixi resolucions o agregacions arbitràries.

El visitant selecciona període; **no selecciona l'algoritme d'agregació**.

---

## Q3. Període mínim i màxim?

**Estat: `MODIFICAR`**

### Resposta

No fixaria un mínim global artificial.

Sí que fixaria:

```text
max_query_window = 30 dies per petició pública
```

Això NO significa que només es conservin 30 dies.

Per exemple, una política futura podria conservar cinc anys i continuar limitant cada consulta pública a 30 dies.

### Recomanació

Separar formalment:

```text
query window != retention period
```

### Risc

Convertir accidentalment el límit de consulta en política de retenció.

---

## Q4. Com es mostra el selector?

**Estat: `MODIFICAR`**

### Resposta

Contracte funcional:

```text
[24 h] [7 dies] [30 dies] [Personalitzat]
```

`Personalitzat` permet definir inici i final dins el màxim autoritzat.

La UI HA DE mostrar:

```text
inici
final
zona horària
resolució/agregació aplicada
```

### Accessibilitat

El selector HA DE funcionar amb teclat. La gràfica HA DE tenir alternativa textual o tabular; W3C recomana una representació textual detallada per gràfics complexos i taules estructurades per dades relacionals.

---

# 4. B — Agregació

## Q5. S'han d'agregar les dades?

**Estat: `MODIFICAR`**

### Resposta

Sí, **quan ho determini el `history_profile` del camp**.

No hi ha una única política d'agregació aplicable a totes les fonts.

Contracte:

```text
rang dins raw_public_window
-> resolució pública original disponible

rang superior
-> resolució agregada definida pel history_profile
```

Si no existeix una regla aprovada:

```text
aggregation_method = UNKNOWN
-> no generar agregat públic
```

### Justificació

Meteorologia i hidrologia contenen variables amb semàntiques diferents.

### Recomanació

MAP-A ha de contenir com a mínim un perfil sintètic amb dades sense agregar i un amb buckets agregats.

### Risc

Fer que PLAN-06 inventi la resolució de cada magnitud.

---

## Q6. Com es calcula l'agregació?

**Estat: `MODIFICAR`**

### Resposta

**Per camp i segons la seva semàntica.**

Exemples:

| Magnitud                 | Operació típica admissible                                    |
| ------------------------ | ------------------------------------------------------------- |
| temperatura              | `mean`, `min`, `max`                                          |
| humitat                  | `mean`, `min`, `max`                                          |
| pressió                  | `mean`, `min`, `max`                                          |
| nivell d'aigua           | `mean`, `min`, `max` o `last`, segons contracte               |
| cabal                    | `mean`, `min`, `max`, segons contracte                        |
| precipitació incremental | `sum`                                                         |
| ratxa de vent            | `max`                                                         |
| direcció del vent        | agregació circular específica                                 |
| comptador acumulatiu     | transformació específica; NO sumar directament els comptadors |

Les CF Conventions distingeixen explícitament `point`, `sum`, `mean`, `minimum`, `maximum`, `median`, etc.; això reforça que l'operació forma part de la semàntica de la variable i no és universal.

### Recomanació

Cada camp ha de declarar:

```text
aggregation_method
```

i, si cal:

```text
pre_aggregation_transform
```

### Riscos

Especialment crítics:

* sumar un comptador acumulatiu de pluja;
* fer mitjana aritmètica de direccions 359° i 1°;
* aplicar `mean` a una ratxa màxima.

---

## Q7. Com es gestionen dades absents?

**Estat: `CONFIRMAT`**

### Resposta

No s'interpolen silenciosament.

No es converteixen en zero.

No s'omplen amb l'última dada coneguda.

Cada bucket HA DE poder expressar:

```text
n_valid
```

i, quan la freqüència esperada sigui coneguda:

```text
n_expected
coverage
```

Si:

```text
n_valid == 0
```

l'agregat és:

```text
null
```

Si el bucket té dades insuficients segons el `quality_profile`, es marca com a parcial/no fiable o retorna `null`, segons la regla aprovada.

### Justificació

DCF-06 ja estableix que `null` és desconegut/no disponible i no pot convertir-se silenciosament en zero o valor anterior.

### Risc

Una suma parcial de precipitació podria semblar una acumulació completa.

---

## Q8. Backend o frontend?

**Estat: `CONFIRMAT`**

### Resposta

L'agregació autoritativa HA DE fer-se al:

```text
backend
```

La UI pot representar i formatar, però NO pot decidir:

* quines dades participen;
* quines dades són públiques;
* l'algoritme d'agregació;
* la validesa dels buckets;
* si una observació `INTERNAL_ONLY` participa.

### Justificació

SPEC-06 ja imposa que la frontera PUBLIC/INTERNAL_ONLY sigui autoritativa al backend i s'apliqui també a agregats.

### Risc

Una agregació al navegador podria revelar indirectament dades que individualment no són publicables.

---

# 5. C — Estadístiques

## Q9. Quines estadístiques?

**Estat: `MODIFICAR`**

### Resposta

No hi ha un conjunt universal.

Per al MVP:

**Magnituds escalars contínues, quan sigui semànticament correcte:**

```text
mínim
màxim
mitjana
```

**Quantitats acumulables:**

```text
total
```

**Extrems com ratxa:**

```text
màxim
```

`mediana` i `desviació estàndard` no són obligatòries al MVP.

Poden existir posteriorment si el `history_profile` les declara.

### Recomanació

Cada estadística publicada ha de quedar inequívocament associada a:

```text
variable
unitat
període
mètode
```

### Risc

Presentar una estadística matemàticament calculable però meteorològicament incorrecta.

---

## Q10. Amb quina freqüència s'actualitzen?

**Estat: `MODIFICAR`**

### Resposta

Les estadístiques NO han de tenir un rellotge d'actualització independent.

Gràfica, taula i estadístiques d'una consulta han de correspondre al mateix conjunt autoritatiu.

Per una finestra oberta com «últimes 24 h», una nova consulta pot incorporar noves observacions.

Per una finestra tancada, només hauria de variar si:

* es corregeixen dades;
* canvia qualitat/classificació;
* es reprocessa una agregació;
* canvia un contracte versionat.

### Recomanació

La resposta històrica ha de permetre identificar el moment de generació o versió del dataset.

### Risc

Mostrar màxim/mínim calculats sobre un conjunt diferent del que representa la gràfica.

---

# 6. D — Zona horària

## Q11. UTC, navegador o estació?

**Estat: `MODIFICAR`**

### Resposta

Contracte:

```text
intercanvi autoritatiu -> UTC
presentació per defecte -> zona horària de l'estació
fallback -> UTC
```

Els timestamps de l'API han de portar una relació inequívoca amb UTC; RFC 3339 defineix un format interoperable amb `Z` o offset explícit.

La zona civil ha d'identificar-se amb una zona IANA, per exemple:

```text
Europe/Madrid
```

i no únicament amb:

```text
UTC+1
```

perquè les regles DST i polítiques canvien al llarg del temps. IANA manté precisament aquesta base de zones i les seves actualitzacions.

### Privacitat

La zona horària NO s'ha de calcular al navegador a partir d'una coordenada privada de l'estació.

Si no existeix una zona pública autoritzada:

```text
UTC
```

### Risc

Agrupar un «dia» amb fronteres temporals diferents segons qui consulta la pàgina.

---

## Q12. Si el visitant viatja, canvia la zona?

**Estat: `CONFIRMAT`**

### Resposta

No automàticament.

La visualització per defecte continua sent:

```text
zona horària de l'estació
```

Així «avui», agregacions diàries i màxims/mínims del dia mantenen la mateixa semàntica.

### Recomanació

Una futura opció explícita:

```text
Mostra en la meva zona horària
```

pot existir, però no forma part de l'MVP de DCF-04.

### Risc

Canviar automàticament al fus del navegador faria que dos visitants veiessin fronteres de dia diferents.

---

# 7. E — Retenció

## Q13. Quant temps es conserven les dades?

**Estat: `PENDENT`**

**Per publicar històrics reals: `BLOQUEJANT`.**

### Resposta

No hi ha evidència als documents aportats per decidir:

```text
1 any
5 anys
10 anys
indefinidament
```

i no és correcte inventar-ho.

SPEC-06 exclou explícitament retenció i ingesta del seu abast.

Per tant, cada font real HA DE tenir:

```text
retention_policy_ref
```

abans que els seus històrics siguin públics.

### Recomanació

La durada l'ha de resoldre SPEC-08 o un contracte equivalent tenint en compte:

* finalitat;
* font;
* llicència;
* cost;
* necessitat operativa;
* possibles dades personals;
* política d'eliminació.

### GDPR

Quan el dataset sigui dada personal o mantingui un vincle identificable amb una persona, el principi de limitació de conservació exigeix no mantenir la identificació més temps del necessari per a la finalitat, amb les excepcions previstes pel Reglament. Això no proporciona, per si sol, un nombre concret d'anys.

### Risc

Fixar arbitràriament «5 anys» sense finalitat, base jurídica, cost ni política de dades.

---

## Q14. Què passa amb les dades antigues?

**Estat: `PENDENT` — SPEC-08**

### Resposta

DCF-04 no pot decidir encara si:

```text
s'esborren
s'arxiven
es compacten
es conserven crues
només es conserven agregats
```

Sí que fixa una regla funcional:

> la resolució d'una dada NO es pot canviar silenciosament.

Si només queda un agregat diari, la resposta ha d'identificar-lo com a agregat diari, no com una observació original.

### Recomanació

SPEC-08 ha de definir almenys:

```text
raw_retention
aggregate_retention
archive_policy
deletion_policy
```

### Risc

Fer passar una dada reconstruïda o agregada per una observació crua.

---

## Q15. Hi ha límit d'emmagatzematge?

**Estat: `PENDENT`**

### Resposta

No hi ha cap límit físic documentat i SPEC-06 no l'ha de crear.

El límit de:

```text
30 dies per consulta
```

és de consulta pública, no d'emmagatzematge.

### Recomanació

El límit físic correspon a SPEC-08/PLAN de dades després de conèixer volum i retenció.

---

# 8. F — Rendiment

## Q16. Com garantir càrrega ràpida amb 30 dies?

**Estat: `CONFIRMAT` funcionalment**

### Resposta

DCF-04 defineix resultats, no tecnologies.

La consulta pública HA DE:

1. ser temporalment acotada;
2. aplicar resolució/agregació abans de lliurar datasets excessius;
3. no delegar al navegador l'agregació autoritativa;
4. no truncar dades silenciosament;
5. indicar la resolució retornada;
6. fallar explícitament si la petició no pot complir el contracte.

### No decideix DCF-04

```text
materialized views
índexs
cache concreta
particionament
preagregació física
```

Això és PLAN-06/SPEC-08.

### Risc

Confondre una optimització concreta amb un requisit funcional.

---

## Q17. Quin volum màxim per consulta?

**Estat: `PENDENT`**

### Resposta

Funcionalment ja queda acotat per:

```text
max_query_window
history_profile
resolució
```

Però no hi ha evidència suficient per fixar responsablement:

```text
N files
N punts
N MiB
```

### Recomanació

Afegir al perfil:

```text
max_points_policy
```

però fixar-ne el valor després del benchmark normatiu de RNF-MAP-01.

SPEC-06 ja exigeix que el benchmark defineixi dataset, dispositiu, navegador, cache, mètrica i percentil.

### Gate

El nombre exacte de punts **no bloqueja MAP-A**, però sí s'ha de concretar abans d'acceptar rendiment amb dades reals.

---

# 9. G — Casos especials

## Q18. Estació nova sense historial

**Estat: `CONFIRMAT`**

### Resposta

La fitxa continua sent vàlida.

Mostra:

```text
Encara no hi ha historial disponible.
```

La lectura actual pot mostrar-se si passa tots els gates públics.

NO es pot:

* generar zeros;
* replicar la dada actual cap al passat;
* mostrar una gràfica fictícia.

### Risc

Confondre «sense historial» amb «error».

---

## Q19. Estació inactiva

**Estat: `CONFIRMAT`**

### Resposta

L'historial anterior pot continuar visible mentre:

```text
continua retingut
AND continua PUBLIC_ALLOWED
AND passa els gates de qualitat/publicació aplicables
```

La fitxa mostra la data/hora de l'última observació i l'estat de disponibilitat corresponent a DCF-03.

No es generen valors posteriors a l'última observació.

### Risc

Una estació inactiva no pot semblar activa simplement perquè conserva historial.

---

## Q20. Estació amb forats

**Estat: `CONFIRMAT`**

### Resposta

Els forats es conserven explícitament:

```text
missing != 0
missing != last-value-carried-forward
missing != interpolated
```

En gràfica, el buit ha de ser perceptible quan unir els punts pogués suggerir dades inexistents.

En taula:

```text
interval -> sense dada
```

En agregació:

```text
coverage
n_valid
```

han de permetre distingir buckets complets i parcials.

### Accessibilitat

La taula alternativa és especialment adequada perquè conserva els valors i els intervals sense dependre exclusivament de la representació gràfica.

---

# 10. H — DEFECT-01

## Q21. Afecta també l'historial?

**Estat: `CONFIRMAT`**

### Resposta

Sí.

Mentre un camp estigui:

```text
DEFECT_01_AFFECTED
```

es tracta com:

```text
INTERNAL_ONLY
```

també per:

* historial;
* agregacions;
* estadístiques;
* gràfiques;
* taules públiques;
* cache pública;
* qualsevol derivat.

DCF-06 ja estableix expressament aquesta exclusió i indica que la resolució del defecte requereix una nova classificació abans que el camp pugui passar a `PUBLIC_ALLOWED`.

### Historial anterior a la correcció

Corregir el parser o la semàntica avui NO demostra automàticament que l'historial anterior sigui fiable.

Per tant:

```text
històric afectat
+ no validat retrospectivament
-> INTERNAL_ONLY
```

Només un interval històric verificat pot reclassificar-se explícitament.

### Risc

«Corregit a partir d'avui» no equival a «històric antic fiable».

---

# 11. Contracte públic resultant

Un historial és publicable només si:

```text
HISTORY_PUBLIC(field) =
    station == PUBLIC_ALLOWED
    AND sensor == PUBLIC_ALLOWED
    AND field == PUBLIC_ALLOWED
    AND history_profile.history_enabled == true
    AND publication gates satisfied
    AND quality gates satisfied
    AND field NOT DEFECT_01_AFFECTED
    AND retention_policy_ref valid for real data
```

Qualsevol resultat desconegut:

```text
-> no públic
```

Una resposta històrica ha de permetre conèixer com a mínim:

```text
public_station_id

field
unit

period_start
period_end
timezone

resolution
aggregation_method

values/buckets

missing_or_coverage_information

statistics
```

Gràfica i alternativa textual/tabular HAN DE derivar del mateix dataset autoritatiu.

---

# 12. Regla crítica: filtrar abans d'agregar

L'ordre normatiu HA DE ser:

```text
observacions
   ↓
classificació PUBLIC_ALLOWED
   ↓
validació de qualitat
   ↓
exclusió DEFECT-01
   ↓
agregació
   ↓
estadístiques
   ↓
API pública
```

NO:

```text
observacions internes
   ↓
agregació
   ↓
"com que només és una mitjana, publicar-la"
```

Un agregat derivat d'informació `INTERNAL_ONLY` continua essent informació derivada de dades no autoritzades i NO POT utilitzar-se per esquivar la frontera de publicació.

Això manté la coherència amb la frontera fail-closed de SPEC-06.

---

# 13. Retenció: contracte amb SPEC-08

SPEC-08 o l'artefacte equivalent HA DE proporcionar, per cada política:

```text
retention_policy_id
version

scope
source

raw_retention
aggregate_retention

archive_policy
deletion_policy

correction_policy

legal_or_licence_constraints
```

DCF-04 consumeix aquesta política, però NO decideix com implementar-la.

Absència de política per una font real:

```text
retention_policy_ref = UNKNOWN
-> historial real no publicable
```

Això permet mantenir fail-closed sense bloquejar MAP-A sintètic.

---

# 14. Grafana/i2CAT

DCF-04 NO modifica la decisió de SPIKE-04.

Per tota dada Grafana/i2CAT:

```text
publication = INTERNAL_ONLY
```

Per tant, cap política definida aquí autoritza:

* historial públic;
* agregats públics;
* estadístiques públiques;
* persistència productiva;
* retenció;
* republicació.

SPIKE-04 indica explícitament que l'autorització disponible és per integració/prova interna i que la persistència, retenció i republicació fora d'aquest abast necessiten autorització separada.

---

# 15. Matriu de decisions

|  Q | Decisió                                          | Estat                                    |
| -: | ------------------------------------------------ | ---------------------------------------- |
|  1 | últimes 24 h per defecte                         | `MODIFICAR`                              |
|  2 | períodes configurables dins presets autoritzats  | `CONFIRMAT`                              |
|  3 | màxim 30 dies per consulta; retenció separada    | `MODIFICAR`                              |
|  4 | presets + personalitzat + rang/zona visibles     | `MODIFICAR`                              |
|  5 | agregar segons `history_profile`                 | `MODIFICAR`                              |
|  6 | mètode específic per camp                        | `MODIFICAR`                              |
|  7 | sense interpolació; cobertura explícita          | `CONFIRMAT`                              |
|  8 | agregació autoritativa al backend                | `CONFIRMAT`                              |
|  9 | estadístiques segons semàntica del camp          | `MODIFICAR`                              |
| 10 | mateixes dades per gràfica/taula/estadístiques   | `MODIFICAR`                              |
| 11 | UTC autoritatiu; zona de l'estació per presentar | `MODIFICAR`                              |
| 12 | viatjar no canvia automàticament el fus          | `CONFIRMAT`                              |
| 13 | durada de retenció                               | `PENDENT` / `BLOQUEJANT` per dades reals |
| 14 | arxiu/compactació/supressió                      | `PENDENT` SPEC-08                        |
| 15 | límit físic d'emmagatzematge                     | `PENDENT`                                |
| 16 | consultes acotades + agregació autoritativa      | `CONFIRMAT`                              |
| 17 | màxim de punts/bytes                             | `PENDENT` benchmark                      |
| 18 | estat buit explícit                              | `CONFIRMAT`                              |
| 19 | historial d'estació inactiva sense extrapolació  | `CONFIRMAT`                              |
| 20 | forats explícits                                 | `CONFIRMAT`                              |
| 21 | DEFECT-01 exclou també historial i derivats      | `CONFIRMAT`                              |

---

# 16. Riscos identificats

| ID         | Risc                                         | Impacte | Control                           |
| ---------- | -------------------------------------------- | ------- | --------------------------------- |
| R-DCF04-01 | aplicar `mean` universalment                 | Alt     | agregació per camp                |
| R-DCF04-02 | sumar comptadors acumulatius                 | Alt     | semàntica/transformació explícita |
| R-DCF04-03 | mitjana incorrecta de direcció del vent      | Alt     | agregació circular                |
| R-DCF04-04 | precipitació parcial presentada com completa | Alt     | cobertura                         |
| R-DCF04-05 | interpolar buits                             | Alt     | missing explícit                  |
| R-DCF04-06 | agregar dades INTERNAL_ONLY                  | Crític  | filtrar abans d'agregar           |
| R-DCF04-07 | timezone del navegador altera dies           | Mitjà   | zona de l'estació                 |
| R-DCF04-08 | confondre 30 dies de consulta amb retenció   | Alt     | separar contractes                |
| R-DCF04-09 | inventar anys de retenció                    | Alt     | SPEC-08                           |
| R-DCF04-10 | exposar històric DEFECT-01                   | Alt     | fail-closed                       |
| R-DCF04-11 | gràfica i taula divergeixen                  | Alt     | dataset autoritatiu únic          |
| R-DCF04-12 | DCF-04 legitima Grafana públicament          | Crític  | SPIKE-04 continua autoritatiu     |

---

# 17. Recomanació de canvi a SPEC-06 §6.3

Substituir el `PENDENT` actual de DCF-04 per:

```text
L'historial públic es governa mitjançant un history_profile
versionat per camp.

La fitxa mostra per defecte les últimes 24 hores i permet
24 h, 7 dies, 30 dies i un període personalitzat de com a
màxim 30 dies per consulta.

La finestra màxima de consulta no defineix la retenció.

Cada camp HA DE declarar si admet historial, resolucions,
mètodes d'agregació, estadístiques, tractament de dades
absents i política de zona horària.

No existeix un mètode universal d'agregació.

Les dades absents NO s'interpolen ni es converteixen en zero.

L'agregació pública autoritativa es calcula al backend després
d'aplicar classificació i qualitat.

La representació temporal autoritativa és UTC. La presentació
per defecte utilitza la zona horària pública de l'estació o UTC
si aquesta no està disponible.

Els camps afectats per DEFECT-01 són INTERNAL_ONLY també en
històrics, agregacions, estadístiques i derivats.

Cada font real HA DE disposar d'un retention_policy_ref aprovat
abans de publicar historial. La definició física de retenció
correspon a SPEC-08 o contracte equivalent.

L'absència de history_profile o retention_policy_ref aplicable
és fail-closed.
```

---

# 18. Canvi proposat al catàleg

Afegir conceptualment:

```text
history_profile_id
```

i, per dades reals amb historial:

```text
retention_policy_ref
```

Això NO obliga a cap esquema SQL concret.

---

# 19. Gate resultant

SPEC-06 actualment situa DCF-04 entre les decisions que impedeixen iniciar PLAN-06 si no es resolen o s'exclou explícitament el seu àmbit de l'MVP.

La resolució proposada és:

```text
DCF-04A — contracte d'historial públic
= RESOLT
```

Inclou:

* períodes;
* agregació;
* estadístiques;
* missing data;
* timezone;
* rendiment funcional;
* casos buits/inactius;
* DEFECT-01.

```text
DCF-04B — política física de retenció
= PENDENT SPEC-08
```

### MAP-A

```text
fixtures sintètiques
+ DCF-04A
-> pot avançar
```

DCF-04B NO ha de bloquejar MAP-A perquè no utilitza dades reals.

### Dades reals

```text
DCF-04A RESOLT
AND retention_policy_ref vàlid
AND DCF-02/03/09 aplicables
AND llicència/consentiment aplicables
-> historial real elegible
```

Absència de política de retenció:

```text
-> historial real bloquejat
```

---

# 20. Estat final proposat de DCF-04

**Decisió experta:**

```text
DCF-04A = RESOLT
DCF-04B = PENDENT / BLOQUEJANT PER HISTÒRICS REALS
```

Si el model de governança no permet dividir una DCF:

```text
DCF-04 = MODIFICAR
```

fins que SPEC-06 incorpori explícitament la delegació de la retenció a SPEC-08.

No recomano marcar avui:

```text
DCF-04 = RESOLT
```

si això s'interpreta com que ja s'ha decidit quant temps es conservaran físicament les dades.

Tampoc recomano mantenir tota DCF-04 com a bloquejant de MAP-A, perquè el contracte funcional necessari per treballar amb fixtures sintètiques queda completament definit en DCF-04A.

---

# 21. Decisió de ratificació proposada

> Es ratifica DCF-04A com a contracte normatiu dels històrics públics de SPEC-06. Els històrics es governen per perfils versionats per camp, amb classificació fail-closed, agregació semàntica autoritativa al backend, tractament explícit de dades absents, zona horària definida i exclusió completa dels camps afectats per DEFECT-01.
>
> La política física de retenció es designa DCF-04B i queda delegada a SPEC-08 o contracte equivalent. L'absència d'una política de retenció aprovada impedeix publicar històrics reals de la font afectada, però no impedeix PLAN-06/MAP-A amb fixtures exclusivament sintètiques.
>
> Aquesta resolució no modifica la classificació `INTERNAL_ONLY` de Grafana/i2CAT ni n'autoritza persistència, retenció o republicació.

---
## 21bis. Acte de ratificació

El 2026-09-16, Oriol ratifica DCF-04A com a contracte normatiu
dels històrics públics de SPEC-06.

**DCF-04A queda RESOLT:**
- perfil versionat `history_profile` per camp;
- classificació fail-closed (sense perfil → no publicable);
- agregació semàntica autoritativa al backend;
- tractament explícit de dades absents (`null`, cobertura);
- zona horària definida (UTC autoritatiu, presentació local);
- exclusió completa de camps afectats per DEFECT-01;
- protocol "filtrar abans d'agregar".

**DCF-04B queda PENDENT:**
- política física de retenció delegada a SPEC-08 o contracte equivalent;
- l'absència de `retention_policy_ref` impedeix publicar històrics reals;
- no bloqueja PLAN-06/MAP-A amb fixtures sintètiques.

Aquesta ratificació NO autoritza:
- publicació d'històrics reals sense retention_policy_ref aprovat;
- Grafana/i2CAT en cap superfície pública;
- persistència, retenció o republicació de dades externes.

MAP-A continua limitat a fixtures sintètiques.

# 22. Referències

**Projecte**

* SPEC-06 v0.5 — model públic, gates, RF-MAP-06 i CA-MAP-05.
* DCF-06 v1.1 — classificació, qualitat, DEFECT-01 i fail-closed.
* SPIKE-04 v1.1 — Grafana/i2CAT `INTERNAL_ONLY`; persistència/retenció/republicació no autoritzades.

**Estàndards externs**

* CF Metadata Conventions 1.13 — semàntica d'agregacions temporals (`point`, `sum`, `mean`, `minimum`, `maximum`, etc.).
* RFC 3339 — representació interoperable de timestamps.
* IANA Time Zone Database — zones horàries i regles civils/DST.
* W3C WAI — alternatives textuals per gràfics complexos i taules accessibles.
* GDPR, art. 5(1)(e) — limitació de conservació quan el tractament afecta dades personals.
