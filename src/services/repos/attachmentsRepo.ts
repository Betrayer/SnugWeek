import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData, Query } from "firebase/firestore";
import { db } from "../firebase.ts";
import { deleteObject } from "../storage/storageService.ts";
import { notePendingWrite } from "../syncSignal.ts";
import { reportReadError } from "./readError.ts";
import { reportWriteError } from "./writeError.ts";

export type AttachmentTargetType = "task" | "list" | "day";
export type AttachmentKind = "image" | "audio" | "video" | "file" | "link";

export interface Attachment {
  id: string;
  targetType: AttachmentTargetType;
  taskId: string | null;
  listId: string | null;
  weekId: string | null;
  day: number | null;
  kind: AttachmentKind;
  order: number;
  createdAt: number;
  storagePath: string | null;
  url: string | null;
  name: string | null;
  mime: string | null;
  size: number | null;
  thumbPath: string | null;
  thumbUrl: string | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  href: string | null;
  title: string | null;
  previewImage: string | null;
  cropX: number | null;
  cropY: number | null;
  cropZoom: number | null;
}

export interface NewAttachment {
  id: string;
  targetType: AttachmentTargetType;
  taskId: string | null;
  listId: string | null;
  weekId: string | null;
  day: number | null;
  kind: AttachmentKind;
  order: number;
  storagePath?: string | null;
  url?: string | null;
  name?: string | null;
  mime?: string | null;
  size?: number | null;
  thumbPath?: string | null;
  thumbUrl?: string | null;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  href?: string | null;
  title?: string | null;
  previewImage?: string | null;
  cropX?: number | null;
  cropY?: number | null;
  cropZoom?: number | null;
}

const asStringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const asNumberOrNull = (value: unknown): number | null =>
  typeof value === "number" ? value : null;

const asTargetType = (value: unknown): AttachmentTargetType =>
  value === "list" || value === "day" ? value : "task";

const asKind = (value: unknown): AttachmentKind =>
  value === "audio" ||
  value === "video" ||
  value === "file" ||
  value === "link"
    ? value
    : "image";

const normalizeAttachment = (id: string, data: DocumentData): Attachment => ({
  id,
  targetType: asTargetType(data.targetType),
  taskId: asStringOrNull(data.taskId),
  listId: asStringOrNull(data.listId),
  weekId: asStringOrNull(data.weekId),
  day: asNumberOrNull(data.day),
  kind: asKind(data.kind),
  order: typeof data.order === "number" ? data.order : 0,
  createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  storagePath: asStringOrNull(data.storagePath),
  url: asStringOrNull(data.url),
  name: asStringOrNull(data.name),
  mime: asStringOrNull(data.mime),
  size: asNumberOrNull(data.size),
  thumbPath: asStringOrNull(data.thumbPath),
  thumbUrl: asStringOrNull(data.thumbUrl),
  width: asNumberOrNull(data.width),
  height: asNumberOrNull(data.height),
  durationMs: asNumberOrNull(data.durationMs),
  href: asStringOrNull(data.href),
  title: asStringOrNull(data.title),
  previewImage: asStringOrNull(data.previewImage),
  cropX: asNumberOrNull(data.cropX),
  cropY: asNumberOrNull(data.cropY),
  cropZoom: asNumberOrNull(data.cropZoom),
});

const byOrder = (a: Attachment, b: Attachment): number => {
  if (a.order !== b.order) return a.order - b.order;
  if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};

const attachmentsCol = (uid: string) =>
  collection(db, "users", uid, "attachments");

const attachmentRef = (uid: string, attachmentId: string) =>
  doc(db, "users", uid, "attachments", attachmentId);

const taskRef = (uid: string, taskId: string) =>
  doc(db, "users", uid, "tasks", taskId);

const listRef = (uid: string, listId: string) =>
  doc(db, "users", uid, "lists", listId);

export const newAttachmentId = (uid: string): string =>
  doc(attachmentsCol(uid)).id;

const subscribeQuery = (
  q: Query,
  cb: (items: Attachment[]) => void,
): (() => void) =>
  onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs
          .map((docSnap) => normalizeAttachment(docSnap.id, docSnap.data()))
          .sort(byOrder),
      );
    },
    reportReadError,
  );

export const subscribeTaskAttachments = (
  uid: string,
  taskId: string,
  cb: (items: Attachment[]) => void,
): (() => void) =>
  subscribeQuery(query(attachmentsCol(uid), where("taskId", "==", taskId)), cb);

export const subscribeListAttachments = (
  uid: string,
  listId: string,
  cb: (items: Attachment[]) => void,
): (() => void) =>
  subscribeQuery(query(attachmentsCol(uid), where("listId", "==", listId)), cb);

export const subscribeWeekDayAttachments = (
  uid: string,
  weekId: string,
  cb: (items: Attachment[]) => void,
): (() => void) =>
  subscribeQuery(query(attachmentsCol(uid), where("weekId", "==", weekId)), cb);

export const addAttachment = (uid: string, attachment: NewAttachment): void => {
  notePendingWrite();
  const now = Date.now();
  const batch = writeBatch(db);
  batch.set(attachmentRef(uid, attachment.id), {
    targetType: attachment.targetType,
    taskId: attachment.taskId,
    listId: attachment.listId,
    weekId: attachment.weekId,
    day: attachment.day,
    kind: attachment.kind,
    order: attachment.order,
    createdAt: now,
    storagePath: attachment.storagePath ?? null,
    url: attachment.url ?? null,
    name: attachment.name ?? null,
    mime: attachment.mime ?? null,
    size: attachment.size ?? null,
    thumbPath: attachment.thumbPath ?? null,
    thumbUrl: attachment.thumbUrl ?? null,
    width: attachment.width ?? null,
    height: attachment.height ?? null,
    durationMs: attachment.durationMs ?? null,
    href: attachment.href ?? null,
    title: attachment.title ?? null,
    previewImage: attachment.previewImage ?? null,
    cropX: attachment.cropX ?? null,
    cropY: attachment.cropY ?? null,
    cropZoom: attachment.cropZoom ?? null,
  });
  if (attachment.targetType === "task" && attachment.taskId) {
    batch.update(taskRef(uid, attachment.taskId), {
      attachmentCount: increment(1),
      updatedAt: now,
    });
  } else if (attachment.targetType === "list" && attachment.listId) {
    batch.update(listRef(uid, attachment.listId), {
      attachmentCount: increment(1),
    });
  }
  void batch.commit().catch(reportWriteError);
};

export const updateAttachmentCrop = (
  uid: string,
  attachmentId: string,
  crop: { cropX: number; cropY: number; cropZoom: number },
): void => {
  notePendingWrite();
  void updateDoc(attachmentRef(uid, attachmentId), {
    cropX: crop.cropX,
    cropY: crop.cropY,
    cropZoom: crop.cropZoom,
  }).catch(reportWriteError);
};

const deleteStorageObjects = (...paths: (string | null)[]): void => {
  for (const path of paths) {
    if (path) void deleteObject(path).catch(() => {});
  }
};

export const removeAttachment = (
  uid: string,
  attachment: Attachment,
): void => {
  notePendingWrite();
  const now = Date.now();
  const batch = writeBatch(db);
  batch.delete(attachmentRef(uid, attachment.id));
  if (attachment.targetType === "task" && attachment.taskId) {
    batch.update(taskRef(uid, attachment.taskId), {
      attachmentCount: increment(-1),
      updatedAt: now,
    });
  } else if (attachment.targetType === "list" && attachment.listId) {
    batch.update(listRef(uid, attachment.listId), {
      attachmentCount: increment(-1),
    });
  }
  void batch.commit().catch(reportWriteError);
  deleteStorageObjects(attachment.storagePath, attachment.thumbPath);
};

const purge = (q: Query): void => {
  void getDocs(q)
    .then((snap) => {
      if (snap.empty) return undefined;
      const batch = writeBatch(db);
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        deleteStorageObjects(
          asStringOrNull(data.storagePath),
          asStringOrNull(data.thumbPath),
        );
        batch.delete(docSnap.ref);
      }
      return batch.commit();
    })
    .catch(() => {});
};

export const purgeTaskAttachments = (uid: string, taskId: string): void => {
  purge(query(attachmentsCol(uid), where("taskId", "==", taskId)));
};

export const purgeListAttachments = (uid: string, listId: string): void => {
  purge(query(attachmentsCol(uid), where("listId", "==", listId)));
};
