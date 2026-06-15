import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";

export type TaskStatus = "open" | "done";
export type TaskBucket = "day" | "list";

export interface TaskLocation {
  bucket: TaskBucket;
  weekId: string | null;
  day: number | null;
  listId: string | null;
}

export interface Task extends TaskLocation {
  id: string;
  title: string;
  status: TaskStatus;
  order: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  carriedFrom: string | null;
  tagIds: string[];
  subtaskCount: number;
  subtaskDone: number;
}

export interface NewTaskFields extends TaskLocation {
  title: string;
  order: number;
  tagIds: string[];
}

const BATCH_LIMIT = 450;

const asStringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const asNumberOrNull = (value: unknown): number | null =>
  typeof value === "number" ? value : null;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const asCount = (value: unknown): number =>
  typeof value === "number" && value > 0 ? value : 0;

const normalizeTask = (id: string, data: DocumentData): Task => ({
  id,
  title: typeof data.title === "string" ? data.title : "",
  status: data.status === "done" ? "done" : "open",
  bucket: data.bucket === "list" ? "list" : "day",
  weekId: asStringOrNull(data.weekId),
  day: asNumberOrNull(data.day),
  listId: asStringOrNull(data.listId),
  order: typeof data.order === "number" ? data.order : 0,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  completedAt: asNumberOrNull(data.completedAt),
  carriedFrom: asStringOrNull(data.carriedFrom),
  tagIds: asStringArray(data.tagIds),
  subtaskCount: asCount(data.subtaskCount),
  subtaskDone: asCount(data.subtaskDone),
});

const tasksCol = (uid: string) => collection(db, "users", uid, "tasks");

const taskRef = (uid: string, taskId: string) =>
  doc(db, "users", uid, "tasks", taskId);

export const subscribeWeekTasks = (
  uid: string,
  weekId: string,
  cb: (tasks: Task[]) => void,
): (() => void) =>
  onSnapshot(
    query(
      tasksCol(uid),
      where("bucket", "==", "day"),
      where("weekId", "==", weekId),
      orderBy("order"),
    ),
    (snap) => {
      cb(snap.docs.map((docSnap) => normalizeTask(docSnap.id, docSnap.data())));
    },
    reportReadError,
  );

export const subscribeListTasks = (
  uid: string,
  cb: (tasks: Task[]) => void,
): (() => void) =>
  onSnapshot(
    query(
      tasksCol(uid),
      where("bucket", "==", "list"),
      orderBy("listId"),
      orderBy("order"),
    ),
    (snap) => {
      cb(snap.docs.map((docSnap) => normalizeTask(docSnap.id, docSnap.data())));
    },
    reportReadError,
  );

export const subscribeWeeksTasks = (
  uid: string,
  weekIds: string[],
  cb: (tasks: Task[]) => void,
): (() => void) => {
  if (weekIds.length === 0) {
    cb([]);
    return () => {};
  }
  return onSnapshot(
    query(
      tasksCol(uid),
      where("bucket", "==", "day"),
      where("weekId", "in", weekIds),
    ),
    (snap) => {
      cb(snap.docs.map((docSnap) => normalizeTask(docSnap.id, docSnap.data())));
    },
    reportReadError,
  );
};

export const createTask = (uid: string, fields: NewTaskFields): void => {
  notePendingWrite();
  const now = Date.now();
  void addDoc(tasksCol(uid), {
    title: fields.title,
    status: "open",
    bucket: fields.bucket,
    weekId: fields.weekId,
    day: fields.day,
    listId: fields.listId,
    order: fields.order,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    carriedFrom: null,
    tagIds: fields.tagIds,
    subtaskCount: 0,
    subtaskDone: 0,
  }).catch(reportWriteError);
};

export const updateTitle = (
  uid: string,
  taskId: string,
  title: string,
): void => {
  notePendingWrite();
  void updateDoc(taskRef(uid, taskId), {
    title,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const setStatus = (
  uid: string,
  taskId: string,
  status: TaskStatus,
  completedAt: number | null,
): void => {
  notePendingWrite();
  void updateDoc(taskRef(uid, taskId), {
    status,
    completedAt,
    updatedAt: Date.now(),
    ...(status === "done" ? { carriedFrom: null } : {}),
  }).catch(reportWriteError);
};

export const moveTask = (
  uid: string,
  taskId: string,
  destination: TaskLocation & { order: number },
): void => {
  notePendingWrite();
  void updateDoc(taskRef(uid, taskId), {
    bucket: destination.bucket,
    weekId: destination.weekId,
    day: destination.day,
    listId: destination.listId,
    order: destination.order,
    carriedFrom: null,
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const deleteTask = (uid: string, taskId: string): void => {
  notePendingWrite();
  void deleteDoc(taskRef(uid, taskId)).catch(reportWriteError);
};

export const applyOrders = (
  uid: string,
  updates: { id: string; order: number }[],
): void => {
  notePendingWrite();
  const now = Date.now();
  for (let start = 0; start < updates.length; start += BATCH_LIMIT) {
    const chunk = updates.slice(start, start + BATCH_LIMIT);
    const batch = writeBatch(db);
    for (const update of chunk) {
      batch.update(taskRef(uid, update.id), {
        order: update.order,
        updatedAt: now,
      });
    }
    void batch.commit().catch(reportWriteError);
  }
};

export const addTagToTask = (
  uid: string,
  taskId: string,
  tagId: string,
): void => {
  notePendingWrite();
  void updateDoc(taskRef(uid, taskId), {
    tagIds: arrayUnion(tagId),
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};

export const removeTagFromTask = (
  uid: string,
  taskId: string,
  tagId: string,
): void => {
  notePendingWrite();
  void updateDoc(taskRef(uid, taskId), {
    tagIds: arrayRemove(tagId),
    updatedAt: Date.now(),
  }).catch(reportWriteError);
};
