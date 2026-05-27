import fallbackPlan from "@/monthly-plan.example.json";
import type { PlannedSession, TrainingPlan } from "@/lib/domain/types/training";
import { parseTrainingPlan } from "@/lib/domain/services/plan-parser";

const STORAGE_KEY = "entrenador-personal.training-plan";

export function loadTrainingPlan(): TrainingPlan {
  if (typeof window === "undefined") {
    return fallbackPlan as TrainingPlan;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallbackPlan as TrainingPlan;
  }

  try {
    const parsed = JSON.parse(raw) as TrainingPlan;
    return parsed;
  } catch {
    return fallbackPlan as TrainingPlan;
  }
}

export function saveTrainingPlan(plan: TrainingPlan) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  window.dispatchEvent(new CustomEvent("training-plan-updated"));
}

export function importTrainingPlan(raw: string) {
  const result = parseTrainingPlan(raw);
  if (!result.success || !result.plan) {
    throw new Error(result.errors.join(" | "));
  }

  saveTrainingPlan(result.plan);
  return result.plan;
}

export function upsertPlannedSession(session: PlannedSession) {
  const plan = loadTrainingPlan();
  const days = plan.days.some((item) => item.id === session.id)
    ? plan.days.map((item) => (item.id === session.id ? session : item))
    : [...plan.days, session];

  const nextPlan: TrainingPlan = {
    ...plan,
    monthlyPeriod: {
      ...plan.monthlyPeriod,
      startsOn: minDate(days),
      endsOn: maxDate(days)
    },
    days: days.sort((a, b) => a.date.localeCompare(b.date))
  };

  saveTrainingPlan(nextPlan);
  return nextPlan;
}

export function findPlannedSessionByDate(date: string) {
  return loadTrainingPlan().days.find((item) => item.date === date);
}

function minDate(days: PlannedSession[]) {
  return [...days].sort((a, b) => a.date.localeCompare(b.date))[0]?.date ?? fallbackPlan.monthlyPeriod.startsOn;
}

function maxDate(days: PlannedSession[]) {
  return [...days].sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? fallbackPlan.monthlyPeriod.endsOn;
}
