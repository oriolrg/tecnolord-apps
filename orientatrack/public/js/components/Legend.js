export class Legend {
    constructor(containerId, map) {
        this.container = document.getElementById(containerId);
        this.map = map;
        this.render();
        this.update();
        // S'actualitza cada vegada que el mapa canvia de zoom o es mou
        this.map.on('move zoom', () => this.update());
    }

    render() {
        this.container.innerHTML = `
            <div id="map-legend" style="position: fixed; top: 20px; left: 20px; background: white; padding: 10px; border: 2px solid black; z-index: 500; font-family: monospace;">
                <div id="scale-bar" style="height: 5px; border: 1px solid black; background: linear-gradient(90deg, black 50%, white 50%); background-size: 40px 5px;"></div>
                <div id="scale-label" style="font-size: 10px; font-weight: bold; margin-top: 5px;">--- m</div>
                <div id="numeric-scale" style="font-size: 10px;">1 : ---</div>
            </div>`;
    }

    update() {
        const center = this.map.getCenter();
        const p1 = this.map.latLngToContainerPoint(center);
        const p2 = L.point(p1.x + 38, p1.y); // 1cm aprox a pantalla
        const mPerCm = this.map.distance(center, this.map.containerPointToLatLng(p2));

        document.getElementById('numeric-scale').innerText = `1 : ${Math.round(mPerCm * 100).toLocaleString()}`;
        const unitat = mPerCm > 400 ? 500 : 100;
        document.getElementById('scale-bar').style.width = `${(unitat * 38) / mPerCm}px`;
        document.getElementById('scale-label').innerText = unitat + " m";
    }
}