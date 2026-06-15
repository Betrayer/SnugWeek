import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { orderForBottom } from "../services/ordering.ts";
import { bumpCompletion } from "../services/repos/statsRepo.ts";
import {
  createTask,
  deleteTask,
  setStatus,
  subscribeWeekTasks,
  updateTitle,
} from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import { playCheck, playPop, playSwoosh } from "../services/sound/soundService.ts";
import { isoDateKeyOf } from "../services/time.ts";
import {
  clearTrackerValue,
  setDayNote as setDayNoteDoc,
  setDaysOff,
  setHabitCheck,
  setTrackerValue,
  subscribeWeek,
} from "../services/repos/weeksRepo.ts";
import type { TrackerValue, WeekDoc } from "../services/repos/weeksRepo.ts";
import { useProfileStore } from "./profileStore.ts";

type NoteSaveState = "idle" | "saving" | "saved";

interface WeekState {
  weekId: string | null;
  week: WeekDoc | null;
  status: "idle" | "loading" | "ready";
  dayNoteSaveState: Record<number, NoteSaveState>;
  tasksByDay: Record<number, Task[]>;
  open: (uid: string, weekId: string) => void;
  stop: () => void;
  setDayNote: (day: number, text: string) => void;
  addTask: (day: number, title: string) => void;
  toggleDone: (task: Task) => void;
  renameTask: (taskId: string, title: string) => void;
  removeTask: (taskId: string) => void;
  setTrackerValue: (day: number, trackerId: string, value: TrackerValue) => void;
  clearTrackerValue: (day: number, trackerId: string) => void;
  toggleHabit: (habitId: string, day: number) => void;
  toggleDayOff: (day: number) => void;
}

const NOTE_DEBOUNCE_MS = 400;
const SAVED_VISIBLE_MS = 1500;

let unsubscribe: (() => void) | null = null;
let tasksUnsub: (() => void) | null = null;
let activeUid: string | null = null;
let activeWeekId: string | null = null;
let noteTimers: Record<number, ReturnType<typeof setTimeout>> = {};
let savedTimers: Record<number, ReturnType<typeof setTimeout>> = {};
let pendingNotes: Record<number, string> = {};

const groupByDay = (tasks: Task[]): Record<number, Task[]> => {
  const grouped: Record<number, Task[]> = {};
  for (const task of tasks) {
    if (task.day === null) continue;
    const bucket = grouped[task.day] ?? [];
    bucket.push(task);
    grouped[task.day] = bucket;
  }
  return grouped;
};

const flushPendingNotes = (): void => {
  for (const timer of Object.values(noteTimers)) clearTimeout(timer);
  for (const timer of Object.values(savedTimers)) clearTimeout(timer);
  for (const [key, text] of Object.entries(pendingNotes)) {
    if (activeUid && activeWeekId) {
      setDayNoteDoc(activeUid, activeWeekId, Number(key), text);
    }
  }
  noteTimers = {};
  savedTimers = {};
  pendingNotes = {};
};

export const useWeekStore = create<WeekState>()(
  devtools(
    (set, get) => ({
      weekId: null,
      week: null,
      status: "idle",
      dayNoteSaveState: {},
      tasksByDay: {},
      open: (uid, weekId) => {
        if (activeUid === uid && activeWeekId === weekId && unsubscribe) return;
        flushPendingNotes();
        if (unsubscribe) unsubscribe();
        if (tasksUnsub) tasksUnsub();
        activeUid = uid;
        activeWeekId = weekId;
        set({
          weekId,
          week: null,
          status: "loading",
          dayNoteSaveState: {},
          tasksByDay: {},
        });
        unsubscribe = subscribeWeek(uid, weekId, (week) => {
          set({ week, status: "ready" });
        });
        tasksUnsub = subscribeWeekTasks(uid, weekId, (tasks) => {
          set({ tasksByDay: groupByDay(tasks) });
        });
      },
      stop: () => {
        for (const timer of Object.values(noteTimers)) clearTimeout(timer);
        for (const timer of Object.values(savedTimers)) clearTimeout(timer);
        noteTimers = {};
        savedTimers = {};
        pendingNotes = {};
        if (unsubscribe) unsubscribe();
        if (tasksUnsub) tasksUnsub();
        unsubscribe = null;
        tasksUnsub = null;
        activeUid = null;
        activeWeekId = null;
        set({
          weekId: null,
          week: null,
          status: "idle",
          dayNoteSaveState: {},
          tasksByDay: {},
        });
      },
      setDayNote: (day, text) => {
        if (!activeUid || !activeWeekId) return;
        pendingNotes[day] = text;
        set((state) => ({
          dayNoteSaveState: { ...state.dayNoteSaveState, [day]: "saving" },
        }));
        const existing = noteTimers[day];
        if (existing) clearTimeout(existing);
        noteTimers[day] = setTimeout(() => {
          delete noteTimers[day];
          const pending = pendingNotes[day];
          if (pending !== undefined && activeUid && activeWeekId) {
            setDayNoteDoc(activeUid, activeWeekId, day, pending);
          }
          delete pendingNotes[day];
          set((state) => ({
            dayNoteSaveState: { ...state.dayNoteSaveState, [day]: "saved" },
          }));
          const savedExisting = savedTimers[day];
          if (savedExisting) clearTimeout(savedExisting);
          savedTimers[day] = setTimeout(() => {
            delete savedTimers[day];
            set((state) => ({
              dayNoteSaveState: { ...state.dayNoteSaveState, [day]: "idle" },
            }));
          }, SAVED_VISIBLE_MS);
        }, NOTE_DEBOUNCE_MS);
      },
      addTask: (day, title) => {
        const trimmed = title.trim();
        if (!activeUid || !activeWeekId || trimmed.length === 0) return;
        const order = orderForBottom(get().tasksByDay[day] ?? []);
        createTask(activeUid, {
          title: trimmed,
          bucket: "day",
          weekId: activeWeekId,
          day,
          listId: null,
          order,
        });
        playPop();
      },
      toggleDone: (task) => {
        if (!activeUid) return;
        if (task.status === "done") {
          if (task.completedAt !== null) {
            bumpCompletion(activeUid, isoDateKeyOf(task.completedAt), -1);
          }
          setStatus(activeUid, task.id, "open", null);
          return;
        }
        const now = Date.now();
        setStatus(activeUid, task.id, "done", now);
        bumpCompletion(activeUid, isoDateKeyOf(now), 1);
        playCheck();
      },
      renameTask: (taskId, title) => {
        const trimmed = title.trim();
        if (!activeUid || trimmed.length === 0) return;
        updateTitle(activeUid, taskId, trimmed);
      },
      removeTask: (taskId) => {
        if (!activeUid) return;
        deleteTask(activeUid, taskId);
        playSwoosh();
      },
      setTrackerValue: (day, trackerId, value) => {
        if (!activeUid || !activeWeekId) return;
        setTrackerValue(activeUid, activeWeekId, day, trackerId, value);
      },
      clearTrackerValue: (day, trackerId) => {
        if (!activeUid || !activeWeekId) return;
        const exists =
          get().week?.trackerValues[String(day)]?.[trackerId] !== undefined;
        if (!exists) return;
        clearTrackerValue(activeUid, activeWeekId, day, trackerId);
      },
      toggleHabit: (habitId, day) => {
        if (!activeUid || !activeWeekId) return;
        const current =
          get().week?.habitChecks[habitId]?.[String(day)] === true;
        setHabitCheck(activeUid, activeWeekId, habitId, day, !current);
      },
      toggleDayOff: (day) => {
        if (!activeUid || !activeWeekId) return;
        const effective =
          get().week?.daysOff ?? useProfileStore.getState().weekend;
        const next = effective.includes(day)
          ? effective.filter((value) => value !== day)
          : [...effective, day].sort((a, b) => a - b);
        setDaysOff(activeUid, activeWeekId, next);
      },
    }),
    { name: "weekStore" },
  ),
);
