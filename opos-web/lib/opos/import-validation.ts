import { z } from "zod";
import { DEFAULT_OPOS_SETTINGS } from "@/lib/opos/config";
import type { ImportedQuestionDraft } from "@/lib/opos/types";

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1, "L'opcio no pot estar buida.")
});

const questionSchema = z.object({
  id: z.string().min(1),
  examPart: z.enum(["common", "specific"]),
  examExercise: z.enum(["exercise1", "exercise2", "both"]),
  topicNumber: z.number().int().nonnegative(),
  topicTitle: z.string().trim().min(1),
  section: z.string().trim().min(1),
  subsection: z.string().trim().optional(),
  type: z.enum(["conceptual", "practical", "legal", "technical", "definition", "comparison", "case"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  question: z.string().trim().min(1, "La pregunta no pot estar buida."),
  options: z.array(optionSchema).length(4, "Cada pregunta ha de tenir exactament 4 opcions."),
  correctOptionId: z.string().min(1),
  explanation: z.string().trim().optional(),
  wrongOptionExplanations: z.record(z.string()).optional(),
  source: z
    .object({
      document: z.string().trim().optional(),
      reference: z.string().trim().optional()
    })
    .optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  status: z.enum(["draft", "reviewed", "validated", "doubtful", "archived"]).optional(),
  caseStudy: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().optional()
    })
    .optional()
});

export const importPayloadSchema = z.object({
  metadata: z
    .object({
      source: z.string().trim().optional(),
      createdAt: z.string().trim().optional(),
      author: z.string().trim().optional(),
      version: z.string().trim().optional()
    })
    .optional(),
  questions: z.array(questionSchema).min(1, "El fitxer ha de contenir com a minim una pregunta.")
});

export interface ValidationMessage {
  externalId: string;
  level: "error" | "warning" | "info";
  message: string;
}

export interface ValidatedImportPayload {
  metadata?: Record<string, string>;
  questions: ImportedQuestionDraft[];
}

export interface ImportPreview {
  payload: ValidatedImportPayload | null;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  duplicatesWithinFile: string[];
}

export function validateImportPayload(
  input: unknown,
  qualityRequiresExplanation: boolean = DEFAULT_OPOS_SETTINGS.qualityRequiresExplanation
): ImportPreview {
  const parsed = importPayloadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      payload: null,
      errors: parsed.error.issues.map((issue) => ({
        externalId: extractIssueId(issue.path),
        level: "error",
        message: issue.message
      })),
      warnings: [],
      duplicatesWithinFile: []
    };
  }

  const warnings: ValidationMessage[] = [];
  const errors: ValidationMessage[] = [];
  const duplicatesWithinFile = detectDuplicateExternalIds(parsed.data.questions.map((question) => question.id));

  for (const duplicateId of duplicatesWithinFile) {
    errors.push({
      externalId: duplicateId,
      level: "error",
      message: "L'identificador extern esta duplicat dins del mateix fitxer."
    });
  }

  for (const question of parsed.data.questions) {
    const correctOptionMatches = question.options.filter((option) => option.id === question.correctOptionId);
    if (correctOptionMatches.length !== 1) {
      errors.push({
        externalId: question.id,
        level: "error",
        message: "correctOptionId ha de correspondre a una unica opcio existent."
      });
    }

    if (!question.explanation?.trim()) {
      warnings.push({
        externalId: question.id,
        level: qualityRequiresExplanation ? "error" : "warning",
        message: qualityRequiresExplanation
          ? "Falta explicacio i el mode de qualitat la requereix."
          : "Falta explicacio; s'importara com a draft si no era validated."
      });
    }

    if ((question.status ?? "draft") === "validated" && !question.explanation?.trim()) {
      warnings.push({
        externalId: question.id,
        level: "warning",
        message: "Una pregunta sense explicacio no hauria d'entrar com a validated."
      });
    }

    if (!question.source?.document && !question.source?.reference) {
      warnings.push({
        externalId: question.id,
        level: "warning",
        message: "La pregunta no te font documentada."
      });
    }
  }

  if (qualityRequiresExplanation && warnings.some((warning) => warning.level === "error")) {
    return {
      payload: null,
      errors: [...errors, ...warnings.filter((warning) => warning.level === "error")],
      warnings: warnings.filter((warning) => warning.level === "warning"),
      duplicatesWithinFile
    };
  }

  return {
    payload: parsed.data,
    errors,
    warnings,
    duplicatesWithinFile
  };
}

export function detectDuplicateExternalIds(ids: string[]): string[] {
  const counts = new Map<string, number>();
  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
}

function extractIssueId(path: Array<string | number>): string {
  const questionIndex = path.find((segment) => typeof segment === "number");
  return typeof questionIndex === "number" ? `questions[${questionIndex}]` : "payload";
}
