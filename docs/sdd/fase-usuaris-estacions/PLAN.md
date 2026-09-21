# Pla tècnic

Candidat, 2026-09-18. Contracte: [SPEC](SPEC.md); execució: [TASKS](TASKS.md).

## Arquitectura i fronteres

Conservar serveis Express i clients estàtics. Introduir repositoris pg injectables i serveis `identity`, `stationPolicy`, `stationCatalog`, `stationRead`, `connectorRegistry`, `viewPreference`. Reutilitzar geometria/qualitat/publicació MAP-A darrere del catàleg persistent, amb fixtures i rellotge injectats. Cap navegador truca proveïdors meteorològics directament.

Flux: connector fix → normalització/validació → snapshot de font → política per recurs/camp → DTO explícit → mapa/selector/Meteo. El gateway s'aplica també a `/api/mesures` i totes les rutes antigues de lectura, incloses agregacions i historials. Sense estació explícita, resoldre la global pública; mai agregar totes les estacions. Eliminar SELECT m.* de respostes públiques; `extres`/interiors no publicables per defecte. Els serveis d'ingesta amb API key no són sessions d'usuari.

API proposada sota `/api/v1`: `/auth/{request,verify-email,login,logout,recover,reset}`, `/me`, `/me/stations`, `/me/preferences`, `/stations` (selector públic), `/stations/:id/{current,history}`, `/me/map`, `/admin/{accounts,public-view,sources,external-stations,imports,station-history-policies}`. Reutilitzar ruta pública de mapa i versió existents. Lectures autenticades privades `Cache-Control: no-store`, `Vary: Cookie`; no ServiceWorker/localStorage de dades privades. Autorització precedeix consulta i serialització: lectura per propietari o SUPERADMIN, mutació de metadades/connector amb predicate owner_id al SQL; política d’històric només amb rol SUPERADMIN. La vista administrativa de privades és autenticada i sense cache compartida. UUID públic no substitueix aquesta comprovació. Una clau API no pot cridar endpoints d'usuari.

Cache pública només de DTO publicable i versió actual; revocació incrementa versió i invalida cache en la mateixa transacció. Cap CDN ni browser cache persistent per observacions en aquesta fase; resposta pública revalida permís abans de servir snapshot. El client retira immediatament dades en rebre una nova versió; desconnexió mostra estat desconnectat i buida contingut revocable. No es pot retirar allò ja vist per un tercer, però cap lectura nova el retorna.

## Persistència additiva

| Entitat | Camps i invariants |
|---|---|
| auth.usuaris ampliat | status PENDING_EMAIL/PENDING_APPROVAL/APPROVED/REJECTED/SUSPENDED, application_role USER/SUPERADMIN; actiu compatible. Comptes preexistents sense prova d'identitat no adquireixen login ni rol automàtic |
| auth.credentials/sessions/verification_tokens/recovery_tokens | password_hash+paràmetres; digest de token aleatori, user_id, expiracions, revoked_at. Tokens de verificació i recuperació independents, d’un sol ús, caducitat 30 min; aprovació impossible abans de verificació |
| meteo.estacions ampliat | Manté PK/FK/codi existents; public_id UUID únic, owner_id nullable, management_kind USER/ADMIN, lifecycle DRAFT/ACTIVE/RETIRED, visibility PRIVATE/PUBLIC, revision. USER exigeix owner; no unicitat owner_id |
| station_locations | private_geometry PostGIS Point4326; public_geometry separada; mode/accuracy_m/provenance/reference/verified_at; valors desconeguts NULL. Generalització en sistema mètric local, estable i provada |
| station_connectors | station_id, type, configuration JSON validada segons tipus, enabled, status; un connector principal per estació en aquesta fase. Config sense secrets |
| connector_secrets | ciphertext AES-256-GCM, nonce, auth_tag, key_id; clau muntada fora BD/repositori. Rotació amb re-xifrat verificat abans de retirar antiga clau |
| source_bindings | source_namespace + external_id únics quan validats, station_id; alias explícits amb evidència. Inventari ID diferent d'ID sensor |
| current_snapshots | un últim snapshot per binding; observed_at, received_at, fetched_at, mesures normalitzades, qualitat per camp, error de proveïdor separat. Històric separat i optatiu per estació |
| station_history_policies/history_capture_runs | station_id PK, enabled, capture_interval_minutes, retention_days, revision, last_run_at; admin actor i auditoria. Període validat >= cadència de font, entre 5 i 1440 min; retenció entre 1 i 3650 dies; sense política activa no capturar ni purgar. Índex (station_id, observed_at) i clau única (station_id, observed_at, source_binding) per idempotència |
| estimation_points | UUID estable, slug únic, label, reference_geometry, provenance, provider, enabled; naturalesa ESTIMATED immutable. No membres ni falsa estació física |
| user_preferences | user_id PK, default_station_id FK nullable, revision; es comprova propietat/activitat transaccionalment |
| public_view_config | singleton, public_station_id, card_ids ordenats, revision; validació de publicació també en lectura |
| import_batches/import_rows/manual_overrides/audit_events | hash d'entrada, namespace, inventory_code, raw candidat, errors/conflictes, aplicació i actor. No secrets en audit; override per camp amb origen/autor/data |

No reconvertir arbitràriament `membres_estacio.editor/lector` en permisos nous; només owner per editar estacions pròpies, i SUPERADMIN per llegir totes i administrar polítiques d’històric en aquesta fase. Comptes i estacions legacy sense correspondència fiable queden pendents de reconciliació; només l'estació pública actual identificada explícitament manté publicació. Cap regla «totes les antigues són públiques».

## Identitat i secrets

Contrasenyes amb scrypt asíncron de Node, salt únic, N=2^17/r=8/p=1, maxmem suficient (256 MiB), concurrència limitada a 2 i límit d'intents per compte/IP; calibrar a entorn local. Justificació: primitive disponible sense stack nou, conforme a [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Sessions aleatòries 32 bytes, només digest a BD; idle 30 min, màxim 12 h, rotació al login/elevació, revocació logout/suspensió/reset. Cookie HttpOnly, SameSite=Lax, Secure amb HTTPS; excepció HTTP només loopback local explícit. CSRF synchronizer token i validació Origin per mutacions; CORS mateix origen. Recuperació i verificació d’email amb resposta genèrica contra enumeració, tokens separats de 30 min i un sol ús; adaptador mail amb fake outbox exclusiu de tests, mai ruta pública de tokens. Sol·licitud pública → PENDING_EMAIL → PENDING_APPROVAL → APPROVED; rebutjar/suspendre és acció admin auditada. No es pot iniciar sessió abans d’APPROVED.

Credencials Ecowitt: application key, API key, MAC/identificador requerit pel connector; formulari les envia per establir/substituir, mai les rep. Distingir application key administrada i API key de propietari si el proveïdor ho exigeix; el contracte del connector valida completitud abans d'habilitar. No mutar process.env per estació. Endpoint/provider fixos; rebutjar URL/host client, redirects no permesos i timeout; secrets en query upstream només dins client servidor amb logs sanejats. Errors retornen codis, no URL completa. Bootstrap admin CLI explícit amb identitat confirmada i auditoria; no inferir rol des de creador de mesures.

## Connectors, refresc i qualitat

| Font | Abast i configuració | Cadència / cache |
|---|---|---|
| Ecowitt | Estacions pròpies i legacy; credencials + identificador, posició declarada separada | Ingesta 15 min; frontend 30 s llegeix snapshot |
| Open-Meteo | Sis punts administrats; coordenada de referència contrastada, font i atribució | Ingesta 15 min; cache upstream 120 s, coalescència |
| Grafana | Connector backend amb objectiu de producció, ID validat, queries fixades; cap PromQL del client. Exposició pública només amb drets de redistribució verificats | Proposta 5 min, només si UE-T12 confirma límits; no activar altrament |

Workers amb lease BD per binding per evitar ingesta doble; màxim 2 consultes simultànies, timeout 10 s, cos màxim 2 MiB, màxim 2 reintents amb backoff exponencial i jitter (respectar Retry-After). Cap reintent síncron que bloquegi UI. Dades incompletes actualitzen camps disponibles sense atribuir temps nou a valors antics. Null, no finit i valor fora de rang són absència amb motiu; 0 vàlid es preserva. Unitats canòniques °C, %, m/s, mm, hPa; conversió només si unitat de font coneguda.

Rellotge UTC injectat: fresca fins 2 intervals de font; antiga entre >2 i 8 intervals, visible amb avís/hora; >8 intervals obsoleta, temperatura actual —, últim valor només en detall com a antic. Timestamp futur >5 min rebutjat; manca de timestamp no es presenta com a observació recent. Error de xarxa no actualitza observed_at; received_at/fetched_at no són el moment meteorològic. Control per camp, proves exactes dels llindars. Aquest contracte substitueix el llindar uniforme de 2 h de la preview, sense reescriure dades històriques perdudes pel defecte zero.

## Històrics configurables per estació

UE-D05 preval sobre la limitació provisional del pla anterior i concreta DCF-04B. El scheduler conserva el snapshot actual per a totes les fonts i només escriu a `meteo.mesures`/repositori d’històric si la política d’aquella estació està activada. Per a l’estació MeteoLord legacy, mantenir temporalment la captura històrica existent com a mode de compatibilitat fins que l’admin fixi una política explícita; durant aquest interval no s’hi aplica cap purga nova. Així la migració no interromp una sèrie existent. La primera configuració mostra la cadència actual i previsualitza el recompte afectat per la retenció abans d’activar la purga. L’admin defineix període i retenció amb revisió optimista; el primer valor no es duplica si el worker repeteix un run. Un lease per estació i finestra de captura fan idempotent la inserció. Si la font no té dada recent, no s’inventa un punt nou. La disponibilitat d’històric Grafana exigeix tant UE-T12/14 com l’abast de drets adequat; no es persisteixen dades reals fins validar aquest dret.

Purga programada per estació i en lots, amb límit temporal calculat en UTC i comparació estricta `observed_at < cutoff`; mai una instrucció sense predicate station_id. Desactivar la política atura captura i purga, però no esborra automàticament punts guardats. Canviar retenció cap avall mostra a l’admin el recompte que s’esborraria. Per a la primera política d’una estació legacy, exigir la mateixa previsualització abans de permetre una purga dels històrics existents. Historial públic/privat passa sempre per stationPolicy; admin pot llegir qualsevol estació, sense obtenir permís per editar metadades alienes. Proves: dues polítiques diferents, una sense política, llindar temporal exacte, runs duplicats, canvi de retenció i migració de dades legacy.

## Importació i Grafana

[INVENTARI](INVENTARI.md) és evidència de planificació, no seed executable. Pipeline staging → validació → dry-run de diferències → apply admin transaccional amb revision/idempotency key. Clau `(namespace, inventory_code)` per fila; binding `(source_namespace, external_id)` només validat. Mateix hash és no-op; nou hash actualitza candidats, mai override manual. Filera absent en nova versió es marca absent, no es retira ni esborra automàticament. Conflictes d'ID bloquegen fila. Noms/coordenades pròximes només generen candidats de revisió; DCF-11 prohibeix fusionar sèries per semblança.

Spike UE-T12: màxim 4 h de treball, dues consultes conegudes i finestra màxima 15 min, sense escaneig. Revalidar dashboard/datasource, accés backend autoritzat, esquema frames/labels/timestamps/unitats, límits, drets de persistència i mapa ID↔inventari. No dependre del DOM. Històric SPIKE-04 identifica Prometheus SWLXFBHvz, `/api/ds/query`, org11, metrics xoic_I2CAT_*; són pistes datades, no configuració confirmada avui. Desar extractes sanejats i resultat VIABLE/CONDICIONAL/NO VERIFICAT amb motius. Si no hi ha accés o autorització, aturar connector real i continuar catàleg intern amb fixtures. Pluja queda desactivada fins unitat/semàntica comprovades. Prova de dashboard públic no equival a llicència de republicació.

## Migració i reversió

1. Inventariar migrations existents i reservar següents números lliures després de 0002; no modificar checksums aplicats. Treball inicial exclusivament sobre BD sintètica descartable del wrapper.
2. Afegir camps/tables nullable/defaults restrictius, validar constraints després del backfill. Mantenir IDs/FK de mesures. Dry-run de correspondència legacy amb aprovació de mappings realment desconeguts.
3. Primer desplegar localment les lectures protegides i esquema compatible, després permetre crear/ingestar estacions privades. Mai backend antic contra BD amb privades: abans de revertir codi, deshabilitar ingesta i totes les lectures externes o mantenir gateway segur.
4. Testar upgrade des de fixture antiga, segona execució sense canvis i fallada a mig procés amb rollback transaccional. Runner existent forward-only; no inventar down automàtic destructiu. En BD de test restaurar snapshot/volum aïllat; en futur entorn real, backup verificat i migració compensatòria, fora d'aquest encàrrec.
5. Config/version/cache i preferències s'actualitzen transaccionalment. Retirada és soft-delete; cap purga immediata d’històrics en retirar. La purga programada només actua sobre estacions amb política activa després de la previsualització requerida per llegat. Rollback d'import només camps d'aquell lot sense canvis manuals posteriors; altrament conflicte explícit.

## Verificació

Fixtures inventades, dos propietaris, admin, visitant, pendent de verificació/pendent d’aprovació/suspès, pública/privada/retirada/sense geometria, font interna, valors zero/null/antics. Cap dada real del PDF als assets públics ni a fixtures de navegador. Reutilitzar Node test runner, pg real de test, mocks de fetch/clock i Playwright. Integració DB obligatòria en gate: un SKIP per configuració absent no és PASS. Proves reals opcionals en comanda separada i amb consentiment d'ús de font; no necessàries per a la suite.

Traçabilitat de proves per acceptació a TASKS. Regressió protegeix Cabals, Històrics i Previ, rutes directes, estat d'error, mapa sense WebGL/xarxa i accessibilitat. QA final distingeix proves executades, no executades, bloquejades i limitacions manuals. Estat actual: cap prova d'aquest pla executada.

### Selecció tipada d'estacions i estimacions

El selector retorna recursos amb `kind=STATION|ESTIMATION` i identificador estable; la consulta d'estimacions usa `/api/v1/estimations/:id/current`, mai fa veure que existeix un `estacio_id` físic. El mapa pot combinar DTO de les dues naturaleses, sempre etiquetats. Preferència personal i estació global admeten només STATION; seleccionar una estimació és temporal. Estimacions no tenen historial observat ni membres. Això evita introduir punts de model a les FK de mesures o eliminar estacions en substituir les localitats.
