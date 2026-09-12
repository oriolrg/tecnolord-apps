const { Pool } = require('pg');
const { NULL_LOGGER, isLogger } = require('../lib/logger');

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

function attachSearchPath(pool, logger) {
  pool.on('connect', (client) => {
    client.query('SET search_path TO meteo,auth,public').catch(() => {
      logger.error('database.search_path', {
        result: 'error',
        error_code: 'DB_SESSION_INIT_FAILED',
      });
    });
  });
  return pool;
}

function attachPoolErrorHandler(pool, logger) {
  // Plain injected test doubles may not expose EventEmitter semantics. Real pg
  // pools (including injected pg pools) always do, so guard the optional API.
  if (typeof pool.on === 'function') {
    pool.on('error', (error) => {
      logger.warn('pool_client_error', {
        result: 'connection_lost',
        error_code: error && error.code ? error.code : 'DB_POOL_CLIENT_ERROR',
      });
    });
  }
  return pool;
}

function createPool(config = {}) {
  const environment = config.environment || process.env;
  const logger = config.logger || NULL_LOGGER;
  if (!isLogger(logger)) throw new TypeError('Pool logger must implement debug/info/warn/error');
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
    return attachPoolErrorHandler(config.pool, logger);
  }

  const options = connectionOptions(environment);
  if (injectable) {
    validateLocalConnection(options, mode);
  }

  const pool = attachSearchPath(new Pool(options), logger);
  return attachPoolErrorHandler(pool, logger);
}

module.exports = {
  attachPoolErrorHandler,
  createPool,
  environmentMode,
  isInjectableEnvironment,
};
