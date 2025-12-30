// services/api.js
// Wrapper simple per fer GET/POST JSON amb errors coherents.

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function getJSON(path, params) {
  const url = `${path}${buildQuery(params)}`;
  const r = await fetch(url, { method: "GET" });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} ${r.statusText}${t ? " · " + t : ""}`);
  }
  return r.json();
}

// Alias per compatibilitat amb imports antics: import { apiGet } from './api.js'
export const apiGet = getJSON;

export async function postJSON(path, body, params) {
  const url = `${path}${buildQuery(params)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} ${r.statusText}${t ? " · " + t : ""}`);
  }
  return r.json();
}

// Alias opcional
export const apiPost = postJSON;
