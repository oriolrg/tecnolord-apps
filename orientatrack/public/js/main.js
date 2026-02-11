import { GameLogic } from './core/GameLogic.js';
import { Menu } from './components/Menu.js';
import { GameView } from './views/GameView.js';
import { SOSView } from './views/SOSView.js';
import { RutesView } from './views/RutesView.js';
import { CreatorView } from './views/CreatorView.js';
import { ProfileView } from './views/ProfileView.js';
import { WelcomeView } from './views/WelcomeView.js';

let game, gameView, sosView, menu, rutesView, profileView, creatorView;

// Benvinguda inicial
new WelcomeView();

const initApp = async () => {
    // 1. Inicialitzem lògica i vistes
    game = new GameLogic();
    gameView = new GameView();
    sosView = new SOSView(game);
    
    // 2. Inicialitzem les vistes de contingut
    creatorView = new CreatorView('view-creator', game); 
    profileView = new ProfileView('view-perfil', game); 
    
    // 3. Inicialitzem el menú passant totes les referències necessàries
    menu = new Menu('main-menu-container', game, gameView, sosView, profileView, creatorView);

    // 4. Configurem el switch del menú per a casos especials
    const originalSwitch = menu.switchScreen.bind(menu);
    menu.switchScreen = (screen) => {
        if (screen === 'creator') {
            creatorView.update(); // Recalcula el mapa Leaflet
        }
        if (screen === 'sos') {
            game.afegirPenalitzacioSOS(); 
            if ("vibrate" in navigator) navigator.vibrate(100);
        }
        originalSwitch(screen);
    };

    // 5. Represa de sessió
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

    // 6. Funció per carregar rutes (des de fitxer o manualment)
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

    // 7. Inicialitzem el selector de rutes amb el botó de disseny
    rutesView = new RutesView('route-selector-container', 
        async (ruta) => {
            await carregarNovaRuta(ruta);
            menu.switchScreen('joc');
        }, 
        () => {
            menu.switchScreen('creator');
        }
    );

    // 8. Seguiment GPS i Orientació
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
                if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);

                if (estat.rutaCompletada) {
                    const tNet = Math.round((Date.now() - game.startTime) / 60000);
                    const tTotal = tNet + game.penalitzacions;
                    game.saveToHistory(tNet, tTotal);
                    alert(`🏆 FINAL!\nTOTAL: ${tTotal} min`);
                    game.clearState();
                    menu.switchScreen('rutes');
                } else {
                    alert(`🎯 ${estat.fitaNom} TROBADA!`);
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

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    });
}