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

function isMobilePortrait() {
  const w = window.innerWidth || 0;
  const h = window.innerHeight || 0;
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  return coarse && h > w;
}

function applyModalVars(panel) {
  // Força blanc (eixos + text) dins el modal
  panel.style.setProperty("--text", "rgb(255,255,255)");
  panel.style.setProperty("--line", "rgba(255,255,255,0.55)");
}

function setStageSize(stage, canvas, landscape) {
  // IMPORTANT: mides en px reals, NO 100vh/100vw (a mòbil falla sovint)
  const vw = window.innerWidth || 360;
  const vh = window.innerHeight || 640;

  const W = landscape ? vh : vw;
  const H = landscape ? vw : vh;

  // stage (contenidor que pot rotar)
  stage.style.width = `${W}px`;
  stage.style.height = `${H}px`;

  // canvas ha d’omplir el stage
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

  const landscape = isMobilePortrait();
  panel.classList.toggle("is-landscape", landscape);

  // Guardem el canvas origen per a re-render en resize/orientació
  modalCanvas.__source = sourceCanvas;

  setStageSize(stage, modalCanvas, landscape);

  m.classList.add("is-open");
  document.documentElement.classList.add("tl-modalOpen");

  // Espera que el layout tingui mida real abans de pintar
  requestAnimationFrame(() => {
    // si encara és 0, reintenta una vegada (mòbil)
    if ((modalCanvas.clientWidth || 0) < 10 || (modalCanvas.clientHeight || 0) < 10) {
      setTimeout(() => {
        setStageSize(stage, modalCanvas, isMobilePortrait());
        panel.classList.toggle("is-landscape", isMobilePortrait());
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

  // Reajusta en rotació/resize i re-renderitza
  window.addEventListener("resize", () => {
    if (!modalEl || !modalEl.classList.contains("is-open")) return;

    const panel = modalEl.querySelector(".tl-chartModal__panel");
    const stage = modalEl.querySelector(".tl-chartModal__stage");
    const modalCanvas = modalEl.querySelector(".tl-chartModal__canvas");
    if (!panel || !stage || !modalCanvas) return;

    const landscape = isMobilePortrait();
    panel.classList.toggle("is-landscape", landscape);
    setStageSize(stage, modalCanvas, landscape);

    const source = modalCanvas.__source;
    if (source) {
      requestAnimationFrame(() => redraw(modalCanvas, source));
    }
  });
}
