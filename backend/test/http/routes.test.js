'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { createApp, redactRequestUrl } = require('../../server');
const { DEFAULT_DB_TIMEOUT_MS, checkDatabase } = require('../../routes/health');
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

function createRoutePool({ healthCheck } = {}) {
  return {
    async query(query) {
      const sql = typeof query === 'string' ? query : query?.text;
      if (/^\s*SELECT 1\s*$/i.test(sql)) {
        return healthCheck ? healthCheck() : { rows: [{ ok: 1 }] };
      }
      if (/FROM meteo\.mesures/.test(sql)) return { rows: [{ ...METEO_ROW }] };
      if (/FROM meteo\.lectures_hidro/.test(sql)) return { rows: [{ ...HIDRO_ROW }] };
      return { rows: [{ ok: 1 }] };
    },
  };
}

async function withServer(callback, { pool = createRoutePool() } = {}) {
  const accessLogs = [];
  const app = createApp({
    environment: { METEOLORD_ENV: 'test' },
    pool,
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

test('/api/ping returns 200 without querying an unavailable database', async () => {
  let queryCount = 0;
  const unavailablePool = {
    async query() {
      queryCount += 1;
      throw new Error('private database failure details');
    },
  };
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ping`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(queryCount, 0);
  }, { pool: unavailablePool });
});

test('/health returns 200 when the database is ready', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });
});

test('/health returns sanitized 503 when the database is unavailable', async () => {
  const privateDetail = 'connect ECONNREFUSED 198.51.100.20:5432';
  const pool = createRoutePool({
    healthCheck: async () => { throw new Error(privateDetail); },
  });
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const text = await response.text();
    assert.equal(response.status, 503);
    assert.deepEqual(JSON.parse(text), { ok: false, code: 'DB_UNAVAILABLE' });
    assert.ok(!text.includes(privateDetail));
    assert.ok(!text.includes('ECONNREFUSED'));
  }, { pool });
});

test('/health automatically returns to 200 after database recovery', async () => {
  let available = false;
  const pool = createRoutePool({
    healthCheck: async () => {
      if (!available) throw new Error('temporary database outage');
      return { rows: [{ ok: 1 }] };
    },
  });
  await withServer(async (baseUrl) => {
    const unavailable = await fetch(`${baseUrl}/health`);
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { ok: false, code: 'DB_UNAVAILABLE' });

    available = true;
    const recovered = await fetch(`${baseUrl}/health`);
    assert.equal(recovered.status, 200);
    assert.deepEqual(await recovered.json(), { ok: true });
  }, { pool });
});

test('/health returns sanitized 503 when the database query exceeds two seconds', async () => {
  const pool = createRoutePool({
    healthCheck: () => new Promise(() => {}),
  });
  await withServer(async (baseUrl) => {
    const startedAt = Date.now();
    const response = await fetch(`${baseUrl}/health`);
    const elapsedMs = Date.now() - startedAt;
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, code: 'DB_UNAVAILABLE' });
    assert.ok(elapsedMs >= 1900, `health timeout returned too early (${elapsedMs} ms)`);
    assert.ok(elapsedMs < 3500, `health timeout returned too late (${elapsedMs} ms)`);
  }, { pool });
});

test('database readiness has a two-second default and enforces its deadline', async () => {
  assert.equal(DEFAULT_DB_TIMEOUT_MS, 2000);
  let receivedQuery;
  await checkDatabase({
    async query(query) {
      receivedQuery = query;
      return { rows: [{ ok: 1 }] };
    },
  });
  assert.deepEqual(receivedQuery, { text: 'SELECT 1', query_timeout: 2000 });

  const neverSettles = { query: () => new Promise(() => {}) };
  await assert.rejects(
    checkDatabase(neverSettles, { timeoutMs: 20 }),
    /timed out/
  );
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
