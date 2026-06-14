import type { MonthStats } from "../repos/statsRepo.ts";
import { currentMonthId, monthsOfYear } from "../time.ts";

export interface YearMonthBar {
  month: number;
  label: string;
  done: number;
  isCurrent: boolean;
}

export interface YearStatsView {
  year: number;
  months: YearMonthBar[];
  total: number;
  perDay: Record<string, number>;
  maxPerDay: number;
  hasData: boolean;
}

interface YearStatsInput {
  year: number;
  monthStats: Record<string, MonthStats>;
  monthLabels: string[];
}

export const buildYearStats = (input: YearStatsInput): YearStatsView => {
  const { year, monthStats, monthLabels } = input;
  const current = currentMonthId();
  const perDay: Record<string, number> = {};
  let maxPerDay = 0;

  const months: YearMonthBar[] = monthsOfYear(year).map((monthId, index) => {
    const stats = monthStats[monthId];
    if (stats) {
      for (const [dateKey, count] of Object.entries(stats.perDay)) {
        perDay[dateKey] = (perDay[dateKey] ?? 0) + count;
        if (perDay[dateKey] > maxPerDay) maxPerDay = perDay[dateKey];
      }
    }
    return {
      month: index + 1,
      label: monthLabels[index] ?? String(index + 1),
      done: stats?.tasksCompleted ?? 0,
      isCurrent: monthId === current,
    };
  });

  const total = months.reduce((sum, month) => sum + month.done, 0);

  return { year, months, total, perDay, maxPerDay, hasData: total > 0 };
};
