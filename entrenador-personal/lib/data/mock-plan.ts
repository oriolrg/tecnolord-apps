import planJson from "@/monthly-plan.example.json";
import { analyzeActivityAgainstPlan } from "@/lib/domain/services/activity-analysis";
import { generateReplanSuggestion } from "@/lib/domain/services/replanning-engine";
import { buildWeeklySummary } from "@/lib/domain/services/weekly-summary";
import type { ImportedActivityRecord, TrainingPlan } from "@/lib/domain/types/training";

export const trainingPlan = planJson as TrainingPlan;

export const workoutLogs = [
  {
    date: "2026-05-04",
    status: "completed",
    durationMin: 63,
    fatigueLevel: 4,
    painLevel: 2
  },
  {
    date: "2026-05-05",
    status: "partial",
    durationMin: 15,
    fatigueLevel: 5,
    painLevel: 3
  },
  {
    date: "2026-05-06",
    status: "completed",
    durationMin: 82,
    fatigueLevel: 6,
    painLevel: 3
  },
  {
    date: "2026-05-07",
    status: "completed",
    durationMin: 35,
    fatigueLevel: 4,
    painLevel: 2
  }
] as const;

export const importedActivities: ImportedActivityRecord[] = [
  {
    provider: "json",
    externalId: "garmin-001",
    date: "2026-05-06",
    activityType: "trail",
    durationMin: 86,
    distanceKm: 13.6,
    elevationGainM: 420,
    avgHeartRate: 146,
    maxHeartRate: 164,
    calories: 950,
    rawPayload: {
      device: "Garmin"
    }
  }
];

export const nextSuggestion = generateReplanSuggestion({
  plan: trainingPlan,
  skippedSessionDate: "2026-05-08",
  checkIn: {
    status: "skipped",
    availableTimeMin: 25,
    painLevel: 3,
    fatigueLevel: 5,
    notes: "Reunio llarga i poc marge"
  }
});

export const weeklySummary = buildWeeklySummary(trainingPlan.days.slice(0, 7), [...workoutLogs]);

export const sampleAnalysis = analyzeActivityAgainstPlan(
  trainingPlan.days[2],
  importedActivities[0]
);
