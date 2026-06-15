import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.ts";
import { notifyInfo } from "../notify.ts";
import { ORDER_SPACING } from "../ordering.ts";
import { normalizeRoutine } from "../repos/routinesRepo.ts";
import type { Routine } from "../repos/routinesRepo.ts";
import { reportWriteError } from "../repos/writeError.ts";
import { addWeeks, currentWeekId } from "../time.ts";

const THROTTLE_MS = 60 * 60 * 1000;
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];

const numberOrZero = (value: unknown): number =>
  typeof value === "number" ? value : 0;

const fetchActiveRoutines = async (uid: string): Promise<Routine[]> => {
  const snap = await getDocs(
    query(collection(db, "users", uid, "routines"), orderBy("createdAt")),
  );
  return snap.docs
    .map((docSnap) => normalizeRoutine(docSnap.id, docSnap.data()))
    .filter((routine) => routine.active && routine.title.trim().length > 0);
};

const readRunIds = async (
  uid: string,
  weekId: string,
): Promise<Set<string>> => {
  const runSnap = await getDoc(doc(db, "users", uid, "routineRuns", weekId));
  const ids = runSnap.get("routineIds");
  if (!Array.isArray(ids)) return new Set();
  return new Set(ids.filter((id): id is string => typeof id === "string"));
};

const dayMinOrders = async (
  uid: string,
  weekId: string,
): Promise<Record<number, number>> => {
  const snap = await getDocs(
    query(
      collection(db, "users", uid, "tasks"),
      where("bucket", "==", "day"),
      where("weekId", "==", weekId),
    ),
  );
  const mins: Record<number, number> = {};
  for (const docSnap of snap.docs) {
    const day = docSnap.get("day");
    if (typeof day !== "number") continue;
    const order = numberOrZero(docSnap.get("order"));
    const current = mins[day];
    if (current === undefined || order < current) mins[day] = order;
  }
  return mins;
};

const daysFor = (routine: Routine): number[] =>
  routine.freq === "daily" ? ALL_DAYS : routine.days;

const materializeWeek = async (
  uid: string,
  weekId: string,
  routines: Routine[],
): Promise<number> => {
  const done = await readRunIds(uid, weekId);
  const pending = routines.filter((routine) => !done.has(routine.id));
  if (pending.length === 0) return 0;

  const mins = await dayMinOrders(uid, weekId);

  const perDay: Record<number, Routine[]> = {};
  for (const routine of pending) {
    for (const day of daysFor(routine)) {
      const bucket = perDay[day] ?? [];
      bucket.push(routine);
      perDay[day] = bucket;
    }
  }

  const tasksCol = collection(db, "users", uid, "tasks");
  const now = Date.now();
  const batch = writeBatch(db);
  let created = 0;

  for (const [dayKey, dayRoutines] of Object.entries(perDay)) {
    const day = Number(dayKey);
    const base = mins[day] ?? 0;
    const count = dayRoutines.length;
    dayRoutines.forEach((routine, index) => {
      batch.set(doc(tasksCol), {
        title: routine.title,
        status: "open",
        bucket: "day",
        weekId,
        day,
        listId: null,
        order: base - (count - index) * ORDER_SPACING,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        carriedFrom: null,
        tagIds: [],
        subtaskCount: 0,
        subtaskDone: 0,
        time: routine.time,
        remindOffsetMin: routine.time === null ? null : routine.remindOffsetMin,
        routineId: routine.id,
      });
      created += 1;
    });
  }

  batch.set(
    doc(db, "users", uid, "routineRuns", weekId),
    {
      routineIds: arrayUnion(...pending.map((routine) => routine.id)),
      updatedAt: now,
    },
    { merge: true },
  );

  void batch.commit().catch(reportWriteError);
  return created;
};

export const materializeRoutines = async (uid: string): Promise<number> => {
  const routines = await fetchActiveRoutines(uid);
  if (routines.length === 0) return 0;
  const cur = currentWeekId();
  let created = 0;
  for (const weekId of [cur, addWeeks(cur, 1)]) {
    created += await materializeWeek(uid, weekId, routines);
  }
  return created;
};

let lastRun = 0;
let lastRunUid: string | null = null;
let running = false;
let rerunRequested = false;

const runMaterialization = (uid: string): void => {
  running = true;
  lastRunUid = uid;
  void materializeRoutines(uid)
    .then((created) => {
      lastRun = Date.now();
      if (created > 0) {
        notifyInfo("routines:generatedToast", { count: created });
      }
    })
    .catch((error: unknown) => {
      console.error(error);
    })
    .finally(() => {
      running = false;
      if (rerunRequested) {
        rerunRequested = false;
        lastRun = 0;
        runMaterialization(uid);
      }
    });
};

export const triggerRoutineMaterialization = (uid: string): void => {
  if (uid !== lastRunUid) lastRun = 0;
  if (running || Date.now() - lastRun < THROTTLE_MS) return;
  runMaterialization(uid);
};

export const requestRoutineMaterialization = (uid: string): void => {
  if (running) {
    rerunRequested = true;
    return;
  }
  lastRun = 0;
  runMaterialization(uid);
};
