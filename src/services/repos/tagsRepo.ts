import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDocs,
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

export interface Tag {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt: number;
}

const BATCH_LIMIT = 450;

const normalizeTag = (id: string, data: DocumentData): Tag => ({
  id,
  name: typeof data.name === "string" ? data.name : "",
  color: typeof data.color === "string" ? data.color : "rose",
  order: typeof data.order === "number" ? data.order : 0,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
});

const tagsCol = (uid: string) => collection(db, "users", uid, "tags");

const tagRef = (uid: string, tagId: string) =>
  doc(db, "users", uid, "tags", tagId);

export const subscribeTags = (
  uid: string,
  cb: (tags: Tag[]) => void,
): (() => void) =>
  onSnapshot(
    query(tagsCol(uid), orderBy("order")),
    (snap) => {
      cb(snap.docs.map((docSnap) => normalizeTag(docSnap.id, docSnap.data())));
    },
    reportReadError,
  );

export const createTag = (
  uid: string,
  fields: { name: string; color: string; order: number },
): void => {
  notePendingWrite();
  void addDoc(tagsCol(uid), {
    name: fields.name,
    color: fields.color,
    order: fields.order,
    createdAt: Date.now(),
  }).catch(reportWriteError);
};

export const updateTag = (
  uid: string,
  tagId: string,
  fields: { name: string; color: string },
): void => {
  notePendingWrite();
  void updateDoc(tagRef(uid, tagId), {
    name: fields.name,
    color: fields.color,
  }).catch(reportWriteError);
};

export const applyTagOrders = (
  uid: string,
  updates: { id: string; order: number }[],
): void => {
  if (updates.length === 0) return;
  notePendingWrite();
  const batch = writeBatch(db);
  for (const update of updates) {
    batch.update(tagRef(uid, update.id), { order: update.order });
  }
  void batch.commit().catch(reportWriteError);
};

const stripTagFromTasks = async (uid: string, tagId: string): Promise<void> => {
  const tasksCol = collection(db, "users", uid, "tasks");
  const snap = await getDocs(
    query(tasksCol, where("tagIds", "array-contains", tagId)),
  );
  const now = Date.now();
  for (let start = 0; start < snap.docs.length; start += BATCH_LIMIT) {
    const chunk = snap.docs.slice(start, start + BATCH_LIMIT);
    const batch = writeBatch(db);
    for (const docSnap of chunk) {
      batch.update(docSnap.ref, {
        tagIds: arrayRemove(tagId),
        updatedAt: now,
      });
    }
    await batch.commit();
  }
  await deleteDoc(tagRef(uid, tagId));
};

export const deleteTag = (uid: string, tagId: string): void => {
  notePendingWrite();
  void stripTagFromTasks(uid, tagId).catch(reportWriteError);
};
