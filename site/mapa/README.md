# Mapa de temperatures — previsualització local

Requereix Node 20+ i les dependències de `backend/` instal·lades amb el lockfile. Des de l'arrel del repositori:

```sh
node backend/scripts/serve-map-demo.js
```

Obriu `http://127.0.0.1:8096/meteo/` per al panell Meteo i `http://127.0.0.1:8096/meteo/mapa/` per al mapa. El servidor escolta només a `127.0.0.1`; el port es pot canviar amb `MAP_PREVIEW_PORT`. No necessita PostgreSQL ni credencials d'ingesta.

El mode per defecte és una **previsualització real local**. El panell consulta les mesures públiques de MeteoLord a `tecnolord.cat` mitjançant un proxy del mateix origen. El mapa mostra aquesta observació amb ubicació aproximada a la zona del Solsonès i cinc estimacions de temperatura actual d'Open-Meteo per a Barcelona, Girona, Lleida, Tarragona i la Seu d'Urgell. Les estimacions són dades de model, no lectures d'estacions. La base cartogràfica és d'OpenStreetMap. Les fonts i atribucions es mostren a la pantalla; si una font falla, no es presenta cap valor antic com a temperatura actual. Aquesta previsualització necessita accés a Internet i no està preparada per a desplegament públic.

Per recuperar el mapa MAP-A sintètic i la seva base PMTiles local:

```sh
MAP_PREVIEW_MODE=synthetic node backend/scripts/serve-map-demo.js
```

En aquest mode, **el mapa** és sintètic; el panell `/meteo/` continua consultant l'API pública de MeteoLord. El rellotge del mapa de prova és `2026-01-01T00:05:00Z`.

Validació:

```sh
node backend/scripts/check-live-preview-browser.js
node backend/scripts/check-map-browser.js
```

La primera comprovació usa la previsualització real en marxa al port 8096 i escriu captures a `artifacts/live-local-preview/`. La segona crea el seu propi servidor sintètic i escriu l'evidència MAP-A a `artifacts/phase-a/<HEAD>/map-a-completion/map-a/`.
