"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { sessionStatusLabels, sessionTypeLabels } from "@/lib/domain/labels";
import { loadAllDayLogs } from "@/lib/domain/services/day-log-storage";
import type { PlannedSession } from "@/lib/domain/types/training";

export function CalendarGrid({ sessions }: { sessions: PlannedSession[] }) {
  const [resolvedSessions, setResolvedSessions] = useState(sessions);

  useEffect(() => {
    function syncStatuses() {
      const logs = loadAllDayLogs();
      setResolvedSessions(
        sessions.map((session) => ({
          ...session,
          status: logs[session.date]?.status ?? session.status
        }))
      );
    }

    syncStatuses();
    window.addEventListener("storage", syncStatuses);
    window.addEventListener("day-log-updated", syncStatuses as EventListener);

    return () => {
      window.removeEventListener("storage", syncStatuses);
      window.removeEventListener("day-log-updated", syncStatuses as EventListener);
    };
  }, [sessions]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {resolvedSessions.map((session) => (
        <Card key={session.id} className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">{format(parseISO(session.date), "dd MMM yyyy")}</p>
              <h3 className="mt-1 text-lg font-semibold text-ink">{session.title}</h3>
            </div>
            <Badge label={sessionStatusLabels[session.status]} tone={session.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={sessionTypeLabels[session.type]} tone={session.type} />
            {session.plannedZone ? <Badge label={session.plannedZone} tone="mobility" /> : null}
          </div>
          <p className="text-sm text-slate-600">{session.goal ?? session.notes ?? "Sessio planificada."}</p>
          <Link href={`/day/${session.date}`} className="text-sm font-semibold text-pine">
            Veure detall
          </Link>
        </Card>
      ))}
    </div>
  );
}
