'use strict';
const EARTH_RADIUS_M = 6371008.8;
function validPoint(value) {
  return value && value.type === 'Point' && Array.isArray(value.coordinates) && value.coordinates.length === 2
    && Number.isFinite(value.coordinates[0]) && Number.isFinite(value.coordinates[1])
    && value.coordinates[0] >= -180 && value.coordinates[0] <= 180 && value.coordinates[1] >= -90 && value.coordinates[1] <= 90;
}
// MAP-A's deterministic, meter-based synthetic policy. The nearest center of
// a square grid of side radius meters stays within radius/sqrt(2) of the source.
// It is calculated server-side; a browser never receives the private point.
function generalizeGeometry(station) {
  if (!station || !Number.isInteger(station.privacy_radius_m) || station.privacy_radius_m <= 0) return null;
  if (station.geo_publication === 'HIDDEN') return null;
  if (!Object.hasOwn(station, 'private_geometry')) return validPoint(station.public_geometry) ? {
    type: 'Point', coordinates: [...station.public_geometry.coordinates],
  } : null;
  const point = station.private_geometry;
  if (!validPoint(point)) return null;
  if (station.geo_publication === 'EXACT') return { type: 'Point', coordinates: [...point.coordinates] };
  if (station.geo_publication !== 'APPROXIMATED' || station.privacy_radius_m < 100) return null;
  const [lon, lat] = point.coordinates;
  const stepLat = station.privacy_radius_m / EARTH_RADIUS_M * 180 / Math.PI;
  const stepLon = stepLat / Math.cos(lat * Math.PI / 180);
  if (!Number.isFinite(stepLon) || stepLon >= 360) return null;
  const coordinates = [Math.round(lon / stepLon) * stepLon, Math.round(lat / stepLat) * stepLat];
  if (!validPoint({ type: 'Point', coordinates })) return null;
  return { type: 'Point', coordinates };
}
module.exports = { generalizeGeometry, validPoint };
