export class RutesView {
    constructor(containerId, onRouteSelected, onCreateRoute) {
        this.container = document.getElementById(containerId);
        this.onRouteSelected = onRouteSelected;
        this.onCreateRoute = onCreateRoute; // Callback per obrir la vista de creació
        
        // 1. Rutes oficials de l'aplicació
        this.rutesPredefinides = [
            { id: 'r1', nom: "Carrera de montaña", fitxer: "data/Afternoon_Hike.gpx" },
            { id: 'r2', nom: "Entrenament Rogaine", fitxer: "data/ruta.gpx" }
        ];

        // 2. Carreguem rutes guardades per l'usuari des del LocalStorage
        const rutesGuardades = JSON.parse(localStorage.getItem('custom_routes') || '[]');
        this.rutes = [...this.rutesPredefinides, ...rutesGuardades];

        this.render();
        this.initEventListeners();
        this.renderRoutes();
    }

    render() {
        this.container.innerHTML = `
            <div class="screen-content" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin:0">Les meves Rutes</h2>
                    <button id="btn-clear-custom" style="padding: 5px 10px; font-size: 10px; background: #e53e3e; color: white; border: none; border-radius: 4px;">Netejar</button>
                </div>
                <hr style="margin: 15px 0;">
                
                <div id="create-route-zone" class="create-card">
                    <i class="fas fa-plus-circle"></i>
                    <p>Dissenyar <strong>Nova Ruta</strong> al mapa</p>
                </div>

                <div id="upload-zone" class="upload-card">
                    <i class="fas fa-file-upload"></i>
                    <p>Pujar fitxer <strong>.GPX</strong></p>
                    <input type="file" id="gpx-input" accept=".gpx" style="display: none;">
                </div>

                <div id="routes-list" class="routes-container"></div>
            </div>
        `;
        this.injectStyles();
    }

    renderRoutes() {
        const list = this.container.querySelector('#routes-list');
        if (!list) return;

        list.innerHTML = this.rutes.map(ruta => `
            <div class="route-item" data-id="${ruta.id}">
                <i class="fas ${ruta.fitxer ? 'fa-map-marked-alt' : 'fa-file-import'}"></i>
                <div class="route-info">
                    <span class="route-name">${ruta.nom}</span>
                    <small>${ruta.fites ? ruta.fites.length + ' fites' : 'Ruta oficial'}</small>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
        `).join('');

        list.querySelectorAll('.route-item').forEach(item => {
            item.onclick = () => {
                const id = item.getAttribute('data-id');
                const ruta = this.rutes.find(r => r.id == id);
                this.onRouteSelected(ruta);
            };
        });
    }

    initEventListeners() {
        const zone = this.container.querySelector('#upload-zone');
        const input = this.container.querySelector('#gpx-input');
        const clearBtn = this.container.querySelector('#btn-clear-custom');
        const createBtn = this.container.querySelector('#create-route-zone');

        // Event per crear ruta nova
        if (createBtn) {
            createBtn.onclick = () => {
                if (this.onCreateRoute) this.onCreateRoute();
            };
        }

        // Event per pujar GPX
        if (zone && input) {
            zone.onclick = () => input.click();
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => this.processGPX(event.target.result, file.name);
                reader.readAsText(file);
            };
        }

        // Event per netejar
        if (clearBtn) {
            clearBtn.onclick = () => {
                if (confirm("Esborrar rutes personals?")) {
                    localStorage.removeItem('custom_routes');
                    this.rutes = [...this.rutesPredefinides];
                    this.renderRoutes();
                }
            };
        }
    }

    processGPX(xmlText, fileName) {
        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "text/xml");
            const trackPoints = xml.querySelectorAll('trkpt, wpt'); 

            const points = Array.from(trackPoints).map(pt => ({
                lat: parseFloat(pt.getAttribute('lat')),
                lon: parseFloat(pt.getAttribute('lon'))
            })).filter(p => !isNaN(p.lat) && !isNaN(p.lon));

            if (points.length === 0) throw new Error("GPX sense coordenades vàlides");

            const fites = this.generateCheckpoints(points);
            
            const novaRuta = {
                id: 'custom_' + Date.now(),
                nom: fileName.replace('.gpx', ''),
                fites: fites,
                isCustom: true
            };

            const rutesGuardades = JSON.parse(localStorage.getItem('custom_routes') || '[]');
            rutesGuardades.push(novaRuta);
            localStorage.setItem('custom_routes', JSON.stringify(rutesGuardades));
            
            this.rutes.push(novaRuta);
            this.renderRoutes();
            this.onRouteSelected(novaRuta);

        } catch (e) {
            alert("Error en el fitxer: " + e.message);
        }
    }

    generateCheckpoints(points) {
        let fites = [];
        let acumulat = 0;
        
        const crearFita = (nom, p) => ({
            nom: nom,
            lat: p.lat,
            lon: p.lon,
            radius_m: 25 
        });

        fites.push(crearFita("SORTIDA", points[0]));

        for (let i = 1; i < points.length; i++) {
            const dist = this.haversine(points[i-1], points[i]);
            if (isNaN(dist)) continue;

            acumulat += dist;
            if (acumulat >= 1000) {
                fites.push(crearFita(`Fita ${fites.length}`, points[i]));
                acumulat = 0;
            }
        }
        return fites;
    }

    haversine(p1, p2) {
        const R = 6371e3;
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLon = (p2.lon - p1.lon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    injectStyles() {
        if (document.getElementById('rutes-styles')) return;
        const style = document.createElement('style');
        style.id = 'rutes-styles';
        style.innerHTML = `
            .upload-card, .create-card {
                border-radius: 12px; padding: 20px;
                text-align: center; cursor: pointer;
                margin-bottom: 15px; transition: all 0.2s;
                border: 2px dashed;
            }
            .upload-card { 
                border-color: #3182ce; color: #3182ce; background: #ebf8ff; 
            }
            .create-card { 
                border-color: #38a169; color: #38a169; background: #f0fff4; 
            }
            .upload-card:hover, .create-card:hover { 
                transform: translateY(-2px);
                filter: brightness(0.97);
            }
            .route-item {
                display: flex; align-items: center; padding: 15px;
                background: white; border-radius: 10px; margin-bottom: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer;
            }
            .route-info { flex: 1; margin-left: 15px; }
            .route-name { font-weight: bold; display: block; color: #2d3748; }
            .fa-file-import { color: #3182ce; }
            .fa-plus-circle { font-size: 24px; margin-bottom: 8px; }
        `;
        document.head.appendChild(style);
    }
}