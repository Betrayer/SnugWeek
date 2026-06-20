import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase.ts";
import { isoDateKeyOf } from "../time.ts";

export const EXPORT_SCHEMA = "snugweek-export@1";

export interface ExportEntity {
  id: string;
  data: DocumentData;
}

export interface TaskSubtasks {
  taskId: string;
  items: ExportEntity[];
}

export interface ExportPayload {
  profile: DocumentData | null;
  tasks: ExportEntity[];
  subtasks: TaskSubtasks[];
  lists: ExportEntity[];
  weeks: ExportEntity[];
  trackers: ExportEntity[];
  habits: ExportEntity[];
  tags: ExportEntity[];
  routines: ExportEntity[];
  stats: ExportEntity[];
  attachments: ExportEntity[];
}

export interface ExportEnvelope {
  schema: string;
  app: "snugweek";
  exportedAt: number;
  uid: string;
  data: ExportPayload;
}

const userCol = (uid: string, name: string) =>
  collection(db, "users", uid, name);

const readCol = async (uid: string, name: string): Promise<ExportEntity[]> => {
  const snap = await getDocs(userCol(uid, name));
  return snap.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }));
};

export const buildExport = async (uid: string): Promise<ExportEnvelope> => {
  const [
    profileSnap,
    tasks,
    lists,
    weeks,
    trackers,
    habits,
    tags,
    routines,
    stats,
    attachments,
  ] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    readCol(uid, "tasks"),
    readCol(uid, "lists"),
    readCol(uid, "weeks"),
    readCol(uid, "trackers"),
    readCol(uid, "habits"),
    readCol(uid, "tags"),
    readCol(uid, "routines"),
    readCol(uid, "stats"),
    readCol(uid, "attachments"),
  ]);

  const subtasks = await Promise.all(
    tasks.map(async (task) => {
      const items = await getDocs(
        collection(db, "users", uid, "tasks", task.id, "items"),
      );
      return {
        taskId: task.id,
        items: items.docs.map((docSnap) => ({
          id: docSnap.id,
          data: docSnap.data(),
        })),
      };
    }),
  );

  return {
    schema: EXPORT_SCHEMA,
    app: "snugweek",
    exportedAt: Date.now(),
    uid,
    data: {
      profile: profileSnap.exists() ? profileSnap.data() : null,
      tasks,
      subtasks: subtasks.filter((entry) => entry.items.length > 0),
      lists,
      weeks,
      trackers,
      habits,
      tags,
      routines,
      stats,
      attachments,
    },
  };
};

export const downloadExport = (envelope: ExportEnvelope): void => {
  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `snugweek-${isoDateKeyOf(envelope.exportedAt)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
