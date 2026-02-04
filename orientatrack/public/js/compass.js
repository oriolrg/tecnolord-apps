import { calcularDistancia, calcularRumb } from './geo.js';

let map;
let fites = [];
let indexFitaActual = 0;
let segonsDinsRadi = 0;

// --- 1. PROCESSAR GPX PER DISTÀNCIA (1 cada 1km real) ---
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

                // Quan portem 1000m acumulats des de l'última fita, en creem una de nova
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

// --- 2. DIBUIXAR FITES AMB NÚMERO ---
function dibuixarFitesMapa() {
    if (!map) return;
    fites.forEach((f, i) => {
        const num = i + 1;
        
        // Cercle de validació (molt subtil)
        L.circle([f.lat, f.lon], { 
            color: '#ff00ff', 
            weight: 1, 
            fillOpacity: 0.05, 
            radius: f.radius_m 
        }).addTo(map);

        // Marcador amb número (Estil orientació)
        const fitaIcon = L.divIcon({
            className: 'fita-icon',
            html: `<span>${num}</span>`,
            iconSize: [24, 24]
        });

        L.marker([f.lat, f.lon], { icon: fitaIcon }).addTo(map)
         .on('click', () => seleccionarFita(i));
    });
}

function actualitzarUIObjectiu() {
    if (fites[indexFitaActual]) {
        document.getElementById('target-name').innerText = fites[indexFitaActual].nom;
    }
}

function seleccionarFita(index) {
    indexFitaActual = index;
    actualitzarUIObjectiu();
    document.getElementById('fites-menu').style.display = 'none';
    
    // Centrem el mapa una mica cap a la fita per ajudar a localitzar-la
    map.panTo([fites[index].lat, fites[index].lon]);
}

// --- 3. LÒGICA ARROSSEGAMENT BRÚIXOLA ---
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
    },
    inertia: true
});

// --- 4. SENSORS I NAVEGACIÓ ---
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

    if (d <= target.radius_m && accuracy < 30) {
        segonsDinsRadi++;
        if (segonsDinsRadi >= 3) {
            segonsDinsRadi = 0;
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 500]);
            alert(`🎯 ${target.nom} TROBADA!`);
            if (indexFitaActual < fites.length - 1) {
                indexFitaActual++;
                actualitzarUIObjectiu();
            }
        }
    } else { segonsDinsRadi = 0; }
}

function actualitzarLlegenda() {
    if (!map) return;
    const center = map.getCenter();
    const p1 = map.latLngToContainerPoint(center);
    const p2 = L.point(p1.x + 38, p1.y); 
    const metresPerCm = map.distance(center, map.containerPointToLatLng(p2));

    document.getElementById('numeric-scale').innerText = `1 : ${Math.round(metresPerCm * 100).toLocaleString()}`;
    const unitat = metresPerCm > 400 ? 500 : 100;
    const barWidth = (unitat * 38) / metresPerCm;
    document.getElementById('scale-bar').style.width = `${barWidth}px`;
    document.getElementById('scale-label').innerText = unitat + " m";
}

// --- 5. MENÚ SELECTOR DE FITES ---
document.getElementById('btn-fites').onclick = (e) => {
    e.stopPropagation();
    const menu = document.getElementById('fites-menu');
    
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        return;
    }

    if (fites.length === 0) {
        alert("Encara no s'ha carregat cap ruta.");
        return;
    }

    menu.innerHTML = '<h4 style="margin:10px 15px; color:#4a5568">Selecciona Fita:</h4>';
    fites.forEach((f, i) => {
        const div = document.createElement('div');
        div.className = 'fita-item';
        const esActual = (i === indexFitaActual);
        
        div.innerHTML = `
            <span style="${esActual ? 'font-weight:bold; color:var(--primary);' : ''}">${f.nom}</span>
            <small style="color:#a0aec0">${esActual ? '📍 Destí' : 'Anar-hi'}</small>
        `;
        div.onclick = () => seleccionarFita(i);
        menu.appendChild(div);
    });

    menu.style.display = 'block';
};

// --- 6. ACTIVACIÓ ---
document.getElementById('btn-permis').onclick = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        await DeviceOrientationEvent.requestPermission();
    }
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    navigator.geolocation.watchPosition(actualitzarNavegacio, null, { enableHighAccuracy: true });
    
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([42.135, 1.592], 15);
    
    // ICGC Topogràfic Gris (Neteja visual)
    L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/topogris/GRID3857/{z}/{x}/{y}.jpeg', {
        attribution: 'ICGC', maxZoom: 18
    }).addTo(map);

    map.on('zoomend moveend load', actualitzarLlegenda);
    map.on('click', () => document.getElementById('fites-menu').style.display = 'none');
    
    carregarRutaGPX();
    document.getElementById('btn-permis').style.display = 'none';
};