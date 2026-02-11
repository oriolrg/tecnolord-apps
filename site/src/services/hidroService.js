import { CONFIG } from "../config.js";

async function httpGetJson(url) {
  const r = await fetch(url, { headers: { "accept": "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

export async function fetchHidro({ codi, limit, period, date_from, date_to, mode, ensure }) {
  const params = new URLSearchParams();
  if (codi) params.set("codi", codi);
  if (period) params.set("period", period);
  if (date_from) params.set("from", date_from);
  if (date_to) params.set("to", date_to);
  if (mode) params.set("mode", mode);
  if (ensure != null) params.set("ensure", String(ensure ? 1 : 0));
  params.set("limit", String(limit || CONFIG.defaultLimit));

  const base = (CONFIG?.apiBase || "").replace(/\/$/, "");
  const url = `${base}/api/v1/hidro/darreres?${params.toString()}`;

  const data = await httpGetJson(url);
  return data?.items || [];
}
