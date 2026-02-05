export class Compass {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentRotation = 0;
        this.lastHeading = 0;
        
        this.injectStyles();
        this.render();
        this.initDraggable();
    }

    injectStyles() {
    if (document.getElementById('compass-styles')) return;
    const style = document.createElement('style');
    style.id = 'compass-styles';
    style.innerHTML = `
            #compass-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none; /* Deixa passar clics al mapa */
                z-index: 1000; /* Per sobre del mapa de Leaflet */
            }

            #compass-plate {
                position: absolute; 
                top: 80px; 
                right: 20px;
                width: 190px; 
                height: 320px;
                background: rgba(255, 255, 255, 0.25);
                backdrop-filter: blur(8px);
                border: 1.5px solid rgba(0,0,0,0.3);
                border-radius: 5px;
                pointer-events: auto; /* Permet arrossegar la brúixola */
                cursor: move;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            }

            /* REGLES UNIFICADES */
            .compass-rules {
                position: absolute; inset: 0; pointer-events: none;
                color: #000; font-family: 'Courier New', monospace;
            }
            .ruler-top { 
                display: flex; border-bottom: 2px solid #000; height: 30px; 
            }
            .ruler-top span { 
                width: 38px; text-align: center; font-size: 10px; border-left: 1px solid #000; 
                line-height: 30px; font-weight: bold;
            }
            .ruler-left { 
                position: absolute; left: 0; top: 0; height: 100%; width: 30px; 
                border-right: 2px solid #000; display: flex; flex-direction: column;
            }
            .ruler-left span { 
                height: 38px; font-size: 10px; border-top: 1px solid #000; 
                padding-left: 4px; line-height: 38px; font-weight: bold;
            }

            .compass-capsule {
                margin-top: 50px; display: flex; flex-direction: column; align-items: center;
            }

            .direction-line {
                width: 2px; height: 45px; background: #ff0000; 
                margin-bottom: 5px; box-shadow: 0 0 2px rgba(255,0,0,0.5);
            }

            #bezel {
                width: 135px; height: 135px;
                border: 10px solid #1a202c; border-radius: 50%;
                position: relative; 
                background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
                box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
            }

            .needle {
                position: absolute; top: 50%; left: 50%;
                width: 4px; height: 80%;
                background: linear-gradient(to bottom, red 50%, #3182ce 50%);
                transform: translate(-50%, -50%);
            }
            
            .n-mark { position: absolute; top: 5px; left: 50%; transform: translateX(-50%); color: red; font-weight: bold; }
            
            #heading-display { 
                background: #1a202c; color: white; padding: 5px 15px; 
                border-radius: 20px; margin-top: 15px; font-weight: bold; font-family: monospace;
            }
        `;
        document.head.appendChild(style);
    }

    render() {
        this.container.innerHTML = `
            <div id="compass-plate" class="draggable">
                <div class="compass-base"></div>
                <div class="compass-rules">
                    <div class="r-top"><span>0</span><span>1</span><span>2</span><span>3</span></div>
                    <div class="r-left"><div>1</div><div>2</div><div>3</div><div>4</div></div>
                </div>
                <div class="compass-capsule">
                    <div class="direction-line"></div>
                    <div id="bezel">
                        <div class="n-mark">N</div>
                        <div class="needle"></div>
                    </div>
                </div>
                <div id="heading-display">0°</div>
            </div>`;
    }

    initDraggable() {
        interact('.draggable').draggable({
            listeners: {
                move: (event) => {
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

        // 1. Calculem la diferència més curta (-180 a +180)
        let diff = newHeading - this.lastHeading;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        // 2. Acumulem la rotació total
        this.currentRotation += diff;
        this.lastHeading = newHeading;

        // 3. Apliquem el gir de forma immediata
        // Usem 'translate' per assegurar-nos que no perdem el centratge
        bezel.style.transform = `rotate(${-this.currentRotation}deg)`;

        if (display) display.innerText = `${Math.round(newHeading)}°`;
    }
}