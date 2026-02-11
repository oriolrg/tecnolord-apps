// js/components/Menu.js

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
                height: 60px;
            }
            .menu-btn {
                flex: 1; background: none; border: none; color: #a0aec0;
                display: flex; flex-direction: column; align-items: center; font-size: 0.7rem; gap: 3px;
                cursor: pointer;
            }
            .menu-btn.active { color: white; }
            .menu-btn i { font-size: 1.2rem; }
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
                    });
                    return;
                }
                
                if (screen) {
                    this.switchScreen(screen);
                    this.container.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            };
        });
    }

    switchScreen(id) {
        // Amaguem totes les vistes
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        // Mapatge d'IDs per seguretat
        const viewMap = {
            'joc': 'view-joc',
            'sos': 'view-sos',
            'perfil': 'view-perfil',
            'rutes': 'view-rutes',
            'creator': 'view-creator'
        };

        const target = document.getElementById(viewMap[id] || `view-${id}`);
        if (target) target.classList.add('active');

        // Brúixola
        const compass = document.getElementById('compass-container');
        if (compass) compass.style.display = (id === 'joc') ? 'block' : 'none';
        
        // SOS
        if (id === 'sos' && this.sosView) setTimeout(() => this.sosView.invalidate(), 100);
        
        // Perfil
        if (id === 'perfil' && this.profileView) this.profileView.update();
    }
}
// ASSEGURA'T QUE AQUÍ SOTA NO HI HA RES MÉS DECLARANT 'Menu'