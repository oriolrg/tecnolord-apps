# Evidència UE-T08 — geometria i visibilitat coherent al mapa

Data: 2026-09-20. Estat: **FETA** amb identitats, estacions, coordenades i observacions exclusivament sintètiques.

La migració [0005-ue-map-publication.sql](../../../backend/db/migrations/0005-ue-map-publication.sql) completa `station_locations` amb consentiment, revocació, política geogràfica i revisió, reforça la coherència entre mode i geometria i crea una versió monòtona del catàleg. La geometria privada i la pública continuen sent columnes PostGIS diferents. Les coordenades es validen com a GeoJSON/WGS84 en ordre explícit `[longitud, latitud]`.

[stationLocationService.js](../../../backend/services/stationLocationService.js) aplica la política ratificada per estacions d’usuari: ubicació oculta o generalització estable en metres a 1 km, 5 km o 10 km. La coordenada exacta no participa en cap DTO públic. Publicar exigeix consentiment vigent, compte aprovat, estació activa, connector preparat, binding validat i almenys un snapshot amb timestamp. El mode `HIDDEN` permet publicar l’estació al selector i a Meteo sense fer-la visible al mapa.

Les actualitzacions d’ubicació, consentiment i visibilitat són transaccionals. Publicar, despublicar, canviar nom o geometria, retirar l’estació i suspendre el compte incrementen `map_catalog_state`. Les respostes públiques són `no-store`, inclouen `X-Catalog-Version` i tornen a comprovar tots els gates en cada lectura. L’auditoria desa el mode i la precisió, però no les coordenades.

[stationMap.js](../../../backend/routes/stationMap.js) serveix mapa, llista, resum, fitxa, versió i sitemap des del catàleg persistent. `/api/v1/me/map` retorna només les coordenades exactes de les estacions pròpies; `/api/v1/admin/map` les de totes les estacions només a `SUPERADMIN`. Ambdues rutes són autenticades, `no-store` i `Vary: Cookie`. Un visitant o un altre usuari rep la mateixa absència/404 i els filtres s’apliquen després de l’autorització.

La [pantalla de compte](../../../site/compte/index.html) permet introduir longitud i latitud, escollir 1/5/10 km o ubicació oculta i donar o revocar el consentiment. El [client del mapa](../../../site/src/map.js) uneix el catàleg públic amb la capa exacta autoritzada de la sessió, elimina duplicats de la vista i diferencia visualment les estacions privades. Sense sessió continua mostrant només el conjunt públic.

Validació executada localment:

- Suite UE-T08 unitària i d’integració PostGIS: 5/5 PASS. Cobreix límits WGS84, NaN i ordre invertit, política inferior a 1 km rebutjada, generalització estable, zero/null, opt-in, `HIDDEN`, propietari/altre/admin/visitant, absència de coordenada privada, filtres, versió i revocació en mapa, llista, resum, fitxa i sitemap.
- Regressions enfocades MAP-A, propietat, retirada i suspensió: 15/15 PASS.
- Regressió completa Node amb T10/T13/T15/UE integrades: 219/219 PASS, 0 FAIL, 0 SKIP.
- `node scripts/check-ue-visibility-browser.js` dins Chromium sense xarxa, viewport 375×667: PASS; capa privada diferenciada, avís de coordenada exacta, formulari de publicació, sense overflow, errors JS ni peticions externes.

No s’han publicat coordenades ni dades reals i no s’ha contactat cap proveïdor. El desplegament haurà d’aplicar la migració i configurar el worker de snapshots abans que una estació real pugui superar el gate automàtic.
