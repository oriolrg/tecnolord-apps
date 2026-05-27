import { revalidatePath } from "next/cache";
import { SectionHeader } from "@/components/opos/section-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getOposSettings, updateSettings } from "@/lib/opos/repository";

export default async function OposSettingsPage() {
  const settings = await getOposSettings();

  async function saveSettings(formData: FormData) {
    "use server";
    await updateSettings({
      targetExamDate: String(formData.get("targetExamDate") || ""),
      weakPointMinimumSample: Number(formData.get("weakPointMinimumSample")),
      dailyGoal: Number(formData.get("dailyGoal")),
      weeklyGoal: Number(formData.get("weeklyGoal")),
      minimumQuestionStatus: String(formData.get("minimumQuestionStatus")) as "draft" | "reviewed" | "validated" | "doubtful" | "archived"
    });
    revalidatePath("/opos");
    revalidatePath("/opos/settings");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Configuracio"
        title="Paràmetres de l'aplicacio"
        description="Llindar minim per detectar punts febles, objectius d'estudi i data objectiu d'examen. La base SQLite queda a `opos.db` a l'arrel de l'app."
      />
      <Card>
        <form action={saveSettings} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Data objectiu d'examen</label>
            <input
              type="date"
              name="targetExamDate"
              className="input mt-2"
              defaultValue={settings.targetExamDate ? new Date(settings.targetExamDate).toISOString().slice(0, 10) : ""}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Mostra minima</label>
            <input type="number" name="weakPointMinimumSample" className="input mt-2" defaultValue={settings.weakPointMinimumSample} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Objectiu diari</label>
            <input type="number" name="dailyGoal" className="input mt-2" defaultValue={settings.dailyGoal} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Objectiu setmanal</label>
            <input type="number" name="weeklyGoal" className="input mt-2" defaultValue={settings.weeklyGoal} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Estat minim per simulacres</label>
            <select name="minimumQuestionStatus" className="input mt-2" defaultValue={settings.minimumQuestionStatus}>
              <option value="draft">draft</option>
              <option value="reviewed">reviewed</option>
              <option value="validated">validated</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Guardar configuracio</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
