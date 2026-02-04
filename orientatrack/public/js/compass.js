// public/js/compass.js
const arrow = document.getElementById('arrow');
const headingText = document.getElementById('heading');
const btnPermis = document.getElementById('btn-permis');

// Funció per mostrar missatges de debug a la interfície
function debug(msg) {
    const p = document.createElement('p');
    p.style.fontSize = "10px";
    p.innerText = `[Debug] ${msg}`;
    document.body.appendChild(p);
}

function handleOrientation(event) {
    let compass;

    // iOS (webkit)
    if (event.webkitCompassHeading !== undefined) {
        compass = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        // Android (alpha és el rumb de la brúixola en molts casos)
        compass = 360 - event.alpha; 
    }

    if (compass !== undefined && compass !== null) {
        const angle = Math.round(compass);
        headingText.innerText = `${angle}°`;
        arrow.style.transform = `rotate(${angle - 45}deg)`;
    }
}

async function activarBrúixola() {
    debug("Intentant activar sensors...");

    // Cas 1: iOS 13+ que requereix permís explícit
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const response = await DeviceOrientationEvent.requestPermission();
            debug(`Permís iOS: ${response}`);
            if (response === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
                btnPermis.style.display = 'none';
            }
        } catch (error) {
            debug(`Error iOS: ${error}`);
        }
    } else {
        // Cas 2: Android o navegadors que NO demanen permís per API
        debug("No és iOS o versió antiga. Escoltant esdeveniment...");
        window.addEventListener('deviceorientation', handleOrientation, true);
        
        // Verificació extra per Android
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        
        btnPermis.style.display = 'none';
    }
}

btnPermis.addEventListener('click', activarBrúixola);