import { calcularDistancia, calcularRumb } from './geo.js';

// --- CONFIGURACIÓ ---
const PUNT_OBJECTIU = { 
    id: "cp-1",
    lat: 42.1363379, 
    lon: 1.5863909, 
    nom: "Font de la Puda",
    radius_m: 20 
};

let map;
let segonsDinsRadi = 0;

// --- ELEMENTS UI ---
const bezel = document.getElementById('bezel');
const headingDisplay = document.getElementById('heading-display');
const btnPermis = document.getElementById('btn-permis');

function inicialitzarMapa() {
    const areaJoc = L.latLngBounds([42.11, 1.56], [42.16, 1.61]);

    map = L.map('map', {
        maxBounds: areaJoc,
        maxBoundsViscosity: 1.0,
        minZoom: 14,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false
    }).setView([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], 15);

    L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topo/GRID3857/{z}/{x}/{y}.jpeg', {
        maxZoom: 16, minZoom: 14
    }).addTo(map);

    // Pintar CP (Cercle lila Rogaine)
    L.circle([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], {
        color: '#ff00ff', weight: 3, fillOpacity: 0.1, radius: PUNT_OBJECTIU.radius_m
    }).addTo(map);
}

function handleOrientation(event) {
    let heading = event.webkitCompassHeading || (360 - event.alpha);
    if (heading !== undefined && heading !== null) {
        const angle = Math.round(heading);
        
        // El display mostra el rumb on mira la placa
        headingDisplay.innerText = `${angle}°`;
        
        // El limbe gira al revés per mantenir el Nord fix
        bezel.style.transform = `rotate(${-angle}deg)`;
    }
}

function actualitzarNavegacio(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    
    const dist = calcularDistancia(latitude, longitude, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);
    const rumb = calcularRumb(latitude, longitude, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);

    document.getElementById('target-name').innerText = PUNT_OBJECTIU.nom;
    document.getElementById('target-bearing').innerText = `${Math.round(rumb)}°`;
    document.getElementById('target-distance').innerText = `${Math.round(dist)} m`;

    // Validació
    if (dist <= PUNT_OBJECTIU.radius_m && accuracy < 25) {
        segonsDinsRadi++;
        if (segonsDinsRadi >= 3) {
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 500]);
            alert("🏆 BALISA TROBADA!");
            segonsDinsRadi = -999;
        }
    } else {
        segonsDinsRadi = 0;
    }
}

async function activar() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const p = await DeviceOrientationEvent.requestPermission();
        if (p === 'granted') window.addEventListener('deviceorientation', handleOrientation);
    } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
    }

    navigator.geolocation.watchPosition(actualitzarNavegacio, null, { enableHighAccuracy: true });
    btnPermis.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    inicialitzarMapa();
    btnPermis.addEventListener('click', activar);
});