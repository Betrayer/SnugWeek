import type { Habit } from "../repos/habitsRepo.ts";
import type { MonthStats } from "../repos/statsRepo.ts";
import type { Task } from "../repos/tasksRepo.ts";
import {
  ENERGY_TRACKER_ID,
  MOOD_TRACKER_ID,
} from "../repos/trackersRepo.ts";
import type { WeekEntry } from "../repos/weeksRepo.ts";
import {
  isoDayOfKey,
  monthDayKeys,
  monthIdOfWeek,
  weekIdFromKey,
  weeksOfMonth,
} from "../time.ts";
import { moodScale } from "./moodScale.ts";

export interface MonthHabitWeek {
  weekId: string;
  checked: number;
  pct: number;
}

export interface MonthHabitView {
  habitId: string;
  name: string;
  icon: string | null;
  weeks: MonthHabitWeek[];
  total: number;
  pct: number;
}

export interface MonthTrendPoint {
  day: number;
  mood: number | null;
  energy: number | null;
}

export interface MonthStatsView {
  monthId: string;
  completed: number;
  created: number;
  carried: number;
  perDay: { day: number; done: number }[];
  habits: MonthHabitView[];
  trend: MonthTrendPoint[];
  hasMood: boolean;
  hasEnergy: boolean;
  hasTaskData: boolean;
}

interface MonthStatsInput {
  monthId: string;
  stats: MonthStats | null;
  weeks: WeekEntry[];
  created: number;
  carriedTasks: Task[];
  habits: Habit[];
  moodEnabled: boolean;
  energyEnabled: boolean;
}

const DAYS_PER_WEEK = 7;

const countHabitWeek = (
  week: WeekEntry | undefined,
  habitId: string,
): number => {
  const checks = week?.week.habitChecks[habitId];
  if (!checks) return 0;
  let count = 0;
  for (let day = 1; day <= DAYS_PER_WEEK; day += 1) {
    if (checks[String(day)] === true) count += 1;
  }
  return count;
};

export const buildMonthStats = (input: MonthStatsInput): MonthStatsView => {
  const { monthId, stats, weeks, habits } = input;
  const weeksById = new Map(weeks.map((entry) => [entry.id, entry]));
  const weekIds = weeksOfMonth(monthId);

  const dayKeys = monthDayKeys(monthId);
  const perDay = dayKeys.map((key, index) => ({
    day: index + 1,
    done: stats?.perDay[key] ?? 0,
  }));

  const carried = input.carriedTasks.filter(
    (task) =>
      task.carriedFrom !== null && monthIdOfWeek(task.carriedFrom) === monthId,
  ).length;

  const habitViews: MonthHabitView[] = habits.map((habit) => {
    const habitWeeks = weekIds.map((weekId) => {
      const checked = countHabitWeek(weeksById.get(weekId), habit.id);
      return { weekId, checked, pct: checked / DAYS_PER_WEEK };
    });
    const total = habitWeeks.reduce((sum, week) => sum + week.checked, 0);
    const possible = weekIds.length * DAYS_PER_WEEK;
    return {
      habitId: habit.id,
      name: habit.name,
      icon: habit.icon,
      weeks: habitWeeks,
      total,
      pct: possible === 0 ? 0 : total / possible,
    };
  });

  const trend: MonthTrendPoint[] = dayKeys.map((key, index) => {
    const week = weeksById.get(weekIdFromKey(key));
    const values = week?.week.trackerValues[String(isoDayOfKey(key))];
    const energyValue = values?.[ENERGY_TRACKER_ID];
    return {
      day: index + 1,
      mood: input.moodEnabled ? moodScale(values?.[MOOD_TRACKER_ID]) : null,
      energy:
        input.energyEnabled && typeof energyValue === "number"
          ? energyValue
          : null,
    };
  });

  return {
    monthId,
    completed: stats?.tasksCompleted ?? 0,
    created: input.created,
    carried,
    perDay,
    habits: habitViews,
    trend,
    hasMood: trend.some((point) => point.mood !== null),
    hasEnergy: trend.some((point) => point.energy !== null),
    hasTaskData: (stats?.tasksCompleted ?? 0) > 0 || input.created > 0,
  };
};
