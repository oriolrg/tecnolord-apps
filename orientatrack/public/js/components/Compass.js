import { CompassPlate } from './Compass/CompassPlate.js';
import { CompassCapsule } from './Compass/CompassCapsule.js';

export class Compass {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.plate = new CompassPlate();
        this.capsule = new CompassCapsule();
        
        this.currentRotation = 0;
        this.lastHeading = 0;
        
        this.injectStyles();
        this.render();
        this.initDraggable();
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
                top: 345px; /* MOGUT MÉS AVALL (abans 315px) */
                left: 50%; 
                transform: translateX(-50%);
                background: rgba(26, 32, 44, 0.9); 
                color: #fff; 
                padding: 4px 12px; 
                border-radius: 10px; 
                font-size: 14px; 
                font-family: monospace; 
                border: 1px solid #444;
                z-index: 20;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            }
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
        interact('.draggable').draggable({
            inertia: false,
            listeners: {
                move: (event) => {
                    const t = event.target;
                    const x = (parseFloat(t.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(t.getAttribute('data-y')) || 0) + event.dy;
                    t.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                    t.setAttribute('data-x', x);
                    t.setAttribute('data-y', y);
                }
            }
        });
    }

    updateHeading(newHeading) {
        const bezel = document.getElementById('bezel');
        const display = document.getElementById('heading-display');
        if (!bezel) return;

        let diff = newHeading - this.lastHeading;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        this.currentRotation += diff;
        this.lastHeading = newHeading;

        bezel.style.transform = `rotate(${-this.currentRotation}deg)`;
        if (display) display.innerText = `${Math.round(newHeading)}°`;
    }
}