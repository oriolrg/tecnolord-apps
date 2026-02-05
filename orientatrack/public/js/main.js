import { GameLogic } from './core/GameLogic.js';
import { Menu } from './components/Menu.js';
import { GameView } from './views/GameView.js';
import { SOSView } from './views/SOSView.js';
import { RutesView } from './views/RutesView.js';

let game, gameView, sosView, menu, rutesView;

document.getElementById('btn-permis').onclick = async () => {
    document.getElementById('btn-permis').style.display = 'none';

    // 1. Inicialització de components base
    game = new GameLogic();
    gameView = new GameView();
    sosView = new SOSView(game);
    menu = new Menu('main-menu-container', game, gameView, sosView);

    // 2. Funció reutilitzable per carregar rutes i resetejar la UI
    const carregarNovaRuta = async (ruta) => {
        try {
            console.log("Configurant ruta:", ruta.nom);
            const fites = await game.carregarRuta(ruta.fitxer);
            
            // Actualitzem el mapa i els marcadors (reseteja a Fita 1)
            gameView.refreshMarkers(fites, 0);
            
            // Forcem l'actualització del panell de navegació amb el primer objectiu
            const estatInicial = game.getEstatActual();
            if (estatInicial) {
                // En carregar la ruta posem distància i rumb a 0 fins que entri el primer senyal GPS
                gameView.updateNavigation(estatInicial.fitaNom, 0, 0);
            }
        } catch (e) {
            console.error("Error carregant la ruta:", e);
        }
    };

    // 3. Inicialització de RutesView i selecció de la primera ruta per defecte
    rutesView = new RutesView('route-selector-container', async (ruta) => {
        await carregarNovaRuta(ruta);
        menu.switchScreen('joc'); // Tornem a la pantalla de joc en seleccionar
    });

    // EXECUCIÓ PER DEFECTE: Carreguem la primera ruta de la llista immediatament
    const primeraRuta = rutesView.rutes[0];
    if (primeraRuta) {
        await carregarNovaRuta(primeraRuta);
    }

    // 4. Sensors (Es mantenen actius en segon pla)
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined) gameView.updateCompass(heading);
    }, true);

    navigator.geolocation.watchPosition((pos) => {
        const estat = game.processarPosicio(pos);
        if (estat) {
            gameView.updateNavigation(estat.fitaNom, estat.dist, estat.rumb);
            if (estat.fitaTrobada) {
                gameView.refreshMarkers(game.fites, game.indexFitaActual);
                if ("vibrate" in navigator) navigator.vibrate(200);
                alert(`🎯 ${estat.fitaNom} TROBADA!`);
            }
        }
        sosView.updatePosition(pos);
    }, null, { enableHighAccuracy: true });
};