'use strict';
const basic = require('../test/fixtures/map-a/stations-basic.json');
const nearby = require('../test/fixtures/map-a/stations-nearby.json');
const history = require('../test/fixtures/map-a/history-profile-24h-raw.json');
const { DEMO_NOW } = require('./mapPublicCatalog');
function createMapDemo() {
  const stations = structuredClone([...basic, ...nearby]);
  const names = ['Turó de prova', 'Vall de prova', 'Bosc de prova', 'Pla de prova', 'Observatori de prova A', 'Observatori de prova B'];
  const positions = [[-169.75, -55.75], [-166.5, -55.75], [-169.75, -52.25], [-166.5, -52.25], [-168.2, -54], [-168.2, -54]];
  const temperatures = [8.4, 12.5, 18.2, 26.1, 16.3, 17.1];
  for (let i = 0; i < stations.length; i++) {
    stations[i].public_name = names[i];
    stations[i].public_geometry.coordinates = positions[i];
    for (const sensor of stations[i].sensors) for (const field of sensor.fields) {
      if (field.field_id === 'temperature') field.current_value = temperatures[i];
    }
  }
  const historyProfiles = [{ ...structuredClone(history), retention_policy_ref: 'synthetic-retention-demo-v1' }];
  const observations = {};
  for (let i = 0; i < stations.length; i++) {
    observations[stations[i].public_station_id] = { temperature: Array.from({ length: 288 }, (_, step) => ({
      instant: new Date(DEMO_NOW - (288 - step) * 300000).toISOString(),
      value: step % 37 === 0 ? null : Math.round((temperatures[i] + Math.sin(step / 24) * 2) * 10) / 10,
      publication_class: 'PUBLIC_ALLOWED', defect_01_affected: false, quality: 'OK',
    })) };
  }
  return { stations, historyProfiles, observations };
}
module.exports = { createMapDemo };
