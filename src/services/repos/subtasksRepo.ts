import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  order: number;
  createdAt: number;
}

const normalizeSubtask = (id: string, data: DocumentData): Subtask => ({
  id,
  title: typeof data.title === "string" ? data.title : "",
  done: data.done === true,
  order: typeof data.order === "number" ? data.order : 0,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
});

const itemsCol = (uid: string, taskId: string) =>
  collection(db, "users", uid, "tasks", taskId, "items");

const itemRef = (uid: string, taskId: string, itemId: string) =>
  doc(db, "users", uid, "tasks", taskId, "items", itemId);

const taskRef = (uid: string, taskId: string) =>
  doc(db, "users", uid, "tasks", taskId);

export const subscribeSubtasks = (
  uid: string,
  taskId: string,
  cb: (items: Subtask[]) => void,
): (() => void) =>
  onSnapshot(
    query(itemsCol(uid, taskId), orderBy("order")),
    (snap) => {
      cb(
        snap.docs.map((docSnap) =>
          normalizeSubtask(docSnap.id, docSnap.data()),
        ),
      );
    },
    reportReadError,
  );

export const createSubtask = (
  uid: string,
  taskId: string,
  fields: { title: string; order: number },
): void => {
  notePendingWrite();
  const now = Date.now();
  const ref = doc(itemsCol(uid, taskId));
  const batch = writeBatch(db);
  batch.set(ref, {
    title: fields.title,
    done: false,
    order: fields.order,
    createdAt: now,
  });
  batch.update(taskRef(uid, taskId), {
    subtaskCount: increment(1),
    updatedAt: now,
  });
  void batch.commit().catch(reportWriteError);
};

export const renameSubtask = (
  uid: string,
  taskId: string,
  itemId: string,
  title: string,
): void => {
  notePendingWrite();
  void updateDoc(itemRef(uid, taskId, itemId), { title }).catch(
    reportWriteError,
  );
};

export const toggleSubtask = (
  uid: string,
  taskId: string,
  itemId: string,
  done: boolean,
): void => {
  notePendingWrite();
  const batch = writeBatch(db);
  batch.update(itemRef(uid, taskId, itemId), { done });
  batch.update(taskRef(uid, taskId), {
    subtaskDone: increment(done ? 1 : -1),
    updatedAt: Date.now(),
  });
  void batch.commit().catch(reportWriteError);
};

export const deleteSubtask = (
  uid: string,
  taskId: string,
  itemId: string,
  wasDone: boolean,
): void => {
  notePendingWrite();
  const batch = writeBatch(db);
  batch.delete(itemRef(uid, taskId, itemId));
  batch.update(taskRef(uid, taskId), {
    subtaskCount: increment(-1),
    ...(wasDone ? { subtaskDone: increment(-1) } : {}),
    updatedAt: Date.now(),
  });
  void batch.commit().catch(reportWriteError);
};

export const reorderSubtasks = (
  uid: string,
  taskId: string,
  updates: { id: string; order: number }[],
): void => {
  if (updates.length === 0) return;
  notePendingWrite();
  const batch = writeBatch(db);
  for (const update of updates) {
    batch.update(itemRef(uid, taskId, update.id), { order: update.order });
  }
  void batch.commit().catch(reportWriteError);
};
