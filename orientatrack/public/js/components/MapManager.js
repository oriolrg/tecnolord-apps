export class MapManager {
    constructor(containerId) {
        this.map = L.map(containerId, { zoomControl: false, attributionControl: false }).setView([42.135, 1.592], 15);
        L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topogris/GRID3857/{z}/{x}/{y}.jpeg').addTo(this.map);
    }

    dibuixarFites(fites, indexActual) {
        this.map.eachLayer(l => { if (l instanceof L.Circle || l instanceof L.Marker) this.map.removeLayer(l); });
        fites.forEach((f, i) => {
            const esActual = i === indexActual;
            L.circle([f.lat, f.lon], { color: esActual ? '#3182ce' : '#ff00ff', radius: f.radius_m }).addTo(this.map);
            L.marker([f.lat, f.lon], { 
                icon: L.divIcon({ className: 'fita-icon', html: `<span>${i+1}</span>` }) 
            }).addTo(this.map);
        });
    }

    centrarFita(fita) {
        this.map.flyTo([fita.lat, fita.lon], 17);
    }
}