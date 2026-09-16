# DCF-11 v1.0 — Política de duplicats d'estacions

**Data:** 2026-09-16
**SPEC afectada:** SPEC-06 v0.5
**Estat:** RESOLT
**Data de ratificació:** 2026-09-16
**Ratificat per:** Oriol
**Àmbit:** identitat, deduplicació i representació pública d'estacions
**Dependències:** DCF-02, DCF-03, DCF-08 i DCF-09
**No selecciona:** algoritme concret de matching, motor cartogràfic, clustering, esquema SQL o tecnologia d'indexació.

---

# 1. Resum executiu

DCF-11 separa tres conceptes diferents:

```text
DUPLICAT
= dos registres que representen la mateixa estació

PROPER / COLOCALITZAT
= dues estacions diferents espacialment properes

AGRUPACIÓ VISUAL
= mecanisme de presentació per evitar solapament
```

La proximitat, el mateix nom, el mateix propietari o unes coordenades iguals **NO són prova suficient de duplicació**.

Una estació només es col·lapsa quan existeix una identitat comuna confirmada mitjançant identificador autoritatiu, mapping explícit o revisió administrativa.

Els duplicats confirmats es representen públicament mitjançant **una única estació canònica**, sense fusionar observacions de fonts diferents.

`INTERNAL_ONLY` queda completament fora del càlcul i de qualsevol senyal públic de deduplicació.

Aquesta política permet superar CA-MAP-10.

---

# 2. Model conceptual

## 2.1 Tres relacions diferents

### A. `SAME_STATION`

Dos registres representen la mateixa estació física/lògica.

Exemple:

```text
registre MeteoLord A
registre importat B
    ↓
tots dos representen el mateix dispositiu/estació
```

Resultat públic:

```text
1 estació canònica
```

### B. `NEARBY`

Dues estacions diferents estan espacialment properes.

Exemple:

```text
Ecowitt habitatge A
Ecowitt habitatge B
distància = 15 m
```

Resultat:

```text
2 estacions
```

### C. `VISUAL_GROUP`

Dues o més estacions públiques diferents no es poden representar clarament al nivell de vista actual.

Resultat:

```text
agrupació visual
```

sense alterar la seva identitat.

---

# 3. Contracte de deduplicació

Cada relació de deduplicació confirmada HA DE poder expressar conceptualment:

```text
duplicate_group_id
canonical_station_id

member_station_ids

relation:
    SAME_STATION

decision_basis
decision_version

decided_at
decided_by
```

Els candidats poden tenir:

```text
duplicate_status:
    NONE
    CANDIDATE
    CONFIRMED
```

`CANDIDATE` NO modifica el catàleg públic.

Només:

```text
CONFIRMED
```

pot provocar la supressió d'una representació duplicada.

---

# 4. Regla pública fonamental

Per cada grup confirmat:

```text
PUBLIC_REPRESENTATION(duplicate_group)
    = canonical_station
```

Els membres no canònics:

```text
NO apareixen com a marcador independent
NO apareixen com a fila independent
NO apareixen com a resultat independent de cerca
NO apareixen al sitemap
NO apareixen als comptadors públics
NO apareixen com a estació independent a l'API pública
```

Les observacions NO es fusionen automàticament.

---

# 5. A — Definició de duplicat

## Q1. Què és un duplicat?

**Estat: `MODIFICAR`**

### Resposta

Un duplicat és:

> dos o més registres del catàleg que s'ha confirmat que identifiquen la mateixa estació física/lògica.

NO és suficient:

```text
mateixa coordenada
mateix edifici
mateix propietari
mateix nom
proximitat espacial
mateixes variables
```

### Evidència forta admissible

Per exemple:

```text
mateixa font
+ mateix identificador extern immutable
+ contracte de la font garanteix unicitat
```

o:

```text
mapping explícit aprovat
entre dos identificadors de fonts diferents
```

o:

```text
revisió administrativa documentada
```

### Justificació

OGC SensorThings diferencia `Thing`, `Location`, `Sensor`, `Datastream` i `Observation`: compartir una ubicació no fa que dos sensors o Things siguin la mateixa entitat.

W3C també adverteix que dues identificacions només s'han de declarar equivalents quan realment representen el mateix recurs i no simplement recursos semblants.

### Risc

Fer:

```text
distance < X -> duplicate
```

pot eliminar legítimament dues estacions diferents instal·lades al mateix lloc.

---

## Q2. Quin és el llindar de proximitat?

**Estat: `MODIFICAR`**

### Resposta

**No existeix un llindar de metres que determini que dues estacions són duplicades.**

Per tant, s'elimina com a regla normativa:

```text
< 10 m
< 50 m
< 100 m
< 500 m
```

### Regla

La proximitat només pot produir:

```text
DUPLICATE_CANDIDATE
```

mai:

```text
CONFIRMED_DUPLICATE
```

### Recomanació

El PLAN o SPEC de catàleg pot usar una heurística espacial per generar candidats de revisió, però aquesta heurística:

* no és autoritativa;
* no oculta estacions;
* no fusiona dades;
* no afecta el catàleg públic fins que hi hagi confirmació.

### Risc

DCF-08 introdueix geometries aproximades; dues coordenades públiques iguals poden ser únicament conseqüència de la generalització de privacitat.

Per això seria especialment incorrecte usar distància pública per deduir identitat.

---

## Q3. El llindar és el mateix per tots els tipus?

**Estat: `MODIFICAR`**

### Resposta

No aplica perquè **no existeix un llindar normatiu de duplicació**.

Les fonts poden tenir heurístiques de detecció diferents, però la decisió final continua basada en identitat.

---

# 6. B — Detecció

## Q4. Com es detecten?

**Estat: `CONFIRMAT` amb modificació**

### Resposta

Per ordre de força de l'evidència.

### Nivell 1 — identitat autoritativa

```text
source
+
external_station_id
```

quan el contracte de la font garanteix que l'identificador és únic i estable.

Pot confirmar automàticament una duplicació dins la mateixa font.

### Nivell 2 — mapping explícit entre fonts

```text
source_A/id_A
    SAME_STATION
source_B/id_B
```

requereix una relació aprovada.

### Nivell 3 — heurístiques

```text
nom semblant
proximitat
mateixa organització
metadades similars
```

només creen:

```text
CANDIDATE
```

### Regla

Un nom o coordenades mai confirmen automàticament una equivalència.

### Risc

Falsos positius.

---

## Q5. Amb quina freqüència es comprova?

**Estat: `MODIFICAR`**

### Resposta

No requereix un cron periòdic normatiu.

S'ha de reavaluar quan hi hagi un esdeveniment que pugui canviar la identitat:

```text
alta d'estació
importació d'estació externa
canvi d'identificador extern
canvi de mapping de font
canvi de duplicate_group
publicació d'un nou registre
```

### Recomanació

Opcionalment es pot executar una auditoria periòdica, però no forma part del contracte funcional de SPEC-06.

---

## Q6. Qui decideix si són duplicats reals?

**Estat: `CONFIRMAT`**

### Resposta

Es defineix el capability:

```text
STATION_IDENTITY_REVIEWER
```

La implementació concreta del rol correspon a SPEC-09.

Amb el contracte actual de SPEC-00, aquest capability encaixa amb `SUPERADMIN`, que ja pot crear, editar i corregir estacions i metadades i existeix un requisit de traçabilitat administrativa.

### Excepció

Una coincidència exacta del mateix identificador autoritatiu pot ser considerada determinista si el contracte de la font en garanteix la unicitat.

### Risc

No s'ha de permetre que un usuari normal declari unilateralment una estació aliena com a duplicada.

---

# 7. C — Prioritat i estació canònica

## Q7. Quina estació es mostra?

**Estat: `MODIFICAR`**

### Resposta

No s'escull automàticament:

```text
la més antiga
la més propera
la de millor qualitat avui
la d'un tipus de font concret
```

El grup HA DE tenir explícitament:

```text
canonical_station_id
```

### Criteri de selecció

Quan ja existeix una identitat pública estable, s'ha de **preservar preferentment aquella identitat** per evitar canvis innecessaris de URL i identificadors.

Si no existeix una canònica prèvia, `STATION_IDENTITY_REVIEWER` n'assigna una basant-se en:

```text
procedència
contracte de publicació
estabilitat de l'identificador
completesa de metadades
```

i la decisió queda auditada.

### Justificació

W3C recomana identificadors persistents per als recursos espacials perquè els enllaços i referències siguin durables.

### Risc

Canviar la canònica segons qualitat temporal provocaria URLs i identitats inestables.

---

## Q8. Es mostra l'altra estació?

**Estat: `MODIFICAR`**

### Resposta

No com a estació pública separada.

A l'MVP:

```text
alias duplicat
-> no exposat públicament
```

No apareix com:

* marcador;
* cerca;
* llista;
* comptador;
* sitemap;
* fitxa independent.

### Justificació

L'objectiu de DCF-11 és precisament evitar que una única estació aparegui dues vegades.

### Risc

Exposar «aquesta estació existeix també a la font X» podria revelar metadades que no tinguin classificació pública pròpia.

---

## Q9. Es poden fusionar visualment?

**Estat: `CONFIRMAT`**

### Resposta

Sí en el sentit de representar el grup mitjançant **una única estació canònica**.

No en el sentit de barrejar dades.

```text
identitat -> unificada
observacions -> NO fusionades
```

### Contracte

La fitxa mostra les dades de la font/registre canònic.

Una política futura de fusió multi-font requeriria una DCF pròpia.

---

# 8. D — Visualització

## Q10. Com es mostren estacions properes?

**Estat: `CONFIRMAT` — DCF-08**

### Resposta

Si són estacions diferents:

```text
continuen sent estacions diferents
```

DCF-08 pot agrupar-les visualment quan la densitat o solapament dificulti la interacció.

El clustering NO és deduplicació.

### Regla

L'ordre és:

```text
deduplicació
    ↓
conjunt d'estacions canòniques
    ↓
clustering/presentació
```

No:

```text
clustering
    ↓
deduir duplicats
```

---

## Q11. A quin zoom es desclusten?

**Estat: `MODIFICAR`**

### Resposta

DCF-11 no fixa cap nivell de zoom.

Ho regula DCF-08/PLAN-06 segons col·lisió visual i operabilitat.

Una decisió d'identitat no pot dependre del zoom.

---

## Q12. Com es mostren estacions superposades?

**Estat: `CONFIRMAT`**

### Cas 1 — `SAME_STATION`

Només la canònica.

### Cas 2 — estacions diferents amb mateixa geometria pública

Totes continuen existint i han de ser enumerables mitjançant el mecanisme visual definit a DCF-08.

### Justificació

Una mateixa geometria pública pot derivar de l'aproximació de privacitat i no és evidència d'identitat.

---

# 9. E — Fitxa

## Q13. Què mostra la fitxa d'una estació duplicada?

**Estat: `CONFIRMAT`**

### Resposta

Només existeix fitxa pública de:

```text
canonical_station_id
```

La fitxa mostra:

```text
dades pròpies del registre canònic
```

NO:

```text
fusió automàtica de registres
mitjana entre fonts
fallback de fonts
combinació d'històrics
```

### Risc

Fusionar fonts sense contracte pot barrejar freqüències, qualitats, unitats o llicències diferents.

---

## Q14. Com s'indica que hi ha una altra estació propera?

**Estat: `MODIFICAR`**

### Resposta

Només quan realment sigui **una altra estació pública distinta**.

Es pot mostrar:

```text
Estacions properes
```

utilitzant exclusivament estacions `PUBLIC_ALLOWED`.

Un alias `SAME_STATION` no apareix com a estació propera.

### Important

`INTERNAL_ONLY` NO participa en aquesta funcionalitat.

---

# 10. F — Estacions del mateix propietari

## Q15. Si un usuari té dues estacions al mateix lloc?

**Estat: `MODIFICAR — FORA D'ABAST ACTUAL`**

### Resposta

La SPEC-00 disponible diu explícitament que:

```text
més d'una estació per usuari normal
```

està fora de l'abast inicial.

Per tant, DCF-11 NO ha d'introduir aquesta funcionalitat.

### Regla futura

Si SPEC-03 habilita multiestació:

```text
mateix propietari
+ mateixa ubicació
!= duplicat
```

Dues estacions físiques diferents continuen sent dues estacions.

---

## Q16. Es recomana fusionar-les?

**Estat: `MODIFICAR`**

### Resposta

No.

La fusió només és admissible si:

```text
SAME_STATION
```

queda confirmat.

El fet de compartir propietari no justifica fusionar observacions.

---

# 11. G — Casos especials

## Q17. Una duplicada és INTERNAL_ONLY

**Estat: `CONFIRMAT`**

### Resposta

`INTERNAL_ONLY` queda fora del càlcul públic.

Exemple:

```text
A = PUBLIC_ALLOWED
B = INTERNAL_ONLY
mateixa estació física
```

Resultat públic:

```text
A
```

No es mostra:

```text
"B té un duplicat"
"2 fonts"
"1 estació oculta"
```

B no participa en:

* clustering públic;
* comptadors;
* cerca;
* informació de proximitat;
* sitemap;
* API pública.

### Justificació

SPEC-06 exigeix que cap superfície pugui revelar l'existència d'elements `INTERNAL_ONLY`.

---

## Q18. Una duplicada està `EN_REVISIO`

**Estat: `CONFIRMAT`**

### Resposta

La política de qualitat DCF-03 s'aplica independentment de la deduplicació.

Si la canònica està `EN_REVISIO`, conserva el comportament públic establert per DCF-03.

NO s'ha de canviar automàticament a una font duplicada alternativa.

```text
quality problem
!= permission for source failover
```

### Risc

Canviar de font automàticament podria convertir DCF-11 en un sistema de fusió/failover no especificat.

---

## Q19. Una estació duplicada es despublica

**Estat: `CONFIRMAT`**

### Resposta

La despublicació té prioritat.

Si es despublica una alias no canònica:

```text
la canònica no canvia
```

Si es despublica la canònica:

```text
NO hi ha promoció automàtica d'una alias
```

Una altra estació del grup només pot convertir-se en canònica si:

1. és independentment `PUBLIC_ALLOWED`;
2. els seus gates de consentiment/llicència són vàlids;
3. s'aprova la nova canònica.

Fins aleshores:

```text
fail-closed
```

### Efectes

Una recanonicalització HA DE:

```text
incrementar catalog_version
invalidar caches
actualitzar cerca
actualitzar sitemap
actualitzar API pública
```

### Risc

Un fallback automàtic podria esquivar una revocació de consentiment.

---

# 12. H — Administració

## Q20. Qui pot marcar una estació com a duplicada?

**Estat: `CONFIRMAT`**

### Resposta

Capability:

```text
STATION_IDENTITY_REVIEWER
```

Actualment compatible amb `SUPERADMIN` segons la SPEC-00 disponible.

SPEC-09 definirà la correspondència final de rols i UI administrativa.

---

## Q21. Com es revoca la marca?

**Estat: `CONFIRMAT`**

### Resposta

Mitjançant una nova decisió administrativa:

```text
CONFIRMED SAME_STATION
    ↓
relation revoked
    ↓
records independent again
```

Sempre que cadascun compleixi independentment els seus gates de publicació.

La revocació:

```text
incrementa catalog_version
invalida caches
recalcula superfícies públiques
```

No s'esborra l'històric de la decisió.

---

## Q22. Es guarda auditoria?

**Estat: `CONFIRMAT`**

### Resposta

Sí.

Com a mínim:

```text
duplicate_group_id
member_station_ids
previous_relation
new_relation

canonical_station_id
decision_basis

actor_or_capability
timestamp
decision_version
reason
```

L'auditoria és:

```text
INTERNAL_ONLY
```

### Justificació

La SPEC-00 ja exigeix traçabilitat administrativa.

---

# 13. I — Impacte en altres funcionalitats

## Q23. Afecta la cerca?

**Estat: `CONFIRMAT`**

### Resposta

Sí.

La cerca pública retorna una sola entrada:

```text
canonical_station
```

Els aliases no són resultats separats.

### Regla

Les dades `INTERNAL_ONLY` tampoc poden ser sinònims de cerca ni influir el ranking.

---

## Q24. Afecta els filtres?

**Estat: `CONFIRMAT`**

### Resposta

Sí.

Els filtres operen sobre:

```text
canonical public station
```

i sobre els seus camps públics.

No s'ha de construir un «superregistre» amb:

```text
camps font A
+
camps font B
```

sense una futura política de fusió.

---

## Q25. Afecta el sitemap?

**Estat: `CONFIRMAT`**

### Resposta

Sí.

Per cada grup de duplicats confirmats:

```text
1 canonical URL
```

Els aliases:

```text
NO apareixen al sitemap
```

Això és coherent amb RF-MAP-18/19, que limiten el sitemap a fitxes públiques.

---

## Q26. Afecta l'API pública?

**Estat: `CONFIRMAT`**

### Resposta

Sí.

Els endpoints de col·lecció retornen únicament:

```text
canonical public stations
```

Els identificadors no canònics no són enumerables.

Per defecte, una petició pública directa a un alias suprimit respon:

```http
404 Not Found
```

i no revela:

```text
duplicate_group_id
canonical internal relation
existència d'aliases interns
```

### Persistència d'identificador

Quan es resol un grup entre registres que ja han estat públics, s'ha de preservar com a canònica l'URL/identitat pública existent sempre que sigui possible per evitar trencar enllaços.

---

# 14. J — Coordinació amb altres SPEC

## Q27. SPEC-02 — Estacions

**Estat: `CONFIRMAT` conceptualment**

### Responsabilitat proposada

SPEC-02 ha de ser propietària de la identitat de l'estació i de:

```text
station_id
external_station_id
source
duplicate_group_id
canonical_station_id
identity relation
```

SPEC-06 només consumeix:

```text
canonical public catalog
```

### Limitació documental

No he localitzat una SPEC-02 completa entre els fitxers accessibles; aquesta interfície és, per tant, la dependència que DCF-11 exigeix i no una afirmació sobre una SPEC-02 ja aprovada.

---

## Q28. SPEC-03 — Ecowitt multiestació

**Estat: `MODIFICAR`**

### Resposta

La baseline disponible de SPEC-00 encara exclou més d'una estació per usuari normal.

Quan SPEC-03 habiliti multiestació, HA DE respectar:

```text
same owner != duplicate
same location != duplicate
same external authoritative station id -> possible SAME_STATION
```

### Responsabilitat

SPEC-03 gestiona:

```text
quantes estacions Ecowitt té l'usuari
alta
configuració
source IDs
```

DCF-11 només resol la identitat pública entre registres.

---

## Q29. SPEC-09 — Administració

**Estat: `CONFIRMAT` conceptualment**

### Responsabilitat proposada

SPEC-09 ha de materialitzar:

```text
STATION_IDENTITY_REVIEWER
cua de candidats
confirmació
revocació
selecció de canonical_station_id
auditoria
```

SPEC-06 no implementa aquesta UI administrativa.

La baseline de SPEC-00 ja atribueix al `SUPERADMIN` la gestió global i correcció de metadades d'estació.

No he localitzat una SPEC-09 completa accessible; per tant, DCF-11 defineix el contracte que aquesta haurà de consumir.

---

# 15. Regles de decisió consolidades

L'ordre de processament HA DE ser conceptualment:

```text
registres de catàleg
        |
        v
DCF-02 / DCF-09
PUBLIC_ALLOWED únicament
        |
        v
identitat d'estació
        |
        +--> DISTINCT
        |
        +--> CANDIDATE
        |
        +--> SAME_STATION CONFIRMED
                    |
                    v
             canonical_station
                    |
                    v
         conjunt públic deduplicat
                    |
                    v
            DCF-08 clustering
                    |
                    v
       mapa / llista / cerca / API
```

Important:

```text
INTERNAL_ONLY
```

no entra en el pipeline públic de deduplicació.

---

# 16. Regles d'evidència

## Pot confirmar automàticament

Només una identitat forta contractualment garantida, per exemple:

```text
mateixa font
AND mateix external_station_id
AND source contract diu que és únic i immutable
```

## Només genera candidat

```text
mateix nom
nom similar
mateix propietari
mateixa ubicació
ubicació propera
mateixes variables
timestamps similars
```

## Requereix revisió

Equivalència entre:

```text
fonts diferents
```

si no existeix un mapping autoritatiu predefinit.

---

# 17. Política de prioritat

No existeix una ordenació global:

```text
MeteoLord > ACA > Ecowitt
```

ni:

```text
més fiable > menys fiable
```

dins DCF-11.

La canònica és una **decisió d'identitat**, no un rànquing de qualitat.

Principis:

1. preservar una identitat pública estable existent;
2. seleccionar un registre amb procedència i dret de publicació vàlids;
3. documentar la decisió;
4. no canviar-la per variacions temporals de qualitat;
5. no barrejar fonts.

---

# 18. Escenaris del context

## Escenari 1 — dos Ecowitt de dos usuaris al mateix edifici

Per defecte:

```text
DISTINCT
```

Encara que tinguin la mateixa `public_geometry`.

Només són duplicats amb evidència que realment representen la mateixa estació.

---

## Escenari 2 — Ecowitt + ACA mateixa ubicació

Per defecte:

```text
DISTINCT
```

Mesuren potencialment fenòmens diferents i tenen identitats/fons diferents.

La co-localització no els fusiona.

---

## Escenari 3 — estació pròpia + usuari propera

```text
DISTINCT
```

La proximitat és només presentacional.

---

## Escenari 4 — diverses estacions del mateix usuari

No forma part de l'abast inicial disponible.

Si una futura SPEC ho habilita:

```text
DISTINCT per defecte
```

---

## Escenari 5 — mateixa estació a múltiples fonts

Pot ser:

```text
SAME_STATION
```

però només després d'establir una equivalència autoritativa.

Resultat:

```text
una canònica
sense fusió automàtica de dades
```

---

# 19. Riscos

| ID         | Risc                                     | Impacte | Mitigació                                |
| ---------- | ---------------------------------------- | ------: | ---------------------------------------- |
| R-DCF11-01 | proximitat interpretada com identitat    |     Alt | cap llindar automàtic de duplicació      |
| R-DCF11-02 | ubicació aproximada crea fals duplicat   |     Alt | coordenada pública no confirma identitat |
| R-DCF11-03 | mateix propietari provoca fusió          |     Alt | propietari no és criteri                 |
| R-DCF11-04 | dades de fonts diferents es fusionen     |  Crític | canònica única, sense data fusion        |
| R-DCF11-05 | INTERNAL_ONLY influeix comptadors        |  Crític | excloure abans de deduplicar públicament |
| R-DCF11-06 | alias intern revelat al modal            |     Alt | aliases no exposats                      |
| R-DCF11-07 | qualitat provoca canvi de canònica       |     Alt | canònica estable                         |
| R-DCF11-08 | despublicació provoca fallback automàtic |  Crític | recanonicalització explícita             |
| R-DCF11-09 | URLs canvien contínuament                |     Alt | preservar identitat pública existent     |
| R-DCF11-10 | candidat es tracta com confirmat         |     Alt | `CANDIDATE` no modifica output           |
| R-DCF11-11 | clustering es confon amb deduplicació    |   Mitjà | executar dedup abans de visualització    |
| R-DCF11-12 | decisió administrativa no auditable      |     Alt | auditoria obligatòria                    |

---

# 20. Canvis proposats a SPEC-06

## §6.1 — substituir el PENDENT de duplicats

Text proposat:

> **Identitat i duplicats**
>
> Un duplicat és un registre addicional que representa la mateixa estació física/lògica. La proximitat, coincidència de coordenades, nom o propietari no és evidència suficient per confirmar duplicació.
>
> No existeix un llindar espacial universal que converteixi dues estacions en duplicades. La proximitat només pot generar candidats a revisió.
>
> Una relació `SAME_STATION` confirmada HA DE disposar d'un `canonical_station_id`. Només l'estació canònica apareix a mapa, llista, cerca, filtres, comptadors, sitemap i API pública.
>
> La deduplicació NO autoritza fusionar observacions o històrics de fonts diferents.
>
> Els registres `INTERNAL_ONLY` queden fora de qualsevol procés públic de deduplicació i no poden afectar marcadors, comptadors, proximitat ni metadades.
>
> Els canvis de canònica o relació de duplicació HAN D'incrementar `catalog_version`, invalidar caches i quedar auditats.
>
> El clustering d'estacions diferents és responsabilitat de DCF-08 i NO altera la seva identitat.

---

# 21. Requisits funcionals proposats

```text
RF-MAP-34
Una relació de duplicació NO POT confirmar-se exclusivament
per proximitat, nom, propietari o coincidència de coordenades.

RF-MAP-35
Cada grup SAME_STATION confirmat HA DE tenir exactament una
canonical_station_id pública.

RF-MAP-36
Només l'estació canònica POT aparèixer com a entitat independent
a mapa, llista, cerca, comptadors, sitemap i API pública.

RF-MAP-37
La deduplicació NO POT fusionar automàticament observacions,
històrics ni camps de fonts diferents.

RF-MAP-38
Els registres INTERNAL_ONLY NO PODEN participar en cap càlcul,
comptador o indicador públic de duplicació/proximitat.

RF-MAP-39
Un DUPLICATE_CANDIDATE NO POT ocultar ni modificar una estació
pública fins que la relació sigui confirmada.

RF-MAP-40
La despublicació de la canònica NO POT provocar fallback
automàtic cap a una altra font del grup.

RF-MAP-41
Qualsevol canvi de relació o canònica HA D'incrementar
catalog_version i invalidar les caches rellevants.
```

---

# 22. CA-MAP-10 — redefinició verificable

Substituir:

```text
Els duplicats d'estacions es mostren segons la política definida.
```

per:

> **CA-MAP-10 — Deduplicació d'estacions**
>
> Amb fixtures sintètiques:
>
> 1. dos registres confirmats `SAME_STATION` produeixen una única estació canònica pública;
> 2. dues estacions diferents a la mateixa coordenada continuen sent dues estacions;
> 3. un `DUPLICATE_CANDIDATE` no suprimeix cap estació;
> 4. un registre `INTERNAL_ONLY` no modifica cap resultat públic;
> 5. no es fusionen dades dels membres del grup;
> 6. la cerca, llista, comptadors, sitemap i API exposen només la canònica;
> 7. despublicar la canònica no promou automàticament cap alias;
> 8. un canvi de canònica incrementa `catalog_version`.

Aquesta formulació converteix CA-MAP-10 en una prova determinista.

---

# 23. Matriu de les 29 decisions

|  Q | Decisió                                                  | Estat                  |
| -: | -------------------------------------------------------- | ---------------------- |
|  1 | duplicat = mateixa identitat, no mateixa ubicació        | `MODIFICAR`            |
|  2 | cap llindar espacial confirma duplicació                 | `MODIFICAR`            |
|  3 | no aplica llindar universal per tipus                    | `MODIFICAR`            |
|  4 | IDs autoritatius + mapping/revisió                       | `CONFIRMAT`            |
|  5 | reavaluació per esdeveniment                             | `MODIFICAR`            |
|  6 | `STATION_IDENTITY_REVIEWER`                              | `CONFIRMAT`            |
|  7 | canònica explícita i estable                             | `MODIFICAR`            |
|  8 | aliases no es mostren separadament                       | `MODIFICAR`            |
|  9 | identitat sí; dades no es fusionen                       | `CONFIRMAT`            |
| 10 | proximitat → DCF-08/clustering                           | `CONFIRMAT`            |
| 11 | cap zoom normatiu                                        | `MODIFICAR`            |
| 12 | distintes superposades continuen enumerables             | `CONFIRMAT`            |
| 13 | fitxa canònica amb dades pròpies                         | `CONFIRMAT`            |
| 14 | només estacions distintes poden aparèixer com «properes» | `MODIFICAR`            |
| 15 | multiestació mateix usuari fora d'abast actual           | `MODIFICAR`            |
| 16 | no fusionar per propietari                               | `MODIFICAR`            |
| 17 | INTERNAL_ONLY ignorada completament                      | `CONFIRMAT`            |
| 18 | EN_REVISIO no provoca canvi de font                      | `CONFIRMAT`            |
| 19 | despublicació sense fallback automàtic                   | `CONFIRMAT`            |
| 20 | reviewer/admin                                           | `CONFIRMAT`            |
| 21 | relació reversible                                       | `CONFIRMAT`            |
| 22 | auditoria obligatòria                                    | `CONFIRMAT`            |
| 23 | cerca només canònica                                     | `CONFIRMAT`            |
| 24 | filtres només sobre canònica                             | `CONFIRMAT`            |
| 25 | sitemap només canònica                                   | `CONFIRMAT`            |
| 26 | API només canònica                                       | `CONFIRMAT`            |
| 27 | SPEC-02 propietària de la identitat                      | `CONFIRMAT` conceptual |
| 28 | SPEC-03 ha de respectar aquesta política                 | `MODIFICAR`            |
| 29 | SPEC-09 implementa revisió/auditoria                     | `CONFIRMAT` conceptual |

No queda cap decisió funcional de DCF-11 que PLAN-06 hagi d'inventar.

---

# 24. Estat final proposat

```text
DCF-11 = RESOLT
```

després de ratificar aquest document.

Això desbloqueja:

```text
CA-MAP-10
```

i elimina DCF-11 com a gate de PLAN-06.

La correcció principal respecte del text anterior de SPEC-06 és substituir:

```text
cal definir un llindar de proximitat
```

per:

```text
la proximitat només genera candidats;
la identitat confirmada determina duplicació.
```

Aquesta modificació és intencionada: un llindar de metres no és un mecanisme fiable d'entity resolution.

---

# 25. Text de ratificació proposat

> Es ratifica DCF-11 v1.0 com a contracte normatiu de deduplicació d'estacions de SPEC-06.
>
> Una estació només es considera duplicada quan dos o més registres representen la mateixa estació física/lògica mitjançant evidència d'identitat autoritativa o una decisió de revisió aprovada. La proximitat, coincidència de coordenades, propietari o nom no són criteris suficients per confirmar una duplicació.
>
> Cada grup `SAME_STATION` confirmat disposa d'una única `canonical_station_id`, que és l'única representació independent del grup a les superfícies públiques.
>
> La deduplicació no autoritza la fusió d'observacions ni d'històrics de fonts diferents. Les estacions diferents però espacialment properes continuen sent entitats diferents i la seva agrupació visual correspon a DCF-08.
>
> Els elements `INTERNAL_ONLY` queden fora de qualsevol càlcul o senyal públic relacionat amb duplicació o proximitat.
>
> Les decisions de deduplicació i recanonicalització són auditables, incrementen `catalog_version` quan afecten el conjunt públic i no poden esquivar una despublicació mitjançant fallback automàtic.
>
> DCF-11 passa a estat `RESOLT` i CA-MAP-10 queda especificat de manera verificable.

---
## 25bis. Acte de ratificació

El 2026-09-16, Oriol ratifica DCF-11 v1.0 com a contracte normatiu
de deduplicació d'estacions de SPEC-06.

**DCF-11 queda RESOLT amb les decisions següents:**
- un duplicat és dos o més registres que identifiquen la mateixa
  estació física/lògica, no dues estacions properes;
- cap llindar espacial confirma duplicació; la proximitat només genera
  candidats a revisió;
- cada grup `SAME_STATION` confirmat té una única `canonical_station_id`
  pública;
- només la canònica apareix a mapa, llista, cerca, comptadors, sitemap
  i API pública;
- la deduplicació no autoritza fusionar observacions o històrics de
  fonts diferents;
- INTERNAL_ONLY queda fora de qualsevol càlcul públic de deduplicació;
- la despublicació de la canònica no provoca fallback automàtic;
- canvis de canònica incrementen `catalog_version` i queden auditats.

`CA-MAP-10` queda especificat de manera verificable amb 8 condicions
executables.

Aquesta ratificació NO autoritza:
- deducció automàtica de duplicats per proximitat;
- fusió de fonts sense contracte;
- exposició d'aliases interns;
- fallback automàtic davant despublicació.

MAP-A continua limitat a fixtures sintètiques.


# 26. Referències

## Projecte

SPEC-06 exigeix una política de duplicats a RF-MAP-16, manté `INTERNAL_ONLY` fora de totes les superfícies i identifica els duplicats visibles com un risc del mapa.
DCF-06 defineix el catàleg fail-closed, `catalog_version` i la invalidació de caches necessària quan canvia el conjunt públic.

La SPEC-00 disponible defineix identificador intern estable, identificador extern opcional, `SUPERADMIN` amb capacitat de gestió global i traçabilitat administrativa, i exclou inicialment més d'una estació per usuari normal.
No s'han localitzat versions completes de SPEC-02, SPEC-03 o SPEC-09 entre els materials accessibles; les seccions de coordinació d'aquest document defineixen, per tant, els contractes que aquestes SPEC haurien de satisfer, no requisits ja confirmats per elles.

## Estàndards externs

W3C Spatial Data on the Web Best Practices recomana identificadors persistents per a les entitats espacials i adverteix explícitament que una equivalència només s'ha d'afirmar quan dos identificadors representen realment el mateix recurs, no recursos merament semblants.

W3C Data on the Web Best Practices recomana identificadors persistents per mantenir la identificació i les referències al llarg del temps.

OGC SensorThings modela separadament `Thing`, `Location`, `Sensor`, `Datastream` i `Observation`, reforçant que compartir ubicació no implica compartir identitat.
