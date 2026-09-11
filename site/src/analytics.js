const ANALYTICS_SCRIPT_URL = "https://stats.tecnolord.cat/script.js";
const ANALYTICS_WEBSITE_ID = "87584b46-f480-47b0-95f2-321daaaf9989";

function isEnabled(config) {
  return config?.analyticsEnabled === true && config?.environment !== "local";
}

export function initAnalytics(config, documentRef = globalThis.document) {
  if (!isEnabled(config)) return false;
  if (!documentRef || typeof documentRef.createElement !== "function") return false;
  if (documentRef.querySelector?.('script[data-meteolord-analytics="true"]')) return true;

  const script = documentRef.createElement("script");
  script.src = ANALYTICS_SCRIPT_URL;
  script.defer = true;
  script.dataset.websiteId = ANALYTICS_WEBSITE_ID;
  script.dataset.meteolordAnalytics = "true";
  documentRef.head.appendChild(script);
  return true;
}

export function trackEvent(config, name, props, windowRef = globalThis.window) {
  if (!isEnabled(config)) return false;
  try {
    const analytics = windowRef?.umami;
    if (!analytics || typeof analytics.track !== "function") return false;
    analytics.track(name, props);
    return true;
  } catch {
    return false;
  }
}

export function trackPageview(config, url, title, windowRef = globalThis.window) {
  if (!isEnabled(config)) return false;
  try {
    const analytics = windowRef?.umami;
    if (!analytics || typeof analytics.track !== "function") return false;
    analytics.track((props) => ({ ...props, url, title }));
    return true;
  } catch {
    return false;
  }
}
