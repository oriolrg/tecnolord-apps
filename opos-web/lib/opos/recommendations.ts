import { differenceInCalendarDays } from "date-fns";
import type { RecommendationInput, RecommendationResult } from "@/lib/opos/types";

export function buildRecommendations({ weakPoints, examDate }: RecommendationInput): RecommendationResult[] {
  const topWeakPoint = weakPoints.find((item) => item.sampleStatus === "reliable") ?? weakPoints[0];
  const daysToExam = examDate ? differenceInCalendarDays(examDate, new Date()) : null;
  const recommendations: RecommendationResult[] = [];

  if (topWeakPoint) {
    recommendations.push({
      title: `Repassa ${topWeakPoint.label}`,
      reason:
        topWeakPoint.sampleStatus === "reliable"
          ? `${Math.round(topWeakPoint.accuracyRate * 100)}% d'encert en ${topWeakPoint.attempts} preguntes; hi ha error recurrent.`
          : `No tens prou mostra de ${topWeakPoint.label}; convé un test exploratori.`,
      action:
        topWeakPoint.sampleStatus === "reliable"
          ? `Fes un test focalitzat i afegeix les fallades a la cua de repas.`
          : `Fes 10 preguntes noves del bloc per obtenir una mostra fiable.`,
      priority: topWeakPoint.sampleStatus === "reliable" ? "high" : "medium"
    });
  }

  const lowConfidenceReliable = weakPoints.find((item) => item.sampleStatus === "reliable" && item.averageConfidence < 0.55);
  if (lowConfidenceReliable) {
    recommendations.push({
      title: "Consolida encerts insegurs",
      reason: `${lowConfidenceReliable.label} te encerts, pero la confiança mitjana es baixa.`,
      action: "Repeteix preguntes ja encertades marcant confiança i revisa explicacions.",
      priority: "medium"
    });
  }

  if (typeof daysToExam === "number") {
    recommendations.push({
      title: daysToExam <= 30 ? "Prioritza simulacres oficials" : "Mantingues estudi mixt",
      reason:
        daysToExam <= 30
          ? `Queden ${daysToExam} dies per a l'examen; convé acostumar-se al temps oficial.`
          : `Queden ${daysToExam} dies; encara hi ha marge per construir base i detectar buits.`,
      action: daysToExam <= 30 ? "Combina simulacre exercici 1 amb repas dels errors del mateix dia." : "Alterna test tematic i simulacre curt.",
      priority: daysToExam <= 30 ? "high" : "low"
    });
  }

  return recommendations.slice(0, 3);
}
