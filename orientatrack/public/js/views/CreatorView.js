import { RouteCreator } from '../core/RouteCreator.js';

export class CreatorView {
    constructor(containerId, game) {
        this.container = document.getElementById(containerId);
        this.game = game;
        this.routeCreator = new RouteCreator();
        this.map = null;
        this.markersLayer = null;
        this.linesLayer = null;
        
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="screen-content" style="padding: 0; display: flex; flex-direction: column; background: white; position: relative; z-index: 1000;">
                <div style="background: white; padding: 10px; z-index: 1100; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 0.9rem;">Dissenya la teva ruta</h3>
                    <div style="display: flex; gap: 5px;">
                        <button id="btn-undo" class="btn-tool"><i class="fas fa-undo"></i></button>
                        <button id="btn-clear-draft" class="btn-tool danger"><i class="fas fa-trash"></i></button>
                        <button id="btn-save-gpx" style="padding: 5px 15px; background: #48bb78; color: white; border: none; border-radius: 4px; font-weight: bold;">GUARDAR</button>
                    </div>
                </div>

                <div id="map-creator" style="flex: 1; width: 100%; z-index: 1050; min-height: 300px;"></div>
                
                <div id="creator-fites-list" style="background: white; max-height: 150px; overflow-y: auto; z-index: 1100; border-top: 1px solid #eee;">
                    </div>
                
                <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.7rem; z-index: 1200; pointer-events: none;">
                    Toca el mapa per afegir punts
                </div>
            </div>
        `;
        this.injectLocalStyles();
        this.initEventListeners();
    }

    injectLocalStyles() {
        if (document.getElementById('creator-local-styles')) return;
        const style = document.createElement('style');
        style.id = 'creator-local-styles';
        style.innerHTML = `
            .btn-tool { padding: 8px 12px; background: #edf2f7; border: none; border-radius: 4px; cursor: pointer; }
            .btn-tool.danger { color: #e53e3e; }
            .btn-tool:active { background: #e2e8f0; }
        `;
        document.head.appendChild(style);
    }

    initEventListeners() {
        this.container.querySelector('#btn-save-gpx').onclick = () => this.saveRoute();
        this.container.querySelector('#btn-clear-draft').onclick = () => {
            if(confirm("Vols esborrar tot el disseny?")) {
                this.routeCreator.clearDraft();
                this.refreshMapElements();
            }
        };
        this.container.querySelector('#btn-undo').onclick = () => {
            this.routeCreator.draftFites.pop();
            this.routeCreator.saveDraft();
            this.refreshMapElements();
        };
    }

    update() {
        if (!this.map) {
            this.initMap();
        }
        
        // El mapa necessita un temps perquè el contenidor CSS s'estabilitzi
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize(); // Això obliga a Leaflet a omplir tot el div
                
                // Opcional: si ja tens fites, centra la vista perquè no es vegi buit
                if (this.routeCreator.draftFites.length > 0) {
                    this.refreshMapElements();
                }
            }
        }, 300); // 300ms sol ser suficient per a qualsevol transició CSS
    }

    initMap() {
        // Usem la mateixa configuració que el teu MapManager
        this.map = L.map('map-creator', { 
            zoomControl: false, 
            attributionControl: false 
        }).setView([41.3851, 2.1734], 13);

        // Capa Topogràfica Gris (la que dius que funciona al joc)
        L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topogris/GRID3857/{z}/{x}/{y}.jpeg', {
            maxZoom: 18,
            attribution: 'ICGC'
        }).addTo(this.map);

        this.markersLayer = L.layerGroup().addTo(this.map);
        this.linesLayer = L.layerGroup().addTo(this.map);

        this.map.on('click', (e) => {
            const nom = `Fita ${this.routeCreator.draftFites.length + 1}`;
            this.routeCreator.addFitaToDraft(e.latlng.lat, e.latlng.lng, nom);
            this.refreshMapElements();
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
            });
        }

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

            // Marcador visual (estil Rogaine)
            L.circle(latlng, {
                radius: 25,
                color: '#ff00ff',
                weight: 2,
                fillOpacity: 0.1
            }).addTo(this.markersLayer);

            const icon = L.divIcon({
                className: 'fita-icon fita-pendent',
                html: `<span>${index + 1}</span>`,
                iconSize: [24, 24]
            });

            L.marker(latlng, { icon }).addTo(this.markersLayer);
        });

        if (latlngs.length > 1) {
            L.polyline(latlngs, { color: '#ff00ff', weight: 3, dashArray: '5, 8', opacity: 0.5 }).addTo(this.linesLayer);
        }
    }

    saveRoute() {
        if (this.routeCreator.draftFites.length < 2) {
            alert("Necessites almenys 2 fites.");
            return;
        }

        const nom = prompt("Nom de la ruta:", "Ruta_Nova");
        if (!nom) return;

        const gpxContent = this.routeCreator.exportToGPXString(nom);
        const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nom}.gpx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}