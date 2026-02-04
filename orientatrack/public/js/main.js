import { Compass } from './components/Compass.js';
import { MapManager } from './components/MapManager.js';
import { NavigationPanel } from './components/NavigationPanel.js';
import { GameLogic } from './core/GameLogic.js';
import { Legend } from './components/Legend.js';

let compass, map, navPanel, game, legend;

document.getElementById('btn-permis').onclick = async () => {
    // 1. Inicialització de components
    compass = new Compass('compass-container');
    map = new MapManager('map');
    legend = new Legend('map-legend-container', map.map);
    navPanel = new NavigationPanel('navigation-panel-container');
    game = new GameLogic();

    const menuFites = document.getElementById('fites-menu');
    const btnFites = document.getElementById('btn-fites');

    // 2. Lògica del Botó de Fites (UN SOL COP)
    btnFites.onclick = (e) => {
        e.stopPropagation();
        if (menuFites.style.display === 'block') {
            menuFites.style.display = 'none';
        } else {
            // Demanem al motor de joc que ens fabriqui la llista d'fites
            game.generarLlistaFitesHTML(menuFites, (index) => {
                game.indexFitaActual = index;
                map.dibuixarFites(game.fites, index);
                map.centrarFita(game.fites[index]);
                menuFites.style.display = 'none';
            });
            menuFites.style.display = 'block';
        }
    };

    // 3. Carregar dades i dibuixar fites inicials
    try {
        const fites = await game.carregarRuta('data/ruta.gpx');
        map.dibuixarFites(fites, 0);
    } catch (e) { console.error("Error GPX:", e); }

    // 4. Sensors (Orientació i GPS)
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading !== undefined) compass.updateHeading(heading);
    }, true);

    navigator.geolocation.watchPosition((pos) => {
        const estat = game.processarPosicio(pos);
        if (estat) {
            navPanel.update(estat.fitaNom, estat.dist, estat.rumb);
            if (estat.fitaTrobada) {
                if ("vibrate" in navigator) navigator.vibrate(200);
                alert(`🎯 ${estat.fitaNom} TROBADA!`);
                map.dibuixarFites(game.fites, game.indexFitaActual);
            }
            if (estat.final) map.revelarRutes(game.trackReal, game.fites);
        }
    }, null, { enableHighAccuracy: true });

    document.getElementById('btn-permis').style.display = 'none';
};