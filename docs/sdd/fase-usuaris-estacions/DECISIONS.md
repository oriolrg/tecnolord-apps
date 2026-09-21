# Decisions de la fase

Estat 2026-09-18: decisions de producte UE-D01 a UE-D05 resoltes. Les validacions tècniques o de drets indicades a les tasques corresponents no es consideren decisions de producte pendents.

## Producte i autoritzacions

| ID         | Decisió adoptada                                                                                                                                                                                                                                                                                                                                                                                       | Impacte i tasques                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UE-D01** | **Alta pública mitjançant sol·licitud, verificació obligatòria d'email i aprovació manual de l'administrador.** L'usuari pot iniciar públicament el registre, però no obté accés actiu fins que l'email hagi estat verificat i l'administrador hagi aprovat el compte. L'arquitectura quedarà preparada per poder activar autoregistre directe en una fase futura sense redissenyar el sistema.        | UE-T04 ha d'implementar els estats necessaris del compte i el flux `sol·licitud → verificació email → pendent aprovació → actiu`. L'autoregistre directe queda desactivat en aquesta fase.                                                                                                                                                                                                                                          |
| **UE-D02** | **Les estacions poden ser públiques o privades.** El propietari decideix si publica la seva estació. Una estació privada és accessible pel propietari i per l'administrador. L'administrador té accés a totes les estacions.                                                                                                                                                                           | El mapa públic només mostra estacions públiques. Un usuari autenticat pot veure les estacions públiques i les seves pròpies privades. Altres usuaris no poden accedir a observacions, coordenades exactes ni dades d'una estació privada. UE-T05/UE-T08 han d'aplicar aquesta política mitjançant el servei de permisos compartit.                                                                                                  |
| **UE-D03** | **El punt de referència d'Andorra serà Andorra la Vella.**                                                                                                                                                                                                                                                                                                                                             | UE-T15 pot completar les sis localitats previstes utilitzant Andorra la Vella com a punt geogràfic d'Andorra.                                                                                                                                                                                                                                                                                                                       |
| **UE-D04** | **Grafana serà un connector intern de producció.** MeteoLord podrà obtenir dades meteorològiques de les estacions disponibles mitjançant Grafana des del backend i exposar aquestes dades meteorològiques a través del model i API propis de MeteoLord. Grafana no serà accessible directament des del client.                                                                                         | URLs, credencials, tokens, API i detalls interns de Grafana no s'exposaran al frontend. UE-T12 ha de validar accés, límits, unitats, estabilitat i comportament del connector. Abans de publicar dades procedents d'aquesta font s'han de validar els drets de reutilització/redistribució corresponents; ocultar Grafana darrere del backend no substitueix aquesta validació. UE-T14 continua condicionada al resultat del spike. |
| **UE-D05** | **La persistència històrica s'activa individualment per estació i és administrada exclusivament per l'administrador.** No s'emmagatzemarà automàticament l'històric de totes les estacions. S'ha de poder conservar històric de l'estació actual de MeteoLord, de les estacions obtingudes mitjançant Grafana i de qualsevol altra estació que l'administrador decideixi incorporar a la persistència. | Per cada estació amb persistència activada, l'administrador configura individualment la periodicitat de captura/emmagatzematge i el temps de retenció. El sistema ha d'eliminar automàticament les dades que superin la retenció configurada. Les estacions sense persistència continuen funcionant amb dades actuals/snapshot. Els històrics existents s'han de preservar durant l'adaptació al nou model.                         |

## Flux d'alta d'usuaris

El flux definitiu d'aquesta fase és:

`sol·licitud pública d'alta`

→ `verificació obligatòria de l'email`

→ `compte pendent d'aprovació`

→ `aprovació manual de l'administrador`

→ `compte actiu`

La verificació de l'email no implica l'activació automàtica del compte.

L'arquitectura haurà de permetre que en una fase futura es pugui habilitar un mode d'autoregistre sense aprovació manual, però aquesta possibilitat no s'activarà en aquesta fase.

## Visibilitat de les estacions

Cada estació aportada per un usuari disposarà, com a mínim, d'un estat de visibilitat:

* **Pública:** pot ser consultada pels usuaris i pot aparèixer al mapa públic.
* **Privada:** només pot ser consultada pel propietari i per l'administrador.

L'administrador té accés funcional a totes les estacions, independentment de la seva visibilitat.

Per a una estació privada no s'exposaran a altres usuaris:

* observacions meteorològiques;
* coordenades exactes;
* configuració;
* metadades no públiques;
* presència identificable al mapa públic.

El servei centralitzat de permisos haurà de protegir totes les vies de lectura. No s'implementaran polítiques independents al mapa, API i vista Meteo.

## Persistència històrica

La persistència passa a ser una propietat configurable **per estació**, gestionada per l'administrador.

Per cada estació seleccionada per conservar històric s'ha de poder definir:

* persistència activada/desactivada;
* periodicitat de captura;
* temps de retenció.

Exemple conceptual:

| Estació                        | Històric | Periodicitat |     Retenció |
| ------------------------------ | -------: | -----------: | -----------: |
| Ecowitt principal              |       Sí | configurable | configurable |
| Grafana A                      |       Sí | configurable | configurable |
| Grafana B                      |       Sí | configurable | configurable |
| Estació usuari X               |       No |            — |            — |
| Estació seleccionada per admin |       Sí | configurable | configurable |

Els valors concrets no queden fixats en aquest document: els definirà l'administrador des de l'aplicació.

Una estació sense persistència històrica pot continuar mostrant les seves dades actuals.

La purga haurà de respectar la retenció configurada individualment per cada estació i no podrà afectar els històrics d'altres estacions.

## Decisions tècniques i delimitacions adoptades

* Express, `pg`, PostgreSQL/PostGIS, frontend estàtic i MapLibre/PMTiles es conserven.

* Un servei de permisos compartit precedeix totes les lectures. No es duplicaran gates independents al mapa, API i vista Meteo.

* L'autenticació serà amb email/contrasenya i sessions opaques gestionades al servidor.

* La recuperació de contrasenya utilitzarà un token d'un sol ús mitjançant un adaptador de correu.

* Durant el desenvolupament s'utilitzarà una bústia sintètica. La publicació futura requerirà un transport de correu real configurat.

* El bootstrap de l'administrador es farà mitjançant una ordre local explícita sobre una identitat comprovada, amb auditoria i sense contrasenya per defecte.

* L'administrador no es determinarà pel primer usuari registrat, per `ADMIN_EMAIL` d'ingesta ni per cap paràmetre proporcionat pel client.

* Ecowitt és l'únic connector que els usuaris poden aportar directament en aquesta fase.

* Open-Meteo només s'utilitzarà per a punts d'estimació administrats.

* Grafana funcionarà exclusivament com a connector backend. El navegador no coneixerà les seves credencials, endpoints interns ni mecanismes d'autenticació.

* No s'admetran URLs arbitràries ni entrada manual d'observacions meteorològiques.

* L'edició global per part de l'administrador inclou:

  * estació pública de referència;
  * visibilitat de les sis targetes actuals;
  * ordre de les sis targetes actuals.

* Queden fora d'abast:

  * constructor visual;
  * HTML configurable;
  * fórmules arbitràries;
  * modificació global de preferències personals dels usuaris.

* La predeterminada personal serà una estació pròpia activa, pública o privada.

* Si l'usuari no té preferència personal, s'utilitzarà la vista pública global.

* Si l'estació predeterminada s'elimina, desactiva o deixa de ser accessible, la preferència s'invalidarà i l'usuari tornarà a la vista global amb un avís.

* Una fallada temporal del proveïdor no modificarà l'estació predeterminada.

* La selecció mitjançant URL o selector serà temporal.

* Només una acció explícita del tipus **«Estableix com a predeterminada»** persistirà la preferència al servidor.

* Una URL que intenti accedir a una estació no autoritzada retornarà un error genèric i una opció per tornar a la vista global. Mai es mostraran dades d'una altra estació sota el nom sol·licitat.

* Les polítiques de cache, actualització i qualitat definides al PLAN són requisits d'implementació i no decisions que es puguin delegar a l'implementador.

## Validacions que continuen obertes

Les decisions de producte estan resoltes, però continuen existint comprovacions tècniques que s'han de realitzar durant les tasques corresponents:

1. **Grafana**

   * validar mecanisme d'accés;
   * identificar límits;
   * verificar unitats;
   * comprovar estabilitat;
   * determinar el conjunt real d'estacions accessible;
   * validar drets de reutilització i publicació de les dades.

2. **Persistència**

   * adaptar el model de dades perquè la política d'històric sigui per estació;
   * definir mecanisme de planificació de captures amb periodicitats diferents;
   * implementar purga per retenció individual;
   * preservar els històrics existents.

3. **Correu**

   * durant desenvolupament es manté l'adaptador/bústia sintètica;
   * el transport de correu real serà requisit previ a la publicació, no d'aquesta fase local.

Aquestes validacions no reobren UE-D01–UE-D05 tret que aparegui una incompatibilitat que exigeixi una nova decisió funcional.
