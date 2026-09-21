# QA UE-T10 — Edició limitada de la vista pública

Data d'execució: 2026-09-20. Entorn: contenidors locals aïllats i PostgreSQL/PostGIS temporal amb dades exclusivament sintètiques. No s'ha contactat cap proveïdor extern ni s'ha modificat cap base de dades real.

## Resultat implementat

El servei [publicViewService.js](../../../backend/services/publicViewService.js) llegeix i actualitza la configuració única de `meteo.public_view_config`. Només admet una estació `ACTIVE` i `PUBLIC`; per a estacions d'usuari també torna a comprovar que el compte estigui actiu, aprovat i amb el correu verificat. La configuració accepta un subconjunt no buit, sense duplicats, de les sis targetes existents i en conserva l'ordre. Cada escriptura usa revisió optimista, transacció i auditoria.

La ruta [publicView.js](../../../backend/routes/publicView.js) exposa `/api/v1/public-view` per a la resolució pública i `/api/v1/admin/public-view` per a l'administració. La lectura administrativa i les mutacions exigeixen `SUPERADMIN`; l'escriptura també exigeix mateix origen i CSRF. Una estació privada, en esborrany o revocada es rebutja sense convertir-se en vista global. Si l'estació configurada deixa de ser elegible més endavant, la lectura pública retorna `station: null` i no filtra les seves dades.

La [pantalla de compte](../../../site/compte/index.html) permet a l'administrador escollir l'estació pública, activar o ocultar targetes i ordenar-les. La [pantalla Meteo](../../../site/src/ui/screens/meteoScreen.js) aplica aquesta estació, ordre i visibilitat als visitants i als comptes sense preferència personal. La selecció personal o temporal continua tenint el comportament definit a UE-T09.

Durant la validació també s'ha corregit una regressió del formulari d'estacions: les coordenades plegades ja no bloquegen l'edició general amb `An invalid form control ... is not focusable`. Longitud i latitud es validen únicament en l'acció **«Desa la ubicació»**. La prova de compte cobreix explícitament l'edició amb aquest bloc plegat.

## Evidència executada

- Contracte unitari i HTTP `ue-publicview`: **5/5 PASS**. Inclou subconjunt buit, duplicats, identificadors desconeguts, 401/403, mateix origen, CSRF, estació no elegible i conflicte de revisió.
- Integració `ue_pubview` sobre una base temporal: **1/1 PASS**. Verifica persistència, ordre, estació privada i esborrany rebutjats, no-admin, conflicte, auditoria i revocació posterior fail-closed.
- Navegador [check-ue-publicview-browser.js](../../../backend/scripts/check-ue-publicview-browser.js): PASS a 375 × 667 px; l'admin selecciona l'estació, deixa humitat i temperatura en aquest ordre, i el visitant rep exactament aquestes dues targetes; 0 peticions externes i 0 errors de pàgina.
- Regressió de compte [check-ue-account-browser.js](../../../backend/scripts/check-ue-account-browser.js): PASS; alta, edició amb ubicació plegada, connector, retirada i administració, sense controls invàlids amagats.
- Regressió completa Node amb T10/T13/T15/UE habilitades: **230/230 PASS**, 0 FAIL, 0 CANCELLED, 0 SKIP, 0 TODO.
- `git diff --check` i comprovació de sintaxi: PASS.

## Límits

La configuració es limita expressament a l'estació pública de referència i a la visibilitat i ordre de les sis targetes existents. No incorpora HTML, fórmules ni un constructor visual. L'administració del catàleg i les correccions de coordenades corresponen a UE-T11.
