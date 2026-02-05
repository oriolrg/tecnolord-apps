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
                position: fixed; /* Canviat a fixed perquè floti sempre */
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none; /* Deixa passar clics si no toquem la brúixola */
                z-index: 100000; /* Per sobre de tot: mapa, menús i llistes */
            }

            #compass-plate {
                position: absolute; 
                top: 80px; 
                right: 20px;
                width: 190px; 
                height: 320px;
                background: rgba(255, 255, 255, 0.3); /* Més nítid */
                backdrop-filter: blur(10px);
                border: 1.5px solid rgba(0,0,0,0.4);
                border-radius: 5px;
                pointer-events: auto; /* Permet interactuar amb la brúixola */
                cursor: move;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);

                /* FIX PER A MÒBIL: Elimina el bloqueig de scroll i millora la fluïdesa */
                touch-action: none; 
                will-change: transform;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
            }

            .compass-rules {
                position: absolute; inset: 0; pointer-events: none;
                color: #000; font-family: 'Courier New', monospace;
            }
            .r-top { display: flex; border-bottom: 2px solid #000; height: 30px; }
            .r-top span { width: 40px; border-left: 1px solid #000; font-size: 10px; text-align: center; line-height: 30px; font-weight: bold; }
            .r-left { position: absolute; left: 0; top: 0; height: 100%; width: 30px; border-right: 2px solid #000; }
            .r-left div { height: 40px; border-top: 1px solid #000; font-size: 10px; padding-left: 4px; line-height: 40px; font-weight: bold; }

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
                transition: transform 0.1s ease-out; /* Suavitza el gir */
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
            // Desactivem inèrcia per a un control més directe en mòbil
            inertia: false, 
            listeners: {
                move: (event) => {
                    const t = event.target;
                    const x = (parseFloat(t.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(t.getAttribute('data-y')) || 0) + event.dy;
                    
                    // Usem translate3d per activar l'acceleració per GPU del mòbil
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

        // Càlcul de la diferència més curta per evitar girs bruscos
        let diff = newHeading - this.lastHeading;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        this.currentRotation += diff;
        this.lastHeading = newHeading;

        // Gir del bezel
        bezel.style.transform = `rotate(${-this.currentRotation}deg)`;

        if (display) display.innerText = `${Math.round(newHeading)}°`;
    }
}