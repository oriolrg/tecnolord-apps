import { CONFIG } from "../config.js";
import { getJSON } from "./api.js";

export async function fetchHidro({ codi, limit }) {
  const params = { limit };
  if (codi) params.codi = codi;

  const data = await getJSON(CONFIG.hidroEndpoint, params);
  if (!data.ok) throw new Error(data.error || "error");
  return data.items || [];
}
