import { describe, expect, it } from "vitest";
import examplePlan from "@/monthly-plan.example.json";
import { generateReplanSuggestion } from "@/lib/domain/services/replanning-engine";
import type { TrainingPlan } from "@/lib/domain/types/training";

const plan = examplePlan as TrainingPlan;

describe("generateReplanSuggestion", () => {
  it("protects recovery when fatigue is high", () => {
    const result = generateReplanSuggestion({
      plan,
      skippedSessionDate: "2026-05-08",
      checkIn: {
        status: "skipped",
        fatigueLevel: 9,
        painLevel: 3
      }
    });

    expect(result.reason).toBe("recovery_priority");
    expect(result.suggestedStatus).toBe("substituted");
  });

  it("offers a short version when time is limited", () => {
    const result = generateReplanSuggestion({
      plan,
      skippedSessionDate: "2026-05-04",
      checkIn: {
        status: "skipped",
        availableTimeMin: 20,
        fatigueLevel: 4,
        painLevel: 2
      }
    });

    expect(result.reason).toBe("rules_engine");
    expect(result.adjustments.some((item) => item.includes("versio curta") || item.includes("Retallar"))).toBe(true);
  });
});
