function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function hiDpi(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 300;
  const cssH = canvas.clientHeight || 150;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function niceRange(min, max, ticks = 5) {
  const span = max - min || 1;
  const step0 = span / ticks;
  const p = Math.pow(10, Math.floor(Math.log10(step0)));
  const err = step0 / p;
  let step = p;
  if (err >= 7.5) step = 10 * p;
  else if (err >= 3.5) step = 5 * p;
  else if (err >= 1.5) step = 2 * p;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  return { min: niceMin, max: niceMax, step };
}

function formatHourLabel(d) {
  const hh = String(d.getHours()).padStart(2, "0");
  return `${hh}h`;
}

function parseRgb(str) {
  // Accepta "rgb(r,g,b)" o "#rrggbb"
  if (!str) return null;
  const s = String(str).trim();
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
    return null;
  }
  const m = s.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (!m) return null;
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
}

function rgba(rgb, a) {
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

function pickThemeColor(el) {
  // Llegeix variables CSS si existeixen; si no, fallback
  const cs = getComputedStyle(el);
  const text = cs.getPropertyValue("--text")?.trim() || "rgb(17,24,39)";
  const line = cs.getPropertyValue("--line")?.trim() || "rgba(0,0,0,.15)";
  const accent = cs.getPropertyValue("--accent")?.trim() || "#60a5fa";

  const textRgb = parseRgb(text) || { r: 17, g: 24, b: 39 };
  const lineRgb = parseRgb(line) || { r: 0, g: 0, b: 0 };
  const accentRgb = parseRgb(accent) || { r: 96, g: 165, b: 250 };

  return {
    text: rgba(textRgb, 0.9),
    grid: rgba(lineRgb, 0.18),
    accent: accentRgb,
  };
}

// ===============
// Render 1 sèrie
// ===============
export function renderLineChart(canvas, points, opts = {}) {
  const ctx = hiDpi(canvas);

  const W = canvas.clientWidth || 300;
  const H = canvas.clientHeight || 160;

  ctx.clearRect(0, 0, W, H);

  const theme = pickThemeColor(canvas);
  const axisText = theme.text;
  const gridStroke = theme.grid;

  if (!points || points.length < 2) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = axisText;
    ctx.font = "600 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.fillText("Sense dades suficients per dibuixar", W / 2, H / 2);
    ctx.globalAlpha = 1;
    return;
  }

  const xs = points.map((p) => p.t.getTime());
  const ys = points.map((p) => p.y);

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
    yMin = 0;
    yMax = 1;
  }
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }

  const padL = 44;
  const padR = 14;
  const padT = 14;
  const padB = 30;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xr = xMax - xMin || 1;
  const yr = yMax - yMin || 1;

  const xToPx = (x) => padL + ((x - xMin) / xr) * innerW;
  const yToPx = (y) => padT + (1 - (y - yMin) / yr) * innerH;

  // grid Y
  const { min: y0, max: y1, step } = niceRange(yMin, yMax, 4);
  ctx.strokeStyle = gridStroke;
  ctx.lineWidth = 1;
  ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillStyle = axisText;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let y = y0; y <= y1 + 1e-9; y += step) {
    const py = yToPx(y);
    ctx.beginPath();
    ctx.moveTo(padL, py);
    ctx.lineTo(W - padR, py);
    ctx.stroke();
    ctx.fillText(String(Math.round(y * 10) / 10), padL - 8, py);
  }

  // ticks X (aprox 6)
  const tickN = 6;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let i = 0; i <= tickN; i++) {
    const tx = xMin + (xr * i) / tickN;
    const px = xToPx(tx);
    ctx.beginPath();
    ctx.moveTo(px, H - padB);
    ctx.lineTo(px, H - padB + 4);
    ctx.strokeStyle = gridStroke;
    ctx.stroke();

    const d = new Date(tx);
    ctx.fillStyle = axisText;
    ctx.fillText(formatHourLabel(d), px, H - padB + 6);
  }

  // línia
  const rgb = parseRgb(opts.lineColor) || theme.accent;
  ctx.strokeStyle = rgba(rgb, 0.95);
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const px = xToPx(p.t.getTime());
    const py = yToPx(p.y);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // punts (suau)
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = rgba(rgb, 0.95);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const px = xToPx(p.t.getTime());
    const py = yToPx(p.y);
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// =====================
// Render múltiples sèries
// =====================
export function renderMultiLineChart(canvas, series, opts = {}) {
  const valid = (series || [])
    .map((s) => ({
      name: s?.name || "",
      points: Array.isArray(s?.points) ? s.points : [],
      color: s?.color,
    }))
    .filter((s) => s.points.length >= 2);

  if (valid.length <= 1) {
    const one = valid[0]?.points || [];
    return renderLineChart(canvas, one, { lineColor: valid[0]?.color || opts.lineColor });
  }

  // Aglomera domini global
  const allPts = valid.flatMap((s) => s.points);
  const xs = allPts.map((p) => p.t.getTime());
  const ys = allPts.map((p) => p.y);

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
    yMin = 0;
    yMax = 1;
  }
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }

  const ctx = hiDpi(canvas);
  const W = canvas.clientWidth || 300;
  const H = canvas.clientHeight || 160;
  ctx.clearRect(0, 0, W, H);

  const theme = pickThemeColor(canvas);
  const axisText = theme.text;
  const gridStroke = theme.grid;

  const padL = 44;
  const padR = 14;
  const padT = 14;
  const padB = 30;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xr = xMax - xMin || 1;
  const yr = yMax - yMin || 1;

  const xToPx = (x) => padL + ((x - xMin) / xr) * innerW;
  const yToPx = (y) => padT + (1 - (y - yMin) / yr) * innerH;

  // grid Y
  const { min: y0, max: y1, step } = niceRange(yMin, yMax, 4);
  ctx.strokeStyle = gridStroke;
  ctx.lineWidth = 1;
  ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillStyle = axisText;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let y = y0; y <= y1 + 1e-9; y += step) {
    const py = yToPx(y);
    ctx.beginPath();
    ctx.moveTo(padL, py);
    ctx.lineTo(W - padR, py);
    ctx.stroke();
    ctx.fillText(String(Math.round(y * 10) / 10), padL - 8, py);
  }

  // ticks X
  const tickN = 6;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let i = 0; i <= tickN; i++) {
    const tx = xMin + (xr * i) / tickN;
    const px = xToPx(tx);
    ctx.beginPath();
    ctx.moveTo(px, H - padB);
    ctx.lineTo(px, H - padB + 4);
    ctx.strokeStyle = gridStroke;
    ctx.stroke();

    const d = new Date(tx);
    ctx.fillStyle = axisText;
    ctx.fillText(formatHourLabel(d), px, H - padB + 6);
  }

  // Paleta simple (fallback) si no passen colors
  const fallback = ["#60a5fa", "#34d399", "#f59e0b", "#f87171"];

  // Dibuixa cada sèrie
  valid.forEach((s, idx) => {
    const rgb = parseRgb(s.color || fallback[idx % fallback.length]) || theme.accent;
    ctx.strokeStyle = rgba(rgb, 0.95);
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < s.points.length; i++) {
      const p = s.points[i];
      const px = xToPx(p.t.getTime());
      const py = yToPx(p.y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = rgba(rgb, 0.95);
    for (let i = 0; i < s.points.length; i++) {
      const p = s.points[i];
      const px = xToPx(p.t.getTime());
      const py = yToPx(p.y);
      ctx.beginPath();
      ctx.arc(px, py, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

export function buildDaySeries(rows, getter) {
  const pts = [];
  for (const r of rows) {
    const ts = r.instant ?? r.at;
    if (!ts) continue;
    const y = toNum(getter(r));
    if (y == null) continue;
    pts.push({ t: new Date(ts), y });
  }
  pts.sort((a, b) => a.t.getTime() - b.t.getTime());
  return pts;
}

// =====================
// Component DOM (export que et faltava)
// =====================
export function lineChart(opts = {}) {
  const title = opts.title || "";
  const seriesIn = Array.isArray(opts.series) ? opts.series : [];

  const section = document.createElement("section");
  section.className = "charts-section";

  const h3 = document.createElement("h3");
  h3.textContent = title;
  section.appendChild(h3);

  if (seriesIn.length > 1) {
    const legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.style.display = "flex";
    legend.style.flexWrap = "wrap";
    legend.style.gap = "10px";
    legend.style.margin = "0 0 10px 0";
    legend.style.fontSize = "13px";
    legend.style.opacity = "0.9";

    const fallback = ["#60a5fa", "#34d399", "#f59e0b", "#f87171"];

    seriesIn.forEach((s, idx) => {
      const item = document.createElement("span");
      item.style.display = "inline-flex";
      item.style.alignItems = "center";
      item.style.gap = "6px";

      const dot = document.createElement("span");
      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.borderRadius = "999px";
      dot.style.background = s?.color || fallback[idx % fallback.length];

      const label = document.createElement("span");
      label.textContent = s?.name || `Sèrie ${idx + 1}`;

      item.appendChild(dot);
      item.appendChild(label);
      legend.appendChild(item);
    });

    section.appendChild(legend);
  }

  const wrap = document.createElement("div");
  wrap.className = "chart-container";

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "180px";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", title || "Gràfica");

  wrap.appendChild(canvas);
  section.appendChild(wrap);

  const toPoints = (pts) =>
    (Array.isArray(pts) ? pts : [])
      .map((p) => {
        const x = toNum(p?.x);
        const y = toNum(p?.y);
        if (x == null || y == null) return null;
        return { t: new Date(x), y };
      })
      .filter(Boolean)
      .sort((a, b) => a.t.getTime() - b.t.getTime());

  const series = seriesIn.map((s) => ({
    name: s?.name || "",
    color: s?.color,
    points: toPoints(s?.points),
  }));

  const draw = () => {
    // assegura que ja tingui mida (sobretot si encara no està al DOM)
    if (!canvas.isConnected) return;
    renderMultiLineChart(canvas, series);
  };

  // pinta quan ja estigui al DOM
  requestAnimationFrame(draw);

  // redibuixa en resize del contenidor
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
  } else {
    window.addEventListener("resize", draw, { passive: true });
  }

  return section;
}
