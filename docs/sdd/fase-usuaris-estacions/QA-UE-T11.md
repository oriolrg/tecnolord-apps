# QA UE-T11 — Catàleg administrat i correccions de coordenades

Data d'execució: 2026-09-20. Entorn: contenidors locals aïllats i PostgreSQL/PostGIS temporal amb dades exclusivament sintètiques. No s'ha contactat cap font externa ni s'ha modificat cap base de dades real.

## Resultat implementat

El servei [adminCatalogService.js](../../../backend/services/adminCatalogService.js) gestiona exclusivament estacions `management_kind='ADMIN'`, sense propietari. Permet crear una estació administrada privada i corregir-ne nom, descripció, identitat de font, coordenada exacta, precisió, procedència i referència. Les fonts es limiten a `METEOLORD` i `GRAFANA`; la procedència utilitza valors tancats i les coordenades exigeixen longitud `[-180,180]`, latitud `[-90,90]`, nombres finits i ordre explícit longitud/latitud.

Cada correcció exigeix revisió optimista i s'executa en una transacció. Només els camps modificats s'escriuen a `meteo.manual_overrides`, amb actor, data i origen `ADMIN_CORRECTION`, perquè una importació posterior no els sobreescrigui silenciosament. `meteo.audit_events` registra l'acció i els noms dels camps canviats, sense copiar-hi la coordenada exacta ni cap secret. Una identitat de font validada duplicada retorna conflicte.

La ruta [adminCatalog.js](../../../backend/routes/adminCatalog.js) exposa `/api/v1/admin/external-stations`. Totes les operacions exigeixen `SUPERADMIN`; les mutacions també exigeixen mateix origen i CSRF. La consulta d'actualització conté explícitament `management_kind='ADMIN'`, `owner_id IS NULL` i estació no retirada. Per tant, ni un administrador pot modificar metadades, connector, ubicació o visibilitat d'una estació `USER` aliena mitjançant aquest editor.

La [pantalla de compte](../../../site/compte/index.html) incorpora l'alta i l'edició del catàleg administrat, amb font, identificador, longitud, latitud, precisió, procedència i evidència visibles. Els usuaris normals no veuen el panell ni en disparen les peticions.

[stationLocationService.js](../../../backend/services/stationLocationService.js) diferencia ara fonts administrades i estacions d'usuari. El mapa administratiu retorna la coordenada exacta; si una estació administrada té publicació autoritzada per una fase posterior, el mapa públic usa només `public_geometry`, recalculada segons la precisió configurada. La procedència i la referència pública es conserven, i el sensor ja reflecteix la font (`grafana-outdoor` o `meteolord-outdoor`). Corregir la posició exacta no publica l'estació ni canvia la seva visibilitat.

## Evidència executada

- Contracte unitari i HTTP `ue-admincatalog`: **5/5 PASS**. Inclou fonts i procedències tancades, límits geogràfics, DTO sense claus internes, frontera `ADMIN`, 401/403, mateix origen, CSRF, duplicats i conflicte de revisió.
- Integració `ue_admincat` sobre PostGIS temporal: **1/1 PASS**. Verifica alta privada, `HIDDEN`, identitat duplicada, estació `USER` aliena rebutjada fins per admin, correcció versionada, sis overrides, auditoria sense coordenada exacta, mapa públic aproximat i mapa administratiu exacte.
- Navegador [check-ue-admincatalog-browser.js](../../../backend/scripts/check-ue-admincatalog-browser.js): PASS a 375 × 667 px; alta i correcció administratives, aïllament de l'usuari normal, cap desbordament, 0 errors de pàgina i 0 peticions externes.
- Regressions de compte i mapa privat: [check-ue-account-browser.js](../../../backend/scripts/check-ue-account-browser.js) i [check-ue-visibility-browser.js](../../../backend/scripts/check-ue-visibility-browser.js), PASS.
- Regressió completa Node amb T10/T13/T15/UE habilitades: **236/236 PASS**, 0 FAIL, 0 CANCELLED, 0 SKIP, 0 TODO.
- `git diff --check` i comprovacions de sintaxi: PASS.

## Límits

UE-T11 no importa l'inventari del PDF ni consulta Grafana. UE-T12 revalidarà l'accés i els drets de Grafana; UE-T13 implementarà l'staging i la importació idempotent. La publicació o visibilitat d'una estació administrada no forma part d'aquest editor.
