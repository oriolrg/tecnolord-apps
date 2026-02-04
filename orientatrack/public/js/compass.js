import { calcularDistancia, calcularRumb } from './geo.js';

const PUNT_OBJECTIU = { 
    id: "cp-1",
    lat: 42.1363379, 
    lon: 1.5863909, 
    nom: "Font de la Puda",
    radius_m: 20 
};

let map;
let segonsDinsRadi = 0;
let currentRotation = 0;

function actualitzarLlegenda() {
    if (!map) return;
    const y = map.getSize().y / 2;
    const x = map.getSize().x / 2;
    const p1 = map.containerPointToLatLng([x, y]);
    const p2 = map.containerPointToLatLng([x + 38, y]);
    const metresPerCm = map.distance(p1, p2);

    let unitatMetres = 100;
    if (metresPerCm > 150) unitatMetres = 250;
    if (metresPerCm > 400) unitatMetres = 500;
    if (metresPerCm > 850) unitatMetres = 1000;

    const barWidth = (unitatMetres * 38) / metresPerCm;
    document.getElementById('scale-bar').style.width = `${barWidth}px`;
    document.getElementById('scale-bar').style.backgroundSize = `${barWidth / 2}px 5px`;
    document.getElementById('scale-label').innerText = unitatMetres >= 1000 ? (unitatMetres/1000) + ' km' : unitatMetres + ' m';
    document.getElementById('numeric-scale').innerText = `1 : ${Math.round(metresPerCm * 100).toLocaleString()}`;
}

function inicialitzarMapa() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        minZoom: 14,
        maxZoom: 18
    }).setView([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], 15);

    L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topo/GRID3857/{z}/{x}/{y}.jpeg', {
        maxZoom: 18, minZoom: 14
    }).addTo(map);

    map.on('zoomend moveend load', actualitzarLlegenda);
    actualitzarLlegenda();

    L.circle([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], {
        color: '#ff00ff', weight: 3, fillOpacity: 0.1, radius: PUNT_OBJECTIU.radius_m
    }).addTo(map);
}

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
    }
});

// LÒGICA DE GIR SUAU (Evita salts al Nord)
function getShortestRotation(newAngle) {
    let delta = newAngle - (currentRotation % 360);
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    currentRotation += delta;
    return -currentRotation; // Negatiu perquè el limbe gira al revés
}

function handleOrientation(event) {
    let heading = event.webkitCompassHeading || (360 - event.alpha);
    if (heading !== undefined && heading !== null) {
        const angle = Math.round(heading);
        document.getElementById('heading-display').innerText = `${angle}°`;
        
        const targetRotation = getShortestRotation(angle);
        document.getElementById('bezel').style.transform = `rotate(${targetRotation}deg)`;
    }
}

function actualitzarNavegacio(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    const dist = calcularDistancia(latitude, longitude, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);
    const rumb = calcularRumb(latitude, longitude, PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon);

    document.getElementById('target-name').innerText = PUNT_OBJECTIU.nom;
    document.getElementById('target-bearing').innerText = `${Math.round(rumb)}°`;
    document.getElementById('target-distance').innerText = `${Math.round(dist)} m`;

    if (dist <= PUNT_OBJECTIU.radius_m && accuracy < 25) {
        segonsDinsRadi++;
        if (segonsDinsRadi >= 3) {
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 500]);
            alert("🎯 BALISA VALIDADA!");
            segonsDinsRadi = -999;
        }
    } else {
        segonsDinsRadi = 0;
    }
}

async function activar() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const p = await DeviceOrientationEvent.requestPermission();
        if (p === 'granted') window.addEventListener('deviceorientation', handleOrientation);
    } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
    }
    navigator.geolocation.watchPosition(actualitzarNavegacio, null, { enableHighAccuracy: true });
    document.getElementById('btn-permis').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    inicialitzarMapa();
    document.getElementById('btn-permis').addEventListener('click', activar);
});