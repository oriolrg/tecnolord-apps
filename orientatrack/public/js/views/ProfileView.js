export class ProfileView {
    constructor(containerId, gameInstance) {
        this.container = document.getElementById(containerId);
        this.game = gameInstance;
        this.render();
    }

    render() {
        const fitesTrobades = this.game.fites.filter(f => f.trobada).length;
        const totalFites = this.game.fites.length;

        this.container.innerHTML = `
            <div class="screen-content">
                <h2 style="color:var(--dark); border-bottom:2px solid var(--primary); padding-bottom:10px;">
                    <i class="fas fa-user-circle"></i> El meu Perfil
                </h2>
                <div style="margin-top:20px; display:grid; gap:15px;">
                    <div style="background:#f7fafc; padding:20px; border-radius:12px; text-align:center;">
                        <span style="font-size:0.8rem; color:#718096; text-transform:uppercase;">Fites Completades</span>
                        <div style="font-size:2.5rem; font-weight:bold; color:var(--primary);">${fitesTrobades} / ${totalFites}</div>
                    </div>
                    <div style="background:#f7fafc; padding:20px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:#4a5568;"><i class="fas fa-clock"></i> Temps total</span>
                        <strong id="profile-time">--:--</strong>
                    </div>
                </div>
            </div>
        `;
    }

    update() {
        this.render(); // Refresca les dades quan s'obre la pantalla
    }
}