'use strict';

const path = require('node:path');
const { defineConfig } = require('@playwright/test');

const evidenceDir = process.env.T20_EVIDENCE_DIR || '/tmp/meteolord-e2e';

module.exports = defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 1,
  workers: 1,
  reporter: [
    ['line'],
    ['junit', { outputFile: path.join(evidenceDir, 'junit.xml') }],
  ],
  outputDir: path.join(evidenceDir, 'test-results'),
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://backend:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
