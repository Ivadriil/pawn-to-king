import type { Lesson } from "./lessonTypes";
import { sampleLessons } from "./sampleLessons";
import { allCourseLessons as authoredLessons, courseLessonOrder } from "./courseLessons";
export type LessonSection = { id: string; number: string; title: string; lessonCount: number; lessons: { id: string; title: string }[]; piece: string; tone: "blue" | "green" | "sand" | "lavender" };
export const allCourseLessons: Record<string, Lesson> = { ...sampleLessons, ...authoredLessons };
const refs = (ids: string[]) => ids.map((id) => ({ id, title: allCourseLessons[id]?.title ?? id }));
export const sections: LessonSection[] = [
  { id: "board-and-pieces", number: "01", title: "Шахівниця та фігури", lessonCount: 2, lessons: refs(["board-setup", "piece-placement"]), piece: "wP", tone: "blue" },
  { id: "piece-moves", number: "02", title: "Як ходять фігури", lessonCount: 6, lessons: refs(["piece-king", "piece-queen", "piece-rook", "piece-bishop", "piece-knight", "piece-pawn"]), piece: "wN", tone: "green" },
  { id: "rules-and-notation", number: "03", title: "Правила й нотація", lessonCount: 3, lessons: refs(["chess-notation", "chess-checkmate", "chess-special-moves"]), piece: "wB", tone: "sand" },
];
export const totalLessonCount = courseLessonOrder.length;
export { courseLessonOrder };

