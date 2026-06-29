import {
  collection,
  deleteField,
  doc,
  documentId,
  getDocs,
  getDocsFromCache,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { isDecorationKind } from "../../data/decorations.tsx";
import type { DecorationKind } from "../../data/decorations.tsx";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";

export type TrackerValue = number | string | boolean;

export const MAX_DECORATIONS = 120;

export interface Decoration {
  id: string;
  kind: DecorationKind;
  asset: string;
  target: "week" | number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  animation: string;
  attachmentId: string | null;
  src: string | null;
  thumbSrc: string | null;
  cropX: number | null;
  cropY: number | null;
  cropZoom: number | null;
}

export interface WeekDoc {
  note: string;
  dayNotes: Record<string, string>;
  daysOff: number[] | null;
  trackerValues: Record<string, Record<string, TrackerValue>>;
  habitChecks: Record<string, Record<string, true>>;
  decorations: Decoration[];
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

const normalizeDecoration = (value: unknown): Decoration | null => {
  if (typeof value !== "object" || value === null) return null;
  const d = value as Record<string, unknown>;
  if (typeof d.id !== "string") return null;
  if (typeof d.kind !== "string" || !isDecorationKind(d.kind)) return null;
  if (typeof d.asset !== "string") return null;
  const target =
    d.target === "week"
      ? "week"
      : typeof d.target === "number" && d.target >= 1 && d.target <= 7
        ? d.target
        : null;
  if (target === null) return null;
  if (
    typeof d.x !== "number" ||
    typeof d.y !== "number" ||
    typeof d.rotation !== "number" ||
    typeof d.scale !== "number"
  ) {
    return null;
  }
  return {
    id: d.id,
    kind: d.kind,
    asset: d.asset,
    target,
    x: d.x,
    y: d.y,
    rotation: d.rotation,
    scale: d.scale,
    animation: typeof d.animation === "string" ? d.animation : "none",
    attachmentId: typeof d.attachmentId === "string" ? d.attachmentId : null,
    src: typeof d.src === "string" ? d.src : null,
    thumbSrc: typeof d.thumbSrc === "string" ? d.thumbSrc : null,
    cropX: typeof d.cropX === "number" ? d.cropX : null,
    cropY: typeof d.cropY === "number" ? d.cropY : null,
    cropZoom: typeof d.cropZoom === "number" ? d.cropZoom : null,
  };
};

const normalizeDecorations = (value: unknown): Decoration[] => {
  if (!Array.isArray(value)) return [];
  const result: Decoration[] = [];
  for (const item of value) {
    const decoration = normalizeDecoration(item);
    if (decoration) result.push(decoration);
  }
  return result;
};

const normalizeWeek = (data: DocumentData): WeekDoc => ({
  note: typeof data.note === "string" ? data.note : "",
  dayNotes: asStringMap(data.dayNotes),
  daysOff: isNumberArray(data.daysOff) ? data.daysOff : null,
  trackerValues: asMap(data.trackerValues),
  habitChecks: asMap(data.habitChecks),
  decorations: normalizeDecorations(data.decorations),
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
  onSnapshot(
    weekRef(uid, weekId),
    (snap) => {
      cb(snap.exists() ? normalizeWeek(snap.data()) : null);
    },
    reportReadError,
  );

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
    reportReadError,
  );
};

export const subscribeWeeksRange = (
  uid: string,
  startId: string,
  endId: string,
  cb: (weeks: WeekEntry[]) => void,
): (() => void) =>
  onSnapshot(
    query(
      weeksCol(uid),
      where(documentId(), ">=", startId),
      where(documentId(), "<=", endId),
    ),
    (snap) => {
      cb(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          week: normalizeWeek(docSnap.data()),
        })),
      );
    },
    reportReadError,
  );

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

export const fetchCachedWeeks = async (
  uid: string,
  weekIds: string[],
): Promise<Record<string, WeekDoc>> => {
  if (weekIds.length === 0) return {};
  const snap = await getDocsFromCache(
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
  notePendingWrite();
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
  notePendingWrite();
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
  notePendingWrite();
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
  notePendingWrite();
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
  notePendingWrite();
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

export const newDecorationId = (uid: string): string => doc(weeksCol(uid)).id;

export const setDecorations = (
  uid: string,
  weekId: string,
  decorations: Decoration[],
): void => {
  notePendingWrite();
  void setDoc(
    weekRef(uid, weekId),
    { decorations, updatedAt: Date.now() },
    { merge: true },
  ).catch(reportWriteError);
};
