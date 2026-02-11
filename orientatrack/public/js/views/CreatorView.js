import { GameLogic } from './core/GameLogic.js';
import { Menu } from './components/Menu.js';
import { GameView } from './views/GameView.js';
import { SOSView } from './views/SOSView.js';
import { RutesView } from './views/RutesView.js';
import { ProfileView } from './views/ProfileView.js';
import { WelcomeView } from './views/WelcomeView.js';
import { CreatorView } from './views/CreatorView.js';

let game, gameView, sosView, menu, rutesView, profileView, creatorView;

// Mostrem la pantalla de benvinguda (si és la primera vegada o segons la seva lògica interna)
new WelcomeView();

/**
 * Inicialitza els components core de l'aplicació
 */
const initApp = async () => {
    // 1. Instanciació de la lògica i vistes principals
    game = new GameLogic();
    gameView = new GameView();
    sosView = new SOSView(game);
    
    // Contenidors definits a l'index.html
    profileView = new ProfileView('view-perfil', game); 
    creatorView = new CreatorView('view-creador', game);
    
    menu = new Menu('main-menu-container', game, gameView, sosView);

    // 2. Intercepció del Menú per a rutes, penalitzacions i refresc de dades
    const originalSwitch = menu.switchScreen.bind(menu);
    
    menu.switchScreen = (screen) => {
        // Refresquem el creador si s'hi accedeix
        if (screen === 'creador') {
            creatorView.update();
        }
        
        // Refresquem el perfil (temps global i parcials)
        if (screen === 'perfil') {
            profileView.update();
        }
        
        // Apliquem penalització de temps si s'entra al mode SOS (Ajuda externa)
        if (screen === 'sos') {
            game.afegirPenalitzacioSOS(); 
            if ("vibrate" in navigator) navigator.vibrate(100);
        }
        
        originalSwitch(screen);
    };

    // 3. Gestió de Represa de Sessió (Persistència)
    if (game.loadState()) {
        if (confirm("S'ha detectat una ruta en curs. Vols continuar-la?")) {
            gameView.refreshMarkers(game.fites, game.indexFitaActual);
            const estat = game.getEstatActual();
            if (estat) {
                gameView.updateNavigation(estat.fitaNom, estat.dist, estat.rumb);
            }
            menu.switchScreen('joc');
        } else {
            game.clearState(); // Esborrem si l'usuari vol començar de zero
        }
    }

    /**
     * Carrega un fitxer GPX i el processa per al joc
     */
    const carregarNovaRuta = async (dataRuta) => {
        try {
            let fites = dataRuta.fites || await game.carregarRuta(dataRuta.fitxer);
            
            // Normalització de fites (assegurar números i radi per defecte)
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
            console.error("Error carregant la ruta:", e);
            alert("No s'ha pogut carregar la ruta seleccionada.");
        }
    };

    // Inicialitzem el selector de rutes
    rutesView = new RutesView('route-selector-container', async (ruta) => {
        await carregarNovaRuta(ruta);
        menu.switchScreen('joc');
    });

    // 4. Seguiment GPS i Validació de Fites
    navigator.geolocation.watchPosition((pos) => {
        const accuracy = pos.coords.accuracy;
        
        // Indicador visual de qualitat del senyal GPS (semàfor)
        const gpsDot = document.getElementById('gps-status-dot');
        if (gpsDot) {
            gpsDot.style.backgroundColor = accuracy < 10 ? '#48bb78' : (accuracy < 30 ? '#ecc94b' : '#f56565');
        }

        const estat = game.processarPosicio(pos);
        if (estat) {
            // Actualitzem panell inferior de navegació (distància i fita)
            gameView.updateNavigation(estat.fitaNom, estat.dist, estat.rumb);
            
            if (estat.fitaTrobada) {
                // Actualitzem el mapa per marcar la fita com a trobada
                gameView.refreshMarkers(game.fites, game.indexFitaActual);
                if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);

                // Comprovem si era la darrera fita de la ruta
                if (estat.rutaCompletada) {
                    const tNet = Math.round((Date.now() - game.startTime) / 60000);
                    const tTotal = tNet + game.penalitzacions;
                    
                    // Guardem a l'historial del perfil
                    game.saveToHistory(tNet, tTotal);

                    alert(`🏆 RUTA FINALITZADA!\n\nTemps Net: ${tNet} min\nSOS/Penalitzacions: +${game.penalitzacions} min\nTEMPS TOTAL: ${tTotal} min`);
                    
                    game.clearState();
                    menu.switchScreen('rutes');
                } else {
                    alert(`🎯 ${estat.fitaNom} TROBADA!`);
                }
            }
        }
        
        // Actualitzem la posició de l'usuari al mapa del mode SOS
        sosView.updatePosition(pos);
        
    }, (err) => {
        console.warn("Error Geolocation:", err.message);
    }, { 
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000 
    });

    // 5. Gestió de l'Orientació (Brúixola)
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined) {
            gameView.updateCompass(heading);
        }
    }, true);
};

// Arrenquem l'aplicació
initApp();

// 6. Registre del Service Worker (PWA) amb autorefresh en actualitzacions
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Força el recàrrega per aplicar la nova versió instal·lada
                        window.location.reload();
                    }
                };
            };
        }).catch(err => {
            console.error('Error Service Worker:', err);
        });
    });
}