import type { WeakPointCandidate, WeakPointResult } from "@/lib/opos/types";

export function evaluateWeakPoints(candidates: WeakPointCandidate[], minimumSample: number): WeakPointResult[] {
  return candidates
    .map((candidate) => {
      const attempts = Math.max(candidate.attempts, 1);
      const accuracyRate = candidate.correctCount / attempts;
      const sampleStatus = candidate.attempts >= minimumSample ? "reliable" : "insufficient";
      const repeatedErrorRate = candidate.wrongCount / attempts;
      const confidencePenalty = 1 - candidate.averageConfidence;
      const difficultyPenalty = candidate.hardQuestionRatio ?? 0;
      const agePenalty = candidate.lastAttemptAt
        ? Math.min(1, (Date.now() - candidate.lastAttemptAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 1;
      const sampleFactor = sampleStatus === "reliable" ? 1 : 0.45;
      const severity = Number(
        (
          ((1 - accuracyRate) * 0.45 + repeatedErrorRate * 0.3 + confidencePenalty * 0.1 + difficultyPenalty * 0.05 + agePenalty * 0.1) *
          sampleFactor
        ).toFixed(4)
      );

      const explanation =
        sampleStatus === "insufficient"
          ? `${candidate.label}: mostra insuficient (${candidate.attempts} preguntes).`
          : `${candidate.label}: ${Math.round(accuracyRate * 100)}% d'encert en ${candidate.attempts} preguntes.`;

      return {
        ...candidate,
        accuracyRate: Number(accuracyRate.toFixed(4)),
        sampleStatus,
        severity,
        repeatedErrorRate: Number(repeatedErrorRate.toFixed(4)),
        explanation
      } satisfies WeakPointResult;
    })
    .sort((left, right) => right.severity - left.severity);
}
