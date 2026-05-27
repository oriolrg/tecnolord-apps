import { endOfDay, startOfDay, subDays } from "date-fns";
import { Prisma } from "@/lib/generated/opos-client";
import { DEFAULT_OPOS_SETTINGS, EXAM_CONFIG, QUESTION_STATUS_ORDER } from "@/lib/opos/config";
import { oposDb } from "@/lib/opos/db";
import { demoQuestions } from "@/lib/opos/demo";
import { validateImportPayload, type ValidatedImportPayload } from "@/lib/opos/import-validation";
import { buildRecommendations } from "@/lib/opos/recommendations";
import { calculateExamScore } from "@/lib/opos/scoring";
import { updateReviewQueue } from "@/lib/opos/spaced-repetition";
import type { ConfidenceKey, ExamExerciseKey, QuestionStatusKey } from "@/lib/opos/types";
import { evaluateWeakPoints } from "@/lib/opos/weak-points";

type QuestionWithOptions = Prisma.QuestionGetPayload<{ include: { options: true } }>;
type SessionWithAnswers = Prisma.TestSessionGetPayload<{
  include: {
    answers: {
      include: {
        question: {
          include: {
            options: true;
          };
        };
      };
    };
  };
}>;

export interface QuestionFilters {
  topicNumber?: number;
  status?: QuestionStatusKey | "all";
  examPart?: "common" | "specific" | "all";
  examExercise?: "exercise1" | "exercise2" | "both" | "all";
  search?: string;
}

export interface CreateSessionInput {
  mode: "topic" | "mock_exam";
  examExercise: ExamExerciseKey;
  topicNumber?: number;
  questionCount?: number;
  minimumStatus?: QuestionStatusKey;
}

export interface FinalizeAnswerInput {
  questionId: string;
  selectedOptionId?: string;
  confidence?: ConfidenceKey;
  timeSpentSeconds?: number;
}

export async function ensureOposBootstrap() {
  const settings = await oposDb.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", ...DEFAULT_OPOS_SETTINGS }
  });

  if ((await oposDb.question.count()) === 0) {
    await importQuestionsFromPayload({
      filename: "demo-seed.json",
      payload: {
        metadata: { source: "demo-seed", author: "system", version: "1.0" },
        questions: demoQuestions
      },
      allowUpdates: true,
      markAsDemo: true
    });
  }

  return settings;
}

export async function getOposSettings() {
  return oposDb.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", ...DEFAULT_OPOS_SETTINGS }
  });
}

export async function getDashboardData() {
  await ensureOposBootstrap();

  const [totalQuestions, validatedQuestions, pendingReview, lastSession, sessions, questions, settings] = await Promise.all([
    oposDb.question.count({ where: { isArchived: false } }),
    oposDb.question.count({ where: { status: "validated", isArchived: false } }),
    oposDb.question.count({ where: { status: "draft", isArchived: false } }),
    oposDb.testSession.findFirst({ orderBy: { startedAt: "desc" } }),
    oposDb.testSession.findMany({
      where: { status: "finished" },
      orderBy: { startedAt: "desc" },
      include: { answers: { include: { question: true } } },
      take: 50
    }),
    oposDb.question.findMany({
      where: { isArchived: false },
      include: { testAnswers: true }
    }),
    getOposSettings()
  ]);

  const streakDays = await calculateStudyStreak();
  const weakPoints = await getWeakPointAnalysis(settings.weakPointMinimumSample);
  const recommendations = buildRecommendations({ weakPoints, examDate: settings.targetExamDate });
  const todayStart = startOfDay(new Date());
  const todayAnswers = sessions.flatMap((session) => session.answers).filter((answer) => answer.answeredAt >= todayStart);
  const xp = sessions.reduce((sum, session) => sum + Math.round((session.correctCount * 8 + session.wrongCount * 2 + session.blankCount) / 2), 0);
  const level = Math.max(1, Math.floor(xp / 120) + 1);

  return {
    totalQuestions,
    validatedQuestions,
    pendingReview,
    lastActivity: lastSession?.startedAt ?? null,
    streakDays,
    xp,
    level,
    todayAnswers: todayAnswers.length,
    totalSessions: sessions.length,
    strongTopics: buildTopicStrength(questions, false).slice(0, 3),
    weakTopics: weakPoints.filter((item) => item.sampleStatus === "reliable").slice(0, 3),
    lowSampleTopics: weakPoints.filter((item) => item.sampleStatus === "insufficient").slice(0, 3),
    recommendation: recommendations[0] ?? null
  };
}

export async function listQuestions(filters: QuestionFilters = {}) {
  await ensureOposBootstrap();
  return oposDb.question.findMany({
    where: {
      isArchived: false,
      ...(filters.status && filters.status !== "all" ? { status: filters.status } : {}),
      ...(filters.examPart && filters.examPart !== "all" ? { examPart: filters.examPart } : {}),
      ...(filters.examExercise && filters.examExercise !== "all" ? { examExercise: filters.examExercise } : {}),
      ...(filters.topicNumber ? { topicNumber: filters.topicNumber } : {}),
      ...(filters.search
        ? {
            OR: [
              { text: { contains: filters.search } },
              { topicTitle: { contains: filters.search } },
              { section: { contains: filters.search } }
            ]
          }
        : {})
    },
    include: {
      options: true,
      testAnswers: true
    },
    orderBy: [{ topicNumber: "asc" }, { updatedAt: "desc" }]
  });
}

export async function getQuestionFiltersMetadata() {
  await ensureOposBootstrap();
  const questions = await oposDb.question.findMany({
    where: { isArchived: false },
    select: { topicNumber: true, topicTitle: true, status: true }
  });

  const topics = Array.from(new Map(questions.map((question) => [question.topicNumber, question.topicTitle])).entries()).map(([number, title]) => ({
    number,
    title
  }));
  const statuses = Array.from(new Set(questions.map((question) => question.status)));

  return { topics, statuses };
}

export async function getImportHistory() {
  await ensureOposBootstrap();
  return oposDb.importBatch.findMany({
    include: { items: true },
    orderBy: { importedAt: "desc" },
    take: 20
  });
}

export async function getWeakPointAnalysis(minimumSample?: number) {
  await ensureOposBootstrap();
  const settings = await getOposSettings();
  const threshold = minimumSample ?? settings.weakPointMinimumSample;
  const answers = await oposDb.testAnswer.findMany({
    include: { question: true }
  });

  const grouped = new Map<
    string,
    {
      label: string;
      attempts: number;
      correctCount: number;
      wrongCount: number;
      blankCount: number;
      confidenceTotal: number;
      confidenceSamples: number;
      hardCount: number;
      lastAttemptAt?: Date;
    }
  >();

  for (const answer of answers) {
    const key = `${answer.question.topicNumber}:${answer.question.section}`;
    const current = grouped.get(key) ?? {
      label: `Tema ${answer.question.topicNumber}, ${answer.question.section}`,
      attempts: 0,
      correctCount: 0,
      wrongCount: 0,
      blankCount: 0,
      confidenceTotal: 0,
      confidenceSamples: 0,
      hardCount: 0
    };
    current.attempts += 1;
    current.correctCount += answer.isCorrect ? 1 : 0;
    current.wrongCount += !answer.isCorrect && !answer.isBlank ? 1 : 0;
    current.blankCount += answer.isBlank ? 1 : 0;
    if (answer.confidence) {
      current.confidenceTotal += normalizeConfidence(answer.confidence as ConfidenceKey);
      current.confidenceSamples += 1;
    }
    if (answer.question.difficulty === "hard") {
      current.hardCount += 1;
    }
    current.lastAttemptAt = answer.answeredAt;
    grouped.set(key, current);
  }

  return evaluateWeakPoints(
    [...grouped.entries()].map(([key, current]) => ({
      key,
      label: current.label,
      attempts: current.attempts,
      correctCount: current.correctCount,
      wrongCount: current.wrongCount,
      blankCount: current.blankCount,
      averageConfidence:
        current.confidenceSamples === 0 ? 0.5 : Number((current.confidenceTotal / current.confidenceSamples).toFixed(4)),
      lastAttemptAt: current.lastAttemptAt,
      hardQuestionRatio: current.attempts === 0 ? 0 : current.hardCount / current.attempts
    })),
    threshold
  );
}

export async function getRecommendations() {
  const settings = await getOposSettings();
  const weakPoints = await getWeakPointAnalysis(settings.weakPointMinimumSample);
  return buildRecommendations({ weakPoints, examDate: settings.targetExamDate });
}

export async function previewImportJson(rawText: string, qualityRequiresExplanation?: boolean) {
  const parsed = JSON.parse(rawText);
  const preview = validateImportPayload(parsed, qualityRequiresExplanation);

  if (!preview.payload) {
    return { ...preview, existingIds: [], creatableIds: [] };
  }

  const existing = await oposDb.question.findMany({
    where: { externalId: { in: preview.payload.questions.map((question) => question.id) } },
    select: { externalId: true }
  });
  const existingIds = existing.map((item) => item.externalId);
  const creatableIds = preview.payload.questions.map((question) => question.id).filter((id) => !existingIds.includes(id));

  return { ...preview, existingIds, creatableIds };
}

export async function importQuestionsFromPayload({
  filename,
  payload,
  allowUpdates,
  markAsDemo = false
}: {
  filename: string;
  payload: ValidatedImportPayload;
  allowUpdates: boolean;
  markAsDemo?: boolean;
}) {
  return oposDb.$transaction(async (tx) => {
    const batch = await tx.importBatch.create({
      data: {
        filename,
        sourceMetadataJson: payload.metadata ? JSON.stringify(payload.metadata) : null,
        totalQuestionsDetected: payload.questions.length
      }
    });

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const warnings: string[] = [];

    for (const draft of payload.questions) {
      const existing = await tx.question.findUnique({
        where: { externalId: draft.id },
        include: { options: true, testAnswers: true, reviewQueue: true }
      });

      const caseStudyId = draft.caseStudy?.title ? buildCaseStudyId(draft) : null;
      if (caseStudyId) {
        await tx.caseStudy.upsert({
          where: { id: caseStudyId },
          update: {
            title: draft.caseStudy!.title,
            description: draft.caseStudy?.description,
            topicNumber: draft.topicNumber,
            section: draft.section,
            source: draft.source?.document
          },
          create: {
            id: caseStudyId,
            title: draft.caseStudy!.title,
            description: draft.caseStudy?.description,
            topicNumber: draft.topicNumber,
            section: draft.section,
            source: draft.source?.document
          }
        });
      }

      const questionData = {
        externalId: draft.id,
        examPart: draft.examPart,
        examExercise: draft.examExercise,
        topicNumber: draft.topicNumber,
        topicTitle: draft.topicTitle,
        section: draft.section,
        subsection: draft.subsection,
        questionType: draft.type,
        difficulty: draft.difficulty,
        text: draft.question,
        explanation: draft.explanation,
        sourceDocument: draft.source?.document,
        sourceReference: draft.source?.reference,
        tagsJson: JSON.stringify(draft.tags ?? []),
        status: normalizeQuestionStatus(draft.status, Boolean(draft.explanation)),
        isDemo: markAsDemo,
        caseStudyId
      };

      if (!existing) {
        const created = await tx.question.create({ data: questionData });
        await tx.option.createMany({
          data: draft.options.map((option) => ({
            questionId: created.id,
            label: option.id,
            text: option.text,
            isCorrect: option.id === draft.correctOptionId,
            explanation: option.id === draft.correctOptionId ? draft.explanation : draft.wrongOptionExplanations?.[option.id]
          }))
        });
        await tx.importBatchQuestion.create({
          data: {
            importBatchId: batch.id,
            questionId: created.id,
            externalId: draft.id,
            action: "created",
            importedDataJson: JSON.stringify(serializeDraft(draft))
          }
        });
        createdCount += 1;
        continue;
      }

      if (!allowUpdates) {
        await tx.importBatchQuestion.create({
          data: {
            importBatchId: batch.id,
            questionId: existing.id,
            externalId: draft.id,
            action: "skipped",
            importedDataJson: JSON.stringify(serializeDraft(draft)),
            warningsJson: JSON.stringify(["Ja existia i s'ha ignorat perque no s'ha autoritzat l'actualitzacio."])
          }
        });
        skippedCount += 1;
        continue;
      }

      await tx.question.update({
        where: { id: existing.id },
        data: questionData
      });
      await tx.option.deleteMany({ where: { questionId: existing.id } });
      await tx.option.createMany({
        data: draft.options.map((option) => ({
          questionId: existing.id,
          label: option.id,
          text: option.text,
          isCorrect: option.id === draft.correctOptionId,
          explanation: option.id === draft.correctOptionId ? draft.explanation : draft.wrongOptionExplanations?.[option.id]
        }))
      });
      await tx.importBatchQuestion.create({
        data: {
          importBatchId: batch.id,
          questionId: existing.id,
          externalId: draft.id,
          action: "updated",
          previousDataJson: JSON.stringify(serializeExisting(existing)),
          importedDataJson: JSON.stringify(serializeDraft(draft))
        }
      });
      updatedCount += 1;
    }

    return tx.importBatch.update({
      where: { id: batch.id },
      data: {
        createdCount,
        updatedCount,
        skippedCount,
        errorCount: 0,
        warningsJson: JSON.stringify(warnings),
        rawSummaryJson: JSON.stringify({ filename, importedAt: new Date().toISOString() })
      },
      include: { items: true }
    });
  });
}

export async function revertImportBatch(batchId: string) {
  return oposDb.$transaction(async (tx) => {
    const batch = await tx.importBatch.findUnique({
      where: { id: batchId },
      include: { items: true }
    });

    if (!batch || batch.revertedAt) {
      return null;
    }

    for (const item of batch.items) {
      if (item.action === "created" && item.questionId) {
        await tx.question.delete({ where: { id: item.questionId } });
      }

      if (item.action === "updated" && item.questionId && item.previousDataJson) {
        const snapshot = parseJson<Record<string, unknown>>(item.previousDataJson, {});
        await tx.question.update({
          where: { id: item.questionId },
          data: {
            examPart: String(snapshot.examPart),
            examExercise: String(snapshot.examExercise),
            topicNumber: Number(snapshot.topicNumber),
            topicTitle: String(snapshot.topicTitle),
            section: String(snapshot.section),
            subsection: snapshot.subsection ? String(snapshot.subsection) : null,
            questionType: String(snapshot.questionType),
            difficulty: String(snapshot.difficulty),
            text: String(snapshot.text),
            explanation: snapshot.explanation ? String(snapshot.explanation) : null,
            sourceDocument: snapshot.sourceDocument ? String(snapshot.sourceDocument) : null,
            sourceReference: snapshot.sourceReference ? String(snapshot.sourceReference) : null,
            tagsJson: JSON.stringify(snapshot.tags ?? []),
            status: String(snapshot.status),
            isDemo: Boolean(snapshot.isDemo)
          }
        });
        const options = parseJson<Array<{ label: string; text: string; isCorrect: boolean; explanation?: string | null }>>(
          JSON.stringify(snapshot.options ?? []),
          []
        );
        await tx.option.deleteMany({ where: { questionId: item.questionId } });
        await tx.option.createMany({
          data: options.map((option) => ({
            questionId: item.questionId!,
            label: option.label,
            text: option.text,
            isCorrect: option.isCorrect,
            explanation: option.explanation ?? null
          }))
        });
      }
    }

    return tx.importBatch.update({
      where: { id: batchId },
      data: { revertedAt: new Date() }
    });
  });
}

export async function createTestSession(input: CreateSessionInput) {
  await ensureOposBootstrap();
  const minimumStatus = input.minimumStatus ?? "validated";
  const index = QUESTION_STATUS_ORDER.indexOf(minimumStatus);
  const statusCandidates = QUESTION_STATUS_ORDER.slice(index < 0 ? 2 : index, 3);
  const totalQuestions = input.mode === "mock_exam" ? EXAM_CONFIG[input.examExercise].totalOrdinaryQuestions : input.questionCount ?? 10;

  const questions = await oposDb.question.findMany({
    where: {
      isArchived: false,
      status: { in: [...statusCandidates] },
      ...(input.mode === "mock_exam" ? { examExercise: input.examExercise } : {}),
      ...(input.topicNumber ? { topicNumber: input.topicNumber } : {})
    },
    include: { options: true, testAnswers: true, reviewQueue: true },
    orderBy: [{ isDemo: "asc" }, { updatedAt: "desc" }],
    take: totalQuestions
  });

  if (questions.length === 0) {
    throw new Error("No hi ha preguntes disponibles amb els filtres seleccionats.");
  }

  const session = await oposDb.testSession.create({
    data: {
      mode: input.mode === "mock_exam" ? "mock_exam" : "topic",
      examExercise: input.examExercise,
      totalQuestions: questions.length,
      maxScore: EXAM_CONFIG[input.examExercise].maxScore,
      questionIdsJson: JSON.stringify(questions.map((question) => question.id)),
      topicFilter: input.topicNumber ? String(input.topicNumber) : null
    }
  });

  return {
    sessionId: session.id,
    questions: questions.map(serializeQuestionForSession)
  };
}

export async function getTestSession(sessionId: string) {
  const session = await oposDb.testSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: {
          question: {
            include: { options: true }
          }
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  const questionIds = parseJson<string[]>(session.questionIdsJson, []);
  const answeredIds = new Set(session.answers.map((answer) => answer.questionId));
  const missingQuestionIds = questionIds.filter((id) => !answeredIds.has(id));
  const missingQuestions = missingQuestionIds.length
    ? await oposDb.question.findMany({
        where: { id: { in: missingQuestionIds } },
        include: { options: true, testAnswers: true, reviewQueue: true }
      })
    : [];

  return {
    ...session,
    questions: [...session.answers.map((answer) => answer.question), ...missingQuestions]
      .sort((left, right) => questionIds.indexOf(left.id) - questionIds.indexOf(right.id))
      .map(serializeQuestionForSession)
  };
}

export async function finalizeTestSession(sessionId: string, answers: FinalizeAnswerInput[], abandon = false) {
  const session = await oposDb.testSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new Error("Sessio no trobada.");
  }

  const questionIds = parseJson<string[]>(session.questionIdsJson, []);
  const questions = await oposDb.question.findMany({
    where: { id: { in: questionIds } },
    include: { options: true, testAnswers: true, reviewQueue: true }
  });
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  const correctCount = answers.filter((answer) => {
    const question = questionMap.get(answer.questionId);
    const correctOption = question?.options.find((option) => option.isCorrect);
    return correctOption?.id === answer.selectedOptionId;
  }).length;
  const wrongCount = answers.filter((answer) => {
    if (!answer.selectedOptionId) {
      return false;
    }
    const question = questionMap.get(answer.questionId);
    const correctOption = question?.options.find((option) => option.isCorrect);
    return Boolean(correctOption) && correctOption?.id !== answer.selectedOptionId;
  }).length;
  const blankCount = Math.max(0, session.totalQuestions - answers.length);
  const exerciseConfig = EXAM_CONFIG[session.examExercise as ExamExerciseKey];
  const score = calculateExamScore({
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    blankAnswers: blankCount,
    totalOrdinaryQuestions: exerciseConfig.totalOrdinaryQuestions,
    maxScore: exerciseConfig.maxScore,
    wrongAnswerPenaltyFraction: exerciseConfig.wrongAnswerPenaltyFraction
  });

  await oposDb.$transaction(async (tx) => {
    await tx.testAnswer.deleteMany({ where: { testSessionId: sessionId } });

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      const correctOption = question?.options.find((option) => option.isCorrect);
      const isCorrect = correctOption?.id === answer.selectedOptionId;

      await tx.testAnswer.create({
        data: {
          testSessionId: sessionId,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect,
          isBlank: !answer.selectedOptionId,
          confidence: answer.confidence,
          timeSpentSeconds: answer.timeSpentSeconds
        }
      });

      if (question) {
        const reviewUpdate = updateReviewQueue({
          previous: question.reviewQueue
            ? {
                intervalDays: question.reviewQueue.intervalDays,
                easeFactor: question.reviewQueue.easeFactor,
                masteryLevel: question.reviewQueue.masteryLevel,
                totalAttempts: question.reviewQueue.totalAttempts,
                correctAttempts: question.reviewQueue.correctAttempts,
                wrongAttempts: question.reviewQueue.wrongAttempts,
                lastReviewedAt: question.reviewQueue.lastReviewedAt ?? undefined
              }
            : null,
          wasCorrect: isCorrect,
          confidence: answer.confidence ?? undefined
        });

        await tx.reviewQueue.upsert({
          where: { questionId: question.id },
          update: {
            intervalDays: reviewUpdate.intervalDays,
            easeFactor: reviewUpdate.easeFactor,
            masteryLevel: reviewUpdate.masteryLevel,
            totalAttempts: reviewUpdate.totalAttempts,
            correctAttempts: reviewUpdate.correctAttempts,
            wrongAttempts: reviewUpdate.wrongAttempts,
            lastResult: reviewUpdate.lastResult,
            nextReviewAt: reviewUpdate.nextReviewAt,
            lastReviewedAt: reviewUpdate.lastReviewedAt
          },
          create: {
            questionId: question.id,
            intervalDays: reviewUpdate.intervalDays,
            easeFactor: reviewUpdate.easeFactor,
            masteryLevel: reviewUpdate.masteryLevel,
            totalAttempts: reviewUpdate.totalAttempts,
            correctAttempts: reviewUpdate.correctAttempts,
            wrongAttempts: reviewUpdate.wrongAttempts,
            lastResult: reviewUpdate.lastResult,
            nextReviewAt: reviewUpdate.nextReviewAt,
            lastReviewedAt: reviewUpdate.lastReviewedAt
          }
        });
      }
    }

    await tx.testSession.update({
      where: { id: sessionId },
      data: {
        status: abandon ? "abandoned" : "finished",
        finishedAt: new Date(),
        durationSeconds: answers.reduce((sum, answer) => sum + (answer.timeSpentSeconds ?? 0), 0),
        score: score.finalScore,
        passed: score.finalScore >= exerciseConfig.minimumPassingScore,
        correctCount,
        wrongCount,
        blankCount,
        averageTimePerQuestion:
          answers.length === 0 ? 0 : Number((answers.reduce((sum, answer) => sum + (answer.timeSpentSeconds ?? 0), 0) / answers.length).toFixed(2)),
        summaryJson: JSON.stringify({
          formula: "Q = ((A - E/4) * P) / N",
          maxScore: exerciseConfig.maxScore,
          minPassingScore: exerciseConfig.minimumPassingScore
        })
      }
    });
  });

  return getSessionResult(sessionId);
}

export async function getSessionResult(sessionId: string) {
  const session = await oposDb.testSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: {
          question: {
            include: { options: true }
          }
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  return {
    session,
    groupedByTopic: aggregatePerformance(session.answers, "topic"),
    groupedBySection: aggregatePerformance(session.answers, "section"),
    weakPoints: (await getWeakPointAnalysis()).slice(0, 5),
    recommendations: await getRecommendations(),
    wrongAnswers: session.answers.filter((answer) => !answer.isCorrect && !answer.isBlank),
    lowConfidenceCorrect: session.answers.filter((answer) => answer.isCorrect && answer.confidence === "low")
  };
}

export async function getSessionsHistory() {
  return oposDb.testSession.findMany({
    orderBy: { startedAt: "desc" },
    take: 20
  });
}

export async function getDueReviewQuestions(limit = 10) {
  await ensureOposBootstrap();
  return oposDb.reviewQueue.findMany({
    where: { nextReviewAt: { lte: endOfDay(new Date()) } },
    include: { question: { include: { options: true } } },
    orderBy: { nextReviewAt: "asc" },
    take: limit
  });
}

export async function updateSettings(formData: {
  targetExamDate?: string | null;
  weakPointMinimumSample: number;
  dailyGoal: number;
  weeklyGoal: number;
  minimumQuestionStatus: QuestionStatusKey;
}) {
  return oposDb.appSettings.upsert({
    where: { id: "default" },
    update: {
      targetExamDate: formData.targetExamDate ? new Date(formData.targetExamDate) : null,
      weakPointMinimumSample: formData.weakPointMinimumSample,
      dailyGoal: formData.dailyGoal,
      weeklyGoal: formData.weeklyGoal,
      minimumQuestionStatus: formData.minimumQuestionStatus
    },
    create: {
      id: "default",
      targetExamDate: formData.targetExamDate ? new Date(formData.targetExamDate) : null,
      weakPointMinimumSample: formData.weakPointMinimumSample,
      dailyGoal: formData.dailyGoal,
      weeklyGoal: formData.weeklyGoal,
      minimumQuestionStatus: formData.minimumQuestionStatus
    }
  });
}

async function calculateStudyStreak() {
  const sessions = await oposDb.testSession.findMany({
    where: {
      status: "finished",
      startedAt: { gte: subDays(startOfDay(new Date()), 30) }
    },
    orderBy: { startedAt: "desc" },
    select: { startedAt: true }
  });

  const uniqueDays = new Set(sessions.map((session) => startOfDay(session.startedAt).toISOString()));
  let streak = 0;
  for (let offset = 0; offset < 30; offset += 1) {
    const day = startOfDay(subDays(new Date(), offset)).toISOString();
    if (uniqueDays.has(day)) {
      streak += 1;
      continue;
    }
    if (offset === 0) {
      continue;
    }
    break;
  }
  return streak;
}

function buildTopicStrength(
  questions: Array<{ topicNumber: number; topicTitle: string; testAnswers: Array<{ isCorrect: boolean; isBlank: boolean }> }>,
  invert: boolean
) {
  const byTopic = new Map<number, { title: string; attempts: number; correct: number; wrong: number }>();
  for (const question of questions) {
    const current = byTopic.get(question.topicNumber) ?? { title: question.topicTitle, attempts: 0, correct: 0, wrong: 0 };
    for (const answer of question.testAnswers) {
      current.attempts += 1;
      current.correct += answer.isCorrect ? 1 : 0;
      current.wrong += !answer.isCorrect && !answer.isBlank ? 1 : 0;
    }
    byTopic.set(question.topicNumber, current);
  }

  return [...byTopic.entries()]
    .map(([topicNumber, current]) => ({
      topicNumber,
      title: current.title,
      attempts: current.attempts,
      accuracy: current.attempts === 0 ? 0 : current.correct / current.attempts
    }))
    .sort((left, right) => (invert ? left.accuracy - right.accuracy : right.accuracy - left.accuracy));
}

function serializeDraft(draft: ValidatedImportPayload["questions"][number]) {
  return {
    externalId: draft.id,
    examPart: draft.examPart,
    examExercise: draft.examExercise,
    topicNumber: draft.topicNumber,
    topicTitle: draft.topicTitle,
    section: draft.section,
    subsection: draft.subsection ?? null,
    questionType: draft.type,
    difficulty: draft.difficulty,
    text: draft.question,
    explanation: draft.explanation ?? null,
    sourceDocument: draft.source?.document ?? null,
    sourceReference: draft.source?.reference ?? null,
    tags: draft.tags ?? [],
    status: normalizeQuestionStatus(draft.status, Boolean(draft.explanation)),
    isDemo: false,
    options: draft.options.map((option) => ({
      label: option.id,
      text: option.text,
      isCorrect: option.id === draft.correctOptionId,
      explanation: option.id === draft.correctOptionId ? draft.explanation : draft.wrongOptionExplanations?.[option.id]
    }))
  };
}

function serializeExisting(question: QuestionWithOptions) {
  return {
    examPart: question.examPart,
    examExercise: question.examExercise,
    topicNumber: question.topicNumber,
    topicTitle: question.topicTitle,
    section: question.section,
    subsection: question.subsection,
    questionType: question.questionType,
    difficulty: question.difficulty,
    text: question.text,
    explanation: question.explanation,
    sourceDocument: question.sourceDocument,
    sourceReference: question.sourceReference,
    tags: parseJson<string[]>(question.tagsJson, []),
    status: question.status,
    isDemo: question.isDemo,
    options: question.options.map((option) => ({
      label: option.label,
      text: option.text,
      isCorrect: option.isCorrect,
      explanation: option.explanation
    }))
  };
}

function serializeQuestionForSession(question: QuestionWithOptions) {
  return {
    id: question.id,
    externalId: question.externalId,
    topicNumber: question.topicNumber,
    topicTitle: question.topicTitle,
    section: question.section,
    difficulty: question.difficulty,
    questionType: question.questionType,
    text: question.text,
    explanation: question.explanation,
    options: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      text: option.text
    }))
  };
}

function normalizeQuestionStatus(status: string | undefined, hasExplanation: boolean): QuestionStatusKey {
  if (status === "validated" && !hasExplanation) {
    return "draft";
  }
  return (status ?? "draft") as QuestionStatusKey;
}

function buildCaseStudyId(draft: ValidatedImportPayload["questions"][number]) {
  const sectionSlug = draft.section.toLowerCase().replace(/\s+/g, "-");
  const titleSlug = draft.caseStudy?.title.toLowerCase().replace(/\s+/g, "-") ?? "sense-titol";
  return `case-${draft.topicNumber}-${sectionSlug}-${titleSlug}`;
}

function normalizeConfidence(confidence: ConfidenceKey) {
  if (confidence === "low") {
    return 0.3;
  }
  if (confidence === "medium") {
    return 0.6;
  }
  return 0.95;
}

function aggregatePerformance(answers: SessionWithAnswers["answers"], mode: "topic" | "section") {
  const map = new Map<string, { label: string; correct: number; wrong: number; blank: number }>();
  for (const answer of answers) {
    const label = mode === "topic" ? `Tema ${answer.question.topicNumber}` : answer.question.section;
    const current = map.get(label) ?? { label, correct: 0, wrong: 0, blank: 0 };
    current.correct += answer.isCorrect ? 1 : 0;
    current.wrong += !answer.isCorrect && !answer.isBlank ? 1 : 0;
    current.blank += answer.isBlank ? 1 : 0;
    map.set(label, current);
  }
  return [...map.values()].sort((left, right) => right.wrong - left.wrong);
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
