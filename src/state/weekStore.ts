import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { setWeekNote, subscribeWeek } from "../services/repos/weeksRepo.ts";
import type { WeekDoc } from "../services/repos/weeksRepo.ts";

type NoteSaveState = "idle" | "saving" | "saved";

interface WeekState {
  weekId: string | null;
  week: WeekDoc | null;
  status: "idle" | "loading" | "ready";
  noteSaveState: NoteSaveState;
  open: (uid: string, weekId: string) => void;
  setNote: (text: string) => void;
}

const NOTE_DEBOUNCE_MS = 400;
const SAVED_VISIBLE_MS = 1500;

let unsubscribe: (() => void) | null = null;
let activeUid: string | null = null;
let activeWeekId: string | null = null;
let noteTimer: ReturnType<typeof setTimeout> | null = null;
let savedTimer: ReturnType<typeof setTimeout> | null = null;
let pendingNote: string | null = null;

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
    (set) => ({
      weekId: null,
      week: null,
      status: "idle",
      noteSaveState: "idle",
      open: (uid, weekId) => {
        if (activeUid === uid && activeWeekId === weekId && unsubscribe) return;
        flushPendingNote();
        if (unsubscribe) unsubscribe();
        activeUid = uid;
        activeWeekId = weekId;
        set({ weekId, week: null, status: "loading", noteSaveState: "idle" });
        unsubscribe = subscribeWeek(uid, weekId, (week) => {
          set({ week, status: "ready" });
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
    }),
    { name: "weekStore" },
  ),
);
