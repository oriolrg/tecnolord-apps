import { describe, expect, it } from "vitest";
import examplePlan from "@/monthly-plan.example.json";
import { parseTrainingPlan } from "@/lib/domain/services/plan-parser";

describe("parseTrainingPlan", () => {
  it("accepts the bundled monthly example", () => {
    const result = parseTrainingPlan(JSON.stringify(examplePlan));

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.plan?.days.length).toBeGreaterThan(6);
  });

  it("rejects invalid payloads", () => {
    const result = parseTrainingPlan(JSON.stringify({ metadata: { id: "x" } }));

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
