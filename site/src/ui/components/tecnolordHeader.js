export function renderTecnolordHeader({ title, subtitle, icon, actionLabel } = {}) {
  const safeTitle = title || "Tecnolord";
  const safeSubtitle = subtitle || "";
  const safeIcon = icon || "";
  const safeAction = actionLabel || "Inicia sessió";

  return `
    <header class="tl-header" role="banner">
      <div class="tl-header__inner">
        <a class="tl-brand" href="/" aria-label="${escapeHtml(safeTitle)}">
          <span class="tl-logoWrap" aria-hidden="true">
            <img class="tl-logo"
                 src="${escapeAttr(safeIcon)}"
                 alt=""
                 width="44"
                 height="44"
                 loading="eager"
                 decoding="async"
                 onerror="this.style.display='none';" />
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
