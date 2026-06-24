import type { HabitSchedule } from "../habitStreaks.ts";
import type { WeekDoc } from "../repos/weeksRepo.ts";
import type { YearHeatmap } from "../time.ts";

export interface HabitConsistencyDatum {
  habitId: string;
  pct: number;
  checked: number;
  possible: number;
}

export const yearHabitConsistency = (
  heatmap: YearHeatmap,
  weekDocsById: Record<string, WeekDoc>,
  habits: HabitSchedule[],
  todayKey: string,
): Record<string, HabitConsistencyDatum> => {
  const result: Record<string, HabitConsistencyDatum> = {};
  for (const habit of habits) {
    const scheduled = new Set(habit.days);
    let checked = 0;
    let possible = 0;
    for (const column of heatmap.columns) {
      const checks = weekDocsById[column.weekId]?.habitChecks[habit.id];
      column.cells.forEach((cell, index) => {
        if (!cell.inYear) return;
        if (cell.dateKey > todayKey) return;
        if (!scheduled.has(index + 1)) return;
        possible += 1;
        if (checks?.[String(index + 1)] === true) checked += 1;
      });
    }
    result[habit.id] = {
      habitId: habit.id,
      checked,
      possible,
      pct: possible === 0 ? 0 : checked / possible,
    };
  }
  return result;
};
