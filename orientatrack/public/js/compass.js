import { calcularDistancia, calcularRumb } from './geo.js';

let laMevaPosicio = null;
let puntObjectiu = { lat: 41.3851, lon: 2.1734, nom: "Punt de Prova" }; // Ex: Pl. Catalunya

function actualitzarNavegacio() {
    if (!laMevaPosicio) return;

    const d = calcularDistancia(laMevaPosicio.lat, laMevaPosicio.lon, puntObjectiu.lat, puntObjectiu.lon);
    const r = calcularRumb(laMevaPosicio.lat, laMevaPosicio.lon, puntObjectiu.lat, puntObjectiu.lon);

    document.getElementById('target-info').innerHTML = `
        <div style="background: #edf2f7; padding: 15px; border-radius: 10px; margin-top: 20px;">
            <p><strong>Objectiu:</strong> ${puntObjectiu.nom}</p>
            <p style="font-size: 1.5rem; color: #2d3748;">Rumb: <strong>${Math.round(r)}°</strong></p>
            <p style="font-size: 1.5rem; color: #2d3748;">Distància: <strong>${Math.round(d)} m</strong></p>
        </div>
    `;

    // Si arribem a menys de 20m, fem vibrar el mòbil!
    if (d < 20) {
        if ("vibrate" in navigator) navigator.vibrate(500);
        alert("HAS ARRIBAT AL PUNT!");
    }
}

// Activar el seguiment GPS
function iniciarGPS() {
    navigator.geolocation.watchPosition((pos) => {
        laMevaPosicio = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
        };
        actualitzarNavegacio();
    }, (err) => console.error(err), { enableHighAccuracy: true });
}