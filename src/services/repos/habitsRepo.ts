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
import { db } from "../firebase.ts";
import { reportWriteError } from "./writeError.ts";

export interface Habit {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  archived: boolean;
  createdAt: number;
}

const normalizeHabit = (id: string, data: DocumentData): Habit => ({
  id,
  name: typeof data.name === "string" ? data.name : "",
  icon: typeof data.icon === "string" ? data.icon : null,
  order: typeof data.order === "number" ? data.order : 0,
  archived: typeof data.archived === "boolean" ? data.archived : false,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
});

const habitsCol = (uid: string) => collection(db, "users", uid, "habits");

const habitRef = (uid: string, habitId: string) =>
  doc(db, "users", uid, "habits", habitId);

export const subscribeHabits = (
  uid: string,
  cb: (habits: Habit[]) => void,
): (() => void) =>
  onSnapshot(query(habitsCol(uid), orderBy("order")), (snap) => {
    cb(snap.docs.map((docSnap) => normalizeHabit(docSnap.id, docSnap.data())));
  });

export const createHabit = (
  uid: string,
  name: string,
  icon: string | null,
  order: number,
): void => {
  void addDoc(habitsCol(uid), {
    name,
    icon,
    order,
    archived: false,
    createdAt: Date.now(),
  }).catch(reportWriteError);
};

export const updateHabit = (
  uid: string,
  habitId: string,
  fields: { name: string; icon: string | null },
): void => {
  void updateDoc(habitRef(uid, habitId), {
    name: fields.name,
    icon: fields.icon,
  }).catch(reportWriteError);
};

export const setHabitArchived = (
  uid: string,
  habitId: string,
  archived: boolean,
): void => {
  void updateDoc(habitRef(uid, habitId), { archived }).catch(reportWriteError);
};

export const restoreHabit = (
  uid: string,
  habitId: string,
  order: number,
): void => {
  void updateDoc(habitRef(uid, habitId), { archived: false, order }).catch(
    reportWriteError,
  );
};

export const applyHabitOrders = (
  uid: string,
  updates: { id: string; order: number }[],
): void => {
  const batch = writeBatch(db);
  for (const update of updates) {
    batch.update(habitRef(uid, update.id), { order: update.order });
  }
  void batch.commit().catch(reportWriteError);
};
