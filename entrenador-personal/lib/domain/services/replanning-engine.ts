import { addDays, format, parseISO } from "date-fns";
import type {
  DailyCheckIn,
  PlannedSession,
  ReplanSuggestion,
  TrainingPlan
} from "@/lib/domain/types/training";

export interface ReplanningContext {
  plan: TrainingPlan;
  skippedSessionDate: string;
  checkIn: DailyCheckIn;
}

export function generateReplanSuggestion({
  plan,
  skippedSessionDate,
  checkIn
}: ReplanningContext): ReplanSuggestion {
  const skippedSession = plan.days.find((day) => day.date === skippedSessionDate);
  const nextDate = format(addDays(parseISO(skippedSessionDate), 1), "yyyy-MM-dd");
  const nextSession = plan.days.find((day) => day.date === nextDate);

  if (!skippedSession || !nextSession) {
    return {
      date: nextDate,
      summary: "No hi ha cap sessio posterior per replanificar.",
      reason: "out_of_range",
      suggestedStatus: "pending",
      adjustments: ["Mantenir descans o afegir una nota manual."]
    };
  }

  const adjustments: string[] = [];

  if ((checkIn.painLevel ?? 0) >= 7 || (checkIn.fatigueLevel ?? 0) >= 8) {
    return {
      date: nextDate,
      summary: "Convertir la sessio de l'endema en recuperacio activa o descans.",
      reason: "recovery_priority",
      suggestedStatus: "substituted",
      adjustments: [
        "Canviar a mobilitat o caminar 20-30 min.",
        "Posposar la sessio intensa fins que baixi la fatiga."
      ]
    };
  }

  if ((checkIn.availableTimeMin ?? Number.MAX_SAFE_INTEGER) < 35) {
    const shortOption = skippedSession.alternatives?.find((item) => item.trigger === "low_time");
    adjustments.push(
      shortOption
        ? `Aplicar versio curta: ${shortOption.summary}`
        : "Retallar la sessio a un bloc principal de 20-30 min."
    );
  }

  if (isStrongDay(skippedSession) && isStrongDay(nextSession)) {
    adjustments.push("Evitar dos dies forts seguits: mantenir la sessio forta original i moure l'altra a divendres.");
  }

  if (skippedSession.type === "strength" && isMonday(skippedSession.date)) {
    adjustments.push("Prioritzar forca setmanal: inserir el bloc principal de gimnas a dimecres o divendres.");
  }

  if (nextSession.tags?.includes("after-long-session") && skippedSession.type === "intensity") {
    adjustments.push("No traslladar intensitat al dia posterior a una sortida llarga.");
  }

  if (adjustments.length === 0) {
    adjustments.push("Mantenir la planificacio actual i oferir una alternativa curta de la sessio saltada.");
  }

  return {
    date: nextDate,
    summary: `Proposta per a ${nextDate}: ${adjustments[0]}`,
    reason: "rules_engine",
    suggestedStatus: "pending",
    adjustments
  };
}

function isStrongDay(session: PlannedSession) {
  return ["strength", "intensity"].includes(session.type) || (session.plannedRpe ?? 0) >= 7;
}

function isMonday(date: string) {
  return parseISO(date).getDay() === 1;
}
