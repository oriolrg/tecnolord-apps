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
    }

    updateNavigation(nom, dist, rumb) {
        this.navPanel.update(nom, dist, rumb);
    }

    updateCompass(heading) {
        this.compass.updateHeading(heading);
    }

    refreshMarkers(fites, index) {
        this.map.dibuixarFites(fites, index);
    }

    showCheckpoints(fites, index, onSelect) {
        this.modal.toggle(fites, index, onSelect);
    }
}