// ──────────────────────────────────────────────────────────
// server.js — tecnolord backend
// - Express + routers
// - Serveis: previService, acaService, ecowittService
// - Auth: checkApiKey via middleware/authApiKey.js (INGEST_API_KEY)
// ──────────────────────────────────────────────────────────

const express = require('express');
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

const { makePreviService } = require('./services/previService');
const { makeAcaService } = require('./services/acaService');
const { makeEcowittService } = require('./services/ecowittService');

const FRONTEND_DIR = path.resolve(__dirname, '../site');
const REAL_CLOCK = Object.freeze({ now: () => new Date() });

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
  const mode = environment.METEOLORD_ENV
    || environment.APP_ENV
    || environment.NODE_ENV
    || 'production';

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
  app.locals.meteolordRuntime = runtime;
  app.locals.logger = appLogger;

  // ──────────────────────────────────────────────────────────
  // Middlewares
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

  // ──────────────────────────────────────────────────────────
  // Routers
  app.use(pingRouter);
  app.use(makeHealthRouter({ pool: runtime.pool, logger: runtime.logger }));
  app.use(makeMesuresRouter({ pool: runtime.pool, logger: runtime.logger }));
  app.use(makeHidroRouter({ pool: runtime.pool, logger: runtime.logger }));
  app.use(makePreviRouter({ previService: runtime.previService, logger: runtime.logger }));

  app.use(makeTasksRouter({
    checkApiKey,
    taskRunner: runtime.taskRunner,
  }));

  // Frontend local: les rutes API es registren abans dels estàtics.
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

module.exports = { createApp, createRuntime, redactRequestUrl, startServer };
