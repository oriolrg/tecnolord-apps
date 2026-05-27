import { describe, expect, it } from "vitest";
import { calculateExamScore } from "@/lib/opos/scoring";

describe("calculateExamScore", () => {
  it("aplica la formula oficial amb penalitzacio", () => {
    const result = calculateExamScore({
      correctAnswers: 40,
      wrongAnswers: 8,
      blankAnswers: 2,
      totalOrdinaryQuestions: 50,
      maxScore: 15
    });

    expect(result.finalScore).toBe(11.4);
  });

  it("no penalitza els blancs", () => {
    const withBlanks = calculateExamScore({
      correctAnswers: 20,
      wrongAnswers: 4,
      blankAnswers: 26,
      totalOrdinaryQuestions: 50,
      maxScore: 15
    });

    expect(withBlanks.finalScore).toBe(5.7);
  });

  it("acota la nota minima a zero", () => {
    const result = calculateExamScore({
      correctAnswers: 0,
      wrongAnswers: 50,
      totalOrdinaryQuestions: 50,
      maxScore: 15
    });

    expect(result.rawScore).toBeLessThan(0);
    expect(result.finalScore).toBe(0);
  });
});
