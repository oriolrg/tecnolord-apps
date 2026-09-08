'use strict';

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: [['html', { outputFolder: '/tmp/playwright-report', open: 'never' }]],
  outputDir: '/tmp/playwright-test-results',
  use: {
    baseURL: 'http://caddy:8080',
  },
});
