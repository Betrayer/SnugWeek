import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Task } from "../services/repos/tasksRepo.ts";

interface DraggingState {
  taskId: string;
}

interface UiState {
  sidebarOpened: boolean;
  dragging: DraggingState | null;
  moveTarget: Task | null;
  activeMobileDay: number | null;
  openTaskId: string | null;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setDragging: (dragging: DraggingState | null) => void;
  openMove: (task: Task) => void;
  closeMove: () => void;
  setActiveMobileDay: (day: number | null) => void;
  openTask: (taskId: string) => void;
  closeTask: () => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    (set, get) => ({
      sidebarOpened: false,
      dragging: null,
      moveTarget: null,
      activeMobileDay: null,
      openTaskId: null,
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
    }),
    { name: "uiStore" },
  ),
);
