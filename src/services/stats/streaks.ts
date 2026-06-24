import type { HabitSchedule } from "../habitStreaks.ts";
import type { WeekDoc, WeekEntry } from "../repos/weeksRepo.ts";
import type { YearHeatmap } from "../time.ts";
import { isoDayOfKey, monthDayKeys, weekIdFromKey } from "../time.ts";

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

export const monthLongestStreaks = (
  weeks: WeekEntry[],
  habits: HabitSchedule[],
  monthId: string,
): Record<string, number> => {
  const weeksById = new Map(weeks.map((entry) => [entry.id, entry.week]));
  const dayKeys = monthDayKeys(monthId);
  const result: Record<string, number> = {};
  for (const habit of habits) {
    const scheduled = new Set(habit.days);
    let run = 0;
    let longest = 0;
    for (const key of dayKeys) {
      const iso = isoDayOfKey(key);
      if (!scheduled.has(iso)) continue;
      const checks = weeksById.get(weekIdFromKey(key))?.habitChecks[habit.id];
      if (checks?.[String(iso)] === true) {
        run += 1;
        if (run > longest) longest = run;
      } else {
        run = 0;
      }
    }
    result[habit.id] = longest;
  }
  return result;
};
