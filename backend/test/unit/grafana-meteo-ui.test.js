'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const SITE_DIR = path.resolve(__dirname, '../../../site');
const SERVICE_PATH = path.join(SITE_DIR, 'src/services/meteoService.js');
const SCREEN_PATH = path.join(SITE_DIR, 'src/ui/screens/meteoScreen.js');
let sequence = 0;

async function loadService(fetchDouble) {
  const source = fs.readFileSync(SERVICE_PATH, 'utf8')
    .replace(
      'import { CONFIG } from "../config.js";',
      'const CONFIG = { defaultLimit: 48, meteoEndpoint: "/api/v1/mesures/darreres" }; const fetch = globalThis.__g06Fetch;'
    );
  globalThis.__g06Fetch = fetchDouble;
  const encoded = Buffer.from(`${source}\n// g06-test-${sequence += 1}`).toString('base64');
  try {
    return await import(`data:text/javascript;base64,${encoded}`);
  } finally {
    delete globalThis.__g06Fetch;
  }
}

function response(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

test('G06 selector only requests the admin catalog when explicitly enabled and deduplicates UUIDs', async () => {
  const publicId = '11111111-1111-4111-8111-111111111111';
  const adminId = '22222222-2222-4222-8222-222222222222';
  const calls = [];
  const module = await loadService(async (url) => {
    calls.push(url);
    if (url === '/api/v1/stations') return response({ items: [{ id: publicId, name: 'Pública' }] });
    if (url === '/api/v1/me/stations') return response({ items: [{ id: publicId, name: 'Pròpia' }] });
    if (url === '/api/v1/admin/stations') return response({ items: [
      { id: publicId, name: 'Pròpia administrada' },
      { id: adminId, name: 'Estació de prova Grafana local', visibility: 'PRIVATE' },
    ] });
    if (url === '/api/v1/estimations') return response({ items: [] });
    throw new Error(`unexpected ${url}`);
  });

  const ordinary = await module.fetchStationCatalog({ includeOwn: true, includeAdmin: false });
  assert.equal(calls.includes('/api/v1/admin/stations'), false);
  assert.deepEqual(ordinary.map((item) => item.id), [publicId]);

  calls.length = 0;
  const superadmin = await module.fetchStationCatalog({ includeOwn: true, includeAdmin: true });
  assert.equal(calls.filter((url) => url === '/api/v1/admin/stations').length, 1);
  assert.equal(superadmin.length, 2);
  assert.equal(superadmin.find((item) => item.id === publicId).owned, true);
  const grafana = superadmin.find((item) => item.id === adminId);
  assert.equal(grafana.name, 'Estació de prova Grafana local');
  assert.equal(grafana.owned, false);
  assert.equal(grafana.visibility, 'PRIVATE');
  assert.equal(grafana.administrative, true);
});

test('G06 current keeps items[0] separate from empty or unrelated history and forwards AbortSignal', async () => {
  const stationId = '22222222-2222-4222-8222-222222222222';
  const controller = new AbortController();
  const calls = [];
  const module = await loadService(async (url, options) => {
    calls.push({ url, signal: options.signal });
    if (url.endsWith('/current')) return response({
      station: { id: stationId },
      items: [
        { instant: '2026-09-23T14:10:00.000Z', temp_c: 22.5, humitat_pct: null },
        { instant: '2026-09-23T14:05:00.000Z', temp_c: 99 },
      ],
      source: { freshness: 'STALE', error: null },
    });
    if (url.includes('/history?')) return response({ items: [
      { instant: '2026-09-23T13:00:00.000Z', temp_c: 17 },
    ] });
    throw new Error(`unexpected ${url}`);
  });

  const result = await module.fetchStationCurrent(stationId, 48, { signal: controller.signal });
  assert.deepEqual(result.items, [
    { instant: '2026-09-23T14:10:00.000Z', temp_c: 22.5, humitat_pct: null },
  ]);
  assert.deepEqual(result.historyItems, [
    { instant: '2026-09-23T13:00:00.000Z', temp_c: 17 },
  ]);
  assert.equal(result.source.freshness, 'STALE');
  assert.equal(calls.every((call) => call.signal === controller.signal), true);
  assert.equal(calls.some((call) => call.url.includes('/admin/grafana/')), false);
});

test('G06 screen contains request invalidation, all freshness states and no legacy Grafana endpoint', () => {
  const screen = fs.readFileSync(SCREEN_PATH, 'utf8');
  const account = fs.readFileSync(path.join(SITE_DIR, 'compte/account.js'), 'utf8');
  const accountHtml = fs.readFileSync(path.join(SITE_DIR, 'compte/index.html'), 'utf8');
  assert.match(screen, /new AbortController\(\)/);
  assert.match(screen, /revision === refreshRevision/);
  assert.match(screen, /freshness === "STALE"/);
  assert.match(screen, /freshness === "OBSOLETE"/);
  assert.match(screen, /freshness === "UNKNOWN"/);
  assert.doesNotMatch(`${screen}\n${account}\n${accountHtml}`, /\/admin\/grafana\//);
});
