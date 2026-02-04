export class Legend {
    constructor(containerId, leafletMap) {
        this.container = document.getElementById(containerId);
        this.map = leafletMap;
        this.render();
        this.update();
        // Escolta quan el mapa es mou o canvia el zoom
        this.map.on('move zoom', () => this.update());
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div id="map-legend" style="position: fixed; top: 20px; left: 20px; background: white; padding: 10px; border: 2px solid #000; z-index: 500; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                <div id="scale-bar" style="height: 5px; border: 1px solid #000; background: linear-gradient(90deg, #000 50%, #fff 50%); background-size: 40px 5px; transition: width 0.2s;"></div>
                <div id="scale-label" style="font-size: 11px; font-weight: bold; font-family: monospace; margin-top: 4px;">--- m</div>
                <div id="numeric-scale" style="font-size: 10px; font-family: monospace;">1 : ---</div>
            </div>`;
    }

    update() {
        const center = this.map.getCenter();
        const p1 = this.map.latLngToContainerPoint(center);
        const p2 = L.point(p1.x + 38, p1.y); // Representa 1cm aprox
        const mPerCm = this.map.distance(center, this.map.containerPointToLatLng(p2));

        const numeric = document.getElementById('numeric-scale');
        const label = document.getElementById('scale-label');
        const bar = document.getElementById('scale-bar');

        if (numeric) numeric.innerText = `1 : ${Math.round(mPerCm * 100).toLocaleString()}`;
        const unitat = mPerCm > 400 ? 500 : 100;
        if (bar) bar.style.width = `${(unitat * 38) / mPerCm}px`;
        if (label) label.innerText = unitat + " m";
    }
}