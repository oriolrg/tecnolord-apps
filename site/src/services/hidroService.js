import { apiGet } from "./api.js";

export async function fetchHidro({ codi, limit, period, date_from, date_to, mode, ensure }) {
  const params = new URLSearchParams();
  if (codi) params.set("codi", codi);
  if (period) params.set("period", period);
  if (date_from) params.set("from", date_from);
  if (date_to) params.set("to", date_to);
  if (mode) params.set("mode", mode);
  if (ensure != null) params.set("ensure", String(ensure ? 1 : 0));
  params.set("limit", String(limit));

  const data = await apiGet(`/api/v1/hidro/darreres?${params.toString()}`);
  return data?.items || [];
}
