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
        // Netegem cercles i marcadors antics per refrescar la vista
        this.map.eachLayer(layer => {
            if (layer instanceof L.Circle || layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });

        fites.forEach((f, i) => {
            const esActual = i === indexActual;
            
            // Cercle de fita (blau si és l'activa, lila la resta)
            L.circle([f.lat, f.lon], { 
                color: esActual ? '#3182ce' : '#ff00ff', 
                radius: f.radius_m, 
                fillOpacity: esActual ? 0.2 : 0.05 
            }).addTo(this.map);

            // Icona numerada amb canvi de color dinàmic (ACTUALITZAT)
            const icon = L.divIcon({
                className: `fita-icon ${esActual ? 'fita-activa' : 'fita-pendent'}`,
                html: `<span>${i + 1}</span>`,
                iconSize: [24, 24]
            });

            L.marker([f.lat, f.lon], { icon }).addTo(this.map);
        });
    }

    /**
     * Mou el mapa cap a la fita però MANTÉ el zoom actual
     */
    centrarFita(fita) {
        this.map.panTo([fita.lat, fita.lon], {
            animate: true,
            duration: 0.8
        });
    }

    revelarRutes(trackReal, fites) {
        L.polyline(trackReal, {color: 'red', weight: 3, dashArray: '5, 10'}).addTo(this.map);
        const puntsIdeals = fites.map(f => [f.lat, f.lon]);
        L.polyline(puntsIdeals, {color: 'blue', weight: 2, opacity: 0.5}).addTo(this.map);
        this.map.fitBounds(L.polyline(trackReal).getBounds());
    }
}