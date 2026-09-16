# DCF-08 v1.0 — Àmbit geogràfic i ubicació

**Data:** 2026-09-16
**SPEC afectada:** SPEC-06 v0.5
**Estat:** RESOLT
**Data de ratificació:** 2026-09-16
**Ratificat per:** Oriol
**Àmbit:** mapa públic d'estacions MeteoLord
**Dependències:** DCF-02, DCF-07 i DCF-09 resoltes a DCF-06 v1.1
**No selecciona:** motor cartogràfic, llibreria JS, sistema de tiles, algoritme concret de clustering o infraestructura.

---

# 1. Resum executiu

L'àmbit geogràfic del mapa NO queda limitat a Catalunya, Vall de Lord ni cap frontera política fixa: el viewport inicial es deriva del **conjunt d'estacions públiques elegibles**.

La ubicació publicada és un artefacte separat de la coordenada privada/original. Per defecte, MeteoLord publica ubicacions aproximades: **100 m per estacions institucionals/pròpies** i **1 km mínim per estacions d'usuaris**. Les coordenades originals mai arriben a l'API pública quan s'aplica aproximació.

La geolocalització del visitant és opcional, només s'activa mitjançant una acció explícita, es processa localment al navegador i no es persisteix ni s'envia al backend en l'MVP.

Clustering, viewport i optimitzacions poden canviar la representació, però NO poden alterar el conjunt públic ni permetre inferir estacions o coordenades `INTERNAL_ONLY`.

---

# 2. Contracte geogràfic transversal

Cada estació candidata al mapa HA DE disposar conceptualment de:

```text
geo_publication:
    APPROXIMATED
    EXACT
    HIDDEN

public_geometry

privacy_radius_m

source_positional_accuracy_m   # si es coneix

geo_policy_version
```

`public_geometry` és la geometria que pot sortir a l'API pública.

La geometria privada/original és:

```text
INTERNAL_ONLY
```

quan difereixi de `public_geometry`.

La visibilitat al mapa queda definida com:

```text
MAP_VISIBLE(station) =
    PUBLIC(station)
    AND geo_publication != HIDDEN
    AND public_geometry is valid
```

Una estació pot ser autoritzada en altres parts del sistema però, sense geometria pública vàlida, **no és elegible per al mapa de SPEC-06**.

Qualsevol canvi en:

```text
geo_publication
privacy_radius_m
public_geometry
```

HA DE:

```text
incrementar catalog_version
invalidar caches públiques
regenerar les superfícies afectades
```

seguint DCF-06.

---

# 3. A — Àmbit geogràfic

## Q1. Quin és l'àmbit geogràfic per defecte?

**Estat: `MODIFICAR`**

### Resposta

No s'ha de codificar:

```text
Catalunya
Vall de Lord
Espanya
```

com a límit funcional.

L'àmbit és:

```text
conjunt d'estacions MAP_VISIBLE
que passen els filtres actius
```

### Justificació

SPEC-06 ja defineix una llista independent del viewport i contempla diferents fonts. Fixar ara una regió política introduiria una limitació que no prové de cap requisit.

També facilita internacionalització futura.

### Recomanació

Tractar el mapa com a geogràficament global però centrat inicialment en les dades existents.

### Risc

Confondre «on tenim estacions avui» amb «on pot funcionar el producte».

---

## Q2. Hi ha bounding box inicial?

**Estat: `CONFIRMAT`**

### Resposta

Sí, però és **dinàmic**.

El viewport inicial HA DE contenir el bounding box de totes les geometries públiques que passen els filtres inicials.

```text
initial_extent =
    bounds(public_geometry of filtered MAP_VISIBLE stations)
```

S'ha d'aplicar un marge visual raonable.

Només s'utilitzen geometries **públiques generalitzades**, mai coordenades originals.

### Cas zero estacions

No es calcula cap bounding box.

S'aplica RF-MAP-13:

```text
"No hi ha estacions públiques disponibles"
```

en lloc de mostrar un mapa buit.

### Risc

Calcular `fit bounds` amb coordenades privades filtraria indirectament l'extensió real del dataset.

---

## Q3. Es pot navegar fora d'aquest àmbit?

**Estat: `CONFIRMAT`**

### Resposta

Sí.

L'extensió inicial NO constitueix una frontera.

El visitant pot desplaçar-se i fer zoom fora del viewport inicial.

### Regla

Navegar fora de l'àmbit:

```text
NO crea dades noves
NO consulta INTERNAL_ONLY
NO canvia el filtre d'autorització
```

### Recomanació

No imposar límits polítics artificials al moviment del mapa.

---

## Q4. Quins nivells de zoom estan permesos?

**Estat: `MODIFICAR`**

### Resposta

DCF-08 NO fixa números com:

```text
zoom 4
zoom 8
zoom 12
```

perquè el significat concret del zoom depèn del motor/cartografia que DCF-07 prohibeix seleccionar en aquesta fase.

El contracte funcional és:

* ha de permetre una visió global del conjunt públic;
* ha de permetre inspeccionar individualment una estació;
* l'aproximació de la ubicació ha de continuar sent perceptible;
* el zoom NO POT revelar més precisió de la publicada.

### Recomanació

PLAN-06 traduirà aquestes condicions a `minZoom`/`maxZoom` del motor escollit.

### Risc

Convertir un valor propi d'un motor en requisit funcional de producte.

---

# 4. B — Zoom inicial

## Q5. Amb quin zoom s'inicia?

**Estat: `MODIFICAR`**

### Resposta

No amb un número fix.

S'inicia amb:

```text
fit public initial_extent
```

amb un límit de sobrezoom quan només hi hagi una o molt poques estacions.

### Justificació

Amb una estació a Solsona i una altra a Barcelona, un zoom fix pot ser inadequat. Amb vint estacions a la Vall de Lord, també.

L'extensió derivada de les dades és determinista i independent del motor.

### Risc

Amb una única estació, ajustar-la a tota la pantalla podria suggerir una precisió superior a l'autoritzada.

Per això la representació de la incertesa continua obligatòria.

---

## Q6. Canvia segons tipus d'estació o usuari?

**Estat: `CONFIRMAT`**

### Resposta

No.

El zoom inicial depèn de:

```text
conjunt públic
+ filtres
```

No de:

```text
tipus d'estació
identitat del visitant
propietari
```

### Excepció

Si el visitant activa explícitament «Usa la meva ubicació», pot centrar-se posteriorment al seu voltant.

Això no modifica el viewport inicial per defecte.

---

# 5. C — Precisió de la ubicació

## Q7. Precisió per defecte segons tipus?

**Estat: `MODIFICAR`**

### Decisió

#### Estacions pròpies de MeteoLord

Default:

```text
APPROXIMATED
privacy_radius_m = 100
```

`EXACT` només és admissible mitjançant classificació explícita i aprovació quan la ubicació exacta sigui intencionadament pública i no presenti risc de privacitat.

#### Ecowitt d'usuaris

Default:

```text
APPROXIMATED
privacy_radius_m = 1000
```

La ubicació exacta NO forma part de l'MVP públic de SPEC-06.

El titular pot escollir una precisió **més restrictiva**, per exemple:

```text
1 km
5 km
10 km
HIDDEN
```

però no inferior a:

```text
1000 m
```

sense una futura decisió normativa específica.

#### ACA / fonts institucionals

Mentre DCF-10 no autoritzi la republicació:

```text
INTERNAL_ONLY
```

Quan DCF-10 ho autoritzi:

```text
default privacy_radius_m = 100
```

o una precisió més baixa si la font original és menys precisa.

`EXACT` només amb autorització explícita de publicació de coordenades exactes.

#### Grafana/i2CAT

```text
INTERNAL_ONLY
```

No participa en DCF-08 públic.

### Important

Els valors **100 m i 1 km són política de MeteoLord proposada**, no llindars establerts pel GDPR.

La justificació és de privacy-by-default: el GDPR exigeix minimització i que, per defecte, només siguin accessibles les dades necessàries per a la finalitat.

W3C també recomana reduir la precisió espacial quan una ubicació més precisa no aporta valor addicional.

---

## Q8. Com s'arrodoneixen les coordenades?

**Estat: `MODIFICAR`**

### Resposta

NO s'ha de definir privacitat mitjançant:

```text
1 decimal
2 decimals
3 decimals
```

de latitud/longitud.

La generalització HA DE definir-se en **metres**.

### Justificació

La distància representada per un grau de longitud varia segons la latitud.

A més, W3C diferencia explícitament precisió numèrica i exactitud posicional. Publicar molts decimals no significa que una geometria sigui realment exacta.

### Contracte

El backend deriva:

```text
private_geometry
      ↓ geo policy
public_geometry
+ privacy_radius_m
```

L'algoritme concret de generalització correspon al PLAN-06.

HA DE ser estable i NO POT regenerar un punt aleatori nou a cada request, ja que múltiples punts podrien facilitar inferències sobre la ubicació real.

### Recomanació

La geometria pública ha de tenir un centre generalitzat estable i una mesura explícita de la seva incertesa.

---

## Q9. La precisió és configurable pel titular?

**Estat: `CONFIRMAT`**

### Resposta

Sí, per estacions aportades per usuaris.

Per l'MVP:

```text
1 km
5 km
10 km
HIDDEN
```

El mínim públic és:

```text
1 km
```

### Regla

Canviar precisió:

```text
-> nova public_geometry
-> nou geo_policy_version
-> increment catalog_version
-> invalidació de caches
```

### Risc

Canviar de 10 km a 1 km no pot fer reaparèixer la coordenada privada en caches antigues o metadades.

---

# 6. D — Geolocalització del visitant

## Q10. S'utilitza la geolocalització del navegador?

**Estat: `CONFIRMAT`**

### Resposta

Sí, però només com a **funcionalitat opcional iniciada pel visitant**.

Mai:

```text
on page load -> request geolocation
```

Sí:

```text
click "Usa la meva ubicació"
-> explicació breu
-> browser permission
```

La Geolocation API requereix permís exprés i W3C assenyala explícitament els riscos de privacitat associats a obtenir la ubicació del dispositiu.

### Ús permès

En l'MVP:

```text
centrar mapa
ordenar estacions públiques per proximitat aproximada
```

---

## Q11. Com es demana?

**Estat: `MODIFICAR`**

### Resposta

Amb un control explícit:

```text
[ Usa la meva ubicació ]
```

No amb un banner global ni una petició automàtica.

Abans d'invocar el permís nadiu del navegador, la UI indica breument:

```text
S'utilitzarà temporalment la teva ubicació per centrar
el mapa i calcular quines estacions públiques tens a prop.
No la desarem.
```

Després s'invoca el mecanisme nadiu de permís.

### Risc

Un modal bloquejant o una petició immediata pot pressionar innecessàriament l'usuari.

---

## Q12. Es guarda la ubicació del visitant?

**Estat: `CONFIRMAT`**

### Resposta

No en l'MVP.

La ubicació del visitant:

```text
NO s'envia al backend
NO entra als logs
NO entra a analytics
NO entra a cookies
NO entra a localStorage
NO es persisteix
```

Es manté temporalment en memòria del navegador mentre sigui necessària.

### Recomanació

Els càlculs de proximitat s'han de fer sobre:

```text
visitor_location (local)
+
public_geometry de les estacions
```

La posició es descarta en sortir/recarregar o en desactivar la funcionalitat.

### Justificació

W3C recomana preguntar-se si realment cal emmagatzemar la ubicació i, quan no és necessari, utilitzar-la i descartar-la.

---

## Q13. Es pot rebutjar?

**Estat: `CONFIRMAT`**

### Resposta

Sí, sense degradació de la funcionalitat principal.

Si es rebutja:

```text
mapa -> continua funcionant
cerca -> continua funcionant
llista -> continua funcionant
fitxa -> continua funcionant
```

Només desapareixen les funcions dependents de la posició personal.

No es torna a demanar automàticament.

---

# 7. E — Visualització al mapa

## Q14. Com es mostren estacions properes?

**Estat: `MODIFICAR`**

### Resposta

El contracte exigeix **agrupació visual quan la densitat impedeixi distingir o operar els marcadors individualment**.

No es prescriu un algoritme concret.

La representació agrupada:

```text
només usa MAP_VISIBLE
només usa public_geometry
```

Els comptadors de grup NO poden incloure:

```text
INTERNAL_ONLY
HIDDEN
coordenades privades
```

### Recomanació

PLAN-06 pot seleccionar el mecanisme concret de clustering.

---

## Q15. A quin zoom es desclusten?

**Estat: `MODIFICAR`**

### Resposta

No es fixa un número de zoom.

S'han de separar quan les estacions puguin representar-se individualment sense:

* solapament funcional;
* pèrdua d'operabilitat;
* targets impossibles d'usar;
* confusió entre estacions.

### Justificació

Un nivell `zoom 12` no té valor normatiu independent del motor i de la mida real del viewport.

---

## Q16. Com es mostren estacions superposades?

**Estat: `CONFIRMAT`**

### Resposta

Dues o més estacions amb la mateixa geometria pública NO es poden ocultar l'una sota l'altra.

La UI HA DE proporcionar un mecanisme per enumerar-les o expandir-les individualment.

Pot ser:

```text
agrupació
expansió
llista de membres
```

L'algoritme visual concret és PLAN-06.

### DCF-11

Si les estacions representen realment duplicats de la mateixa entitat, correspon a DCF-11 decidir si s'han de deduplicar abans.

DCF-08 només resol el solapament espacial.

---

# 8. F — Cerca per ubicació

## Q17. Es pot cercar ciutat, coordenades o direcció?

**Estat: `MODIFICAR`**

### MVP

Permetre:

```text
nom públic d'estació
municipi/localitat pública
altres noms geogràfics públics presents al catàleg
```

No incloure inicialment:

```text
adreça postal lliure
geocodificació externa
coordenada arbitrària
```

### Justificació

La cerca per ciutat/localitat pot funcionar contra metadades públiques ja classificades.

La cerca d'adreces exigiria un contracte de geocodificació, privacitat, llicència i egress que DCF-07 no ha autoritzat.

### Futur

La cerca per coordenada pot afegir-se sense canviar DCF-08 si només opera sobre geometries públiques i respecta el contracte de cartografia.

---

## Q18. Com s'ordenen els resultats?

**Estat: `MODIFICAR`**

### Resposta

Sense ubicació del visitant:

```text
1. rellevància de cerca
2. criteri estable secundari
```

Amb «Usa la meva ubicació»:

```text
distància aproximada a public_geometry
```

pot ser un criteri explícit.

### Important

La distància mai es calcula amb:

```text
private_geometry
```

si l'estació és aproximada.

La UI HA DE deixar clar que la distància és aproximada.

---

# 9. G — Precisió vs. privacitat

## Q19. Com es representa una estació aproximada?

**Estat: `CONFIRMAT`**

### Resposta

Amb:

```text
marcador representatiu
+
zona visual d'incertesa quan l'escala ho permet
```

La zona d'incertesa correspon al `privacy_radius_m` publicat.

No s'ha d'utilitzar un marcador visualment idèntic a una coordenada exacta sense cap indicació.

### Recomanació

En vistes molt allunyades pot mostrar-se només el marcador; quan s'inspecciona l'estació, la incertesa ha de quedar explícita.

---

## Q20. Com es comunica que és aproximada?

**Estat: `CONFIRMAT`**

### Resposta

No només per color o forma.

Modal i fitxa han de mostrar textualment, per exemple:

```text
Ubicació aproximada · precisió pública: ~1 km
```

o:

```text
Ubicació aproximada
```

quan no es pugui publicar una xifra fiable.

La informació ha de formar part també del nom/estat accessible del control.

### Justificació

L'exactitud posicional és metadada rellevant per poder valorar l'ús de dades espacials. W3C recomana descriure aquesta exactitud de manera comprensible.

---

## Q21. El propietari pot veure la seva ubicació exacta al perfil?

**Estat: `MODIFICAR` — FORA D'ABAST DE SPEC-06**

### Resposta

SPEC-06 NO implementa aquesta funcionalitat.

Correspon a SPEC-01/SPEC-02 decidir si un titular autenticat pot consultar la coordenada privada.

DCF-08 només imposa:

```text
l'endpoint públic NO POT retornar private_geometry
```

Una futura vista autenticada pot mostrar-la si el seu contracte d'autorització ho permet.

---

# 10. H — Casos especials

## Q22. Estació fora de l'àmbit geogràfic?

**Estat: `CONFIRMAT`**

### Resposta

No existeix una frontera geogràfica fixa.

Si és:

```text
MAP_VISIBLE
```

entra al dataset independentment del país o regió.

El viewport inicial s'adapta al conjunt.

### Risc

Un outlier extrem podria fer que la vista inicial fos massa allunyada.

### Recomanació

PLAN-06 haurà de definir el comportament visual d'outliers sense excloure'ls silenciosament.

---

## Q23. Coordenades nul·les?

**Estat: `CONFIRMAT`**

### Resposta

Fail-closed.

```text
public_geometry == null
-> MAP_VISIBLE = false
```

L'estació no apareix en:

```text
mapa
llista pública de SPEC-06
cerca espacial
clústers
comptadors del mapa
```

fins que existeixi una geometria pública vàlida.

### Justificació

CA-MAP-02 exigeix coherència entre mapa, llista, resum i fitxa sobre el conjunt públic de SPEC-06.

Una estació pot continuar existint de forma privada o en altres productes, però no entra al catàleg del mapa públic.

---

## Q24. El visitant denega geolocalització?

**Estat: `CONFIRMAT`**

### Resposta

No passa res al mapa públic.

Es manté l'extensió basada en el catàleg.

Es pot mostrar un missatge no bloquejant:

```text
No s'ha utilitzat la teva ubicació.
Pots continuar consultant totes les estacions.
```

No es repeteix automàticament el prompt.

---

# 11. I — Rendiment

## Q25. Com optimitzar 500 estacions?

**Estat: `CONFIRMAT` funcionalment**

### Resposta

DCF-08 no selecciona:

```text
tiles
vector tiles
canvas
DOM markers
índex espacial
algoritme de clustering
```

Sí exigeix:

1. el payload del mapa conté només la informació necessària per al mapa/resum;
2. no incorpora històrics complets;
3. l'agrupació pot reduir complexitat visual;
4. només es processen geometries públiques;
5. la llista alternativa continua sent funcional;
6. rendiment s'ha de validar amb el benchmark de RNF-MAP-01.

### Risc

Optimitzar primer i convertir accidentalment una decisió de tecnologia en requisit de SPEC.

---

## Q26. Es carreguen totes o només les del viewport?

**Estat: `MODIFICAR`**

### Resposta

El **conjunt lògic** NO depèn del viewport:

```text
PUBLIC + filtres actius
```

Això és obligatori perquè RF-MAP-08 defineix la llista com totes les estacions que passen els filtres, independentment del viewport.

La implementació pot carregar o renderitzar dades de manera progressiva o per viewport si PLAN-06 ho necessita, sempre que això NO canviï:

* resultats de cerca;
* comptatge públic;
* llista;
* filtres;
* semàntica del catàleg.

### Regla

```text
viewport = optimització/presentació
viewport != autorització
viewport != filtre implícit
```

---

# 12. J — Compatibilitat internacional

## Q27. Com s'adapta si MeteoLord s'internacionalitza?

**Estat: `CONFIRMAT`**

### Resposta

DCF-08 ja és internacional per disseny:

```text
cap bounding box polític fix
+
initial_extent derivat del catàleg
+
geometries globals
```

No caldria modificar la política geogràfica per afegir estacions d'altres països.

### Cas especial

PLAN-06 haurà de gestionar correctament datasets que travessin l'antimeridià si mai apareixen.

GeoJSON defineix explícitament bounding boxes i el tractament geogràfic global.

---

## Q28. Com es gestionen diferents formats de coordenades?

**Estat: `CONFIRMAT`**

### Resposta

El contracte públic canònic serà:

```text
WGS 84 / GeoJSON
ordre: [longitude, latitude]
unitat: graus decimals
```

RFC 7946 estableix per GeoJSON WGS 84 i l'ordre longitud, latitud.

Les fonts poden arribar com:

```text
lat/lon
lon/lat
graus-minuts-segons
CRS diferent
```

però han de normalitzar-se **abans d'entrar al contracte públic**.

### Important

La representació machine-to-machine no depèn del locale.

Per tant:

```text
1.2345
```

i no:

```text
1,2345
```

dins l'API.

La UI sí que pot aplicar formats locals per presentació humana.

---

# 13. Contracte resultant de publicació geogràfica

La geometria pública es deriva abans de qualsevol exposició:

```text
private_geometry
        |
        | geo_precision_policy
        v
public_geometry
        |
        +-- privacy_radius_m
        +-- geo_policy_version
        v
classificació/publicació
        v
API pública
        v
mapa / cerca / clustering / distància
```

NO és admissible:

```text
private_geometry
        ↓
frontend
        ↓
"arrodoneix abans de dibuixar"
```

La generalització és autoritativa al backend.

---

# 14. Ordre normatiu dels gates

```text
1. DCF-02: estació PUBLIC_ALLOWED
2. DCF-09: publicació/consentiment vigents
3. DCF-08: geo_publication != HIDDEN
4. DCF-08: public_geometry vàlida
5. DCF-07: superfície cartogràfica autoritzada
6. API pública
```

Si qualsevol gate falla:

```text
-> no map exposure
```

---

# 15. Política de precisió proposada

| Tipus            | Default públic                                         | Configuració                           |
| ---------------- | ------------------------------------------------------ | -------------------------------------- |
| MeteoLord pròpia | aproximada, 100 m                                      | exacta només amb aprovació explícita   |
| Ecowitt usuari   | aproximada, 1 km                                       | 1 km / 5 km / 10 km / oculta           |
| ACA              | `INTERNAL_ONLY` fins DCF-10; després 100 m per defecte | exacta només si contracte ho autoritza |
| Grafana/i2CAT    | `INTERNAL_ONLY`                                        | no aplicable                           |

Per fonts amb exactitud posicional d'origen coneguda, aquesta també s'ha de conservar com a metadada separada.

No s'ha de confondre:

```text
source_positional_accuracy_m
```

amb:

```text
privacy_radius_m
```

Una font pot tenir coordenades tècnicament molt exactes i publicar-se deliberadament a 1 km per privacitat.

---

# 16. Geolocalització del visitant — contracte

```text
default:
    OFF

trigger:
    explicit user action

browser permission:
    REQUIRED

backend transfer:
    NO

persistent storage:
    NO

analytics:
    NO

purpose:
    center map
    approximate public-distance ordering

denial:
    full core functionality remains available
```

La Geolocation API és una powerful feature que requereix permís del visitant i, en especificacions actuals del W3C, s'exposa només en contexts segurs.

---

# 17. Riscos identificats

| ID         | Risc                                                   | Impacte | Control                           |
| ---------- | ------------------------------------------------------ | ------- | --------------------------------- |
| R-DCF08-01 | publicar coordenada residencial exacta                 | Crític  | mínim 1 km per usuari             |
| R-DCF08-02 | frontend rep coordenada exacta i l'arrodoneix          | Crític  | generalització backend            |
| R-DCF08-03 | decimals confosos amb metres                           | Alt     | política en metres                |
| R-DCF08-04 | múltiples punts aleatoris permeten triangular ubicació | Alt     | geometria pública estable         |
| R-DCF08-05 | cluster revela nombre d'estacions internes             | Crític  | cluster només sobre `MAP_VISIBLE` |
| R-DCF08-06 | cerca de proximitat usa coordenades privades           | Alt     | només `public_geometry`           |
| R-DCF08-07 | prompt de geolocalització automàtic                    | Alt     | acció explícita                   |
| R-DCF08-08 | ubicació del visitant apareix a logs/analytics         | Crític  | client-only, efímera              |
| R-DCF08-09 | punt aproximat sembla exacte                           | Alt     | indicador textual + incertesa     |
| R-DCF08-10 | hardcode Catalunya impedeix expansió                   | Mitjà   | extent derivat del catàleg        |
| R-DCF08-11 | viewport es converteix en filtre funcional             | Alt     | conjunt lògic independent         |
| R-DCF08-12 | zoom molt alt revela precisió fictícia                 | Mitjà   | mantenir indicació d'incertesa    |
| R-DCF08-13 | canvi de precisió queda en cache                       | Crític  | `catalog_version` + invalidació   |
| R-DCF08-14 | geocodificador extern viola DCF-07                     | Alt     | fora de l'MVP                     |

---

# 18. Canvis proposats a SPEC-06

## §3.3 Model conceptual

Ampliar:

```text
Estacio
├── publicacio
├── geo_publication: APPROXIMATED | EXACT | HIDDEN
├── public_geometry
├── privacy_radius_m
├── geo_policy_version
└── ...
```

`private_geometry` NO forma part del contracte públic.

---

## §6.5 — substituir el PENDENT

Text proposat:

> **Àmbit geogràfic**
>
> El mapa no té una frontera política fixa. L'extensió inicial es calcula a partir de les geometries públiques de totes les estacions `MAP_VISIBLE` que passen els filtres inicials.
>
> El visitant pot navegar fora d'aquesta extensió sense que això modifiqui el conjunt autoritzat.
>
> La ubicació pública és una geometria derivada al backend segons `geo_precision_policy`. Les coordenades privades originals NO es lliuren al frontend quan la política és aproximada.
>
> Per defecte, les estacions pròpies/institucionals utilitzen una generalització de 100 m i les estacions aportades per usuaris una generalització mínima d'1 km. Les estacions d'usuari poden configurar 1 km, 5 km, 10 km o ocultar la ubicació.
>
> Una estació sense `public_geometry` vàlida o amb `geo_publication == HIDDEN` no és elegible per al mapa públic.
>
> La geolocalització del visitant està desactivada per defecte. Només pot activar-se mitjançant una acció explícita. En l'MVP es processa localment, no es persisteix i no s'envia al backend.
>
> El conjunt lògic d'estacions públiques és independent del viewport. Clustering, lazy rendering o consultes per bbox només poden ser optimitzacions i NO poden alterar autorització, llista, cerca o filtres.
>
> El contracte geoespacial públic utilitza WGS 84/GeoJSON amb ordre `[longitude, latitude]`.

---

# 19. Nous requisits proposats

```text
RF-MAP-26
El viewport inicial HA DE contenir totes les estacions MAP_VISIBLE
que passen els filtres inicials.

RF-MAP-27
La geometria pública d'una estació aproximada HA DE ser derivada
al backend; la geometria privada NO POT arribar al frontend públic.

RF-MAP-28
Els clusters, comptadors i cerques espacials només PODEN utilitzar
estacions MAP_VISIBLE.

RF-MAP-29
La geolocalització del visitant només POT activar-se mitjançant
una acció explícita.

RF-MAP-30
La ubicació del visitant NO POT persistir-se ni enviar-se al
backend dins l'MVP de SPEC-06.

RF-MAP-31
Una estació sense public_geometry vàlida NO POT aparèixer al
catàleg del mapa públic.

RF-MAP-32
Qualsevol canvi de precisió pública HA D'incrementar
catalog_version i invalidar caches.

RF-MAP-33
Una ubicació aproximada HA DE comunicar textualment que no
representa la posició exacta.
```

---

# 20. Criteris d'acceptació proposats

```text
CA-MAP-21
El viewport inicial es deriva únicament de geometries públiques.

CA-MAP-22
Fixtures amb coordenada privada i pública diferents demostren
que la privada no apareix a API, frontend, logs ni metadades.

CA-MAP-23
Una estació d'usuari amb precisió 1 km no exposa la seva
coordenada original en cap superfície pública.

CA-MAP-24
Canviar la precisió incrementa catalog_version i invalida cache.

CA-MAP-25
Clusters i comptadors no revelen estacions INTERNAL_ONLY.

CA-MAP-26
Denegar geolocalització no impedeix mapa, llista, cerca o fitxa.

CA-MAP-27
La geolocalització del visitant no genera requests amb les seves
coordenades ni persistència local.

CA-MAP-28
Una estació sense public_geometry no apareix al mapa ni al
catàleg públic de SPEC-06.

CA-MAP-29
La llista de totes les estacions filtrades continua independent
del viewport.

CA-MAP-30
Les ubicacions aproximades s'identifiquen textualment i no només
mitjançant color, icona o forma.
```

---

# 21. Matriu de les 28 decisions

|  Q | Decisió                                                    | Estat       |
| -: | ---------------------------------------------------------- | ----------- |
|  1 | àmbit derivat del catàleg, no Catalunya/Vall de Lord       | `MODIFICAR` |
|  2 | bbox dinàmic sobre geometries públiques                    | `CONFIRMAT` |
|  3 | es pot navegar fora                                        | `CONFIRMAT` |
|  4 | zoom funcional, no números de motor                        | `MODIFICAR` |
|  5 | zoom inicial = fit extent públic                           | `MODIFICAR` |
|  6 | no varia segons tipus/usuari                               | `CONFIRMAT` |
|  7 | 100 m institucional, 1 km usuari                           | `MODIFICAR` |
|  8 | generalització en metres, no decimals                      | `MODIFICAR` |
|  9 | titular: 1/5/10 km o ocult                                 | `CONFIRMAT` |
| 10 | geolocalització opcional                                   | `CONFIRMAT` |
| 11 | botó explícit + permís nadiu                               | `MODIFICAR` |
| 12 | ubicació visitant no persistida                            | `CONFIRMAT` |
| 13 | denegació sense degradació                                 | `CONFIRMAT` |
| 14 | agrupació segons densitat                                  | `MODIFICAR` |
| 15 | declustering segons col·lisió, no zoom fix                 | `MODIFICAR` |
| 16 | superposades sempre enumerables                            | `CONFIRMAT` |
| 17 | cerca MVP per metadades geogràfiques públiques             | `MODIFICAR` |
| 18 | rellevància; distància només quan existeix origen explícit | `MODIFICAR` |
| 19 | marcador + incertesa                                       | `CONFIRMAT` |
| 20 | text explícit d'ubicació aproximada                        | `CONFIRMAT` |
| 21 | ubicació privada del propietari fora de SPEC-06            | `MODIFICAR` |
| 22 | no existeix exclusió per frontera política                 | `CONFIRMAT` |
| 23 | geometria nul·la → no map eligible                         | `CONFIRMAT` |
| 24 | denegació → mapa normal                                    | `CONFIRMAT` |
| 25 | rendiment definit funcionalment, tecnologia al PLAN        | `CONFIRMAT` |
| 26 | conjunt lògic independent del viewport                     | `MODIFICAR` |
| 27 | arquitectura geogràfica global                             | `CONFIRMAT` |
| 28 | WGS84/GeoJSON `[lon, lat]`                                 | `CONFIRMAT` |

**Cap pregunta queda `PENDENT` o `BLOQUEJANT` per iniciar PLAN-06 després de ratificar aquesta decisió.**

---

# 22. Estat final

Decisió proposada:

```text
DCF-08 = RESOLT
```

després de ratificar aquest document i incorporar-ne el contracte a SPEC-06.

A partir d'aquí PLAN-06 podrà decidir:

```text
motor cartogràfic
zoom numèric
algoritme de generalització
algoritme de clustering
rendering
índex espacial
mecanisme de càrrega
```

però NO podrà decidir de nou:

```text
àmbit geogràfic funcional
precisió pública per defecte
geolocalització automàtica
persistència de la ubicació del visitant
ús de coordenades privades al frontend
semàntica del viewport
```

---

# 23. Text de ratificació proposat

> Es ratifica DCF-08 v1.0 com a contracte normatiu d'àmbit geogràfic i ubicació de SPEC-06.
>
> El mapa públic adopta un àmbit geogràfic derivat del catàleg, sense frontera política fixa. Les geometries públiques es generen al backend i són independents de les coordenades privades originals.
>
> Les ubicacions són aproximades per defecte: 100 m per fonts pròpies/institucionals i 1 km mínim per estacions aportades per usuaris. Les estacions d'usuari poden seleccionar nivells més restrictius o ocultar-ne la ubicació.
>
> La geolocalització del visitant queda desactivada per defecte, només pot activar-se per acció explícita i, dins l'MVP, es processa localment sense persistència ni transmissió al backend.
>
> El viewport i el clustering són mecanismes de presentació/optimització i no poden alterar el conjunt autoritzat.
>
> DCF-08 passa a estat `RESOLT` i deixa de bloquejar PLAN-06.

---
## 23bis. Acte de ratificació

El 2026-09-16, Oriol ratifica DCF-08 v1.0 com a contracte normatiu
d'àmbit geogràfic i ubicació de SPEC-06.

**DCF-08 queda RESOLT amb les decisions següents:**
- àmbit geogràfic derivat del catàleg públic, sense frontera política fixa;
- viewport inicial calculat des de `public_geometry` de totes les
  estacions MAP_VISIBLE que passen els filtres inicials;
- geometria pública derivada al backend (mai `private_geometry` al frontend);
- precisió per defecte: 100 m (pròpies/institucionals) i 1 km mínim
  (usuaris);
- usuaris poden configurar 1 km / 5 km / 10 km / ocultar;
- geolocalització del visitant: OFF per defecte, opt-in explícit,
  processament local, no persistència, no enviament al backend;
- viewport i clustering són presentació, no autorització;
- contracte geoespacial públic: WGS 84/GeoJSON `[longitude, latitude]`.

Aquesta ratificació NO autoritza:
- publicació de coordenades exactes sense aprovació específica;
- geolocalització automàtica del visitant;
- persistència de la ubicació del visitant;
- ús de coordenades privades al frontend.

MAP-A continua limitat a fixtures sintètiques.

# 24. Referències

**Projecte**

SPEC-06 v0.5 estableix DCF-08 com a gate de PLAN-06, la ubicació aproximada per defecte i la independència de la llista respecte del viewport.
DCF-06 v1.1 exigeix que el motor pugui treballar amb ubicacions generalitzades i manté el filtratge `PUBLIC_ALLOWED` al backend.

**Externes**

El GDPR imposa minimització de dades i protecció per disseny i per defecte, sense prescriure un nombre concret de metres.

W3C recomana publicar geometries al nivell adequat d'exactitud/precisió, descriure'n l'exactitud i reduir la precisió de la ubicació quan no sigui necessària.

La Geolocation API requereix permís exprés del visitant i tracta la ubicació del dispositiu com una dada amb implicacions clares de privacitat.

RFC 7946 defineix per GeoJSON coordenades WGS 84 i ordre `[longitude, latitude]`.
