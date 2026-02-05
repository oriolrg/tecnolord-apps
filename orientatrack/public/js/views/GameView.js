import { Compass } from '../components/Compass.js';
import { MapManager } from '../components/MapManager.js';
import { NavigationPanel } from '../components/NavigationPanel.js';
import { Legend } from '../components/Legend.js';
import { CheckpointsModal } from '../components/CheckpointsModal.js';

export class GameView {
    constructor() {
        this.map = new MapManager('map');
        this.compass = new Compass('compass-container');
        this.navPanel = new NavigationPanel('navigation-panel-container');
        this.legend = new Legend('map-legend-container', this.map.map);
        this.modal = new CheckpointsModal('fites-menu');

        // Inicialitzem el botó de control de la brúixola
        this.initCompassToggle();
        
        // Sincronització d'escala inicial i en cada moviment o zoom del mapa
        this.map.map.on('move zoom', () => this.syncScaleWithMap());
        
        // Petit retard per assegurar que el mapa s'ha renderitzat abans del primer càlcul
        setTimeout(() => this.syncScaleWithMap(), 500);
    }

    /**
     * Crea un botó flotant a la part superior per controlar la visibilitat de la brúixola
     */
    initCompassToggle() {
        const btn = document.createElement('button');
        btn.id = 'compass-toggle-btn';
        btn.innerHTML = '<i class="fas fa-compass"></i>';
        
        // Estils per situar-lo a la part superior dreta (prop de la llegenda)
        btn.style.cssText = `
            position: absolute; 
            top: 20px; 
            right: 20px; 
            z-index: 1100;
            width: 45px; 
            height: 45px; 
            border-radius: 50%;
            background: white; 
            border: none; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            color: var(--primary); 
            font-size: 1.2rem; 
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.3s ease;
        `;
        
        btn.onclick = () => {
            const isVisible = this.compass.toggle(); // Cridem al mètode toggle intern
            btn.style.color = isVisible ? 'var(--primary)' : '#a0aec0';
        };

        // L'afegim al contenidor de la vista de joc
        const viewJoc = document.getElementById('view-joc');
        if (viewJoc) viewJoc.appendChild(btn);
    }

    /**
     * Calcula l'escala actual del mapa i actualitza les regles de la brúixola
     */
    syncScaleWithMap() {
        const leafletMap = this.map.map;
        const center = leafletMap.getCenter();
        
        // Calculem la distància real que representa un centímetre a la pantalla (aprox. 38 píxels)
        const p1 = leafletMap.latLngToContainerPoint(center);
        const p2 = L.point(p1.x + 38, p1.y);
        const mPerCm = leafletMap.distance(center, leafletMap.containerPointToLatLng(p2));

        // Determinem quants píxels representen 100 metres reals en el zoom actual
        const pxPer100m = (100 * 38) / mPerCm;
        const numericScaleLabel = `${Math.round(mPerCm * 100).toLocaleString()}`;

        // Enviem la informació a la brúixola per actualitzar el regle dinàmic
        this.compass.updateScale(pxPer100m, numericScaleLabel);
    }

    updateNavigation(nom, dist, rumb) {
        this.navPanel.update(nom, dist, rumb);
    }

    updateCompass(heading) {
        this.compass.updateHeading(heading); //
    }

    refreshMarkers(fites, index) {
        this.map.dibuixarFites(fites, index);
    }

    showCheckpoints(fites, index, onSelect) {
        this.modal.toggle(fites, index, onSelect);
    }
}