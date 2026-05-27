import type { TrainingPlan } from "@/lib/domain/types/training";
import { trainingPlanSchema, type TrainingPlanInput } from "@/lib/validation/training-plan";

export interface ParsePlanResult {
  success: boolean;
  plan?: TrainingPlan;
  errors: string[];
}

export function parseTrainingPlan(input: string | TrainingPlanInput): ParsePlanResult {
  const json = typeof input === "string" ? safeParseJson(input) : input;
  if (!json) {
    return { success: false, errors: ["Invalid JSON payload"] };
  }

  const result = trainingPlanSchema.safeParse(json);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    };
  }

  return {
    success: true,
    plan: result.data as TrainingPlan,
    errors: []
  };
}

function safeParseJson(raw: string): TrainingPlanInput | null {
  try {
    return JSON.parse(raw) as TrainingPlanInput;
  } catch {
    return null;
  }
}
