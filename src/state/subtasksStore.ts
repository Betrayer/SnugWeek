import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ORDER_SPACING, orderForBottom } from "../services/ordering.ts";
import {
  createSubtask,
  deleteSubtask,
  renameSubtask,
  reorderSubtasks,
  subscribeSubtasks,
  toggleSubtask,
} from "../services/repos/subtasksRepo.ts";
import type { Subtask } from "../services/repos/subtasksRepo.ts";
import { playCheck, playPop } from "../services/sound/soundService.ts";

export const MAX_SUBTASKS = 100;
export const MAX_SUBTASK_TITLE = 200;

interface SubtasksState {
  itemsByTask: Record<string, Subtask[]>;
  retain: (uid: string, taskId: string) => void;
  release: (taskId: string) => void;
  stop: () => void;
  add: (taskId: string, title: string) => void;
  rename: (taskId: string, itemId: string, title: string) => void;
  toggle: (taskId: string, itemId: string) => void;
  remove: (taskId: string, itemId: string) => void;
  reorder: (taskId: string, orderedIds: string[]) => void;
}

let subs: Record<string, () => void> = {};
let counts: Record<string, number> = {};
let activeUid: string | null = null;

const teardownAll = (): void => {
  for (const unsub of Object.values(subs)) unsub();
  subs = {};
  counts = {};
};

export const useSubtasksStore = create<SubtasksState>()(
  devtools(
    (set, get) => ({
      itemsByTask: {},
      retain: (uid, taskId) => {
        if (activeUid !== uid) {
          teardownAll();
          activeUid = uid;
          set({ itemsByTask: {} });
        }
        counts[taskId] = (counts[taskId] ?? 0) + 1;
        if (counts[taskId] === 1) {
          subs[taskId] = subscribeSubtasks(uid, taskId, (items) => {
            set((state) => ({
              itemsByTask: { ...state.itemsByTask, [taskId]: items },
            }));
          });
        }
      },
      release: (taskId) => {
        const next = (counts[taskId] ?? 0) - 1;
        if (next > 0) {
          counts[taskId] = next;
          return;
        }
        delete counts[taskId];
        const unsub = subs[taskId];
        if (unsub) unsub();
        delete subs[taskId];
        set((state) => {
          const rest = { ...state.itemsByTask };
          delete rest[taskId];
          return { itemsByTask: rest };
        });
      },
      stop: () => {
        teardownAll();
        activeUid = null;
        set({ itemsByTask: {} });
      },
      add: (taskId, title) => {
        const trimmed = title.trim();
        if (!activeUid || trimmed.length === 0) return;
        const items = get().itemsByTask[taskId] ?? [];
        if (items.length >= MAX_SUBTASKS) return;
        createSubtask(activeUid, taskId, {
          title: trimmed.slice(0, MAX_SUBTASK_TITLE),
          order: orderForBottom(items),
        });
        playPop();
      },
      rename: (taskId, itemId, title) => {
        const trimmed = title.trim();
        if (!activeUid || trimmed.length === 0) return;
        renameSubtask(
          activeUid,
          taskId,
          itemId,
          trimmed.slice(0, MAX_SUBTASK_TITLE),
        );
      },
      toggle: (taskId, itemId) => {
        if (!activeUid) return;
        const item = (get().itemsByTask[taskId] ?? []).find(
          (entry) => entry.id === itemId,
        );
        if (!item) return;
        toggleSubtask(activeUid, taskId, itemId, !item.done);
        if (!item.done) playCheck();
      },
      remove: (taskId, itemId) => {
        if (!activeUid) return;
        const item = (get().itemsByTask[taskId] ?? []).find(
          (entry) => entry.id === itemId,
        );
        if (!item) return;
        deleteSubtask(activeUid, taskId, itemId, item.done);
      },
      reorder: (taskId, orderedIds) => {
        if (!activeUid) return;
        reorderSubtasks(
          activeUid,
          taskId,
          orderedIds.map((id, index) => ({ id, order: index * ORDER_SPACING })),
        );
      },
    }),
    { name: "subtasksStore" },
  ),
);
