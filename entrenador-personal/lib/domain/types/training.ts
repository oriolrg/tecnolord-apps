export const sessionStatuses = [
  "pending",
  "completed",
  "partial",
  "skipped",
  "substituted",
  "rest"
] as const;

export const sessionTypes = [
  "strength",
  "swim",
  "bike",
  "trail",
  "walk",
  "mobility",
  "garden",
  "rest",
  "combined",
  "intensity",
  "outdoor"
] as const;

export type SessionStatus = (typeof sessionStatuses)[number];
export type SessionType = (typeof sessionTypes)[number];
export type CatalogItemKind = "exercise" | "activity";
export type TrackingField =
  | "sets"
  | "reps"
  | "weightKg"
  | "rpe"
  | "durationMin"
  | "distanceKm"
  | "elevationGainM"
  | "poolMeters"
  | "avgHeartRate"
  | "maxHeartRate"
  | "avgPower"
  | "calories"
  | "pace";

export interface ExerciseReference {
  exerciseSlug: string;
  sets?: number;
  reps?: string;
  restSeconds?: number;
  intensity?: string;
  rpe?: number;
  notes?: string;
}

export interface ActivityReference {
  discipline: SessionType;
  zone?: string;
  durationMin?: number;
  durationMax?: number;
  distanceKm?: number;
  elevationGainM?: number;
  intervals?: string[];
  notes?: string;
}

export interface SessionBlock {
  id: string;
  title: string;
  blockType: "strength" | "cardio" | "mobility" | "recovery" | "mixed";
  notes?: string;
  exercises?: ExerciseReference[];
  activity?: ActivityReference;
}

export interface SessionAlternative {
  label: string;
  trigger: "low_time" | "fatigue" | "pain" | "weather" | "equipment";
  summary: string;
  replacementBlockIds?: string[];
  suggestedDurationMin?: number;
}

export interface PlannedSession {
  id: string;
  date: string;
  title: string;
  type: SessionType;
  status: SessionStatus;
  goal?: string;
  plannedDurationMin?: number;
  plannedDurationMax?: number;
  plannedRpe?: number;
  plannedZone?: string;
  tags?: string[];
  blocks: SessionBlock[];
  alternatives?: SessionAlternative[];
  notes?: string;
}

export interface TargetProfile {
  athleteType: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  objectives: string[];
  constraints: string[];
  weeklyAvailability: Record<string, string>;
}

export interface ReplanningRule {
  id: string;
  label: string;
  condition: string;
  action: string;
  priority: number;
}

export interface TrainingPlan {
  metadata: {
    id: string;
    name: string;
    athleteName: string;
    coach?: string;
    timezone: string;
    createdAt: string;
    source: "manual" | "ai" | "imported";
  };
  targetProfile: TargetProfile;
  monthlyPeriod: {
    year: number;
    month: number;
    startsOn: string;
    endsOn: string;
  };
  intensityCriteria: {
    rpeScale: string;
    hrZones: Record<string, string>;
    loadFormula: string;
  };
  replanningRules: ReplanningRule[];
  aiNotes?: {
    contextSummary: string;
    promptHints: string[];
  };
  days: PlannedSession[];
}

export interface DailyCheckIn {
  status: SessionStatus;
  availableTimeMin?: number;
  painLevel?: number;
  fatigueLevel?: number;
  sleepQuality?: number;
  notes?: string;
}

export interface ReplanSuggestion {
  date: string;
  summary: string;
  reason: string;
  suggestedStatus: SessionStatus;
  adjustments: string[];
}

export interface ImportedActivityRecord {
  externalId?: string;
  provider: string;
  date: string;
  activityType: SessionType;
  linkedTo?: string;
  durationMin: number;
  distanceKm?: number;
  elevationGainM?: number;
  avgPace?: number;
  avgPower?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  laps?: Array<Record<string, unknown>>;
  rawPayload: Record<string, unknown>;
}

export interface CatalogItem {
  slug: string;
  kind: CatalogItemKind;
  sessionType: SessionType;
  name: string;
  description: string;
  muscleGroup?: string;
  equipment: string[];
  technicalCues: string[];
  commonErrors: string[];
  mediaUrl?: string;
  trackingFields: TrackingField[];
}

export interface ExerciseLogEntry {
  exerciseSlug: string;
  plannedSets?: number;
  plannedReps?: string;
  completedSets?: number;
  completedReps?: string;
  weightKg?: number;
  rpe?: number;
  done: boolean;
  notes?: string;
}

export interface ActivityLogEntry {
  blockId: string;
  discipline: SessionType;
  durationMin?: number;
  distanceKm?: number;
  elevationGainM?: number;
  poolMeters?: number;
  avgPace?: number;
  avgPower?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  done: boolean;
  notes?: string;
}

export interface DailyWorkoutEntry {
  sessionDate: string;
  sessionId: string;
  status: SessionStatus;
  notes?: string;
  availableTimeMin?: number;
  painLevel?: number;
  fatigueLevel?: number;
  sleepQuality?: number;
  stressLevel?: number;
  exerciseLogs: ExerciseLogEntry[];
  activityLogs: ActivityLogEntry[];
  importedActivities: ImportedActivityRecord[];
  updatedAt: string;
}
