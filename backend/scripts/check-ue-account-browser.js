'use strict';

const assert = require('node:assert/strict');
const express = require('express');
const { chromium } = require('@playwright/test');
const { createPreviewApp } = require('./serve-map-demo');

async function main() {
  const app = createPreviewApp();
  app.use(express.json());
  const stations = [];
  const auth = express.Router();
  auth.get('/me', (_req, res) => res.status(401).json({ error: 'unauthenticated' }));
  auth.post('/login', (req, res) => {
    if (!['synthetic@example.invalid', 'admin@example.invalid'].includes(req.body?.email)
        || req.body?.password !== 'synthetic-passphrase') {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    return res.json({ user: {
      id: req.body.email.startsWith('admin') ? '1' : '2',
      name: req.body.email.startsWith('admin') ? 'Administradora de prova' : 'Usuari de prova',
      email: req.body.email,
      role: req.body.email.startsWith('admin') ? 'SUPERADMIN' : 'USER',
    }, csrf_token: 'synthetic-csrf' });
  });
  auth.post('/logout', (req, res) => req.get('x-csrf-token') === 'synthetic-csrf'
    ? res.json({ ok: true }) : res.status(403).json({ error: 'forbidden' }));
  auth.post('/recover', (_req, res) => res.json({ ok: true }));
  auth.post('/request', (req, res) => req.body?.name && req.body?.email && req.body?.password?.length >= 12
    ? res.status(202).json({ ok: true }) : res.status(400).json({ error: 'invalid_registration' }));
  auth.post('/verify-email', (req, res) => req.body?.token === 'v'.repeat(43)
    ? res.json({ ok: true, status: 'PENDING_APPROVAL' })
    : res.status(400).json({ error: 'invalid_or_expired_token' }));
  app.use('/api/v1/auth', auth);
  app.get('/api/v1/admin/accounts', (_req, res) => res.json({ items: [
    { id: '1', name: 'Administradora de prova', email: 'admin@example.invalid', status: 'APPROVED' },
    { id: '3', name: 'Usuari pendent', email: 'pending@example.invalid', status: 'PENDING_APPROVAL' },
  ] }));
  app.post('/api/v1/admin/accounts/:id/:action', (req, res) =>
    req.get('x-csrf-token') === 'synthetic-csrf' && req.params.id === '3' && req.params.action === 'approve'
      ? res.json({ ok: true }) : res.status(403).json({ error: 'forbidden' }));
  app.get('/api/v1/me/stations', (_req, res) => res.json({ items: stations }));
  app.post('/api/v1/me/stations', (req, res) => {
    const station = {
      id: '8b1d7549-33bc-42e8-97bb-e6e8217d5ca0', name: req.body.name,
      description: req.body.description || null, lifecycle: 'DRAFT', visibility: 'PRIVATE', revision: 0, can_edit: true,
    };
    stations.splice(0, stations.length, station);
    res.status(201).json({ station });
  });
  app.patch('/api/v1/me/stations/:id', (req, res) => {
    Object.assign(stations[0], { name: req.body.name, description: req.body.description || null, revision: 1 });
    res.json({ station: stations[0] });
  });
  app.delete('/api/v1/me/stations/:id', (_req, res) => {
    Object.assign(stations[0], { lifecycle: 'RETIRED', visibility: 'PRIVATE', revision: 2, can_edit: false });
    res.json({ station: stations[0] });
  });
  app.put('/api/v1/me/stations/:id/connector/ecowitt', (req, res) =>
    req.body?.application_key && req.body?.api_key && req.body?.mac
      ? res.json({ connector: { type: 'ECOWITT', enabled: true, status: 'READY', configured: true } })
      : res.status(400).json({ error: 'invalid_connector' }));
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.MAP_CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const egress = [], errors = [], invalidControls = [];
    await context.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) { egress.push(route.request().url()); return route.abort(); }
      if (url.pathname === '/api/v1/me/stations' && route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: stations }) });
      }
      if (url.pathname === '/api/v1/admin/public-view') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ config: {
          station: { id: '11111111-1111-4111-8111-111111111111', name: 'Meteo Synthetic 01' },
          card_ids: ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv'], revision: 1,
        } }) });
      }
      if (url.pathname === '/api/v1/admin/external-stations') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' });
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (entry) => {
      if (entry.text().includes('An invalid form control')) invalidControls.push(entry.text());
    });
    const response = await page.goto(`${origin}/meteo/compte/`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    await page.locator('#account-login').waitFor({ state: 'visible' });
    await page.locator('#account-toggle-register').click();
    await page.locator('#account-register').waitFor({ state: 'visible' });
    await page.locator('#register-name').fill('Usuari nou');
    await page.locator('#register-email').fill('new@example.invalid');
    await page.locator('#register-password').fill('synthetic-passphrase');
    await page.locator('#account-register button[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('Sol·licitud rebuda'));

    await page.goto(`${origin}/meteo/compte/?verify-flow=1#verify=${'v'.repeat(43)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('pendent d’aprovació'));
    assert.equal(new URL(page.url()).hash, '');

    await page.locator('#login-email').fill('admin@example.invalid');
    await page.locator('#login-password').fill('synthetic-passphrase');
    await page.locator('#account-login button[type="submit"]').click();
    await page.locator('#account-signed-in').waitFor({ state: 'visible' });
    assert.match(await page.locator('#account-name').textContent(), /Administradora de prova/);
    await page.locator('#account-station-create').waitFor({ state: 'visible' });
    await page.locator('#station-name').fill('Estació del balcó');
    await page.locator('#station-description').fill('Prova privada');
    await page.locator('#account-station-create button[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('esborrany privat'));
    const stationRow = page.locator('#account-station-list .account-station-edit');
    await stationRow.locator('input').first().fill('Estació editada');
    await stationRow.getByRole('button', { name: 'Desa', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('Estació actualitzada'));
    await stationRow.getByText('Configura Ecowitt', { exact: true }).click();
    await stationRow.locator('[data-connector-key="application_key"]').fill('synthetic-app-key');
    await stationRow.locator('[data-connector-key="api_key"]').fill('synthetic-api-key');
    await stationRow.locator('[data-connector-key="mac"]').fill('synthetic-device');
    await stationRow.getByRole('button', { name: 'Desa les credencials', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('no es tornaran a mostrar'));
    assert.equal(await stationRow.locator('[data-connector-key="api_key"]').inputValue(), '');
    await stationRow.locator('button', { hasText: 'Retira' }).click();
    await stationRow.locator('button', { hasText: 'Confirma la retirada' }).click();
    await page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('Estació retirada'));
    assert.match(await page.locator('#account-station-list').textContent(), /Retirada/);
    await page.locator('#account-admin').waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.locator('#account-admin-list .account-admin-actions button', { hasText: 'Aprova' }).click();
    await page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('aprovat correctament'));
    await page.locator('#account-logout').click();
    await page.locator('#account-login').waitFor({ state: 'visible' });
    await page.locator('#account-toggle-recover').click();
    await page.locator('#account-recover').waitFor({ state: 'visible' });
    await page.locator('#recover-email').fill('synthetic@example.invalid');
    await page.locator('#account-recover button[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('#account-status')?.textContent.includes('rebràs un enllaç'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(egress, []);
    assert.deepEqual(errors, []);
    assert.deepEqual(invalidControls, []);
    console.log('UE-T06 account browser PASS: station lifecycle, write-only Ecowitt credentials, admin approval; 375 px; 0 external requests');
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
