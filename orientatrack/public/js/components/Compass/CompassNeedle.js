export class CompassNeedle {
    constructor() {
        this.html = `
            <div class="magnetic-needle">
                <div class="pivot"></div>
            </div>
        `;
    }

    getStyles() {
        return `
            .magnetic-needle {
                position: absolute;
                top: 50%; left: 50%;
                /* El transform es gestionarà des de Compass.js per no perdre el centratge */
                width: 12px; height: 145px;
                background: linear-gradient(to bottom, #ff0000 50%, #ffffff 50%);
                z-index: 10;
                clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
                will-change: transform;
            }

            .pivot { 
                position: absolute; top: 50%; left: 50%; 
                width: 10px; height: 10px; 
                background: #444; border-radius: 50%; 
                transform: translate(-50%, -50%); 
                border: 1.5px solid #999; 
            }
        `;
    }
}