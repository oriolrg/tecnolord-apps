import type { PlannedSession, SessionType } from "@/lib/domain/types/training";

export interface WeeklySummaryView {
  planned: number;
  completed: number;
  totalHours: number;
  complianceRate: number;
  estimatedLoad: number;
  byType: Record<string, number>;
  alerts: string[];
}

export function buildWeeklySummary(
  sessions: PlannedSession[],
  logs: Array<{ date: string; durationMin?: number; fatigueLevel?: number; painLevel?: number; status: string }>
): WeeklySummaryView {
  const planned = sessions.length;
  const completed = logs.filter((log) => ["completed", "partial", "substituted"].includes(log.status)).length;
  const totalHours = logs.reduce((sum, log) => sum + (log.durationMin ?? 0), 0) / 60;
  const complianceRate = planned === 0 ? 0 : completed / planned;
  const estimatedLoad = sessions.reduce(
    (sum, session) => sum + (session.plannedDurationMin ?? 0) * (session.plannedRpe ?? 4),
    0
  );

  const byType = sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.type] = (acc[session.type] ?? 0) + 1;
    return acc;
  }, {});

  const alerts: string[] = [];
  const intensityCount = countTypes(["intensity", "strength"], sessions);

  if (intensityCount >= 3) {
    alerts.push("massa dies intensos seguits");
  }
  if (logs.some((log) => (log.fatigueLevel ?? 0) >= 8)) {
    alerts.push("poca recuperacio");
  }
  if (logs.filter((log) => (log.painLevel ?? 0) >= 6).length >= 2) {
    alerts.push("dolor recurrent");
  }
  if (!byType.strength) {
    alerts.push("no s'ha fet forca aquesta setmana");
  }

  return {
    planned,
    completed,
    totalHours: Number(totalHours.toFixed(1)),
    complianceRate: Number((complianceRate * 100).toFixed(0)),
    estimatedLoad,
    byType,
    alerts
  };
}

function countTypes(types: SessionType[], sessions: PlannedSession[]) {
  return sessions.filter((session) => types.includes(session.type)).length;
}
