import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { subscribeWeekTasks } from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import { subscribeWeek } from "../services/repos/weeksRepo.ts";
import type { WeekDoc } from "../services/repos/weeksRepo.ts";

interface RecapState {
  weekId: string | null;
  week: WeekDoc | null;
  tasks: Task[];
  status: "idle" | "loading" | "ready";
  open: (uid: string, weekId: string) => void;
  stop: () => void;
}

let weekUnsub: (() => void) | null = null;
let tasksUnsub: (() => void) | null = null;
let activeUid: string | null = null;
let activeWeekId: string | null = null;

export const useRecapStore = create<RecapState>()(
  devtools(
    (set) => ({
      weekId: null,
      week: null,
      tasks: [],
      status: "idle",
      open: (uid, weekId) => {
        if (activeUid === uid && activeWeekId === weekId && weekUnsub) return;
        if (weekUnsub) weekUnsub();
        if (tasksUnsub) tasksUnsub();
        activeUid = uid;
        activeWeekId = weekId;
        set({ weekId, week: null, tasks: [], status: "loading" });
        weekUnsub = subscribeWeek(uid, weekId, (week) => {
          set({ week, status: "ready" });
        });
        tasksUnsub = subscribeWeekTasks(uid, weekId, (tasks) => {
          set({ tasks });
        });
      },
      stop: () => {
        if (weekUnsub) weekUnsub();
        if (tasksUnsub) tasksUnsub();
        weekUnsub = null;
        tasksUnsub = null;
        activeUid = null;
        activeWeekId = null;
        set({ weekId: null, week: null, tasks: [], status: "idle" });
      },
    }),
    { name: "recapStore" },
  ),
);
