import { calcularDistancia, calcularRumb } from './geo.js';

let map;
let fites = [];
let indexFitaActual = 0;
let segonsDinsRadi = 0;

// --- 1. CARREGAR I PROCESSAR GPX ---
async function carregarRutaGPX() {
    try {
        const response = await fetch('data/ruta.gpx');
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const puntsRecorregut = xml.querySelectorAll("trkpt");

        // Seleccionem punts cada cert interval per no tenir 1000 fites
        // Per exemple, un punt cada 50 del GPX
        let llistaProvisoria = [];
        puntsRecorregut.forEach((pt, index) => {
            if (index % 50 === 0) { // Ajusta aquest número per tenir més o menys fites
                llistaProvisoria.push({
                    id: `CP-${llistaProvisoria.length + 1}`,
                    lat: parseFloat(pt.getAttribute("lat")),
                    lon: parseFloat(pt.getAttribute("lon")),
                    nom: `Fita ${llistaProvisoria.length + 1}`,
                    radius_m: 20
                });
            }
        });
        fites = llistaProvisoria;
        actualitzarUIObjectiu();
        dibuixarFitesMapa();
    } catch (error) {
        console.error("Error carregant el GPX:", error);
    }
}

// --- 2. LÒGICA DE JOC ---
function actualitzarUIObjectiu() {
    if (fites.length === 0) return;
    const actual = fites[indexFitaActual];
    document.getElementById('target-name').innerText = actual.nom;
}

function dibuixarFitesMapa() {
    if (!map) return;
    fites.forEach((fita, i) => {
        // Només dibuixem un cercle lila (sense marcador perquè sigui "navegació cega")
        L.circle([fita.lat, fita.lon], {
            color: '#ff00ff', weight: 2, fillOpacity: 0.05, radius: fita.radius_m
        }).addTo(map);
    });
}

function validarProximitat(latitude, longitude, accuracy) {
    if (fites.length === 0) return;
    const actual = fites[indexFitaActual];
    const dist = calcularDistancia(latitude, longitude, actual.lat, actual.lon);
    const rumb = calcularRumb(latitude, longitude, actual.lat, actual.lon);

    // Actualitzem panell inferior
    document.getElementById('target-bearing').innerText = `${Math.round(rumb)}°`;
    document.getElementById('target-distance').innerText = `${Math.round(dist)} m`;

    // Lògica de validació (3 segons a prop)
    if (dist <= actual.radius_m && accuracy < 25) {
        segonsDinsRadi++;
        if (segonsDinsRadi >= 3) {
            segonsDinsRadi = 0;
            if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
            alert(`✅ ${actual.nom} TROBADA!`);
            
            if (indexFitaActual < fites.length - 1) {
                indexFitaActual++;
                actualitzarUIObjectiu();
            } else {
                alert("🏆 FELICITATS! Has completat la ruta.");
            }
        }
    } else {
        segonsDinsRadi = 0;
    }
}

// --- 3. SENSORS I MAPA (Mateixa lògica anterior) ---
function actualitzarLlegenda() {
    if (!map) return;
    const center = map.getCenter();
    const p1 = map.latLngToContainerPoint(center);
    const p2 = L.point(p1.x + 38, p1.y);
    const latLng2 = map.containerPointToLatLng(p2);
    const metresPerCm = map.distance(center, latLng2);

    document.getElementById('numeric-scale').innerText = `1 : ${Math.round(metresPerCm * 100).toLocaleString()}`;
    const unitat = metresPerCm > 400 ? 500 : 100;
    const barWidth = (unitat * 38) / metresPerCm;
    document.getElementById('scale-bar').style.width = `${barWidth}px`;
    document.getElementById('scale-label').innerText = `${unitat} m`;
}

function inicialitzarMapa() {
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([42.135, 1.592], 15);
    L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topo/GRID3857/{z}/{x}/{y}.jpeg').addTo(map);
    map.on('zoomend moveend load', actualitzarLlegenda);
    carregarRutaGPX();
}

// Inicialització per botó
document.getElementById('btn-permis').onclick = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        await DeviceOrientationEvent.requestPermission();
    }
    window.addEventListener('deviceorientationabsolute', (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha);
        if (heading) document.getElementById('bezel').style.transform = `rotate(${-heading}deg)`;
    }, true);
    
    navigator.geolocation.watchPosition((pos) => {
        validarProximitat(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
    }, null, { enableHighAccuracy: true });

    inicialitzarMapa();
    document.getElementById('btn-permis').style.display = 'none';
};