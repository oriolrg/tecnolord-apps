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
        <canvas class="tl-chartModal__canvas" aria-label="Gràfic ampliat"></canvas>
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

function applyModalTheme(panel) {
  // Força colors “dark” perquè eixos/text surtin blancs
  // lineChart.js ja llegeix --text/--line/--accent
  panel.style.setProperty("--text", "rgb(255,255,255)");
  panel.style.setProperty("--line", "rgba(255,255,255,0.55)");
  // accent el pots deixar tal qual si ja el tens global
}

function sizeCanvasFullscreen(canvas, landscape) {
  // CSS size (la resta ho fa hiDpi() del lineChart)
  if (landscape) {
    // Mobile portrait => rotarem el canvas, però volem que “ocupi” el màxim
    canvas.style.width = "100vh";
    canvas.style.height = "100vw";
  } else {
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
  }
}

function redrawFromSource(modalCanvas, sourceCanvas) {
  const payload = sourceCanvas && sourceCanvas.__tlChart;
  if (!payload) return;

  // Re-renderitza al canvas del modal amb les mateixes dades
  if (payload.type === "multi") {
    // payload.series ja ve normalitzat com a [{name, points, color}]
    renderMultiLineChart(modalCanvas, payload.series, payload.opts || {});
  } else {
    renderLineChart(modalCanvas, payload.points || [], payload.opts || {});
  }
}

export function openChartModalFromCanvas(sourceCanvas, title = "") {
  if (!sourceCanvas) return;

  const m = ensureModal();
  const panel = m.querySelector(".tl-chartModal__panel");
  const modalCanvas = m.querySelector(".tl-chartModal__canvas");

  if (!panel || !modalCanvas) return;

  applyModalTheme(panel);

  const landscape = isMobilePortrait();
  panel.classList.toggle("is-landscape", landscape);

  // mida fullscreen (i després re-render)
  sizeCanvasFullscreen(modalCanvas, landscape);

  // Obre modal
  m.classList.add("is-open");
  document.documentElement.classList.add("tl-modalOpen");

  // Renderitza quan ja és visible (mida correcta)
  requestAnimationFrame(() => {
    redrawFromSource(modalCanvas, sourceCanvas);
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

    let title = "";
    const section = canvas.closest(".charts-section");
    if (section) {
      const h = section.querySelector("h3");
      if (h) title = h.textContent || "";
    }

    openChartModalFromCanvas(canvas, title);
  });

  window.addEventListener("resize", () => {
    if (!modalEl || !modalEl.classList.contains("is-open")) return;
    const panel = modalEl.querySelector(".tl-chartModal__panel");
    const modalCanvas = modalEl.querySelector(".tl-chartModal__canvas");
    if (!panel || !modalCanvas) return;

    const landscape = isMobilePortrait();
    panel.classList.toggle("is-landscape", landscape);
    sizeCanvasFullscreen(modalCanvas, landscape);

    // torna a renderitzar: agafa el canvas font que va obrir el modal
    // (truco a redraw via una referència guardada)
    // Solució simple: el canvas del modal porta una ref al d'origen
    // -> la guardem a dataset via WeakRef manual
  });
}
