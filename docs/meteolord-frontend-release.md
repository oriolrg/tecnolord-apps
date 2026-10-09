# MeteoLord: release del frontend, PWA i sessió

## Diagnòstic local (2026-10-09)

El context comunicat situa producció a `c9962d3`. No s'ha consultat ni modificat
producció. No s'ha inspeccionat la memòria cau del mòbil afectat: **no està
demostrada la causa concreta d'aquella instal·lació**.

Sí que s'ha comprovat al repositori:

- L'HTML carregava `src/main.js` i CSS amb URL estables, i els imports ES
  transitius també tenien URL estables. Eliminar `v=2.2.8` o versionar només
  l'entrypoint no versiona el graf d'importacions.
- El mecanisme anterior comparava un `appVersion` fix amb localStorage i
  recarregava una vegada. No canviava les URL dels imports ni invalidava la
  memòria cau HTTP. S'ha substituït sense esborrar preferències d'usuari.
- No hi ha registre de service worker al frontend. No se n'ha afegit cap.
- El manifest publicat des de `assets/icons/site.webmanifest` tenia
  `MyWebSite` / `MySite`, no el nom del producte. Les seves icones relatives
  afegien erròniament un altre `assets/icons/` al directori del manifest.
  Això acredita una identitat visual incorrecta; no demostra per si sol
  l'origen exacte de l'etiqueta «Myite» observada al mòbil.
- La capçalera tenia el text fix «Inicia sessió». Ara reutilitza el resultat
  d'`/api/v1/auth/session` que `/meteo` ja recupera: `user.name`, també per a
  SUPERADMIN. Sense nom, mostra «El meu compte», sense publicar el correu.

## Build sense dependències noves

Des de l'arrel del repositori, amb un directori de sortida **nou**:

```sh
node scripts/frontend/build-meteo.js artifacts/meteolord-web-REVIEW
```

La sortida JSON indica `version` (SHA-256) i `output`. El hash incorpora els
inputs del frontend i el mateix builder. Un canvi d'HTML, CSS, JS transitiu,
worker, estil de mapa o manifest genera un altre directori de release.

- `releases/<sha256>/`: arbre de mòduls, CSS, recursos cartogràfics i assets.
  Els imports relatius es mantenen dins d'aquest mateix arbre. Les URL
  absolutes de `map-assets` del JS també es versionen, inclosos worker i estil.
- `index.html`, `compte/index.html`, `mapa/index.html`: entrada estable amb
  referències als recursos de la release. No cal canviar URL d'accés.
- `release.json`: hash actual que el client comprova en iniciar-se i tornar
  al primer pla (`focus`, `pageshow`, `visibilitychange`). Si canvia,
  recarrega el document; hi ha protecció contra bucles i tolerància offline.
- `runtime-config.production.js` i `runtime-config.js`: configuració real
  de producció. No es copia el runtime sintètic de desenvolupament.
- `assets/`: es manté també a la ruta estable, sobretot per a manifest/icones.

Caddy envia `no-store, max-age=0` només a Meteo, inclosos HTML, manifest,
recursos i metadata de release. El runtime ja tenia aquesta política.
El versionat del graf evita dependre d'invalidacions de CSS/JS amb URL
reutilitzades. No es canvia CSP, analytics, external links ni cap altra app.

El directori font `site/` continua funcionant com a previsualització local;
només una sortida generada conté la renovació automàtica per hash. Cal
desplegar el **build**, no copiar simplement l'HTML font.

## Identitat i límits de les instal·lacions existents

Es conserva la URL del manifest i no s'introdueixen `id`, `start_url` ni
`scope`, que abans eren absents. Es mantenen els valors implícits del
navegador i les entrades `/meteo/`, `/meteo/index.html` i els seus query
parameters. No s'intenta canviar la identitat d'una instal·lació existent.
`name`, `short_name`, títol HTML i metadades mòbils són MeteoLord.

Un document antic que encara no ha carregat aquest client no pot executar
el nou detector. `no-store` no esborra retroactivament una resposta antiga
que el navegador decideixi reutilitzar sense contactar amb el servidor.
La transició requereix una navegació/reobertura amb accés a la nova entrada;
no requereix esborrar dades ni reinstal·lar. No es promet actualització
immediata en una aplicació que continua oberta o offline. Una vegada
carregat aquest client, la reactivació comprova `release.json`.

El navegador/SO decideix quan actualitzar el nom i la icona instal·lats;
algunes icones, especialment accessos afegits manualment, poden retenir
l'etiqueta anterior i necessitar un canvi de nom al sistema. El frontend
no pot forçar aquesta operació ni garantir que passi automàticament.

## Sessió i privacitat

La capçalera actualitza text, etiqueta accessible i tooltip; el nom llarg
es trunca visualment en mòbil i l'enllaç continua portant a `/meteo/compte/`.
Abans de revalidar la sessió s'esborra el nom anterior i es retira el mapa.
També es netegen en ocultar/abandonar el document, i `pageshow` revalida la
sessió en tornar des de la cache de navegació (BFCache).
Les revisions/AbortController existents protegeixen contra respostes velles.
Login/logout notifiquen altres pestanyes amb un senyal localStorage sense
nom, credencials ni token; es torna a consultar la sessió al servidor.

El mapa continua limitat a SUPERADMIN. USER/visitant no creen el panell ni
fan consultes a les API de mapa. No es modifica l'autorització backend,
cap visibilitat persistent ni cap estació. L'estat productiu de
`/api/v1/map/stations` comunicat (`features: []`) no s'ha reconsultat.

## Desplegament mínim proposat (operador; no executat)

No cal reconstruir ni reiniciar backend, ni executar SQL, migracions o cron.
`docker-compose.yml` serveix `./site` com a `/srv` al servei `caddy`.
El checkout productiu és brut: **no s'hi executa `git pull`, `git checkout`,
ni se substitueix el directori `site/` o el Caddyfile sencer.** L'operador
descomprimeix el build local en un staging propi i usa `sudo` només sobre els
fitxers Meteo indicats.

### Primera transició (sense releases versionades prèvies)

Des de l'arrel del compose al VPS, després de copiar-hi el directori de build
a una ruta temporal no servida (per exemple `/tmp/meteolord-web-REVIEW`):

```sh
cd /camí/al/checkout-productiu
readonly STAGE=/tmp/meteolord-web-REVIEW
readonly SITE_DIR="$PWD/site"
readonly RELEASE="$(sed -n 's/.*\"version\":\"\([0-9a-f]\{64\}\)\".*/\1/p' "$STAGE/release.json")"
test -n "$RELEASE" && test -d "$STAGE/releases/$RELEASE" || exit 1
test ! -e "$SITE_DIR/releases/$RELEASE" || { echo 'release ja existent: ABORT'; exit 1; }
sudo install -d -m 0755 "$SITE_DIR/releases/$RELEASE"
sudo cp -r "$STAGE/releases/$RELEASE/." "$SITE_DIR/releases/$RELEASE/"
sudo chown -R root:root "$SITE_DIR/releases/$RELEASE"
test "$(find "$STAGE/releases/$RELEASE" -type f | wc -l)" = "$(sudo find "$SITE_DIR/releases/$RELEASE" -type f | wc -l)" || exit 1
```

Aquest pas crea el primer arbre versionat complet abans que cap document el
referenciï. No elimina `site/src`, `site/compte`, `site/mapa` ni
`site/map-assets`: les pestanyes antigues encara els poden demanar. Per a
releases posteriors s'aplica el mateix bloc amb un hash nou; si el directori
de destí ja existeix, s'atura i no se sobreescriu.

### Activació i rollback

1. Abans de cap canvi, crear una còpia només dels fitxers estables de Meteo i
   del Caddyfile: `index.html`, `compte/index.html`, `mapa/index.html`,
   `assets/icons/site.webmanifest`, `release.json` si existeix, i
   `Caddyfile`. La còpia ha de ser fora de `site/` i protegida amb `sudo`.
2. Amb l'arbre nou ja complet, publicar els documents estables amb temporals
   del mateix directori i `sudo mv` atòmic. Exemple de patró, a repetir per a
   `index.html`, `compte/index.html`, `mapa/index.html` i el manifest:

   ```sh
   sudo install -o root -g root -m 0644 "$STAGE/index.html" "$SITE_DIR/.index.html.NEW"
   sudo mv -f "$SITE_DIR/.index.html.NEW" "$SITE_DIR/index.html"
   ```

   No es publica encara `release.json`. El runtime estable de producció no
   canvia: Caddy continua reescrivint `/meteo/runtime-config.js` a
   `runtime-config.production.js`.
3. Aplicar **només** la línia `Cache-Control` del handle `/meteo*` al
   Caddyfile productiu ja existent. No copiar ni substituir el Caddyfile del
   repositori perquè conté les rutes de les altres aplicacions. Com que és un
   bind mount de fitxer, editar-ne el contingut sense reemplaçar l'inode i
   comprovar dins del contenidor abans de recarregar. Des de l'arrel del
   compose productiu:

   ```sh
   docker compose -f docker-compose.yml exec -T caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
   docker compose -f docker-compose.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
   ```

   **Aturar-se si validate falla.** No executar `compose up`, migracions ni
   reinicis d'altres serveis. Només l'operador autoritzat executarà això.
4. Publicar `release.json` **l'últim**, també amb temporal i `sudo mv` atòmic,
   quan tots els HTML i recursos ja estiguin disponibles:

   ```sh
   sudo install -o root -g root -m 0644 "$STAGE/release.json" "$SITE_DIR/.release.json.NEW"
   sudo mv -f "$SITE_DIR/.release.json.NEW" "$SITE_DIR/release.json"
   ```

   En la primera
   transició els documents antics no el consumeixen; els nous el faran servir
   en tornar al primer pla. Aquest ordre evita anunciar una release incompleta.
5. Verificar `/meteo/`, `/meteo/?v=2.2.8`, `/meteo/runtime-config.js`,
   `/meteo/release.json`, manifest, imports i worker versionats: 200,
   tipus correcte i `Cache-Control: no-store, max-age=0`; runtime production,
   `API_BASE: '/api'`, `SYNTHETIC_DATA: false`. Comprovar a mòbil reobertura,
   nom de sessió i mapa únicament per SUPERADMIN. Cap navegador ha d'accedir
   directament a Grafana ni a `/api/v1/admin/grafana/*`.

Rollback de frontend: abans d'esborrar res, restaurar amb `sudo mv` la còpia
dels tres HTML estables, manifest i `release.json` (o eliminar-ne el fitxer si
no existia abans) de manera coherent. Conservar l'arbre
`releases/<sha256>` publicat: és innocu i permet que pestanyes ja obertes
acabin les seves càrregues. No tocar backend ni BD. El canvi de cache pot
conservar-se; si és imprescindible revertir-lo, editar només la mateixa línia
del handle Meteo i tornar a validar/recarregar Caddy.

## Runner automatitzat de frontend

[`scripts/deploy-meteolord-frontend.sh`](../../scripts/deploy-meteolord-frontend.sh)
automatitza el contracte de frontend sense tocar backend, PostgreSQL, dades,
migracions, cron, volums ni altres contenidors. Requereix `bash`, `flock`,
`tar`, `sha256sum`, `curl`, Docker i una imatge local revisada de Node. Node
no s'instal·la al VPS: el build corre en un contenidor sense xarxa, read-only,
sense capabilities i amb el codi font muntat només de lectura.

S'executa amb `sudo`, pren un lock exclusiu a
`/var/lib/meteolord-frontend-deploy/deploy.lock` i desa backups al mateix
directori. No mostra credencials. Per defecte treballa contra
`/home/deploy/tecnolord-apps/site` i només llegeix el Caddyfile existent per
verificar `no-store, max-age=0`: no l'edita, copia ni recarrega.

Abans del primer ús, l'operador ha de tenir la imatge revisada:

```sh
docker image inspect node:20-alpine >/dev/null
```

Si no hi és, el runner s'atura sense publicar; obtenir-la és una acció separada
de l'operador, mai un pull automàtic del runner.

### Font explícita: commit o paquet

Amb un commit que ja existeix al checkout brut, el runner usa `git archive`;
no canvia cap fitxer Git ni executa `git pull`:

```sh
sudo /ruta/al/runner/deploy-meteolord-frontend.sh --check --commit <sha>
sudo /ruta/al/runner/deploy-meteolord-frontend.sh --deploy --commit <sha>
```

Si el commit no existeix al VPS, es prepara localment un paquet de font
versionat, sense `.env`, `node_modules`, dumps ni artefactes:

```sh
git archive --format=tar.gz --output meteolord-frontend-source.tar.gz <sha>
```

Es copien el paquet i el runner a una ruta temporal no servida. No es copia res
sobre el checkout. Per conservar la recuperació, l'operador pot instal·lar el
runner explícitament amb propietari root:

```sh
sudo install -o root -g root -m 0755 /tmp/release/scripts/deploy-meteolord-frontend.sh /usr/local/sbin/meteolord-frontend-deploy
sudo /usr/local/sbin/meteolord-frontend-deploy --check --package /tmp/meteolord-frontend-source.tar.gz
sudo /usr/local/sbin/meteolord-frontend-deploy --deploy --package /tmp/meteolord-frontend-source.tar.gz
```

`--package` és un paquet de font amb `site/` i
`scripts/frontend/build-meteo.js`, mai un build ja generat.

### Modes i recuperació

- `--check` construeix en una àrea temporal, comprova `SHA256SUMS`, URL
  versionades, cache activa i capçaleres públiques. No escriu dins `site/`.
- `--deploy` repeteix aquestes comprovacions, publica primer
  `releases/<sha256>/`, n'avalua les sumes, desa backup, substitueix els
  documents estables atòmicament i només després publica `release.json`.
  Amb el mateix hash, fitxers i integritat actius acaba amb
  `DEPLOY_NO_CHANGES` sense fer escriptures innecessàries.
- `--rollback` restaura el backup pendent d'una publicació interrompuda o el
  darrer backup complet. Restaura `release.json` l'últim i no elimina cap
  release, de manera que les PWA obertes poden acabar les càrregues.

Si un deploy falla, queda `pending-backup` al directori d'estat. No intenta
reparar res automàticament: cal revisar l'error i executar:

```sh
sudo /usr/local/sbin/meteolord-frontend-deploy --rollback
```

Després de revisar l'evidència del rollback es pot reintentar el deploy amb
una nova validació. No hi ha `docker compose up`, reinici global, migració ni
cap operació contra la base de dades.

## Proves locals

```sh
node --test backend/test/unit/meteo-release.test.js backend/test/unit/meteo-client-session.test.js backend/test/unit/production-meteo-csp.test.js backend/test/unit/meteo-screen-ui.test.js backend/test/unit/grafana-meteo-ui.test.js
MAP_CHROME=/usr/bin/google-chrome node backend/scripts/check-meteo-update-browser.js
H14_RUNTIME=production H14_BUILD=1 MAP_CHROME=/usr/bin/google-chrome node backend/scripts/check-h14-meteo-map-browser.js
H14_RUNTIME=local MAP_CHROME=/usr/bin/google-chrome node backend/scripts/check-h14-meteo-map-browser.js
MAP_CHROME=/usr/bin/google-chrome node backend/scripts/check-g06-meteo-browser.js
MAP_CHROME=/usr/bin/google-chrome node backend/scripts/check-map-browser.js
cd backend
npm test
```

La prova de cache usa HTTP real i cap intercepció Playwright (aquesta
deshabilitaria la cache). Escalfa la cache d'una release, canvia només un
mòdul transitiu i CSS i comprova la nova UI després de reactivar el document,
conservant la URL d'inici antiga amb `?v=2.2.8`. H14 valida també el build
real, login/logout entre pestanyes, recuperació de sessió, nom llarg i
navegació mòbil, vent zero/null i absència de mapa/consultes per USER/visitant.
Totes les APIs d'aquestes proves són simulades; no modifiquen cap BD.
