// Installed apps can keep a document alive. Check again when they resume.
export function installClientUpdates(moduleUrl, windowRef = window, documentRef = document) {
  const version = new URL(moduleUrl).pathname.match(/\/meteo\/releases\/([a-f0-9]{64})\//)?.[1];
  if (!version) return () => {}; // Source preview has no generated release.
  let pending = false;
  let disposed = false;
  let reloading = false;
  async function check() {
    if (pending || disposed || reloading || documentRef.visibilityState === 'hidden') return;
    pending = true;
    try {
      const response = await fetch('/meteo/release.json', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) return;
      const latest = await response.json();
      if (disposed || !/^[a-f0-9]{64}$/.test(latest.version) || latest.version === version) return;
      // Avoid repeated reloads if a proxy continues to serve an old document.
      const key = 'meteolord:last-reload';
      try {
        if (windowRef.sessionStorage.getItem(key) === latest.version) return;
        windowRef.sessionStorage.setItem(key, latest.version);
      } catch { /* Storage may be unavailable; at most one reload per document. */ }
      reloading = true;
      windowRef.location.reload();
    } catch { /* Offline: keep the current document usable. */ }
    finally { pending = false; }
  }
  windowRef.addEventListener('focus', check);
  windowRef.addEventListener('pageshow', check);
  documentRef.addEventListener('visibilitychange', check);
  check();
  return () => {
    disposed = true;
    windowRef.removeEventListener('focus', check);
    windowRef.removeEventListener('pageshow', check);
    documentRef.removeEventListener('visibilitychange', check);
  };
}
