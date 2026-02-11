import { GameLogic } from './core/GameLogic.js';
import { Menu } from './components/Menu.js';
import { GameView } from './views/GameView.js';
import { SOSView } from './views/SOSView.js';
import { RutesView } from './views/RutesView.js';
import { CreatorView } from './views/CreatorView.js';
import { ProfileView } from './views/ProfileView.js';
import { WelcomeView } from './views/WelcomeView.js';

let game, gameView, sosView, menu, rutesView, profileView, creatorView;

new WelcomeView();

const initApp = async () => {
    game = new GameLogic();
    gameView = new GameView();
    sosView = new SOSView(game);
    
    // El contenidor ha de coincidir amb l'HTML: view-creator
    creatorView = new CreatorView('view-creator', game); 
    profileView = new ProfileView('view-perfil', game); 
    menu = new Menu('main-menu-container', game, gameView, sosView, profileView);

    // Sobreescribim el switch per coses específiques
    const originalSwitch = menu.switchScreen.bind(menu);
    menu.switchScreen = (screen) => {
        if (screen === 'creator') {
            creatorView.update(); 
        }
        if (screen === 'sos') {
            game.afegirPenalitzacioSOS(); 
            if ("vibrate" in navigator) navigator.vibrate(100);
        }
        originalSwitch(screen);
    };

    if (game.loadState()) {
        if (confirm("Vols continuar la ruta anterior?")) {
            gameView.refreshMarkers(game.fites, game.indexFitaActual);
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
        } catch (e) { console.error("Error ruta:", e); }
    };

    // Passem el tercer argument al constructor de RutesView
    rutesView = new RutesView('route-selector-container', async (ruta) => {
        await carregarNovaRuta(ruta);
        menu.switchScreen('joc');
    }, () => {
        menu.switchScreen('creator'); // Obre la vista de creació
    });

    navigator.geolocation.watchPosition((pos) => {
        const accuracy = pos.coords.accuracy;
        const gpsDot = document.getElementById('gps-status-dot');
        if (gpsDot) {
            gpsDot.style.backgroundColor = accuracy < 10 ? '#48bb78' : (accuracy < 30 ? '#ecc94b' : '#f56565');
        }

        const estat = game.processarPosicio(pos);
        if (estat) {
            gameView.updateNavigation(estat.fitaNom, estat.dist, estat.rumb);
            if (estat.fitaTrobada) {
                gameView.refreshMarkers(game.fites, game.indexFitaActual);
                if (estat.rutaCompletada) {
                    game.clearState();
                    menu.switchScreen('rutes');
                    alert("Ruta completada!");
                }
            }
        }
        sosView.updatePosition(pos);
    }, null, { enableHighAccuracy: true });

    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined) gameView.updateCompass(heading);
    }, true);
};

initApp();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    });
}