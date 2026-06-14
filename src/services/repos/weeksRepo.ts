import {
  collection,
  deleteField,
  doc,
  documentId,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase.ts";
import { reportWriteError } from "./writeError.ts";

export type TrackerValue = number | string | boolean;

export interface WeekDoc {
  note: string;
  dayNotes: Record<string, string>;
  daysOff: number[] | null;
  trackerValues: Record<string, Record<string, TrackerValue>>;
  habitChecks: Record<string, Record<string, true>>;
  updatedAt: number;
}

export interface WeekEntry {
  id: string;
  week: WeekDoc;
}

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");

const asMap = <T>(value: unknown): Record<string, T> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, T>)
    : {};

const asStringMap = (value: unknown): Record<string, string> => {
  if (typeof value !== "object" || value === null) return {};
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === "string") result[key] = item;
  }
  return result;
};

const normalizeWeek = (data: DocumentData): WeekDoc => ({
  note: typeof data.note === "string" ? data.note : "",
  dayNotes: asStringMap(data.dayNotes),
  daysOff: isNumberArray(data.daysOff) ? data.daysOff : null,
  trackerValues: asMap(data.trackerValues),
  habitChecks: asMap(data.habitChecks),
  updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
});

const weeksCol = (uid: string) => collection(db, "users", uid, "weeks");

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

export const subscribeWeeks = (
  uid: string,
  weekIds: string[],
  cb: (weeks: WeekEntry[]) => void,
): (() => void) => {
  if (weekIds.length === 0) {
    cb([]);
    return () => {};
  }
  return onSnapshot(
    query(weeksCol(uid), where(documentId(), "in", weekIds)),
    (snap) => {
      cb(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          week: normalizeWeek(docSnap.data()),
        })),
      );
    },
  );
};

export const fetchWeeks = async (
  uid: string,
  weekIds: string[],
): Promise<Record<string, WeekDoc>> => {
  if (weekIds.length === 0) return {};
  const snap = await getDocs(
    query(weeksCol(uid), where(documentId(), "in", weekIds)),
  );
  const result: Record<string, WeekDoc> = {};
  for (const docSnap of snap.docs) {
    result[docSnap.id] = normalizeWeek(docSnap.data());
  }
  return result;
};

export const setDayNote = (
  uid: string,
  weekId: string,
  day: number,
  note: string,
): void => {
  void setDoc(
    weekRef(uid, weekId),
    { dayNotes: { [String(day)]: note }, updatedAt: Date.now() },
    { merge: true },
  ).catch(reportWriteError);
};

export const setDaysOff = (
  uid: string,
  weekId: string,
  days: number[],
): void => {
  void setDoc(
    weekRef(uid, weekId),
    { daysOff: days, updatedAt: Date.now() },
    { merge: true },
  ).catch(reportWriteError);
};

export const setTrackerValue = (
  uid: string,
  weekId: string,
  day: number,
  trackerId: string,
  value: TrackerValue,
): void => {
  void setDoc(
    weekRef(uid, weekId),
    {
      trackerValues: { [String(day)]: { [trackerId]: value } },
      updatedAt: Date.now(),
    },
    { merge: true },
  ).catch(reportWriteError);
};

export const clearTrackerValue = (
  uid: string,
  weekId: string,
  day: number,
  trackerId: string,
): void => {
  void updateDoc(weekRef(uid, weekId), {
    [`trackerValues.${day}.${trackerId}`]: deleteField(),
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setHabitCheck = (
  uid: string,
  weekId: string,
  habitId: string,
  day: number,
  checked: boolean,
): void => {
  const ref = weekRef(uid, weekId);
  if (checked) {
    void setDoc(
      ref,
      {
        habitChecks: { [habitId]: { [String(day)]: true } },
        updatedAt: Date.now(),
      },
      { merge: true },
    ).catch(reportWriteError);
    return;
  }
  void updateDoc(ref, {
    [`habitChecks.${habitId}.${day}`]: deleteField(),
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};
