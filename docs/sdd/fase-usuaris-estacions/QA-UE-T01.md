# Evidència UE-T01 — preview local sintètica

Data: 2026-09-18. Estat: **FETA**. Aquest QA només cobreix UE-T01, no la fase d'identitat ni la gate final.

## Canvi i ús

[serve-map-demo.js](../../../backend/scripts/serve-map-demo.js) arrenca en mode `synthetic` per defecte; `MAP_PREVIEW_MODE=live` és l'única activació explícita de la preview real. Valors diferents fallen en arrencar. En mode sintètic, [syntheticPreview.js](../../../backend/routes/syntheticPreview.js) serveix Meteo, Cabals i Previ a partir de `backend/test/fixtures/{meteo,hidro,forecast}.json`; mapa i PMTiles conserven les fixtures MAP-A. No hi ha proxy real ni connector que faci `fetch` upstream en aquesta composició. El CSP sintètic només permet mateix origen. Les consultes de fixture validen paràmetres i no retornen `extres` ni camps de cas.

Des de l'arrel del repositori, amb `backend/node_modules` disponible:

```sh
node backend/scripts/serve-map-demo.js
# http://127.0.0.1:8096/meteo/
# http://127.0.0.1:8096/meteo/mapa/
```

La preview real local es pot obrir expressament amb `MAP_PREVIEW_MODE=live node backend/scripts/serve-map-demo.js`; aquesta ordre necessita xarxa i no forma part del test offline. No hi ha migració ni base de dades implicada en UE-T01.

## Proves executades

| Comanda, des de `backend/` | Resultat |
|---|---|
| `node --test test/http/ue-offline.test.js` | PASS 2/2: rutes directes Meteo/mapa 200, fixtures, 0 vàlid, paràmetres rebutjats, mode erroni refusat |
| `node scripts/check-ue-offline-browser.js` | PASS: Chrome headless a 375 px; Meteo, Cabals, Històrics, Previ i mapa; 0 peticions externes, 0 errors de pàgina, sense desbordament horitzontal |
| `npm test` | Exit 0: 192 tests, 173 PASS, 0 FAIL, 19 SKIP. Els 19 SKIP són integració preexistent sense BD activa; no acrediten la futura migració UE-T02 |
| `git diff --check` | PASS |

Primer intent de navegador va expirar esperant `networkidle` en una SPA amb refresc periòdic; es va substituir per espera d'elements. La prova següent va detectar el límit de 300 per a la petició YTD de Cabals (`limit=5000`); l'API sintètica ara l'accepta sense excedir les quatre files de fixture. La darrera execució de les comprovacions indicades és correcta. No s'ha executat la gate Docker ni un test contra fonts reals, que no formen part de l'acceptació d'aquest aïllament.

Reversió: tornar la composició de preview anterior sense alterar fixtures o dades; si alguna vegada s'introdueixen privades, mai usar el proxy antic com a via de lectura sense policy.
