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

// Variable per controlar la histèresi (estabilitat)
let entersCount = 0;
const MIN_FIXES_REQUIRED = 3; // Calen 3 lectures seguides dins del radi

function actualitzarNavegacio(pos) {
    const accuracy = pos.coords.accuracy;
    laMevaPosicio = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
    };

    // 1. Calcular dades geoespacials (segons ADR-0002)
    const dist = calcularDistancia(laMevaPosicio.lat, laMevaPosicio.lon, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);
    const rumbObj = calcularRumb(laMevaPosicio.lat, laMevaPosicio.lon, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);

    // Actualitzar UI
    targetBearing.innerText = `${Math.round(rumbObj)}°`;
    targetDistance.innerText = `${Math.round(dist)} m`;

    // 2. Motor de Validació amb Histèresi
    // Només validem si la precisió GPS és millor que 20m
    if (accuracy < 20) {
        if (dist <= PUNT_OBJECTIU.radius_m) {
            entersCount++;
            debug(`Dins del radi... (${entersCount}/${MIN_FIXES_REQUIRED})`);
            
            if (entersCount >= MIN_FIXES_REQUIRED) {
                validarPunt();
            }
        } else {
            entersCount = 0; // Si surt del radi, reiniciem el comptador
        }
    }
}

function validarPunt() {
    // 1. Notificar a l'usuari (Vibració + Alerta)
    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
    
    // 2. Enviar event al Backend (segons Contractes API)
    fetch(`/api/v1/sessions/CURRENT_SESSION_ID/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ts: new Date().toISOString(),
            type: 'CP_VALIDATED',
            payload: { cp_id: PUNT_OBJECTIU.id, lat: laMevaPosicio.lat, lon: laMevaPosicio.lon }
        })
    });

    alert("🏆 BALISA VALIDADA!");
    // Aquí podries carregar el següent CP de la ruta lineal
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

// Dins de js/compass.js

let map;
let targetMarker;

function inicialitzarMapa() {
    // Definir els límits del mapa (ex: un quadrat de 5km al voltant del punt)
    const bounds = L.latLngBounds(
        [42.10, 1.55], // Sud-oest
        [42.16, 1.62]  // Nord-est
    );

    map = L.map('map', {
        maxBounds: bounds,         // No permet sortir d'aquesta zona
        maxBoundsViscosity: 1.0,   // Efecte "rebot" si s'intenta sortir
        minZoom: 13,               // No permet veure massa territori (mantenir escala orientació)
        maxZoom: 17,               // No permet veure "massa detall" urbà
        zoomControl: false         // Treure botons +/- per netejar la UI
    }).setView([42.1363, 1.5863], 15);

    // Afegim la capa de l'ICGC
    L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topo/GRID3857/{z}/{x}/{y}.jpeg', {
        attribution: 'ICGC',
        bounds: bounds
    }).addTo(map);
}

// Cridem la funció d'inicialització
inicialitzarMapa();