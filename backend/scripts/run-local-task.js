#!/usr/bin/env node
'use strict';

const { createRuntime } = require('../server');
const { TASK_NAMES } = require('../routes/tasks');
const { createSyntheticProvider } = require('../providers/syntheticProvider');
const { createFixedClock } = require('../test/helpers/clock');
const { createFetchDouble } = require('../test/helpers/fetchDouble');

const PROVIDER_BY_HOST = Object.freeze({
  'api.ecowitt.net': 'ecowitt',
  'aplicacions.aca.gencat.cat': 'aca',
  'api.open-meteo.com': 'open-meteo',
});
const SYNTHETIC_SERVICE_CONFIGURATION = Object.freeze({
  METEOLORD_PROVIDER_MODE: 'synthetic',
  ECW_APPLICATION_KEY: 'synthetic-local-application',
  ECW_API_KEY: 'synthetic-local-api',
  ECW_MAC: 'synthetic-local-device',
  ECW_FB_APPLICATION_KEY: 'synthetic-local-fallback-application',
  ECW_FB_API_KEY: 'synthetic-local-fallback-api',
  ECW_FB_MAC: 'synthetic-local-fallback-device',
  ADMIN_EMAIL: 'synthetic-admin@example.invalid',
  ESTACIO_CODI: 'synthetic-meteo-01',
  ESTACIO_NOM: 'Meteo Synthetic 01',
  ACA_CODI_CARDENER: 'SYN-RIVER-01',
  ACA_NOM_CARDENER: 'Synthetic River 01',
  ACA_CODI_VALLS: 'SYN-RIVER-02',
  ACA_NOM_VALLS: 'Synthetic River 02',
  ACA_CODI_LLOSA: 'SYN-RES-01',
  ACA_NOM_LLOSA: 'Synthetic Reservoir 01',
  ACA_CODI_LLOSA_CABAL: 'SYN-RES-FLOW-01',
  ACA_CODI_LLOSA_CAPACITAT: 'SYN-RES-CAP-01',
  PREVI_LAT: '12.3456',
  PREVI_LON: '-45.6789',
  PREVI_HOURS: '48',
  PREVI_SOURCE: 'open-meteo',
  PREVI_MODEL: 'best_match',
  PREVI_STATION_CODE: 'synthetic-meteo-01',
});

class SafeLocalTaskError extends Error {
  constructor(message, exitCode = 64) {
    super(message);
    this.exitCode = exitCode;
  }
}

function loadOptions(argv = process.argv.slice(2), environment = process.env) {
  if (argv.length !== 1 || !TASK_NAMES.includes(argv[0])) {
    throw new SafeLocalTaskError(`Task must be one of: ${TASK_NAMES.join(', ')}`);
  }
  const mode = environment.METEOLORD_ENV;
  if (!['local', 'test'].includes(mode)) {
    throw new SafeLocalTaskError('METEOLORD_ENV must be local or test');
  }
  if (environment.METEOLORD_ALLOW_SYNTHETIC !== 'true') {
    throw new SafeLocalTaskError('METEOLORD_ALLOW_SYNTHETIC must be true');
  }
  const scenario = environment.METEOLORD_TASK_SCENARIO || 'success';
  return Object.freeze({ taskName: argv[0], scenario });
}

function applySyntheticServiceConfiguration(environment = process.env) {
  for (const [name, value] of Object.entries(SYNTHETIC_SERVICE_CONFIGURATION)) {
    environment[name] = value;
  }
  return environment;
}

function createLocalTransport({ environment = process.env, scenario = 'success' } = {}) {
  const provider = createSyntheticProvider({ environment });
  if (!provider.scenarios().includes(scenario)) {
    throw new SafeLocalTaskError('Unknown synthetic provider scenario');
  }

  const transports = {};
  for (const providerName of provider.providers()) {
    const providerScenario = provider.scenario(providerName, scenario);
    const fetchDouble = createFetchDouble({
      environment,
      routes: providerScenario.routes,
    });
    transports[providerName] = {
      fetchDouble,
      routes: providerScenario.routes,
      nextRoute: 0,
    };
  }

  const requestedHosts = [];
  const transport = async (input, init) => {
    const parsed = new URL(typeof input === 'string' ? input : input?.url);
    const providerName = PROVIDER_BY_HOST[parsed.hostname];
    if (!providerName) throw new SafeLocalTaskError('Local transport blocked an unknown provider host');

    const selected = transports[providerName];
    const route = selected.routes[selected.nextRoute % selected.routes.length];
    selected.nextRoute += 1;
    requestedHosts.push(parsed.hostname);
    return selected.fetchDouble(route.url, init);
  };
  transport.requestedHosts = () => [...requestedHosts];
  return transport;
}

async function main({
  argv = process.argv.slice(2),
  environment = process.env,
  output = process.stdout,
} = {}) {
  const options = loadOptions(argv, environment);
  applySyntheticServiceConfiguration(environment);
  const httpClient = createLocalTransport({ environment, scenario: options.scenario });
  const runtime = createRuntime({
    environment,
    httpClient,
    clock: createFixedClock(),
  });

  try {
    const result = await runtime.taskRunner(options.taskName);
    output.write(`${JSON.stringify(result)}\n`);
    return result;
  } finally {
    if (runtime.pool && typeof runtime.pool.end === 'function') await runtime.pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    const isSafe = error instanceof SafeLocalTaskError;
    console.error(`[local-task] ERROR: ${isSafe ? error.message : 'task execution failed'}`);
    process.exitCode = isSafe ? error.exitCode : 1;
  });
}

module.exports = {
  SafeLocalTaskError,
  applySyntheticServiceConfiguration,
  createLocalTransport,
  loadOptions,
  main,
};
