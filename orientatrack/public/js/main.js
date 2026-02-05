import { Compass } from './components/Compass.js';
import { MapManager } from './components/MapManager.js';
import { NavigationPanel } from './components/NavigationPanel.js';
import { Menu } from './components/Menu.js';
import { GameLogic } from './core/GameLogic.js';
import { Legend } from './components/Legend.js';

let compass, map, navPanel, game, legend, menu;

document.getElementById('btn-permis').onclick = async () => {
    document.getElementById('btn-permis').style.display = 'none';

    // 1. Inicialització de components
    compass = new Compass('compass-container');
    map = new MapManager('map');
    navPanel = new NavigationPanel('navigation-panel-container');
    game = new GameLogic();
    legend = new Legend('map-legend-container', map.map);
    
    // 2. Inicialització del Menú (Nova classe)
    menu = new Menu('main-menu-container', game, map);

    // 3. Carregar dades de la ruta
    try {
        const fites = await game.carregarRuta('data/ruta.gpx');
        map.dibuixarFites(fites, 0);
    } catch (e) { 
        console.error("Error carregant ruta:", e); 
    }

    // 4. Sensors (Funcionen sempre en segon pla)
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined) {
            compass.updateHeading(heading);
        }
    }, true);

    navigator.geolocation.watchPosition((pos) => {
        const estat = game.processarPosicio(pos);
        if (estat) {
            // Actualitzem el panell de navegació (només visible a la pantalla Joc)
            navPanel.update(estat.fitaNom, estat.dist, estat.rumb);
            
            if (estat.fitaTrobada) {
                if ("vibrate" in navigator) navigator.vibrate(200);
                alert(`🎯 ${estat.fitaNom} TROBADA!`);
                map.dibuixarFites(game.fites, game.indexFitaActual);
            }
        }
    }, null, { enableHighAccuracy: true });
};