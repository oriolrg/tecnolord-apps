'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { createApp, redactRequestUrl } = require('../../server');
const { createFixedClock } = require('../helpers/clock');

const METEO_ROW = Object.freeze({
  id: 1,
  instant: '2030-01-15T11:55:00.000Z',
  temp_c: 18.5,
});
const HIDRO_ROW = Object.freeze({
  id: 1,
  instant: '2030-01-15T11:54:00.000Z',
  codi: 'SYN-RIVER-01',
  nom: 'Synthetic River 01',
  tipus: 'riu',
  cabal_m3s: 2.75,
});

function createRoutePool() {
  return {
    async query(sql) {
      if (/FROM meteo\.mesures/.test(sql)) return { rows: [{ ...METEO_ROW }] };
      if (/FROM meteo\.lectures_hidro/.test(sql)) return { rows: [{ ...HIDRO_ROW }] };
      return { rows: [{ ok: 1 }] };
    },
  };
}

async function withServer(callback) {
  const accessLogs = [];
  const app = createApp({
    environment: { METEOLORD_ENV: 'test' },
    pool: createRoutePool(),
    httpClient: async () => {
      throw new Error('HTTP route test must not contact a provider');
    },
    clock: createFixedClock(),
    accessLogStream: { write: (line) => accessLogs.push(line) },
  });
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  const address = server.address();
  try {
    await callback(`http://127.0.0.1:${address.port}`, accessLogs);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test('/api/ping preserves its exact response contract', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ping`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, msg: 'pong' });
  });
});

test('/health reports a live process and reachable database', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.db, 'ok');
    assert.ok(Number.isFinite(Date.parse(body.time)));
  });
});

test('/api/v1/mesures/darreres returns the existing body contract', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/mesures/darreres?limit=10`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, items: [{ ...METEO_ROW }] });
  });
});

test('/api/v1/hidro/darreres returns the existing body contract', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/hidro/darreres?limit=10`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, items: [{ ...HIDRO_ROW }] });
  });
});

test('access-log redaction preserves query-key auth compatibility without logging the key', () => {
  const redacted = redactRequestUrl('/api/tasks/run/aca?key=local-synthetic-secret&other=1');
  assert.ok(redacted.includes('key=%5BREDACTED%5D'));
  assert.ok(redacted.includes('other=1'));
  assert.ok(!redacted.includes('local-synthetic-secret'));
});
