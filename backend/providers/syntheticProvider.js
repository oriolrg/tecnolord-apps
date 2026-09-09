'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const DEFAULT_FIXTURE_DIRECTORY = path.resolve(__dirname, '../test/fixtures');
const FIXTURE_FILES = Object.freeze({
  manifest: 'manifest.json',
  meteo: 'meteo.json',
  hidro: 'hidro.json',
  forecast: 'forecast.json',
  scenarios: 'provider-scenarios.json',
});
const EXPECTED_PROVIDERS = Object.freeze(['ecowitt', 'aca', 'open-meteo']);
const EXPECTED_SCENARIOS = Object.freeze([
  'success',
  'absent',
  'zero',
  'empty',
  'timeout',
  'http_error',
  'invalid_timestamp',
  'fallback',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function modeFromEnvironment(environment) {
  return environment.METEOLORD_ENV || environment.APP_ENV || environment.NODE_ENV || 'production';
}

function assertSyntheticEnvironment(environment) {
  if (!['local', 'test'].includes(modeFromEnvironment(environment))) {
    throw new Error('Synthetic provider is forbidden outside local/test');
  }
  const providerMode = environment.METEOLORD_PROVIDER_MODE || environment.PROVIDER_MODE;
  if (providerMode !== undefined && providerMode !== 'synthetic') {
    throw new Error('Synthetic provider requires synthetic provider mode');
  }
}

function readFixture(directory, fileName) {
  const filePath = path.join(directory, fileName);
  const contents = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(contents);
  if (parsed.synthetic !== true || parsed.origin !== 'generated-for-tests') {
    throw new Error(`Fixture ${fileName} is not marked as synthetic test data`);
  }
  return {
    parsed,
    sha256: crypto.createHash('sha256').update(contents).digest('hex'),
  };
}

function assertFixtureChecksums(manifest, records) {
  for (const fileName of manifest.files || []) {
    const fixtureName = Object.keys(FIXTURE_FILES).find((name) => FIXTURE_FILES[name] === fileName);
    if (!fixtureName || !records[fixtureName]) {
      throw new Error('Synthetic fixture manifest references an unknown file');
    }
    if (manifest.sha256?.[fileName] !== records[fixtureName].sha256) {
      throw new Error(`Synthetic fixture checksum mismatch for ${fileName}`);
    }
  }
}

function assertScenarioCatalog(catalog) {
  const providers = Object.keys(catalog.providers || {}).sort();
  if (JSON.stringify(providers) !== JSON.stringify([...EXPECTED_PROVIDERS].sort())) {
    throw new Error('Synthetic provider catalog has an unexpected provider set');
  }
  for (const provider of EXPECTED_PROVIDERS) {
    const scenarios = Object.keys(catalog.providers[provider] || {}).sort();
    if (JSON.stringify(scenarios) !== JSON.stringify([...EXPECTED_SCENARIOS].sort())) {
      throw new Error(`Synthetic provider catalog is incomplete for ${provider}`);
    }
  }
}

function createSyntheticProvider({
  environment = process.env,
  fixtureDirectory = DEFAULT_FIXTURE_DIRECTORY,
} = {}) {
  assertSyntheticEnvironment(environment);

  const records = {};
  for (const [name, fileName] of Object.entries(FIXTURE_FILES)) {
    records[name] = readFixture(fixtureDirectory, fileName);
  }
  const fixtures = Object.fromEntries(
    Object.entries(records).map(([name, record]) => [name, record.parsed]),
  );
  assertFixtureChecksums(fixtures.manifest, records);
  assertScenarioCatalog(fixtures.scenarios);

  return Object.freeze({
    manifest() {
      return clone(fixtures.manifest);
    },
    fixture(name) {
      if (!['meteo', 'hidro', 'forecast'].includes(name)) {
        throw new Error('Unknown synthetic fixture');
      }
      return clone(fixtures[name]);
    },
    scenario(provider, scenarioName) {
      if (!EXPECTED_PROVIDERS.includes(provider)) {
        throw new Error('Unknown synthetic provider');
      }
      if (!EXPECTED_SCENARIOS.includes(scenarioName)) {
        throw new Error('Unknown synthetic scenario');
      }
      return clone(fixtures.scenarios.providers[provider][scenarioName]);
    },
    providers() {
      return [...EXPECTED_PROVIDERS];
    },
    scenarios() {
      return [...EXPECTED_SCENARIOS];
    },
  });
}

module.exports = {
  EXPECTED_PROVIDERS,
  EXPECTED_SCENARIOS,
  createSyntheticProvider,
};
