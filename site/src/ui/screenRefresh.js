// One visibility-aware refresh loop per screen. Hidden screens do not poll;
// returning to an active screen refreshes only when its cadence has elapsed.
export function installScreenRefresh({ root, intervalMs, refresh, initialRefresh = false } = {}) {
  if (!root || !Number.isFinite(intervalMs) || intervalMs <= 0 || typeof refresh !== 'function') {
    throw new TypeError('screen_refresh_options');
  }

  let disposed = false;
  let timer = null;
  let inFlight = null;
  let lastRefreshAt = initialRefresh ? 0 : Date.now();

  const isActive = () => root.classList?.contains('active') && document.visibilityState !== 'hidden';

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function invoke() {
    if (disposed || inFlight) return inFlight;
    lastRefreshAt = Date.now();
    inFlight = Promise.resolve(refresh()).finally(() => { inFlight = null; });
    return inFlight;
  }

  function refreshIfDue() {
    if (!isActive() || Date.now() - lastRefreshAt < intervalMs) return inFlight;
    return invoke();
  }

  function arm() {
    clearTimer();
    if (disposed || !isActive()) return;
    const delay = Math.max(0, intervalMs - (Date.now() - lastRefreshAt));
    timer = setTimeout(() => {
      timer = null;
      refreshIfDue();
      arm();
    }, delay);
  }

  function onScreenActive() {
    refreshIfDue();
    arm();
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') clearTimer();
    else onScreenActive();
  }

  function mark() {
    lastRefreshAt = Date.now();
    arm();
  }

  window.addEventListener('meteo:screen-active', onScreenActive);
  document.addEventListener('visibilitychange', onVisibilityChange);
  arm();

  return {
    mark,
    refreshNow: invoke,
    dispose() {
      disposed = true;
      clearTimer();
      window.removeEventListener('meteo:screen-active', onScreenActive);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
