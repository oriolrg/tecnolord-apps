import { CONFIG } from "../config.js";

async function httpGetJson(url, { signal } = {}) {
  const r = await fetch(url, {
    headers: { "accept": "application/json" }, credentials: "same-origin", cache: "no-store", signal,
  });
  if (!r.ok) {
    const error = new Error(`HTTP ${r.status}`);
    error.status = r.status;
    throw error;
  }
  return r.json();
}

export async function fetchStationCatalog(options = true) {
  const settings = typeof options === "boolean" ? { includeOwn: options } : (options || {});
  const { includeOwn = true, includeAdmin = false, signal } = settings;
  const [publicResult, ownResult, adminResult, estimationResult] = await Promise.all([
    httpGetJson("/api/v1/stations", { signal }),
    includeOwn ? fetch("/api/v1/me/stations", {
      headers: { accept: "application/json" }, credentials: "same-origin", signal,
    }).then((response) => response.ok ? response.json() : { items: [] }) : Promise.resolve({ items: [] }),
    includeAdmin ? httpGetJson("/api/v1/admin/stations", { signal }).catch((error) => {
      if (error?.name === "AbortError") throw error;
      return { items: [] };
    }) : Promise.resolve({ items: [] }),
    httpGetJson("/api/v1/estimations", { signal }).catch((error) => {
      if (error?.name === "AbortError") throw error;
      return { items: [] };
    }),
  ]);
  const byId = new Map();
  for (const station of publicResult?.items || []) {
    byId.set(station.id, { ...station, kind: "STATION", owned: false });
  }
  for (const station of ownResult?.items || []) {
    byId.set(station.id, { ...station, kind: "STATION", owned: true });
  }
  for (const station of adminResult?.items || []) {
    const existing = byId.get(station.id);
    byId.set(station.id, {
      ...existing, ...station, kind: "STATION", owned: existing?.owned === true, administrative: true,
    });
  }
  for (const estimation of estimationResult?.items || []) {
    byId.set(`estimation:${estimation.id}`, {
      ...estimation, id: `estimation:${estimation.id}`, resource_id: estimation.id,
      kind: "ESTIMATION", owned: false, visibility: "PUBLIC", lifecycle: "ACTIVE",
    });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "ca"));
}

export async function fetchMeteoSession({ signal } = {}) {
  const response = await fetch("/api/v1/auth/session", {
    headers: { accept: "application/json" }, credentials: "same-origin", cache: "no-store", signal,
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const session = await response.json();
  return session.authenticated ? session : null;
}

export async function fetchStationPreference({ signal } = {}) {
  return (await httpGetJson("/api/v1/me/preferences", { signal })).preference;
}

export async function fetchPublicView({ signal } = {}) {
  return (await httpGetJson("/api/v1/public-view", { signal })).config;
}

async function mutatePreference(method, stationId, revision, csrfToken) {
  const response = await fetch("/api/v1/me/preferences/default-station", {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      accept: "application/json", "content-type": "application/json", "x-csrf-token": csrfToken,
    },
    body: JSON.stringify(method === "PUT" ? { station_id: stationId, revision } : { revision }),
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return (await response.json()).preference;
}

export function setDefaultStation(stationId, revision, csrfToken) {
  return mutatePreference("PUT", stationId, revision, csrfToken);
}

export function clearDefaultStation(revision, csrfToken) {
  return mutatePreference("DELETE", null, revision, csrfToken);
}

export async function fetchStationCurrent(stationId, limit = CONFIG.defaultLimit, { signal } = {}) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stationId || "")) {
    throw new Error("Identificador d’estació no vàlid");
  }
  const encoded = encodeURIComponent(stationId);
  const [currentResult, historyResult] = await Promise.allSettled([
    httpGetJson(`/api/v1/stations/${encoded}/current`, { signal }),
    httpGetJson(`/api/v1/stations/${encoded}/history?limit=${clampLimit(limit)}`, { signal }),
  ]);
  if (currentResult.status === "rejected") throw currentResult.reason;
  const current = currentResult.value;
  const history = historyResult.status === "fulfilled" ? historyResult.value : { items: [] };
  const historyByInstant = new Map();
  for (const row of history.items || []) {
    const instant = row.instant ?? row.at;
    if (instant && !historyByInstant.has(instant)) historyByInstant.set(instant, row);
  }
  return {
    ...current,
    items: Array.isArray(current.items) ? current.items.slice(0, 1) : [],
    historyItems: [...historyByInstant.values()]
      .sort((left, right) => Date.parse(right.instant ?? right.at) - Date.parse(left.instant ?? left.at))
      .slice(0, clampLimit(limit)),
  };
}

function clampLimit(limit) {
  const value = Number.parseInt(limit, 10);
  return Number.isInteger(value) ? Math.min(Math.max(value, 1), 500) : CONFIG.defaultLimit;
}

export async function fetchEstimationCurrent(estimationId, { signal } = {}) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(estimationId || "")) {
    throw new Error("Identificador d’estimació no vàlid");
  }
  return httpGetJson(`/api/v1/estimations/${encodeURIComponent(estimationId)}/current`, { signal });
}

export async function fetchMeteoPayload({ estacio, limit, period, date_from, date_to, signal }) {
  const params = new URLSearchParams();
  if (estacio) params.set("estacio", estacio);
  if (period) params.set("period", period);
  if (date_from) params.set("from", date_from);
  if (date_to) params.set("to", date_to);
  params.set("limit", String(limit || CONFIG.defaultLimit));

  const url = `${CONFIG.meteoEndpoint}?${params.toString()}`;

  return httpGetJson(url, { signal });
}

export async function fetchMeteo(options) {
  return (await fetchMeteoPayload(options))?.items || [];
}
