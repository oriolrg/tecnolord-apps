export function renderTecnolordHeader({ title, subtitle, icon, actionLabel } = {}) {
  const safeTitle = title || "Tecnolord";
  const safeSubtitle = subtitle || "";
  const safeAction = actionLabel || "Inicia sessió";

  // IMPORTANT: ruta robusta del logo
  const safeIcon = resolveAssetUrl((icon || "/meteo/assets/icons/favicon.svg").trim());

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
                 onerror="this.closest('.tl-logoWrap')?.classList.add('is-missing'); this.remove();" />
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

/**
 * Resol un asset perquè funcioni tant si serveixes a / com a /subpath/
 * - Si ve amb http(s):// o data: o blob: -> el retorna tal qual
 * - Si comença per / -> el retorna tal qual (arrel del domini)
 * - Si és relatiu (./assets/... o assets/...) -> el fixa a basePath detectat
 */
function resolveAssetUrl(path) {
  const p = String(path || "").trim();

  if (!p) return "";
  if (/^(https?:)?\/\//i.test(p)) return p;      // http://, https://, //cdn...
  if (/^(data:|blob:)/i.test(p)) return p;       // data:, blob:
  if (p.startsWith("/")) return p;               // absolut del domini

  // Neteja prefix ./ si existeix
  const cleaned = p.replace(/^\.\//, "");

  // Detecta basePath si estàs servint el site en subcarpeta:
  // Exemple: https://domini.tld/meteo/ -> basePath "/meteo/"
  // Si ets a arrel -> "/"
  const basePath = detectBasePath();

  // Construeix URL absoluta i la torna com a string
  return new URL(cleaned, `${location.origin}${basePath}`).toString();
}

/**
 * Heurística: agafa la carpeta on està el current URL.
 * Si tens rutes tipus /app/index.html -> retorna /app/
 * Si tens / -> retorna /
 */
function detectBasePath() {
  const { pathname } = location;

  // si hi ha un index.html explícit, treu-lo
  const p = pathname.endsWith("index.html") ? pathname.slice(0, -("index.html".length)) : pathname;

  // assegura acabar amb /
  if (p.endsWith("/")) return p;

  // si és /algo.html -> torna /
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
