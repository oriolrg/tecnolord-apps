import { Compass } from './components/Compass.js';
import { MapManager } from './components/MapManager.js';
import { NavigationPanel } from './components/NavigationPanel.js';
import { GameLogic } from './core/GameLogic.js';
import { Legend } from './components/Legend.js'; // <--- AFEGEIX AIXÒ

let compass, map, navPanel, game;

document.getElementById('btn-permis').onclick = async () => {
    // 1. Inicialització de components (Injecten el seu propi HTML)
    compass = new Compass('compass-container');
    map = new MapManager('map');
    new Legend('map-legend-container', map.map); // Passem el mapa de Leaflet
    navPanel = new NavigationPanel('navigation-panel-container');
    game = new GameLogic();
    const btnFites = document.getElementById('btn-fites');
const menuFites = document.getElementById('fites-menu');

btnFites.onclick = (e) => {
    e.stopPropagation(); // Evita que el clic es propagui al mapa
    
    if (menuFites.style.display === 'block') {
        menuFites.style.display = 'none';
    } else {
        // Generem la llista i definim què passa quan cliquem una fita
        game.generarLlistaFitesHTML(menuFites, (index) => {
            game.indexFitaActual = index; // Cambiem l'objectiu al motor de joc
            
            // Actualitzem visualment el mapa (cercles blaus/liles)
            map.dibuixarFites(game.fites, index, (i) => {
                game.indexFitaActual = i;
                map.dibuixarFites(game.fites, i);
            });
            
            // Centrem el mapa a la nova fita triada
            map.centrarFita(game.fites[index]);
            
            // Tanquem el menú
            menuFites.style.display = 'none';
        });
        menuFites.style.display = 'block';
    }
};

// Tanquem el menú si es clica qualsevol lloc del mapa
map.map.on('click', () => {
    menuFites.style.display = 'none';
});

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
            // En lloc d'actualitzar directament, podríem fer-ho més suau
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