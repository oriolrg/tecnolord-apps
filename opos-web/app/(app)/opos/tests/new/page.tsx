import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SectionHeader } from "@/components/opos/section-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getQuestionFiltersMetadata, getOposSettings, createTestSession } from "@/lib/opos/repository";

export default async function NewTestPage() {
  const [metadata, settings] = await Promise.all([getQuestionFiltersMetadata(), getOposSettings()]);

  async function startTest(formData: FormData) {
    "use server";
    const topicNumber = Number(formData.get("topicNumber"));
    const examExercise = String(formData.get("examExercise")) as "exercise1" | "exercise2";
    const questionCount = Number(formData.get("questionCount"));
    const session = await createTestSession({
      mode: "topic",
      examExercise,
      topicNumber: Number.isFinite(topicNumber) ? topicNumber : undefined,
      questionCount,
      minimumStatus: String(formData.get("minimumStatus")) as "draft" | "reviewed" | "validated" | "doubtful" | "archived"
    });
    revalidatePath("/opos");
    redirect(`/opos/tests/${session.sessionId}`);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Tests"
        title="Configura un test d'estudi"
        description="En l'MVP pots generar un test per tema amb nombre de preguntes i llindar minim de qualitat."
      />

      <Card>
        <form action={startTest} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Tema</label>
            <select name="topicNumber" className="input mt-2" defaultValue="">
              <option value="">Aleatori entre tots</option>
              {metadata.topics.map((topic) => (
                <option key={topic.number} value={topic.number}>
                  Tema {topic.number} · {topic.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Exercici</label>
            <select name="examExercise" className="input mt-2" defaultValue="exercise1">
              <option value="exercise1">Exercici 1</option>
              <option value="exercise2">Exercici 2</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Nombre de preguntes</label>
            <input type="number" min="5" max="25" name="questionCount" className="input mt-2" defaultValue={10} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Estat minim de qualitat</label>
            <select name="minimumStatus" className="input mt-2" defaultValue={settings.minimumQuestionStatus}>
              <option value="draft">draft</option>
              <option value="reviewed">reviewed</option>
              <option value="validated">validated</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Comencar test</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
