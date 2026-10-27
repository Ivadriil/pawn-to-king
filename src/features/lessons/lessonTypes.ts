export type LessonContentBlock = { title: string; paragraphs: string[]; example?: string };
export type LessonQuizTask = { question: string; options: string[]; correctOption: number; explanation: string; hint: string };
export type LessonQuiz = { tasks: LessonQuizTask[] };
export type LessonBoard = { position: string; title: string; description: string; whitePerspective: string; blackPerspective: string };
export type LessonMovement = { piece: string; title: string; description: string; center: string; squares: string[]; startPositions: string; notationExample: string; notationExplanation: string };
export type Lesson = {
  id: string; sectionId: string; sectionTitle: string; number: number; totalInSection: number; title: string; summary: string; durationMinutes: number;
  level: "Початковий" | "Середній" | "Просунутий"; objectives: string[]; content: LessonContentBlock[]; keyTakeaway: string;
  board?: LessonBoard; movement?: LessonMovement; quiz: LessonQuiz;
};

