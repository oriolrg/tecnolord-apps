import { calcularDistancia, calcularRumb } from './GeoEngine.js';

export class GameLogic {
    constructor() {
        // --- Estat del Joc (Ruta en curs) ---
        this.fites = [];
        this.indexFitaActual = 0;
        this.segonsDinsRadi = 0;
        this.ultimaPosicio = null;
        this.penalitzacions = 0;
        this.startTime = null;
        this.fitesTimestamps = []; 
        this.currentRouteName = "Ruta";

        // --- Claus de Persistència ---
        this.STORAGE_KEY = 'orientatrack_session';
        this.HISTORY_KEY = 'orientatrack_history';
    }

    // ==========================================
    // GESTIÓ DE L'ESTAT (JOC ACTIU)
    // ==========================================

    saveState() {
        const state = {
            fites: this.fites,
            indexFitaActual: this.indexFitaActual,
            penalitzacions: this.penalitzacions,
            startTime: this.startTime,
            fitesTimestamps: this.fitesTimestamps,
            currentRouteName: this.currentRouteName,
            lastUpdate: Date.now()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    }

    loadState() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.fites = state.fites;
                this.indexFitaActual = state.indexFitaActual;
                this.penalitzacions = state.penalitzacions || 0;
                this.startTime = state.startTime;
                this.fitesTimestamps = state.fitesTimestamps || [];
                this.currentRouteName = state.currentRouteName || "Ruta";
                return true;
            } catch (e) {
                console.error("Error carregant sessió guardada", e);
            }
        }
        return false;
    }

    clearState() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.startTime = null;
        this.penalitzacions = 0;
        this.indexFitaActual = 0;
        this.fitesTimestamps = [];
    }

    saveToHistory(tempsNetMin, tempsFinalMin) {
        const history = JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
        
        const parcialsSegons = this.fitesTimestamps.map((t, i) => {
            const inici = i === 0 ? this.startTime : this.fitesTimestamps[i-1];
            return Math.round((t - inici) / 1000);
        });

        history.push({
            data: new Date().toISOString(),
            rutaNom: this.currentRouteName,
            tempsNet: tempsNetMin,
            penalitzacions: this.penalitzacions,
            tempsFinal: tempsFinalMin,
            fitesTotals: this.fites.length,
            parcials: parcialsSegons
        });
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    }

    afegirPenalitzacioSOS() {
        this.penalitzacions++;
        this.saveState();
    }

    // ==========================================
    // LÒGICA DE NAVEGACIÓ I GPS
    // ==========================================

    async carregarRuta(url) {
        this.fites = [];
        this.indexFitaActual = 0;
        this.segonsDinsRadi = 0;
        this.fitesTimestamps = [];
        this.currentRouteName = url.split('/').pop().replace('.gpx', '').replace(/_/g, ' ');

        const response = await fetch(url);
        const text = await response.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        const pts = xml.querySelectorAll("trkpt");

        let acumuladorDistancia = 0;
        let llista = [];

        pts.forEach((pt, i) => {
            const lat = parseFloat(pt.getAttribute("lat"));
            const lon = parseFloat(pt.getAttribute("lon"));

            if (i === 0) {
                this._afegirFita(llista, lat, lon);
            } else {
                const prevLat = parseFloat(pts[i-1].getAttribute("lat"));
                const prevLon = parseFloat(pts[i-1].getAttribute("lon"));
                acumuladorDistancia += calcularDistancia(prevLat, prevLon, lat, lon);

                if (acumuladorDistancia >= 1000) {
                    this._afegirFita(llista, lat, lon);
                    acumuladorDistancia = 0;
                }
            }
        });
        
        this.fites = llista;
        this.saveState();
        return this.fites;
    }

    _afegirFita(llista, lat, lon) {
        llista.push({
            id: `CP-${llista.length + 1}`,
            lat, lon,
            nom: `Fita ${llista.length + 1}`,
            radius_m: 20,
            trobada: false
        });
    }

    getEstatActual() {
        if (this.fites.length === 0) return null;
        if (!this.ultimaPosicio) return { fitaNom: this.fites[this.indexFitaActual].nom, dist: 0, rumb: 0 };
        
        const lat = this.ultimaPosicio.coords.latitude;
        const lon = this.ultimaPosicio.coords.longitude;
        const target = this.fites[this.indexFitaActual];
        
        return {
            fitaNom: target.nom,
            dist: calcularDistancia(lat, lon, target.lat, target.lon),
            rumb: calcularRumb(lat, lon, target.lat, target.lon)
        };
    }

    processarPosicio(pos) {
        this.ultimaPosicio = pos;
        if (this.fites.length === 0) return null;

        if (!this.startTime) {
            this.startTime = Date.now();
            this.saveState();
        }
        
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
        const target = this.fites[this.indexFitaActual];
        
        const dist = calcularDistancia(lat, lon, target.lat, target.lon);
        const rumb = calcularRumb(lat, lon, target.lat, target.lon);

        let fitaTrobada = false;
        let rutaCompletada = false;

        if (dist <= (target.radius_m || 20) && accuracy < 30) {
            this.segonsDinsRadi++;
            if (this.segonsDinsRadi >= 3) {
                fitaTrobada = true;
                target.trobada = true;
                this.segonsDinsRadi = 0;
                this.fitesTimestamps.push(Date.now());

                if (this.indexFitaActual === this.fites.length - 1) {
                    rutaCompletada = true;
                } else {
                    this.indexFitaActual++;
                }
                this.saveState(); 
            }
        } else {
            this.segonsDinsRadi = 0;
        }

        return { dist, rumb, fitaTrobada, fitaNom: target.nom, rutaCompletada };
    }
}