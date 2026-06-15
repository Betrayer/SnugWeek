import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { notifyInfo } from "../services/notify.ts";
import {
  createRoutine,
  deleteRoutine,
  setRoutineActive,
  subscribeRoutines,
  updateRoutine,
} from "../services/repos/routinesRepo.ts";
import type { Routine, RoutineFields } from "../services/repos/routinesRepo.ts";
import { requestRoutineMaterialization } from "../services/routines/materializeRoutines.ts";

interface RoutinesState {
  routines: Routine[];
  start: (uid: string) => void;
  stop: () => void;
  add: (fields: RoutineFields) => void;
  update: (id: string, fields: RoutineFields) => void;
  setActive: (id: string, active: boolean) => void;
  remove: (id: string) => void;
}

let unsubscribe: (() => void) | null = null;
let activeUid: string | null = null;

const sanitize = (fields: RoutineFields): RoutineFields => ({
  ...fields,
  title: fields.title.trim(),
});

export const useRoutinesStore = create<RoutinesState>()(
  devtools(
    (set) => ({
      routines: [],
      start: (uid) => {
        if (activeUid === uid && unsubscribe) return;
        if (unsubscribe) unsubscribe();
        activeUid = uid;
        set({ routines: [] });
        unsubscribe = subscribeRoutines(uid, (routines) => {
          set({ routines });
        });
      },
      stop: () => {
        if (unsubscribe) unsubscribe();
        unsubscribe = null;
        activeUid = null;
        set({ routines: [] });
      },
      add: (fields) => {
        const sanitized = sanitize(fields);
        if (!activeUid || sanitized.title.length === 0) return;
        if (sanitized.freq === "weekly" && sanitized.days.length === 0) return;
        createRoutine(activeUid, sanitized);
        requestRoutineMaterialization(activeUid);
      },
      update: (id, fields) => {
        const sanitized = sanitize(fields);
        if (!activeUid || sanitized.title.length === 0) return;
        if (sanitized.freq === "weekly" && sanitized.days.length === 0) return;
        updateRoutine(activeUid, id, sanitized);
        requestRoutineMaterialization(activeUid);
      },
      setActive: (id, active) => {
        if (!activeUid) return;
        setRoutineActive(activeUid, id, active);
        if (active) requestRoutineMaterialization(activeUid);
      },
      remove: (id) => {
        if (!activeUid) return;
        deleteRoutine(activeUid, id);
        notifyInfo("routines:deletedToast");
      },
    }),
    { name: "routinesStore" },
  ),
);
