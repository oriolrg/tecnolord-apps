export class Menu {
    constructor(containerId, game, gameView, sosView, profileView, creatorView) {
        this.container = document.getElementById(containerId);
        this.game = game;
        this.gameView = gameView;
        this.sosView = sosView;
        this.profileView = profileView;
        this.creatorView = creatorView; // Referència per accedir a les fites del creador
        
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
                height: 60px;
            }
            .menu-btn {
                flex: 1; background: none; border: none; color: #a0aec0;
                display: flex; flex-direction: column; align-items: center; font-size: 0.7rem; gap: 3px;
                cursor: pointer;
            }
            .menu-btn.active { color: white; }
            .menu-btn i { font-size: 1.2rem; }

            /* Estil del menú de fites per assegurar que sigui visible sobre el mapa */
            #fites-menu {
                position: fixed !important;
                bottom: 80px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: 90% !important;
                max-height: 55vh !important;
                background: white !important;
                border-radius: 12px !important;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.5) !important;
                z-index: 99999 !important; /* El més alt de tota l'app */
                display: none;
                overflow-y: auto;
                border: 2px solid #3182ce;
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
                
                // LÒGICA BOTÓ FITES (Detecta si estem al creador o al joc)
                if (btn.id === 'btn-fites') {
                    const isCreatorActive = document.getElementById('view-creator').classList.contains('active');
                    
                    if (isCreatorActive && this.creatorView) {
                        const fitesDraft = this.creatorView.routeCreator.draftFites;
                        if (fitesDraft.length === 0) return alert("Encara no hi ha fites al disseny.");
                        this.gameView.showCheckpoints(fitesDraft, -1, null);
                    } else {
                        if (!this.game.fites || this.game.fites.length === 0) return alert("No hi ha cap ruta carregada.");
                        this.gameView.showCheckpoints(this.game.fites, this.game.indexFitaActual, (i) => {
                            this.game.indexFitaActual = i;
                            this.gameView.refreshMarkers(this.game.fites, i);
                            const estat = this.game.getEstatActual();
                            this.gameView.updateNavigation(estat.fitaNom, estat.dist, estat.rumb);
                        });
                    }
                    return;
                }
                
                // LÒGICA CANVI DE PANTALLA
                if (screen === 'sos') {
                    if (confirm("L'ajuda SOS penalitza el temps. Vols continuar?")) {
                        this.game.penalitzacions++;
                        this.switchScreen(screen);
                    }
                } else if (screen) {
                    this.switchScreen(screen);
                }
                
                this.container.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });
    }

    switchScreen(id) {
        // 1. Amagar totes les vistes
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        // 2. Amagar el panell de navegació si no estem al joc
        const navPanel = document.getElementById('navigation-panel-container');
        if (navPanel) navPanel.style.display = (id === 'joc') ? 'block' : 'none';

        // 3. Mapatge d'IDs per activar la vista correcta
        const viewMap = {
            'joc': 'view-joc',
            'sos': 'view-sos',
            'perfil': 'view-perfil',
            'rutes': 'view-rutes',
            'creator': 'view-creator'
        };

        const target = document.getElementById(viewMap[id] || `view-${id}`);
        if (target) target.classList.add('active');

        // 4. Gestió d'elements especials
        const compass = document.getElementById('compass-container');
        if (compass) compass.style.display = (id === 'joc') ? 'block' : 'none';
        
        if (id === 'sos' && this.sosView) setTimeout(() => this.sosView.invalidate(), 100);
        if (id === 'perfil' && this.profileView) this.profileView.update();
    }
}