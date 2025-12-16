import { CONFIG } from "../config.js";
import { getJSON } from "./api.js";

export async function fetchMeteo({ estacio, limit }) {
  const params = { limit };
  if (estacio) params.estacio = estacio;

  const data = await getJSON(CONFIG.meteoEndpoint, params);
  if (!data.ok) throw new Error(data.error || "error");
  return data.items || [];
}
