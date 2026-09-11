'use strict';

const { test, expect } = require('@playwright/test');

test('smoke: API ping responds', async ({ request }) => {
  const response = await request.get('/api/ping');
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({ ok: true });
});
