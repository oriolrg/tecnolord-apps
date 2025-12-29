import { $ } from "../dom.js";

function buildHistoricsUI(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="section-title">
        <h2>Històrics</h2>
        <p>Pròximament disponible</p>
      </div>

      <div class="panel" style="margin-top: 20px; text-align: center; padding: 60px 20px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">📊</span>
        <h3 style="margin: 0 0 12px 0; font-size: var(--fs-2);">Dades històriques</h3>
        <p style="color: var(--muted); margin: 0; max-width: 500px; margin: 0 auto;">
          Aquesta secció contindrà gràfiques i comparatives de dades meteorològiques i hidrològiques al llarg del temps.
        </p>
      </div>
    </div>
  `;

  return {};
}

export function initHistoricsScreen(root, store) {
  const ui = buildHistoricsUI(root);

  // De moment no hi ha funcionalitat, però retornem una funció de cleanup buida
  return () => {};
}