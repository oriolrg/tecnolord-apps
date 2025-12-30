import { apiGet } from "./api.js";

export async function fetchMeteo({ estacio, limit, period, date_from, date_to }) {
  const params = new URLSearchParams();
  if (estacio) params.set("estacio", estacio);
  if (period) params.set("period", period);
  if (date_from) params.set("from", date_from);
  if (date_to) params.set("to", date_to);
  params.set("limit", String(limit));

  const data = await apiGet(`/api/v1/mesures/darreres?${params.toString()}`);
  return data?.items || [];
}
