import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import type { DocumentData, WriteBatch } from "firebase/firestore";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportWriteError } from "../repos/writeError.ts";
import { EXPORT_SCHEMA } from "./exportData.ts";
import type {
  ExportEntity,
  ExportPayload,
  TaskSubtasks,
} from "./exportData.ts";

const BATCH_LIMIT = 450;
const NOTE_SEPARATOR = "\n···\n";
const MAX_DECORATIONS = 120;

const TASK_KEYS = [
  "title",
  "emoji",
  "status",
  "bucket",
  "weekId",
  "day",
  "listId",
  "order",
  "createdAt",
  "updatedAt",
  "completedAt",
  "carriedFrom",
  "tagIds",
  "subtaskCount",
  "subtaskDone",
  "time",
  "remindOffsetMin",
  "routineId",
  "attachmentCount",
] as const;
const SUBTASK_KEYS = ["title", "done", "order", "createdAt"] as const;
const LIST_KEYS = [
  "kind",
  "name",
  "emoji",
  "order",
  "createdAt",
  "day",
  "attachmentCount",
] as const;
const TRACKER_KEYS = [
  "name",
  "type",
  "icon",
  "order",
  "enabled",
  "createdAt",
] as const;
const HABIT_KEYS = [
  "name",
  "icon",
  "order",
  "archived",
  "createdAt",
  "days",
] as const;
const TAG_KEYS = ["name", "color", "order", "createdAt"] as const;
const ROUTINE_KEYS = [
  "title",
  "freq",
  "days",
  "time",
  "remindOffsetMin",
  "active",
  "createdAt",
] as const;
const STATS_KEYS = ["tasksCompleted", "perDay", "updatedAt"] as const;
const ATTACHMENT_KEYS = [
  "targetType",
  "taskId",
  "listId",
  "weekId",
  "day",
  "kind",
  "order",
  "createdAt",
  "storagePath",
  "url",
  "name",
  "mime",
  "size",
  "thumbPath",
  "thumbUrl",
  "width",
  "height",
  "durationMs",
  "href",
  "title",
  "previewImage",
] as const;
const PROFILE_KEYS = [
  "themeId",
  "autoTheme",
  "paperTextureEnabled",
  "moduleToggles",
  "weekend",
  "columnMode",
  "taskDoneStyle",
  "taskStrikeStyle",
  "fontBodyId",
  "fontHandId",
  "fontScope",
  "notebookName",
  "coverStyle",
] as const;

export type ImportErrorCode = "invalidFile" | "wrongVersion" | "writeFailed";

export interface ImportCounts {
  tasks: number;
  subtasks: number;
  lists: number;
  weeks: number;
  trackers: number;
  habits: number;
  tags: number;
  routines: number;
  stats: number;
  attachments: number;
}

export type EnvelopeResult =
  | { ok: true; payload: ExportPayload; counts: ImportCounts }
  | { ok: false; code: "invalidFile" | "wrongVersion" };

export type ImportResult =
  | { ok: true; counts: ImportCounts }
  | { ok: false; code: ImportErrorCode };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asNum = (value: unknown): number =>
  typeof value === "number" ? value : 0;

const asStr = (value: unknown): string =>
  typeof value === "string" ? value : "";

const asRecord = (value: unknown): Record<string, unknown> =>
  isObject(value) ? value : {};

const asEntityArray = (value: unknown): ExportEntity[] => {
  if (!Array.isArray(value)) return [];
  const out: ExportEntity[] = [];
  for (const item of value) {
    if (isObject(item) && typeof item.id === "string" && isObject(item.data)) {
      out.push({ id: item.id, data: item.data });
    }
  }
  return out;
};

const asSubtasks = (value: unknown): TaskSubtasks[] => {
  if (!Array.isArray(value)) return [];
  const out: TaskSubtasks[] = [];
  for (const item of value) {
    if (isObject(item) && typeof item.taskId === "string") {
      out.push({ taskId: item.taskId, items: asEntityArray(item.items) });
    }
  }
  return out;
};

const countSubtasks = (groups: TaskSubtasks[]): number =>
  groups.reduce((total, group) => total + group.items.length, 0);

export const readEnvelope = (text: string): EnvelopeResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, code: "invalidFile" };
  }
  if (!isObject(parsed)) return { ok: false, code: "invalidFile" };
  if (parsed.schema !== EXPORT_SCHEMA)
    return { ok: false, code: "wrongVersion" };
  if (!isObject(parsed.data)) return { ok: false, code: "invalidFile" };

  const data = parsed.data;
  const payload: ExportPayload = {
    profile: isObject(data.profile) ? data.profile : null,
    tasks: asEntityArray(data.tasks),
    subtasks: asSubtasks(data.subtasks),
    lists: asEntityArray(data.lists),
    weeks: asEntityArray(data.weeks),
    trackers: asEntityArray(data.trackers),
    habits: asEntityArray(data.habits),
    tags: asEntityArray(data.tags),
    routines: asEntityArray(data.routines),
    stats: asEntityArray(data.stats),
    attachments: asEntityArray(data.attachments),
  };

  const counts: ImportCounts = {
    tasks: payload.tasks.length,
    subtasks: countSubtasks(payload.subtasks),
    lists: payload.lists.length,
    weeks: payload.weeks.length,
    trackers: payload.trackers.length,
    habits: payload.habits.length,
    tags: payload.tags.length,
    routines: payload.routines.length,
    stats: payload.stats.length,
    attachments: payload.attachments.length,
  };

  return { ok: true, payload, counts };
};

const pick = (data: DocumentData, keys: readonly string[]): DocumentData => {
  const out: DocumentData = {};
  for (const key of keys) {
    if (key in data) out[key] = data[key];
  }
  return out;
};

const mergeNote = (target: string, source: string): string => {
  if (source.length === 0) return target;
  if (target.length === 0) return source;
  if (target.includes(source)) return target;
  return `${target}${NOTE_SEPARATOR}${source}`;
};

const mergeDayNotes = (
  target: unknown,
  source: unknown,
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(asRecord(target))) {
    out[key] = asStr(value);
  }
  for (const [key, value] of Object.entries(asRecord(source))) {
    out[key] = mergeNote(out[key] ?? "", asStr(value));
  }
  return out;
};

const mergeNestedMap = (
  target: unknown,
  source: unknown,
): Record<string, Record<string, unknown>> => {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [outerKey, inner] of Object.entries(asRecord(target))) {
    out[outerKey] = { ...asRecord(inner) };
  }
  for (const [outerKey, inner] of Object.entries(asRecord(source))) {
    const merged = { ...(out[outerKey] ?? {}) };
    for (const [innerKey, value] of Object.entries(asRecord(inner))) {
      if (!(innerKey in merged)) merged[innerKey] = value;
    }
    out[outerKey] = merged;
  }
  return out;
};

const asDaysOff = (value: unknown): number[] | null =>
  Array.isArray(value) && value.every((item) => typeof item === "number")
    ? value
    : null;

const mergeDecorations = (target: unknown, source: unknown): unknown[] => {
  const out: unknown[] = [];
  const seen = new Set<string>();
  const all = [
    ...(Array.isArray(target) ? target : []),
    ...(Array.isArray(source) ? source : []),
  ];
  for (const item of all) {
    const id = isObject(item) && typeof item.id === "string" ? item.id : null;
    if (id === null || seen.has(id)) continue;
    if (out.length >= MAX_DECORATIONS) break;
    seen.add(id);
    out.push(item);
  }
  return out;
};

const mergeWeekData = (
  existing: DocumentData | null,
  source: DocumentData,
): DocumentData => {
  const base = existing ?? {};
  return {
    note: mergeNote(asStr(base.note), asStr(source.note)),
    dayNotes: mergeDayNotes(base.dayNotes, source.dayNotes),
    daysOff: asDaysOff(base.daysOff) ?? asDaysOff(source.daysOff),
    trackerValues: mergeNestedMap(base.trackerValues, source.trackerValues),
    habitChecks: mergeNestedMap(base.habitChecks, source.habitChecks),
    decorations: mergeDecorations(base.decorations, source.decorations),
    updatedAt: Math.max(asNum(base.updatedAt), asNum(source.updatedAt)),
  };
};

type Op = (batch: WriteBatch) => void;

const commitChunk = async (chunk: Op[]): Promise<void> => {
  const batch = writeBatch(db);
  for (const op of chunk) op(batch);
  notePendingWrite();
  if (navigator.onLine) {
    await batch.commit();
  } else {
    void batch.commit().catch(reportWriteError);
  }
};

const readExistingWeek = async (
  ref: ReturnType<typeof doc>,
): Promise<DocumentData | null> => {
  try {
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
};

const writeWeek = async (uid: string, entry: ExportEntity): Promise<void> => {
  const ref = doc(db, "users", uid, "weeks", entry.id);
  const existing = await readExistingWeek(ref);
  const merged = mergeWeekData(existing, entry.data);
  notePendingWrite();
  if (navigator.onLine) {
    await setDoc(ref, merged);
  } else {
    void setDoc(ref, merged).catch(reportWriteError);
  }
};

export const runImport = async (
  uid: string,
  payload: ExportPayload,
  onProgress: (done: number, total: number) => void,
): Promise<ImportResult> => {
  try {
    const setOp =
      (collectionName: string, id: string, data: DocumentData): Op =>
      (batch) =>
        batch.set(doc(db, "users", uid, collectionName, id), data);

    const ops: Op[] = [];
    for (const entry of payload.tasks) {
      ops.push(setOp("tasks", entry.id, pick(entry.data, TASK_KEYS)));
    }
    for (const entry of payload.lists) {
      ops.push(setOp("lists", entry.id, pick(entry.data, LIST_KEYS)));
    }
    for (const entry of payload.trackers) {
      ops.push(setOp("trackers", entry.id, pick(entry.data, TRACKER_KEYS)));
    }
    for (const entry of payload.habits) {
      ops.push(setOp("habits", entry.id, pick(entry.data, HABIT_KEYS)));
    }
    for (const entry of payload.tags) {
      ops.push(setOp("tags", entry.id, pick(entry.data, TAG_KEYS)));
    }
    for (const entry of payload.routines) {
      ops.push(setOp("routines", entry.id, pick(entry.data, ROUTINE_KEYS)));
    }
    for (const entry of payload.stats) {
      ops.push(setOp("stats", entry.id, pick(entry.data, STATS_KEYS)));
    }
    for (const entry of payload.attachments) {
      ops.push(
        setOp("attachments", entry.id, pick(entry.data, ATTACHMENT_KEYS)),
      );
    }
    for (const group of payload.subtasks) {
      for (const item of group.items) {
        ops.push((batch) =>
          batch.set(
            doc(db, "users", uid, "tasks", group.taskId, "items", item.id),
            pick(item.data, SUBTASK_KEYS),
          ),
        );
      }
    }
    if (payload.profile) {
      const profileData = pick(payload.profile, PROFILE_KEYS);
      ops.push((batch) =>
        batch.set(doc(db, "users", uid), profileData, { merge: true }),
      );
    }

    const total = ops.length + payload.weeks.length;
    let done = 0;
    onProgress(0, total);

    for (let start = 0; start < ops.length; start += BATCH_LIMIT) {
      const chunk = ops.slice(start, start + BATCH_LIMIT);
      await commitChunk(chunk);
      done += chunk.length;
      onProgress(done, total);
    }

    for (const entry of payload.weeks) {
      await writeWeek(uid, entry);
      done += 1;
      onProgress(done, total);
    }

    const counts: ImportCounts = {
      tasks: payload.tasks.length,
      subtasks: countSubtasks(payload.subtasks),
      lists: payload.lists.length,
      weeks: payload.weeks.length,
      trackers: payload.trackers.length,
      habits: payload.habits.length,
      tags: payload.tags.length,
      routines: payload.routines.length,
      stats: payload.stats.length,
      attachments: payload.attachments.length,
    };
    return { ok: true, counts };
  } catch (error) {
    console.error(error);
    return { ok: false, code: "writeFailed" };
  }
};
