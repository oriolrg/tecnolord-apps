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
        let llista = [];
        let acumulador = 0;

        pts.forEach((pt, i) => {
            const lat = parseFloat(pt.getAttribute("lat"));
            const lon = parseFloat(pt.getAttribute("lon"));
            if (i === 0) {
                this._afegirFita(llista, lat, lon);
            } else {
                const prev = { lat: parseFloat(pts[i-1].getAttribute("lat")), lon: parseFloat(pts[i-1].getAttribute("lon")) };
                acumulador += calcularDistancia(prev.lat, prev.lon, lat, lon);
                if (acumulador >= 1000) {
                    this._afegirFita(llista, lat, lon);
                    acumulador = 0;
                }
            }
        });
        this.fites = llista;
        return this.fites;
    }

    _afegirFita(llista, lat, lon) {
        llista.push({ nom: `Fita ${llista.length + 1}`, lat, lon, radius_m: 20 });
    }

    // AQUESTA FUNCIÓ FA FUNCIONAR EL TEU MENÚ
    generarLlistaFitesHTML(contenidor, callbackSeleccio) {
        contenidor.innerHTML = '<h4 style="margin:10px; color:#333">Selecciona Objectiu:</h4>';
        this.fites.forEach((f, i) => {
            const div = document.createElement('div');
            div.className = 'fita-item';
            const esActual = (i === this.indexFitaActual);
            div.style.padding = "10px";
            div.style.borderBottom = "1px solid #eee";
            div.style.background = esActual ? "#e6f4ff" : "white";
            
            div.innerHTML = `
                <span>${f.nom}</span>
                <small style="float:right">${esActual ? '📍' : 'Anar-hi'}</small>
            `;
            div.onclick = () => callbackSeleccio(i);
            contenidor.appendChild(div);
        });
    }

    processarPosicio(pos) {
        if (this.fites.length === 0) return null;
        const { latitude: lat, longitude: lon } = pos.coords;
        const target = this.fites[this.indexFitaActual];
        const dist = calcularDistancia(lat, lon, target.lat, target.lon);
        const rumb = calcularRumb(lat, lon, target.lat, target.lon);

        let fitaTrobada = false;
        if (dist <= target.radius_m) {
            this.segonsDinsRadi++;
            if (this.segonsDinsRadi >= 3) {
                fitaTrobada = true;
                this.segonsDinsRadi = 0;
                if (this.indexFitaActual < this.fites.length - 1) this.indexFitaActual++;
            }
        } else { this.segonsDinsRadi = 0; }

        return { dist, rumb, fitaTrobada, fitaNom: target.nom };
    }
}