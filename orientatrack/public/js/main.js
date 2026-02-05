import { GameLogic } from './core/GameLogic.js';
import { Menu } from './components/Menu.js';
import { GameView } from './views/GameView.js';
import { SOSView } from './views/SOSView.js';
import { RutesView } from './views/RutesView.js';

let game, gameView, sosView, menu, rutesView;
let proximityVibrated = false;

document.getElementById('btn-permis').onclick = async () => {
    document.getElementById('btn-permis').style.display = 'none';

    game = new GameLogic();
    gameView = new GameView();
    sosView = new SOSView(game);
    menu = new Menu('main-menu-container', game, gameView, sosView);

    if (game.loadState()) {
        const resumir = confirm("S'ha detectat una ruta en curs. Vols continuar on ho vas deixar?");
        if (resumir) {
            console.log("Resumint sessió anterior...");
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
                radius: Number(f.radius || f.radi || f.radius_m || 25)
            }));
            game.fites = fites;
            game.indexFitaActual = 0;
            game.saveState();
            gameView.refreshMarkers(fites, 0);
            const estat = game.getEstatActual();
            if (estat) gameView.updateNavigation(estat.fitaNom, 0, 0);
        } catch (e) {
            console.error("Error carregant ruta:", e);
            alert("No s'ha pogut carregar la ruta.");
        }
    };

    rutesView = new RutesView('route-selector-container', async (ruta) => {
        await carregarNovaRuta(ruta);
        menu.switchScreen('joc');
    });

    if (!game.startTime && rutesView.rutes.length > 0) {
        await carregarNovaRuta(rutesView.rutes[0]);
    }

    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined) gameView.updateCompass(heading);
    }, true);

    navigator.geolocation.watchPosition((pos) => {
        const estat = game.processarPosicio(pos);
        if (estat) {
            gameView.updateNavigation(estat.fitaNom, estat.dist, estat.rumb);
            
            // VIBRACIÓ PROXIMITAT (Menys de 50m)
            if (estat.dist < 50 && estat.dist > 25 && !proximityVibrated) {
                if ("vibrate" in navigator) navigator.vibrate([50, 100, 50]);
                proximityVibrated = true;
            } else if (estat.dist >= 50) {
                proximityVibrated = false;
            }

            if (estat.fitaTrobada) {
                gameView.refreshMarkers(game.fites, game.indexFitaActual);
                if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
                alert(`🎯 ${estat.fitaNom} TROBADA!`);
            }
        }
        sosView.updatePosition(pos);
    }, null, { enableHighAccuracy: true, maximumAge: 0 });
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrat!', reg))
            .catch(err => console.error('Error registrant SW', err));
    });
}