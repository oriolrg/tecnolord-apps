import { CompassPlate } from './Compass/CompassPlate.js';
import { CompassCapsule } from './Compass/CompassCapsule.js';
import { CompassNeedle } from './Compass/CompassNeedle.js';

export class Compass {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.plate = new CompassPlate();
        this.capsule = new CompassCapsule();
        this.needle = new CompassNeedle();
        
        this.currentRotation = 0; 
        this.lastHeading = 0;
        this.plateRotation = 0;   
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
            ${this.needle.getStyles()}
            #heading-display { 
                position: absolute; top: 345px; left: 50%; transform: translateX(-50%);
                background: rgba(26, 32, 44, 0.9); color: #fff; padding: 4px 12px; 
                border-radius: 10px; font-size: 14px; font-family: monospace; border: 1px solid #444;
                z-index: 20; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            }
        `;
        document.head.appendChild(style);
    }

    render() {
        // Fixa't que l'agulla es renderitza INSIDE del bezel de la càpsula
        this.container.innerHTML = `
            <div id="compass-plate" class="draggable">
                ${this.plate.html}
                <div class="compass-capsule-container">
                    ${this.capsule.html}
                    ${this.needle.html}
                </div>
                <div id="heading-display">0°</div>
            </div>`;
    }

    initDraggable() {
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
                        this.plateRotation += event.da;
                        this.updateTransforms(event.target, 0, 0, event.da);
                        this.updateHeading(this.lastHeading);
                    }
                }
            });
    }

    updateTransforms(el, dx, dy, da) {
        const x = (parseFloat(el.getAttribute('data-x')) || 0) + dx;
        const y = (parseFloat(el.getAttribute('data-y')) || 0) + dy;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${this.plateRotation}deg)`;
        el.setAttribute('data-x', x);
        el.setAttribute('data-y', y);
    }

    updateHeading(newHeading) {
        const needle = document.querySelector('.magnetic-needle');
        const display = document.getElementById('heading-display');
        if (!needle) return;

        let diff = newHeading - this.lastHeading;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        this.currentRotation += diff;
        this.lastHeading = newHeading;

        // ARA NOMÉS GIREM L'AGULLA:
        // Compensem la rotació de la placa perquè l'agulla sempre miri al Nord real
        const needleFinalRotation = -this.currentRotation - this.plateRotation;

        // Afegim translate(-50%, -50%) per no perdre el centratge absolut
        needle.style.transform = `translate(-50%, -50%) rotate(${needleFinalRotation}deg)`;
        
        if (display) display.innerText = `${Math.round(newHeading)}°`;
    }
}