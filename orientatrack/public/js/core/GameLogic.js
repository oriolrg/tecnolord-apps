import { calcularDistancia, calcularRumb } from './GeoEngine.js';

export class GameLogic {
    constructor() {
        this.fites = [];
        this.indexFitaActual = 0;
        this.segonsDinsRadi = 0;
    }

    async carregarRuta(url) {
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
                const prev = { lat: parseFloat(pts[i-1].getAttribute("lat")), lon: parseFloat(pts[i-1].getAttribute("lon")) };
                acumuladorDistancia += calcularDistancia(prev.lat, prev.lon, lat, lon);
                if (acumuladorDistancia >= 1000) {
                    this._afegirFita(llista, lat, lon);
                    acumuladorDistancia = 0;
                }
            }
        });
        this.fites = llista;
        return this.fites;
    }

    _afegirFita(llista, lat, lon) {
        llista.push({
            id: `CP-${llista.length + 1}`,
            lat, lon,
            nom: `Fita ${llista.length + 1}`,
            radius_m: 20
        });
    }

    processarPosicio(pos) {
        if (this.fites.length === 0) return null;
        
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
        const target = this.fites[this.indexFitaActual];
        
        const dist = calcularDistancia(lat, lon, target.lat, target.lon);
        const rumb = calcularRumb(lat, lon, target.lat, target.lon);

        let fitaTrobada = false;
        if (dist <= target.radius_m && accuracy < 30) {
            this.segonsDinsRadi++;
            if (this.segonsDinsRadi >= 3) {
                fitaTrobada = true;
                this.segonsDinsRadi = 0;
                if (this.indexFitaActual < this.fites.length - 1) {
                    this.indexFitaActual++;
                }
            }
        } else {
            this.segonsDinsRadi = 0;
        }

        return { dist, rumb, fitaTrobada, fitaNom: target.nom };
    }
}