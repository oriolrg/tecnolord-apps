import { exerciseLibrary } from "@/lib/data/exercises";
import type { CatalogItem } from "@/lib/domain/types/training";

const STORAGE_KEY = "entrenador-personal.catalog";

export function loadCatalog(): CatalogItem[] {
  if (typeof window === "undefined") {
    return exerciseLibrary;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return exerciseLibrary;
  }

  try {
    const parsed = JSON.parse(raw) as CatalogItem[];
    return parsed.length > 0 ? parsed : exerciseLibrary;
  } catch {
    return exerciseLibrary;
  }
}

export function saveCatalog(items: CatalogItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("catalog-updated"));
}

export function upsertCatalogItem(item: CatalogItem) {
  const current = loadCatalog();
  const next = current.some((entry) => entry.slug === item.slug)
    ? current.map((entry) => (entry.slug === item.slug ? item : entry))
    : [item, ...current];
  saveCatalog(next);
}
