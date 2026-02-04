export class Compass {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentRotation = 0;
        this.lastHeading = 0;
        
        this.injectStyles(); // Injectem el CSS primer
        this.render();
        this.initDraggable();
    }

    injectStyles() {
        if (document.getElementById('compass-component-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'compass-component-styles';
        style.innerHTML = `
            #compass-plate {
                position: absolute; top: 100px; right: 20px;
                width: 180px; height: 320px;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(8px);
                border: 1.5px solid rgba(0,0,0,0.2);
                z-index: 100; touch-action: none; cursor: move;
                border-radius: 4px;
            }

            /* 1. LA BASE (Placa de la brúixola Silva) */
            .compass-base {
                position: absolute; width: 100%; height: 100%;
                pointer-events: none;
            }

            /* 2. EL REGLE (Escales laterals i superiors) */
            .compass-rules {
                position: absolute; width: 100%; height: 100%;
                color: #000; font-family: monospace; font-weight: bold;
                pointer-events: none;
            }
            .ruler-top { 
                display: flex; border-bottom: 2px solid #000; height: 30px; 
            }
            .ruler-top span { width: 38px; text-align: center; font-size: 10px; border-left: 1px solid #000; }
            
            .ruler-left { 
                position: absolute; left: 0; top: 0; height: 100%; width: 30px; 
                border-right: 2px solid #000; display: flex; flex-direction: column;
            }
            .ruler-left span { height: 38px; font-size: 10px; border-top: 1px solid #000; padding-left: 3px; }

            /* 3. LA BRÚIXOLA (Càpsula giratòria) */
            .compass-capsule {
                margin-top: 50px; display: flex; flex-direction: column; align-items: center;
            }
            .direction-line {
                width: 3px; height: 40px; background: #ff0000; margin-bottom: 8px;
            }
            #bezel {
                width: 130px; height: 130px;
                border: 8px solid #1a202c; border-radius: 50%;
                position: relative; background: rgba(255, 255, 255, 0.3);
                will-change: transform; /* Millora el rendiment del gir */
            }
            .needle {
                position: absolute; top: 50%; left: 50%;
                width: 3px; height: 85%;
                background: linear-gradient(to bottom, #ff0000 50%, #3182ce 50%);
                transform: translate(-50%, -50%);
            }
            #heading-display { 
                font-size: 1.5rem; font-weight: bold; margin-top: 10px; color: #1a202c; 
            }
            .degree-numbers span { position: absolute; font-weight: bold; font-size: 14px; }
            .n { top: 5px; left: 50%; transform: translateX(-50%); color: #ff0000; }
            .e { right: 8px; top: 50%; transform: translateY(-50%); }
            .s { bottom: 5px; left: 50%; transform: translateX(-50%); }
            .w { left: 8px; top: 50%; transform: translateY(-50%); }
        `;
        document.head.appendChild(style);
    }

    render() {
        this.container.innerHTML = `
            <div id="compass-plate" class="draggable">
                <div class="compass-base"></div>
                <div class="compass-rules">
                    <div class="ruler-top">
                        <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span>
                    </div>
                    <div class="ruler-left">
                        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                    </div>
                </div>
                <div class="compass-capsule">
                    <div class="direction-line"></div>
                    <div id="bezel">
                        <div class="degree-numbers">
                            <span class="n">N</span><span class="e">E</span>
                            <span class="s">S</span><span class="w">W</span>
                        </div>
                        <div class="needle"></div>
                    </div>
                    <div id="heading-display">0°</div>
                </div>
            </div>`;
    }

    initDraggable() {
        interact('.draggable').draggable({
            listeners: {
                move(event) {
                    const t = event.target;
                    const x = (parseFloat(t.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(t.getAttribute('data-y')) || 0) + event.dy;
                    t.style.transform = `translate(${x}px, ${y}px)`;
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

        // --- LÒGICA DEFINITIVA ANTI-SALT DEL NORD ---
        let diff = newHeading - this.lastHeading;
        
        // Corregim la diferència si saltem el llindar 360/0
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        this.currentRotation += diff;
        this.lastHeading = newHeading;

        // Usem la rotació acumulada per evitar que el navegador vulgui "tornar enrere"
        bezel.style.transform = `rotate(${-this.currentRotation}deg)`;

        if (display) display.innerText = `${Math.round(newHeading)}°`;
    }
}