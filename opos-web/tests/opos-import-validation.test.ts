import { describe, expect, it } from "vitest";
import { detectDuplicateExternalIds, validateImportPayload } from "@/lib/opos/import-validation";

const validPayload = {
  metadata: { source: "test" },
  questions: [
    {
      id: "T01-0001",
      examPart: "specific",
      examExercise: "exercise1",
      topicNumber: 1,
      topicTitle: "Criptografia",
      section: "Hash",
      type: "conceptual",
      difficulty: "medium",
      question: "Que garanteix una funcio hash?",
      options: [
        { id: "A", text: "Integritat" },
        { id: "B", text: "Ubicacio" },
        { id: "C", text: "Latencia" },
        { id: "D", text: "Cablejat" }
      ],
      correctOptionId: "A",
      explanation: "El hash ajuda a comprovar integritat.",
      source: { document: "Temari", reference: "Tema 1" },
      status: "validated"
    }
  ]
};

describe("validateImportPayload", () => {
  it("accepta un JSON correcte", () => {
    const result = validateImportPayload(validPayload);

    expect(result.payload?.questions).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it("rebutja un JSON amb opcio correcta inexistent", () => {
    const invalid = {
      ...validPayload,
      questions: [{ ...validPayload.questions[0], correctOptionId: "Z" }]
    };

    const result = validateImportPayload(invalid);

    expect(result.errors).toHaveLength(1);
  });

  it("detecta duplicats d'externalId", () => {
    expect(detectDuplicateExternalIds(["A", "B", "A"])).toEqual(["A"]);
  });

  it("reflecteix errors parcials i avisos de qualitat", () => {
    const partial = {
      questions: [
        {
          ...validPayload.questions[0],
          id: "OK-1",
          explanation: undefined,
          status: "draft"
        },
        {
          ...validPayload.questions[0],
          id: "BAD-1",
          options: [
            { id: "A", text: "Nomes una" },
            { id: "B", text: "Dues" },
            { id: "C", text: "Tres" }
          ]
        }
      ]
    };

    const result = validateImportPayload(partial);

    expect(result.payload).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
