export class SOSView {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.mapSOS = null;
    }

    initMap() {
        if (this.mapSOS) return;
        this.mapSOS = L.map('map-sos', { zoomControl: false }).setView([42.135, 1.592], 16);
        L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topogris/GRID3857/{z}/{x}/{y}.jpeg').addTo(this.mapSOS);
        this.marker = L.marker([0, 0]).addTo(this.mapSOS);
    }

    updatePosition(pos) {
        if (!this.mapSOS) this.initMap();
        const coords = [pos.coords.latitude, pos.coords.longitude];
        this.marker.setLatLng(coords);
        this.mapSOS.panTo(coords);
    }
}