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
            #compass-plate {
                position: absolute; top: 100px; right: 20px;
                width: 200px; height: 350px;
                z-index: 100; touch-action: none; cursor: move;
                display: flex; flex-direction: column; align-items: center;
            }

            /* PEÇA 1: LA BASE TRANSPARENT */
            .compass-base {
                position: absolute; inset: 0;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 2px solid rgba(0,0,0,0.2);
                border-radius: 8px;
                z-index: -1;
            }

            /* PEÇA 2: EL REGLE (Rulers) */
            .compass-rules {
                position: absolute; inset: 0; pointer-events: none;
                color: #000; font-family: 'Courier New', monospace;
            }
            .r-top { display: flex; border-bottom: 2px solid #000; height: 30px; }
            .r-top span { width: 40px; border-left: 1px solid #000; font-size: 10px; text-align: center; }
            .r-left { position: absolute; left: 0; top: 0; height: 100%; width: 30px; border-right: 2px solid #000; }
            .r-left div { height: 40px; border-top: 1px solid #000; font-size: 10px; padding-left: 4px; }

            /* PEÇA 3: LA CÀPSULA GIRATÒRIA (Bezel) */
            .compass-capsule { margin-top: 50px; position: relative; }
            .direction-line { width: 3px; height: 40px; background: red; margin: 0 auto 10px; }
            
            #bezel {
                width: 140px; height: 140px;
                border: 10px solid #2d3748; border-radius: 50%;
                position: relative; background: rgba(255,255,255,0.4);
                /* IMPORTANT: Sense transició CSS per evitar conflictes amb el gir manual */
                transition: none; 
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

        // Càlcul de la distància més curta per evitar salts de 360º
        let delta = newHeading - this.lastHeading;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        this.currentRotation += delta;
        this.lastHeading = newHeading;

        // Fem servir requestAnimationFrame per una suavitat màxima de 60fps
        window.requestAnimationFrame(() => {
            bezel.style.transform = `rotate(${-this.currentRotation}deg)`;
            if (display) display.innerText = `${Math.round(newHeading)}°`;
        });
    }
}