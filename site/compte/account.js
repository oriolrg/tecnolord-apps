import { CONFIG } from '../src/config.js';

const get = (selector) => document.querySelector(selector);
const status = get('#account-status');
const accountCard = get('.account-card');
const loginForm = get('#account-login');
const registerForm = get('#account-register');
const recoverForm = get('#account-recover');
const resetForm = get('#account-reset');
const signedIn = get('#account-signed-in');
const toggleRecover = get('#account-toggle-recover');
const toggleRegister = get('#account-toggle-register');
const backLogin = get('#account-back-login');
const adminPanel = get('#account-admin');
const adminList = get('#account-admin-list');
const stationList = get('#account-station-list');
const stationCreate = get('#account-station-create');
const publicViewForm = get('#account-public-view-form');
const publicViewStation = get('#account-public-view-station');
const publicViewCards = get('#account-public-view-cards');
const catalogCreate = get('#account-catalog-create');
const catalogList = get('#account-catalog-list');
const grafanaList = get('#account-grafana-list');
const importForm = get('#account-import-form');
const importSource = get('#account-import-source');
const importFile = get('#account-import-file');
const importJson = get('#account-import-json');
const importList = get('#account-import-list');
let csrfToken = null;
let resetToken = null;
let currentUser = null;
let publicViewRevision = 0;
let publicViewOrder = [];

const publicViewLabels = Object.freeze({
  wind: 'Vent', temperature: 'Temperatura', rain: 'Pluja', pressure: 'Pressió', humidity: 'Humitat', uv: 'Índex UV',
});

function show(section) {
  for (const node of [loginForm, registerForm, recoverForm, resetForm, signedIn]) node.hidden = node !== section;
  const isLogin = section === loginForm;
  toggleRegister.hidden = !isLogin;
  toggleRecover.hidden = !isLogin;
  backLogin.hidden = ![registerForm, recoverForm].includes(section);
  if (section !== signedIn) {
    adminPanel.hidden = true;
    accountCard.classList.remove('account-card-wide');
  }
}

function message(value) { status.textContent = value; }

async function post(path, body, csrf) {
  const response = await fetch(`${CONFIG.apiBase}/v1/auth/${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...(csrf ? { 'x-csrf-token': csrf } : {}) },
    body: JSON.stringify(body),
  });
  return { response, data: await response.json() };
}

async function adminRequest(path = '', options = {}) {
  const response = await fetch(`${CONFIG.apiBase}/v1/admin/accounts${path}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.method && options.method !== 'GET' ? { 'x-csrf-token': csrfToken } : {}),
      ...options.headers,
    },
  });
  return { response, data: await response.json() };
}

async function stationRequest(path = '', options = {}) {
  const response = await fetch(`${CONFIG.apiBase}/v1/me/stations${path}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.method && options.method !== 'GET' ? { 'x-csrf-token': csrfToken } : {}),
      ...options.headers,
    },
  });
  return { response, data: await response.json() };
}

async function publicViewRequest(options = {}) {
  const response = await fetch(`${CONFIG.apiBase}/v1/admin/public-view`, {
    credentials: 'same-origin', cache: 'no-store', ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.method && options.method !== 'GET' ? { 'x-csrf-token': csrfToken } : {}),
      ...options.headers,
    },
  });
  return { response, data: await response.json() };
}

async function catalogRequest(path = '', options = {}) {
  const response = await fetch(`${CONFIG.apiBase}/v1/admin/external-stations${path}`, {
    credentials: 'same-origin', cache: 'no-store', ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.method && options.method !== 'GET' ? { 'x-csrf-token': csrfToken } : {}),
      ...options.headers,
    },
  });
  return { response, data: await response.json() };
}

async function importRequest(path = '', options = {}) {
  const response = await fetch(`${CONFIG.apiBase}/v1/admin/imports${path}`, {
    credentials: 'same-origin', cache: 'no-store', ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.method && options.method !== 'GET' ? { 'x-csrf-token': csrfToken } : {}),
      ...options.headers,
    },
  });
  return { response, data: await response.json() };
}

async function grafanaRequest(path = '') {
  const response = await fetch(`${CONFIG.apiBase}/v1/admin/grafana/stations${path}`, {
    credentials: 'same-origin', cache: 'no-store',
  });
  return { response, data: await response.json() };
}

function renderGrafanaResult(container, data) {
  container.replaceChildren();
  const meta = document.createElement('p'); meta.className = 'account-grafana-meta';
  meta.textContent = `${data.window.minutes} min · ${data.source.persistence === 'DISABLED' ? 'sense persistència' : data.source.persistence} · pluja desactivada`;
  container.append(meta);
  for (const series of data.series) {
    const block = document.createElement('section');
    const heading = document.createElement('h4');
    const table = document.createElement('table');
    heading.textContent = `${series.name} · ${series.unit === 'celsius' ? '°C' : series.unit}`;
    table.className = 'account-grafana-points';
    const head = document.createElement('thead'); const headRow = document.createElement('tr');
    for (const label of ['Hora', 'Valor', 'Qualitat']) {
      const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = label; headRow.append(cell);
    }
    head.append(headRow); table.append(head);
    const body = document.createElement('tbody');
    for (const point of series.points.slice(-8)) {
      const row = document.createElement('tr');
      const values = [new Date(point.observed_at).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }),
        point.value == null ? '—' : `${point.value} °C`, point.quality];
      for (const value of values) { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); }
      body.append(row);
    }
    table.append(body); block.append(heading, table); container.append(block);
  }
  if (data.warnings.length) {
    const warning = document.createElement('p'); warning.className = 'account-grafana-warning';
    warning.textContent = `Advertiments de la font: ${data.warnings.join(', ')}`; container.append(warning);
  }
}

function renderGrafanaStations(items) {
  grafanaList.replaceChildren();
  for (const item of items) {
    const article = document.createElement('article');
    const summary = document.createElement('div');
    const identity = document.createElement('div');
    const title = document.createElement('strong'); const detail = document.createElement('small');
    const button = document.createElement('button'); const result = document.createElement('div');
    article.className = 'account-grafana-station'; summary.className = 'account-import-summary';
    result.className = 'account-grafana-result'; title.textContent = item.name;
    detail.textContent = `${item.external_id} · només intern · temperatura`; identity.append(title, detail);
    button.type = 'button'; button.textContent = 'Consulta 15 minuts';
    button.setAttribute('aria-label', `Consulta 15 minuts — ${item.name}`);
    button.addEventListener('click', async () => {
      button.disabled = true; result.textContent = 'Consultant…';
      try {
        const { response, data } = await grafanaRequest(`/${encodeURIComponent(item.id)}/current`);
        if (!response.ok) {
          result.replaceChildren();
          message(response.status === 503 ? 'El connector intern de Grafana està desactivat en aquest entorn.'
            : response.status === 502 ? `Grafana no ha retornat dades utilitzables (${data.code || 'error de font'}).`
              : 'No s’ha pogut consultar aquesta estació.');
          return;
        }
        renderGrafanaResult(result, data);
        message(`Consulta interna de «${data.station.name}» completada sense persistir dades.`);
      } catch { result.replaceChildren(); message('No s’ha pogut contactar amb el servidor.'); }
      finally { button.disabled = false; }
    });
    summary.append(identity, button); article.append(summary, result); grafanaList.append(article);
  }
  if (!items.length) {
    const empty = document.createElement('p'); empty.className = 'account-admin-empty';
    empty.textContent = 'No hi ha cap binding Grafana validat al catàleg intern.'; grafanaList.append(empty);
  }
}

async function loadGrafanaStations() {
  const { response, data } = await grafanaRequest();
  if (!response.ok || !Array.isArray(data.items)) throw new Error('grafana');
  renderGrafanaStations(data.items);
}

const importStatusLabels = Object.freeze({
  STAGED: 'Pendent d’aplicar', APPLIED: 'Aplicat', REJECTED: 'Revertit',
  VALIDATED: 'Validada', QUARANTINED: 'Quarantena', CONFLICT: 'Conflicte', APPLIED_ROW: 'Aplicada',
});

function importCount(batch, key) { return Number(batch.counts?.[key] || 0); }

function renderImports(items) {
  importList.replaceChildren();
  for (const batch of items) {
    const article = document.createElement('article');
    const summary = document.createElement('div');
    const identity = document.createElement('div');
    const state = document.createElement('span');
    const counts = document.createElement('div');
    const table = document.createElement('table');
    const actions = document.createElement('div');
    article.className = 'account-import-batch'; summary.className = 'account-import-summary';
    counts.className = 'account-import-counts'; table.className = 'account-import-rows'; actions.className = 'account-import-actions';
    const title = document.createElement('strong'); title.textContent = `Lot ${batch.id} · ${batch.source_namespace}`;
    const date = document.createElement('small'); date.textContent = new Date(batch.created_at).toLocaleString('ca-ES');
    identity.append(title, date);
    state.className = 'account-state'; state.textContent = importStatusLabels[batch.status] || batch.status;
    summary.append(identity, state);
    for (const key of ['validated', 'applied', 'quarantined', 'conflict']) {
      if (!importCount(batch, key)) continue;
      const badge = document.createElement('span'); badge.className = 'account-import-badge'; badge.dataset.kind = key;
      badge.textContent = `${key === 'validated' ? 'Validades' : key === 'applied' ? 'Aplicades' : key === 'quarantined' ? 'Quarantena' : 'Conflictes'}: ${importCount(batch, key)}`;
      counts.append(badge);
    }
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const value of ['Codi', 'Estat', 'Acció', 'Incidència']) {
      const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = value; headRow.append(cell);
    }
    head.append(headRow); table.append(head);
    const body = document.createElement('tbody');
    for (const item of batch.rows) {
      const row = document.createElement('tr');
      const rowStatus = item.status === 'APPLIED' ? importStatusLabels.APPLIED_ROW : (importStatusLabels[item.status] || item.status);
      for (const value of [item.inventory_code, rowStatus, item.action || '—', item.issue_code || '—']) {
        const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
      }
      body.append(row);
    }
    table.append(body);
    if (batch.status === 'STAGED' && importCount(batch, 'validated')) {
      const apply = document.createElement('button'); apply.type = 'button'; apply.textContent = 'Aplica les files validades';
      apply.addEventListener('click', async () => {
        apply.disabled = true;
        try {
          const { response } = await importRequest(`/${encodeURIComponent(batch.id)}/apply`, { method: 'POST' });
          if (!response.ok) throw new Error(String(response.status));
          await loadImports(); await loadAdminCatalog();
          message('Lot aplicat. Les files en quarantena o conflicte s’han mantingut fora del catàleg.');
        } catch (error) {
          message(error.message === '409' ? 'El catàleg ha canviat. Genera un dry-run nou.' : 'No s’ha pogut aplicar el lot.');
        } finally { apply.disabled = false; }
      });
      actions.append(apply);
    }
    if (batch.status === 'APPLIED') {
      const rollback = document.createElement('button'); rollback.type = 'button'; rollback.className = 'account-danger';
      rollback.textContent = 'Reverteix el lot';
      rollback.addEventListener('click', async () => {
        rollback.disabled = true;
        try {
          const { response } = await importRequest(`/${encodeURIComponent(batch.id)}/rollback`, { method: 'POST' });
          if (!response.ok) throw new Error(String(response.status));
          await loadImports(); await loadAdminCatalog(); message('Lot revertit.');
        } catch (error) {
          message(error.message === '409'
            ? 'No es pot revertir perquè hi ha canvis o dades posteriors. No s’ha modificat res.'
            : 'No s’ha pogut revertir el lot.');
        } finally { rollback.disabled = false; }
      });
      actions.append(rollback);
    }
    article.append(summary, counts, table, actions); importList.append(article);
  }
  if (!items.length) {
    const empty = document.createElement('p'); empty.className = 'account-admin-empty';
    empty.textContent = 'Encara no hi ha cap lot d’importació.'; importList.append(empty);
  }
}

async function loadImports() {
  const { response, data } = await importRequest();
  if (!response.ok || !Array.isArray(data.items)) throw new Error('imports');
  renderImports(data.items);
}

function catalogField(labelText, name, value, options = {}) {
  const label = document.createElement('label');
  const input = options.values ? document.createElement('select') : document.createElement('input');
  label.textContent = labelText;
  input.name = name;
  if (options.values) {
    for (const [optionValue, optionText] of options.values) {
      const option = document.createElement('option'); option.value = optionValue; option.textContent = optionText; input.append(option);
    }
  } else {
    input.type = options.type || 'text';
    if (options.step) input.step = options.step;
    if (options.min !== undefined) input.min = String(options.min);
    if (options.max !== undefined) input.max = String(options.max);
    if (options.maxLength) input.maxLength = options.maxLength;
  }
  input.required = options.required !== false;
  input.value = value ?? '';
  label.append(input);
  return { label, input };
}

function catalogPayload(fields, revision) {
  const control = (field) => field.input || field;
  return {
    name: control(fields.name).value,
    description: control(fields.description).value,
    source_namespace: control(fields.source).value,
    external_id: control(fields.externalId).value,
    longitude: control(fields.longitude).valueAsNumber,
    latitude: control(fields.latitude).valueAsNumber,
    accuracy_m: control(fields.accuracy).valueAsNumber,
    provenance: control(fields.provenance).value,
    reference_label: control(fields.reference).value,
    ...(revision === undefined ? {} : { revision }),
  };
}

function renderAdminCatalog(items) {
  catalogList.replaceChildren();
  for (const item of items) {
    const row = document.createElement('li');
    const form = document.createElement('form');
    const meta = document.createElement('div');
    const save = document.createElement('button');
    const fields = {
      name: catalogField('Nom', 'name', item.name, { maxLength: 100 }),
      description: catalogField('Descripció', 'description', item.description || '', { maxLength: 500, required: false }),
      source: catalogField('Font', 'source_namespace', item.source.namespace, { values: [['METEOLORD', 'MeteoLord'], ['GRAFANA', 'Grafana']] }),
      externalId: catalogField('Identificador extern', 'external_id', item.source.external_id, { maxLength: 120 }),
      longitude: catalogField('Longitud', 'longitude', item.location.longitude, { type: 'number', step: 'any', min: -180, max: 180 }),
      latitude: catalogField('Latitud', 'latitude', item.location.latitude, { type: 'number', step: 'any', min: -90, max: 90 }),
      accuracy: catalogField('Precisió (m)', 'accuracy_m', item.location.accuracy_m, { type: 'number', step: '1', min: 0, max: 100000 }),
      provenance: catalogField('Procedència', 'provenance', item.location.provenance, { values: [
        ['ADMIN_VERIFIED', 'Verificació administrativa'], ['FIELD_SURVEY', 'Comprovació sobre el terreny'], ['SOURCE_DOCUMENT', 'Document de la font'],
      ] }),
      reference: catalogField('Referència', 'reference_label', item.location.reference_label || '', { maxLength: 200, required: false }),
    };
    form.className = 'account-catalog-edit';
    meta.className = 'account-catalog-meta';
    meta.append(
      document.createTextNode(`${item.lifecycle} · ${item.visibility} · precisió pública: ${item.location.publication_mode}`),
      document.createTextNode(item.override_fields.length ? `Correccions: ${item.override_fields.join(', ')}` : 'Sense correccions manuals'),
    );
    save.type = 'submit'; save.textContent = 'Desa la correcció';
    form.append(...Object.values(fields).map((field) => field.label), meta, save);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      save.disabled = true;
      try {
        const { response } = await catalogRequest(`/${encodeURIComponent(item.id)}`, {
          method: 'PUT', body: JSON.stringify(catalogPayload(fields, item.revision)),
        });
        if (!response.ok) throw new Error(String(response.status));
        await loadAdminCatalog();
        message('Correcció del catàleg desada i auditada.');
      } catch (error) {
        message(error.message === '409'
          ? 'La fitxa o la identitat de la font ha canviat. Actualitza el catàleg.'
          : 'No s’ha pogut desar la correcció del catàleg.');
      } finally { save.disabled = false; }
    });
    row.append(form);
    catalogList.append(row);
  }
  if (items.length === 0) {
    const empty = document.createElement('li'); empty.className = 'account-admin-empty';
    empty.textContent = 'Encara no hi ha estacions de fonts administrades.'; catalogList.append(empty);
  }
}

async function loadAdminCatalog() {
  const { response, data } = await catalogRequest();
  if (!response.ok || !Array.isArray(data.items)) throw new Error('admin catalog');
  renderAdminCatalog(data.items);
}

function renderPublicViewCards(selected) {
  publicViewCards.replaceChildren();
  for (const [index, id] of publicViewOrder.entries()) {
    const row = document.createElement('div');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const actions = document.createElement('div');
    checkbox.type = 'checkbox'; checkbox.checked = selected.has(id); checkbox.dataset.cardId = id;
    label.append(checkbox, document.createTextNode(` ${publicViewLabels[id]}`));
    for (const [delta, text, accessible] of [[-1, '↑', 'Puja'], [1, '↓', 'Baixa']]) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = text; button.title = `${accessible} ${publicViewLabels[id]}`;
      button.disabled = index + delta < 0 || index + delta >= publicViewOrder.length;
      button.addEventListener('click', () => {
        const selectedNow = new Set([...publicViewCards.querySelectorAll('input:checked')].map((item) => item.dataset.cardId));
        const next = [...publicViewOrder];
        [next[index], next[index + delta]] = [next[index + delta], next[index]];
        publicViewOrder = next;
        renderPublicViewCards(selectedNow);
      });
      actions.append(button);
    }
    row.append(label, actions);
    publicViewCards.append(row);
  }
}

async function loadPublicView() {
  const [configResult, stationsResponse] = await Promise.all([
    publicViewRequest(), fetch(`${CONFIG.apiBase}/v1/stations`, { credentials: 'same-origin', cache: 'no-store' }),
  ]);
  const stationsData = await stationsResponse.json();
  if (!configResult.response.ok || !stationsResponse.ok) throw new Error('public view');
  const config = configResult.data.config;
  publicViewRevision = config.revision;
  publicViewStation.replaceChildren();
  for (const station of stationsData.items || []) {
    const option = document.createElement('option'); option.value = station.id; option.textContent = station.name;
    publicViewStation.append(option);
  }
  publicViewStation.value = config.station?.id || config.configured_station_id || '';
  publicViewOrder = [...config.card_ids, ...Object.keys(publicViewLabels).filter((id) => !config.card_ids.includes(id))];
  renderPublicViewCards(new Set(config.card_ids));
}

const statusLabels = Object.freeze({
  PENDING_EMAIL: 'Correu pendent',
  PENDING_APPROVAL: 'Pendent d’aprovació',
  APPROVED: 'Aprovat',
});

function accountAction(item, action, label, className = '') {
  const completedLabels = { approve: 'aprovat', reject: 'rebutjat', suspend: 'suspès' };
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', async () => {
    if (['reject', 'suspend'].includes(action) && button.dataset.confirm !== 'true') {
      button.dataset.confirm = 'true';
      button.textContent = action === 'reject' ? 'Confirma el rebuig' : 'Confirma la suspensió';
      message('Torna a prémer el botó per confirmar aquesta acció.');
      return;
    }
    button.disabled = true;
    message(`${label}…`);
    try {
      const { response } = await adminRequest(`/${encodeURIComponent(item.id)}/${action}`, {
        method: 'POST', body: '{}',
      });
      if (!response.ok) throw new Error('account decision');
      await loadAdminAccounts();
      message(`Compte ${completedLabels[action]} correctament.`);
    } catch {
      button.disabled = false;
      message('No s’ha pogut aplicar la decisió. Actualitza la llista i torna-ho a provar.');
    }
  });
  return button;
}

function renderAdminAccounts(items) {
  adminList.replaceChildren();
  for (const item of items) {
    const row = document.createElement('li');
    const details = document.createElement('div');
    const title = document.createElement('strong');
    const email = document.createElement('span');
    const state = document.createElement('span');
    const actions = document.createElement('div');
    title.textContent = item.name || item.email;
    email.textContent = item.email;
    state.className = `account-state account-state-${String(item.status).toLowerCase().replaceAll('_', '-')}`;
    state.textContent = statusLabels[item.status] || item.status;
    details.className = 'account-admin-details';
    actions.className = 'account-admin-actions';
    details.append(title, email, state);
    if (String(item.id) !== String(currentUser?.id)) {
      if (item.status === 'PENDING_APPROVAL') {
        actions.append(accountAction(item, 'approve', 'Aprova'));
      }
      if (['PENDING_EMAIL', 'PENDING_APPROVAL'].includes(item.status)) {
        actions.append(accountAction(item, 'reject', 'Rebutja', 'account-danger'));
      }
      if (item.status === 'APPROVED') {
        actions.append(accountAction(item, 'suspend', 'Suspèn', 'account-danger'));
      }
    }
    row.append(details, actions);
    adminList.append(row);
  }
  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'account-admin-empty';
    empty.textContent = 'No hi ha comptes per revisar.';
    adminList.append(empty);
  }
}

async function loadAdminAccounts() {
  const { response, data } = await adminRequest();
  if (!response.ok || !Array.isArray(data.items)) throw new Error('admin list');
  renderAdminAccounts(data.items);
}

function renderStations(items) {
  stationList.replaceChildren();
  for (const item of items) {
    const row = document.createElement('li');
    const form = document.createElement('form');
    const nameLabel = document.createElement('label');
    const name = document.createElement('input');
    const descriptionLabel = document.createElement('label');
    const description = document.createElement('input');
    const state = document.createElement('span');
    const actions = document.createElement('div');
    const save = document.createElement('button');
    form.className = 'account-station-edit';
    nameLabel.textContent = 'Nom';
    name.name = 'station-name-edit';
    name.value = item.name;
    name.minLength = 2;
    name.maxLength = 100;
    name.required = true;
    name.disabled = !item.can_edit;
    descriptionLabel.textContent = 'Descripció';
    description.name = 'station-description-edit';
    description.value = item.description || '';
    description.maxLength = 500;
    description.disabled = !item.can_edit;
    state.className = 'account-state';
    state.textContent = item.lifecycle === 'RETIRED' ? 'Retirada' : item.lifecycle === 'DRAFT' ? 'Esborrany privat' : item.visibility === 'PUBLIC' ? 'Activa pública' : 'Activa privada';
    actions.className = 'account-admin-actions';
    save.type = 'submit';
    save.textContent = 'Desa';
    actions.append(save);
    if (item.can_edit) {
      const retire = document.createElement('button');
      retire.type = 'button';
      retire.className = 'account-danger';
      retire.textContent = 'Retira';
      retire.addEventListener('click', async () => {
        if (retire.dataset.confirm !== 'true') {
          retire.dataset.confirm = 'true';
          retire.textContent = 'Confirma la retirada';
          message('Torna a prémer el botó per retirar l’estació. Les mesures es conservaran.');
          return;
        }
        retire.disabled = true;
        try {
          const { response } = await stationRequest(`/${encodeURIComponent(item.id)}`, {
            method: 'DELETE', body: JSON.stringify({ revision: item.revision }),
          });
          if (!response.ok) throw new Error('retire');
          await loadStations();
          message('Estació retirada. Les mesures conservades ja no són accessibles com a dades actuals.');
        } catch {
          retire.disabled = false;
          message('No s’ha pogut retirar l’estació. Actualitza la llista i torna-ho a provar.');
        }
      });
      actions.append(retire);
    } else {
      save.hidden = true;
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      save.disabled = true;
      try {
        const { response } = await stationRequest(`/${encodeURIComponent(item.id)}`, {
          method: 'PATCH', body: JSON.stringify({
            name: name.value, description: description.value, revision: item.revision,
          }),
        });
        if (!response.ok) throw new Error('update');
        await loadStations();
        message('Estació actualitzada.');
      } catch {
        save.disabled = false;
        message('No s’ha pogut desar. Pot ser que la versió hagi canviat; actualitza la llista.');
      }
    });
    const connector = document.createElement('details');
    const connectorSummary = document.createElement('summary');
    const connectorFields = document.createElement('div');
    connector.className = 'account-connector';
    connectorSummary.textContent = 'Configura Ecowitt';
    connectorFields.className = 'account-connector-fields';
    const secretFields = [
      ['Application key', 'application_key'],
      ['API key', 'api_key'],
      ['MAC / identificador', 'mac'],
    ].map(([labelText, key]) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      label.textContent = labelText;
      input.type = 'password';
      input.autocomplete = 'off';
      input.dataset.connectorKey = key;
      input.minLength = 3;
      input.maxLength = 256;
      label.append(input);
      return { key, label, input };
    });
    const connectorSave = document.createElement('button');
    connectorSave.type = 'button';
    connectorSave.textContent = 'Desa les credencials';
    connectorSave.addEventListener('click', async () => {
      if (secretFields.some(({ input }) => input.value.trim().length < 3)) {
        message('Completa les tres credencials Ecowitt.');
        return;
      }
      connectorSave.disabled = true;
      try {
        const payload = Object.fromEntries(secretFields.map(({ key, input }) => [key, input.value]));
        const { response } = await stationRequest(`/${encodeURIComponent(item.id)}/connector/ecowitt`, {
          method: 'PUT', body: JSON.stringify(payload),
        });
        for (const { input } of secretFields) input.value = '';
        if (!response.ok) throw new Error('connector');
        connector.open = false;
        await loadStations();
        message('Connector Ecowitt configurat. Les credencials no es tornaran a mostrar.');
      } catch {
        message('No s’ha pogut configurar Ecowitt. Revisa les tres credencials.');
      } finally { connectorSave.disabled = false; }
    });
    connectorFields.append(...secretFields.map(({ label }) => label), connectorSave);
    connector.append(connectorSummary, connectorFields);
    const location = document.createElement('details');
    const locationSummary = document.createElement('summary');
    const locationFields = document.createElement('div');
    location.className = 'account-connector account-location';
    locationSummary.textContent = 'Ubicació i publicació al mapa';
    locationFields.className = 'account-location-fields';
    const longitudeLabel = document.createElement('label');
    const longitude = document.createElement('input');
    longitudeLabel.textContent = 'Longitud (−180 a 180)';
    longitude.type = 'number'; longitude.name = 'longitude'; longitude.step = 'any'; longitude.min = '-180'; longitude.max = '180';
    longitudeLabel.append(longitude);
    const latitudeLabel = document.createElement('label');
    const latitude = document.createElement('input');
    latitudeLabel.textContent = 'Latitud (−90 a 90)';
    latitude.type = 'number'; latitude.name = 'latitude'; latitude.step = 'any'; latitude.min = '-90'; latitude.max = '90';
    latitudeLabel.append(latitude);
    const modeLabel = document.createElement('label');
    const mode = document.createElement('select');
    modeLabel.textContent = 'Precisió pública';
    for (const [value, text] of [['HIDDEN', 'Ubicació oculta'], ['APPROX_1KM', 'Aproximada a 1 km'], ['APPROX_5KM', 'Aproximada a 5 km'], ['APPROX_10KM', 'Aproximada a 10 km']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = text; mode.append(option);
    }
    modeLabel.append(mode);
    const publishLabel = document.createElement('label');
    const publish = document.createElement('input');
    publish.type = 'checkbox'; publishLabel.className = 'account-check'; publishLabel.append(publish, document.createTextNode(' Publica l’estació'));
    const consentLabel = document.createElement('label');
    const consent = document.createElement('input');
    consent.type = 'checkbox'; consentLabel.className = 'account-check';
    consentLabel.append(consent, document.createTextNode(' Autoritzo publicar el nom, les dades i la ubicació aproximada seleccionada'));
    const locationHelp = document.createElement('p');
    locationHelp.textContent = 'Per publicar cal una lectura vàlida. La coordenada exacta només és visible al teu mapa privat.';
    const locationSave = document.createElement('button');
    locationSave.type = 'button'; locationSave.textContent = 'Desa la ubicació';
    let loadedLocation = false;
    location.addEventListener('toggle', async () => {
      if (!location.open || loadedLocation) return;
      try {
        const { response, data } = await stationRequest(`/${encodeURIComponent(item.id)}/location`);
        if (!response.ok) throw new Error('location');
        longitude.value = data.location.longitude ?? '';
        latitude.value = data.location.latitude ?? '';
        mode.value = data.location.mode;
        publish.checked = data.location.published;
        consent.checked = data.location.consented;
        loadedLocation = true;
      } catch { message('No s’ha pogut carregar la ubicació de l’estació.'); }
    });
    locationSave.addEventListener('click', async () => {
      const longitudeValue = longitude.valueAsNumber;
      const latitudeValue = latitude.valueAsNumber;
      if (!Number.isFinite(longitudeValue) || longitudeValue < -180 || longitudeValue > 180) {
        location.open = true;
        longitude.focus();
        message('Introdueix una longitud vàlida entre −180 i 180.');
        return;
      }
      if (!Number.isFinite(latitudeValue) || latitudeValue < -90 || latitudeValue > 90) {
        location.open = true;
        latitude.focus();
        message('Introdueix una latitud vàlida entre −90 i 90.');
        return;
      }
      locationSave.disabled = true;
      try {
        const { response, data } = await stationRequest(`/${encodeURIComponent(item.id)}/location`, {
          method: 'PUT', body: JSON.stringify({
            longitude: longitudeValue, latitude: latitudeValue,
            mode: mode.value, publish: publish.checked, consent: consent.checked, revision: item.revision,
          }),
        });
        if (!response.ok) {
          if (data.error === 'publication_requirements') {
            message('Per publicar cal que el compte estigui aprovat i l’estació tingui connector i una lectura vàlida.');
            return;
          }
          throw new Error(data.error || 'location');
        }
        await loadStations();
        message(publish.checked ? 'Ubicació aproximada publicada.' : 'Ubicació desada com a privada.');
      } catch { message('No s’ha pogut desar la ubicació. Revisa coordenades i versió.'); }
      finally { locationSave.disabled = false; }
    });
    locationFields.append(longitudeLabel, latitudeLabel, modeLabel, publishLabel, consentLabel, locationHelp, locationSave);
    location.append(locationSummary, locationFields);
    form.append(nameLabel, name, descriptionLabel, description, state, actions, connector, location);
    row.append(form);
    stationList.append(row);
  }
  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'account-admin-empty';
    empty.textContent = 'Encara no tens cap estació.';
    stationList.append(empty);
  }
}

async function loadStations() {
  const { response, data } = await stationRequest();
  if (!response.ok || !Array.isArray(data.items)) throw new Error('station list');
  renderStations(data.items);
}

function showSignedIn(user, csrf) {
  csrfToken = csrf;
  currentUser = user;
  get('#account-name').textContent = user.name || user.email;
  show(signedIn);
  message('Sessió activa.');
  accountCard.classList.add('account-card-wide');
  loadStations().catch(() => message('Sessió activa, però no s’han pogut carregar les estacions.'));
  if (user.role === 'SUPERADMIN') {
    adminPanel.hidden = false;
    accountCard.classList.add('account-card-wide');
    loadAdminAccounts().catch(() => message('Sessió activa, però no s’ha pogut carregar la cua de comptes.'));
    loadPublicView().catch(() => message('Sessió activa, però no s’ha pogut carregar la vista pública.'));
    loadAdminCatalog().catch(() => message('Sessió activa, però no s’ha pogut carregar el catàleg administrat.'));
    loadImports().catch(() => message('Sessió activa, però no s’han pogut carregar les importacions.'));
    loadGrafanaStations().catch(() => message('Sessió activa, però no s’ha pogut carregar el catàleg intern de Grafana.'));
  }
}

publicViewForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const cardIds = publicViewOrder.filter((id) => publicViewCards.querySelector(`input[data-card-id="${id}"]`)?.checked);
  if (!publicViewStation.value || cardIds.length === 0) {
    message('Selecciona una estació i almenys una targeta pública.');
    return;
  }
  const button = publicViewForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const { response, data } = await publicViewRequest({
      method: 'PUT', body: JSON.stringify({ station_id: publicViewStation.value, card_ids: cardIds, revision: publicViewRevision }),
    });
    if (!response.ok) {
      message(response.status === 409
        ? 'La vista pública ha canviat. Actualitza-la abans de tornar a desar.'
        : 'No s’ha pogut desar aquesta vista pública.');
      return;
    }
    publicViewRevision = data.config.revision;
    message('Vista meteorològica pública actualitzada.');
  } catch { message('No s’ha pogut contactar amb el servidor.'); }
  finally { button.disabled = false; }
});

catalogCreate.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = catalogCreate.querySelector('button[type="submit"]');
  const elements = catalogCreate.elements;
  const fields = {
    name: elements.namedItem('name'), description: elements.namedItem('description'),
    source: elements.namedItem('source_namespace'), externalId: elements.namedItem('external_id'),
    longitude: elements.namedItem('longitude'), latitude: elements.namedItem('latitude'),
    accuracy: elements.namedItem('accuracy_m'), provenance: elements.namedItem('provenance'),
    reference: elements.namedItem('reference_label'),
  };
  button.disabled = true;
  try {
    const { response, data } = await catalogRequest('', {
      method: 'POST', body: JSON.stringify(catalogPayload(fields)),
    });
    if (!response.ok) {
      message(response.status === 409
        ? 'Aquesta identitat de font ja està assignada a una altra estació.'
        : 'No s’ha pogut afegir l’estació al catàleg. Revisa les dades.');
      return;
    }
    catalogCreate.reset();
    await loadAdminCatalog();
    message(`Estació administrada «${data.station.name}» creada com a privada.`);
  } catch { message('No s’ha pogut contactar amb el servidor.'); }
  finally { button.disabled = false; }
});

importFile.addEventListener('change', async () => {
  const [file] = importFile.files;
  if (!file) return;
  try { importJson.value = await file.text(); message('Fitxer carregat. Ja pots previsualitzar el lot.'); }
  catch { message('No s’ha pogut llegir el fitxer JSON.'); }
});

importForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = importForm.querySelector('button[type="submit"]');
  let parsed;
  try { parsed = JSON.parse(importJson.value); }
  catch { message('El contingut no és un JSON vàlid.'); importJson.focus(); return; }
  const rows = Array.isArray(parsed) ? parsed : parsed?.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    message('El JSON ha de contenir un array de files no buit.'); importJson.focus(); return;
  }
  button.disabled = true;
  try {
    const { response, data } = await importRequest('/dry-run', {
      method: 'POST', body: JSON.stringify({ source_namespace: importSource.value, rows }),
    });
    if (!response.ok) {
      message(response.status === 400 ? 'L’inventari té un format no vàlid.' : 'No s’ha pogut validar el lot.');
      return;
    }
    await loadImports();
    message(data.idempotent ? `Aquest lot ja existia com a lot ${data.batch.id}.` : `Dry-run creat com a lot ${data.batch.id}. Revisa les files abans d’aplicar-lo.`);
  } catch { message('No s’ha pogut contactar amb el servidor.'); }
  finally { button.disabled = false; }
});

get('#account-imports-refresh').addEventListener('click', () => {
  loadImports().then(() => message('Llista d’importacions actualitzada.'))
    .catch(() => message('No s’han pogut actualitzar les importacions.'));
});

get('#account-grafana-refresh').addEventListener('click', () => {
  loadGrafanaStations().then(() => message('Catàleg intern de Grafana actualitzat.'))
    .catch(() => message('No s’ha pogut actualitzar el catàleg intern de Grafana.'));
});

async function initialize() {
  const fragment = new URLSearchParams(location.hash.slice(1));
  resetToken = fragment.get('reset');
  const verifyToken = fragment.get('verify');
  if (resetToken) {
    history.replaceState(null, '', location.pathname);
    show(resetForm);
    message('Introdueix una contrasenya nova.');
    return;
  }
  if (verifyToken) {
    history.replaceState(null, '', location.pathname);
    show(null);
    message('Verificant el correu…');
    try {
      const { response } = await post('verify-email', { token: verifyToken });
      show(loginForm);
      message(response.ok
        ? 'Correu verificat. La sol·licitud queda pendent d’aprovació administrativa.'
        : 'L’enllaç de verificació ha caducat o ja s’ha utilitzat.');
    } catch {
      show(loginForm);
      message('No s’ha pogut contactar amb el servidor.');
    }
    return;
  }
  try {
    const response = await fetch(`${CONFIG.apiBase}/v1/auth/me`, { credentials: 'same-origin', cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      showSignedIn(data.user, data.csrf_token);
      return;
    }
    if (response.status === 404 && CONFIG.environment === 'local') {
      show(null);
      message('Aquesta previsualització no gestiona comptes. Obre http://127.0.0.1:8088/meteo/compte/ per iniciar sessió.');
      return;
    }
  } catch { /* Mostra el formulari; la connexió es comprova en enviar-lo. */ }
  show(loginForm);
  message('Inicia sessió per gestionar les teves estacions.');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  message('Comprovant les credencials…');
  try {
    const { response, data } = await post('login', {
      email: get('#login-email').value,
      password: get('#login-password').value,
    });
    get('#login-password').value = '';
    if (!response.ok) {
      message(response.status === 429 ? 'Massa intents. Torna-ho a provar més tard.' : 'No s’ha pogut iniciar sessió.');
      return;
    }
    showSignedIn(data.user, data.csrf_token);
  } catch { message('No s’ha pogut contactar amb el servidor.'); }
});

get('#account-logout').addEventListener('click', async () => {
  try {
    const { response } = await post('logout', {}, csrfToken);
    if (!response.ok) throw new Error('logout');
    csrfToken = null;
    currentUser = null;
    localStorage.removeItem('tecnolord-store-v1');
    show(loginForm);
    message('Sessió tancada.');
  } catch { message('No s’ha pogut tancar la sessió.'); }
});

toggleRegister.addEventListener('click', () => {
  show(registerForm);
  message('Omple les dades per demanar accés.');
});

toggleRecover.addEventListener('click', () => {
  show(recoverForm);
  message('Escriu el correu del teu compte.');
});

backLogin.addEventListener('click', () => {
  show(loginForm);
  message('Inicia sessió per gestionar les teves estacions.');
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  message('Enviant la sol·licitud…');
  try {
    const { response } = await post('request', {
      name: get('#register-name').value,
      email: get('#register-email').value,
      password: get('#register-password').value,
    });
    get('#register-password').value = '';
    if (!response.ok) {
      message(response.status === 429
        ? 'Massa intents. Torna-ho a provar més tard.'
        : 'Revisa el nom, el correu i la contrasenya.');
      return;
    }
    registerForm.reset();
    show(loginForm);
    message('Sol·licitud rebuda. Revisa el correu per verificar l’adreça.');
  } catch { message('No s’ha pogut contactar amb el servidor.'); }
});

recoverForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const { response } = await post('recover', { email: get('#recover-email').value });
    message(response.ok
      ? 'Si el compte existeix, rebràs un enllaç per canviar la contrasenya.'
      : 'La recuperació encara no està disponible en aquest entorn.');
  } catch { message('No s’ha pogut contactar amb el servidor.'); }
});

resetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const { response } = await post('reset', { token: resetToken, password: get('#reset-password').value });
    get('#reset-password').value = '';
    resetToken = null;
    if (!response.ok) {
      message('L’enllaç ha caducat o no és vàlid. Sol·licita’n un altre.');
      show(recoverForm);
      return;
    }
    show(loginForm);
    message('Contrasenya canviada. Ja pots iniciar sessió.');
  } catch { message('No s’ha pogut contactar amb el servidor.'); }
});

get('#account-admin-refresh').addEventListener('click', () => {
  loadAdminAccounts()
    .then(() => message('Cua de comptes actualitzada.'))
    .catch(() => message('No s’ha pogut actualitzar la cua de comptes.'));
});

get('#account-stations-refresh').addEventListener('click', () => {
  loadStations()
    .then(() => message('Llista d’estacions actualitzada.'))
    .catch(() => message('No s’ha pogut actualitzar la llista d’estacions.'));
});

stationCreate.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submit = stationCreate.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const { response } = await stationRequest('', {
      method: 'POST',
      body: JSON.stringify({
        name: get('#station-name').value,
        description: get('#station-description').value,
      }),
    });
    if (!response.ok) throw new Error('create');
    stationCreate.reset();
    await loadStations();
    message('Estació creada com a esborrany privat.');
  } catch {
    message('No s’ha pogut crear l’estació. Revisa les dades i torna-ho a provar.');
  } finally { submit.disabled = false; }
});

initialize();
