import type { ReviewQueueState } from "@/lib/opos/types";

export interface ReviewUpdateInput {
  previous: ReviewQueueState | null;
  wasCorrect: boolean;
  confidence?: "low" | "medium" | "high" | null;
  reviewedAt?: Date;
}

export interface ReviewUpdateResult extends ReviewQueueState {
  nextReviewAt: Date;
  lastResult: "correct" | "wrong";
}

const CONFIDENCE_BONUS = {
  low: -0.2,
  medium: 0,
  high: 0.1
} as const;

export function updateReviewQueue(input: ReviewUpdateInput): ReviewUpdateResult {
  const previous = input.previous ?? {
    intervalDays: 1,
    easeFactor: 2.5,
    masteryLevel: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    wrongAttempts: 0
  };

  const reviewedAt = input.reviewedAt ?? new Date();
  const confidenceBonus = input.confidence ? CONFIDENCE_BONUS[input.confidence] : 0;

  if (!input.wasCorrect) {
    return {
      intervalDays: 1,
      easeFactor: Number(Math.max(1.3, previous.easeFactor - 0.25).toFixed(2)),
      masteryLevel: Number(Math.max(0, previous.masteryLevel - 0.2).toFixed(2)),
      totalAttempts: previous.totalAttempts + 1,
      correctAttempts: previous.correctAttempts,
      wrongAttempts: previous.wrongAttempts + 1,
      lastReviewedAt: reviewedAt,
      nextReviewAt: addDays(reviewedAt, 1),
      lastResult: "wrong"
    };
  }

  const nextEase = Number(Math.min(3, Math.max(1.3, previous.easeFactor + 0.15 + confidenceBonus)).toFixed(2));
  const nextIntervalBase = previous.totalAttempts === 0 ? 2 : Math.round(previous.intervalDays * nextEase);
  const nextIntervalDays = Math.max(2, Math.min(90, nextIntervalBase));

  return {
    intervalDays: nextIntervalDays,
    easeFactor: nextEase,
    masteryLevel: Number(Math.min(5, previous.masteryLevel + (input.confidence === "high" ? 0.4 : 0.25)).toFixed(2)),
    totalAttempts: previous.totalAttempts + 1,
    correctAttempts: previous.correctAttempts + 1,
    wrongAttempts: previous.wrongAttempts,
    lastReviewedAt: reviewedAt,
    nextReviewAt: addDays(reviewedAt, nextIntervalDays),
    lastResult: "correct"
  };
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
