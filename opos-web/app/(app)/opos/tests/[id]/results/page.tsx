import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/opos/section-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSessionResult } from "@/lib/opos/repository";

export default async function TestResultsPage({ params }: { params: { id: string } }) {
  const result = await getSessionResult(params.id);
  if (!result) {
    notFound();
  }

  const { session } = result;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Resultats"
        title={session.mode === "mock_exam" ? "Resultat del simulacre" : "Informe del test"}
        description="La nota aplica la formula oficial: penalitzacio d'un quart per error i limit inferior 0."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white">
          <p className="text-sm text-slate-500">Nota</p>
          <p className="mt-3 text-3xl font-semibold">{session.score ?? 0}</p>
        </Card>
        <Card className="bg-white">
          <p className="text-sm text-slate-500">Encerts</p>
          <p className="mt-3 text-3xl font-semibold">{session.correctCount}</p>
        </Card>
        <Card className="bg-white">
          <p className="text-sm text-slate-500">Errors</p>
          <p className="mt-3 text-3xl font-semibold">{session.wrongCount}</p>
        </Card>
        <Card className="bg-white">
          <p className="text-sm text-slate-500">Blancs</p>
          <p className="mt-3 text-3xl font-semibold">{session.blankCount}</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Rendiment per tema</p>
          <div className="mt-4 space-y-3">
            {result.groupedByTopic.map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">{item.label}</p>
                  <Badge label={`${item.wrong} errors`} tone={item.wrong > 0 ? "pending" : "completed"} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {item.correct} encerts · {item.blank} blancs
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Recomanacions</p>
          <div className="mt-4 space-y-3">
            {result.recommendations.map((item) => (
              <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">{item.reason}</p>
                <p className="mt-2 text-sm font-semibold text-pine">{item.action}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Preguntes fallades</p>
        <div className="mt-4 space-y-4">
          {result.wrongAnswers.length === 0 ? (
            <p className="text-sm text-slate-600">Cap error registrat en aquesta sessio.</p>
          ) : (
            result.wrongAnswers.map((answer) => (
              <div key={answer.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="font-semibold text-rose-950">{answer.question.text}</p>
                <p className="mt-2 text-sm text-rose-900">{answer.question.explanation ?? "Sense explicacio disponible encara."}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
