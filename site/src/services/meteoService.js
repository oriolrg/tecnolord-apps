import { CONFIG } from "../config.js";

async function httpGetJson(url) {
  const r = await fetch(url, { headers: { "accept": "application/json" }, credentials: "same-origin", cache: "no-store" });
  if (!r.ok) {
    const error = new Error(`HTTP ${r.status}`);
    error.status = r.status;
    throw error;
  }
  return r.json();
}

export async function fetchStationCatalog(includeOwn = true) {
  const [publicResult, ownResult, estimationResult] = await Promise.all([
    httpGetJson("/api/v1/stations"),
    includeOwn ? fetch("/api/v1/me/stations", {
      headers: { accept: "application/json" }, credentials: "same-origin",
    }).then((response) => response.ok ? response.json() : { items: [] }) : Promise.resolve({ items: [] }),
    httpGetJson("/api/v1/estimations").catch(() => ({ items: [] })),
  ]);
  const byId = new Map();
  for (const station of publicResult?.items || []) {
    byId.set(station.id, { ...station, kind: "STATION", owned: false });
  }
  for (const station of ownResult?.items || []) {
    byId.set(station.id, { ...station, kind: "STATION", owned: true });
  }
  for (const estimation of estimationResult?.items || []) {
    byId.set(`estimation:${estimation.id}`, {
      ...estimation, id: `estimation:${estimation.id}`, resource_id: estimation.id,
      kind: "ESTIMATION", owned: false, visibility: "PUBLIC", lifecycle: "ACTIVE",
    });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "ca"));
}

export async function fetchMeteoSession() {
  const response = await fetch("/api/v1/auth/me", {
    headers: { accept: "application/json" }, credentials: "same-origin", cache: "no-store",
  });
  if (response.status === 401 || response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function fetchStationPreference() {
  return (await httpGetJson("/api/v1/me/preferences")).preference;
}

export async function fetchPublicView() {
  return (await httpGetJson("/api/v1/public-view")).config;
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

export async function fetchStationCurrent(stationId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stationId || "")) {
    throw new Error("Identificador d’estació no vàlid");
  }
  return httpGetJson(`/api/v1/stations/${encodeURIComponent(stationId)}/current`);
}

export async function fetchEstimationCurrent(estimationId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(estimationId || "")) {
    throw new Error("Identificador d’estimació no vàlid");
  }
  return httpGetJson(`/api/v1/estimations/${encodeURIComponent(estimationId)}/current`);
}

export async function fetchMeteoPayload({ estacio, limit, period, date_from, date_to }) {
  const params = new URLSearchParams();
  if (estacio) params.set("estacio", estacio);
  if (period) params.set("period", period);
  if (date_from) params.set("from", date_from);
  if (date_to) params.set("to", date_to);
  params.set("limit", String(limit || CONFIG.defaultLimit));

  const url = `${CONFIG.meteoEndpoint}?${params.toString()}`;

  return httpGetJson(url);
}

export async function fetchMeteo(options) {
  return (await fetchMeteoPayload(options))?.items || [];
}
