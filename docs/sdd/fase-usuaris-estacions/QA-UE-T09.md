# QA UE-T09 — Preferència persistent i selecció temporal

Data d'execució: 2026-09-20. Entorn: contenidors locals aïllats i PostgreSQL/PostGIS temporal amb dades exclusivament sintètiques. No s'ha contactat cap proveïdor extern ni s'ha modificat cap base de dades real.

## Resultat implementat

El servei [userPreferenceService.js](../../../backend/services/userPreferenceService.js) utilitza `auth.user_preferences`, creada additivament a UE-T02. La lectura valida dins una transacció que la predeterminada continuï sent pròpia i `ACTIVE`; si ha deixat de ser accessible, elimina la referència, incrementa la revisió i retorna `invalidated=true`. Una fallada del connector o una lectura antiga no modifica la preferència.

La ruta [preferences.js](../../../backend/routes/preferences.js) exposa lectura i escriptura sota `/api/v1/me/preferences`. Les mutacions exigeixen sessió, mateix origen, CSRF, propietat, activitat i revisió optimista. Una estació pública aliena i una estació pròpia en esborrany retornen el mateix `404`; no es revela l'existència d'una estació aliena. Les respostes personals són `no-store` i varien per cookie.

La pantalla [meteoScreen.js](../../../site/src/ui/screens/meteoScreen.js) combina estacions públiques i pròpies. Una URL o el selector només canvien l'estació temporal i actualitzen `station_id`; únicament **«Estableix com a predeterminada»** escriu al servidor. `stationId` ja no es desa a `localStorage`, i el logout elimina l'estat antic. Una URL no autoritzada mostra un error genèric i una acció per tornar a la vista pública. Sense configuració global es mostra «Cap estació pública configurada».

## Evidència executada

- Contracte unitari i HTTP: 4/4 PASS.
- Integració `ue_prefs` sobre una base temporal: PASS. Verifica dues sessions d'A, compte B independent, privada pròpia, pública aliena temporal, aliena rebutjada com a default, pròpia inactiva rebutjada, conflicte de revisió, error `HTTP_503` sense invalidació, retirada amb fallback i logout.
- Navegador [check-ue-preferences-browser.js](../../../backend/scripts/check-ue-preferences-browser.js): PASS en dos contextos independents, 375 × 667 px, selecció temporal per URL/selector, escriptura explícita, retorn segur, cap desbordament, cap error de pàgina i 0 peticions externes.
- Regressió completa Node amb T10/T13/T15/UE habilitades: **224/224 PASS**, 0 FAIL, 0 CANCELLED, 0 SKIP, 0 TODO.
- `git diff --check`: PASS.

## Límits

La vista global encara conserva la configuració existent; l'edició administrativa de l'estació i les sis targetes correspon a UE-T10. No s'han activat credencials, dades ni connectors reals.
