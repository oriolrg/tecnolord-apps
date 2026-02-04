// backend/logic/gpx.js
const gpxParser = require('gpxparser');
const fs = require('fs');

function parsejarRuta(rutaFitxer) {
    const gpx = new gpxParser();
    const xml = fs.readFileSync(rutaFitxer, 'utf8');
    gpx.parse(xml);

    // Extraiem només els punts del primer track
    if (gpx.tracks.length === 0) return null;

    const punts = gpx.tracks[0].points.map(p => ({
        lat: p.lat,
        lon: p.lon,
        ele: p.ele,
        time: p.time
    }));

    return {
        nom: gpx.tracks[0].name || "Ruta sense nom",
        distancia: gpx.tracks[0].distance.total,
        punts: punts
    };
}

module.exports = { parsejarRuta };