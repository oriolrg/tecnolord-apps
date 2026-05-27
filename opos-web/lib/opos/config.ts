export const EXAM_CONFIG = {
  exercise1: {
    key: "exercise1",
    label: "Exercici 1",
    totalOrdinaryQuestions: 50,
    reserveQuestions: 5,
    durationMinutes: 80,
    maxScore: 15,
    minimumPassingScore: 6,
    wrongAnswerPenaltyFraction: 0.25
  },
  exercise2: {
    key: "exercise2",
    label: "Exercici 2",
    totalOrdinaryQuestions: 25,
    reserveQuestions: 3,
    durationMinutes: 90,
    maxScore: 15,
    minimumPassingScore: 7.5,
    wrongAnswerPenaltyFraction: 0.25
  }
} as const;

export const QUESTION_STATUS_ORDER = ["draft", "reviewed", "validated", "doubtful", "archived"] as const;

export const DEFAULT_OPOS_SETTINGS = {
  weakPointMinimumSample: 10,
  dailyGoal: 10,
  weeklyGoal: 50,
  wrongAnswerPenaltyFraction: 0.25,
  minimumQuestionStatus: "validated",
  qualityRequiresExplanation: false
} as const;
