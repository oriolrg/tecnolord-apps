import { CONFIG } from "../config.js";

export function createStore(initial = {}) {
  const state = {
    estacio: CONFIG.defaultEstacio,
    limit: CONFIG.defaultLimit,
    auto: false,
    codiHidro: "",
    ...initial,
  };

  const listeners = new Set();

  function get() { return { ...state }; }
  function set(patch) {
    Object.assign(state, patch);
    listeners.forEach((fn) => fn(get()));
  }
  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { get, set, subscribe };
}
