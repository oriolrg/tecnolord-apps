import { notFound } from "next/navigation";
import { TestRunner } from "@/components/opos/test-runner";
import { SectionHeader } from "@/components/opos/section-header";
import { EXAM_CONFIG } from "@/lib/opos/config";
import { getTestSession } from "@/lib/opos/repository";

export default async function TestSessionPage({ params }: { params: { id: string } }) {
  const session = await getTestSession(params.id);
  if (!session) {
    notFound();
  }

  const examConfig = EXAM_CONFIG[session.examExercise as "exercise1" | "exercise2"];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Sessio"
        title={session.mode === "mock_exam" ? "Simulacre en curs" : "Test en curs"}
        description="Respon una sola opcio per pregunta, marca confiança i finalitza quan vulguis. Les explicacions queden reservades per al final."
      />
      <TestRunner
        sessionId={session.id}
        examLabel={session.mode === "mock_exam" ? examConfig.label : "Test d'estudi"}
        questions={session.questions}
        showTimerSeconds={session.mode === "mock_exam" ? examConfig.durationMinutes * 60 : undefined}
      />
    </div>
  );
}
