import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/opos/section-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EXAM_CONFIG } from "@/lib/opos/config";
import { createTestSession } from "@/lib/opos/repository";

export default function MockExamsPage() {
  async function startMockExam() {
    "use server";
    const session = await createTestSession({
      mode: "mock_exam",
      examExercise: "exercise1",
      minimumStatus: "validated"
    });
    redirect(`/opos/tests/${session.sessionId}`);
  }

  const exercise1 = EXAM_CONFIG.exercise1;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Simulacres"
        title="Simulacre oficial exercici 1"
        description="El cronometre aplica 80 minuts, la puntuacio maxima son 15 punts i la penalitzacio es d'un quart per error."
      />
      <Card>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Ordinaries</p>
            <p className="mt-2 text-3xl font-semibold">{exercise1.totalOrdinaryQuestions}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Reserva</p>
            <p className="mt-2 text-3xl font-semibold">{exercise1.reserveQuestions}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Temps</p>
            <p className="mt-2 text-3xl font-semibold">{exercise1.durationMinutes} min</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Minim apte</p>
            <p className="mt-2 text-3xl font-semibold">{exercise1.minimumPassingScore}</p>
          </div>
        </div>
        <form action={startMockExam} className="mt-6">
          <Button type="submit">Iniciar simulacre exercici 1</Button>
        </form>
      </Card>
    </div>
  );
}
