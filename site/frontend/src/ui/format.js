export const fmtTime = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso || ""; } };
export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export const num = (v) => (v == null || v === "" ? null : Number(v));
export const cell = (v) => (v == null || v === "" ? "—" : v);

export const fmt1 = (v) =>
  (v == null || Number.isNaN(v)) ? "—" : (Math.round(v * 10) / 10).toFixed(1);

export const norm = (s) => (s ?? "").toString().trim().toLowerCase();
