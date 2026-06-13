import { doc, onSnapshot, setDoc } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase.ts";
import { reportWriteError } from "./writeError.ts";

export interface WeekDoc {
  note: string;
  daysOff: number[] | null;
  trackerValues: Record<string, Record<string, number | string | boolean>>;
  habitChecks: Record<string, Record<string, true>>;
  updatedAt: number;
}

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");

const asMap = <T>(value: unknown): Record<string, T> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, T>)
    : {};

const normalizeWeek = (data: DocumentData): WeekDoc => ({
  note: typeof data.note === "string" ? data.note : "",
  daysOff: isNumberArray(data.daysOff) ? data.daysOff : null,
  trackerValues: asMap(data.trackerValues),
  habitChecks: asMap(data.habitChecks),
  updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
});

const weekRef = (uid: string, weekId: string) =>
  doc(db, "users", uid, "weeks", weekId);

export const subscribeWeek = (
  uid: string,
  weekId: string,
  cb: (week: WeekDoc | null) => void,
): (() => void) =>
  onSnapshot(weekRef(uid, weekId), (snap) => {
    cb(snap.exists() ? normalizeWeek(snap.data()) : null);
  });

export const setWeekNote = (
  uid: string,
  weekId: string,
  note: string,
): void => {
  void setDoc(
    weekRef(uid, weekId),
    { note, updatedAt: Date.now() },
    { merge: true },
  ).catch(reportWriteError);
};
