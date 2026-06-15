import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { notifyInfo } from "../services/notify.ts";
import { ORDER_SPACING, orderForBottom } from "../services/ordering.ts";
import {
  applyTagOrders,
  createTag,
  deleteTag,
  subscribeTags,
  updateTag,
} from "../services/repos/tagsRepo.ts";
import type { Tag } from "../services/repos/tagsRepo.ts";
import {
  addTagToTask,
  removeTagFromTask,
} from "../services/repos/tasksRepo.ts";
import { useUiStore } from "./uiStore.ts";

interface TagsState {
  tags: Tag[];
  start: (uid: string) => void;
  stop: () => void;
  add: (name: string, color: string) => void;
  update: (id: string, fields: { name: string; color: string }) => void;
  reorder: (orderedIds: string[]) => void;
  remove: (id: string) => void;
  assignTag: (taskId: string, tagId: string) => void;
  unassignTag: (taskId: string, tagId: string) => void;
}

let unsubscribe: (() => void) | null = null;
let activeUid: string | null = null;

export const useTagsStore = create<TagsState>()(
  devtools(
    (set, get) => ({
      tags: [],
      start: (uid) => {
        if (activeUid === uid && unsubscribe) return;
        if (unsubscribe) unsubscribe();
        activeUid = uid;
        set({ tags: [] });
        unsubscribe = subscribeTags(uid, (tags) => {
          set({ tags });
        });
      },
      stop: () => {
        if (unsubscribe) unsubscribe();
        unsubscribe = null;
        activeUid = null;
        set({ tags: [] });
      },
      add: (name, color) => {
        const trimmed = name.trim();
        if (!activeUid || trimmed.length === 0) return;
        createTag(activeUid, {
          name: trimmed,
          color,
          order: orderForBottom(get().tags),
        });
      },
      update: (id, fields) => {
        const name = fields.name.trim();
        if (!activeUid || name.length === 0) return;
        updateTag(activeUid, id, { name, color: fields.color });
      },
      reorder: (orderedIds) => {
        if (!activeUid) return;
        applyTagOrders(
          activeUid,
          orderedIds.map((id, index) => ({ id, order: index * ORDER_SPACING })),
        );
      },
      remove: (id) => {
        if (!activeUid) return;
        deleteTag(activeUid, id);
        useUiStore.getState().removeFromTagFilter(id);
        notifyInfo("tags:deletedToast");
      },
      assignTag: (taskId, tagId) => {
        if (!activeUid) return;
        addTagToTask(activeUid, taskId, tagId);
      },
      unassignTag: (taskId, tagId) => {
        if (!activeUid) return;
        removeTagFromTask(activeUid, taskId, tagId);
      },
    }),
    { name: "tagsStore" },
  ),
);
