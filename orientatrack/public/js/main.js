import { Compass } from './components/Compass.js';
import { MapManager } from './components/MapManager.js';
import { NavigationPanel } from './components/NavigationPanel.js';
import { GameLogic } from './core/GameLogic.js';

let compass, map, navPanel, game;

document.getElementById('btn-permis').onclick = async () => {
    // 1. Inicialització de components (Injecten el seu propi HTML)
    compass = new Compass('compass-container');
    map = new MapManager('map');
    new Legend('map-legend-container', map.map); // Passem el mapa de Leaflet
    navPanel = new NavigationPanel('navigation-panel-container');
    game = new GameLogic();

    // 2. Carregar dades del GPX
    try {
        const fites = await game.carregarRuta('data/ruta.gpx');
        map.dibuixarFites(fites, 0, (i) => {
            game.indexFitaActual = i;
            map.dibuixarFites(game.fites, i);
        });
    } catch (e) {
        console.error("Error carregant ruta:", e);
    }

    // 3. Sensors d'Orientació (Brúixola)
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined) {
            compass.updateHeading(heading);
        }
    }, true);

    // 4. GPS (Navegació)
    navigator.geolocation.watchPosition((pos) => {
        const estat = game.processarPosicio(pos);
        if (estat) {
            navPanel.update(estat.fitaNom, estat.dist, estat.rumb);
            
            if (estat.fitaTrobada) {
                if ("vibrate" in navigator) navigator.vibrate(200);
                alert(`🎯 ${estat.fitaNom} TROBADA!`);
                map.dibuixarFites(game.fites, game.indexFitaActual);
            }
            
            if (estat.final) {
                map.revelarRutes(game.trackReal, game.fites);
                alert("🏆 Ruta Finalitzada!");
            }
        }
    }, null, { enableHighAccuracy: true });

    // 5. Botó de Fites (Menu)
    document.getElementById('btn-fites').onclick = (e) => {
        e.stopPropagation();
        const menu = document.getElementById('fites-menu');
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
        } else {
            game.generarLlistaFitesHTML(menu, (index) => {
                game.indexFitaActual = index;
                map.dibuixarFites(game.fites, index);
                map.centrarFita(game.fites[index]);
                menu.style.display = 'none';
            });
            menu.style.display = 'block';
        }
    };

    document.getElementById('btn-permis').style.display = 'none';
};