import type { ImportedActivityRecord, PlannedSession } from "@/lib/domain/types/training";

export interface ActivityAnalysis {
  matched: boolean;
  intensityDelta: "lower" | "similar" | "higher";
  volumeDelta: "lower" | "similar" | "higher";
  overloadRisk: boolean;
  comment: string;
}

export function analyzeActivityAgainstPlan(
  plannedSession: PlannedSession,
  activity: ImportedActivityRecord
): ActivityAnalysis {
  const plannedDuration = plannedSession.plannedDurationMax ?? plannedSession.plannedDurationMin ?? 0;
  const actualDuration = activity.durationMin;
  const volumeRatio = plannedDuration === 0 ? 1 : actualDuration / plannedDuration;
  const plannedRpe = plannedSession.plannedRpe ?? 5;
  const actualIntensity = inferActivityIntensity(activity);

  const volumeDelta =
    volumeRatio > 1.15 ? "higher" : volumeRatio < 0.8 ? "lower" : "similar";
  const intensityDelta =
    actualIntensity > plannedRpe + 1 ? "higher" : actualIntensity < plannedRpe - 1 ? "lower" : "similar";
  const overloadRisk = intensityDelta === "higher" && volumeDelta === "higher";

  const comment = overloadRisk
    ? "Sessio clarament per sobre del previst. Redueix carrega en les properes 24-48 h."
    : volumeDelta === "lower"
      ? "Ha faltat volum respecte al pla. Mantingues la intensitat controlada i evita compensacions agressives."
      : "Execucio alineada amb el previst, sense desviacions rellevants.";

  return {
    matched: plannedSession.type === activity.activityType || plannedSession.type === "combined",
    intensityDelta,
    volumeDelta,
    overloadRisk,
    comment
  };
}

function inferActivityIntensity(activity: ImportedActivityRecord) {
  if ((activity.avgHeartRate ?? 0) >= 160) {
    return 8;
  }

  if ((activity.avgPower ?? 0) >= 230) {
    return 7;
  }

  if ((activity.avgHeartRate ?? 0) >= 140) {
    return 6;
  }

  return 4;
}
