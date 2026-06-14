import {
  collection,
  doc,
  documentId,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { isoDateKeyOf, monthIdOfKey, monthRangeMs } from "../time.ts";
import { reportWriteError } from "./writeError.ts";

export interface MonthStats {
  tasksCompleted: number;
  perDay: Record<string, number>;
  updatedAt: number;
}

const asNumberMap = (value: unknown): Record<string, number> => {
  if (typeof value !== "object" || value === null) return {};
  const result: Record<string, number> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === "number") result[key] = item;
  }
  return result;
};

const normalizeStats = (data: DocumentData): MonthStats => ({
  tasksCompleted:
    typeof data.tasksCompleted === "number" ? data.tasksCompleted : 0,
  perDay: asNumberMap(data.perDay),
  updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
});

const statsCol = (uid: string) => collection(db, "users", uid, "stats");

const statsRef = (uid: string, monthId: string) =>
  doc(db, "users", uid, "stats", monthId);

const tasksCol = (uid: string) => collection(db, "users", uid, "tasks");

export const bumpCompletion = (
  uid: string,
  isoDate: string,
  delta: number,
): void => {
  notePendingWrite();
  void setDoc(
    statsRef(uid, monthIdOfKey(isoDate)),
    {
      tasksCompleted: increment(delta),
      perDay: { [isoDate]: increment(delta) },
      updatedAt: Date.now(),
    },
    { merge: true },
  ).catch(reportWriteError);
};

export const subscribeMonthStats = (
  uid: string,
  monthId: string,
  cb: (stats: MonthStats | null) => void,
): (() => void) =>
  onSnapshot(statsRef(uid, monthId), (snap) => {
    cb(snap.exists() ? normalizeStats(snap.data()) : null);
  });

export const subscribeYearStats = (
  uid: string,
  year: number,
  cb: (months: Record<string, MonthStats>) => void,
): (() => void) =>
  onSnapshot(
    query(
      statsCol(uid),
      where(documentId(), ">=", `${year}-01`),
      where(documentId(), "<=", `${year}-12`),
    ),
    (snap) => {
      const result: Record<string, MonthStats> = {};
      for (const docSnap of snap.docs) {
        result[docSnap.id] = normalizeStats(docSnap.data());
      }
      cb(result);
    },
  );

export const getCreatedCount = async (
  uid: string,
  monthId: string,
): Promise<number> => {
  const { start, end } = monthRangeMs(monthId);
  const snap = await getDocs(
    query(
      tasksCol(uid),
      where("createdAt", ">=", start),
      where("createdAt", "<=", end),
    ),
  );
  return snap.size;
};

export const backfillStats = async (uid: string): Promise<void> => {
  const [doneSnap, existingSnap] = await Promise.all([
    getDocs(
      query(
        tasksCol(uid),
        where("status", "==", "done"),
        orderBy("completedAt"),
      ),
    ),
    getDocs(statsCol(uid)),
  ]);
  const months: Record<
    string,
    { tasksCompleted: number; perDay: Record<string, number> }
  > = {};
  for (const docSnap of doneSnap.docs) {
    const completedAt = docSnap.get("completedAt");
    if (typeof completedAt !== "number") continue;
    const isoDate = isoDateKeyOf(completedAt);
    const monthId = monthIdOfKey(isoDate);
    const bucket = months[monthId] ?? { tasksCompleted: 0, perDay: {} };
    bucket.tasksCompleted += 1;
    bucket.perDay[isoDate] = (bucket.perDay[isoDate] ?? 0) + 1;
    months[monthId] = bucket;
  }
  const now = Date.now();
  const batch = writeBatch(db);
  for (const [monthId, data] of Object.entries(months)) {
    batch.set(statsRef(uid, monthId), {
      tasksCompleted: data.tasksCompleted,
      perDay: data.perDay,
      updatedAt: now,
    });
  }
  for (const docSnap of existingSnap.docs) {
    if (months[docSnap.id]) continue;
    batch.set(statsRef(uid, docSnap.id), {
      tasksCompleted: 0,
      perDay: {},
      updatedAt: now,
    });
  }
  await batch.commit();
};
