export class CompassPlate {
    constructor() {
        this.html = `
            <div class="plate-scales">
                <div class="scale scale-top"></div>
                <div class="scale scale-left"></div>
                <div class="scale scale-right"></div>
                <span class="scale-label">ESC 1:---</span>
            </div>
            <div class="direction-travel-arrow"></div>
            <div class="silva-brand">ORiENTATRACK</div>
            <div class="geometric-shapes">
                <div class="shape-triangle"></div>
                <div class="shape-circle"></div>
            </div>
        `;
    }

    getStyles() {
        /* Variables per calcular les unions dels regles */
        const heightTopRuler = 30;
        const totalHeight = 380;
        const heightSideRulers = totalHeight - heightTopRuler;

        return `
            #compass-plate {
                position: absolute; 
                top: 50px; right: 20px;
                width: 260px; /* MÉS AMPLE (abans 230px) */
                height: ${totalHeight}px;
                /* El centre es manté a 50% (ara 130px) i 215px d'alçada */
                background: radial-gradient(circle at 50% 215px, transparent 82px, rgba(255, 255, 255, 0.45) 83px);
                backdrop-filter: blur(1px);
                border: 1px solid rgba(0,0,0,0.25);
                border-radius: 12px;
                pointer-events: auto; cursor: move;
                box-shadow: 0 15px 45px rgba(0,0,0,0.35);
                touch-action: none;
                --tick-spacing: 40px;
            }

            .scale { position: absolute; background-color: transparent; }
            
            /* REGLE SUPERIOR: Ocupa tota l'amplada, alçada fixa */
            .scale-top { 
                top: 0; left: 0; width: 100%; height: ${heightTopRuler}px; 
                border-bottom: 1.5px solid #000;
                background-image: repeating-linear-gradient(90deg, #000 0, #000 1.5px, transparent 1.5px, transparent var(--tick-spacing));
                z-index: 2; /* Per sobre en les cantonades si fos necessari */
            }

            /* REGLES LATERALS: Comencen A SOTA del regle superior */
            .scale-left { 
                left: 0; 
                top: ${heightTopRuler}px; /* SOLUCIÓ AL SOBREPOSAT: Comença on acaba el de dalt */
                height: ${heightSideRulers}px; /* Alçada restant */
                width: 25px; border-right: 1.5px solid #000;
                background-image: repeating-linear-gradient(0deg, #000 0, #000 1.5px, transparent 1.5px, transparent var(--tick-spacing));
            }
            .scale-right { 
                right: 0; 
                top: ${heightTopRuler}px; /* SOLUCIÓ AL SOBREPOSAT */
                height: ${heightSideRulers}px; 
                width: 25px; border-left: 1.5px solid #000;
                background-image: repeating-linear-gradient(0deg, #000 0, #000 1.5px, transparent 1.5px, transparent var(--tick-spacing));
            }

            .scale-label { 
                position: absolute; top: 40px; left: 50%; transform: translateX(-50%);
                font-size: 10px; font-family: monospace; font-weight: bold; background: rgba(255,255,255,0.8); padding: 0 5px;
                border-radius: 3px; z-index: 5;
            }

            .direction-travel-arrow {
                position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
                width: 2px; height: 110px; background: #000; z-index: 5;
            }
            .direction-travel-arrow::before {
                content: ''; position: absolute; top: -2px; left: -8px;
                border-left: 9px solid transparent; border-right: 9px solid transparent;
                border-bottom: 16px solid #000;
            }

            .silva-brand { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 900; opacity: 0.6; }
            .geometric-shapes { position: absolute; top: 70px; left: 50%; transform: translateX(-50%); width: 80%; display: flex; justify-content: space-around; opacity: 0.2; }
            .shape-triangle { width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 14px solid #000; }
            .shape-circle { width: 14px; height: 14px; border: 2px solid #000; border-radius: 50%; }
        `;
    }

    updateScale(pxPer100m, numericScaleLabel) {
        const plate = document.getElementById('compass-plate');
        const label = document.querySelector('.scale-label');
        if (plate) plate.style.setProperty('--tick-spacing', `${pxPer100m}px`);
        if (label) label.innerText = `ESC ${numericScaleLabel}`;
    }
}