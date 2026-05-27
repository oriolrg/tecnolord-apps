import type { ImportedQuestionDraft } from "@/lib/opos/types";

export const demoQuestions: ImportedQuestionDraft[] = [
  {
    id: "DEMO-T01-0001",
    examPart: "specific",
    examExercise: "exercise1",
    topicNumber: 1,
    topicTitle: "Criptografia",
    section: "Principi de Kerckhoffs",
    type: "conceptual",
    difficulty: "medium",
    question: "Segons Kerckhoffs, de quin element ha de dependre el secret principal d'un criptosistema?",
    options: [
      { id: "A", text: "Del secret de l'algorisme" },
      { id: "B", text: "Del secret de la clau" },
      { id: "C", text: "De mantenir ocult el hardware" },
      { id: "D", text: "De canviar de protocol cada setmana" }
    ],
    correctOptionId: "B",
    explanation: "El principi estableix que l'algorisme pot ser conegut i que el secret ha de residir a la clau.",
    source: { document: "Temari demo", reference: "Tema 1" },
    tags: ["criptografia", "kerckhoffs"],
    status: "validated"
  },
  {
    id: "DEMO-T01-0002",
    examPart: "specific",
    examExercise: "exercise1",
    topicNumber: 1,
    topicTitle: "Criptografia",
    section: "Hash i integritat",
    type: "technical",
    difficulty: "easy",
    question: "Quina propietat aporta principalment una funcio hash en un procediment de signatura?",
    options: [
      { id: "A", text: "Confidencialitat" },
      { id: "B", text: "Integritat" },
      { id: "C", text: "Disponibilitat" },
      { id: "D", text: "Anonimat" }
    ],
    correctOptionId: "B",
    explanation: "El resum permet comprovar si el contingut ha estat alterat.",
    source: { document: "Temari demo", reference: "Tema 1" },
    tags: ["hash", "integritat"],
    status: "validated"
  },
  {
    id: "DEMO-T01-0003",
    examPart: "specific",
    examExercise: "exercise2",
    topicNumber: 1,
    topicTitle: "Criptografia",
    section: "Aplicacio practica",
    type: "practical",
    difficulty: "hard",
    question: "Un servei signa un document amb la clau privada del servidor. Que pot verificar el receptor amb la clau publica corresponent?",
    options: [
      { id: "A", text: "Que el document no ha estat modificat i qui l'ha signat" },
      { id: "B", text: "Que el document ha estat xifrat simetricament" },
      { id: "C", text: "Que la clau privada es publica" },
      { id: "D", text: "Que l'emissor no pot repudiar el correu" }
    ],
    correctOptionId: "A",
    explanation: "La signatura permet validar autenticitat i integritat.",
    source: { document: "Temari demo", reference: "Tema 1" },
    tags: ["signatura", "clau-publica"],
    status: "reviewed"
  },
  {
    id: "DEMO-T01-0004",
    examPart: "specific",
    examExercise: "exercise1",
    topicNumber: 1,
    topicTitle: "Criptografia",
    section: "Hash i integritat",
    type: "definition",
    difficulty: "medium",
    question: "Quina afirmacio defineix millor una funcio hash criptografica?",
    options: [
      { id: "A", text: "Retorna una clau reversible" },
      { id: "B", text: "Genera un resum de longitud fixa" },
      { id: "C", text: "Sempre xifra amb clau publica" },
      { id: "D", text: "Serveix per transmetre claus per veu" }
    ],
    correctOptionId: "B",
    explanation: "El hash genera un resum compacte i no reversible de manera practica.",
    source: { document: "Temari demo", reference: "Tema 1" },
    tags: ["hash"],
    status: "draft"
  },
  {
    id: "DEMO-T02-0001",
    examPart: "common",
    examExercise: "exercise1",
    topicNumber: 2,
    topicTitle: "Procediment administratiu",
    section: "Acte administratiu",
    type: "legal",
    difficulty: "medium",
    question: "Quin dels seguents elements es considera essencial per a la validesa d'un acte administratiu?",
    options: [
      { id: "A", text: "La signatura manuscrita sempre" },
      { id: "B", text: "La competencia de l'organ que el dicta" },
      { id: "C", text: "La presencia de dos testimonis" },
      { id: "D", text: "La publicacio previa al BOE" }
    ],
    correctOptionId: "B",
    explanation: "La competencia es requisit essencial; la seva manca pot comportar nul.litat.",
    source: { document: "Temari demo", reference: "Tema 2" },
    tags: ["administratiu", "competencia"],
    status: "validated"
  },
  {
    id: "DEMO-T02-0002",
    examPart: "common",
    examExercise: "exercise1",
    topicNumber: 2,
    topicTitle: "Procediment administratiu",
    section: "Notificacions",
    type: "conceptual",
    difficulty: "easy",
    question: "Quan es considera rebutjada una notificacio electronica posada a disposicio de l'interessat?",
    options: [
      { id: "A", text: "Al cap de 24 hores" },
      { id: "B", text: "Quan la rebutja verbalment" },
      { id: "C", text: "Quan passen 10 dies naturals sense accedir-hi" },
      { id: "D", text: "Quan passen 30 dies habils" }
    ],
    correctOptionId: "C",
    explanation: "La legislacio preveu el rebuig per manca d'acces en 10 dies naturals, amb excepcions.",
    source: { document: "Temari demo", reference: "Tema 2" },
    tags: ["notificacions", "administracio-electronica"],
    status: "validated"
  },
  {
    id: "DEMO-T02-0003",
    examPart: "common",
    examExercise: "exercise1",
    topicNumber: 2,
    topicTitle: "Procediment administratiu",
    section: "Notificacions",
    type: "comparison",
    difficulty: "medium",
    question: "Quina diferencia principal hi ha entre notificacio i publicacio d'un acte?",
    options: [
      { id: "A", text: "La notificacio no produeix efectes" },
      { id: "B", text: "La publicacio substitueix la notificacio en qualsevol cas" },
      { id: "C", text: "La notificacio s'adreca a interessats determinats; la publicacio, a una pluralitat o per previsio legal" },
      { id: "D", text: "No hi ha cap diferencia juridica rellevant" }
    ],
    correctOptionId: "C",
    explanation: "La notificacio es individualitzada; la publicacio opera en supòsits taxats o per pluralitat.",
    source: { document: "Temari demo", reference: "Tema 2" },
    tags: ["notificacio", "publicacio"],
    status: "reviewed"
  },
  {
    id: "DEMO-T02-0004",
    examPart: "common",
    examExercise: "exercise1",
    topicNumber: 2,
    topicTitle: "Procediment administratiu",
    section: "Acte administratiu",
    type: "case",
    difficulty: "hard",
    question: "Un organ resol un expedient sense tenir competencia territorial. Quin vici es pot apreciar amb mes probabilitat?",
    options: [
      { id: "A", text: "Irregularitat no invalidant sempre" },
      { id: "B", text: "Nul.litat o anul.labilitat segons el cas, per incompetencia" },
      { id: "C", text: "Caducitat automatica del procediment" },
      { id: "D", text: "Inexistencia juridica obligatoria" }
    ],
    correctOptionId: "B",
    explanation: "La incompetencia pot afectar la validesa; cal distingir-ne tipus i gravetat.",
    source: { document: "Temari demo", reference: "Tema 2" },
    tags: ["incompetencia", "vici"],
    status: "draft"
  }
];
