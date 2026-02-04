/**
 * GeoEngine.js - Motor de càlculs geodèsics per a OrientaTrack Pro
 */

/**
 * Calcula la distància en línia recta entre dos punts (Fórmula de Haversine)
 * @param {number} lat1 - Latitud origen
 * @param {number} lon1 - Longitud origen
 * @param {number} lat2 - Latitud destí
 * @param {number} lon2 - Longitud destí
 * @returns {number} Distància en metres
 */
export function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radi de la Terra en metres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

/**
 * Calcula el rumb (bearing) inicial entre dos punts
 * @param {number} lat1 - Latitud origen
 * @param {number} lon1 - Longitud origen
 * @param {number} lat2 - Latitud destí
 * @param {number} lon2 - Longitud destí
 * @returns {number} Rumb en graus (0-359)
 */
export function calcularRumb(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    const brng = Math.atan2(y, x);
    return (brng * 180 / Math.PI + 360) % 360; // Normalitza a 0-359°
}