import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Task } from "../services/repos/tasksRepo.ts";

interface DraggingState {
  taskId: string;
}

interface PendingOpenTask {
  taskId: string;
  weekId: string;
}

interface UiState {
  sidebarOpened: boolean;
  dragging: DraggingState | null;
  moveTarget: Task | null;
  activeMobileDay: number | null;
  openTaskId: string | null;
  pendingOpenTask: PendingOpenTask | null;
  pendingQuickAdd: boolean;
  tagFilter: string[];
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setDragging: (dragging: DraggingState | null) => void;
  openMove: (task: Task) => void;
  closeMove: () => void;
  setActiveMobileDay: (day: number | null) => void;
  openTask: (taskId: string) => void;
  closeTask: () => void;
  requestOpenTask: (taskId: string, weekId: string) => void;
  clearPendingOpenTask: () => void;
  requestQuickAdd: () => void;
  consumeQuickAdd: () => void;
  toggleTagFilter: (tagId: string) => void;
  clearTagFilter: () => void;
  removeFromTagFilter: (tagId: string) => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    (set, get) => ({
      sidebarOpened: false,
      dragging: null,
      moveTarget: null,
      activeMobileDay: null,
      openTaskId: null,
      pendingOpenTask: null,
      pendingQuickAdd: false,
      tagFilter: [],
      openSidebar: () => set({ sidebarOpened: true }),
      closeSidebar: () => set({ sidebarOpened: false }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpened: !state.sidebarOpened })),
      setDragging: (dragging) =>
        set(dragging ? { dragging, openTaskId: null } : { dragging }),
      openMove: (task) => set({ moveTarget: task }),
      closeMove: () => set({ moveTarget: null }),
      setActiveMobileDay: (activeMobileDay) => set({ activeMobileDay }),
      openTask: (taskId) => {
        if (get().dragging) return;
        set({ openTaskId: taskId });
      },
      closeTask: () => set({ openTaskId: null }),
      requestOpenTask: (taskId, weekId) =>
        set({ pendingOpenTask: { taskId, weekId } }),
      clearPendingOpenTask: () => set({ pendingOpenTask: null }),
      requestQuickAdd: () => set({ pendingQuickAdd: true }),
      consumeQuickAdd: () => set({ pendingQuickAdd: false }),
      toggleTagFilter: (tagId) =>
        set((state) => ({
          tagFilter: state.tagFilter.includes(tagId)
            ? state.tagFilter.filter((id) => id !== tagId)
            : [...state.tagFilter, tagId],
        })),
      removeFromTagFilter: (tagId) =>
        set((state) => ({
          tagFilter: state.tagFilter.filter((id) => id !== tagId),
        })),
      clearTagFilter: () => set({ tagFilter: [] }),
    }),
    { name: "uiStore" },
  ),
);
