import type { WeekEntry } from "../repos/weeksRepo.ts";
import {
  isoDayOfKey,
  monthDayKeys,
  monthsOfYear,
  weekIdFromKey,
} from "../time.ts";
import type { TrendSeries, TrendTracker } from "./monthStatsData.ts";
import { numericTrackerValue } from "./trackerValue.ts";

export interface TrackerAverage {
  id: string;
  name: string;
  color: string;
  avg: number;
  count: number;
}

const averageForDays = (
  weeksById: Map<string, WeekEntry>,
  dayKeys: string[],
  tracker: TrendTracker,
): { avg: number; count: number } => {
  let sum = 0;
  let count = 0;
  for (const key of dayKeys) {
    const week = weeksById.get(weekIdFromKey(key));
    const values = week?.week.trackerValues[String(isoDayOfKey(key))];
    const value = numericTrackerValue(values?.[tracker.id], tracker.type);
    if (value !== null) {
      sum += value;
      count += 1;
    }
  }
  return { avg: count > 0 ? sum / count : 0, count };
};

export const monthTrackerAverages = (
  weeks: WeekEntry[],
  trackers: TrendTracker[],
  monthId: string,
): TrackerAverage[] => {
  const weeksById = new Map(weeks.map((entry) => [entry.id, entry]));
  const dayKeys = monthDayKeys(monthId);
  const result: TrackerAverage[] = [];
  for (const tracker of trackers) {
    const { avg, count } = averageForDays(weeksById, dayKeys, tracker);
    if (count > 0) {
      result.push({
        id: tracker.id,
        name: tracker.name,
        color: tracker.color,
        avg,
        count,
      });
    }
  }
  return result;
};

export type TrackerAvgPoint = Record<string, string | number | null>;

export interface TrackerAvgTrend {
  points: TrackerAvgPoint[];
  series: TrendSeries[];
}

export const yearTrackerAveragesTrend = (
  weeks: WeekEntry[],
  trackers: TrendTracker[],
  year: number,
  monthLabels: string[],
): TrackerAvgTrend => {
  const weeksById = new Map(weeks.map((entry) => [entry.id, entry]));
  const points: TrackerAvgPoint[] = monthsOfYear(year).map((monthId, index) => {
    const point: TrackerAvgPoint = { label: monthLabels[index] ?? String(index + 1) };
    const dayKeys = monthDayKeys(monthId);
    for (const tracker of trackers) {
      const { avg, count } = averageForDays(weeksById, dayKeys, tracker);
      point[tracker.id] = count > 0 ? avg : null;
    }
    return point;
  });
  const series: TrendSeries[] = trackers
    .filter((tracker) =>
      points.some((point) => {
        const value = point[tracker.id];
        return value !== null && value !== undefined;
      }),
    )
    .map((tracker) => ({
      id: tracker.id,
      name: tracker.name,
      color: tracker.color,
    }));
  return { points, series };
};
