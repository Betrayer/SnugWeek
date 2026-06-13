import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { orderForBottom } from "../services/ordering.ts";
import {
  createTask,
  deleteTask,
  setStatus,
  subscribeWeekTasks,
  updateTitle,
} from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import { setWeekNote, subscribeWeek } from "../services/repos/weeksRepo.ts";
import type { WeekDoc } from "../services/repos/weeksRepo.ts";

type NoteSaveState = "idle" | "saving" | "saved";

interface WeekState {
  weekId: string | null;
  week: WeekDoc | null;
  status: "idle" | "loading" | "ready";
  noteSaveState: NoteSaveState;
  tasksByDay: Record<number, Task[]>;
  open: (uid: string, weekId: string) => void;
  setNote: (text: string) => void;
  addTask: (day: number, title: string) => void;
  toggleDone: (task: Task) => void;
  renameTask: (taskId: string, title: string) => void;
  removeTask: (taskId: string) => void;
}

const NOTE_DEBOUNCE_MS = 400;
const SAVED_VISIBLE_MS = 1500;

let unsubscribe: (() => void) | null = null;
let tasksUnsub: (() => void) | null = null;
let activeUid: string | null = null;
let activeWeekId: string | null = null;
let noteTimer: ReturnType<typeof setTimeout> | null = null;
let savedTimer: ReturnType<typeof setTimeout> | null = null;
let pendingNote: string | null = null;

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

const flushPendingNote = (): void => {
  if (noteTimer) {
    clearTimeout(noteTimer);
    noteTimer = null;
  }
  if (pendingNote !== null && activeUid && activeWeekId) {
    setWeekNote(activeUid, activeWeekId, pendingNote);
  }
  pendingNote = null;
};

export const useWeekStore = create<WeekState>()(
  devtools(
    (set, get) => ({
      weekId: null,
      week: null,
      status: "idle",
      noteSaveState: "idle",
      tasksByDay: {},
      open: (uid, weekId) => {
        if (activeUid === uid && activeWeekId === weekId && unsubscribe) return;
        flushPendingNote();
        if (unsubscribe) unsubscribe();
        if (tasksUnsub) tasksUnsub();
        activeUid = uid;
        activeWeekId = weekId;
        set({
          weekId,
          week: null,
          status: "loading",
          noteSaveState: "idle",
          tasksByDay: {},
        });
        unsubscribe = subscribeWeek(uid, weekId, (week) => {
          set({ week, status: "ready" });
        });
        tasksUnsub = subscribeWeekTasks(uid, weekId, (tasks) => {
          set({ tasksByDay: groupByDay(tasks) });
        });
      },
      setNote: (text) => {
        if (!activeUid || !activeWeekId) return;
        pendingNote = text;
        set({ noteSaveState: "saving" });
        if (noteTimer) clearTimeout(noteTimer);
        noteTimer = setTimeout(() => {
          noteTimer = null;
          if (pendingNote !== null && activeUid && activeWeekId) {
            setWeekNote(activeUid, activeWeekId, pendingNote);
          }
          pendingNote = null;
          set({ noteSaveState: "saved" });
          if (savedTimer) clearTimeout(savedTimer);
          savedTimer = setTimeout(() => {
            set({ noteSaveState: "idle" });
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
      },
      toggleDone: (task) => {
        if (!activeUid) return;
        const next = task.status === "done" ? "open" : "done";
        setStatus(activeUid, task.id, next, next === "done" ? Date.now() : null);
      },
      renameTask: (taskId, title) => {
        const trimmed = title.trim();
        if (!activeUid || trimmed.length === 0) return;
        updateTitle(activeUid, taskId, trimmed);
      },
      removeTask: (taskId) => {
        if (!activeUid) return;
        deleteTask(activeUid, taskId);
      },
    }),
    { name: "weekStore" },
  ),
);
