import { RouteCreator } from '../core/RouteCreator.js';

export class CreatorView {
    constructor(containerId, game) {
        this.container = document.getElementById(containerId);
        this.game = game; // Referència al joc principal (opcional si usem lògica separada)
        this.routeCreator = new RouteCreator();
        this.map = null;
        this.markersLayer = null;
        this.linesLayer = null;
        
        this.render();
        // El mapa s'inicialitza quan es fa update() en mostrar la pantalla
    }

    render() {
        this.container.innerHTML = `
            <div style="position: relative; height: 100%; display: flex; flex-direction: column;">
                <div style="background: white; padding: 10px; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 1rem;">Creador de Rutes</h3>
                    <div>
                        <button id="btn-undo" style="padding: 5px 10px; background: #ecc94b; border: none; border-radius: 4px; margin-right: 5px;"><i class="fas fa-undo"></i></button>
                        <button id="btn-save-gpx" style="padding: 5px 10px; background: #48bb78; color: white; border: none; border-radius: 4px;">Guardar GPX</button>
                        <button id="btn-clear-draft" style="padding: 5px 10px; background: #e53e3e; color: white; border: none; border-radius: 4px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>

                <div id="map-creator" style="flex: 1; width: 100%; z-index: 1;"></div>
                
                <div style="position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.9); padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; z-index: 1000; pointer-events: none;">
                    Clica al mapa per afegir fites
                </div>
            </div>
        `;

        this.initEventListeners();
    }

    initEventListeners() {
        this.container.querySelector('#btn-save-gpx').onclick = () => this.saveRoute();
        this.container.querySelector('#btn-clear-draft').onclick = () => {
            if(confirm("Esborrar el mapa actual?")) {
                this.routeCreator.clearDraft();
                this.refreshMapElements();
            }
        };
        this.container.querySelector('#btn-undo').onclick = () => {
            // Lògica simple de desfer (eliminem l'últim element de l'array)
            this.routeCreator.draftFites.pop();
            this.routeCreator.saveDraft();
            this.refreshMapElements();
        };
    }

    update() {
        // Aquesta funció es crida des del Menu.js quan obrim la pestanya
        if (!this.map) {
            this.initMap();
        } else {
            this.map.invalidateSize();
        }
    }

    initMap() {
        // Inicialitzem el mapa del creador centrat a Catalunya per defecte o on sigui l'usuari
        this.map = L.map('map-creator').setView([41.3851, 2.1734], 13);

        // Capa de l'ICGC
        L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/tile/orto/GRID3857/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: 'ICGC'
        }).addTo(this.map);

        this.markersLayer = L.layerGroup().addTo(this.map);
        this.linesLayer = L.layerGroup().addTo(this.map);

        // Gestió de clics al mapa per afegir fites
        this.map.on('click', (e) => {
            const nom = prompt("Nom de la fita (opcional):", `Fita ${this.routeCreator.draftFites.length + 1}`);
            if (nom !== null) { // Si no cancel·la
                this.routeCreator.addFitaToDraft(e.latlng.lat, e.latlng.lng, nom);
                this.refreshMapElements();
            }
        });

        // Intentar centrar en la posició de l'usuari si està disponible
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
            });
        }

        // Dibuixar el que tinguem guardat
        this.refreshMapElements();
    }

    refreshMapElements() {
        if (!this.markersLayer) return;

        this.markersLayer.clearLayers();
        this.linesLayer.clearLayers();

        const fites = this.routeCreator.draftFites;
        const latlngs = [];

        fites.forEach((f, index) => {
            const latlng = [f.lat, f.lon];
            latlngs.push(latlng);

            // Marcador visual
            L.circleMarker(latlng, {
                radius: 8,
                fillColor: '#3182ce',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`<b>${f.nom}</b><br>Lat: ${f.lat.toFixed(5)}<br>Lon: ${f.lon.toFixed(5)}`).addTo(this.markersLayer);
        });

        // Dibuixar línia que uneix les fites
        if (latlngs.length > 1) {
            L.polyline(latlngs, { color: '#3182ce', weight: 4, opacity: 0.6 }).addTo(this.linesLayer);
        }
    }

    saveRoute() {
        if (this.routeCreator.draftFites.length < 2) {
            alert("Necessites almenys 2 fites per guardar una ruta.");
            return;
        }

        const nom = prompt("Nom del fitxer GPX:", "La_Meva_Ruta");
        if (!nom) return;

        const gpxContent = this.routeCreator.exportToGPXString(nom);
        const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
        const url = URL.createObjectURL(blob);
        
        // Descarregar fitxer
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nom}.gpx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Netejar memòria
        
        // Opcional: Netejar esborrany després de guardar
        if(confirm("Vols netejar el mapa ara?")) {
            this.routeCreator.clearDraft();
            this.refreshMapElements();
        }
    }
}