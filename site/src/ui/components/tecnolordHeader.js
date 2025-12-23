export function renderTecnolordHeader({ title, subtitle, icon, actionLabel } = {}) {
  const safeTitle = title || "Tecnolord";
  const safeSubtitle = subtitle || "";
  const safeAction = actionLabel || "Inicia sessió";

  // Si l'asset és a l'arrel del teu subsite /meteo/
  // (tu has confirmat que existeix aquí)
  const baseIcon = (icon || "/meteo/assets/icons/favicon.svg").trim();

  // Cache-buster per evitar que una resposta antiga (404) quedi en memòria
  const safeIcon = withCacheBuster(resolveAssetUrl(baseIcon));

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
                 onerror="
                   const w = this.closest('.tl-logoWrap');
                   if (w) w.classList.add('is-missing');
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

function withCacheBuster(url) {
  const u = String(url || "");
  if (!u) return u;
  const sep = u.includes("?") ? "&" : "?";
  return `${u}${sep}v=${Date.now()}`;
}

function resolveAssetUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  if (/^(https?:)?\/\//i.test(p)) return p;
  if (/^(data:|blob:)/i.test(p)) return p;
  if (p.startsWith("/")) return p;

  // Relatiu -> el fem relatiu a la carpeta actual
  const cleaned = p.replace(/^\.\//, "");
  return new URL(cleaned, `${location.origin}${detectBasePath()}`).toString();
}

function detectBasePath() {
  const { pathname } = location;
  const p = pathname.endsWith("index.html") ? pathname.slice(0, -("index.html".length)) : pathname;
  if (p.endsWith("/")) return p;
  const lastSlash = p.lastIndexOf("/");
  if (lastSlash <= 0) return "/";
  return p.slice(0, lastSlash + 1);
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
