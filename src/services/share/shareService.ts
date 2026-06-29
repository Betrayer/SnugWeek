import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { isDecorationKind } from "../../data/decorations.tsx";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "../repos/readError.ts";
import { reportWriteError } from "../repos/writeError.ts";
import type { Decoration, TrackerValue } from "../repos/weeksRepo.ts";
import { SHARE_SCHEMA_VERSION } from "./shareTypes.ts";
import type {
  ShareDoc,
  ShareInclude,
  ShareSnapshot,
  ShareSummary,
  WeekViewDay,
  WeekViewHabit,
  WeekViewList,
  WeekViewTask,
  WeekViewTracker,
} from "./shareTypes.ts";

const sharesCol = () => collection(db, "shares");

const shareRef = (shareId: string) => doc(db, "shares", shareId);

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const asNumber = (value: unknown): number =>
  typeof value === "number" ? value : 0;

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const asObject = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const normalizeInclude = (value: unknown): ShareInclude => {
  const o = asObject(value);
  return {
    tasks: o.tasks !== false,
    note: o.note === true,
    trackers: o.trackers === true,
    habits: o.habits === true,
    decorations: o.decorations === true,
    lists: o.lists === true,
  };
};

const normalizeListKind = (value: unknown): WeekViewList["kind"] =>
  value === "tasks" || value === "ideas" ? value : "custom";

const normalizeList = (value: unknown): WeekViewList => {
  const o = asObject(value);
  return {
    id: asString(o.id),
    name: typeof o.name === "string" ? o.name : null,
    kind: normalizeListKind(o.kind),
    emoji: typeof o.emoji === "string" ? o.emoji : null,
    tasks: asArray(o.tasks).map(normalizeTask),
  };
};

const normalizeTrackerType = (value: unknown): WeekViewTracker["type"] =>
  value === "scale5" ||
  value === "emoji" ||
  value === "number" ||
  value === "checkbox"
    ? value
    : "scale5";

const normalizeTask = (value: unknown): WeekViewTask => {
  const o = asObject(value);
  return {
    id: asString(o.id),
    title: asString(o.title),
    done: o.done === true,
    time: typeof o.time === "string" ? o.time : null,
  };
};

const normalizeDay = (value: unknown): WeekViewDay => {
  const o = asObject(value);
  return {
    iso: asNumber(o.iso),
    label: asString(o.label),
    isOff: o.isOff === true,
    tasks: asArray(o.tasks).map(normalizeTask),
    note: asString(o.note),
  };
};

const normalizeTracker = (value: unknown): WeekViewTracker => {
  const o = asObject(value);
  return {
    id: asString(o.id),
    name: asString(o.name),
    type: normalizeTrackerType(o.type),
    icon: asString(o.icon),
  };
};

const normalizeHabit = (value: unknown): WeekViewHabit => {
  const o = asObject(value);
  return {
    id: asString(o.id),
    name: asString(o.name),
    icon: typeof o.icon === "string" ? o.icon : null,
  };
};

const normalizeTrackerValues = (
  value: unknown,
): Record<string, Record<string, TrackerValue>> => {
  const result: Record<string, Record<string, TrackerValue>> = {};
  for (const [day, inner] of Object.entries(asObject(value))) {
    const dayValues: Record<string, TrackerValue> = {};
    for (const [trackerId, raw] of Object.entries(asObject(inner))) {
      if (
        typeof raw === "number" ||
        typeof raw === "string" ||
        typeof raw === "boolean"
      ) {
        dayValues[trackerId] = raw;
      }
    }
    result[day] = dayValues;
  }
  return result;
};

const normalizeHabitChecks = (
  value: unknown,
): Record<string, Record<string, boolean>> => {
  const result: Record<string, Record<string, boolean>> = {};
  for (const [habitId, inner] of Object.entries(asObject(value))) {
    const checks: Record<string, boolean> = {};
    for (const [day, raw] of Object.entries(asObject(inner))) {
      checks[day] = raw === true;
    }
    result[habitId] = checks;
  }
  return result;
};

const normalizeDecoration = (value: unknown): Decoration | null => {
  const o = asObject(value);
  if (typeof o.id !== "string") return null;
  if (typeof o.kind !== "string" || !isDecorationKind(o.kind)) return null;
  if (typeof o.asset !== "string") return null;
  const target =
    o.target === "week"
      ? "week"
      : typeof o.target === "number" && o.target >= 1 && o.target <= 7
        ? o.target
        : null;
  if (target === null) return null;
  if (
    typeof o.x !== "number" ||
    typeof o.y !== "number" ||
    typeof o.rotation !== "number" ||
    typeof o.scale !== "number"
  ) {
    return null;
  }
  return {
    id: o.id,
    kind: o.kind,
    asset: o.asset,
    target,
    x: o.x,
    y: o.y,
    rotation: o.rotation,
    scale: o.scale,
    animation: typeof o.animation === "string" ? o.animation : "none",
    attachmentId: typeof o.attachmentId === "string" ? o.attachmentId : null,
    src: typeof o.src === "string" ? o.src : null,
    thumbSrc: typeof o.thumbSrc === "string" ? o.thumbSrc : null,
    cropX: typeof o.cropX === "number" ? o.cropX : null,
    cropY: typeof o.cropY === "number" ? o.cropY : null,
    cropZoom: typeof o.cropZoom === "number" ? o.cropZoom : null,
  };
};

const normalizeDecorations = (value: unknown): Decoration[] => {
  const result: Decoration[] = [];
  for (const item of asArray(value)) {
    const decoration = normalizeDecoration(item);
    if (decoration) result.push(decoration);
  }
  return result;
};

const normalizeSnapshot = (value: unknown): ShareSnapshot => {
  const o = asObject(value);
  return {
    days: asArray(o.days).map(normalizeDay),
    weekNote: asString(o.weekNote),
    trackers: asArray(o.trackers).map(normalizeTracker),
    trackerValues: normalizeTrackerValues(o.trackerValues),
    habits: asArray(o.habits).map(normalizeHabit),
    habitChecks: normalizeHabitChecks(o.habitChecks),
    decorations: normalizeDecorations(o.decorations),
    lists: asArray(o.lists).map(normalizeList),
  };
};

const normalizeShare = (data: DocumentData): ShareDoc => ({
  v: asNumber(data.v),
  ownerUid: asString(data.ownerUid),
  weekId: asString(data.weekId),
  weekTitle: asString(data.weekTitle),
  language: asString(data.language) || "uk",
  themeId: asString(data.themeId) || "milk",
  notebookName:
    typeof data.notebookName === "string" ? data.notebookName : null,
  createdAt: asNumber(data.createdAt),
  include: normalizeInclude(data.include),
  snapshot: normalizeSnapshot(data.snapshot),
});

export interface CreateShareInput {
  ownerUid: string;
  weekId: string;
  weekTitle: string;
  language: string;
  themeId: string;
  notebookName: string | null;
  include: ShareInclude;
  snapshot: ShareSnapshot;
}

export const createShare = (input: CreateShareInput): string => {
  const id = doc(sharesCol()).id;
  const data: ShareDoc = {
    v: SHARE_SCHEMA_VERSION,
    ownerUid: input.ownerUid,
    weekId: input.weekId,
    weekTitle: input.weekTitle,
    language: input.language,
    themeId: input.themeId,
    notebookName: input.notebookName,
    createdAt: Date.now(),
    include: input.include,
    snapshot: input.snapshot,
  };
  notePendingWrite();
  void setDoc(shareRef(id), data).catch(reportWriteError);
  return id;
};

export const revokeShare = (shareId: string): void => {
  notePendingWrite();
  void deleteDoc(shareRef(shareId)).catch(reportWriteError);
};

export const getShare = async (shareId: string): Promise<ShareDoc | null> => {
  const snap = await getDoc(shareRef(shareId));
  if (!snap.exists()) return null;
  return normalizeShare(snap.data());
};

export const subscribeOwnerShares = (
  uid: string,
  cb: (shares: ShareSummary[]) => void,
): (() => void) =>
  onSnapshot(
    query(sharesCol(), where("ownerUid", "==", uid)),
    (snap) => {
      cb(
        snap.docs
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              weekId: asString(data.weekId),
              weekTitle: asString(data.weekTitle),
              createdAt: asNumber(data.createdAt),
              include: normalizeInclude(data.include),
            };
          })
          .sort((a, b) => b.createdAt - a.createdAt),
      );
    },
    reportReadError,
  );

export const shareUrl = (shareId: string): string =>
  `${window.location.origin}/s/${shareId}`;
