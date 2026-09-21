# QA — previsualització local amb dades reals

**Data:** 2026-09-18  
**Abast:** només `127.0.0.1:8096`; no és la validació formal MAP-B/MAP-C ni un desplegament públic.

## Fonts i presentació

- `/meteo/` consulta l'API pública de mesures de MeteoLord a `tecnolord.cat` a través d'un proxy local del mateix origen. El proxy elimina `id`, `estacio_id` i `extres` de la resposta de Meteo.
- `/meteo/mapa/` mostra l'observació pròpia de MeteoLord amb posició aproximada a la zona del Solsonès, més cinc punts de temperatura actual procedents d'Open-Meteo. Aquests cinc valors són **estimacions de model**, no observacions d'estacions. La pantalla identifica cada font.
- La base cartogràfica real usa tessel·les d'OpenStreetMap amb atribució visible. L'ús és interactiu i local, sense descàrrega massiva.
- Les dades del mapa es conserven en memòria durant 120 s. Un valor de més de dues hores no es presenta com a temperatura actual. Si ambdues fonts fallen, l'API del mapa retorna 503 i el client buida les dades verificades.
- `MAP_PREVIEW_MODE=synthetic` manté disponible el mapa MAP-A original amb el territori PMTiles de prova. El panell Meteo continua connectat a les dades públiques reals en aquesta previsualització.

## Comprovacions executades

| Control | Resultat |
|---|---|
| API pública MeteoLord (`limit=1`) i proxy local | HTTP 200; observació recent, sense camps interns al proxy |
| API local del mapa | HTTP 200; sis punts amb identificació de font i valors actuals |
| Proves HTTP amb fonts simulades | 5/5 PASS; separació observació/model, versió compartida, dada obsoleta i fallada de fonts |
| Configuració frontend | PASS; mode real local sense analítica ni enllaços externs de producte |
| Navegador real | PASS; `/meteo/` sense 404 d'API, mapa amb tessel·les OSM, vista 1366 px i 375 px sense desbordament; captures a `artifacts/live-local-preview/` |
| Regressió MAP-A sintètica | PASS; suite de navegador completa en servidor aïllat |

La previsualització real necessita xarxa. Abans d'un desplegament públic cal revisar la llicència aplicable i els límits de les fonts externes, la publicació de la ubicació pròpia i els criteris pendents de la fase MAP-B. La [documentació d'Open-Meteo](https://open-meteo.com/en/docs) descriu els valors actuals com a dades de model; la [política de tessel·les d'OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/) exigeix atribució i ús de memòria cau.
