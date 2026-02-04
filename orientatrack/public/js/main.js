import { Compass } from './components/Compass.js';
import { MapManager } from './components/MapManager.js';
import { NavigationPanel } from './components/NavigationPanel.js';
import { GameLogic } from './core/GameLogic.js';

let compass, map, navPanel, game;

document.getElementById('btn-permis').onclick = async () => {
    // Inicialització
    compass = new Compass('compass-container');
    map = new MapManager('map');
    navPanel = new NavigationPanel('navigation-panel');
    game = new GameLogic();

    // Carregar dades
    const fites = await game.carregarRuta('data/ruta.gpx');
    map.dibuixarFites(fites, 0, (i) => {
        game.indexFitaActual = i;
        map.dibuixarFites(fites, i);
    });

    // Sensors
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        compass.updateHeading(heading);
    }, true);

    navigator.geolocation.watchPosition((pos) => {
        const estat = game.processarPosicio(pos);
        if (estat) {
            navPanel.update(estat.fitaNom, estat.dist, estat.rumb);
            if (estat.fitaTrobada) {
                if ("vibrate" in navigator) navigator.vibrate(200);
                map.dibuixarFites(game.fites, game.indexFitaActual);
            }
            if (estat.final) map.revelarRutes(game.trackReal, game.fites);
        }
    }, null, { enableHighAccuracy: true });

    document.getElementById('btn-permis').style.display = 'none';
};