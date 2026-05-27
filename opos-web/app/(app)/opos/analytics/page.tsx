import { SectionHeader } from "@/components/opos/section-header";
import { Card } from "@/components/ui/card";
import { getSessionsHistory, getWeakPointAnalysis } from "@/lib/opos/repository";

export default async function OposAnalyticsPage() {
  const [sessions, weakPoints] = await Promise.all([getSessionsHistory(), getWeakPointAnalysis()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Analitica"
        title="Punts febles i evolucio"
        description="L'MVP mostra els blocs amb pitjor rendiment combinant percentatge, volum de mostra i recurrencia d'errors."
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Evolucio recent</p>
          <div className="mt-4 space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-ink">{new Date(session.startedAt).toLocaleDateString("ca-ES")}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {session.mode} · {session.score ?? 0} punts · {session.correctCount} encerts / {session.totalQuestions}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Weak points</p>
          <div className="mt-4 space-y-3">
            {weakPoints.map((item) => (
              <div key={item.key} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-500">Severitat {item.severity.toFixed(2)}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.explanation}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
