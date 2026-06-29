import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { DEFAULT_TRACKER_COLOR } from "../../data/trackerColors.ts";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";

export const ALL_WEEK_DAYS = [1, 2, 3, 4, 5, 6, 7];

export interface Habit {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  order: number;
  archived: boolean;
  createdAt: number;
  days: number[];
}

const normalizeDays = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [...ALL_WEEK_DAYS];
  const days = [
    ...new Set(
      value
        .filter((day): day is number => typeof day === "number")
        .map((day) => Math.trunc(day))
        .filter((day) => day >= 1 && day <= 7),
    ),
  ].sort((a, b) => a - b);
  return days.length > 0 ? days : [...ALL_WEEK_DAYS];
};

const normalizeHabit = (id: string, data: DocumentData): Habit => ({
  id,
  name: typeof data.name === "string" ? data.name : "",
  icon: typeof data.icon === "string" && data.icon.length > 0 ? data.icon : null,
  color: typeof data.color === "string" ? data.color : DEFAULT_TRACKER_COLOR,
  order: typeof data.order === "number" ? data.order : 0,
  archived: typeof data.archived === "boolean" ? data.archived : false,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  days: normalizeDays(data.days),
});

const habitsCol = (uid: string) => collection(db, "users", uid, "habits");

const habitRef = (uid: string, habitId: string) =>
  doc(db, "users", uid, "habits", habitId);

export const subscribeHabits = (
  uid: string,
  cb: (habits: Habit[]) => void,
): (() => void) =>
  onSnapshot(
    query(habitsCol(uid), orderBy("order")),
    (snap) => {
      cb(
        snap.docs.map((docSnap) => normalizeHabit(docSnap.id, docSnap.data())),
      );
    },
    reportReadError,
  );

export const createHabit = (
  uid: string,
  name: string,
  icon: string | null,
  color: string,
  order: number,
  days: number[],
): void => {
  notePendingWrite();
  void addDoc(habitsCol(uid), {
    name,
    icon,
    color,
    order,
    archived: false,
    createdAt: Date.now(),
    days,
  }).catch(reportWriteError);
};

export const updateHabit = (
  uid: string,
  habitId: string,
  fields: { name: string; icon: string | null; color: string; days: number[] },
): void => {
  notePendingWrite();
  void updateDoc(habitRef(uid, habitId), {
    name: fields.name,
    icon: fields.icon,
    color: fields.color,
    days: fields.days,
  }).catch(reportWriteError);
};

export const setHabitArchived = (
  uid: string,
  habitId: string,
  archived: boolean,
): void => {
  notePendingWrite();
  void updateDoc(habitRef(uid, habitId), { archived }).catch(reportWriteError);
};

export const restoreHabit = (
  uid: string,
  habitId: string,
  order: number,
): void => {
  notePendingWrite();
  void updateDoc(habitRef(uid, habitId), { archived: false, order }).catch(
    reportWriteError,
  );
};

export const applyHabitOrders = (
  uid: string,
  updates: { id: string; order: number }[],
): void => {
  notePendingWrite();
  const batch = writeBatch(db);
  for (const update of updates) {
    batch.update(habitRef(uid, update.id), { order: update.order });
  }
  void batch.commit().catch(reportWriteError);
};
