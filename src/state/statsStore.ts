import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { markStatsBackfilled } from "../services/repos/profileRepo.ts";
import {
  backfillStats,
  getCreatedCount,
  subscribeMonthStats,
  subscribeYearStats,
} from "../services/repos/statsRepo.ts";
import type { MonthStats } from "../services/repos/statsRepo.ts";
import { subscribeListTasks } from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import {
  subscribeWeeks,
  subscribeWeeksRange,
} from "../services/repos/weeksRepo.ts";
import type { WeekEntry } from "../services/repos/weeksRepo.ts";
import { weeksOfMonth, yearWeekRange } from "../services/time.ts";

type LoadStatus = "idle" | "loading" | "ready";

interface StatsState {
  monthId: string | null;
  monthStats: MonthStats | null;
  monthWeeks: WeekEntry[];
  monthCreated: number;
  carriedTasks: Task[];
  monthStatus: LoadStatus;
  yearValue: number | null;
  yearMonths: Record<string, MonthStats>;
  yearWeeks: WeekEntry[];
  yearStatus: LoadStatus;
  openMonth: (uid: string, monthId: string) => void;
  openYear: (uid: string, year: number) => void;
  stop: () => void;
  backfill: (uid: string) => Promise<void>;
}

let monthStatsUnsub: (() => void) | null = null;
let monthWeeksUnsub: (() => void) | null = null;
let carriedUnsub: (() => void) | null = null;
let yearStatsUnsub: (() => void) | null = null;
let yearWeeksUnsub: (() => void) | null = null;
let activeUid: string | null = null;
let activeMonthId: string | null = null;
let activeYear: number | null = null;
let createdToken = 0;

const teardownMonth = (): void => {
  if (monthStatsUnsub) monthStatsUnsub();
  if (monthWeeksUnsub) monthWeeksUnsub();
  if (carriedUnsub) carriedUnsub();
  monthStatsUnsub = null;
  monthWeeksUnsub = null;
  carriedUnsub = null;
  activeMonthId = null;
};

const teardownYear = (): void => {
  if (yearStatsUnsub) yearStatsUnsub();
  if (yearWeeksUnsub) yearWeeksUnsub();
  yearStatsUnsub = null;
  yearWeeksUnsub = null;
  activeYear = null;
};

export const useStatsStore = create<StatsState>()(
  devtools(
    (set) => ({
      monthId: null,
      monthStats: null,
      monthWeeks: [],
      monthCreated: 0,
      carriedTasks: [],
      monthStatus: "idle",
      yearValue: null,
      yearMonths: {},
      yearWeeks: [],
      yearStatus: "idle",
      openMonth: (uid, monthId) => {
        if (activeUid === uid && activeMonthId === monthId && monthStatsUnsub) {
          return;
        }
        teardownYear();
        teardownMonth();
        activeUid = uid;
        activeMonthId = monthId;
        set({
          monthId,
          monthStats: null,
          monthWeeks: [],
          monthCreated: 0,
          carriedTasks: [],
          monthStatus: "loading",
        });
        monthStatsUnsub = subscribeMonthStats(uid, monthId, (stats) => {
          set({ monthStats: stats, monthStatus: "ready" });
        });
        monthWeeksUnsub = subscribeWeeks(uid, weeksOfMonth(monthId), (weeks) => {
          set({ monthWeeks: weeks });
        });
        carriedUnsub = subscribeListTasks(uid, (tasks) => {
          set({
            carriedTasks: tasks.filter((task) => task.carriedFrom !== null),
          });
        });
        const token = (createdToken += 1);
        void getCreatedCount(uid, monthId)
          .then((created) => {
            if (token === createdToken) set({ monthCreated: created });
          })
          .catch((error: unknown) => {
            console.error(error);
          });
      },
      openYear: (uid, year) => {
        if (activeUid === uid && activeYear === year && yearStatsUnsub) return;
        teardownMonth();
        teardownYear();
        activeUid = uid;
        activeYear = year;
        set({
          yearValue: year,
          yearMonths: {},
          yearWeeks: [],
          yearStatus: "loading",
        });
        yearStatsUnsub = subscribeYearStats(uid, year, (months) => {
          set({ yearMonths: months, yearStatus: "ready" });
        });
        const { start, end } = yearWeekRange(year);
        yearWeeksUnsub = subscribeWeeksRange(uid, start, end, (weeks) => {
          set({ yearWeeks: weeks });
        });
      },
      stop: () => {
        teardownMonth();
        teardownYear();
        activeUid = null;
        set({
          monthId: null,
          monthStats: null,
          monthWeeks: [],
          monthCreated: 0,
          carriedTasks: [],
          monthStatus: "idle",
          yearValue: null,
          yearMonths: {},
          yearWeeks: [],
          yearStatus: "idle",
        });
      },
      backfill: async (uid) => {
        await backfillStats(uid);
        await markStatsBackfilled(uid);
      },
    }),
    { name: "statsStore" },
  ),
);
