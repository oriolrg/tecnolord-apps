"use client";

import { useEffect, useState } from "react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { PlanManager } from "@/components/calendar/plan-manager";
import { Card } from "@/components/ui/card";
import { loadTrainingPlan } from "@/lib/domain/services/plan-storage";
import type { TrainingPlan } from "@/lib/domain/types/training";

export function CalendarPageClient() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    const sync = () => setPlan(loadTrainingPlan());
    sync();
    window.addEventListener("training-plan-updated", sync as EventListener);
    window.addEventListener("day-log-updated", sync as EventListener);
    return () => {
      window.removeEventListener("training-plan-updated", sync as EventListener);
      window.removeEventListener("day-log-updated", sync as EventListener);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Calendari mensual</p>
        <h2 className="mt-3 text-3xl font-semibold">{plan?.metadata.name ?? "Pla actiu"}</h2>
        <p className="mt-2 text-sm text-slate-600">
          Vista mensual amb sessions previstes, estat real, creacio de dies nous i edicio del pla.
        </p>
      </Card>
      {plan ? <CalendarGrid sessions={plan.days} /> : null}
      <PlanManager />
    </div>
  );
}
