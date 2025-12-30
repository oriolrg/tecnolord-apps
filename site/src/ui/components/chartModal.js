import { renderLineChart, renderMultiLineChart } from "./lineChart.js";

let modalEl = null;

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.className = "tl-chartModal";
  modalEl.innerHTML = `
    <div class="tl-chartModal__backdrop" data-close="1"></div>
    <div class="tl-chartModal__panel" role="dialog" aria-modal="true" aria-label="Gràfic ampliat">
      <button class="tl-chartModal__close" type="button" aria-label="Tancar" data-close="1">✕</button>
      <div class="tl-chartModal__content">
        <div class="tl-chartModal__stage">
          <canvas class="tl-chartModal__canvas"></canvas>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  modalEl.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-close") === "1") closeChartModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChartModal();
  });

  return modalEl;
}

function isCoarsePointer() {
  return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
}

function isPortrait() {
  return (window.innerHeight || 0) > (window.innerWidth || 0);
}

function shouldRotate90() {
  // Només rotem automàticament en mòbil (coarse) quan està en portrait
  return isCoarsePointer() && isPortrait();
}

function applyModalVars(panel) {
  panel.style.setProperty("--text", "rgb(255,255,255)");
  panel.style.setProperty("--line", "rgba(255,255,255,0.55)");
}

function setStageSizeAndRotation(panel, stage, canvas) {
  const W = window.innerWidth || 360;
  const H = window.innerHeight || 640;

  const rotate = shouldRotate90();
  panel.classList.toggle("is-rot90", rotate);

  // Si rotem 90º, el “rectangle útil” ha de ser (H x W)
  const stageW = rotate ? H : W;
  const stageH = rotate ? W : H;

  stage.style.width = `${stageW}px`;
  stage.style.height = `${stageH}px`;

  canvas.style.width = "100%";
  canvas.style.height = "100%";
}

function redraw(modalCanvas, sourceCanvas) {
  const payload = sourceCanvas && sourceCanvas.__tlChart;
  if (!payload) return;

  if (payload.type === "multi") {
    renderMultiLineChart(modalCanvas, payload.series || [], payload.opts || {});
  } else {
    renderLineChart(modalCanvas, payload.points || [], payload.opts || {});
  }
}

export function openChartModalFromCanvas(sourceCanvas) {
  if (!sourceCanvas) return;

  const m = ensureModal();
  const panel = m.querySelector(".tl-chartModal__panel");
  const stage = m.querySelector(".tl-chartModal__stage");
  const modalCanvas = m.querySelector(".tl-chartModal__canvas");
  if (!panel || !stage || !modalCanvas) return;

  applyModalVars(panel);
  modalCanvas.__source = sourceCanvas;

  m.classList.add("is-open");
  document.documentElement.classList.add("tl-modalOpen");

  requestAnimationFrame(() => {
    setStageSizeAndRotation(panel, stage, modalCanvas);

    // Reintenta 1 cop si el layout encara és 0 (mòbil)
    if ((modalCanvas.clientWidth || 0) < 10 || (modalCanvas.clientHeight || 0) < 10) {
      setTimeout(() => {
        setStageSizeAndRotation(panel, stage, modalCanvas);
        redraw(modalCanvas, sourceCanvas);
      }, 60);
      return;
    }

    redraw(modalCanvas, sourceCanvas);
  });
}

export function closeChartModal() {
  if (!modalEl) return;

  modalEl.classList.remove("is-open");
  document.documentElement.classList.remove("tl-modalOpen");

  const c = modalEl.querySelector(".tl-chartModal__canvas");
  if (c) {
    const ctx = c.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    c.__source = null;
  }
}

export function installChartModalClicks(root = document) {
  root.addEventListener("click", (e) => {
    const t = e.target;
    if (!t) return;

    const canvas = t.closest ? t.closest("canvas") : null;
    if (!canvas) return;

    const isChart =
      (canvas.id && (canvas.id.startsWith("chart-") || canvas.id.startsWith("tl-chart-"))) ||
      (canvas.closest && canvas.closest(".chart-container"));

    if (!isChart) return;

    openChartModalFromCanvas(canvas);
  });

  window.addEventListener("resize", () => {
    if (!modalEl || !modalEl.classList.contains("is-open")) return;

    const panel = modalEl.querySelector(".tl-chartModal__panel");
    const stage = modalEl.querySelector(".tl-chartModal__stage");
    const modalCanvas = modalEl.querySelector(".tl-chartModal__canvas");
    if (!panel || !stage || !modalCanvas) return;

    setStageSizeAndRotation(panel, stage, modalCanvas);

    const source = modalCanvas.__source;
    if (source) requestAnimationFrame(() => redraw(modalCanvas, source));
  });
}
