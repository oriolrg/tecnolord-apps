// ──────────────────────────────────────────────────────────
// server.js — tecnolord backend
// - Express + routers
// - Serveis: previService, acaService, ecowittService
// - Auth: checkApiKey via middleware/authApiKey.js (INGEST_API_KEY)
// ──────────────────────────────────────────────────────────

const express = require('express');
const { mapAssets } = require('./middleware/mapAssets');
const cors = require('cors');
const path = require('path');
const { createPool } = require('./db/pool');
const { createLogger, isLogger } = require('./lib/logger');
const { createRequestContext } = require('./middleware/requestContext');

require('dotenv').config();

const { checkApiKey } = require('./middleware/authApiKey.js');

const { router: pingRouter } = require('./routes/ping');
const { makeHealthRouter } = require('./routes/health');
const { makeMesuresRouter } = require('./routes/mesures');
const { makeHidroRouter } = require('./routes/hidro');
const { makePreviRouter } = require('./routes/previ');
const { createTaskRunner, makeTasksRouter } = require('./routes/tasks');
const { makeMapPublicRouter } = require('./routes/mapPublic');
const { makeIdentityRouter } = require('./routes/identity');
const { makeStationsRouter } = require('./routes/stations');
const { makeStationMapRouter } = require('./routes/stationMap');
const { makePreferencesRouter } = require('./routes/preferences');
const { makePublicViewRouter } = require('./routes/publicView');
const { makeAdminCatalogRouter } = require('./routes/adminCatalog');
const { makeImportsRouter } = require('./routes/imports');
const { makeGrafanaRouter } = require('./routes/grafana');
const { makeEstimationsRouter } = require('./routes/estimations');
const { makeIdentityService } = require('./services/identityService');
const { makeStationCatalogService } = require('./services/stationCatalogService');
const { makeConnectorRegistryService } = require('./services/connectorRegistryService');
const { makeSnapshotService } = require('./services/snapshotService');
const { makeStationLocationService } = require('./services/stationLocationService');
const { makeUserPreferenceService } = require('./services/userPreferenceService');
const { makePublicViewService } = require('./services/publicViewService');
const { makeAdminCatalogService } = require('./services/adminCatalogService');
const { makeImportService } = require('./services/importService');
const { makeGrafanaAdapterService } = require('./services/grafanaAdapterService');
const { makeEstimationService } = require('./services/estimationService');
const { makeLocalMailOutbox } = require('./services/localMailOutbox');

const { makePreviService } = require('./services/previService');
const { makeAcaService } = require('./services/acaService');
const { makeEcowittService } = require('./services/ecowittService');

const FRONTEND_DIR = path.resolve(__dirname, '../site');
const REAL_CLOCK = Object.freeze({ now: () => new Date() });
const LOCAL_FRONTEND_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

function runtimeMode(environment) {
  return environment.METEOLORD_ENV
    || environment.APP_ENV
    || environment.NODE_ENV
    || 'production';
}

function redactRequestUrl(originalUrl) {
  try {
    const parsed = new URL(originalUrl, 'http://local.invalid');
    if (parsed.searchParams.has('key')) parsed.searchParams.set('key', '[REDACTED]');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return String(originalUrl).replace(/([?&]key=)[^&]*/gi, '$1[REDACTED]');
  }
}

// ──────────────────────────────────────────────────────────
// Composició comuna per HTTP i CLI.
function createRuntime({
  pool: injectedPool,
  httpClient,
  clock,
  logger,
  environment = process.env,
} = {}) {
  const hasRuntimeInjection = injectedPool !== undefined
    || httpClient !== undefined
    || clock !== undefined;
  const mode = runtimeMode(environment);

  if (hasRuntimeInjection && !['local', 'test'].includes(mode)) {
    throw new Error('Runtime dependency injection is forbidden outside local/test');
  }
  if (httpClient !== undefined && typeof httpClient !== 'function') {
    throw new TypeError('Injected HTTP client must be a function');
  }
  if (clock !== undefined
      && typeof clock !== 'function'
      && (!clock || typeof clock.now !== 'function')) {
    throw new TypeError('Injected clock must be a function or implement now()');
  }
  if (logger !== undefined && !isLogger(logger)) {
    throw new TypeError('Injected logger must implement debug/info/warn/error');
  }

  const runtimeLogger = logger || createLogger();
  const pool = createPool({ environment, pool: injectedPool, logger: runtimeLogger });
  const transport = httpClient === undefined ? globalThis.fetch : httpClient;
  const runtimeClock = clock === undefined ? REAL_CLOCK : clock;

  // ──────────────────────────────────────────────────────────
  // Helpers DB (usuaris/estacions/hidro)
  async function assegurarUsuariAdmin(email) {
    const { rows } = await pool.query(
      `INSERT INTO auth.usuaris (email, nom, actiu)
       VALUES ($1, $2, true)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [email, email]
    );
    return rows[0].id;
  }

  async function assegurarEstacio(codi, nom, creatPerUserId) {
    const { rows } = await pool.query(
      `INSERT INTO estacions (codi, nom, creat_per_usuari)
       VALUES ($1, $2, $3)
       ON CONFLICT (codi) DO UPDATE SET nom = COALESCE(EXCLUDED.nom, estacions.nom)
       RETURNING id`,
      [codi, nom || null, creatPerUserId || null]
    );
    return rows[0].id;
  }

  async function assegurarMembreEstacio(usuariId, estacioId, rol = 'propietari') {
    await pool.query(
      `INSERT INTO membres_estacio (usuari_id, estacio_id, rol)
       VALUES ($1,$2,$3)
       ON CONFLICT (usuari_id, estacio_id) DO NOTHING`,
      [usuariId, estacioId, rol]
    );
  }

  async function assegurarHidro(codi, tipus, nom) {
    const { rows } = await pool.query(
      `INSERT INTO estacions_hidro (codi, tipus, nom, activa)
       VALUES ($1,$2,$3,true)
       ON CONFLICT (codi) DO UPDATE SET nom = COALESCE(EXCLUDED.nom, estacions_hidro.nom)
       RETURNING id`,
      [codi, tipus, nom || null]
    );
    return rows[0].id;
  }

  // ──────────────────────────────────────────────────────────
  // Serveis compartits per tots els transports d'entrada.
  const sharedDependencies = {
    pool,
    httpClient: transport,
    clock: runtimeClock,
    logger: runtimeLogger,
  };
  const previService = makePreviService(sharedDependencies);
  const acaService = makeAcaService({ ...sharedDependencies, assegurarHidro });
  const ecowittService = makeEcowittService({
    ...sharedDependencies,
    assegurarUsuariAdmin,
    assegurarEstacio,
    assegurarMembreEstacio,
  });
  const taskRunner = createTaskRunner({
    pullEcowittAndSave: ecowittService.pullEcowittAndSave,
    pullACAAndSave: acaService.pullACAAndSave,
    pullPreviAndSave: previService.pullPreviAndSave,
    logger: runtimeLogger,
  });

  return {
    pool,
    transport,
    clock: runtimeClock,
    logger: runtimeLogger,
    previService,
    acaService,
    ecowittService,
    taskRunner,
  };
}

function createApp({
  pool,
  httpClient,
  clock,
  logger,
  environment = process.env,
  accessLogStream,
  correlationIdFactory,
  mapPublicStations,
  mapPublicRateLimit,
  mapPublicHistoryProfiles,
  mapPublicObservations,
  identityMailAdapter,
  connectorKeyring,
} = {}) {
  if (accessLogStream !== undefined
      && (!accessLogStream || typeof accessLogStream.write !== 'function')) {
    throw new TypeError('Access log stream must implement write()');
  }
  if (correlationIdFactory !== undefined && typeof correlationIdFactory !== 'function') {
    throw new TypeError('Correlation ID factory must be a function');
  }
  const appLogger = logger || createLogger({
    stream: accessLogStream === undefined ? process.stdout : accessLogStream,
  });
  const runtime = createRuntime({ pool, httpClient, clock, logger: appLogger, environment });
  const app = express();
  const mode = runtimeMode(environment);
  if (identityMailAdapter !== undefined
      && (!['local', 'test'].includes(mode) || typeof identityMailAdapter !== 'function')) {
    throw new TypeError('Injected identity mail adapter is allowed only in local/test');
  }
  if (connectorKeyring !== undefined && !['local', 'test'].includes(mode)) {
    throw new TypeError('Injected connector keyring is allowed only in local/test');
  }
  app.locals.meteolordRuntime = runtime;
  app.locals.logger = appLogger;

  // ──────────────────────────────────────────────────────────
  // Middlewares
  app.use((_req, res, next) => {
    if (['local', 'test'].includes(mode)) {
      res.setHeader('Content-Security-Policy', LOCAL_FRONTEND_CSP);
    }
    next();
  });
  app.use(createRequestContext({ idFactory: correlationIdFactory }));
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.once('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      appLogger.info('http.request', {
        correlation_id: req.requestContext.correlation_id,
        result: `HTTP_${res.statusCode}`,
        duration_ms: Number(durationMs.toFixed(3)),
      });
    });
    next();
  });
  app.use(cors());
  app.use(express.json({ limit: '256kb', type: ['application/json', 'application/*+json'] }));

  const identityNow = () => {
    const value = typeof runtime.clock === 'function' ? runtime.clock() : runtime.clock.now();
    return new Date(value).getTime();
  };
  const identityService = makeIdentityService({
    pool: runtime.pool,
    now: identityNow,
    mailAdapter: identityMailAdapter || (mode === 'local'
      ? makeLocalMailOutbox(environment.METEOLORD_LOCAL_MAIL_OUTBOX)
      : undefined),
  });
  const stationCatalog = makeStationCatalogService({ pool: runtime.pool });
  const connectorRegistry = makeConnectorRegistryService({
    pool: runtime.pool,
    keyring: connectorKeyring || environment.METEOLORD_CONNECTOR_KEYS,
  });
  const snapshotService = typeof runtime.pool.connect === 'function'
    ? makeSnapshotService({
      pool: runtime.pool,
      connectorRegistry,
      fetch: runtime.transport,
      clock: runtime.clock,
    })
    : null;
  runtime.snapshotService = snapshotService;
  const stationLocations = makeStationLocationService({ pool: runtime.pool, clock: runtime.clock });
  runtime.stationLocations = stationLocations;
  const preferences = typeof runtime.pool.connect === 'function'
    ? makeUserPreferenceService({ pool: runtime.pool })
    : null;
  runtime.preferences = preferences;
  const publicView = makePublicViewService({ pool: runtime.pool });
  runtime.publicView = publicView;
  const adminCatalog = typeof runtime.pool.connect === 'function'
    ? makeAdminCatalogService({ pool: runtime.pool, clock: runtime.clock })
    : null;
  runtime.adminCatalog = adminCatalog;
  const imports = typeof runtime.pool.connect === 'function'
    ? makeImportService({ pool: runtime.pool, clock: runtime.clock })
    : null;
  runtime.imports = imports;
  const grafana = makeGrafanaAdapterService({
    pool: runtime.pool, fetch: runtime.transport, clock: runtime.clock,
    enabled: environment.METEOLORD_GRAFANA_INTERNAL_ENABLED === 'true',
  });
  runtime.grafana = grafana;
  const estimations = makeEstimationService({
    pool: runtime.pool, fetch: runtime.transport, clock: runtime.clock,
  });
  runtime.estimations = estimations;

  // ──────────────────────────────────────────────────────────
  // Routers
  app.use(pingRouter);
  app.use(makeIdentityRouter({
    mode,
    now: identityNow,
    identityService,
  }));
  if (preferences) app.use(makePreferencesRouter({ identityService, preferences, mode }));
  app.use(makePublicViewRouter({ identityService, publicView, mode }));
  if (adminCatalog) app.use(makeAdminCatalogRouter({ identityService, adminCatalog, mode }));
  if (imports) app.use(makeImportsRouter({ identityService, imports, mode }));
  app.use(makeGrafanaRouter({ identityService, grafana }));
  app.use(makeEstimationsRouter({ estimations }));
  app.use(makeStationsRouter({
    pool: runtime.pool, identityService, stationCatalog, connectorRegistry, snapshotService, stationLocations, mode,
  }));
  app.use(makeHealthRouter({ pool: runtime.pool, logger: runtime.logger }));
  app.use(makeMesuresRouter({
    pool: runtime.pool,
    logger: runtime.logger,
    identityService,
    stationCatalog,
  }));
  app.use(makeHidroRouter({ pool: runtime.pool, logger: runtime.logger }));
  app.use(makePreviRouter({ previService: runtime.previService, logger: runtime.logger }));

  app.use(makeTasksRouter({
    checkApiKey,
    taskRunner: runtime.taskRunner,
    snapshotService,
  }));

  // MAP-A is available only from the local/test composition and consumes the
  // fixture-backed, fail-closed public catalog adapter.
  if (mapPublicStations !== undefined && ['local', 'test'].includes(mode)) {
    app.use(makeMapPublicRouter({
      stations: mapPublicStations,
      environment,
      rateLimit: mapPublicRateLimit,
      historyProfiles: mapPublicHistoryProfiles,
      observations: mapPublicObservations,
    }));
  } else {
    app.use(makeStationMapRouter({
      identityService, stationLocations, estimations, rateLimit: mapPublicRateLimit,
    }));
  }

  // Frontend local: les rutes API es registren abans dels estàtics.
  app.get('/meteo/runtime-config.js', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.sendFile(path.join(FRONTEND_DIR, 'runtime-config.js'));
  });
  app.use(mapAssets);
  app.use('/meteo', express.static(FRONTEND_DIR));
  app.get('/meteo', (_req, res) => res.redirect(302, '/meteo/'));
  app.get('/meteo/*', (_req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));
  app.get('/', (_req, res) => res.redirect(302, '/meteo/'));

  return app;
}

function startServer({ environment = process.env } = {}) {
  const app = createApp({ environment });
  const port = environment.PORT || 3000;
  return app.listen(port, () => {
    app.locals.logger.info('server.start', { result: 'ok' });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  LOCAL_FRONTEND_CSP,
  createApp,
  createRuntime,
  redactRequestUrl,
  runtimeMode,
  startServer,
};
