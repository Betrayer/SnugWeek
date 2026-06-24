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
import {
  getDayTasksByWeekIds,
  getDayTasksByWeekRange,
  getDoneTasksInRange,
  subscribeListTasks,
} from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import {
  subscribeWeeks,
  subscribeWeeksRange,
} from "../services/repos/weeksRepo.ts";
import type { WeekEntry } from "../services/repos/weeksRepo.ts";
import {
  addMonths,
  monthRangeMs,
  weeksOfMonth,
  yearRangeMs,
  yearWeekRange,
} from "../services/time.ts";

type LoadStatus = "idle" | "loading" | "ready";

interface StatsState {
  monthId: string | null;
  monthStats: MonthStats | null;
  monthWeeks: WeekEntry[];
  monthCreated: number;
  monthPrevCompleted: number;
  monthDoneTasks: Task[];
  monthDayTasks: Task[];
  carriedTasks: Task[];
  monthStatus: LoadStatus;
  yearValue: number | null;
  yearMonths: Record<string, MonthStats>;
  yearWeeks: WeekEntry[];
  yearDoneTasks: Task[];
  yearDayTasks: Task[];
  yearStatus: LoadStatus;
  openMonth: (uid: string, monthId: string) => void;
  openYear: (uid: string, year: number) => void;
  stop: () => void;
  backfill: (uid: string) => Promise<void>;
}

let monthStatsUnsub: (() => void) | null = null;
let monthPrevUnsub: (() => void) | null = null;
let monthWeeksUnsub: (() => void) | null = null;
let carriedUnsub: (() => void) | null = null;
let yearStatsUnsub: (() => void) | null = null;
let yearWeeksUnsub: (() => void) | null = null;
let activeUid: string | null = null;
let activeMonthId: string | null = null;
let activeYear: number | null = null;
let createdToken = 0;
let monthTaskToken = 0;
let yearTaskToken = 0;

const teardownMonth = (): void => {
  if (monthStatsUnsub) monthStatsUnsub();
  if (monthPrevUnsub) monthPrevUnsub();
  if (monthWeeksUnsub) monthWeeksUnsub();
  if (carriedUnsub) carriedUnsub();
  monthStatsUnsub = null;
  monthPrevUnsub = null;
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
      monthPrevCompleted: 0,
      monthDoneTasks: [],
      monthDayTasks: [],
      carriedTasks: [],
      monthStatus: "idle",
      yearValue: null,
      yearMonths: {},
      yearWeeks: [],
      yearDoneTasks: [],
      yearDayTasks: [],
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
          monthPrevCompleted: 0,
          monthDoneTasks: [],
          monthDayTasks: [],
          carriedTasks: [],
          monthStatus: "loading",
        });
        monthStatsUnsub = subscribeMonthStats(uid, monthId, (stats) => {
          set({ monthStats: stats, monthStatus: "ready" });
        });
        monthPrevUnsub = subscribeMonthStats(
          uid,
          addMonths(monthId, -1),
          (stats) => {
            set({ monthPrevCompleted: stats?.tasksCompleted ?? 0 });
          },
        );
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
        const taskToken = (monthTaskToken += 1);
        const { start, end } = monthRangeMs(monthId);
        void Promise.all([
          getDoneTasksInRange(uid, start, end),
          getDayTasksByWeekIds(uid, weeksOfMonth(monthId)),
        ])
          .then(([doneTasks, dayTasks]) => {
            if (taskToken === monthTaskToken) {
              set({ monthDoneTasks: doneTasks, monthDayTasks: dayTasks });
            }
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
          yearDoneTasks: [],
          yearDayTasks: [],
          yearStatus: "loading",
        });
        yearStatsUnsub = subscribeYearStats(uid, year, (months) => {
          set({ yearMonths: months, yearStatus: "ready" });
        });
        const { start, end } = yearWeekRange(year);
        yearWeeksUnsub = subscribeWeeksRange(uid, start, end, (weeks) => {
          set({ yearWeeks: weeks });
        });
        const taskToken = (yearTaskToken += 1);
        const range = yearRangeMs(year);
        void Promise.all([
          getDoneTasksInRange(uid, range.start, range.end),
          getDayTasksByWeekRange(uid, start, end),
        ])
          .then(([doneTasks, dayTasks]) => {
            if (taskToken === yearTaskToken) {
              set({ yearDoneTasks: doneTasks, yearDayTasks: dayTasks });
            }
          })
          .catch((error: unknown) => {
            console.error(error);
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
          monthPrevCompleted: 0,
          monthDoneTasks: [],
          monthDayTasks: [],
          carriedTasks: [],
          monthStatus: "idle",
          yearValue: null,
          yearMonths: {},
          yearWeeks: [],
          yearDoneTasks: [],
          yearDayTasks: [],
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
