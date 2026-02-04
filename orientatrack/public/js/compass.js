import { calcularDistancia, calcularRumb } from './geo.js';

const arrow = document.getElementById('arrow');
const headingText = document.getElementById('heading');
const btnPermis = document.getElementById('btn-permis');
const targetName = document.getElementById('target-name');
const targetBearing = document.getElementById('target-bearing');
const targetDistance = document.getElementById('target-distance');

// PUNT DE PROVA (Sant Llorenç de Morunys)
const PUNT_OBJECTIU = { 
    lat: 42.1363379, 
    lon: 1.5863909, 
    nom: "Font de la Puda" 
};

let laMevaPosicio = null;

function debug(msg) {
    const d = document.getElementById('debug-console');
    if(d) d.innerHTML = `<div>> ${msg}</div>` + d.innerHTML;
}

function handleOrientation(event) {
    let heading = event.webkitCompassHeading || (360 - event.alpha);
    if (heading) {
        const angle = Math.round(heading);
        headingText.innerText = `${angle}°`;
        arrow.style.transform = `rotate(${angle - 45}deg)`;
    }
}

function actualitzarNavegacio(pos) {
    laMevaPosicio = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
    };

    const dist = calcularDistancia(laMevaPosicio.lat, laMevaPosicio.lon, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);
    const rumbObj = calcularRumb(laMevaPosicio.lat, laMevaPosicio.lon, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);

    targetName.innerText = PUNT_OBJECTIU.nom;
    targetBearing.innerText = `${Math.round(rumbObj)}°`;
    targetDistance.innerText = `${Math.round(dist)} m`;

    if (dist < 20) {
        if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        debug("PUNT ASSOLIT!");
    }
}

async function activarTot() {
    debug("Demanant permisos...");
    
    // 1. Activar Brúixola
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const p = await DeviceOrientationEvent.requestPermission();
        if (p === 'granted') window.addEventListener('deviceorientation', handleOrientation);
    } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
    }

    // 2. Activar GPS
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(actualitzarNavegacio, 
            (err) => debug(`Error GPS: ${err.message}`), 
            { enableHighAccuracy: true }
        );
    }

    btnPermis.style.display = 'none';
}

btnPermis.addEventListener('click', activarTot);