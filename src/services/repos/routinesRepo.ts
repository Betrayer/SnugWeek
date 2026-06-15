import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";

export type RoutineFreq = "daily" | "weekly";

export interface Routine {
  id: string;
  title: string;
  freq: RoutineFreq;
  days: number[];
  time: string | null;
  remindOffsetMin: number | null;
  active: boolean;
  createdAt: number;
}

export interface RoutineFields {
  title: string;
  freq: RoutineFreq;
  days: number[];
  time: string | null;
  remindOffsetMin: number | null;
  active: boolean;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const asTimeOrNull = (value: unknown): string | null =>
  typeof value === "string" && TIME_PATTERN.test(value) ? value : null;

const asOffsetOrNull = (value: unknown): number | null =>
  typeof value === "number" && value >= 0 ? value : null;

const asDays = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  const valid = value.filter(
    (item): item is number =>
      typeof item === "number" && item >= 1 && item <= 7,
  );
  return [...new Set(valid)].sort((a, b) => a - b);
};

export const normalizeRoutine = (id: string, data: DocumentData): Routine => ({
  id,
  title: typeof data.title === "string" ? data.title : "",
  freq: data.freq === "weekly" ? "weekly" : "daily",
  days: asDays(data.days),
  time: asTimeOrNull(data.time),
  remindOffsetMin: asOffsetOrNull(data.remindOffsetMin),
  active: data.active !== false,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
});

const routinesCol = (uid: string) => collection(db, "users", uid, "routines");

const routineRef = (uid: string, routineId: string) =>
  doc(db, "users", uid, "routines", routineId);

const toDoc = (fields: RoutineFields) => ({
  title: fields.title,
  freq: fields.freq,
  days: fields.freq === "weekly" ? fields.days : [],
  time: fields.time,
  remindOffsetMin: fields.time === null ? null : fields.remindOffsetMin,
  active: fields.active,
});

export const subscribeRoutines = (
  uid: string,
  cb: (routines: Routine[]) => void,
): (() => void) =>
  onSnapshot(
    query(routinesCol(uid), orderBy("createdAt")),
    (snap) => {
      cb(
        snap.docs.map((docSnap) =>
          normalizeRoutine(docSnap.id, docSnap.data()),
        ),
      );
    },
    reportReadError,
  );

export const createRoutine = (uid: string, fields: RoutineFields): void => {
  notePendingWrite();
  void addDoc(routinesCol(uid), {
    ...toDoc(fields),
    createdAt: Date.now(),
  }).catch(reportWriteError);
};

export const updateRoutine = (
  uid: string,
  routineId: string,
  fields: RoutineFields,
): void => {
  notePendingWrite();
  void updateDoc(routineRef(uid, routineId), toDoc(fields)).catch(
    reportWriteError,
  );
};

export const setRoutineActive = (
  uid: string,
  routineId: string,
  active: boolean,
): void => {
  notePendingWrite();
  void updateDoc(routineRef(uid, routineId), { active }).catch(
    reportWriteError,
  );
};

export const deleteRoutine = (uid: string, routineId: string): void => {
  notePendingWrite();
  void deleteDoc(routineRef(uid, routineId)).catch(reportWriteError);
};
