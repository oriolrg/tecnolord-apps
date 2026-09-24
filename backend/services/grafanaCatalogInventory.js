'use strict';

const MLW28_PUBLIC_ID = '5da7eece-6954-413f-8e22-390fe4144830';
const EXPECTED_SENSOR_COUNT = 29;

function inventoryCode(station) {
  if (station.external_id === 'Meteo-001-3100044') return 'GRAFANA_LOCAL_001';
  if (station.mlw_code) return station.mlw_code;
  const meteo = /^Meteo-([0-9]{3})-/.exec(station.external_id);
  if (meteo) return `GRAFANA_${meteo[1]}`;
  return station.external_id.replaceAll('-', '_');
}

function externalIdQuality(station) {
  if (station.mapping_status === 'PARTIAL_EXTERNAL_ID') return 'PARTIAL_SOURCE_IDENTIFIER';
  if (station.mapping_status === 'UNIDENTIFIED_GRAFANA') return 'TECHNICAL_SOURCE_IDENTIFIER';
  return 'COMPLETE';
}

function buildGrafanaCatalogInventory(mapping, locations) {
  if (!Array.isArray(mapping?.current_stations)
      || mapping.current_stations.length !== EXPECTED_SENSOR_COUNT
      || !Array.isArray(locations?.stations)) {
    throw new TypeError('H06 baseline inventory is invalid');
  }
  const locationByExternalId = new Map(locations.stations.map((item) => [item.external_id, item]));
  const seen = new Set();
  const rows = mapping.current_stations.map((station) => {
    if (seen.has(station.external_id)) throw new TypeError('H06 baseline contains duplicate external identifiers');
    seen.add(station.external_id);
    const quality = externalIdQuality(station);
    const technical = quality === 'TECHNICAL_SOURCE_IDENTIFIER';
    const partial = quality === 'PARTIAL_SOURCE_IDENTIFIER';
    const location = locationByExternalId.get(station.external_id);
    const applyLocation = location?.location_confidence === 'HIGH'
      && location?.location_action === 'CANDIDATE_APPLY'
      && Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
    if (!technical && !station.name) throw new TypeError(`H06 station name missing for ${station.external_id}`);
    if (location && location.external_id !== station.external_id) {
      throw new TypeError(`H06 location identity mismatch for ${station.external_id}`);
    }
    return {
      inventory_code: inventoryCode(station),
      ...(station.mlw_code ? { station_code: station.mlw_code } : {}),
      name: technical ? station.external_id : station.name,
      description: technical
        ? 'Estació tècnica Grafana sense identitat física acreditada.'
        : partial ? 'Identificador operatiu parcial conservat literalment des de Grafana.' : null,
      external_id: station.external_id,
      external_id_quality: quality,
      mapping_status: 'VERIFIED',
      longitude: applyLocation ? location.longitude : null,
      latitude: applyLocation ? location.latitude : null,
      accuracy_m: null,
      evidence_ref: 'H02-station-mapping/H03-station-locations/H04-grafana-metrics',
      ...(station.external_id === 'Meteo-001-3100044'
        ? { expected_public_id: MLW28_PUBLIC_ID } : {}),
    };
  });
  return { source_namespace: 'GRAFANA', rows };
}

function buildGrafanaImportPlan(inventory, existingStations) {
  const byExternalId = new Map(existingStations.map((station) => [station.external_id, station]));
  const byCode = new Map(existingStations.map((station) => [station.code, station]));
  return inventory.rows.map((row) => {
    const existing = byExternalId.get(row.external_id) || null;
    const codeOwner = row.station_code ? byCode.get(row.station_code) : null;
    let action = row.external_id_quality === 'TECHNICAL_SOURCE_IDENTIFIER' ? 'CREATE_TECHNICAL' : 'CREATE';
    const notes = [];
    if (existing) {
      if (row.expected_public_id && existing.uuid !== row.expected_public_id) {
        action = 'SKIP_CONFLICT'; notes.push('UNEXPECTED_STATION_UUID');
      } else if (existing.management_kind !== 'ADMIN' || existing.source_namespace !== 'GRAFANA') {
        action = 'SKIP_CONFLICT'; notes.push('INCOMPATIBLE_EXISTING_BINDING');
      } else {
        action = 'UPDATE_EXISTING';
      }
    } else if (row.expected_public_id) {
      action = 'SKIP_CONFLICT'; notes.push('EXPECTED_STATION_MISSING');
    }
    if (codeOwner && (!existing || codeOwner.uuid !== existing.uuid)) {
      action = 'SKIP_CONFLICT'; notes.push('STATION_CODE_ALREADY_USED');
    }
    if (row.external_id_quality === 'PARTIAL_SOURCE_IDENTIFIER') {
      notes.push('external_id_quality=PARTIAL_SOURCE_IDENTIFIER');
    }
    if (row.external_id_quality === 'TECHNICAL_SOURCE_IDENTIFIER') {
      notes.push('No physical identity or coordinates asserted');
    }
    return {
      external_id: row.external_id,
      code: row.station_code || null,
      name: row.name,
      station_existing: existing !== null,
      current_uuid: existing?.uuid || null,
      latitude: row.latitude,
      longitude: row.longitude,
      location_confidence: row.latitude === null ? 'NOT_APPLIED' : 'HIGH',
      action,
      notes,
    };
  });
}

module.exports = {
  EXPECTED_SENSOR_COUNT,
  MLW28_PUBLIC_ID,
  buildGrafanaCatalogInventory,
  buildGrafanaImportPlan,
};
