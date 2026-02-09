export class WelcomeView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.storageKey = 'orientatrack_welcome_seen';
        
        // Només l'executem si no s'ha vist mai
        if (!localStorage.getItem(this.storageKey)) {
            // Afegim una classe al body per controlar la visibilitat d'altres elements
            document.body.classList.add('welcome-active');
            this.render();
            this.initListeners();
        }
    }

    render() {
        const overlay = document.createElement('div');
        overlay.id = 'welcome-overlay';
        overlay.innerHTML = `
            <div class="welcome-card">
                <div class="welcome-header">
                    <img src="icon-512.png" alt="Logo" class="welcome-logo">
                    <h1>Benvingut a OrientaTrack</h1>
                </div>
                
                <div class="welcome-body">
                    <p>Una forma diferent de descobrir la muntanya, jugant i competint <strong>Rogaine</strong>.</p>
                    
                    <div class="info-item">
                        <i class="fas fa-route"></i>
                        <div>
                            <strong>Rutes i GPX</strong>
                            <span>Carrega els teus fitxers GPX o tria rutes oficials.</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <i class="fas fa-compass"></i>
                        <div>
                            <strong>Navegació Real</strong>
                            <span>Brúixola integrada i distància a la fita en temps real.</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <i class="fas fa-life-ring"></i>
                        <div>
                            <strong>Seguretat (SOS)</strong>
                            <span>Si et perds, el mode SOS t'ubica i t'ajuda a tornar (amb penalització).</span>
                        </div>
                    </div>
                </div>

                <button id="btn-close-welcome" class="welcome-btn"> COMENÇAR ARA </button>
                
                <p class="welcome-footer">Creat per Tecnolord</p>
            </div>
        `;

        this.injectStyles();
        document.body.appendChild(overlay);
    }

    initListeners() {
        const btn = document.getElementById('btn-close-welcome');
        if (btn) {
            btn.onclick = () => {
                localStorage.setItem(this.storageKey, 'true');
                // Treiem la classe del body per tornar a mostrar la brúixola
                document.body.classList.remove('welcome-active');
                
                const overlay = document.getElementById('welcome-overlay');
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 500);
            };
        }
    }

    injectStyles() {
        if (document.getElementById('welcome-styles')) return;
        const style = document.createElement('style');
        style.id = 'welcome-styles';
        style.innerHTML = `
            /* AMAGUEM LA BRÚIXOLA I EL GPS QUAN EL WELCOME ESTÀ ACTIU */
            body.welcome-active #compass-container, 
            body.welcome-active #gps-status-dot,
            body.welcome-active .bottom-ui { 
                display: none !important; 
            }

            #welcome-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(26, 32, 44, 0.98); z-index: 10000;
                display: flex; align-items: center; justify-content: center;
                transition: opacity 0.5s ease; padding: 20px; box-sizing: border-box;
            }
            .welcome-card {
                background: white; border-radius: 20px; padding: 30px;
                max-width: 400px; width: 100%; text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: slideUp 0.6s ease-out;
                z-index: 10001;
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .welcome-logo { width: 80px; height: 80px; margin-bottom: 15px; border-radius: 15px; object-fit: cover; }
            .welcome-header h1 { font-size: 1.5rem; color: #2d3748; margin: 0 0 20px 0; }
            .welcome-body { text-align: left; margin-bottom: 25px; }
            .info-item { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 18px; }
            .info-item i { font-size: 1.2rem; color: #3182ce; margin-top: 3px; width: 25px; text-align: center; }
            .info-item strong { display: block; font-size: 0.95rem; color: #2d3748; }
            .info-item span { font-size: 0.85rem; color: #718096; line-height: 1.3; }
            .welcome-btn {
                width: 100%; padding: 15px; background: #3182ce; color: white;
                border: none; border-radius: 12px; font-weight: bold; cursor: pointer;
                box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4); font-size: 1rem;
            }
            .welcome-footer { font-size: 0.75rem; color: #a0aec0; margin-top: 20px; }
        `;
        document.head.appendChild(style);
    }
}