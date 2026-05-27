"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SessionQuestion {
  id: string;
  externalId: string;
  topicNumber: number;
  topicTitle: string;
  section: string;
  difficulty: string;
  questionType: string;
  text: string;
  explanation?: string | null;
  options: Array<{ id: string; label: string; text: string }>;
}

export function TestRunner({
  sessionId,
  examLabel,
  questions,
  showTimerSeconds
}: {
  sessionId: string;
  examLabel: string;
  questions: SessionQuestion[];
  showTimerSeconds?: number;
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; confidence?: "low" | "medium" | "high"; timeSpentSeconds: number }>>({});
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState(showTimerSeconds ?? 0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!showTimerSeconds) {
      return;
    }
    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [showTimerSeconds]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => Object.values(answers).filter((answer) => answer.selectedOptionId).length,
    [answers]
  );

  useEffect(() => {
    if (showTimerSeconds && remainingSeconds === 0) {
      void submit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  function trackTime(questionId: string) {
    const now = Date.now();
    const elapsed = Math.max(5, Math.round((now - questionStartedAt) / 1000));
    setAnswers((previous) => ({
      ...previous,
      [questionId]: {
        selectedOptionId: previous[questionId]?.selectedOptionId,
        confidence: previous[questionId]?.confidence,
        timeSpentSeconds: (previous[questionId]?.timeSpentSeconds ?? 0) + elapsed
      }
    }));
    setQuestionStartedAt(now);
  }

  function updateAnswer(questionId: string, next: Partial<{ selectedOptionId?: string; confidence?: "low" | "medium" | "high" }>) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: {
        selectedOptionId: next.selectedOptionId ?? previous[questionId]?.selectedOptionId,
        confidence: next.confidence ?? previous[questionId]?.confidence,
        timeSpentSeconds: previous[questionId]?.timeSpentSeconds ?? 0
      }
    }));
  }

  async function submit(abandon: boolean) {
    const payload = questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: answers[question.id]?.selectedOptionId,
      confidence: answers[question.id]?.confidence,
      timeSpentSeconds: answers[question.id]?.timeSpentSeconds ?? 0
    }));

    startTransition(async () => {
      const response = await fetch(`/api/opos/tests/${sessionId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload.filter((item) => item.selectedOptionId), abandon })
      });

      if (!response.ok) {
        return;
      }

      router.push(`/opos/tests/${sessionId}/results`);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
      <Card className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-pine">{examLabel}</p>
        <h2 className="text-2xl font-semibold">Control de la sessio</h2>
        <div className="grid gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Contestades</p>
            <p className="mt-2 text-3xl font-semibold">{answeredCount}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Pendents</p>
            <p className="mt-2 text-3xl font-semibold">{questions.length - answeredCount}</p>
          </div>
          {showTimerSeconds ? (
            <div className="rounded-2xl bg-ink p-4 text-white">
              <p className="text-sm text-slate-300">Temps restant</p>
              <p className="mt-2 text-3xl font-semibold">{formatDuration(remainingSeconds)}</p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const isAnswered = Boolean(answers[question.id]?.selectedOptionId);
            return (
              <button
                key={question.id}
                type="button"
                className={`rounded-2xl px-3 py-2 text-sm font-semibold ${index === currentIndex ? "bg-ink text-white" : isAnswered ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                onClick={() => {
                  trackTime(currentQuestion.id);
                  setCurrentIndex(index);
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void submit(true)} disabled={isPending}>
            Abandonar i guardar
          </Button>
          <Button onClick={() => void submit(false)} disabled={isPending}>
            Finalitzar
          </Button>
        </div>
      </Card>

      <Card className="space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-pine">
            Tema {currentQuestion.topicNumber} · {currentQuestion.section}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{currentQuestion.text}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {currentQuestion.topicTitle} · {currentQuestion.questionType} · {currentQuestion.difficulty}
          </p>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <label key={option.id} className="flex cursor-pointer gap-3 rounded-[24px] border border-slate-200 p-4">
              <input
                type="radio"
                name={currentQuestion.id}
                checked={answers[currentQuestion.id]?.selectedOptionId === option.id}
                onChange={() => updateAnswer(currentQuestion.id, { selectedOptionId: option.id })}
              />
              <div>
                <p className="font-semibold text-ink">{option.label}</p>
                <p className="mt-1 text-sm text-slate-600">{option.text}</p>
              </div>
            </label>
          ))}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Confiança</p>
          <div className="mt-3 flex gap-2">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateAnswer(currentQuestion.id, { confidence: level })}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${answers[currentQuestion.id]?.confidence === level ? "bg-ink text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {level === "low" ? "Baixa" : level === "medium" ? "Mitjana" : "Alta"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentIndex === 0) {
                return;
              }
              trackTime(currentQuestion.id);
              setCurrentIndex((value) => value - 1);
            }}
            disabled={currentIndex === 0}
          >
            Anterior
          </Button>
          <Button
            onClick={() => {
              if (currentIndex === questions.length - 1) {
                return;
              }
              trackTime(currentQuestion.id);
              setCurrentIndex((value) => value + 1);
            }}
            disabled={currentIndex === questions.length - 1}
          >
            Seguent
          </Button>
        </div>
      </Card>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
