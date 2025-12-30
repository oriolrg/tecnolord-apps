import { CONFIG } from "../config.js";

async function httpGetJson(url) {
  const r = await fetch(url, { headers: { "accept": "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

export async function fetchMeteo({ estacio, limit, period, date_from, date_to }) {
  const params = new URLSearchParams();
  if (estacio) params.set("estacio", estacio);
  if (period) params.set("period", period);
  if (date_from) params.set("from", date_from);
  if (date_to) params.set("to", date_to);
  params.set("limit", String(limit));

  const base = (CONFIG?.apiBase || "").replace(/\/$/, "");
  const url = `${base}/api/v1/mesures/darreres?${params.toString()}`;

  const data = await httpGetJson(url);
  return data?.items || [];
}
