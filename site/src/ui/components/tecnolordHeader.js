export function renderTecnolordHeader({ title, subtitle, icon, actionLabel } = {}) {
  const safeTitle = title || "Tecnolord";
  const safeSubtitle = subtitle || "";
  const safeAction = actionLabel || "Inicia sessió";

  // IMPORTANT: ruta ABSOLUTA fixa (ja has confirmat que existeix)
  // No fem cap resolve, ni cache-buster
  const safeIcon = (icon || "/meteo/assets/icons/favicon.svg").trim();

  return `
    <header class="tl-header" role="banner">
      <div class="tl-header__inner">
        <a class="tl-brand" href="/meteo/" aria-label="${escapeHtml(safeTitle)}">
          <span class="tl-logoWrap" aria-hidden="true">
            <img class="tl-logo"
                 src="${escapeAttr(safeIcon)}"
                 alt=""
                 width="44"
                 height="44"
                 loading="eager"
                 decoding="async"
                 onload="
                   const w = this.closest('.tl-logoWrap');
                   if (w) w.classList.remove('is-missing');
                   const fb = this.parentElement?.querySelector('.tl-logoFallback');
                   if (fb) fb.style.display='none';
                   this.style.display='block';
                 "
                 onerror="
                   const w = this.closest('.tl-logoWrap');
                   if (w) w.classList.add('is-missing');
                   const fb = this.parentElement?.querySelector('.tl-logoFallback');
                   if (fb) fb.style.display='inline-flex';
                   this.style.display='none';
                 " />
            <span class="tl-logoFallback" aria-hidden="true">TL</span>
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
