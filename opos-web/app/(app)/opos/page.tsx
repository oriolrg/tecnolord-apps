import Link from "next/link";
import { ArrowRight, Brain, FileUp, ListChecks, Timer } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/opos/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDashboardData, getSessionsHistory } from "@/lib/opos/repository";

export default async function OposDashboardPage() {
  const [dashboard, sessions] = await Promise.all([getDashboardData(), getSessionsHistory()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Opos"
        title="Centre d'estudi i simulacres"
        description="Importa preguntes JSON, estudia per tema, llança simulacres oficials i detecta punts febles sense conclusions opaques."
        actions={
          <>
            <Link href="/opos/import">
              <Button variant="secondary">Importar JSON</Button>
            </Link>
            <Link href="/opos/tests/new">
              <Button>Fer test rapid</Button>
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Preguntes totals" value={dashboard.totalQuestions} detail="Inclou demo i reals" />
        <MetricCard label="Validades" value={dashboard.validatedQuestions} detail="Preferides per simulacre" />
        <MetricCard label="Pendents revisio" value={dashboard.pendingReview} detail="Estat draft" />
        <MetricCard label="Ratxa d'estudi" value={`${dashboard.streakDays} dies`} detail={`XP ${dashboard.xp} · nivell ${dashboard.level}`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white">
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Recomanacio principal</p>
          {dashboard.recommendation ? (
            <>
              <h2 className="mt-3 text-2xl font-semibold">{dashboard.recommendation.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{dashboard.recommendation.reason}</p>
              <p className="mt-3 text-sm font-semibold text-ink">{dashboard.recommendation.action}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Encara no hi ha prou dades per recomanar repassos.</p>
          )}
        </Card>

        <Card className="bg-ink text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Accessos rapids</p>
          <div className="mt-4 grid gap-3">
            {[
              { href: "/opos/import", label: "Importar preguntes", icon: FileUp },
              { href: "/opos/questions", label: "Banc de preguntes", icon: ListChecks },
              { href: "/opos/tests/new", label: "Test per tema", icon: Brain },
              { href: "/opos/mock-exams", label: "Simulacre exercici 1", icon: Timer }
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm hover:bg-white/15">
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {label}
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Temes forts</p>
          <div className="mt-4 space-y-3">
            {dashboard.strongTopics.length === 0 ? (
              <p className="text-sm text-slate-600">Falten intents per detectar fortaleses.</p>
            ) : (
              dashboard.strongTopics.map((topic) => (
                <div key={topic.topicNumber} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-ink">
                    Tema {topic.topicNumber} · {topic.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{Math.round(topic.accuracy * 100)}% d'encert</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Temes febles</p>
          <div className="mt-4 space-y-3">
            {dashboard.weakTopics.length === 0 ? (
              <p className="text-sm text-slate-600">Encara no hi ha mostra fiable de punts febles.</p>
            ) : (
              dashboard.weakTopics.map((topic) => (
                <div key={topic.key} className="rounded-2xl bg-rose-50 p-4">
                  <p className="font-semibold text-rose-900">{topic.label}</p>
                  <p className="mt-1 text-sm text-rose-800">{topic.explanation}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">Mostra insuficient</p>
          <div className="mt-4 space-y-3">
            {dashboard.lowSampleTopics.length === 0 ? (
              <p className="text-sm text-slate-600">No hi ha blocs marcats amb mostra insuficient.</p>
            ) : (
              dashboard.lowSampleTopics.map((topic) => (
                <div key={topic.key} className="rounded-2xl bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900">{topic.label}</p>
                  <p className="mt-1 text-sm text-amber-900">{topic.explanation}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-pine">Historial recent</p>
            <h2 className="mt-2 text-2xl font-semibold">Ultims intents</h2>
          </div>
          <Badge label={`${sessions.length} sessions`} tone="mobility" />
        </div>
        <div className="mt-4 space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-600">Encara no hi ha intents registrats.</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-ink">{session.mode === "mock_exam" ? "Simulacre" : "Test per tema"}</p>
                  <p className="text-sm text-slate-600">{new Date(session.startedAt).toLocaleString("ca-ES")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge label={`${session.correctCount} encerts`} tone="completed" />
                  <Badge label={`${session.wrongCount} errors`} tone="pending" />
                  <Badge label={`${session.blankCount} blancs`} tone="rest" />
                  <Badge label={`${session.score ?? 0} punts`} tone="strength" />
                  <Link href={`/opos/tests/${session.id}/results`} className="inline-flex items-center text-sm font-semibold text-pine">
                    Veure resultat
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
