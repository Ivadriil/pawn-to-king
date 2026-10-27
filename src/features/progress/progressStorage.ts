export type LessonProgressMode = "theory" | "test" | "practice";
export type SavedLessonProgress = { lessonId: string; mode: LessonProgressMode; taskIndex: number; selectedOption: number | null };
export function getCompletedLessonIds(): string[] {
  try { const value: unknown = JSON.parse(localStorage.getItem("completed-lessons") ?? "[]"); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
  catch { return []; }
}
export function getSavedLessonProgress(): SavedLessonProgress | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("lesson-progress") ?? "null");
    if (!value || typeof value !== "object") return null;
    const saved = value as Partial<SavedLessonProgress>;
    if (typeof saved.lessonId !== "string" || !["theory", "test", "practice"].includes(saved.mode ?? "") || typeof saved.taskIndex !== "number") return null;
    return { lessonId: saved.lessonId, mode: saved.mode as LessonProgressMode, taskIndex: saved.taskIndex, selectedOption: typeof saved.selectedOption === "number" ? saved.selectedOption : null };
  } catch { return null; }
}
export function saveLessonProgress(progress: SavedLessonProgress): void {
  try { localStorage.setItem("lesson-progress", JSON.stringify(progress)); } catch { /* Keep the lesson usable when browser storage is blocked. */ }
}
export function markLessonCompleted(lessonId: string): string[] {
  const completedIds = getCompletedLessonIds();
  if (!completedIds.includes(lessonId)) completedIds.push(lessonId);
  try {
    localStorage.setItem("completed-lessons", JSON.stringify(completedIds));
    if (getSavedLessonProgress()?.lessonId === lessonId) localStorage.removeItem("lesson-progress");
  } catch { /* Completion remains visible for this page even when storage is blocked. */ }
  return completedIds;
}

export function recordLessonStars(lessonId: string, stars: number): number {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem("lesson-stars") ?? "{}");
    const current = saved && typeof saved === "object" ? (saved as Record<string, unknown>) : {};
    const best = Math.max(typeof current[lessonId] === "number" ? current[lessonId] : 0, stars);
    localStorage.setItem("lesson-stars", JSON.stringify({ ...current, [lessonId]: best }));
    return best;
  } catch { return stars; }
}

export function getTotalStars(): number {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem("lesson-stars") ?? "{}");
    if (!saved || typeof saved !== "object") return 0;
    return Object.values(saved as Record<string, unknown>).reduce<number>((sum, stars) => sum + (typeof stars === "number" ? stars : 0), 0);
  } catch { return 0; }
}
