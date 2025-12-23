const FORCED_ICON = "/meteo/assets/icons/favicon-96x96.png"; // <-- posa aquí el que vulguis

export function renderTecnolordHeader({ title, subtitle, icon, actionLabel } = {}) {
  const safeTitle = title || "Tecnolord";
  const safeSubtitle = subtitle || "";
  const safeAction = actionLabel || "Inicia sessió";

  // Render: posem un src qualsevol, però després el forcem via wireTecnolordHeader()
  const initialIcon = (icon || FORCED_ICON).trim();

  return `
    <header class="tl-header" role="banner">
      <div class="tl-header__inner">
        <a class="tl-brand" href="/meteo/" aria-label="${escapeHtml(safeTitle)}">
          <span class="tl-logoWrap" aria-hidden="true">
            <img class="tl-logo"
                 id="tlLogo"
                 src="${escapeAttr(initialIcon)}"
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

  // 🔥 FORÇA el src aquí, passi el que passi a config/appIcon
  img.src = FORCED_ICON;

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

  // Si ja està carregada (cache), aplica estat
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
