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
