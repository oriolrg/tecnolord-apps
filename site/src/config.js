const PRODUCT_UI_DEFAULTS = Object.freeze({
  appTitle: "MeteoLord",
  appSubtitle: "Tecnolord apps",
  appIcon: "./assets/icons/favicon-96x96.png",
  appVersion: "2025-12-23-02",
  autoRefreshMs: 30000,
  defaultLimit: 48,
  maxLimit: 300,
  defaultEstacio: "home",
});

const REQUIRED_RUNTIME_KEYS = Object.freeze([
  "API_BASE",
  "MAP_TILE_URL",
  "ANALYTICS_ENABLED",
  "EXTERNAL_LINKS_ENABLED",
  "ENVIRONMENT",
  "SYNTHETIC_DATA",
]);

function fail(reason) {
  throw new Error(`Invalid MeteoLord runtime configuration: ${reason}`);
}

function normalizedApiBase(value) {
  if (typeof value !== "string"
      || !/^\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%/-]*$/.test(value)) {
    fail("API_BASE must be a same-origin absolute path");
  }
  return value.length > 1 ? value.replace(/\/+$/, "") : value;
}

export function resolveRuntimeConfig(runtimeConfig) {
  if (!runtimeConfig || typeof runtimeConfig !== "object" || Array.isArray(runtimeConfig)) {
    fail("window.__METEOLORD_CONFIG is missing");
  }

  for (const key of REQUIRED_RUNTIME_KEYS) {
    if (!Object.hasOwn(runtimeConfig, key)) fail(`${key} is missing`);
  }
  for (const key of Object.keys(runtimeConfig)) {
    if (!REQUIRED_RUNTIME_KEYS.includes(key)) fail(`${key} is not allowed`);
  }

  const environment = runtimeConfig.ENVIRONMENT;
  if (!['local', 'production'].includes(environment)) {
    fail("ENVIRONMENT must be local or production");
  }
  if (typeof runtimeConfig.MAP_TILE_URL !== "string") fail("MAP_TILE_URL must be a string");
  if (typeof runtimeConfig.ANALYTICS_ENABLED !== "boolean") fail("ANALYTICS_ENABLED must be boolean");
  if (typeof runtimeConfig.EXTERNAL_LINKS_ENABLED !== "boolean") fail("EXTERNAL_LINKS_ENABLED must be boolean");
  if (typeof runtimeConfig.SYNTHETIC_DATA !== "boolean") fail("SYNTHETIC_DATA must be boolean");

  if (environment === "local") {
    if (runtimeConfig.MAP_TILE_URL !== "") fail("MAP_TILE_URL must be empty in local");
    if (runtimeConfig.ANALYTICS_ENABLED !== false) fail("analytics must be disabled in local");
    if (runtimeConfig.EXTERNAL_LINKS_ENABLED !== false) fail("external links must be disabled in local");
  } else if (runtimeConfig.SYNTHETIC_DATA !== false) {
    fail("synthetic data must be disabled in production");
  }

  const apiBase = normalizedApiBase(runtimeConfig.API_BASE);
  return Object.freeze({
    ...PRODUCT_UI_DEFAULTS,
    apiBase,
    mapTileUrl: runtimeConfig.MAP_TILE_URL,
    analyticsEnabled: runtimeConfig.ANALYTICS_ENABLED,
    externalLinksEnabled: runtimeConfig.EXTERNAL_LINKS_ENABLED,
    environment,
    syntheticData: runtimeConfig.SYNTHETIC_DATA,
    meteoEndpoint: `${apiBase}/v1/mesures/darreres`,
    hidroEndpoint: `${apiBase}/v1/hidro/darreres`,
    previEndpoint: `${apiBase}/v1/previ/48h`,
  });
}

if (typeof window === "undefined") fail("window.__METEOLORD_CONFIG is missing");

export const CONFIG = resolveRuntimeConfig(window.__METEOLORD_CONFIG);
