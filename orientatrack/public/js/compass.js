import { calcularDistancia, calcularRumb } from './geo.js';

let map;
let fites = [];
let indexFitaActual = 0;
let segonsDinsRadi = 0;

// --- PROCESSAR GPX PER DISTÀNCIA (1 cada 1km real) ---
async function carregarRutaGPX() {
    try {
        const response = await fetch('data/ruta.gpx');
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const pts = xml.querySelectorAll("trkpt");

        let acumuladorDistancia = 0;
        let llista = [];

        for (let i = 0; i < pts.length; i++) {
            const lat = parseFloat(pts[i].getAttribute("lat"));
            const lon = parseFloat(pts[i].getAttribute("lon"));

            if (i === 0) {
                afegirFita(llista, lat, lon);
            } else {
                const prevLat = parseFloat(pts[i-1].getAttribute("lat"));
                const prevLon = parseFloat(pts[i-1].getAttribute("lon"));
                acumuladorDistancia += calcularDistancia(prevLat, prevLon, lat, lon);

                // Només creem fita quan hem recorregut 1000 metres des de l'última
                if (acumuladorDistancia >= 1000) {
                    afegirFita(llista, lat, lon);
                    acumuladorDistancia = 0;
                }
            }
        }
        fites = llista;
        actualitzarUIObjectiu();
        dibuixarFitesMapa();
    } catch (e) { 
        console.error("Error carregant el GPX:", e); 
    }
}

function afegirFita(llista, lat, lon) {
    llista.push({
        id: `CP-${llista.length + 1}`,
        lat: lat, lon: lon,
        nom: `Fita ${llista.length + 1}`,
        radius_m: 20
    });
}

function dibuixarFitesMapa() {
    fites.forEach(f => {
        L.circle([f.lat, f.lon], { 
            color: '#ff00ff', 
            weight: 2, 
            fillOpacity: 0.05, 
            radius: f.radius_m 
        }).addTo(map);
    });
}

function actualitzarUIObjectiu() {
    if (fites[indexFitaActual]) {
        document.getElementById('target-name').innerText = fites[indexFitaActual].nom;
    }
}

// --- LÒGICA ARROSSEGAMENT (RECUPERADA) ---
interact('.draggable').draggable({
    listeners: {
        move(event) {
            const t = event.target;
            // Recuperem x i y de data-attrs o 0
            const x = (parseFloat(t.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(t.getAttribute('data-y')) || 0) + event.dy;

            // Apliquem la transformació
            t.style.transform = `translate(${x}px, ${y}px)`;

            // Guardem la posició nova
            t.setAttribute('data-x', x);
            t.setAttribute('data-y', y);
        }
    },
    inertia: true
});

// --- SENSORS I NAVEGACIÓ ---
function handleOrientation(event) {
    let heading = event.webkitCompassHeading || (360 - event.alpha);
    if (heading !== undefined) {
        document.getElementById('bezel').style.transform = `rotate(${-heading}deg)`;
        document.getElementById('heading-display').innerText = Math.round(heading) + "°";
    }
}

function actualitzarNavegacio(pos) {
    if (!fites[indexFitaActual]) return;
    const { latitude: lat, longitude: lon, accuracy } = pos.coords;
    const target = fites[indexFitaActual];
    
    const d = calcularDistancia(lat, lon, target.lat, target.lon);
    const r = calcularRumb(lat, lon, target.lat, target.lon);

    document.getElementById('target-bearing').innerText = Math.round(r) + "°";
    document.getElementById('target-distance').innerText = Math.round(d) + " m";

    // Validació 3 segons
    if (d <= target.radius_m && accuracy < 30) {
        segonsDinsRadi++;
        if (segonsDinsRadi >= 3) {
            segonsDinsRadi = 0;
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 500]);
            alert(`🎯 ${target.nom} TROBADA!`);
            if (indexFitaActual < fites.length - 1) {
                indexFitaActual++;
                actualitzarUIObjectiu();
            } else {
                alert("🏆 Ruta Finalitzada!");
            }
        }
    } else { segonsDinsRadi = 0; }
}

function actualitzarLlegenda() {
    if (!map) return;
    const center = map.getCenter();
    const p1 = map.latLngToContainerPoint(center);
    const p2 = L.point(p1.x + 38, p1.y); // 1cm
    const metresPerCm = map.distance(center, map.containerPointToLatLng(p2));

    document.getElementById('numeric-scale').innerText = `1 : ${Math.round(metresPerCm * 100).toLocaleString()}`;
    const unitat = metresPerCm > 400 ? 500 : 100;
    const barWidth = (unitat * 38) / metresPerCm;
    document.getElementById('scale-bar').style.width = `${barWidth}px`;
    document.getElementById('scale-label').innerText = unitat + " m";
}

// --- BOTÓ FITES (JS SCOPE) ---
document.getElementById('btn-fites').onclick = () => {
    if (fites.length === 0) {
        alert("Encara no s'ha carregat cap ruta.");
    } else {
        alert(`Ruta activa: ${fites.length} fites.\nObjectiu: ${fites[indexFitaActual].nom}`);
    }
};

// --- ACTIVACIÓ ---
document.getElementById('btn-permis').onclick = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        await DeviceOrientationEvent.requestPermission();
    }
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    navigator.geolocation.watchPosition(actualitzarNavegacio, null, { enableHighAccuracy: true });
    
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([42.135, 1.592], 15);
    L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topo/GRID3857/{z}/{x}/{y}.jpeg').addTo(map);
    
    map.on('zoomend moveend load', actualitzarLlegenda);
    
    carregarRutaGPX();
    document.getElementById('btn-permis').style.display = 'none';
};