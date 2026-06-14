import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { ORDER_SPACING } from "../ordering.ts";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";

export type TrackerType = "scale5" | "emoji" | "number" | "checkbox";

export interface Tracker {
  id: string;
  name: string;
  type: TrackerType;
  icon: string;
  order: number;
  enabled: boolean;
  createdAt: number;
}

export interface NewTrackerFields {
  name: string;
  type: TrackerType;
  icon: string;
  order: number;
}

export const MOOD_TRACKER_ID = "mood";
export const ENERGY_TRACKER_ID = "energy";

export const isDefaultTracker = (id: string): boolean =>
  id === MOOD_TRACKER_ID || id === ENERGY_TRACKER_ID;

const normalizeType = (value: unknown): TrackerType =>
  value === "scale5" ||
  value === "emoji" ||
  value === "number" ||
  value === "checkbox"
    ? value
    : "scale5";

const normalizeTracker = (id: string, data: DocumentData): Tracker => ({
  id,
  name: typeof data.name === "string" ? data.name : "",
  type: normalizeType(data.type),
  icon: typeof data.icon === "string" ? data.icon : "",
  order: typeof data.order === "number" ? data.order : 0,
  enabled: typeof data.enabled === "boolean" ? data.enabled : true,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
});

const trackersCol = (uid: string) => collection(db, "users", uid, "trackers");

const trackerRef = (uid: string, trackerId: string) =>
  doc(db, "users", uid, "trackers", trackerId);

const seedTracker = async (
  uid: string,
  trackerId: string,
  fields: Omit<Tracker, "id">,
): Promise<void> => {
  const ref = trackerRef(uid, trackerId);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, fields);
};

export const seedDefaultTrackers = async (uid: string): Promise<void> => {
  const now = Date.now();
  await Promise.all([
    seedTracker(uid, MOOD_TRACKER_ID, {
      name: "",
      type: "emoji",
      icon: "🙂",
      order: 0,
      enabled: true,
      createdAt: now,
    }),
    seedTracker(uid, ENERGY_TRACKER_ID, {
      name: "",
      type: "scale5",
      icon: "bolt",
      order: ORDER_SPACING,
      enabled: true,
      createdAt: now,
    }),
  ]);
};

export const subscribeTrackers = (
  uid: string,
  cb: (trackers: Tracker[]) => void,
): (() => void) =>
  onSnapshot(
    query(trackersCol(uid), orderBy("order")),
    (snap) => {
      cb(snap.docs.map((docSnap) => normalizeTracker(docSnap.id, docSnap.data())));
    },
    reportReadError,
  );

export const createTracker = (uid: string, fields: NewTrackerFields): void => {
  notePendingWrite();
  void addDoc(trackersCol(uid), {
    name: fields.name,
    type: fields.type,
    icon: fields.icon,
    order: fields.order,
    enabled: true,
    createdAt: Date.now(),
  }).catch(reportWriteError);
};

export const updateTracker = (
  uid: string,
  trackerId: string,
  fields: { name: string; icon: string },
): void => {
  notePendingWrite();
  void updateDoc(trackerRef(uid, trackerId), {
    name: fields.name,
    icon: fields.icon,
  }).catch(reportWriteError);
};

export const setTrackerEnabled = (
  uid: string,
  trackerId: string,
  enabled: boolean,
): void => {
  notePendingWrite();
  void updateDoc(trackerRef(uid, trackerId), { enabled }).catch(
    reportWriteError,
  );
};

export const deleteTracker = (uid: string, trackerId: string): void => {
  notePendingWrite();
  void deleteDoc(trackerRef(uid, trackerId)).catch(reportWriteError);
};

export const applyTrackerOrders = (
  uid: string,
  updates: { id: string; order: number }[],
): void => {
  notePendingWrite();
  const batch = writeBatch(db);
  for (const update of updates) {
    batch.update(trackerRef(uid, update.id), { order: update.order });
  }
  void batch.commit().catch(reportWriteError);
};
