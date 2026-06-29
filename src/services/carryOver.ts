import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  writeBatch,
} from "firebase/firestore";
import type {
  DocumentData,
  DocumentReference,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "./firebase.ts";
import { notifyInfo } from "./notify.ts";
import { ORDER_SPACING } from "./ordering.ts";
import { reportWriteError } from "./repos/writeError.ts";
import { currentWeekId } from "./time.ts";

const TASKS_LIST_ID = "tasks";
const READ_PAGE = 300;
const WRITE_BATCH = 200;
const THROTTLE_MS = 60 * 60 * 1000;

interface Candidate {
  ref: DocumentReference;
  weekId: string;
  title: string;
  emoji: string | null;
  tagIds: string[];
  carryCount: number;
}

const numberOrZero = (value: unknown): number =>
  typeof value === "number" ? value : 0;

const stringOrEmpty = (value: unknown): string =>
  typeof value === "string" ? value : "";

const stringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const stringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export const runCarryOver = async (uid: string): Promise<number> => {
  const cur = currentWeekId();
  const tasksCol = collection(db, "users", uid, "tasks");

  const candidates: Candidate[] = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;
  for (;;) {
    const filtered: Query<DocumentData> = query(
      tasksCol,
      where("bucket", "==", "day"),
      where("status", "==", "open"),
      where("weekId", "<", cur),
      orderBy("weekId"),
      limit(READ_PAGE),
    );
    const pageQuery: Query<DocumentData> = cursor
      ? query(filtered, startAfter(cursor))
      : filtered;
    const snap: QuerySnapshot<DocumentData> = await getDocs(pageQuery);
    if (snap.empty) break;
    for (const docSnap of snap.docs) {
      if (docSnap.get("carriedOut") === true) continue;
      candidates.push({
        ref: docSnap.ref,
        weekId: stringOrEmpty(docSnap.get("weekId")),
        title: stringOrEmpty(docSnap.get("title")),
        emoji: stringOrNull(docSnap.get("emoji")),
        tagIds: stringArray(docSnap.get("tagIds")),
        carryCount: numberOrZero(docSnap.get("carryCount")),
      });
    }
    if (snap.size < READ_PAGE) break;
    cursor = snap.docs[snap.docs.length - 1] ?? null;
    if (!cursor) break;
  }

  if (candidates.length === 0) return 0;

  const topSnap = await getDocs(
    query(
      tasksCol,
      where("bucket", "==", "list"),
      where("listId", "==", TASKS_LIST_ID),
      orderBy("order"),
      limit(1),
    ),
  );
  let order = topSnap.empty ? 0 : numberOrZero(topSnap.docs[0]?.get("order"));

  const now = Date.now();
  for (let start = 0; start < candidates.length; start += WRITE_BATCH) {
    const chunk = candidates.slice(start, start + WRITE_BATCH);
    const batch = writeBatch(db);
    for (const candidate of chunk) {
      order -= ORDER_SPACING;
      const clone = doc(tasksCol, `${candidate.ref.id}__carry`);
      batch.set(clone, {
        title: candidate.title,
        emoji: candidate.emoji,
        status: "open",
        bucket: "list",
        weekId: null,
        day: null,
        listId: TASKS_LIST_ID,
        order,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        carriedFrom: candidate.weekId,
        carryCount: candidate.carryCount + 1,
        carriedOut: false,
        carrySourceId: candidate.ref.id,
        tagIds: candidate.tagIds,
        subtaskCount: 0,
        subtaskDone: 0,
        attachmentCount: 0,
        time: null,
        remindOffsetMin: null,
        routineId: null,
      });
      batch.update(candidate.ref, {
        carriedOut: true,
        updatedAt: now,
      });
    }
    void batch.commit().catch(reportWriteError);
  }

  return candidates.length;
};

let lastRun = 0;
let lastRunUid: string | null = null;
let running = false;

export const triggerCarryOver = (uid: string): void => {
  if (uid !== lastRunUid) lastRun = 0;
  if (running || Date.now() - lastRun < THROTTLE_MS) return;
  running = true;
  lastRunUid = uid;
  void runCarryOver(uid)
    .then((moved) => {
      lastRun = Date.now();
      if (moved > 0) notifyInfo("common:carriedToast", { count: moved });
    })
    .catch((error: unknown) => {
      console.error(error);
    })
    .finally(() => {
      running = false;
    });
};
