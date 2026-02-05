import { GameLogic } from './core/GameLogic.js';
import { Menu } from './components/Menu.js';
import { GameView } from './views/GameView.js';
import { SOSView } from './views/SOSView.js';
import { RutesView } from './views/RutesView.js';
import { ProfileView } from './views/ProfileView.js'; // Assegura't que l'importes

let game, gameView, sosView, menu, rutesView, profileView;

document.getElementById('btn-permis').onclick = async () => {
    document.getElementById('btn-permis').style.display = 'none';

    game = new GameLogic();
    gameView = new GameView();
    sosView = new SOSView(game);
    // Inicialitzem el ProfileView perquè pugui ser actualitzat pel menú
    profileView = new ProfileView('profile-container', game); 
    
    menu = new Menu('main-menu-container', game, gameView, sosView);

    // --- LÒGICA D'INTERCEPCIÓ DEL MENÚ ---
    const originalSwitch = menu.switchScreen.bind(menu);
    menu.switchScreen = (screen) => {
        // 1. Si entra a SOS, apliquem penalització
        if (screen === 'sos') {
            game.afegirPenalitzacioSOS();
            if ("vibrate" in navigator) navigator.vibrate(100);
        }
        // 2. Si entra a Perfil, forcem l'actualització de dades
        if (screen === 'perfil') {
            profileView.update();
        }
        originalSwitch(screen);
    };

    // REPRESA DE SESSIÓ
    if (game.loadState()) {
        if (confirm("Vols continuar la ruta anterior?")) {
            gameView.refreshMarkers(game.fites, game.indexFitaActual);
            const estat = game.getEstatActual();
            if (estat) gameView.updateNavigation(estat.fitaNom, 0, 0);
            menu.switchScreen('joc');
        } else {
            game.clearState();
        }
    }

    const carregarNovaRuta = async (dataRuta) => {
        try {
            let fites = dataRuta.fites || await game.carregarRuta(dataRuta.fitxer);
            fites = fites.map(f => ({
                ...f, 
                lat: Number(f.lat), 
                lon: Number(f.lon),
                radius: Number(f.radius || f.radius_m || 25)
            }));
            game.fites = fites;
            game.indexFitaActual = 0;
            game.penalitzacions = 0;
            game.saveState();
            
            gameView.refreshMarkers(fites, 0);
            const estat = game.getEstatActual();
            if (estat) gameView.updateNavigation(estat.fitaNom, 0, 0);
        } catch (e) {
            console.error("Error ruta:", e);
        }
    };

    rutesView = new RutesView('route-selector-container', async (ruta) => {
        await carregarNovaRuta(ruta);
        menu.switchScreen('joc');
    });

    // GEOLOCALITZACIÓ I FINAL DE RUTA
    navigator.geolocation.watchPosition((pos) => {
        const estat = game.processarPosicio(pos);
        if (estat) {
            gameView.updateNavigation(estat.fitaNom, estat.dist, estat.rumb);
            
            if (estat.fitaTrobada) {
                gameView.refreshMarkers(game.fites, game.indexFitaActual);
                if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);

                // COMPROVACIÓ DE FINAL DE RUTA
                if (estat.rutaCompletada) {
                    const tempsNetMin = Math.round((Date.now() - game.startTime) / 60000);
                    const tempsFinalMin = tempsNetMin + game.penalitzacions;

                    // Desem historial abans d'esborrar sessió
                    game.saveToHistory(tempsNetMin, tempsFinalMin);

                    alert(`🏆 RUTA FINALITZADA!\n\nTemps Net: ${tempsNetMin} min\nPenalitzacions SOS: ${game.penalitzacions} min\nTOTAL: ${tempsFinalMin} min`);
                    
                    game.clearState();
                    menu.switchScreen('rutes');
                } else {
                    alert(`🎯 ${estat.fitaNom} TROBADA!`);
                }
            }
        }
        sosView.updatePosition(pos);
    }, null, { enableHighAccuracy: true, maximumAge: 0 });

    // Sensors brúixola
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined) gameView.updateCompass(heading);
    }, true);
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}