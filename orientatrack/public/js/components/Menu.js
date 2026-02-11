export class Menu {
    constructor(containerId, game, gameView, sosView, profileView) {
        this.container = document.getElementById(containerId);
        this.game = game;
        this.gameView = gameView;
        this.sosView = sosView;
        this.profileView = profileView;
        this.injectStyles();
        this.render();
        this.initEventListeners();
    }

    injectStyles() {
        if (document.getElementById('menu-styles')) return;
        const style = document.createElement('style');
        style.id = 'menu-styles';
        style.innerHTML = `
            .main-menu {
                display: flex; justify-content: space-around; padding: 10px 0;
                background: #1a202c; position: relative; z-index: 10;
            }
            .menu-btn {
                flex: 1; background: none; border: none; color: #a0aec0;
                display: flex; flex-direction: column; align-items: center; font-size: 0.7rem; gap: 3px;
                cursor: pointer;
            }
            .menu-btn.active { color: white; }
            .menu-btn i { font-size: 1.2rem; }

            #fites-menu {
                position: fixed !important;
                bottom: 110px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: 90% !important;
                max-height: 55vh !important;
                background: white !important;
                border-radius: 12px !important;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.5) !important;
                z-index: 99999 !important;
                display: none;
                overflow-y: auto;
                border: 2px solid var(--primary);
            }
        `;
        document.head.appendChild(style);
    }

    render() {
        this.container.innerHTML = `
            <nav class="main-menu">
                <button class="menu-btn" data-screen="rutes"><i class="fas fa-route"></i><span>Rutes</span></button>
                <button class="menu-btn active" data-screen="joc"><i class="fas fa-compass"></i><span>Joc</span></button>
                <button id="btn-fites" class="menu-btn"><i class="fas fa-list-ol"></i><span>Fites</span></button>
                <button class="menu-btn" data-screen="sos"><i class="fas fa-skull-crossbones"></i><span>SOS</span></button>
                <button class="menu-btn" data-screen="perfil"><i class="fas fa-user-circle"></i><span>Perfil</span></button>
            </nav>
        `;
    }

    initEventListeners() {
        this.container.querySelectorAll('.menu-btn').forEach(btn => {
            btn.onclick = () => {
                const screen = btn.getAttribute('data-screen');
                if (btn.id === 'btn-fites') {
                    this.gameView.showCheckpoints(this.game.fites, this.game.indexFitaActual, (i) => {
                        this.game.indexFitaActual = i;
                        this.gameView.refreshMarkers(this.game.fites, i);
                        const estat = this.game.getEstatActual();
                        this.gameView.updateNavigation(estat.fitaNom, estat.dist, estat.rumb);
                    });
                    return;
                }
                
                if (screen === 'sos') {
                    if (confirm("L'ajuda SOS penalitza el temps. Vols continuar?")) {
                        this.game.penalitzacions++;
                        this.switchScreen(screen);
                    }
                } else {
                    this.switchScreen(screen);
                }
                
                this.container.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });
    }

    switchScreen(id) {
        // 1. Gestió de visibilitat de les vistes
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(`view-${id}`);
        if (target) target.classList.add('active');

        // 2. GESTIÓ BRÚIXOLA: S'amaga en totes les pantalles excepte a 'joc'
        const compass = document.getElementById('compass-container');
        if (compass) {
            // Es mostra si estem a 'joc' i l'usuari no l'ha amagat manualment amb el botó
            compass.style.display = (id === 'joc' && this.gameView.compass.userWantsVisible) ? 'block' : 'none';
        }

        // 3. SOLUCIÓ MAPA SOS: Recalcula el tamany del mapa Leaflet quan la vista és visible
        if (id === 'sos' && this.sosView) {
            setTimeout(() => {
                this.sosView.invalidate(); // Crida al mètode d'invalidació del SOSView
            }, 100);
        }

        // 4. Actualització del perfil
        if (id === 'perfil' && this.profileView) this.profileView.update();
    }
}