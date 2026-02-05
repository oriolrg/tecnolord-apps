export class CheckpointsModal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(fites, indexActual, onSelect) {
        this.container.innerHTML = `
            <div style="padding:15px; font-weight:bold; border-bottom:1px solid #eee; background:#f8f9fa;">
                Objectius de la ruta
            </div>
        `;
        
        fites.forEach((f, i) => {
            const div = document.createElement('div');
            const esActual = (i === indexActual);
            div.className = 'fita-item';
            div.style.background = esActual ? "#ebf8ff" : "white";
            div.style.borderLeft = esActual ? "4px solid var(--primary)" : "4px solid transparent";

            div.innerHTML = `
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight:${esActual ? 'bold' : 'normal'}; color:${esActual ? 'var(--primary)' : '#2d3748'}">${f.nom}</span>
                    <small style="color:#a0aec0; font-size: 10px;">${f.trobada ? '✅ Trobada' : '🏁 Pendents'}</small>
                </div>
                <span style="color:#3182ce; font-size:0.8rem;">${esActual ? '📍 ACTUAL' : 'Seleccionar'}</span>
            `;

            div.onclick = () => {
                onSelect(i);
                this.close();
            };
            this.container.appendChild(div);
        });
        this.container.style.display = 'block';
    }

    close() {
        this.container.style.display = 'none';
    }

    toggle(fites, indexActual, onSelect) {
        if (this.container.style.display === 'block') {
            this.close();
        } else {
            this.render(fites, indexActual, onSelect);
        }
    }
}