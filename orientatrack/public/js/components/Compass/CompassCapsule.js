export class CompassCapsule {
    constructor() {
        this.html = `
            <div id="bezel">
                <div class="magnifier-glass"></div>
                <div class="orienting-box">
                    <div class="orienting-arrow"></div>
                    <div class="meridian-lines"></div>
                </div>
                <div class="bezel-marks">
                    <span class="cardinal n">N</span>
                    <span class="cardinal e">E</span>
                    <span class="cardinal s">S</span>
                    <span class="cardinal w">W</span>
                </div>
                <div class="magnetic-needle">
                    <div class="pivot"></div>
                </div>
            </div>
        `;
    }

    getStyles() {
        return `
            .compass-capsule-container {
                position: absolute; 
                top: 130px; 
                left: 50%; 
                transform: translateX(-50%);
                width: 170px; height: 170px;
                display: flex; align-items: center; justify-content: center;
                pointer-events: none;
            }

            #bezel {
                width: 160px; height: 160px;
                border: 14px solid #3c4a3e;
                border-radius: 50%;
                position: relative;
                background: rgba(255,255,255,0.05);
                box-shadow: inset 0 0 15px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.4);
                display: flex; align-items: center; justify-content: center;
            }

            .magnifier-glass {
                position: absolute; inset: 0; border-radius: 50%;
                backdrop-filter: brightness(1.1) contrast(1.15) saturate(1.2);
            }

            .orienting-box { position: absolute; inset: 20px; }
            
            .meridian-lines {
                width: 100%; height: 100%;
                background: repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(255,0,0,0.4) 15px, rgba(255,0,0,0.4) 16px);
                mask-image: radial-gradient(circle, black 40%, transparent 70%);
            }
            
            .orienting-arrow {
                position: absolute; top: 0; left: 50%; transform: translateX(-50%);
                width: 30px; height: 45px; border: 2px solid #ff0000; border-bottom: none;
            }

            .magnetic-needle {
                position: absolute; width: 10px; height: 85%;
                background: linear-gradient(to bottom, #ff0000 50%, #ffffff 50%);
                z-index: 10;
                clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
            }

            .pivot { position: absolute; top: 50%; left: 50%; width: 8px; height: 8px; 
                background: #444; border-radius: 50%; transform: translate(-50%, -50%); border: 1px solid #999; }

            /* LLETRES CARDINALS: Alineació central millorada */
            .cardinal { 
                position: absolute; 
                color: #000;
                font-family: sans-serif; 
                font-weight: 900; 
                font-size: 14px; 
            }
            
            /* Alineació vertical perfecta per N i S */
            .n { 
                top: -30px; 
                left: 50%; 
                transform: translateX(-50%); 
                color: #ff0000; 
            }
            .s { 
                bottom: -30px; 
                left: 50%; 
                transform: translateX(-50%); 
            }
            
            /* Alineació horitzontal perfecta per E i W */
            .e { 
                right: -30px; 
                top: 50%; 
                transform: translateY(-50%); 
            }
            .w { 
                left: -30px; 
                top: 50%; 
                transform: translateY(-50%); 
            }
        `;
    }
}