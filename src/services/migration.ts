import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData, WriteBatch } from "firebase/firestore";
import { DEFAULT_TRACKER_COLOR } from "../data/trackerColors.ts";
import { db } from "./firebase.ts";
import { notePendingWrite } from "./syncSignal.ts";

const MIGRATION_PREFIX = "m_";
const NOTE_SEPARATOR = "\n···\n";
const BATCH_LIMIT = 450;
const BUILTIN_LISTS = ["tasks", "ideas"];
const DEFAULT_TRACKERS = ["mood", "energy"];
const DEFAULT_HABIT_DAYS = [1, 2, 3, 4, 5, 6, 7];

const isBuiltinList = (id: string): boolean => BUILTIN_LISTS.includes(id);
const isDefaultTracker = (id: string): boolean => DEFAULT_TRACKERS.includes(id);
const migratedId = (anonUid: string, oldId: string): string =>
  `${MIGRATION_PREFIX}${anonUid}_${oldId}`;

const asString = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback;
const asStringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;
const asNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" ? value : fallback;
const asNumberOrNull = (value: unknown): number | null =>
  typeof value === "number" ? value : null;
const asBool = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;
const asNumberArrayOrNull = (value: unknown): number[] | null =>
  Array.isArray(value) && value.every((item) => typeof item === "number")
    ? value
    : null;
const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
const asCount = (value: unknown): number =>
  typeof value === "number" && value > 0 ? value : 0;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const asTimeOrNull = (value: unknown): string | null =>
  typeof value === "string" && TIME_PATTERN.test(value) ? value : null;
const asOffsetOrNull = (value: unknown): number | null =>
  typeof value === "number" && value >= 0 ? value : null;

const asObject = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const asStringRecord = (value: unknown): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(asObject(value))) {
    if (typeof item === "string") result[key] = item;
  }
  return result;
};

const asNumberRecord = (value: unknown): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const [key, item] of Object.entries(asObject(value))) {
    if (typeof item === "number") result[key] = item;
  }
  return result;
};

type TaskStatus = "open" | "done";
type TaskBucket = "day" | "list";
type TrackerType = "scale5" | "emoji" | "number" | "checkbox";
type TrackerValue = number | string | boolean;

interface TaskData {
  title: string;
  emoji: string | null;
  status: TaskStatus;
  bucket: TaskBucket;
  weekId: string | null;
  day: number | null;
  listId: string | null;
  order: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  carriedFrom: string | null;
  tagIds: string[];
  subtaskCount: number;
  subtaskDone: number;
  time: string | null;
  remindOffsetMin: number | null;
}

interface SubtaskData {
  title: string;
  done: boolean;
  order: number;
  createdAt: number;
}

interface TagData {
  name: string;
  color: string;
  order: number;
  createdAt: number;
}

interface ListData {
  kind: "tasks" | "ideas" | "custom";
  name: string | null;
  emoji: string | null;
  order: number;
  createdAt: number;
  day: number | null;
}

interface TrackerData {
  name: string;
  type: TrackerType;
  icon: string;
  order: number;
  enabled: boolean;
  createdAt: number;
}

interface HabitData {
  name: string;
  icon: string | null;
  color: string;
  order: number;
  archived: boolean;
  createdAt: number;
  days: number[];
}

interface DecorationData {
  id: string;
  kind: string;
  asset: string;
  target: "week" | number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  animation: string;
}

interface WeekData {
  note: string;
  dayNotes: Record<string, string>;
  daysOff: number[] | null;
  trackerValues: Record<string, Record<string, TrackerValue>>;
  habitChecks: Record<string, Record<string, true>>;
  decorations: DecorationData[];
}

interface StatsData {
  tasksCompleted: number;
  perDay: Record<string, number>;
}

interface Entity<T> {
  id: string;
  data: T;
}

interface TaskSubtasks {
  taskId: string;
  items: Entity<SubtaskData>[];
}

export interface ExportedData {
  anonUid: string;
  tasks: Entity<TaskData>[];
  lists: Entity<ListData>[];
  weeks: Entity<WeekData>[];
  trackers: Entity<TrackerData>[];
  habits: Entity<HabitData>[];
  stats: Entity<StatsData>[];
  tags: Entity<TagData>[];
  subtasks: TaskSubtasks[];
}

export interface ExportCounts {
  tasks: number;
  lists: number;
  weeks: number;
  trackers: number;
  habits: number;
}

const toTaskData = (data: DocumentData): TaskData => ({
  title: asString(data.title, ""),
  emoji: asStringOrNull(data.emoji),
  status: data.status === "done" ? "done" : "open",
  bucket: data.bucket === "list" ? "list" : "day",
  weekId: asStringOrNull(data.weekId),
  day: asNumberOrNull(data.day),
  listId: asStringOrNull(data.listId),
  order: asNumber(data.order, 0),
  createdAt: asNumber(data.createdAt, 0),
  updatedAt: asNumber(data.updatedAt, 0),
  completedAt: asNumberOrNull(data.completedAt),
  carriedFrom: asStringOrNull(data.carriedFrom),
  tagIds: asStringArray(data.tagIds),
  subtaskCount: asCount(data.subtaskCount),
  subtaskDone: asCount(data.subtaskDone),
  time: asTimeOrNull(data.time),
  remindOffsetMin: asOffsetOrNull(data.remindOffsetMin),
});

const toSubtaskData = (data: DocumentData): SubtaskData => ({
  title: asString(data.title, ""),
  done: data.done === true,
  order: asNumber(data.order, 0),
  createdAt: asNumber(data.createdAt, 0),
});

const toTagData = (data: DocumentData): TagData => ({
  name: asString(data.name, ""),
  color: asString(data.color, "rose"),
  order: asNumber(data.order, 0),
  createdAt: asNumber(data.createdAt, 0),
});

const toListData = (data: DocumentData): ListData => ({
  kind: data.kind === "tasks" || data.kind === "ideas" ? data.kind : "custom",
  name: asStringOrNull(data.name),
  emoji: asStringOrNull(data.emoji),
  order: asNumber(data.order, 0),
  createdAt: asNumber(data.createdAt, 0),
  day: asNumberOrNull(data.day),
});

const toTrackerType = (value: unknown): TrackerType =>
  value === "scale5" ||
  value === "emoji" ||
  value === "number" ||
  value === "checkbox"
    ? value
    : "scale5";

const toTrackerData = (data: DocumentData): TrackerData => ({
  name: asString(data.name, ""),
  type: toTrackerType(data.type),
  icon: asString(data.icon, ""),
  order: asNumber(data.order, 0),
  enabled: asBool(data.enabled, true),
  createdAt: asNumber(data.createdAt, 0),
});

const toHabitData = (data: DocumentData): HabitData => ({
  name: asString(data.name, ""),
  icon: asStringOrNull(data.icon),
  color: asString(data.color, DEFAULT_TRACKER_COLOR),
  order: asNumber(data.order, 0),
  archived: asBool(data.archived, false),
  createdAt: asNumber(data.createdAt, 0),
  days: asNumberArrayOrNull(data.days) ?? DEFAULT_HABIT_DAYS,
});

const toTrackerValues = (
  value: unknown,
): Record<string, Record<string, TrackerValue>> => {
  const result: Record<string, Record<string, TrackerValue>> = {};
  for (const [day, byTracker] of Object.entries(asObject(value))) {
    const dayMap: Record<string, TrackerValue> = {};
    for (const [trackerId, raw] of Object.entries(asObject(byTracker))) {
      if (
        typeof raw === "number" ||
        typeof raw === "string" ||
        typeof raw === "boolean"
      ) {
        dayMap[trackerId] = raw;
      }
    }
    result[day] = dayMap;
  }
  return result;
};

const toHabitChecks = (
  value: unknown,
): Record<string, Record<string, true>> => {
  const result: Record<string, Record<string, true>> = {};
  for (const [habitId, byDay] of Object.entries(asObject(value))) {
    const dayMap: Record<string, true> = {};
    for (const [day, raw] of Object.entries(asObject(byDay))) {
      if (raw === true) dayMap[day] = true;
    }
    result[habitId] = dayMap;
  }
  return result;
};

const DECORATION_KINDS = new Set(["sticker", "washi", "doodle"]);
const MAX_DECORATIONS = 120;

const toDecorations = (value: unknown): DecorationData[] => {
  if (!Array.isArray(value)) return [];
  const result: DecorationData[] = [];
  for (const item of value) {
    const d = asObject(item);
    if (typeof d.id !== "string") continue;
    if (typeof d.kind !== "string" || !DECORATION_KINDS.has(d.kind)) continue;
    if (typeof d.asset !== "string") continue;
    const target =
      d.target === "week"
        ? "week"
        : typeof d.target === "number" && d.target >= 1 && d.target <= 7
          ? d.target
          : null;
    if (target === null) continue;
    if (
      typeof d.x !== "number" ||
      typeof d.y !== "number" ||
      typeof d.rotation !== "number" ||
      typeof d.scale !== "number"
    ) {
      continue;
    }
    result.push({
      id: d.id,
      kind: d.kind,
      asset: d.asset,
      target,
      x: d.x,
      y: d.y,
      rotation: d.rotation,
      scale: d.scale,
      animation: typeof d.animation === "string" ? d.animation : "none",
    });
  }
  return result;
};

const toWeekData = (data: DocumentData): WeekData => ({
  note: asString(data.note, ""),
  dayNotes: asStringRecord(data.dayNotes),
  daysOff: asNumberArrayOrNull(data.daysOff),
  trackerValues: toTrackerValues(data.trackerValues),
  habitChecks: toHabitChecks(data.habitChecks),
  decorations: toDecorations(data.decorations),
});

const toStatsData = (data: DocumentData): StatsData => ({
  tasksCompleted: asNumber(data.tasksCompleted, 0),
  perDay: asNumberRecord(data.perDay),
});

const userCol = (uid: string, name: string) =>
  collection(db, "users", uid, name);

export const exportAnonData = async (uid: string): Promise<ExportedData> => {
  const [tasks, lists, weeks, trackers, habits, stats, tags] =
    await Promise.all([
      getDocs(userCol(uid, "tasks")),
      getDocs(userCol(uid, "lists")),
      getDocs(userCol(uid, "weeks")),
      getDocs(userCol(uid, "trackers")),
      getDocs(userCol(uid, "habits")),
      getDocs(userCol(uid, "stats")),
      getDocs(userCol(uid, "tags")),
    ]);
  const subtasks = await Promise.all(
    tasks.docs.map(async (taskDoc) => {
      const items = await getDocs(
        collection(db, "users", uid, "tasks", taskDoc.id, "items"),
      );
      return {
        taskId: taskDoc.id,
        items: items.docs.map((d) => ({
          id: d.id,
          data: toSubtaskData(d.data()),
        })),
      };
    }),
  );
  const exported: ExportedData = {
    anonUid: uid,
    tasks: tasks.docs.map((d) => ({ id: d.id, data: toTaskData(d.data()) })),
    lists: lists.docs.map((d) => ({ id: d.id, data: toListData(d.data()) })),
    weeks: weeks.docs.map((d) => ({ id: d.id, data: toWeekData(d.data()) })),
    trackers: trackers.docs.map((d) => ({
      id: d.id,
      data: toTrackerData(d.data()),
    })),
    habits: habits.docs.map((d) => ({ id: d.id, data: toHabitData(d.data()) })),
    stats: stats.docs.map((d) => ({ id: d.id, data: toStatsData(d.data()) })),
    tags: tags.docs.map((d) => ({ id: d.id, data: toTagData(d.data()) })),
    subtasks: subtasks.filter((entry) => entry.items.length > 0),
  };
  console.info("[merge] exported anon data", {
    tasks: exported.tasks.length,
    lists: exported.lists.length,
    weeks: exported.weeks.length,
    trackers: exported.trackers.length,
    habits: exported.habits.length,
    stats: exported.stats.length,
    tags: exported.tags.length,
  });
  return exported;
};

export const countsOf = (data: ExportedData): ExportCounts => ({
  tasks: data.tasks.length,
  lists: data.lists.filter((entry) => !isBuiltinList(entry.id)).length,
  weeks: data.weeks.length,
  trackers: data.trackers.filter((entry) => !isDefaultTracker(entry.id)).length,
  habits: data.habits.length,
});

export const hasMeaningfulData = (data: ExportedData): boolean =>
  data.tasks.length > 0 ||
  data.weeks.length > 0 ||
  data.habits.length > 0 ||
  data.stats.length > 0 ||
  data.lists.some((entry) => !isBuiltinList(entry.id)) ||
  data.trackers.some((entry) => !isDefaultTracker(entry.id));

const mergeNote = (target: string, anon: string): string => {
  if (anon.length === 0) return target;
  if (target.length === 0) return anon;
  if (target.includes(anon)) return target;
  return `${target}${NOTE_SEPARATOR}${anon}`;
};

const mergeWeek = (
  target: WeekData | null,
  anon: WeekData,
  trackerIdMap: Record<string, string>,
  habitIdMap: Record<string, string>,
): WeekData => {
  const base: WeekData = target ?? {
    note: "",
    dayNotes: {},
    daysOff: null,
    trackerValues: {},
    habitChecks: {},
    decorations: [],
  };

  const dayNotes: Record<string, string> = { ...base.dayNotes };
  for (const [day, note] of Object.entries(anon.dayNotes)) {
    dayNotes[day] = mergeNote(dayNotes[day] ?? "", note);
  }

  const trackerValues: Record<string, Record<string, TrackerValue>> = {};
  for (const [day, byTracker] of Object.entries(base.trackerValues)) {
    trackerValues[day] = { ...byTracker };
  }
  for (const [day, byTracker] of Object.entries(anon.trackerValues)) {
    const dayMap = { ...(trackerValues[day] ?? {}) };
    for (const [trackerId, value] of Object.entries(byTracker)) {
      const mapped = trackerIdMap[trackerId] ?? trackerId;
      if (!(mapped in dayMap)) dayMap[mapped] = value;
    }
    trackerValues[day] = dayMap;
  }

  const habitChecks: Record<string, Record<string, true>> = {};
  for (const [habitId, byDay] of Object.entries(base.habitChecks)) {
    habitChecks[habitId] = { ...byDay };
  }
  for (const [habitId, byDay] of Object.entries(anon.habitChecks)) {
    const mapped = habitIdMap[habitId] ?? habitId;
    const dayMap = { ...(habitChecks[mapped] ?? {}) };
    for (const day of Object.keys(byDay)) dayMap[day] = true;
    habitChecks[mapped] = dayMap;
  }

  const decorations: DecorationData[] = [];
  const seenDecorations = new Set<string>();
  for (const decoration of [...base.decorations, ...anon.decorations]) {
    if (seenDecorations.has(decoration.id)) continue;
    if (decorations.length >= MAX_DECORATIONS) break;
    seenDecorations.add(decoration.id);
    decorations.push(decoration);
  }

  return {
    note: mergeNote(base.note, anon.note),
    dayNotes,
    daysOff: base.daysOff ?? anon.daysOff,
    trackerValues,
    habitChecks,
    decorations,
  };
};

const migrationRef = (targetUid: string, anonUid: string) =>
  doc(db, "users", targetUid, "migrations", anonUid);

const commitChunks = async (
  ops: ((batch: WriteBatch) => void)[],
  onCommitted: (count: number) => void,
): Promise<void> => {
  let committed = 0;
  for (let start = 0; start < ops.length; start += BATCH_LIMIT) {
    const chunk = ops.slice(start, start + BATCH_LIMIT);
    const batch = writeBatch(db);
    for (const op of chunk) op(batch);
    notePendingWrite();
    await batch.commit();
    committed += chunk.length;
    onCommitted(committed);
  }
};

export const runMerge = async (
  exported: ExportedData,
  targetUid: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> => {
  const { anonUid } = exported;

  const markerSnap = await getDoc(migrationRef(targetUid, anonUid));
  if (markerSnap.exists() && markerSnap.data().status === "done") {
    onProgress?.(1, 1);
    return;
  }

  const listIdMap: Record<string, string> = {};
  for (const entry of exported.lists) {
    listIdMap[entry.id] = isBuiltinList(entry.id)
      ? entry.id
      : migratedId(anonUid, entry.id);
  }
  const trackerIdMap: Record<string, string> = {};
  for (const entry of exported.trackers) {
    trackerIdMap[entry.id] = isDefaultTracker(entry.id)
      ? entry.id
      : migratedId(anonUid, entry.id);
  }
  const habitIdMap: Record<string, string> = {};
  for (const entry of exported.habits) {
    habitIdMap[entry.id] = migratedId(anonUid, entry.id);
  }
  const tagIdMap: Record<string, string> = {};
  for (const entry of exported.tags) {
    tagIdMap[entry.id] = migratedId(anonUid, entry.id);
  }

  const counts = countsOf(exported);
  notePendingWrite();
  await setDoc(migrationRef(targetUid, anonUid), {
    status: "pending",
    startedAt: Date.now(),
    counts,
  });

  const customLists = exported.lists.filter(
    (entry) => !isBuiltinList(entry.id),
  );
  const customTrackers = exported.trackers.filter(
    (entry) => !isDefaultTracker(entry.id),
  );

  const ops: ((batch: WriteBatch) => void)[] = [];

  for (const entry of customLists) {
    const ref = doc(
      db,
      "users",
      targetUid,
      "lists",
      listIdMap[entry.id] ?? entry.id,
    );
    const data = entry.data;
    ops.push((batch) =>
      batch.set(ref, {
        kind: data.kind,
        name: data.name,
        emoji: data.emoji,
        order: data.order,
        createdAt: data.createdAt,
        day: data.day,
      }),
    );
  }

  for (const entry of customTrackers) {
    const ref = doc(
      db,
      "users",
      targetUid,
      "trackers",
      trackerIdMap[entry.id] ?? entry.id,
    );
    const data = entry.data;
    ops.push((batch) =>
      batch.set(ref, {
        name: data.name,
        type: data.type,
        icon: data.icon,
        order: data.order,
        enabled: data.enabled,
        createdAt: data.createdAt,
      }),
    );
  }

  for (const entry of exported.habits) {
    const ref = doc(
      db,
      "users",
      targetUid,
      "habits",
      habitIdMap[entry.id] ?? entry.id,
    );
    const data = entry.data;
    ops.push((batch) =>
      batch.set(ref, {
        name: data.name,
        icon: data.icon,
        color: data.color,
        order: data.order,
        archived: data.archived,
        createdAt: data.createdAt,
        days: data.days,
      }),
    );
  }

  for (const entry of exported.tags) {
    const ref = doc(
      db,
      "users",
      targetUid,
      "tags",
      tagIdMap[entry.id] ?? entry.id,
    );
    const data = entry.data;
    ops.push((batch) =>
      batch.set(ref, {
        name: data.name,
        color: data.color,
        order: data.order,
        createdAt: data.createdAt,
      }),
    );
  }

  for (const entry of exported.tasks) {
    const ref = doc(
      db,
      "users",
      targetUid,
      "tasks",
      migratedId(anonUid, entry.id),
    );
    const data = entry.data;
    const listId =
      data.bucket === "list" &&
      data.listId !== null &&
      !isBuiltinList(data.listId)
        ? (listIdMap[data.listId] ?? data.listId)
        : data.listId;
    const tagIds = data.tagIds.map((id) => tagIdMap[id] ?? id);
    ops.push((batch) =>
      batch.set(ref, {
        title: data.title,
        emoji: data.emoji,
        status: data.status,
        bucket: data.bucket,
        weekId: data.weekId,
        day: data.day,
        listId,
        order: data.order,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        completedAt: data.completedAt,
        carriedFrom: data.carriedFrom,
        tagIds,
        subtaskCount: data.subtaskCount,
        subtaskDone: data.subtaskDone,
        time: data.bucket === "day" ? data.time : null,
        remindOffsetMin: data.bucket === "day" ? data.remindOffsetMin : null,
      }),
    );
  }

  for (const entry of exported.subtasks) {
    const taskId = migratedId(anonUid, entry.taskId);
    for (const item of entry.items) {
      const ref = doc(
        db,
        "users",
        targetUid,
        "tasks",
        taskId,
        "items",
        item.id,
      );
      const data = item.data;
      ops.push((batch) =>
        batch.set(ref, {
          title: data.title,
          done: data.done,
          order: data.order,
          createdAt: data.createdAt,
        }),
      );
    }
  }

  const total = ops.length + exported.weeks.length + exported.stats.length;
  onProgress?.(0, total);
  await commitChunks(ops, (done) => onProgress?.(done, total));

  let weeksDone = ops.length;
  for (const entry of exported.weeks) {
    const ref = doc(db, "users", targetUid, "weeks", entry.id);
    notePendingWrite();
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const targetWeek = snap.exists() ? toWeekData(snap.data()) : null;
      const merged = mergeWeek(
        targetWeek,
        entry.data,
        trackerIdMap,
        habitIdMap,
      );
      tx.set(ref, {
        note: merged.note,
        dayNotes: merged.dayNotes,
        daysOff: merged.daysOff,
        trackerValues: merged.trackerValues,
        habitChecks: merged.habitChecks,
        decorations: merged.decorations,
        updatedAt: Date.now(),
      });
    });
    weeksDone += 1;
    onProgress?.(weeksDone, total);
  }

  const finalBatch = writeBatch(db);
  for (const entry of exported.stats) {
    const ref = doc(db, "users", targetUid, "stats", entry.id);
    const perDay: Record<string, ReturnType<typeof increment>> = {};
    for (const [date, value] of Object.entries(entry.data.perDay)) {
      perDay[date] = increment(value);
    }
    finalBatch.set(
      ref,
      {
        tasksCompleted: increment(entry.data.tasksCompleted),
        perDay,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  }
  finalBatch.set(
    migrationRef(targetUid, anonUid),
    { status: "done", finishedAt: Date.now() },
    { merge: true },
  );
  notePendingWrite();
  await finalBatch.commit();
  onProgress?.(total, total);
};

export const hasPendingMigration = async (uid: string): Promise<boolean> => {
  const snap = await getDocs(
    query(userCol(uid, "migrations"), where("status", "==", "pending")),
  );
  return !snap.empty;
};
