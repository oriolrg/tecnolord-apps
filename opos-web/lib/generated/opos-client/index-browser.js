
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  externalId: 'externalId',
  examPart: 'examPart',
  examExercise: 'examExercise',
  topicNumber: 'topicNumber',
  topicTitle: 'topicTitle',
  section: 'section',
  subsection: 'subsection',
  questionType: 'questionType',
  difficulty: 'difficulty',
  text: 'text',
  explanation: 'explanation',
  sourceDocument: 'sourceDocument',
  sourceReference: 'sourceReference',
  tagsJson: 'tagsJson',
  status: 'status',
  isDemo: 'isDemo',
  isFavorite: 'isFavorite',
  isDoubtful: 'isDoubtful',
  isArchived: 'isArchived',
  reserveOrder: 'reserveOrder',
  caseStudyId: 'caseStudyId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OptionScalarFieldEnum = {
  id: 'id',
  questionId: 'questionId',
  label: 'label',
  text: 'text',
  isCorrect: 'isCorrect',
  explanation: 'explanation'
};

exports.Prisma.CaseStudyScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  topicNumber: 'topicNumber',
  section: 'section',
  source: 'source'
};

exports.Prisma.ImportBatchScalarFieldEnum = {
  id: 'id',
  filename: 'filename',
  importedAt: 'importedAt',
  sourceMetadataJson: 'sourceMetadataJson',
  totalQuestionsDetected: 'totalQuestionsDetected',
  createdCount: 'createdCount',
  updatedCount: 'updatedCount',
  skippedCount: 'skippedCount',
  errorCount: 'errorCount',
  warningsJson: 'warningsJson',
  rawSummaryJson: 'rawSummaryJson',
  revertedAt: 'revertedAt'
};

exports.Prisma.ImportBatchQuestionScalarFieldEnum = {
  id: 'id',
  importBatchId: 'importBatchId',
  questionId: 'questionId',
  externalId: 'externalId',
  action: 'action',
  warningsJson: 'warningsJson',
  errorsJson: 'errorsJson',
  previousDataJson: 'previousDataJson',
  importedDataJson: 'importedDataJson'
};

exports.Prisma.TestSessionScalarFieldEnum = {
  id: 'id',
  mode: 'mode',
  startedAt: 'startedAt',
  finishedAt: 'finishedAt',
  durationSeconds: 'durationSeconds',
  status: 'status',
  examExercise: 'examExercise',
  questionIdsJson: 'questionIdsJson',
  totalQuestions: 'totalQuestions',
  score: 'score',
  maxScore: 'maxScore',
  passed: 'passed',
  correctCount: 'correctCount',
  wrongCount: 'wrongCount',
  blankCount: 'blankCount',
  averageTimePerQuestion: 'averageTimePerQuestion',
  topicFilter: 'topicFilter',
  sectionFilter: 'sectionFilter',
  includeStatusesJson: 'includeStatusesJson',
  summaryJson: 'summaryJson'
};

exports.Prisma.TestAnswerScalarFieldEnum = {
  id: 'id',
  testSessionId: 'testSessionId',
  questionId: 'questionId',
  selectedOptionId: 'selectedOptionId',
  isCorrect: 'isCorrect',
  isBlank: 'isBlank',
  confidence: 'confidence',
  timeSpentSeconds: 'timeSpentSeconds',
  answeredAt: 'answeredAt'
};

exports.Prisma.ReviewQueueScalarFieldEnum = {
  questionId: 'questionId',
  nextReviewAt: 'nextReviewAt',
  intervalDays: 'intervalDays',
  easeFactor: 'easeFactor',
  masteryLevel: 'masteryLevel',
  lastResult: 'lastResult',
  totalAttempts: 'totalAttempts',
  correctAttempts: 'correctAttempts',
  wrongAttempts: 'wrongAttempts',
  lastReviewedAt: 'lastReviewedAt'
};

exports.Prisma.AchievementScalarFieldEnum = {
  id: 'id',
  code: 'code',
  title: 'title',
  description: 'description',
  unlockedAt: 'unlockedAt'
};

exports.Prisma.UserProgressScalarFieldEnum = {
  id: 'id',
  scopeType: 'scopeType',
  scopeKey: 'scopeKey',
  topicNumber: 'topicNumber',
  section: 'section',
  attempts: 'attempts',
  correctCount: 'correctCount',
  wrongCount: 'wrongCount',
  blankCount: 'blankCount',
  lastAttemptAt: 'lastAttemptAt',
  masteryLevel: 'masteryLevel',
  xp: 'xp',
  questionId: 'questionId'
};

exports.Prisma.AppSettingsScalarFieldEnum = {
  id: 'id',
  targetExamDate: 'targetExamDate',
  weeklyGoal: 'weeklyGoal',
  dailyGoal: 'dailyGoal',
  weakPointMinimumSample: 'weakPointMinimumSample',
  wrongAnswerPenaltyFraction: 'wrongAnswerPenaltyFraction',
  minimumQuestionStatus: 'minimumQuestionStatus',
  qualityRequiresExplanation: 'qualityRequiresExplanation',
  visualPreferencesJson: 'visualPreferencesJson',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Question: 'Question',
  Option: 'Option',
  CaseStudy: 'CaseStudy',
  ImportBatch: 'ImportBatch',
  ImportBatchQuestion: 'ImportBatchQuestion',
  TestSession: 'TestSession',
  TestAnswer: 'TestAnswer',
  ReviewQueue: 'ReviewQueue',
  Achievement: 'Achievement',
  UserProgress: 'UserProgress',
  AppSettings: 'AppSettings'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
