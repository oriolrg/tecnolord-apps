import { SectionHeader } from "@/components/opos/section-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listQuestions } from "@/lib/opos/repository";

export default async function OposReviewPage() {
  const draftQuestions = await listQuestions({ status: "draft" });

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Revisio"
        title="Preguntes pendents"
        description="L'MVP deixa visible el pipeline de qualitat: preguntes draft, sense explicacio o sense prou revisio abans d'usar-les en simulacre."
      />
      <div className="grid gap-4">
        {draftQuestions.map((question) => (
          <Card key={question.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-pine">
                  Tema {question.topicNumber} · {question.section}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{question.text}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {question.explanation ? "Té explicacio, pero encara no s'ha validat." : "Sense explicacio; convé completar-la abans de validar."}
                </p>
              </div>
              <Badge label={question.status} tone="pending" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
