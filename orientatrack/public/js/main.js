import { GameLogic } from './core/GameLogic.js';
import { Menu } from './components/Menu.js';
import { GameView } from './views/GameView.js';
import { SOSView } from './views/SOSView.js';
import { RutesView } from './views/RutesView.js';

let game, gameView, sosView, menu, rutesView;

document.getElementById('btn-permis').onclick = async () => {
    document.getElementById('btn-permis').style.display = 'none';

    game = new GameLogic();
    gameView = new GameView();
    sosView = new SOSView(game);
    menu = new Menu('main-menu-container', game, gameView, sosView);

    const carregarNovaRuta = async (dataRuta) => {
        try {
            let fites;
            if (dataRuta.fites) {
                fites = dataRuta.fites;
            } else {
                fites = await game.carregarRuta(dataRuta.fitxer);
            }

            // --- NORMALITZACIÓ CRÍTICA ---
            // Ens assegurem que lat, lon i radius siguin NÚMEROS
            fites = fites.map(f => ({
                ...f,
                lat: Number(f.lat),
                lon: Number(f.lon),
                radius: Number(f.radius || f.radi || f.radi_validacio_m || 25)
            }));

            game.fites = fites;
            game.indexFitaActual = 0;
            
            console.log("Ruta a punt:", dataRuta.nom);
            
            // Ara refreshMarkers rebrà dades perfectes
            gameView.refreshMarkers(fites, 0);
            
            const estat = game.getEstatActual();
            if (estat) gameView.updateNavigation(estat.fitaNom, 0, 0);

        } catch (e) {
            console.error("Error ruta:", e);
            alert("No s'ha pogut carregar la ruta.");
        }
    };

    rutesView = new RutesView('route-selector-container', async (ruta) => {
        await carregarNovaRuta(ruta);
        menu.switchScreen('joc');
    });

    if (rutesView.rutes.length > 0) {
        await carregarNovaRuta(rutesView.rutes[0]);
    }

    // Sensors i GPS
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
                if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
                alert(`🎯 ${estat.fitaNom} TROBADA!`);
            }
        }
        sosView.updatePosition(pos);
    }, null, { enableHighAccuracy: true, maximumAge: 0 });
};