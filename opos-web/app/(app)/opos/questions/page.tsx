import Link from "next/link";
import { SectionHeader } from "@/components/opos/section-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getQuestionFiltersMetadata, listQuestions } from "@/lib/opos/repository";

export default async function OposQuestionsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const topicNumber = searchParams?.topic ? Number(searchParams.topic) : undefined;
  const status = typeof searchParams?.status === "string" ? searchParams.status : "all";
  const [questions, metadata] = await Promise.all([
    listQuestions({
      topicNumber: Number.isFinite(topicNumber) ? topicNumber : undefined,
      status: status as never
    }),
    getQuestionFiltersMetadata()
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Banc"
        title="Banc de preguntes"
        description="Filtra per tema i estat, identifica demo vs reals i revisa l'historial de resposta de cada pregunta."
      />

      <Card>
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <select name="topic" defaultValue={topicNumber ? String(topicNumber) : ""} className="input">
            <option value="">Tots els temes</option>
            {metadata.topics.map((topic) => (
              <option key={topic.number} value={topic.number}>
                Tema {topic.number} · {topic.title}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={status} className="input">
            <option value="all">Tots els estats</option>
            {metadata.statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Aplicar filtres</button>
        </form>
      </Card>

      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.2em] text-pine">
                  Tema {question.topicNumber} · {question.section}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{question.text}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {question.externalId} · {question.topicTitle} · {question.options.length} opcions
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {question.explanation ?? "Sense explicacio encara. Requereix revisio abans de validar."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge label={question.status} tone={question.status === "validated" ? "completed" : question.status === "draft" ? "pending" : "partial"} />
                <Badge label={question.isDemo ? "demo" : "real"} tone={question.isDemo ? "mobility" : "strength"} />
                <Badge label={`${question.testAnswers.length} intents`} tone="rest" />
                <Link href="/opos/review" className="inline-flex items-center text-sm font-semibold text-pine">
                  Revisar
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
