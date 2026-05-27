import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { nextSuggestion, sampleAnalysis, trainingPlan, weeklySummary } from "@/lib/data/mock-plan";

export default function DashboardPage() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Compliment setmanal" value={`${weeklySummary.complianceRate}%`} detail="Previstes vs completades" />
        <MetricCard label="Hores totals" value={weeklySummary.totalHours} detail="Inclou manual + importat" />
        <MetricCard label="Carrega estimada" value={weeklySummary.estimatedLoad} detail="Durada x RPE previst" />
        <MetricCard label="Alertes" value={weeklySummary.alerts.length} detail="Motor de seguiment simple" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white">
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Mes actual</p>
          <h2 className="mt-3 text-2xl font-semibold">{trainingPlan.metadata.name}</h2>
          <p className="mt-2 text-sm text-slate-600">{trainingPlan.aiNotes?.contextSummary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {trainingPlan.targetProfile.objectives.map((objective) => (
              <Badge key={objective} label={objective} tone="mobility" />
            ))}
          </div>
        </Card>

        <Card className="bg-ink text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Replanificacio</p>
          <h2 className="mt-3 text-2xl font-semibold">Proposta immediata</h2>
          <p className="mt-3 text-sm text-slate-300">{nextSuggestion.summary}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {nextSuggestion.adjustments.map((adjustment) => (
              <li key={adjustment}>- {adjustment}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Analisi activitat</p>
          <h3 className="mt-3 text-xl font-semibold">Previst vs real</h3>
          <div className="mt-4 flex gap-2">
            <Badge label={sampleAnalysis.intensityDelta} tone="strength" />
            <Badge label={sampleAnalysis.volumeDelta} tone="outdoor" />
          </div>
          <p className="mt-4 text-sm text-slate-600">{sampleAnalysis.comment}</p>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Distribucio setmanal</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(weeklySummary.byType).map(([type, count]) => (
              <div key={type} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm capitalize text-slate-500">{type}</p>
                <p className="mt-2 text-2xl font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
