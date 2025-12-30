// ui/format.js

export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export function num(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function fmt1(v) {
  const n = num(v);
  if (n === null) return "—";
  return n.toFixed(1);
}

// >>> AFEGIT per arreglar: import { fmt2 } from '../format.js'
export function fmt2(v) {
  const n = num(v);
  if (n === null) return "—";
  return n.toFixed(2);
}

export function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function norm(s) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function windAbbr16(deg) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const i = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return dirs[i];
}

export function windNameCa(deg) {
  const names = ["Tramuntana","Gregal","Llevant","Xaloc","Migjorn","Llebeig","Ponent","Mestral"];
  const i = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return names[i];
}

export function windFromCa(deg) {
  // “del Nord”, “del Nord-est”, etc.
  const dirs = ["Nord","Nord-est","Est","Sud-est","Sud","Sud-oest","Oest","Nord-oest"];
  const i = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return dirs[i];
}
export function cell(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}
