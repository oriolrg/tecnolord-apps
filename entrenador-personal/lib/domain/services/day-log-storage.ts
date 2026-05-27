import type { DailyWorkoutEntry, PlannedSession } from "@/lib/domain/types/training";

const STORAGE_KEY = "entrenador-personal.day-logs";

export function createInitialDayLog(session: PlannedSession): DailyWorkoutEntry {
  return {
    sessionDate: session.date,
    sessionId: session.id,
    status: session.status,
    notes: "",
    availableTimeMin: session.plannedDurationMax ?? session.plannedDurationMin,
    painLevel: undefined,
    fatigueLevel: undefined,
    sleepQuality: undefined,
    stressLevel: undefined,
    exerciseLogs: session.blocks.flatMap((block) =>
      (block.exercises ?? []).map((exercise) => ({
        exerciseSlug: exercise.exerciseSlug,
        plannedSets: exercise.sets,
        plannedReps: exercise.reps,
        completedSets: exercise.sets,
        completedReps: exercise.reps,
        weightKg: undefined,
        rpe: exercise.rpe,
        done: false,
        notes: ""
      }))
    ),
    activityLogs: session.blocks.flatMap((block) =>
      block.activity
        ? [
            {
              blockId: block.id,
              discipline: block.activity.discipline,
              durationMin: block.activity.durationMax ?? block.activity.durationMin,
              distanceKm: block.activity.distanceKm,
              elevationGainM: block.activity.elevationGainM,
              poolMeters: undefined,
              avgPace: undefined,
              avgPower: undefined,
              avgHeartRate: undefined,
              maxHeartRate: undefined,
              calories: undefined,
              done: false,
              notes: block.activity.notes ?? ""
            }
          ]
        : []
    ),
    importedActivities: [],
    updatedAt: new Date().toISOString()
  };
}

export function loadDayLog(session: PlannedSession): DailyWorkoutEntry {
  if (typeof window === "undefined") {
    return createInitialDayLog(session);
  }

  const current = loadAllDayLogs()[session.date];
  return current ?? createInitialDayLog(session);
}

export function saveDayLog(entry: DailyWorkoutEntry) {
  if (typeof window === "undefined") {
    return;
  }

  const allLogs = loadAllDayLogs();
  allLogs[entry.sessionDate] = entry;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allLogs));
  window.dispatchEvent(new CustomEvent("day-log-updated", { detail: entry }));
}

export function loadAllDayLogs(): Record<string, DailyWorkoutEntry> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, DailyWorkoutEntry>;
  } catch {
    return {};
  }
}
