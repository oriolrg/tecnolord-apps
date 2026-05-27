import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Usuari</p>
        <h2 className="mt-3 text-3xl font-semibold">Configuracio de perfil</h2>
        <p className="mt-3 text-sm text-slate-600">
          Camps previstos: disponibilitat setmanal, objectius, limitacions, zones cardiaques, preferencies i connexions.
        </p>
      </Card>
      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Integracions futures</p>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li>- Strava API</li>
          <li>- Garmin</li>
          <li>- Polar</li>
          <li>- Suunto</li>
          <li>- FIT via nova implementacio de `ActivityProvider`</li>
        </ul>
      </Card>
    </div>
  );
}
