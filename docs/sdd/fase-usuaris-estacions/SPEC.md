# Especificació funcional

Candidata, 2026-09-18. Requisits: [REQ](REQ.md). Decisions adoptades i validacions tècniques: [DECISIONS](DECISIONS.md).

## Abast i exclusions

Comptes, múltiples estacions Ecowitt pròpies, visibilitat, preferència, vista pública configurable, mapa i catàleg extern administrat, estimacions de sis localitats. Es reutilitzen les targetes vent, temperatura, pluja, pressió, humitat i UV, els gràfics existents i la llista alternativa al mapa. Fora d'abast: observacions manuals, col·laboradors/editor compartit, administració d'estacions alienes, editor visual, històric automàtic per a totes les estacions, desplegament i publicació de Grafana sense dret exprés.

## Matriu d’accés aprovada (UE-D02)

| Recurs / acció | Visitant | Propietari aprovat | Altre usuari | Admin |
|---|---|---|---|---|
| Dades d'estació pública elegible | Lectura pública | Lectura | Lectura pública | Lectura pública |
| Privada: nom, dades i coordenades exactes | No | Sí, només pròpia | No | Sí, de totes les estacions |
| Crear/editar/retirar estació d'usuari | No | Només pròpies | Només pròpies | Només pròpies |
| Credencial connector | No | Escriure/substituir pròpies, mai llegir secret | No | Escriure/substituir connectors propis o fonts administrades; secrets aliens mai llegibles |
| Preferència personal | No | Només pròpia | Només pròpia | Només pròpia |
| Vista global / font administrada / import | No | No | No | Sí |
| Dades Grafana INTERNAL_ONLY | No | No | No | Només espai intern autoritzat |
| Aprovar/suspendre comptes | No | No | No | Sí; comptes suspesos no accedeixen a les seves privades |
| Política d’històric per estació | No | No | No | Sí, també per estacions d’altres propietaris; sense editar-ne les altres configuracions |

Admin és un rol d’aplicació, diferent de propietat. La lectura d’una privada aliena i la configuració de la seva política d’històric no concedeixen edició del nom, visibilitat, ubicació ni connector que pertanyen al propietari. Recursos inexistents o no autoritzats retornen el mateix 404; operacions administratives sense rol, 403. Respostes, recomptes, bounds, cerca, sitemap, històrics i caches no han de revelar privades. Comptes pendents/suspesos no accedeixen a dades privades ni publiquen estacions.

## Fluxos i acceptació

| ID | Comportament verificable |
|---|---|
| UE-CA01 | Sol·licitud pública crea un compte pendent de verificació; token d’email d’un sol ús i caducable el passa a pendent d’aprovació, sense iniciar sessió. Només l’admin l’aprova. Aprovat inicia sessió, surt i recupera accés; sessió anterior queda revocada després de recuperació/suspensió. Manipular rol no eleva privilegis; bootstrap repetit no crea altres administradors |
| UE-CA02 | A i B tenen dues estacions cadascun; A crea, modifica i retira només les seves. Formulari separa nom/descripció, ubicació, connector i secrets. Una estació nova neix esborrany privat; no publica fins a validació i consentiment. Retirada l'exclou de lectures i ingesta; no esborra mesures existents |
| UE-CA03 | Preferència pròpia persisteix entre dispositius/sessions i no afecta global ni B. Triar temporalment una pública de B no altera preferència. Retirada/desactivació causa fallback global i avís; error de font manté estació seleccionada. Sense global vàlida es mostra «Cap estació pública configurada», sense escollir una tercera arbitràriament |
| UE-CA04 | Admin tria estació pública elegible i ordre/subconjunt no buit de les sis targetes; visitant i usuari sense preferència veuen configuració. Versió desfasada de formulari retorna conflicte, no sobreescriu canvis. Un usuari normal no pot modificar-la |
| UE-CA05 | Mapa públic mostra només elegibles amb geometria pública; propietari veu també les seves privades en capa diferenciada autenticada; l’admin pot consultar totes les privades en vista administrativa autenticada. Canviar a privada elimina dades de totes les superfícies públiques en la següent lectura i invalida versió/cache. Selector i Meteo apliquen el mateix permís. Una pública amb ubicació HIDDEN pot ser consultable al selector però no apareix al mapa ni als seus recomptes |
| UE-CA06 | Admin corregeix coordenades de font administrada; es validen longitud [-180,180], latitud [-90,90], nombres finits i ordre lon/lat explícit. Es conserva procedència, precisió i auditoria. Cap mapa amb coordenada desconeguda inventada |
| UE-CA07 | Reimportar mateix inventari no crea duplicats ni canvis. Una correcció manual sobreviu a una versió posterior; divergència genera conflicte revisable. ID incomplet o mapping incert queda en quarantena. TEST01–03 no es publiquen automàticament. Co-localització o mateix nom no fusiona observacions |
| UE-CA08 | Conjunt de punts estimats exactament {Manresa, Solsona, Berga, Vic, La Seu d’Urgell, Andorra}; no queden altres estimacions actives. Estacions reals es conserven. «Estimació» apareix a marcador accessible, popup, llista, selector, detall i targeta Meteo; font, referència geogràfica i temps de dada disponibles. El punt «Andorra» usa Andorra la Vella com a referència verificada i identificada |
| UE-CA09 | Zero vàlid es mostra com zero; absència com —, mai com zero. Error parcial no elimina altres fonts. Dades antigues porten estat i hora; obsoletes no es mostren com a actuals. Resposta no associa una dada d'una estació a una altra ni una observació a una estimació |
| UE-CA10 | Tests amb IDs/URLs manipulats impedeixen lectura/escriptura aliena, inclosos legacy, history i caches. Secrets no apareixen a API, HTML, errors, traces o logs; URLs arbitràries rebutjades. Peticions de mutació sense CSRF vàlid fallen |
| UE-CA11 | Base sintètica vella migra conservant estació, mesures i pantalles Meteo/Cabals/Històrics/Previ. Suite habitual sense xarxa externa; mode live explícit separat. Accés directe /meteo/ i /meteo/mapa/ sense 404, teclat, mòbil 375px, llista utilitzable sense mapa. No es declara conformitat WCAG completa sense revisió manual pendent |
| UE-CA12 | Admin activa/desactiva històric per estació i defineix periodicitat i retenció dins dels límits validats. Només les seleccionades guarden punts; captura repetida no duplica. Purga elimina només punts anteriors a la retenció de cada estació activa, preserva la resta i registra recompte. Històrics legacy es mantenen durant la migració; qualsevol primera purga d’una estació legacy exigeix previsualització de l’impacte abans d’activar la política. Owner/altre usuari no canvien política; lectures d’històric respecten la mateixa autorització que dades actuals |

## Geometria, font i naturalesa

Tres dimensions separades: origen (Ecowitt/MeteoLord/Grafana/Open-Meteo), naturalesa (observació/estimació) i precisió/procedència de posició. Una observació en posició aproximada continua sent observació. Conservar [DCF-08](../DCF-08-v1.md): estació pròpia MeteoLord amb política aproximada 100 m; estació d'usuari com a mínim 1 km, alternatives 5/10 km o HIDDEN. Generalització estable al servidor en metres; cap coordenada exacta d'usuari a API pública. Una correcció exacta administrativa no implica autorització de publicar-la.

Publicació requereix font autoritzada, estació activa pública, propietari aprovat quan aplica, camps permesos i qualitat; mapa exigeix a més geometria pública vàlida. Estació sense dades mostra estat, no temperatura fictícia. Grafana INTERNAL_ONLY preval encara que hi hagi un duplicat públic. Estacions sense política d’històric activa mostren explicació en lloc de gràfic buit enganyós.
