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

function actualitzarLlegenda() {
    if (!map) return;
    const y = map.getSize().y / 2;
    const x = map.getSize().x / 2;
    const p1 = map.containerPointToLatLng([x, y]);
    const p2 = map.containerPointToLatLng([x + 38, y]); // 1cm aprox
    const metresPerCm = map.distance(p1, p2);

    let unitat = 100;
    if (metresPerCm > 150) unitat = 250;
    if (metresPerCm > 400) unitat = 500;
    if (metresPerCm > 850) unitat = 1000;

    const barWidth = (unitat * 38) / metresPerCm;
    const scaleBar = document.getElementById('scale-bar');
    if (scaleBar) {
        scaleBar.style.width = `${barWidth}px`;
        scaleBar.style.backgroundSize = `${barWidth / 2}px 6px`;
    }
    document.getElementById('scale-label').innerText = unitat >= 1000 ? (unitat/1000) + ' km' : unitat + ' m';
    document.getElementById('numeric-scale').innerText = `1 : ${Math.round(metresPerCm * 100).toLocaleString()}`;
}

function inicialitzarMapa() {
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], 15);
    L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topo/GRID3857/{z}/{x}/{y}.jpeg').addTo(map);
    map.on('zoomend moveend load', actualitzarLlegenda);
    actualitzarLlegenda();
}

interact('.draggable').draggable({
    listeners: {
        move(event) {
            const t = event.target;
            const x = (parseFloat(t.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(t.getAttribute('data-y')) || 0) + event.dy;
            t.style.transform = `translate(${x}px, ${y}px)`;
            t.setAttribute('data-x', x); t.setAttribute('data-y', y);
        }
    }
});

function handleOrientation(event) {
    let heading = event.webkitCompassHeading || (360 - event.alpha);
    if (heading !== undefined && heading !== null) {
        document.getElementById('heading-display').innerText = `${Math.round(heading)}°`;
        document.getElementById('bezel').style.transform = `rotate(${-heading}deg)`;
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
    } else { segonsDinsRadi = 0; }
}

async function activar() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const p = await DeviceOrientationEvent.requestPermission();
        if (p === 'granted') window.addEventListener('deviceorientation', handleOrientation);
    } else { window.addEventListener('deviceorientationabsolute', handleOrientation); }
    navigator.geolocation.watchPosition(actualitzarNavegacio, null, { enableHighAccuracy: true });
    document.getElementById('btn-permis').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    inicialitzarMapa();
    document.getElementById('btn-permis').addEventListener('click', activar);
});