export class Menu {
    constructor(containerId, gameInstance, mapInstance) {
        this.container = document.getElementById(containerId);
        this.game = gameInstance;
        this.mapManager = mapInstance;
        this.render();
        this.initEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <nav class="main-menu">
                <button class="menu-btn" data-screen="mapa"><i class="fas fa-map"></i><span>Mapa</span></button>
                <button class="menu-btn active" data-screen="joc"><i class="fas fa-compass"></i><span>Joc</span></button>
                <button id="btn-fites" class="menu-btn"><i class="fas fa-list-ol"></i><span>Fites</span></button>
                <button class="menu-btn" data-screen="sos"><i class="fas fa-skull-crossbones"></i><span>SOS</span></button>
                <button class="menu-btn" data-screen="perfil"><i class="fas fa-user-circle"></i><span>Perfil</span></button>
            </nav>
        `;
    }

    initEventListeners() {
        const buttons = this.container.querySelectorAll('.menu-btn');
        const menuFites = document.getElementById('fites-menu');

        buttons.forEach(btn => {
            btn.onclick = (e) => {
                const screen = btn.getAttribute('data-screen');
                
                // Cas especial: Botó Fites (és un desplegable, no una pantalla)
                if (btn.id === 'btn-fites') {
                    this.toggleFitesMenu(menuFites);
                    return;
                }

                // Tancar menú fites si s'obre una altra pantalla
                menuFites.style.display = 'none';

                if (screen === 'sos') {
                    this.confirmarSOS();
                } else if (screen) {
                    this.switchScreen(screen);
                }

                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });
    }

    switchScreen(screenId) {
        // Amagar totes les vistes
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        // Mostrar la seleccionada (les pantalles de l'HTML coincideixen amb l'ID view-XXXX)
        const targetView = document.getElementById(`view-${screenId}`);
        if (targetView) targetView.classList.add('active');
        
        // Lògica específica per pantalla
        if (screenId === 'perfil') this.updatePerfilStats();
    }

    toggleFitesMenu(menuElement) {
        if (menuElement.style.display === 'block') {
            menuElement.style.display = 'none';
        } else {
            this.game.generarLlistaFitesHTML(menuElement, (index) => {
                this.game.indexFitaActual = index;
                this.mapManager.dibuixarFites(this.game.fites, index);
                this.mapManager.centrarFita(this.game.fites[index]);
                menuElement.style.display = 'none';
            });
            menuElement.style.display = 'block';
        }
    }

    confirmarSOS() {
        const accepta = confirm("ALERTA: El mode SOS mostrarà la teva posició al mapa però penalitzarà el temps. Vols continuar?");
        if (accepta) {
            this.switchScreen('sos');
            // Aquí podríem instanciar un mini-mapa SOS o reutilitzar el MapManager
        }
    }

    updatePerfilStats() {
        const container = document.getElementById('perfil-stats');
        container.innerHTML = `
            <div style="background:#f7fafc; padding:15px; border-radius:10px;">
                <p><strong>Fites trobades:</strong> ${this.game.fites.filter(f => f.trobada).length} / ${this.game.fites.length}</p>
                <p><strong>Temps actual:</strong> --:--</p>
                <p><strong>Penalitzacions:</strong> 0</p>
            </div>
        `;
    }
}