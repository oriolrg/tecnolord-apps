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

function niceRange(min, max) {
  if (min == null || max == null) return { min: 0, max: 1 };
  if (min === max) return { min: min - 1, max: max + 1 };
  const pad = (max - min) * 0.08;
  return { min: min - pad, max: max + pad };
}

function formatHourLabel(d) {
  const hh = String(d.getHours()).padStart(2, "0");
  return `${hh}h`;
}

function parseRgb(cssColor) {
  // Accepta "rgb(r,g,b)" o "rgba(r,g,b,a)"
  const m = String(cssColor).match(/rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/i);
  if (!m) return null;
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
}

function rgba(rgb, a) {
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

/**
 * points: [{ t: Date, y: number }]
 * opts:
 *  - unit?: string
 *  - lineColor?: string
 *  - formatY?: (v:number)=>string
 */
export function renderLineChart(canvas, points, opts = {}) {
  const ctx = hiDpi(canvas);

  const W = canvas.clientWidth || 300;
  const H = canvas.clientHeight || 160;

  ctx.clearRect(0, 0, W, H);

  // Agafa color del tema (si és dark, normalment serà blanc)
  const cs = getComputedStyle(canvas);
  const textCss = cs.color || "#fff";
  const textRgb = parseRgb(textCss);
  const gridStroke = textRgb ? rgba(textRgb, 0.22) : "rgba(255,255,255,0.22)";
  const axisText = textCss;

  if (!points || points.length < 2) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = axisText;
    ctx.font = "600 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.fillText("Sense dades suficients per dibuixar", W / 2, H / 2);
    ctx.globalAlpha = 1;
    return;
  }

  const xs = points.map(p => p.t.getTime());
  const ys = points.map(p => p.y);

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  const yr = niceRange(yMin, yMax);
  yMin = yr.min;
  yMax = yr.max;

  const padR = 12;
  const padT = 10;
  const padB = 26;

  const fmtY =
    typeof opts.formatY === "function"
      ? opts.formatY
      : (v) => {
          const base = Math.round(v * 10) / 10;
          return `${base}${opts.unit ? " " + opts.unit : ""}`;
        };

  ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  const yLabelTexts = [fmtY(yMax), fmtY((yMin + yMax) / 2), fmtY(yMin)];
  let maxW = 0;
  for (const t of yLabelTexts) maxW = Math.max(maxW, ctx.measureText(t).width);

  const padL = Math.min(Math.max(36, Math.ceil(maxW + 14)), 74);

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xScale = (x) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const yScale = (y) => padT + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  // Grid
  ctx.lineWidth = 1;
  ctx.strokeStyle = gridStroke;

  for (let i = 0; i <= 3; i++) {
    const y = padT + (plotH * i) / 3;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
  }

  const start = new Date(xMin);
  start.setMinutes(0, 0, 0);
  const end = new Date(xMax);
  end.setMinutes(0, 0, 0);

  const hourStep = 2;
  for (let d = new Date(start); d <= end; d.setHours(d.getHours() + hourStep)) {
    const x = xScale(d.getTime());
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();
  }

  // Labels
  ctx.fillStyle = axisText;
  ctx.globalAlpha = 0.85;

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const yLabels = [
    { v: yMax, y: yScale(yMax) },
    { v: (yMin + yMax) / 2, y: yScale((yMin + yMax) / 2) },
    { v: yMin, y: yScale(yMin) },
  ];
  for (const it of yLabels) ctx.fillText(fmtY(it.v), padL - 8, it.y);

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let d = new Date(start); d <= end; d.setHours(d.getHours() + hourStep)) {
    const x = xScale(d.getTime());
    ctx.fillText(formatHourLabel(d), x, padT + plotH + 6);
  }
  ctx.globalAlpha = 1;

  // Line
  ctx.lineWidth = 2;
  ctx.strokeStyle = opts.lineColor || "#60a5fa";
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const px = xScale(points[i].t.getTime());
    const py = yScale(points[i].y);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Last dot
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(xScale(last.t.getTime()), yScale(last.y), 3.2, 0, Math.PI * 2);
  ctx.fillStyle = opts.lineColor || "#60a5fa";
  ctx.fill();
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
