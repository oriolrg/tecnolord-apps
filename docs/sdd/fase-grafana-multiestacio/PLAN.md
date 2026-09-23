Continuem el projecte **MeteoLord**.

La integració base Grafana ja està desenvolupada i validada fins a G06. Abans d'executar aquest paquet, comprova que G07 estigui PASS o, si encara no s'ha executat, considera G01–G06 com la baseline funcional i NO la redissenyis.

Ara vull ampliar la integració des d'una única estació/temperatura fins al conjunt d'estacions disponibles al dashboard Grafana i les variables meteorològiques útils.

## OBJECTIU FINAL

Arribar a:

```text
Dashboard Grafana Vall de Lord
        ↓
inventari real de sensors
        ↓
identificació amb catàleg conegut
        ↓
ubicació inicial contrastada
        ↓
temperatura + humitat + pressió + pluja disponibles
        ↓
source_bindings
        ↓
current_snapshots
        ↓
API MeteoLord
        ↓
selector / mapa / vista Meteo
```

Sense inventar estacions, coordenades ni mètriques.

No implementar encara històric Grafana llevat que ja sigui estrictament necessari per una funcionalitat existent. Aquesta fase continua centrada principalment en **dades actuals**.

---

# 1. FONT GRAFANA REAL

Dashboard:

```text
https://grafana.commonscloud.coop/d/i2cat-public-jul27/vall-de-lord?orgId=11&from=now-24h&to=now&timezone=browser&var-sensor=Meteo-001-3100044
```

Ja està contrastat que:

```text
Meteo-001-3100044
```

és un sensor real consultable i que la temperatura es pot obtenir mitjançant el backend.

No assumeixis que la llista següent és necessàriament igual a totes les opcions actuals de Grafana.

Primer intenta obtenir del dashboard/configuració/API **la llista real actual de sensors seleccionables**.

Compara:

```text
GRAFANA_DISCOVERED
vs
CATÀLEG_CONEGUT
```

i identifica:

* sensors presents als dos;
* sensors només a Grafana;
* sensors només al catàleg;
* identificadors parcials o dubtosos.

No inventis correspondències.

---

# 2. CATÀLEG CONEGUT

Aquesta és la correspondència de treball actual.

El text posterior a `->` és el **nom de localització principal** que s'ha d'utilitzar també per buscar la ubicació.

```text
Meteo-001-3100044 -> Granja Vaques ca l'Andal
Meteo-002-3100007 -> Can Pernals
Meteo-003-3100338 -> Cal Reli
Meteo-004-3100360 -> Escola Aiguadora
Meteo-005-5310489 -> El Planàs
Meteo-007-3100206 -> El Vancell
Meteo-008-3100134 -> Casa La Mora
Meteo-009-3100496 -> Casa Valielles
Meteo-010-54000046 -> Font d'Estivella
Meteo-011-3300274 -> Sallord
Meteo-012-3300391 -> El Collell
Meteo-013-3300161 -> Forat Bòfia
Meteo-015-4000206 -> Duocastella
Meteo-016-4000258 -> Apartaments Casafont
Meteo-017-4000161 -> Casa Ventolra
Meteo-018-4000158 -> Can Sans-Can Costa
Meteo-019-4000143 -> Prat Formiu
Meteo-020-4000245 -> El Jou
Meteo-021-000070 -> Masia Guixerons
Meteo-022-00368 -> Cap del Verd
Meteo-023-00386 -> Casa Ginebres
Meteo-024-00225 -> Cal Samarrà
Meteo-025-00279 -> Codó
Meteo-026- -> Cal Sec
Meteo-027- -> Coll de Port
Meteo-028-300127 -> Torrent Foranca
Meteo-029- -> Casa Postils
```

També existeix com a document de referència:

```text
Estacions - llista(2).pdf
```

Utilitza'l com a font auxiliar per relacionar sensors amb codis MLW/noms, però no substitueixis silenciosament la llista anterior quan divergeixin.

Quan hi hagi discrepància:

```text
PENDENT_REVISIO
```

i mostra les dues fonts.

---

# 3. PRESERVAR L'ESTACIÓ JA EXISTENT

Actualment ja existeix:

```text
station UUID:
5da7eece-6954-413f-8e22-390fe4144830

code:
GRAFANA_LOCAL_001

binding:
GRAFANA / Meteo-001-3100044 / VALIDATED
```

Aquesta estació NO s'ha de duplicar.

Ha de reconciliar-se amb:

```text
Meteo-001-3100044
→ Granja Vaques ca l'Andal
```

Preferència:

* preservar UUID;
* preservar binding;
* preservar `current_snapshots`;
* actualitzar identitat/nomenclatura de l'estació;
* assignar el codi MLW correcte només si està contrastat amb les fonts disponibles.

No eliminis/recreïs l'estació per fer-ho.

---

# 4. IDENTIFICADORS PARCIALS

Casos com:

```text
Meteo-026-
Meteo-027-
Meteo-029-
```

no tenen identificador complet.

NO inventis els dígits que falten.

Intenta obtenir l'identificador real des de:

1. variables del dashboard Grafana;
2. queries/panells Grafana;
3. resposta/API de Grafana;
4. altres evidències ja presents al repositori.

Si no es pot demostrar:

```text
external_id = PENDENT
```

i no crear un binding inventat.

---

# 5. UBICACIÓ INICIAL VIA GOOGLE MAPS

Per cada estació identificada, busca a **Google Maps** utilitzant principalment el text que hi ha després de `->`.

Exemples:

```text
"Granja Vaques ca l'Andal"
"Can Pernals"
"El Vancell"
"Casa Valielles"
"Apartaments Casafont"
```

## Context geogràfic

Prioritza resultats compatibles amb l'àmbit de:

* Vall de Lord;
* Sant Llorenç de Morunys;
* Guixers;
* La Coma i la Pedra;
* Navès;
* Capolat;
* Lladurs;
* Solsonès;
* zones immediatament adjacents quan correspongui.

No acceptis automàticament una coincidència amb el mateix nom en una altra comarca o territori.

---

# 6. EVIDÈNCIA DE GEOLOCALITZACIÓ

Per cada resultat guarda una estructura de treball com:

```json
{
  "external_id": "Meteo-001-3100044",
  "name": "Granja Vaques ca l'Andal",
  "latitude": 0.0,
  "longitude": 0.0,
  "location_source": "GOOGLE_MAPS",
  "location_query": "Granja Vaques ca l'Andal",
  "location_confidence": "HIGH",
  "location_notes": "..."
}
```

Els valors anteriors són només esquema; NO utilitzis `0.0`.

## Confidence

Utilitza només:

```text
HIGH
MEDIUM
LOW
UNRESOLVED
```

### HIGH

Nom i context territorial coincideixen clarament.

### MEDIUM

Coincidència probable però falta algun element.

### LOW

Nom ambigu o ubicació aproximada.

### UNRESOLVED

No existeix evidència suficient.

---

# 7. PROHIBIT INVENTAR COORDENADES

Si Google Maps no dona una correspondència prou clara:

```text
latitude = null
longitude = null
location_confidence = UNRESOLVED
```

No utilitzis:

* centre del municipi;
* coordenades aleatòries properes;
* centroides;
* inferència pel nom;
* una altra masia amb nom semblant.

És millor tenir una estació sense coordenades que una estació mal situada.

Aquestes ubicacions seran una **primera ubicació de treball** i més endavant les podrem ajustar manualment.

---

# 8. NO DEPENDRE PERMANENTMENT DE GOOGLE MAPS

Google Maps només és font per obtenir aquesta primera ubicació.

La runtime de MeteoLord NO ha de consultar Google Maps.

Les coordenades contrastades s'han de guardar com a dades pròpies de l'estació.

No introdueixis:

* Google Maps SDK;
* API key;
* dependència runtime;
* geocodificació automàtica en producció.

---

# 9. DESCOBERTA DE VARIABLES GRAFANA

Ara mateix només tenim contrastada:

```text
temperatura
```

i la mètrica utilitzada actualment.

Vull incorporar, quan existeixin:

```text
temperatura
humitat
pressió atmosfèrica
pluja / precipitació
```

NO inventis els noms de mètriques.

Inspecciona el dashboard real i les queries dels panells per identificar exactament:

* query;
* mètrica;
* labels;
* unitat;
* transformacions;
* sensor variable;
* disponibilitat.

Genera una matriu:

```text
external_id | temp | humitat | pressió | pluja
```

amb:

```text
AVAILABLE
NOT_AVAILABLE
UNKNOWN
```

---

# 10. SEMÀNTICA DE LES VARIABLES

Abans de mapar-les, determina què representa exactament cada dada.

## Temperatura

Mapeig probable existent:

```text
temp_c
```

Conserva el contracte validat.

## Humitat

Ha de representar humitat relativa i mapar-se només si la font ho confirma:

```text
humitat_pct
```

No acceptis un valor arbitrari entre 0–100 sense comprovar-ne la semàntica.

## Pressió

Determina:

* unitat real;
* si és absoluta o corregida al nivell del mar;
* transformacions del dashboard.

Mapeja al camp canònic existent corresponent.

No assumeixis `hPa` sense verificar-lo.

## Pluja

Aquesta és especialment crítica.

Determina si la dada és:

* acumulació total;
* acumulació diària;
* acumulació de període;
* intensitat;
* increment;
* counter acumulatiu.

No mapegis una acumulació total com si fos pluja instantània.

Documenta exactament la semàntica abans d'integrar-la.

---

# 11. DISPONIBILITAT PER ESTACIÓ

No assumeixis que totes les estacions tenen els quatre sensors.

Per cada estació:

```text
temperatura:
humitat:
pressió:
pluja:
```

Si falta una variable:

```text
null
quality = MISSING
```

No fallis tot el snapshot perquè falti una variable opcional.

---

# 12. ADAPTADOR GRAFANA

Amplia l'adaptador existent.

NO creïs:

* un adaptador separat per variable;
* una nova taula per cada variable;
* un model paral·lel.

Mantén conceptualment:

```text
fetchSnapshot(binding)
        ↓
{
  observedAt,
  values: {
     temp_c,
     humitat_pct,
     pressio_...,
     pluja_...
  },
  quality
}
```

Reutilitza els camps canònics que ja existeixin al model MeteoLord.

No canviïs schema si ja existeixen camps adequats.

---

# 13. TIMESTAMPS DIFERENTS

És possible que temperatura, humitat, pressió i pluja no tinguin exactament el mateix timestamp.

No inventis una falsa simultaneïtat.

Inspecciona el contracte actual de `current_snapshots` i decideix el canvi mínim compatible.

Si el model ja suporta qualitat/timestamps per camp, reutilitza'l.

Si no:

* conserva `observedAt` segons el contracte existent;
* documenta la possible diferència temporal;
* no facis una migració sense justificar-la.

---

# 14. IMPORTACIÓ DE TOTES LES ESTACIONS

Només quan la matriu de correspondències estigui preparada.

Utilitza el mecanisme existent:

```text
importService
```

o el bootstrap/importador Grafana ja desenvolupat.

Requisits:

* idempotent;
* ADMIN;
* PRIVATE inicialment;
* binding VALIDATED només quan l'external_id està contrastat;
* coordenades només quan tenen evidència suficient;
* no duplicar external_id;
* no duplicar estació;
* conflictes -> FAIL explícit.

No facis pública cap estació automàticament.

---

# 15. NOM I CODI

Per la presentació utilitza el nom després de `->`.

Quan existeixi una correspondència MLW fiable al PDF, conserva també aquest identificador.

Exemple conceptual:

```text
code: MLW28
name: Granja Vaques ca l'Andal
external_id: Meteo-001-3100044
```

Però NO sobreescriguis codis sense comprovar conflictes amb el model existent.

---

# 16. MAPA

Les estacions amb coordenades contrastades han de poder aparèixer al mapa només segons les regles de visibilitat/permisos ja existents.

En aquesta fase:

```text
ADMIN + PRIVATE
```

per defecte.

Per tant:

* SUPERADMIN les pot visualitzar on correspongui;
* públic no les veu automàticament.

No canviïs les regles generals del mapa.

---

# 17. ARTEFACTE D'INVENTARI

Abans de modificar massivament la BD, genera un fitxer versionable, per exemple:

```text
config/meteolord/grafana-stations.json
```

o equivalent coherent amb el projecte.

Per cada entrada:

```json
{
  "external_id": "...",
  "code": "...",
  "name": "...",
  "latitude": null,
  "longitude": null,
  "location_source": "...",
  "location_confidence": "...",
  "metrics": {
    "temperature": "...",
    "humidity": "...",
    "pressure": "...",
    "rain": "..."
  }
}
```

No hi incloguis:

* secrets;
* tokens;
* payloads reals;
* cookies;
* dades personals no necessàries.

---

# 18. PRIMER GATE: INVENTARI ABANS D'APLICAR

ABANS d'importar/actualitzar BD, mostra'm una taula completa:

```text
external_id
MLW
name
Grafana discovered
latitude
longitude
location confidence
temperature
humidity
pressure
rain
action
```

`action` pot ser:

```text
UPDATE_EXISTING
CREATE
SKIP_UNRESOLVED
CONFLICT
```

No apliquis automàticament entrades:

```text
CONFLICT
```

o identificadors no resolts.

Pots continuar automàticament amb entrades inequívoces si no hi ha cap conflicte destructiu.

---

# 19. RECONCILIACIÓ DE MLW28

Cas especial:

```text
Meteo-001-3100044
```

Actualment ja té estació i snapshot.

Resultat esperat:

```text
UPDATE_EXISTING
```

i NO:

```text
CREATE
```

Preserva:

* UUID;
* binding ID;
* snapshots;
* historial existent si n'hi hagués;
* relacions.

Actualitza només les metadades contrastades.

---

# 20. TESTS

Afegeix tests com a mínim per:

## Inventari

* sensors Grafana descoberts;
* external_id conegut;
* external_id desconegut;
* identificador parcial;
* correspondència duplicada.

## Geolocalització

Els tests no han de dependre de Google Maps en viu.

Testa el parser/model amb fixtures pròpies:

* HIGH;
* MEDIUM;
* UNRESOLVED;
* coordenades null.

## Importació

* create;
* update existing;
* idempotència;
* external_id duplicat;
* preservar UUID MLW28;
* coordenades null acceptades.

## Variables

* temperatura;
* humitat;
* pressió;
* pluja;
* variable absent;
* zero;
* null;
* timestamp invàlid;
* unitat inesperada.

## Regressió

* G01–G07 continuen PASS;
* Ecowitt continua PASS;
* cap històric Grafana creat accidentalment.

---

# 21. PROVA REAL

Després de la implementació:

Selecciona diverses estacions reals, no només MLW28.

Com a mínim:

```text
MLW01 / Can Pernals
MLW02 / Forat Bòfia
MLW28 / Granja Vaques ca l'Andal
```

sempre que Grafana les ofereixi realment.

Verifica per cadascuna:

* binding;
* snapshot;
* variables disponibles;
* API;
* UI;
* coordenades quan estiguin resoltes.

No exigeixis una variable que aquella estació no tingui.

---

# 22. NO FACIS

No:

* inventis identificadors;
* inventis coordenades;
* assumeixis mètriques per semblança de nom;
* facis públiques totes les estacions;
* activis històric Grafana;
* toquis producció;
* executis migracions productives;
* recreïs PostgreSQL;
* esborris snapshots actuals;
* dupliquis MLW28.

---

# 23. OPTIMITZACIÓ DEL TREBALL

No tornis a fer una auditoria general del projecte.

Treballa incrementalment sobre G01–G07.

Ordre recomanat:

```text
H01 discovery sensors Grafana
H02 mapping catàleg/PDF
H03 geolocalització i inventari
H04 discovery mètriques
H05 adaptar snapshot multivariable
H06 import/reconciliació estacions
H07 API/UI/mapa
H08 gate multiestació
```

Fes commits/checkpoints petits si és possible.

No barregis refactors aliens.

---

# SORTIDA FINAL

Retorna:

## 1. Sensors descoberts a Grafana

## 2. Matriu de correspondència

```text
external_id | code | name | location | confidence
```

## 3. Variables disponibles

```text
station | temp | humidity | pressure | rain
```

## 4. Ubicacions

Per cada estació:

```text
name
latitude
longitude
confidence
evidence/query
```

## 5. Estacions importades/actualitzades

```text
CREATE:
UPDATE:
SKIP:
CONFLICT:
```

## 6. MLW28

Confirma explícitament que s'ha preservat el seu UUID.

## 7. Prova real

Mostra almenys tres estacions si estan disponibles.

## 8. Tests

```text
PASS:
FAIL:
SKIP:
TOTAL:
```

## 9. Regressió Ecowitt

`PASS` o `FAIL`

## 10. Històric Grafana

Ha de continuar sense activar-se automàticament.

## 11. Defectes / dades pendents

Llista només els casos reals que no s'han pogut resoldre.

## 12. Estat

Una de:

`FASE MULTIESTACIÓ GRAFANA PASS`

o

`FASE MULTIESTACIÓ GRAFANA PARCIAL — <motius>`

o

`FASE MULTIESTACIÓ GRAFANA FAIL — <causa>`
