const { Pool } = require('pg');

const INJECTABLE_ENVIRONMENTS = new Set(['local', 'test']);

function environmentMode(environment = process.env) {
  return environment.METEOLORD_ENV || environment.APP_ENV || environment.NODE_ENV || 'production';
}

function isInjectableEnvironment(environment = process.env) {
  return INJECTABLE_ENVIRONMENTS.has(environmentMode(environment));
}

function isSyntheticRequested(config, environment) {
  return config.synthetic === true
    || config.providerMode === 'synthetic'
    || environment.METEOLORD_PROVIDER_MODE === 'synthetic'
    || environment.PROVIDER_MODE === 'synthetic';
}

function connectionOptions(environment) {
  return {
    user: environment.POSTGRES_USER,
    password: environment.POSTGRES_PASSWORD,
    host: environment.POSTGRES_HOST || 'db',
    port: Number(environment.POSTGRES_PORT || 5432),
    database: environment.POSTGRES_DB,
  };
}

function validateInjectedPool(pool) {
  if (!pool || typeof pool.query !== 'function') {
    throw new TypeError('Injected pool must implement query()');
  }
}

function validateLocalConnection(options, mode) {
  const allowedHosts = mode === 'test' ? ['db', 'localhost', '127.0.0.1'] : ['db'];
  if (!allowedHosts.includes(options.host)) {
    throw new Error('Local/test database host is not allowed');
  }
  if (!options.user || !options.password || !options.database) {
    throw new Error('Local/test database configuration is incomplete');
  }
}

function attachSearchPath(pool) {
  pool.on('connect', (client) => {
    client.query('SET search_path TO meteo,auth,public').catch(console.error);
  });
  return pool;
}

function createPool(config = {}) {
  const environment = config.environment || process.env;
  const mode = environmentMode(environment);
  const injectable = isInjectableEnvironment(environment);
  const syntheticRequested = isSyntheticRequested(config, environment);

  if (syntheticRequested && !injectable) {
    throw new Error('Synthetic database configuration is forbidden outside local/test');
  }

  if (config.pool !== undefined) {
    if (!injectable) {
      throw new Error('Pool injection is forbidden outside local/test');
    }
    validateInjectedPool(config.pool);
    return config.pool;
  }

  const options = connectionOptions(environment);
  if (injectable) {
    validateLocalConnection(options, mode);
  }

  return attachSearchPath(new Pool(options));
}

module.exports = {
  createPool,
  environmentMode,
  isInjectableEnvironment,
};
