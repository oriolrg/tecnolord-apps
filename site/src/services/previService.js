import { CONFIG } from "../config.js";

export async function fetchPrevi() {
  const params = new URLSearchParams();
  if (CONFIG.syntheticData) {
    params.set("station", "synthetic-meteo-01");
    params.set("source", "synthetic");
    params.set("model", "fixture-v1");
  }

  const query = params.toString();
  const response = await fetch(`${CONFIG.previEndpoint}${query ? `?${query}` : ""}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  return response.json();
}
