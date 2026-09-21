'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ADMIN_PROVENANCE, ADMIN_SOURCES, makeAdminCatalogService, managedDto, normalizeManagedStation,
} = require('../../services/adminCatalogService');

const ID = '11111111-1111-4111-8111-111111111111';
const VALID = Object.freeze({
  name: 'Estació administrada', description: 'Font externa verificada',
  source_namespace: 'GRAFANA', external_id: 'Meteo-001-3100044',
  longitude: 1.5521, latitude: 42.1372, accuracy_m: 25,
  provenance: 'ADMIN_VERIFIED', reference_label: 'inventari-2026', revision: 0,
});

test('UE-T11 validates explicit source, provenance, lon/lat order and accuracy', () => {
  assert.deepEqual(ADMIN_SOURCES, ['METEOLORD', 'GRAFANA']);
  assert.deepEqual(ADMIN_PROVENANCE, ['ADMIN_VERIFIED', 'FIELD_SURVEY', 'SOURCE_DOCUMENT']);
  assert.deepEqual(normalizeManagedStation(VALID, { requireRevision: true }), VALID);
  for (const patch of [
    { source_namespace: 'https://evil.invalid' }, { provenance: 'UNKNOWN' },
    { longitude: 181 }, { latitude: 91 }, { longitude: Number.NaN },
    { accuracy_m: -1 }, { accuracy_m: 1.5 }, { revision: -1 },
  ]) {
    assert.equal(normalizeManagedStation({ ...VALID, ...patch }, { requireRevision: true }), null);
  }
});

test('UE-T11 admin DTO exposes exact catalog metadata but no internal keys', () => {
  assert.deepEqual(managedDto({
    id: 9, public_id: ID, nom: 'Administrada', description: null, lifecycle: 'ACTIVE',
    visibility: 'PRIVATE', revision: 2, source_namespace: 'GRAFANA', external_id: 'station-7',
    binding_status: 'VALIDATED', private_longitude: '1.5', private_latitude: '42.1',
    accuracy_m: 10, provenance: 'FIELD_SURVEY', reference_label: 'acta-7',
    publication_mode: 'HIDDEN', verified_at: new Date('2026-09-20T10:00:00Z'),
    override_fields: ['latitude', 'longitude'], secret: 'absent',
  }), {
    id: ID, name: 'Administrada', description: null, lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 2,
    source: { namespace: 'GRAFANA', external_id: 'station-7', status: 'VALIDATED' },
    location: {
      longitude: 1.5, latitude: 42.1, accuracy_m: 10, provenance: 'FIELD_SURVEY',
      reference_label: 'acta-7', publication_mode: 'HIDDEN', verified_at: '2026-09-20T10:00:00.000Z',
    },
    override_fields: ['latitude', 'longitude'],
  });
});

test('UE-T11 rejects malformed creates before opening a transaction', async () => {
  let connections = 0;
  const service = makeAdminCatalogService({
    pool: { query() {}, async connect() { connections += 1; throw new Error('must not connect'); } },
  });
  assert.deepEqual(await service.create(1, { ...VALID, source_namespace: 'URL' }), { invalid: true });
  assert.equal(connections, 0);
});

test('UE-T11 update query can mutate only ownerless ADMIN stations', async () => {
  const queries = [];
  const client = {
    async query(sql, values) {
      const normalized = sql.replace(/\s+/g, ' ').trim(); queries.push([normalized, values]);
      if (sql === 'BEGIN' || sql === 'ROLLBACK') return { rowCount: 0, rows: [] };
      if (normalized.includes('FOR UPDATE OF e,b,l')) return { rowCount: 0, rows: [] };
      throw new Error(`unexpected query: ${normalized}`);
    },
    release() {},
  };
  const service = makeAdminCatalogService({ pool: { query() {}, async connect() { return client; } } });
  assert.deepEqual(await service.update(1, ID, VALID), { notFound: true });
  const lock = queries.find(([sql]) => sql.includes('FOR UPDATE OF e,b,l'))[0];
  assert.match(lock, /management_kind='ADMIN'/);
  assert.match(lock, /owner_id IS NULL/);
  assert.match(lock, /lifecycle<>'RETIRED'/);
});
