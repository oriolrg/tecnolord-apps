export class NavigationPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div id="target-card-full">
                <div class="data-row">
                    <div class="target-main">
                        <span class="label">Objectiu</span>
                        <span id="target-name" class="target-name-val">---</span>
                    </div>
                    <div class="data-box">
                        <span class="label">Rumb</span>
                        <span id="target-bearing" class="value">--°</span>
                    </div>
                    <div class="data-box">
                        <span class="label">Distància</span>
                        <span id="target-distance" class="value">-- m</span>
                    </div>
                </div>
            </div>`;
    }

    update(nom, dist, rumb) {
        document.getElementById('target-name').innerText = nom;
        document.getElementById('target-bearing').innerText = `${Math.round(rumb)}°`;
        document.getElementById('target-distance').innerText = `${Math.round(dist)} m`;
    }
}