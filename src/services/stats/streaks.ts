import type { HabitSchedule } from "../habitStreaks.ts";
import type { WeekDoc } from "../repos/weeksRepo.ts";
import type { YearHeatmap } from "../time.ts";

export const longestStreaks = (
  heatmap: YearHeatmap,
  weekDocsById: Record<string, WeekDoc>,
  habits: HabitSchedule[],
): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const habit of habits) {
    const scheduled = new Set(habit.days);
    let run = 0;
    let longest = 0;
    for (const column of heatmap.columns) {
      const checks = weekDocsById[column.weekId]?.habitChecks[habit.id];
      column.cells.forEach((cell, index) => {
        if (!cell.inYear) return;
        if (!scheduled.has(index + 1)) return;
        if (checks?.[String(index + 1)] === true) {
          run += 1;
          if (run > longest) longest = run;
        } else {
          run = 0;
        }
      });
    }
    result[habit.id] = longest;
  }
  return result;
};
