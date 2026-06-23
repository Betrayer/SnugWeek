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
import { EMOJI_MAX } from "../../data/emoji.ts";
import { ORDER_SPACING } from "../ordering.ts";
import { db } from "../firebase.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";

export type ListKind = "tasks" | "ideas" | "custom";

export interface List {
  id: string;
  kind: ListKind;
  name: string | null;
  emoji: string | null;
  order: number;
  createdAt: number;
  day: number | null;
  attachmentCount: number;
}

export const isBuiltinList = (listId: string): boolean =>
  listId === "tasks" || listId === "ideas";

const normalizeKind = (value: unknown): ListKind =>
  value === "tasks" || value === "ideas" ? value : "custom";

const normalizeList = (id: string, data: DocumentData): List => ({
  id,
  kind: normalizeKind(data.kind),
  name: typeof data.name === "string" ? data.name : null,
  emoji: typeof data.emoji === "string" ? data.emoji : null,
  order: typeof data.order === "number" ? data.order : 0,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  day: typeof data.day === "number" ? data.day : null,
  attachmentCount:
    typeof data.attachmentCount === "number" && data.attachmentCount > 0
      ? data.attachmentCount
      : 0,
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
  await setDoc(ref, {
    kind,
    name: null,
    order,
    createdAt: Date.now(),
    attachmentCount: 0,
  });
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
  onSnapshot(
    query(listsCol(uid), orderBy("order")),
    (snap) => {
      cb(snap.docs.map((docSnap) => normalizeList(docSnap.id, docSnap.data())));
    },
    reportReadError,
  );

export const createList = (uid: string, name: string, order: number): void => {
  notePendingWrite();
  void addDoc(listsCol(uid), {
    kind: "custom",
    name,
    emoji: null,
    order,
    createdAt: Date.now(),
    day: null,
    attachmentCount: 0,
  }).catch(reportWriteError);
};

export const renameList = (uid: string, listId: string, name: string): void => {
  notePendingWrite();
  void updateDoc(listRef(uid, listId), { name }).catch(reportWriteError);
};

export const setListEmoji = (
  uid: string,
  listId: string,
  emoji: string | null,
): void => {
  notePendingWrite();
  void updateDoc(listRef(uid, listId), {
    emoji: emoji === null ? null : emoji.slice(0, EMOJI_MAX),
  }).catch(reportWriteError);
};

export const assignListToDay = (
  uid: string,
  listId: string,
  day: number,
): void => {
  notePendingWrite();
  void updateDoc(listRef(uid, listId), { day }).catch(reportWriteError);
};

export const unassignList = (uid: string, listId: string): void => {
  notePendingWrite();
  void updateDoc(listRef(uid, listId), { day: null }).catch(reportWriteError);
};

export const deleteListAndRehomeTasks = (
  uid: string,
  listId: string,
  rehomed: { id: string; order: number }[],
): void => {
  if (isBuiltinList(listId)) return;
  notePendingWrite();
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
