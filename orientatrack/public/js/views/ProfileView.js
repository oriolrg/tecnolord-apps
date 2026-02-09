export class ProfileView {
    constructor(containerId, gameInstance) {
        this.container = document.getElementById(containerId);
        this.game = gameInstance;
        this.timerInterval = null; 
        this.render();
    }

    /**
     * Converteix mil·lisegons a format llegible (MM:SS o H:MM:SS)
     */
    formatTime(ms) {
        if (!ms || ms <= 0) return "00:00";
        const segonsTotals = Math.floor(ms / 1000);
        const hores = Math.floor(segonsTotals / 3600);
        const minuts = Math.floor((segonsTotals % 3600) / 60);
        const segons = segonsTotals % 60;

        const mStr = minuts.toString().padStart(2, '0');
        const sStr = segons.toString().padStart(2, '0');

        if (hores > 0) return `${hores}:${mStr}:${sStr}`;
        return `${mStr}:${sStr}`;
    }

    render() {
        // 1. Dades de la sessió actual des del GameLogic
        const fitesTrobades = this.game.fites.filter(f => f.trobada).length;
        const totalFites = this.game.fites.length;
        const tempsGlobalMs = this.game.startTime ? (Date.now() - this.game.startTime) : 0;

        // 2. Recuperem l'historial complet del LocalStorage
        const historial = JSON.parse(localStorage.getItem('orientatrack_history') || '[]');

        this.container.innerHTML = `
            <div class="screen-content">
                <h2 class="profile-header">
                    <i class="fas fa-user-circle"></i> El meu Perfil
                </h2>

                <div class="current-session-section">
                    <h3 class="section-title">Ruta actual: ${this.game.currentRouteName || 'Cap'}</h3>
                    
                    <div class="stats-grid">
                        <div class="stat-card main-stat">
                            <span class="stat-label">Temps Global</span>
                            <div id="live-profile-timer" class="stat-value">${this.formatTime(tempsGlobalMs)}</div>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Fites</span>
                            <div class="stat-value">${fitesTrobades}/${totalFites}</div>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">SOS/Penal.</span>
                            <div class="stat-value" style="color:#e53e3e;">+${this.game.penalitzacions} m</div>
                        </div>
                    </div>

                    <div class="partials-box">
                        <div class="partials-header">Temps per fita (Parcials)</div>
                        <div id="partials-list">
                            ${this.renderCurrentPartials()}
                        </div>
                    </div>
                </div>

                <div class="affiliate-section">
                    <h3 class="section-title"><i class="fas fa-shopping-bag"></i> Material Recomanat</h3>
                    
                    <div class="support-message">
                        <i class="fas fa-heart" style="color: #e53e3e; margin-right: 5px;"></i>
                        Comprant a través d'aquests enllaços ens <strong>ajudes a mantenir l'aplicació gratuïta</strong>. Gràcies pel teu suport!
                    </div>

                    <div class="gear-grid">
                        <a data-umami-event="Click Amazon - Brúixola" href="https://amzn.to/4klZN86" target="_blank" class="gear-card">
                            <i class="fas fa-compass"></i>
                            <span>Brúixola Elit</span>
                        </a>
                        <a data-umami-event="Click Amazon - Motxilles" href="https://amzn.to/4a62YgP" target="_blank" class="gear-card">
                            <i class="fas fa-running"></i>
                            <span>Motxilles</span>
                        </a>
                        <a data-umami-event="Click Amazon - Merrell" href="https://amzn.to/3O62jmS" target="_blank" class="gear-card">
                            <i class="fas fa-running"></i>
                            <span>Merrell Trail Running</span>
                        </a>
                        <a data-umami-event="Click Amazon - Estacio meteo" href="https://amzn.to/4an3aac" target="_blank" class="gear-card">
                            <i class="fas fa-cloud-sun"></i>
                            <span>Estacio Meteo</span>
                        </a>
                    </div>
                </div>

                <div class="history-section" style="margin-top: 30px;">
                    <h3 class="section-title"><i class="fas fa-history"></i> Historial de Rutes</h3>
                    <div class="history-container">
                        ${historial.length === 0 ? 
                            `<p class="empty-msg">Encara no has completat cap ruta.</p>` :
                            this.renderHistoryTable(historial)
                        }
                    </div>
                </div>

                ${historial.length > 0 ? `
                    <button id="btn-delete-history" class="btn-danger-link">
                        Esborrar tot l'historial
                    </button>
                ` : ''}

                <div style="margin-top: 50px; padding: 25px 15px; border-top: 1px dashed #cbd5e0; text-align: center;">
                    <p style="font-size: 0.85rem; color: #4a5568; margin-bottom: 15px; font-weight: bold;">
                        Explora l'ecosistema Tecnolord:
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px; margin: 0 auto;">
                        
                        <a href="https://tecnolord.cat/meteo" 
                           data-umami-event="Anem a Meteo"
                           style="text-decoration: none; font-size: 0.9rem; color: #3182ce; background: #ebf8ff; padding: 14px; border-radius: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid #bee3f8;">
                            <img src="https://tecnolord.cat/meteo/assets/icons/favicon-96x96.png" style="width: 20px; height: 20px; border-radius: 4px;" alt="Anar a">
        METEO Temps Real
                        </a>

                        <a href="https://tecnolord.cat/pap/" 
                           data-umami-event="Anem a PaP"
                           style="text-decoration: none; font-size: 0.9rem; color: #48bb78; background: #f0fff4; padding: 14px; border-radius: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid #c6f6d5;">
                            <img src="https://tecnolord.cat/pap/icon-512.png" style="width: 20px; height: 20px; border-radius: 4px;" alt="Anar a">
        PaP SANT LLORENÇ
                        </a>

                        <div style="text-decoration: none; font-size: 0.75rem; color: #ed8936; padding: 10px; border-radius: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; opacity: 0.7;">
                            <img src="https://tecnolord.cat/orientatrack/icons/icon-512x512.png" style="width: 20px; height: 20px; border-radius: 4px;" alt="Anar a">
        ORIENTATRACK (v. Beta)
                        </div>
                    </div>
                    <p style="margin-top: 20px; font-size: 0.75rem; color: #a0aec0;">Desenvolupat amb ❤️ a la Vall de Lord</p>
                </div>
            </div>
        `;

        this.injectStyles();
        this.initListeners();
        this.startLiveTimer();
    }

    startLiveTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        const timerEl = this.container.querySelector('#live-profile-timer');
        if (!timerEl || !this.game.startTime) return;

        this.timerInterval = setInterval(() => {
            const ms = Date.now() - this.game.startTime;
            timerEl.innerText = this.formatTime(ms);
        }, 1000);
    }

    renderCurrentPartials() {
        if (this.game.fites.length === 0) return `<p class="empty-msg">No hi ha cap ruta carregada.</p>`;

        return this.game.fites.map((f, i) => {
            let tempsTram = "--:--";
            if (this.game.fitesTimestamps && this.game.fitesTimestamps[i]) {
                const iniciTram = (i === 0) ? this.game.startTime : this.game.fitesTimestamps[i-1];
                const duradaTram = this.game.fitesTimestamps[i] - iniciTram;
                tempsTram = this.formatTime(duradaTram);
            }
            return `
                <div class="partial-item ${f.trobada ? 'completed' : 'pending'}">
                    <span class="fita-nom">${f.nom}</span>
                    <span class="fita-temps">${tempsTram}</span>
                </div>
            `;
        }).join('');
    }

    renderHistoryTable(historial) {
        const sorted = [...historial].reverse();
        return `
            <div class="table-wrapper">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Data/Ruta</th>
                            <th>Net</th>
                            <th>SOS</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sorted.map(entry => `
                            <tr>
                                <td>
                                    <div class="route-cell-name">${entry.rutaNom || 'Ruta'}</div>
                                    <div class="route-cell-date">${new Date(entry.data).toLocaleDateString()}</div>
                                </td>
                                <td>${entry.tempsNet}m</td>
                                <td class="${entry.penalitzacions > 0 ? 'text-red' : 'text-green'}">+${entry.penalitzacions}m</td>
                                <td class="text-bold text-primary">${entry.tempsFinal}m</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    initListeners() {
        const delBtn = this.container.querySelector('#btn-delete-history');
        if (delBtn) {
            delBtn.onclick = () => {
                if (confirm("Estàs segur que vols esborrar l'historial permanentment?")) {
                    localStorage.removeItem('orientatrack_history');
                    this.render();
                }
            };
        }
    }

    injectStyles() {
        if (document.getElementById('profile-styles')) return;
        const style = document.createElement('style');
        style.id = 'profile-styles';
        style.innerHTML = `
            .profile-header { color:#2d3748; border-bottom:2px solid #3182ce; padding-bottom:10px; margin-bottom:20px; }
            .section-title { font-size: 1.1rem; color: #4a5568; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
            .stat-card { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #edf2f7; text-align: center; }
            .main-stat { grid-column: span 2; background: #ebf8ff; border-color: #bee3f8; }
            .stat-label { font-size: 0.7rem; color: #718096; text-transform: uppercase; font-weight: bold; display: block; }
            .stat-value { font-size: 1.6rem; font-weight: 800; color: #2d3748; margin-top: 5px; }
            .main-stat .stat-value { font-size: 2.2rem; color: #3182ce; font-family: monospace; }
            
            .affiliate-section { margin-top: 30px; background: #fdf2f2; padding: 18px; border-radius: 15px; border: 1px solid #fed7d7; }
            .support-message { font-size: 0.8rem; color: #4a5568; margin-bottom: 15px; line-height: 1.4; text-align: center; background: rgba(255,255,255,0.5); padding: 10px; border-radius: 8px; border: 1px solid #feb2b2; }
            .gear-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .gear-card { 
                background: white; border: 1px solid #feb2b2; padding: 12px; border-radius: 10px; 
                text-align: center; text-decoration: none; color: #c53030; display: flex; 
                flex-direction: column; align-items: center; gap: 5px; transition: transform 0.2s;
            }
            .gear-card:active { transform: scale(0.95); }
            .gear-card i { font-size: 1.2rem; color: #e53e3e; }
            .gear-card span { font-size: 0.75rem; font-weight: bold; }

            .partials-box { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-top: 15px;}
            .partials-header { background: #f7fafc; padding: 10px 15px; font-size: 0.8rem; font-weight: bold; color: #a0aec0; border-bottom: 1px solid #e2e8f0; }
            .partial-item { display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #f7fafc; font-size: 0.9rem; }
            .partial-item.completed { color: #2d3748; background: #f0fff4; }
            .fita-temps { font-weight: bold; font-family: monospace; }
            .history-section { margin-top: 30px; }
            .table-wrapper { overflow-x: auto; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
            .history-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
            .history-table th { background: #edf2f7; padding: 12px 10px; text-align: left; color: #4a5568; }
            .history-table td { padding: 12px 10px; border-bottom: 1px solid #edf2f7; }
            .text-red { color: #e53e3e; font-weight: bold; }
            .text-green { color: #38a169; font-weight: bold; }
            .btn-danger-link { background: none; border: none; color: #e53e3e; font-size: 0.8rem; cursor: pointer; width: 100%; text-decoration: underline; margin-top: 15px; }
        `;
        document.head.appendChild(style);
    }

    update() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.render(); 
    }
}