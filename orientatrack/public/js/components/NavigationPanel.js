export class NavigationPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.injectStyles();
        this.render();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .nav-card {
                background: white; margin: 10px; padding: 15px;
                border-radius: 12px; box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
                border-top: 4px solid #3182ce;
            }
            .nav-grid { display: flex; justify-content: space-between; text-align: center; }
            .nav-item { flex: 1; }
            .nav-item:not(:last-child) { border-right: 1px solid #eee; }
            .nav-label { font-size: 10px; color: #718096; text-transform: uppercase; font-weight: bold; }
            .nav-value { font-size: 18px; font-weight: 800; color: #1a202c; display: block; }
            #target-name { color: #3182ce; }
        `;
        document.head.appendChild(style);
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="nav-card">
                <div class="nav-grid">
                    <div class="nav-item" style="flex: 2;">
                        <span class="nav-label">Objectiu</span>
                        <span id="target-name" class="nav-value">---</span>
                    </div>
                    <div class="nav-item">
                        <span class="nav-label">Rumb</span>
                        <span id="target-bearing" class="nav-value">--°</span>
                    </div>
                    <div class="nav-item">
                        <span class="nav-label">Distància</span>
                        <span id="target-distance" class="nav-value">-- m</span>
                    </div>
                </div>
            </div>`;
    }

    update(nom, dist, rumb) {
        const n = document.getElementById('target-name');
        const b = document.getElementById('target-bearing');
        const d = document.getElementById('target-distance');
        if (n) n.innerText = nom;
        if (b) b.innerText = `${Math.round(rumb)}°`;
        if (d) d.innerText = `${Math.round(dist)} m`;
    }
}