import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { orderForBottom } from "../services/ordering.ts";
import {
  addAttachment,
  removeAttachment,
  subscribeListAttachments,
  subscribeTaskAttachments,
  subscribeWeekDayAttachments,
} from "../services/repos/attachmentsRepo.ts";
import type {
  Attachment,
  AttachmentKind,
} from "../services/repos/attachmentsRepo.ts";
import { playPop, playSwoosh } from "../services/sound/soundService.ts";
import { useWeekStore } from "./weekStore.ts";

export const MAX_ATTACHMENTS = 50;

export type RetainTarget =
  | { type: "task"; taskId: string }
  | { type: "list"; listId: string }
  | { type: "week"; weekId: string };

export type AddTarget =
  | { type: "task"; taskId: string }
  | { type: "list"; listId: string }
  | { type: "day"; weekId: string; day: number };

export interface AttachmentDraft {
  id: string;
  kind: AttachmentKind;
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
}

interface AttachmentsState {
  byKey: Record<string, Attachment[]>;
  retain: (uid: string, target: RetainTarget) => void;
  release: (target: RetainTarget) => void;
  stop: () => void;
  add: (target: AddTarget, draft: AttachmentDraft) => boolean;
  remove: (attachment: Attachment) => void;
}

export const retainTargetKey = (target: RetainTarget): string =>
  target.type === "task"
    ? `task:${target.taskId}`
    : target.type === "list"
      ? `list:${target.listId}`
      : `week:${target.weekId}`;

const keyOfRetain = retainTargetKey;

const subscribeFor = (
  uid: string,
  target: RetainTarget,
  cb: (items: Attachment[]) => void,
): (() => void) =>
  target.type === "task"
    ? subscribeTaskAttachments(uid, target.taskId, cb)
    : target.type === "list"
      ? subscribeListAttachments(uid, target.listId, cb)
      : subscribeWeekDayAttachments(uid, target.weekId, cb);

let subs: Record<string, () => void> = {};
let counts: Record<string, number> = {};
let activeUid: string | null = null;

const teardownAll = (): void => {
  for (const unsub of Object.values(subs)) unsub();
  subs = {};
  counts = {};
};

export const useAttachmentsStore = create<AttachmentsState>()(
  devtools(
    (set, get) => ({
      byKey: {},
      retain: (uid, target) => {
        if (activeUid !== uid) {
          teardownAll();
          activeUid = uid;
          set({ byKey: {} });
        }
        const key = keyOfRetain(target);
        counts[key] = (counts[key] ?? 0) + 1;
        if (counts[key] === 1) {
          subs[key] = subscribeFor(uid, target, (items) => {
            set((state) => ({ byKey: { ...state.byKey, [key]: items } }));
          });
        }
      },
      release: (target) => {
        const key = keyOfRetain(target);
        const next = (counts[key] ?? 0) - 1;
        if (next > 0) {
          counts[key] = next;
          return;
        }
        delete counts[key];
        const unsub = subs[key];
        if (unsub) unsub();
        delete subs[key];
        set((state) => {
          const rest = { ...state.byKey };
          delete rest[key];
          return { byKey: rest };
        });
      },
      stop: () => {
        teardownAll();
        activeUid = null;
        set({ byKey: {} });
      },
      add: (target, draft) => {
        if (!activeUid) return false;
        const existing =
          target.type === "task"
            ? (get().byKey[`task:${target.taskId}`] ?? [])
            : target.type === "list"
              ? (get().byKey[`list:${target.listId}`] ?? [])
              : (get().byKey[`week:${target.weekId}`] ?? []).filter(
                  (item) => item.day === target.day,
                );
        if (existing.length >= MAX_ATTACHMENTS) return false;
        const order = orderForBottom(existing);
        addAttachment(activeUid, {
          id: draft.id,
          targetType: target.type === "day" ? "day" : target.type,
          taskId: target.type === "task" ? target.taskId : null,
          listId: target.type === "list" ? target.listId : null,
          weekId: target.type === "day" ? target.weekId : null,
          day: target.type === "day" ? target.day : null,
          kind: draft.kind,
          order,
          storagePath: draft.storagePath ?? null,
          url: draft.url ?? null,
          name: draft.name ?? null,
          mime: draft.mime ?? null,
          size: draft.size ?? null,
          thumbPath: draft.thumbPath ?? null,
          thumbUrl: draft.thumbUrl ?? null,
          width: draft.width ?? null,
          height: draft.height ?? null,
          durationMs: draft.durationMs ?? null,
          href: draft.href ?? null,
          title: draft.title ?? null,
          previewImage: draft.previewImage ?? null,
        });
        playPop();
        return true;
      },
      remove: (attachment) => {
        if (!activeUid) return;
        removeAttachment(activeUid, attachment);
        if (attachment.kind === "image") {
          useWeekStore.getState().removePhotoDecorations(attachment.id);
        }
        playSwoosh();
      },
    }),
    { name: "attachmentsStore" },
  ),
);
