# SPEC-001 — Validador de `spec.md`

## Context i objectiu

SpecLord és una eina orientada a projectes desenvolupats amb Spec-Driven Development (SDD).

L'objectiu d'aquesta primera funcionalitat és analitzar les especificacions d'un projecte i detectar problemes estructurals i senyals simples i deterministes de qualitat deficient dels requisits abans de començar-ne la implementació.

La validació no ha de requerir intel·ligència artificial ni serveis externs.

## Usuaris / actors

- Desenvolupador que treballa amb SDD.
- Agent de desenvolupament que necessita comprovar si una especificació està preparada per implementar-se.

## Històries d'usuari

- H1: Com a desenvolupador vull validar les specs d'un projecte per detectar errors abans de començar a implementar.
- H2: Com a desenvolupador vull detectar requisits potencialment ambigus o poc verificables per poder-los revisar.
- H3: Com a desenvolupador vull obtenir un resum global de les specs analitzades per saber si el projecte està preparat per continuar el procés SDD.

## Definicions i convencions

### Spec

Una spec és un fitxer anomenat exactament `spec.md` situat dins del directori `specs/` o qualsevol dels seus subdirectoris.

La cerca és recursiva.

En aquesta versió:

- no se segueixen enllaços simbòlics;
- un `spec.md` que sigui un enllaç simbòlic no es considera descobert;
- si una part de `specs/` no es pot recórrer per un error d'accés, es registra un `error` de projecte i es continua amb les parts accessibles.

### Subconjunt Markdown reconegut

SpecLord només necessita reconèixer les construccions Markdown següents:

**Capçalera**

Una línia formada per entre 1 i 6 caràcters `#`, seguits d'almenys un espai i del text de la capçalera.

Exemple:

`## Requisits funcionals`

**Element RF**

Una línia situada dins de `Requisits funcionals` que, ignorant espais inicials, comença per:

`- RF`

**Bloc de codi**

Un bloc delimitat per línies que comencen amb tres backticks consecutius:

```text
```
...
```
```

El contingut dins d'aquests blocs no es considera per detectar:

- capçaleres;
- candidats RF;
- marcadors d'aclariment.

El marcador d'aclariment és:

```text
[NECESSITA ACLARACIÓ]
```

Altres construccions Markdown queden fora de la gramàtica necessària per aquesta versió.

### Delimitació d'una secció

Una secció comença després de la seva capçalera i acaba immediatament abans de la següent capçalera del mateix nivell o d'un nivell superior, o al final del document.

Les subseccions de nivell inferior formen part del contingut de la secció pare.

### Seccions obligatòries

Les seccions obligatòries són:

- Context i objectiu
- Usuaris / actors
- Històries d'usuari
- Requisits funcionals
- Requisits no funcionals
- Casos límit
- Fora d'abast
- Criteris de finalització
- Dubtes oberts

La comparació del nom:

- ignora majúscules i minúscules;
- ignora espais inicials i finals;
- considera equivalents l'apòstrof recte `'` i el tipogràfic `’`.

La spec pot contenir altres seccions.

Si una secció obligatòria apareix diverses vegades:

- totes les ocurrències es consideren part de la validació;
- es genera un `warning` per cada ocurrència posterior a la primera;
- en el cas de `Requisits funcionals`, els RF de totes les ocurrències es processen en l'ordre en què apareixen al document.

Cada ocurrència d'una secció obligatòria sense contingut genera un `warning`.

Altres regles aplicables poden generar incidències addicionals sobre la mateixa secció.

### Candidat RF

Un candidat RF és un element RF segons la definició anterior.

Per exemple:

`- RF-1: ...` → candidat RF

`- RF1: ...` → candidat RF

`- RF-A: ...` → candidat RF

`- REQ-1: ...` → no és candidat RF

### Identificador RF vàlid

Un candidat té un identificador RF vàlid quan segueix:

`RF-<número>`

on `<número>` és un enter decimal positiu sense zeros inicials.

Formalment, els números vàlids són:

`1, 2, 3, ..., 9, 10, 11, ..., 20, ...`

Exemples:

`RF-1` → vàlid

`RF-2` → vàlid

`RF-20` → vàlid

`RF-0` → invàlid

`RF-01` → invàlid

`RF-A` → invàlid

`RF1` → invàlid

### RF reconegut

Un RF reconegut té la forma:

`- RF-<número>:`

amb un identificador vàlid.

El text posterior als dos punts constitueix el contingut del RF.

El contingut pot ser buit sintàcticament; en aquest cas el RF continua estant reconegut però genera l'error corresponent de contingut buit.

En aquesta versió, el contingut del RF és exclusivament el text present a la mateixa línia després dels dos punts.

### Patrons EARS reconeguts

Un RF amb contingut es considera sintàcticament observable quan, ignorant majúscules/minúscules, compleix algun dels patrons:

- `QUAN <text> EL SISTEMA <text>`
- `SI <text> EL SISTEMA <text>`
- `MENTRE <text> EL SISTEMA <text>`
- `EL SISTEMA <text>`

Cada `<text>` ha de contenir almenys un caràcter diferent d'espais.

Aquesta comprovació és sintàctica. SpecLord no interpreta el significat real del requisit.

### Catàleg de termes vagues

El catàleg és tancat:

- `ràpid`
- `ràpidament`
- `fàcil`
- `fàcilment`
- `adequat`
- `eficient`
- `intuïtiu`
- `quan sigui possible`
- `si és necessari`
- `suficient`

La detecció:

- ignora majúscules/minúscules;
- exigeix paraules o expressions completes;
- no considera coincidències parcials dins d'altres paraules;
- no normalitza accents ni transforma unes paraules en variants diferents.

Cada terme vague diferent detectat dins d'un mateix RF genera un `warning`.

### Spec buida

Una spec es considera buida quan només conté qualsevol combinació de:

- espai `U+0020`;
- tabulador `U+0009`;
- salt de línia `U+000A`;
- retorn de carro `U+000D`.

### Incidències

Una incidència té:

- severitat: `error` o `warning`;
- àmbit: `project` o `spec`;
- descripció.

Quan l'àmbit és `spec`, també ha d'incloure:

- ruta de la spec afectada;
- RF o secció afectada quan sigui aplicable.

Una incidència d'àmbit `project` no necessita una spec associada.

### Estats

L'estat d'una spec és:

- `FAIL`: almenys un `error`;
- `WARN`: cap error i almenys un `warning`;
- `OK`: cap error ni warning.

L'estat global és:

- `FAIL`: almenys un error de projecte o de spec;
- `WARN`: cap error i almenys un warning;
- `OK`: cap error ni warning.

## Requisits funcionals

### Descoberta

- RF-1: QUAN l'usuari executi la validació sobre un projecte, EL SISTEMA ha de buscar recursivament els fitxers anomenats exactament `spec.md` dins de `specs/`, sense seguir enllaços simbòlics.

- RF-2: SI `specs/` no existeix, EL SISTEMA ha de registrar un `error` d'àmbit `project` indicant que no s'ha trobat cap especificació.

- RF-3: SI `specs/` existeix però no conté cap spec descoberta, EL SISTEMA ha de registrar el mateix error funcional definit a RF-2.

- RF-4: QUAN es descobreixin múltiples specs, EL SISTEMA les ha de processar totes.

- RF-5: SI durant la descoberta un directori no es pot recórrer, EL SISTEMA ha de registrar un `error` de projecte per aquell problema i continuar la descoberta pels directoris accessibles.

### Seccions

- RF-6: QUAN s'analitzi una spec llegible i no buida, EL SISTEMA ha de comprovar totes les seccions obligatòries.

- RF-7: SI falta una secció obligatòria, EL SISTEMA ha de registrar un `error`.

- RF-8: SI una secció obligatòria apareix més d'una vegada, EL SISTEMA ha de registrar un `warning` per cada ocurrència posterior a la primera.

- RF-9: SI una ocurrència d'una secció obligatòria no conté contingut, EL SISTEMA ha de registrar un `warning` per aquella ocurrència.

- RF-10: QUAN `Requisits funcionals` aparegui diverses vegades, EL SISTEMA ha de validar conjuntament els RF de totes les ocurrències respectant l'ordre del document.

### Regles sobre RF

- RF-11: QUAN s'analitzi `Requisits funcionals`, EL SISTEMA ha d'identificar els candidats RF segons les regles definides en aquesta spec.

- RF-12: SI un candidat RF no conté un identificador RF vàlid seguit de dos punts, EL SISTEMA ha de registrar un `error` sobre aquell candidat.

- RF-13: SI existeixen dos o més RF reconeguts amb el mateix identificador, EL SISTEMA ha de registrar un `error` d'identificador duplicat.

- RF-14: SI una spec no conté cap RF reconegut, EL SISTEMA ha de registrar un `error`.

- RF-15: SI un RF reconegut no conté cap caràcter diferent d'espais després dels dos punts, EL SISTEMA ha de registrar un `error` de contingut buit.

- RF-16: QUAN s'avaluï la numeració, EL SISTEMA ha de considerar els identificadors dels RF reconeguts, eliminar-ne els duplicats i ordenar-los pel seu valor numèric.

- RF-17: SI el primer número obtingut segons RF-16 és diferent d'1, EL SISTEMA ha de registrar un `warning`.

- RF-18: SI existeix un salt entre dos números consecutius de la seqüència definida a RF-16, EL SISTEMA ha de registrar un `warning` per cada salt detectat.

### Dubtes pendents

- RF-19: SI la spec conté el marcador d'aclariment fora d'un bloc de codi, EL SISTEMA ha de registrar un `error`.

- RF-20: QUAN busqui aquest marcador, EL SISTEMA ho ha de fer sobre tot el document i ignorant majúscules/minúscules.

### Qualitat determinista

- RF-21: QUAN un RF reconegut amb contingut contingui un terme del catàleg tancat, EL SISTEMA ha de registrar un `warning` identificant el terme.

- RF-22: SI un RF conté diversos termes vagues diferents, EL SISTEMA ha de generar un `warning` independent per cada terme.

- RF-23: SI un RF reconegut amb contingut no compleix cap patró EARS reconegut, EL SISTEMA ha de registrar un `warning`.

- RF-24: EL SISTEMA no ha de determinar la correcció semàntica del requisit més enllà de les regles explícites d'aquesta spec.

- RF-25: EL SISTEMA no ha d'utilitzar IA, LLM ni serveis externs per realitzar la validació.

### Specs defectuoses

- RF-26: SI una spec és buida segons la definició establerta, EL SISTEMA ha de registrar únicament un `error` de spec buida i no executar altres validacions sobre aquell fitxer.

- RF-27: SI una spec no es pot llegir o no es pot interpretar com a text UTF-8, EL SISTEMA ha de registrar únicament un `error` de lectura i no executar altres validacions sobre aquell fitxer.

- RF-28: SI una spec és buida o no llegible, EL SISTEMA ha de continuar processant les altres specs descobertes.

### Acumulació d'incidències

- RF-29: QUAN una spec sigui llegible i no buida, EL SISTEMA ha d'executar totes les regles de validació aplicables encara que s'hagin detectat incidències prèvies.

- RF-30: QUAN diverses regles siguin aplicables al mateix contingut, EL SISTEMA ha de conservar totes les incidències generades.

### Resultats

- RF-31: QUAN finalitzi la validació d'una spec, EL SISTEMA ha de calcular-ne l'estat `FAIL`, `WARN` o `OK`.

- RF-32: QUAN finalitzi la validació d'una spec, EL SISTEMA ha de mostrar-ne les incidències.

- RF-33: QUAN finalitzi l'anàlisi del projecte, EL SISTEMA ha de calcular l'estat global.

- RF-34: QUAN finalitzi l'anàlisi del projecte, EL SISTEMA ha de mostrar:
  - nombre de specs processades;
  - nombre total d'errors;
  - nombre total de warnings;
  - estat global.

- RF-35: QUAN una spec descoberta sigui buida o no llegible, EL SISTEMA l'ha de comptar com a spec processada.

- RF-36: SI no es descobreix cap spec, EL SISTEMA ha de mostrar zero specs processades, almenys un error de projecte i estat global `FAIL`.

### Ordenació

- RF-37: QUAN es mostrin múltiples specs, EL SISTEMA les ha d'ordenar per la seva ruta relativa normalitzada amb `/` com a separador, mitjançant comparació sensible a majúscules/minúscules segons el valor Unicode dels caràcters.

L'ordre intern de les incidències d'una mateixa spec no forma part del contracte funcional de la SPEC-001.

### No modificació

- RF-38: EL SISTEMA no ha de modificar cap fitxer del projecte analitzat durant la validació.

## Requisits no funcionals

- RNF-1: Davant el mateix conjunt de fitxers, la validació ha de produir el mateix conjunt d'incidències, els mateixos comptadors i els mateixos estats.

- RNF-2: La primera versió ha de funcionar sense connexió a Internet.

- RNF-3: La primera versió no ha de requerir serveis externs.

- RNF-4: Les incidències han de complir el model definit a l'apartat `Incidències`.

- RNF-5: Totes les regles funcionals han de poder ser verificades mitjançant tests automatitzats.

## Casos límit

S'han de contemplar:

- `specs/` inexistent;
- `specs/` buit;
- specs en diferents nivells de subdirectoris;
- enllaços simbòlics;
- directoris no accessibles;
- múltiples specs;
- spec buida;
- spec no llegible;
- spec no UTF-8;
- secció obligatòria absent;
- secció obligatòria duplicada dues o més vegades;
- diverses ocurrències buides d'una mateixa secció;
- `Requisits funcionals` duplicada;
- cap RF reconegut;
- candidat RF amb identificador incorrecte;
- RF amb identificador correcte però contingut buit;
- RF duplicats;
- numeració que no comença per 1;
- diversos salts de numeració;
- marcador d'aclariment;
- marcador dins d'un bloc de codi;
- múltiples termes vagues en un RF;
- RF sense patró EARS;
- múltiples regles aplicables al mateix RF;
- projecte només amb warnings;
- projecte amb errors;
- projecte sense incidències.

## Fora d'abast

La SPEC-001 NO inclou:

- ús d'intel·ligència artificial;
- interpretació semàntica profunda;
- detecció general de contradiccions;
- correcció automàtica de specs;
- generació automàtica de specs;
- modificació de fitxers;
- validació de `plan.md`;
- validació de `tasks.md`;
- validació del codi font del projecte analitzat;
- validació dels tests del projecte analitzat;
- **validació per part d'SpecLord de la traçabilitat RF → tasques o RF → tests del projecte analitzat**;
- interfície web;
- integració amb GitHub.

Aquesta exclusió no afecta la traçabilitat interna exigida per la Constitution per desenvolupar la mateixa SPEC-001 d'SpecLord.

## Criteris de finalització

La SPEC-001 es considerarà implementada quan:

1. Cada RF de la SPEC-001 estigui relacionat amb almenys una tasca de `tasks.md`.
2. Cada RF de la SPEC-001 estigui relacionat amb almenys un test automatitzat que en verifiqui el comportament.
3. Tots els tests associats a la SPEC-001 passin.
4. Es validi correctament un projecte amb múltiples specs distribuïdes en subdirectoris.
5. Existeixin tests que demostrin els estats `OK`, `WARN` i `FAIL` tant de spec com de projecte.
6. Existeixin tests que demostrin que una spec buida o no llegible no impedeix processar les altres.
7. Existeixi un test que demostri que la validació no modifica els fitxers analitzats.
8. Es realitzi una prova manual amb almenys:
   - una spec `OK`;
   - una spec `WARN`;
   - una spec `FAIL`.

Abans d'executar aquesta prova manual s'han de documentar els estats i comptadors esperats. La prova només es considera superada si els resultats obtinguts coincideixen amb els esperats.

## Dubtes oberts

No queden dubtes oberts identificats després de la segona fase de clarificació.
