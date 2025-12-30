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

function applyModalVars(panel) {
  // Eixos/text blancs dins el modal (fons negre)
  panel.style.setProperty("--text", "rgb(255,255,255)");
  panel.style.setProperty("--line", "rgba(255,255,255,0.55)");
}

function setStageSize(stage, canvas) {
  // Mides reals (px) per evitar bugs de vh/vw en mòbil
  const W = window.innerWidth || 360;
  const H = window.innerHeight || 640;

  stage.style.width = `${W}px`;
  stage.style.height = `${H}px`;

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

  // Guardem origen per redibuixar en resize/orientació
  modalCanvas.__source = sourceCanvas;

  // Obrim primer perquè hi hagi layout real
  m.classList.add("is-open");
  document.documentElement.classList.add("tl-modalOpen");

  // Mides + render
  requestAnimationFrame(() => {
    setStageSize(stage, modalCanvas);

    // Reintenta 1 cop si el navegador encara no ha calculat mides (mòbil)
    if ((modalCanvas.clientWidth || 0) < 10 || (modalCanvas.clientHeight || 0) < 10) {
      setTimeout(() => {
        setStageSize(stage, modalCanvas);
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

    const stage = modalEl.querySelector(".tl-chartModal__stage");
    const modalCanvas = modalEl.querySelector(".tl-chartModal__canvas");
    if (!stage || !modalCanvas) return;

    setStageSize(stage, modalCanvas);

    const source = modalCanvas.__source;
    if (source) requestAnimationFrame(() => redraw(modalCanvas, source));
  });
}
