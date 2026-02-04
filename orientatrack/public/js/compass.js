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

// --- MOTOR D'ESCALA CARTOGRÀFICA ---
function actualitzarEscala() {
    if (!map) return;
    
    // 1. Càlcul del Regle de la Brúixola (Metres per cada cm físic)
    const center = map.getCenter();
    const y = map.getSize().y / 2;
    const x = map.getSize().x / 2;
    
    // Calculem la distància que representen 38 píxels (~1cm)
    const p1 = map.containerPointToLatLng([x, y]);
    const p2 = map.containerPointToLatLng([x + 38, y]);
    const metresPerCm = map.distance(p1, p2);

    // Actualitzem les etiquetes del regle (0, 1, 2, 3, 4)
    const marks = document.querySelectorAll('.ruler span');
    marks.forEach((span, i) => {
        if (i === 0) return;
        const d = Math.round(metresPerCm * i);
        const label = d >= 1000 ? (d/1000).toFixed(1) + 'k' : d + 'm';
        span.setAttribute('data-dist', label);
    });

    // 2. Càlcul de la Llegenda Gràfica (Barra d'escala)
    // Busquem una unitat "rodona" (100m, 200m, 500m, 1km...)
    let unitatRodona = 100;
    if (metresPerCm > 150) unitatRodona = 200;
    if (metresPerCm > 350) unitatRodona = 500;
    if (metresPerCm > 750) unitatRodona = 1000;

    // Calculem quants píxels ha de tenir la barra per representar aquesta unitat
    const pixelsPerMetre = 38 / metresPerCm;
    const barWidth = unitatRodona * pixelsPerMetre;

    const scaleBar = document.getElementById('scale-bar');
    scaleBar.style.width = `${barWidth}px`;
    scaleBar.style.backgroundSize = `${barWidth / 2}px 6px`; // Efecte cebra
    
    document.getElementById('scale-label').innerText = unitatRodona >= 1000 ? (unitatRodona/1000) + ' km' : unitatRodona + ' m';
    
    // Escala Numèrica aproximada (Metres en 1cm * 100 per treure cm)
    const escalaNum = Math.round(metresPerCm * 100);
    document.getElementById('numeric-scale').innerText = `1 : ${escalaNum.toLocaleString()}`;
}

// --- MAPA ---
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

    // Escoltadors d'esdeveniments per l'escala
    map.on('zoomend moveend load', actualitzarEscala);
    actualitzarEscala(); // Inicial

    L.circle([PUNT_OBJECTIU.lat, PUNT_OBJECTIU.lon], {
        color: '#ff00ff', weight: 3, fillOpacity: 0.1, radius: PUNT_OBJECTIU.radius_m
    }).addTo(map);
}

// --- ARROSSEGAMENT BRÚIXOLA ---
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

// --- SENSORS ---
function handleOrientation(event) {
    let heading = event.webkitCompassHeading || (360 - event.alpha);
    if (heading !== undefined && heading !== null) {
        const angle = Math.round(heading);
        document.getElementById('heading-display').innerText = `${angle}°`;
        document.getElementById('bezel').style.transform = `rotate(${-angle}deg)`;
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