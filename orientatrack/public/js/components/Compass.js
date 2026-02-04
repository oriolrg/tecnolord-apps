export class Compass {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentRotation = 0; // Guardem la rotació acumulada real
        this.lastHeading = 0;    // Guardem l'últim rumb rebut
        this.render();
        this.initDraggable();
    }

    render() {
        this.container.innerHTML = `
            <div id="compass-plate" class="draggable">
                <div class="ruler-top">
                    <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span>
                </div>
                <div class="ruler-left">
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                </div>
                <div class="compass-inner">
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
            },
            inertia: true
        });
    }

    updateHeading(newHeading) {
        const bezel = document.getElementById('bezel');
        const display = document.getElementById('heading-display');
        
        if (!bezel) return;

        // --- LÒGICA PER EVITAR EL SALT DEL NORD ---
        // Calculem la diferència més curta entre el rumb nou i l'anterior
        let diff = newHeading - this.lastHeading;

        // Si la diferència és més de 180°, vol dir que estem creuant el Nord
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        // Sumem aquesta diferència a la nostra rotació acumulada
        this.currentRotation += diff;
        this.lastHeading = newHeading;

        // Apliquem la rotació inversa al bezel (perquè el Nord es mantingui fix al món)
        bezel.style.transform = `rotate(${-this.currentRotation}deg)`;

        if (display) display.innerText = `${Math.round(newHeading)}°`;
    }
}