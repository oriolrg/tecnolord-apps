export const fmtTime = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso || ""; } };
export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export const num = (v) => (v == null || v === "" ? null : Number(v));
export const cell = (v) => (v == null || v === "" ? "Sensor no disponible" : v);

export const fmt1 = (v) =>
  (v == null || Number.isNaN(v)) ? "Sensor no disponible" : (Math.round(v * 10) / 10).toFixed(1);


export const norm = (s) => (s ?? "").toString().trim().toLowerCase();

export function degToCompass(deg) {
  if (deg == null || Number.isNaN(deg)) return null;
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  const i = Math.round(deg / 45) % 8;
  return dirs[i];
}

export function degToArrow(deg) {
  if (deg == null || Number.isNaN(deg)) return "↑";
  const arrows = ["↑","↗","→","↘","↓","↙","←","↖"];
  const i = Math.round(deg / 45) % 8;
  return arrows[i];
}
export function windNameCa(deg) {
  if (deg == null || Number.isNaN(deg)) return "";
  const d = ((deg % 360) + 360) % 360;

  // 8 vents (cada 45°). Llindars a mig camí (22.5°)
  if (d < 22.5 || d >= 337.5) return "tramuntana";
  if (d < 67.5)  return "gregal";
  if (d < 112.5) return "llevant";
  if (d < 157.5) return "xaloc";
  if (d < 202.5) return "migjorn";
  if (d < 247.5) return "garbí";
  if (d < 292.5) return "ponent";
  return "mestral";
}
export function windAbbr16(deg){
  const d = ((deg % 360) + 360) % 360;
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(d / 22.5) % 16];
}

export function windFromCa(deg){
  const a = windAbbr16(deg);
  // “del” + punt cardinal en català (abreujat → text)
  if (a.startsWith("N")) return "nord";
  if (a.startsWith("S")) return "sud";
  if (a.startsWith("E")) return "est";
  return "oest";
}
