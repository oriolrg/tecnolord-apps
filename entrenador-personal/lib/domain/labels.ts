import type { CatalogItemKind, SessionStatus, SessionType, TrackingField } from "@/lib/domain/types/training";

export const sessionTypeLabels: Record<SessionType, string> = {
  strength: "forca",
  swim: "piscina",
  bike: "ciclisme",
  trail: "trail",
  walk: "caminar",
  mobility: "mobilitat",
  garden: "hort",
  rest: "descans",
  combined: "combinada",
  intensity: "intensitat",
  outdoor: "outdoor"
};

export const sessionStatusLabels: Record<SessionStatus, string> = {
  pending: "pendent",
  completed: "completat",
  partial: "parcial",
  skipped: "saltat",
  substituted: "substituit",
  rest: "descans"
};

export const catalogKindLabels: Record<CatalogItemKind, string> = {
  exercise: "exercici",
  activity: "activitat"
};

export const trackingFieldLabels: Record<TrackingField, string> = {
  sets: "series",
  reps: "repeticions",
  weightKg: "pes kg",
  rpe: "RPE",
  durationMin: "durada min",
  distanceKm: "distancia km",
  elevationGainM: "desnivell + m",
  poolMeters: "metres piscina",
  avgHeartRate: "FC mitjana",
  maxHeartRate: "FC maxima",
  avgPower: "potencia mitjana",
  calories: "calories",
  pace: "ritme"
};
