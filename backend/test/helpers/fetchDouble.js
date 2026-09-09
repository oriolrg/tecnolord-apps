'use strict';

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function environmentMode(environment) {
  return environment.METEOLORD_ENV || environment.APP_ENV || environment.NODE_ENV || 'production';
}

function requestUrl(input) {
  if (typeof input === 'string' || input instanceof URL) return String(input);
  if (input && typeof input.url === 'string') return input.url;
  throw new TypeError('Synthetic fetch requires a URL string or Request-like object');
}

function validateRoute(route) {
  if (!route || typeof route !== 'object') throw new TypeError('Synthetic route must be an object');
  const parsed = new URL(route.url);
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.invalid')) {
    throw new Error('Synthetic routes must use an HTTPS .invalid hostname');
  }
  if (!['json', 'timeout'].includes(route.outcome)) {
    throw new Error('Synthetic route outcome is not supported');
  }
  if (route.outcome === 'json') {
    if (!Number.isInteger(route.status) || route.status < 100 || route.status > 599) {
      throw new Error('Synthetic response status is invalid');
    }
    if (!Object.hasOwn(route, 'body')) {
      throw new Error('Synthetic JSON response must declare a body');
    }
  }
}

function syntheticResponse(route) {
  return Object.freeze({
    ok: route.status >= 200 && route.status < 300,
    status: route.status,
    async json() {
      return clone(route.body);
    },
    async text() {
      return typeof route.body === 'string' ? route.body : JSON.stringify(route.body);
    },
  });
}

function createFetchDouble({ routes, environment = process.env } = {}) {
  if (!['local', 'test'].includes(environmentMode(environment))) {
    throw new Error('Synthetic fetch is forbidden outside local/test');
  }
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new TypeError('Synthetic fetch requires at least one registered route');
  }

  const registry = new Map();
  for (const route of routes) {
    validateRoute(route);
    if (registry.has(route.url)) throw new Error('Duplicate synthetic route');
    registry.set(route.url, clone(route));
  }

  const callLog = [];
  const fetchDouble = async (input, init = {}) => {
    const url = requestUrl(input);
    const route = registry.get(url);
    if (!route) {
      throw new Error('Synthetic fetch blocked an unregistered URL');
    }

    callLog.push(Object.freeze({
      url,
      method: String(init.method || 'GET').toUpperCase(),
    }));

    if (route.outcome === 'timeout') {
      const error = new Error('Synthetic fetch timeout');
      error.name = 'AbortError';
      throw error;
    }
    return syntheticResponse(route);
  };

  fetchDouble.calls = () => callLog.map((entry) => ({ ...entry }));
  fetchDouble.registeredUrls = () => [...registry.keys()];
  return fetchDouble;
}

module.exports = { createFetchDouble };
