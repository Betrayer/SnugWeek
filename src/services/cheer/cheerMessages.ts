export type CheerKind = "habit" | "task" | "dayClear" | "streak";

export const CHEER_MESSAGE_KEYS: Record<CheerKind, string[]> = {
  habit: ["cheer:habit.0", "cheer:habit.1", "cheer:habit.2", "cheer:habit.3"],
  task: ["cheer:task.0", "cheer:task.1", "cheer:task.2", "cheer:task.3"],
  dayClear: ["cheer:dayClear.0", "cheer:dayClear.1", "cheer:dayClear.2"],
  streak: ["cheer:streak.0", "cheer:streak.1", "cheer:streak.2"],
};

export const CHEER_GLYPHS: Record<CheerKind, string[]> = {
  habit: ["✨", "🌿", "💫"],
  task: ["💛", "🌸", "🌟"],
  dayClear: ["🎉", "✨", "🌟"],
  streak: ["🔥"],
};

export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
