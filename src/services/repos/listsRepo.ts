import {
  addDoc,
  collection,
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
import { reportWriteError } from "./writeError.ts";

export type ListKind = "tasks" | "ideas" | "custom";

export interface List {
  id: string;
  kind: ListKind;
  name: string | null;
  order: number;
  createdAt: number;
}

export const isBuiltinList = (listId: string): boolean =>
  listId === "tasks" || listId === "ideas";

const normalizeKind = (value: unknown): ListKind =>
  value === "tasks" || value === "ideas" ? value : "custom";

const normalizeList = (id: string, data: DocumentData): List => ({
  id,
  kind: normalizeKind(data.kind),
  name: typeof data.name === "string" ? data.name : null,
  order: typeof data.order === "number" ? data.order : 0,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
});

const listsCol = (uid: string) => collection(db, "users", uid, "lists");

const listRef = (uid: string, listId: string) =>
  doc(db, "users", uid, "lists", listId);

const taskRef = (uid: string, taskId: string) =>
  doc(db, "users", uid, "tasks", taskId);

const ensureBuiltin = async (
  uid: string,
  listId: string,
  kind: ListKind,
  order: number,
): Promise<void> => {
  const ref = listRef(uid, listId);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, { kind, name: null, order, createdAt: Date.now() });
};

export const ensureBuiltinLists = async (uid: string): Promise<void> => {
  await Promise.all([
    ensureBuiltin(uid, "tasks", "tasks", 0),
    ensureBuiltin(uid, "ideas", "ideas", ORDER_SPACING),
  ]);
};

export const subscribeLists = (
  uid: string,
  cb: (lists: List[]) => void,
): (() => void) =>
  onSnapshot(query(listsCol(uid), orderBy("order")), (snap) => {
    cb(snap.docs.map((docSnap) => normalizeList(docSnap.id, docSnap.data())));
  });

export const createList = (uid: string, name: string, order: number): void => {
  void addDoc(listsCol(uid), {
    kind: "custom",
    name,
    order,
    createdAt: Date.now(),
  }).catch(reportWriteError);
};

export const renameList = (uid: string, listId: string, name: string): void => {
  void updateDoc(listRef(uid, listId), { name }).catch(reportWriteError);
};

export const deleteListAndRehomeTasks = (
  uid: string,
  listId: string,
  rehomed: { id: string; order: number }[],
): void => {
  if (isBuiltinList(listId)) return;
  const now = Date.now();
  const batch = writeBatch(db);
  for (const task of rehomed) {
    batch.update(taskRef(uid, task.id), {
      listId: "tasks",
      order: task.order,
      updatedAt: now,
    });
  }
  batch.delete(listRef(uid, listId));
  void batch.commit().catch(reportWriteError);
};
