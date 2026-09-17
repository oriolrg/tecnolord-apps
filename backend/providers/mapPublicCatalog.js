'use strict';

// MAP-A public catalog adapter.  This module deliberately has no HTTP,
// persistence, or frontend dependency: it is the fail-closed boundary between
// canonical fixture records and the future public surfaces.

const PUBLIC_ALLOWED = 'PUBLIC_ALLOWED';
const HIDDEN = 'HIDDEN';
const FEATURE_COLLECTION = 'FeatureCollection';
const FILTER_KEYS = new Set(['search', 'public_station_ids', 'catalog_version']);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPublicClass(value) {
  return value === PUBLIC_ALLOWED;
}

function isValidPublicGeometry(geometry) {
  if (!isRecord(geometry) || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)
    || geometry.coordinates.length !== 2) return false;
  const [longitude, latitude] = geometry.coordinates;
  return Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && longitude >= -180
    && longitude <= 180
    && latitude >= -90
    && latitude <= 90;
}

function cloneGeometry(geometry) {
  return {
    type: 'Point',
    coordinates: [geometry.coordinates[0], geometry.coordinates[1]],
  };
}

function normalizeFilters(filters) {
  if (filters === undefined) return { valid: true, search: null, ids: null, catalogVersion: null };
  if (!isRecord(filters)) return { valid: false };
  if (Object.keys(filters).some((key) => !FILTER_KEYS.has(key))) return { valid: false };

  let search = null;
  if (Object.hasOwn(filters, 'search')) {
    if (typeof filters.search !== 'string') return { valid: false };
    search = filters.search.trim().toLocaleLowerCase('ca');
  }

  let ids = null;
  if (Object.hasOwn(filters, 'public_station_ids')) {
    if (!Array.isArray(filters.public_station_ids)
      || filters.public_station_ids.some((id) => !isNonEmptyString(id))) return { valid: false };
    ids = new Set(filters.public_station_ids);
  }

  let catalogVersion = null;
  if (Object.hasOwn(filters, 'catalog_version')) {
    if (!isNonEmptyString(filters.catalog_version)) return { valid: false };
    catalogVersion = filters.catalog_version;
  }

  return { valid: true, search, ids, catalogVersion };
}

function hasRequiredPublicStationShape(station) {
  return isRecord(station)
    && isNonEmptyString(station.public_station_id)
    && isNonEmptyString(station.canonical_station_id)
    && (station.duplicate_group_id === null || isNonEmptyString(station.duplicate_group_id))
    && isPublicClass(station.publication_class)
    && station.publication_revoked === false
    && isNonEmptyString(station.public_name)
    && Number.isInteger(station.privacy_radius_m)
    && station.privacy_radius_m > 0
    && isNonEmptyString(station.geo_policy_version)
    && Array.isArray(station.sensors)
    && (station.observed_at === null || isNonEmptyString(station.observed_at))
    && isRecord(station.provenance)
    && isNonEmptyString(station.provenance.source)
    && isNonEmptyString(station.provenance.licence_or_legal_basis_ref)
    && station.consent_required === false
    && isNonEmptyString(station.catalog_version);
}

function isMapVisible(station) {
  return station.geo_publication !== HIDDEN && isValidPublicGeometry(station.public_geometry);
}

function isSafePublicField(field) {
  return isRecord(field)
    && isNonEmptyString(field.field_id)
    && isNonEmptyString(field.unit)
    && isPublicClass(field.publication_class)
    && field.defect_01_affected === false
    && (field.current_value === null || Number.isFinite(field.current_value));
}

function sanitizeSensors(sensors) {
  const result = [];
  for (const sensor of sensors) {
    if (!isRecord(sensor) || !isNonEmptyString(sensor.sensor_id)
      || !isPublicClass(sensor.publication_class) || !Array.isArray(sensor.fields)) continue;
    const fields = sensor.fields.filter(isSafePublicField).map((field) => ({
      field_id: field.field_id,
      unit: field.unit,
      current_value: field.current_value,
    }));
    if (fields.length > 0) result.push({ sensor_id: sensor.sensor_id, fields });
  }
  return result;
}

function toPublicStation(station) {
  return {
    public_station_id: station.public_station_id,
    public_name: station.public_name,
    public_geometry: cloneGeometry(station.public_geometry),
    geo_publication: station.geo_publication,
    sensors: sanitizeSensors(station.sensors),
    observed_at: station.observed_at,
    provenance: {
      source: station.provenance.source,
      licence_or_legal_basis_ref: station.provenance.licence_or_legal_basis_ref,
    },
    catalog_version: station.catalog_version,
  };
}

function isFilterMatch(station, filters) {
  if (filters.ids && !filters.ids.has(station.public_station_id)) return false;
  if (filters.catalogVersion && station.catalog_version !== filters.catalogVersion) return false;
  if (filters.search && !station.public_name.toLocaleLowerCase('ca').includes(filters.search)) return false;
  return true;
}

function publicCanonicalStations(stations, filters = {}) {
  const normalizedFilters = normalizeFilters(filters);
  if (!normalizedFilters.valid || !Array.isArray(stations)) return [];

  // 1. Classification: absence is INTERNAL_ONLY by construction; only exact
  // PUBLIC_ALLOWED records progress to the public deduplication stage.
  const classified = stations.filter(hasRequiredPublicStationShape);
  const byId = new Map();
  for (const station of classified) {
    // Duplicate public identifiers are ambiguous and therefore fail closed.
    if (byId.has(station.public_station_id)) return [];
    byId.set(station.public_station_id, station);
  }

  // 2. Deduplication and canonical station.  INTERNAL_ONLY records were
  // excluded above, so they cannot affect public grouping or counts.
  const canonicalByGroup = new Map();
  for (const station of classified) {
    if (station.duplicate_group_id === null) continue;
    if (station.canonical_station_id !== station.public_station_id) continue;
    const group = station.duplicate_group_id;
    if (canonicalByGroup.has(group)) canonicalByGroup.set(group, null);
    else canonicalByGroup.set(group, station.public_station_id);
  }

  const canonical = classified.filter((station) => {
    if (station.duplicate_group_id === null) {
      return station.canonical_station_id === station.public_station_id;
    }
    const canonicalId = canonicalByGroup.get(station.duplicate_group_id);
    return canonicalId === station.public_station_id && byId.has(canonicalId);
  });

  // 3. MAP_VISIBLE: public geometry must be valid, non-hidden and non-revoked.
  // 4. Active filters: only applied after public visibility is established.
  return canonical.filter((station) => isMapVisible(station) && isFilterMatch(station, normalizedFilters));
}

function toFeature(station) {
  const publicStation = toPublicStation(station);
  return {
    type: 'Feature',
    id: publicStation.public_station_id,
    geometry: publicStation.public_geometry,
    properties: {
      public_station_id: publicStation.public_station_id,
      public_name: publicStation.public_name,
      geo_publication: publicStation.geo_publication,
      sensors: publicStation.sensors,
      observed_at: publicStation.observed_at,
      provenance: publicStation.provenance,
      catalog_version: publicStation.catalog_version,
    },
  };
}

// 5. Public GeoJSON is always constructed from the already classified,
// canonical, visible, and filtered station set.
function getPublicGeoJSON(stations, filters = {}) {
  return {
    type: FEATURE_COLLECTION,
    features: publicCanonicalStations(stations, filters).map(toFeature),
  };
}

function getPublicList(stations, filters = {}) {
  const features = getPublicGeoJSON(stations, filters).features;
  return { features, count: features.length };
}

function getPublicStation(stations, publicStationId) {
  if (!isNonEmptyString(publicStationId)) return null;
  const station = publicCanonicalStations(stations)
    .find((candidate) => candidate.public_station_id === publicStationId);
  return station ? toPublicStation(station) : null;
}

function getCatalogVersion(stations) {
  const versions = new Set(publicCanonicalStations(stations).map((station) => station.catalog_version));
  return versions.size === 1 ? [...versions][0] : null;
}

module.exports = {
  getCatalogVersion,
  getPublicGeoJSON,
  getPublicList,
  getPublicStation,
};
