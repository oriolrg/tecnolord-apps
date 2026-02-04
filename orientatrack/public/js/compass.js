const arrow = document.getElementById('arrow');
const headingText = document.getElementById('heading');
const btnPermis = document.getElementById('btn-permis');

// Funció per imprimir missatges a la pantalla per veure des del mòbil
function debug(msg) {
    const d = document.getElementById('debug-console') || (() => {
        const div = document.createElement('div');
        div.id = 'debug-console';
        div.style = 'font-size:10px; color:red; margin-top:20px; text-align:left; width:100%';
        document.body.appendChild(div);
        return div;
    })();
    d.innerHTML += `<br>> ${msg}`;
}

function handleOrientation(event) {
    let heading = null;

    if (event.webkitCompassHeading !== undefined) {
        // iOS
        heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        // Android
        heading = 360 - event.alpha;
    }

    if (heading !== null) {
        const angle = Math.round(heading);
        headingText.innerText = `${angle}°`;
        arrow.style.transform = `rotate(${angle - 45}deg)`;
    }
}

async function activarBrúixola() {
    debug("Iniciant activació...");

    // Verifiquem si existeix l'objecte de l'esdeveniment
    if (typeof DeviceOrientationEvent === 'undefined') {
        debug("Error: DeviceOrientationEvent no està suportat.");
        return;
    }

    // Cas iOS 13+
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        debug("Detectat iOS. Demanant permís...");
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            debug(`Resultat permís: ${permission}`);
            if (permission === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
                btnPermis.style.display = 'none';
            }
        } catch (err) {
            debug(`Error en requestPermission: ${err}`);
        }
    } else {
        // Cas Android / Altres
        debug("Detectat Android/Altres. Escoltant...");
        window.addEventListener('deviceorientation', handleOrientation, true);
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        btnPermis.style.display = 'none';
        
        // Test de seguretat: si en 2 segons no rebem dades, avisem
        setTimeout(() => {
            if (headingText.innerText === "0°") {
                debug("No es reben dades. El sensor podria estar desactivat al sistema.");
            }
        }, 2000);
    }
}

btnPermis.addEventListener('click', activarBrúixola);