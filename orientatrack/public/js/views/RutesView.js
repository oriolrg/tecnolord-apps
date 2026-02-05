export class RutesView {
    constructor(containerId, onSelectCallback) {
        this.container = document.getElementById(containerId);
        this.onSelect = onSelectCallback;
        // La llista de rutes ara és una propietat de la instància per accedir-hi des del main
        this.rutes = [
            { id: 1, nom: "Ruta Local (GPX)", dificultat: "Mitjana", fitxer: "data/ruta.gpx" }
        ];
        this.render();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="screen-content">
                <h2 style="color:var(--dark); border-bottom:2px solid var(--primary); padding-bottom:10px;">
                    <i class="fas fa-route"></i> Explorar Rutes
                </h2>
                <div class="rutes-llista" style="margin-top:20px;">
                    ${this.rutes.map(ruta => `
                        <div class="fita-item" onclick="window.dispatchRouteSelect(${ruta.id})" 
                             style="background:white; margin-bottom:10px; border-radius:8px; border:1px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                            <div style="padding:10px;">
                                <strong style="color:var(--primary);">${ruta.nom}</strong><br>
                                <small style="color:#718096;">Nivell: ${ruta.dificultat}</small>
                            </div>
                            <i class="fas fa-play-circle" style="color:var(--primary); font-size:1.5rem; padding-right:15px;"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        window.dispatchRouteSelect = (id) => {
            const ruta = this.rutes.find(r => r.id === id);
            this.onSelect(ruta);
        };
    }
}