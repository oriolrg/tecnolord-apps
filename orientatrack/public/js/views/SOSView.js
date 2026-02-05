export class SOSView {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.mapSOS = null;
        this.marker = null;
    }

    initMap() {
        if (this.mapSOS) return;
        
        // Inicialitzem el mapa SOS
        this.mapSOS = L.map('map-sos', { 
            zoomControl: false,
            attributionControl: false 
        }).setView([42.135, 1.592], 16);

        L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topogris/GRID3857/{z}/{x}/{y}.jpeg', {
            maxZoom: 18
        }).addTo(this.mapSOS);

        this.marker = L.marker([0, 0]).addTo(this.mapSOS);
    }

    updatePosition(pos) {
        if (!this.mapSOS) this.initMap();
        
        const coords = [pos.coords.latitude, pos.coords.longitude];
        this.marker.setLatLng(coords);
        
        // Centrem el mapa en la posició actual de l'usuari
        this.mapSOS.panTo(coords);
    }

    /**
     * Arregla el problema de renderitzat de Leaflet quan el contenidor 
     * passa de display:none a display:block
     */
    invalidate() {
        if (this.mapSOS) {
            // Això força a Leaflet a recalcular el tamany del contenidor
            this.mapSOS.invalidateSize();
        }
    }
}