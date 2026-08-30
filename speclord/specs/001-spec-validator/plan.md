# PLAN-001 — Validador de `spec.md`

## 1. Objectiu del pla

Implementar la SPEC-001 de SpecLord mantenint separades:

- descoberta de specs;
- lectura i parsing;
- regles de validació;
- model de resultats;
- presentació CLI.

La implementació ha de ser determinista, testejable i no modificar els projectes analitzats.

Aquest pla cobreix `specs/001-spec-validator/spec.md`.

---

# 2. Stack

## Llenguatge

Python 3.12.

### Justificació

La funcionalitat requereix principalment:

- lectura de fitxers;
- recorregut de directoris;
- processament de text;
- expressions regulars;
- ordenació;
- CLI.

Tot això es pot implementar amb la biblioteca estàndard de Python.

### Alternativa descartada

**TypeScript / Node.js**

També seria adequat, però no aporta cap avantatge funcional rellevant per a la SPEC-001 i introdueix més infraestructura de projecte.

---

## Dependències de runtime

Cap dependència externa.

S'utilitzarà exclusivament la biblioteca estàndard de Python per a:

- filesystem;
- parsing textual;
- expressions regulars;
- CLI;
- estructures de dades.

### Alternativa descartada

Utilitzar un parser Markdown extern.

No és necessari perquè la SPEC defineix explícitament un subconjunt Markdown limitat.

Un parser Markdown complet augmentaria la complexitat i podria introduir comportaments diferents dels especificats.

---

## Dependències de desenvolupament

`pytest`

S'utilitzarà exclusivament per executar els tests automatitzats.

---

# 3. Estructura prevista

```text
speclord/
├── AGENTS.md
├── docs/
│   └── constitution.md
│
├── specs/
│   └── 001-spec-validator/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
│
├── speclord/
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py
│   ├── discovery.py
│   ├── parser.py
│   ├── validator.py
│   ├── rules.py
│   └── models.py
│
└── tests/
    ├── test_discovery.py
    ├── test_parser.py
    ├── test_rules.py
    ├── test_validator.py
    └── test_cli.py
```

---

# 4. Responsabilitats dels mòduls

## `models.py`

Contindrà els models interns necessaris per representar:

- specs descobertes;
- seccions;
- candidats RF;
- RF reconeguts;
- incidències;
- resultat d'una spec;
- resultat global del projecte.

No contindrà regles de validació.

### RF relacionats

RF-31, RF-33, RF-34.

---

## `discovery.py`

Responsable exclusivament de descobrir `spec.md`.

Ha de:

1. localitzar `specs/`;
2. recórrer-lo recursivament;
3. ignorar symlinks;
4. identificar errors d'accés;
5. retornar les specs descobertes;
6. ordenar les rutes segons la regla definida a la SPEC.

No ha de llegir ni validar el contingut dels fitxers.

### RF coberts

RF-1 → RF-5  
RF-37

---

## `parser.py`

Transformarà una `spec.md` llegible en una representació estructurada suficient per aplicar les regles.

Ha de reconèixer únicament el subconjunt Markdown definit a la SPEC:

- capçaleres;
- seccions;
- blocs de codi;
- candidats RF;
- RF reconeguts.

No serà un parser Markdown general.

### RF relacionats

RF-6 → RF-12  
RF-19 → RF-23

---

## `rules.py`

Contindrà les regles deterministes de validació.

Cada regla rebrà informació estructurada i retornarà zero o més incidències.

Les regles no:

- imprimiran resultats;
- modificaran fitxers;
- descobriran specs;
- decidiran l'estat global.

### Grups de regles

#### Seccions

- secció absent;
- secció duplicada;
- secció buida.

RF-6 → RF-10.

#### RF

- candidat invàlid;
- RF duplicat;
- absència de RF;
- contingut buit;
- numeració inicial;
- salts.

RF-11 → RF-18.

#### Aclariments

- `[NECESSITA ACLARACIÓ]`.

RF-19 → RF-20.

#### Qualitat

- termes vagues;
- patrons EARS.

RF-21 → RF-25.

---

## `validator.py`

Orquestrarà la validació completa.

Flux:

```text
projecte
   ↓
descoberta
   ↓
per cada spec
   ↓
lectura
   ↓
spec buida?
   ↓
parser
   ↓
regles
   ↓
incidències
   ↓
estat spec
   ↓
resultat global
```

Ha de garantir que un error en una spec no impedeixi processar-ne les altres.

### RF coberts

RF-26 → RF-36  
RF-38

---

## `cli.py`

Responsable exclusivament de:

- rebre el projecte que s'ha de validar;
- invocar el validador;
- presentar els resultats.

No contindrà lògica de validació.

Això permetrà reutilitzar el core en futures interfícies sense modificar-lo.

### Principi constitucional

Core independent de la interfície.

---

# 5. Model de dades intern

## Incidència

Model conceptual:

```text
Issue
 ├── severity
 │    ├── error
 │    └── warning
 │
 ├── scope
 │    ├── project
 │    └── spec
 │
 ├── message
 ├── spec_path? 
 ├── section?
 └── rf_id?
```

Els camps opcionals només existiran quan siguin aplicables.

---

## Resultat d'una spec

```text
SpecResult
 ├── path
 ├── issues[]
 └── status
      ├── OK
      ├── WARN
      └── FAIL
```

Càlcul:

```text
si existeix error:
    FAIL

sinó si existeix warning:
    WARN

sinó:
    OK
```

Cobreix RF-31.

---

## Resultat del projecte

```text
ProjectResult
 ├── specs[]
 ├── project_issues[]
 ├── specs_processed
 ├── errors
 ├── warnings
 └── status
```

L'estat global segueix exactament la mateixa regla:

```text
qualsevol error → FAIL
cap error + algun warning → WARN
cap incidència → OK
```

Cobreix RF-33 → RF-36.

---

# 6. Descoberta de specs

## Algoritme conceptual

```text
localitzar <project>/specs

si no existeix:
    error de projecte
    retornar 0 specs

recórrer specs recursivament

per cada entrada:
    si és symlink:
        ignorar

    si és directori accessible:
        continuar recorregut

    si és directori inaccessible:
        registrar error
        continuar

    si és fitxer amb nom exactament spec.md:
        afegir

normalitzar ruta relativa amb "/"

ordenar les specs

si no n'hi ha cap:
    registrar error de projecte
```

### Decisió

La descoberta i lectura del contingut seran fases separades.

### Alternativa descartada

Descobrir i validar cada fitxer simultàniament.

Separar les fases permet:

- provar la descoberta independentment;
- controlar millor els errors;
- mantenir responsabilitats petites.

---

# 7. Lectura de specs

Els fitxers es llegiran explícitament com UTF-8.

Possibles resultats:

```text
llegible + contingut
llegible + buida
no llegible
UTF-8 invàlid
```

Una spec buida o no llegible:

- genera una única incidència;
- compta com processada;
- no entra al parser;
- no executa altres regles.

Cobreix RF-26 → RF-28 i RF-35.

---

# 8. Parsing Markdown

No s'utilitzarà un parser Markdown complet.

El parser recorrerà el document línia per línia mantenint un estat mínim:

```text
dins_bloc_codi = sí/no
secció_actual
nivell_secció
ordre_document
```

## Capçaleres

Es reconeixeran únicament capçaleres amb:

```text
#{1,6} + espai + text
```

Les capçaleres dins de blocs de codi s'ignoraran.

---

## Seccions

Quan aparegui una capçalera:

1. es normalitza el nom;
2. es comprova si correspon a una secció obligatòria;
3. s'estableix el seu rang;
4. les subseccions inferiors es consideren contingut de la secció pare.

Les múltiples ocurrències es conservaran.

---

## RF

Només s'analitzaran candidats dins de qualsevol ocurrència de:

`Requisits funcionals`

Candidat:

```text
espais opcionals + "- RF"
```

RF reconegut:

```text
- RF-[1-9][0-9]*:
```

El text posterior als dos punts constitueix el contingut.

---

# 9. Regles de qualitat

## Termes vagues

El catàleg definit a la SPEC serà una dada constant del core.

Cada terme es buscarà:

- sense distingir majúscules;
- com a paraula o expressió completa.

Una coincidència genera un warning.

Dos termes diferents:

```text
ràpid
fàcil
```

generen dos warnings.

---

## EARS

Els patrons es comprovaran sobre el contingut complet del RF.

Patrons acceptats:

```text
QUAN <text> EL SISTEMA <text>

SI <text> EL SISTEMA <text>

MENTRE <text> EL SISTEMA <text>

EL SISTEMA <text>
```

La comprovació serà estrictament sintàctica.

No s'intentarà determinar si:

- el requisit té sentit;
- és realista;
- contradiu un altre RF;
- descriu correctament el domini.

---

# 10. Acumulació d'incidències

Les regles seran independents.

Per exemple:

```text
RF-4:
QUAN sigui possible el sistema respon ràpid
```

podria generar simultàniament:

```text
warning → "quan sigui possible"
warning → "ràpid"
warning → no compleix EARS
```

No s'utilitzarà un model "primer error guanya".

Excepcions explícites:

- spec buida;
- spec no llegible.

Aquestes dues situacions aturen només la validació d'aquella spec.

---

# 11. No modificació

La validació serà exclusivament de lectura.

Cap mòdul de validació tindrà responsabilitats d'escriptura sobre el projecte analitzat.

Els tests verificaran que els fitxers originals mantenen el mateix contingut després de l'execució.

Cobreix RF-38 i el principi 8 de la Constitution.

---

# 12. Estratègia de tests

## Principi

Els tests verificaran comportament observable i RF, no implementació interna.

Cada RF haurà d'estar relacionat amb almenys un test.

---

## `test_discovery.py`

Cobertura principal:

RF-1 → RF-5  
RF-37

Escenaris:

- `specs/` inexistent;
- directori buit;
- spec directa;
- spec en subdirectori;
- múltiples nivells;
- symlink;
- múltiples specs;
- ordenació;
- error d'accés quan sigui reproduïble de manera fiable a la plataforma de test.

---

## `test_parser.py`

Cobertura principal:

RF-6 → RF-12  
RF-19 → RF-20

Escenaris:

- capçaleres vàlides;
- diferents nivells;
- capçaleres dins de code fence;
- seccions duplicades;
- subseccions;
- candidats RF;
- identificadors vàlids;
- identificadors invàlids;
- marcador `[NECESSITA ACLARACIÓ]`.

---

## `test_rules.py`

Cobertura principal:

RF-13 → RF-25

Escenaris:

- RF duplicats;
- cap RF;
- contingut buit;
- RF-1 absent;
- salts;
- diversos salts;
- terme vague;
- diversos termes;
- majúscules/minúscules;
- no coincidències parcials;
- cada patró EARS;
- RF sense EARS.

---

## `test_validator.py`

Cobertura principal:

RF-26 → RF-36  
RF-38

Escenaris:

- spec buida;
- UTF-8 invàlid;
- spec defectuosa + spec vàlida;
- múltiples incidències;
- estat OK;
- estat WARN;
- estat FAIL;
- estat global;
- comptadors;
- zero specs;
- fitxers no modificats.

---

## `test_cli.py`

Comprovarà el flux complet observable:

```text
projecte → execució → sortida
```

Sense replicar exhaustivament les regles ja cobertes pels tests del core.

---

# 13. Traçabilitat funcional

| Àrea | RF |
|---|---|
| Descoberta | RF-1 — RF-5 |
| Seccions | RF-6 — RF-10 |
| RF i numeració | RF-11 — RF-18 |
| Dubtes pendents | RF-19 — RF-20 |
| Qualitat determinista | RF-21 — RF-25 |
| Specs defectuoses | RF-26 — RF-28 |
| Acumulació | RF-29 — RF-30 |
| Estat de spec | RF-31 — RF-32 |
| Estat global | RF-33 — RF-36 |
| Ordenació | RF-37 |
| No modificació | RF-38 |

Tots els RF tenen una àrea d'implementació i una estratègia de test associada.

---

# 14. Decisions tècniques principals

## D1 — Python 3.12

**Escollida:** Python.

**Descartada:** TypeScript.

Motiu: simplicitat i suficient suport estàndard per al problema.

---

## D2 — Sense parser Markdown extern

**Escollida:** parser específic del subconjunt definit a la SPEC.

**Descartada:** biblioteca Markdown completa.

Motiu: evitar dependències i comportaments que no formen part de la SPEC.

---

## D3 — Regles independents

**Escollida:** cada regla produeix incidències independentment.

**Descartada:** cadena de validació que s'atura al primer problema.

Motiu: RF-29 i RF-30 exigeixen acumulació.

---

## D4 — Core independent de CLI

**Escollida:** discovery/parser/rules/validator independents de la presentació.

**Descartada:** implementar tota la validació directament al comandament CLI.

Motiu: Constitution i futura reutilització.

---

## D5 — Resultats estructurats

**Escollida:** la validació produeix models de resultats que després presenta la CLI.

**Descartada:** imprimir errors directament durant la validació.

Motiu:

- testabilitat;
- determinisme;
- futura integració amb altres interfícies.

---

# 15. Flux principal previst

```text
usuari
  │
  ▼
CLI
  │
  ▼
validator
  │
  ├── discovery
  │
  └── per cada spec
       │
       ├── read
       │
       ├── parser
       │
       └── rules
             │
             ▼
          issues
             │
             ▼
        SpecResult
  │
  ▼
ProjectResult
  │
  ▼
CLI output
```

---

# 16. Fora del pla tècnic de SPEC-001

No es prepararan encara components per:

- `plan.md` validation;
- `tasks.md` validation;
- integració amb GitHub;
- IA;
- API;
- base de dades;
- interfície web;
- plugins;
- configuració extensible del catàleg de termes;
- correcció automàtica.

Aquestes funcionalitats requeriran Specs pròpies si s'incorporen en el futur.