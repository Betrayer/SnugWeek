import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { orderForBottom } from "../services/ordering.ts";
import { purgeTaskAttachments } from "../services/repos/attachmentsRepo.ts";
import { bumpCompletion } from "../services/repos/statsRepo.ts";
import {
  createTask,
  deleteTask,
  setStatus,
  setTaskReminder,
  setTaskTime,
  subscribeWeekTasks,
  updateTitle,
} from "../services/repos/tasksRepo.ts";
import type { Task } from "../services/repos/tasksRepo.ts";
import {
  playCheck,
  playPop,
  playSwoosh,
} from "../services/sound/soundService.ts";
import { isoDateKeyOf } from "../services/time.ts";
import {
  MAX_DECORATIONS,
  clearTrackerValue,
  newDecorationId,
  setDayNote as setDayNoteDoc,
  setDaysOff,
  setDecorations,
  setHabitCheck,
  setTrackerValue,
  subscribeWeek,
} from "../services/repos/weeksRepo.ts";
import type {
  Decoration,
  TrackerValue,
  WeekDoc,
} from "../services/repos/weeksRepo.ts";
import { DEFAULT_DECORATION_ANIMATION } from "../data/decorations.tsx";
import type { DecorationKind } from "../data/decorations.tsx";
import { useDecorStore } from "./decorStore.ts";
import { useProfileStore } from "./profileStore.ts";
import { useUiStore } from "./uiStore.ts";

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
  setTime: (taskId: string, time: string | null) => void;
  setReminder: (taskId: string, offsetMin: number | null) => void;
  setTrackerValue: (
    day: number,
    trackerId: string,
    value: TrackerValue,
  ) => void;
  clearTrackerValue: (day: number, trackerId: string) => void;
  toggleHabit: (habitId: string, day: number) => void;
  toggleDayOff: (day: number) => void;
  addDecoration: (assetId: string, kind: DecorationKind) => void;
  updateDecoration: (
    id: string,
    patch: Partial<
      Pick<Decoration, "x" | "y" | "rotation" | "scale" | "animation">
    >,
  ) => void;
  removeDecoration: (id: string) => void;
}

const DECORATION_TILTS = [-6, 5, -3, 7, -8, 2];

const clampPct = (value: number): number => Math.min(94, Math.max(6, value));

const NOTE_DEBOUNCE_MS = 400;
const SAVED_VISIBLE_MS = 1500;

let unsubscribe: (() => void) | null = null;
let tasksUnsub: (() => void) | null = null;
let activeUid: string | null = null;
let activeWeekId: string | null = null;
let noteTimers: Record<number, ReturnType<typeof setTimeout>> = {};
let savedTimers: Record<number, ReturnType<typeof setTimeout>> = {};
let pendingNotes: Record<number, string> = {};

const activeFilterTagIds = (): string[] => useUiStore.getState().tagFilter;

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
          tagIds: activeFilterTagIds(),
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
        const task = Object.values(get().tasksByDay)
          .flat()
          .find((entry) => entry.id === taskId);
        if (task && task.attachmentCount > 0) {
          purgeTaskAttachments(activeUid, taskId);
        }
        deleteTask(activeUid, taskId);
        playSwoosh();
      },
      setTime: (taskId, time) => {
        if (!activeUid) return;
        setTaskTime(activeUid, taskId, time);
      },
      setReminder: (taskId, offsetMin) => {
        if (!activeUid) return;
        setTaskReminder(activeUid, taskId, offsetMin);
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
      addDecoration: (assetId, kind) => {
        if (!activeUid || !activeWeekId || get().status !== "ready") return;
        const current = get().week?.decorations ?? [];
        if (current.length >= MAX_DECORATIONS) return;
        const target = useDecorStore.getState().target;
        const sameTarget = current.filter(
          (item) => item.target === target,
        ).length;
        const tilt =
          DECORATION_TILTS[sameTarget % DECORATION_TILTS.length] ?? 0;
        const decoration: Decoration = {
          id: newDecorationId(activeUid),
          kind,
          asset: assetId,
          target,
          x: clampPct(46 + ((sameTarget % 3) - 1) * 9),
          y: clampPct(34 + (sameTarget % 4) * 7),
          rotation: kind === "washi" ? Math.round(tilt / 2) : tilt,
          scale: 1,
          animation: DEFAULT_DECORATION_ANIMATION,
        };
        setDecorations(activeUid, activeWeekId, [...current, decoration]);
        useDecorStore.getState().select(decoration.id);
      },
      updateDecoration: (id, patch) => {
        if (!activeUid || !activeWeekId || get().status !== "ready") return;
        const current = get().week?.decorations ?? [];
        if (!current.some((item) => item.id === id)) return;
        const next = current.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        );
        setDecorations(activeUid, activeWeekId, next);
      },
      removeDecoration: (id) => {
        if (!activeUid || !activeWeekId || get().status !== "ready") return;
        const current = get().week?.decorations ?? [];
        if (!current.some((item) => item.id === id)) return;
        setDecorations(
          activeUid,
          activeWeekId,
          current.filter((item) => item.id !== id),
        );
        if (useDecorStore.getState().selectedId === id) {
          useDecorStore.getState().select(null);
        }
      },
    }),
    { name: "weekStore" },
  ),
);
