'use strict';
const { createHash } = require('node:crypto');
const { publicCanonicalStations, getCatalogVersion } = require('./mapPublicCatalog');

// In-memory MAP-A authority. A future persistent catalog must own the revision
// transactionally. This store also detects in-place changes to injected fixtures.
function createCatalogStore(stations, policies = {}) {
  let signature, revision = 0;
  const base = getCatalogVersion(stations) || 'map-a-synthetic-v1';
  return {
    snapshot() {
      const eligible = publicCanonicalStations(stations);
      const relevant = eligible.map((station) => ({ ...station,
        // Internal measurements and diagnostic values must not affect revisions.
        sensors: station.sensors.filter((sensor) => sensor.publication_class === 'PUBLIC_ALLOWED')
          .map((sensor) => ({ sensor_id: sensor.sensor_id, fields: sensor.fields.filter((field) =>
            field.publication_class === 'PUBLIC_ALLOWED' && field.defect_01_affected === false) })) }));
      const next = createHash('sha256').update(JSON.stringify([relevant, policies])).digest('hex');
      if (signature !== undefined && signature !== next) revision++;
      signature = next;
      const version = revision === 0 ? base : `${base}.${revision}`;
      return { stations: structuredClone(stations).map((station) => ({ ...station, catalog_version: version })), version };
    },
  };
}
module.exports = { createCatalogStore };
