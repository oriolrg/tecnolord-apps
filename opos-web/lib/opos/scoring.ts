import type { ScoringInput } from "@/lib/opos/types";

export interface ScoreResult {
  rawScore: number;
  finalScore: number;
  passed: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  blankAnswers: number;
  accuracyRate: number;
}

export function calculateExamScore({
  correctAnswers,
  wrongAnswers,
  blankAnswers = 0,
  totalOrdinaryQuestions,
  maxScore,
  wrongAnswerPenaltyFraction = 0.25
}: ScoringInput): ScoreResult {
  const rawScore = ((correctAnswers - wrongAnswers * wrongAnswerPenaltyFraction) * maxScore) / totalOrdinaryQuestions;
  const boundedScore = Math.max(0, Math.min(maxScore, rawScore));

  return {
    rawScore,
    finalScore: Number(boundedScore.toFixed(2)),
    passed: boundedScore >= maxScore * 0.4,
    correctAnswers,
    wrongAnswers,
    blankAnswers,
    accuracyRate: totalOrdinaryQuestions === 0 ? 0 : Number((correctAnswers / totalOrdinaryQuestions).toFixed(4))
  };
}
