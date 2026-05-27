import { Card } from "@/components/ui/card";
import { weeklySummary } from "@/lib/data/mock-plan";

export default function WeekPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Resum setmanal</p>
        <h2 className="mt-3 text-3xl font-semibold">Compliment i carrega</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Sessions previstes</p>
            <p className="mt-2 text-3xl font-semibold">{weeklySummary.planned}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Sessions completades</p>
            <p className="mt-2 text-3xl font-semibold">{weeklySummary.completed}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Hores totals</p>
            <p className="mt-2 text-3xl font-semibold">{weeklySummary.totalHours}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Carrega estimada</p>
            <p className="mt-2 text-3xl font-semibold">{weeklySummary.estimatedLoad}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-ink text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Alertes</p>
        <ul className="mt-4 space-y-3 text-sm text-slate-100">
          {weeklySummary.alerts.map((alert) => (
            <li key={alert}>• {alert}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
