'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  EXPECTED_PROVIDERS,
  EXPECTED_SCENARIOS,
  createSyntheticProvider,
} = require('../../providers/syntheticProvider');
const { DEFAULT_FIXED_NOW, createFixedClock } = require('../helpers/clock');
const { createFetchDouble } = require('../helpers/fetchDouble');
const { makeEcowittService } = require('../../services/ecowittService');
const { makeAcaService } = require('../../services/acaService');
const { makePreviService } = require('../../services/previService');

const FIXTURE_DIRECTORY = path.resolve(__dirname, '../fixtures');
const TEST_ENVIRONMENT = Object.freeze({
  METEOLORD_ENV: 'test',
  METEOLORD_PROVIDER_MODE: 'synthetic',
});

function containsZero(value) {
  if (value === 0 || value === '0') return true;
  if (Array.isArray(value)) return value.some(containsZero);
  if (value && typeof value === 'object') return Object.values(value).some(containsZero);
  return false;
}

function assertEmptyPayload(provider, body) {
  if (provider === 'ecowitt') {
    assert.deepEqual(body.data, {});
  } else if (provider === 'aca') {
    assert.deepEqual(body, []);
  } else {
    assert.deepEqual(body.hourly.time, []);
  }
}

function createScenarioTransport(providerName, scenarioName) {
  const provider = createSyntheticProvider({ environment: TEST_ENVIRONMENT });
  const scenario = provider.scenario(providerName, scenarioName);
  const double = createFetchDouble({
    environment: TEST_ENVIRONMENT,
    routes: scenario.routes,
  });
  const requestedUrls = [];
  let routeIndex = 0;

  const transport = async (input, init) => {
    requestedUrls.push(String(input));
    const route = scenario.routes[Math.min(routeIndex, scenario.routes.length - 1)];
    routeIndex += 1;
    return double(route.url, init);
  };
  transport.requestedUrls = () => [...requestedUrls];
  transport.syntheticCalls = double.calls;
  return { scenario, transport };
}

async function withEnvironment(values, callback) {
  const saved = new Map();
  for (const [name, value] of Object.entries(values)) {
    saved.set(name, process.env[name]);
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  try {
    return await callback();
  } finally {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

function ecowittEnvironment({ fallback = false } = {}) {
  return {
    METEOLORD_ENV: 'test',
    ECW_APPLICATION_KEY: 'synthetic-primary-application',
    ECW_API_KEY: 'synthetic-primary-api',
    ECW_MAC: 'synthetic-primary-device',
    ECW_FB_APPLICATION_KEY: fallback ? 'synthetic-fallback-application' : undefined,
    ECW_FB_API_KEY: fallback ? 'synthetic-fallback-api' : undefined,
    ECW_FB_MAC: fallback ? 'synthetic-fallback-device' : undefined,
    ECW_TIMEOUT_MS: '50',
    ADMIN_EMAIL: 'synthetic-admin@example.invalid',
    ESTACIO_CODI: 'synthetic-meteo-01',
    ESTACIO_NOM: 'Meteo Synthetic 01',
  };
}

function acaEnvironment() {
  return {
    METEOLORD_ENV: 'test',
    ACA_CODI_CARDENER: 'SYN-RIVER-01',
    ACA_NOM_CARDENER: 'Synthetic River 01',
    ACA_CODI_VALLS: 'SYN-RIVER-02',
    ACA_NOM_VALLS: 'Synthetic River 02',
    ACA_CODI_LLOSA: 'SYN-RES-01',
    ACA_NOM_LLOSA: 'Synthetic Reservoir 01',
    ACA_CODI_LLOSA_CABAL: 'SYN-RES-FLOW-01',
    ACA_CODI_LLOSA_CAPACITAT: 'SYN-RES-CAP-01',
  };
}

function forecastEnvironment() {
  return {
    METEOLORD_ENV: 'test',
    PREVI_LAT: '12.3456',
    PREVI_LON: '-45.6789',
    PREVI_HOURS: '48',
    PREVI_SOURCE: 'open-meteo',
    PREVI_MODEL: 'best_match',
    PREVI_STATION_CODE: 'synthetic-meteo-01',
  };
}

function createQueryPool() {
  const calls = [];
  return {
    calls,
    pool: {
      async query(sql, params) {
        calls.push({ sql, params });
        return { rows: [{ id: 7001 }] };
      },
    },
  };
}

function createForecastPool() {
  const calls = [];
  const client = {
    async query(sql, params) {
      calls.push({ sql, params });
      if (/INSERT INTO forecast_run/.test(sql)) return { rows: [{ id: 8001 }] };
      return { rows: [] };
    },
    release() {
      calls.push({ sql: 'RELEASE', params: undefined });
    },
  };
  return {
    calls,
    pool: {
      async connect() {
        calls.push({ sql: 'CONNECT', params: undefined });
        return client;
      },
      async query() {
        return { rows: [] };
      },
    },
  };
}

function syntheticResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return JSON.parse(JSON.stringify(body)); },
    async text() { return JSON.stringify(body); },
  };
}

test('fixed clock starts at the manifest instant and advances deterministically', () => {
  const clock = createFixedClock();
  assert.equal(DEFAULT_FIXED_NOW, '2030-01-15T12:00:00.000Z');
  assert.equal(clock.nowIso(), DEFAULT_FIXED_NOW);
  const returned = clock.advance(90_000);
  assert.equal(returned.toISOString(), '2030-01-15T12:01:30.000Z');
  assert.equal(clock.now().toISOString(), '2030-01-15T12:01:30.000Z');
  returned.setUTCFullYear(2040);
  assert.equal(clock.nowIso(), '2030-01-15T12:01:30.000Z');
});

test('fixed clock rejects non-canonical instants and invalid advances', () => {
  assert.throws(() => createFixedClock('2030-01-15T12:00:00Z'), /canonical ISO-8601/);
  const clock = createFixedClock();
  assert.throws(() => clock.advance(-1), /non-negative safe integer/);
  assert.throws(() => clock.advance(1.5), /non-negative safe integer/);
});

test('synthetic provider rejects production before reading fixtures', () => {
  assert.throws(
    () => createSyntheticProvider({
      environment: { METEOLORD_ENV: 'production' },
      fixtureDirectory: '/fixture-path-must-not-be-read',
    }),
    /forbidden outside local\/test/
  );
});

test('synthetic provider exposes the exact deterministic catalog', () => {
  const provider = createSyntheticProvider({ environment: TEST_ENVIRONMENT });
  assert.deepEqual(provider.providers(), ['ecowitt', 'aca', 'open-meteo']);
  assert.deepEqual(provider.scenarios(), [
    'success',
    'absent',
    'zero',
    'empty',
    'timeout',
    'http_error',
    'invalid_timestamp',
    'fallback',
  ]);

  const manifest = provider.manifest();
  assert.equal(manifest.synthetic, true);
  assert.equal(manifest.origin, 'generated-for-tests');
  assert.equal(manifest.fixed_now_utc, DEFAULT_FIXED_NOW);

  for (const name of ['meteo', 'hidro', 'forecast']) {
    const first = provider.fixture(name);
    const second = provider.fixture(name);
    assert.deepEqual(first, second);
    first.synthetic = false;
    assert.equal(provider.fixture(name).synthetic, true);
  }
});

test('fixtures contain required synthetic temporal and missing-value cases', () => {
  const provider = createSyntheticProvider({ environment: TEST_ENVIRONMENT });
  const meteo = provider.fixture('meteo');
  const hidro = provider.fixture('hidro');
  const forecast = provider.fixture('forecast');
  const observations = meteo.estacions.flatMap((station) => station.observacions);

  assert.ok(observations.some((observation) => observation.cas === 'recent'));
  assert.ok(observations.some((observation) => observation.cas === 'historic'));
  assert.ok(observations.some((observation) => observation.cas === 'absent'));
  assert.ok(observations.some((observation) => observation.cas === 'zero' && containsZero(observation)));
  assert.ok(hidro.estacions.some((station) => station.codi.startsWith('SYN-')));
  assert.ok(hidro.estacions.flatMap((station) => station.lectures).some(containsZero));
  assert.ok(forecast.runs[0].hourly.length >= 4);
  assert.ok(forecast.runs[0].hourly.some(containsZero));
});

test('all registered provider URLs use reserved invalid hostnames', () => {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(FIXTURE_DIRECTORY, 'provider-scenarios.json'), 'utf8')
  );
  for (const provider of EXPECTED_PROVIDERS) {
    for (const scenario of EXPECTED_SCENARIOS) {
      for (const route of catalog.providers[provider][scenario].routes) {
        const parsed = new URL(route.url);
        assert.equal(parsed.protocol, 'https:');
        assert.ok(parsed.hostname.endsWith('.invalid'));
      }
    }
  }
});

test('fetch double is forbidden in production', () => {
  assert.throws(
    () => createFetchDouble({
      environment: { METEOLORD_ENV: 'production' },
      routes: [{
        url: 'https://blocked.synthetic.test.invalid/value',
        outcome: 'json',
        status: 200,
        body: {},
      }],
    }),
    /forbidden outside local\/test/
  );
});

test('fetch double rejects an unregistered URL without recording a request', async () => {
  const httpClient = createFetchDouble({
    environment: TEST_ENVIRONMENT,
    routes: [{
      url: 'https://registered.synthetic.test.invalid/value',
      outcome: 'json',
      status: 200,
      body: { synthetic: true },
    }],
  });

  await assert.rejects(
    () => httpClient('https://unregistered.synthetic.test.invalid/blocked'),
    /blocked an unregistered URL/
  );
  assert.deepEqual(httpClient.calls(), []);
});

for (const providerName of EXPECTED_PROVIDERS) {
  for (const scenarioName of EXPECTED_SCENARIOS) {
    test(`${providerName} supports deterministic ${scenarioName}`, async () => {
      const provider = createSyntheticProvider({ environment: TEST_ENVIRONMENT });
      const scenario = provider.scenario(providerName, scenarioName);
      const httpClient = createFetchDouble({
        environment: TEST_ENVIRONMENT,
        routes: scenario.routes,
      });

      if (scenarioName === 'timeout') {
        await assert.rejects(
          () => httpClient(scenario.routes[0].url),
          { name: 'AbortError', message: 'Synthetic fetch timeout' }
        );
        assert.equal(httpClient.calls().length, 1);
        return;
      }

      const responses = [];
      const bodies = [];
      for (const route of scenario.routes) {
        const response = await httpClient(route.url);
        responses.push(response);
        bodies.push(await response.json());
      }

      assert.deepEqual(
        httpClient.calls().map((call) => call.url),
        scenario.routes.map((route) => route.url)
      );

      if (scenarioName === 'success') {
        assert.ok(responses.every((response) => response.ok));
      } else if (scenarioName === 'absent') {
        assert.equal(bodies[0], null);
      } else if (scenarioName === 'zero') {
        assert.ok(containsZero(bodies[0]));
      } else if (scenarioName === 'empty') {
        assertEmptyPayload(providerName, bodies[0]);
      } else if (scenarioName === 'http_error') {
        assert.equal(responses[0].ok, false);
        assert.ok(responses[0].status >= 400);
      } else if (scenarioName === 'invalid_timestamp') {
        assert.match(JSON.stringify(bodies[0]), /not-a-timestamp/);
      } else if (scenarioName === 'fallback') {
        assert.equal(responses.length, 2);
        assert.equal(responses[0].ok, false);
        assert.equal(responses[1].ok, true);
      }
    });
  }
}

for (const scenarioName of EXPECTED_SCENARIOS) {
  const label = scenarioName === 'zero' ? 'zero (DEFECT-01 fixed)' : scenarioName;

  test(`Ecowitt service preserves ${label}`, async () => {
    await withEnvironment(
      ecowittEnvironment({ fallback: scenarioName === 'fallback' }),
      async () => {
        const { transport } = createScenarioTransport('ecowitt', scenarioName);
        const { pool, calls } = createQueryPool();
        const service = makeEcowittService({
          pool,
          fetch: transport,
          clock: createFixedClock(),
          assegurarUsuariAdmin: async () => 101,
          assegurarEstacio: async () => 201,
          assegurarMembreEstacio: async () => {},
        });
        const result = await service.pullEcowittAndSave();

        assert.equal(transport.requestedUrls().length, scenarioName === 'fallback' ? 2 : 1);
        assert.equal(transport.syntheticCalls().length, scenarioName === 'fallback' ? 2 : 1);

        if (scenarioName === 'success') {
          assert.equal(result.skipped, false);
          assert.equal(result.source, 'ECW');
          assert.equal(calls.length, 1);
          assert.equal(calls[0].params[2], 18.5);
          assert.equal(calls[0].params[15], 3.5);
        } else if (scenarioName === 'zero') {
          assert.equal(result.skipped, false);
          assert.equal(calls.length, 1);
          assert.equal(calls[0].params[2], 0, 'temperature zero must remain zero');
          assert.equal(calls[0].params[8], 0, 'rain-rate zero must remain zero');
          assert.equal(calls[0].params[15], 0, 'wind zero must remain zero');
          assert.equal(calls[0].params[5], 0, 'integer humidity zero remains zero');
          assert.equal(calls[0].params[17], 0, 'integer direction zero remains zero');
        } else if (scenarioName === 'invalid_timestamp') {
          assert.equal(result.skipped, false);
          assert.equal(result.instant, DEFAULT_FIXED_NOW);
          assert.equal(calls[0].params[1], DEFAULT_FIXED_NOW);
        } else if (scenarioName === 'fallback') {
          assert.equal(result.skipped, false);
          assert.equal(result.source, 'ECW_FB');
          assert.equal(calls[0].params[2], 17.9);
        } else {
          assert.equal(result.skipped, true);
          assert.equal(calls.length, 0);
          if (scenarioName === 'empty') assert.equal(result.reason, 'empty_data');
          if (scenarioName === 'http_error') assert.equal(result.reason, 'http_503');
          if (scenarioName === 'timeout') assert.equal(result.reason, 'fetch_error_timeout');
        }
      }
    );
  });
}

for (const scenarioName of EXPECTED_SCENARIOS) {
  test(`ACA service preserves ${scenarioName}`, async () => {
    await withEnvironment(acaEnvironment(), async () => {
      const { transport } = createScenarioTransport('aca', scenarioName);
      const { pool, calls } = createQueryPool();
      let nextStationId = 300;
      const service = makeAcaService({
        pool,
        fetch: transport,
        clock: createFixedClock(),
        assegurarHidro: async () => {
          nextStationId += 1;
          return nextStationId;
        },
      });

      if (scenarioName === 'timeout') {
        await assert.rejects(() => service.pullACAAndSave(), { name: 'AbortError' });
      } else if (scenarioName === 'http_error' || scenarioName === 'fallback') {
        await assert.rejects(() => service.pullACAAndSave(), /aca rivers status/);
      } else if (scenarioName === 'invalid_timestamp') {
        await assert.rejects(() => service.pullACAAndSave(), /Invalid time value/);
      } else {
        const result = await service.pullACAAndSave();
        assert.equal(result.ok, true);
        if (scenarioName === 'success') {
          assert.equal(result.inserts.length, 2);
          assert.deepEqual(result.inserts.map((item) => item.codi), [
            'SYN-RIVER-01',
            'SYN-RES-01',
          ]);
        } else if (scenarioName === 'zero') {
          assert.equal(result.inserts.length, 1);
          assert.equal(result.inserts[0].cabal_m3s, 0);
          assert.equal(calls[0].params[2], 0);
        } else {
          assert.deepEqual(result.inserts, []);
        }
      }

      assert.equal(transport.requestedUrls().length, 2);
      assert.equal(transport.syntheticCalls().length, 2);
    });
  });
}

test('ACA service uses the injected fixed clock when provider timestamps are absent', async () => {
  await withEnvironment(acaEnvironment(), async () => {
    const routes = [
      {
        url: 'https://aca.synthetic.test.invalid/rivers/fixed-clock',
        outcome: 'json',
        status: 200,
        body: [{ siteCode: 'SYN-RIVER-01', popup: { river_flow: { value: '2.75' } } }],
      },
      {
        url: 'https://aca.synthetic.test.invalid/reservoirs/fixed-clock',
        outcome: 'json',
        status: 200,
        body: [],
      },
    ];
    const double = createFetchDouble({ environment: TEST_ENVIRONMENT, routes });
    let index = 0;
    const transport = (_url, init) => double(routes[index++].url, init);
    const { pool, calls } = createQueryPool();
    const service = makeAcaService({
      pool,
      fetch: transport,
      clock: createFixedClock(),
      assegurarHidro: async () => 301,
    });

    const result = await service.pullACAAndSave();
    assert.equal(result.inserts[0].ts, DEFAULT_FIXED_NOW);
    assert.equal(calls[0].params[1], DEFAULT_FIXED_NOW);
  });
});

for (const scenarioName of EXPECTED_SCENARIOS) {
  test(`Open-Meteo service preserves ${scenarioName}`, async () => {
    await withEnvironment(forecastEnvironment(), async () => {
      const { transport } = createScenarioTransport('open-meteo', scenarioName);
      const { pool, calls } = createForecastPool();
      const service = makePreviService({
        pool,
        fetch: transport,
        clock: createFixedClock(),
      });

      if (scenarioName === 'timeout') {
        await assert.rejects(() => service.pullPreviAndSave(), { name: 'AbortError' });
      } else if (scenarioName === 'http_error' || scenarioName === 'fallback') {
        await assert.rejects(() => service.pullPreviAndSave(), /previ status 503/);
      } else if (scenarioName === 'absent' || scenarioName === 'empty') {
        await assert.rejects(() => service.pullPreviAndSave(), /missing hourly\.time/);
      } else if (scenarioName === 'invalid_timestamp') {
        await assert.rejects(() => service.pullPreviAndSave(), /Invalid time value/);
      } else {
        const result = await service.pullPreviAndSave();
        assert.equal(result.ok, true);
        assert.equal(result.issued_at, DEFAULT_FIXED_NOW);
        const hourlyInsert = calls.find((call) => /INSERT INTO forecast_hourly/.test(call.sql));
        assert.ok(hourlyInsert);
        if (scenarioName === 'success') {
          assert.equal(result.points, 2);
          assert.deepEqual(hourlyInsert.params[2], [18, 18.4]);
        } else {
          assert.equal(result.points, 1);
          assert.deepEqual(hourlyInsert.params.slice(2), [[0], [0], [0], [0], [0]]);
        }
      }

      assert.equal(transport.requestedUrls().length, 1);
      assert.equal(transport.syntheticCalls().length, 1);
    });
  });
}

test('services use global fetch and a real clock when no doubles are injected', async () => {
  const originalFetch = globalThis.fetch;
  const requestedUrls = [];
  globalThis.fetch = async (url) => {
    requestedUrls.push(String(url));
    if (String(url).includes('ecowitt')) {
      return syntheticResponse({
        code: 0,
        time: 'not-a-timestamp',
        data: { outdoor: { temperature: { value: '18.5' } } },
      });
    }
    if (String(url).includes('river_flow')) {
      return syntheticResponse([
        { siteCode: 'SYN-RIVER-01', popup: { river_flow: { value: '2.75' } } },
      ]);
    }
    if (String(url).includes('capacity')) return syntheticResponse([]);
    return syntheticResponse({
      hourly: {
        time: ['2030-01-15T12:00:00.000Z'],
        temperature_2m: [18],
        relative_humidity_2m: [52],
        precipitation: [0.3],
        wind_speed_10m: [3.1],
        wind_direction_10m: [205],
      },
    });
  };

  try {
    await withEnvironment({
      ...ecowittEnvironment(),
      ...acaEnvironment(),
      ...forecastEnvironment(),
      METEOLORD_ENV: 'production',
    }, async () => {
      const startedAt = Date.now();
      const ecowittPool = createQueryPool();
      const ecowitt = makeEcowittService({
        pool: ecowittPool.pool,
        assegurarUsuariAdmin: async () => 101,
        assegurarEstacio: async () => 201,
        assegurarMembreEstacio: async () => {},
      });
      const ecowittResult = await ecowitt.pullEcowittAndSave();

      const acaPool = createQueryPool();
      const aca = makeAcaService({
        pool: acaPool.pool,
        assegurarHidro: async () => 301,
      });
      const acaResult = await aca.pullACAAndSave();

      const forecastPool = createForecastPool();
      const forecast = makePreviService({ pool: forecastPool.pool });
      const forecastResult = await forecast.pullPreviAndSave();
      const finishedAt = Date.now();

      const ecowittInstant = Date.parse(ecowittResult.instant);
      const acaInstant = Date.parse(acaResult.inserts[0].ts);
      const forecastInstant = Date.parse(forecastResult.issued_at);
      for (const instant of [ecowittInstant, acaInstant, forecastInstant]) {
        assert.ok(instant >= startedAt && instant <= finishedAt);
      }
      assert.equal(requestedUrls.length, 4);
      assert.ok(requestedUrls.some((url) => url.includes('api.ecowitt.net')));
      assert.ok(requestedUrls.some((url) => url.includes('aplicacions.aca.gencat.cat')));
      assert.ok(requestedUrls.some((url) => url.includes('api.open-meteo.com')));
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
