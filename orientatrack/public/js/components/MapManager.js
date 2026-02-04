export class MapManager {
    constructor(containerId) {
        this.map = L.map(containerId, { zoomControl: false, attributionControl: false })
                  .setView([42.135, 1.592], 15);
        
        L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topogris/GRID3857/{z}/{x}/{y}.jpeg', {
            maxZoom: 18,
            attribution: 'ICGC'
        }).addTo(this.map);
    }

    dibuixarFites(fites, indexActual, callbackSeleccio) {
        // Netegem cercles i marcadors antics
        this.map.eachLayer(layer => {
            if (layer instanceof L.Circle || layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });

        fites.forEach((f, i) => {
            const esActual = i === indexActual;
            
            // Cercle de fita
            L.circle([f.lat, f.lon], { 
                color: esActual ? '#3182ce' : '#ff00ff', 
                radius: f.radius_m, 
                fillOpacity: 0.1 
            }).addTo(this.map);

            // Icona numerada
            const icon = L.divIcon({
                className: 'fita-icon',
                html: `<span>${i + 1}</span>`,
                iconSize: [24, 24]
            });

            L.marker([f.lat, f.lon], { icon }).addTo(this.map)
             .on('click', () => callbackSeleccio(i));
        });
    }

    centrarFita(fita) {
        this.map.panTo([fita.lat, fita.lon]);
    }
}