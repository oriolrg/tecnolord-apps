export function renderBottomNav() {
  return `
    <nav class="bottom-nav" role="navigation" aria-label="Navegació principal">
      <div class="bottom-nav__inner">
        <button class="nav-btn active" data-screen="meteo" type="button" aria-label="Meteo">
          <span class="nav-btn__icon" aria-hidden="true">🌤️</span>
          <span class="nav-btn__label">Meteo</span>
        </button>
        
        <button class="nav-btn" data-screen="cabals" type="button" aria-label="Cabals">
          <span class="nav-btn__icon" aria-hidden="true">💧</span>
          <span class="nav-btn__label">Cabals</span>
        </button>
        
        <button class="nav-btn" data-screen="historics" type="button" aria-label="Històrics">
          <span class="nav-btn__icon" aria-hidden="true">📊</span>
          <span class="nav-btn__label">Històrics</span>
        </button>
      </div>
    </nav>
  `;
}