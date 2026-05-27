import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { weeklySummary } from "@/lib/data/mock-plan";

export default function WeeklySummaryPage() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Vista de resum</p>
        <h2 className="mt-3 text-3xl font-semibold">Resum setmanal detallat</h2>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h3 className="text-xl font-semibold">Distribucio per tipus</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {Object.entries(weeklySummary.byType).map(([type, count]) => (
              <Badge key={type} label={`${type}: ${count}`} tone={type} />
            ))}
          </div>
        </Card>
        <Card className="bg-ink text-white">
          <h3 className="text-xl font-semibold">Alertes simples</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {weeklySummary.alerts.map((alert) => (
              <li key={alert}>• {alert}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
