import { z } from "zod";
import { sessionStatuses, sessionTypes } from "@/lib/domain/types/training";

const exerciseReferenceSchema = z.object({
  exerciseSlug: z.string().min(1),
  sets: z.number().int().positive().optional(),
  reps: z.string().optional(),
  restSeconds: z.number().int().nonnegative().optional(),
  intensity: z.string().optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional()
});

const activityReferenceSchema = z.object({
  discipline: z.enum(sessionTypes),
  zone: z.string().optional(),
  durationMin: z.number().int().positive().optional(),
  durationMax: z.number().int().positive().optional(),
  distanceKm: z.number().nonnegative().optional(),
  elevationGainM: z.number().int().nonnegative().optional(),
  intervals: z.array(z.string()).optional(),
  notes: z.string().optional()
});

const sessionBlockSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  blockType: z.enum(["strength", "cardio", "mobility", "recovery", "mixed"]),
  notes: z.string().optional(),
  exercises: z.array(exerciseReferenceSchema).optional(),
  activity: activityReferenceSchema.optional()
});

const alternativeSchema = z.object({
  label: z.string().min(1),
  trigger: z.enum(["low_time", "fatigue", "pain", "weather", "equipment"]),
  summary: z.string().min(1),
  replacementBlockIds: z.array(z.string()).optional(),
  suggestedDurationMin: z.number().int().positive().optional()
});

const plannedSessionSchema = z.object({
  id: z.string().min(1),
  date: z.string().date(),
  title: z.string().min(1),
  type: z.enum(sessionTypes),
  status: z.enum(sessionStatuses),
  goal: z.string().optional(),
  plannedDurationMin: z.number().int().positive().optional(),
  plannedDurationMax: z.number().int().positive().optional(),
  plannedRpe: z.number().int().min(1).max(10).optional(),
  plannedZone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  blocks: z.array(sessionBlockSchema).min(1),
  alternatives: z.array(alternativeSchema).optional(),
  notes: z.string().optional()
});

export const trainingPlanSchema = z.object({
  metadata: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    athleteName: z.string().min(1),
    coach: z.string().optional(),
    timezone: z.string().min(1),
    createdAt: z.string().datetime(),
    source: z.enum(["manual", "ai", "imported"])
  }),
  targetProfile: z.object({
    athleteType: z.string().min(1),
    experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
    objectives: z.array(z.string()).min(1),
    constraints: z.array(z.string()).min(1),
    weeklyAvailability: z.record(z.string())
  }),
  monthlyPeriod: z.object({
    year: z.number().int().gte(2024),
    month: z.number().int().min(1).max(12),
    startsOn: z.string().date(),
    endsOn: z.string().date()
  }),
  intensityCriteria: z.object({
    rpeScale: z.string().min(1),
    hrZones: z.record(z.string()),
    loadFormula: z.string().min(1)
  }),
  replanningRules: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      condition: z.string().min(1),
      action: z.string().min(1),
      priority: z.number().int().nonnegative()
    })
  ),
  aiNotes: z
    .object({
      contextSummary: z.string().min(1),
      promptHints: z.array(z.string()).min(1)
    })
    .optional(),
  days: z.array(plannedSessionSchema).min(1)
});

export type TrainingPlanInput = z.input<typeof trainingPlanSchema>;
export type TrainingPlanOutput = z.output<typeof trainingPlanSchema>;
