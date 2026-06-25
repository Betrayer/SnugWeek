import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { subscribeWeeksTasks } from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import { subscribeWeeks } from "../services/repos/weeksRepo.ts";
import type { WeekEntry } from "../services/repos/weeksRepo.ts";
import { MOOD_TRACKER_ID } from "../services/repos/trackersRepo.ts";
import { isoDateKey, weeksOfMonth } from "../services/time.ts";

export interface DayCounts {
  open: number;
  done: number;
}

interface MonthState {
  monthId: string | null;
  countsByDate: Record<string, DayCounts>;
  moodByDate: Record<string, string>;
  tasks: Task[];
  habitChecksByDate: Record<string, string[]>;
  open: (uid: string, monthId: string) => void;
  stop: () => void;
}

let tasksUnsub: (() => void) | null = null;
let weeksUnsub: (() => void) | null = null;
let activeUid: string | null = null;
let activeMonthId: string | null = null;

const countByDate = (tasks: Task[]): Record<string, DayCounts> => {
  const counts: Record<string, DayCounts> = {};
  for (const task of tasks) {
    if (task.weekId === null || task.day === null) continue;
    const key = isoDateKey(task.weekId, task.day);
    const bucket = counts[key] ?? { open: 0, done: 0 };
    if (task.status === "done") bucket.done += 1;
    else bucket.open += 1;
    counts[key] = bucket;
  }
  return counts;
};

const moodByDate = (weeks: WeekEntry[]): Record<string, string> => {
  const moods: Record<string, string> = {};
  for (const entry of weeks) {
    for (let day = 1; day <= 7; day += 1) {
      const value = entry.week.trackerValues[String(day)]?.[MOOD_TRACKER_ID];
      if (typeof value === "string" && value.length > 0) {
        moods[isoDateKey(entry.id, day)] = value;
      }
    }
  }
  return moods;
};

const habitChecksByDate = (weeks: WeekEntry[]): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const entry of weeks) {
    for (const [habitId, days] of Object.entries(entry.week.habitChecks)) {
      for (const dayKey of Object.keys(days)) {
        const day = Number(dayKey);
        if (!Number.isInteger(day) || day < 1 || day > 7) continue;
        const dateKey = isoDateKey(entry.id, day);
        const list = result[dateKey] ?? [];
        list.push(habitId);
        result[dateKey] = list;
      }
    }
  }
  return result;
};

export const useMonthStore = create<MonthState>()(
  devtools(
    (set) => ({
      monthId: null,
      countsByDate: {},
      moodByDate: {},
      tasks: [],
      habitChecksByDate: {},
      open: (uid, monthId) => {
        if (activeUid === uid && activeMonthId === monthId && tasksUnsub)
          return;
        if (tasksUnsub) tasksUnsub();
        if (weeksUnsub) weeksUnsub();
        activeUid = uid;
        activeMonthId = monthId;
        set({
          monthId,
          countsByDate: {},
          moodByDate: {},
          tasks: [],
          habitChecksByDate: {},
        });
        const weekIds = weeksOfMonth(monthId);
        tasksUnsub = subscribeWeeksTasks(uid, weekIds, (tasks) => {
          set({ countsByDate: countByDate(tasks), tasks });
        });
        weeksUnsub = subscribeWeeks(uid, weekIds, (weeks) => {
          set({
            moodByDate: moodByDate(weeks),
            habitChecksByDate: habitChecksByDate(weeks),
          });
        });
      },
      stop: () => {
        if (tasksUnsub) tasksUnsub();
        if (weeksUnsub) weeksUnsub();
        tasksUnsub = null;
        weeksUnsub = null;
        activeUid = null;
        activeMonthId = null;
        set({
          monthId: null,
          countsByDate: {},
          moodByDate: {},
          tasks: [],
          habitChecksByDate: {},
        });
      },
    }),
    { name: "monthStore" },
  ),
);
