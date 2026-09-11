'use strict';

const { AsyncLocalStorage } = require('node:async_hooks');
const { randomUUID } = require('node:crypto');

const requestStorage = new AsyncLocalStorage();

function createRequestContext({ idFactory = randomUUID } = {}) {
  if (typeof idFactory !== 'function') throw new TypeError('Correlation ID factory must be a function');

  return function requestContext(req, res, next) {
    const correlationId = String(idFactory());
    if (!/^[a-zA-Z0-9_-]{8,128}$/.test(correlationId)) {
      throw new TypeError('Correlation ID has an invalid format');
    }

    const context = Object.freeze({ correlation_id: correlationId });
    req.requestContext = context;
    res.setHeader('X-Correlation-Id', correlationId);
    requestStorage.run(context, next);
  };
}

function currentRequestContext() {
  return requestStorage.getStore() || null;
}

module.exports = { createRequestContext, currentRequestContext };
