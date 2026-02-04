import { calcularDistancia, calcularRumb } from './geo.js';

// --- CONFIGURACIÓ I ESTATS ---
const PUNT_OBJECTIU = { 
    id: "cp-1",
    lat: 42.1363379, 
    lon: 1.5863909, 
    nom: "Font de la Puda",
    radius_m: 20 
};

let map;
let laMevaPosicio = null;
let segonsDinsRadi = 0;
const SEGONS_REQUERITS = 3; // Histèresi temporal
const ACCURACY_THRESHOLD = 25; // No validem si el GPS falla per més de 25m

// --- ELEMENTS UI ---
const arrow = document.getElementById('arrow');
const headingText = document.getElementById('heading');
const btnPermis = document.getElementById('btn-permis');
const targetName = document.getElementById('target-name');
const targetBearing = document.getElementById('target-bearing');
const targetDistance = document.getElementById('target-distance');

function debug(msg) {
    const d = document.getElementById('debug-console');
    if(d) d.innerHTML = `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>` + d.innerHTML;
}

// --- LÒGICA DEL MAPA (ROGAINE MODE) ---
function inicialitzarMapa() {
    // Definim límits estrictes (aprox 2km al voltant del punt)
    const areaJoc = L.latLngBounds(
        [42.12, 1.56], 
        [42.15, 1.61]
    );

    map = L.map('map', {
        maxBounds: areaJoc,
        maxBoundsViscosity: 1.0,
        minZoom: 14,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false
    }).setView([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], 15);

    // Capa Topogràfica ICGC
    L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topo/GRID3857/{z}/{x}/{y}.jpeg', {
        maxZoom: 16,
        minZoom: 14
    }).addTo(map);

    // Pintem el CP (Cercle lila d'orientació oficial)
    const cpColor = '#ff00ff';
    L.circle([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], {
        color: cpColor,
        weight: 3,
        fillColor: cpColor,
        fillOpacity: 0.1,
        radius: PUNT_OBJECTIU.radius_m
    }).addTo(map);

    // Etiqueta del número de balisa
    L.marker([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], {
        icon: L.divIcon({
            className: 'cp-label',
            html: `<b style="color:${cpColor}; font-size:18px; text-shadow: 2px 2px white;">1</b>`,
            iconAnchor: [5, 10]
        })
    }).addTo(map);
}

function handleOrientation(event) {
    // Obtenim el rumb del Nord (0-360)
    let heading = event.webkitCompassHeading || (360 - event.alpha);
    
    if (heading !== undefined && heading !== null) {
        const angle = Math.round(heading);
        
        // El limbe gira en sentit contrari al moviment per mantenir el Nord fix
        bezel.style.transform = `rotate(${-angle}deg)`;
        
        // El rumb actual és el que marca la fletxa de direcció
        headingText.innerText = `${angle}°`;
    }
}

// --- SENSORS: GPS I VALIDACIÓ ---
function actualitzarNavegacio(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    laMevaPosicio = { lat: latitude, lon: longitude };

    // Càlculs segons ADR-0002
    const dist = calcularDistancia(laMevaPosicio.lat, laMevaPosicio.lon, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);
    const rumbObj = calcularRumb(laMevaPosicio.lat, laMevaPosicio.lon, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);

    // Actualització UI
    targetName.innerText = PUNT_OBJECTIU.nom;
    targetBearing.innerText = `${Math.round(rumbObj)}°`;
    targetDistance.innerText = `${Math.round(dist)} m`;

    // Lògica de validació amb histèresi
    if (dist <= PUNT_OBJECTIU.radius_m && accuracy < ACCURACY_THRESHOLD) {
        segonsDinsRadi++;
        if (segonsDinsRadi >= SEGONS_REQUERITS) {
            validarPunt();
        }
    } else {
        segonsDinsRadi = 0; 
    }
}

function validarPunt() {
    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
    
    // Notificar al backend segons el contracte d'events
    fetch('/api/v1/sessions/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ts: new Date().toISOString(),
            type: 'CP_VALIDATED',
            payload: { cp_id: PUNT_OBJECTIU.id, lat: laMevaPosicio.lat, lon: laMevaPosicio.lon }
        })
    }).catch(err => console.error("Error enviant event:", err));

    alert("🏆 BALISA TROBADA!");
    segonsDinsRadi = -999; // Evitem múltiples alertes seguint al mateix punt
}

// --- ARRENCADA ---
async function activarTot() {
    debug("Iniciant sensors...");
    
    // Permisos Brúixola (iOS requereix interacció d'usuari)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        } catch (err) {
            debug("Error permisos brúixola: " + err);
        }
    } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
    }

    // Activar GPS d'alta precisió
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(actualitzarNavegacio, 
            (err) => debug(`Error GPS: ${err.message}`), 
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        debug("GPS no disponible");
    }

    btnPermis.style.display = 'none';
}

// Inicialització
document.addEventListener('DOMContentLoaded', () => {
    inicialitzarMapa();
    btnPermis.addEventListener('click', activarTot);
});