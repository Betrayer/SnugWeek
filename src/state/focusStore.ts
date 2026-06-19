import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  MAX_CUSTOM_MIN,
  MS_PER_MIN,
  clampDurationMin,
} from "../services/focus/focusTimer.ts";
import type { FocusPhase } from "../services/focus/focusTimer.ts";
import {
  playFocusEnd,
  playFocusStart,
} from "../services/sound/soundService.ts";
import { isoDateKeyOf } from "../services/time.ts";

type FocusStatus = "idle" | "running" | "paused" | "done";

interface FocusPersisted {
  status: FocusStatus;
  phase: FocusPhase;
  durationMs: number;
  endsAt: number | null;
  remainingMs: number;
  taskId: string | null;
  taskTitle: string | null;
  sessions: Record<string, number>;
}

interface FocusState extends FocusPersisted {
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  start: (durationMin: number, phase: FocusPhase) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  finish: () => void;
  reconcile: () => void;
  setTask: (taskId: string | null, taskTitle: string | null) => void;
}

const MAX_SESSION_DAYS = 60;
const MAX_RUN_MS = MAX_CUSTOM_MIN * MS_PER_MIN;

const defaultPersisted: FocusPersisted = {
  status: "idle",
  phase: "focus",
  durationMs: 0,
  endsAt: null,
  remainingMs: 0,
  taskId: null,
  taskTitle: null,
  sessions: {},
};

const pruneSessions = (
  sessions: Record<string, number>,
): Record<string, number> => {
  const keys = Object.keys(sessions)
    .sort()
    .reverse()
    .slice(0, MAX_SESSION_DAYS);
  const next: Record<string, number> = {};
  for (const key of keys) {
    const value = sessions[key];
    if (typeof value === "number" && value > 0) next[key] = value;
  }
  return next;
};

const validateSessions = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "number" && raw > 0) out[key] = raw;
  }
  return pruneSessions(out);
};

const completed = (state: FocusPersisted): Partial<FocusState> => {
  if (state.phase !== "focus") {
    return { status: "done", endsAt: null, remainingMs: 0 };
  }
  const key = isoDateKeyOf(Date.now());
  const sessions = pruneSessions({
    ...state.sessions,
    [key]: (state.sessions[key] ?? 0) + 1,
  });
  return { status: "done", endsAt: null, remainingMs: 0, sessions };
};

export const useFocusStore = create<FocusState>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultPersisted,
        panelOpen: false,
        openPanel: () => set({ panelOpen: true }),
        closePanel: () => set({ panelOpen: false }),
        togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
        start: (durationMin, phase) => {
          const durationMs = clampDurationMin(durationMin) * MS_PER_MIN;
          set({
            status: "running",
            phase,
            durationMs,
            endsAt: Date.now() + durationMs,
            remainingMs: durationMs,
          });
          playFocusStart();
        },
        pause: () =>
          set((state) => {
            if (state.status !== "running" || state.endsAt === null) {
              return state;
            }
            return {
              status: "paused",
              remainingMs: Math.max(0, state.endsAt - Date.now()),
              endsAt: null,
            };
          }),
        resume: () =>
          set((state) => {
            if (state.status !== "paused") return state;
            if (!Number.isFinite(state.remainingMs)) {
              return { status: "idle", endsAt: null, remainingMs: 0 };
            }
            return {
              status: "running",
              endsAt: Date.now() + state.remainingMs,
            };
          }),
        reset: () => set({ status: "idle", endsAt: null, remainingMs: 0 }),
        finish: () => {
          const state = get();
          if (state.status !== "running") return;
          playFocusEnd();
          set(completed(state));
        },
        reconcile: () => {
          const state = get();
          if (state.status !== "running") return;
          if (
            state.endsAt === null ||
            !Number.isFinite(state.endsAt) ||
            state.endsAt > Date.now() + MAX_RUN_MS + 5000
          ) {
            set({ status: "idle", endsAt: null, remainingMs: 0 });
            return;
          }
          if (Date.now() >= state.endsAt) set(completed(state));
        },
        setTask: (taskId, taskTitle) => set({ taskId, taskTitle }),
      }),
      {
        name: "snugweek-focus",
        version: 1,
        partialize: (state): FocusPersisted => ({
          status: state.status,
          phase: state.phase,
          durationMs: state.durationMs,
          endsAt: state.endsAt,
          remainingMs: state.remainingMs,
          taskId: state.taskId,
          taskTitle: state.taskTitle,
          sessions: state.sessions,
        }),
        migrate: (persisted) => {
          const stored = persisted as Partial<FocusPersisted> | undefined;
          const merged = {
            ...defaultPersisted,
            ...stored,
            sessions: validateSessions(stored?.sessions),
          };
          return {
            ...merged,
            endsAt: Number.isFinite(merged.endsAt) ? merged.endsAt : null,
            remainingMs: Number.isFinite(merged.remainingMs)
              ? merged.remainingMs
              : 0,
            durationMs: Number.isFinite(merged.durationMs)
              ? merged.durationMs
              : 0,
          };
        },
      },
    ),
    { name: "focusStore" },
  ),
);
