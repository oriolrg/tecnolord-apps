import { describe, expect, it } from "vitest";
import { buildRecommendations } from "@/lib/opos/recommendations";
import { updateReviewQueue } from "@/lib/opos/spaced-repetition";
import { evaluateWeakPoints } from "@/lib/opos/weak-points";

describe("weak points", () => {
  it("marca mostra insuficient quan no arriba al minim", () => {
    const result = evaluateWeakPoints(
      [
        {
          key: "t1",
          label: "Tema 1",
          attempts: 3,
          correctCount: 1,
          wrongCount: 2,
          blankCount: 0,
          averageConfidence: 0.5
        }
      ],
      10
    );

    expect(result[0].sampleStatus).toBe("insufficient");
  });

  it("marca punt feble rellevant amb mostra suficient", () => {
    const result = evaluateWeakPoints(
      [
        {
          key: "t1",
          label: "Tema 1",
          attempts: 40,
          correctCount: 22,
          wrongCount: 18,
          blankCount: 0,
          averageConfidence: 0.4
        }
      ],
      10
    );

    expect(result[0].sampleStatus).toBe("reliable");
    expect(result[0].severity).toBeGreaterThan(0.2);
  });
});

describe("recommendations", () => {
  it("genera recomanacions explicables", () => {
    const recommendations = buildRecommendations({
      weakPoints: [
        {
          key: "t1",
          label: "Tema 1, signatura digital",
          attempts: 12,
          correctCount: 5,
          wrongCount: 7,
          blankCount: 0,
          averageConfidence: 0.45,
          accuracyRate: 0.4167,
          sampleStatus: "reliable",
          severity: 0.72,
          repeatedErrorRate: 0.58,
          explanation: "Tema 1, signatura digital: 42% d'encert en 12 preguntes."
        }
      ]
    });

    expect(recommendations[0].reason).toContain("12 preguntes");
  });
});

describe("spaced repetition", () => {
  it("fa tornar aviat una pregunta fallada", () => {
    const result = updateReviewQueue({
      previous: null,
      wasCorrect: false,
      confidence: "low",
      reviewedAt: new Date("2026-05-27T00:00:00Z")
    });

    expect(result.intervalDays).toBe(1);
    expect(result.nextReviewAt.toISOString()).toContain("2026-05-28");
  });

  it("espacia una pregunta ben consolidada", () => {
    const result = updateReviewQueue({
      previous: {
        intervalDays: 4,
        easeFactor: 2.5,
        masteryLevel: 1.5,
        totalAttempts: 3,
        correctAttempts: 2,
        wrongAttempts: 1
      },
      wasCorrect: true,
      confidence: "high",
      reviewedAt: new Date("2026-05-27T00:00:00Z")
    });

    expect(result.intervalDays).toBeGreaterThan(4);
    expect(result.masteryLevel).toBeGreaterThan(1.5);
  });
});
