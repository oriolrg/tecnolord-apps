export function renderTecnolordHeader({ title, subtitle, icon, actionLabel } = {}) {
  const safeTitle = title || "Tecnolord";
  const safeSubtitle = subtitle || "";
  const safeAction = actionLabel || "Inicia sessió";

  // fixa (tu has confirmat que existeix)
  const safeIcon = (icon || "/meteo/assets/icons/favicon-96x96.png").trim();

  return `
    <header class="tl-header" role="banner">
      <div class="tl-header__inner">
        <a class="tl-brand" href="/meteo/" aria-label="${escapeHtml(safeTitle)}">
          <span class="tl-logoWrap" aria-hidden="true">
            <img class="tl-logo"
                 id="tlLogo"
                 src="${escapeAttr(safeIcon)}"
                 alt=""
                 width="44"
                 height="44"
                 loading="eager"
                 decoding="async" />
            <span class="tl-logoFallback" id="tlLogoFallback" aria-hidden="true">TL</span>
          </span>

          <span class="tl-brandtext">
            <span class="tl-title">${escapeHtml(safeTitle)}</span>
            ${safeSubtitle ? `<span class="tl-subtitle">${escapeHtml(safeSubtitle)}</span>` : ""}
          </span>
        </a>

        <div class="tl-right">
          <button class="btn secondary" type="button" aria-label="${escapeAttr(safeAction)}">
            ${escapeHtml(safeAction)}
          </button>
        </div>
      </div>
    </header>
  `;
}

export function wireTecnolordHeader(root = document) {
  const img = root.querySelector("#tlLogo");
  const fb = root.querySelector("#tlLogoFallback");
  const wrap = img?.closest(".tl-logoWrap");

  if (!img || !fb || !wrap) return;

  const showFallback = () => {
    wrap.classList.add("is-missing");
    img.style.display = "none";
    fb.style.display = "inline-flex";
  };

  const showImg = () => {
    wrap.classList.remove("is-missing");
    img.style.display = "block";
    fb.style.display = "none";
  };

  img.addEventListener("load", showImg, { once: true });
  img.addEventListener("error", showFallback, { once: true });

  // Si ja està en cache i carregada
  if (img.complete && img.naturalWidth > 0) showImg();
  else if (img.complete && img.naturalWidth === 0) showFallback();
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(s) {
  return escapeHtml(s).replaceAll("`", "&#096;");
}
