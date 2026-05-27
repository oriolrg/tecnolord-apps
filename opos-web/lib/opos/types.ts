export type ExamExerciseKey = "exercise1" | "exercise2";
export type QuestionStatusKey = "draft" | "reviewed" | "validated" | "doubtful" | "archived";
export type DifficultyKey = "easy" | "medium" | "hard";
export type ExamPartKey = "common" | "specific";
export type QuestionTypeKey =
  | "conceptual"
  | "practical"
  | "legal"
  | "technical"
  | "definition"
  | "comparison"
  | "case";
export type ConfidenceKey = "low" | "medium" | "high";

export interface ScoringInput {
  correctAnswers: number;
  wrongAnswers: number;
  blankAnswers?: number;
  totalOrdinaryQuestions: number;
  maxScore: number;
  wrongAnswerPenaltyFraction?: number;
}

export interface WeakPointCandidate {
  key: string;
  label: string;
  attempts: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  averageConfidence: number;
  lastAttemptAt?: Date;
  hardQuestionRatio?: number;
}

export interface WeakPointResult extends WeakPointCandidate {
  accuracyRate: number;
  sampleStatus: "insufficient" | "reliable";
  severity: number;
  repeatedErrorRate: number;
  explanation: string;
}

export interface ReviewQueueState {
  intervalDays: number;
  easeFactor: number;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  lastReviewedAt?: Date;
}

export interface RecommendationInput {
  weakPoints: WeakPointResult[];
  examDate?: Date | null;
}

export interface RecommendationResult {
  title: string;
  reason: string;
  action: string;
  priority: "high" | "medium" | "low";
}

export interface ImportedQuestionDraft {
  id: string;
  examPart: ExamPartKey;
  examExercise: ExamExerciseKey | "both";
  topicNumber: number;
  topicTitle: string;
  section: string;
  subsection?: string;
  type: QuestionTypeKey;
  difficulty: DifficultyKey;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation?: string;
  wrongOptionExplanations?: Record<string, string>;
  source?: { document?: string; reference?: string };
  tags?: string[];
  status?: QuestionStatusKey;
  caseStudy?: {
    title: string;
    description?: string;
  };
}
