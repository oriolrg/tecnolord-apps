import { CONFIG } from "./config.js";
import { initApp } from "./ui/screens/app.js";

(function ensureFreshClient() {
  const KEY = "tecnolord:appVersion";
  try {
    const prev = localStorage.getItem(KEY);
    if (prev !== CONFIG.appVersion) {
      // esborra només el que sigui de Tecnolord (no rebentis tot el localStorage)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith("tecnolord:")) localStorage.removeItem(k);
      }
      localStorage.setItem(KEY, CONFIG.appVersion);

      // recarrega 1 cop (per agafar assets nous). Evitem bucle.
      if (!sessionStorage.getItem("tecnolord:reloaded")) {
        sessionStorage.setItem("tecnolord:reloaded", "1");
        location.reload();
      }
    }
  } catch {
    // si el browser bloqueja storage, no fem res
  }
})();

initApp(document.getElementById("app"));
