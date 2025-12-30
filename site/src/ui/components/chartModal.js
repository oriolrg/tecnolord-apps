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
        <img class="tl-chartModal__img" alt="Gràfic ampliat" />
      </div>
      <div class="tl-chartModal__hint">Toca fora o prem ESC per tancar</div>
    </div>
  `;

  document.body.appendChild(modalEl);

  // Close handlers
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
  // Simple i efectiu
  const w = window.innerWidth || 0;
  const h = window.innerHeight || 0;
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  return coarse && h > w;
}

export function openChartModalFromCanvas(canvas, title = "") {
  if (!canvas || !canvas.toDataURL) return;

  const m = ensureModal();
  const img = m.querySelector(".tl-chartModal__img");
  const panel = m.querySelector(".tl-chartModal__panel");

  // Captura el canvas com a imatge
  let dataUrl = "";
  try {
    dataUrl = canvas.toDataURL("image/png");
  } catch {
    // si el canvas està "tainted" per algun motiu, no fem res
    return;
  }

  img.src = dataUrl;
  img.alt = title ? `Gràfic ampliat: ${title}` : "Gràfic ampliat";

  // Mobile portrait -> mode "landscape"
  panel.classList.toggle("is-landscape", isMobilePortrait());

  m.classList.add("is-open");
  document.documentElement.classList.add("tl-modalOpen");
}

export function closeChartModal() {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  document.documentElement.classList.remove("tl-modalOpen");

  const img = modalEl.querySelector(".tl-chartModal__img");
  if (img) img.src = "";
}

// Activador global (delegació): canvases dins .chart-container o amb id chart-...
export function installChartModalClicks(root = document) {
  root.addEventListener("click", (e) => {
    const t = e.target;
    if (!t) return;

    const canvas = t.closest ? t.closest("canvas") : null;
    if (!canvas) return;

    // filtres perquè no s'enganxi a canvases “no-grafics” si algun dia n’hi ha
    const isChart =
      (canvas.id && (canvas.id.startsWith("chart-") || canvas.id.startsWith("tl-chart-"))) ||
      (canvas.parentElement && canvas.parentElement.classList.contains("chart-container")) ||
      (canvas.closest && canvas.closest(".chart-container"));

    if (!isChart) return;

    // opcional: agafar el títol del h3 anterior
    let title = "";
    const section = canvas.closest(".charts-section");
    if (section) {
      const h = section.querySelector("h3");
      if (h) title = h.textContent || "";
    }

    openChartModalFromCanvas(canvas, title);
  });

  // si canvies orientació mentre està obert, recalcula landscape
  window.addEventListener("resize", () => {
    if (!modalEl || !modalEl.classList.contains("is-open")) return;
    const panel = modalEl.querySelector(".tl-chartModal__panel");
    if (panel) panel.classList.toggle("is-landscape", isMobilePortrait());
  });
}
