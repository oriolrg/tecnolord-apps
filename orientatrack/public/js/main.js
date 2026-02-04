import { Compass } from './components/Compass.js';
import { MapManager } from './components/MapManager.js';
import { NavigationPanel } from './components/NavigationPanel.js';
import { GameLogic } from './core/GameLogic.js';
import { Legend } from './components/Legend.js';

let compass, map, navPanel, game, legend;

document.getElementById('btn-permis').onclick = async () => {
    // 1. Inicialització
    compass = new Compass('compass-container');
    map = new MapManager('map');
    navPanel = new NavigationPanel('navigation-panel-container');
    game = new GameLogic();
    legend = new Legend('map-legend-container', map.map);

    const btnFites = document.getElementById('btn-fites');
    const menuFites = document.getElementById('fites-menu');

    // 2. LÒGICA DEL BOTÓ FITES
    btnFites.onclick = (e) => {
        e.stopPropagation();
        if (menuFites.style.display === 'block') {
            menuFites.style.display = 'none';
        } else {
            // Cridem a la funció del GameLogic que hem de tenir creada
            game.generarLlistaFitesHTML(menuFites, (index) => {
                game.indexFitaActual = index;
                map.dibuixarFites(game.fites, index);
                map.centrarFita(game.fites[index]);
                menuFites.style.display = 'none';
                
                // Forcem actualització immediata del panell
                const target = game.fites[index];
                navPanel.update(target.nom, 0, 0); 
            });
            menuFites.style.display = 'block';
        }
    };

    // 3. Carregar dades
    try {
        const fites = await game.carregarRuta('data/ruta.gpx');
        map.dibuixarFites(fites, 0);
    } catch (e) { console.error(e); }

    // 4. Sensors i GPS
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        compass.updateHeading(heading);
    }, true);

    navigator.geolocation.watchPosition((pos) => {
        const estat = game.processarPosicio(pos);
        if (estat) {
            navPanel.update(estat.fitaNom, estat.dist, estat.rumb);
            if (estat.fitaTrobada) {
                map.dibuixarFites(game.fites, game.indexFitaActual);
                if ("vibrate" in navigator) navigator.vibrate(200);
            }
        }
    }, null, { enableHighAccuracy: true });

    document.getElementById('btn-permis').style.display = 'none';
};