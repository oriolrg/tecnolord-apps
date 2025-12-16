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
