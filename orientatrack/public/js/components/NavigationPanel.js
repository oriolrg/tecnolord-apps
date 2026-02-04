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
    // Dins de NavigationPanel.js afegeix aquest mètode:
    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            #target-card-full {
                background: white; margin: 10px; padding: 15px;
                border-radius: 15px; box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
                border-top: 4px solid var(--primary);
            }
            .data-row { display: flex; justify-content: space-around; align-items: center; }
            .target-main { flex: 2; }
            .data-box { flex: 1; text-align: center; border-left: 1px solid #eee; }
            .label { font-size: 10px; color: #718096; text-transform: uppercase; letter-spacing: 1px; }
            .target-name-val { font-size: 16px; font-weight: bold; color: var(--dark); display: block; }
            .value { font-size: 20px; font-weight: 800; color: var(--primary); }
        `;
        document.head.appendChild(style);
    }
}