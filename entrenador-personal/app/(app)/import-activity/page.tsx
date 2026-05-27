import { Card } from "@/components/ui/card";
import { importedActivities } from "@/lib/data/mock-plan";

export default function ImportActivityPage() {
  const activity = importedActivities[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Importacio activitats</p>
        <h2 className="mt-3 text-3xl font-semibold">JSON, CSV i GPX</h2>
        <p className="mt-3 text-sm text-slate-600">
          La capa `ActivityProvider` permet afegir Strava, Garmin, Polar, Suunto o FIT sense tocar el domini.
        </p>
      </Card>
      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Mostra importada</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Tipus</p>
            <p className="mt-1 text-lg font-semibold">{activity.activityType}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Durada</p>
            <p className="mt-1 text-lg font-semibold">{activity.durationMin} min</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Distancia</p>
            <p className="mt-1 text-lg font-semibold">{activity.distanceKm} km</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">FC mitjana</p>
            <p className="mt-1 text-lg font-semibold">{activity.avgHeartRate} bpm</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
