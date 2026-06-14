import type { WeekDoc } from "../repos/weeksRepo.ts";
import type { YearHeatmap } from "../time.ts";

export const longestStreaks = (
  heatmap: YearHeatmap,
  weekDocsById: Record<string, WeekDoc>,
  habitIds: string[],
): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const habitId of habitIds) {
    let run = 0;
    let longest = 0;
    for (const column of heatmap.columns) {
      const checks = weekDocsById[column.weekId]?.habitChecks[habitId];
      column.cells.forEach((cell, index) => {
        if (!cell.inYear) return;
        if (checks?.[String(index + 1)] === true) {
          run += 1;
          if (run > longest) longest = run;
        } else {
          run = 0;
        }
      });
    }
    result[habitId] = longest;
  }
  return result;
};
