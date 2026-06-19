import type { Habit } from "../repos/habitsRepo.ts";
import type { Task } from "../repos/tasksRepo.ts";
import { ENERGY_TRACKER_ID, MOOD_TRACKER_ID } from "../repos/trackersRepo.ts";
import type { WeekDoc } from "../repos/weeksRepo.ts";
import { moodScale } from "../stats/moodScale.ts";

export type RecapTone = "great" | "steady" | "quiet";

export interface RecapTopHabit {
  name: string;
  icon: string | null;
  checked: number;
}

export interface WeekRecap {
  weekId: string;
  completed: number;
  total: number;
  completionPct: number;
  moodAvg: number | null;
  energyAvg: number | null;
  bestStreak: number | null;
  topHabit: RecapTopHabit | null;
  tone: RecapTone;
  hasContent: boolean;
}

export interface WeekRecapInput {
  weekId: string;
  tasks: Task[];
  week: WeekDoc | null;
  habits: Habit[];
  moodEnabled: boolean;
  energyEnabled: boolean;
  habitsEnabled: boolean;
}

const DAYS_PER_WEEK = 7;
const GREAT_THRESHOLD = 0.75;

const average = (values: number[]): number | null =>
  values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;

const longestRun = (checks: Record<string, true> | undefined): number => {
  if (!checks) return 0;
  let best = 0;
  let run = 0;
  for (let day = 1; day <= DAYS_PER_WEEK; day += 1) {
    if (checks[String(day)] === true) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
};

const countChecks = (checks: Record<string, true> | undefined): number => {
  if (!checks) return 0;
  let count = 0;
  for (let day = 1; day <= DAYS_PER_WEEK; day += 1) {
    if (checks[String(day)] === true) count += 1;
  }
  return count;
};

export const buildWeekRecap = (input: WeekRecapInput): WeekRecap => {
  const { weekId, tasks, week } = input;

  const dayTasks = tasks.filter(
    (task) => task.bucket === "day" && task.weekId === weekId,
  );
  const total = dayTasks.length;
  const completed = dayTasks.filter((task) => task.status === "done").length;
  const completionPct = total > 0 ? Math.min(1, completed / total) : 0;

  const trackerValues = week?.trackerValues ?? {};
  const moodValues: number[] = [];
  const energyValues: number[] = [];
  for (let day = 1; day <= DAYS_PER_WEEK; day += 1) {
    const values = trackerValues[String(day)];
    if (!values) continue;
    if (input.moodEnabled) {
      const mood = moodScale(values[MOOD_TRACKER_ID]);
      if (mood !== null) moodValues.push(mood);
    }
    if (input.energyEnabled) {
      const energy = values[ENERGY_TRACKER_ID];
      if (typeof energy === "number") energyValues.push(energy);
    }
  }
  const moodAvg = average(moodValues);
  const energyAvg = average(energyValues);

  let bestStreak: number | null = null;
  let topHabit: RecapTopHabit | null = null;
  if (input.habitsEnabled && input.habits.length > 0) {
    const habitChecks = week?.habitChecks ?? {};
    let longest = 0;
    let mostChecked = 0;
    for (const habit of input.habits) {
      const checks = habitChecks[habit.id];
      longest = Math.max(longest, longestRun(checks));
      const checked = countChecks(checks);
      if (checked > mostChecked) {
        mostChecked = checked;
        topHabit = { name: habit.name, icon: habit.icon, checked };
      }
    }
    bestStreak = longest > 0 ? longest : null;
  }

  const hasContent =
    completed > 0 ||
    total > 0 ||
    moodAvg !== null ||
    energyAvg !== null ||
    topHabit !== null;

  const tone: RecapTone =
    completed === 0
      ? "quiet"
      : completionPct >= GREAT_THRESHOLD
        ? "great"
        : "steady";

  return {
    weekId,
    completed,
    total,
    completionPct,
    moodAvg,
    energyAvg,
    bestStreak,
    topHabit,
    tone,
    hasContent,
  };
};
