# TASKS-001 — Validador de `spec.md`

## Regles d'execució

- Implementar una sola tasca cada vegada.
- Respectar estrictament les dependències.
- Escriure primer els tests quan la tasca introdueixi comportament verificable.
- Executar els tests relacionats abans de marcar una tasca com completada.
- No començar automàticament la tasca següent.
- No modificar `spec.md` ni `plan.md` durant la implementació.
- No implementar funcionalitat corresponent a tasques posteriors.
- Si una tasca revela una contradicció entre `constitution.md`, `spec.md`, `plan.md` i `tasks.md`, aturar la implementació i reportar-la.
- No resoldre una ambigüitat funcional inventant comportament durant la implementació.

---

# Fase A — Base del projecte

## T1 — Inicialitzar l'estructura Python

**Dependències:** cap.

**RF:** cap RF funcional directe; suport estructural.

- [x] Crear el paquet `speclord`.
- [x] Crear els mòduls previstos al `plan.md`.
- [x] Crear `tests/`.
- [x] Preparar l'execució de `pytest`.
- [x] Garantir que el paquet es pot importar.

**Fet quan:**

- `import speclord` funciona.
- `pytest` es pot executar sense errors d'inicialització.
- Existeix l'estructura prevista al `plan.md`.
- No s'ha implementat cap regla funcional.

---

## T2 — Crear els models interns

**Dependències:** T1.

**RF:** suport estructural per RF-31 → RF-36.

- [ ] Escriure primer els tests dels models.
- [ ] Representar una incidència amb:
  - severitat;
  - àmbit;
  - descripció;
  - ruta de spec quan sigui aplicable;
  - secció quan sigui aplicable;
  - RF quan sigui aplicable.
- [ ] Representar el resultat d'una spec.
- [ ] Representar el resultat d'un projecte.
- [ ] Representar els estats `OK`, `WARN` i `FAIL`.

**Fet quan:**

Els tests demostren que:

- una incidència només admet `error` o `warning`;
- l'àmbit només admet `project` o `spec`;
- una incidència `project` no necessita `spec_path`;
- els resultats poden representar incidències i estat sense imprimir res;
- no hi ha regles de validació dins dels models.

---

# Fase B — Descoberta i lectura

## T3 — Descobrir specs recursivament

**Dependències:** T1, T2.

**RF:** RF-1, suport per RF-4.

- [ ] Escriure primer els tests de descoberta.
- [ ] Localitzar el directori `specs/`.
- [ ] Recórrer-ne els subdirectoris recursivament.
- [ ] Detectar només fitxers anomenats exactament `spec.md`.
- [ ] Ignorar fitxers amb altres noms.
- [ ] No seguir directoris symlink.
- [ ] No considerar un `spec.md` symlink com a spec descoberta.

**Fet quan:**

Els tests demostren que:

- es descobreix una spec directa;
- es descobreixen specs a diversos nivells;
- es descobreixen múltiples specs;
- altres noms s'ignoren;
- els symlinks no es processen.

---

## T4 — Gestionar errors de descoberta

**Dependències:** T3.

**RF:** RF-2, RF-3, RF-5; suport per RF-36.

- [ ] Escriure primer els tests d'errors de descoberta.
- [ ] Gestionar `specs/` inexistent.
- [ ] Gestionar `specs/` existent sense specs.
- [ ] Generar incidències d'àmbit `project`.
- [ ] Gestionar errors d'accés durant el recorregut.
- [ ] Continuar pels directoris accessibles després d'un error recuperable.

**Fet quan:**

Els tests demostren que:

- `specs/` inexistent genera l'error de projecte definit a la SPEC;
- `specs/` buit genera el mateix error funcional;
- un directori inaccessible genera error però no elimina els resultats accessibles;
- els casos es poden provar de forma determinista sense dependre dels permisos reals de la plataforma.

---

## T5 — Normalitzar i ordenar les rutes

**Dependències:** T3.

**RF:** RF-37, parcial; la presentació final es verificarà també a la CLI.

- [ ] Escriure primer els tests d'ordenació.
- [ ] Representar les rutes relatives al projecte.
- [ ] Normalitzar `/` com a separador.
- [ ] Ordenar segons el valor Unicode i distingint majúscules/minúscules.

**Fet quan:**

Una mateixa col·lecció de specs produeix sempre exactament el mateix ordre normalitzat.

---

## T6 — Llegir specs i detectar fitxers defectuosos

**Dependències:** T2, T3.

**RF:** RF-26, RF-27; suport per RF-28 i RF-35.

- [ ] Escriure primer els tests de lectura.
- [ ] Llegir explícitament els fitxers com UTF-8.
- [ ] Detectar UTF-8 invàlid.
- [ ] Aplicar exactament la definició de spec buida.
- [ ] Produir el resultat de lectura necessari per permetre aturar només la validació d'aquella spec.

**Fet quan:**

Els tests demostren que:

- una spec normal es llegeix;
- una spec formada només pels quatre tipus de whitespace definits es considera buida;
- una spec no UTF-8 es considera no llegible;
- spec buida i no llegible es poden distingir del cas normal.

---

# Fase C — Parsing Markdown

## T7 — Reconèixer code fences i capçaleres

**Dependències:** T1.

**RF:** suport per RF-6 → RF-10 i RF-19 → RF-20.

- [ ] Escriure primer els tests del subconjunt Markdown.
- [ ] Reconèixer capçaleres Markdown de nivell 1–6.
- [ ] Exigir almenys un espai després dels `#`.
- [ ] Reconèixer inici i final de blocs de tres backticks.
- [ ] Ignorar capçaleres dins dels blocs de codi.

**Fet quan:**

Els tests distingeixen:

- capçalera vàlida;
- falsa capçalera;
- nivells 1–6;
- contingut normal;
- capçalera dins de bloc de codi.

---

## T8 — Parsejar l'estructura de seccions

**Dependències:** T7.

**RF:** suport estructural per RF-6 → RF-10.

- [ ] Escriure primer els tests de parsing de seccions.
- [ ] Normalitzar el nom de les seccions segons la SPEC.
- [ ] Detectar l'inici de cada secció.
- [ ] Determinar-ne el final segons el nivell de capçalera.
- [ ] Incloure subseccions inferiors dins de la secció pare.
- [ ] Conservar totes les ocurrències d'una mateixa secció.
- [ ] Conservar l'ordre documental.

**Fet quan:**

El parser representa correctament:

- una secció simple;
- diverses seccions;
- una secció amb subseccions;
- seccions repetides;
- múltiples ocurrències de `Requisits funcionals`.

Aquesta tasca no genera encara errors ni warnings de validació.

---

## T9 — Validar les seccions obligatòries

**Dependències:** T2, T8.

**RF:** RF-6, RF-7, RF-8, RF-9, RF-10.

- [ ] Escriure primer els tests de regles de seccions.
- [ ] Comprovar la presència de totes les seccions obligatòries.
- [ ] Generar error per cada secció obligatòria absent.
- [ ] Generar un warning per cada ocurrència posterior a la primera.
- [ ] Generar warning per cada ocurrència buida.
- [ ] Considerar conjuntament totes les ocurrències de `Requisits funcionals`.

**Fet quan:**

Els tests cobreixen:

- totes les seccions presents;
- una secció absent;
- múltiples seccions absents;
- una secció duplicada;
- una secció present tres vegades;
- una o diverses ocurrències buides;
- `Requisits funcionals` duplicada.

---

# Fase D — Parsing i validació dels RF

## T10 — Parsejar candidats RF i RF reconeguts

**Dependències:** T7, T8.

**RF:** suport estructural per RF-11 → RF-15.

- [ ] Escriure primer els tests de parsing dels RF.
- [ ] Buscar candidats només dins de `Requisits funcionals`.
- [ ] Reconèixer candidats que comencen per `- RF`.
- [ ] Reconèixer `RF-[1-9][0-9]*:`.
- [ ] Extreure identificador.
- [ ] Extreure el contingut de la mateixa línia després dels dos punts.
- [ ] Conservar l'ordre documental.
- [ ] Distingir candidat invàlid de RF reconegut amb contingut buit.

**Fet quan:**

El parser distingeix correctament:

- `RF-1`;
- `RF-2`;
- `RF-20`;
- `RF-0`;
- `RF-01`;
- `RF1`;
- `RF-A`;
- `REQ-1`;
- RF amb contingut;
- RF amb contingut buit;
- candidat fora de `Requisits funcionals`.

Aquesta tasca no genera encara les incidències de validació corresponents.

---

## T11 — Validar candidats i contingut RF

**Dependències:** T2, T10.

**RF:** RF-11, RF-12, RF-14, RF-15.

- [ ] Escriure primer els tests de les regles bàsiques de RF.
- [ ] Aplicar la detecció de candidats definida per RF-11.
- [ ] Generar error per candidat amb format invàlid.
- [ ] Generar error si no existeix cap RF reconegut.
- [ ] Generar error per RF reconegut amb contingut buit.

**Fet quan:**

Els tests demostren explícitament:

- candidat vàlid sense error de format;
- `RF-0` genera error;
- `RF-01` genera error;
- `RF1` genera error;
- `RF-A` genera error;
- `REQ-1` no genera error perquè no és candidat;
- absència total de RF reconeguts genera error;
- `- RF-1:` genera error de contingut buit.

---

## T12 — Validar duplicats i numeració

**Dependències:** T2, T10.

**RF:** RF-13, RF-16, RF-17, RF-18.

- [ ] Escriure primer els tests.
- [ ] Detectar identificadors RF duplicats.
- [ ] Eliminar duplicats abans d'analitzar la seqüència.
- [ ] Ordenar els identificadors pel valor numèric.
- [ ] Detectar si el primer valor és diferent d'1.
- [ ] Detectar cada salt independent de numeració.

**Fet quan:**

Els tests cobreixen:

- seqüència `1,2,3`;
- RF duplicat;
- primer RF diferent d'1;
- un salt;
- diversos salts;
- duplicat combinat amb salts.

---

# Fase E — Qualitat determinista

## T13 — Detectar `[NECESSITA ACLARACIÓ]`

**Dependències:** T2, T7.

**RF:** RF-19, RF-20.

- [ ] Escriure primer els tests.
- [ ] Buscar el marcador sobre tot el document.
- [ ] Ignorar majúscules/minúscules.
- [ ] No detectar-lo dins de blocs de codi.
- [ ] Generar l'error corresponent.

**Fet quan:**

Els tests demostren que:

- el marcador literal genera error;
- una variant de capitalització genera error;
- el marcador dins d'un bloc de codi no genera error.

---

## T14 — Detectar termes vagues

**Dependències:** T2, T10.

**RF:** RF-21, RF-22.

- [ ] Escriure primer els tests.
- [ ] Implementar exactament el catàleg tancat de la SPEC.
- [ ] Ignorar majúscules/minúscules.
- [ ] Cercar paraules o expressions completes.
- [ ] Evitar coincidències parcials.
- [ ] Generar un warning per cada terme vague diferent dins d'un RF.
- [ ] No duplicar el warning quan el mateix terme apareix diverses vegades al mateix RF.

**Fet quan:**

Els tests cobreixen:

- cadascun dels termes del catàleg;
- un terme;
- diversos termes diferents;
- terme repetit;
- majúscules/minúscules;
- no coincidència parcial.

---

## T15 — Validar patrons EARS

**Dependències:** T2, T10.

**RF:** RF-23, RF-24 parcial.

- [ ] Escriure primer els tests.
- [ ] Reconèixer `QUAN <text> EL SISTEMA <text>`.
- [ ] Reconèixer `SI <text> EL SISTEMA <text>`.
- [ ] Reconèixer `MENTRE <text> EL SISTEMA <text>`.
- [ ] Reconèixer `EL SISTEMA <text>`.
- [ ] Exigir contingut no buit als fragments obligatoris.
- [ ] Generar warning quan cap patró encaixi.
- [ ] No introduir cap altra valoració semàntica.

**Fet quan:**

Els tests cobreixen:

- els quatre patrons vàlids;
- fragments obligatoris buits;
- contingut que no encaixa amb cap patró;
- un RF semànticament estrany però sintàcticament vàlid no genera una incidència semàntica addicional.

---

## T16 — Verificar els límits de la validació

**Dependències:** T14, T15.

**RF:** RF-24, RF-25.

- [ ] Escriure tests específics dels límits funcionals.
- [ ] Verificar que no existeixen regles semàntiques no especificades.
- [ ] Verificar que la validació funciona sense accés a xarxa.
- [ ] Mantenir zero dependències externes de runtime.
- [ ] No introduir IA, LLM ni cap integració amb serveis externs.

**Fet quan:**

- una entrada que compleix les regles sintàctiques però té significat arbitrari no rep incidències semàntiques inventades;
- la validació completa funciona amb l'accés de xarxa bloquejat;
- no existeix cap dependència externa de runtime.

---

# Fase F — Orquestració

## T17 — Orquestrar la validació d'una spec

**Dependències:** T6, T9, T11, T12, T13, T14, T15, T16.

**RF:** RF-26, RF-27, RF-29, RF-30, RF-31.

- [ ] Escriure primer tests d'integració d'una spec.
- [ ] Gestionar el resultat de lectura.
- [ ] Per una spec buida, generar únicament l'error corresponent.
- [ ] Per una spec no llegible, generar únicament l'error corresponent.
- [ ] Per una spec normal, executar totes les regles aplicables.
- [ ] Acumular totes les incidències generades.
- [ ] Calcular `FAIL`, `WARN` o `OK`.

**Fet quan:**

Els tests demostren:

- spec `OK`;
- spec només amb warnings → `WARN`;
- spec amb almenys un error → `FAIL`;
- acumulació simultània de diversos errors i warnings;
- spec buida → una única incidència;
- spec no llegible → una única incidència.

---

## T18 — Orquestrar la validació del projecte

**Dependències:** T4, T5, T17.

**RF:** RF-4, RF-28, RF-33, RF-35, RF-36.

**Suport per:** RF-34.

- [ ] Escriure primer tests d'integració de projecte.
- [ ] Processar totes les specs descobertes.
- [ ] Continuar després d'una spec buida o no llegible.
- [ ] Acumular incidències `project` i resultats de specs.
- [ ] Comptar totes les specs processades.
- [ ] Incloure specs buides i no llegibles al comptador.
- [ ] Calcular l'estat global.
- [ ] Gestionar el cas zero specs.

**Fet quan:**

Els tests cobreixen:

- diverses specs correctes;
- spec defectuosa seguida d'una spec correcta;
- projecte `OK`;
- projecte `WARN`;
- projecte `FAIL`;
- zero specs;
- comptador que inclou specs defectuoses.

---

# Fase G — Garanties i interfície

## T19 — Garantir que la validació no modifica fitxers

**Dependències:** T18.

**RF:** RF-38.

- [ ] Escriure primer el test de no modificació.
- [ ] Preparar un projecte amb múltiples specs.
- [ ] Capturar-ne el contingut abans de validar.
- [ ] Executar la validació.
- [ ] Comparar el contingut després de validar.

**Fet quan:**

Els tests demostren que cap fitxer del projecte analitzat és modificat durant la validació.

---

## T20 — Implementar la CLI mínima

**Dependències:** T18.

**RF:** RF-32, RF-34, RF-36, RF-37.

**Suport per:** RF-31, RF-33.

- [ ] Escriure primer tests del flux CLI.
- [ ] Permetre indicar el projecte que s'ha de validar.
- [ ] Invocar el core sense duplicar-hi regles de validació.
- [ ] Mostrar cada spec i el seu estat.
- [ ] Mostrar les incidències associades.
- [ ] Mostrar el resum global:
  - specs processades;
  - errors;
  - warnings;
  - estat global.
- [ ] Respectar l'ordre de specs definit per RF-37.
- [ ] Mostrar correctament el cas zero specs.

**Fet quan:**

Una execució observable permet veure:

- specs processades;
- estat de cada spec;
- incidències;
- nombre total d'errors;
- nombre total de warnings;
- estat global;

i la CLI no conté lògica de validació pròpia.

---

# Fase H — Traçabilitat i validació final

## T21 — Completar la matriu RF → tests

**Dependències:** T19, T20.

**RF:** RF-1 → RF-38.

- [ ] Revisar cada RF de `spec.md`.
- [ ] Identificar almenys un test automatitzat que demostri el comportament.
- [ ] Registrar explícitament la relació RF → test.
- [ ] Detectar qualsevol RF sense cobertura.
- [ ] Afegir només els tests que faltin, sense modificar els requisits per adaptar-los al codi.

**Fet quan:**

Els 38 RF tenen almenys un test automatitzat identificat.

No queda cap RF amb cobertura assumida o implícita.

---

## T22 — Executar la validació automatitzada final

**Dependències:** T21.

**RF:** RF-1 → RF-38.

- [ ] Executar tota la suite.
- [ ] Confirmar que no hi ha tests fallits.
- [ ] Revisar la matriu RF → tasques.
- [ ] Revisar la matriu RF → tests.
- [ ] Confirmar que no hi ha funcionalitats implementades fora de SPEC-001.
- [ ] Confirmar que `spec.md` i `plan.md` no s'han modificat per adaptar-los a la implementació.

**Fet quan:**

- tota la suite passa;
- RF-1 → RF-38 tenen tasca;
- RF-1 → RF-38 tenen test;
- no existeix funcionalitat fora d'abast introduïda accidentalment.

---

## T23 — Executar la prova manual final

**Dependències:** T22.

**RF:** validació dels criteris de finalització de SPEC-001.

- [ ] Preparar un projecte SDD d'exemple amb:
  - una spec `OK`;
  - una spec `WARN`;
  - una spec `FAIL`.
- [ ] Documentar abans d'executar:
  - nombre de specs esperat;
  - errors esperats;
  - warnings esperats;
  - estat de cada spec;
  - estat global esperat.
- [ ] Executar SpecLord.
- [ ] Comparar resultat real i esperat.
- [ ] Revisar els vuit criteris de finalització de `spec.md`.

**Fet quan:**

- els comptadors reals coincideixen exactament amb els esperats;
- els estats de cada spec coincideixen amb els esperats;
- l'estat global coincideix;
- els vuit criteris de finalització de SPEC-001 estan satisfets.

---

# Ordre de dependències

```text
T1
├── T2
│   ├── T3
│   │   ├── T4
│   │   ├── T5
│   │   └── T6
│   │
│   └──────────────────────────────┐
│                                  │
└── T7                             │
    ├── T8                         │
    │   ├── T9                     │
    │   └── T10                    │
    │       ├── T11                │
    │       ├── T12                │
    │       ├── T14                │
    │       └── T15                │
    │            │                 │
    │           T16                │
    │                              │
    └── T13                        │
                                   │
T6 + T9 + T11 + T12 + T13 + T14 + T15 + T16
                    │
                   T17
                    │
             T4 + T5 + T17
                    │
                   T18
                 ┌──┴──┐
                 │     │
                T19   T20
                 └──┬──┘
                    │
                   T21
                    │
                   T22
                    │
                   T23
```

---

# Matriu de traçabilitat RF → tasques

| RF | Tasca principal |
|---|---|
| RF-1 | T3 |
| RF-2 | T4 |
| RF-3 | T4 |
| RF-4 | T3, T18 |
| RF-5 | T4 |
| RF-6 | T9 |
| RF-7 | T9 |
| RF-8 | T9 |
| RF-9 | T9 |
| RF-10 | T9 |
| RF-11 | T11 |
| RF-12 | T11 |
| RF-13 | T12 |
| RF-14 | T11 |
| RF-15 | T11 |
| RF-16 | T12 |
| RF-17 | T12 |
| RF-18 | T12 |
| RF-19 | T13 |
| RF-20 | T13 |
| RF-21 | T14 |
| RF-22 | T14 |
| RF-23 | T15 |
| RF-24 | T15, T16 |
| RF-25 | T16 |
| RF-26 | T6, T17 |
| RF-27 | T6, T17 |
| RF-28 | T18 |
| RF-29 | T17 |
| RF-30 | T17 |
| RF-31 | T17 |
| RF-32 | T20 |
| RF-33 | T18 |
| RF-34 | T20 |
| RF-35 | T18 |
| RF-36 | T4, T18, T20 |
| RF-37 | T5, T20 |
| RF-38 | T19 |

---

# Criteri de finalització de TASKS-001

Aquest conjunt de tasques es considera complet només quan:

1. T1 → T23 estan completades.
2. RF-1 → RF-38 tenen almenys una tasca associada.
3. RF-1 → RF-38 tenen almenys un test automatitzat associat.
4. Tota la suite passa.
5. La prova manual final coincideix exactament amb els resultats documentats abans de l'execució.
6. Cap fitxer del projecte analitzat és modificat per SpecLord.
7. No s'ha implementat funcionalitat fora de l'abast de SPEC-001.
8. `spec.md` i `plan.md` no han estat reinterpretats ni modificats per adaptar-los a la implementació.
