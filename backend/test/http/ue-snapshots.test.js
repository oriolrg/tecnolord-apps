'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { makeStationsRouter } = require('../../routes/stations');

test('UE-T07 current endpoint returns station-scoped snapshot and source state', async () => {
  const ownerToken = 'a'.repeat(43);
  const app = express();
  const station = {
    id: 12, public_id: '11111111-1111-4111-8111-111111111111', nom: 'Privada A',
    description: null, lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 2, owner_id: 7,
  };
  const identityService = {
    async current(token) { return token === ownerToken ? { user: { id: 7, role: 'USER' } } : null; },
    validCsrf() { return true; },
  };
  const stationCatalog = {
    async accessible({ actor }) { return actor?.id === 7 ? station : null; },
    async listPublic() { return []; }, async listOwn() { return []; },
  };
  const snapshotService = {
    async readCurrent(id) {
      assert.equal(id, 12);
      return {
        item: { instant: '2026-09-20T12:00:00.000Z', temp_c: 0, humitat_pct: null },
        source: { freshness: 'STALE', observed_at: '2026-09-20T12:00:00.000Z', error: 'HTTP_429' },
      };
    },
  };
  app.use(makeStationsRouter({
    pool: { query: async () => ({ rows: [] }) }, identityService, stationCatalog, snapshotService, mode: 'test',
  }));
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const denied = await fetch(`${base}/api/v1/stations/${station.public_id}/current`);
    assert.equal(denied.status, 404);
    const response = await fetch(`${base}/api/v1/stations/${station.public_id}/current`, {
      headers: { cookie: `ml_session=${ownerToken}` },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      station: {
        id: station.public_id, name: 'Privada A', description: null,
        lifecycle: 'ACTIVE', visibility: 'PRIVATE', revision: 2, can_edit: false,
      },
      items: [{ instant: '2026-09-20T12:00:00.000Z', temp_c: 0, humitat_pct: null }],
      source: { freshness: 'STALE', observed_at: '2026-09-20T12:00:00.000Z', error: 'HTTP_429' },
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
