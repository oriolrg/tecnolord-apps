import { CompassPlate } from './Compass/CompassPlate.js';
import { CompassCapsule } from './Compass/CompassCapsule.js';

export class Compass {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.plate = new CompassPlate();
        this.capsule = new CompassCapsule();
        
        this.currentRotation = 0; // Rotació de l'agulla (sensor)
        this.lastHeading = 0;
        this.plateRotation = 0;   // Rotació manual de la placa (usuari)
        this.userWantsVisible = true;
        
        this.injectStyles();
        this.render();
        this.initDraggable();
    }

    toggle() {
        this.userWantsVisible = !this.userWantsVisible;
        this.container.style.display = this.userWantsVisible ? 'block' : 'none';
        return this.userWantsVisible;
    }

    updateScale(pxPer100m, numericScaleLabel) {
        if (this.plate && this.plate.updateScale) {
            this.plate.updateScale(pxPer100m, numericScaleLabel);
        }
    }
        
    injectStyles() {
        if (document.getElementById('compass-styles')) return;
        const style = document.createElement('style');
        style.id = 'compass-styles';
        style.innerHTML = `
            #compass-container { position: fixed; inset: 0; pointer-events: none; z-index: 100000; }
            ${this.plate.getStyles()}
            ${this.capsule.getStyles()}
            #heading-display { 
                position: absolute; 
                top: 345px;
                left: 50%; 
                transform: translateX(-50%);
                background: rgba(26, 32, 44, 0.9); 
                color: #fff; padding: 4px 12px; 
                border-radius: 10px; font-size: 14px; 
                font-family: monospace; border: 1px solid #444;
                z-index: 20;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            }
            /* Millora la resposta visual dels gestos */
            .draggable { will-change: transform; }
        `;
        document.head.appendChild(style);
    }

    render() {
        this.container.innerHTML = `
            <div id="compass-plate" class="draggable">
                ${this.plate.html}
                <div class="compass-capsule-container">
                    ${this.capsule.html}
                </div>
                <div id="heading-display">0°</div>
            </div>`;
    }

    initDraggable() {
        const plateElement = document.getElementById('compass-plate');

        // GESTIÓ DE MOVIMENT (DRAG) I ROTACIÓ (GESTURE)
        interact('.draggable')
            .draggable({
                inertia: false,
                listeners: {
                    move: (event) => {
                        this.updateTransforms(event.target, event.dx, event.dy, 0);
                    }
                }
            })
            .gesturable({
                listeners: {
                    move: (event) => {
                        // event.da és la diferència d'angle des de l'últim moviment
                        this.plateRotation += event.da;
                        this.updateTransforms(event.target, 0, 0, event.da);
                        
                        // En rotar la placa, hem de forçar l'agulla a compensar el gir immediatament
                        this.updateHeading(this.lastHeading);
                    }
                }
            });
    }

    /**
     * Aplica les transformacions combinades de translació i rotació a la placa
     */
    updateTransforms(el, dx, dy, da) {
        const x = (parseFloat(el.getAttribute('data-x')) || 0) + dx;
        const y = (parseFloat(el.getAttribute('data-y')) || 0) + dy;
        
        // Apliquem la posició i la rotació de la placa sencera
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${this.plateRotation}deg)`;
        
        el.setAttribute('data-x', x);
        el.setAttribute('data-y', y);
    }

    updateHeading(newHeading) {
        const bezel = document.getElementById('bezel');
        const display = document.getElementById('heading-display');
        if (!bezel) return;

        // 1. Diferència curta per al sensor magnètic
        let diff = newHeading - this.lastHeading;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        this.currentRotation += diff;
        this.lastHeading = newHeading;

        // 2. CÀLCUL DE COMPENSACIÓ: 
        // La rotació del bisell ha de ser la del sensor MENYS la rotació manual de la placa
        const totalBezelRotation = -this.currentRotation - this.plateRotation;

        bezel.style.transform = `rotate(${totalBezelRotation}deg)`;
        
        if (display) display.innerText = `${Math.round(newHeading)}°`;
    }
}