// backend/logic/geo.js

// Funcions auxiliars per passar de graus a radiants (necessari per a trigonometria)
const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

/**
 * Calcula la distància en metres entre dos punts (Fórmula de Haversine)
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radi de la Terra en metres
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Retorna distància en metres
}

/**
 * Calcula el rumb (bearing) inicial des del punt 1 al punt 2 en graus (0-360)
 */
function calcularRumb(lat1, lon1, lat2, lon2) {
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    let brng = toDeg(Math.atan2(y, x));
    
    // Normalitzem el resultat perquè estigui entre 0 i 360 graus
    return (brng + 360) % 360;
}

// Exportem les funcions perquè el Test o l'Index les puguin carregar
module.exports = { calcularDistancia, calcularRumb };