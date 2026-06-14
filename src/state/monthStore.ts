import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { subscribeWeeksTasks } from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import { isoDateKey, weeksOfMonth } from "../services/time.ts";

export interface DayCounts {
  open: number;
  done: number;
}

interface MonthState {
  monthId: string | null;
  countsByDate: Record<string, DayCounts>;
  open: (uid: string, monthId: string) => void;
}

let unsubscribe: (() => void) | null = null;
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

export const useMonthStore = create<MonthState>()(
  devtools(
    (set) => ({
      monthId: null,
      countsByDate: {},
      open: (uid, monthId) => {
        if (activeUid === uid && activeMonthId === monthId && unsubscribe)
          return;
        if (unsubscribe) unsubscribe();
        activeUid = uid;
        activeMonthId = monthId;
        set({ monthId, countsByDate: {} });
        unsubscribe = subscribeWeeksTasks(
          uid,
          weeksOfMonth(monthId),
          (tasks) => {
            set({ countsByDate: countByDate(tasks) });
          },
        );
      },
    }),
    { name: "monthStore" },
  ),
);
