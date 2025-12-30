import { CONFIG } from "../config.js";

export async function apiGet(path) {
  const base = (CONFIG?.apiBase || "").replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const r = await fetch(url, { headers: { "accept": "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}
