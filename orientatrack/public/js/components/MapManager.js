export class MapManager {
    constructor(containerId) {
        this.map = L.map(containerId, { zoomControl: false, attributionControl: false })
                  .setView([42.135, 1.592], 15);
        
        L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topogris/GRID3857/{z}/{x}/{y}.jpeg', {
            maxZoom: 18,
            attribution: 'ICGC'
        }).addTo(this.map);
    }

    dibuixarFites(fites, indexActual) {
        // Netegem cercles i marcadors antics
        this.map.eachLayer(layer => {
            if (layer instanceof L.Circle || layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });

        fites.forEach((f, i) => {
            const esActual = i === indexActual;
            
            L.circle([f.lat, f.lon], { 
                color: esActual ? '#3182ce' : '#ff00ff', 
                radius: Number(f.radius_m || f.radius || f.radi || 25), 
                fillOpacity: esActual ? 0.2 : 0.05 
            }).addTo(this.map);

            const icon = L.divIcon({
                className: `fita-icon ${esActual ? 'fita-activa' : 'fita-pendent'}`,
                html: `<span>${i + 1}</span>`,
                iconSize: [24, 24]
            });

            L.marker([f.lat, f.lon], { icon }).addTo(this.map);
        });
    }

    centrarFita(fita) {
        this.map.panTo([fita.lat, fita.lon], { animate: true, duration: 0.8 });
    }

    revelarProgres(trackReal, fites) {
        // Dibuixa el track real en vermell discontinu
        const polylineTrack = L.polyline(trackReal, {
            color: 'red', weight: 3, dashArray: '5, 10', opacity: 0.7
        }).addTo(this.map);

        // Línia ideal entre fites en blau
        const puntsIdeals = fites.map(f => [f.lat, f.lon]);
        L.polyline(puntsIdeals, {color: 'blue', weight: 2, opacity: 0.3}).addTo(this.map);

        if (trackReal.length > 0) {
            this.map.fitBounds(polylineTrack.getBounds());
        }
    }
}