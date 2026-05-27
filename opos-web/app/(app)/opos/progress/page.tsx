import { SectionHeader } from "@/components/opos/section-header";
import { Card } from "@/components/ui/card";
import { getDashboardData, getDueReviewQuestions } from "@/lib/opos/repository";

export default async function OposProgressPage() {
  const [dashboard, reviewQueue] = await Promise.all([getDashboardData(), getDueReviewQuestions()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Progres"
        title="Gamificacio moderada"
        description="XP, nivell, ratxa i cua de repas orientats a constancia i consolidacio, no a contestar molt rapid sense qualitat."
      />
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Estat global</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">XP</p>
              <p className="mt-2 text-3xl font-semibold">{dashboard.xp}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Nivell</p>
              <p className="mt-2 text-3xl font-semibold">{dashboard.level}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Ratxa</p>
              <p className="mt-2 text-3xl font-semibold">{dashboard.streakDays}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Repas pendent</p>
          <div className="mt-4 space-y-3">
            {reviewQueue.length === 0 ? (
              <p className="text-sm text-slate-600">No hi ha preguntes vençudes a la cua de repas.</p>
            ) : (
              reviewQueue.map((item) => (
                <div key={item.questionId} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-ink">{item.question.text}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Proxim repas: {new Date(item.nextReviewAt).toLocaleDateString("ca-ES")} · domini {item.masteryLevel.toFixed(1)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
