export function renderTecnolordHeader({
  title = "Tecnolord",
  iconHref = "/assets/icons/icon-192.png",
  homeHref = "/",
  rightHtml = `<button class="btn secondary" disabled title="Properament">Inicia sessió</button>`,
} = {}) {
  return `
    <header class="tl-header" role="banner">
      <a class="tl-brand" href="${homeHref}" aria-label="Torna a Tecnolord">
        <img class="tl-logo" src="${iconHref}" alt="" width="36" height="36" />
        <div class="tl-brandtext">
          <div class="tl-title">${escapeHtml(title)}</div>
          <div class="tl-subtitle">Tecnolord apps</div>
        </div>
      </a>

      <div class="tl-right" aria-label="Compte">
        ${rightHtml}
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
